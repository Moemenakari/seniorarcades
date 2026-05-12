import React, { useState } from 'react';
import { motion } from 'framer-motion';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import StarIcon from '@mui/icons-material/Star';
import SendIcon from '@mui/icons-material/Send';

export function AboutUs() {
  const [showQuickForm, setShowQuickForm] = useState(false);
  const [quickForm, setQuickForm] = useState({ name: '', phone: '' });

  const handleWhatsApp = () => {
    const waMsg = 'Hello! I am contacting you from the Next Level Game website. I would like to request an event.';
    const details = showQuickForm && quickForm.name ? `\nMy name is: ${quickForm.name}\nMy phone is: ${quickForm.phone}` : '';
    const waLink = `https://wa.me/96103919876?text=${encodeURIComponent(waMsg + details)}`;
    window.open(waLink, '_blank');
  };

  return (
    <div className="bg-[#f8f9fb] min-h-screen pb-16 font-sans">
      {/* SECTION 1: ABOUT NEXT LEVEL GAME */}
      <section className="bg-[#1a2332] py-20 px-4 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-5xl font-black text-white mb-10" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            About <span className="text-[#E53935]">Next Level Game</span>
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-sm border border-white/10">
              <h3 className="text-[#FFD700] text-xl font-bold mb-3 uppercase tracking-wider">Our Vision</h3>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                "To be the leading provider of arcade entertainment across Lebanon, bringing joy and excitement to every corner of the country."
              </p>
            </div>
            
            <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-sm border border-white/10">
              <h3 className="text-[#FFD700] text-xl font-bold mb-3 uppercase tracking-wider">Our Mission</h3>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                "Supplying the best arcade machines for sale and rent, transforming festivals and events into unforgettable high-energy gaming zones."
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* SECTION 2: CONTACT & RATING */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-10 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Contact Information */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 flex flex-col gap-6 justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: 'Montserrat, sans-serif', color: '#1a2332' }}>Get In Touch</h2>
              <div className="flex flex-col gap-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0 text-[#E53935]">
                    <PhoneIcon />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-0.5">Phone Number</h4>
                    <p className="text-base font-semibold text-[#1a2332]">03 919 876</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0 text-[#25D366]">
                    <WhatsAppIcon />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-0.5">Direct Message</h4>
                    <button onClick={handleWhatsApp} className="text-base font-semibold text-[#25D366] hover:underline text-left">
                      Chat on WhatsApp
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100">
              <h4 className="text-sm font-bold text-[#1a2332] mb-3">User Rating</h4>
              <div className="flex items-center gap-2">
                <div className="flex text-[#FFD700]">
                  <StarIcon /> <StarIcon /> <StarIcon /> <StarIcon /> <StarIcon />
                </div>
                <span className="font-bold text-[#1a2332] text-lg">5.0</span>
                <span className="text-gray-400 text-sm">(120+ Reviews)</span>
              </div>
            </div>
          </motion.div>

          {/* Request Event Section */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 flex flex-col justify-center items-center text-center">
            
            <div className="w-16 h-16 bg-[#1a2332] rounded-2xl flex items-center justify-center mb-6 text-[#FFD700] rotate-12 shadow-lg">
              <SendIcon style={{ fontSize: 32 }} />
            </div>
            
            <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Montserrat, sans-serif', color: '#1a2332' }}>Request an Event</h2>
            <p className="text-gray-500 mb-8 text-sm">Skip the complex forms. Just send us a quick WhatsApp message and we'll handle the rest!</p>
            
            {!showQuickForm ? (
              <div className="flex flex-col gap-3 w-full max-w-xs mx-auto">
                <button onClick={() => setShowQuickForm(true)} className="w-full py-3.5 bg-gray-100 hover:bg-gray-200 text-[#1a2332] rounded-xl font-bold text-sm transition-all">
                  Leave my Name & Phone
                </button>
                <button onClick={handleWhatsApp} className="w-full py-3.5 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-500/30">
                  <WhatsAppIcon /> Direct Request
                </button>
              </div>
            ) : (
              <div className="w-full max-w-sm mx-auto space-y-4 animate-in fade-in slide-in-from-bottom-4">
                <input type="text" placeholder="Your Name" value={quickForm.name} onChange={e => setQuickForm({...quickForm, name: e.target.value})} className="w-full px-4 py-3 bg-gray-50 text-sm rounded-xl border border-gray-200 focus:bg-white focus:border-[#E53935] outline-none transition-all" />
                <input type="tel" placeholder="Your Phone Number" value={quickForm.phone} onChange={e => setQuickForm({...quickForm, phone: e.target.value})} className="w-full px-4 py-3 bg-gray-50 text-sm rounded-xl border border-gray-200 focus:bg-white focus:border-[#E53935] outline-none transition-all" />
                <div className="flex gap-2">
                  <button onClick={() => setShowQuickForm(false)} className="px-4 py-3 bg-gray-100 text-gray-500 rounded-xl font-bold text-sm hover:bg-gray-200 transition-all">Back</button>
                  <button onClick={handleWhatsApp} className="flex-1 py-3 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-500/30">
                    <WhatsAppIcon /> Send via WhatsApp
                  </button>
                </div>
              </div>
            )}
            
          </motion.div>
        </div>
      </div>
    </div>
  );
}

