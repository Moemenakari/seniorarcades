/**
 * ============================================================
 * BENTO FEATURES COMPONENT
 * ============================================================
 * Final Graduation Project Refactor
 * Purpose: Visual breakdown of the company's core advantages.
 * Features: High-density layout (Bento), interactive hover
 * effects, and value-driven iconography.
 * ============================================================
 */

import React from 'react';
import { motion } from 'framer-motion';
import HandshakeIcon from '@mui/icons-material/Handshake';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

// =============================
// DATA CONFIGURATION
// =============================
const cards = [
  {
    id: 1,
    icon: HandshakeIcon,
    badge: 'Financial Flexibility',
    title: 'Win-Win Partnership',
    description:
      'Choose between revenue sharing or a fixed rental model — flexible, zero financial risk, and designed to maximise your returns.',
    bg: '#1a2332',
    iconBg: '#FFD700',
    iconColor: '#1a2332',
    accentColor: '#FFD700',
    textColor: '#fff',
    descColor: 'rgba(255,255,255,0.72)',
    highlight: 'Revenue sharing or fixed rental',
  },
  {
    id: 2,
    icon: AutoAwesomeIcon,
    badge: 'End-to-End Service',
    title: 'Stress-Free Setup',
    description:
      'We handle everything: delivery, professional installation, and full on-site operation. You enjoy the event — we run the show.',
    bg: '#E53935',
    iconBg: '#FFD700',
    iconColor: '#1a2332',
    accentColor: '#FFD700',
    textColor: '#fff',
    descColor: 'rgba(255,255,255,0.8)',
    highlight: 'Delivery, setup & full operation',
  },
  {
    id: 3,
    icon: VerifiedUserIcon,
    badge: 'Quality & Support',
    title: 'Pro-Grade Reliability',
    description:
      'Modern, safety-certified machines with 24/7 on-site technical support. Professional standards at every single event.',
    bg: '#fff',
    iconBg: '#1a2332',
    iconColor: '#FFD700',
    accentColor: '#E53935',
    textColor: '#1a2332',
    descColor: '#4b5563',
    highlight: '24/7 on-site technical support',
    border: true,
  },
];

// =============================
// MAIN COMPONENT
// =============================
export function BentoCards() {
  return (
    <section className="py-10 sm:py-16" style={{ backgroundColor: '#f8f9fb' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* =============================
            1. SECTION HEADER
            ============================= */}
        <motion.div
          className="text-center mb-6 sm:mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
        >
          <div
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full mb-2"
            style={{ backgroundColor: 'rgba(229,57,53,0.08)', border: '1px solid rgba(229,57,53,0.2)' }}
          >
            <span
              className="text-xs sm:text-sm"
              style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 700, color: '#E53935' }}
            >
              Why Choose Us?
            </span>
          </div>
          <h2
            className="text-xl sm:text-2xl lg:text-3xl"
            style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800, color: '#1a2332' }}
          >
            The Smarter Way to Entertain
          </h2>
          <p
            className="mt-2 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto"
            style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 400, color: '#6b7280', lineHeight: '1.6' }}
          >
            Three powerful advantages that make Next Level Game the go-to entertainment partner across Lebanon.
          </p>
        </motion.div>

        {/* =============================
            2. BENTO GRID
            ============================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-5">
          {cards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.id}
                className="relative rounded-xl sm:rounded-2xl p-4 sm:p-6 flex flex-col gap-3"
                style={{
                  backgroundColor: card.bg,
                  border: card.border ? '1.5px solid #e5e7eb' : '1.5px solid transparent',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5, ease: 'easeOut' }}
                whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(0,0,0,0.12)' }}
              >
                {/* Top Row: Meta & Brand */}
                <div className="flex items-center justify-between gap-2">
                  <div
                    className="inline-flex px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.12)',
                      border: `1px solid ${card.accentColor}40`,
                    }}
                  >
                    <span
                      className="text-[10px] sm:text-xs"
                      style={{
                        fontFamily: 'Open Sans, sans-serif',
                        fontWeight: 700,
                        color: card.accentColor,
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase',
                      }}
                    >
                      {card.badge}
                    </span>
                  </div>
                  <div
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: card.iconBg }}
                  >
                    <Icon style={{ fontSize: 20, color: card.iconColor }} />
                  </div>
                </div>

                {/* Core Copy */}
                <div>
                  <h3
                    className="text-base sm:text-lg mb-1"
                    style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, color: card.textColor }}
                  >
                    {card.title}
                  </h3>
                  <p
                    className="text-xs sm:text-sm leading-relaxed"
                    style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 400, color: card.descColor }}
                  >
                    {card.description}
                  </p>
                </div>

                {/* Interaction Indicator */}
                <div
                  className="mt-auto inline-flex items-center gap-1.5 px-2 py-1 rounded-full self-start"
                  style={{ backgroundColor: `${card.accentColor}18`, border: `1px solid ${card.accentColor}30` }}
                >
                  <ArrowForwardIcon style={{ fontSize: 10, color: card.accentColor }} />
                  <span
                    className="text-xs sm:text-sm"
                    style={{ fontFamily: 'Open Sans, sans-serif', fontWeight: 600, color: card.accentColor }}
                  >
                    {card.highlight}
                  </span>
                </div>

                {/* Visual Flair (Blob) */}
                <div
                  className="absolute top-3 right-3 w-16 h-16 rounded-full opacity-[0.07] pointer-events-none"
                  style={{ backgroundColor: card.accentColor }}
                />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
