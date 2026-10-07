import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import './index.css';
import './styles/site.css';
import { findRoute } from './site/routes';

const route = findRoute(window.location.pathname);
const container = document.getElementById('root')!;
const app = (
  <StrictMode>
    <route.Component />
  </StrictMode>
);

// Pre-rendered pages arrive with markup, so React attaches to it. In `vite dev`
// the page is empty and React renders it from scratch.
if (container.firstElementChild) {
  hydrateRoot(container, app);
} else {
  if (!document.title) document.title = route.title;
  createRoot(container).render(app);
}

// The old PWA registered a service worker that cached the app shell. public/sw.js
// replaces it with one that clears the caches and unregisters itself, so it is
// registered once more here to run. It can be removed when old clients are gone.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Registration can fail on browsers that block workers. Nothing depends on it.
    });
  });
}
