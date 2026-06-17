const db = require('../config/db');
const { logAction } = require('../utils/logger');

const syncEventFinance = async (eventId, eventData) => {
  const { event_name, date, profit, notes } = eventData;
  let parsedNotes = { days: [] };
  if (notes && notes.startsWith('{')) {
    try { parsedNotes = JSON.parse(notes); } catch(e){}
  }

  await db.prepare("DELETE FROM income WHERE event_id = ? AND source = 'Event Profit'").run(eventId);
  await db.prepare("DELETE FROM expenses WHERE event_id = ? AND category = 'event_auto'").run(eventId);

  let totalRevenue = 0;
  if (parsedNotes.days && parsedNotes.days.length > 0) {
    for (const d of parsedNotes.days) {
      totalRevenue += parseFloat(d.revenue) || 0;
      if (d.expenses) {
        for (const exp of d.expenses) {
          await db.prepare(`
            INSERT INTO expenses (amount, paid_by, category, description, day_type, event_id, event_name, date, status)
            VALUES (?, 'company', 'event_auto', ?, 'work_day', ?, ?, ?, 'paid')
          `).run(parseFloat(exp.amount) || 0, exp.desc || 'Event Expense', eventId, event_name, d.date || date);
        }
      }
    }
  } else {
    totalRevenue = (parseFloat(profit) || 0) + (parseFloat(eventData.food_cost)||0) + (parseFloat(eventData.gas_cost)||0) + (parseFloat(eventData.event_manager_pay)||0);
    if (eventData.event_manager_pay > 0) await db.prepare("INSERT INTO expenses (amount, paid_by, category, description, day_type, event_id, event_name, date, status) VALUES (?, 'company', 'event_auto', 'Space/Manager Rent', 'work_day', ?, ?, ?, 'paid')").run(eventData.event_manager_pay, eventId, event_name, date);
    if (eventData.gas_cost > 0) await db.prepare("INSERT INTO expenses (amount, paid_by, category, description, day_type, event_id, event_name, date, status) VALUES (?, 'company', 'event_auto', 'Gas/Transport', 'work_day', ?, ?, ?, 'paid')").run(eventData.gas_cost, eventId, event_name, date);
    if (eventData.food_cost > 0) await db.prepare("INSERT INTO expenses (amount, paid_by, category, description, day_type, event_id, event_name, date, status) VALUES (?, 'company', 'event_auto', 'Food', 'work_day', ?, ?, ?, 'paid')").run(eventData.food_cost, eventId, event_name, date);
  }

  if (totalRevenue > 0) {
    await db.prepare(`
      INSERT INTO income (event_id, amount, date, notes, source, original_profit, final_profit, admin_name, time)
      VALUES (?, ?, ?, ?, 'Event Profit', ?, ?, ?, ?)
    `).run(
      eventId, totalRevenue, date, `Revenue from ${event_name}`,
      totalRevenue, parseFloat(profit) || 0, eventData.admin_name || 'System',
      new Date().toLocaleTimeString('en-GB', { hour12: false }).slice(0, 5)
    );
  }
};

exports.getEvents = async (req, res) => {
  try {
    const events = await db.prepare("SELECT * FROM events WHERE status != 'archived' ORDER BY date DESC").all();
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch events', details: err.message });
  }
};

