/**
 * ============================================================
 * ADMIN EXPENSES MANAGEMENT PAGE
 * ============================================================
 * Final Graduation Project Refactor
 * Purpose: Operational expense tracking and audit logging. 
 * Monitors spending across fuel, food, and maintenance, 
 * categorized by event and personnel.
 * ============================================================
 */

import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Filter, Trash2, Fuel, Truck, Utensils, Hammer, 
  MoreHorizontal, Calendar, Check, Edit, Wrench, CheckSquare, Square 
} from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL as API } from '../../config';

// =============================
// MAIN EXPENSES COMPONENT
// =============================
const Expenses = () => {
  // ── STATE MANAGEMENT: UI & DATA ──
  const [expenses, setExpenses] = useState([]);
  const [events, setEvents] = useState([]);
  const [todaysEvent, setTodaysEvent] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  
  // ── STATE MANAGEMENT: FORM DATA ──
  const [newExpense, setNewExpense] = useState({ 
    amount: '', paid_by: 'moemen', category: 'fuel', description: '', day_type: 'work_day', 
    event_id: '', event_name: '', date: new Date().toISOString().split('T')[0] 
  });

  // ── CATEGORY CONFIGURATION ──
  const CATEGORIES = {
    fuel: { icon: Fuel, color: 'bg-orange-100 text-orange-600' },
    transport: { icon: Truck, color: 'bg-blue-100 text-blue-600' },
    food: { icon: Utensils, color: 'bg-green-100 text-green-600' },
    festival: { icon: Hammer, color: 'bg-purple-100 text-purple-600' },
    equipment: { icon: Wrench, color: 'bg-amber-100 text-amber-600' },
    other: { icon: MoreHorizontal, color: 'bg-slate-100 text-slate-600' }
  };

  const PAID_BY_COLORS = {
    moemen: 'bg-green-100 text-green-700',
    abd: 'bg-blue-100 text-blue-700',
    company: 'bg-orange-100 text-orange-700'
  };

  // ── INITIALIZATION & FETCHING ──
  useEffect(() => {
    fetchExpenses();
    fetchEvents();
    fetchTodaysEvent();
  }, []);

  const fetchExpenses = async () => {
    try {
      const res = await axios.get(`${API}/finances/expenses`);
      setExpenses(res.data);
    } catch (err) {
      console.error("Expense fetch error");
    }
  };

  const fetchEvents = async () => {
    try {
      const res = await axios.get(`${API}/events`);
      setEvents(res.data);
    } catch (err) {}
  };

  const fetchTodaysEvent = async () => {
    try {
      const res = await axios.get(`${API}/events/today`);
      if (res.data) {
        setTodaysEvent(res.data);
        setNewExpense(prev => ({ ...prev, event_id: res.data.id, event_name: res.data.event_name }));
      }
    } catch (err) {}
  };

  // ── CRUD OPERATIONS ──
  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!newExpense.description) {
      alert('Description is required!');
      return;
    }
    try {
      await axios.post(`${API}/finances/expense`, newExpense);
      fetchExpenses();
      setNewExpense({ 
        amount: '', paid_by: 'moemen', category: 'fuel', description: '', 
        day_type: 'work_day', event_id: todaysEvent?.id || '', 
        event_name: todaysEvent?.event_name || '', date: new Date().toISOString().split('T')[0] 
      });
      alert("Expense recorded!");
    } catch (err) {
      alert("Error adding expense");
    }
  };

  const handleMarkPaid = async (id) => {
    try {
      await axios.put(`${API}/finances/expense/${id}/pay`, { event_id: todaysEvent?.id });
      fetchExpenses();
      alert("Marked as paid!");
    } catch (err) {
      alert("Error marking as paid");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Archive this expense?')) {
      await axios.delete(`${API}/finances/expense/${id}`);
      fetchExpenses();
    }
  };

  // ── SELECTION LOGIC ──
  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };
  const selectAll = () => {
    if (selectedIds.length === expenses.length) setSelectedIds([]);
    else setSelectedIds(expenses.map(e => e.id));
  };

  const selectedExpenses = expenses.filter(e => selectedIds.includes(e.id));
  const totalSelectedMoemen = selectedExpenses.filter(e => e.paid_by === 'moemen').reduce((s, e) => s + parseFloat(e.amount || 0), 0);
  const totalSelectedAbd = selectedExpenses.filter(e => e.paid_by === 'abd').reduce((s, e) => s + parseFloat(e.amount || 0), 0);
  const totalSelectedCompany = selectedExpenses.filter(e => e.paid_by === 'company').reduce((s, e) => s + parseFloat(e.amount || 0), 0);
  const totalSelectedAll = selectedExpenses.reduce((s, e) => s + parseFloat(e.amount || 0), 0);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      
      {/* =============================
          1. PAGE HEADER
          ============================= */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-[#0f172a] tracking-tighter uppercase">Operations Log</h2>
          <p className="text-slate-500 font-medium mt-1">Track every dollar spent on festivals and maintenance.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* =============================
            2. EXPENSES LISTING
            ============================= */}
        <div className="lg:col-span-2 space-y-6">
           <div className="premium-card overflow-hidden">
             <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <div className="flex items-center gap-3">
                   <button onClick={selectAll} className="text-slate-400 hover:text-indigo-600 transition-colors">
                     {selectedIds.length === expenses.length && expenses.length > 0 ? <CheckSquare className="w-5 h-5 text-indigo-600" /> : <Square className="w-5 h-5" />}
                   </button>
                   <span className="text-sm font-black uppercase text-slate-400 tracking-widest">Recent Transactions</span>
                </div>
                <Search className="w-4 h-4 text-slate-300" />
             </div>
             <div className="divide-y divide-slate-50">
               {expenses.length === 0 ? (
                 <div className="p-12 text-center text-slate-300 font-bold uppercase text-sm tracking-widest italic">No expenses recorded yet.</div>
               ) : expenses.map(ex => {
                 const Cat = CATEGORIES[ex.category]?.icon || MoreHorizontal;
                 return (
                   <div key={ex.id} className={`p-6 flex items-center justify-between hover:bg-slate-50 transition-colors group ${selectedIds.includes(ex.id) ? 'bg-indigo-50/40' : ''}`}>
                      <div className="flex items-center gap-4">
                         <button onClick={() => toggleSelect(ex.id)} className="text-slate-300 hover:text-indigo-500 transition-colors">
                           {selectedIds.includes(ex.id) ? <CheckSquare className="w-4 h-4 text-indigo-500" /> : <Square className="w-4 h-4" />}
                         </button>
                         <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${CATEGORIES[ex.category]?.color || 'bg-slate-100'}`}>
                            <Cat className="w-4 h-4" />
                         </div>
                         <div>
                            <p className="font-bold text-slate-900">{ex.description}</p>
                            <div className="flex items-center gap-3 mt-1">
                               <span className={`text-sm font-black uppercase px-2 py-0.5 rounded-md ${PAID_BY_COLORS[ex.paid_by] || 'bg-slate-100 text-slate-600'}`}>
                                 {ex.paid_by}
                               </span>
                               <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                               <span className="text-sm font-black uppercase text-slate-400">{ex.date ? new Date(ex.date).toLocaleDateString() : '-'}</span>
                               {ex.event_name && (
                                 <>
                                   <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                                   <span className="text-sm font-black uppercase text-blue-500">{ex.event_name}</span>
                                 </>
                               )}
                            </div>
                         </div>
                      </div>
                      <div className="flex items-center gap-4">
                         <div className="text-right">
                            <p className="text-lg font-black text-slate-900">-${ex.amount}</p>
                            <span className="text-sm font-black uppercase text-slate-400 tracking-widest">{(ex.day_type || '').replace('_', ' ')}</span>
                         </div>
                         <div className="flex gap-2 opacity-100 transition-opacity">
                            {ex.status === 'unpaid' && (
                              <button onClick={() => handleMarkPaid(ex.id)} className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors" title="Mark as Paid">
                                <Check className="w-4 h-4" />
                              </button>
                            )}
                            <button onClick={() => handleDelete(ex.id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors" title="Archive">
                              <Trash2 className="w-4 h-4" />
                            </button>
                         </div>
                      </div>
                   </div>
                 );
               })}
             </div>
           </div>
        </div>

        {/* =============================
            3. LOGGING ASIDE (FORM)
            ============================= */}
        <aside>
           <div className="premium-card p-8">
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-8">Log New Expense</h3>
              <form onSubmit={handleAddExpense} className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-sm font-black text-slate-400 uppercase tracking-widest ml-1">Amount ($)</label>
                    <input 
                       type="number" 
                       required 
                       className="premium-input text-xl font-black text-red-600"
                       value={newExpense.amount}
                       onChange={e => setNewExpense({...newExpense, amount: e.target.value})}
                    />
                 </div>

                 <div className="space-y-2">
                    <label className="text-sm font-black text-slate-400 uppercase tracking-widest ml-1">Paid By</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[{v:'moemen', l:'🟢 Moemen'}, {v:'abd', l:'🔵 Abd'}, {v:'company', l:'🟠 Company'}].map(opt => (
                        <button type="button" key={opt.v} onClick={() => setNewExpense({...newExpense, paid_by: opt.v})}
                          className={`py-2.5 rounded-xl text-sm font-black transition-all ${newExpense.paid_by === opt.v ? 'bg-[#0f172a] text-white shadow-lg' : 'bg-slate-50 border border-slate-200 text-slate-600'}`}>
                          {opt.l}
                        </button>
                      ))}
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-sm font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                    <select 
                       className="premium-input bg-white appearance-none"
                       value={newExpense.category}
                       onChange={e => setNewExpense({...newExpense, category: e.target.value})}
                    >
                       {Object.keys(CATEGORIES).map(cat => (
                         <option key={cat} value={cat}>{cat.replace('_', ' ')}</option>
                       ))}
                    </select>
                 </div>

                 <div className="space-y-2">
                    <label className="text-sm font-black text-slate-400 uppercase tracking-widest ml-1">Description (REQUIRED)</label>
                    <input 
                       type="text" 
                       required
                       placeholder="e.g. Fuel for generator @ Beirut Souks"
                       className="premium-input"
                       value={newExpense.description}
                       onChange={e => setNewExpense({...newExpense, description: e.target.value})}
                    />
                 </div>

                 <div className="space-y-2">
                    <label className="text-sm font-black text-slate-400 uppercase tracking-widest ml-1">Day Type</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button type="button" onClick={() => setNewExpense({...newExpense, day_type: 'work_day'})}
                        className={`py-2.5 rounded-xl text-sm font-black transition-all ${newExpense.day_type === 'work_day' ? 'bg-[#0f172a] text-white shadow-lg' : 'bg-slate-50 border border-slate-200 text-slate-600'}`}>
                        Work Day
                      </button>
                      <button type="button" onClick={() => setNewExpense({...newExpense, day_type: 'off_day', event_id: '', event_name: ''})}
                        className={`py-2.5 rounded-xl text-sm font-black transition-all ${newExpense.day_type === 'off_day' ? 'bg-[#0f172a] text-white shadow-lg' : 'bg-slate-50 border border-slate-200 text-slate-600'}`}>
                        Off Day
                      </button>
                    </div>
                 </div>

                 {newExpense.day_type === 'work_day' && (
                   <div className="space-y-2">
                     <label className="text-sm font-black text-slate-400 uppercase tracking-widest ml-1">Event Name</label>
                     <select className="premium-input bg-white" value={newExpense.event_id} onChange={e => {
                       const ev = events.find(ev => ev.id === parseInt(e.target.value));
                       setNewExpense({...newExpense, event_id: e.target.value, event_name: ev?.event_name || ''});
                     }}>
                       <option value="">Select Event...</option>
                       {events.map(ev => <option key={ev.id} value={ev.id}>{ev.event_name}</option>)}
                     </select>
                     {todaysEvent && (
                       <p className="text-sm text-blue-500 font-bold">💡 Auto-suggested: {todaysEvent.event_name}</p>
                     )}
                   </div>
                 )}

                 <div className="space-y-2">
                   <label className="text-sm font-black text-slate-400 uppercase tracking-widest ml-1">Date</label>
                   <input type="date" required className="premium-input" value={newExpense.date} onChange={e => setNewExpense({...newExpense, date: e.target.value})} />
                 </div>

                 <button className="btn-navy w-full flex items-center justify-center gap-3 mt-4">
                    <Plus className="w-5 h-5" /> Record Log
                 </button>
              </form>
           </div>
        </aside>
      </div>

      {/* =============================
          4. SELECTION SUMMARY BAR
          ============================= */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-8 border border-slate-700 animate-in slide-in-from-bottom-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center font-black text-sm">
              {selectedIds.length}
            </div>
            <span className="text-sm font-black uppercase tracking-widest text-slate-300">Selected<br/>Expenses</span>
          </div>

          <div className="flex gap-6 border-l border-slate-700 pl-6">
            <div>
              <p className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">Moemen Total</p>
              <p className="text-base font-bold text-green-400">${totalSelectedMoemen.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">Abd Total</p>
              <p className="text-base font-bold text-blue-400">${totalSelectedAbd.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">Company Total</p>
              <p className="text-base font-bold text-orange-400">${totalSelectedCompany.toFixed(2)}</p>
            </div>
            <div className="border-l border-slate-700 pl-6">
              <p className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">Grand Total</p>
              <p className="text-base font-black text-white">${totalSelectedAll.toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;

