/**
 * ============================================================
 * FRONTEND HOME PAGE
 * ============================================================
 * Final Graduation Project Refactor
 * Purpose: Main landing page for Next Level Game (Arcade Lebanon).
 * Features high-impact hero, catalog overview, bento features,
 * and social proof for event managers.
 * ============================================================
 */

import React from 'react';
import { Hero } from '../../components/Hero';
import { FloatingTrustBar } from '../../components/FloatingTrustBar';
import { BentoCards } from '../../components/BentoCards';
import { FeaturedCatalog } from '../../components/FeaturedCatalog';
import { ServiceSection } from '../../components/ServiceSection';
import { LocationCarousel } from '../../components/LocationCarousel';
import { PopularRatings } from '../../components/PopularRatings';

export function Home() {
  return (
    <>
      {/* =============================
          1. Sticky Trust Overlay
          ============================= */}
      <FloatingTrustBar />

      {/* =============================
          2. Hero Section (The Authority)
          ============================= */}
      <Hero />

      {/* =============================
          3. Value Propositions (Bento)
          ============================= */}
      <BentoCards />

      {/* =============================
          4. Sponsorship Banner
          ============================= */}
      <div className="bg-[#E53935] text-white py-2 px-4 text-center text-sm font-bold flex justify-center items-center gap-4">
        <span>Promote your brand with us – Become a Sponsor</span>
        <a href="/sponsorship" className="bg-[#FFD700] text-[#1a2332] px-3 py-1 rounded-md text-xs hover:bg-white transition-colors cursor-pointer">Press here</a>
      </div>

      {/* =============================
          5. Featured Games (9 admin-selected)
          ============================= */}
      <FeaturedCatalog />

      {/* =============================
          5.5. Popular Ratings
          ============================= */}
      <PopularRatings />

      {/* =============================
          6. Partnerships (Event Space)
          ============================= */}
      <ServiceSection />

      {/* =============================
          6. Footprint (Where We Have Been)
          ============================= */}
      <LocationCarousel />
    </>
  );
}
