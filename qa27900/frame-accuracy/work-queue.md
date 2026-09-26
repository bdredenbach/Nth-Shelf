# Current checkpoint — Test48, 2026-09-26

Active: Wolverine 1000 page43, middle slanted scene corner/center consistency. 32 browser touches pass; only that frame changes in the 74-page comparison. Await phone acceptance. See [handoff](../../HANDOFF-2.79.48.md) and [results](test48/RESULTS.md).

The following checkpoints are historical.

# Current checkpoint — Test47, 2026-09-26

Active: Wolverine 1000 page36. Six marked frames pass 35 browser touches and full 74-page comparison; only page36 changes. Await phone acceptance of Test47. See [handoff](../../HANDOFF-2.79.47.md) and [results](test47/RESULTS.md).

The queue below is historical and predates the recovered Test46/Test47 work.

# Frame accuracy work queue

Latest phone confirmation: after **2.79.23 Test 1**, the user confirms
**pages 9 and 10 are fixed**. FQ-08 and FQ-09 are now phone-confirmed for frames.
Page 11's five frames remain confirmed from 2.79.22. Preserve these controls.
The next candidate is page 19's whole tall syringe panel and upper speech.
These confirmations concern frames, not second-level bubbles.

Accuracy comes first. Keep the 2.79.xxx series until the full frame goal is met;
reserve 2.80.00. Performance tuning and sequential pop-outs remain later work.

## Phone confirmation — 2.79.23

The user reports: “Page 9 and 10 are fixed.” Close FQ-08/09's frame targets,
including the overlapping upper scenes and retained page-9 caption. Their
identities join page 11 and all earlier confirmed frames as regression controls.

## 2.79.24 candidate — page-19 syringe and artwork restoration

- Rebuild splash/empty-shelf art with an HD central illustration, matching top
  and bottom artwork, vector branding, live text and sharper launcher icons.
- Page 19 gains the complete tall syringe frame in real Chromium, including
  its upper speech balloon. Continuous uniform ink can prove its separator
  where adjacent dark artwork hides contrast; all prior identities stay exact.
- Only page 19 changes in the 74-page Chromium comparison. Thirty real-browser
  touch/render checks cover its three proven frames; phone confirmation is pending.
- Weak grid/balloon boundaries remain unresolved when evidence is insufficient.
  Page-19 upper-room/eye groups, page-6 gaps and second-level checks remain queued.
- See [2.79.24 results](queue-results-27924.md) for limits and device priorities.

## Phone confirmation — 2.79.22

The user reports: “yes, page 11 frames are all confirmed working.” This follows
the requested five-position forest/portrait checks and recheck of the other
three panels. No additional recording was needed. FQ-10's frame targets are
confirmed; all five become required controls for subsequent changes.
Second-level caption/artwork tests and other pages keep their prior status.

## 2.79.23 implementation — FQ-08 and FQ-09 (subsequently phone-confirmed)

- Each upper composite now has three independently outlined visible regions:
  rear scene plus two right-edge foreground panels. Their bounding rectangles
  overlap; their visible polygons assign the occluded area to the foreground.
- Page 9's protruding caption is proved by a closed paper boundary and the
  existing text-layout check, and retained with the upper motorcycle inset.
- Every old identity remains exact. FQ-10/page 11 is a required phone-confirmed
  control, alongside the earlier controls. FQ-08/09 were subsequently confirmed by the user.
- Test five interior positions in each of the six new upper regions, dismissing
  between taps; include the protruding page-9 caption. Recheck lower regions.
- See [2.79.23 local results](queue-results-27923.md). Page-19 upper groups/syringe,
  page-6 gaps and explicit second-level checks remain queued.

## 2.79.22 implementation status (subsequently phone-confirmed)

- FQ-10 local advance: forest and borderless portrait open independently,
  preserving both captions in each region. Fortifications and both lower
  strips retain their exact earlier identities.
- Forest: exterior borders already passed. Tree trunks were incorrectly vetoing
  the strip as internal dividers. Gradient-route divider checks now require
  separating ridges at both outside-border joins; full/interrupted separator
  and inset negatives still pass.
- Portrait: three independently proved neighbors bound an open artwork region.
  Its full perimeter must be exterior-connected quiet background. The detector
  includes the whole main artwork and separate captions, rejects ambiguous
  multiple dominant scenes, and uses polygon overlap to preserve neighbors.
