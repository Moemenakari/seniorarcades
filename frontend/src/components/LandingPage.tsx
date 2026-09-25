/**
 * ============================================================
 * LANDING PAGE TEMPLATE
 * ============================================================
 * Shared layout for the service, event-type and city pages.
 *
 * Those pages are the same shape — a hero, a few prose sections,
 * an FAQ and a CTA — so they share one component and differ only
 * in content. The component also builds the BreadcrumbList and
 * FAQPage structured data from that same content, which keeps
 * the two in sync automatically.
 *
 * The FAQ uses <details>/<summary> on purpose: it opens without
 * JavaScript, so the pre-renderer and crawlers see the answers.
 * ============================================================
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronRight, CheckCircle2, ArrowRight, MessageCircle } from 'lucide-react';
import { Seo } from './Seo';
import { CaseStudies } from './CaseStudies';

const SITE_URL = 'https://nlgarcadesforevents.vercel.app';
const WHATSAPP_NUMBER = '96103919876';

export interface FaqItem {
  question: string;
  answer: string;
}

export interface LandingSection {
  heading: string;
  body: string;
  bullets?: string[];
}

export interface LandingLink {
  label: string;
  to: string;
}

export interface LandingPageProps {
  /** Small label above the H1, e.g. "Arcade Rental". */
  kicker: string;
  /** The single H1 of the page. */
  h1: string;
  /** One paragraph under the H1 — the sentence we want quoted. */
  lead: string;
  /** Browser and search title (keep under 60 characters). */
  title: string;
  /** Meta description (150-160 characters). */
  description: string;
  /** Path of this page, e.g. "/services/arcade-rental". */
  canonical: string;
  /** Trail after Home, in order. The last item is this page. */
  breadcrumb: LandingLink[];
  /** Body sections, each rendered as an H2 with prose. */
  sections: LandingSection[];
  /** Questions and answers — also emitted as FAQPage structured data. */
  faqs: FaqItem[];
  /** Pre-filled WhatsApp message for this page's CTA. */
  whatsappMessage: string;
  ctaHeading: string;
  ctaBody: string;
  /** Links to sibling pages, for internal linking. */
  related?: LandingLink[];
  /** Extra structured data (Service, Product, ...) for this page. */
  jsonLd?: object[];
  /** Area names; shows recorded case studies whose place matches one. */
  caseStudyPlaces?: string[];
}