exports.getEvent = async (req, res) => {
  try {
    const event = await db.prepare("SELECT * FROM events WHERE id = ?").get(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    const expenses = await db.prepare("SELECT * FROM expenses WHERE event_id = ? AND status != 'archived'").all(req.params.id);
    const income = await db.prepare("SELECT * FROM income WHERE event_id = ?").all(req.params.id);
    const debts = await db.prepare("SELECT * FROM debts WHERE related_event_id = ?").all(req.params.id);

    res.json({
      ...event,
      expenses,
      income,
      debts,
      total_expenses: expenses.reduce((s, e) => s + parseFloat(e.amount), 0),
      net_profit: parseFloat(event.total_income) - expenses.reduce((s, e) => s + parseFloat(e.amount), 0)
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch event details', details: err.message });
  }
};

exports.addEvent = async (req, res) => {
  const {
    event_name, client_name, phone, location, date, end_date,
    event_type, manager_name, notes, status, event_manager_pay,
    profit, food_cost, gas_cost, manual_status, linked_event_id,
    deal_type, rent_amount, company_percent, partner_percent, admin_name
  } = req.body;

  try {
    let client_id = null;
    if (client_name) {
      const existing = await db.prepare("SELECT id FROM clients WHERE name = ?").get(client_name);
      if (existing) {
        client_id = existing.id;
        await db.prepare("UPDATE clients SET phone = COALESCE(?, phone), location = COALESCE(?, location), event_type = COALESCE(?, event_type), type = 'event_manager' WHERE id = ?")
          .run(phone || null, location || null, event_type || null, client_id);
      } else {
        const result = await db.prepare("INSERT INTO clients (name, phone, location, event_type, type) VALUES (?, ?, ?, ?, 'event_manager')")
          .run(client_name, phone || '', location || '', event_type || '');
        client_id = result.lastInsertRowid;
      }
    }

    const d = date ? new Date(date) : new Date();
    const dd = String(d.getDate()).padStart(2,'0');
    const mm = String(d.getMonth()+1).padStart(2,'0');
    const yyyy = d.getFullYear();
    const rand = Math.random().toString(36).substring(2,5).toUpperCase();
    const gen_key = `${dd}${mm}${yyyy}-${rand}`;

    const result = await db.prepare(
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

    const isUpcoming = (status || 'pending') === 'pending';
    const section = isUpcoming ? 'Upcoming Events' : 'Events';
    const actionType = isUpcoming ? 'New Upcoming Event Created' : 'New Event Created';
    const dealInfo = deal_type === 'Fixing Rent' ? `Rent: $${rent_amount}` : `Split: ${company_percent}/${partner_percent}`;
    const finalAdminName = req.adminName || admin_name || 'System';
    logAction(finalAdminName, section, actionType, `${event_name} — ${dealInfo}`, `${event_name} added for partner ${client_name || 'X'} on ${date || 'N/A'}. Deal: ${deal_type}`, profit || 0, event_name);

    if (status === 'completed') {
      await syncEventFinance(id, req.body);
    }

    res.status(201).json({ success: true, id, gen_key, message: 'Event created and synced with Partner' });
  } catch (err) {
    console.error('Error in addEvent:', err);
    res.status(500).json({ error: 'Failed to create event', details: err.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const event = await db.prepare("SELECT * FROM events WHERE id = ?").get(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    await db.prepare("UPDATE events SET status = ? WHERE id = ?").run(req.body.status, req.params.id);

    const isUpcoming = req.body.status === 'pending';
    const section = isUpcoming ? 'Upcoming Events' : 'Events';
    const finalAdminName = req.adminName || req.body.admin_name || 'System';
    logAction(finalAdminName, section, 'Status Updated', `${event.event_name} status: ${req.body.status}`, `${event.event_name} status changed from ${event.status} to ${req.body.status}`, 0, event.event_name);

    if (req.body.status === 'completed' && event.status !== 'completed') {
      const fullEventData = await db.prepare("SELECT * FROM events WHERE id = ?").get(req.params.id);
      await syncEventFinance(req.params.id, fullEventData);
    }

    res.json({ success: true, message: 'Status updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update status', details: err.message });
  }
};

exports.updateEvent = async (req, res) => {
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
      const eventBefore = await db.prepare("SELECT * FROM events WHERE id = ?").get(req.params.id);
      values.push(req.params.id);
      await db.prepare(`UPDATE events SET ${fields.join(', ')} WHERE id = ?`).run(...values);

      if (req.body.client_name || req.body.phone) {
        const name = req.body.client_name || eventBefore.client_name;
        const phone = req.body.phone || eventBefore.phone;
        const existing = await db.prepare("SELECT id FROM clients WHERE name = ?").get(name);
        if (existing) {
          await db.prepare("UPDATE clients SET phone = ? WHERE id = ?").run(phone, existing.id);
        }
      }

      const isUpcoming = (req.body.status || eventBefore.status) === 'pending';
      const section = isUpcoming ? 'Upcoming Events' : 'Events';
      const finalAdminName = req.adminName || req.body.admin_name || 'System';
      logAction(finalAdminName, section, 'Event Updated', `${eventBefore.event_name} details changed`, `Event details updated for ${eventBefore.event_name}.`, 0, eventBefore.event_name);

      if ((req.body.status || eventBefore.status) === 'completed') {
        const fullEventData = await db.prepare("SELECT * FROM events WHERE id = ?").get(req.params.id);
        await syncEventFinance(req.params.id, fullEventData);
      }
    }

    res.json({ success: true, message: 'Event updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update event', details: err.message });
  }
};

exports.archiveEvent = async (req, res) => {
  try {
    const event = await db.prepare("SELECT * FROM events WHERE id = ?").get(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    const archiveTransaction = db.transaction(async () => {
      await db.prepare("INSERT INTO archive_events (original_id, data) VALUES (?, ?)").run(event.id, JSON.stringify(event));
      await db.prepare("UPDATE events SET status = 'archived' WHERE id = ?").run(req.params.id);
    });
    await archiveTransaction();

    const finalAdminName = req.adminName || req.body?.admin_name || 'System';
    logAction(finalAdminName, 'Events', 'Event Archived', `${event.event_name} archived`, `${event.event_name} was moved to system archive`, 0, event.event_name);

    res.json({ success: true, message: 'Event archived' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to archive event', details: err.message });
  }
};

exports.getTodaysEvent = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const event = await db.prepare("SELECT * FROM events WHERE date = ? AND status IN ('confirmed', 'pending') LIMIT 1").get(today);
    res.json(event || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
