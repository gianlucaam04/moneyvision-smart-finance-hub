self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
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
