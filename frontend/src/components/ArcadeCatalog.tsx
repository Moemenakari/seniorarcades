/**
 * ============================================================
 * ARCADE CATALOG COMPONENT
 * ============================================================
 * Final Graduation Project Refactor
 * Purpose: Interactive gallery of available arcade machines.
 * Features: Mobile-first 3-column grid, MUI icons, and
 * direct navigation to product details.
 * ============================================================
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import SavingsIcon from '@mui/icons-material/Savings';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { API_BASE_URL } from '../config';

// =============================
// TYPES & CONFIGURATION
// =============================
type LabelType = 'new' | 'trend' | 'sale';

interface Game {
  id: number;
  title: string;
  category: string;
  image: string;
  label?: { type: LabelType; text: string };
}

const labelConfig: Record<LabelType, { bg: string; text: string; icon: any }> = {
  new: { bg: '#FFD700', text: '#1a2332', icon: LocalFireDepartmentIcon },
  trend: { bg: '#E53935', text: '#fff', icon: RocketLaunchIcon },
  sale: { bg: '#1a2332', text: '#FFD700', icon: SavingsIcon },
};

// =============================
// MAIN CATALOG COMPONENT
// =============================
export function ArcadeCatalog() {
  const navigate = useNavigate();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ── DATA FETCHING ──
  useEffect(() => {
    fetch(`${API_BASE_URL}/games`)
      .then(res => res.json())
      .then(data => {
        const formattedData = data.map((item: any) => ({
          id: item.id,
          title: item.name || item.title,
          category: item.category,
          image: item.image_url || 'https://images.unsplash.com/photo-1692554987643-2fb74a4fdccb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaW5iYWxsJTIwYXJjYWRlJTIwbWFjaGluZXxlbnwxfHx8fDE3NzIyOTE3NjN8MA&ixlib=rb-4.1.0&q=80&w=600',
          label: item.status === 'active' ? { type: 'new' as LabelType, text: 'AVAILABLE' } : undefined,
        }));
        setGames(formattedData);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('Failed to load games.');
        setLoading(false);
      });
  }, []);

  return (
    <section id="catalog" className="py-8 sm:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* =============================
            1. SECTION HEADER
            ============================= */}
        <motion.div
          className="text-center mb-6 sm:mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
        >
          <div
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full mb-2"
            style={{ backgroundColor: 'rgba(26,35,50,0.06)', border: '1px solid rgba(26,35,50,0.12)' }}
          >
            <SportsEsportsIcon style={{ fontSize: 14, color: '#1a2332' }} />
            <span
              className="text-xs sm:text-sm"
              style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 700, color: '#1a2332' }}
            >
              The Eye Candy
            </span>
          </div>
          <h2
            className="text-xl sm:text-3xl lg:text-4xl mb-2"
            style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800, color: '#1a2332' }}
          >
            Our Arcade Catalog
          </h2>
          <p
            className="text-sm sm:text-base max-w-2xl mx-auto"
            style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 400, color: '#6b7280' }}
          >
            Discover our collection of premium arcade machines for your next event.
          </p>
        </motion.div>

        {/* =============================
            2. STATUS HANDLERS
            ============================= */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#E53935]"></div>
          </div>
        )}
        {error && (
          <div className="text-center py-12">
            <p style={{ fontFamily: 'Open Sans, sans-serif', color: '#E53935' }}>{error}</p>
          </div>
        )}

        {/* =============================
            3. MACHINE GRID (3 columns on all screens)
            ============================= */}
        {!loading && !error && (
          <div className="grid grid-cols-3 gap-2 sm:gap-5">
            {games.map((game, index) => (
              <motion.div
                key={game.id}
                className="group relative rounded-xl sm:rounded-2xl overflow-hidden cursor-pointer shadow-sm sm:shadow-md bg-white"
                style={{ aspectRatio: '4/5' }}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05, duration: 0.4 }}
                onClick={() => navigate(`/product/${game.id}`)}
              >
                {/* Machine Image */}
                <ImageWithFallback
                  src={game.image}
                  alt={game.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />

                {/* Gradient Overlay (Visible on hover/tap) */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
                  style={{
                    background: 'rgba(26,35,50,0.7)',
                    backdropFilter: 'blur(2px)',
                  }}
                >
                  <div 
                    className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[#FFD700] flex items-center justify-center shadow-lg transform scale-50 group-hover:scale-100 transition-transform duration-300"
                  >
                    <VisibilityIcon className="text-[#1a2332] w-6 h-6 sm:w-8 sm:h-8" />
                  </div>
                </div>

                {/* Bottom Info Bar (Fixed) */}
                <div 
                  className="absolute bottom-0 left-0 right-0 p-2 sm:p-4 bg-gradient-to-t from-black/80 to-transparent"
                >
                  <p
                    className="text-white font-bold text-center leading-tight truncate text-[10px] sm:text-sm lg:text-base"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    {game.title}
                  </p>
                </div>

                {/* Status Badge */}
                {game.label && (() => {
                  const cfg = labelConfig[game.label.type];
                  const LabelIcon = cfg.icon;
                  return (
                    <div
                      className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full shadow-sm"
                      style={{ backgroundColor: cfg.bg }}
                    >
                      <LabelIcon className="w-3 h-3 flex-shrink-0" style={{ color: cfg.text }} />
                      <span
                        className="hidden sm:inline font-bold"
                        style={{ fontFamily: 'Open Sans, sans-serif', color: cfg.text, fontSize: '10px' }}
                      >
                        {game.label.text}
                      </span>
                    </div>
                  );
                })()}
              </motion.div>
            ))}
          </div>
        )}

        {/* =============================
            4. CONVERSION FOOTER
            ============================= */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8 sm:mt-14 p-5 sm:p-7 rounded-2xl bg-gray-50 border border-gray-100"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p
            className="text-sm sm:text-base font-semibold text-[#4b5563]"
            style={{ fontFamily: 'Open Sans, sans-serif' }}
          >
            And many more machines available for your event
          </p>
          <button
            onClick={() => navigate('/services')}
            className="px-5 py-2.5 sm:px-7 sm:py-3 rounded-xl text-white transition-all hover:shadow-xl hover:scale-105 active:scale-95 text-xs sm:text-sm"
            style={{ backgroundColor: '#E53935', fontFamily: 'Montserrat, sans-serif', fontWeight: 700 }}
          >
            Go to Catalog
          </button>
        </motion.div>
      </div>
    </section>
  );
}