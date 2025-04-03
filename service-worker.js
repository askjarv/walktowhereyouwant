const CACHE_NAME = 'steps-tracker-v1';
const BASE_URL = 'https://askjarv.github.io/walktowhereyouwant/';
const urlsToCache = [
    BASE_URL,
    BASE_URL + 'index.html',
    BASE_URL + 'styles.css',
    BASE_URL + 'app.js',
    BASE_URL + 'config.js',
    BASE_URL + 'manifest.json',
    BASE_URL + 'icons/icon-192x192.png',
    BASE_URL + 'icons/icon-512x512.png'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
}); 