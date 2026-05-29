const CACHE = 'dziennik-v2.0';
const FILES = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png'
];

// Install event - cache all files
self.addEventListener('install', e => {
  console.log('[SW] Installing...');
  e.waitUntil(
    caches.open(CACHE)
      .then(cache => {
        console.log('[SW] Caching files:', FILES);
        return cache.addAll(FILES);
      })
      .then(() => {
        console.log('[SW] Install complete');
        return self.skipWaiting();
      })
      .catch(err => {
        console.error('[SW] Install failed:', err);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', e => {
  console.log('[SW] Activating...');
  e.waitUntil(
    caches.keys()
      .then(keys => {
        console.log('[SW] Existing caches:', keys);
        return Promise.all(
          keys
            .filter(k => k !== CACHE)
            .map(k => {
              console.log('[SW] Deleting old cache:', k);
              return caches.delete(k);
            })
        );
      })
      .then(() => {
        console.log('[SW] Activate complete');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  if (!e.request.url.startsWith('http')) return;

  e.respondWith(
    caches.match(e.request)
      .then(cached => {
        if (cached) {
          return cached;
        }

        return fetch(e.request)
          .then(response => {
            if (!response || response.status !== 200 || response.type === 'error') {
              return response;
            }

            // Cache Google Fonts
            if (e.request.url.includes('fonts.googleapis.com') || 
                e.request.url.includes('fonts.gstatic.com')) {
              const responseClone = response.clone();
              caches.open(CACHE).then(cache => {
                cache.put(e.request, responseClone);
              });
            }

            return response;
          })
          .catch(err => {
            console.error('[SW] Fetch failed:', err);
            
            if (e.request.mode === 'navigate') {
              return caches.match('./index.html')
                .then(cachedIndex => {
                  if (cachedIndex) {
                    return cachedIndex;
                  }
                  return new Response(
                    '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Offline</title></head>' +
                    '<body style="font-family:sans-serif;text-align:center;padding:50px;">' +
                    '<h1>📵 Brak połączenia</h1>' +
                    '<p>Aplikacja wymaga pierwszego uruchomienia z internetem.</p>' +
                    '<p><button onclick="location.reload()">Spróbuj ponownie</button></p>' +
                    '</body></html>',
                    { headers: { 'Content-Type': 'text/html' } }
                  );
                });
            }

            return new Response('Network error', {
              status: 408,
              headers: { 'Content-Type': 'text/plain' }
            });
          });
      })
  );
});

// Message event - for manual cache updates
self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (e.data && e.data.type === 'CLEAR_CACHE') {
    caches.delete(CACHE);
  }
});
