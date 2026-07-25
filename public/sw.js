// Service worker di dismissione.
// La vecchia PWA MoneyVision registrava un SW con cache dell'app-shell e
// handler per le Web Push. Questo file lo sostituisce e si auto-rimuove:
// svuota tutte le cache, si deregistra e ricarica le pagine aperte.
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(names.map((n) => caches.delete(n)));
      await self.registration.unregister();
      const clients = await self.clients.matchAll({ type: 'window' });
      for (const client of clients) {
        client.navigate(client.url);
      }
    })()
  );
});
