/**
 * ============================================================
 * RELATED GAMES
 * ============================================================
 * Up to three other games from the same category, shown under a
 * game's page. Visitors get a next step instead of a dead end,
 * and each game page links to its neighbours, which helps search
 * engines find and connect them. The pre-renderer captures these
 * links, so crawlers that skip JavaScript still see them.
 *
 * Renders nothing when the category has no other games.
 * ============================================================
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { productAlt } from '../utils/productAlt';
import { API_BASE_URL } from '../config';

interface RelatedGame {
  id: number;
  name: string;
  alt_text?: string;
  image_url?: string;
  rent_price?: string;
}

interface RelatedGamesProps {
  currentId: number | string;
  category?: string;
}

const MAX_RELATED = 3;

export function RelatedGames({ currentId, category }: RelatedGamesProps) {
  const [games, setGames] = useState<RelatedGame[]>([]);

  useEffect(() => {
    let ignore = false;
    const query = category ? `?category=${encodeURIComponent(category)}` : '';
    fetch(`${API_BASE_URL}/products${query}`)
      .then(res => (res.ok ? res.json() : []))
      .then((list: RelatedGame[]) => {
        if (ignore) return;
        setGames(list.filter(game => String(game.id) !== String(currentId)).slice(0, MAX_RELATED));
      })
      .catch(() => { if (!ignore) setGames([]); });
    return () => { ignore = true; };
  }, [currentId, category]);

  if (games.length === 0) return null;

  return (
    <section className="mt-14" aria-labelledby="related-games-heading">
      <h2 id="related-games-heading" className="text-xl sm:text-2xl mb-6 text-[#1a2332]"
        style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800 }}>
        Related games
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {games.map(game => (
          <Link key={game.id} to={`/product/${game.id}`}
            className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-shadow">
            <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
              <ImageWithFallback
                src={game.image_url}
                alt={productAlt(game)}
                displayWidth={300}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="p-4 flex items-center justify-between gap-3">
              <div>
                <p className="font-bold text-[#1a2332]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {game.name}
                </p>
                {game.rent_price && (
                  <p className="text-sm text-gray-500" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                    {game.rent_price} / day
                  </p>
                )}
              </div>
              <ArrowRight className="w-5 h-5 flex-shrink-0 text-[#E53935]" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
