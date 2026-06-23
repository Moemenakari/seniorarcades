/**
 * ============================================================
 * ADMIN UPCOMING LOGISTICS PAGE
 * ============================================================
 * Final Graduation Project Refactor
 * Purpose: Strategic event planning and logistics management.
 * Handles deployment scheduling, partner deal configurations, 
 * resource allocation (machines/staff), and live status tracking.
 * ============================================================
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Plus, Search, CalendarPlus, MapPin, Edit, Trash2, X, Users,
  CheckCircle, Truck, Wrench, BrainCircuit, Link2, ChevronDown,
  Clock, Zap, AlertCircle, Ban, Circle, Phone, Percent, Wallet, Scale, HandCoins
} from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL as API } from '../../config';

// =============================
// LOGISTICS CONFIGURATION
// =============================
const STATUS_CONFIG = {
  upcoming:  { label: 'Upcoming',   color: 'bg-yellow-100 text-yellow-700 border-yellow-200',   dot: 'bg-yellow-400',  icon: Clock },
  soon:      { label: 'Soon',       color: 'bg-blue-100 text-blue-700 border-blue-200',          dot: 'bg-blue-500',    icon: Zap },
  today:     { label: 'Today',      color: 'bg-orange-100 text-orange-700 border-orange-200',    dot: 'bg-orange-500',  icon: AlertCircle },
  live:      { label: 'Live 🟢',    color: 'bg-green-100 text-green-700 border-green-200',       dot: 'bg-green-500',   icon: CheckCircle },
  completed: { label: 'Completed',  color: 'bg-slate-100 text-slate-600 border-slate-200',       dot: 'bg-slate-400',   icon: CheckCircle },
  cancelled: { label: 'Cancelled',  color: 'bg-red-100 text-red-600 border-red-200',             dot: 'bg-red-500',     icon: Ban },
  pending:   { label: 'Pending',    color: 'bg-purple-100 text-purple-700 border-purple-200',    dot: 'bg-purple-500',  icon: Circle },
};

// ── UTILITY: STATUS RESOLUTION ──
const getAutoStatus = (dateStr) => {
  if (!dateStr) return 'upcoming';
  const today = new Date(); today.setHours(0,0,0,0);
  const ev = new Date(dateStr); ev.setHours(0,0,0,0);
  const diff = Math.ceil((ev - today) / 86400000);
  if (diff < 0)  return 'completed';
  if (diff === 0) return 'today';
  if (diff <= 2) return 'soon';
  return 'upcoming';
};

const resolveStatus = (ev) => {
  if (ev.manual_status && ev.manual_status !== 'auto') return ev.manual_status;
  return getAutoStatus(ev.date);
};

// =============================
// UI HELPERS (Badges & Dropdowns)
// =============================
const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.upcoming;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-black uppercase tracking-widest border ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

const StatusDropdown = ({ current, onSelect }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const manualOptions = ['upcoming','soon','today','live','pending','cancelled','completed'];
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(o => !o)} className="flex items-center gap-1 px-2.5 py-1.5 text-sm font-black uppercase tracking-widest bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-sm transition">
        <StatusBadge status={current} />
        <ChevronDown className="w-3 h-3 text-slate-400 ml-1" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 min-w-[160px]">
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-2 py-1 mb-1">Set Status</p>
          {manualOptions.map(s => (
            <button key={s} onClick={() => { onSelect(s); setOpen(false); }} className={`w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 flex items-center gap-2 ${current === s ? 'bg-slate-50' : ''}`}>
              <StatusBadge status={s} />
            </button>
          ))}
          <div className="border-t border-slate-100 mt-1 pt-1">
            <button onClick={() => { onSelect('auto'); setOpen(false); }} className="w-full text-left px-3 py-2 rounded-xl hover:bg-blue-50 text-sm font-black text-blue-600 uppercase tracking-widest">
              ↺ Auto (by date)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// =============================
// MAIN LOGISTICS COMPONENT
// =============================
const UpcomingEvents = () => {
  // ── STATE MANAGEMENT ──
  const [events, setEvents] = useState([]);
  const [allPartners, setAllPartners] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [deleteModal, setDeleteModal] = useState(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const [form, setForm] = useState({
    event_name: '', location: '', date: '', days: 1,
    client_name: '', phone: '',
    deal_type: 'Fixing Rent', rent_amount: 0,
    company_percent: 60, partner_percent: 40,
    machines_count: 5, workers_needed: 1,
    transport_needed: 'Pickup Truck', extra_details: ''
  });

  // ── INITIALIZATION ──
  useEffect(() => {
    fetchEvents();
    fetchPartners();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await axios.get(`${API}/events`);
      setEvents(res.data.filter(e => e.status === 'pending' || e.status === 'confirmed'));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPartners = () => {
    axios.get(`${API}/clients?type=event_manager`)
      .then(res => setAllPartners(res.data))
      .catch(() => {});
  };

  const handlePartnerSelect = (name) => {
    const p = allPartners.find(x => x.name === name);
    if (p) {
      setForm(prev => ({ ...prev, client_name: p.name, phone: p.phone || '' }));
    } else {
      setForm(prev => ({ ...prev, client_name: name }));
    }
  };

  const generateAIPlan = (f) => {
    let plan = [];
    if (f.deal_type === 'Revenue Split') {
      plan.push(`🧠 AI Strategy: Revenue split (${f.company_percent}/${f.partner_percent}) — prioritize games with high replay value.`);
    } else if (f.deal_type === 'Partner Rent') {
      plan.push(`🧠 AI Strategy: Partner covering space rent ($${f.rent_amount}). This amount is added income for us — maximize machine revenue on top.`);
    } else {
      plan.push(`🧠 AI Strategy: Fixed rent agreement of $${f.rent_amount}. Objective: Maximize profit after overheads.`);
    }
    plan.push(`🚚 Logistics: ${f.machines_count} machines planned. Transport: ${f.transport_needed}. ${f.workers_needed} staff suggested.`);
    plan.push(`📋 Setup: Ensure partner ${f.client_name} provides power points.`);
    return plan.join('\n\n');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError('');

    const startDate = new Date(form.date || new Date());
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + (parseInt(form.days) - 1));

    const aiPlan = generateAIPlan(form);
    const admin_name = localStorage.getItem('nlg_admin') || 'System';

    const payload = {
      ...form,
      end_date: endDate.toISOString().split('T')[0],
      status: 'pending',
      admin_name,
      notes: JSON.stringify({
        machines_count: form.machines_count,
        workers_needed: form.workers_needed,
        transport_needed: form.transport_needed,
        extra_details: form.extra_details,
        days: form.days,
        ai_plan: aiPlan
      }),
    };

    try {
      if (editingEvent) {
        await axios.put(`${API}/events/${editingEvent.id}`, payload);
      } else {
        await axios.post(`${API}/events`, payload);
      }
      setShowForm(false);
      setEditingEvent(null);
      resetForm();
      await fetchEvents();
    } catch (err) {
      const msg = err.response?.data?.details || err.response?.data?.error || 'Error saving event';
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => setForm({
    event_name: '', location: '', date: '', days: 1,
    client_name: '', phone: '',
    deal_type: 'Fixing Rent', rent_amount: 0,
    company_percent: 60, partner_percent: 40,
    machines_count: 5, workers_needed: 1,
    transport_needed: 'Pickup Truck', extra_details: ''
  });

  const handleEdit = (ev) => {
    setEditingEvent(ev);
    let parsedNotes = {};
    if (ev.notes && ev.notes.startsWith('{')) { try { parsedNotes = JSON.parse(ev.notes); } catch (e) {} }
    setForm({
      event_name: ev.event_name || '', location: ev.location || '', date: ev.date || '',
      days: parsedNotes.days || 1, client_name: ev.client_name || '', phone: ev.phone || '',
      deal_type: ev.deal_type || 'Fixing Rent', rent_amount: ev.rent_amount || 0,
      company_percent: ev.company_percent || 60, partner_percent: ev.partner_percent || 40,
      machines_count: parsedNotes.machines_count || 5, workers_needed: parsedNotes.workers_needed || 1,
      transport_needed: parsedNotes.transport_needed || 'Pickup Truck', extra_details: parsedNotes.extra_details || ''
    });
    setSubmitError('');
    setShowForm(true);
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

  const handleStatusChange = async (ev, newStatus) => {
    const admin_name = localStorage.getItem('nlg_admin') || 'System';
    await axios.put(`${API}/events/${ev.id}`, { manual_status: newStatus === 'auto' ? null : newStatus, admin_name });
    fetchEvents();
  };

  const handleGoLive = async (ev) => {
    if (window.confirm(`Move "${ev.event_name}" to the Live Events tracker?\nIt will keep its ID: ${ev.gen_key}`)) {
      const admin_name = localStorage.getItem('nlg_admin') || 'System';
      await axios.put(`${API}/events/${ev.id}`, { status: 'completed', manual_status: 'live', admin_name });
      fetchEvents();
    }
  };

  const filteredEvents = events.filter(e => {
    const matchSearch = (e.event_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.client_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const resolved = resolveStatus(e);
    const matchStatus = filterStatus === 'all' || resolved === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">Upcoming Logistics</h2>
          <p className="text-slate-400 text-sm font-medium mt-2">Sync deals, partners, and event planning in real-time.</p>
        </div>
        <button onClick={() => { setEditingEvent(null); resetForm(); setSubmitError(''); setShowForm(true); }} className="btn-navy flex items-center gap-2 w-full sm:w-auto justify-center">
          <Plus className="w-4 h-4" /> Add Event Plan
        </button>
      </div>

      {showForm && (
        <div className="premium-card p-8 bg-slate-50/50 border-slate-200">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">{editingEvent ? 'Edit Deployment' : 'New Strategic Plan'}</h3>
            <button onClick={() => setShowForm(false)} className="p-3 hover:bg-slate-200 rounded-2xl bg-white shadow-sm transition"><X className="w-6 h-6" /></button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               
               {/* Left: Partner & Basic Info */}
               <div className="space-y-6 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
                  <div className="flex items-center gap-2 mb-2"><Users className="w-4 h-4 text-indigo-500"/> <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">Partner Information</h4></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="space-y-1">
                        <label className="text-sm font-black text-slate-500 uppercase tracking-widest ml-1">Event Name</label>
                        <input type="text" required className="premium-input" value={form.event_name} onChange={e => setForm({...form, event_name: e.target.value})} placeholder="e.g. Wedding Event" />
                     </div>
                     <div className="space-y-1">
                        <label className="text-sm font-black text-slate-500 uppercase tracking-widest ml-1">Location</label>
                        <input type="text" required className="premium-input" value={form.location} onChange={e => setForm({...form, location: e.target.value})} placeholder="e.g. Beirut Hall" />
                     </div>
                     <div className="space-y-1">
                        <label className="text-sm font-black text-slate-500 uppercase tracking-widest ml-1">Partner Name</label>
                        <input type="text" list="partner-list" required className="premium-input" value={form.client_name} onChange={e => handlePartnerSelect(e.target.value)} placeholder="Type partner name..." />
                        <datalist id="partner-list">
                           {allPartners.map(p => <option key={p.id} value={p.name} />)}
                        </datalist>
                     </div>
                     <div className="space-y-1">
                        <label className="text-sm font-black text-slate-500 uppercase tracking-widest ml-1">Partner Phone</label>
                        <div className="relative">
                           <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                           <input type="text" className="premium-input pl-10" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+961..." />
                        </div>
                     </div>
                  </div>
               </div>

               {/* Right: Deal Type Configuration */}
               <div className="space-y-6 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
                  <div className="flex items-center gap-2 mb-2"><Wallet className="w-4 h-4 text-orange-500"/> <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">Strategic Deal Configuration</h4></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="space-y-1 md:col-span-2">
                        <label className="text-sm font-black text-slate-500 uppercase tracking-widest ml-1">Agreement Type</label>
                        <div className="flex flex-col sm:flex-row gap-2">
                           {[
                             { id: 'Fixing Rent',   label: 'Fixed Rent',    icon: Wallet,     desc: 'We pay space rent' },
                             { id: 'Revenue Split', label: 'Split %',       icon: Percent,    desc: 'Shared percentage' },
                             { id: 'Partner Rent',  label: 'Partner Pays',  icon: HandCoins,  desc: 'Partner covers space' },
                           ].map(({ id, label, icon: Icon, desc }) => (
                             <button
                               key={id}
                               type="button"
                               onClick={() => setForm({...form, deal_type: id})}
                               className={`flex-1 py-3 px-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all border ${
                                 form.deal_type === id ? 'bg-[#0f172a] text-white border-[#0f172a] shadow-lg' : 'bg-slate-50 text-slate-400 border-slate-200 hover:border-slate-300'
                               }`}
                             >
                               <div className="flex flex-col items-center gap-1">
                                 <div className="flex items-center gap-1.5"><Icon className="w-4 h-4" /> {label}</div>
                                 <span className={`text-[9px] font-bold normal-case tracking-normal ${form.deal_type === id ? 'text-white/70' : 'text-slate-400'}`}>{desc}</span>
                               </div>
                             </button>
                           ))}
                        </div>
                     </div>

                     {form.deal_type === 'Fixing Rent' && (
                        <div className="space-y-1 md:col-span-2">
                           <label className="text-sm font-black text-slate-500 uppercase tracking-widest ml-1">Rent Amount We Pay ($)</label>
                           <input type="number" min="0" className="premium-input bg-red-50/40 text-red-700 font-black" value={form.rent_amount} onChange={e => setForm({...form, rent_amount: parseFloat(e.target.value)||0})} />
                           <p className="text-xs text-red-400 font-bold ml-1">This is an expense — deducted from our profit.</p>
                        </div>
                     )}
                     {form.deal_type === 'Partner Rent' && (
                        <div className="space-y-1 md:col-span-2">
                           <label className="text-sm font-black text-slate-500 uppercase tracking-widest ml-1">Space Value Partner Covered ($)</label>
                           <input type="number" min="0" className="premium-input bg-green-50/40 text-green-700 font-black" value={form.rent_amount} onChange={e => setForm({...form, rent_amount: parseFloat(e.target.value)||0})} />
                           <p className="text-xs text-green-600 font-bold ml-1">This is added income for us — the partner paid the space.</p>
                        </div>
                     )}
                     {form.deal_type === 'Revenue Split' && (
                        <>
                           <div className="space-y-1">
                              <label className="text-sm font-black text-slate-500 uppercase tracking-widest ml-1">Company Share %</label>
                              <input type="number" className="premium-input bg-green-50/30 text-green-700 font-black" value={form.company_percent} onChange={e => setForm({...form, company_percent: parseInt(e.target.value)||0})} />
                           </div>
                           <div className="space-y-1">
                              <label className="text-sm font-black text-slate-500 uppercase tracking-widest ml-1">Partner Share %</label>
                              <input type="number" className="premium-input bg-orange-50/30 text-orange-700 font-black" value={form.partner_percent} onChange={e => setForm({...form, partner_percent: parseInt(e.target.value)||0})} />
                           </div>
                        </>
                     )}
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col gap-4">
                  <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">Timing</h4>
                  <input type="date" required className="premium-input" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
                  <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                     <span className="text-sm font-black text-slate-400 uppercase">Days:</span>
                     <input type="number" min="1" className="w-full bg-transparent font-black text-slate-900 outline-none" value={form.days} onChange={e => setForm({...form, days: e.target.value})} />
                  </div>
               </div>

               <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col gap-4">
                  <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">Machines & Staff</h4>
                  <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl">
                     <span className="text-sm font-black text-slate-400 uppercase">Games:</span>
                     <input type="number" className="w-12 bg-transparent text-right font-black" value={form.machines_count} onChange={e => setForm({...form, machines_count: e.target.value})} />
                  </div>
                  <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl">
                     <span className="text-sm font-black text-slate-400 uppercase">Workers:</span>
                     <input type="number" className="w-12 bg-transparent text-right font-black" value={form.workers_needed} onChange={e => setForm({...form, workers_needed: e.target.value})} />
                  </div>
               </div>

               <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col gap-4">
                  <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">Vehicle</h4>
                  <select className="premium-input" value={form.transport_needed} onChange={e => setForm({...form, transport_needed: e.target.value})}>
                     <option value="Pickup Truck">Pickup Truck</option>
                     <option value="Small Van">Small Van</option>
                     <option value="Box Truck">Box Truck (Large)</option>
                  </select>
               </div>
            </div>

            {submitError && (
              <div className="bg-red-50 border border-red-200 text-red-700 font-bold text-sm px-4 py-3 rounded-2xl">{submitError}</div>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-5 bg-[#0f172a] text-white rounded-[2rem] text-sm font-black uppercase tracking-[0.2em] shadow-2xl shadow-indigo-900/20 hover:scale-[1.01] transition-transform disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin inline-block" /> Saving...</>
              ) : (
                editingEvent ? 'Update Strategic Plan' : 'Commit & Sync System'
              )}
            </button>
          </form>
        </div>
      )}

      {/* DELETE WITH REASON MODAL */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-red-50/50 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 text-red-600 flex items-center justify-center rounded-xl"><Trash2 className="w-5 h-5" /></div>
                <div>
                  <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight leading-none">Cancel Event</h2>
                  <p className="text-sm font-bold text-slate-500 mt-0.5 truncate max-w-[220px]">{deleteModal.name}</p>
                </div>
              </div>
              <button onClick={() => setDeleteModal(null)} className="p-2 bg-white rounded-xl shadow-sm"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-5">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                <p className="text-sm font-bold text-amber-800">This planned event will be archived. The action will be logged for audit purposes.</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-500 uppercase tracking-widest ml-1">Reason for Cancellation <span className="text-red-500">*</span></label>
                <textarea
                  className="premium-input bg-slate-50 min-h-[90px] w-full resize-none"
                  placeholder="e.g. Client cancelled, budget issue, date conflict..."
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
                  {isDeleting ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Deleting...</> : 'Confirm Cancel'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {!showForm && (
        <div className="grid grid-cols-1 gap-4">
           {filteredEvents.map(ev => {
              const resolved = resolveStatus(ev);
              const isManual = ev.manual_status && ev.manual_status !== 'auto';
              let parsedNotes = {};
              try { parsedNotes = JSON.parse(ev.notes); } catch(e){}

              return (
                <div key={ev.id} className="premium-card p-6 border-slate-200 group hover:border-indigo-200 transition-all">
                   <div className="flex flex-col md:flex-row justify-between gap-6">
                      <div className="flex-1 space-y-4">
                         <div className="flex items-center gap-3">
                            <div className={`p-3 rounded-2xl ${resolved === 'today' ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-600'}`}>
                               <CalendarPlus className="w-6 h-6" />
                            </div>
                            <div>
                               <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter leading-none">{ev.event_name}</h3>
                               <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1.5 flex items-center gap-1.5">
                                  <MapPin className="w-3 h-3"/> {ev.location} • <Phone className="w-3 h-3"/> {ev.phone || 'No Phone'}
                               </p>
                            </div>
                            <div className="ml-4 flex items-center gap-2">
                               <StatusBadge status={resolved} />
                               {isManual && <span className="text-[10px] font-black text-slate-300 border border-slate-100 px-1.5 py-0.5 rounded-full uppercase">Manual</span>}
                            </div>
                         </div>

                         <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
                            <div className="bg-slate-50 p-3 rounded-2xl">
                               <p className="text-sm font-black text-slate-400 uppercase mb-1">Partner Info</p>
                               <p className="text-sm font-bold text-slate-700 truncate">{ev.client_name}</p>
                            </div>
                            <div className={`p-3 rounded-2xl ${ev.deal_type === 'Partner Rent' ? 'bg-green-50/60' : 'bg-indigo-50/50'}`}>
                               <p className={`text-sm font-black uppercase mb-1 ${ev.deal_type === 'Partner Rent' ? 'text-green-500' : 'text-indigo-400'}`}>Agreement</p>
                               <p className={`text-sm font-black uppercase ${ev.deal_type === 'Partner Rent' ? 'text-green-700' : 'text-indigo-700'}`}>
                                  {ev.deal_type === 'Fixing Rent' ? `Fixed: -$${ev.rent_amount}` :
                                   ev.deal_type === 'Partner Rent' ? `Partner Pays: +$${ev.rent_amount}` :
                                   `Split: ${ev.company_percent}/${ev.partner_percent}`}
                               </p>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-2xl">
                               <p className="text-sm font-black text-slate-400 uppercase mb-1">Schedule</p>
                               <p className="text-sm font-bold text-slate-700">{ev.date} ({parsedNotes.days || 1}d)</p>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-2xl">
                               <p className="text-sm font-black text-slate-400 uppercase mb-1">GenKey</p>
                               <p className="text-sm font-black font-mono text-slate-500 uppercase">{ev.gen_key}</p>
                            </div>
                         </div>
                      </div>

                      {/* --- Action Panel --- */}
                      <div className="flex md:flex-col justify-end gap-2 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 min-w-[120px]">
                         <div className="flex gap-2">
                            <button onClick={() => handleEdit(ev)} className="flex-1 md:flex-none p-3 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-100 transition flex items-center justify-center"><Edit className="w-4 h-4"/></button>
                            <button onClick={() => openDeleteModal(ev.id, ev.event_name)} className="flex-1 md:flex-none p-3 bg-red-50 text-red-600 rounded-2xl hover:bg-red-100 transition flex items-center justify-center"><Trash2 className="w-4 h-4"/></button>
                         </div>
                         <div className="w-px md:w-full h-auto md:h-px bg-slate-50 my-2"></div>
                         <StatusDropdown current={resolved} onSelect={(s) => handleStatusChange(ev, s)} />
                         <button 
                            onClick={() => handleGoLive(ev)} 
                            className="flex items-center gap-1.5 px-3 py-2 bg-green-50 text-green-700 font-black text-sm uppercase tracking-widest rounded-xl hover:bg-green-100 transition border border-green-200 mt-2"
                         >
                            <CheckCircle className="w-3.5 h-3.5"/> Go Live
                         </button>
                      </div>
                   </div>
                </div>
              );
           })}
        </div>
      )}
    </div>
  );
};

export default UpcomingEvents;

