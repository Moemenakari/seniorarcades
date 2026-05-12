/**
 * ============================================================
 * DASHBOARD CONTROLLER
 * ============================================================
 * Final Graduation Project Refactor
 * Purpose: Provides high-level data aggregation for the admin 
 * home screen, including financial KPIs, event summaries, 
 * AI-driven insights, and a simple logic-based chatbot.
 * ============================================================
 */

const db = require('../config/db');

/**
 * GET DASHBOARD OVERVIEW
 * ----------------------
 * Aggregates all key performance indicators (KPIs) for the 
 * dashboard, including revenue, expenses, upcoming events, 
 * debts, and visual chart data.
 */
exports.getDashboard = (req, res) => {
  try {
    const now = new Date();
    const currentMonthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    const currentYearStart = `${now.getFullYear()}-01-01`;

    // --- 1. INCOME ANALYTICS ---
    const totalIncome = db.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM income").get();
    const monthIncome = db.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM income WHERE date >= ?").get(currentMonthStart);
    const yearIncome = db.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM income WHERE date >= ?").get(currentYearStart);

    // --- 2. EXPENSE ANALYTICS ---
    const totalExpenses = db.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE status != 'archived'").get();
    const monthExpenses = db.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE status != 'archived' AND date >= ?").get(currentMonthStart);
    const yearExpenses = db.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE status != 'archived' AND date >= ?").get(currentYearStart);

    // --- 3. EVENT OPERATIONAL STATS ---
    const upcomingEvents = db.prepare("SELECT * FROM events WHERE status = 'pending' ORDER BY date ASC LIMIT 5").all();
    const statusCounts = db.prepare("SELECT status, COUNT(*) as count FROM events GROUP BY status").all();

    // --- 4. RECENT ACTIVITY ---
    const latestExpenses = db.prepare("SELECT * FROM expenses WHERE status != 'archived' ORDER BY date DESC, time DESC LIMIT 5").all();
    const latestIncome = db.prepare("SELECT i.*, e.event_name FROM income i LEFT JOIN events e ON i.event_id = e.id ORDER BY i.date DESC, i.id DESC LIMIT 5").all();
    
    // --- 5. DEBT SUMMARY ---
    const debtsPerPerson = db.prepare(`
      SELECT 
        CASE WHEN partner_name = 'others' THEN partner_real_name ELSE partner_name END as name,
        SUM(amount) as total
      FROM debts 
      WHERE status = 'pending'
      GROUP BY name
      ORDER BY total DESC
    `).all();

    // --- 6. VISUALIZATION DATA (CHARTS) ---
    const monthlyChart = db.prepare(`
      SELECT 
        strftime('%Y-%m', date) as month,
        SUM(amount) as income
      FROM income
      GROUP BY month
      ORDER BY month DESC
      LIMIT 6
    `).all().reverse();

    const categoryChart = db.prepare("SELECT category, SUM(amount) as value FROM expenses WHERE status != 'archived' GROUP BY category").all();

    // --- 7. HEURISTIC AI INSIGHTS ---
    const totalProfit = totalIncome.total - totalExpenses.total;
    const financeStatus = totalProfit > 1000 ? 'Good' : (totalProfit > 0 ? 'Medium' : 'Risk');
    
    const insights = [];
    if (monthExpenses.total > monthIncome.total) {
      insights.push("⚠️ Expenses this month are higher than income. Review operational costs.");
    } else {
      insights.push("✅ Company is currently profitable this month.");
    }
    
    if (debtsPerPerson.length > 0) {
      insights.push(`💸 There are ${debtsPerPerson.length} people with outstanding debts.`);
    }

    const topExpenseCategory = categoryChart.sort((a,b) => b.value - a.value)[0];
    if (topExpenseCategory) {
      insights.push(`📊 Highest expense category is ${topExpenseCategory.category} ($${topExpenseCategory.value}).`);
    }

    // --- 8. PARTNER SHARES (Smart Analysis) ---
    const shares = db.prepare("SELECT SUM(moemen_share) as moemen, SUM(abd_share) as abd FROM income").get();
    if (shares.moemen > 0 || shares.abd > 0) {
       insights.push(`💰 Accumulated Partner Payouts: Moemen $${shares.moemen?.toFixed(2) || 0} | Abd $${shares.abd?.toFixed(2) || 0}`);
    }

    // Assemble final dashboard object
    res.json({
      revenue: totalIncome.total,
      monthIncome: monthIncome.total,
      yearIncome: yearIncome.total,
      
      expenses: totalExpenses.total,
      monthExpenses: monthExpenses.total,
      yearExpenses: yearExpenses.total,
      
      profitAll: totalProfit,
      profitMonth: monthIncome.total - monthExpenses.total,
      profitYear: yearIncome.total - yearExpenses.total,

      partnerShares: shares,
      upcomingEvents,
      statusCounts,
      
      latestExpenses,
      latestIncome,
      debtsPerPerson,
      
      monthlyChart,
      categoryChart,
      
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

/**
 * CHAT AI HANDLER
 * ---------------
 * A logic-based assistant that responds to user queries about 
 * the business status, debts, and profits using natural language.
 */
exports.chatAI = (req, res) => {
  const { message } = req.body;
  const msg = message.toLowerCase();
  
  try {
    let reply = "I'm analyzing your data... ";
    
    // Status Query
    if (msg.includes('وضع') || msg.includes('status') || msg.includes('الشركة')) {
       const profit = db.prepare("SELECT (SELECT SUM(amount) FROM income) - (SELECT SUM(amount) FROM expenses WHERE status != 'archived') as profit").get();
       reply = `الوضع المالي العام للشركة حالياً: ${profit.profit >= 0 ? 'جيد جداً ومربح' : 'يحتاج إلى مراجعة بسبب زيادة المصاريف'}. صافي الربح الكلي هو $${profit.profit || 0}.`;
    
    // Debt Query
    } else if (msg.includes('دين') || msg.includes('debt') || msg.includes('ديون')) {
       const totalDebt = db.prepare("SELECT SUM(amount) as total FROM debts WHERE status = 'pending'").get();
       const personDebts = db.prepare("SELECT partner_name, SUM(amount) as total FROM debts WHERE status = 'pending' GROUP BY partner_name").all();
       const debtList = personDebts.map(d => `${d.partner_name}: $${d.total}`).join(', ');
       reply = `إجمالي الديون المستحقة حالياً هو $${totalDebt.total || 0}. التفاصيل: ${debtList || 'لا يوجد ديون حالياً'}.`;
    
    // Expense Query
    } else if (msg.includes('مصاريف') || msg.includes('expense')) {
       const topExp = db.prepare("SELECT description, amount FROM expenses WHERE status != 'archived' ORDER BY amount DESC LIMIT 1").get();
       reply = `أعلى مصروف تم تسجيله مؤخراً هو "${topExp.description}" بقيمة $${topExp.amount}.`;
    
    // Profit Query
    } else if (msg.includes('أرباح') || msg.includes('profit')) {
       const income = db.prepare("SELECT SUM(amount) as total FROM income").get();
       reply = `إجمالي الدخل المسجل في النظام هو $${income.total || 0}.`;
    
    // Default Helper
    } else {
       reply = "أنا مساعدك الذكي. يمكنني إخبارك عن الديون، الأرباح، المصاريف، والوضع العام للشركة. اسألني أي شيء!";
    }
    
    res.json({ reply });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

