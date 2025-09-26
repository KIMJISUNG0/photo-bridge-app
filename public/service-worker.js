--- a/public/service-worker.js
+++ b/public/service-worker.js
@@
-self.addEventListener('install', e => {
-  e.waitUntil(
-    caches.open('photo-bridge-cache').then(cache => {
-      return cache.addAll([
-        '/',
-        '/index.html',
-        '/socket.io/socket.io.js'
-      ]);
-    })
-  );
-});
+const CACHE = 'photo-bridge-cache-v2';
+
+self.addEventListener('install', (e) => {
+  e.waitUntil(
+    caches.open(CACHE).then((cache) => {
+      return cache.addAll([
+        '/',
+        '/index.html',
+        '/manifest.json'
+      ]);
+    })
+  );
+});
+
+self.addEventListener('activate', (e) => {
+  e.waitUntil(
+    caches.keys().then(keys =>
+      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
+    )
+  );
+});
 
-self.addEventListener('fetch', e => {
-  e.respondWith(
-    caches.match(e.request).then(response => {
-      return response || fetch(e.request);
-    })
-  );
-});
+self.addEventListener('fetch', (e) => {
+  const url = new URL(e.request.url);
+  // ❗ Socket.IO 및 CDN 은 캐시 개입 금지 (네트워크 우선)
+  if (url.pathname.startsWith('/socket.io/') || url.hostname === 'cdn.socket.io') {
+    return; // 기본 네트워크 처리
+  }
+  e.respondWith(
+    caches.match(e.request).then((resp) => resp || fetch(e.request))
+  );
+});
