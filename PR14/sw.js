const CACHE_NAME = 'tasks-cache-v2';

self.addEventListener('install', event => {
    const base = self.registration.scope; // http://127.0.0.1:5500/PR14/
    const ASSETS = [
        base,
        base + 'index.html',
        base + 'app.js',
        base + 'manifest.json',
        base + 'icons/favicon.ico',
        base + 'icons/favicon-16x16.png',
        base + 'icons/favicon-32x32.png',
        base + 'icons/favicon-48x48.png',
        base + 'icons/favicon-64x64.png',
        base + 'icons/favicon-128x128.png',
        base + 'icons/favicon-256x256.png',
        base + 'icons/favicon-512x512.png',
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
