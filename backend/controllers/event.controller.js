/**
 * ============================================================
 * EVENT CONTROLLER
 * ============================================================
 * Final Graduation Project Refactor
 * Purpose: Manages all event-related logic, including lifecycle 
 * management (Upcoming -> Active -> Completed -> Archived) 
 * and automated financial synchronization.
 * ============================================================
 */

const db = require('../config/db');
const { logAction } = require('../utils/logger');

/**
 * UTILITY: Sync Event Finances
 * ---------------------------
 * Automatically synchronizes an event's revenue and expenses 
 * to the financial tables based on the event's notes and metadata.
 * 
 * @param {number} eventId - The unique ID of the event
 * @param {object} eventData - Full event object containing financials
 */
const syncEventFinance = (eventId, eventData) => {
  const { event_name, date, profit, notes } = eventData;
  let parsedNotes = { days: [] };
  if (notes && notes.startsWith('{')) {
    try { parsedNotes = JSON.parse(notes); } catch(e){}
  }
  
  // 1. Clear old auto-generated finances for this event to avoid duplication
  db.prepare("DELETE FROM income WHERE event_id = ?").run(eventId);
  db.prepare("DELETE FROM expenses WHERE event_id = ? AND category = 'event_auto'").run(eventId);

  // 2. Insert Income (Gross Revenue)
  let totalRevenue = 0;
  if (parsedNotes.days && parsedNotes.days.length > 0) {
    parsedNotes.days.forEach(d => {
       totalRevenue += parseFloat(d.revenue) || 0;
       
       // Insert expenses per day (if defined in the smart notes)
       if (d.expenses) {
          d.expenses.forEach(exp => {
             db.prepare(`
               INSERT INTO expenses (amount, paid_by, category, description, day_type, event_id, event_name, date, status, created_at)
               VALUES (?, 'company', 'event_auto', ?, 'work_day', ?, ?, ?, 'paid', datetime('now', 'localtime'))
             `).run(parseFloat(exp.amount) || 0, exp.desc || 'Event Expense', eventId, event_name, d.date || date);
          });
       }
    });
  } else {
    // Fallback logic for basic events
    totalRevenue = (parseFloat(profit) || 0) + (parseFloat(eventData.food_cost)||0) + (parseFloat(eventData.gas_cost)||0) + (parseFloat(eventData.event_manager_pay)||0);
    if (eventData.event_manager_pay > 0) db.prepare("INSERT INTO expenses (amount, paid_by, category, description, day_type, event_id, event_name, date, status) VALUES (?, 'company', 'event_auto', 'Space/Manager Rent', 'work_day', ?, ?, ?, 'paid')").run(eventData.event_manager_pay, eventId, event_name, date);
    if (eventData.gas_cost > 0) db.prepare("INSERT INTO expenses (amount, paid_by, category, description, day_type, event_id, event_name, date, status) VALUES (?, 'company', 'event_auto', 'Gas/Transport', 'work_day', ?, ?, ?, 'paid')").run(eventData.gas_cost, eventId, event_name, date);
    if (eventData.food_cost > 0) db.prepare("INSERT INTO expenses (amount, paid_by, category, description, day_type, event_id, event_name, date, status) VALUES (?, 'company', 'event_auto', 'Food', 'work_day', ?, ?, ?, 'paid')").run(eventData.food_cost, eventId, event_name, date);
  }

  // Record final revenue entry
  if (totalRevenue > 0) {
    db.prepare(`
      INSERT INTO income (event_id, amount, date, notes, source, original_profit, final_profit, admin_name, time)
      VALUES (?, ?, ?, ?, 'Event Profit', ?, ?, ?, ?)
    `).run(
      eventId, totalRevenue, date, `Revenue from ${event_name}`, 
      totalRevenue, parseFloat(profit) || 0, eventData.admin_name || 'System', 
      new Date().toLocaleTimeString('en-GB', { hour12: false }).slice(0, 5)
    );
  }
};

/**
 * GET ALL EVENTS
 * --------------
 * Fetches all active events (non-archived) sorted by date.
 */
exports.getEvents = (req, res) => {
  try {
    const events = db.prepare("SELECT * FROM events WHERE status != 'archived' ORDER BY date DESC").all();
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch events', details: err.message });
  }
};

/**
 * GET SINGLE EVENT
 * ----------------
 * Fetches detailed information for a specific event, including linked 
 * expenses, income, and debt records.
 */
