import { Outlet } from 'react-router-dom';
import { Navigation } from './Navigation';
import { Footer } from './Footer';
import { CookieConsent } from './CookieConsent';

export function Layout() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <Outlet />
      <Footer />
      <CookieConsent />
    </div>
  );
}