- Real Chromium: 50 actual touch/rendered-overlay checks across all five page-11
  panels, five positions each repeated twice. Broader local artwork checks
  include Sharp and three Skia resampling settings. These are not phone passes.
- The requested page-11 frame checks are now confirmed by the user.
- FQ-10 is closed for frames. FQ-08/09
  and page-19's unresolved upper groups/syringe remain detector targets;
  page-6 proof gaps and explicit second-level bubble checks remain recorded.

See [2.79.22 results](queue-results-27922.md). The original composite remains
as fallback outside independently proved refinements; no whole-comic accuracy
or performance claim is made.

## Latest phone results — 179382.mp4

- FQ-10 fortifications: separate complete crop around 7.5–15.5s and 21.2–21.5s,
  retaining both captions. Preserve this newly observed phone success.
- Both lower full-width strips open individually around 23.5–23.8s and
  25.8–26.5s, with their captions visible.
- FQ-10 remains open for the borderless portrait (upper composite around
  3.5–5.2s) and forest strip (upper composite around 18.2–18.8s and 28.8–29.5s).
- Next: separate forest and portrait ownership while retaining the complete
  fortifications crop and both lower strips. Do not use an arbitrary portrait
  rectangle or remove artwork/captions to force disjoint boxes.
- Touches during the held-open fortifications crop are not independent
  first-level openings. Five-position device coverage and explicit bubble
  checks remain pending. Page 19 and other pages are not retested here.

## 2.79.21 candidate status

- FQ-10's phone-style failure is reproduced in real Chromium using the original
  JPEG: its canvas output interrupts the exterior gutter alongside the left
  fortifications rail for four analysis rows. The old three-row tracking limit
  splits that rail and never proposes the whole frame.
- The gradient route now allows at most five missing samples between nearby
  rail points. All existing line-fit, full-side support, corner and interior
  checks remain. Other proposal routes retain their original tracking limit.
- Chromium's 74-page before/after comparison changes only page 11 (3 to 4
  identities); every prior identity remains exact. Ten real browser touch and
  overlay checks pass through IndexedDB and the actual Reader load path.
- The subsequent 179382 recording now supplies independent fortifications
  openings on the phone. A complete left/right/center/north/south first-level
  device sweep remains pending; the whole page is not yet solved.
- Forest/portrait ownership, pages 9–10, page-19 upper groups/syringe, page-6
  uncertainty and explicit second-level bubble checks remain queued. Preserve
  the phone-confirmed page-19 middle scene and earlier frame controls.

See [2.79.21 local results](queue-results-27921.md) and the separate
[phone findings](video-findings-27921.md). Historical sections below describe
the earlier builds and retain their original evidence limits.

## Latest phone results — 179375.mp4

- FQ-10: fortifications touches at multiple positions around 28–42 seconds
  repeatedly open forest + portrait + fortifications together. No independent
  fortifications crop is observed. This remains a phone failure despite the
  local five-point Sharp/Skia passes.
- The forest and borderless portrait also remain merged in repeated attempts.
- Next: inspect active runtime, image decode/canvas, candidate acceptance,
  `currentPanels` assignment and hit selection in the Android WebView path.
  The recording does not identify which stage causes the discrepancy.
- The recording covers only page 11. Prior page-19 and other control
  confirmations remain recorded; no new pass or regression is inferred.
- Explicit second-level bubble checks remain pending. Runtime/APK unchanged.

## 2.79.20 candidate status

- FQ-10 local-only advance: page-11 fortifications has a complete independent crop,
  including both captions. Five interior points pass in Sharp and three Skia
  settings. Its printed border takes priority inside the old upper composite.
- The old composite remains for unresolved taps in the forest and borderless
  portrait. This is not a complete page-11 fix or a complete disjoint page map.
- The 74-page comparison preserves every old identity exactly; only page 11
  gains a new preferred frame. Confirmed page-19 middle-scene behavior remains.
- FQ-08/09, the rest of FQ-10, FQ-15a/b/c and earlier uncertainty remain queued.
  Bubble code is unchanged; explicit second-level phone checks remain pending.

See [2.79.20 local results](queue-results-27920.md). The latest phone recording
fails the fortifications acceptance check; diagnose the local/device mismatch.

## Phone confirmation — 2.79.19

