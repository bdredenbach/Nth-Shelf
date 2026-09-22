# Nth Shelf 2.79.35 / Test35 handoff

Test35 adds an empty-map-only edge-connected matte/paper cell family. It fixes
reader page44 with seven contour panels and, during the remaining-zero-page sweep,
also produces four panels each on reader pages58, 70 and71. Pages42 and43 remain
byte-for-byte identical to the Test34 detector output.

The route contains no comic/page identity keys. It proves exterior matte/paper,
connected artwork, separators and final contours from pixels. It withholds maps
with poor coverage; reader page65 therefore stays on its existing interactive
fallback rather than receiving an incomplete two-panel background map.

Recorded browser evidence is in `qa27900/frame-accuracy/test35/RESULTS.md`.
Page44 has 35/35 ownership anchors, 7/7 actual Reader/PageDeck touch renders and
zero differing pixels across 6,480,484 compared positions. Phone acceptance is
pending.

Android debug identity: `io.github.bdredenbach.nthshelf.frametest35`, version
2.79.35 / code 27963, label `Nth Shelf Test35`. Keep earlier test APKs installed
while testing.
