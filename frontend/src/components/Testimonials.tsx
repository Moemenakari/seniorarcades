/**
 * ============================================================
 * SOCIAL PROOF & TESTIMONIALS
 * ============================================================
 * Final Graduation Project Refactor
 * Purpose: Displays customer feedback and rating metrics.
 * Features: Interactive testimonial slider, trust indicators, 
 * and Google-style rating summaries.
 * ============================================================
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import StarIcon from '@mui/icons-material/Star';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import PlaceIcon from '@mui/icons-material/Place';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { AuthModal } from './AuthModal';
import { getAuthToken } from '../utils/authSession';
import { API_BASE_URL } from '../config';

// =============================
// DATA CONFIGURATION
// =============================
interface Testimonial {
  id: number;
  rating: number;
  review: string;
  user_name: string;
  created_at: string;
}

// =============================
// SUB-COMPONENTS
// =============================
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <StarIcon
          key={i}
          className="w-4 h-4"
          style={{ color: i < rating ? '#FFD700' : '#d1d5db' }}
        />
      ))}
    </div>
  );
}

// =============================
// MAIN COMPONENT
// =============================
export function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isRateOpen, setIsRateOpen] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [userReview, setUserReview] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/ratings/platform/public`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setTestimonials(data.ratings);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const openRating = () => {
    const token = getAuthToken();
    if (!token) {
      setIsAuthOpen(true);
    } else {
      setIsRateOpen(true);
    }
  };

  const submitRating = async () => {
    const token = getAuthToken();
    if (!token || userRating === 0) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/ratings/platform`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ rating: userRating, review: userReview })
      });
      const data = await res.json();
      if (data.success) {
        setIsRateOpen(false);
        setUserRating(0);
        setUserReview('');
        alert('Thank you for rating our service!');
        // Refresh testimonials
        fetch(`${API_BASE_URL}/ratings/platform/public`)
          .then(r => r.json())
          .then(data => { if (data.success) setTestimonials(data.ratings); });
      } else {
        alert(data.error || 'Failed to submit rating');
      }
    } catch (err) {
      alert('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  const featured = testimonials[0];
  const rest = testimonials.slice(1);

  return (
    <section className="py-8 sm:py-14" style={{ backgroundColor: '#1a2332' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* =============================
            1. SECTION HEADER
            ============================= */}
        <motion.div
          className="text-center mb-8 sm:mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
        >
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-3"
            style={{ backgroundColor: 'rgba(255,215,0,0.12)', border: '1px solid rgba(255,215,0,0.3)' }}
          >
            <StarIcon className="w-3 h-3" style={{ color: '#FFD700' }} />
            <span
              className="text-xs sm:text-sm"
              style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 700, color: '#FFD700' }}
            >
              The Reputation
            </span>
          </div>
          <h2
            className="text-xl sm:text-2xl lg:text-3xl text-white"
            style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800 }}
          >
            Trusted by Event Managers
            <span className="block mt-0.5" style={{ color: '#FFD700' }}>
              Across Lebanon
            </span>
          </h2>
          <p
            className="mt-2 text-sm sm:text-base max-w-xl mx-auto"
            style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 400, color: 'rgba(255,255,255,0.6)', lineHeight: '1.6' }}
          >
            Real feedback from school coordinators, festival directors, and NGO managers who trusted Next Level Game.
          </p>
        </motion.div>

        {/* =============================
            2. TESTIMONIAL GRID
            ============================= */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#FFD700]" />
          </div>
        ) : testimonials.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* ── Featured Large Card ── */}
            {featured && (
              <motion.div
                className="lg:col-span-1 rounded-2xl p-5 sm:p-7 flex flex-col gap-4 relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #E53935 0%, #c62828 100%)',
                  boxShadow: '0 8px 28px rgba(229,57,53,0.3)',
                }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55 }}
              >
                <FormatQuoteIcon
                  className="absolute top-3 right-3 w-12 h-12 opacity-10 text-white"
                />

                <StarRating rating={featured.rating} />

                <p
                  className="text-sm sm:text-base leading-relaxed flex-1"
                  style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 400, color: 'rgba(255,255,255,0.95)', fontStyle: 'italic' }}
                >
                  "{featured.review}"
                </p>

                <div className="flex items-center gap-3 pt-2 border-t border-white/20">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 border-2 border-white/40">
                    <span className="text-white font-black text-lg">{featured.user_name[0]}</span>
                  </div>
                  <div>
                    <div
                      className="text-sm sm:text-base"
                      style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, color: '#fff' }}
                    >
                      {featured.user_name}
                    </div>
                    <div
                      className="text-xs sm:text-sm"
                      style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 400, color: 'rgba(255,255,255,0.7)' }}
                    >
                      Client Review
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── Standard Cards ── */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              {rest.map((t, index) => (
                <motion.div
                  key={t.id}
                  className="rounded-2xl p-4 sm:p-5 flex flex-col gap-3"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.09)',
                    backdropFilter: 'blur(8px)',
                  }}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08, duration: 0.45 }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5 sm:gap-3">
                      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 border-2"
                        style={{ borderColor: 'rgba(255,215,0,0.35)' }}
                      >
                        <span className="text-white font-black text-sm">{t.user_name[0]}</span>
                      </div>
                      <div>
                        <div
                          className="text-sm"
                          style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, color: '#fff' }}
                        >
                          {t.user_name}
                        </div>
                        <div
                          className="text-xs"
                          style={{ fontFamily: 'Open Sans, sans-serif', color: 'rgba(255,255,255,0.5)' }}
                        >
                          Client Review
                        </div>
                      </div>
                    </div>
                    <StarRating rating={t.rating} />
                  </div>

                  <p
                    className="text-xs sm:text-sm leading-relaxed"
                    style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 400, color: 'rgba(255,255,255,0.78)', fontStyle: 'italic' }}
                  >
                    "{t.review}"
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-white/5 rounded-3xl border border-white/10">
            <StarIcon style={{ fontSize: 48, color: 'rgba(255,215,0,0.2)' }} />
            <p className="mt-4 text-white/40 font-bold uppercase tracking-widest text-sm">No reviews available yet</p>
          </div>
        )}

        {/* =============================
            3. TRUST SUMMARY BAR
            ============================= */}
        <motion.div
          className="mt-6 sm:mt-10 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {[
            { val: '1000+', label: 'Events/Year', color: '#FFD700' },
            { val: '5.0', label: 'Avg Rating', color: '#FFD700' },
            { val: '50+', label: 'Games', color: '#E53935' },
            { val: '100%', label: 'Satisfaction', color: '#E53935' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-lg px-3 py-2 sm:px-4 sm:py-3 text-center"
              style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div
                className="text-xl sm:text-2xl"
                style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800, color: stat.color }}
              >
                {stat.val}
              </div>
              <div
                className="text-[10px] sm:text-xs mt-0.5"
                style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>

        <div className="mt-10 text-center">
          <button onClick={openRating} className="px-6 py-3 rounded-full bg-[#E53935] text-white font-bold text-sm shadow-lg hover:scale-105 transition-all">
            Rate Our Service
          </button>
        </div>
      </div>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} onSuccess={() => { setIsAuthOpen(false); setIsRateOpen(true); }} />

      {/* Platform Rating Modal */}
      {isRateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 relative">
            <button onClick={() => setIsRateOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800">X</button>
            <h3 className="text-xl font-bold mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>Rate Next Level Game</h3>
            <p className="text-sm text-gray-500 mb-4">How was your overall experience with our service?</p>
            <div className="flex justify-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map(star => (
                <StarIcon key={star} onClick={() => setUserRating(star)} className="cursor-pointer" style={{ color: star <= userRating ? '#FFD700' : '#d1d5db', fontSize: 32 }} />
              ))}
            </div>
            <textarea 
              placeholder="Tell us what you loved..." 
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#E53935] mb-4"
              rows={3}
              value={userReview}
              onChange={e => setUserReview(e.target.value)}
            />
            <button 
              onClick={submitRating} 
              disabled={submitting || userRating === 0}
              className="w-full py-3 bg-[#E53935] text-white rounded-xl text-sm font-bold hover:opacity-90 disabled:opacity-50 transition-colors"
            >
              {submitting ? 'Submitting...' : 'Submit Rating'}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}