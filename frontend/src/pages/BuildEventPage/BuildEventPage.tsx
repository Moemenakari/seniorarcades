import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CelebrationIcon from '@mui/icons-material/Celebration';
import SchoolIcon from '@mui/icons-material/School';
import StorefrontIcon from '@mui/icons-material/Storefront';
import PublicIcon from '@mui/icons-material/Public';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { AuthModal } from '../../components/AuthModal';
import { Seo } from '../../components/Seo';
import { sizedImageUrl } from '../../components/figma/ImageWithFallback';
import { getAuthToken, getStoredUser } from '../../utils/authSession';
import { API_BASE_URL } from '../../config';
import { productAlt } from '../../utils/productAlt';

interface GameProduct {
  id: number;
  title: string;
  category: string;
  average_price: number;
  image_url: string;
  description: string;
}

/**
 * Event types, with the games that suit each one. The keywords are matched
 * against the names of the games actually in the catalog, so a suggestion
 * only ever names a game the business really has. The reasons follow what
 * the service and event pages say about each kind of event.
 */
const EVENT_TYPES = [
  {
    key: 'university', label: 'University Event', icon: AccountBalanceIcon,
    fits: ['hammer', 'boxing', 'basketball', 'hockey', 'reflex', 'claw'],
    reason: 'Students arrive in bursts between classes, so short rounds and a visible score keep the queue moving.',
  },
  {
    key: 'school', label: 'School Event', icon: SchoolIcon,
    fits: ['mickey', 'basketball', 'hockey', 'pop win', 'inflatable', 'reflex'],
    reason: 'A school day mixes age groups, so simple games that younger children can play alone work best.',
  },
  {
    key: 'birthday', label: 'Birthday / Private Party', icon: CelebrationIcon,
    fits: ['mickey', 'hockey', 'pop win', 'claw', 'basketball', 'inflatable'],
    reason: 'For a party of twenty or thirty guests, two or three well-chosen games usually keep everyone busy.',
  },
  {
    key: 'festival', label: 'Festival / Public Event', icon: PublicIcon,
    fits: ['hammer', 'claw', 'boxing', 'inflatable', 'pop win', 'basketball'],
    reason: 'A festival needs a mix: a crowd-puller, fast games for the queue, and something for young children.',
  },
  {
    key: 'brand', label: 'Brand Activation / Store Opening', icon: StorefrontIcon,
    fits: ['claw', 'hammer', 'boxing', 'pop win'],
    reason: 'An opening needs games that stop people walking past: loud, visible, and worth filming.',
  },
];

const STEP_NAMES = ['Event type', 'Budget', 'Games', 'Suggestions', 'Details'];
const BUDGET_MIN = 50;
const BUDGET_MAX = 2000;
// Typed budgets may go past the slider, up to this.
const BUDGET_TYPED_MAX = 100000;

type Tip = { tone: 'good' | 'warn' | 'info'; text: string };

