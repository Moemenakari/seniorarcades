/**
 * ============================================================
 * FRONTEND HERO COMPONENT
 * ============================================================
 * Final Graduation Project Refactor
 * Purpose: High-impact introduction to the NLG brand.
 * Features: 75vh background image, contrast overlay,
 * compact mobile-first layout, and Material UI icons.
 * ============================================================
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import BuildIcon from '@mui/icons-material/Build';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SportsScoreIcon from '@mui/icons-material/SportsScore';
import CelebrationIcon from '@mui/icons-material/Celebration';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';

export function Hero() {
  const scrollToCatalog = () => {
    const element = document.getElementById('catalog');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="relative flex items-center overflow-hidden" style={{ height: '75vh', minHeight: '520px' }}>
      
      {/* =============================
          1. BACKGROUND IMAGE + OVERLAY
          ============================= */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1511512578047-dfb367046420?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div 
          className="absolute inset-0" 
          style={{ 
            background: 'linear-gradient(135deg, rgba(26,35,50,0.92) 0%, rgba(26,35,50,0.75) 50%, rgba(229,57,53,0.3) 100%)',
          }} 
        />
      </div>

      {/* Decorative accent shapes */}
      <div className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-[0.04] pointer-events-none" style={{ backgroundColor: '#FFD700', transform: 'translate(30%, -30%)' }} />
      <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full opacity-[0.06] pointer-events-none" style={{ backgroundColor: '#E53935', transform: 'translate(-30%, 30%)' }} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-12 sm:pb-0">
        <div className="max-w-2xl lg:max-w-3xl">

          {/* =============================
              2. CONTENT
              ============================= */}
          <motion.div
            className="flex flex-col gap-3 sm:gap-5"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            {/* Authority Badge */}
            <motion.div
              className="inline-flex self-start items-center gap-1.5 px-2.5 py-1 rounded-full"
              style={{ backgroundColor: 'rgba(255,215,0,0.15)', border: '1px solid rgba(255,215,0,0.3)' }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <EmojiEventsIcon style={{ fontSize: 14, color: '#FFD700' }} />
              <span
                className="text-xs sm:text-sm tracking-wide"
                style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, color: '#FFD700' }}
              >
                #1 Arcade Entertainment in Lebanon
              </span>
            </motion.div>

            {/* Main Title — compact on mobile */}
            <h1
              className="text-[28px] sm:text-4xl lg:text-5xl xl:text-6xl leading-[1.15] text-white pt-8 sm:pt-4"
              style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800 }}
            >
              Rent or Buy Arcade Games,
              <span className="block mt-1 text-[#E53935]">
                Inflatables & More
              </span>
              <span className="block mt-0.5" style={{ color: '#FFD700' }}>
                for Your Next Event
              </span>
            </h1>

            <h2
              className="text-lg sm:text-xl lg:text-2xl text-white/90 dir-rtl"
              style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, direction: 'rtl' }}
            >
              نوفر ألعاب أركيد وكرنفال احترافية لجميع الإيفنتات والمهرجانات في لبنان
            </h2>

            {/* Description — small and readable on mobile */}
            <p
              className="text-base sm:text-lg lg:text-xl text-gray-200 leading-relaxed max-w-2xl font-bold italic"
              style={{ fontFamily: 'Open Sans, sans-serif' }}
            >
              Boxing, basketball, shooting games, inflatables & more for parties, corporate events & festivals.
              <br className="hidden sm:block" />
              Call or WhatsApp: <span className="text-[#FFD700]">03 919 876</span>. Book now!
            </p>

            {/* Call to Actions — compact buttons on mobile */}
            <div className="flex flex-row gap-2.5 sm:gap-3 pt-1">
              <motion.button
                onClick={scrollToCatalog}
                className="flex items-center justify-center gap-2 px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl text-[#1a2332] shadow-lg"
                style={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 700,
                  backgroundColor: '#FFD700',
                  fontSize: '13px',
                }}
                whileHover={{ scale: 1.04, backgroundColor: '#fff' }}
                whileTap={{ scale: 0.97 }}
              >
                <SportsEsportsIcon style={{ fontSize: 18 }} />
                <span className="sm:text-sm">Explore Catalog</span>
              </motion.button>

              <Link to="/services">
                <motion.button
                  className="flex items-center justify-center gap-2 px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl border border-white/30 text-white"
                  style={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 700,
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    backdropFilter: 'blur(8px)',
                    fontSize: '13px',
                  }}
                  whileHover={{
                    backgroundColor: 'rgba(255,255,255,0.18)',
                    borderColor: 'white',
                    scale: 1.04,
                  }}
                  whileTap={{ scale: 0.97 }}
                >
                  <BuildIcon style={{ fontSize: 16 }} />
                  <span className="sm:text-sm">Our Services</span>
                </motion.button>
              </Link>
            </div>

            {/* Performance Stats — mini cards */}
            <div className="flex items-center gap-3 sm:gap-5 pt-3 sm:pt-5 mt-1 sm:mt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              {[
                { val: '50+', label: 'Games', icon: SportsScoreIcon },
                { val: '1000+', label: 'Events/Year', icon: CelebrationIcon },
                { val: '100%', label: 'Satisfaction', icon: ThumbUpAltIcon },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="flex items-center gap-2">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(229,57,53,0.15)' }}>
                      <Icon style={{ fontSize: 14, color: '#E53935' }} />
                    </div>
                    <div className="flex flex-col">
                      <span
                        className="text-base sm:text-lg font-extrabold leading-none"
                        style={{ fontFamily: 'Montserrat, sans-serif', color: '#FFD700' }}
                      >
                        {stat.val}
                      </span>
                      <span
                        className="text-[10px] sm:text-xs uppercase tracking-wider text-gray-400 leading-tight"
                        style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
                      >
                        {stat.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
