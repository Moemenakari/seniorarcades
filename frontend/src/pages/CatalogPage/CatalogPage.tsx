import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { API_BASE_URL } from '../../config';

type LabelType = 'new' | 'trend' | 'sale';
interface Game {
  id: number; title: string; name?: string; category: string;
  image_url: string; status: string; is_featured?: number;
  badge?: string; space_required?: string; electricity_amount?: string;
  has_coins?: number; rent_price?: string; min_price?: number; max_price?: number; image_url2?: string; image_url3?: string;
}

const CATEGORIES = ['All', 'General', 'Fighting', 'Racing', 'Simulators', 'Retro', 'VR', 'Kiddie', 'Redemption'];
const SUITABILITIES = [
  { key: 'all', label: 'All Events' },
  { key: 'university', label: 'University' },
  { key: 'festival', label: 'Festival' },
  { key: 'school', label: 'School / Kids' },
  { key: 'private', label: 'Private Party' },
  { key: 'corporate', label: 'Corporate' },
];

export function Catalog() {
  const navigate = useNavigate();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [suitability, setSuitability] = useState('all');
  const [popularOnly, setPopularOnly] = useState(false);

  const fetchGames = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category !== 'All') params.set('category', category);
    if (suitability !== 'all') params.set('suitability', suitability);
    if (popularOnly) params.set('popular', 'true');
    fetch(`${API_BASE_URL}/products?${params}`)
      .then(r => r.json())
      .then(data => {
        setGames(data.map((item: any) => ({
          id: item.id,
          title: item.name || item.title,
          category: item.category,
          image_url: item.image_url || '',
          status: item.status,
          is_featured: item.is_featured,
          badge: item.badge,
          space_required: item.space_required,
          electricity_amount: item.needs_electricity ? item.electricity_amount || '220V' : 'No Power',
          has_coins: item.has_coins,
          rent_price: item.rent_price,
          min_price: item.min_price,
          max_price: item.max_price
        })));
        setLoading(false);
      })
      .catch(() => { setError('Failed to load catalog.'); setLoading(false); });
  }, [category, suitability, popularOnly]);

  useEffect(() => { fetchGames(); }, [fetchGames]);

  const filtered = games.filter(g => (g.title || '').toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="bg-white min-h-screen">
      {/* HERO */}
      <section className="relative py-14 overflow-hidden" style={{ backgroundColor: '#1a2332' }}>
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%)',
          backgroundSize: '24px 24px'
        }} />
        <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4"
              style={{ backgroundColor: 'rgba(255,215,0,0.15)', border: '1px solid rgba(255,215,0,0.3)' }}>
              <SportsEsportsIcon style={{ fontSize: 13, color: '#FFD700' }} />
              <span className="text-xs font-bold tracking-widest uppercase" style={{ color: '#FFD700', fontFamily: 'Open Sans, sans-serif' }}>Full Catalog</span>
            </div>
            <h1 className="text-3xl sm:text-5xl mb-4 text-white" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800 }}>
              Our Arcade <span style={{ color: '#FFD700' }}>Collection</span>
            </h1>
            <p className="text-white/70 text-base sm:text-lg max-w-2xl mx-auto" style={{ fontFamily: 'Open Sans, sans-serif' }}>
              Every machine available for rent — from classic retro cabinets to next-gen simulators.
            </p>
          </motion.div>
        </div>
      </section>

      {/* FILTERS */}
      <section className="sticky top-14 z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap gap-2 items-center">
          <input
            type="text" placeholder="Search games…" value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 min-w-[180px] max-w-xs px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none"
            style={{ fontFamily: 'Open Sans, sans-serif' }}
          />
          <select value={category} onChange={e => setCategory(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 text-sm font-semibold bg-white focus:outline-none"
            style={{ fontFamily: 'Open Sans, sans-serif', color: '#1a2332' }}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <select value={suitability} onChange={e => setSuitability(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 text-sm font-semibold bg-white focus:outline-none"
            style={{ fontFamily: 'Open Sans, sans-serif', color: '#1a2332' }}>
            {SUITABILITIES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
          <button onClick={() => setPopularOnly(p => !p)}
            className="px-3 py-2 rounded-xl border text-sm font-bold transition-all"
            style={{ backgroundColor: popularOnly ? '#E53935' : 'white', color: popularOnly ? 'white' : '#1a2332', borderColor: popularOnly ? '#E53935' : '#e5e7eb', fontFamily: 'Open Sans, sans-serif' }}>
            Popular Only
          </button>
          <span className="ml-auto text-xs font-bold text-gray-400" style={{ fontFamily: 'Open Sans, sans-serif' }}>
            {filtered.length} game{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
      </section>

      {/* GRID */}
      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading && <div className="text-center py-24"><div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#E53935]" /></div>}
          {error && <p className="text-center py-24 text-[#E53935] font-semibold">{error}</p>}
          {!loading && !error && filtered.length === 0 && (
            <div className="text-center py-24">
              <SportsEsportsIcon style={{ fontSize: 56, color: '#d1d5db' }} />
              <p className="mt-4 text-gray-400 font-semibold" style={{ fontFamily: 'Open Sans, sans-serif' }}>No games match your filters.</p>
              <button onClick={() => { setCategory('All'); setSuitability('all'); setPopularOnly(false); setSearch(''); }}
                className="mt-4 px-6 py-2.5 rounded-xl text-white text-sm font-bold"
                style={{ backgroundColor: '#E53935', fontFamily: 'Montserrat, sans-serif' }}>
                Reset Filters
              </button>
            </div>
          )}
          {!loading && !error && filtered.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
              {filtered.map((game, index) => (
                <motion.div key={game.id}
                  className="group relative rounded-xl overflow-hidden cursor-pointer shadow-sm bg-white border border-gray-100 hover:shadow-xl transition-all duration-300 flex flex-col"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.04, 0.4), duration: 0.4 }}
                  onClick={() => navigate(`/product/${game.id}`)}>
                  <div className="relative aspect-square sm:aspect-[4/3] overflow-hidden bg-gray-50">
                    <ImageWithFallback src={game.image_url} alt={game.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    
                    <div className="absolute top-2 left-2 px-2.5 py-1 rounded-md shadow-md z-10" style={{ backgroundColor: '#1a2332' }}>
                      <span className="font-bold text-[10px] text-white tracking-widest uppercase" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                        {game.badge || game.category}
                      </span>
                    </div>

                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center bg-black/40 backdrop-blur-[2px] z-0">
                      <div className="w-10 h-10 rounded-full bg-[#FFD700] flex items-center justify-center transform scale-50 group-hover:scale-100 transition-transform duration-300 shadow-lg">
                        <VisibilityIcon className="text-[#1a2332]" style={{ fontSize: 18 }} />
                      </div>
                    </div>
                  </div>

                  <div className="p-3 sm:p-4 flex flex-col flex-1">
                    <h3 className="font-bold text-[#1a2332] text-sm sm:text-base line-clamp-1 mb-3" style={{ fontFamily: 'Montserrat, sans-serif' }}>{game.title}</h3>
                    
                    <div className="grid grid-cols-2 gap-2 mt-auto">
                      <div className="bg-gray-50 rounded-lg p-2 flex flex-col justify-center border border-gray-100">
                        <p className="text-[9px] text-gray-400 font-bold uppercase mb-0.5" style={{ fontFamily: 'Open Sans, sans-serif' }}>Space (m³)</p>
                        <p className="text-[11px] font-semibold text-gray-700 truncate">{game.space_required || 'N/A'}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2 flex flex-col justify-center border border-gray-100">
                        <p className="text-[9px] text-gray-400 font-bold uppercase mb-0.5" style={{ fontFamily: 'Open Sans, sans-serif' }}>Power (AMP)</p>
                        <p className="text-[11px] font-semibold text-gray-700 truncate">{game.electricity_amount || 'N/A'}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2 flex flex-col justify-center border border-gray-100">
                        <p className="text-[9px] text-gray-400 font-bold uppercase mb-0.5" style={{ fontFamily: 'Open Sans, sans-serif' }}>System</p>
                        <p className="text-[11px] font-semibold text-gray-700 truncate">{game.has_coins ? 'Coins' : 'Free Play'}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2 flex flex-col justify-center border border-gray-100">
                        <p className="text-[9px] text-gray-400 font-bold uppercase mb-0.5" style={{ fontFamily: 'Open Sans, sans-serif' }}>Price Range</p>
                        <p className="text-[11px] font-semibold text-gray-700 truncate" title={game.rent_price}>
                          {typeof game.min_price === 'number' && typeof game.max_price === 'number'
                            ? `$${game.min_price} - $${game.max_price}`
                            : (game.rent_price || 'Ask for price')}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="py-12 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-500 mb-4" style={{ fontFamily: 'Open Sans, sans-serif' }}>Don't see what you need? We add new machines regularly.</p>
          <a href="https://wa.me/96103919876" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-white font-bold text-sm transition-all hover:scale-105 hover:shadow-xl"
            style={{ backgroundColor: '#25D366', fontFamily: 'Montserrat, sans-serif' }}>
            Contact on WhatsApp
          </a>
        </div>
      </section>
    </div>
  );
}
