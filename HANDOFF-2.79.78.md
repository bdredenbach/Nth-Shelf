# Test78 — empty-map isolated boundary recovery

## Baseline

Continue from the Test77 source checkpoint at 164 saved Apocalypse owners. Test76 remains the last explicitly phone-confirmed checkpoint. Test78 is append-only: it does not alter any accepted detector proof or descriptor.

## Scaled recovery

The experiment exposes an existing strict route rather than weakening a threshold. `panels-ragged-gutters.js` has carried proof version 20 (`independent-boundary-cell`, recovery mode `isolated-boundary`) since Test63. Test78 calls that recovery only after every established owner route has left `closed` empty. It publishes the result only when exactly one candidate is returned and `PanelRaggedGutters.validPanel` validates it again.

This means an existing owner has absolute priority. The new route cannot trim, replace, reorder, or supplement any of the 164 Test77 owners. A page with multiple isolated candidates also defers instead of guessing.

## Supplied Apocalypse corpus result

The exact recovery detector was scanned over the 39 maps still empty at Test77:

- Issue 2, image index 17 / reader 18 of 23: one complete isolated upper-right hand/scarab panel.
- Issue 4, image index 20 / reader 21 of 21: one complete isolated upper-right close-up/caption panel.
- Remaining 37 zero-owner maps: no recovered owner.

Saved corpus total: **164 -> 166**. Both target contours were visually reviewed against private overlays and stay inside their scene boundaries. Source transforms at 0.67x, 1.25x and horizontal mirror each return exactly one valid proof-version-20 owner on both targets. Original comic artwork is not committed.

## Rejected broader experiment

A color-tolerant whole-page gutter-graph trial was evaluated first because it produced candidates on nine pages. Its two candidates on the previously empty issue-1 image 12 were composite enclosures spanning multiple intended panels. That route is rejected and is not part of Test78.

## Regression boundary

Test78 keeps the Test63 v20 proof thresholds unchanged: unsplit connected seed, no more than one open page edge, compact occupancy, no substantial internal exterior gutter, and serialized contour validation. The retained Test77 suite plus the Test78 empty-map gate and service-worker identity contracts are the release gate. Earlier Wolverine/manga/Magneto artwork is not re-embedded or committed; retained contracts remain the regression safety net.

Physical Android acceptance of Test78 is pending.

## Identity

Version 2.79.78, code 28006, debug package `io.github.bdredenbach.nthshelf.frametest78`, label `Nth Shelf Test78`, cache `nth-shelf-shell-2.79.78`, panel map `panel-map-exp-75`, proof identity `frame-proof-2.79.78`. The recovered owner proof remains serialized version 20; Test78 changes only when that already-valid proof may be published.
