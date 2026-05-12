import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { API_BASE_URL } from '../config';

type LabelType = 'new' | 'trend' | 'sale';
interface Game {
  id: number; title: string; category: string;
  image_url: string; is_featured?: number;
}

const FALLBACK = 'https://images.unsplash.com/photo-1692554987643-2fb74a4fdccb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600';

export function FeaturedCatalog() {
  const navigate = useNavigate();
  const [games, setGames] = useState<Game[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllProducts = () => {
      fetch(`${API_BASE_URL}/products`)
        .then(r => r.json())
        .then(all => {
          setGames((Array.isArray(all) ? all : []).slice(0, 9).map((item: any) => ({
            id: item.id, title: item.name || item.title,
            category: item.category, image_url: item.image_url || FALLBACK,
          })));
          setTotal(Array.isArray(all) ? all.length : 0);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    };

    fetch(`${API_BASE_URL}/products/featured`)
      .then(r => r.json())
      .then(data => {
        if (data.featured && data.featured.length > 0) {
          setGames(data.featured.map((item: any) => ({
            id: item.id,
            title: item.name || item.title,
            category: item.category,
            image_url: item.image_url || FALLBACK,
            is_featured: item.is_featured,
          })));
          setTotal(data.total || 0);
          setLoading(false);
        } else {
          // Fallback: fetch all products if no featured set
          fetchAllProducts();
        }
      })
      .catch(() => {
        fetchAllProducts();
      });
  }, []);

  return (
    <section id="catalog" className="py-8 sm:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div className="text-center mb-6 sm:mb-12"
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.55 }}>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full mb-2"
            style={{ backgroundColor: 'rgba(26,35,50,0.06)', border: '1px solid rgba(26,35,50,0.12)' }}>
            <SportsEsportsIcon style={{ fontSize: 14, color: '#1a2332' }} />
            <span className="text-xs sm:text-sm" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 700, color: '#1a2332' }}>The Eye Candy</span>
          </div>
          <h2 className="text-xl sm:text-3xl lg:text-4xl mb-1" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800, color: '#1a2332' }}>
            Featured Arcade Games
          </h2>
          {!loading && (
            <p className="text-sm sm:text-base" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600, color: '#E53935' }}>
              Showing {games.length} out of {total} total games
            </p>
          )}
          <p className="text-sm sm:text-base max-w-2xl mx-auto mt-1" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 400, color: '#6b7280' }}>
          </p>
        </motion.div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#E53935]" />
          </div>
        )}

        {/* Grid — always 3 columns */}
        {!loading && games.length > 0 && (
          <div className="grid grid-cols-3 gap-2 sm:gap-5">
            {games.map((game, index) => (
              <motion.div key={game.id}
                className="group relative rounded-xl sm:rounded-2xl overflow-hidden cursor-pointer shadow-sm sm:shadow-md bg-white"
                style={{ aspectRatio: '4/5' }}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05, duration: 0.4 }}
                onClick={() => navigate(`/product/${game.id}`)}>
                <ImageWithFallback src={game.image_url} alt={game.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
                  style={{ background: 'rgba(26,35,50,0.7)', backdropFilter: 'blur(2px)' }}>
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[#FFD700] flex items-center justify-center shadow-lg transform scale-50 group-hover:scale-100 transition-transform duration-300">
                    <VisibilityIcon className="text-[#1a2332]" style={{ fontSize: 22 }} />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-4 bg-gradient-to-t from-black/80 to-transparent">
                  <p className="text-white font-bold text-center leading-tight truncate text-[10px] sm:text-sm lg:text-base"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}>{game.title}</p>
                </div>
                {game.is_featured === 1 && (
                  <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full shadow-sm" style={{ backgroundColor: '#FFD700' }}>
                    <LocalFireDepartmentIcon style={{ fontSize: 10, color: '#1a2332' }} />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* View Full Catalog CTA */}
        <motion.div className="flex justify-center mt-8 sm:mt-12"
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <button onClick={() => navigate('/catalog')}
            className="px-8 py-3 rounded-full text-white transition-all hover:shadow-lg hover:scale-105 active:scale-95 text-xs sm:text-sm font-bold"
            style={{ backgroundColor: '#E53935', fontFamily: 'Montserrat, sans-serif' }}>
            View Full Catalog →
          </button>
        </motion.div>
      </div>
    </section>
  );
}
