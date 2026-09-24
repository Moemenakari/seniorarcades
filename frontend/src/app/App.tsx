/**
 * ============================================================
 * FRONTEND APP - ROOT COMPONENT
 * ============================================================
 * Purpose: Main router configuration for the public-facing
 * Next Level Game arcade website.
 * ============================================================
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ScrollToTop } from '../components/ScrollToTop';
import { Layout } from '../components/Layout';
import { Home } from '../pages/HomePage/HomePage';
import { Services } from '../pages/ServicesPage/ServicesPage';
import { Catalog } from '../pages/CatalogPage/CatalogPage';
import { Sponsorship } from '../pages/SponsorshipPage/SponsorshipPage';
import { BuildYourEvent } from '../pages/BuildEventPage/BuildEventPage';
import { ProductDetails } from '../pages/ProductDetailsPage/ProductDetailsPage';
import { AboutUs } from '../pages/AboutPage/AboutPage';
import { ArcadeRental } from '../pages/landing/ArcadeRentalPage';
import { BuyMachines } from '../pages/landing/BuyMachinesPage';
import { FestivalSupply } from '../pages/landing/FestivalSupplyPage';
import { RevenueShare } from '../pages/landing/RevenueSharePage';
import { UniversityEvents } from '../pages/landing/UniversityEventsPage';
import { SchoolEvents } from '../pages/landing/SchoolEventsPage';
import { StoreOpenings } from '../pages/landing/StoreOpeningsPage';
import { BirthdayParties } from '../pages/landing/BirthdayPartiesPage';
import { NgoEvents } from '../pages/landing/NgoEventsPage';
import { TripoliArea } from '../pages/landing/TripoliAreaPage';
import { KouraArea } from '../pages/landing/KouraAreaPage';
import { BeirutArea } from '../pages/landing/BeirutAreaPage';
import { NotFound } from '../pages/NotFoundPage/NotFoundPage';

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/services" element={<Services />} />
          {/* Service detail pages — one search intent each */}
          <Route path="/services/arcade-rental" element={<ArcadeRental />} />
          <Route path="/services/buy-arcade-machines" element={<BuyMachines />} />
          <Route path="/services/festival-supply" element={<FestivalSupply />} />
          <Route path="/services/revenue-share" element={<RevenueShare />} />
          {/* Event-type pages — one audience each */}
          <Route path="/events/universities" element={<UniversityEvents />} />
          <Route path="/events/schools" element={<SchoolEvents />} />
          <Route path="/events/store-openings" element={<StoreOpenings />} />
          <Route path="/events/birthdays" element={<BirthdayParties />} />
          <Route path="/events/ngo" element={<NgoEvents />} />
          {/* Area pages — only where there is recorded work */}
          <Route path="/areas/tripoli" element={<TripoliArea />} />
          <Route path="/areas/koura" element={<KouraArea />} />
          <Route path="/areas/beirut" element={<BeirutArea />} />
          <Route path="/sponsorship" element={<Sponsorship />} />
          <Route path="/build-your-event" element={<BuildYourEvent />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Router>
  );
}