import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop Component
 * 
 * Automatically resets the scroll position to the top of the page 
 * whenever the route changes. This provides a better user experience 
 * by ensuring new pages start from the top.
 */
export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Reset scroll position to top
    window.scrollTo(0, 0);
    
    // For older browsers or specific containers that might not respond to window.scrollTo
    document.documentElement.scrollTo(0, 0);
    document.body.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
