import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CelebrationIcon from '@mui/icons-material/Celebration';
import SchoolIcon from '@mui/icons-material/School';
import CorporateFareIcon from '@mui/icons-material/CorporateFare';
import PublicIcon from '@mui/icons-material/Public';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import InfoIcon from '@mui/icons-material/Info';
import { AuthModal } from '../../components/AuthModal';
import { getAuthToken, getStoredUser } from '../../utils/authSession';
import { API_BASE_URL } from '../../config';

interface GameProduct {
  id: number;
  title: string;
  category: string;
  average_price: number;
  image_url: string;
  description: string;
}

const EVENT_TYPES = [
  { key: 'university', label: 'University Event', icon: AccountBalanceIcon },
  { key: 'school', label: 'School Event', icon: SchoolIcon },
  { key: 'private', label: 'Private Party', icon: CelebrationIcon },
  { key: 'public', label: 'Public Event', icon: PublicIcon },
  { key: 'corporate', label: 'Corporate / Sponsored', icon: CorporateFareIcon },
];

export function BuildYourEvent() {
  const [step, setStep] = useState(1);
  const [eventType, setEventType] = useState<string | null>(null);
  const [budget, setBudget] = useState<number>(1000);
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
        const mapped = (Array.isArray(data) ? data : []).map((item: any) => ({
          id: item.id,
          title: item.name || item.title,
          category: item.category,
          average_price: item.average_price || item.price || 0,
          image_url: item.image_url || 'https://via.placeholder.com/150',
          description: item.description || 'No description available.',
        }));
        setAllGames(mapped);
      })
      .catch(console.error);
  }, []);

  const totalCost = Object.entries(selectedGames).reduce((acc, [id, qty]) => {
    const game = allGames.find(g => g.id === Number(id));
    return acc + (game ? game.average_price * qty : 0);
  }, 0);

  const totalGamesCount = Object.values(selectedGames).reduce((a, b) => a + b, 0);
  const remainingBudget = budget - totalCost;

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
    if (budget < 500) return "Good for small, intimate gatherings.";
    if (budget < 2000) return "Great for mid-size events with a few key attractions.";
    if (budget < 5000) return "Perfect for large events with diverse entertainment.";
    return "Excellent for massive, premium experiences.";
  };

  const getAISuggestion = () => {
    if (totalGamesCount === 0) return "You haven't selected any games yet! Pick a few to get started.";
    if (remainingBudget > budget * 0.5) return `You still have plenty of budget left. Consider adding a premium game for ${EVENT_TYPES.find(e => e.key === eventType)?.label} to increase engagement!`;
    if (totalGamesCount < 3) return "Adding 1 or 2 more interactive games can dramatically improve the attendee experience.";
    return "Great selection! Your choices align perfectly with a balanced event experience.";
  };

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

    const msg = `Hi! I'm planning an event via the AI Assistant.

*Event Type:* ${EVENT_TYPES.find(e => e.key === eventType)?.label || 'N/A'}
*Budget:* $${budget}
*Est. Cost:* $${totalCost.toFixed(2)}

*Selected Games:*
${selectedGamesText || 'None'}

*Client Info:*
Name: ${bookingName}
Phone: ${bookingPhone}
Notes: ${contactDetails.notes || 'N/A'}`;

    const link = `https://wa.me/96170420110?text=${encodeURIComponent(msg)}`;
    window.open(link, '_blank');
  };

  return (
    <>
    <div className="bg-[#f8f9fa] min-h-screen pb-16 font-sans">
      
      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${step >= i ? 'bg-[#1a2332] text-white' : 'bg-gray-100 text-gray-400'}`}>
                  {i}
                </div>
                {i < 5 && (
                  <div className={`h-1 w-8 sm:w-16 mx-2 rounded ${step > i ? 'bg-[#1a2332]' : 'bg-gray-100'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 mt-10">
        <AnimatePresence mode="wait">
          
          {/* STEP 1: Event Type */}
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="text-center mb-8">
                <h1 className="text-2xl font-black text-[#1a2332] mb-2">What kind of event are you planning?</h1>
                <p className="text-gray-500 text-sm">Select one to get started.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {EVENT_TYPES.map(et => {
                  const Icon = et.icon;
                  return (
                    <motion.button key={et.key} onClick={() => { setEventType(et.key); setStep(2); }}
                      className={`p-5 rounded-2xl border text-left bg-white shadow-sm transition-all flex flex-col items-center justify-center gap-3 hover:border-[#E53935] hover:shadow-md ${eventType === et.key ? 'border-[#E53935] ring-1 ring-[#E53935]' : 'border-gray-100'}`}
                      whileTap={{ scale: 0.98 }}>
                      <Icon className={eventType === et.key ? 'text-[#E53935]' : 'text-[#1a2332]'} style={{ fontSize: 32 }} />
                      <span className="font-bold text-sm text-[#1a2332]">{et.label}</span>
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
                <h1 className="text-2xl font-black text-[#1a2332] mb-2">Set your target budget</h1>
                <p className="text-gray-500 text-sm">We'll help you stay within this range.</p>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex flex-col items-center">
                  <span className="text-4xl font-black text-[#E53935] mb-2">${budget}</span>
                  <p className="text-xs font-bold text-gray-400 mb-8 uppercase tracking-wide">{getBudgetFeedback()}</p>
                  
                  <input type="range" min="100" max="15000" step="100" value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="w-full accent-[#E53935] h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                  
                  <div className="w-full flex justify-between text-xs text-gray-400 font-bold mt-3">
                    <span>$100</span>
                    <span>$15,000+</span>
                  </div>
                </div>

                <div className="mt-10 flex justify-between">
                  <button onClick={() => setStep(1)} className="px-5 py-2.5 text-sm font-bold text-gray-500 flex items-center gap-2 hover:bg-gray-50 rounded-xl transition-colors"><ArrowBackIcon fontSize="small"/> Back</button>
                  <button onClick={() => setStep(3)} className="px-6 py-2.5 rounded-xl text-white font-bold text-sm bg-[#1a2332] hover:bg-[#2c3a52] transition-colors flex items-center gap-2 shadow-md">
                    Next <ArrowForwardIcon fontSize="small" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Game Selection */}
          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              
              {/* Live Budget Warning */}
              {remainingBudget < budget * 0.1 && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-600 text-sm font-semibold">
                  <InfoIcon fontSize="small" /> Almost reached your budget limit!
                </div>
              )}

              {/* Live Budget Dashboard */}
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex justify-between items-center sticky top-20 z-40">
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400">Total Selection</p>
                  <p className="text-xl font-black text-[#1a2332]">{totalGamesCount} Games</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase font-bold text-gray-400">Total Price / Day</p>
                  <p className={`text-xl font-black ${remainingBudget < 0 ? 'text-[#E53935]' : 'text-green-600'}`}>
                    ${totalCost.toFixed(2)}
                  </p>
                  <p className="text-[10px] font-bold text-gray-400">Budget: ${budget}</p>
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
                          <img src={game.image_url} alt={game.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 flex flex-col justify-center">
                          <h3 className="text-sm font-black text-[#1a2332] line-clamp-1">{game.title}</h3>
                          <p className="text-xs font-bold text-[#E53935] mb-2">${game.average_price} <span className="text-gray-400 font-normal">/ day</span></p>
                          <div className="flex justify-between items-center">
                            <button onClick={() => setExpandedGame(isExpanded ? null : game.id)} className="text-[10px] font-bold text-gray-500 underline">
                              {isExpanded ? 'Hide Details' : 'View Details'}
                            </button>
                            <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1 border border-gray-100">
                              <button onClick={() => handleGameSelect(game.id, -1)} className="w-6 h-6 rounded flex items-center justify-center bg-white shadow-sm text-gray-600 hover:text-[#E53935]"><RemoveIcon sx={{ fontSize: 14 }} /></button>
                              <span className="text-xs font-bold w-4 text-center">{qty}</span>
                              <button onClick={() => handleGameSelect(game.id, 1)} className="w-6 h-6 rounded flex items-center justify-center bg-white shadow-sm text-gray-600 hover:text-green-600"><AddIcon sx={{ fontSize: 14 }} /></button>
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
                <button onClick={() => setStep(2)} className="px-5 py-2.5 text-sm font-bold text-gray-500 flex items-center gap-2 hover:bg-gray-50 rounded-xl transition-colors"><ArrowBackIcon fontSize="small"/> Back</button>
                <button onClick={() => setStep(4)} className="px-6 py-2.5 rounded-xl text-white font-bold text-sm bg-[#1a2332] hover:bg-[#2c3a52] transition-colors flex items-center gap-2 shadow-md">
                  Continue <ArrowForwardIcon fontSize="small" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: AI Suggestions */}
          {step === 4 && (
            <motion.div key="s4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center">
                <div className="w-16 h-16 bg-[#E53935] bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AutoAwesomeIcon className="text-[#E53935]" fontSize="large" />
                </div>
                <h2 className="text-2xl font-black text-[#1a2332] mb-4">Great selection</h2>
                
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 mb-8 inline-block max-w-md">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {getAISuggestion()}
                  </p>
                </div>

                <div className="flex justify-between items-center max-w-sm mx-auto">
                  <button onClick={() => setStep(3)} className="px-5 py-2.5 text-sm font-bold text-gray-500 flex items-center gap-2 hover:bg-gray-50 rounded-xl transition-colors"><ArrowBackIcon fontSize="small"/> Back</button>
                  <button onClick={() => setStep(5)} className="px-6 py-2.5 rounded-xl text-white font-bold text-sm bg-[#1a2332] hover:bg-[#2c3a52] transition-colors flex items-center gap-2 shadow-md">
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
                <h1 className="text-2xl font-black text-[#1a2332] mb-2">Final Details</h1>
                <p className="text-gray-500 text-sm">Where should we send your custom quote?</p>
              </div>

              <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Full Name</label>
                    <input type="text" placeholder="John Doe" value={contactDetails.name} onChange={e => setContactDetails({...contactDetails, name: e.target.value})} disabled={!!getStoredUser()} className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-[#1a2332] focus:bg-white transition-colors outline-none text-sm font-medium disabled:opacity-70" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Phone Number</label>
                    <input type="tel" placeholder="+961 70 000 000" value={contactDetails.phone} onChange={e => setContactDetails({...contactDetails, phone: e.target.value})} disabled={!!getStoredUser()} className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-[#1a2332] focus:bg-white transition-colors outline-none text-sm font-medium disabled:opacity-70" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Optional Notes</label>
                    <textarea placeholder="Any special requests?" rows={3} value={contactDetails.notes} onChange={e => setContactDetails({...contactDetails, notes: e.target.value})} className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-[#1a2332] focus:bg-white transition-colors outline-none text-sm font-medium resize-none" />
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <button onClick={() => setStep(4)} className="px-5 py-2.5 text-sm font-bold text-gray-500 flex items-center gap-2 hover:bg-gray-50 rounded-xl transition-colors w-full sm:w-auto justify-center"><ArrowBackIcon fontSize="small"/> Back</button>
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

