# 2.79.17 Test 1 — exterior gutters and snow rejection

Source recording: `179317.mp4`; baseline runtime 2.79.16 Test 1. Page numbers
include the cover. This is a bounded implementation of FQ-06 and FQ-11, not
completion of the frame-accuracy queue.

## Changes

- On gray/colored page margins, flood only near-matching pixels connected to
  the exterior. Fit their transitions into ink as candidate frame rails.
  Require complete dark edges, three exterior gutter sides, connected corners,
  and no enclosing inset, internal divider or overlap with existing identities.
  These are proposals to the existing closed-frame detector; established
  baseline/stacked-page routes retain priority. The original page-12 bottom-left
  frame, including its proof, remains exact.
- In wide, ragged light regions, sparse aligned marks no longer suffice for
  speech. A substantial text line is required. Compact regions and short speech
  remain eligible. This is a shape/layout heuristic, not OCR.
- Invalidate persisted panel proofs and the offline shell cache for this build.

No page numbers, tap positions, artwork labels or comic-specific coordinates
are used by runtime code. The comic, recording and diagnostic crops are excluded
from the repository and APK.

## Local evidence

- Page 12: five source-artwork identities, each stable through the actual Reader
  single-tap handler at center/left/right/north/south: **25 probes**. Corners are
  checked against independent approximate printed-border labels. No bottom-pair
  union; existing bottom-left identity/evidence preserved exactly.
- Previous controls: **130 Reader probes** pass on pages 3/5/6/9/13/16. Those
  controls do not certify unresolved frames on the same pages.
- The 74-page identity comparison changes only page 12, from one to five
  identities. The other 73 page outputs remain exact. Final closed-route
  comparisons cover the subsequent integer-bound and inset-veto changes.
- A separate Skia decode/resampling check preserves distinct bottom-left and
  bottom-right identities at ten positions for each of low/medium/high quality.
  Low/high identify all five frames; medium identifies four and leaves the
  middle strip on its existing fallback. This is not Android WebView testing.
- All four reproduced page-11 snow/fence points reject through both public
  bubble APIs. Seventeen independently reviewed caption regressions preserve
  their exact previous selections, including short NO/HNH speech. Page-4/page-5
  moved-caption controls also pass; fifteen artwork negative cases reject.
- A wider 18-page bright-region replay checks 124 previously accepted regions:
  120 are unchanged; three page-11 snow/fence regions and one broad page-12
  airplane-art/sound-effect region are rejected. The page-12 narration remains
  selectable. This is sampled evidence, not exhaustive recognition accuracy.
- Eight synthetic bubble cases include sparse fence-like marks in a ragged
  region (rejected), a substantial text row in that same shape (accepted), and
  short two-letter speech (accepted).
- Synthetic gutter fixtures cover dark art attached to a border, five-position
  ownership, adjacent frames, missing sides, full/interrupted dividers, an
  inset with dark attached artwork, and invalid inputs. Existing closed-frame
  and neighbor tests also run with the new proposer loaded.

## Commands

```sh
node qa27900/exterior-gutter-frames.cjs
node qa27900/bubble-selection.cjs
node qa27900/double-popout.cjs
NTH_BASELINE_ROOT=/path/to/2.79.16 node qa27900/exterior-gutter-artwork.cjs --comic
NTH_BASELINE_ROOT=/path/to/2.79.16 node qa27900/phone-frame-check.cjs --comic
NTH_BASELINE_ROOT=/path/to/2.79.16 node qa27900/queue-frame-check.cjs --comic
node qa27900/bubble-selection.cjs --comic /path/to/local/comic
```

The artwork harness expects the local comic beside the checkout. CI requires
synthetic frame/bubble/interaction checks, browser branding and backup/restore,
the native 600 MiB streaming-archive regression, APK metadata and signature.

## Still open and phone priorities

1. Repeat page 12's bottom pair and middle strip from five positions, including
   consecutive open/close operations. Device rendering may differ from these
   local raster checks; medium-quality resampling still uses the middle fallback.
2. Open page 11's snowy fortification frame and request the snow/fence region:
   no speech cutout should open. Recheck its real captions and page 5 captions.
3. FQ-07: page 7's red bomber strip remains unstable. Its bottom black rail
   blends into adjacent dark art, leaving insufficient measured fit support.
4. FQ-08/09/10: upper composites on pages 9/10/11 remain. Page 10 has overlapping
   borders; page 11's portrait is borderless. They need ownership/masking work,
   not an invented rectangular divider. Their existing page maps are unchanged.
5. FQ-05: page 6's top-right and narrow bottom-left lack consistent independent
   frame identities, despite successful individual openings in the video.

Keep the 2.79.xxx accuracy series. Speed work and automatic sequential pop-outs
remain deferred. No full phone confirmation is claimed by this release.
