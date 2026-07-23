// Minimal service worker — just enough to satisfy installability requirements.
self.addEventListener('install', (e) => self.skipWaiting());
self.addEventListener('activate', (e) => self.clients.claim());
self.addEventListener('fetch', (e) => {
  // Network-first, no offline caching of live data (drive times must stay fresh).
  e.respondWith(fetch(e.request).catch(() => new Response('Offline', { status: 503 })));
});
