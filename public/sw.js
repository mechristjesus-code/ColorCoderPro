// 144,000 Color Project — Terminal PWA Service Worker
// Keeps the terminal shell available offline and caches admin API responses.

const CACHE_NAME = 'colorterm-v1';
const SHELL_URLS = [
  '/terminal',
  '/icon-192.png',
  '/icon-512.png',
  '/manifest.json',
];

// Install: pre-cache the terminal shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_URLS))
  );
  self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch strategy:
//  - /terminal page and static assets → cache-first (works offline)
//  - /api/admin/* → network-only (always live, never stale)
//  - Everything else → network-first, fall back to cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Admin API — always network, never cache
  if (url.pathname.startsWith('/api/admin/')) {
    event.respondWith(fetch(request));
    return;
  }

  // Terminal shell + icons — cache first
  if (SHELL_URLS.some((u) => url.pathname === u || url.pathname.startsWith('/_next/'))) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((res) => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return res;
        });
      })
    );
    return;
  }

  // Default — network first
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});
