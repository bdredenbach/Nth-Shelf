# Phone findings after 2.79.16 Test 1

Recording: `179317.mp4` (184.38 seconds). Runtime inferred from the delivered
build; no version screen appears. Page numbers include the cover. Structured
evidence and source hash: [video-findings-27916.json](video-findings-27916.json).

## Next targets

| ID | Page | Approximate video time | Observed issue |
| --- | --- | --- | --- |
| FQ-06 | 12 | 02:47, 02:48, 02:52, 03:01 | Separate bottom-left Wolverine/planes and bottom-right searchlight panels: Repeated overlays include both bottom panels and the divider. The right searchlight panel opens alone around 178 seconds. The middle strip opens separately at 165.6–166.2 seconds. |
| FQ-07 | 7 | 01:19, 01:22 | Complete red bomber/action strip above the bottom Wolverine panel: A crop emphasizes the bomber/left portion; another isolates the red right side and its caption. Neither should define a new panel inside the continuous printed strip. |
| FQ-08 | 9 | 01:51, 01:54, 01:56 | Three upper panels: Upper-left seated Wolverine and the two upper-right frames are returned together. |
| FQ-09 | 10 | 02:15, 02:17, 02:19 | Upper motorcycle and two right-hand inset/overlapping frames: The upper group opens as one rectangle, including both right-hand images. Source artwork has staggered, overlapping frame borders; a simple shared-rail partition is not sufficient evidence. |
| FQ-10 | 11 | 02:28, 02:30 | Top forest strip and middle portrait/fortification panels: The pop-out includes the top strip plus both middle panels. |
| FQ-11 | 11 | 02:31 | Reject snowy fortification/fence artwork as a caption: An irregular white snow region with repeated X-shaped fortifications becomes a second-level cutout without text. Local BubbleDetect.detect reproduces accepted non-text regions at four independently selected source points. |

Prioritize FQ-06 (repeated page-12 neighbor merge), then FQ-07 and the upper
groups on pages 9–11. FQ-11 is a separate bubble-selection target. Keep the
remaining page-6 proof coverage in FQ-05 open.

## Results to preserve

- Page 3: the recording shows all five complete strips, including the pilot
  narration/left artwork, around 00:07, 00:10, 00:12, 00:14 and 00:17.
- Page 5: the six individual frames open across approximately 00:28–00:43.
- Page 6: bottom-middle and bottom-right open separately around 01:03 and
  01:05–01:06. Top-right gun/boot and narrow bottom-left also visibly open
  around 00:50–00:51 and 01:00. These are successful individual openings,
  not proof of consistent whole-frame selection at all five positions.
- Page 9: lower-right frames remain visibly separate around 02:08 and 02:11.
- Page 12: top-left, top-right and middle strip have successful openings;
  the searchlight panel can also open alone. Preserve those results while
  removing the bottom-pair composite.
- Keep prior confirmed page-13/page-16 controls; this recording does not
  revisit them.

This recording does not establish full caption open/close confirmation on
pages 4–5, nor a complete five-position phone sweep. Do not close FQ-03/FQ-04
solely from absence of a visible failure.

## Diagnostic evidence

The saved 2.79.16 page-map comparison already contains coarse composite
rectangles over the upper groups on pages 9, 10 and 11. That is consistent
with the visible merges, but does not identify the exact phone route. The
next implementation must log identity, fallback and final crop separately.

On original page 11, `BubbleDetect.detect` accepts snow at normalized taps
(0.70, 0.32), (0.80, 0.32), (0.70, 0.36), and (0.80, 0.36), all at threshold
235. The repeated X-shaped artwork can satisfy the current letter-layout
heuristic. This is a detector false positive independently of phone mapping;
it does not establish that every irregular crop has the same cause. Add
these as artwork negatives without rejecting short legitimate speech.

## Verification required for fixes

Use independently labelled printed borders, five interior positions,
consecutive open/close interactions and all previous confirmed controls.
Keep frame selection separate from caption selection. Page 10 has overlapping
borders, so do not replace them with invented shared-edge rectangles.

The video contains no audio. Review used one-second samples throughout and
0.2-second samples around page 12’s middle-strip/bottom-pair sequence. Times
identify visual examples, not latency measurements or exact tap counts. Comic
artwork, screenshots and the recording stay out of the repository and APK.
