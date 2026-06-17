const db = require('../config/db');

exports.getArchivedEvents = async (req, res) => {
  try {
    const archived = await db.prepare("SELECT * FROM archive_events ORDER BY archived_at DESC").all();
    res.json(archived.map(a => ({ ...a, data: JSON.parse(a.data) })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getArchivedFinancials = async (req, res) => {
  try {
    const archived = await db.prepare("SELECT * FROM archive_financials ORDER BY archived_at DESC").all();
    res.json(archived.map(a => ({ ...a, data: JSON.parse(a.data) })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getSystemArchive = async (req, res) => {
  try {
    const logs = await db.prepare("SELECT * FROM audit_logs ORDER BY date DESC, time DESC, id DESC").all();
    const stats = {
      total: logs.length,
      finance: logs.filter(l => l.section === 'Finance').length,
      events: logs.filter(l => l.section === 'Events' || l.section === 'Upcoming Events').length,
      machines: logs.filter(l => l.section === 'Machines').length,
      partners: logs.filter(l => l.section === 'Partners' || l.section === 'Clients').length
    };
    res.json({ logs, stats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateAuditLog = async (req, res) => {
  const { id } = req.params;
  const { description, action_type, user, section } = req.body;
  try {
    await db.prepare('UPDATE audit_logs SET description = ?, action_type = ?, "user" = ?, section = ? WHERE id = ?')
      .run(description, action_type, user, section, id);
    res.json({ message: 'Audit log updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
