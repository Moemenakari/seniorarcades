/**
 * ============================================================
 * ADMIN EVENTS MANAGEMENT PAGE
 * ============================================================
 * Final Graduation Project Refactor
 * Purpose: Advanced management of completed events, including 
 * multi-day financial tracking, expense breakdown, and 
 * AI-driven performance insights.
 * ============================================================
 */

/**
 * ============================================================
 * ADMIN EVENTS MANAGEMENT PAGE
 * ============================================================
 * Final Graduation Project Refactor
 * Purpose: Advanced management of completed events, including 
 * multi-day financial tracking, expense breakdown, and 
 * AI-driven performance insights.
 * ============================================================
 */

import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Calendar, Edit, Trash2, X, Users, DollarSign, 
  FileText, ChevronDown, ChevronUp, BarChart3, BrainCircuit, 
  CheckSquare, Square, ListChecks, Link2 
} from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL as API } from '../../config';

// =============================
// MAIN PAGE COMPONENT
// =============================
const Events = () => {
  // ── STATE MANAGEMENT: UI & DATA ──
  const [events, setEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [history, setHistory] = useState({ names: [], clients: [], managers: [] });
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [viewStatsEvent, setViewStatsEvent] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [deleteModal, setDeleteModal] = useState(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  
  // ── STATE MANAGEMENT: FORM DATA ──
  const [form, setForm] = useState({
    event_name: '',
    location: '',
    client_type: 'client',
    client_name: '',
    phone: '',
    advice_note: '',
    linked_upcoming_id: null,
    gen_key: ''
  });

  // Daily tracking state (multi-day support)
  const [days, setDays] = useState([{
    date: new Date().toISOString().split('T')[0],
    revenue: 0,
    expenses: [{ desc: 'Rent Space', amount: 0 }],
    isOpen: true
  }]);

  // ── INITIALIZATION ──
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setIsLoading(true);
    setFetchError('');
    try {
      const res = await axios.get(`${API}/events`);
      const all = res.data;
      setEvents(all.filter(e => e.status === 'completed'));
      setUpcomingEvents(all.filter(e => e.status === 'pending'));
      const names = [...new Set(all.map(e => e.event_name).filter(Boolean))];
      const clients = [...new Set(all.map(e => e.client_name).filter(Boolean))];
      const managers = [...new Set(all.map(e => e.manager_name).filter(Boolean))];
      setHistory({ names, clients, managers });
    } catch (err) {
      console.error('Events fetch error', err);
      setFetchError(err.response?.data?.error || 'Failed to load events. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ── MULTI-DAY TRACKING LOGIC ──
  const addDay = () => {
    const lastDate = new Date(days[days.length - 1]?.date || new Date());
    lastDate.setDate(lastDate.getDate() + 1);
    setDays([...days, {
      date: lastDate.toISOString().split('T')[0],
      revenue: 0, 
      expenses: [{ desc: 'Rent Space', amount: 0 }], 
      isOpen: true
    }]);
  };

  const updateDay = (index, field, value) => {
    const newDays = [...days];
    newDays[index][field] = value;
    setDays(newDays);
  };

  const updateExpense = (dayIdx, expIdx, field, value) => {
    const newDays = [...days];
    newDays[dayIdx].expenses[expIdx][field] = value;
    setDays(newDays);
  };

  const addExpenseItem = (dayIdx) => {
    const newDays = [...days];
    newDays[dayIdx].expenses.push({ desc: '', amount: 0 });
    setDays(newDays);
  };

  const removeExpenseItem = (dayIdx, expIdx) => {
    const newDays = [...days];
    newDays[dayIdx].expenses = newDays[dayIdx].expenses.filter((_, i) => i !== expIdx);
    setDays(newDays);
  };

  const removeDay = (index) => {
    if (days.length > 1) {
      setDays(days.filter((_, i) => i !== index));
    }
  };

  const toggleDayOpen = (index) => {
    const newDays = [...days];
    newDays[index].isOpen = !newDays[index].isOpen;
    setDays(newDays);
  };

  // ── ANALYTICS & CALCULATION LOGIC ──
  const calculateDayExpenses = (d) => {
    return (d.expenses || []).reduce((acc, exp) => acc + (parseFloat(exp.amount) || 0), 0);
  };

  const generateAIAdvice = (profit, expenses, food, gas) => {
    if (profit <= 0 && expenses > 0) return "🔴 CRITICAL: This event is operating at a loss. Review all dynamic expenses immediately.";
    if (expenses === 0) return "⚠️ Unrealistic data: No expenses tracked. Ensure accurate reporting for better insights.";
    
    let insights = [];
    const profitMargin = (profit / (profit + expenses)) * 100;
    
    if (profitMargin > 50) insights.push("🟢 EXCELLENT MARGIN: You retained over 50% profit. Great pricing strategy.");
    else if (profitMargin < 20) insights.push("🟠 LOW MARGIN: Profit is under 20%. Consider raising rates or cutting non-essential costs.");
    
    if (food > (expenses * 0.3)) insights.push("💡 Food costs exceed 30% of total expenses. Could be optimized.");
    if (gas > (expenses * 0.3)) insights.push("⛽ High transport/gas costs. Bundle logistics if doing similar locations.");
    
    return insights.length > 0 ? insights.join(' | ') : "✅ Event executed with balanced metrics. Keep up the good work.";
  };

  const calculateDayNet = (d) => {
    return (parseFloat(d.revenue) || 0) - calculateDayExpenses(d);
  };

  // ── CRUD OPERATIONS ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError('');

    const total_net_profit = days.reduce((acc, d) => acc + calculateDayNet(d), 0);

    let total_food = 0;
    let total_gas = 0;
    let event_manager_pay = 0;

    days.forEach(d => {
      (d.expenses || []).forEach(exp => {
        const desc = exp.desc.toLowerCase();
        const amt = parseFloat(exp.amount) || 0;
        if (desc.includes('food') || desc.includes('eat') || desc.includes('طعام') || desc.includes('اكل')) total_food += amt;
        if (desc.includes('gas') || desc.includes('transport') || desc.includes('بنزين') || desc.includes('وقود')) total_gas += amt;
        if (desc.includes('rent') || desc.includes('space') || desc.includes('ايجار') || desc.includes('مساحة')) event_manager_pay += amt;
      });
    });

    const payload = {
      event_name: form.event_name,
      location: form.location,
      date: days.length > 0 ? days[0].date : new Date().toISOString().split('T')[0],
      end_date: days.length > 0 ? days[days.length - 1].date : null,
      client_name: form.client_name,
      phone: form.phone,
      event_type: form.client_type,
      notes: JSON.stringify({
        advice_note: form.advice_note,
        days: days.map(d => ({...d, isOpen: undefined}))
      }),
      profit: total_net_profit,
      food_cost: total_food,
      gas_cost: total_gas,
      event_manager_pay,
      status: 'completed',
      manual_status: 'live'
    };

    const admin_name = localStorage.getItem('nlg_admin') || 'System';
    try {
      if (editingEvent) {
        await axios.put(`${API}/events/${editingEvent.id}`, { ...payload, admin_name });
      } else if (form.linked_upcoming_id) {
        await axios.put(`${API}/events/${form.linked_upcoming_id}`, { ...payload, admin_name });
      } else {
        await axios.post(`${API}/events`, { ...payload, admin_name });
      }
      await fetchEvents();
      setShowForm(false);
      setEditingEvent(null);
      resetForm();
    } catch (err) {
      const msg = err.response?.data?.details || err.response?.data?.error || 'Error saving event';
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDeleteModal = (id, name) => {
    setDeleteModal({ id, name });
    setDeleteReason('');
  };

  const handleDeleteConfirm = async () => {
    if (!deleteReason.trim()) return;
    setIsDeleting(true);
    const admin_name = localStorage.getItem('nlg_admin') || 'System';
    try {
      await axios.delete(`${API}/events/${deleteModal.id}`, { data: { admin_name, reason: deleteReason.trim() } });
      setDeleteModal(null);
      setDeleteReason('');
      await fetchEvents();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete event');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = (ev) => {
    setEditingEvent(ev);
    
    let parsedNotes = { advice_note: ev.notes || '', days: [] };
    if (ev.notes && ev.notes.startsWith('{')) {
      try {
        parsedNotes = JSON.parse(ev.notes);
      } catch (e) {}
    }

    setForm({ 
      event_name: ev.event_name || '', 
      location: ev.location || '',
      client_type: ev.event_type || 'client',
      client_name: ev.client_name || '',
      phone: ev.phone || '',
      advice_note: parsedNotes.advice_note || ''
    });

    if (parsedNotes.days && parsedNotes.days.length > 0) {
      setDays(parsedNotes.days.map(d => ({
        ...d, 
        expenses: d.expenses || [], 
        isOpen: false
      })));
    } else {
      setDays([{
        date: ev.date || new Date().toISOString().split('T')[0],
        revenue: ev.profit || 0, 
        expenses: [
          { desc: 'Rent Space', amount: ev.event_manager_pay || 0 },
          { desc: 'Transport/Gas', amount: ev.gas_cost || 0 },
          { desc: 'Food', amount: ev.food_cost || 0 }
        ].filter(e => e.amount > 0),
        isOpen: true
      }]);
    }

    setShowForm(true);
  };

  // ── LINK UPCOMING EVENT HANDLER ──
  const handleEventChange = (e) => {
    const selectedId = e.target.value;
    if (!selectedId) {
      setForm(prev => ({ ...prev, linked_upcoming_id: null }));
      return;
    }
    const selected = upcomingEvents.find(u => String(u.id) === String(selectedId));
    if (selected) {
      setForm(prev => ({
        ...prev,
        linked_upcoming_id: selectedId,
        event_name: selected.event_name || prev.event_name,
        location: selected.location || prev.location,
        client_name: selected.client_name || prev.client_name,
        phone: selected.phone || prev.phone,
        client_type: selected.event_type || prev.client_type,
      }));
    } else {
      setForm(prev => ({ ...prev, linked_upcoming_id: selectedId }));
    }
  };

  const resetForm = () => {
    setForm({
      event_name: '', location: '', client_type: 'client',
      client_name: '', phone: '', advice_note: ''
    });
    setDays([{
      date: new Date().toISOString().split('T')[0],
      revenue: 0, 
      expenses: [{ desc: 'Rent Space', amount: 0 }], 
      isOpen: true
    }]);
  };

  // ── DATA HELPERS ──
  const filteredEvents = events.filter(e =>
    (e.event_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (e.client_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (e.location || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getEventTotals = (ev) => {
    if (ev.notes && ev.notes.startsWith('{')) {
      try {
        const parsed = JSON.parse(ev.notes);
        if (parsed.days && parsed.days.length > 0) {
          let totalRevenue = 0;
          let totalExpenses = 0;
          parsed.days.forEach(d => {
            totalRevenue += parseFloat(d.revenue) || 0;
            totalExpenses += (d.expenses || []).reduce((acc, exp) => acc + (parseFloat(exp.amount) || 0), 0);
          });
          return { totalRevenue, totalExpenses, netProfit: totalRevenue - totalExpenses };
        }
      } catch(e) {}
    }
    const storedExpenses = (parseFloat(ev.food_cost)||0) + (parseFloat(ev.gas_cost)||0) + (parseFloat(ev.event_manager_pay)||0);
    return {
      totalRevenue: (parseFloat(ev.profit)||0) + storedExpenses,
      totalExpenses: storedExpenses,
      netProfit: parseFloat(ev.profit) || 0
    };
  };

  const getSpaceRent = (ev) => {
    if (ev.notes && ev.notes.startsWith('{')) {
      try {
        const parsed = JSON.parse(ev.notes);
        if (parsed.days && parsed.days.length > 0) {
          let total = 0;
          parsed.days.forEach(d => {
            (d.expenses || []).forEach(exp => {
              const desc = (exp.desc || '').toLowerCase();
              if (desc.includes('rent') || desc.includes('space') || desc.includes('ايجار') || desc.includes('مساحة')) {
                total += parseFloat(exp.amount) || 0;
              }
            });
          });
          return total;
        }
      } catch(e) {}
    }
    return parseFloat(ev.event_manager_pay) || 0;
  };

  const getEventId = (dateStr) => {
    if (!dateStr) return '@------';
    const d = new Date(dateStr);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `@${dd}${mm}${yyyy}`;
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };
  const selectAll = () => {
    if (selectedIds.length === filteredEvents.length) setSelectedIds([]);
    else setSelectedIds(filteredEvents.map(e => e.id));
  };

  const selectedEvents = filteredEvents.filter(e => selectedIds.includes(e.id));
  const selTotals = selectedEvents.reduce((a, e) => {
    const t = getEventTotals(e);
    return { revenue: a.revenue + t.totalRevenue, expenses: a.expenses + t.totalExpenses, profit: a.profit + t.netProfit };
  }, { revenue: 0, expenses: 0, profit: 0 });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* =============================
          1. HEADER & PRIMARY ACTIONS
          ============================= */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase leading-none">Event</h2>
          <p className="text-slate-400 text-sm font-medium mt-1">Manage operations and daily details.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
           <button onClick={() => { setEditingEvent(null); resetForm(); setSubmitError(''); setShowForm(true); }} className="btn-navy flex items-center gap-2 w-full sm:w-auto justify-center">
             <Plus className="w-4 h-4" /> Insert Event
           </button>
        </div>
      </div>

      {/* =============================
          1.5 LOADING / ERROR STATE
          ============================= */}
      {isLoading && (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Loading Events...</p>
        </div>
      )}
      {!isLoading && fetchError && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-center gap-4">
          <div className="text-red-500 font-bold text-sm flex-1">{fetchError}</div>
          <button onClick={fetchEvents} className="px-4 py-2 bg-red-600 text-white font-black text-sm rounded-xl hover:bg-red-700 transition uppercase tracking-widest">Retry</button>
        </div>
      )}

      {/* =============================
          2. EVENT EDITOR FORM
          ============================= */}
      {!isLoading && !fetchError && showForm && (
        <div className="premium-card p-6 bg-slate-50/80 border-slate-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">{editingEvent ? 'Edit Event' : 'Create Smart Event'}</h3>
            <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-200 rounded-xl bg-white shadow-sm transition"><X className="w-5 h-5" /></button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-8">

            {/* Smart Link Sub-section */}
            {!editingEvent && upcomingEvents.length > 0 && (
              <div className="bg-indigo-50/60 border border-indigo-100 rounded-2xl p-5">
                <h4 className="text-sm font-black text-indigo-700 uppercase tracking-widest mb-3 flex items-center gap-2"><Link2 className="w-4 h-4" /> Link to Upcoming Event (Optional)</h4>
                <select
                  className="premium-input bg-white"
                  value={form.linked_upcoming_id || ''}
                  onChange={handleEventChange}
                >
                  <option value="">— Select an upcoming event to auto-fill —</option>
                  {upcomingEvents.map(u => (
                    <option key={u.id} value={u.id}>{u.event_name} · {u.date} · {u.gen_key || ''}</option>
                  ))}
                </select>
              </div>
            )}

            {/* 2.1 Basic Info */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">1. General Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-black text-slate-500 uppercase tracking-widest ml-1">Event Name</label>
                  <input type="text" list="hist-names" required className="premium-input bg-slate-50" value={form.event_name} onChange={e => setForm({...form, event_name: e.target.value})} placeholder="Event Name" />
                  <datalist id="hist-names">{history.names.map(n => <option key={n} value={n} />)}</datalist>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-black text-slate-500 uppercase tracking-widest ml-1">Location</label>
                  <input type="text" className="premium-input bg-slate-50" value={form.location} onChange={e => setForm({...form, location: e.target.value})} placeholder="Where?" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-black text-slate-500 uppercase tracking-widest ml-1">Client Type</label>
                  <select className="premium-input bg-slate-50" value={form.client_type} onChange={e => setForm({...form, client_type: e.target.value})}>
                    <option value="client">Direct Client</option>
                    <option value="event_manager">Event Manager</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-black text-slate-500 uppercase tracking-widest ml-1">{form.client_type === 'event_manager' ? 'Manager Name' : 'Client Name'}</label>
                  <input type="text" list="hist-clients" className="premium-input bg-slate-50" value={form.client_name} onChange={e => setForm({...form, client_name: e.target.value})} placeholder="Who?" />
                  <datalist id="hist-clients">{history.clients.map(c => <option key={c} value={c} />)}</datalist>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-black text-slate-500 uppercase tracking-widest ml-1">Phone Number</label>
                  <input type="text" className="premium-input bg-slate-50" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="Contact Details" />
                </div>
              </div>
            </div>

            {/* 2.2 Daily Tracking */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">2. Daily Tracking (Profit & Expenses)</h4>
                <button type="button" onClick={addDay} className="text-sm font-bold uppercase tracking-widest bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100">+ Add Next Day</button>
              </div>

              {days.map((day, idx) => (
                <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="bg-slate-50 p-3 flex justify-between items-center cursor-pointer" onClick={() => toggleDayOpen(idx)}>
                    <div className="flex justify-center items-center gap-3">
                       <span className="bg-slate-800 text-white text-sm font-black px-2 py-1 rounded">DAY {idx + 1}</span>
                       <input type="date" className="bg-transparent border-none text-sm font-bold text-slate-800 p-0 focus:ring-0" value={day.date} onClick={e => e.stopPropagation()} onChange={e => updateDay(idx, 'date', e.target.value)} />
                    </div>
                    <div className="flex items-center gap-2">
                       {days.length > 1 && (
                         <button type="button" onClick={(e) => { e.stopPropagation(); removeDay(idx); }} className="p-1 px-2 text-red-500 hover:bg-red-50 rounded text-sm font-black">DROP</button>
                       )}
                       {day.isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </div>
                  </div>

                  {day.isOpen && (
                    <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3 bg-white">
                      <div className="col-span-2 md:col-span-4 bg-green-50/50 p-3 rounded-xl border border-green-100 flex flex-col md:flex-row md:items-center gap-3 justify-between">
                         <div>
                            <label className="text-sm font-black text-green-700 uppercase tracking-widest block mb-1">Gross Revenue $</label>
                            <input type="number" step="0.01" className="premium-input bg-white w-full md:w-48" value={day.revenue} onChange={e => updateDay(idx, 'revenue', e.target.value)} />
                         </div>
                         <div className="text-right">
                            <span className="text-sm font-black text-slate-400 uppercase tracking-widest block">Net Profit Today</span>
                            <span className={`text-2xl font-black ${calculateDayNet(day) >= 0 ? 'text-green-600' : 'text-red-500'}`}>${calculateDayNet(day).toFixed(2)}</span>
                         </div>
                      </div>
                      
                      <div className="col-span-2 md:col-span-4 mt-2">
                        <div className="flex justify-between items-center mb-3 pb-1 border-b border-slate-100">
                          <label className="text-sm font-black text-red-500 uppercase tracking-widest ml-1">Expenses Details (Total: ${calculateDayExpenses(day).toFixed(2)})</label>
                          <button type="button" onClick={() => addExpenseItem(idx)} className="text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 px-2 py-1 rounded">+ ADD EXPENSE</button>
                        </div>
                        <div className="space-y-2">
                          {(day.expenses || []).map((exp, eIdx) => (
                            <div key={eIdx} className="flex items-center gap-2">
                              <input type="text" placeholder="Description" className="premium-input text-sm flex-1" value={exp.desc} onChange={e => updateExpense(idx, eIdx, 'desc', e.target.value)} />
                              <input type="number" step="0.01" placeholder="$0.00" className="premium-input text-sm w-24" value={exp.amount} onChange={e => updateExpense(idx, eIdx, 'amount', e.target.value)} />
                              <button type="button" onClick={() => removeExpenseItem(idx, eIdx)} className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-red-500 border border-slate-200 rounded-lg"><X className="w-3.5 h-3.5" /></button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* 2.3 Summary & Submission */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">3. Overall Event Summary</h4>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                 <div className="flex-1 bg-blue-50 border border-blue-100 rounded-xl p-4">
                    <p className="text-sm font-black text-blue-400 uppercase tracking-widest">Gross Revenue</p>
                    <h3 className="text-xl font-black text-blue-700">${days.reduce((acc, d) => acc + (parseFloat(d.revenue) || 0), 0).toFixed(2)}</h3>
                 </div>
                 <div className="flex-1 bg-red-50 border border-red-100 rounded-xl p-4">
                    <p className="text-sm font-black text-red-400 uppercase tracking-widest">Total Expenses</p>
                    <h3 className="text-xl font-black text-red-600">${days.reduce((acc, d) => acc + calculateDayExpenses(d), 0).toFixed(2)}</h3>
                 </div>
                 <div className="flex-1 bg-green-50 border border-green-100 rounded-xl p-4 shadow-sm">
                    <p className="text-sm font-black text-green-600 uppercase tracking-widest">FINAL NET PROFIT</p>
                    <h3 className={`text-2xl font-black ${days.reduce((acc, d) => acc + calculateDayNet(d), 0) >= 0 ? 'text-green-700' : 'text-red-500'}`}>${days.reduce((acc, d) => acc + calculateDayNet(d), 0).toFixed(2)}</h3>
                 </div>
              </div>

              <div className="space-y-4">
                <textarea className="premium-input bg-slate-50 min-h-[80px]" value={form.advice_note} onChange={e => setForm({...form, advice_note: e.target.value})} placeholder="Event Note / Advice for next time"></textarea>
                {submitError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 font-bold text-sm px-4 py-3 rounded-xl">{submitError}</div>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-navy w-full py-4 text-sm shadow-xl shadow-blue-900/20 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin inline-block" /> Saving...</>
                  ) : (
                    editingEvent ? 'Update Event Record' : 'Save Event Details'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* =============================
          3. EVENTS DATA TABLE
          ============================= */}
      {!isLoading && !fetchError && !showForm && (
        <div className="premium-card overflow-hidden">
          {/* Table Toolbar */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex gap-3 items-center">
            <button onClick={selectAll} className="flex items-center gap-1.5 text-sm font-black uppercase tracking-widest px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 shadow-sm">
              {selectedIds.length === filteredEvents.length && filteredEvents.length > 0 ? <CheckSquare className="w-3.5 h-3.5 text-blue-600" /> : <Square className="w-3.5 h-3.5" />} Select All
            </button>
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input type="text" placeholder="Search events..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 outline-none text-sm font-medium" />
            </div>
          </div>

          {/* Selection State Bar */}
          {selectedIds.length > 0 && (
            <div className="flex flex-wrap items-center gap-4 px-6 py-3 bg-indigo-50 border-b border-indigo-100">
              <div className="flex items-center gap-2">
                <ListChecks className="w-4 h-4 text-indigo-500" />
                <span className="text-sm font-black text-indigo-700 uppercase tracking-widest">Selected: <span className="text-base font-black">{selectedIds.length}</span></span>
              </div>
              <button onClick={() => setSelectedIds([])} className="ml-auto text-sm font-black text-indigo-400 hover:text-indigo-700 uppercase tracking-widest flex items-center gap-1"><X className="w-3 h-3" /> Clear</button>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-4 py-4 text-sm font-black text-slate-400 uppercase w-10">#</th>
                  <th className="px-2 py-4 w-8"></th>
                  <th className="px-4 py-4 text-sm font-black text-slate-400 uppercase">Event</th>
                  <th className="px-6 py-4 text-sm font-black text-slate-400 uppercase">Profit + Expenses</th>
                  <th className="px-6 py-4 text-sm font-black text-slate-400 uppercase">Client & Info</th>
                  <th className="px-6 py-4 text-sm font-black text-slate-400 uppercase">Space Rent</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredEvents.map((ev, idx) => {
                  const { totalRevenue: evRevenue, totalExpenses: evExpenses, netProfit: evProfit } = getEventTotals(ev);
                  const isSelected = selectedIds.includes(ev.id);
                  return (
                    <tr key={ev.id} className={`hover:bg-slate-50/80 transition-colors group ${isSelected ? 'bg-indigo-50/40' : ''}`}>
                      <td className="px-4 py-4"><span className="text-sm font-black text-slate-400">#{idx + 1}</span></td>
                      <td className="px-2 py-4"><button onClick={() => toggleSelect(ev.id)}>{isSelected ? <CheckSquare className="w-4 h-4 text-indigo-500" /> : <Square className="w-4 h-4 text-slate-300" />}</button></td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center font-black text-sm"><Calendar className="w-4 h-4" /></div>
                          <div>
                            <p className="font-bold text-slate-900 text-base">{ev.event_name} {ev.manual_status === 'live' && <span className="bg-green-500 text-white text-[10px] px-1 rounded-full ml-1">LIVE</span>}</p>
                            <span className="text-sm font-bold text-blue-500 uppercase">{getEventId(ev.date)} &bull; {ev.date}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-base font-black text-green-600">${evProfit.toFixed(2)}</p>
                        <p className="text-sm font-bold text-red-400">Exp: ${evExpenses.toFixed(2)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-slate-700 capitalize">{ev.client_name || '-'} ({ev.event_type?.replace('_', ' ')})</p>
                        <p className="text-sm text-slate-500">{ev.phone}</p>
                      </td>
                      <td className="px-6 py-4"><p className="text-base font-black text-amber-600">${getSpaceRent(ev).toFixed(2)}</p></td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setViewStatsEvent(ev)} className="px-3 py-1.5 text-sm font-black bg-indigo-50 text-indigo-600 rounded-lg">STATS</button>
                          <button onClick={() => handleEdit(ev)} className="p-1.5 text-blue-600 bg-blue-50 rounded-lg"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => openDeleteModal(ev.id, ev.event_name)} className="p-1.5 text-red-600 bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =============================
          4. DELETE WITH REASON MODAL
          ============================= */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-red-50/50 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 text-red-600 flex items-center justify-center rounded-xl"><Trash2 className="w-5 h-5" /></div>
                <div>
                  <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight leading-none">Delete Event</h2>
                  <p className="text-sm font-bold text-slate-500 mt-0.5 truncate max-w-[220px]">{deleteModal.name}</p>
                </div>
              </div>
              <button onClick={() => setDeleteModal(null)} className="p-2 bg-white rounded-xl shadow-sm"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-5">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                <p className="text-sm font-bold text-amber-800">This event will be archived and removed from active records. This action is logged for audit purposes.</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-500 uppercase tracking-widest ml-1">Reason for Deletion <span className="text-red-500">*</span></label>
                <textarea
                  className="premium-input bg-slate-50 min-h-[90px] w-full resize-none"
                  placeholder="e.g. Client cancelled, duplicate entry, event rescheduled..."
                  value={deleteReason}
                  onChange={e => setDeleteReason(e.target.value)}
                />
              </div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Admin: {localStorage.getItem('nlg_admin') || 'System'} &bull; {new Date().toLocaleDateString('en-GB')} {new Date().toLocaleTimeString('en-GB', { hour12: false }).slice(0, 5)}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setDeleteModal(null)} className="flex-1 py-3 bg-slate-100 text-slate-700 font-black text-sm uppercase tracking-widest rounded-2xl hover:bg-slate-200 transition">Cancel</button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={!deleteReason.trim() || isDeleting}
                  className="flex-1 py-3 bg-red-600 text-white font-black text-sm uppercase tracking-widest rounded-2xl hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isDeleting ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Deleting...</> : 'Confirm Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =============================
          5. INTELLIGENCE MODAL (STATS & AI)
          ============================= */}
      {viewStatsEvent && (() => {
         const totalExpenses = (parseFloat(viewStatsEvent.food_cost)||0) + (parseFloat(viewStatsEvent.gas_cost)||0) + (parseFloat(viewStatsEvent.event_manager_pay)||0);
         const totalRevenue = (parseFloat(viewStatsEvent.profit)||0) + totalExpenses;
         return (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
           <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-indigo-50/50">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 text-white flex justify-center items-center rounded-xl"><BarChart3 className="w-5 h-5" /></div>
                    <div>
                       <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight leading-none">Event Intelligence</h2>
                       <p className="text-sm font-bold text-slate-500 mt-1">{viewStatsEvent.event_name}</p>
                    </div>
                 </div>
                 <button onClick={() => setViewStatsEvent(null)} className="p-2 bg-white rounded-xl"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 space-y-6">
                 <div className="grid grid-cols-3 gap-4">
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-center">
                       <p className="text-sm font-black text-slate-500 uppercase">Gross Revenue</p>
                       <p className="text-2xl font-black text-slate-800 mt-1">${totalRevenue.toFixed(2)}</p>
                    </div>
                    <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-center">
                       <p className="text-sm font-black text-red-500 uppercase">Expenses</p>
                       <p className="text-2xl font-black text-red-600 mt-1">${totalExpenses.toFixed(2)}</p>
                    </div>
                    <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-center">
                       <p className="text-sm font-black text-green-600 uppercase">Net Profit</p>
                       <p className="text-2xl font-black text-green-700 mt-1">${(parseFloat(viewStatsEvent.profit)||0).toFixed(2)}</p>
                    </div>
                 </div>
                 <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-5">
                    <h3 className="text-sm font-black text-blue-800 uppercase flex items-center gap-2 mb-3"><BrainCircuit className="w-4 h-4 text-blue-600" /> AI Insights</h3>
                    <p className="text-base font-bold text-slate-700">{generateAIAdvice(parseFloat(viewStatsEvent.profit) || 0, totalExpenses, parseFloat(viewStatsEvent.food_cost) || 0, parseFloat(viewStatsEvent.gas_cost) || 0)}</p>
                 </div>
              </div>
           </div>
         </div>
         );
      })()}
    </div>
  );
};

export default Events;


