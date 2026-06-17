const db = require('../config/db');
const { logAction } = require('../utils/logger');

exports.addExpense = async (req, res) => {
  const { amount, paid_by, paid_by_name, category, description, day_type, event_id, event_name, date, time, admin_name } = req.body;
  if (!description) return res.status(400).json({ error: 'Description is required' });

  try {
    const addExpenseTransaction = db.transaction(async () => {
      const result = await db.prepare(
        "INSERT INTO expenses (amount, paid_by, paid_by_name, category, description, day_type, event_id, event_name, date, time, admin_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
      ).run(amount, paid_by, paid_by_name || null, category, description, day_type || 'work_day', event_id || null, event_name || '', date || new Date().toISOString().split('T')[0], time || new Date().toTimeString().split(' ')[0], admin_name || 'System');

      if (paid_by === 'moemen' || paid_by === 'abd' || paid_by === 'others') {
        await db.prepare(
          "INSERT INTO debts (partner_name, partner_real_name, amount, type, related_expense_id, related_event_id) VALUES (?, ?, ?, 'debt_to_partner', ?, ?)"
        ).run(paid_by, paid_by_name || null, amount, result.lastInsertRowid, event_id || null);
      }

      const payerName = paid_by === 'others' ? paid_by_name : (paid_by.charAt(0).toUpperCase() + paid_by.slice(1));
      const h3Text = paid_by === 'company' ? `Company Paid Expense — $${amount}` : `${payerName} — Company Debt $${amount}`;
      const mainText = paid_by === 'company' ? `Company paid ${description} directly` : `${payerName} paid $${amount} for ${description} and this amount became a company debt`;
      const finalAdminName = req.adminName || admin_name || 'System';
      logAction(finalAdminName, 'Finance', 'Input Expense', h3Text, mainText, amount, event_name || 'General');

      return result.lastInsertRowid;
    });

    const id = await addExpenseTransaction();
    res.status(201).json({ success: true, id, message: 'Expense recorded' + (paid_by !== 'company' ? ' + debt tracked' : '') });
  } catch (err) {
    res.status(500).json({ error: 'Failed to record expense', details: err.message });
  }
};

exports.getExpenses = async (req, res) => {
  try {
    const expenses = await db.prepare("SELECT * FROM expenses WHERE status != 'archived' ORDER BY date DESC, created_at DESC").all();
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch expenses', details: err.message });
  }
};

