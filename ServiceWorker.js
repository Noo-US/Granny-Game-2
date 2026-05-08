const CACHE_NAME = "granny-cache-v1";

const APP_SHELL = [
  "/",
  "/index.html",
  "/manifest.webmanifest"
];

/* ───────────────────────────────────────────── */
/* INSTALL                                      */
/* ───────────────────────────────────────────── */

self.addEventListener("install", (event) => {

  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_SHELL);
    })
  );
});

/* ───────────────────────────────────────────── */
/* ACTIVATE                                     */
/* ───────────────────────────────────────────── */

self.addEventListener("activate", (event) => {

  event.waitUntil(
    caches.keys().then((keys) => {

      return Promise.all(
        keys.map((key) => {

          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );

  self.clients.claim();
});

/* ───────────────────────────────────────────── */
/* FETCH                                        */
/* ───────────────────────────────────────────── */

self.addEventListener("fetch", (event) => {

  const req = event.request;

  /*
    Unity files MUST bypass cache.
    This prevents 9% freeze bugs.
  */

  const url = new URL(req.url);

  const isUnityFile =

    url.pathname.includes("/Build/") ||

    url.pathname.endsWith(".data") ||
    url.pathname.endsWith(".wasm") ||

    url.pathname.includes(".data.part") ||
    url.pathname.includes(".wasm.part") ||

    url.pathname.endsWith(".framework.js") ||
    url.pathname.endsWith(".loader.js");

  /*
    NEVER cache Unity build assets
  */

  if (isUnityFile) {
    return;
  }

  /*
    Cache-first strategy for lightweight assets
  */

  event.respondWith(

    caches.match(req).then((cached) => {

      if (cached) {
        return cached;
      }

      return fetch(req)
        .then((response) => {

          /*
            Only cache successful same-origin responses
          */

          if (
            !response ||
            !response.ok ||
            response.type !== "basic"
          ) {
            return response;
          }

          const clone = response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(req, clone);
            });

          return response;
        });
    })
  );
});