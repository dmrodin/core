const OFFLINE_URL = '/offline';

self.addEventListener('install', async (event) => {
    event.waitUntil(caches.open('static-offline').then((cache) => cache.add(OFFLINE_URL)));
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        (async () => {
            if (self.registration.navigationPreload) {
                await self.registration.navigationPreload.enable();
            }
            await self.clients.claim();
        })(),
    );
});

self.addEventListener('fetch', (event) => {
    if (event.request.mode === 'navigate') {
        event.respondWith(
            (async () => {
                try {
                    const preload = await event.preloadResponse;
                    if (preload) return preload;

                    return await fetch(event.request);
                } catch {
                    return caches.match(OFFLINE_URL);
                }
            })(),
        );
    }
});