The user reports the requested page-19 test worked. FQ-15d's whole middle room
scene, including Wolverine at the left, is now phone-confirmed and must be
preserved. This does not close the syringe, upper-right room/eye-strip, or
other untested regions. Keep the bottom full-width scene as a local control.

## 2.79.19 candidate status

- FQ-15d: page-19 middle scene retains Wolverine and the whole room under
  Sharp and all three Skia qualities, five moved taps each. Now phone-confirmed.
- Page-19 bottom full-width scene is a new stable control under the same tests.
- FQ-15a/c: the whole syringe and its upper speech gain a Sharp identity, but
  the grid background still causes Skia abstention. Do not mark these solved.
  Taps in the left portion of the middle scene now use its full-scene identity.
- FQ-15b: balloon-crossed upper-right room/eye strip stays unresolved.
- FQ-08/09/10: overlapping/stepped and borderless groups on pages 9–11 stay open.
- All previous .18 identities remain exact across the 74-page comparison.
  Pages 7/17 and earlier confirmed frame controls retain their results.
- Bubble code is unchanged; FQ-12/FQ-13 targeted phone checks remain pending.

See [2.79.19 local results](queue-results-27919.md). Prior sections retain their
historical build context.

## Latest phone results — 179355.mp4

- FQ-07: page 7's complete bomber strip opens correctly around 88.6s. All five
  page-7 panels have individual successful openings, including the bottom strip.
- FQ-14: all six page-17 panels open separately around 233–246s. SNIKT and both
  right neighbors are complete and separate. Preserve this new phone result.
- Pages 5/6/8/12 also show separate whole-frame sequences. Page 6's top-right
  and narrow bottom-left succeed individually but still need stable local and
  five-position proof. Page-9 lower-right and page-13 controls remain visible.
- FQ-08/09/10 persist on pages 9–11. They remain next detector targets.
- **FQ-15, page 19:** inconsistent syringe crop, upper-right room/eye-strip
  composite, left-column cross-scene composite, and cropped middle-room scene.
  Exact intervals and acceptance criteria are in the new findings. This renews
  an older backlog page; it is not evidence of a regression introduced by .18.
- FQ-12/FQ-13 cutouts do not recur, but the recording does not clearly establish
  deliberate second-level negative requests. Targeted phone confirmation stays
  pending; do not equate an ordinary whole-frame opening with a bubble test.
- These are successful individual openings, not full five-position device
  certification. Keep the existing resampling and fallback limitations recorded.

## 2.79.18 candidate status

- FQ-07: full red bomber strip owns all five tested positions on page 7, also
  across low/medium/high Skia resampling. The bottom strip remains resampling
  dependent; the upper-right panel remains unproved.
- FQ-12/FQ-13: page-9 snow and page-13 pale artwork reject through detect/extract;
  genuine caption controls are preserved. These need device confirmation.
- FQ-14: all six page-17 frames pass moved-tap checks; the tall SNIKT column and
  the two neighboring lower panels stay separate across three Skia settings.
- FQ-08/09/10 remain open. The upper groups on pages 9–11 require ownership for
  overlapping/stepped or borderless art, beyond the complete rectangular proofs
  added here. No arbitrary portrait rectangle or partial inset crop was added.
- Page-5/9/13/16 controls, page-3/page-6 checks and page-12 whole-frame controls
  remain passing. FQ-05's two unresolved page-6 identities stay open.
- Incidental whole-frame additions on page 8 (machine-gun strip) and page 58
  (bottom conversation strip) follow independently inspected printed borders.

## Latest phone findings: 179345.mp4

**Preserve page 12's new result:** all five frames open separately around
120–130 seconds, including the middle strip and both bottom panels. FQ-06 now
has positive phone evidence; a full five-position device sweep remains pending.
Page 8's five panels, page 9's lower-right pair, page 13's established frames,
and page 16's five strips also have successful individual openings.

| ID | Page | New target |
| --- | --- | --- |
| FQ-12 | 9 | Snow in the lower-right frame becomes a non-text bubble at 87.8–88.8s. Locally reproduced through detect/extract. |
| FQ-13 | 13 | Pale artwork beside Wolverine becomes a non-text cutout at 136–136.5s. Reproduced with browser-like Skia resampling; Sharp alone missed it. |
| FQ-14 | 17 | Tall SNIKT column merges with portions of both neighboring lower panels at 220.5–221.5s and 223.5–224.5s. |

