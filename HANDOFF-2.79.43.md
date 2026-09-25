# Nth Shelf 2.79.43 / Test43 handoff

Test43 responds to the supplied Page-mode video. Forward turns started from the upper-right or lower-right corner were still visually collapsing into a vertical center-like hinge when the finger traveled mostly horizontally.

`NthPageDeck.cornerFurlY()` now supplies a mirrored minimum inward vertical arc: bottom-right rises, top-right descends. The user's real Y motion is never reduced; the helper only adds the missing corner lift when the gesture would otherwise be nearly horizontal. Because the arc follows 4p(1-p), it starts and finishes flat and peaks near mid-turn.

The Page tutorial now describes those exact two motions and renders two live corner boxes over the comic: upper-right ↙ / TOP · CURL DOWN and lower-right ↖ / BOTTOM · CURL UP. Its old single lower-right spotlight is removed for this step.

The Test43 contract verifies mirrored geometry, diagonal crease normals, preservation of stronger finger pulls, and the tutorial copy/cues. Test42 frame behavior remains packaged unchanged; page35 phone acceptance remains a separate pending gate.

Android debug identity: `io.github.bdredenbach.nthshelf.frametest43`, version 2.79.43 / code 27971, label `Nth Shelf Test43`.
