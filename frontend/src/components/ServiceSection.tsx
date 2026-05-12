/**
 * ============================================================
 * PARTNERSHIP SERVICE SECTION
 * ============================================================
 * Final Graduation Project Refactor
 * Purpose: Conversion-focused section for B2B partnerships.
 * Features: "Space Takeover" model details, revenue guarantees,
 * and clear CTA for venue managers.
 * ============================================================
 */

import React from 'react';
import { motion } from 'framer-motion';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import PeopleIcon from '@mui/icons-material/People';
import HandshakeIcon from '@mui/icons-material/Handshake';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Link } from 'react-router-dom';

// =============================
// DATA CONFIGURATION
// =============================
const features = [
  {
    icon: LocationOnIcon,
    title: 'Transform Your Space',
    description: 'We turn any area into a premium gaming destination.',
    iconBg: '#E53935',
    iconColor: '#fff',
  },
  {
    icon: AutoAwesomeIcon,
    title: 'Let Us Handle It',
    description: 'Zero effort required. We handle setup and daily operations.',
    iconBg: '#FFD700',
    iconColor: '#1a2332',
  },
  {
    icon: PeopleIcon,
    title: 'Boost Engagement',
    description: 'Attract more visitors and increase foot traffic effortlessly.',
    iconBg: '#E53935',
    iconColor: '#fff',
  },
  {
    icon: HandshakeIcon,
    title: 'Share The Success',
    description: 'A win-win model designed so both parties benefit.',
    iconBg: '#FFD700',
    iconColor: '#1a2332',
  },
];

// =============================
// MAIN COMPONENT
// =============================
export function ServiceSection() {
  return (
    <section id="services" className="py-8 sm:py-14 relative overflow-hidden" style={{ backgroundColor: '#f8f9fb' }}>
      
      {/* =============================
          1. DECORATIVE ACCENTS
          ============================= */}
      <div
        className="absolute right-0 top-0 w-48 h-48 rounded-full pointer-events-none opacity-5"
        style={{ backgroundColor: '#E53935', transform: 'translate(40%, -40%)' }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* =============================
            2. SECTION HEADER
            ============================= */}
        <motion.div
          className="text-center mb-8 sm:mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
        >
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-3"
            style={{ backgroundColor: 'rgba(229,57,53,0.08)', border: '1px solid rgba(229,57,53,0.2)' }}
          >
            <HandshakeIcon className="w-3.5 h-3.5" style={{ color: '#E53935' }} />
            <span
              className="text-xs sm:text-sm"
              style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 700, color: '#E53935' }}
            >
              Event Space Partnership
            </span>
          </div>

          <h2
            className="text-xl sm:text-2xl lg:text-3xl mb-3"
            style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800, color: '#1a2332', lineHeight: '1.3' }}
          >
            Turn Your Space Into An{' '}
            <span style={{ color: '#E53935' }}>Entertainment Destination</span>
          </h2>

          <p
            className="text-sm sm:text-base lg:text-lg max-w-2xl mx-auto"
            style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 400, color: '#6b7280', lineHeight: '1.6' }}
          >
            Zero hassle. Full setup. Maximum fun.
          </p>
        </motion.div>

        {/* =============================
            3. FEATURES GRID
            ============================= */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 mb-6 sm:mb-12">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-5 shadow-sm"
                style={{ border: '1px solid #ebebeb' }}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08, duration: 0.4 }}
                whileHover={{ y: -3, boxShadow: '0 8px 20px rgba(0,0,0,0.09)' }}
              >
                <div
                  className="w-9 h-9 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center mb-2 sm:mb-3"
                  style={{ backgroundColor: feature.iconBg }}
                >
                  <Icon style={{ fontSize: 18, color: feature.iconColor }} />
                </div>

                <h3
                  className="text-sm sm:text-base mb-1 sm:mb-1.5"
                  style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, color: '#1a2332' }}
                >
                  {feature.title}
                </h3>

                <p
                  className="text-xs sm:text-sm leading-relaxed"
                  style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 400, color: '#6b7280' }}
                >
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* =============================
            4. CTA CONVERSION BAND
            ============================= */}
        <motion.div
          className="rounded-2xl p-5 sm:p-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
          style={{
            background: 'linear-gradient(135deg, #1a2332 0%, #253447 100%)',
            boxShadow: '0 8px 28px rgba(26,35,50,0.22)',
          }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
        >
          <div>
            <h3
              className="text-lg sm:text-xl text-white mb-1"
              style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800 }}
            >
              Ready to Elevate Your Event?
            </h3>
            <p
              className="text-xs sm:text-sm"
              style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 400, color: 'rgba(255,255,255,0.6)' }}
            >
              Let's build a custom entertainment plan for your venue.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:flex-shrink-0">
            <Link to="/services">
              <button
                className="w-full sm:w-auto px-6 py-3 sm:py-3.5 rounded-xl text-white flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                style={{
                  backgroundColor: '#E53935',
                  fontFamily: 'Open Sans, sans-serif',
                  fontWeight: 700,
                }}
              >
                Start Now
                <ArrowForwardIcon className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