exports.getEvent = (req, res) => {
  try {
    const event = db.prepare("SELECT * FROM events WHERE id = ?").get(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    // Aggregating related data
    const expenses = db.prepare("SELECT * FROM expenses WHERE event_id = ? AND status != 'archived'").all(req.params.id);
    const income = db.prepare("SELECT * FROM income WHERE event_id = ?").all(req.params.id);
    const debts = db.prepare("SELECT * FROM debts WHERE related_event_id = ?").all(req.params.id);

    res.json({
      ...event,
      expenses,
      income,
      debts,
      total_expenses: expenses.reduce((s, e) => s + e.amount, 0),
      net_profit: event.total_income - expenses.reduce((s, e) => s + e.amount, 0)
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch event details', details: err.message });
  }
};

/**
 * CREATE NEW EVENT
 * ----------------
 * Initializes a new event, creates/updates partner client records, 
 * and logs the action to the system audit.
 */
exports.addEvent = (req, res) => {
  const { 
    event_name, client_name, phone, location, date, end_date, 
    event_type, manager_name, notes, status, event_manager_pay, 
    profit, food_cost, gas_cost, manual_status, linked_event_id,
    deal_type, rent_amount, company_percent, partner_percent, admin_name 
  } = req.body;
  
  try {
    // 1. CRM Integration: Create or Sync partner details
    let client_id = null;
    if (client_name) {
      const existing = db.prepare("SELECT id FROM clients WHERE name = ?").get(client_name);
      if (existing) {
        client_id = existing.id;
        db.prepare("UPDATE clients SET phone = COALESCE(?, phone), location = COALESCE(?, location), event_type = COALESCE(?, event_type), type = 'event_manager' WHERE id = ?")
          .run(phone || null, location || null, event_type || null, client_id);
      } else {
        const result = db.prepare("INSERT INTO clients (name, phone, location, event_type, type) VALUES (?, ?, ?, ?, 'event_manager')")
          .run(client_name, phone || '', location || '', event_type || '');
        client_id = result.lastInsertRowid;
      }
    }

    // 2. Data Integrity: Generate Unique GenKey
    const d = date ? new Date(date) : new Date();
    const dd = String(d.getDate()).padStart(2,'0');
    const mm = String(d.getMonth()+1).padStart(2,'0');
    const yyyy = d.getFullYear();
    const rand = Math.random().toString(36).substring(2,5).toUpperCase();
    const gen_key = `${dd}${mm}${yyyy}-${rand}`;

    // 3. Persist Event to Database
    const result = db.prepare(
      `INSERT INTO events (
        event_name, client_id, client_name, phone, location, date, end_date, 
        event_type, manager_name, notes, status, event_manager_pay, profit, 
        food_cost, gas_cost, gen_key, manual_status, linked_event_id,
        deal_type, rent_amount, company_percent, partner_percent, admin_name
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      event_name, client_id, client_name || '', phone || '', location || '', date || null, end_date || null, 
      event_type || '', manager_name || '', notes || '', status || 'pending', event_manager_pay || 0, profit || 0, 
      food_cost || 0, gas_cost || 0, gen_key, manual_status || null, linked_event_id || null,
      deal_type || 'Fixing Rent', rent_amount || 0, company_percent || 60, partner_percent || 40, admin_name || 'System'
    );

    const id = result.lastInsertRowid;
    
    // 4. Logging & Analytics
    const isUpcoming = (status || 'pending') === 'pending';
    const section = isUpcoming ? 'Upcoming Events' : 'Events';
    const actionType = isUpcoming ? 'New Upcoming Event Created' : 'New Event Created';
    const dealInfo = deal_type === 'Fixing Rent' ? `Rent: $${rent_amount}` : `Split: ${company_percent}/${partner_percent}`;
    
    logAction(admin_name || 'System', section, actionType, `${event_name} — ${dealInfo}`, `${event_name} added for partner ${client_name || 'X'} on ${date || 'N/A'}. Deal: ${deal_type}`, profit || 0, event_name);

    if (status === 'completed') {
      syncEventFinance(id, req.body);
    }

    res.status(201).json({ success: true, id, gen_key, message: 'Event created and synced with Partner' });
  } catch (err) {
    console.error('Error in addEvent:', err);
    res.status(500).json({ error: 'Failed to create event', details: err.message });
  }
};

/**
 * UPDATE EVENT STATUS
 * ------------------
 * Modifies the status of an event (e.g., Pending -> Confirmed -> Completed).
 */
exports.updateStatus = (req, res) => {
  try {
    const event = db.prepare("SELECT * FROM events WHERE id = ?").get(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    
    db.prepare("UPDATE events SET status = ? WHERE id = ?").run(req.body.status, req.params.id);
    
    // Log Activity
    const isUpcoming = req.body.status === 'pending';
    const section = isUpcoming ? 'Upcoming Events' : 'Events';
    logAction(req.body.admin_name || 'System', section, 'Status Updated', `${event.event_name} status: ${req.body.status}`, `${event.event_name} status changed from ${event.status} to ${req.body.status}`, 0, event.event_name);

    // Sync finances if marked as completed
    if (req.body.status === 'completed' && event.status !== 'completed') {
      const fullEventData = db.prepare("SELECT * FROM events WHERE id = ?").get(req.params.id);
      syncEventFinance(req.params.id, fullEventData);
    }

    res.json({ success: true, message: 'Status updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update status', details: err.message });
  }
};

/**
 * UPDATE EVENT DETAILS
 * --------------------
 * Dynamic update function that patches specific event fields.
 */
exports.updateEvent = (req, res) => {
  try {
    const fields = [];
    const values = [];
    const allowedFields = [
      'event_name', 'client_name', 'phone', 'location', 'date', 'end_date', 'event_type', 
      'manager_name', 'notes', 'total_income', 'rating', 'status', 'event_manager_pay', 
      'profit', 'food_cost', 'gas_cost', 'manual_status', 'linked_event_id',
      'deal_type', 'rent_amount', 'company_percent', 'partner_percent', 'admin_name'
    ];
    
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(req.body[key]);
      }
    }

    if (fields.length > 0) {
      const eventBefore = db.prepare("SELECT * FROM events WHERE id = ?").get(req.params.id);
      values.push(req.params.id);
      db.prepare(`UPDATE events SET ${fields.join(', ')} WHERE id = ?`).run(...values);
      
      // Update partner client info if applicable
      if (req.body.client_name || req.body.phone) {
        const name = req.body.client_name || eventBefore.client_name;
        const phone = req.body.phone || eventBefore.phone;
        const existing = db.prepare("SELECT id FROM clients WHERE name = ?").get(name);
        if (existing) {
          db.prepare("UPDATE clients SET phone = ? WHERE id = ?").run(phone, existing.id);
        }
      }

      // Logging
      const isUpcoming = (req.body.status || eventBefore.status) === 'pending';
      const section = isUpcoming ? 'Upcoming Events' : 'Events';
      logAction(req.body.admin_name, section, 'Event Updated', `${eventBefore.event_name} details changed`, `Event details updated for ${eventBefore.event_name}.`, 0, eventBefore.event_name);
      
      // Sync finances if marked as completed
      if ((req.body.status || eventBefore.status) === 'completed') {
        const fullEventData = db.prepare("SELECT * FROM events WHERE id = ?").get(req.params.id);
        syncEventFinance(req.params.id, fullEventData);
      }
    }

    res.json({ success: true, message: 'Event updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update event', details: err.message });
  }
};

/**
 * ARCHIVE EVENT
 * -------------
 * Moves an event to the archive table and marks it as archived.
 * Uses a transaction to ensure data integrity.
 */
exports.archiveEvent = (req, res) => {
  try {
    const event = db.prepare("SELECT * FROM events WHERE id = ?").get(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    const archiveTransaction = db.transaction(() => {
      db.prepare("INSERT INTO archive_events (original_id, data) VALUES (?, ?)").run(event.id, JSON.stringify(event));
      db.prepare("UPDATE events SET status = 'archived' WHERE id = ?").run(req.params.id);
    });
    archiveTransaction();

    logAction(req.body.admin_name, 'Events', 'Event Archived', `${event.event_name} archived`, `${event.event_name} was moved to system archive`, 0, event.event_name);

    res.json({ success: true, message: 'Event archived' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to archive event', details: err.message });
  }
};

/**
 * GET TODAY'S ACTIVE EVENT
 * ------------------------
 * Utility to find if there is an ongoing event today for contextual UI features.
 */
exports.getTodaysEvent = (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const event = db.prepare("SELECT * FROM events WHERE date = ? AND status IN ('confirmed', 'pending') LIMIT 1").get(today);
    res.json(event || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

