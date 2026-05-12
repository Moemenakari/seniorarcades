/**
 * ============================================================
 * ADMIN LOCATIONS MANAGEMENT PAGE
 * ============================================================
 * Final Graduation Project Refactor
 * Purpose: Manage the list of locations for the "Our Footprint" section.
 * ============================================================
 */

import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, Camera, MapPin, Search, X
} from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL as API } from '../../config';

const LocationCard = ({ loc, onDelete, onEdit }) => (
  <div className="premium-card group overflow-hidden">
     <div className="relative h-48 bg-slate-100 overflow-hidden">
        {loc.image_url ? (
          <img src={loc.image_url} alt={loc.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
             <MapPin className="w-16 h-16" />
          </div>
        )}
        <div className="absolute top-4 right-4 flex gap-2">
           <button onClick={() => onEdit(loc)} className="p-2 bg-white/90 backdrop-blur shadow-xl rounded-xl text-slate-600 hover:text-blue-600 transition-colors">
              <Edit className="w-4 h-4" />
           </button>
           <button onClick={() => onDelete(loc.id)} className="p-2 bg-white/90 backdrop-blur shadow-xl rounded-xl text-slate-600 hover:text-red-600 transition-colors">
              <Trash2 className="w-4 h-4" />
           </button>
        </div>
     </div>
     
     <div className="p-6">
        <div className="flex items-center gap-2">
           <MapPin className="w-5 h-5 text-red-500" />
           <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">{loc.name}</h3>
        </div>
     </div>
  </div>
);

const Locations = () => {
  const [locations, setLocations] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingLoc, setEditingLoc] = useState(null);
  const [form, setForm] = useState({ name: '', image_url: '' });

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = () => {
    axios.get(`${API}/locations`)
      .then(res => setLocations(res.data))
      .catch(err => console.error('Locations fetch error'));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm({...form, image_url: reader.result});
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingLoc) {
        await axios.put(`${API}/locations/${editingLoc.id}`, form);
      } else {
        await axios.post(`${API}/locations`, form);
      }
      fetchLocations();
      setShowForm(false);
      setEditingLoc(null);
      setForm({ name: '', image_url: '' });
    } catch (err) {
      alert('Error saving location');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this location from footprint?')) {
      await axios.delete(`${API}/locations/${id}`);
      fetchLocations();
    }
  };

  const handleEdit = (loc) => {
    setEditingLoc(loc);
    setForm({ name: loc.name, image_url: loc.image_url });
    setShowForm(true);
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
           <h2 className="text-4xl font-black text-[#0f172a] tracking-tighter uppercase leading-none">Our Footprint</h2>
           <p className="text-slate-500 font-medium mt-2">Managing {locations.length} active event locations.</p>
        </div>
        <button onClick={() => { setEditingLoc(null); setForm({ name: '', image_url: '' }); setShowForm(true); }} className="btn-navy group flex items-center gap-3">
           <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" /> New Location
        </button>
      </div>

      {showForm && (
        <div className="premium-card p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">{editingLoc ? 'Edit Location' : 'Add New Location'}</h3>
            <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-100 rounded-xl"><X className="w-5 h-5" /></button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-400 uppercase tracking-widest ml-1">Location Name</label>
              <input type="text" required className="premium-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Beirut Waterfront" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                 <Camera className="w-3 h-3 text-slate-400" /> Location Image
              </label>
              <div className="flex items-center gap-3">
                 <div className="flex-1">
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-black file:uppercase file:tracking-widest file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors cursor-pointer" />
                 </div>
                 {form.image_url && (
                    <div className="w-12 h-12 rounded-xl overflow-hidden shadow-sm border border-slate-100 flex-shrink-0">
                       <img src={form.image_url} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                 )}
              </div>
            </div>
            <div className="md:col-span-2">
              <button type="submit" className="btn-navy w-full flex items-center justify-center gap-3">
                <Plus className="w-5 h-5" /> {editingLoc ? 'Update Location' : 'Add Location'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {locations.map(loc => (
          <LocationCard key={loc.id} loc={loc} onDelete={handleDelete} onEdit={handleEdit} />
        ))}
        {locations.length === 0 && (
          <div className="md:col-span-3 premium-card p-16 text-center">
            <MapPin className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">No locations added yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Locations;

