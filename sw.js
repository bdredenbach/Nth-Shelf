// NTH SHELF 2.79.35 — BROAD-SPECTRUM MATTE-CELL CANDIDATE
// Pages42-44 preservation/expansion plus whole-comic empty-map sweep; phone acceptance remains pending.
// A failed precache must leave the previous worker in control.
const CACHE_PREFIX = "nth-shelf-shell-";
const CACHE_NAME = "nth-shelf-shell-2.79.35";
const SHELL_FILES = [
  "./",
  "./THIRD_PARTY_NOTICES.txt",
  "./assets/DejaVu-LICENSE.txt",
  "./assets/nth-shelf-bottom-hd.webp",
  "./assets/nth-shelf-brand.svg",
  "./assets/nth-shelf-dystopian-shelf.jpg",
  "./assets/nth-shelf-empty.jpg",
  "./assets/nth-shelf-empty.png",
  "./assets/nth-shelf-hero-hd.webp",
  "./assets/nth-shelf-top-hd.webp",
  "./assets/nth-shelf-welcome.webp",
  "./assets/surface-noise.svg",
  "./css/style.css",
  "./css/turnjs-test.css",
  "./icons/icon-1024.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-1024.png",
  "./icons/icon-maskable-512.png",
  "./index.html",
  "./js/app.js",
  "./js/bubbles.js",
  "./js/db.js",
  "./js/feature-guide.js",
  "./js/library.js",
  "./js/native-shell.js",
  "./js/nth-page-deck.js",
  "./js/page-flip.browser.min.js",
  "./js/page-flip.js",
  "./js/page-mode.js",
  "./js/page-turn.js",
  "./js/panel-map-core.js",
  "./js/panel-map-worker.js",
  "./js/panel-map.js",
  "./js/panels-closed-frames.js",
  "./js/panels-frame-envelope.js",
  "./js/panels-frame-kernel.wasm",
  "./js/panels-frame-wasm.js",
  "./js/panels-geometry-orthogonal.js",
  "./js/panels-geometry-skewed.js",
  "./js/panels-geometry.js",
  "./js/panels-gutter-frames.js",
  "./js/panels-overlap-frames.js",
  "./js/panels-page-layout.js",
  "./js/panels-partition.js",
  "./js/panels.js",
  "./js/reader.js",
  "./js/stream-transfer.js",
  "./js/transfers.js",
  "./js/turnjs-license.txt",
  "./js/vendor/jszip.min.js",
  "./manifest.json",
  "./manifest.webmanifest",
  "./js/panels-occluded-frames.js",
  "./js/panels-composite-frames.js",
  "./js/panels-abutting-frames.js",
  "./js/panels-rim-frames.js",
  "./js/panels-terraced-frames.js",
  "./js/panels-local-islands.js",
  "./js/panels-framed-insets.js",
  "./js/panels-inset-neighbors.js",
  "./js/panels-edge-cells.js",
  "./js/panels-corner-frames.js",
  "./js/panels-terminal-frames.js",
  "./js/panels-curved-rims.js",
  "./js/panels-matte-cells.js"
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