export function BuildYourEvent() {
  const [step, setStep] = useState(1);
  const [furthestStep, setFurthestStep] = useState(1);
  const [eventType, setEventType] = useState<string | null>(null);
  const [budget, setBudget] = useState<number>(500);
  const [budgetInput, setBudgetInput] = useState('500');
  const [allGames, setAllGames] = useState<GameProduct[]>([]);
  const [selectedGames, setSelectedGames] = useState<Record<number, number>>({});

  const [contactDetails, setContactDetails] = useState({
    name: '',
    phone: '',
    notes: ''
  });

  const [expandedGame, setExpandedGame] = useState<number | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    const user = getStoredUser();
    if (user) {
      setContactDetails((prev) => ({
        ...prev,
        name: user.name || prev.name,
        phone: user.phone || prev.phone
      }));
    }
  }, []);

  useEffect(() => {
    fetch(`${API_BASE_URL}/products`)
      .then(res => res.json())
      .then(data => {
        // The API sends ids and prices as strings ("2", "95"). Selections are
        // stored by numeric id, so a string id never matched and every
        // selected game counted as $0 in the total.
        const mapped = (Array.isArray(data) ? data : []).map((item: any) => ({
          id: Number(item.id),
          title: item.name || item.title,
          category: item.category,
          average_price: Number(item.average_price ?? item.price?.average) || 0,
          image_url: item.image_url || '',
          description: item.description || 'No description available.',
        }));
        setAllGames(mapped);
      })
      .catch(console.error);
  }, []);

  const goTo = (target: number) => {
    const next = Math.min(5, Math.max(1, target));
    // Every step after the first needs an event type.
    if (next > 1 && !eventType) return;
    setStep(next);
    setFurthestStep(prev => Math.max(prev, next));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const setBudgetValue = (value: number) => {
    const clean = Math.min(BUDGET_TYPED_MAX, Math.max(1, Math.round(value)));
    setBudget(clean);
    setBudgetInput(String(clean));
  };

  // Rounded once to whole dollars, so every figure shown (total, remaining,
  // over by) adds up: $300 budget - $225 total always shows $75 left.
  const totalCost = Math.round(Object.entries(selectedGames).reduce((acc, [id, qty]) => {
    const game = allGames.find(g => g.id === Number(id));
    return acc + (game ? game.average_price * qty : 0);
  }, 0));

  const totalGamesCount = Object.values(selectedGames).reduce((a, b) => a + b, 0);
  const remainingBudget = budget - totalCost;
  const currentType = EVENT_TYPES.find(e => e.key === eventType);

  const pricedGames = allGames.filter(g => g.average_price > 0);
  const averageGamePrice = pricedGames.length
    ? pricedGames.reduce((s, g) => s + g.average_price, 0) / pricedGames.length
    : 0;

  const handleGameSelect = (id: number, delta: number) => {
    setSelectedGames(prev => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + delta);
      const newSelections = { ...prev };
      if (next === 0) {
        delete newSelections[id];
      } else {
        newSelections[id] = next;
      }
      return newSelections;
    });
  };

  const getBudgetFeedback = () => {
    if (!averageGamePrice) return 'Set the amount you would like to spend per day.';
    const games = Math.floor(budget / averageGamePrice);
    if (games < 1) return `Our games average $${Math.round(averageGamePrice)} per day, so this may cover one smaller game.`;
    return `About ${games} game${games === 1 ? '' : 's'} for one day, at our average of $${Math.round(averageGamePrice)} per game.`;
  };

  /** Suggestions built from the real selection, budget and catalog. */
  const tips = useMemo<Tip[]>(() => {
    const list: Tip[] = [];
    const selected = allGames.filter(g => selectedGames[g.id]);
    const matches = (game: GameProduct) =>
      !!currentType && currentType.fits.some(k => game.title.toLowerCase().includes(k));

    if (selected.length === 0) {
      list.push({ tone: 'warn', text: 'No games selected yet. Go back to the Games step and add at least one.' });
      return list;
    }

    // Budget
    if (remainingBudget < 0) {
      const priciest = [...selected].sort((a, b) => b.average_price - a.average_price)[0];
      list.push({
        tone: 'warn',
        text: `You are $${Math.round(-remainingBudget)} over your $${budget} budget. Removing one ${priciest.title} saves $${Math.round(priciest.average_price)} per day.`,
      });
    } else {
      list.push({
        tone: 'good',
        text: `Your selection comes to $${Math.round(totalCost)} per day, within your $${budget} budget ($${Math.round(remainingBudget)} left).`,
      });
      const affordable = allGames
        .filter(g => !selectedGames[g.id] && g.average_price > 0 && g.average_price <= remainingBudget)
        .sort((a, b) => Number(matches(b)) - Number(matches(a)) || b.average_price - a.average_price);
      if (affordable.length > 0) {
        list.push({
          tone: 'info',
          text: `Your remaining budget also covers the ${affordable[0].title} ($${Math.round(affordable[0].average_price)} per day).`,
        });
      }
    }

    // Fit for this kind of event
    if (currentType) {
      const fitting = selected.filter(matches).map(g => g.title);
      const missing = allGames.filter(g => !selectedGames[g.id] && matches(g)).map(g => g.title);
      if (fitting.length > 0) {
        list.push({ tone: 'good', text: `${fitting.join(', ')} ${fitting.length === 1 ? 'suits' : 'suit'} a ${currentType.label.toLowerCase()}. ${currentType.reason}` });
      } else {
        list.push({ tone: 'info', text: currentType.reason });
      }
      if (missing.length > 0) {
        list.push({ tone: 'info', text: `Also popular for this kind of event: ${missing.slice(0, 2).join(' and ')}.` });
      }
    }

    // Variety
    const categories = new Set(selected.map(g => g.category));
    if (selected.length >= 2 && categories.size === 1) {
      list.push({ tone: 'info', text: 'All your games are the same type. Mixing in a different kind keeps more guests interested.' });
    }

    return list;
  }, [allGames, selectedGames, remainingBudget, budget, totalCost, currentType]);

  const handleWhatsApp = () => {
    const token = getAuthToken();
    if (!token) {
      setIsAuthModalOpen(true);
      return;
    }
    const user = getStoredUser();
    const bookingName = user?.name || contactDetails.name;
    const bookingPhone = user?.phone || contactDetails.phone;

    const selectedGamesText = Object.entries(selectedGames)
      .map(([id, qty]) => {
        const g = allGames.find(x => x.id === Number(id));
        return `- ${qty}x ${g?.title || 'Unknown'}`;
      })
      .join('\n');

    const msg = `Hi! I'm planning an event with the Build Your Event planner.

*Event Type:* ${currentType?.label || 'N/A'}
*Budget:* $${budget}
*Est. Cost:* $${Math.round(totalCost)} per day

*Selected Games:*
${selectedGamesText || 'None'}

*Client Info:*
Name: ${bookingName}
Phone: ${bookingPhone}
Notes: ${contactDetails.notes || 'N/A'}`;

    const link = `https://wa.me/96103919876?text=${encodeURIComponent(msg)}`;
    window.open(link, '_blank');
  };

  const tipStyle = {
    good: { box: 'bg-green-50 border-green-200 text-green-800', Icon: CheckCircleIcon, color: '#16a34a' },
    warn: { box: 'bg-red-50 border-red-200 text-red-700', Icon: WarningAmberIcon, color: '#E53935' },
    info: { box: 'bg-blue-50 border-blue-100 text-[#1a2332]', Icon: TipsAndUpdatesIcon, color: '#2563eb' },
  };

  const canGoNext = step < 5 && (step !== 1 || !!eventType);

  return (
    <>
    <Seo
      title="Build Your Custom Arcade Event | Next Level Game Lebanon"
      description="Plan your own arcade and carnival event in minutes. Pick your games, set a budget, and get an instant quote for events anywhere in Lebanon, Tripoli to Beirut."
      canonical="/build-your-event"
    />
    <div className="bg-[#f8f9fa] min-h-screen pb-16 font-sans">
      <h1 className="sr-only">Build Your Custom Arcade & Carnival Event in Lebanon</h1>

      {/* Progress bar with back / next arrows. Numbered steps already
          reached can be clicked to jump straight to them. */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-3xl mx-auto px-3 py-3 flex items-center gap-2">
          <button onClick={() => goTo(step - 1)} disabled={step === 1} aria-label="Previous step"
            className="w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center bg-gray-100 text-[#1a2332] hover:bg-gray-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
            <ArrowBackIcon fontSize="small" />
          </button>

          <div className="flex-1 flex flex-col items-center min-w-0">
            <div className="flex items-center justify-center">
              {[1, 2, 3, 4, 5].map((i) => {
                const reachable = i <= furthestStep || (i === furthestStep + 1 && canGoNext && i === step + 1);
                return (
                  <div key={i} className="flex items-center">
                    <button onClick={() => reachable && goTo(i)} disabled={!reachable} aria-label={`Step ${i}: ${STEP_NAMES[i - 1]}`}
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${step === i ? 'bg-[#E53935] text-white' : step > i ? 'bg-[#1a2332] text-white' : 'bg-gray-100 text-gray-400'} ${reachable ? 'cursor-pointer' : 'cursor-default'}`}>
                      {i}
                    </button>
                    {i < 5 && (
                      <div className={`h-1 w-4 sm:w-12 mx-1 sm:mx-2 rounded ${step > i ? 'bg-[#1a2332]' : 'bg-gray-100'}`} />
                    )}
                  </div>
                );
              })}
            </div>
            <p className="text-[11px] font-bold text-gray-500 mt-1.5 uppercase tracking-wide">
              Step {step} of 5 · {STEP_NAMES[step - 1]}
            </p>
          </div>

          <button onClick={() => goTo(step + 1)} disabled={!canGoNext} aria-label="Next step"
            className="w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center bg-[#1a2332] text-white hover:bg-[#2c3a52] transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
            <ArrowForwardIcon fontSize="small" />
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 mt-10">
        <AnimatePresence mode="wait">

          {/* STEP 1: Event Type */}
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-black text-[#1a2332] mb-2">What kind of event are you planning?</h2>
                <p className="text-gray-500 text-sm">Select one to get started.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {EVENT_TYPES.map(et => {
                  const Icon = et.icon;
                  return (
                    <motion.button key={et.key}
                      onClick={() => { setEventType(et.key); setStep(2); setFurthestStep(p => Math.max(p, 2)); }}
                      className={`p-5 rounded-2xl border text-left bg-white shadow-sm transition-all flex flex-col items-center justify-center gap-3 hover:border-[#E53935] hover:shadow-md ${eventType === et.key ? 'border-[#E53935] ring-1 ring-[#E53935]' : 'border-gray-100'}`}
                      whileTap={{ scale: 0.98 }}>
                      <Icon className={eventType === et.key ? 'text-[#E53935]' : 'text-[#1a2332]'} style={{ fontSize: 32 }} />
                      <span className="font-bold text-sm text-[#1a2332] text-center">{et.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* STEP 2: Budget */}
          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-black text-[#1a2332] mb-2">Set your target budget</h2>
                <p className="text-gray-500 text-sm">Per day, in US dollars. Slide, or type the amount you have in mind.</p>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex flex-col items-center">
                  <label htmlFor="budget-input" className="sr-only">Budget in US dollars</label>
                  <div className="flex items-center gap-1 mb-2">
                    <span className="text-4xl font-black text-[#E53935]">$</span>
                    <input id="budget-input" type="number" inputMode="numeric" min={1} max={BUDGET_TYPED_MAX} step={10} value={budgetInput}
                      onChange={(e) => {
                        setBudgetInput(e.target.value);
                        const v = Number(e.target.value);
                        if (v > 0) setBudget(Math.min(BUDGET_TYPED_MAX, Math.round(v)));
                      }}
                      // Select the current amount on tap, so typing replaces it
                      // instead of appending digits (500 + "300" = 500300).
                      onFocus={(e) => e.target.select()}
                      onBlur={() => setBudgetValue(Number(budgetInput) > 0 ? Number(budgetInput) : BUDGET_MIN)}
                      className="w-40 text-4xl font-black text-[#E53935] text-center bg-gray-50 border-2 border-gray-200 focus:border-[#E53935] rounded-xl outline-none py-1" />
                  </div>
                  <p className="text-xs text-gray-400 mb-6">Tap the number to type your own amount</p>
                  <p className="text-sm font-semibold text-gray-600 mb-8 text-center">{getBudgetFeedback()}</p>

                  <input type="range" min={BUDGET_MIN} max={BUDGET_MAX} step={10} value={Math.min(budget, BUDGET_MAX)}
                    onChange={(e) => setBudgetValue(Number(e.target.value))}
                    aria-label="Budget slider"
                    className="w-full accent-[#E53935] h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />

                  <div className="w-full flex justify-between text-xs text-gray-400 font-bold mt-3">
                    <span>${BUDGET_MIN}</span>
                    <span>${BUDGET_MAX.toLocaleString('en-US')}+</span>
                  </div>
                </div>

                <div className="mt-10 flex justify-between">
                  <button onClick={() => goTo(1)} className="px-5 py-2.5 text-sm font-bold text-gray-500 flex items-center gap-2 hover:bg-gray-50 rounded-xl transition-colors"><ArrowBackIcon fontSize="small"/> Back</button>
                  <button onClick={() => goTo(3)} className="px-6 py-2.5 rounded-xl text-white font-bold text-sm bg-[#1a2332] hover:bg-[#2c3a52] transition-colors flex items-center gap-2 shadow-md">
                    Next <ArrowForwardIcon fontSize="small" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Game Selection */}
          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>

              {totalGamesCount > 0 && remainingBudget < 0 && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-600 text-sm font-semibold">
                  <InfoIcon fontSize="small" /> ${Math.round(-remainingBudget)} over your budget
                </div>
              )}
              {totalGamesCount > 0 && remainingBudget >= 0 && remainingBudget < budget * 0.1 && (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-amber-700 text-sm font-semibold">
                  <InfoIcon fontSize="small" /> Almost at your budget limit
                </div>
              )}

              {/* Live budget dashboard */}
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex justify-between items-center sticky top-24 z-40">
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400">Total Selection</p>
                  <p className="text-xl font-black text-[#1a2332]">{totalGamesCount} Game{totalGamesCount === 1 ? '' : 's'}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase font-bold text-gray-400">Total Price / Day</p>
                  <p className={`text-xl font-black ${remainingBudget < 0 ? 'text-[#E53935]' : 'text-green-600'}`}>
                    ${Math.round(totalCost).toLocaleString('en-US')}
                  </p>
                  <p className="text-[10px] font-bold text-gray-400">Budget: ${budget.toLocaleString('en-US')}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {allGames.map(game => {
                  const qty = selectedGames[game.id] || 0;
                  const isExpanded = expandedGame === game.id;
                  return (
                    <div key={game.id} className={`bg-white rounded-2xl border transition-all ${qty > 0 ? 'border-[#E53935] shadow-md' : 'border-gray-100 shadow-sm'}`}>
                      <div className="flex p-3 gap-3">
                        <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                          {game.image_url && (
                            <img src={sizedImageUrl(game.image_url, 160)} alt={productAlt(game)} width={64} height={64} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div className="flex-1 flex flex-col justify-center">
                          <h3 className="text-sm font-black text-[#1a2332] line-clamp-1">{game.title}</h3>
                          <p className="text-xs font-bold text-[#E53935] mb-2">
                            {game.average_price > 0 ? <>${Math.round(game.average_price)} <span className="text-gray-400 font-normal">/ day (average)</span></> : <span className="text-gray-400 font-normal">Ask for price</span>}
                          </p>
                          <div className="flex justify-between items-center">
                            <button onClick={() => setExpandedGame(isExpanded ? null : game.id)} className="text-[10px] font-bold text-gray-500 underline">
                              {isExpanded ? 'Hide Details' : 'View Details'}
                            </button>
                            <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1 border border-gray-100">
                              <button onClick={() => handleGameSelect(game.id, -1)} aria-label={`Remove one ${game.title}`} className="w-6 h-6 rounded flex items-center justify-center bg-white shadow-sm text-gray-600 hover:text-[#E53935]"><RemoveIcon sx={{ fontSize: 14 }} /></button>
                              <span className="text-xs font-bold w-4 text-center">{qty}</span>
                              <button onClick={() => handleGameSelect(game.id, 1)} aria-label={`Add one ${game.title}`} className="w-6 h-6 rounded flex items-center justify-center bg-white shadow-sm text-gray-600 hover:text-green-600"><AddIcon sx={{ fontSize: 14 }} /></button>
                            </div>
                          </div>
                        </div>
                      </div>
                      {isExpanded && (
                        <div className="px-3 pb-3 pt-1 border-t border-gray-50 text-xs text-gray-500">
                          {game.description}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 flex justify-between bg-white p-4 rounded-2xl shadow-sm border border-gray-100 sticky bottom-4 z-40">
                <button onClick={() => goTo(2)} className="px-5 py-2.5 text-sm font-bold text-gray-500 flex items-center gap-2 hover:bg-gray-50 rounded-xl transition-colors"><ArrowBackIcon fontSize="small"/> Back</button>
                <button onClick={() => goTo(4)} className="px-6 py-2.5 rounded-xl text-white font-bold text-sm bg-[#1a2332] hover:bg-[#2c3a52] transition-colors flex items-center gap-2 shadow-md">
                  Continue <ArrowForwardIcon fontSize="small" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: Suggestions — rule-based, from the real selection and catalog */}
          {step === 4 && (
            <motion.div key="s4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-[#E53935] bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TipsAndUpdatesIcon className="text-[#E53935]" fontSize="large" />
                  </div>
                  <h2 className="text-2xl font-black text-[#1a2332] mb-1">Smart Suggestions</h2>
                  <p className="text-sm text-gray-500">{currentType?.label} · {totalGamesCount} game{totalGamesCount === 1 ? '' : 's'} · ${Math.round(totalCost)} per day</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {tips.map((tip, i) => {
                    const s = tipStyle[tip.tone];
                    const Icon = s.Icon;
                    return (
                      <li key={i} className={`flex items-start gap-3 p-4 rounded-2xl border text-sm leading-relaxed ${s.box}`}>
                        <Icon style={{ color: s.color, fontSize: 20 }} className="flex-shrink-0 mt-0.5" />
                        <span>{tip.text}</span>
                      </li>
                    );
                  })}
                </ul>

                <div className="flex justify-between items-center">
                  <button onClick={() => goTo(3)} className="px-5 py-2.5 text-sm font-bold text-gray-500 flex items-center gap-2 hover:bg-gray-50 rounded-xl transition-colors"><ArrowBackIcon fontSize="small"/> Edit games</button>
                  <button onClick={() => goTo(5)} className="px-6 py-2.5 rounded-xl text-white font-bold text-sm bg-[#1a2332] hover:bg-[#2c3a52] transition-colors flex items-center gap-2 shadow-md">
                    Finalize <ArrowForwardIcon fontSize="small" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 5: Final Details */}
          {step === 5 && (
            <motion.div key="s5" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-black text-[#1a2332] mb-2">Final Details</h2>
                <p className="text-gray-500 text-sm">Where should we send your custom quote?</p>
              </div>

              <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Full Name</label>
                    <input type="text" placeholder="Your name" value={contactDetails.name} onChange={e => setContactDetails({...contactDetails, name: e.target.value})} disabled={!!getStoredUser()} className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-[#1a2332] focus:bg-white transition-colors outline-none text-sm font-medium disabled:opacity-70" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Phone Number</label>
                    <input type="tel" placeholder="+961 70 000 000" value={contactDetails.phone} onChange={e => setContactDetails({...contactDetails, phone: e.target.value})} disabled={!!getStoredUser()} className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-[#1a2332] focus:bg-white transition-colors outline-none text-sm font-medium disabled:opacity-70" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Optional Notes</label>
                    <textarea placeholder="Date, location, number of guests…" rows={3} value={contactDetails.notes} onChange={e => setContactDetails({...contactDetails, notes: e.target.value})} className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-[#1a2332] focus:bg-white transition-colors outline-none text-sm font-medium resize-none" />
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <button onClick={() => goTo(4)} className="px-5 py-2.5 text-sm font-bold text-gray-500 flex items-center gap-2 hover:bg-gray-50 rounded-xl transition-colors w-full sm:w-auto justify-center"><ArrowBackIcon fontSize="small"/> Back</button>
                  <button onClick={handleWhatsApp} disabled={!(getStoredUser()?.name || contactDetails.name) || !(getStoredUser()?.phone || contactDetails.phone)} className="px-8 py-3.5 rounded-xl text-white font-black text-sm bg-[#25D366] hover:bg-[#128C7E] transition-colors flex items-center justify-center gap-2 shadow-lg shadow-green-200 disabled:opacity-50 disabled:shadow-none w-full sm:w-auto">
                    <WhatsAppIcon /> Send via WhatsApp
                  </button>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
    <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} onSuccess={() => { setIsAuthModalOpen(false); handleWhatsApp(); }} />
    </>
  );
}
