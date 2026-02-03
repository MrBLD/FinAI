const CACHE_NAME = 'finance-flow-cache-v1';

// Add the app shell URLs to this list.
// This is done on 'install'
const urlsToCache = [
  '/',
  '/manifest.json',
  '/logo.svg',
];

self.addEventListener('install', (event) => {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  // We only want to handle GET requests
  if (event.request.method !== 'GET' || event.request.url.startsWith('chrome-extension://')) {
      return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Try to get the resource from the cache.
      const cachedResponse = await cache.match(event.request);
      if (cachedResponse) {
        // If we have the resource in cache, return it.
        return cachedResponse;
      }

      // If it's not in the cache, fetch it from the network.
      try {
        const networkResponse = await fetch(event.request);
        
        // Check for a valid response to cache (same-origin, successful)
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            // Put the new resource in the cache.
            await cache.put(event.request, networkResponse.clone());
        }

        // And return the network response.
        return networkResponse;
      } catch (error) {
        // If the network fails, and we don't have a cached response, we can't do much.
        // For navigation requests, we can return a fallback offline page.
        // For this SPA, returning the root might be the best fallback.
        console.log('Fetch failed; returning offline page / from cache.');
        if (event.request.mode === 'navigate') {
            const cachedRoot = await cache.match('/');
            if (cachedRoot) return cachedRoot;
        }
        return new Response("Network error: You are offline.", {
            status: 408,
            headers: { "Content-Type": "text/plain" },
        });
      }
    })
  );
});
