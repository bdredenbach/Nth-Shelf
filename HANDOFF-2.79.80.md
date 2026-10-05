# Test80 — stable full-width torn-paper tiers

## Result

The supplied Rise of Apocalypse checkpoint advances from **169 to 174** saved owners. Test80 adds five owners on two portrait pages that were already carrying exactly one established owner:

- Issue 2, image index 14 / reader 15 of 23: **1 -> 4**. Three missing full-width torn-paper tiers are appended; the established top tier remains authoritative.
- Issue 4, image index 2 / reader 3 of 21: **1 -> 3**. Two missing full-width torn-paper tiers are appended; the established bottom tier remains authoritative.

No existing owner is replaced or reshaped.

## Proof

The route is generic and contains no book/page/tap identity lookup. It runs only when the established detector returns exactly one owner. On the 900-pixel analysis plane it measures per-row neutral-white support, smooths that support across five rows, and accepts only two or three strong internal paper separators.

Those measured separators are injected only as temporary seed barriers. Final geometry is re-grown from the original page pixels by the retained `PanelRaggedGutters` proof. The complete tier set must:

- contain exactly separator-count + 1 panels (three or four tiers),
- validate through `PanelRaggedGutters.validPanel`,
- remain within three analysis pixels at barrier half-widths 0, 1, and 2,
- span at least 90% of page width per tier,
- cover the page from the upper margin through the lower margin,
- place every measured separator at the seam between its adjacent pair,
- and contain exactly one tier that overlaps the already-established owner by more than 72% of the smaller envelope.

That matching owner is not republished. Only the remaining stable tiers are appended.

## Corpus screening

At the 169-owner checkpoint, eleven pages have exactly one owner. Only three of those also expose two or three qualifying paper-separator runs. One of the three (issue 2 reader 14) cannot produce a complete stable tier set and is withheld. The two pages above are the only accepted corpus hits.

The additions remain valid after 0.67x and 1.25x source scaling, horizontal mirroring, and JPEG quality-82 recompression. Original comic artwork is not committed.

## Identity

Version 2.79.80, version code 28008, package `io.github.bdredenbach.nthshelf.frametest80`, label `Nth Shelf Test80`, cache `nth-shelf-shell-2.79.80`, panel map `panel-map-exp-75`, proof identity `frame-proof-2.79.80`. Physical Android acceptance is pending.
