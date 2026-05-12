/**
 * ============================================================
 * ADMIN FINANCE ANALYTICS & STATS PAGE
 * ============================================================
 * Final Graduation Project Refactor
 * Purpose: Business intelligence and financial performance tracking.
 * Provides AI-driven insights, growth trends, and revenue 
 * projections based on real-time system data.
 * ============================================================
 */

/**
 * ============================================================
 * ADMIN FINANCE ANALYTICS & STATS PAGE
 * ============================================================
 * Final Graduation Project Refactor
 * Purpose: Business intelligence and financial performance tracking.
 * Provides AI-driven insights, growth trends, and revenue 
 * projections based on real-time system data.
 * ============================================================
 */

import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, LineChart, Line, Cell, PieChart, Pie
} from 'recharts';
import { 
  BrainCircuit, TrendingUp, Activity, Target, Sparkles,
  ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL as API } from '../../config';

// =============================
// REUSABLE UI COMPONENTS
// =============================

/**
 * INSIGHT CARD
 * ------------
 * Visualizes a specific financial metric with AI context.
 */
const InsightCard = ({ title, desc, value, trend, isPositive }) => (
  <div className="premium-card p-6 relative overflow-hidden">
    <div className={`absolute top-0 right-0 p-4 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
       {isPositive ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
    </div>
    <div className="flex items-center gap-2 mb-4">
       <Sparkles className="w-4 h-4 text-purple-500" />
       <span className="text-sm font-black uppercase text-purple-500 tracking-widest">AI Insight</span>
    </div>
    <h4 className="text-slate-400 text-sm font-bold uppercase tracking-widest leading-none mb-2">{title}</h4>
    <p className="text-2xl font-black text-slate-900">{value}</p>
    <p className="text-base text-slate-500 mt-4 font-medium leading-relaxed">{desc}</p>
  </div>
);

// =============================
// MAIN FINANCE STATS COMPONENT
// =============================
const FinanceStats = () => {
  // ── STATE MANAGEMENT: ANALYTICS DATA ──
  const [stats, setStats] = useState({
    totalIncome: 0, totalExpenses: 0, netProfitAll: 0,
    moemenExpenses: 0, abdExpenses: 0,
    monthlyChart: [], categoryChart: []
  });

  // ── INITIALIZATION ──
  useEffect(() => {
    axios.get(`${API}/dashboard`)
      .then(res => setStats(res.data))
      .catch(err => console.error('Stats fetch error'));
  }, []);

  // ── DATA ANALYTICS & INSIGHTS GENERATION ──
  const weeklyData = stats.monthlyChart.length > 0
    ? stats.monthlyChart.map(m => ({ name: m.month?.slice(5) || 'N/A', value: m.income }))
    : [{ name: 'W1', value: 0 }, { name: 'W2', value: 0 }, { name: 'W3', value: 0 }, { name: 'W4', value: 0 }];

  const expenseAnalysis = stats.totalExpenses > 0
    ? `Total expenses are $${stats.totalExpenses}. ${stats.moemenExpenses > stats.abdExpenses ? 'Moemen' : 'Abd'} has spent more ($${Math.max(stats.moemenExpenses, stats.abdExpenses)}). Consider balancing expense distribution.`
    : 'No expenses recorded yet. Start tracking to get insights.';

  const profitProjection = stats.netProfitAll >= 0
    ? `Current net profit is $${stats.netProfitAll}. ${stats.netProfitAll > 1000 ? 'Strong performance!' : 'Room for growth.'} Focus on high-ROI events.`
    : `Currently at a loss of $${Math.abs(stats.netProfitAll)}. Review expense categories and optimize spending.`;

  const goalProgress = stats.totalIncome > 0 ? Math.min(100, Math.round((stats.totalIncome / 10000) * 100)) : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* =============================
          1. PAGE HEADER
          ============================= */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase leading-none">Analytics & Insights</h2>
          <p className="text-slate-400 text-sm font-medium mt-1 flex items-center gap-2">
            <BrainCircuit className="w-4 h-4 text-purple-500" /> AI-driven financial growth tracking.
          </p>
        </div>
      </div>

      {/* =============================
          2. TOP INSIGHTS GRID
          ============================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <InsightCard 
          title="Expense Analysis"
          value={`$${stats.totalExpenses}`}
          desc={expenseAnalysis}
          isPositive={false}
        />
        <InsightCard 
          title="Net Profit"
          value={`$${stats.netProfitAll}`}
          desc={profitProjection}
          isPositive={stats.netProfitAll >= 0}
        />
        <InsightCard 
          title="Revenue Generated"
          value={`$${stats.totalIncome}`}
          desc={stats.totalIncome > 0 ? `Revenue from completed events. ${stats.categoryChart.length} expense categories tracked.` : 'Start recording event income to track revenue.'}
          isPositive={true}
        />
      </div>

      {/* =============================
          3. CHARTS & GOAL TRACKING
          ============================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="premium-card p-8">
            <h3 className="text-base font-black text-slate-800 uppercase tracking-tight mb-8">Monthly Growth Trend</h3>
            <div className="h-[300px]">
               <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                    <YAxis hide />
                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                    <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={4} dot={{ r: 6, fill: '#3b82f6', strokeWidth: 0 }} activeDot={{ r: 8 }} />
                  </LineChart>
               </ResponsiveContainer>
            </div>
         </div>

         <div className="premium-card p-8 flex flex-col items-center justify-center text-center">
            <Target className="w-16 h-16 text-slate-200 mb-6" />
            <h3 className="text-2xl font-black text-slate-900">Monthly Goal: $10,000</h3>
            <div className="w-full max-w-xs bg-slate-100 h-4 rounded-full mt-6 overflow-hidden">
               <div className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-1000" style={{width: `${goalProgress}%`}}></div>
            </div>
            <p className="text-slate-500 text-base mt-4 font-bold uppercase tracking-widest">${stats.totalIncome} earned so far</p>
         </div>
      </div>

      {/* =============================
          4. AI SMART SUGGESTIONS
          ============================= */}
      <div className="premium-card p-8">
        <div className="flex items-center gap-3 mb-6">
          <BrainCircuit className="w-6 h-6 text-purple-500" />
          <h3 className="text-base font-black text-slate-800 uppercase tracking-tight">🤖 AI Suggestions</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
            <h4 className="text-sm font-black text-blue-900 uppercase mb-2">💰 Increase Profits</h4>
            <p className="text-sm text-blue-700 leading-relaxed">
              {stats.totalIncome > stats.totalExpenses 
                ? 'Great job! Your revenue exceeds expenses. Consider reinvesting in new machines for more event capacity.'
                : 'Focus on booking higher-value events. Consider package deals for repeat clients to increase average revenue per event.'}
            </p>
          </div>
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
            <h4 className="text-sm font-black text-amber-900 uppercase mb-2">📉 Reduce Expenses</h4>
            <p className="text-sm text-amber-700 leading-relaxed">
              {stats.categoryChart.length > 0 
                ? `Top expense category: ${stats.categoryChart.sort((a,b) => b.value - a.value)[0]?.category || 'N/A'}. Look for bulk deals or alternative suppliers to reduce costs.`
                : 'Start categorizing expenses to identify areas where you can cut costs and improve margins.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinanceStats;

