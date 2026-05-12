/**
 * ============================================================
 * ADMIN PRODUCTS (INVENTORY) MANAGEMENT PAGE
 * ============================================================
 * Final Graduation Project Refactor
 * Purpose: Advanced management of arcade machine inventory, 
 * including technical specs, pricing models, and asset tracking.
 * ============================================================
 */

/**
 * ============================================================
 * ADMIN PRODUCTS (INVENTORY) MANAGEMENT PAGE
 * ============================================================
 * Final Graduation Project Refactor
 * Purpose: Advanced management of arcade machine inventory, 
 * including technical specs, pricing models, and asset tracking.
 * ============================================================
 */

import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit, Eye, Trash2, Camera, Zap, Maximize, Coins, Info, 
  Gamepad2, Search, CheckCircle2, XCircle, X, MapPin, Star
} from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL as API } from '../../config';

// =============================
// REUSABLE UI COMPONENTS
// =============================

/**
 * PRODUCT CARD
 * ------------
 * Visual representation of an arcade unit in the inventory grid.
 */
const ProductCard = ({ game, onDelete, onEdit, onToggleFeatured }) => (
  <div className="premium-card group overflow-hidden">
     <div className="relative h-40 sm:h-56 bg-slate-100 overflow-hidden">
        {game.image_url ? (
          <img src={game.image_url} alt={game.name || game.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
             <Gamepad2 className="w-12 h-12 sm:w-16 sm:h-16" />
          </div>
        )}
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex gap-1.5 sm:gap-2">
            <button onClick={() => onToggleFeatured(game.id)} title={game.is_featured ? 'Remove from Featured' : 'Add to Featured'} className={`p-1.5 sm:p-2 backdrop-blur shadow-xl rounded-lg sm:rounded-xl transition-colors ${game.is_featured ? 'bg-yellow-400 text-yellow-900' : 'bg-white/90 text-slate-400 hover:text-yellow-500'}`}>
               <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill={game.is_featured ? 'currentColor' : 'none'} />
            </button>
            <button onClick={() => onEdit(game)} className="p-1.5 sm:p-2 bg-white/90 backdrop-blur shadow-xl rounded-lg sm:rounded-xl text-slate-600 hover:text-blue-600 transition-colors">
               <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <button onClick={() => onDelete(game.id)} className="p-1.5 sm:p-2 bg-white/90 backdrop-blur shadow-xl rounded-lg sm:rounded-xl text-slate-600 hover:text-red-600 transition-colors">
               <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
         </div>
        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-6 bg-gradient-to-t from-black/60 to-transparent">
           <span className="text-xs sm:text-sm font-black uppercase text-white/80 tracking-widest bg-white/20 px-2 py-1 rounded-md backdrop-blur-md">
             {game.quantity} {game.category}
           </span>
        </div>
     </div>
     
     <div className="p-4 sm:p-8">
        <div className="flex justify-between items-start mb-3 sm:mb-4">
           <h3 className="text-base sm:text-xl font-black text-slate-900 leading-tight uppercase tracking-tighter">{game.name || game.title}</h3>
           <div className="text-right ml-2 flex-shrink-0">
              <p className="text-[10px] sm:text-sm font-black text-slate-400 uppercase tracking-widest leading-none">Daily Avg</p>
              <p className="text-lg sm:text-2xl font-black text-blue-600 mt-0.5 sm:mt-1">${game.average_price}</p>
           </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-4 sm:mb-8">
           <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0">
                 <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-400" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-slate-500 uppercase truncate">{game.needs_electricity ? game.electricity_amount || '220v' : 'No Power'}</span>
           </div>
           <div className="bg-slate-50 p-2 sm:p-3 rounded-lg sm:rounded-xl border border-slate-100 flex justify-between items-center">
              <span className="text-xs sm:text-sm font-black text-slate-400 flex items-center gap-1 sm:gap-2"><MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400" /> Space</span>
              <span className="text-xs sm:text-sm font-bold text-slate-500 uppercase">{game.space_required}</span>
           </div>
        </div>

        <div className="flex items-center justify-between pt-4 sm:pt-6 border-t border-slate-100">
           <div className="flex items-center gap-1.5 sm:gap-2">
              {game.status === 'active' ? (
                <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500" />
              ) : (
                <XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-300" />
              )}
              <span className="text-xs sm:text-sm font-black text-slate-400 uppercase tracking-widest">{game.status}</span>
           </div>
           <div className="flex items-center gap-2 sm:gap-3">
              {game.has_coins ? <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-500" /> : null}
              <button className="text-xs sm:text-sm font-black text-[#0f172a] uppercase tracking-widest flex items-center gap-1 group">
                Specs <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-30 group-hover:opacity-100 transition-opacity" />
              </button>
           </div>
        </div>
     </div>
  </div>
);

// =============================
// MAIN PRODUCTS COMPONENT
// =============================
const Products = () => {
  // ── STATE MANAGEMENT: UI & DATA ──
  const [games, setGames] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingGame, setEditingGame] = useState(null);
  
  // ── STATE MANAGEMENT: FORM DATA ──
  const [form, setForm] = useState({
    name: '', description: '', min_price: '', max_price: '', category: 'General',
    space_required: '2 m³', needs_electricity: false, electricity_amount: '',
    has_coins: false, extra_features: '', image_url: '', image_url2: '', image_url3: '', badge: 'None', status: 'active',
    space_mode: 'preset', custom_space_required: '', badge_mode: 'preset', custom_badge: ''
  });

  // ── INITIALIZATION ──
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = () => {
    axios.get(`${API}/products`)
      .then(res => setGames(res.data))
      .catch(err => console.error('Products fetch error'));
  };

  // ── IMAGE & FORM HANDLERS ──
  const handleImageUpload = (e, index) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (index === 1) setForm({...form, image_url: reader.result});
        else if (index === 2) setForm({...form, image_url2: reader.result});
        else if (index === 3) setForm({...form, image_url3: reader.result});
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const admin_name = localStorage.getItem('nlg_admin') || 'System';
    const min = Number(form.min_price);
    const max = Number(form.max_price);
    if (!Number.isFinite(min) || !Number.isFinite(max) || min < 0 || max < 0 || min >= max) {
      alert('Invalid price range. Minimum price must be less than maximum price.');
      return;
    }
    const finalSpace = form.space_mode === 'custom' ? form.custom_space_required.trim() : form.space_required;
    if (!finalSpace) {
      alert('Please choose a valid space requirement.');
      return;
    }
    const finalBadge = form.badge_mode === 'custom' ? form.custom_badge.trim() : form.badge;
    try {
      const payload = { ...form, space_required: finalSpace, badge: finalBadge, admin_name };
      if (editingGame) {
        await axios.put(`${API}/products/${editingGame.id}`, payload);
      } else {
        await axios.post(`${API}/products`, payload);
      }
      fetchProducts();
      setShowForm(false);
      setEditingGame(null);
      resetForm();
    } catch (err) {
      alert('Error saving product');
    }
  };

  const resetForm = () => {
    setForm({ 
      name: '', description: '', min_price: '', max_price: '', category: 'General', 
      space_required: '2 m³', needs_electricity: false, electricity_amount: '', 
      has_coins: false, extra_features: '', image_url: '', image_url2: '', image_url3: '', badge: 'None', status: 'active',
      space_mode: 'preset', custom_space_required: '', badge_mode: 'preset', custom_badge: ''
    });
  };

  // ── CRUD OPERATIONS ──
  const handleToggleFeatured = async (id) => {
    try {
      await axios.patch(`${API}/products/${id}/featured`);
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.error || 'Error toggling featured status');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Archive this product?')) {
      const admin_name = localStorage.getItem('nlg_admin') || 'System';
      await axios.delete(`${API}/products/${id}`, { data: { admin_name } });
      fetchProducts();
    }
  };

  const handleEdit = (game) => {
    setEditingGame(game);
    setForm({
      name: game.name || game.title || '',
      description: game.description || '',
      min_price: game.min_price || '',
      max_price: game.max_price || '',
      category: game.category || 'General',
      space_required: ['1 m³', '2 m³', '3 m³', '4 m³', '5 m³'].includes(game.space_required) ? game.space_required : '2 m³',
      needs_electricity: !!game.needs_electricity,
      electricity_amount: game.electricity_amount || '',
      has_coins: !!game.has_coins,
      extra_features: game.extra_features || '',
      image_url: game.image_url || '',
      image_url2: game.image_url2 || '',
      image_url3: game.image_url3 || '',
      badge: ['New', 'Popular', 'Featured', 'None'].includes(game.badge) ? game.badge : 'None',
      status: game.status || 'active',
      space_mode: ['1 m³', '2 m³', '3 m³', '4 m³', '5 m³'].includes(game.space_required) ? 'preset' : 'custom',
      custom_space_required: ['1 m³', '2 m³', '3 m³', '4 m³', '5 m³'].includes(game.space_required) ? '' : (game.space_required || ''),
      badge_mode: ['New', 'Popular', 'Featured', 'None'].includes(game.badge) ? 'preset' : 'custom',
      custom_badge: ['New', 'Popular', 'Featured', 'None'].includes(game.badge) ? '' : (game.badge || '')
    });
    setShowForm(true);
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      
      {/* =============================
          1. PAGE HEADER
          ============================= */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 sm:gap-6">
        <div>
           <h2 className="text-2xl sm:text-4xl font-black text-[#0f172a] tracking-tighter uppercase leading-none">Inventory</h2>
           <p className="text-slate-500 text-sm sm:text-base font-medium mt-1 sm:mt-2">Managing {games.length} professional arcade units.</p>
           <p className="text-yellow-600 text-xs sm:text-sm font-bold mt-1 flex items-center gap-1">
             <Star className="w-3 h-3" fill="currentColor" />
             {games.filter(g => g.is_featured).length}/9 Featured on Website Homepage
           </p>
        </div>
        <button onClick={() => { setEditingGame(null); resetForm(); setShowForm(true); }} className="btn-navy group flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-center">
           <Plus className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-90 transition-transform" /> New Machine
        </button>
      </div>

      {/* =============================
          2. ADD/EDIT FORM MODAL
          ============================= */}
      {showForm && (
        <div className="premium-card p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">{editingGame ? 'Edit Machine' : 'Add New Machine'}</h3>
            <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-100 rounded-xl"><X className="w-5 h-5" /></button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-400 uppercase tracking-widest ml-1">Name</label>
              <input type="text" required className="premium-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
              <select className="premium-input bg-white" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                <option>General</option><option>Fighting</option><option>Racing</option><option>Simulators</option><option>Retro</option><option>VR</option><option>Kiddie</option><option>Redemption</option>
              </select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
              <textarea className="premium-input" rows="2" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-400 uppercase tracking-widest ml-1">Min Price ($)</label>
              <input type="number" min="0" required className="premium-input" value={form.min_price} onChange={e => setForm({...form, min_price: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-400 uppercase tracking-widest ml-1">Max Price ($)</label>
              <input type="number" min="0" required className="premium-input" value={form.max_price} onChange={e => setForm({...form, max_price: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-400 uppercase tracking-widest ml-1">Space Required (m³)</label>
              <select className="premium-input bg-white" value={form.space_mode === 'custom' ? 'custom' : form.space_required} onChange={e => setForm({...form, space_mode: e.target.value === 'custom' ? 'custom' : 'preset', space_required: e.target.value === 'custom' ? form.space_required : e.target.value })}>
                <option value="1 m³">1 m³</option>
                <option value="2 m³">2 m³</option>
                <option value="3 m³">3 m³</option>
                <option value="4 m³">4 m³</option>
                <option value="5 m³">5 m³</option>
                <option value="custom">Custom</option>
              </select>
              {form.space_mode === 'custom' ? (
                <input type="text" className="premium-input" placeholder="Enter custom space value" value={form.custom_space_required} onChange={e => setForm({...form, custom_space_required: e.target.value})} />
              ) : null}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-400 uppercase tracking-widest ml-1">Badge Text</label>
              <select className="premium-input bg-white" value={form.badge_mode === 'custom' ? 'custom' : form.badge} onChange={e => setForm({...form, badge_mode: e.target.value === 'custom' ? 'custom' : 'preset', badge: e.target.value === 'custom' ? form.badge : e.target.value })}>
                <option value="New">New</option>
                <option value="Popular">Popular</option>
                <option value="Featured">Featured</option>
                <option value="None">None</option>
                <option value="custom">Custom badge</option>
              </select>
              {form.badge_mode === 'custom' ? (
                <input type="text" className="premium-input" placeholder="Enter custom badge" value={form.custom_badge} onChange={e => setForm({...form, custom_badge: e.target.value})} />
              ) : null}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-400 uppercase tracking-widest ml-1">Visibility</label>
              <select className="premium-input bg-white" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                <option value="active">Visible</option>
                <option value="hidden">Hidden</option>
              </select>
            </div>
            <div className="space-y-4 md:col-span-2">
              <label className="text-sm font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                 <Camera className="w-3 h-3 text-slate-400" /> Upload Machine Images (Up to 3)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 {[1, 2, 3].map((num) => {
                   const imgUrl = num === 1 ? form.image_url : num === 2 ? form.image_url2 : form.image_url3;
                   return (
                     <div key={num} className="flex flex-col gap-2">
                        <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, num)} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-black file:uppercase file:tracking-widest file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors cursor-pointer" />
                        {imgUrl && (
                           <div className="h-32 rounded-xl overflow-hidden shadow-sm border border-slate-100">
                              <img src={imgUrl} alt={`Preview ${num}`} className="w-full h-full object-cover" />
                           </div>
                        )}
                     </div>
                   );
                 })}
              </div>
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.needs_electricity} onChange={e => setForm({...form, needs_electricity: e.target.checked})} className="w-4 h-4 rounded" />
                <span className="text-sm font-bold text-slate-600">Needs Electricity</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.has_coins} onChange={e => setForm({...form, has_coins: e.target.checked})} className="w-4 h-4 rounded" />
                <span className="text-sm font-bold text-slate-600">Coin System</span>
              </label>
            </div>
            {form.needs_electricity && (
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-400 uppercase tracking-widest ml-1">Electricity Amount</label>
                <input type="text" className="premium-input" placeholder="e.g. 220v, 5 amps" value={form.electricity_amount} onChange={e => setForm({...form, electricity_amount: e.target.value})} />
              </div>
            )}
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-black text-slate-400 uppercase tracking-widest ml-1">Extra Features</label>
              <input type="text" className="premium-input" placeholder="e.g. LED lights, sound system" value={form.extra_features} onChange={e => setForm({...form, extra_features: e.target.value})} />
            </div>
            <div className="md:col-span-2">
              <button type="submit" className="btn-navy w-full flex items-center justify-center gap-3">
                <Plus className="w-5 h-5" /> {editingGame ? 'Update Machine' : 'Add Machine'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =============================
          3. PRODUCTS GRID DISPLAY
          ============================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
        {games.map(game => (
          <ProductCard key={game.id} game={game} onDelete={handleDelete} onEdit={handleEdit} onToggleFeatured={handleToggleFeatured} />
        ))}
        {games.length === 0 && (
          <div className="md:col-span-3 premium-card p-16 text-center">
            <Gamepad2 className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">No machines in inventory. Add your first one!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;

