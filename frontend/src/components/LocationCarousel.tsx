/**
 * ============================================================
 * LOCATION CAROUSEL COMPONENT
 * ============================================================
 * Final Graduation Project Refactor
 * Purpose: Auto-sliding showcase of locations where NLG has operated.
 * Features: Infinite loop scroll, dynamic data from API.
 * Admin can add locations; they appear here automatically.
 * ============================================================
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import PlaceIcon from '@mui/icons-material/Place';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { API_BASE_URL } from '../config';

interface Location {
  id: number;
  name: string;
  image_url: string;
}

export function LocationCarousel() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const trackRef = useRef<HTMLDivElement>(null);
  const [trackWidth, setTrackWidth] = useState(0);

  useEffect(() => {
    fetch(`${API_BASE_URL}/locations`)
      .then(res => res.json())
      .then(data => {
        setLocations(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // Measure single-set width after locations load
  useEffect(() => {
    if (locations.length > 0 && trackRef.current) {
      // trackRef contains 2 copies; half is one set
      setTrackWidth(trackRef.current.scrollWidth / 2);
    }
  }, [locations]);

  // Double for seamless loop
  const doubled = locations.length > 0 ? [...locations, ...locations] : [];

  return (
    <section className="py-8 sm:py-14 bg-[#f8f9fb] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 sm:mb-10">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-3"
            style={{ backgroundColor: 'rgba(229,57,53,0.08)', border: '1px solid rgba(229,57,53,0.2)' }}
          >
            <PlaceIcon className="w-4 h-4 text-[#E53935]" />
            <span
              className="text-xs sm:text-sm font-bold text-[#E53935]"
              style={{ fontFamily: 'Open Sans, sans-serif' }}
            >
              Our Footprint
            </span>
          </div>
          <h2
            className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#1a2332]"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            Where We Have Been Before
          </h2>
          <p
            className="mt-2 text-sm text-gray-500 max-w-md mx-auto"
            style={{ fontFamily: 'Open Sans, sans-serif' }}
          >
            Locations added by our team appear here in real time.
          </p>
        </motion.div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#E53935]" />
        </div>
      )}

      {/* Empty state */}
      {!loading && locations.length === 0 && (
        <div className="text-center py-8">
          <PlaceIcon style={{ fontSize: 48, color: '#d1d5db' }} />
          <p className="mt-3 text-sm text-gray-400 font-semibold uppercase tracking-widest" style={{ fontFamily: 'Open Sans, sans-serif' }}>
            No footprint data available yet
          </p>
        </div>
      )}

      {/* Scrolling Container — CSS keyframe approach so it adapts to real content width */}
      {!loading && locations.length > 0 && (
        <>
          {/* Inject dynamic keyframe into a style tag */}
          {trackWidth > 0 && (
            <style>{`
              @keyframes nlg-scroll {
                0%   { transform: translateX(0); }
                100% { transform: translateX(-${trackWidth}px); }
              }
              .nlg-carousel-track {
                animation: nlg-scroll ${Math.max(locations.length * 4, 20)}s linear infinite;
                will-change: transform;
              }
              .nlg-carousel-track:hover {
                animation-play-state: paused;
              }
            `}</style>
          )}

          <div className="relative flex items-center overflow-hidden" style={{ maskImage: 'linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)' }}>
            <div
              ref={trackRef}
              className={`flex gap-4 sm:gap-6 ${trackWidth > 0 ? 'nlg-carousel-track' : ''}`}
              style={{ paddingLeft: '16px' }}
            >
              {doubled.map((loc, index) => (
                <div
                  key={`${loc.id}-${index}`}
                  className="relative w-40 h-52 sm:w-56 sm:h-72 flex-shrink-0 rounded-xl sm:rounded-2xl overflow-hidden shadow-md"
                >
                  <ImageWithFallback
                    src={loc.image_url}
                    alt={loc.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-2.5 sm:p-4">
                    <div className="flex items-center gap-1.5">
                      <PlaceIcon style={{ fontSize: 14, color: '#FFD700' }} />
                      <span className="text-white font-bold text-sm sm:text-base">{loc.name}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
