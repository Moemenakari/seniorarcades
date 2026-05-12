/**
 * ============================================================
 * ADMIN DASHBOARD PAGE
 * ============================================================
 * Final Graduation Project Refactor
 * Purpose: Provides a centralized overview of business performance, 
 * financial KPIs, and upcoming operational tasks.
 * ============================================================
 */

/**
 * ============================================================
 * ADMIN DASHBOARD PAGE
 * ============================================================
 * Final Graduation Project Refactor
 * Purpose: Provides a centralized overview of business performance, 
 * financial KPIs, and upcoming operational tasks.
 * ============================================================
 */

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, DollarSign, Calendar, 
  Wallet, MapPin, Activity, CheckCircle, AlertTriangle, MessageSquare
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import axios from 'axios';
import { API_BASE_URL } from '../../config';

// =============================
// GLOBAL CONFIGURATION
// =============================
const API = API_BASE_URL;
const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

// =============================
// REUSABLE UI COMPONENTS
// =============================

/**
 * GLASS CARD
 * ----------
 * Provides the standard glassmorphism container for dashboard widgets.
 */
const GlassCard = ({ children, className = "" }) => (
  <div className={`bg-white/80 backdrop-blur-xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl sm:rounded-3xl p-4 sm:p-6 ${className}`}>
    {children}
  </div>
);

/**
 * STATISTICAL DATA CARD
 * ---------------------
 * Displays a single KPI with an icon, trend indicator, and comparison metrics.
 */
