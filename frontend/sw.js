// Minimal service worker. Its only job right now is to make Patterns
// installable, which is what makes the "Share → Patterns" shortcut show
// up in Android's share sheet once this is live and someone adds it to
// their home screen. No offline caching yet — add that in a later pass
// once the API itself has a production URL to cache against.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', () => { /* pass-through, no caching yet */ });
