const CACHE = "Ducky-Granny-1.0";

// App shell only — Unity build assets live on Supabase and are too large
// (and cross-origin) to cache here. The SW keeps the page itself available.
const SHELL = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
];

self.addEventListener("install", (e) => {
  console.log("[SW] Install");
  e.waitUntil(
    caches.open(CACHE).then((cache) => {
      console.log("[SW] Caching app shell");
      return cache.addAll(SHELL);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  console.log("[SW] Activate — pruning old caches");
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);

  // Let Supabase requests go straight to network — don't cache large binary blobs
  if (url.hostname.includes("supabase.co")) {
    return; // browser handles it normally
  }

  e.respondWith(
    caches.match(e.request).then((cached) => {
      if (cached) {
        console.log(`[SW] Cache hit: ${url.pathname}`);
        return cached;
      }

      return fetch(e.request).then((response) => {
        // Only cache valid, same-origin responses
        if (!response || !response.ok || response.type === "opaque") {
          return response;
        }

        const clone = response.clone();
        caches.open(CACHE).then((cache) => {
          console.log(`[SW] Caching: ${url.pathname}`);
          cache.put(e.request, clone);
        });

        return response;
      });
    })
  );
});
