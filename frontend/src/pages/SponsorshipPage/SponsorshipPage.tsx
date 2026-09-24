/**
 * ============================================================
 * HUMAN CLAW MACHINE PAGE  (/sponsorship)
 * ============================================================
 * The Human Claw Machine is the strongest commercial product,
 * so it owns this page. Brand sponsorship is one section inside
 * it rather than the whole story.
 *
 * Photos sit directly under the H1 because this product sells
 * on being seen.
 * ============================================================
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, Star, Zap, Users, TrendingUp, Eye, Gift, PartyPopper,
  ChevronLeft, ChevronRight, X
} from 'lucide-react';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { Seo } from '../../components/Seo';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../../config';

interface GalleryImage {
  id: number;
  image_url: string;
  description: string;
  sort_order: number;
  is_main: number;
}

const WHATSAPP =
  'https://wa.me/96103919876?text=Hi%2C%20I%27d%20like%20to%20book%20the%20Human%20Claw%20Machine.';

/**
 * Shown until real photos are uploaded through the admin panel.
 * Swapping one out is an upload, not a code change.
 */
const PLACEHOLDERS: { url: string; alt: string }[] = [
  { url: '/images/human-claw-machine-1.svg', alt: 'Human claw machine rental in Lebanon set up for a brand activation, machine wrapped in sponsor branding' },
  { url: '/images/human-claw-machine-2.svg', alt: 'Human claw machine hired for a birthday party in Lebanon, child harnessed and reaching for a prize' },
  { url: '/images/human-claw-machine-3.svg', alt: 'Crowd watching the human claw machine at a festival in Lebanon' },
  { url: '/images/human-claw-machine-4.svg', alt: 'Human claw machine branded with a sponsor logo and flags at a store opening in Lebanon' },
  { url: '/images/human-claw-machine-5.svg', alt: 'Player harnessed inside the human claw machine grabbing prizes at an event in Lebanon' },
];

/** Opportunities a sponsor gets. */
const OPPORTUNITIES = [
  {
    icon: Eye,
    title: 'Your Logo on the Machine',
    description:
      'The machine is wrapped in your branding and flags. Every player, every spectator and every phone camera in the crowd sees it.',
    color: '#E53935',
  },
  {
    icon: Gift,
    title: 'Your Products as the Prizes',
    description:
      'Fill the machine with your own stock and giveaways. People do not just see the product — they climb in and grab it.',
    color: '#1a2332',
  },
  {
    icon: Users,
    title: 'A Queue That Does Not Move On',
    description:
      'Unlike a banner or a stand, people wait in line for a turn. Your brand holds their attention for the length of the event.',
    color: '#FFD700',
  },
  {
    icon: TrendingUp,
    title: 'Footage Worth Sharing',
    description:
      'Every round is filmed by the crowd. Your activation travels to social media without you paying for the reach.',
    color: '#E53935',
  },
];

/** Where the machine gets booked. */
const USE_CASES = [
  {
    icon: Zap,
    title: 'Brand Launches & Store Openings',
    body:
      'Brands entering the Lebanese market book the human claw machine for openings and activations — chocolate companies, fashion retailers and sportswear names among them. The machine is branded with their logo and loaded with their products, so the giveaway is the advertisement.',
  },
  {
    icon: PartyPopper,
    title: 'Birthdays & Private Parties',
    body:
      'It is the attraction people remember from the party. We deliver, install and run it anywhere in Lebanon, fill it with prizes you choose, and our staff keep the turns moving so nobody is left waiting.',
  },
  {
    icon: Users,
    title: 'Festivals & Large Events',
    body:
      'At a festival the human claw machine draws its own crowd and holds it. We handle power planning, safety, setup and on-site staff, and it can arrive alongside the rest of our arcade and carnival games as one complete event package.',
  },
];

