self.addEventListener('install', e => {
  e.waitUntil(
    caches.open('photo-bridge-cache').then(cache => {
      return cache.addAll([
        '/',
        '/index.html',
        '/socket.io/socket.io.js'
      ]);
    })
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(response => {
      return response || fetch(e.request);
    })
  );
});
