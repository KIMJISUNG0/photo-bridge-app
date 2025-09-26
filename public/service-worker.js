// 간단 캐시 (Socket.IO는 절대 캐시하지 않음)
const CACHE = 'photo-bridge-cache-v2';
const PRECACHE = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  // Socket.IO와 CDN은 캐시 개입 금지 (네트워크 우선)
  if (url.pathname.startsWith('/socket.io/') || url.hostname === 'cdn.socket.io') {
    return; // 브라우저 기본 네트워크 처리
  }
  e.respondWith(
    caches.match(e.request).then((resp) => resp || fetch(e.request))
  );
});
