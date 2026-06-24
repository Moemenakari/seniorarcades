import { useState, useEffect } from 'react';
import {
  TrendingUp, TrendingDown, DollarSign, Calendar,
  Wallet, MapPin, CheckCircle, AlertTriangle,
  MessageSquare, Edit3, Trash2, Plus, RefreshCw
} from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../../config';

const API = API_BASE_URL;

const PERIODS = [
  { id: 'cycle', label: 'Current Cycle' },
  { id: 'today', label: 'Today' },
  { id: 'week',  label: 'Week' },
  { id: 'month', label: 'Month' },
  { id: 'year',  label: 'Year' },
  { id: 'all',   label: 'All Time' },
  { id: 'custom',label: 'Custom' },
];

const GlassCard = ({ children, className = "" }) => (
  <div className={`bg-white/80 backdrop-blur-xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl sm:rounded-3xl p-4 sm:p-6 ${className}`}>
    {children}
  </div>
);

const StatCard = ({ title, value, subtitle, icon: Icon, color }) => (
  <GlassCard className="relative overflow-hidden group hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
    <div className="flex justify-between items-start mb-2 sm:mb-4">
      <div className={`w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center bg-${color}-50 text-${color}-600 group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="w-4 h-4 sm:w-6 sm:h-6" />
      </div>
    </div>
    <div>
      <h3 className="text-xs sm:text-sm font-semibold text-gray-500 mb-0.5 sm:mb-1">{title}</h3>
      <p className="text-xl sm:text-3xl font-black text-gray-900 tracking-tight">{value}</p>
      {subtitle && <p className="text-xs sm:text-sm font-medium text-gray-400 mt-1">{subtitle}</p>}
    </div>
    <div className={`absolute -right-6 -bottom-6 opacity-[0.03] text-${color}-600 pointer-events-none group-hover:scale-125 transition-transform duration-500 hidden sm:block`}>
      <Icon className="w-32 h-32" />
    </div>
  </GlassCard>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    revenue: 0, expenses: 0, profitAll: 0,
    upcomingEvents: [], statusCounts: [],
    latestExpenses: [], latestIncome: [], debtsPerPerson: [],
    monthlyChart: [], categoryChart: [],
    financeStatus: 'Good', aiInsights: [],
    auditCounts: { creates: 0, updates: 0, deletes: 0, total: 0 }
  });
  const [period, setPeriod] = useState('cycle');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [loading, setLoading] = useState(true);
  const [dailyNote, setDailyNote] = useState('');
  const [cycleStartDate, setCycleStartDate] = useState(null);
  const [cycleLoaded, setCycleLoaded] = useState(false);
  const [resettingCycle, setResettingCycle] = useState(false);
  const isSuperAdmin = localStorage.getItem('nlg_admin_role') === 'super';

  useEffect(() => {
    const savedNote = localStorage.getItem('dashboardDailyNote');
    if (savedNote) setDailyNote(savedNote);
    // Load cycle start date from DB
    axios.get(`${API}/settings/cycle`)
      .then(res => { setCycleStartDate(res.data.start_date || null); setCycleLoaded(true); })
      .catch(() => setCycleLoaded(true));
  }, []);

  // Fetch when period changes (skip 'cycle' until cycleLoaded)
  useEffect(() => {
    if (period === 'cycle' && !cycleLoaded) return;
    if (period !== 'custom') fetchDashboard();
  }, [period, cycleLoaded, cycleStartDate]);

  const fetchDashboard = () => {
    setLoading(true);
    const today = new Date().toISOString().split('T')[0];
    let url;
    if (period === 'cycle') {
      const from = cycleStartDate || '2000-01-01';
      url = `${API}/dashboard?period=custom&from=${from}&to=${today}`;
    } else if (period === 'custom' && customFrom && customTo) {
      url = `${API}/dashboard?period=custom&from=${customFrom}&to=${customTo}`;
    } else {
      url = `${API}/dashboard?period=${period}`;
    }
    axios.get(url)
      .then(res => { setStats(res.data); setLoading(false); })
      .catch(err => { console.error('Dashboard fetch error:', err); setLoading(false); });
  };

  const handleNoteChange = (e) => {
    setDailyNote(e.target.value);
    localStorage.setItem('dashboardDailyNote', e.target.value);
  };

  const handleNewCycle = async () => {
    if (!window.confirm('Start a new financial cycle from today?\n\nAll data will remain saved in History & Reports. The Dashboard will show figures starting from today.')) return;
    const today = new Date().toISOString().split('T')[0];
    setResettingCycle(true);
    try {
      await axios.put(`${API}/settings/cycle`, { start_date: today });
      setCycleStartDate(today);
      setPeriod('cycle');
    } catch (err) {
      alert('Failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setResettingCycle(false);
    }
  };

  const fmt = (n) => `$${(parseFloat(n) || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  const completedCount = stats.statusCounts?.find(s => s.status === 'completed')?.count || 0;
  const confirmedCount = stats.statusCounts?.find(s => s.status === 'confirmed')?.count || 0;

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">

      {/* ── HEADER + PERIOD FILTER ── */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h1 className="text-xl sm:text-3xl font-black text-gray-900 tracking-tight">Overview Dashboard</h1>
            <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1 flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              System Live &bull; Showing: <strong className="text-gray-700">{PERIODS.find(p => p.id === period)?.label}</strong>
              {stats.startDate && stats.endDate && period !== 'all' && (
                <span className="text-gray-400">({stats.startDate} → {stats.endDate})</span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className={`px-3 py-1.5 rounded-xl text-sm font-bold border ${stats.financeStatus === 'Risk' ? 'bg-red-50 text-red-600 border-red-200' : stats.financeStatus === 'Medium' ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-green-50 text-green-600 border-green-200'}`}>
              {stats.financeStatus === 'Risk' ? <AlertTriangle className="w-3 h-3 inline mr-1"/> : <CheckCircle className="w-3 h-3 inline mr-1"/>}
              Finance: {stats.financeStatus}
            </div>
            {isSuperAdmin && (
              <button
                onClick={handleNewCycle}
                disabled={resettingCycle}
                className="flex items-center gap-2 px-4 py-1.5 bg-indigo-600 text-white rounded-xl text-sm font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/30 disabled:opacity-60"
                title="Start a new financial cycle — data stays in History"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${resettingCycle ? 'animate-spin' : ''}`} />
                {resettingCycle ? 'Starting...' : 'New Cycle'}
              </button>
            )}
          </div>
        </div>

        {/* Period Selector */}
        <div className="flex gap-1.5 flex-wrap">
          {PERIODS.map(p => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className={`px-3 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-black uppercase tracking-widest transition-all ${period === p.id ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'}`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Cycle Info Banner */}
        {period === 'cycle' && (
          <div className="flex items-center gap-3 px-4 py-2.5 bg-indigo-50 border border-indigo-200 rounded-xl text-sm">
            <RefreshCw className="w-4 h-4 text-indigo-500 flex-shrink-0" />
            <span className="text-indigo-700 font-bold">
              {cycleStartDate
                ? <>Cycle started: <strong>{cycleStartDate}</strong> — showing revenue, expenses &amp; profit from that date only.</>
                : <>No cycle started yet — showing all-time data. Press <strong>New Cycle</strong> to begin a fresh cycle.</>
              }
            </span>
          </div>
        )}

        {/* Custom Date Range */}
        {period === 'custom' && (
          <div className="flex gap-3 items-center flex-wrap">
            <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)} className="premium-input bg-white px-3 py-2 text-sm font-bold" />
            <span className="text-slate-400 font-bold">→</span>
            <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)} className="premium-input bg-white px-3 py-2 text-sm font-bold" />
            <button onClick={fetchDashboard} disabled={!customFrom || !customTo} className="px-4 py-2 bg-slate-900 text-white font-black text-sm rounded-xl disabled:opacity-40 uppercase tracking-widest">Apply</button>
          </div>
        )}
      </div>

      {/* ── MAIN KPI CARDS ── */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 sm:h-36 bg-slate-100 animate-pulse rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          <StatCard title="Total Revenue"    value={fmt(stats.revenue)}   subtitle={`${completedCount} completed events`} icon={TrendingUp}  color="indigo" />
          <StatCard title="Total Expenses"   value={fmt(stats.expenses)}  subtitle="Operational costs"                    icon={TrendingDown} color="red"    />
          <StatCard title="Net Profit"       value={fmt(stats.profitAll)} subtitle={stats.profitAll >= 0 ? 'Profitable period' : 'Operating at loss'} icon={DollarSign} color={stats.profitAll >= 0 ? 'green' : 'red'} />
          <StatCard title="Upcoming Events"  value={stats.upcomingEvents?.length || 0} subtitle={`${confirmedCount} confirmed`} icon={Calendar} color="blue" />
        </div>
      )}

      {/* ── AUDIT ACTIVITY CARDS ── */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-green-50 border border-green-100 rounded-2xl p-3 sm:p-5 flex items-center gap-3 sm:gap-4">
          <div className="w-9 h-9 sm:w-12 sm:h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
          </div>
          <div>
            <p className="text-[10px] sm:text-xs font-black text-green-500 uppercase tracking-widest">Created</p>
            <p className="text-xl sm:text-3xl font-black text-green-700">{stats.auditCounts?.creates || 0}</p>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-3 sm:p-5 flex items-center gap-3 sm:gap-4">
          <div className="w-9 h-9 sm:w-12 sm:h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Edit3 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-[10px] sm:text-xs font-black text-blue-500 uppercase tracking-widest">Updated</p>
            <p className="text-xl sm:text-3xl font-black text-blue-700">{stats.auditCounts?.updates || 0}</p>
          </div>
        </div>
        <div className="bg-red-50 border border-red-100 rounded-2xl p-3 sm:p-5 flex items-center gap-3 sm:gap-4">
          <div className="w-9 h-9 sm:w-12 sm:h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
          </div>
          <div>
            <p className="text-[10px] sm:text-xs font-black text-red-500 uppercase tracking-widest">Deleted</p>
            <p className="text-xl sm:text-3xl font-black text-red-700">{stats.auditCounts?.deletes || 0}</p>
          </div>
        </div>
      </div>

      {/* ── ANALYTICS + ACTIVITY ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">

        <div className="xl:col-span-2 space-y-6">
          {/* Recent Income + Expenses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <GlassCard className="p-0 overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-green-500" /> Recent Income</h3>
              </div>
              <div className="divide-y divide-gray-50">
                {stats.latestIncome?.length > 0 ? stats.latestIncome.map((inc, i) => (
                  <div key={i} className="p-3 sm:p-4 hover:bg-gray-50 transition-colors flex justify-between items-center gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{inc.event_name || 'General Income'}</p>
                      <p className="text-xs text-gray-400">{inc.date}</p>
                    </div>
                    <span className="text-sm font-black text-green-600 flex-shrink-0">+${parseFloat(inc.amount||0).toLocaleString()}</span>
                  </div>
                )) : <div className="p-6 text-center text-sm text-gray-400">No income in this period</div>}
              </div>
            </GlassCard>
            <GlassCard className="p-0 overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2"><TrendingDown className="w-4 h-4 text-red-500" /> Recent Expenses</h3>
              </div>
              <div className="divide-y divide-gray-50">
                {stats.latestExpenses?.length > 0 ? stats.latestExpenses.map((exp, i) => (
                  <div key={i} className="p-3 sm:p-4 hover:bg-gray-50 transition-colors flex justify-between items-center gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{exp.description}</p>
                      <p className="text-xs text-gray-400">{exp.date}</p>
                    </div>
                    <span className="text-sm font-black text-red-500 flex-shrink-0">-${parseFloat(exp.amount||0).toLocaleString()}</span>
                  </div>
                )) : <div className="p-6 text-center text-sm text-gray-400">No expenses in this period</div>}
              </div>
            </GlassCard>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="space-y-4 sm:space-y-6">

          {/* Daily Note */}
          <GlassCard className="h-[260px] sm:h-[300px] flex flex-col p-0 overflow-hidden border-indigo-100">
            <div className="bg-indigo-600 p-4 sm:p-5 text-white flex items-center gap-3">
              <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base sm:text-lg">Daily Note</h3>
                <p className="text-xs text-indigo-200">Auto-saved</p>
              </div>
            </div>
            <div className="flex-1 p-4 sm:p-5 bg-gradient-to-b from-indigo-50/50 to-white">
              <textarea
                placeholder="Write your tasks for today..."
                className="w-full h-full resize-none outline-none text-sm text-gray-700 font-medium bg-transparent leading-relaxed"
                value={dailyNote}
                onChange={handleNoteChange}
              />
            </div>
          </GlassCard>

          {/* Pending Debts */}
          <GlassCard>
            <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Wallet className="w-4 h-4 text-orange-500" /> Pending Debts
            </h3>
            <div className="space-y-2">
              {stats.debtsPerPerson?.length > 0 ? stats.debtsPerPerson.map((d, i) => (
                <div key={i} className="flex justify-between items-center p-2.5 sm:p-3 rounded-xl bg-orange-50/50 border border-orange-100/50">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white flex items-center justify-center text-sm font-black text-orange-400 shadow-sm">
                      {(d.name || '?').charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-bold text-gray-900 capitalize">{d.name}</span>
                  </div>
                  <span className="text-sm font-black text-red-500">${parseFloat(d.total||0).toLocaleString()}</span>
                </div>
              )) : <div className="py-3 text-center text-sm text-gray-400 bg-gray-50 rounded-xl">No pending debts</div>}
            </div>
          </GlassCard>

          {/* Upcoming Events */}
          <GlassCard>
            <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-500" /> Upcoming Events
            </h3>
            <div className="space-y-3">
              {stats.upcomingEvents?.length > 0 ? stats.upcomingEvents.map((ev, i) => (
                <div key={i} className="flex gap-3 group">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-50 text-blue-600 flex flex-col items-center justify-center flex-shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <span className="text-[10px] font-bold uppercase leading-none">{new Date(ev.date).toLocaleString('en-US', { month: 'short' })}</span>
                    <span className="text-base font-black leading-none">{new Date(ev.date).getDate()}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">{ev.event_name}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1"><MapPin className="w-2.5 h-2.5"/>{ev.location || 'No Location'}</p>
                  </div>
                </div>
              )) : <div className="py-3 text-center text-sm text-gray-400 bg-gray-50 rounded-xl">No upcoming events</div>}
            </div>
          </GlassCard>

        </div>
      </div>

    </div>
  );
};

export default Dashboard;