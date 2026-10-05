# Apocalypse audit and connected-scene handoff

Date: 5 October 2026. User approved retaining these findings and using connected two-frame scenes as an accepted output going forward. This is the authoritative audit checkpoint, replacing the earlier provisional 360+ count and raw-selection coverage estimate.

## Baseline and rules

Frozen detector: Test90 / 2.79.90 at `25fb96b5ee35a7d62ca9d5fd44fdf584995075b0`. All 91 image pages reproduce the same 185 descriptors. All actual `Reader.zoomToPanel` canvas crops were rendered with native canvas and visually reviewed alongside original artwork. The user has approved the acceptance rule; physical Android confirmation of individual results is still pending.

Exactly one complete frame, or exactly two complete adjacent frames continuing the same immediate scene, qualifies. All owned speech, captions and artwork must survive. Time/location jumps, unrelated scenes, composites of three or more frames and damaged crops fail. One pair contributes two covered frames but one accepted pop-out. Prefer existing complete singles; preserve accepted ownership and regression behavior. Pixel geometry proposes groups; manual content review determines narrative continuity.

| Issue | Image pages | Frames | Singles | Pairs | Covered | No qualifying selection | Damaged frames | Remaining |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 24 | 99 | 26 | 3 | 32 | 66 | 1 | 67 |
| 2 | 23 | 97 | 34 | 5 | 44 | 50 | 3 | 53 |
| 3 | 23 | 110 | 42 | 2 | 46 | 43 | 21 | 64 |
| 4 | 21 | 79 | 31 | 0 | 31 | 40 | 8 | 48 |
| Total | 91 | 385 | 133 | 10 | 153 | 199 | 33 | 232 |

Singles-only remainder: 252. Connected-scene remainder: 232. Pair benefit: 20 frames, 5.2 percentage points of inventory coverage, 7.9% of the singles-only remainder. There are 31 damaged selections covering 33 frames: 29 singles and two pairs. The 185 raw selections comprise 162 single candidates, 12 same-scene pair candidates and 11 rejected outputs; 133 singles and 10 pairs are complete.

## Counting conventions

Reader pages are 1-based and include two covers per issue; all eight covers are excluded. A distinct bordered panel or borderless repeated-character narrative vignette counts once. Multiple characters, architectural ornament, multiple captions or a scanning seam in one continuous illustration do not create extra frames. Decorative credits and preview lettering are not frames. Some freeform montages require judgment, especially issue 3 page 21, counted as five reaction/conversation vignettes plus one bottom frame. These are reviewable manual counts.

Important corrections: issue 2 page 13 upper recollection is one continuous frame; issue 4 page 4 skull chamber is one continuous landscape scene despite its scanning seam; issue 4 page 14 tall En/sphinx view is one frame. Issue 3 page 6 tiny selection 5 is a false fragment. Issue 3 page 16 bottom strip and page 20 selection 3 each contain one frame. See page notes for other decisions.

## Accepted connected pairs

Selection IDs match the stored Test90 output order.

| Issue | Reader page | Selection | Immediate scene |
| --- | ---: | ---: | --- |
| 1 | 13 | 1 | Reaction portrait and En over fallen opponent; same fight |
| 1 | 21 | 2 | Baal and En narrow views; same cave conversation |
| 1 | 21 | 3 | Middle and bottom battle views; same exterior fight |
| 2 | 15 | 4 | Logos and Ozy views; same pyramid argument |
| 2 | 16 | 2 | Walking legs and En answer; same cave walk |
| 2 | 16 | 3 | En carrying Baal and following conversation; same cave walk |
| 2 | 20 | 5 | Desert surface and hand breaking earth; same emergence |
| 2 | 23 | 1 | Tall palace view and En below receiving tears; same palace moment |
| 3 | 11 | 5 | En awakening and Nephri explaining; same chamber conversation |
| 3 | 14 | 4 | Ozy answer and Pharaoh shouting; same throne conversation |

Two further semantic pairs are damaged: issue 3 page 6 selection 2 (circle and street), and page 13 selection 5 (mouth and chamber). They remain in the recovery queue. Issue 2 page 12 selection 3 spans an explicit weeks-later transition and is rejected. Larger merges remain rejected even when all their scenes are related.

## Prioritized recovery queue

1. Interior/exterior ownership: page-matte colors inside faces, white clothing, balloons and captions become transparent. Closed interior holes require different handling from true inset holes or gaps between disjoint frame contours. Issue 2 page 16 selection 2 has two legitimate disjoint contours; preserve the gap. Boundary-connected damage also exists, so removing inner rings alone cannot fix all 33 frames.
2. Owned speech crossing gutters: issue 1 page 16 selection 5 loses the top of its speech balloon. Preserve ownership rather than adding every nearby fragment.
3. Larger composites: examples issue 1 page 23; issue 2 pages 8 and 14; issue 3 page 21; issue 4 pages 15 and 17. Recover physical internal borders and insets before grouping at most two.
4. Irregular, olive/grey or jagged gutters, curved reaction insets, page-edge rails and foreground crossings.
5. Landscape/open main scenes around valid accepted inset owners. Do not invent frame divisions at scanning seams.

Recovery notes and prospective pairs in the JSON are hypotheses, not verified improvements. Record repaired existing frames separately from newly detected frames; count only complete reviewed output as a coverage gain.

## Durable evidence and next steps

- [91-page decisions and source hashes](docs/apocalypse-test90-audit.json), with every missing-frame description, rejected selection, crop defect and possible recovery idea.
- Detailed visual report: `Nth-Shelf-Test90-Apocalypse-Audit.html`, Library identity `libfile_c555c384890881919c5dc9c806e89274`.
- Full machine-readable audit with detector contours: `Nth-Shelf-Test90-Apocalypse-Audit.json`, Library identity `libfile_b49577b441e88191a27c7d703bd079e2`.
- Source archive: `Rise of Apocalypse 001-004 (1996) (Digital) (Shadowcat-Empire)(3).zip`, Library identity `libfile_06c168de85c08191ba461ab9ef2cdba5`. Use the hash recorded in the audit when restoring private fixtures.
- Test90 APK identity/build evidence: [versioned handoff](HANDOFF-2.79.90.md), [validation](TEST90-VALIDATION.json); 82 retained suites pass at that checkpoint.

Continue on `Test_Branch`. First implement a bounded pixel/contour ownership repair and review original targets. Preserve complete singles and pairs, avoid borrowing neighboring art or filling true inset holes, then rerun the broader comics/manga fixtures and retained tests. A later versioned handoff should add measured before/after counts and verified APK status while retaining this frozen baseline.
