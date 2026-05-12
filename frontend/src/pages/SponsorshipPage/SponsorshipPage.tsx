/**
 * ============================================================
 * SPONSORSHIP PAGE
 * ============================================================
 * Purpose: Showcases brand partnership opportunities with
 * Next Level Game. Features the Human Claw Machine section
 * with a dynamic photo gallery managed via the Admin Panel.
 *
 * Key Sections:
 *  1. Hero Banner
 *  2. Stats Strip
 *  3. Human Claw Machine (with Admin-managed gallery)
 *  4. Sponsorship Opportunities Grid
 *  5. Lead CTA
 * ============================================================
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, Star, Zap, Users, TrendingUp, Eye, Heart,
  ChevronLeft, ChevronRight, X
} from 'lucide-react';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../../config';

// =============================
// TYPE DEFINITIONS
// =============================

/** A single gallery image record from the API */
interface GalleryImage {
  id: number;
  image_url: string;
  description: string;
  sort_order: number;
  is_main: number;
}

// =============================
// STATIC DATA CONFIGURATION
// =============================

/** Sponsorship opportunity cards */
const OPPORTUNITIES = [
  {
    icon: Eye,
    title: 'In-Game Logo Placement',
    description:
      'Your brand logo displayed prominently inside the game cabinet — seen by every player and spectator throughout the event.',
    color: '#E53935',
  },
  {
    icon: Users,
    title: 'Crowd Activation',
    description:
      'Turn your brand into a live experience. Players interact with your product concept while playing — unforgettable brand recall.',
    color: '#1a2332',
  },
  {
    icon: TrendingUp,
    title: 'Social Media Amplification',
    description:
      "Every viral moment from the event features your brand. We capture, post, and tag — your logo travels far beyond the venue.",
    color: '#FFD700',
  },
  {
    icon: Zap,
    title: 'Product Integration',
    description:
      'Distribute your product samples alongside game prizes. Players win branded rewards — direct product trial at scale.',
    color: '#E53935',
  },
];

/** Key performance statistics */
const STATS = [
  { value: '500+', label: 'Events Powered' },
  { value: '200K+', label: 'Attendees Reached' },
  { value: '15+', label: 'Brand Partners' },
  { value: '98%', label: 'Brand Satisfaction' },
];

// =============================
// SUB-COMPONENTS
// =============================

/**
 * LIGHTBOX MODAL
 * --------------
 * Full-screen image viewer with navigation arrows and description.
 * Supports keyboard navigation (Escape, ArrowLeft, ArrowRight).
 */
