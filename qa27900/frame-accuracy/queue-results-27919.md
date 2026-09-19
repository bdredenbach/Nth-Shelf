# 2.79.19 Test 1 — whole page-19 middle scene

Based on the `179355.mp4` review. One-based pages include the cover. This is a
bounded page-19 advance; the overlapping and borderless upper groups on pages
9–11 remain open. No comic-specific coordinates enter runtime detection.

## Result and limits

- FQ-15d: the middle room scene includes Wolverine at the left and the complete
  room. Five moved taps select one identical whole-frame geometry under Sharp
  and low/medium/high Skia resampling. The bottom full-width scene has the same
  coverage and remains separate.
- FQ-15a/c: Sharp additionally proves the full tall syringe region, including
  its upper speech balloon. Skia still defers it because the background grid
  produces weak divider evidence. Do not claim a reliable phone fix for that
  region. Taps in the left portion of the middle scene use its new whole owner.
- FQ-15b: the upper-right room and eye/injection strip remain unresolved. The
  speech balloon crossing their boundary needs explicit ownership handling.
- FQ-08/09/10, page 6's remaining unproved identities, earlier resampling limits,
  and explicit bubble-negative phone checks stay queued. Bubble code is unchanged.

## Implementation

A final partial partition route runs only when baseline, stacked layout,
closed-frame, original partition, and ink-core supplement return no identities.
The route requires a uniformly dark exterior and fits low-contrast outer edges
before repeating closed-boundary and corner checks. It can retain two proved
leaves after at least two attached separators while deferring ambiguous regions.

The sparse ink-core fit requires samples in every quarter, at least 25% total
support, a fitted rail that is at least 99.5% dark, mean below 15, standard
deviation below 8, attachment at both ends, and at most one analysis pixel of
90th-percentile residual. Existing map routes keep their original thresholds.
Missing-border, weak-divider and nested-frame uncertainty still veto ownership.
This does not infer a border through a crossing speech balloon or doorway.

## Verification

- Full 74-page `PanelDetect.detect` comparison: only page 19 changes, from zero
  to three Sharp identities. The other 73 page outputs, including pages 7/17,
  remain exact after serialization. This does not certify every tap fallback.
- New independent source-artwork labels: 15 Sharp Reader-handler probes and
  30 Skia Reader-handler probes. The actual production detector runs for each
  Skia quality before the Reader receives its map. Samples cover center, left,
  right, north and south. All middle/bottom results follow the labeled corners.
- Prior Reader controls: 205 Sharp probes and 105 Skia probes retain their
  established results. Together with the new probes, 355 Reader checks pass.
- Ten additional synthetic dark-partition cases verify retained whole siblings,
  interrupted dividers, thin/edge dividers, nested and partly obscured insets,
  broken outer borders, white exteriors and uniform dark images. Route-priority
  checks cover the new final fallback and its safe failure.
- Existing partition reconciliation, closed/gutter/neighbor geometry, crop,
  internal-divider, pilot-strip and double-pop-out cancellation gates pass.
  CI additionally gates browser interaction/backup, native archives and APK
  metadata/signature before publishing the artifact.

Local artwork command (fixture intentionally excluded from CI/APK):

```sh
NTH_BASELINE_ROOT=/path/to/2.79.18 node qa27900/dark-partition-artwork.cjs --comic --skia
```

Version is `2.79.19-test1`, Android code `27923`; shell and panel-map/proof
versions advance. Local Skia is not Android device certification. No phone
latency claim is made; the new route adds work only after all old routes miss.

## Phone check

On page 19, move taps around the middle room scene, including Wolverine at the
left and the right-hand room: every opening should retain the entire scene.
Recheck the bottom scene. Report the syringe crop as an unresolved comparison,
not an expected universal fix. Preserve the successful page-7 bomber and all
six page-17 frames, and retain the page-5/9/13/16 controls.
