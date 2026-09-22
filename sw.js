// NTH SHELF — TEST32 IMPORT CHECKPOINT (OLDER RUNTIME SOURCE)
// Repository/cache maintenance only. Version 2.79.33 is reserved for page42.
// A failed precache must leave the previous worker in control.
const CACHE_PREFIX = "nth-shelf-shell-";
const CACHE_NAME = "nth-shelf-shell-2.79.24-checkpoint-r2";
const SHELL_FILES = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./css/style.css",
  "./assets/surface-noise.svg",
  "./js/db.js",
  "./js/library.js",
  "./js/nth-page-deck.js",
  "./js/page-mode.js",
  "./js/native-shell.js",
  "./js/transfers.js",
  "./js/stream-transfer.js",
  "./js/feature-guide.js",
  "./js/vendor/jszip.min.js",
  "./THIRD_PARTY_NOTICES.txt",
  "./js/panels.js",
  "./js/panels-page-layout.js",
  "./js/panels-gutter-frames.js",
  "./js/panels-closed-frames.js",
  "./js/panels-overlap-frames.js",
  "./js/panels-partition.js",
  "./js/panels-frame-wasm.js",
  "./js/panels-frame-kernel.wasm",
  "./js/panels-frame-envelope.js",
  "./js/panels-geometry-orthogonal.js",
  "./js/panels-geometry-skewed.js",
  "./js/panels-geometry.js",
  "./js/panel-map-core.js",
  "./js/panel-map.js",
  "./js/panel-map-worker.js",
  "./js/bubbles.js",
  "./js/page-turn.js",
  "./js/reader.js",
  "./js/app.js",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./assets/nth-shelf-brand.svg",
  "./assets/nth-shelf-hero-hd.webp",
  "./assets/nth-shelf-top-hd.webp",
  "./assets/nth-shelf-bottom-hd.webp",
  "./icons/icon-1024.png",
  "./icons/icon-maskable-1024.png",
  "./assets/nth-shelf-welcome.webp",
  "./assets/nth-shelf-dystopian-shelf.jpg"
];

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(SHELL_FILES);
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) =>
      key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME
    ).map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  event.respondWith((async () => {
    // Never serve another application's cache, or an older Nth Shelf shell.
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(req);
    if (cached) return cached;
    try {
      const response = await fetch(req);
      const url = new URL(req.url);
      const cacheableOrigin = url.origin === self.location.origin ||
        url.origin === "https://cdnjs.cloudflare.com";
      if (response && response.ok && cacheableOrigin) {
        event.waitUntil(cache.put(req, response.clone()).catch((error) => {
          console.warn("Nth Shelf runtime cache write failed:", error);
        }));
      }
      return response;
    } catch (_) {
      // respondWith must receive a Response, not undefined, when offline.
      return Response.error();
    }
  })());
});
