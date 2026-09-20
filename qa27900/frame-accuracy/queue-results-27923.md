# 2.79.23 Test 1 — Visible outlines for overlapping panels

Page 11's five frames are phone-confirmed by the user after 2.79.22. This
candidate addresses FQ-08/page 9 and FQ-09/page 10; it needs device confirmation.

## Change

The old upper rectangles contain three scenes. A bounded detector recognizes
two right-edge foreground panels crossing a taller rear frame. Four horizontal
foreground rails, a shared foreground side, three exposed portions of the rear
rail, its outside borders and quiet exterior gutters establish the layout.
The existing internal-divider/inset veto is retained. Missing evidence causes
abstention. A complete group is added atomically without altering any old frame.

The result follows visible, potentially concave outlines. Covered artwork is
not reconstructed. On page 9, a caption crosses the upper inset's left border:
a closed paper rectangle plus the existing text-layout proof includes the
caption in that inset and cuts the same shape out of the rear scene.

The geometry router preserves validated simple outlines. Reader hit testing,
CSS clipping and enlarged-crop-to-source mapping use the same vertices. A
second-level tap in a transparent notch dismisses the focus without testing
a caption in the covered neighbor. Existing asynchronous cancellation remains.
The new geometry is a live page identity; it does not grant unrelated adaptive
frames new persistent-map authority. Cache/proof versions advance together.

No page number, comic identity or manually labeled coordinate enters runtime
code. Original artwork and recordings remain outside the repository and APK.

## Local verification

- Actual Chromium comparison against 2.79.22 across all 74 original JPEGs:
  only pages 9 and 10 change, each adding three outlines. Every previous
  identity, geometry and proof object is preserved exactly.
- Page 9: ten identities (three new visible regions and seven old identities).
  Page 10: six (three new and three old). The composite remains fallback.
- 62 real mobile Chromium touch/render checks: five interior positions in
  each of six new regions, repeated twice, plus the page-9 overhanging caption
  twice. Outlines match independent artwork labels. All six screenshots were
  visually inspected for whole visible artwork and captions.
- Page-11 regression: 50 actual Chromium touch/render checks across all five
  user-confirmed regions, five positions repeated twice.
- 124 additional new-region Reader-handler checks across Sharp and Skia's
  low, medium and high resampling, with independently labeled borders.
- Synthetic overlap fixture: three regions, rear/foreground/gap ownership,
  exact geometry preservation; nine missing-border/inset/blank-caption
  rejections and malformed-polygon/proof guards.
- Existing geometry, gutter, partial-partition, caption and stale-request
  suites pass. The double-pop-out suite now also checks transparent concave
  notches and source-coordinate mapping from a visible region.

The device remains the final acceptance check. Local browser/resampling passes
are not a phone result. Build/signature/archive verification is handled by the
Android workflow, with downloaded packaged web assets compared to tested source.

## Phone check and remaining queue

For each upper scene on pages 9 and 10, try center, left, right, near-top and
near-bottom interior taps, dismissing between openings. Each should return
the same whole visible scene. Also tap page 9's protruding motorcycle caption.
The rear panels intentionally have stepped edges where foreground panels cover
them. Recheck the lower frames and page 11 as controls.

Keep page-19 upper-room/eye/left-column/syringe targets, page-6 proof gaps and
explicit second-level artwork rejection checks queued. FQ-08/09 remain open
until device confirmation; FQ-10 is confirmed for first-level frames.
