/**
 * ============================================================
 * ARCHIVE CONTROLLER
 * ============================================================
 * Final Graduation Project Refactor
 * Purpose: Manages the retrieval of historical data, including 
 * archived events, financials, and the system-wide audit trail.
 * ============================================================
 */

const db = require('../config/db');

/**
 * GET ARCHIVED EVENTS
 * -------------------
 * Retrieves snapshots of events that have been moved to the archive.
 */
exports.getArchivedEvents = (req, res) => {
  try {
    const archived = db.prepare("SELECT * FROM archive_events ORDER BY archived_at DESC").all();
    // Parse the serialized JSON data stored in the database
    const parsed = archived.map(a => ({
      ...a,
      data: JSON.parse(a.data)
    }));
    res.json(parsed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET ARCHIVED FINANCIALS
 * -----------------------
 * Retrieves snapshots of deleted or paid-out financial records (expenses, debts).
 */
exports.getArchivedFinancials = (req, res) => {
  try {
    const archived = db.prepare("SELECT * FROM archive_financials ORDER BY archived_at DESC").all();
    const parsed = archived.map(a => ({
      ...a,
      data: JSON.parse(a.data)
    }));
    res.json(parsed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET SYSTEM ARCHIVE (AUDIT LOGS)
 * -------------------------------
 * Fetches the complete history of system actions and generates 
 * summary statistics for the archive dashboard.
 */
exports.getSystemArchive = (req, res) => {
  try {
    const logs = db.prepare("SELECT * FROM audit_logs ORDER BY date DESC, time DESC, id DESC").all();
    
    // Categorical breakdown for analytical overview
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

/**
 * UPDATE AUDIT LOG
 * ----------------
 * Allows updating the description or other fields of an audit log entry.
 */
exports.updateAuditLog = (req, res) => {
  const { id } = req.params;
  const { description, action_type, user, section } = req.body;
  
  try {
    db.prepare(`
      UPDATE audit_logs 
      SET description = ?, action_type = ?, user = ?, section = ?
      WHERE id = ?
    `).run(description, action_type, user, section, id);
    
    res.json({ message: "Audit log updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

