const db = require('../config/db');

const getDateRange = (period, from, to) => {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  switch (period) {
    case 'today':  return { startDate: todayStr, endDate: todayStr };
    case 'week': {
      const d = new Date(now); d.setDate(d.getDate() - 6);
      return { startDate: d.toISOString().split('T')[0], endDate: todayStr };
    }
    case 'month':
      return { startDate: `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-01`, endDate: todayStr };
    case 'year':
      return { startDate: `${now.getFullYear()}-01-01`, endDate: todayStr };
    case 'custom':
      return { startDate: from || '2000-01-01', endDate: to || todayStr };
    default:
      return { startDate: '2000-01-01', endDate: todayStr };
  }
};

exports.getDashboard = async (req, res) => {
  try {
    const { period = 'all', from, to } = req.query;
    const { startDate, endDate } = getDateRange(period, from, to);

    const [
      totalIncome, totalExpenses,
      upcomingEvents, statusCounts,
      latestExpenses, latestIncome,
      debtsPerPerson, monthlyChart, categoryChart, shares,
      auditCounts
    ] = await Promise.all([
      db.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM income WHERE date >= ? AND date <= ?").get(startDate, endDate),
      db.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE status != 'archived' AND date >= ? AND date <= ?").get(startDate, endDate),
      db.prepare("SELECT * FROM events WHERE status = 'pending' ORDER BY date ASC LIMIT 5").all(),
      db.prepare("SELECT status, COUNT(*) as count FROM events WHERE status != 'archived' GROUP BY status").all(),
      db.prepare("SELECT * FROM expenses WHERE status != 'archived' AND date >= ? AND date <= ? ORDER BY date DESC, time DESC LIMIT 5").all(startDate, endDate),
      db.prepare("SELECT i.*, e.event_name FROM income i LEFT JOIN events e ON i.event_id = e.id WHERE i.date >= ? AND i.date <= ? ORDER BY i.date DESC, i.id DESC LIMIT 5").all(startDate, endDate),
      db.prepare(`
        SELECT CASE WHEN partner_name = 'others' THEN partner_real_name ELSE partner_name END as name,
          SUM(amount) as total
        FROM debts WHERE status = 'pending'
        GROUP BY name ORDER BY total DESC
      `).all(),
      db.prepare(`
        SELECT TO_CHAR(date::date, 'YYYY-MM') as month, SUM(amount) as income
        FROM income GROUP BY month ORDER BY month DESC LIMIT 6
      `).all(),
      db.prepare("SELECT category, SUM(amount) as value FROM expenses WHERE status != 'archived' AND date >= ? AND date <= ? GROUP BY category").all(startDate, endDate),
      db.prepare("SELECT SUM(moemen_share) as moemen, SUM(abd_share) as abd FROM income WHERE date >= ? AND date <= ?").get(startDate, endDate),
      db.prepare(`
        SELECT
          SUM(CASE WHEN action_type ILIKE '%creat%' OR action_type ILIKE '%add%' OR action_type ILIKE '%new%' THEN 1 ELSE 0 END) as creates,
          SUM(CASE WHEN action_type ILIKE '%updat%' THEN 1 ELSE 0 END) as updates,
          SUM(CASE WHEN action_type ILIKE '%delet%' OR action_type ILIKE '%archiv%' OR action_type ILIKE '%cancel%' THEN 1 ELSE 0 END) as deletes,
          COUNT(*) as total
        FROM audit_logs WHERE date >= ? AND date <= ?
      `).get(startDate, endDate),
    ]);

    const tIncome = parseFloat(totalIncome.total);
    const tExpenses = parseFloat(totalExpenses.total);
    const totalProfit = tIncome - tExpenses;
    const financeStatus = totalProfit > 1000 ? 'Good' : (totalProfit > 0 ? 'Medium' : 'Risk');

    const insights = [];
    if (tExpenses > tIncome) {
      insights.push("⚠️ Expenses exceed income in this period. Review operational costs.");
    } else {
      insights.push("✅ Company is profitable in this period.");
    }
    if (debtsPerPerson.length > 0) insights.push(`💸 There are ${debtsPerPerson.length} people with outstanding debts.`);
    const topExpenseCategory = [...categoryChart].sort((a, b) => parseFloat(b.value) - parseFloat(a.value))[0];
    if (topExpenseCategory) insights.push(`📊 Highest expense: ${topExpenseCategory.category} ($${parseFloat(topExpenseCategory.value).toFixed(0)})`);
    if (shares && (parseFloat(shares.moemen) > 0 || parseFloat(shares.abd) > 0)) {
      insights.push(`💰 Partner Payouts: Moemen $${parseFloat(shares.moemen || 0).toFixed(2)} | Abd $${parseFloat(shares.abd || 0).toFixed(2)}`);
    }

    res.json({
      revenue: tIncome,
      expenses: tExpenses,
      profitAll: totalProfit,
      partnerShares: shares,
      upcomingEvents, statusCounts,
      latestExpenses, latestIncome, debtsPerPerson,
      monthlyChart: monthlyChart.reverse(), categoryChart,
      financeStatus,
      eventsStatus: upcomingEvents.length > 0 ? 'Healthy' : 'Quiet',
      operationsStatus: 'Active',
      aiInsights: insights,
      auditCounts: {
        creates: parseInt(auditCounts?.creates || 0),
        updates: parseInt(auditCounts?.updates || 0),
        deletes: parseInt(auditCounts?.deletes || 0),
        total: parseInt(auditCounts?.total || 0),
      },
      period, startDate, endDate,
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.chatAI = async (req, res) => {
  const { message } = req.body;
  const msg = message.toLowerCase();
  try {
    let reply = "I'm analyzing your data... ";
    if (msg.includes('وضع') || msg.includes('status') || msg.includes('الشركة')) {
      const profit = await db.prepare("SELECT (SELECT COALESCE(SUM(amount),0) FROM income) - (SELECT COALESCE(SUM(amount),0) FROM expenses WHERE status != 'archived') as profit").get();
      const totalProfit = profit && profit.profit !== null ? parseFloat(profit.profit) : 0;
      reply = `الوضع المالي: ${totalProfit >= 0 ? 'جيد ومربح' : 'يحتاج مراجعة'}. صافي الربح: $${totalProfit}.`;
    } else if (msg.includes('دين') || msg.includes('debt') || msg.includes('ديون')) {
      const totalDebt = await db.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM debts WHERE status = 'pending'").get();
      const personDebts = await db.prepare("SELECT partner_name, SUM(amount) as total FROM debts WHERE status = 'pending' GROUP BY partner_name").all();
      const debtList = personDebts.map(d => `${d.partner_name}: $${d.total}`).join(', ');
      reply = `إجمالي الديون: $${totalDebt.total || 0}. التفاصيل: ${debtList || 'لا يوجد ديون'}.`;
    } else if (msg.includes('مصاريف') || msg.includes('expense')) {
      const topExp = await db.prepare("SELECT description, amount FROM expenses WHERE status != 'archived' ORDER BY amount DESC LIMIT 1").get();
      reply = topExp ? `أعلى مصروف: "${topExp.description}" بقيمة $${topExp.amount}.` : 'لا توجد مصاريف مسجلة.';
    } else if (msg.includes('أرباح') || msg.includes('profit')) {
      const income = await db.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM income").get();
      reply = `إجمالي الدخل: $${income.total || 0}.`;
    } else {
      reply = "أنا مساعدك الذكي. يمكنني إخبارك عن الديون، الأرباح، المصاريف، والوضع العام للشركة.";
    }
    res.json({ reply });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};