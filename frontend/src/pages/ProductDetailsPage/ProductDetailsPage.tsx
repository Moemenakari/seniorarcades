import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import StarIcon from '@mui/icons-material/Star';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import { ImageWithFallback, sizedImageUrl } from '../../components/figma/ImageWithFallback';
import { AuthModal } from '../../components/AuthModal';
import { Seo } from '../../components/Seo';
import { RelatedGames } from '../../components/RelatedGames';
import { getAuthToken } from '../../utils/authSession';
import { API_BASE_URL } from '../../config';
import { productAlt } from '../../utils/productAlt';

interface Rating {
  id: number;
  rating: number;
  review: string;
  user_name: string;
  created_at: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  images?: string[];
  image_url?: string;
  image_url2?: string;
  image_url3?: string;
  category: string;
  price?: { min: number; max: number; average: number };
  min_price?: number;
  max_price?: number;
  average_price?: number;
  electricity_amount?: string;
  space_required?: string;
  availability?: string;
  status?: 'active' | 'hidden' | 'archived';
  has_coins?: number | boolean;
  badge?: string;
}

/**
 * Games that already have a dedicated page elsewhere on the site.
 *
 * The game stays in the catalog so customers browsing find it, but its
 * product page names the dedicated page as canonical, so Google treats the
 * two as one page instead of splitting their ranking between them.
 * Matched on the name, because the id is whatever the admin assigns.
 */
const DEDICATED_PAGES: { match: RegExp; path: string }[] = [
  { match: /human\s*claw/i, path: '/sponsorship' },
];

function canonicalFor(name: string, id: string | undefined): string {
  const dedicated = DEDICATED_PAGES.find(entry => entry.match.test(name));
  return dedicated ? dedicated.path : `/product/${id}`;
}

