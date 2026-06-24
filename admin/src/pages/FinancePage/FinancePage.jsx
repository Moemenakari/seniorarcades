/**
 * ============================================================
 * ADMIN FINANCE MANAGEMENT PAGE
 * ============================================================
 * Final Graduation Project Refactor
 * Purpose: Centralized financial control system for managing 
 * income (revenue), payments (expenses), and partner debts.
 * Includes a unified history audit trail for academic review.
 * ============================================================
 */

/**
 * ============================================================
 * ADMIN FINANCE MANAGEMENT PAGE
 * ============================================================
 * Final Graduation Project Refactor
 * Purpose: Centralized financial control system for managing 
 * income (revenue), payments (expenses), and partner debts.
 * Includes a unified history audit trail for academic review.
 * ============================================================
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  TrendingUp, TrendingDown, History, CheckCircle, AlertTriangle, 
  User, Clock, Calendar, Info, Check, Wallet, Trash2, Edit, 
  Banknote, Receipt, X, Download, Search
} from 'lucide-react';
import { API_BASE_URL as API } from '../../config';

// =============================
// REUSABLE UI COMPONENTS
// =============================

/**
 * GLASS CARD
 * ----------
 * Provides the standard glassmorphism container for financial widgets.
 */
const GlassCard = ({ children, className = "" }) => (
  <div className={`bg-white/80 backdrop-blur-xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl sm:rounded-3xl p-4 sm:p-6 ${className}`}>
    {children}
  </div>
);

