const CACHE_NAME         = 'app-shell-v1';
const DYNAMIC_CACHE_NAME = 'dynamic-content-v1';

const ASSETS = [
    '/',
    '/index.html',
    '/app.js',
    '/manifest.json',
    '/icons/favicon.ico',
    '/icons/favicon-16x16.png',
    '/icons/favicon-32x32.png',
    '/icons/favicon-48x48.png',
    '/icons/favicon-64x64.png',
    '/icons/favicon-128x128.png',
    '/icons/favicon-256x256.png',
    '/icons/favicon-512x512.png',
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => Promise.all(
            keys
                .filter(k => k !== CACHE_NAME && k !== DYNAMIC_CACHE_NAME)
                .map(k => caches.delete(k))
        )).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);

    if (url.origin !== location.origin) return;

    if (url.pathname.startsWith('/socket.io/') ||
        url.pathname.startsWith('/subscribe') ||
        url.pathname.startsWith('/unsubscribe') ||
        url.pathname.startsWith('/vapid-public-key') ||
        url.pathname.startsWith('/snooze')) return;

    if (url.pathname.startsWith('/content/')) {
        event.respondWith(
            fetch(event.request, { cache: 'no-cache' })
                .then(networkRes => {
                    const clone = networkRes.clone();
                    caches.open(DYNAMIC_CACHE_NAME)
                        .then(cache => cache.put(event.request, clone));
                    return networkRes;
                })
                .catch(() =>
                    caches.match(event.request).then(cached => {
                        if (cached) return cached;
                        return new Response('<p style="color:#f87171;text-align:center;padding:40px">Нет соединения</p>', {
                            headers: { 'Content-Type': 'text/html' }
                        });
                    })
                )
        );
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(cached => cached || fetch(event.request))
    );
});

self.addEventListener('push', event => {
    let data = { title: 'Новое уведомление', body: '', reminderId: null };
    if (event.data) {
        data = event.data.json();
    }

    const options = {
        body:  data.body,
        icon:  '/icons/favicon-128x128.png',
        badge: '/icons/favicon-48x48.png',
        data:  { reminderId: data.reminderId }
    };

    // Кнопка «Отложить» только для напоминаний
    if (data.reminderId) {
        options.actions = [
            { action: 'snooze', title: 'Отложить на 5 минут' }
        ];
    }

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

self.addEventListener('notificationclick', event => {
    const notification = event.notification;
    const action       = event.action;

    if (action === 'snooze') {
        const reminderId = notification.data.reminderId;
        event.waitUntil(
            fetch(`/snooze?reminderId=${reminderId}`, { method: 'POST' })
                .then(() => notification.close())
                .catch(err => console.error('Snooze failed:', err))
        );
    } else {
        notification.close();
        event.waitUntil(clients.openWindow('/'));
    }
});