const StatCard = ({ title, value, subtitle, icon: Icon, color, trend }) => (
  <GlassCard className="relative overflow-hidden group hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
    <div className="flex justify-between items-start mb-2 sm:mb-4">
      <div className={`w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center bg-${color}-50 text-${color}-600 group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="w-4 h-4 sm:w-6 sm:h-6" />
      </div>
      {trend && (
        <span className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-xs sm:text-sm font-bold ${trend > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {trend > 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
    <div>
      <h3 className="text-xs sm:text-base font-semibold text-gray-500 mb-0.5 sm:mb-1">{title}</h3>
      <p className="text-xl sm:text-4xl font-black text-gray-900 tracking-tight">{value}</p>
      <p className="text-xs sm:text-sm font-medium text-gray-400 mt-1 sm:mt-2">{subtitle}</p>
    </div>
    <div className={`absolute -right-6 -bottom-6 opacity-[0.03] text-${color}-600 pointer-events-none group-hover:scale-125 transition-transform duration-500 hidden sm:block`}>
      <Icon className="w-32 h-32" />
    </div>
  </GlassCard>
);

// =============================
// MAIN PAGE COMPONENT
// =============================
const Dashboard = () => {
  // ── STATE MANAGEMENT ──
  const [stats, setStats] = useState({
    revenue: 0, monthIncome: 0, yearIncome: 0,
    expenses: 0, monthExpenses: 0, yearExpenses: 0,
    profitAll: 0, profitMonth: 0, profitYear: 0,
    upcomingEvents: [], statusCounts: [],
    latestExpenses: [], latestIncome: [], debtsPerPerson: [],
    monthlyChart: [], categoryChart: [],
    financeStatus: 'Good', eventsStatus: 'Healthy', operationsStatus: 'Active',
    aiInsights: []
  });
  const [dailyNote, setDailyNote] = useState('');

  // ── INITIALIZATION ──
  useEffect(() => {
    fetchDashboard();
    const savedNote = localStorage.getItem('dashboardDailyNote');
    if (savedNote) setDailyNote(savedNote);
  }, []);

  // ── DATA FETCHING ──
  const fetchDashboard = () => {
    axios.get(`${API}/dashboard`)
      .then(res => setStats(res.data))
      .catch(err => console.error("Dashboard fetch error:", err));
  };

  // ── USER INTERACTION HANDLERS ──
  const handleNoteChange = (e) => {
    setDailyNote(e.target.value);
    localStorage.setItem('dashboardDailyNote', e.target.value);
  };

  return (
    <div className="space-y-4 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      
      {/* =============================
          1. HEADER & SYSTEM STATUS
          ============================= */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-3xl font-black text-gray-900 tracking-tight">Overview Dashboard</h1>
          <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1 flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            System Live & Operating Normally
          </p>
        </div>
        
        <div className="flex gap-3">
          <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">Finance Status</span>
              <span className={`text-base font-bold flex items-center gap-1 ${stats.financeStatus === 'Risk' ? 'text-red-500' : 'text-green-600'}`}>
                {stats.financeStatus === 'Risk' ? <AlertTriangle className="w-3 h-3"/> : <CheckCircle className="w-3 h-3"/>} {stats.financeStatus}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* =============================
          2. KEY PERFORMANCE INDICATORS
          ============================= */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <StatCard 
          title="Total Revenue" 
          value={`$${stats.revenue?.toLocaleString() || 0}`}
          subtitle={`This Month: $${stats.monthIncome?.toLocaleString() || 0}`}
          icon={TrendingUp} 
          color="indigo"
          trend={15}
        />
        <StatCard 
          title="Total Expenses" 
          value={`$${stats.expenses?.toLocaleString() || 0}`}
          subtitle={`This Month: $${stats.monthExpenses?.toLocaleString() || 0}`}
          icon={TrendingDown} 
          color="red"
          trend={-5}
        />
        <StatCard 
          title="Net Profit" 
          value={`$${stats.profitAll?.toLocaleString() || 0}`}
          subtitle={`This Month: $${stats.profitMonth?.toLocaleString() || 0}`}
          icon={DollarSign} 
          color="green"
          trend={20}
        />
        <StatCard 
          title="Upcoming Events" 
          value={stats.upcomingEvents?.length || 0}
          subtitle={`${stats.statusCounts?.find(s => s.status === 'completed')?.count || 0} Total Completed`}
          icon={Calendar} 
          color="blue"
        />
      </div>

      {/* =============================
          3. ANALYTICS & ACTIVITY FEED
          ============================= */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        
        {/* ── Visual Analytics (Left) ── */}
        <div className="xl:col-span-2 space-y-6">
          {/* Revenue Chart */}
          <GlassCard>
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-500" /> Revenue Flow
            </h3>
            <div className="h-[200px] sm:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.monthlyChart}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)' }}
                    itemStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="income" stroke="#6366f1" strokeWidth={4} fill="url(#colorIncome)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          {/* Real-time Feeds */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recent Income */}
            <GlassCard className="p-0 overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-500" /> Recent Income
                </h3>
              </div>
              <div className="divide-y divide-gray-100">
                {stats.latestIncome?.map((inc, i) => (
                  <div key={i} className="p-4 hover:bg-gray-50 transition-colors flex justify-between items-center">
                    <div>
                      <p className="text-base font-bold text-gray-900">{inc.event_name || 'General Income'}</p>
                      <p className="text-base text-gray-500 mt-0.5">{inc.date}</p>
                    </div>
                    <span className="text-base font-black text-green-600">+${inc.amount}</span>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Recent Expenses */}
            <GlassCard className="p-0 overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-red-500" /> Recent Expenses
                </h3>
              </div>
              <div className="divide-y divide-gray-100">
                {stats.latestExpenses?.map((exp, i) => (
                  <div key={i} className="p-4 hover:bg-gray-50 transition-colors flex justify-between items-center">
                    <div>
                      <p className="text-base font-bold text-gray-900">{exp.description}</p>
                      <p className="text-base text-gray-500 mt-0.5">{exp.date}</p>
                    </div>
                    <span className="text-base font-black text-red-500">-${exp.amount}</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>

        {/* =============================
            4. OPERATIONS & PLANNER
            ============================= */}
        <div className="space-y-6">
          
          {/* Daily Note Tool */}
          <GlassCard className="h-[300px] flex flex-col p-0 overflow-hidden shadow-[0_10px_40px_rgb(99,102,241,0.1)] border-indigo-100">
            <div className="bg-indigo-600 p-5 text-white flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg tracking-wide">Daily Note</h3>
                <p className="text-base text-indigo-200">Auto-saved planner</p>
              </div>
            </div>
            <div className="flex-1 p-5 bg-gradient-to-b from-indigo-50/50 to-white">
              <textarea
                placeholder="What do you need to do today? Write your tasks here..."
                className="w-full h-full resize-none outline-none text-base text-gray-700 font-medium bg-transparent leading-relaxed"
                value={dailyNote}
                onChange={handleNoteChange}
              ></textarea>
            </div>
          </GlassCard>

          {/* Pending Debt List */}
          <GlassCard>
            <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Wallet className="w-4 h-4 text-orange-500" /> Pending Debts
            </h3>
            <div className="space-y-3">
              {stats.debtsPerPerson?.length > 0 ? stats.debtsPerPerson.map((d, i) => (
                <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-orange-50/50 border border-orange-100/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-base font-black text-orange-400 shadow-sm">
                      {d.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-base font-bold text-gray-900 capitalize">{d.name}</span>
                  </div>
                  <span className="text-base font-black text-red-500">${d.total}</span>
                </div>
              )) : (
                <div className="py-4 text-center text-base font-medium text-gray-400 bg-gray-50 rounded-xl">No pending debts</div>
              )}
            </div>
          </GlassCard>

          {/* Upcoming Schedule Snap */}
          <GlassCard>
            <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-500" /> Upcoming Events
            </h3>
            <div className="space-y-4">
              {stats.upcomingEvents?.length > 0 ? stats.upcomingEvents.map((ev, i) => (
                <div key={i} className="flex gap-4 group">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex flex-col items-center justify-center flex-shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <span className="text-sm font-bold uppercase">{new Date(ev.date).toLocaleString('en-US', { month: 'short' })}</span>
                    <span className="text-lg font-black">{new Date(ev.date).getDate()}</span>
                  </div>
                  <div>
                    <p className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{ev.event_name}</p>
                    <p className="text-base text-gray-500 mt-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3"/> {ev.location || 'No Location'}
                    </p>
                  </div>
                </div>
              )) : (
                <div className="py-4 text-center text-base font-medium text-gray-400 bg-gray-50 rounded-xl">No upcoming events</div>
              )}
            </div>
          </GlassCard>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;

