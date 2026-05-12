/**
 * ============================================================
 * ADMIN CLIENTS & PARTNERS MANAGEMENT PAGE
 * ============================================================
 * Final Graduation Project Refactor
 * Purpose: Strategic Relationship Management (CRM). 
 * Tracks regular clients and professional event managers, 
 * including linked project performance and deal splits.
 * ============================================================
 */

/**
 * ============================================================
 * ADMIN CLIENTS & PARTNERS MANAGEMENT PAGE
 * ============================================================
 * Final Graduation Project Refactor
 * Purpose: Strategic Relationship Management (CRM). 
 * Tracks regular clients and professional event managers, 
 * including linked project performance and deal splits.
 * ============================================================
 */

import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Phone, MapPin, MoreHorizontal, Download, 
  Mail, Filter, Edit, Trash2, X, Users as UsersIcon, 
  ChevronDown, ChevronUp, Calendar, Wallet, Percent, ExternalLink, Activity 
} from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL as API } from '../../config';

// =============================
// MAIN CRM COMPONENT
// =============================
const Clients = () => {
  // ── STATE MANAGEMENT: UI & DATA ──
  const [clients, setClients] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedPartner, setExpandedPartner] = useState(null);
  
  // ── STATE MANAGEMENT: FORM DATA ──
  const [form, setForm] = useState({ 
    name: '', phone: '', location: '', event_type: '', type: 'client', notes: '' 
  });

  // ── INITIALIZATION & FETCHING ──
  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = () => {
    axios.get(`${API}/clients`)
      .then(res => setClients(res.data))
      .catch(err => console.error('Clients fetch error'));
  };

  // ── CRUD OPERATIONS ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    const admin_name = localStorage.getItem('nlg_admin') || 'System';
    try {
      if (editingClient) {
        await axios.put(`${API}/clients/${editingClient.id}`, { ...form, admin_name });
      } else {
        await axios.post(`${API}/clients`, { ...form, admin_name });
      }
      fetchClients();
      setShowForm(false);
      setEditingClient(null);
      setForm({ name: '', phone: '', location: '', event_type: '', type: 'client', notes: '' });
    } catch (err) { alert('Error saving client'); }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Archive this client?')) {
      const admin_name = localStorage.getItem('nlg_admin') || 'System';
      await axios.delete(`${API}/clients/${id}`, { data: { admin_name } });
      fetchClients();
    }
  };

  const handleEdit = (client) => {
    setEditingClient(client);
    setForm({ 
      name: client.name, 
      phone: client.phone || '', 
      location: client.location || '', 
      event_type: client.event_type || '', 
      type: client.type || 'client', 
      notes: client.notes || '' 
    });
    setShowForm(true);
  };

  // ── DATA HELPERS ──
  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (c.phone || '').includes(searchQuery) ||
    (c.location || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      
      {/* =============================
          1. HEADER & PRIMARY ACTIONS
          ============================= */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">Persons Management</h2>
          <p className="text-slate-400 text-xs sm:text-sm font-medium mt-1 sm:mt-2">Manage all registered people, relationships, and strategic partners.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
           <button onClick={() => { setEditingClient(null); setForm({ name: '', phone: '', location: '', event_type: '', type: 'client', notes: '' }); setShowForm(true); }} className="btn-navy flex items-center gap-2 w-full sm:w-auto justify-center">
             <Plus className="w-4 h-4" /> Add New Person
           </button>
        </div>
      </div>

      {/* Filters removed as per request */}

      {/* =============================
          3. PARTNER EDITOR FORM
          ============================= */}
      {showForm && (
        <div className="premium-card p-8 bg-slate-50/50 border-slate-200">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">{editingClient ? 'Update Profile' : 'New Strategic Account'}</h3>
            <button onClick={() => setShowForm(false)} className="p-3 hover:bg-slate-200 rounded-2xl bg-white shadow-sm transition"><X className="w-6 h-6" /></button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-1">
              <label className="text-sm font-black text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
              <input type="text" required className="premium-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-black text-slate-500 uppercase tracking-widest ml-1">Phone Number</label>
              <input type="text" className="premium-input" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-black text-slate-500 uppercase tracking-widest ml-1">Location / City</label>
              <input type="text" className="premium-input" value={form.location} onChange={e => setForm({...form, location: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-black text-slate-500 uppercase tracking-widest ml-1">Event Type Specialty</label>
              <input type="text" className="premium-input" value={form.event_type} onChange={e => setForm({...form, event_type: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-black text-slate-500 uppercase tracking-widest ml-1">Account Role</label>
              <select className="premium-input bg-white" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                <option value="client">Client</option>
                <option value="event_manager">Event Management (Partner)</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-black text-slate-500 uppercase tracking-widest ml-1">Internal Notes</label>
              <input type="text" className="premium-input" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
            </div>
            <div className="lg:col-span-3 pt-4">
              <button type="submit" className="w-full py-4 bg-[#0f172a] text-white rounded-2xl text-base font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-900/20">{editingClient ? 'Update Partner Profile' : 'Register New Partner'}</button>
            </div>
          </form>
        </div>
      )}

      {/* =============================
          4. PARTNERS DATA LIST
          ============================= */}
      <div className="premium-card overflow-hidden">
        {/* List Toolbar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex gap-4">
           <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input type="text" placeholder="Search by name, phone or location..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-3 outline-none focus:border-indigo-500 text-sm font-bold shadow-sm transition-all" />
           </div>
        </div>

        <div className="divide-y divide-slate-100">
           {filteredClients.map(client => (
             <div key={client.id} className="bg-white">
                {/* Main Account Row */}
                 <div className={`p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6 transition-colors ${expandedPartner === client.id ? 'bg-slate-50/50' : 'hover:bg-slate-50'}`}>
                   <div className="flex items-center gap-3 sm:gap-5 flex-1 min-w-0">
                      <div className="w-10 h-10 sm:w-14 sm:h-14 bg-[#0f172a] text-white rounded-xl sm:rounded-2xl flex items-center justify-center font-black text-base sm:text-xl shadow-lg shadow-slate-900/10 flex-shrink-0">
                         {client.name[0].toUpperCase()}
                      </div>
                      <div>
                         <div className="flex items-center gap-2">
                            <h3 className="text-lg font-black text-slate-900 tracking-tighter leading-none">{client.name}</h3>
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${client.type === 'event_manager' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}>
                               {(client.type || 'client').replace('_', ' ')}
                            </span>
                         </div>
                         <div className="flex items-center gap-4 mt-2">
                            <p className="text-sm font-bold text-slate-400 flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-slate-300" /> {client.phone || '-'}</p>
                            <p className="text-sm font-bold text-slate-400 flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-300" /> {client.location || '-'}</p>
                         </div>
                      </div>
                   </div>

                   {client.type === 'event_manager' && (
                       <div className="flex gap-4">
                          <div className="bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm text-center min-w-[80px]">
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total Events</p>
                             <p className="text-base font-black text-indigo-600">{client.events?.length || 0}</p>
                          </div>
                       </div>
                   )}

                   <div className="flex items-center gap-2">
                      {client.type === 'event_manager' && (
                         <button onClick={() => setExpandedPartner(expandedPartner === client.id ? null : client.id)} className={`p-3 rounded-2xl transition-all ${expandedPartner === client.id ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}>
                            {expandedPartner === client.id ? <ChevronUp className="w-5 h-5"/> : <ChevronDown className="w-5 h-5"/>}
                         </button>
                      )}
                      <button onClick={() => handleEdit(client)} className="p-3 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-100 transition-colors"><Edit className="w-5 h-5"/></button>
                      <button onClick={() => handleDelete(client.id)} className="p-3 bg-red-50 text-red-600 rounded-2xl hover:bg-red-100 transition-colors"><Trash2 className="w-5 h-5"/></button>
                   </div>
                </div>

                {/* Expanded Section: Related Projects & Events */}
                {expandedPartner === client.id && client.type === 'event_manager' && (
                   <div className="p-6 bg-slate-50/50 border-t border-slate-100 animate-in slide-in-from-top-2 duration-300">
                      <div className="mb-8">
                         <h4 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                            <Activity className="w-4 h-4 text-indigo-400" /> Recent Partner Activity
                         </h4>
                         <div className="h-px flex-1 mx-4 bg-slate-200/50"></div>
                      </div>
                      
                      {client.events && client.events.length > 0 ? (
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {client.events.map(ev => (
                               <div key={ev.id} className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm group hover:border-indigo-100 transition-all">
                                  <div className="flex justify-between items-start mb-3">
                                     <div>
                                        <h5 className="text-base font-black text-slate-900 uppercase tracking-tight group-hover:text-indigo-600 transition">{ev.event_name}</h5>
                                        <p className="text-sm font-bold text-slate-400 mt-1">{ev.date} • {ev.location}</p>
                                     </div>
                                     <div className={`px-2.5 py-1 rounded-xl text-sm font-black uppercase tracking-widest ${ev.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                        {ev.status}
                                     </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-50">
                                     <div className="flex items-center gap-2">
                                        <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><Percent className="w-3 h-3"/></div>
                                        <p className="text-sm font-black text-slate-700 uppercase tracking-tighter">
                                           {ev.deal_type === 'Fixing Rent' ? 'Fixed Rent' : `${ev.company_percent}/${ev.partner_percent} Split`}
                                        </p>
                                     </div>
                                     <div className="flex items-center gap-2">
                                        <div className="p-1.5 bg-green-50 text-green-600 rounded-lg"><Wallet className="w-3 h-3"/></div>
                                        <p className="text-sm font-black text-green-700 uppercase tracking-tighter">
                                           {ev.deal_type === 'Fixing Rent' ? `$${ev.rent_amount}` : `$${ev.profit}`}
                                        </p>
                                     </div>
                                  </div>
                               </div>
                            ))}
                         </div>
                      ) : (
                         <div className="py-12 text-center">
                            <div className="w-16 h-16 bg-white rounded-full border-2 border-dashed border-slate-200 flex items-center justify-center mx-auto mb-4">
                               <Calendar className="w-6 h-6 text-slate-200" />
                            </div>
                            <p className="text-sm font-bold text-slate-400 uppercase italic tracking-widest">No events linked yet</p>
                         </div>
                      )}
                   </div>
                )}
             </div>
           ))}
           {filteredClients.length === 0 && (
             <div className="py-20 text-center">
                <UsersIcon className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <p className="text-base font-bold text-slate-300 uppercase tracking-[0.2em] italic">No accounts matching your search</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default Clients;


