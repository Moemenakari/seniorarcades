import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import './index.css';
import App from './app/App';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

const tree = (
  <React.StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>
);

// Pre-rendered pages arrive with their markup already in place; hydrating
// reuses it instead of throwing it away and painting the page a second time.
if (rootElement.hasChildNodes()) {
  hydrateRoot(rootElement, tree);
} else {
  createRoot(rootElement).render(tree);
}
