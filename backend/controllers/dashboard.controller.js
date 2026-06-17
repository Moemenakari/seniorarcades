const db = require('../config/db');

exports.getDashboard = async (req, res) => {
  try {
    const now = new Date();
    const currentMonthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    const currentYearStart = `${now.getFullYear()}-01-01`;

    const [
      totalIncome, monthIncome, yearIncome,
      totalExpenses, monthExpenses, yearExpenses,
      upcomingEvents, statusCounts,
      latestExpenses, latestIncome,
      debtsPerPerson, monthlyChart, categoryChart, shares
    ] = await Promise.all([
      db.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM income").get(),
      db.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM income WHERE date >= ?").get(currentMonthStart),
      db.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM income WHERE date >= ?").get(currentYearStart),
      db.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE status != 'archived'").get(),
      db.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE status != 'archived' AND date >= ?").get(currentMonthStart),
      db.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE status != 'archived' AND date >= ?").get(currentYearStart),
      db.prepare("SELECT * FROM events WHERE status = 'pending' ORDER BY date ASC LIMIT 5").all(),
      db.prepare("SELECT status, COUNT(*) as count FROM events GROUP BY status").all(),
      db.prepare("SELECT * FROM expenses WHERE status != 'archived' ORDER BY date DESC, time DESC LIMIT 5").all(),
      db.prepare("SELECT i.*, e.event_name FROM income i LEFT JOIN events e ON i.event_id = e.id ORDER BY i.date DESC, i.id DESC LIMIT 5").all(),
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
      db.prepare("SELECT category, SUM(amount) as value FROM expenses WHERE status != 'archived' GROUP BY category").all(),
      db.prepare("SELECT SUM(moemen_share) as moemen, SUM(abd_share) as abd FROM income").get(),
    ]);

    const tIncome = parseFloat(totalIncome.total);
    const tExpenses = parseFloat(totalExpenses.total);
    const totalProfit = tIncome - tExpenses;
    const financeStatus = totalProfit > 1000 ? 'Good' : (totalProfit > 0 ? 'Medium' : 'Risk');

    const insights = [];
    if (parseFloat(monthExpenses.total) > parseFloat(monthIncome.total)) {
      insights.push("⚠️ Expenses this month are higher than income. Review operational costs.");
    } else {
      insights.push("✅ Company is currently profitable this month.");
    }
    if (debtsPerPerson.length > 0) insights.push(`💸 There are ${debtsPerPerson.length} people with outstanding debts.`);
    const topExpenseCategory = [...categoryChart].sort((a, b) => b.value - a.value)[0];
    if (topExpenseCategory) insights.push(`📊 Highest expense category is ${topExpenseCategory.category} ($${topExpenseCategory.value}).`);
    if (shares && (parseFloat(shares.moemen) > 0 || parseFloat(shares.abd) > 0)) {
      insights.push(`💰 Partner Payouts: Moemen $${parseFloat(shares.moemen || 0).toFixed(2)} | Abd $${parseFloat(shares.abd || 0).toFixed(2)}`);
    }

    res.json({
      revenue: tIncome,
      monthIncome: parseFloat(monthIncome.total),
      yearIncome: parseFloat(yearIncome.total),
      expenses: tExpenses,
      monthExpenses: parseFloat(monthExpenses.total),
      yearExpenses: parseFloat(yearExpenses.total),
      profitAll: totalProfit,
      profitMonth: parseFloat(monthIncome.total) - parseFloat(monthExpenses.total),
      profitYear: parseFloat(yearIncome.total) - parseFloat(yearExpenses.total),
      partnerShares: shares,
      upcomingEvents, statusCounts,
      latestExpenses, latestIncome, debtsPerPerson,
      monthlyChart: monthlyChart.reverse(), categoryChart,
      financeStatus,
      eventsStatus: upcomingEvents.length > 0 ? 'Healthy' : 'Quiet',
      operationsStatus: 'Active',
      aiInsights: insights
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
