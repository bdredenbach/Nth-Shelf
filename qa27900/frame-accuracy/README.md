# Frame accuracy reference set

## Current implementation: 2.79.16 Test 1

The [queue results](queue-results-27916.md) record five complete page-3 strips,
five proved page-6 frames, caption/artwork checks and asynchronous double-pop-out
handling. All 130 targeted Reader handler probes pass. The integrated 74-page
identity sweep changes only pages 3 and 6; the other 72 outputs remain exact.

Page 6's top-right gun/boot and narrow bottom-left pilot face are still
unresolved. This build has not yet been verified on the user's phone. Preserve
that distinction from the earlier phone-confirmed controls below; local handler
checks do not certify native gestures, animation or all legacy fallback results.

## Queue and phone-confirmed 2.79.15 controls

The user confirmed page 5's six whole panels and page 13's complete star-and-bombs
strip after 2.79.15 Test 1. Recording `179289.mp4` shows these results repeatedly.
Preserve them alongside the page-9/page-16 controls below. This confirmation
covers first-level whole-frame ownership; second-level bubble/caption interaction
has its own work queue.

See [work-queue.md](work-queue.md) for the next targets and
[video-findings-27915.json](video-findings-27915.json) for timestamped observations.
The recording established page 6's merged bottom-middle/right pair and page 3's
changing pilot crop; 2.79.16 addresses these locally, pending phone confirmation. Double-pop-out checks include page 4's
caption interaction and page 5's non-text sky selection. Successful caption-only
zoom is an intended capability, not automatically a frame defect.

## 2.79.14 recording controls

`179268.mp4`, supplied after the 2.79.14 APK, shows the whole page-13 airplane
frame twice, at approximately 2:03 and 2:12. It also reveals different partial
star/bombs crops and page-5 merged neighbors. Do not count page 13's middle-right
explosion as phone-confirmed: that pop-out is not shown in this recording.
See `connected-frames-27915.md` and `phone-findings-27914.json` for evidence,
independent artwork labels, and the next regression checks.

## Phone-confirmed 2.79.13 regression controls

The user tested the corrected trouble frames on reader pages 9 and 16 in
2.79.13 Test 1 and confirmed correct pop-outs from left, right, center, north
and south positions. Preserve these whole-frame identities in later builds.
This is targeted device feedback, not certification of other pages or every
pixel along the borders. Page 9's lower-right pair and page 16's five horizontal
strips remain explicit acceptance controls.

Version 2.79.12 begins an artwork-based accuracy investigation. The supplied 74-page Wolverine #1000 comic stays outside the repository. Draft coordinates here are independently reviewed annotations, not detector-generated answers. They remain approximate until reviewed against the original artwork and user feedback.

## Page numbering

Reader page 36 is zero-based index 35, image `Wolverine (2010-2012) 1000-035.jpg`. Older logs sometimes called it page 35.

## Confirmed failure in previous test design

The old middle-left tap (0.20, 0.45) and middle-right tap (0.70, 0.46) are in the same large middle scene. Its prior two stored quadrilaterals should not be treated as correct frame boundaries. The sheriff inset should be probed near (0.70, 0.33). The inset overlaps other frames, creating stepped visible boundaries that require more than four vertices or an occlusion mask. Artwork also interrupts its lower border.

`panel-map-stress.js` is a historical output-parity check; `panel-map-safety.js` checks limited historical routes. Neither establishes full-page correctness. The new `frame-geometry-contract.cjs` verifies that proven coordinates survive routing and rendering, not that the detector found the right frame.

## Next acceptance requirements

- Each intended frame has a distinct identity and a crop following its visible border.
- Multiple taps within one frame return that same frame; an inset selects its own frame.
- Compare annotations with rendered crops and inspect included neighboring artwork and clipped intended artwork separately. Do not accept matching old output as ground truth.
- Include white gutters, dark gutters, near-orthogonal rails, skewed rails, stepped overlap, and non-frame artwork controls.
- Check cold taps and repeated taps. Defer performance tuning and automatic sequential scrolling until accuracy is established.

## 2.79.12 findings

The geometry contract passes 18 physical-angle cases and live/persisted crop checks. A before/after sweep across all 74 pages gives the same six background-map polygons on two pages; this confirms scope, not their visual correctness. Exploratory long-dark-separator segmentation finds five large regions on page 36, merging the inset and middle scene. A looser threshold falsely divides artwork into nine regions. That experiment is not shipped.


Latest local candidate: [2.79.18 results](queue-results-27918.md), with
[independent new labels](queue-artwork-27918.json). Run `ink-frame-artwork.cjs`
with `--comic --skia` for optional source-artwork and resampling checks.