exports.updateExpense = async (req, res) => {
  const { amount, paid_by, paid_by_name, category, description, day_type, event_id, event_name, date } = req.body;
  try {
    const original = await db.prepare("SELECT * FROM expenses WHERE id = ?").get(req.params.id);
    if (!original) return res.status(404).json({ error: 'Expense not found' });

    const updateTx = db.transaction(async () => {
      await db.prepare(`
        UPDATE expenses SET
          amount = COALESCE(?, amount), paid_by = COALESCE(?, paid_by),
          paid_by_name = COALESCE(?, paid_by_name), category = COALESCE(?, category),
          description = COALESCE(?, description), day_type = COALESCE(?, day_type),
          event_id = COALESCE(?, event_id), event_name = COALESCE(?, event_name),
          date = COALESCE(?, date)
        WHERE id = ?
      `).run(amount, paid_by, paid_by_name, category, description, day_type, event_id, event_name, date, req.params.id);

      const newAmount = amount !== undefined ? amount : original.amount;
      const newPaidBy = paid_by !== undefined ? paid_by : original.paid_by;
      const newPaidByName = paid_by_name !== undefined ? paid_by_name : original.paid_by_name;
      const newEventId = event_id !== undefined ? event_id : original.event_id;

      const existingDebt = await db.prepare("SELECT * FROM debts WHERE related_expense_id = ?").get(req.params.id);
      const isPartnerPayer = (newPaidBy === 'moemen' || newPaidBy === 'abd' || newPaidBy === 'others');

      if (existingDebt) {
        if (newPaidBy === 'company') {
          await db.prepare("DELETE FROM debts WHERE id = ?").run(existingDebt.id);
        } else {
          await db.prepare("UPDATE debts SET partner_name = ?, partner_real_name = ?, amount = ?, related_event_id = ? WHERE id = ?")
            .run(newPaidBy, newPaidByName || null, newAmount, newEventId || null, existingDebt.id);
        }
      } else if (isPartnerPayer) {
        await db.prepare("INSERT INTO debts (partner_name, partner_real_name, amount, type, related_expense_id, related_event_id) VALUES (?, ?, ?, 'debt_to_partner', ?, ?)")
          .run(newPaidBy, newPaidByName || null, newAmount, req.params.id, newEventId || null);
      }
    });

    await updateTx();

    const finalAmount = amount !== undefined ? amount : original.amount;
    const finalDescription = description !== undefined ? description : original.description;
    const finalEventName = event_name !== undefined ? event_name : original.event_name;
    const adminName = req.adminName || req.body.admin_name || 'Admin';
    logAction(adminName, 'Finance', 'Expense Updated', `Record Updated — $${finalAmount || 0}`, `Expense updated: ${finalDescription || 'Unknown'}`, finalAmount || 0, finalEventName || 'General');

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.markExpensePaid = async (req, res) => {
  const { event_id, admin_name } = req.body;
  try {
    const expense = await db.prepare("SELECT * FROM expenses WHERE id = ?").get(req.params.id);
    if (!expense) return res.status(404).json({ error: 'Expense not found' });

    const markPaidTransaction = db.transaction(async () => {
      await db.prepare("UPDATE expenses SET status = 'paid', confirmed_by_admin = ?, confirmed_at = ? WHERE id = ?")
        .run(admin_name || 'System', new Date().toISOString(), req.params.id);

      if (expense.paid_by !== 'company') {
        const debt = await db.prepare("SELECT * FROM debts WHERE related_expense_id = ? AND status = 'pending'").get(req.params.id);
        if (debt) {
          await db.prepare("UPDATE debts SET status = 'cleared', related_event_id = COALESCE(?, related_event_id) WHERE id = ?").run(event_id || null, debt.id);
          await db.prepare("INSERT INTO payments (debt_id, event_id, amount, paid_to, paid_to_real_name, description) VALUES (?, ?, ?, ?, ?, ?)")
            .run(debt.id, event_id || null, expense.amount, expense.paid_by, expense.paid_by_name || null, `Payment for: ${expense.description}`);
        }
      }

      const payer = expense.paid_by === 'company' ? 'Company' : (expense.paid_by.charAt(0).toUpperCase() + expense.paid_by.slice(1));
      const finalAdminName = req.adminName || admin_name || 'System';
      logAction(finalAdminName, 'Finance', 'Expense Marked as Paid', `Expense Paid — ${payer}`, `Company paid back $${expense.amount} to ${payer} for ${expense.description}`, expense.amount, expense.event_name || 'General');
    });

    await markPaidTransaction();
    res.json({ success: true, message: `Expense marked as paid${expense.paid_by !== 'company' ? ` - debt to ${expense.paid_by} cleared` : ''}` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark as paid', details: err.message });
  }
};

exports.deleteExpense = async (req, res) => {
  try {
    const expense = await db.prepare("SELECT * FROM expenses WHERE id = ?").get(req.params.id);
    if (!expense) return res.status(404).json({ error: 'Expense not found' });

    const archiveTransaction = db.transaction(async () => {
      await db.prepare("INSERT INTO archive_financials (original_id, table_name, data, archive_type) VALUES (?, 'expenses', ?, 'deleted')")
        .run(expense.id, JSON.stringify(expense));
      await db.prepare("UPDATE expenses SET status = 'archived' WHERE id = ?").run(req.params.id);
      await db.prepare("UPDATE debts SET status = 'cleared' WHERE related_expense_id = ?").run(req.params.id);
    });

    await archiveTransaction();
    res.json({ success: true, message: 'Expense archived' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to archive expense', details: err.message });
  }
};

exports.addIncome = async (req, res) => {
  const { event_name, date, location, amount, rating, manager_name, notes } = req.body;
  if (!event_name) return res.status(400).json({ error: 'Event name is required' });

  try {
    const addIncomeTransaction = db.transaction(async () => {
      const eventResult = await db.prepare(
        "INSERT INTO events (event_name, date, location, total_income, rating, manager_name, notes, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'completed')"
      ).run(event_name, date || new Date().toISOString().split('T')[0], location || '', amount || 0, rating || 0, manager_name || '', notes || '');

      await db.prepare("INSERT INTO income (event_id, amount, date, notes) VALUES (?, ?, ?, ?)")
        .run(eventResult.lastInsertRowid, amount || 0, date || new Date().toISOString().split('T')[0], notes || '');

      return eventResult.lastInsertRowid;
    });

    const eventId = await addIncomeTransaction();
    res.status(201).json({ success: true, event_id: eventId, message: 'Income recorded' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to record income', details: err.message });
  }
};

exports.settleFromEvent = async (req, res) => {
  const { event_id, debt_ids, extra_expenses, profit_split, keep_in_company } = req.body;

  try {
    const event = await db.prepare("SELECT * FROM events WHERE id = ?").get(event_id);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    const settleTransaction = db.transaction(async () => {
      let eventIncome = parseFloat(event.total_income) || 0;
      if (eventIncome === 0) {
        const incomeSum = await db.prepare("SELECT SUM(amount) as total FROM income WHERE event_id = ?").get(event_id);
        if (incomeSum && incomeSum.total > 0) eventIncome = parseFloat(incomeSum.total);
      }
      let remaining = eventIncome;
      const log = [];

      if (debt_ids && debt_ids.length > 0) {
        for (const debtId of debt_ids) {
          const debt = await db.prepare("SELECT * FROM debts WHERE id = ? AND status = 'pending'").get(debtId);
          if (debt) {
            await db.prepare("UPDATE debts SET status = 'cleared', related_event_id = ? WHERE id = ?").run(event_id, debtId);
            await db.prepare("INSERT INTO payments (debt_id, event_id, amount, paid_to, description) VALUES (?, ?, ?, ?, ?)")
              .run(debtId, event_id, debt.amount, debt.partner_name, `Settled from event: ${event.event_name}`);
            remaining -= parseFloat(debt.amount);
            log.push(`Paid ${debt.amount} to ${debt.partner_name}`);
          }
        }
      }

      if (extra_expenses && extra_expenses.length > 0) {
        for (const exp of extra_expenses) {
          await db.prepare("INSERT INTO expenses (amount, paid_by, category, description, day_type, event_id, event_name, date, status) VALUES (?, 'company', ?, ?, 'work_day', ?, ?, ?, 'paid')")
            .run(exp.amount, exp.category || 'other', exp.description || 'Extra expense', event_id, event.event_name, event.date || new Date().toISOString().split('T')[0]);
          remaining -= parseFloat(exp.amount);
          log.push(`Extra expense: ${exp.amount} (${exp.category})`);
        }
      }

      if (remaining > 0 && !keep_in_company) {
        const split = profit_split || 50;
        const moemenShare = remaining * (split / 100);
        const abdShare = remaining * ((100 - split) / 100);
        log.push(`Profit split: Moemen $${moemenShare.toFixed(2)}, Abd $${abdShare.toFixed(2)}`);
        await db.prepare("UPDATE income SET final_profit = ?, moemen_share = ?, abd_share = ?, notes = COALESCE(notes, '') || ? WHERE event_id = ?")
          .run(remaining, moemenShare, abdShare, ` | Settled: Moemen $${moemenShare.toFixed(2)}, Abd $${abdShare.toFixed(2)}`, event_id);
      }

      return { remaining, log };
    });

    const result = await settleTransaction();
    const adminName = req.adminName || req.body.admin_name || 'Admin';
    if (result.log && result.log.length > 0) {
      logAction(adminName, 'Finance', 'Settle Event', `Event Settled: ${event.event_name}`, `Settlement complete. Logs: ${result.log.join(', ')}`, parseFloat(event.total_income) || 0, event.event_name);
    }

    res.json({ success: true, ...result, message: 'Settlement completed' });
  } catch (err) {
    res.status(500).json({ error: 'Settlement failed', details: err.message });
  }
};

exports.addSmartIncome = async (req, res) => {
  const { amount, source, event_id, event_name, date, time, debt_payments, notes } = req.body;

  try {
    const smartIncomeTransaction = db.transaction(async () => {
      let finalEventId = event_id;
      let finalEventName = event_name;

      if (source !== 'Event' || !event_id || event_id === 'other_event') {
        finalEventName = (source === 'Event' && event_id === 'other_event') ? event_name : `${source} Income - ${notes || date}`;
        const evt = await db.prepare("INSERT INTO events (event_name, date, location, total_income, status) VALUES (?, ?, '', ?, 'completed')")
          .run(finalEventName, date, amount);
        finalEventId = evt.lastInsertRowid;
      }

      let debtsClearedStr = '';
      let totalDebtsPaid = 0;

      if (debt_payments && debt_payments.length > 0) {
        const clearedNames = [];
        for (const payment of debt_payments) {
          const { debt_id, payment_amount } = payment;
          const debt = await db.prepare("SELECT * FROM debts WHERE id = ? AND status = 'pending'").get(debt_id);
          if (debt && payment_amount > 0) {
            const amountToPay = Math.min(parseFloat(debt.amount), parseFloat(payment_amount));
            const remaining = parseFloat(debt.amount) - amountToPay;

            if (remaining <= 0) {
              await db.prepare("UPDATE debts SET status = 'cleared', amount = 0, related_event_id = ? WHERE id = ?").run(finalEventId, debt_id);
            } else {
              await db.prepare("UPDATE debts SET amount = ?, related_event_id = ? WHERE id = ?").run(remaining, finalEventId, debt_id);
            }

            await db.prepare("INSERT INTO payments (debt_id, event_id, amount, paid_to, paid_to_real_name, description) VALUES (?, ?, ?, ?, ?, ?)")
              .run(debt_id, finalEventId, amountToPay, debt.partner_name, debt.partner_real_name, `Settled from Income: ${finalEventName}`);

            const payerName = debt.partner_name === 'others' ? debt.partner_real_name : (debt.partner_name.charAt(0).toUpperCase() + debt.partner_name.slice(1));
            const expenseDetail = await db.prepare("SELECT description FROM expenses WHERE id = ?").get(debt.related_expense_id);
            const reasonText = expenseDetail ? expenseDetail.description : 'previous expense';
            const adminName = req.adminName || req.body.admin_name || 'Admin';
            logAction(adminName, 'Finance', 'Debt Payment Completed', 'Debt Paid from Income', `$${amountToPay} paid to ${payerName} from ${finalEventName} income for ${reasonText}`, amountToPay, finalEventName);

            totalDebtsPaid += amountToPay;
            clearedNames.push(`${payerName}($${amountToPay})`);
          }
        }
        if (clearedNames.length > 0) debtsClearedStr = clearedNames.join(', ');
      }

      const final_profit = parseFloat(amount) - totalDebtsPaid;

      await db.prepare("INSERT INTO income (event_id, amount, source, date, notes, original_profit, debts_cleared, final_profit) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
        .run(finalEventId, amount, source, date, notes || '', amount, debtsClearedStr || 'None', final_profit);

      const adminName = req.adminName || req.body.admin_name || 'Admin';
      logAction(adminName, 'Finance', 'New Income Added', `${source} Income — $${amount}`, `Income received from ${source} for ${finalEventName}.`, amount, finalEventName);

      return { finalEventId, totalDebtsPaid, final_profit };
    });

    const result = await smartIncomeTransaction();
    res.status(201).json({ success: true, message: 'Smart Income recorded successfully', ...result });
  } catch (err) {
    res.status(500).json({ error: 'Smart Income failed', details: err.message });
  }
};

exports.getAllIncomeRecords = async (req, res) => {
  try {
    const records = await db.prepare("SELECT i.*, e.event_name FROM income i LEFT JOIN events e ON i.event_id = e.id ORDER BY i.date DESC, i.id DESC").all();
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch income records', details: err.message });
  }
};

exports.getDebts = async (req, res) => {
  try {
    const debts = await db.prepare("SELECT d.*, e.event_name FROM debts d LEFT JOIN events e ON d.related_event_id = e.id WHERE d.status = 'pending' ORDER BY d.created_at DESC").all();
    res.json(debts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch debts', details: err.message });
  }
};

exports.settleDebt = async (req, res) => {
  const id = req.params.id;
  const { event_id } = req.body;

  try {
    const debt = await db.prepare("SELECT * FROM debts WHERE id = ?").get(id);
    if (!debt) return res.status(404).json({ error: 'Debt not found' });

    const settleTransaction = db.transaction(async () => {
      await db.prepare("UPDATE debts SET status = 'cleared', related_event_id = COALESCE(?, related_event_id) WHERE id = ?").run(event_id || null, id);
      await db.prepare("INSERT INTO payments (debt_id, event_id, amount, paid_to, description) VALUES (?, ?, ?, ?, 'Manual settlement')")
        .run(id, event_id || null, debt.amount, debt.partner_name);
      await db.prepare("INSERT INTO archive_financials (original_id, table_name, data, archive_type) VALUES (?, 'debts', ?, 'paid')")
        .run(id, JSON.stringify(debt));
    });

    await settleTransaction();
    res.json({ success: true, message: `Debt of $${debt.amount} to ${debt.partner_name} settled` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to settle debt', details: err.message });
  }
};

exports.addFinanceLog = async (req, res) => {
  const { type, person, total, details, date } = req.body;
  if (!type || !person || total === undefined || !details) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    const result = await db.prepare("INSERT INTO finance_logs (type, person, total, details, date) VALUES (?, ?, ?, ?, ?)")
      .run(type, person, total, JSON.stringify(details), date || new Date().toISOString().split('T')[0]);
    res.status(201).json({ success: true, id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: 'Failed to record finance log', details: err.message });
  }
};

exports.getFinanceLogs = async (req, res) => {
  try {
    const logs = await db.prepare("SELECT * FROM finance_logs ORDER BY date DESC, id DESC").all();
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch finance logs', details: err.message });
  }
};

exports.deleteFinanceLog = async (req, res) => {
  try {
    await db.prepare("DELETE FROM finance_logs WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete log', details: err.message });
  }
};

exports.getAuditLogs = async (req, res) => {
  try {
    const logs = await db.prepare("SELECT * FROM audit_logs ORDER BY date DESC, time DESC, id DESC").all();
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch audit logs', details: err.message });
  }
};

exports.getFinanceStats = async (req, res) => {
  try {
    const moemenDebt = await db.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM debts WHERE partner_name = 'moemen' AND status = 'pending'").get();
    const abdDebt = await db.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM debts WHERE partner_name = 'abd' AND status = 'pending'").get();
    const totalIncome = await db.prepare("SELECT COALESCE(SUM(total_income), 0) as total FROM events WHERE status != 'cancelled' AND status != 'archived'").get();
    const totalExpenses = await db.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE status != 'archived'").get();
    const moemenExpenses = await db.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE paid_by = 'moemen' AND status != 'archived'").get();
    const abdExpenses = await db.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE paid_by = 'abd' AND status != 'archived'").get();
    const activeEvents = await db.prepare("SELECT COUNT(*) as count FROM events WHERE status IN ('pending', 'confirmed')").get();
    const categories = await db.prepare("SELECT category, SUM(amount) as value FROM expenses WHERE status != 'archived' GROUP BY category").all();
    const monthlyData = await db.prepare("SELECT TO_CHAR(date::date, 'YYYY-MM') as month, SUM(total_income) as income FROM events WHERE status = 'completed' GROUP BY TO_CHAR(date::date, 'YYYY-MM') ORDER BY month DESC LIMIT 6").all();

    res.json({
      moemenDebt: parseFloat(moemenDebt.total),
      abdDebt: parseFloat(abdDebt.total),
      totalIncome: parseFloat(totalIncome.total),
      totalExpenses: parseFloat(totalExpenses.total),
      moemenExpenses: parseFloat(moemenExpenses.total),
      abdExpenses: parseFloat(abdExpenses.total),
      netProfit: parseFloat(totalIncome.total) - parseFloat(totalExpenses.total),
      activeEvents: parseInt(activeEvents.count),
      categoryChart: categories,
      monthlyChart: monthlyData
    });
  } catch (err) {
    console.error('Finance stats error:', err);
    res.status(500).json({ error: 'Failed to fetch stats', details: err.message });
  }
};