export function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [userRating, setUserRating] = useState(0);
  const [userReview, setUserReview] = useState('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [requestLoginOpen, setRequestLoginOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    if (!id) return;
    let ignore = false;
    const load = async () => {
      setLoading(true);
      setProduct(null);
      setRatings([]);
      setSelectedImage(0);
      try {
        const productRes = await fetch(`${API_BASE_URL}/products/${id}`, {
          cache: 'no-store'
        });
        if (!productRes.ok) throw new Error('Failed to load product');
        const productData = await productRes.json();
        if (ignore) return;
        setProduct(productData);

        const ratingsRes = await fetch(`${API_BASE_URL}/ratings/game/${id}`, {
          cache: 'no-store'
        });
        const ratingsData = await ratingsRes.json();
        if (ignore) return;
        if (ratingsData?.success) setRatings(ratingsData.ratings || []);
      } catch (err: any) {
        if (!ignore) {
          console.error('[ProductDetails] fetch error:', err);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    load();
    return () => { ignore = true; };
  }, [id]);

  const submitRating = async () => {
    const token = getAuthToken();
    if (!token) {
      setIsAuthModalOpen(true);
      return;
    }
    if (userRating === 0) return;
    
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/ratings/game`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ productId: id, rating: userRating, review: userReview })
      });
      const data = await res.json();
      if (data.success) {
        const rRes = await fetch(`${API_BASE_URL}/ratings/game/${id}`);
        const rData = await rRes.json();
        if (rData.success) setRatings(rData.ratings);
        setUserRating(0);
        setUserReview('');
      } else {
        alert(data.error || 'Failed to submit rating');
      }
    } catch (err) {
      alert('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  const averageRating = ratings.length > 0 
    ? (ratings.reduce((acc, r) => acc + r.rating, 0) / ratings.length).toFixed(1)
    : 'N/A';

  const priceRange = useMemo(() => {
    const min = product?.price?.min ?? product?.min_price;
    const max = product?.price?.max ?? product?.max_price;
    if (typeof min === 'number' && typeof max === 'number') return `$${min} - $${max}`;
    return 'Ask for price';
  }, [product]);

  const images = useMemo(() => {
    if (!product) return [];
    if (Array.isArray(product.images) && product.images.length) return product.images;
    return [product.image_url, product.image_url2, product.image_url3].filter(Boolean) as string[];
  }, [product]);

  const productJsonLd = useMemo(() => {
    if (!product) return undefined;
    // Postgres NUMERIC arrives as a string ("70"), so parse before use.
    // A price of 0 is the column default, not a real price — emitting it
    // would make Google show the game as free, so it counts as missing.
    const low = Number(product.price?.min ?? product.min_price);
    const high = Number(product.price?.max ?? product.max_price);
    const hasPrice = low > 0;
    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: product.description || `${product.name} available for rent in Lebanon.`,
      category: product.category,
      image: images.length ? images : undefined,
      ...(hasPrice
        ? {
            offers: {
              '@type': 'AggregateOffer',
              priceCurrency: 'USD',
              lowPrice: low,
              highPrice: high >= low ? high : low,
              // The range is a daily rental rate, not a purchase price.
              priceSpecification: {
                '@type': 'UnitPriceSpecification',
                priceCurrency: 'USD',
                minPrice: low,
                maxPrice: high >= low ? high : low,
                unitText: 'day',
              },
              availability:
                product.availability === 'available' || product.status === 'active'
                  ? 'https://schema.org/InStock'
                  : 'https://schema.org/OutOfStock',
              areaServed: 'LB',
            },
          }
        : {}),
      ...(ratings.length > 0
        ? {
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: averageRating,
              reviewCount: ratings.length,
            },
          }
        : {}),
    };
  }, [product, images, ratings, averageRating]);

  const whatsappNumber = "+96103919876";
  const whatsappMessage = `Hello, I'm interested in renting/booking the ${product?.name || 'product'}. Can you provide more details?`;
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;
  const handleRequest = () => {
    const token = getAuthToken();
    if (!token) {
      setRequestLoginOpen(true);
      return;
    }
    window.open(whatsappLink, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fb]">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#E53935]"></div>
          <span className="text-xs text-gray-400 font-semibold uppercase tracking-widest">Loading details...</span>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#f8f9fb]">
        <Seo
          title="Product Not Found | Next Level Game Lebanon"
          description="This arcade or carnival game could not be found. Browse our full catalog of games available for rent across Lebanon, from Beirut to Tripoli."
          canonical="/catalog"
          noindex
        />
        <SportsEsportsIcon style={{ fontSize: 48, color: '#d1d5db' }} />
        <h2 className="text-lg font-bold mt-3 text-gray-700">Product Not Found</h2>
        <Link to="/" className="text-[#E53935] hover:underline flex items-center gap-1.5 mt-3 text-sm font-semibold">
          <ArrowBackIcon style={{ fontSize: 16 }} /> Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <Seo
        title={`${product.name} Rental in Lebanon | Next Level Game`}
        description={`Rent the ${product.name} for your next event in Lebanon. ${product.category || 'Arcade'} game available in Beirut, Tripoli and nationwide. Book via WhatsApp!`}
        canonical={canonicalFor(product.name, id)}
        image={images[0]}
        jsonLd={productJsonLd}
      />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/catalog" className="inline-flex items-center gap-1.5 text-gray-500 hover:text-[#E53935] text-sm font-semibold mb-6 transition-colors">
          <ArrowBackIcon style={{ fontSize: 16 }} /> Back to Catalog
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <div className="rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 aspect-[4/3]">
              <ImageWithFallback
                displayWidth={640}
                priority
                src={images[selectedImage] || ''}
                alt={productAlt(product, selectedImage + 1)}
                className="w-full h-full object-cover"
              />
            </div>
            {images.length > 1 && (
              <div className="mt-3 grid grid-cols-4 gap-2">
                {images.map((img, idx) => (
                  <button
                    key={`${img}-${idx}`}
                    onClick={() => setSelectedImage(idx)}
                    className={`rounded-lg overflow-hidden border ${selectedImage === idx ? 'border-[#E53935]' : 'border-gray-200'}`}
                  >
                    <img src={sizedImageUrl(img, 200)} alt={productAlt(product, idx + 1)} loading="lazy" decoding="async" className="w-full h-20 object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="px-2.5 py-1 rounded-md bg-gray-100 text-xs font-bold uppercase tracking-wider text-gray-700">
                {product.category || 'Arcade'}
              </span>
              <span className="px-2.5 py-1 rounded-md bg-green-50 text-xs font-bold uppercase tracking-wider text-green-700">
                {product.availability || (product.status === 'active' ? 'available' : 'unavailable')}
              </span>
              {product.badge && product.badge !== 'None' ? (
                <span className="px-2.5 py-1 rounded-md bg-[#1a2332] text-xs font-bold uppercase tracking-wider text-white">
                  {product.badge}
                </span>
              ) : null}
            </div>

            <h1 className="text-2xl sm:text-3xl text-[#1a2332] mb-2" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800 }}>
                {product.name} Rental in Lebanon
            </h1>
            <div className="flex items-center gap-1 mb-5">
              <StarIcon style={{ fontSize: 18, color: '#FFD700' }} />
              <span className="text-sm font-bold text-gray-700">{averageRating}</span>
              <span className="text-xs text-gray-400">({ratings.length} reviews)</span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="bg-gray-50 rounded-xl border border-gray-100 p-3">
                <p className="text-[11px] uppercase tracking-wider text-gray-500 font-bold">Price Range</p>
                <p className="text-sm font-bold text-[#1a2332]">{priceRange}</p>
              </div>
              <div className="bg-gray-50 rounded-xl border border-gray-100 p-3">
                <p className="text-[11px] uppercase tracking-wider text-gray-500 font-bold">Space Required</p>
                <p className="text-sm font-bold text-[#1a2332]">{product.space_required || 'N/A'}</p>
              </div>
              <div className="bg-gray-50 rounded-xl border border-gray-100 p-3">
                <p className="text-[11px] uppercase tracking-wider text-gray-500 font-bold">Power (AMP)</p>
                <p className="text-sm font-bold text-[#1a2332]">{product.electricity_amount || 'No power needed'}</p>
              </div>
              <div className="bg-gray-50 rounded-xl border border-gray-100 p-3">
                <p className="text-[11px] uppercase tracking-wider text-gray-500 font-bold">Coin System</p>
                <p className="text-sm font-bold text-[#1a2332]">{product.has_coins ? 'Works with coin' : 'No coin required'}</p>
              </div>
            </div>

            <p className="text-sm text-gray-600 leading-relaxed mb-6" style={{ fontFamily: 'Open Sans, sans-serif' }}>
              {product.description || 'No description available for this product yet.'}
            </p>

            <button
              onClick={handleRequest}
              className="w-full sm:w-auto px-8 py-3.5 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-xl transition-all font-bold text-sm"
            >
              Request Booking
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-sm mt-8">
          <h3 className="text-lg font-bold mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>Player Ratings</h3>
          
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6">
            <p className="text-sm font-bold mb-2">Rate your experience</p>
            <div className="flex gap-1 mb-3">
              {[1, 2, 3, 4, 5].map(star => (
                <StarIcon key={star} onClick={() => setUserRating(star)} className="cursor-pointer" style={{ color: star <= userRating ? '#FFD700' : '#d1d5db', fontSize: 28 }} />
              ))}
            </div>
            <textarea 
              placeholder="Optional review..." 
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#E53935] mb-3"
              rows={2} value={userReview} onChange={e => setUserReview(e.target.value)}
            />
            <button onClick={submitRating} disabled={submitting || userRating === 0}
              className="px-6 py-2.5 bg-[#1a2332] text-white rounded-lg text-sm font-bold hover:bg-black disabled:opacity-50 transition-colors">
              {submitting ? 'Submitting...' : 'Submit Rating'}
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {ratings.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No ratings yet. Be the first to rate!</p>
            ) : (
              ratings.map(r => (
                <div key={r.id} className="pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>{r.user_name}</span>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map(star => (
                        <StarIcon key={star} style={{ color: star <= r.rating ? '#FFD700' : '#d1d5db', fontSize: 14 }} />
                      ))}
                    </div>
                  </div>
                  {r.review && <p className="text-sm text-gray-600 mt-1">{r.review}</p>}
                  <span className="text-[10px] text-gray-400 mt-2 block">{new Date(r.created_at).toLocaleDateString()}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <RelatedGames currentId={product.id} category={product.category} />
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} onSuccess={() => { setIsAuthModalOpen(false); submitRating(); }} />
      <AuthModal isOpen={requestLoginOpen} onClose={() => setRequestLoginOpen(false)} onSuccess={() => { setRequestLoginOpen(false); handleRequest(); }} />
    </div>
  );
}
