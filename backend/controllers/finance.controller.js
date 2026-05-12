/**
 * ============================================================
 * FINANCE CONTROLLER
 * ============================================================
 * Final Graduation Project Refactor
 * Purpose: Manages all financial operations including expenses, 
 * revenue, partner debts, and automated settlement logic.
 * ============================================================
 */

const db = require('../config/db');
const { logAction } = require('../utils/logger');

/**
 * ============================================================
 * EXPENSES MANAGEMENT
 * ============================================================
 */

/**
 * ADD NEW EXPENSE
 * --------------
 * Records a new business expense. If paid personally by a partner 
 * (Moemen/Abd), it automatically generates a debt record for the company.
 */
exports.addExpense = (req, res) => {
  const { amount, paid_by, paid_by_name, category, description, day_type, event_id, event_name, date, time, admin_name } = req.body;

  if (!description) return res.status(400).json({ error: 'Description is required' });

  try {
    const addExpenseTransaction = db.transaction(() => {
      // 1. Insert expense record
      const result = db.prepare(
        "INSERT INTO expenses (amount, paid_by, paid_by_name, category, description, day_type, event_id, event_name, date, time, admin_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
      ).run(amount, paid_by, paid_by_name || null, category, description, day_type || 'work_day', event_id || null, event_name || '', date || new Date().toISOString().split('T')[0], time || new Date().toTimeString().split(' ')[0], admin_name || 'System');

      // 2. Automated Debt Tracking: If a partner paid personally, the company now owes them.
      if (paid_by === 'moemen' || paid_by === 'abd' || paid_by === 'others') {
        db.prepare(
          "INSERT INTO debts (partner_name, partner_real_name, amount, type, related_expense_id, related_event_id) VALUES (?, ?, ?, 'debt_to_partner', ?, ?)"
        ).run(paid_by, paid_by_name || null, amount, result.lastInsertRowid, event_id || null);
      }

      // 3. System Auditing
      const payerName = paid_by === 'others' ? paid_by_name : (paid_by.charAt(0).toUpperCase() + paid_by.slice(1));
      const h3Text = paid_by === 'company' 
        ? `Company Paid Expense — $${amount}` 
        : `${payerName} — Company Debt $${amount}`;
      const mainText = paid_by === 'company' 
        ? `Company paid ${description} directly` 
        : `${payerName} paid $${amount} for ${description} and this amount became a company debt`;

      logAction(admin_name, 'Finance', 'Input Expense', h3Text, mainText, amount, event_name || 'General');

      return result.lastInsertRowid;
    });

    const id = addExpenseTransaction();
    res.status(201).json({ success: true, id, message: 'Expense recorded' + (paid_by !== 'company' ? ' + debt tracked' : '') });
  } catch (err) {
    res.status(500).json({ error: 'Failed to record expense', details: err.message });
  }
};

/**
 * GET ALL EXPENSES
 * ----------------
 * Fetches all non-archived expenses for the finance dashboard.
 */
exports.getExpenses = (req, res) => {
  try {
    const expenses = db.prepare("SELECT * FROM expenses WHERE status != 'archived' ORDER BY date DESC, created_at DESC").all();
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch expenses', details: err.message });
  }
};

/**
 * UPDATE EXPENSE
 * --------------
 * Updates specific fields of an existing expense record.
 */
