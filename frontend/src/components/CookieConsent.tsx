import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, X } from 'lucide-react';

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'true');
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:w-80 z-[100]"
        >
          <div className="bg-[#1a2332] border border-white/10 rounded-xl p-4 shadow-2xl backdrop-blur-xl">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-[#FFD700]/10 rounded-lg shrink-0">
                <ShieldCheck className="w-5 h-5 text-[#FFD700]" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-bold text-base mb-1">Cookies</h3>
                <p className="text-gray-400 text-xs leading-tight mb-3">
                  We use cookies to improve your experience. By clicking "Accept", you agree to our use of cookies.
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleAccept}
                    className="flex-1 bg-[#FFD700] text-[#1a2332] font-bold py-1.5 rounded-lg hover:opacity-90 transition-opacity text-xs"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => setIsVisible(false)}
                    className="px-3 py-1.5 text-gray-400 hover:text-white transition-colors text-xs font-medium"
                  >
                    Decline
                  </button>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setIsVisible(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
