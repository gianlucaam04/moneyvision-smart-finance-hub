self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  try {
    const data = event.data ? event.data.json() : {};
    const title = data.title || 'MoneyVision';
    const body = data.body || 'Nuova notifica';
    const options = {
      body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      data: data.data || {},
    };
    event.waitUntil(self.registration.showNotification(title, options));
  } catch (e) {
    event.waitUntil(self.registration.showNotification('MoneyVision', { body: 'Nuova notifica' }));
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clientsArr) => {
      const hadWindow = clientsArr.some((windowClient) => {
        if (windowClient.url.includes(url)) {
          windowClient.focus();
          return true;
        }
        return false;
      });
      if (!hadWindow) {
        return self.clients.openWindow(url);
      }
    })
  );
});