FQ-07/08/09/10 remain visible. FQ-11's specific page-11 snow request is not
clearly repeated, so its phone confirmation stays pending. Keep first-level
frame ownership and second-level caption selection as distinct test tracks.
Those findings describe the 2.79.17 phone build; the candidate status above records subsequent work.

## New phone targets from 179317.mp4

| ID | Page | Next target |
| --- | --- | --- |
| FQ-06 | 12 | Local fix plus successful five-frame phone sequence in 179345; five-position device sweep pending. Middle fallback remains at one local resampling setting. |
| FQ-07 | 7 | Red bomber strip crops differently across selections. |
| FQ-08 | 9 | Upper three frames merge; preserve confirmed lower-right pair. |
| FQ-09 | 10 | Upper motorcycle/inset group merges; respect overlapping borders. |
| FQ-10 | 11 | Top forest strip and middle pair merge into one selection. |
| FQ-11 | 11 | Local fix: four snow/fence taps reject through both bubble APIs; caption controls pass. Phone confirmation pending. |

FQ-06/FQ-11 now have bounded local fixes in 2.79.17. Next detector work is
FQ-07 and the upper groups. Page 10 needs overlapping-frame ownership; page 11
has a borderless portrait. Acceptance checks and timestamps remain in
[the findings](video-findings-27916.md). Local success is not phone confirmation.

The new video shows page 3’s five whole strips and page 6’s two wider bottom
frames opening separately. Page 6’s top-right and bottom-left also open in
individual examples, but FQ-05 still needs reliable multi-position proof.
No whole-page or caption test is marked complete from an isolated success.

## Confirmed controls to preserve

| Target | Status and evidence |
| --- | --- |
| Page 5: all six whole panels | User phone-confirmed in 2.79.15. Repeated openings in 00:09–01:03, with further examples in 02:43–02:55. This includes the narrow hand panel and separate shattered-glass and Wolverine panels. |
| Page 13: whole star-and-bombs strip | User phone-confirmed in 2.79.15. Repeated full-height results around 01:13, 01:18 and 01:20. Preserve its star, stripe and entire bomb sequence together. |
| Page 9: lower-right pair; page 16: five strips | Earlier user confirmation from left, right, center, north and south positions. These remain required regression controls. |

The page-5/page-13 confirmation is targeted. It does not certify every other
frame on page 13 or all second-level interactions. Existing independent labels
remain in `phone-findings-27914.json`; do not replace them with detector output.

## 2.79.16 implementation status

| ID | Local result | Remaining check or work |
| --- | --- | --- |
| FQ-01 | Bottom-middle/right have distinct whole-frame owners at all five probe positions. The previous bottom-middle identity and evidence are exact. | 179317 shows separate openings around 01:03 and 01:05–01:06; repeat at all five positions. |
| FQ-02 | All five page-3 strips pass five positions each; the pilot keeps its narration and left artwork. | 179317 shows all five whole strips; complete moved-tap phone sweep remains. |
| FQ-03 | Page-4 caption detection and Reader crop mapping/open-close checks pass. Pending-result cancellation and resize handling are covered. | Exercise the actual caption gesture and animation on the phone; the source video did not establish a failure. |
| FQ-04 | Page-5 sky/propeller requests reject at three positions; all five page-5 captions and 17 wider-corpus caption controls pass. | Phone confirmation that the sky does not become a second pop-out and the genuine caption still does. |
| FQ-05 | Five of seven page-6 frames have proved identities: top-left, middle-left/right, bottom-middle/right. | **Top-right gun/boot and narrow bottom-left pilot face remain unresolved.** They are the next detector targets. |

The 130 Reader handler probes include all 80 existing controls and 50 new
page-3/page-6 probes. The integrated 74-page identity comparison changes only
pages 3 and 6 (one to five identities each); the other 72 outputs are exact.
This does not certify the legacy per-tap fallback or every double-pop-out region.

## Recorded targets and acceptance checks

