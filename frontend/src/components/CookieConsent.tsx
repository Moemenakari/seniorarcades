import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, X } from 'lucide-react';

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem('nlg_storage_notice_seen');
    if (!seen) {
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem('nlg_storage_notice_seen', 'true');
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
                <h3 className="text-white font-bold text-base mb-1">Your data</h3>
                <p className="text-gray-400 text-xs leading-tight mb-3">
                  This site uses no tracking cookies and no advertising. If you log in, your session is
                  stored on this device only, so you stay signed in.
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={dismiss}
                    className="flex-1 bg-[#FFD700] text-[#1a2332] font-bold py-1.5 rounded-lg hover:opacity-90 transition-opacity text-xs"
                  >
                    Got it
                  </button>
                </div>
              </div>
            </div>
            <button
              onClick={dismiss}
              aria-label="Dismiss notice"
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
