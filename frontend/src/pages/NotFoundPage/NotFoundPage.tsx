/**
 * ============================================================
 * 404 — PAGE NOT FOUND
 * ============================================================
 * Vercel serves the app for every URL, so a mistyped address
 * answers HTTP 200 with an empty page, which Google treats as a
 * "soft 404" and may index. This page gives visitors a way back
 * and carries noindex so it never lands in search results.
 * ============================================================
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Seo } from '../../components/Seo';

export function NotFound() {
  return (
    <div className="bg-white py-24">
      <Seo
        title="Page Not Found | Next Level Game"
        description="This page does not exist. Browse our arcade and carnival games for rent across Lebanon, or contact us on WhatsApp at 03 919 876."
        canonical="/404"
        noindex
      />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-7xl font-black mb-4" style={{ fontFamily: 'Montserrat, sans-serif', color: '#E53935' }}>404</p>
        <h1 className="text-3xl sm:text-4xl mb-4" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800, color: '#1a2332' }}>
          This page does not exist
        </h1>
        <p className="text-lg text-gray-500 mb-10" style={{ fontFamily: 'Open Sans, sans-serif' }}>
          The link may be old or mistyped. The games and services are still here.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-white"
            style={{ fontFamily: 'Montserrat, sans-serif', backgroundColor: '#1a2332' }}>
            Home <ArrowRight className="w-5 h-5" />
          </Link>
          <Link to="/catalog"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold"
            style={{ fontFamily: 'Montserrat, sans-serif', backgroundColor: '#FFD700', color: '#1a2332' }}>
            See the games <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