exports.updateExpense = (req, res) => {
  const { amount, paid_by, category, description, day_type, event_id, event_name, date } = req.body;
  try {
    db.prepare(`
      UPDATE expenses SET 
        amount = COALESCE(?, amount),
        paid_by = COALESCE(?, paid_by),
        category = COALESCE(?, category),
        description = COALESCE(?, description),
        day_type = COALESCE(?, day_type),
        event_id = COALESCE(?, event_id),
        event_name = COALESCE(?, event_name),
        date = COALESCE(?, date)
      WHERE id = ?
    `).run(amount, paid_by, category, description, day_type, event_id, event_name, date, req.params.id);

    logAction(req.body.admin_name, 'Finance', 'Expense Updated', `Record Updated — $${amount || 0}`, `Expense details updated for: ${description || 'Unknown'}`, amount || 0, event_name || 'General');

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * MARK EXPENSE AS PAID
 * --------------------
 * Marks an expense as settled by the company. If it was a personal partner 
 * expense, it clears the associated debt and creates a payment record.
 */
exports.markExpensePaid = (req, res) => {
  const { event_id, admin_name } = req.body;
  try {
    const expense = db.prepare("SELECT * FROM expenses WHERE id = ?").get(req.params.id);
    if (!expense) return res.status(404).json({ error: 'Expense not found' });

    const markPaidTransaction = db.transaction(() => {
      // Update expense status to paid
      db.prepare("UPDATE expenses SET status = 'paid', confirmed_by_admin = ?, confirmed_at = ? WHERE id = ?").run(admin_name || 'System', new Date().toISOString(), req.params.id);

      // If partner paid, clear the company's debt to them
      if (expense.paid_by !== 'company') {
        const debt = db.prepare("SELECT * FROM debts WHERE related_expense_id = ? AND status = 'pending'").get(req.params.id);
        if (debt) {
          db.prepare("UPDATE debts SET status = 'cleared', related_event_id = COALESCE(?, related_event_id) WHERE id = ?").run(event_id || null, debt.id);
          
          // Record the payment record for bookkeeping
          db.prepare(
            "INSERT INTO payments (debt_id, event_id, amount, paid_to, paid_to_real_name, description) VALUES (?, ?, ?, ?, ?, ?)"
          ).run(debt.id, event_id || null, expense.amount, expense.paid_by, expense.paid_by_name || null, `Payment for: ${expense.description}`);
        }
      }

      // Auditing
      const payer = expense.paid_by === 'company' ? 'Company' : (expense.paid_by.charAt(0).toUpperCase() + expense.paid_by.slice(1));
      const h3Text = `Expense Paid — ${payer}`;
      const mainText = `Company paid back $${expense.amount} to ${payer} for ${expense.description} expense`;
      logAction(admin_name, 'Finance', 'Expense Marked as Paid', h3Text, mainText, expense.amount, expense.event_name || 'General');
    });

    markPaidTransaction();
    res.json({ success: true, message: `Expense marked as paid${expense.paid_by !== 'company' ? ` - debt to ${expense.paid_by} cleared` : ''}` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark as paid', details: err.message });
  }
};

/**
 * DELETE EXPENSE (ARCHIVE)
 * ------------------------
 * Archives an expense record instead of physical deletion to preserve 
 * financial history and audit trails.
 */
exports.deleteExpense = (req, res) => {
  try {
    const expense = db.prepare("SELECT * FROM expenses WHERE id = ?").get(req.params.id);
    if (!expense) return res.status(404).json({ error: 'Expense not found' });

    const archiveTransaction = db.transaction(() => {
      // Store in archive_financials for historical reference
      db.prepare(
        "INSERT INTO archive_financials (original_id, table_name, data, archive_type) VALUES (?, 'expenses', ?, 'deleted')"
      ).run(expense.id, JSON.stringify(expense));

      // Mark as archived in main table
      db.prepare("UPDATE expenses SET status = 'archived' WHERE id = ?").run(req.params.id);

      // Nullify any linked pending debts
      db.prepare("UPDATE debts SET status = 'cleared' WHERE related_expense_id = ?").run(req.params.id);
    });

    archiveTransaction();
    res.json({ success: true, message: 'Expense archived' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to archive expense', details: err.message });
  }
};

/**
 * ============================================================
 * REVENUE & INCOME MANAGEMENT
 * ============================================================
 */

/**
 * ADD BASIC INCOME
 * ----------------
 * Simple endpoint to record income and associate it with a completed event.
 */
exports.addIncome = (req, res) => {
  const { event_name, date, location, amount, rating, manager_name, notes } = req.body;

  if (!event_name) return res.status(400).json({ error: 'Event name is required' });

  try {
    const addIncomeTransaction = db.transaction(() => {
      // Create a completed event record
      const eventResult = db.prepare(
        "INSERT INTO events (event_name, date, location, total_income, rating, manager_name, notes, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'completed')"
      ).run(event_name, date || new Date().toISOString().split('T')[0], location || '', amount || 0, rating || 0, manager_name || '', notes || '');

      // Log the income entry
      db.prepare(
        "INSERT INTO income (event_id, amount, date, notes) VALUES (?, ?, ?, ?)"
      ).run(eventResult.lastInsertRowid, amount || 0, date || new Date().toISOString().split('T')[0], notes || '');

      return eventResult.lastInsertRowid;
    });

    const eventId = addIncomeTransaction();
    res.status(201).json({ success: true, event_id: eventId, message: 'Income recorded' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to record income', details: err.message });
  }
};

/**
 * SMART SETTLEMENT FROM EVENT
 * ----------------------------
 * Complex settlement logic that uses event income to pay off pending 
 * debts, record extra expenses, and calculate final profit distribution.
 */
exports.settleFromEvent = (req, res) => {
  const { event_id, debt_ids, extra_expenses, profit_split, keep_in_company } = req.body;

  try {
    const event = db.prepare("SELECT * FROM events WHERE id = ?").get(event_id);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    const settleTransaction = db.transaction(() => {
      let remaining = event.total_income;
      const log = [];

      // 1. Debt Liquidation: Settle selected pending company debts
      if (debt_ids && debt_ids.length > 0) {
        for (const debtId of debt_ids) {
          const debt = db.prepare("SELECT * FROM debts WHERE id = ? AND status = 'pending'").get(debtId);
          if (debt) {
            db.prepare("UPDATE debts SET status = 'cleared', related_event_id = ? WHERE id = ?").run(event_id, debtId);
            db.prepare("INSERT INTO payments (debt_id, event_id, amount, paid_to, description) VALUES (?, ?, ?, ?, ?)").run(
              debtId, event_id, debt.amount, debt.partner_name, `Settled from event: ${event.event_name}`
            );
            remaining -= debt.amount;
            log.push(`Paid ${debt.amount} to ${debt.partner_name}`);
          }
        }
      }

      // 2. Extra Costs: Deduct any additional expenses identified during settlement
      if (extra_expenses && extra_expenses.length > 0) {
        for (const exp of extra_expenses) {
          db.prepare(
            "INSERT INTO expenses (amount, paid_by, category, description, day_type, event_id, event_name, date, status) VALUES (?, 'company', ?, ?, 'work_day', ?, ?, ?, 'paid')"
          ).run(exp.amount, exp.category || 'other', exp.description || 'Extra expense', event_id, event.event_name, event.date || new Date().toISOString().split('T')[0]);
          remaining -= exp.amount;
          log.push(`Extra expense: ${exp.amount} (${exp.category})`);
        }
      }

      // 3. Profit Distribution: Calculate shares for partners
      if (remaining > 0 && !keep_in_company) {
        const split = profit_split || 50;
        const moemenShare = remaining * (split / 100);
        const abdShare = remaining * ((100 - split) / 100);

        log.push(`Profit split: Moemen $${moemenShare.toFixed(2)}, Abd $${abdShare.toFixed(2)}`);

        // UPDATE INCOME RECORD WITH SMART SHARES
        db.prepare(`
          UPDATE income SET 
            final_profit = ?, 
            moemen_share = ?, 
            abd_share = ?, 
            notes = COALESCE(notes, '') || ?
          WHERE event_id = ?
        `).run(
          remaining, moemenShare, abdShare, 
          ` | Settled: Moemen $${moemenShare.toFixed(2)}, Abd $${abdShare.toFixed(2)}`,
          event_id
        );
      }

      return { remaining, log };
    });

    const result = settleTransaction();
    res.json({ success: true, ...result, message: 'Settlement completed' });
  } catch (err) {
    res.status(500).json({ error: 'Settlement failed', details: err.message });
  }
};

/**
 * SMART INCOME (UNIFIED SYSTEM)
 * -----------------------------
 * The primary entry point for modern revenue recording. Supports debt 
 * deductions and creates audit-ready income records.
 */
exports.addSmartIncome = (req, res) => {
  const { amount, source, event_id, event_name, date, time, debt_payments, notes } = req.body;

  try {
    const smartIncomeTransaction = db.transaction(() => {
      let finalEventId = event_id;
      let finalEventName = event_name;

      // Ensure every income record is linked to an event object
      if (source !== 'Event' || !event_id || event_id === 'other_event') {
         finalEventName = (source === 'Event' && event_id === 'other_event') ? event_name : `${source} Income - ${notes || date}`;
         const evt = db.prepare(
           "INSERT INTO events (event_name, date, location, total_income, status) VALUES (?, ?, '', ?, 'completed')"
         ).run(finalEventName, date, amount);
         finalEventId = evt.lastInsertRowid;
      }

      let debtsClearedStr = '';
      let totalDebtsPaid = 0;

      // 1. Partial/Full Debt Settlement
      if (debt_payments && debt_payments.length > 0) {
        let clearedNames = [];
        for (const payment of debt_payments) {
          const { debt_id, payment_amount } = payment;
          const debt = db.prepare("SELECT * FROM debts WHERE id = ? AND status = 'pending'").get(debt_id);
          if (debt && payment_amount > 0) {
            const amountToPay = Math.min(debt.amount, payment_amount);
            const remaining = debt.amount - amountToPay;
            
            if (remaining <= 0) {
              db.prepare("UPDATE debts SET status = 'cleared', amount = 0, related_event_id = ? WHERE id = ?").run(finalEventId, debt_id);
            } else {
              db.prepare("UPDATE debts SET amount = ?, related_event_id = ? WHERE id = ?").run(remaining, finalEventId, debt_id);
            }

            db.prepare("INSERT INTO payments (debt_id, event_id, amount, paid_to, paid_to_real_name, description) VALUES (?, ?, ?, ?, ?, ?)").run(
              debt_id, finalEventId, amountToPay, debt.partner_name, debt.partner_real_name, `Settled from Income: ${finalEventName}`
            );

            // Audit Trail
            const payerName = debt.partner_name === 'others' ? debt.partner_real_name : (debt.partner_name.charAt(0).toUpperCase() + debt.partner_name.slice(1));
            const expenseDetail = db.prepare("SELECT description FROM expenses WHERE id = ?").get(debt.related_expense_id);
            const reasonText = expenseDetail ? expenseDetail.description : 'previous expense';
            
            const h3Text = `Debt Paid from Income`;
            const mainText = `$${amountToPay} paid to ${payerName} from ${finalEventName} income for ${reasonText} expense`;
            logAction(req.body.admin_name, 'Finance', 'Debt Payment Completed', h3Text, mainText, amountToPay, finalEventName);

            totalDebtsPaid += amountToPay;
            clearedNames.push(`${payerName}($${amountToPay})`);
          }
        }
        if (clearedNames.length > 0) debtsClearedStr = clearedNames.join(', ');
      }

      const final_profit = amount - totalDebtsPaid;

      // 2. Final Income Record Persistence
      db.prepare(
        `INSERT INTO income (event_id, amount, source, date, notes, original_profit, debts_cleared, final_profit) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(finalEventId, amount, source, date, notes || '', amount, debtsClearedStr || 'None', final_profit);

      // 3. System Logging
      logAction(req.body.admin_name, 'Finance', 'New Income Added', `${source} Income — $${amount}`, `Income received from ${source} for ${finalEventName}. ${clearedNames.length > 0 ? 'Debts paid to: ' + debtsClearedStr : ''}`, amount, finalEventName);

      return { finalEventId, totalDebtsPaid, final_profit };
    });

    const result = smartIncomeTransaction();
    res.status(201).json({ success: true, message: 'Smart Income recorded successfully', ...result });
  } catch (err) {
    res.status(500).json({ error: 'Smart Income failed', details: err.message });
  }
};

/**
 * GET ALL INCOME RECORDS
 * ----------------------
 * Returns all income records joined with event names for the finance table.
 */
exports.getAllIncomeRecords = (req, res) => {
  try {
    const records = db.prepare(`
      SELECT i.*, e.event_name 
      FROM income i 
      LEFT JOIN events e ON i.event_id = e.id 
      ORDER BY i.date DESC, i.id DESC
    `).all();
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch income records', details: err.message });
  }
};

/**
 * ============================================================
 * DEBT MANAGEMENT
 * ============================================================
 */

/**
 * GET ALL PENDING DEBTS
 * ---------------------
 * Lists all debts the company owes to partners.
 */
exports.getDebts = (req, res) => {
  try {
    const debts = db.prepare("SELECT d.*, e.event_name FROM debts d LEFT JOIN events e ON d.related_event_id = e.id WHERE d.status = 'pending' ORDER BY d.created_at DESC").all();
    res.json(debts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch debts', details: err.message });
  }
};

/**
 * SETTLE SINGLE DEBT
 * ------------------
 * Manually marks a debt as settled.
 */
exports.settleDebt = (req, res) => {
  const id = req.params.id;
  const { event_id } = req.body;

  try {
    const debt = db.prepare("SELECT * FROM debts WHERE id = ?").get(id);
    if (!debt) return res.status(404).json({ error: 'Debt not found' });

    const settleTransaction = db.transaction(() => {
      db.prepare("UPDATE debts SET status = 'cleared', related_event_id = COALESCE(?, related_event_id) WHERE id = ?").run(event_id || null, id);
      db.prepare("INSERT INTO payments (debt_id, event_id, amount, paid_to, description) VALUES (?, ?, ?, ?, ?)").run(
        id, event_id || null, debt.amount, debt.partner_name, `Manual settlement`
      );
      db.prepare("INSERT INTO archive_financials (original_id, table_name, data, archive_type) VALUES (?, 'debts', ?, 'paid')").run(
        id, JSON.stringify(debt)
      );
    });

    settleTransaction();
    res.json({ success: true, message: `Debt of $${debt.amount} to ${debt.partner_name} settled` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to settle debt', details: err.message });
  }
};

/**
 * ============================================================
 * FINANCE LOGS & AUDITING
 * ============================================================
 */

/**
 * ADD FINANCE LOG
 * ---------------
 * Generic logging for unified financial history.
 */
exports.addFinanceLog = (req, res) => {
  const { type, person, total, details, date } = req.body;
  if (!type || !person || total === undefined || !details) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const result = db.prepare(
      "INSERT INTO finance_logs (type, person, total, details, date) VALUES (?, ?, ?, ?, ?)"
    ).run(type, person, total, JSON.stringify(details), date || new Date().toISOString().split('T')[0]);
    
    res.status(201).json({ success: true, id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: 'Failed to record finance log', details: err.message });
  }
};

/**
 * GET ALL FINANCE LOGS
 * --------------------
 */
exports.getFinanceLogs = (req, res) => {
  try {
    const logs = db.prepare("SELECT * FROM finance_logs ORDER BY date DESC, id DESC").all();
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch finance logs', details: err.message });
  }
};

/**
 * DELETE FINANCE LOG
 * ------------------
 */
exports.deleteFinanceLog = (req, res) => {
  try {
    db.prepare("DELETE FROM finance_logs WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete log', details: err.message });
  }
};

/**
 * GET SYSTEM AUDIT LOGS
 * ---------------------
 */
exports.getAuditLogs = (req, res) => {
  try {
    const logs = db.prepare("SELECT * FROM audit_logs ORDER BY date DESC, time DESC, id DESC").all();
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch audit logs', details: err.message });
  }
};

/**
 * ============================================================
 * ANALYTICS & STATISTICS
 * ============================================================
 */

/**
 * GET FINANCE STATS
 * -----------------
 * Aggregates financial data for dashboard visualization (Charts, Summary cards).
 */
exports.getFinanceStats = (req, res) => {
  try {
    // Partner Debts
    const moemenDebt = db.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM debts WHERE partner_name = 'moemen' AND status = 'pending'").get();
    const abdDebt = db.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM debts WHERE partner_name = 'abd' AND status = 'pending'").get();

    // Global Income vs Expenses
    const totalIncome = db.prepare("SELECT COALESCE(SUM(total_income), 0) as total FROM events WHERE status != 'cancelled' AND status != 'archived'").get();
    const totalExpenses = db.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE status != 'archived'").get();

    // Personal Spending breakdown
    const moemenExpenses = db.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE paid_by = 'moemen' AND status != 'archived'").get();
    const abdExpenses = db.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE paid_by = 'abd' AND status != 'archived'").get();

    // Operational metrics
    const activeEvents = db.prepare("SELECT COUNT(*) as count FROM events WHERE status IN ('pending', 'confirmed')").get();

    // Categorical breakdown
    const categories = db.prepare("SELECT category, SUM(amount) as value FROM expenses WHERE status != 'archived' GROUP BY category").all();

    // Monthly Trends
    const monthlyData = db.prepare(`
      SELECT strftime('%Y-%m', date) as month, SUM(total_income) as income
      FROM events WHERE status = 'completed'
      GROUP BY strftime('%Y-%m', date) ORDER BY month DESC LIMIT 6
    `).all();

    res.json({
      moemenDebt: moemenDebt.total,
      abdDebt: abdDebt.total,
      totalIncome: totalIncome.total,
      totalExpenses: totalExpenses.total,
      moemenExpenses: moemenExpenses.total,
      abdExpenses: abdExpenses.total,
      netProfit: totalIncome.total - totalExpenses.total,
      activeEvents: activeEvents.count,
      categoryChart: categories,
      monthlyChart: monthlyData
    });
  } catch (err) {
    console.error('Finance stats error:', err);
    res.status(500).json({ error: 'Failed to fetch stats', details: err.message });
  }
};

