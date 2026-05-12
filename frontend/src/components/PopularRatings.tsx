import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import StarIcon from '@mui/icons-material/Star';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../config';

interface Rating {
  id: number;
  rating: number;
  review: string;
  user_name: string;
  game_name: string;
  created_at: string;
  product_id: number;
}

export function PopularRatings() {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/ratings/popular`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setRatings(data.ratings);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading || ratings.length === 0) return null;

  return (
    <section className="py-8 sm:py-14 bg-[#f8f9fb]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
        >
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full mb-2" style={{ backgroundColor: 'rgba(229,57,53,0.08)', border: '1px solid rgba(229,57,53,0.2)' }}>
            <ChatBubbleOutlineIcon style={{ fontSize: 14, color: '#E53935' }} />
            <span className="text-xs sm:text-sm" style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 700, color: '#E53935' }}>Top Player Reviews</span>
          </div>
          <h2 className="text-xl sm:text-3xl lg:text-4xl mb-1 text-[#1a2332]" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800 }}>
            What Players Are Saying
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ratings.map((r, i) => (
            <motion.div
              key={r.id}
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
            >
              <div className="flex gap-0.5 mb-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <StarIcon key={star} style={{ fontSize: 16, color: star <= r.rating ? '#FFD700' : '#d1d5db' }} />
                ))}
              </div>
              <p className="text-sm italic text-gray-600 mb-3 flex-grow" style={{ fontFamily: 'Open Sans, sans-serif' }}>"{r.review}"</p>
              <div className="border-t border-gray-100 pt-3 mt-auto">
                <p className="text-xs font-bold text-[#1a2332]" style={{ fontFamily: 'Montserrat, sans-serif' }}>{r.user_name}</p>
                <Link to={`/product/${r.product_id}`} className="text-[10px] text-[#E53935] hover:underline" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                  on {r.game_name}
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-8 text-center">
          <Link to="/catalog">
            <button className="px-6 py-2.5 rounded-full border border-gray-300 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">
              View More Reviews
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
