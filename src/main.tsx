import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(<App />);

// Il vecchio service worker della PWA va rimosso dai browser che l'hanno già
// registrato, altrimenti continuerebbe a servire la app-shell dalla cache.
// sw.js si auto-deregistra: qui lo registriamo un'ultima volta per attivarlo.
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // ignora errori di registrazione
    });
  });
}