// ── LIGHTBOX ──
function Lightbox({
  images, currentIndex, onClose, onPrev, onNext,
}: {
  images: { url: string; alt: string }[];
  currentIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const img = images[currentIndex];

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose, onPrev, onNext]);

  if (!img) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[200] flex items-center justify-center p-4"
        style={{ backgroundColor: 'rgba(0,0,0,0.92)' }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <button className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
          onClick={onClose} aria-label="Close image viewer">
          <X className="w-6 h-6 text-white" />
        </button>

        {images.length > 1 && (
          <button className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
            onClick={(e) => { e.stopPropagation(); onPrev(); }} aria-label="Previous photo">
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
        )}

        <motion.div
          key={img.url}
          className="max-w-4xl w-full mx-12"
          initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.25 }}
          onClick={(e) => e.stopPropagation()}
        >
          <img src={img.url} alt={img.alt} className="w-full max-h-[75vh] object-contain rounded-xl" />
          <p className="text-white/80 text-center mt-4 text-sm leading-relaxed max-w-2xl mx-auto"
            style={{ fontFamily: 'Open Sans, sans-serif' }}>
            {img.alt}
          </p>
          <p className="text-white/40 text-center text-xs mt-2">{currentIndex + 1} / {images.length}</p>
        </motion.div>

        {images.length > 1 && (
          <button className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
            onClick={(e) => { e.stopPropagation(); onNext(); }} aria-label="Next photo">
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

// ── PAGE ──
export function Sponsorship() {
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

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

  useEffect(() => { fetchGallery(); }, [fetchGallery]);

  // Real photos win; placeholders only fill the space until they exist.
  const photos = gallery.length
    ? gallery.map((img) => ({
        url: img.image_url,
        alt: img.description || 'Human claw machine rental in Lebanon at a live event',
      }))
    : PLACEHOLDERS;

  const openLightbox = (index: number) => { setLightboxIndex(index); setLightboxOpen(true); };
  const prevImage = () => setLightboxIndex((i) => (i - 1 + photos.length) % photos.length);
  const nextImage = () => setLightboxIndex((i) => (i + 1) % photos.length);

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'Human Claw Machine Rental',
      serviceType: 'Human claw machine rental for events',
      description:
        'Rent the human claw machine in Lebanon for brand activations, store openings, birthdays and festivals. A person is harnessed in and becomes the claw, grabbing prizes while the crowd watches.',
      provider: { '@id': 'https://nlgarcadesforevents.vercel.app/#organization' },
      areaServed: { '@type': 'Country', name: 'Lebanon' },
      availableChannel: {
        '@type': 'ServiceChannel',
        serviceUrl: 'https://nlgarcadesforevents.vercel.app/sponsorship',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: 'Human Claw Machine',
      description:
        'A life-sized claw machine for events in Lebanon. A harnessed player becomes the claw and grabs prizes. Available branded with a sponsor logo and loaded with the sponsor\'s own products.',
      category: 'Event attraction rental',
      brand: { '@type': 'Brand', name: 'Next Level Game' },
      offers: {
        '@type': 'Offer',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
        areaServed: 'LB',
        url: 'https://nlgarcadesforevents.vercel.app/sponsorship',
      },
    },
  ];

  return (
    <div className="bg-white">
      <Seo
        title="Human Claw Machine Rental in Lebanon | Next Level Game"
        description="Rent the Human Claw Machine in Lebanon for brand activations, store openings, birthdays and festivals. Branded with your logo, filled with your prizes."
        canonical="/sponsorship"
        image={photos[0]?.url?.startsWith('http') ? photos[0].url : undefined}
        jsonLd={jsonLd}
      />

      {/* ── 1. HERO ── */}
      <section className="relative pt-16 pb-10 overflow-hidden" style={{ backgroundColor: '#1a2332' }}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #E53935 0%, transparent 50%), radial-gradient(circle at 80% 50%, #FFD700 0%, transparent 50%)' }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div className="text-center"
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
              style={{ backgroundColor: 'rgba(255,215,0,0.15)', border: '1px solid rgba(255,215,0,0.4)' }}>
              <Star className="w-4 h-4" style={{ color: '#FFD700' }} />
              <span className="text-sm font-bold uppercase tracking-widest"
                style={{ color: '#FFD700', fontFamily: 'Open Sans, sans-serif' }}>
                Our most booked attraction
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl mb-6 text-white leading-tight"
              style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800 }}>
              Human Claw Machine Rental <br />
              <span style={{ color: '#FFD700' }}>in Lebanon</span>
            </h1>

            <p className="text-lg sm:text-xl text-white/80 max-w-3xl mx-auto"
              style={{ fontFamily: 'Open Sans, sans-serif' }}>
              A life-sized claw machine where a real person is harnessed in and becomes the claw,
              lowering down to grab prizes while the crowd watches. We deliver, install and run it
              anywhere in Lebanon — for brand activations, birthdays and festivals.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── 2. PHOTOS — high on the page, this product sells on being seen ── */}
      <section className="py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {galleryLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-xl animate-pulse bg-gray-200" style={{ aspectRatio: '4/3' }} />
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {photos.map((photo, index) => (
                  <motion.button
                    key={photo.url}
                    type="button"
                    className={`relative rounded-xl overflow-hidden shadow-md group ${index === 0 ? 'col-span-2 row-span-2 md:col-span-1 md:row-span-1' : ''}`}
                    style={{ aspectRatio: '4/3' }}
                    onClick={() => openLightbox(index)}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.06, duration: 0.4 }}
                    whileHover={{ scale: 1.03 }}
                    aria-label={`View photo: ${photo.alt}`}
                  >
                    <ImageWithFallback
                      displayWidth={400}
                      src={photo.url}
                      alt={photo.alt}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </motion.button>
                ))}
              </div>
              {gallery.length === 0 && (
                <p className="text-gray-400 text-center text-xs mt-4" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                  Placeholder images — upload the real photos from the admin panel to replace them.
                </p>
              )}
            </>
          )}

          <div className="text-center mt-8">
            <a href={WHATSAPP} target="_blank" rel="noopener noreferrer">
              <button className="px-10 py-4 rounded-xl text-lg font-bold transition-all hover:scale-105 hover:shadow-2xl inline-flex items-center gap-3"
                style={{ backgroundColor: '#FFD700', color: '#1a2332', fontFamily: 'Montserrat, sans-serif', boxShadow: '0 10px 40px rgba(255,215,0,0.3)' }}>
                Book the Human Claw Machine
                <ArrowRight className="w-5 h-5" />
              </button>
            </a>
          </div>
        </div>
      </section>

      {/* ── 3. WHERE IT GETS BOOKED ── */}
      <section className="py-20" style={{ backgroundColor: '#f8f9fa' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl mb-4"
              style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800, color: '#1a2332' }}>
              Where the Human Claw Machine Gets Booked
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto" style={{ fontFamily: 'Open Sans, sans-serif' }}>
              One machine, three very different jobs — and it travels to every part of Lebanon,
              not only the main cities.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {USE_CASES.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div key={item.title}
                  className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100"
                  initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}>
                  <div className="w-14 h-14 rounded-full flex items-center justify-center mb-5" style={{ backgroundColor: '#E53935' }}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl mb-3" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, color: '#1a2332' }}>
                    {item.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                    {item.body}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 4. SPONSORSHIP — one section, not the whole page ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4"
              style={{ backgroundColor: 'rgba(229,57,53,0.08)', border: '1px solid rgba(229,57,53,0.25)' }}>
              <span className="text-xs font-bold uppercase tracking-widest"
                style={{ color: '#E53935', fontFamily: 'Open Sans, sans-serif' }}>
                For brands
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl mb-4"
              style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800, color: '#1a2332' }}>
              Sponsor the Machine, Not a Banner
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto" style={{ fontFamily: 'Open Sans, sans-serif' }}>
              A banner gets glanced at. The human claw machine gets queued for, played and filmed.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {OPPORTUNITIES.map((op, i) => {
              const Icon = op.icon;
              return (
                <motion.div key={op.title}
                  className="p-8 rounded-2xl bg-white border-2 hover:shadow-2xl transition-all duration-300"
                  style={{ borderColor: op.color }}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}
                  whileHover={{ y: -6 }}>
                  <div className="w-14 h-14 rounded-full flex items-center justify-center mb-5" style={{ backgroundColor: op.color }}>
                    <Icon className="w-7 h-7" style={{ color: op.color === '#FFD700' ? '#1a2332' : 'white' }} />
                  </div>
                  <h3 className="text-xl mb-3" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, color: '#1a2332' }}>
                    {op.title}
                  </h3>
                  <p className="text-gray-500 leading-relaxed" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                    {op.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 5. CTA ── */}
      <section className="py-20" style={{ backgroundColor: '#1a2332' }}>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <h2 className="text-3xl sm:text-4xl mb-4 text-white"
              style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800 }}>
              Tell Us the Date and the Venue
            </h2>
            <p className="text-xl text-white/70 mb-8 max-w-xl mx-auto" style={{ fontFamily: 'Open Sans, sans-serif' }}>
              Send us your event details on WhatsApp and we will come back with what it takes to
              bring the human claw machine to you — anywhere in Lebanon.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href={WHATSAPP} target="_blank" rel="noopener noreferrer">
                <button className="px-10 py-4 rounded-xl text-lg font-bold transition-all hover:scale-105 hover:shadow-2xl flex items-center gap-3"
                  style={{ backgroundColor: '#FFD700', color: '#1a2332', fontFamily: 'Montserrat, sans-serif' }}>
                  Book on WhatsApp
                  <ArrowRight className="w-5 h-5" />
                </button>
              </a>
              <Link to="/catalog">
                <button className="px-10 py-4 rounded-xl text-lg font-bold border-2 border-white/30 text-white transition-all hover:border-white hover:scale-105"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  See the Rest of Our Games
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {lightboxOpen && photos.length > 0 && (
        <Lightbox
          images={photos}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
          onPrev={prevImage}
          onNext={nextImage}
        />
      )}
    </div>
  );
}
