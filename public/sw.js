// sw.js - Service worker mínimo para que la app sea instalable como PWA.
// No busca ofrecer soporte offline completo: solo cachea assets estáticos
// propios (íconos, audio) con estrategia cache-first; todo lo demás (HTML,
// JS/CSS con hash de build, llamadas a la API) va directo a la red.
const CACHE_NAME = 'pomodoro-cache-v1';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const isStaticAsset =
    url.origin === self.location.origin && (url.pathname.startsWith('/icons/') || url.pathname.startsWith('/audio/'));
  if (!isStaticAsset) return;

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(event.request);
      if (cached) return cached;
      const response = await fetch(event.request);
      if (response.ok) cache.put(event.request, response.clone());
      return response;
    }),
  );
});
