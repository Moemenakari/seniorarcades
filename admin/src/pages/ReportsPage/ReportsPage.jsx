/**
 * ============================================================
 * ADMIN SYSTEM REPORTS PAGE
 * ============================================================
 * Final Graduation Project Refactor
 * Purpose: Centralized audit trail, historical record system,
 * and management of administrative reports.
 * Tracks every action across all modules for transparency.
 * ============================================================
 */

import React, { useState, useEffect } from 'react';
import { 
  History, Trash2, Calendar, User, Info, Search, Filter, 
  Package, Activity, ArrowRight, TrendingUp, Briefcase, 
  ChevronDown, ChevronUp, Edit, X
} from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL as API } from '../../config';

// =============================
// MAIN REPORTS COMPONENT
// =============================
const Reports = () => {
  // ── STATE MANAGEMENT: UI & DATA ──
  const [archiveData, setArchiveData] = useState({ 
    logs: [], 
    stats: { total: 0, finance: 0, events: 0, machines: 0, partners: 0 } 
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); 
  const [expandedLogId, setExpandedLogId] = useState(null);
  
  // ── EDIT STATE ──
  const [editingLog, setEditingLog] = useState(null);
  const [editForm, setEditForm] = useState({ description: '', action_type: '', user: '', section: '' });

  // ── HIDE (SOFT DELETE) STATE ──
  const [hideConfirmId, setHideConfirmId] = useState(null);
  const [isHiding, setIsHiding] = useState(false);

  // ── EXTRA FILTERS ──
  const [filterUser, setFilterUser] = useState('all');
  const [filterDate, setFilterDate] = useState('');

  // ── INITIALIZATION ──
  useEffect(() => {
    fetchArchive();
  }, []);

  const fetchArchive = () => {
    setLoading(true);
    axios.get(`${API}/archive`)
      .then(res => { 
        setArchiveData(res.data); 
        setLoading(false); 
      })
      .catch(err => { 
        console.error('Archive fetch error', err); 
        setLoading(false); 
      });
  };

  const handleUpdateLog = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API}/archive/${editingLog.id}`, editForm);
      alert('Report entry updated successfully!');
      setEditingLog(null);
      fetchArchive();
    } catch (err) {
      alert('Error updating report entry');
    }
  };

  const startEditing = (log) => {
    setEditingLog(log);
    setEditForm({
      description: log.description,
      action_type: log.action_type,
      user: log.user,
      section: log.section
    });
  };

  const handleHideLog = async () => {
    if (!hideConfirmId) return;
    setIsHiding(true);
    try {
      await axios.patch(`${API}/archive/${hideConfirmId}/hide`);
      setHideConfirmId(null);
      fetchArchive();
    } catch (err) {
      alert('Failed to hide log entry');
    } finally {
      setIsHiding(false);
    }
  };

  // ── UI HELPERS (Styles & Icons) ──
  const getSectionIcon = (section) => {
    switch(section) {
      case 'Finance': return <TrendingUp className="w-4 h-4" />;
      case 'Events': return <Activity className="w-4 h-4" />;
      case 'Upcoming Events': return <Calendar className="w-4 h-4" />;
      case 'Machines': return <Package className="w-4 h-4" />;
      case 'Partners': return <Briefcase className="w-4 h-4" />;
      case 'Clients': return <User className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getSectionColor = (section) => {
    switch(section) {
      case 'Finance': return 'text-green-600 bg-green-50';
      case 'Events': return 'text-indigo-600 bg-indigo-50';
      case 'Upcoming Events': return 'text-blue-600 bg-blue-50';
      case 'Machines': return 'text-orange-600 bg-orange-50';
      case 'Partners': return 'text-purple-600 bg-purple-50';
      case 'Clients': return 'text-slate-600 bg-slate-50';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  // ── FILTERING LOGIC ──
  const filteredLogs = archiveData.logs.filter(log => {
    const matchesSearch = 
      log.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.related_to?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTab = 
      activeTab === 'all' || 
      (activeTab === 'finance' && log.section === 'Finance') ||
      (activeTab === 'events' && (log.section === 'Events' || log.section === 'Upcoming Events')) ||
      (activeTab === 'machines' && log.section === 'Machines') ||
      (activeTab === 'partners' && (log.section === 'Partners' || log.section === 'Clients'));

    const matchesUser = filterUser === 'all' || log.user === filterUser;
    const matchesDate = !filterDate || log.date === filterDate;

    return matchesSearch && matchesTab && matchesUser && matchesDate;
  });

  const uniqueUsers = ['all', ...new Set(archiveData.logs.map(l => l.user))];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* =============================
          1. HEADER & GLOBAL SEARCH
          ============================= */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 sm:gap-6">
        <div>
          <h2 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none mb-1 sm:mb-2">System Reports</h2>
          <p className="text-slate-400 text-xs sm:text-base font-medium">Historical audit trail and management of system actions.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-48">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)} 
              className="premium-input bg-white pl-10 pr-4 py-2 w-full text-sm" 
            />
          </div>
          <select 
            value={filterUser} 
            onChange={e => setFilterUser(e.target.value)}
            className="premium-input bg-white px-3 py-2 text-sm font-bold min-w-[120px]"
          >
            {uniqueUsers.map(u => <option key={u} value={u}>{u === 'all' ? 'All Users' : u}</option>)}
          </select>
          <input 
            type="date" 
            value={filterDate} 
            onChange={e => setFilterDate(e.target.value)}
            className="premium-input bg-white px-3 py-2 text-sm font-bold"
          />
          <button onClick={fetchArchive} className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition shadow-sm">
            <History className="w-5 h-5 text-slate-500" />
          </button>
        </div>
      </div>

      {/* =============================
          2. STATISTICS QUICK VIEW
          ============================= */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-4">
        {[
          { label: 'Total Logs', value: archiveData.stats.total, icon: Activity, color: 'indigo' },
          { label: 'Finance', value: archiveData.stats.finance, icon: TrendingUp, color: 'green' },
          { label: 'Events', value: archiveData.stats.events, icon: Calendar, color: 'blue' },
          { label: 'Machines', value: archiveData.stats.machines, icon: Package, color: 'orange' },
          { label: 'Partners', value: archiveData.stats.partners, icon: Briefcase, color: 'purple' },
        ].map((s, i) => (
          <div key={i} className="bg-white border border-slate-100 p-2.5 sm:p-4 rounded-xl sm:rounded-2xl shadow-sm hover:shadow-md transition-all">
             <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                <div className={`p-1 sm:p-1.5 rounded-lg bg-${s.color}-50`}>
                   <s.icon className={`w-3 h-3 sm:w-3.5 sm:h-3.5 text-${s.color}-500`} />
                </div>
                <span className="text-[9px] sm:text-sm font-black text-slate-400 uppercase tracking-wider sm:tracking-widest">{s.label}</span>
             </div>
             <h4 className="text-lg sm:text-2xl font-black text-slate-800">{s.value}</h4>
          </div>
        ))}
      </div>

      {/* =============================
          3. MODULE NAVIGATION TABS
          ============================= */}
      <div className="flex gap-1.5 sm:gap-2 p-1 bg-slate-100 rounded-xl sm:rounded-2xl overflow-x-auto">
        {['all', 'finance', 'events', 'machines', 'partners'].map(t => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-3 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider sm:tracking-widest transition-all whitespace-nowrap ${activeTab === t ? 'bg-[#0f172a] text-white shadow-lg' : 'text-slate-500 hover:text-slate-800'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* =============================
          3.5 EDIT MODAL (Conditional)
          ============================= */}
      {editingLog && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg p-8 shadow-2xl animate-in zoom-in-95 duration-300">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Update Report</h3>
                <button onClick={() => setEditingLog(null)} className="p-2 hover:bg-slate-100 rounded-full transition"><X className="w-6 h-6 text-slate-400" /></button>
             </div>
             <form onSubmit={handleUpdateLog} className="space-y-5">
                <div className="space-y-2">
                   <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Action Type</label>
                   <input type="text" className="premium-input w-full" value={editForm.action_type} onChange={e => setEditForm({...editForm, action_type: e.target.value})} required />
                </div>
                <div className="space-y-2">
                   <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
                   <textarea className="premium-input w-full min-h-[100px] py-3" value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Admin User</label>
                      <input type="text" className="premium-input w-full" value={editForm.user} onChange={e => setEditForm({...editForm, user: e.target.value})} required />
                   </div>
                   <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Section</label>
                      <select className="premium-input w-full" value={editForm.section} onChange={e => setEditForm({...editForm, section: e.target.value})} required>
                         <option value="Finance">Finance</option>
                         <option value="Events">Events</option>
                         <option value="Upcoming Events">Upcoming Events</option>
                         <option value="Machines">Machines</option>
                         <option value="Partners">Partners</option>
                         <option value="Clients">Clients</option>
                      </select>
                   </div>
                </div>
                <button type="submit" className="w-full py-4 bg-[#0f172a] text-white font-black uppercase tracking-widest rounded-2xl hover:bg-slate-800 transition shadow-xl mt-4">Save Changes</button>
             </form>
          </div>
        </div>
      )}

      {/* =============================
          4. ARCHIVES HISTORY LIST
          ============================= */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-20 text-center">
             <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
             <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Accessing System Archive...</p>
          </div>
        ) : filteredLogs.length > 0 ? (
          filteredLogs.map(log => {
            const isExpanded = expandedLogId === log.id;
            const parts = log.description.split('|||');
            const h3Text = parts.length > 1 ? parts[0] : log.action_type;
            const mainText = parts.length > 1 ? parts[1] : log.description;

            // Extract deletion reason from description
            const isDeletion = log.action_type === 'Event Deleted' || log.action_type === 'Event Archived' || log.action_type.toLowerCase().includes('delet') || log.action_type.toLowerCase().includes('archiv');
            const reasonMatch = mainText.match(/Reason:\s*([^.]+)/i);
            const deletionReason = reasonMatch ? reasonMatch[1].trim() : null;

            return (
              <div key={log.id} className={`bg-white rounded-3xl border transition-all duration-300 ${isDeletion ? 'border-red-100' : ''} ${isExpanded ? 'border-indigo-500 shadow-xl shadow-indigo-100 scale-[1.01]' : 'border-slate-100 hover:border-slate-200 hover:shadow-lg'}`}>
                <div className="p-4 sm:p-6 cursor-pointer" onClick={() => setExpandedLogId(isExpanded ? null : log.id)}>
                   <div className="flex flex-col md:flex-row justify-between gap-4 sm:gap-6">
                      <div className="space-y-3 flex-1">
                         {/* Record Header */}
                         <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                            <div className="flex items-center gap-1.5 font-black text-slate-800 uppercase tracking-tighter text-sm">
                               {log.user} <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                               <span className={`flex items-center gap-1.5 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm ${getSectionColor(log.section)}`}>
                                  {getSectionIcon(log.section)} {log.section}
                               </span>
                            </div>
                            <span className="text-xs sm:text-sm font-bold text-slate-400 flex items-center gap-1">
                               <Calendar className="w-3 h-3" /> {log.date}
                            </span>
                            <span className="text-xs sm:text-sm font-bold text-slate-400 flex items-center gap-1">
                               <History className="w-3 h-3" /> {log.time}
                            </span>
                            {isDeletion && (
                              <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-black rounded-full uppercase tracking-widest">Deleted</span>
                            )}
                         </div>

                         {/* Action Content */}
                         <div>
                            <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tighter mb-1 uppercase">
                               {log.action_type}
                            </h2>
                            {log.related_to && (
                              <p className="text-sm font-black text-slate-700 mb-1">
                                Item: <span className="text-indigo-600">{log.related_to}</span>
                              </p>
                            )}
                            <h3 className="text-sm sm:text-base font-bold text-slate-600 mb-2">{h3Text}</h3>
                            <p className="text-sm sm:text-base font-bold text-slate-700 bg-slate-50 p-3 sm:p-4 rounded-2xl border border-slate-100 leading-relaxed">
                               {mainText}
                            </p>
                            {deletionReason && (
                              <div className="mt-3 bg-red-50 border border-red-200 rounded-2xl p-3 sm:p-4">
                                <p className="text-xs font-black text-red-500 uppercase tracking-widest mb-1">Deletion Reason</p>
                                <p className="text-sm sm:text-base font-bold text-red-800">{deletionReason}</p>
                              </div>
                            )}
                         </div>
                      </div>

                      {/* Right Panel */}
                      <div className="flex md:flex-col justify-between md:justify-start items-center md:items-end gap-3 min-w-[100px] sm:min-w-[120px]">
                         <div className="text-right">
                            {log.amount > 0 && (
                              <p className={`text-xl sm:text-2xl font-black ${log.section === 'Finance' && (log.action_type.includes('Expense') || log.action_type.includes('Debt')) ? 'text-red-500' : 'text-green-500'}`}>
                                 ${log.amount.toLocaleString()}
                              </p>
                            )}
                            <p className="text-xs sm:text-sm font-black text-slate-400 uppercase tracking-widest mt-1">ID #{log.id}</p>
                         </div>
                         <div className="flex gap-2">
                            <button
                              onClick={(e) => { e.stopPropagation(); startEditing(log); }}
                              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                            >
                               <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); setHideConfirmId(log.id); }}
                              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center hover:bg-red-100 hover:text-red-500 transition-all shadow-sm"
                              title="Hide this log entry"
                            >
                               <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>
                            <button className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all ${isExpanded ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                               {isExpanded ? <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5" /> : <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />}
                            </button>
                         </div>
                      </div>
                   </div>

                   {/* Expandable Meta-Data */}
                   {isExpanded && (
                      <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-slate-50 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 animate-in fade-in slide-in-from-top-4">
                         <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <p className="text-xs sm:text-sm font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                               <User className="w-3 h-3" /> Admin Performer
                            </p>
                            <p className="text-sm sm:text-base font-black text-slate-800">{log.user}</p>
                            <p className="text-xs text-slate-400 mt-1 uppercase font-bold tracking-widest">Full Access Level</p>
                         </div>
                         <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <p className="text-xs sm:text-sm font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                               <Info className="w-3 h-3" /> Item Name
                            </p>
                            <p className="text-sm sm:text-base font-black text-slate-800">{log.related_to || 'System-wide Action'}</p>
                            <p className="text-xs text-slate-400 mt-1 uppercase font-bold tracking-widest">Target Reference</p>
                         </div>
                         <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <p className="text-xs sm:text-sm font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                               <Calendar className="w-3 h-3" /> Timestamp
                            </p>
                            <p className="text-sm sm:text-base font-black text-slate-800">{log.date}</p>
                            <p className="text-xs text-slate-400 mt-1 uppercase font-bold tracking-widest">{log.time}</p>
                         </div>
                         {deletionReason && (
                           <div className="sm:col-span-2 md:col-span-3 bg-red-50 p-4 rounded-2xl border border-red-100">
                             <p className="text-xs sm:text-sm font-black text-red-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                               <Trash2 className="w-3 h-3" /> Deletion Reason
                             </p>
                             <p className="text-sm sm:text-base font-bold text-red-800">{deletionReason}</p>
                           </div>
                         )}
                      </div>
                   )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white rounded-[2rem] py-24 text-center border border-dashed border-slate-200">
             <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <History className="w-10 h-10 text-slate-200" />
             </div>
             <h3 className="text-xl font-black text-slate-800 tracking-tighter uppercase mb-2">Archive Empty</h3>
             <p className="text-slate-400 text-sm max-w-xs mx-auto">No records found matching your current filters or search query.</p>
          </div>
        )}
      </div>

      {/* =============================
          5. HIDE CONFIRM MODAL
          ============================= */}
      {hideConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-amber-50/50 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 text-amber-600 flex items-center justify-center rounded-xl">
                  <X className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight leading-none">Hide Log Entry</h2>
                  <p className="text-sm font-bold text-slate-500 mt-0.5">ID #{hideConfirmId}</p>
                </div>
              </div>
              <button onClick={() => setHideConfirmId(null)} className="p-2 bg-white rounded-xl shadow-sm"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-5">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                <p className="text-sm font-bold text-amber-800">This log entry will be hidden from the reports view. The data is preserved in the database and not permanently deleted.</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setHideConfirmId(null)} className="flex-1 py-3 bg-slate-100 text-slate-700 font-black text-sm uppercase tracking-widest rounded-2xl hover:bg-slate-200 transition">Cancel</button>
                <button
                  onClick={handleHideLog}
                  disabled={isHiding}
                  className="flex-1 py-3 bg-amber-500 text-white font-black text-sm uppercase tracking-widest rounded-2xl hover:bg-amber-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isHiding ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Hiding...</> : 'Hide Entry'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;

