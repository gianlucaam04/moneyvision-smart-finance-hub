self.addEventListener('install', (event) => {
  const CACHE = 'mv-app-shell-v1';
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE);
        await cache.addAll(['/','/index.html','/manifest.webmanifest']);
      } finally {
        self.skipWaiting();
      }
    })()
  );
});

self.addEventListener('activate', (event) => {
  const KEEP = 'mv-app-shell-v1';
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(names.filter((n) => n !== KEEP).map((n) => caches.delete(n)));
      await self.clients.claim();
    })()
  );
});

// Helper: open or focus a URL
async function openOrFocus(url) {
  const allClients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
  for (const client of allClients) {
    if ('focus' in client && client.url && client.url.includes(new URL(url, self.registration.scope).pathname)) {
      client.focus();
      return;
    }
  }
  await self.clients.openWindow(url);
}

// Navigation handling: network-first with app-shell fallback
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);
  const isNavigate = req.mode === 'navigate';
  const isAPI = url.pathname.startsWith('/api/') || url.pathname.includes('/functions/');
  if (!isNavigate || isAPI) return; // let non-navigation/API requests pass through

  event.respondWith((async () => {
    try {
      const res = await fetch(req);
      if (!res || res.status >= 500) throw new Error('server error');
      return res;
    } catch (_e) {
      const cache = await caches.open('mv-app-shell-v1');
      const cached = await cache.match('/index.html');
      return cached || Response.error();
    }
  })());
});

self.addEventListener('push', (event) => {
  try {
    const data = event.data ? event.data.json() : {};
    const title = '';
    const body = data.body || 'Hai aggiornato oggi le tue spese?\nApri l\'app e tieni tutto sotto controllo.';

    // Allow server to customize visuals & behavior via payload
    const options = {
      body,
      icon: data.icon,
      badge: data.badge,
      tag: data.tag || 'moneyvision-daily',
      renotify: data.renotify ?? true,
      data: {
        url: (data.data && data.data.url) || '/dashboard',
        ...data.data,
      },
      actions: data.actions || [],
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch (e) {
    event.waitUntil(self.registration.showNotification('', { body: 'Hai una nuova notifica.' }));
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const action = event.action;
  const url = (event.notification && event.notification.data && event.notification.data.url) || '/dashboard';
  const targetUrl = action === 'add-expense' ? '/transactions/new' : url;

  event.waitUntil(openOrFocus(targetUrl));
});
