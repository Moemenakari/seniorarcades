/**
 * ============================================================
 * CLIENT & PARTNER CONTROLLER
 * ============================================================
 * Final Graduation Project Refactor
 * Purpose: Manages the CRM aspect of the application, including 
 * customer directory and partner (Event Manager) relations.
 * ============================================================
 */

const db = require('../config/db');
const { logAction } = require('../utils/logger');

/**
 * GET ALL CLIENTS
 * ---------------
 * Fetches active clients or partners based on the query type.
 * If fetching partners, it automatically attaches their event history.
 */
exports.getClients = (req, res) => {
  try {
    const type = req.query.type; // Expected: 'client' or 'event_manager'
    let clients;
    
    if (type) {
      clients = db.prepare("SELECT * FROM clients WHERE status = 'active' AND type = ? ORDER BY created_at DESC").all(type);
    } else {
      clients = db.prepare("SELECT * FROM clients WHERE status = 'active' ORDER BY created_at DESC").all();
    }

    // Contextual Data Attachment: Partners (event_managers) need their event history
    if (type === 'event_manager') {
       clients = clients.map(c => {
          const events = db.prepare("SELECT * FROM events WHERE client_id = ? ORDER BY date DESC").all(c.id);
          return { ...c, events };
       });
    }

    res.json(clients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET SINGLE CLIENT
 * -----------------
 * Retrieves detailed profile for a client/partner and their linked events.
 */
exports.getClient = (req, res) => {
  try {
    const client = db.prepare("SELECT * FROM clients WHERE id = ?").get(req.params.id);
    if (!client) return res.status(404).json({ error: 'Client not found' });

    // Link related event data
    const events = db.prepare("SELECT * FROM events WHERE client_id = ? ORDER BY date DESC").all(req.params.id);
    res.json({ ...client, events });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * ADD NEW CLIENT
 * --------------
 * Registers a new customer or partner manager in the system.
 */
exports.addClient = (req, res) => {
  const { name, phone, location, event_type, type, notes } = req.body;
  try {
    const result = db.prepare(
      "INSERT INTO clients (name, phone, location, event_type, type, notes) VALUES (?, ?, ?, ?, ?, ?)"
    ).run(name, phone || '', location || '', event_type || '', type || 'client', notes || '');

    const id = result.lastInsertRowid;
    
    // Auditing logic
    const isPartner = (type || 'client') === 'event_manager';
    const section = isPartner ? 'Partners' : 'Clients';
    const actionType = isPartner ? 'New Partner Added' : 'New Client Added';
    logAction(req.body.admin_name, section, actionType, `${name} added`, `${name} was registered as a ${isPartner ? 'Partner/Manager' : 'Client'}.`, 0, name);

    res.status(201).json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * UPDATE CLIENT
 * -------------
 * Updates contact information or notes for a client/partner.
 */
exports.updateClient = (req, res) => {
  const { name, phone, location, event_type, type, notes } = req.body;
  try {
    db.prepare(`
      UPDATE clients SET 
        name = COALESCE(?, name),
        phone = COALESCE(?, phone),
        location = COALESCE(?, location),
        event_type = COALESCE(?, event_type),
        type = COALESCE(?, type),
        notes = COALESCE(?, notes)
      WHERE id = ?
    `).run(name, phone, location, event_type, type, notes, req.params.id);

    // Auditing
    const client = db.prepare("SELECT name, type FROM clients WHERE id = ?").get(req.params.id);
    const isPartner = (type || client.type) === 'event_manager';
    const section = isPartner ? 'Partners' : 'Clients';
    logAction(req.body.admin_name, section, `${isPartner ? 'Partner' : 'Client'} Updated`, `${name || client.name} details changed`, `${isPartner ? 'Partner' : 'Client'} ${name || client.name} information was updated.`, 0, name || client.name);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * ARCHIVE CLIENT
 * --------------
 * Soft-deletes a client record to maintain relational integrity in old events.
 */
exports.deleteClient = (req, res) => {
  try {
    const client = db.prepare("SELECT name, type FROM clients WHERE id = ?").get(req.params.id);
    db.prepare("UPDATE clients SET status = 'archived' WHERE id = ?").run(req.params.id);
    
    // Auditing
    const isPartner = client.type === 'event_manager';
    const section = isPartner ? 'Partners' : 'Clients';
    logAction(req.body.admin_name, section, `${isPartner ? 'Partner' : 'Client'} Archived`, `${client.name} archived`, `${isPartner ? 'Partner' : 'Client'} '${client.name}' was moved to archive.`, 0, client.name);

    res.json({ success: true, message: 'Client archived' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