function Lightbox({
  images,
  currentIndex,
  onClose,
  onPrev,
  onNext,
}: {
  images: GalleryImage[];
  currentIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const img = images[currentIndex];
  if (!img) return null;

  // Keyboard navigation support
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose, onPrev, onNext]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[200] flex items-center justify-center p-4"
        style={{ backgroundColor: 'rgba(0,0,0,0.92)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        {/* Close button */}
        <button
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
          onClick={onClose}
          aria-label="Close lightbox"
        >
          <X className="w-6 h-6 text-white" />
        </button>

        {/* Previous arrow */}
        {images.length > 1 && (
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
            onClick={(e) => { e.stopPropagation(); onPrev(); }}
            aria-label="Previous image"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
        )}

        {/* Main image */}
        <motion.div
          key={img.id}
          className="max-w-4xl w-full mx-12"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.25 }}
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={img.image_url}
            alt={img.description || 'Gallery image'}
            className="w-full max-h-[75vh] object-contain rounded-xl"
          />
          {img.description && (
            <p
              className="text-white/80 text-center mt-4 text-sm leading-relaxed max-w-2xl mx-auto"
              style={{ fontFamily: 'Open Sans, sans-serif' }}
            >
              {img.description}
            </p>
          )}
          <p className="text-white/40 text-center text-xs mt-2">
            {currentIndex + 1} / {images.length}
          </p>
        </motion.div>

        {/* Next arrow */}
        {images.length > 1 && (
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
            onClick={(e) => { e.stopPropagation(); onNext(); }}
            aria-label="Next image"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

// =============================
// MAIN COMPONENT
// =============================

export function Sponsorship() {
  // ── CONTACT LINK ──
  const whatsapp =
    'https://wa.me/96103919876?text=Hi%2C%20I%27m%20interested%20in%20sponsorship%20opportunities%20with%20Next%20Level%20Game.';

  // ── GALLERY STATE ──
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(true);

  // ── LIGHTBOX STATE ──
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  /**
   * Fetch gallery images from the API.
   * Backend returns them sorted: main image first, then by sort_order ASC.
   */
  const fetchGallery = useCallback(() => {
    setGalleryLoading(true);
    fetch(`${API_BASE_URL}/sponsorship/gallery`)
      .then((r) => r.json())
      .then((data: GalleryImage[]) => {
        setGallery(Array.isArray(data) ? data : []);
        setGalleryLoading(false);
      })
      .catch(() => {
        setGallery([]);
        setGalleryLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchGallery();
  }, [fetchGallery]);

  // Derived values: main hero image and additional thumbnails
  const mainImage = gallery.find((img) => img.is_main === 1) || gallery[0] || null;
  const thumbnails = gallery.filter((img) => img !== mainImage);

  // ── LIGHTBOX HELPERS ──
  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };
  const closeLightbox = () => setLightboxOpen(false);
  const prevImage = () =>
    setLightboxIndex((i) => (i - 1 + gallery.length) % gallery.length);
  const nextImage = () =>
    setLightboxIndex((i) => (i + 1) % gallery.length);

  return (
    <div className="bg-white">

      {/* ══════════════════════════════════════════
          1. HERO SECTION
          ══════════════════════════════════════════ */}
      <section className="relative py-20 overflow-hidden" style={{ backgroundColor: '#1a2332' }}>
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 50%, #E53935 0%, transparent 50%), radial-gradient(circle at 80% 50%, #FFD700 0%, transparent 50%)',
          }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
              style={{
                backgroundColor: 'rgba(255,215,0,0.15)',
                border: '1px solid rgba(255,215,0,0.4)',
              }}
            >
              <Star className="w-4 h-4" style={{ color: '#FFD700' }} />
              <span
                className="text-sm font-bold uppercase tracking-widest"
                style={{ color: '#FFD700', fontFamily: 'Open Sans, sans-serif' }}
              >
                Brand Partnership Opportunities
              </span>
            </div>
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl mb-6 text-white leading-tight"
              style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800 }}
            >
              Advertise Where <br />
              <span style={{ color: '#FFD700' }}>Eyes Are Glued</span>
            </h1>
            <p
              className="text-xl text-white/70 max-w-2xl mx-auto mb-8"
              style={{ fontFamily: 'Open Sans, sans-serif' }}
            >
              Place your brand inside the most engaging entertainment experience at any festival,
              university, or event in Lebanon.
            </p>
            <a href={whatsapp} target="_blank" rel="noopener noreferrer">
              <button
                className="px-10 py-4 rounded-xl text-lg font-bold transition-all hover:scale-105 hover:shadow-2xl flex items-center gap-3 mx-auto"
                style={{
                  backgroundColor: '#FFD700',
                  color: '#1a2332',
                  fontFamily: 'Montserrat, sans-serif',
                  boxShadow: '0 10px 40px rgba(255,215,0,0.3)',
                }}
              >
                Contact Us for Sponsorship
                <ArrowRight className="w-5 h-5" />
              </button>
            </a>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          2. STATS STRIP
          ══════════════════════════════════════════ */}
      <section className="py-10 bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {STATS.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <p
                  className="text-3xl sm:text-4xl mb-1"
                  style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800, color: '#E53935' }}
                >
                  {s.value}
                </p>
                <p
                  className="text-sm text-gray-500 font-semibold uppercase tracking-widest"
                  style={{ fontFamily: 'Open Sans, sans-serif' }}
                >
                  {s.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          3. HUMAN CLAW MACHINE SECTION
          ══════════════════════════════════════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* ── Top: Text + Main Image ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-16">

            {/* Left: Description */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4"
                style={{
                  backgroundColor: 'rgba(229,57,53,0.08)',
                  border: '1px solid rgba(229,57,53,0.25)',
                }}
              >
                <span
                  className="text-xs font-bold uppercase tracking-widest"
                  style={{ color: '#E53935', fontFamily: 'Open Sans, sans-serif' }}
                >
                  Flagship Opportunity
                </span>
              </div>
              <h2
                className="text-3xl sm:text-4xl lg:text-5xl mb-6"
                style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800, color: '#1a2332' }}
              >
                The Human <br />
                <span style={{ color: '#E53935' }}>Claw Machine</span>
              </h2>
              <p
                className="text-lg text-gray-600 mb-6 leading-relaxed"
                style={{ fontFamily: 'Open Sans, sans-serif' }}
              >
                Our most viral attraction. A life-sized claw machine where a real person is strapped
                inside — they become the claw, grabbing prizes for the crowd.{' '}
                <strong>Every second of this experience is photographed, filmed, and shared.</strong>
              </p>
              <div className="space-y-4 mb-8">
                {[
                  'Your logo printed across the entire machine exterior',
                  'Branded merchandise as prizes inside the machine',
                  'Host-announced brand mentions every round',
                  'Dedicated social media content with your hashtag',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: '#FFD700' }}
                    >
                      <span className="text-xs font-black" style={{ color: '#1a2332' }}>✓</span>
                    </div>
                    <p className="text-gray-600" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                      {item}
                    </p>
                  </div>
                ))}
              </div>
              <a href={whatsapp} target="_blank" rel="noopener noreferrer">
                <button
                  className="px-8 py-4 rounded-xl font-bold text-white transition-all hover:scale-105 hover:shadow-xl flex items-center gap-2"
                  style={{
                    backgroundColor: '#E53935',
                    fontFamily: 'Montserrat, sans-serif',
                    boxShadow: '0 8px 24px rgba(229,57,53,0.3)',
                  }}
                >
                  Contact us for sponsorship opportunities
                  <ArrowRight className="w-5 h-5" />
                </button>
              </a>
            </motion.div>

            {/* Right: Main hero image from gallery */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              {galleryLoading ? (
                /* Loading skeleton */
                <div
                  className="w-full rounded-2xl animate-pulse"
                  style={{ aspectRatio: '4/3', backgroundColor: '#e5e7eb' }}
                />
              ) : mainImage ? (
                /* Main gallery image — clickable to open lightbox */
                <div
                  className="relative rounded-2xl overflow-hidden shadow-2xl cursor-pointer group"
                  style={{ aspectRatio: '4/3' }}
                  onClick={() => openLightbox(gallery.indexOf(mainImage))}
                  role="button"
                  aria-label="View full image"
                >
                  <ImageWithFallback
                    src={mainImage.image_url}
                    alt={mainImage.description || 'Human Claw Machine'}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 text-[#1a2332] text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full">
                      View Full Image
                    </span>
                  </div>
                  {/* Description overlay at bottom */}
                  {mainImage.description && (
                    <div
                      className="absolute bottom-0 left-0 right-0 p-4"
                      style={{
                        background: 'linear-gradient(to top, rgba(26,35,50,0.85), transparent)',
                      }}
                    >
                      <p
                        className="text-white text-sm leading-snug"
                        style={{ fontFamily: 'Open Sans, sans-serif' }}
                      >
                        {mainImage.description}
                      </p>
                    </div>
                  )}
                </div>
              ) : null}
            </motion.div>
          </div>

          {/* ── Bottom: Thumbnail gallery ── */}
          {!galleryLoading && thumbnails.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h3
                className="text-lg font-bold mb-5 text-center"
                style={{ fontFamily: 'Montserrat, sans-serif', color: '#1a2332' }}
              >
                More from the Human Claw Machine
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {thumbnails.map((img) => {
                  const globalIndex = gallery.indexOf(img);
                  return (
                    <motion.div
                      key={img.id}
                      className="relative rounded-xl overflow-hidden cursor-pointer group shadow-md"
                      style={{ aspectRatio: '1/1' }}
                      onClick={() => openLightbox(globalIndex)}
                      whileHover={{ scale: 1.03 }}
                      transition={{ duration: 0.2 }}
                      role="button"
                      aria-label={img.description || 'Gallery image'}
                    >
                      <ImageWithFallback
                        src={img.image_url}
                        alt={img.description || 'Gallery image'}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      {/* Hover overlay with description */}
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-2"
                        style={{
                          background: 'linear-gradient(to top, rgba(26,35,50,0.9), transparent)',
                        }}
                      >
                        {img.description && (
                          <p
                            className="text-white text-[10px] leading-tight line-clamp-3"
                            style={{ fontFamily: 'Open Sans, sans-serif' }}
                          >
                            {img.description}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
              <p
                className="text-gray-400 text-center text-xs mt-4"
                style={{ fontFamily: 'Open Sans, sans-serif' }}
              >
                Click any image to view full size · Gallery managed via Admin Panel
              </p>
            </motion.div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          4. OPPORTUNITIES GRID
          ══════════════════════════════════════════ */}
      <section className="py-20" style={{ backgroundColor: '#f8f9fa' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2
              className="text-3xl sm:text-4xl mb-4"
              style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800, color: '#1a2332' }}
            >
              What Your Sponsorship Gets You
            </h2>
            <p
              className="text-lg text-gray-500 max-w-2xl mx-auto"
              style={{ fontFamily: 'Open Sans, sans-serif' }}
            >
              We make sure every sponsorship dollar translates into real audience engagement — not
              just a logo on a banner.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {OPPORTUNITIES.map((op, i) => {
              const Icon = op.icon;
              return (
                <motion.div
                  key={op.title}
                  className="p-8 rounded-2xl bg-white border-2 hover:shadow-2xl transition-all duration-300"
                  style={{ borderColor: op.color }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  whileHover={{ y: -6 }}
                >
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center mb-5"
                    style={{ backgroundColor: op.color }}
                  >
                    <Icon
                      className="w-7 h-7"
                      style={{ color: op.color === '#FFD700' ? '#1a2332' : 'white' }}
                    />
                  </div>
                  <h3
                    className="text-xl mb-3"
                    style={{
                      fontFamily: 'Montserrat, sans-serif',
                      fontWeight: 700,
                      color: '#1a2332',
                    }}
                  >
                    {op.title}
                  </h3>
                  <p
                    className="text-gray-500 leading-relaxed"
                    style={{ fontFamily: 'Open Sans, sans-serif' }}
                  >
                    {op.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          5. LEAD CTA
          ══════════════════════════════════════════ */}
      <section className="py-20" style={{ backgroundColor: '#1a2332' }}>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Heart className="w-12 h-12 mx-auto mb-6" style={{ color: '#FFD700' }} />
            <h2
              className="text-3xl sm:text-4xl mb-4 text-white"
              style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800 }}
            >
              Ready to Put Your Brand in the Spotlight?
            </h2>
            <p
              className="text-xl text-white/70 mb-8 max-w-xl mx-auto"
              style={{ fontFamily: 'Open Sans, sans-serif' }}
            >
              We'll tailor a sponsorship package to your goals, audience, and budget. No commitment
              — just a conversation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href={whatsapp} target="_blank" rel="noopener noreferrer">
                <button
                  className="px-10 py-4 rounded-xl text-lg font-bold transition-all hover:scale-105 hover:shadow-2xl flex items-center gap-3"
                  style={{
                    backgroundColor: '#FFD700',
                    color: '#1a2332',
                    fontFamily: 'Montserrat, sans-serif',
                  }}
                >
                  Contact us for sponsorship opportunities
                  <ArrowRight className="w-5 h-5" />
                </button>
              </a>
              <Link to="/services">
                <button
                  className="px-10 py-4 rounded-xl text-lg font-bold border-2 border-white/30 text-white transition-all hover:border-white hover:scale-105 flex items-center gap-3"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  View Our Services
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          LIGHTBOX OVERLAY
          ══════════════════════════════════════════ */}
      {lightboxOpen && gallery.length > 0 && (
        <Lightbox
          images={gallery}
          currentIndex={lightboxIndex}
          onClose={closeLightbox}
          onPrev={prevImage}
          onNext={nextImage}
        />
      )}
    </div>
  );
}
