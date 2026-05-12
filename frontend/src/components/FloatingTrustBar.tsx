/**
 * ============================================================
 * FLOATING TRUST BAR COMPONENT
 * ============================================================
 * Final Graduation Project Refactor
 * Purpose: Passive social proof overlay.
 * Features: Infinite scrolling ticker of partners and locations, 
 * dismissible UI, and blur-glass aesthetics.
 * ============================================================
 */

import React, { useState, useEffect } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SchoolIcon from '@mui/icons-material/School';
import FavoriteIcon from '@mui/icons-material/Favorite';
import GroupsIcon from '@mui/icons-material/Groups';
import { motion, AnimatePresence } from 'framer-motion';

// =============================
// DATA CONFIGURATION
// =============================
const partners = [
  { name: 'Al Maaref School', type: 'school' },
  { name: 'Beirut', type: 'location' },
  { name: 'Lebanese Red Cross', type: 'ngo' },
  { name: 'Tripoli', type: 'location' },
  { name: 'Scouts Association', type: 'org' },
  { name: 'Sidon', type: 'location' },
  { name: 'Makassed Foundation', type: 'school' },
  { name: 'Jounieh', type: 'location' },
  { name: 'UNICEF Lebanon', type: 'ngo' },
  { name: 'Zahleh', type: 'location' },
  { name: 'Al Ahliah School', type: 'school' },
  { name: 'Byblos', type: 'location' },
  { name: 'Arc en Ciel NGO', type: 'ngo' },
  { name: 'Baalbek', type: 'location' },
  { name: 'International College', type: 'school' },
  { name: 'Tyre', type: 'location' },
];

// =============================
// SUB-COMPONENTS
// =============================

/**
 * PARTNER TAG
 * -----------
 * Renders a specific partner type with its corresponding icon.
 */
function PartnerTag({ partner }: { partner: (typeof partners)[0] }) {
  if (partner.type === 'location') {
    return (
      <span className="flex items-center gap-1.5 px-2">
        <LocationOnIcon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#FFD700' }} />
        <span style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600, color: '#FFD700', fontSize: '12px' }}>
          {partner.name}
        </span>
      </span>
    );
  }
  if (partner.type === 'school') {
    return (
      <span className="flex items-center gap-1.5 px-2">
        <SchoolIcon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#E53935' }} />
        <span style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600, color: 'rgba(255,255,255,0.9)', fontSize: '12px' }}>
          {partner.name}
        </span>
      </span>
    );
  }
  if (partner.type === 'ngo') {
    return (
      <span className="flex items-center gap-1.5 px-2">
        <FavoriteIcon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#FFD700' }} />
        <span style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600, color: 'rgba(255,255,255,0.9)', fontSize: '12px' }}>
          {partner.name}
        </span>
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1.5 px-2">
      <GroupsIcon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#E53935' }} />
      <span style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600, color: 'rgba(255,255,255,0.9)', fontSize: '12px' }}>
        {partner.name}
      </span>
    </span>
  );
}

// =============================
// MAIN COMPONENT
// =============================
export function FloatingTrustBar() {
  // ── STATE MANAGEMENT ──
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // ── VISIBILITY LOGIC ──
  useEffect(() => {
    if (dismissed) return;
    const timer = setTimeout(() => {
      setVisible(true);
    }, 4000);
    return () => clearTimeout(timer);
  }, [dismissed]);

  const handleDismiss = () => {
    setVisible(false);
    setDismissed(true);
  };

  // ── TICKER OPTIMIZATION ──
  // Duplicate partners for seamless scroll loop
  const allPartners = [...partners, ...partners, ...partners];

  return (
    <AnimatePresence>
      {visible && !dismissed && (
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 60, opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="fixed bottom-0 left-0 right-0 z-50 overflow-hidden"
          style={{
            height: '36px',
            background: 'rgba(26, 35, 50, 0.88)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            borderTop: '1px solid rgba(255, 215, 0, 0.25)',
            boxShadow: '0 -4px 20px rgba(0,0,0,0.3)',
          }}
        >
          {/* Fade left edge */}
          <div
            className="absolute left-0 top-0 bottom-0 w-12 z-10 pointer-events-none"
            style={{ background: 'linear-gradient(to right, rgba(26,35,50,0.9), transparent)' }}
          />

          {/* Scrolling ticker */}
          <div className="flex items-center h-full overflow-hidden">
            <motion.div
              className="flex items-center whitespace-nowrap"
              animate={{ x: ['0%', '-33.33%'] }}
              transition={{ duration: 30, ease: 'linear', repeat: Infinity }}
            >
              {allPartners.map((partner, i) => (
                <span key={i} className="flex items-center">
                  <PartnerTag partner={partner} />
                  <span className="text-white/25 mx-1 select-none">·</span>
                </span>
              ))}
            </motion.div>
          </div>

          {/* Fade right edge */}
          <div
            className="absolute right-8 top-0 bottom-0 w-12 z-10 pointer-events-none"
            style={{ background: 'linear-gradient(to left, rgba(26,35,50,0.9), transparent)' }}
          />

          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute right-0 top-0 bottom-0 px-3 flex items-center justify-center z-20 transition-colors hover:bg-white/10"
            style={{ borderLeft: '1px solid rgba(255,215,0,0.2)' }}
            aria-label="Close trust bar"
          >
            <CloseIcon className="w-3.5 h-3.5" style={{ color: '#FFD700' }} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
