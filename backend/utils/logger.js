/**
 * ============================================================
 * AUDIT LOGGER UTILITY
 * ============================================================
 * Final Graduation Project Refactor
 * Purpose: Provides a centralized logging mechanism for the 
 * system's audit trail (Archive). Every significant action in 
 * the dashboard is recorded here for transparency.
 * ============================================================
 */

const db = require('../config/db');

/**
 * LOG SYSTEM ACTION
 * -----------------
 * Records a specialized entry in the audit_logs table.
 * 
 * @param {string} user - Name of the admin performing the action
 * @param {string} section - System module (e.g., 'Finance', 'Events')
 * @param {string} actionType - Category of action (e.g., 'New Machine Added')
 * @param {string} h3Text - Short summary or headline for the log UI
 * @param {string} mainText - Detailed explanation of the action
 * @param {number} amount - Monetary value associated with the action (if any)
 * @param {string} relatedTo - Specific entity name (e.g., Event Name)
 */
const logAction = (user, section, actionType, h3Text, mainText, amount = 0, relatedTo = 'General') => {
  // Generate timestamp details
  const date = new Date().toISOString().split('T')[0];
  const time = new Date().toLocaleTimeString('en-GB', { hour12: false }).slice(0, 5);
  
  // Format description using a triple-pipe separator for frontend component parsing
  const description = `${h3Text}|||${mainText}`;
  
  try {
    db.prepare(`
      INSERT INTO audit_logs (date, time, user, section, action_type, description, amount, related_to)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(date, time, user || 'System', section || 'General', actionType, description, amount || 0, relatedTo || 'General');
    return true;
  } catch (err) {
    console.error('System Audit Logging failed:', err);
    return false;
  }
};

module.exports = { logAction };

