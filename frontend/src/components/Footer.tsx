/**
 * ============================================================
 * FOOTER COMPONENT
 * ============================================================
 * Final Graduation Project Refactor
 * Purpose: Application footer containing branding, contact
 * information, social links, and copyright details.
 * Features: Multi-column responsive layout and trust markers.
 * ============================================================
 */

import React, { useState } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Instagram,
  Facebook,
} from "lucide-react";
import { AuthModal } from './AuthModal';
import { clearSession, getAuthToken } from '../utils/authSession';

import logo from '../assets/logo.png';

export function Footer() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const token = getAuthToken();

  const handleLogout = () => {
    clearSession();
    window.location.reload();
  };

  return (
    <footer
      className="py-8 sm:py-12 text-white pb-12 sm:pb-14"
      style={{ backgroundColor: "#1a2332" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
          
          {/* =============================
              1. BRANDING & ABOUT
              ============================= */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src={logo} alt="Next Level Game" className="w-10 h-10 object-contain" />
              <h3
                className="text-lg sm:text-xl"
                style={{
                  fontFamily: "Montserrat, sans-serif",
                  fontWeight: 700,
                  color: "#FFD700",
                }}
              >
                Next Level Game
              </h3>
            </div>
            <p
              className="mb-3 text-xs sm:text-sm"
              style={{
                fontFamily: "Open Sans, sans-serif",
                fontWeight: 400,
                lineHeight: "1.6",
              }}
            >
              Lebanon's premier arcade entertainment provider,
              creating unforgettable experiences at events
              nationwide.
            </p>
          </div>

          {/* =============================
              2. CONTACT INFORMATION
              ============================= */}
          <div>
            <h4
              className="text-base sm:text-lg mb-3"
              style={{
                fontFamily: "Montserrat, sans-serif",
                fontWeight: 600,
              }}
            >
              Contact Us
            </h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Phone
                  className="w-5 h-5"
                  style={{ color: "#FFD700" }}
                />
                <span
                  style={{
                    fontFamily: "Open Sans, sans-serif",
                    fontWeight: 400,
                  }}
                >
                  03 919 876
                </span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin
                  className="w-5 h-5"
                  style={{ color: "#FFD700" }}
                />
                <span
                  style={{
                    fontFamily: "Open Sans, sans-serif",
                    fontWeight: 400,
                  }}
                >
                  Lebanon
                </span>
              </div>
            </div>
          </div>

          {/* =============================
              3. SOCIAL MEDIA LINKS
              ============================= */}
          <div>
            <h4
              className="text-base sm:text-lg mb-3"
              style={{
                fontFamily: "Montserrat, sans-serif",
                fontWeight: 600,
              }}
            >
              Follow Us
            </h4>
            <div className="flex flex-wrap gap-4">
              <a
                href="https://www.instagram.com/nextlevelgame_arcades?igsh=MjlrdnBrZnV4MDU5"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                style={{ backgroundColor: "#E1306C" }}
              >
                <Instagram className="w-6 h-6" />
              </a>
              <a
                href="https://www.facebook.com/share/1MNRtAGgC7/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                style={{ backgroundColor: "#1877F2" }}
              >
                <Facebook className="w-6 h-6" />
              </a>
              <a
                href="https://www.tiktok.com/@next.level.game.arcades?_r=1&_t=ZS-968DwykJbZx"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                style={{ backgroundColor: "#000000" }}
              >
                <span className="font-bold text-lg"> TikTok </span>
              </a>
            </div>
            <div className="mt-4">
              {token ? (
                <button onClick={handleLogout} className="px-4 py-2 rounded-lg text-sm font-bold border border-[#FFD700] text-[#FFD700] hover:bg-white/10">
                  Logout
                </button>
              ) : (
                <button onClick={() => setIsAuthOpen(true)} className="px-4 py-2 rounded-lg text-sm font-bold bg-[#FFD700] text-[#1a2332] hover:opacity-90">
                  Login
                </button>
              )}
            </div>
          </div>
        </div>

        {/* =============================
            5. LEGAL & FOOTER BOTTOM
            ============================= */}
        <div className="border-t border-white/20 mt-8 sm:mt-12 pt-6 sm:pt-8 text-center">
          <p
            style={{
              fontFamily: "Open Sans, sans-serif",
              fontWeight: 400,
              fontSize: "13px",
              color: "rgba(255,255,255,0.5)",
            }}
          >
            © 2026 Next Level Game. All rights reserved. ·
            Elevating Entertainment Experiences Across Lebanon
          </p>
        </div>
      </div>
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} onSuccess={() => { setIsAuthOpen(false); window.location.reload(); }} />
    </footer>
  );
}