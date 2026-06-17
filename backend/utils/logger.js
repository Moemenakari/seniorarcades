const db = require('../config/db');

const logAction = (user, section, actionType, h3Text, mainText, amount = 0, relatedTo = 'General') => {
  const date = new Date().toISOString().split('T')[0];
  const time = new Date().toLocaleTimeString('en-GB', { hour12: false }).slice(0, 5);
  const description = `${h3Text}|||${mainText}`;

  db.prepare(`
    INSERT INTO audit_logs (date, time, "user", section, action_type, description, amount, related_to)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(date, time, user || 'System', section || 'General', actionType, description, amount || 0, relatedTo || 'General')
    .catch(err => console.error('Audit logging failed:', err.message));
};

module.exports = { logAction };