// =============================
// MAIN FINANCE COMPONENT
// =============================
const Finance = () => {
  // ── NAVIGATION & UI STATE ──
  const [activeTab, setActiveTab] = useState('income'); 
  const [editingId, setEditingId] = useState(null);
  const [editingType, setEditingType] = useState(null);
  const currentAdmin = localStorage.getItem('nlg_admin') || 'System';
  
  // ── DATA COLLECTIONS ──
  const [eventsList, setEventsList] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [incomeRecords, setIncomeRecords] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  // ── FILTER STATES ──
  const [historySearch, setHistorySearch] = useState('');
  const [historyType, setHistoryType] = useState('all');
  const [historyUser, setHistoryUser] = useState('all');
  const [historyDate, setHistoryDate] = useState('');

  // ── FORM MODELS ──
  const [incomeForm, setIncomeForm] = useState({
    amount: '',
    source: 'Event Profit',
    event_id: '',
    event_name: '',
    notes: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [paymentForm, setPaymentForm] = useState({
    type: 'Company Expense', 
    amount: '',
    description: '',
    other_debt_reason: '',
    date: new Date().toISOString().split('T')[0]
  });

  // ── INITIALIZATION & FETCHING ──
  useEffect(() => {
    fetchAllData();
  }, [activeTab]);

  const fetchAllData = () => {
    fetchEvents();
    fetchExpenses();
    fetchIncomeRecords();
    fetchAuditLogs();
  };

  const fetchEvents = async () => {
    try {
      const res = await axios.get(`${API}/events`);
      setEventsList(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchExpenses = async () => {
    try {
      const res = await axios.get(`${API}/finances/expenses`);
      setExpenses(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchIncomeRecords = async () => {
    try {
      const res = await axios.get(`${API}/finances/income-records`).catch(() => ({ data: [] }));
      setIncomeRecords(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await axios.get(`${API}/finances/audit`);
      setAuditLogs(res.data);
    } catch (err) { console.error(err); }
  };

  // ── INCOME HANDLERS ──
  const handleAddIncome = async (e) => {
    e.preventDefault();
    if (!incomeForm.amount) return alert("Please enter amount.");

    try {
      if (editingId && editingType === 'Income') {
         alert("Editing Income is currently view-only. Use Delete/Add for changes.");
         setEditingId(null);
         setEditingType(null);
         setIncomeForm({ amount: '', source: 'Event Profit', event_id: '', event_name: '', notes: '', date: new Date().toISOString().split('T')[0] });
         return;
      }

      await axios.post(`${API}/finances/smart-income`, {
        ...incomeForm,
        amount: parseFloat(incomeForm.amount),
        source: incomeForm.source,
        notes: incomeForm.notes,
        time: new Date().toLocaleTimeString('en-GB', { hour12: false }).slice(0, 5),
        debt_payments: [],
        admin_name: currentAdmin
      });
      alert('Income saved successfully!');
      setIncomeForm({ amount: '', source: 'Event Profit', event_id: '', event_name: '', notes: '', date: new Date().toISOString().split('T')[0] });
      fetchAllData();
    } catch (err) {
      alert('Error saving income');
    }
  };

  // ── PAYMENT & DEBT HANDLERS ──
  const handleAddPayment = async (e) => {
    e.preventDefault();
    if (!paymentForm.amount || !paymentForm.description) return alert("Amount and description are required.");

    let paidBy = 'company';
    let paidByName = '';
    
    if (paymentForm.type === 'Debt to Moemen') paidBy = 'moemen';
    else if (paymentForm.type === 'Debt to Abd') paidBy = 'abd';
    else if (paymentForm.type === 'Other Debt') {
      paidBy = 'others';
      paidByName = paymentForm.other_debt_reason;
    }

    try {
      if (editingId && editingType !== 'Income') {
        await axios.put(`${API}/finances/expense/${editingId}`, {
          amount: parseFloat(paymentForm.amount),
          description: paymentForm.description,
          paid_by: paidBy,
          paid_by_name: paidByName,
          category: 'other',
          date: paymentForm.date,
          time: new Date().toLocaleTimeString('en-GB', { hour12: false }).slice(0, 5),
          admin_name: currentAdmin
        });
        alert('Payment/Debt updated successfully!');
        setEditingId(null);
        setEditingType(null);
      } else {
        await axios.post(`${API}/finances/expense`, {
          amount: parseFloat(paymentForm.amount),
          description: paymentForm.description,
          paid_by: paidBy,
          paid_by_name: paidByName,
          category: 'other',
          date: paymentForm.date,
          time: new Date().toLocaleTimeString('en-GB', { hour12: false }).slice(0, 5),
          admin_name: currentAdmin
        });
        alert('Payment/Debt saved successfully!');
      }
      
      setPaymentForm({ type: 'Company Expense', amount: '', description: '', other_debt_reason: '', date: new Date().toISOString().split('T')[0] });
      fetchAllData();
    } catch (err) {
      alert('Error saving payment');
    }
  };

  const handleMarkPaid = async (expenseId) => {
    if (window.confirm("Are you sure you want to mark this debt as PAID?")) {
      try {
        await axios.put(`${API}/finances/expense/${expenseId}/pay`, { admin_name: currentAdmin });
        alert("Debt marked as paid.");
        fetchAllData();
      } catch (err) {
        alert("Error marking as paid.");
      }
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    if (window.confirm("Delete this expense? This will reduce total expenses on the dashboard.")) {
      try {
        await axios.delete(`${API}/finances/expense/${expenseId}`);
        fetchAllData();
      } catch (err) {
        alert("Error deleting record.");
      }
    }
  };

  const handleDeleteIncome = async (incomeId) => {
    if (window.confirm("Delete this income record? This will reduce total revenue on the dashboard.")) {
      try {
        await axios.delete(`${API}/finances/income/${incomeId}`);
        fetchAllData();
      } catch (err) {
        alert("Error deleting income record.");
      }
    }
  };

  // ── EDIT & UTILITY HELPERS ──
  const handleEditItem = (item) => {
    setEditingId(item.id);
    
    if (item.type === 'Income') {
      setEditingType('Income');
      setIncomeForm({
        amount: item.amount,
        source: ['Event Profit', 'Rent', 'Revenue Split'].includes(item.source) ? item.source : 'Other',
        event_id: item.event_id || '',
        notes: item.notes || '',
        date: item.date || new Date().toISOString().split('T')[0]
      });
      setActiveTab('income');
    } else {
      setEditingType('Expense');
      let pType = 'Company Expense';
      if (item.paid_by === 'moemen') pType = 'Debt to Moemen';
      else if (item.paid_by === 'abd') pType = 'Debt to Abd';
      else if (item.paid_by === 'others') pType = 'Other Debt';

      setPaymentForm({
        type: pType,
        amount: item.amount,
        description: item.description,
        other_debt_reason: item.paid_by_name || '',
        date: item.date || new Date().toISOString().split('T')[0]
      });
      setActiveTab('payments');
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingType(null);
    if (activeTab === 'income') {
      setIncomeForm({ amount: '', source: 'Event Profit', event_id: '', event_name: '', notes: '', date: new Date().toISOString().split('T')[0] });
    } else {
      setPaymentForm({ type: 'Company Expense', amount: '', description: '', other_debt_reason: '', date: new Date().toISOString().split('T')[0] });
    }
  };

  const handleExportCSV = () => {
    const csvRows = [];
    csvRows.push(['Date', 'Time', 'Type', 'Description', 'Amount', 'User', 'Status'].join(','));
    
    unifiedHistory.forEach(item => {
      const desc = item.description ? item.description.replace(/"/g, '""') : '';
      const row = [
        item.date,
        item.time || '',
        item.displayType,
        `"${desc}"`,
        item.type === 'Income' ? `+${item.amount}` : `-${item.amount}`,
        item.admin_name || 'System',
        item.status
      ];
      csvRows.push(row.join(','));
    });
    
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `NLG_Finance_History_${new Date().getFullYear()}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Combine Income and Expenses into a single sorted chronological list
  const unifiedHistory = [
    ...expenses.map(ex => ({
      ...ex,
      type: ex.paid_by === 'company' ? 'Expense' : 'Debt',
      displayType: ex.paid_by === 'company' ? 'Company Expense' : `Debt to ${ex.paid_by === 'others' ? ex.paid_by_name : ex.paid_by}`,
      timestamp: new Date(`${ex.date}T${ex.time || '00:00'}`).getTime()
    })),
    ...incomeRecords.map(inc => ({
      ...inc,
      id: inc.id,
      type: 'Income',
      displayType: inc.source || 'Income',
      description: inc.notes || inc.event_name || 'General Income',
      amount: inc.amount,
      status: 'paid', 
      admin_name: inc.admin_name || 'System',
      timestamp: new Date(inc.created_at || inc.date).getTime()
    }))
  ].sort((a, b) => b.timestamp - a.timestamp)
   .filter(item => {
      const matchesSearch = 
        item.description?.toLowerCase().includes(historySearch.toLowerCase()) ||
        item.displayType?.toLowerCase().includes(historySearch.toLowerCase());
      
      const matchesType = historyType === 'all' || item.type.toLowerCase() === historyType.toLowerCase();
      const matchesDate = !historyDate || item.date === historyDate;
      const matchesUser = historyUser === 'all' || item.admin_name?.toLowerCase().includes(historyUser.toLowerCase());

      return matchesSearch && matchesType && matchesDate && matchesUser;
   });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      
      {/* =============================
          1. HEADER & PAGE TITLE
          ============================= */}
      <div className="text-center md:text-left">
        <h1 className="text-xl sm:text-3xl font-black text-gray-900 tracking-tight">Finance Center</h1>
        <p className="text-sm sm:text-base text-gray-500 font-medium mt-1">Organized system for Income, Payments, and History.</p>
      </div>

      {/* =============================
          2. NAVIGATION TABS
          ============================= */}
      <div className="flex gap-2 sm:gap-4 border-b border-gray-200 pb-4 overflow-x-auto">
         <button onClick={() => setActiveTab('income')} className={`flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider sm:tracking-widest transition-all whitespace-nowrap ${activeTab === 'income' ? 'bg-green-600 text-white shadow-lg' : 'bg-white text-gray-500 hover:bg-gray-100'}`}>
            <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Income
         </button>
         <button onClick={() => setActiveTab('payments')} className={`flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider sm:tracking-widest transition-all whitespace-nowrap ${activeTab === 'payments' ? 'bg-red-600 text-white shadow-lg' : 'bg-white text-gray-500 hover:bg-gray-100'}`}>
            <TrendingDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Payments
         </button>
         <button onClick={() => setActiveTab('history')} className={`flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider sm:tracking-widest transition-all whitespace-nowrap ${activeTab === 'history' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-gray-500 hover:bg-gray-100'}`}>
            <History className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> History
         </button>
      </div>

      {/* =============================
          3. TAB CONTENT: INCOME
          ============================= */}
      {activeTab === 'income' && (
        <GlassCard className="max-w-2xl mx-auto border-t-4 border-t-green-500 relative">
          {editingId && (
            <button onClick={cancelEdit} className="absolute top-6 right-6 flex items-center gap-1 text-sm font-black uppercase text-gray-400 hover:text-gray-600 transition">
              <X className="w-4 h-4" /> Cancel Edit
            </button>
          )}
          <div className="mb-6">
            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2"><TrendingUp className="text-green-500"/> {editingId ? 'Edit Income' : 'Add Income'}</h2>
            <p className="text-sm font-bold text-gray-500 mt-1">Only for money entering the company.</p>
          </div>
          
          <form onSubmit={handleAddIncome} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-black text-gray-500 uppercase tracking-widest">Amount ($)</label>
                <input type="number" step="0.01" required className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-xl font-black text-green-600" value={incomeForm.amount} onChange={e => setIncomeForm({...incomeForm, amount: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black text-gray-500 uppercase tracking-widest">Date</label>
                <input type="date" required className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-base font-bold text-gray-700" value={incomeForm.date} onChange={e => setIncomeForm({...incomeForm, date: e.target.value})} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-black text-gray-500 uppercase tracking-widest">Income Type</label>
              <select className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-base font-bold text-gray-700" value={incomeForm.source} onChange={e => setIncomeForm({...incomeForm, source: e.target.value})}>
                <option value="Event Profit">Event Profit</option>
                <option value="Rent">Rent</option>
                <option value="Revenue Split">Revenue Split</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {incomeForm.source === 'Event Profit' && (
              <div className="space-y-2">
                <label className="text-sm font-black text-gray-500 uppercase tracking-widest">Select Event (Optional)</label>
                <select className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-base font-bold text-gray-700" value={incomeForm.event_id} onChange={e => setIncomeForm({...incomeForm, event_id: e.target.value})}>
                  <option value="">-- No Event --</option>
                  {eventsList.slice(0, 15).map(ev => <option key={ev.id} value={ev.id}>{ev.event_name}</option>)}
                </select>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-black text-gray-500 uppercase tracking-widest">Notes / Details</label>
              <input type="text" placeholder="Explain the income..." className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-base font-bold text-gray-700" value={incomeForm.notes} onChange={e => setIncomeForm({...incomeForm, notes: e.target.value})} />
            </div>

            <button type="submit" className="w-full py-4 bg-green-500 text-white rounded-xl font-black text-lg hover:bg-green-600 transition-all shadow-lg shadow-green-500/30 flex justify-center items-center gap-2">
              <CheckCircle className="w-6 h-6" /> {editingId ? 'Update Income' : 'Save Income'}
            </button>
          </form>
        </GlassCard>
      )}

      {/* =============================
          4. TAB CONTENT: PAYMENTS & DEBTS
          ============================= */}
      {activeTab === 'payments' && (
        <GlassCard className="max-w-2xl mx-auto border-t-4 border-t-red-500 relative">
          {editingId && (
            <button onClick={cancelEdit} className="absolute top-6 right-6 flex items-center gap-1 text-sm font-black uppercase text-gray-400 hover:text-gray-600 transition">
              <X className="w-4 h-4" /> Cancel Edit
            </button>
          )}
          <div className="mb-6">
            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2"><TrendingDown className="text-red-500"/> {editingId ? 'Edit Payment / Debt' : 'Add Payment / Debt'}</h2>
            <p className="text-sm font-bold text-gray-500 mt-1">Record company expenses or partner debts.</p>
          </div>

          <form onSubmit={handleAddPayment} className="space-y-6">
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
              <label className="text-sm font-black text-gray-800 uppercase tracking-widest">Payment Type</label>
              <select className="w-full bg-white border border-gray-200 rounded-xl p-4 text-base font-bold text-gray-900 shadow-sm" value={paymentForm.type} onChange={e => setPaymentForm({...paymentForm, type: e.target.value})}>
                <option value="Company Expense">Company Expense</option>
                <option value="Debt to Moemen">Debt to Moemen</option>
                <option value="Debt to Abd">Debt to Abd</option>
                <option value="Other Debt">Other Debt</option>
              </select>
            </div>

            {paymentForm.type === 'Other Debt' && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                <label className="text-sm font-black text-gray-500 uppercase tracking-widest">Who is the debt to?</label>
                <input type="text" required placeholder="Name of the person..." className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-base font-bold text-gray-700" value={paymentForm.other_debt_reason} onChange={e => setPaymentForm({...paymentForm, other_debt_reason: e.target.value})} />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-black text-gray-500 uppercase tracking-widest">Amount ($)</label>
                <input type="number" step="0.01" required className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-xl font-black text-red-600" value={paymentForm.amount} onChange={e => setPaymentForm({...paymentForm, amount: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black text-gray-500 uppercase tracking-widest">Date</label>
                <input type="date" required className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-base font-bold text-gray-700" value={paymentForm.date} onChange={e => setPaymentForm({...paymentForm, date: e.target.value})} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-black text-gray-500 uppercase tracking-widest">Description</label>
              <input type="text" required placeholder="e.g. Fuel, Rent..." className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-base font-bold text-gray-700" value={paymentForm.description} onChange={e => setPaymentForm({...paymentForm, description: e.target.value})} />
            </div>

            <button type="submit" className="w-full py-4 bg-red-500 text-white rounded-xl font-black text-lg hover:bg-red-600 transition-all shadow-lg shadow-red-500/30 flex justify-center items-center gap-2">
              <CheckCircle className="w-6 h-6" /> {editingId ? 'Update Payment' : 'Save Payment'}
            </button>
          </form>
        </GlassCard>
      )}

      {/* =============================
          5. TAB CONTENT: HISTORY & ARCHIVE
          ============================= */}
      {activeTab === 'history' && (
        <GlassCard className="border-t-4 border-t-indigo-500 overflow-hidden">
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 flex items-center gap-2"><History className="text-indigo-500"/> Full Archive</h2>
              <p className="text-xs sm:text-sm font-bold text-gray-500 mt-1">All history is preserved safely. Export for backups.</p>
            </div>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
               <div className="relative flex-1 sm:w-48">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    placeholder="Search history..." 
                    value={historySearch}
                    onChange={e => setHistorySearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold outline-none focus:border-indigo-500 transition"
                  />
               </div>
               <select 
                 value={historyType}
                 onChange={e => setHistoryType(e.target.value)}
                 className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold outline-none focus:border-indigo-500 transition"
               >
                 <option value="all">All Types</option>
                 <option value="income">Income</option>
                 <option value="expense">Expense</option>
                 <option value="debt">Debt</option>
               </select>
               <select 
                 value={historyUser}
                 onChange={e => setHistoryUser(e.target.value)}
                 className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold outline-none focus:border-indigo-500 transition"
               >
                 <option value="all">All Users</option>
                 <option value="moemen">Moemen</option>
                 <option value="abd">Abd</option>
               </select>
               <input 
                 type="date" 
                 value={historyDate}
                 onChange={e => setHistoryDate(e.target.value)}
                 className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold outline-none focus:border-indigo-500 transition"
               />
               <button onClick={handleExportCSV} className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-black text-xs sm:text-sm uppercase tracking-widest hover:bg-indigo-700 transition shadow-lg shadow-indigo-500/30 flex items-center gap-2">
                 <Download className="w-4 h-4" /> Export
               </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-500 uppercase text-sm font-black tracking-widest">
                  <th className="p-4 rounded-tl-xl">Date</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Description</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">User</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 rounded-tr-xl text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {unifiedHistory.map((item, idx) => (
                  <tr key={`${item.type}-${item.id}-${idx}`} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 whitespace-nowrap text-sm font-bold text-gray-600">
                      {item.date} <span className="text-gray-400 font-medium ml-1">{item.time || ''}</span>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-sm font-black uppercase tracking-widest ${
                        item.type === 'Income' ? 'bg-green-100 text-green-700' :
                        item.type === 'Expense' ? 'bg-gray-200 text-gray-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {item.displayType}
                      </span>
                    </td>
                    <td className="p-4 text-base font-bold text-gray-900 max-w-xs truncate" title={item.description}>
                      {item.description}
                    </td>
                    <td className="p-4 whitespace-nowrap font-black text-base">
                      <span className={`${
                        item.type === 'Income' ? 'text-green-600' :
                        item.type === 'Expense' ? 'text-gray-900' :
                        'text-red-600'
                      }`}>
                        {item.type === 'Income' ? '+' : '-'}${parseFloat(item.amount).toFixed(2)}
                      </span>
                    </td>
                    <td className="p-4 whitespace-nowrap text-sm font-bold text-gray-500 uppercase">
                      {item.admin_name || 'System'}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      {item.status === 'paid' ? (
                        <span className="text-sm font-black text-green-500 flex items-center gap-1"><CheckCircle className="w-3 h-3"/> Paid</span>
                      ) : (
                        <span className="text-sm font-black text-orange-500 flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> Unpaid</span>
                      )}
                    </td>
                    <td className="p-4 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-2 items-center">
                        <button onClick={() => handleEditItem(item)} className="p-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-100">
                           <Edit className="w-4 h-4" />
                        </button>

                        {(item.type === 'Expense' || item.type === 'Debt') && item.status !== 'paid' && (
                          <button onClick={() => handleMarkPaid(item.id)} className="px-3 py-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg text-sm font-black uppercase transition-colors border border-green-200">
                            Mark Paid
                          </button>
                        )}

                        <button
                          onClick={() => item.type === 'Income' ? handleDeleteIncome(item.id) : handleDeleteExpense(item.id)}
                          className="p-2 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg transition-colors border border-red-100"
                          title="Delete record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}

    </div>
  );
};

export default Finance;