export function LandingPage({
  kicker, h1, lead, title, description, canonical,
  breadcrumb, sections, faqs, whatsappMessage,
  ctaHeading, ctaBody, related = [], jsonLd = [], caseStudyPlaces,
}: LandingPageProps) {
  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`;

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
      ...breadcrumb.map((crumb, index) => ({
        '@type': 'ListItem',
        position: index + 2,
        name: crumb.label,
        item: `${SITE_URL}${crumb.to}`,
      })),
    ],
  };

  const faqSchema = faqs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  } : null;

  return (
    <div className="bg-white">
      <Seo
        title={title}
        description={description}
        canonical={canonical}
        jsonLd={[breadcrumbSchema, ...(faqSchema ? [faqSchema] : []), ...jsonLd]}
      />

      {/* ── HERO ── */}
      <section className="relative py-16 sm:py-20 text-white overflow-hidden" style={{ backgroundColor: '#1a2332' }}>
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 60%, #E53935 0%, transparent 50%), radial-gradient(circle at 80% 35%, #FFD700 0%, transparent 50%)' }} />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Visible breadcrumb trail */}
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex flex-wrap items-center gap-1 text-sm text-white/60" style={{ fontFamily: 'Open Sans, sans-serif' }}>
              <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
              {breadcrumb.map((crumb, index) => (
                <li key={crumb.to} className="flex items-center gap-1">
                  <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                  {index === breadcrumb.length - 1
                    ? <span className="text-white/90">{crumb.label}</span>
                    : <Link to={crumb.to} className="hover:text-white transition-colors">{crumb.label}</Link>}
                </li>
              ))}
            </ol>
          </nav>

          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <p className="text-sm font-bold uppercase tracking-widest mb-4"
              style={{ color: '#FFD700', fontFamily: 'Open Sans, sans-serif' }}>
              {kicker}
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl mb-5 leading-tight"
              style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800 }}>
              {h1}
            </h1>
            <p className="text-lg sm:text-xl text-white/80 leading-relaxed"
              style={{ fontFamily: 'Open Sans, sans-serif' }}>
              {lead}
            </p>
            <a href={whatsappHref} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-8 px-8 py-4 rounded-xl font-bold transition-all duration-300 hover:scale-105"
              style={{ fontFamily: 'Montserrat, sans-serif', backgroundColor: '#FFD700', color: '#1a2332' }}>
              <MessageCircle className="w-5 h-5" />
              Ask on WhatsApp
            </a>
          </motion.div>
        </div>
      </section>

      {/* ── BODY SECTIONS ── */}
      <section className="py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          {sections.map((section, index) => (
            <motion.article key={section.heading}
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: index * 0.05, duration: 0.45 }}>
              <h2 className="text-2xl sm:text-3xl mb-4"
                style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, color: '#1a2332' }}>
                {section.heading}
              </h2>
              <p className="text-lg leading-relaxed text-gray-600" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                {section.body}
              </p>
              {section.bullets && (
                <ul className="mt-5 space-y-3">
                  {section.bullets.map(bullet => (
                    <li key={bullet} className="flex items-start gap-3 text-gray-700"
                      style={{ fontFamily: 'Open Sans, sans-serif' }}>
                      <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#E53935' }} />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              )}
            </motion.article>
          ))}
        </div>
      </section>

      {/* ── CASE STUDIES (only when the admin has entered real data) ── */}
      {caseStudyPlaces && <CaseStudies places={caseStudyPlaces} heading="Recent events in this area" />}

      {/* ── FAQ ── */}
      {faqs.length > 0 && (
        <section className="py-16 sm:py-20" style={{ backgroundColor: '#f8f9fa' }}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl mb-8 text-center"
              style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, color: '#1a2332' }}>
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {faqs.map(item => (
                <details key={item.question}
                  className="group bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <summary className="flex items-center justify-between gap-4 cursor-pointer px-6 py-5 font-bold list-none"
                    style={{ fontFamily: 'Montserrat, sans-serif', color: '#1a2332' }}>
                    {item.question}
                    <ChevronRight className="w-5 h-5 flex-shrink-0 transition-transform group-open:rotate-90"
                      style={{ color: '#E53935' }} aria-hidden="true" />
                  </summary>
                  <p className="px-6 pb-5 leading-relaxed text-gray-600" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── RELATED PAGES ── */}
      {related.length > 0 && (
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl mb-6"
              style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, color: '#1a2332' }}>
              Related pages
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {related.map(link => (
                <Link key={link.to} to={link.to}
                  className="flex items-center justify-between gap-3 px-6 py-4 rounded-xl border border-gray-200 hover:border-gray-400 transition-colors"
                  style={{ fontFamily: 'Open Sans, sans-serif', color: '#1a2332' }}>
                  <span className="font-semibold">{link.label}</span>
                  <ArrowRight className="w-4 h-4 flex-shrink-0" style={{ color: '#E53935' }} />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ── */}
      <section className="pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl p-10 sm:p-12 text-center" style={{ backgroundColor: '#E53935' }}>
            <h2 className="text-2xl sm:text-3xl mb-4 text-white"
              style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800 }}>
              {ctaHeading}
            </h2>
            <p className="text-lg mb-8 text-white/90 max-w-2xl mx-auto" style={{ fontFamily: 'Open Sans, sans-serif' }}>
              {ctaBody}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold transition-all duration-300 hover:scale-105"
                style={{ fontFamily: 'Montserrat, sans-serif', backgroundColor: '#FFD700', color: '#1a2332' }}>
                <MessageCircle className="w-5 h-5" />
                WhatsApp 03 919 876
              </a>
              <Link to="/catalog"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold border-2 border-white text-white transition-all duration-300 hover:scale-105"
                style={{ fontFamily: 'Montserrat, sans-serif' }}>
                See the games
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
