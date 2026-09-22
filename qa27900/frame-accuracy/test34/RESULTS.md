# Test34 — broad-spectrum irregular-rim evidence

## Goal

Generalize the page42 pale-rim work into a reusable visual-evidence family instead
of adding a page43 special case. The runtime contains no comic title, filename,
page number, image hash, supplied tap point, or stored crop for this route.

## What changed

The existing page42 route remains the first attempt. Its legacy raster path is
unchanged for accepted page42 descriptors. When that proof cannot own a complete
map, the same measured rim network may retry ownership against the sampled
exterior matte color rather than treating every dark ink region as exterior. A
broader connected-component reconciliation then permits several substantial
visible artwork islands inside one proven cell. The route is still empty-map-only
and therefore cannot overwrite an established detector result.

Topology gates were broadened from a page42-specific tier/fan shape: four or more
strong transverse paths may now establish the network, interrupted supported rims
may span a longer gap, and the terminal fan no longer requires the page42-only
large downward drop. Measured support, non-crossing order, exterior matte, artwork
texture, balloon ownership, complete contours, and proof validation remain
required.

## Recorded local evidence

- **Reader page42:** 7 panels, all legacy raster. The complete descriptor list is
  byte-for-byte equal to the Test33 capture; SHA-256
  `2d53afd93eec812094eb52a3ba810cdcfea8b390981d140e77191e06127c9d0a`.
- **Reader page43:** 5 panels, all using the generalized `edge-color` ownership
  fallback. Twenty QA-only ownership anchors were checked.
- **Actual Reader + NthPageDeck:** five touchscreen-driven page43 pop-outs passed
  in mobile-emulated Chromium. Every focused contour remained valid and the
  rendered overlay matched an independent contour-clipped reference with **zero
  differing pixels**. No page errors were reported.
- **Previously empty Test33 pages:** reader pages 1, 26, 43, 44, 58, 65, 66, 70
  and 71 were re-run. Only page43 changed (0 → 5).
- **Prior non-empty pages:** the broad route is not executed when an earlier route
  already has identities. Page42 was additionally re-run and compared exactly.
- **Reader page44:** still returns zero and remains queued.

This is equivalent routing coverage for the Test33 74-page fixture, but it was
not produced by one monolithic 74-page capture command: the previously-empty page
set was directly swept, all prior non-empty pages are protected by the empty-map
gate, and page42 was separately compared byte-for-byte. The historical Test32
301-versus-298 discrepancy remains historical and is not claimed resolved.

Comic artwork remains private and is not committed. `page43-anchors.json` contains
QA-only points and an image hash so the private fixture can be identified; the
runtime does not load that file. `reader-result.json` preserves the actual Reader
render results without embedding comic pixels.

## Acceptance status

Browser/source candidate: **passed recorded checks**. Android build verification
and phone acceptance are separate. Keep Test32 and Test33 installed while testing
Test34.
