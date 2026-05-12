import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../assets/logo.png';

const NAV_LINKS = [
  { label: 'Home', path: '/' },
  { label: 'Catalog', path: '/catalog' },
  { label: 'Services', path: '/services' },
  { label: 'About Us', path: '/about' },
  { label: 'Sponsorship', path: '/sponsorship' },
  { label: 'Build Your Event', path: '/build-your-event', highlight: true },
];

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12 sm:h-14">

          {/* Brand */}
          <Link to="/" className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
            <img src={logo} alt="Next Level Game" className="w-8 h-8 sm:w-10 sm:h-10 object-contain" />
            <span className="text-sm sm:text-lg" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800, color: '#1a2332' }}>
              Next Level Game
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map(link => (
              link.highlight ? (
                <Link key={link.path} to={link.path}>
                  <button className="ml-2 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 hover:shadow-lg hover:scale-105"
                    style={{ backgroundColor: '#FFD700', color: '#1a2332', fontFamily: 'Open Sans, sans-serif' }}>
                    {link.label}
                  </button>
                </Link>
              ) : (
                <Link key={link.path} to={link.path}>
                  <button className="px-3 py-2 rounded-lg text-sm transition-colors duration-200 hover:bg-gray-50"
                    style={{
                      fontFamily: 'Open Sans, sans-serif', fontWeight: 600,
                      color: isActive(link.path) ? '#E53935' : '#1a2332',
                      borderBottom: isActive(link.path) ? '2px solid #E53935' : '2px solid transparent',
                    }}>
                    {link.label}
                  </button>
                </Link>
              )
            ))}
          </div>

          {/* Tablet links (condensed) */}
          <div className="hidden md:flex lg:hidden items-center gap-1">
            {NAV_LINKS.slice(0, 3).map(link => (
              <Link key={link.path} to={link.path}>
                <button className="px-2 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                  style={{ color: isActive(link.path) ? '#E53935' : '#1a2332', fontFamily: 'Open Sans, sans-serif' }}>
                  {link.label}
                </button>
              </Link>
            ))}
            <Link to="/build-your-event">
              <button className="ml-1 px-3 py-1.5 rounded-lg text-xs font-bold"
                style={{ backgroundColor: '#FFD700', color: '#1a2332', fontFamily: 'Open Sans, sans-serif' }}>
                Build Event
              </button>
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            style={{ color: '#1a2332' }}>
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <div className="px-4 py-3 space-y-1">
            {NAV_LINKS.map(link => (
              <Link key={link.path} to={link.path} onClick={() => setIsMenuOpen(false)}>
                <button className={`block w-full text-left px-3 py-2.5 rounded-lg transition-colors hover:bg-gray-50 ${link.highlight ? 'font-black' : 'font-semibold'}`}
                  style={{
                    fontFamily: 'Open Sans, sans-serif',
                    color: link.highlight ? '#1a2332' : (isActive(link.path) ? '#E53935' : '#1a2332'),
                    backgroundColor: link.highlight ? 'rgba(255,215,0,0.15)' : undefined,
                  }}>
                  {link.label}
                </button>
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}