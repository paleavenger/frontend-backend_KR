const CACHE_NAME = 'tasks-cache-v1';

self.addEventListener('install', event => {
    const base = self.registration.scope; // http://127.0.0.1:5500/PR13/
    const ASSETS = [
        base,
        base + 'index.html',
        base + 'app.js',
    ];
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys
                    .filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(cached => cached || fetch(event.request))
    );
});