| ID | Target | Evidence | Required outcome |
| --- | --- | --- | --- |
| FQ-01 | Page 6: separate bottom-middle and bottom-right frames | Bottom-middle opens alone near 03:10.2; near 03:11.9–03:12.3 the selected crop contains both panels and their internal vertical divider. | Each panel owns its own complete frame. Moving a tap within either one must never select their union. Preserve the working middle-only result. |
| FQ-02 | Page 3: stable whole pilot strip | At 01:42.4–01:42.8 the pilot crop excludes the left narration and adjacent artwork. Around 01:48.5 and 02:00 the same strip includes them. | A first-level frame selection must retain the complete strip at all interior probe points. Replay single and double taps separately to identify the responsible route. |
| FQ-03 | Page 4: double-pop-out / caption test coverage | The upper damaged-bomber frame remains selected through roughly 02:08–02:36. Finer review finds no caption-touch sequence; a touch on smoke/art near 02:37 precedes closing. No failure is established. | Add an explicit double-tap-on-caption test inside the enlarged frame, verify the mapped source point, and check opening and closing. This is requested interaction coverage, not a confirmed defect or measured timeout. |
| FQ-04 | Page 5: reject non-text artwork during second-level selection | The correct middle-left propeller frame appears at 02:45.5–02:45.9, followed at 02:46.1–02:46.7 by a stable irregular sky/propeller patch containing no caption. | A bubble/caption request must not promote a patch of sky to a text bubble. Check both hit mapping and the bubble detector; retain the confirmed whole-frame identity. |
| FQ-05 | Page 6: complete coverage of all seven panels | Source artwork contains two upper, two middle and three lower panels. Other attempts appear in 02:57–03:09, but absence of a popup in sparse samples is not sufficient to certify individual misses. | Label all seven frames independently and test each at five interior positions. Log any misses or merges precisely; do not claim all seven are broken from this recording. |

FQ-01 was the first detector target. The new phone-target section above now
sets the next priorities; FQ-05's remaining proof gaps stay open.
FQ-03/FQ-04 are a separate interaction track:
the intended second pop-out is a bubble or caption selected from an already
opened frame. It must not be confused with two neighboring comic panels being
merged into one crop.

## Double-pop-out controls and diagnosis

- Page 5's bottom-right frame opens around 02:54.6, followed by its isolated
  narration box around 02:55.3. Keep this as a positive visible example of the
  intended caption capability. Its exact triggering gesture is not logged in
  the video, so do not infer a tap count or classify caption-only zoom as a bug.
- `Reader.handleDoubleTap` intentionally calls `BubbleDetect.extract` and maps
  positions from the enlarged panel back to the source page. Record both screen
  and mapped coordinates, current focus, panel identity, selected route and
  bubble result when reproducing. The recording alone does not prove a mapping
  defect or a detector defect.
- Test: open whole panel; double tap a real caption; close the caption; reopen
  the same panel. Repeat after moving the initial panel tap. Also probe non-text
  sky/artwork and transitions while a result is pending.
- No extra overlay, stale result from a previous page, or neighboring frame
  should become the next focus owner. A dim original page behind a selected
  overlay is normal and is not evidence of two simultaneous pop-out layers.

## Acceptance for each implementation

1. Use the supplied original comic and independently reviewed visible borders;
   one-based reader pages include the cover. Page 6 is image suffix `005`.
2. For each target frame use center, left, right, north and south interior
   probes, including artwork and caption-adjacent locations. Keep single-tap
   frame tests separate from double-tap bubble tests.
3. Verify the selected polygon and rendered crop: complete intended artwork,
   no neighboring panel, and a consistent identity across probe positions.
   Bounds alone cannot certify a sloped border.
4. Re-run all established page-5/page-9/page-13/page-16 controls, then repeat
   consecutive open/close interactions without clearing cache.
5. After local checks, produce a 2.79.xxx test APK for phone review. Mark a
   target phone-confirmed only after the user verifies the corresponding build.

## Earlier backlog remains open

The remaining observations in `video-findings-27912.json` and
`video-findings-27912.md` remain recorded, including unresolved groups on pages
9, 11, 17, 19, 21, 22, 27 and 59. Targeted fixes above do not close whole pages.
Page 36's sheriff inset and stepped overlapping frames still require separate
artwork-based handling. The new recording does not establish whether those
older failures persist in the current runtime.

## Evidence limits

See `video-findings-27915.json` for source hashes and exact sample times. Times
are seconds from the video file, not reliable tap-to-result measurements. The
red recorder clock may round differently. The runtime version is inferred from
the delivered build and feedback sequence; no version screen is shown.
Comic pages and video frames stay outside the repository. Findings are QA only,
never runtime coordinates or comic-specific detector exceptions.
