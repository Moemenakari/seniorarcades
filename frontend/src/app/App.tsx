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

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/services" element={<Services />} />
          <Route path="/sponsorship" element={<Sponsorship />} />
          <Route path="/build-your-event" element={<BuildYourEvent />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/about" element={<AboutUs />} />
        </Route>
      </Routes>
    </Router>
  );
}