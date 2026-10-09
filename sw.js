// NTH SHELF 2.79.135 — COMPLETE UPPER SOURCE PAPER CELL
// Cumulative comic fixes plus general monochrome frame detection.
// A failed precache must leave the previous worker in control.
const CACHE_PREFIX = "nth-shelf-shell-";
const CACHE_NAME = "nth-shelf-shell-2.79.135";
const SHELL_FILES = [
  "./js/panels-ornate-inset.js",
  "./js/panels-ornate-ownership.js",
  "./js/panels-enclosure-remainder.js",
  "./js/panels-excluded-speech.js",
  "./js/panels-gutter-tail-speech.js",
  "./js/panels-gutter-ink-cap.js",
  "./js/panels-gutter-caption-boundary.js",
  "./js/panels-page-edge-rail-cell.js",
  "./js/panels-upper-paper-separation.js",
  "./js/panels-saturated-frontier-cell.js",
  "./js/panels-saturated-round-inset.js",
  "./js/panels-saturated-terminal-cell.js",
  "./js/panels-detached-captions.js",
  "./js/panels-atomic-boundary-speech.js",
  "./js/panels-saturated-rail-cell.js",
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
  "./js/panels-matte-cells.js",
  "./js/panels-edge-spill.js",
  "./js/panels-ragged-gutters.js",
  "./js/panels-interrupted-gutters.js",
  "./js/panels-neighbor-completion.js",
  "./js/panels-shared-boundaries.js",
  "./js/panels-exterior-completion.js",
  "./js/panels-edge-guided-paper.js",
  "./js/panels-chromatic-shared-border.js",
  "./js/panels-narrow-ink-frames.js",
  "./js/panels-top-row-barrier.js",
  "./js/panels-horizontal-paper-strips.js",
  "./js/panels-local-boundary-consensus.js",
  "./js/panels-context-cells.js",
  "./js/panels-interior-strokes.js",
  "./js/panels-smooth-gutter-boundaries.js",
  "./js/panels-neighbor-edge-cells.js",
  "./js/panels-lettering-cells.js",
  "./js/panels-connected-pairs.js",
  "./js/panels-crop-repair.js",
  "./js/panels-gutter-split.js",
  "./js/panels-speech-ownership.js",
  "./js/panels-perimeter-consolidation.js",
  "./js/panels-dark-matte-completion.js",
  "./js/panels-tail-speech.js",
  "./js/panels-long-tail-speech.js",
  "./js/panels-column-speech.js",
  "./js/panels-split-cell-completion.js",
  "./js/panels-lateral-cell-completion.js",
  "./js/panels-landscape-cells.js",
  "./js/panels-landscape-upper-groups.js",
  "./js/panels-paper-continuation-groups.js",
  "./js/panels-wide-paper-rows.js",
  "./js/panels-paper-edge-groups.js",
  "./js/panels-trailing-edge-groups.js",
  "./js/panels-stable-frontier-cells.js",
  "./js/panels-neutral-matte-groups.js",
  "./js/panels-compact-dark-cells.js",
  "./js/panels-short-paper-cells.js",
  "./js/panels-gradient-residual-groups.js",
  "./js/panels-empty-enclosure-groups.js",
  "./js/panels-color-enclosure-groups.js",
  "./js/panels-short-row-speech.js",
  "./js/panels-contrast-enclosure-groups.js",
  "./js/panels-dialogue-row-groups.js",
  "./js/panels-continuation-enclosure-groups.js",
  "./js/panels-firm-enclosure-groups.js",
  "./js/panels-strong-continuation-groups.js",
  "./js/panels-high-contrast-enclosures.js",
  "./js/panels-focused-paper-cell.js",
  "./js/panels-focused-paper-continuation.js",
  "./js/panels-orthogonal-white-gutters.js",
  "./js/panels-paper-recovery.js",
  "./js/panels-colored-rims.js",
  "./js/panels-dark-overlay-insets.js",
  "./js/panels-structural-grid.js",
  "./js/panels-pale-completion.js",
  "./js/panels-gutter-graph.js"
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
