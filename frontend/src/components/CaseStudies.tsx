/**
 * ============================================================
 * CASE STUDIES
 * ============================================================
 * Real events with an attendance figure and the games used, as
 * entered in the admin's "Case study" window. The API returns only
 * events where all of that is filled in, and only safe fields:
 * the public place name, dates, attendance and games.
 *
 * On an area page, `places` narrows the list to events whose place
 * mentions one of those names. With nothing to show, it renders
 * nothing — there is no placeholder and no invented example.
 * ============================================================
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Users, CalendarDays } from 'lucide-react';
import { API_BASE_URL } from '../config';

interface CaseStudy {
  id: string | number;
  place: string;
  date: string;
  end_date?: string;
  attendance: number;
  games: { id: number; name: string }[];
}

interface CaseStudiesProps {
  /** Area names to match against each event's place, case-insensitively. */
  places?: string[];
  heading?: string;
}

function formatMonth(date: string): string {
  const d = new Date(date);
  return Number.isNaN(d.getTime())
    ? date
    : d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}

export function CaseStudies({ places, heading = 'Recent events' }: CaseStudiesProps) {
  const [items, setItems] = useState<CaseStudy[]>([]);
  // A joined string, not the array: a new array on every parent render
  // would re-run the fetch each time.
  const placeKey = (places || []).join('|').toLowerCase();

  useEffect(() => {
    let ignore = false;
    fetch(`${API_BASE_URL}/case-studies`)
      .then(res => (res.ok ? res.json() : []))
      .then((list: CaseStudy[]) => {
        if (ignore) return;
        const wanted = placeKey ? placeKey.split('|') : [];
        setItems(wanted.length
          ? list.filter(item => wanted.some(p => item.place.toLowerCase().includes(p)))
          : list);
      })
      .catch(() => { if (!ignore) setItems([]); });
    return () => { ignore = true; };
  }, [placeKey]);

  if (items.length === 0) return null;

  return (
    <section className="py-16" aria-labelledby="case-studies-heading">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 id="case-studies-heading" className="text-2xl sm:text-3xl mb-8"
          style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, color: '#1a2332' }}>
          {heading}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {items.map(item => (
            <article key={item.id} className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="flex items-center gap-2 text-lg font-bold mb-3"
                style={{ fontFamily: 'Montserrat, sans-serif', color: '#1a2332' }}>
                <MapPin className="w-5 h-5 flex-shrink-0" style={{ color: '#E53935' }} />
                {item.place}
              </h3>
              <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-600 mb-4" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="w-4 h-4" /> {formatMonth(item.date)}
                </span>
                <span className="flex items-center gap-1.5 font-semibold text-gray-800">
                  <Users className="w-4 h-4" /> {item.attendance.toLocaleString('en-US')} attendees
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-2" style={{ fontFamily: 'Open Sans, sans-serif' }}>Games supplied:</p>
              <ul className="flex flex-wrap gap-2">
                {item.games.map(game => (
                  <li key={game.id}>
                    <Link to={`/product/${game.id}`}
                      className="inline-block text-sm px-3 py-1 rounded-full border border-gray-200 hover:border-gray-400 transition-colors"
                      style={{ fontFamily: 'Open Sans, sans-serif', color: '#1a2332' }}>
                      {game.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
