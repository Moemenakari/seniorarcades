/**
 * ============================================================
 * ADMIN INCOME & PROFIT CONTROL PAGE
 * ============================================================
 * Final Graduation Project Refactor
 * Purpose: Strategic revenue management and profit distribution. 
 * Handles smart settlement of partner debts, automated expense 
 * deductions, and multi-founder profit sharing.
 * ============================================================
 */

import React, { useState, useEffect } from 'react';
import { 
  Plus, DollarSign, ChevronRight, AlertCircle, CheckSquare, 
  ArrowRight, TrendingUp, CreditCard, Target, Banknote, 
  Check, Minus, X 
} from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL as API } from '../../config';

// =============================
// MAIN INCOME COMPONENT
// =============================
const Income = () => {
  // ── STATE MANAGEMENT: CORE DATA ──
  const [debts, setDebts] = useState([]);
  const [incomeData, setIncomeData] = useState({ 
    event_name: '', amount: '', location: '', 
    date: new Date().toISOString().split('T')[0], 
    rating: '', manager_name: '', notes: '' 
  });
  const [settlements, setSettlements] = useState({});
  
  // ── STATE MANAGEMENT: SMART PANEL ──
  const [showSmartPanel, setShowSmartPanel] = useState(false);
  const [lastEventId, setLastEventId] = useState(null);
  const [selectedDebts, setSelectedDebts] = useState([]);
  const [extraExpenses, setExtraExpenses] = useState([]);
  const [profitSplit, setProfitSplit] = useState(50);
  const [keepInCompany, setKeepInCompany] = useState(false);
  const [isDataConfirmed, setIsDataConfirmed] = useState(false);

  // ── INITIALIZATION ──
  useEffect(() => {
    fetchDebts();
  }, []);

  const fetchDebts = async () => {
    try {
      const res = await axios.get(`${API}/finances/debts`);
      setDebts(res.data);
    } catch (err) {
      console.error("Debt fetch error");
    }
  };

  // ── SMART CALCULATIONS ──
  const totalDebtsToPay = debts.filter(d => selectedDebts.includes(d.id)).reduce((s, d) => s + parseFloat(d.amount), 0);
  const totalExtraExpenses = extraExpenses.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);
  const remaining = (parseFloat(incomeData.amount) || 0) - totalDebtsToPay - totalExtraExpenses;

  // ── EVENT HANDLERS ──
  const handleSettle = async (id) => {
    try {
      await axios.post(`${API}/finances/settle/${id}`, {
        amount: settlements[id],
        event_id: lastEventId
      });
      fetchDebts();
      alert("Debt settled!");
    } catch (err) {
      alert("Error settling debt");
    }
  };

  const handleAddIncome = async (e) => {
    e.preventDefault();
    try {
       const res = await axios.post(`${API}/finances/income`, incomeData);
       setLastEventId(res.data.event_id);
       setShowSmartPanel(true);
       fetchDebts();
       alert("Income recorded! Now use the Smart Panel to distribute profits.");
    } catch (err) {
       alert("Error adding income");
    }
  };

  const handleFinalConfirm = async () => {
    try {
      await axios.post(`${API}/finances/settle-event`, {
        event_id: lastEventId,
        debt_ids: selectedDebts,
        extra_expenses: extraExpenses,
        profit_split: profitSplit,
        keep_in_company: keepInCompany,
        moemen_share: (remaining * (profitSplit / 100)),
        abd_share: (remaining * ((100 - profitSplit) / 100))
      });
      setShowSmartPanel(false);
      setIsDataConfirmed(false);
      setIncomeData({ 
        event_name: '', amount: '', location: '', 
        date: new Date().toISOString().split('T')[0], 
        rating: '', manager_name: '', notes: '' 
      });
      setSelectedDebts([]);
      setExtraExpenses([]);
      fetchDebts();
      alert("✅ Settlement complete! Debts cleared, expenses recorded, profits distributed.");
    } catch (err) {
      alert("Settlement error");
    }
  };

  const addExtraExpense = () => {
    setExtraExpenses([...extraExpenses, { amount: '', category: 'fuel', description: '' }]);
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      
      {/* =============================
          1. PAGE HEADER
          ============================= */}
      <div>
        <h2 className="text-4xl font-black text-[#0f172a] tracking-tighter uppercase">Capital & Profit Control</h2>
        <p className="text-slate-500 font-medium mt-1">Manage event revenue, settle debts, and distribute founder profits.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* =============================
            2. PENDING DEBTS SECTION
            ============================= */}
        <section className="space-y-6">
           <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-xl">
                 <AlertCircle className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Pending Partner Debts</h3>
           </div>
           
           <div className="space-y-4">
              {debts.length === 0 ? (
                <div className="premium-card p-12 text-center flex flex-col items-center">
                   <CheckSquare className="w-12 h-12 text-green-200 mb-4" />
                   <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">All partners cleared</p>
                </div>
              ) : debts.filter(d => d.status === 'pending').map(debt => (
                <div key={debt.id} className="premium-card p-6 flex flex-col gap-4">
                   <div className="flex justify-between items-start">
                     <div>
                       <span className={`badge ${debt.partner_name === 'moemen' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                         {debt.partner_name}
                       </span>
                       <h4 className="text-lg font-black mt-2 text-slate-900">${debt.amount}</h4>
                       <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Added: {new Date(debt.created_at).toLocaleDateString()}</p>
                       {debt.event_name && <p className="text-sm font-bold text-blue-500 mt-1">Event: {debt.event_name}</p>}
                     </div>
                     <div className="p-3 bg-slate-50 rounded-2xl">
                        <DollarSign className="w-5 h-5 text-slate-400" />
                     </div>
                   </div>
                   
                   <div className="flex gap-2">
                      <button 
                        onClick={() => handleSettle(debt.id)}
                        className="flex-1 px-6 py-3 bg-[#0f172a] text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 shadow-lg shadow-slate-900/10 transition-all"
                      >
                        Settle Now
                      </button>
                   </div>
                </div>
              ))}
           </div>
        </section>

        {/* =============================
            3. RECORD REVENUE SECTION
            ============================= */}
        <section className="space-y-6">
           <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-50 rounded-xl">
                 <Target className="w-5 h-5 text-yellow-600" />
              </div>
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Record Event Revenue</h3>
           </div>

           <form onSubmit={handleAddIncome} className="premium-card p-8 space-y-6">
              <div className="space-y-2">
                 <label className="text-sm font-black text-slate-400 uppercase tracking-widest ml-1">Event / Festival Name (Required)</label>
                 <input 
                    type="text" 
                    required 
                    className="premium-input border-blue-100"
                    value={incomeData.event_name}
                    onChange={e => setIncomeData({...incomeData, event_name: e.target.value})}
                 />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label className="text-sm font-black text-slate-400 uppercase tracking-widest ml-1">Total Amount ($)</label>
                    <input 
                       type="number" 
                       required 
                       className="premium-input text-2xl font-black text-blue-600"
                       value={incomeData.amount}
                       onChange={e => setIncomeData({...incomeData, amount: e.target.value})}
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-sm font-black text-slate-400 uppercase tracking-widest ml-1">Date</label>
                    <input 
                       type="date" 
                       className="premium-input"
                       value={incomeData.date}
                       onChange={e => setIncomeData({...incomeData, date: e.target.value})}
                    />
                 </div>
              </div>

              <div className="space-y-2">
                 <label className="text-sm font-black text-slate-400 uppercase tracking-widest ml-1">Location / Venue</label>
                 <input 
                    type="text" 
                    className="premium-input"
                    value={incomeData.location}
                    onChange={e => setIncomeData({...incomeData, location: e.target.value})}
                 />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label className="text-sm font-black text-slate-400 uppercase tracking-widest ml-1">Rating (1-5)</label>
                    <input type="number" min="1" max="5" className="premium-input" value={incomeData.rating} onChange={e => setIncomeData({...incomeData, rating: e.target.value})} />
                 </div>
                 <div className="space-y-2">
                    <label className="text-sm font-black text-slate-400 uppercase tracking-widest ml-1">Manager Name</label>
                    <input type="text" className="premium-input" value={incomeData.manager_name} onChange={e => setIncomeData({...incomeData, manager_name: e.target.value})} />
                 </div>
              </div>

              <div className="space-y-2">
                 <label className="text-sm font-black text-slate-400 uppercase tracking-widest ml-1">Notes</label>
                 <textarea className="premium-input" rows="2" value={incomeData.notes} onChange={e => setIncomeData({...incomeData, notes: e.target.value})} />
              </div>

              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                 <div className="flex items-center gap-3 mb-4">
                    <Banknote className="w-5 h-5 text-[#0f172a]" />
                    <span className="text-sm font-black uppercase text-slate-500 tracking-widest">Automation Logic</span>
                 </div>
                 <p className="text-sm font-medium text-slate-500 leading-relaxed">
                    Recording this income will open the Smart Financial Panel to settle debts, add extra expenses, and distribute profits automatically.
                 </p>
              </div>

              <button className="w-full py-5 bg-[#0f172a] text-white font-black uppercase tracking-widest rounded-[1.5rem] shadow-2xl shadow-slate-900/20 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-3">
                 Record & Distribute <ArrowRight className="w-5 h-5" />
              </button>
           </form>
        </section>
      </div>

      {/* =============================
          4. SMART FINANCIAL PANEL (MODAL)
          ============================= */}
      {showSmartPanel && (
        <div className="premium-card p-8 space-y-8 border-2 border-blue-200">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-black text-[#0f172a] uppercase tracking-tight">🧠 Smart Financial Panel</h3>
            <button onClick={() => setShowSmartPanel(false)} className="p-2 hover:bg-slate-100 rounded-xl"><X className="w-5 h-5" /></button>
          </div>

          {/* Step 1: Debts */}
          <div className="space-y-4">
            <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">1️⃣ Select Debts to Settle</h4>
            {debts.filter(d => d.status === 'pending').map(debt => (
              <label key={debt.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                <input type="checkbox" checked={selectedDebts.includes(debt.id)} onChange={e => {
                  if (e.target.checked) setSelectedDebts([...selectedDebts, debt.id]);
                  else setSelectedDebts(selectedDebts.filter(id => id !== debt.id));
                }} className="w-4 h-4 rounded" />
                <span className={`badge ${debt.partner_name === 'moemen' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{debt.partner_name}</span>
                <span className="font-black text-slate-900">${debt.amount}</span>
              </label>
            ))}
          </div>

          {/* Step 2: Extra Expenses */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">2️⃣ Add Extra Expenses</h4>
              <button onClick={addExtraExpense} className="btn-navy text-sm flex items-center gap-1"><Plus className="w-3 h-3" /> Add</button>
            </div>
            {extraExpenses.map((exp, i) => (
              <div key={i} className="grid grid-cols-4 gap-3">
                <input type="number" placeholder="Amount" className="premium-input" value={exp.amount} onChange={e => {
                  const updated = [...extraExpenses]; updated[i].amount = e.target.value; setExtraExpenses(updated);
                }} />
                <select className="premium-input bg-white" value={exp.category} onChange={e => {
                  const updated = [...extraExpenses]; updated[i].category = e.target.value; setExtraExpenses(updated);
                }}>
                  <option value="fuel">Fuel</option><option value="food">Food</option><option value="transport">Transport</option><option value="equipment">Repair</option><option value="other">Other</option>
                </select>
                <input type="text" placeholder="Description" className="premium-input" value={exp.description} onChange={e => {
                  const updated = [...extraExpenses]; updated[i].description = e.target.value; setExtraExpenses(updated);
                }} />
                <button onClick={() => setExtraExpenses(extraExpenses.filter((_, idx) => idx !== i))} className="p-2 text-red-400 hover:text-red-600"><Minus className="w-4 h-4" /></button>
              </div>
            ))}
          </div>

          {/* Step 3: Calculation Summary */}
          <div className="bg-slate-900 text-white p-6 rounded-2xl">
            <p className="text-slate-400 text-sm font-black uppercase tracking-widest">3️⃣ Remaining Money (LIVE)</p>
            <h3 className="text-4xl font-black mt-2">${remaining.toFixed(2)}</h3>
            <div className="flex gap-6 mt-4 text-sm font-bold text-slate-400">
              <span>Income: ${incomeData.amount || 0}</span>
              <span>Debts: -${totalDebtsToPay.toFixed(2)}</span>
              <span>Extra: -${totalExtraExpenses.toFixed(2)}</span>
            </div>
          </div>

          {/* Step 4: Profit Split */}
          <div className="space-y-4">
            <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">4️⃣ Profit Distribution</h4>
            <div className="grid grid-cols-3 gap-3">
              <button onClick={() => { setProfitSplit(50); setKeepInCompany(false); }} className={`py-3 rounded-xl text-sm font-black transition-all ${profitSplit === 50 && !keepInCompany ? 'bg-[#0f172a] text-white' : 'bg-slate-50 border border-slate-200 text-slate-600'}`}>50/50</button>
              <button onClick={() => { setProfitSplit(0); setKeepInCompany(false); }} className={`py-3 rounded-xl text-sm font-black transition-all ${profitSplit === 0 && !keepInCompany ? 'bg-[#0f172a] text-white' : 'bg-slate-50 border border-slate-200 text-slate-600'}`}>Custom %</button>
              <button onClick={() => setKeepInCompany(true)} className={`py-3 rounded-xl text-sm font-black transition-all ${keepInCompany ? 'bg-[#0f172a] text-white' : 'bg-slate-50 border border-slate-200 text-slate-600'}`}>Keep in Company</button>
            </div>
            {profitSplit === 0 && !keepInCompany && (
              <div className="flex items-center gap-4">
                <label className="text-sm font-bold text-slate-600">Moemen %:</label>
                <input type="number" min="0" max="100" className="premium-input w-24" value={profitSplit} onChange={e => setProfitSplit(parseInt(e.target.value) || 0)} />
              </div>
            )}
          </div>

          {/* Step 5: Final Summary */}
          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-200 space-y-3">
            <h4 className="text-sm font-black text-blue-900 uppercase tracking-tight">5️⃣ Final Summary</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex justify-between"><span className="text-blue-700 font-medium">Total Income:</span><span className="font-black text-blue-900">${incomeData.amount || 0}</span></div>
              <div className="flex justify-between"><span className="text-blue-700 font-medium">Paid Debts:</span><span className="font-black text-red-600">-${totalDebtsToPay.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-blue-700 font-medium">Extra Expenses:</span><span className="font-black text-red-600">-${totalExtraExpenses.toFixed(2)}</span></div>
              <div className="flex justify-between border-b border-blue-100 pb-2 mb-2"><span className="text-blue-700 font-medium">Final Distributed Profit:</span><span className="font-black text-green-600">${remaining.toFixed(2)}</span></div>
              {!keepInCompany && (
                <>
                  <div className="flex justify-between text-sm"><span className="text-slate-500 font-bold uppercase tracking-widest">Moemen's Share ({profitSplit}%):</span><span className="font-black text-slate-800">${(remaining * (profitSplit / 100)).toFixed(2)}</span></div>
                  <div className="flex justify-between text-sm mt-1"><span className="text-slate-500 font-bold uppercase tracking-widest">Abd's Share ({100 - profitSplit}%):</span><span className="font-black text-slate-800">${(remaining * ((100 - profitSplit) / 100)).toFixed(2)}</span></div>
                </>
              )}
            </div>
          </div>

          {/* Step 6: Manual Confirmation */}
          <div className="p-4 bg-yellow-50/50 border border-yellow-100 rounded-2xl flex items-center gap-3">
             <input 
               type="checkbox" 
               id="confirmManual" 
               checked={isDataConfirmed} 
               onChange={e => setIsDataConfirmed(e.target.checked)} 
               className="w-5 h-5 rounded border-slate-300"
             />
             <label htmlFor="confirmManual" className="text-sm font-bold text-yellow-800 cursor-pointer">
               I confirm that I have manually paid the partners their profit shares and cleared the selected owes/debts in cash or transfer.
             </label>
          </div>

          <button 
            onClick={handleFinalConfirm} 
            disabled={!isDataConfirmed}
            className={`w-full py-5 text-white font-black uppercase tracking-widest rounded-[1.5rem] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3 ${isDataConfirmed ? 'bg-green-600 hover:bg-green-700 shadow-green-900/20' : 'bg-slate-300 cursor-not-allowed opacity-50'}`}
          >
            <Check className="w-5 h-5" /> Confirm & Distribute
          </button>
        </div>
      )}
    </div>
  );
};

export default Income;

