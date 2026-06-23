const db = require('../config/db');
const { logAction } = require('../utils/logger');

exports.getClients = async (req, res) => {
  try {
    const type = req.query.type;
    let clients;
    if (type) {
      clients = await db.prepare("SELECT * FROM clients WHERE status = 'active' AND type = ? ORDER BY created_at DESC").all(type);
    } else {
      clients = await db.prepare("SELECT * FROM clients WHERE status = 'active' ORDER BY created_at DESC").all();
    }

    // Always include events for event_manager clients regardless of filter
    clients = await Promise.all(clients.map(async c => {
      if (c.type === 'event_manager') {
        const events = await db.prepare(
          "SELECT id, event_name, date, location, status, deal_type, rent_amount, company_percent, partner_percent, profit FROM events WHERE client_id = ? AND status != 'archived' ORDER BY date DESC"
        ).all(c.id);
        return { ...c, events };
      }
      return c;
    }));

    res.json(clients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getClient = async (req, res) => {
  try {
    const client = await db.prepare("SELECT * FROM clients WHERE id = ?").get(req.params.id);
    if (!client) return res.status(404).json({ error: 'Client not found' });
    const events = await db.prepare("SELECT * FROM events WHERE client_id = ? ORDER BY date DESC").all(req.params.id);
    res.json({ ...client, events });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addClient = async (req, res) => {
  const { name, phone, location, event_type, type, notes } = req.body;
  try {
    const result = await db.prepare(
      "INSERT INTO clients (name, phone, location, event_type, type, notes) VALUES (?, ?, ?, ?, ?, ?)"
    ).run(name, phone || '', location || '', event_type || '', type || 'client', notes || '');

    const isPartner = (type || 'client') === 'event_manager';
    const section = isPartner ? 'Partners' : 'Clients';
    const adminName = req.adminName || req.body.admin_name || 'Admin';
    logAction(adminName, section, isPartner ? 'New Partner Added' : 'New Client Added', `${name} added`, `${name} registered as ${isPartner ? 'Partner/Manager' : 'Client'}.`, 0, name);

    res.status(201).json({ success: true, id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateClient = async (req, res) => {
  const { name, phone, location, event_type, type, notes } = req.body;
  try {
    await db.prepare(`
      UPDATE clients SET
        name = COALESCE(?, name), phone = COALESCE(?, phone),
        location = COALESCE(?, location), event_type = COALESCE(?, event_type),
        type = COALESCE(?, type), notes = COALESCE(?, notes)
      WHERE id = ?
    `).run(name, phone, location, event_type, type, notes, req.params.id);

    const client = await db.prepare("SELECT name, type FROM clients WHERE id = ?").get(req.params.id);
    const isPartner = (type || client.type) === 'event_manager';
    const section = isPartner ? 'Partners' : 'Clients';
    const adminName = req.adminName || req.body.admin_name || 'Admin';
    logAction(adminName, section, `${isPartner ? 'Partner' : 'Client'} Updated`, `${name || client.name} details changed`, `${isPartner ? 'Partner' : 'Client'} ${name || client.name} updated.`, 0, name || client.name);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteClient = async (req, res) => {
  try {
    const client = await db.prepare("SELECT name, type FROM clients WHERE id = ?").get(req.params.id);
    if (!client) return res.status(404).json({ error: 'Client not found' });

    await db.prepare("UPDATE clients SET status = 'archived' WHERE id = ?").run(req.params.id);

    const isPartner = client.type === 'event_manager';
    const section = isPartner ? 'Partners' : 'Clients';
    const adminName = req.adminName || req.body.admin_name || 'Admin';
    logAction(adminName, section, `${isPartner ? 'Partner' : 'Client'} Archived`, `${client.name} archived`, `'${client.name}' moved to archive.`, 0, client.name);

    res.json({ success: true, message: 'Client archived' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
