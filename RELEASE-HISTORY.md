# Nth Shelf release history

The 22 October research phase ended with all 11 graph-only contact owners unresolved across 2,048 assignments. This is not a new repair. The next model needs independently calibrated appearance/scene context; see [research findings](RESEARCH-2026-10-22.md).

Checkpoint history, ordered from oldest to newest. [Return to the current overview](README.md).

## Reading this archive

- [History through Test71](README-through-Test71.md) is preserved in its original file.
- Entries below follow checkpoint number order. Missing numbers are not evidence that a build shipped; only existing repository handoffs are indexed.
- Original notes retain their historical wording, including “current,” “next,” “pending” and old coverage counts. Those statements describe that checkpoint, not today’s status. A later handoff or validation receipt may supersede them.
- Detector selections, complete original frames, singles, pairs and broad groups are different measures. Inventory and acceptance rules changed during the project; counts from different audits must not be combined.
- Reported local checks, compiled APK identity, phone acceptance and performance qualification are separate evidence categories. This documentation reorganization does not rerun or upgrade any validation.

## Test73

[Handoff](HANDOFF-2.79.73.md) · [Validation receipt](TEST73-VALIDATION.json)

### Test73 — shared-boundary completion

Version **2.79.73**, Android code **28001**, isolated package
`io.github.bdredenbach.nthshelf.frametest73`, label **Nth Shelf Test73**.

The previously inactive radius-8 candidate pass is now implemented and validated.
A separate, optional supplement combines measured white-gutter evidence from
accepted neighbors. Candidates must agree across two seed scales away from a
small boundary band. Existing owners are never trimmed, replaced or reordered.
Rooted chains can reach another frame; proximity or an unassigned area alone is
not sufficient. The accepted Test71 detector and its proof-27 route remain intact.

### Original-image results

- Rise of Apocalypse **#3, reader 9/23** (image index 8): **3 to 6** selections.
  Adds the left tall scene and both lower-wide scenes.
- Rise of Apocalypse **#1, reader 19/24** (image index 18): **1 to 2** selections.
  Adds the lower-left scene using measured gutter evidence.
- All **91** supplied Apocalypse page images compared; **89** complete maps
  identical; all **150** earlier descriptors and their order preserved.
  Detected selections increase from **150 to 154**.

The four additions passed 33 touchscreen reader tests; 30 prior-frame touches
also passed. Six resized/mirrored page variants passed their inclusion/exclusion
checks. Local tests retain all previous regression contracts and add rooted-chain,
combined-border, radius-8, malformed-proof and cyclic-proof tests.

These are measured results on the supplied artwork, not a claim that all panels
or all comics work. The historical Wolverine/manga/Magneto original images were
unavailable for a fresh corpus rerun. Phone acceptance of Test73 is pending.

See [validation](TEST73-VALIDATION.json), [handoff](HANDOFF-2.79.73.md), and
[test notes](qa27900/frame-accuracy/test73/README.md). Build status is recorded in
the validation file after the downloaded APK is verified.

## Test74

[Handoff](HANDOFF-2.79.74.md) · [Validation receipt](TEST74-VALIDATION.json)

This checkpoint was absent from the old README summary. Its recorded subject is **Test74 — independently enclosed paper frames**. See the linked handoff for the exact scope, verification and acceptance status.

## Test75

[Handoff](HANDOFF-2.79.75.md) · [Validation receipt](TEST75-VALIDATION.json)

### Test75 — gradient-guided separation of touching frames

Test75 adds a bounded edge-guided watershed supplement. Two seed scales and two contact-window widths must agree exactly; the original RGB edges determine the split where paper-cell scenes touch. The entire foreground statue head stays in the lower throne scene, not partly in the upper pyramid scene on **Rise of Apocalypse #1, reader8/24**. Earlier detector paths and owner descriptors remain unchanged. See [validation](TEST75-VALIDATION.json), [handoff](HANDOFF-2.79.75.md), and [contracts](qa27900/frame-accuracy/test75/README.md).

Identity: **2.79.75 /28003**, package `io.github.bdredenbach.nthshelf.frametest75`, label **Nth Shelf Test75**. The original-artwork corpus comparison and browser touch/crop checks are recorded separately from CI and physical Android acceptance. This is an incremental expansion, not a claim that all panels now work.

## Test76

[Handoff](HANDOFF-2.79.76.md) · [Validation receipt](TEST76-VALIDATION.json)

### Test76 — chromatic shared-border separation

Test76 adds an append-only separator for two scenes enclosed by one connected chromatic perimeter but divided by a strong black shared edge. Two independently eroded seed cores must produce the same bounded minimum-barrier watershed, prior owners are never reassigned, and weak/open/flat/broad-bridge negatives are rejected. On the supplied Rise of Apocalypse corpus this adds exactly two complete owners on issue 4 reader 14/21 while retaining all 161 Test75 selections. See [handoff](HANDOFF-2.79.76.md) and [contracts](qa27900/frame-accuracy/test76/README.md).

Identity: **2.79.76 / 28004**, package `io.github.bdredenbach.nthshelf.frametest76`, label **Nth Shelf Test76**. This is an incremental detector checkpoint, not a claim of universal panel coverage.

## Test77

[Handoff](HANDOFF-2.79.77.md) · [Validation receipt](TEST77-VALIDATION.json)

### Test77 — narrow black inset rails

Test77 adds an append-only four-rail detector for independently enclosed black-bordered insets. It requires nearly continuous thin dark rails with two-sided contrast, textured/color interior evidence, no prior-owner overlap, and a one-analysis-pixel safety inset. The narrow-ink proof uses **version 33** so Test76's accepted chromatic shared-border proof32 owners continue to route unchanged. On the supplied Rise of Apocalypse corpus it adds exactly one complete inset on issue 1 reader 12/24: the SKRITCH hand scene including the yellow OR SO THEY HOPED caption.

Identity: **2.79.77 / 28005**, package `io.github.bdredenbach.nthshelf.frametest77`, label **Nth Shelf Test77**. The accepted Test76 count is 163; this checkpoint raises the saved count to 164 pending phone acceptance.

## Test78

[Handoff](HANDOFF-2.79.78.md) · [Validation receipt](TEST78-VALIDATION.json)

### Test78 — empty-map isolated boundary recovery

Test78 scales an already-proven detector path instead of loosening a new threshold. Only after every established panel-owner route leaves a page empty, it asks the retained ragged-gutter detector for its strict proof-version-20 `independent-boundary-cell` recovery. Exactly one valid contour may be published; any existing owner, multiple recovery candidates, or malformed proof leaves the map unchanged.

Across the **39** still-empty maps in the supplied Rise of Apocalypse corpus, the exact recovery pass fires on only two pages: issue 2 reader **18/23** (isolated upper-right hand/scarab scene) and issue 4 reader **21/21** (isolated upper-right close-up/caption scene). The other 37 empty maps remain empty. The saved corpus count therefore moves from **164 to 166** while all 164 Test77 owners retain priority. Both additions survive 0.67x, 1.25x and horizontal-mirror source transforms.

Identity: **2.79.78 / 28006**, package `io.github.bdredenbach.nthshelf.frametest78`, label **Nth Shelf Test78**. This is an incremental detector checkpoint; physical Android acceptance is pending.

## Test79

[Handoff](HANDOFF-2.79.79.md) · [Validation receipt](TEST79-VALIDATION.json)

### Test79 — stable top-row dual-barrier recovery

Test79 recovers a three-panel top row when the established detector already owns only lower-page contour cells and a conservative cooperative pass proves one narrow top anchor plus one merged top region. A second, independent interrupted-paper corridor supplies the missing separator. Two measured barriers are used only to split seed ownership; final contours are re-grown from the original artwork and must remain valid under three barrier half-widths (0, 1, and 2 analysis pixels).

On the supplied 91-page Rise of Apocalypse corpus, this pattern fires on exactly one page: issue 3 reader **4**, where it adds the three missing top panels. All three additions are pixel-disjoint from each other and from the two established lower-page owners. The corpus checkpoint therefore moves from **166 to 169** owners. The route also survives horizontal mirroring, 1.25x source scaling, and JPEG quality 0.82 recompression. A deliberately harsher 0.67x pre-resample loses the anchor proof and safely returns no additions rather than guessing.

Identity: **2.79.79 / 28007**, package `io.github.bdredenbach.nthshelf.frametest79`, label **Nth Shelf Test79**. Physical Android acceptance is pending.

## Test80

[Handoff](HANDOFF-2.79.80.md) · [Validation receipt](TEST80-VALIDATION.json)

### Test80 — stable full-width torn-paper tiers

Test80 adds a conservative horizontal-tier route for portrait pages where the established detector has exactly one owner and the artwork contains two or three strong white-paper separators. The separators are used only as temporary seed barriers. Final contours are re-grown from source pixels by the retained ragged-gutter detector and must remain valid and geometrically stable at barrier half-widths 0, 1, and 2. Exactly one recovered tier must match the established owner; that owner is retained byte-for-byte and only the other tiers are appended.

Across the supplied 91-page Rise of Apocalypse corpus, the route fires on exactly two one-owner pages: issue 2 reader **15/23**, which gains three panels (1 → 4), and issue 4 reader **3/21**, which gains two panels (1 → 3). The checkpoint therefore moves from **169 to 174** owners. Both targets keep the same additions after 0.67x and 1.25x source scaling, horizontal mirroring, and JPEG quality-82 recompression.

Identity: **2.79.80 / 28008**, package `io.github.bdredenbach.nthshelf.frametest80`, label **Nth Shelf Test80**. Physical Android acceptance is pending.

## Test82

[Handoff](HANDOFF-2.79.82.md) · [Validation receipt](TEST82-VALIDATION.json)

### Test82 — independently enclosed contour recovery

Test82 adds a conservative contour supplement: independent ragged-gutter seed radii must agree, each boundary needs local paper/matte or ink evidence, internal dividers veto merged scenes, and additions must be pixel-disjoint from existing owners. The reader preserves the complete validated contour. Runtime detection contains no book or page lookups.

Across the supplied 91-page Rise of Apocalypse corpus, this environment's native-canvas replay measures **175 → 179** frames with every prior descriptor preserved. The saved **174** checkpoint is a separate measurement. Three new saved-checkpoint targets are issue 1 readers **7/24** and **17/24**, and issue 3 reader **10/23**; issue 2 reader **18/23** is a fallback restoration of an already accepted frame. Issue 3 reader 10 abstains on the reduced-scale and JPEG-recompressed variants. Test82 was accepted by the user; an updated phone count was not supplied, and the 360+ goal remains incomplete.

Identity: **2.79.82 / 28010**, package `io.github.bdredenbach.nthshelf.frametest82`, label **Nth Shelf Test82**. See [handoff](HANDOFF-2.79.82.md), [validation](TEST82-VALIDATION.json), and [contracts](qa27900/frame-accuracy/test82/README.md).

## Test83

[Handoff](HANDOFF-2.79.83.md) · [Validation receipt](TEST83-VALIDATION.json)

### Test83 — context-stable enclosed-cell recovery

Test83 adds a conservative supplement that discovers complete cells in local page windows. Two independent seed radii and an expanded window must agree; the original page must prove the perimeter, and existing frames keep exclusive ownership. The reader preserves the new complete contour. Runtime detection contains no book or page lookups.

The 230-page local supplement comparison preserves all **851** existing frame descriptors. A separate full-detector replay confirms Apocalypse **179 → 180** across all 91 pages; the only new target is issue 3 reader **23/23**, the lower-right scene. Wolverine, manga chapter32 and Magneto gain no new frames. Test82 was accepted by the user; no updated phone count was supplied. Physical Test83 acceptance is pending, and the **360+ goal remains incomplete**.

Identity: **2.79.83 / 28011**, package `io.github.bdredenbach.nthshelf.frametest83`, label **Nth Shelf Test83**. See [handoff](HANDOFF-2.79.83.md), [validation](TEST83-VALIDATION.json), and [contracts](qa27900/frame-accuracy/test83/README.md).

## Test84

[Handoff](HANDOFF-2.79.84.md) · [Validation receipt](TEST84-VALIDATION.json)

### Test84 — enclosed scenes with interior ink strokes

Test84 recovers modest, independently enclosed scenes when a short stroke inside the artwork falsely triggers the divider veto. Two global seed radii and the original perimeter must agree. Boundary-reaching lines, long separators, paper corridors and independently enclosed insets still veto additions; existing ownership keeps priority.

The 230-page native-raster supplement comparison preserves all **852** prior descriptors and adds two pixel-disjoint frames: Apocalypse **180→181**, issue 2 reader **22/23** complete bottom panel; Wolverine **383→384**, source 018/reader 19 complete narrow upper-left syringe scene. Manga and Magneto remain unchanged. The full 91-page Apocalypse replay confirms all 180 prior owners unchanged and 181 total. All 76 retained suites and Android CI checks pass; the downloaded APK and all 87 packaged web files match the verified build. Source-transform results and build details are in [validation](TEST84-VALIDATION.json). The **360+ goal remains incomplete**; phone acceptance is pending.

Identity: **2.79.84 / 28012**, package `io.github.bdredenbach.nthshelf.frametest84`, label **Nth Shelf Test84**. See [handoff](HANDOFF-2.79.84.md) and [contracts](qa27900/frame-accuracy/test84/README.md).

## Test88

[Handoff](HANDOFF-2.79.88.md) · [Validation receipt](TEST88-VALIDATION.json)

### Test88 — closed frames in gradient gutters

Test88 follows locally smooth exterior colors around thin frame borders, then requires stable complete contours, source-pixel side evidence, retained divider/inset checks and zero prior-owner overlap. It adds the complete upper-left tall scene on Rise of Apocalypse issue2 reader **17/23**, including all speech balloons. The actual published Test84 → Test88 detector target passes **0→1**; original, mirrored, reduced/enlarged and JPEG82 sources recover the frame.

All **78** retained/new suites pass. A separate 312-page comparison preserves all **1,278** saved Test87 descriptors and adds one frame; the unpublished Test87 implementation is unavailable, so this APK builds on exact published Test84 source. The full 91-page published Test84 → Test88 replay passes **181→182**, with every old descriptor unchanged. Android CI, signature, package identity and all **88** packaged web files pass; the downloaded artifact/source bytes are independently verified. General frame detection, the **360+ goal** and phone acceptance remain pending. Identity: **2.79.88 / 28016**, isolated package `io.github.bdredenbach.nthshelf.frametest88`, label **Nth Shelf Test88**. See [handoff](HANDOFF-2.79.88.md), [validation](TEST88-VALIDATION.json) and [contracts](qa27900/frame-accuracy/test88/README.md).

## Test89

[Handoff](HANDOFF-2.79.89.md) · [Validation receipt](TEST89-VALIDATION.json)

### Test89 — neighbor-witnessed page-edge scenes

Test89 recovers a tall scene whose outline meets one vertical and one horizontal page edge. Two independent seed contours must agree, the remaining perimeter needs source-paper/ink evidence, and an already validated neighboring frame supplies the boundary witness. Internal dividers, enclosed insets and existing ownership still veto additions. Runtime detection contains no book or page lookup.

The current phone target is **Rise of Apocalypse #1, reader 4/24**: the complete tall horse-and-rider scene at the far right, including its upper speech balloon and both yellow captions. The rejected page-13 experiment joined two scenes and is not shipped. Test88's accepted gradient-gutter scene and all earlier detector routes remain packaged.

All **80** retained/new suites pass. The full **91-page** Test88 → Test89 Apocalypse replay preserves all **182** earlier descriptors and adds the complete page-4 scene, reaching **183**. A separate **221-page** supplement comparison retains **1,094** cached Wolverine/Magneto/manga descriptors with no additions. The target survives mirroring, enlargement and JPEG82 recompression; a 0.67x pre-resample safely abstains when candidate proof is lost. General frame coverage remains incomplete.

Identity: **2.79.89 / 28017**, isolated package `io.github.bdredenbach.nthshelf.frametest89`, label **Nth Shelf Test89**. Android CI, signature, identity and all **89** packaged reader files pass; downloaded APK/source bytes are independently verified. Test89 phone acceptance is pending. See [handoff](HANDOFF-2.79.89.md), [validation](TEST89-VALIDATION.json), and [contracts](qa27900/frame-accuracy/test89/README.md).

## Test90

[Handoff](HANDOFF-2.79.90.md) · [Validation receipt](TEST90-VALIDATION.json)

### Test90 — individual frames and connected scenes

**2.79.90** adds the complete **SWAK** strip on Apocalypse issue 2, reader **18/23**, and tests one pop-out containing the two neighboring lower-right scenes on issue 1, reader **13/24**. Their whole contour preserves the artwork that crosses between them. The same individual-frame improvement also recovers four Wolverine scenes.

The full Apocalypse replay preserves all **183** earlier selections and reaches **185 raw selections**. The subsequent audit below establishes usable coverage and finds that the SWAK selection loses interior facial artwork, so it still needs crop repair. All **82** retained/new suites pass; phone confirmation remains pending. See [test history](HANDOFF-2.79.90.md), [validation](TEST90-VALIDATION.json) and [contracts](qa27900/frame-accuracy/test90/README.md).

### Historical grouping-quality rule and Test90 Apocalypse baseline — 5 October 2026

The later per-frame counting rule supersedes this historical grouping restriction for reporting. Brad originally accepted **one complete frame, or exactly two adjacent frames continuing the same immediate scene, in one pop-out** as the criterion going forward. Preserve all owned artwork, captions and speech balloons. Unrelated scenes, meaningful time/location jumps, three-or-more-frame composites and damaged crops do not qualify. A pair is one pop-out and two covered frames. Prefer separate complete frames when available; the new rule does not authorize merging already accepted owners or weakening regressions.

The complete Test90 audit covers all **91 image pages** across four Rise of Apocalypse issues, excluding eight covers. The manual narrative-frame inventory contains **385 frames**. Freeform montage/vignette counts are review judgments, not publisher counts.

| Issue | Narrative frames | Complete singles | Complete connected pairs | Frames covered | Frames left |
| --- | ---: | ---: | ---: | ---: | ---: |
| 1 | 99 | 26 | 3 | 32 | 67 |
| 2 | 97 | 34 | 5 | 44 | 53 |
| 3 | 110 | 42 | 2 | 46 | 64 |
| 4 | 79 | 31 | 0 | 31 | 48 |
| Total | **385** | **133** | **10** | **153** | **232** |

Singles alone leave **252**; allowing connected pairs leaves **232**, an improvement of **20 covered frames**. The remaining 232 consist of **199 frames without a qualifying selection** and **33 frames in damaged crops** (29 singles and two pairs). All **185 raw detector selections** reproduce in the fresh replay; raw selection count is not usable frame coverage. The earlier 360+ inventory and 186-covered estimate are superseded by this audit.

Priorities: preserve interior artwork/dialogue mistaken for matte, split larger composites, recover irregular/colored gutters, and recover open/landscape scenes around accepted neighbors. Record new singles, pairs, repaired crops and remaining frames separately. Narrative continuity requires manual review; pixel geometry alone cannot establish it. Phone confirmation remains pending.

Future chats should start with [project memory](PROJECT-MEMORY.md), [audit handoff](HANDOFF-APOCALYPSE-AUDIT.md), and the [91-page findings](docs/apocalypse-test90-audit.json). Private artwork remains outside git and CI.

## Test91

[Handoff](HANDOFF-2.79.91.md) · [Validation receipt](TEST91-VALIDATION.json)

### Test91 — bounded crop repair, 5 October 2026

**2.79.91** restores interior artwork and dialogue that the Reader's matte mask cut away, with matching tap and bubble boundaries. Conservative source-page/Reader-crop review credits **12 repaired single frames**: Apocalypse usable coverage rises **153 → 165**, leaving **220 of 385 frames**. Detector selection count stays **185**; there are no newly detected frames or newly credited pairs in this checkpoint. The remaining 21 damaged frames and 199 frames without a qualifying selection stay in the queue. Phone acceptance is pending.

The isolated Test91 APK is built and verified from commit `2478d49`: Android CI, browser interaction, backup, native archive, signature/identity and all 92 packaged web files pass. 84 retained/new suites pass. Fresh replays cover **312 pages / 1,283 selections** across Apocalypse, Wolverine, Magneto and three manga chapters. Pixel checks preserve original artwork, detector descriptors and all other detected owners; they do not prove semantic acceptance of every modified mask. See [Test91 handoff](HANDOFF-2.79.91.md), [crop decisions](qa27900/frame-accuracy/test91/crop-review.json), and [validation/build status](TEST91-VALIDATION.json).

## Test92

[Handoff](HANDOFF-2.79.92.md) · [Validation receipt](TEST92-VALIDATION.json)

### Test92 — independent scenes and intact captions, 5 October 2026

**2.79.92** separates two lower scenes on Apocalypse issue 2 reader 12 that previously popped together across a time transition. Their captions remain whole. The same reusable source-gutter rule separates the already credited walking-legs/En pair on reader 16 into individual pop-outs.

Raw selections: **185 → 187**. Complete local coverage: **165 → 167 / 385**, leaving **218** (197 without a qualifying selection and 21 damaged frames). Only reader 12 contributes new coverage; reader 16 preserves its existing two-frame credit. Phone acceptance is pending. Test92 was recovered and published together with Test93; the verified Test93 APK retains these splits. The prior Test91 crop repair remains unchanged.

312-page comparisons retain Wolverine, Magneto and all three manga chapters without selection changes. All original pixels survive the two split parents, captions are assigned atomically, and fresh Apocalypse crop checks add no other detected owner's pixels. See [Test92 handoff](HANDOFF-2.79.92.md), [review](qa27900/frame-accuracy/test92/crop-review.json), and [validation/build status](TEST92-VALIDATION.json).

## Test93

[Handoff](HANDOFF-2.79.93.md) · [Validation receipt](TEST93-VALIDATION.json)

### Test93 — complete crossing speech, 5 October 2026

**2.79.93**, prepared locally, keeps the complete “We Sandstormers…” balloon with Apocalypse issue 1 reader **16/24**'s walking-away scene. Its preceding scene retains its artwork. Test92's recovered gutter splits remain included. Local usable coverage is **168 / 385**, leaving **217**; raw selections stay **187**. This checkpoint repairs one single frame and adds no selection.

All **88** retained/new behavioral suites pass. Fresh source-raster supplement comparisons over the retained maps cover **312 pages / 1,285 selections**; only the two reviewed Apocalypse owners change. The changed target also passes a full detector rerun. Broader experimental routes earned no further complete-frame credit and were excluded. See [Test93 handoff](HANDOFF-2.79.93.md) and [validation](TEST93-VALIDATION.json).

**Test92 and Test93 are published.** Brad explicitly authorized the push and APK build on 5 October 2026. Published checkpoint `3a3c287` matches the tested local source tree exactly; [Android CI](https://github.com/bdredenbach/Nth-Shelf/actions/runs/37370172377) passed, including browser/backup and native checks. The downloaded `Nth-Shelf-2.79.93-Test93.apk` is verified: separate Test93 identity, signature record, checksum and all 94 packaged web files. Phone acceptance remains pending. See [continuation findings](docs/test93-continuation.md).

## Test94

[Handoff](HANDOFF-2.79.94.md) · [Validation receipt](TEST94-VALIDATION.json)

### Test94 — complete street artwork, 5 October 2026

**2.79.94** repairs Apocalypse issue 3 reader **6**, selection **2**: the complete circular En view and connected street scene, including the wall/people artwork and both street balloons. False selection **5** is retired using source perimeter and artwork-continuity evidence. The right scene retains all non-speech artwork. Test93 speech, Test92 splits and Test91 crop repairs remain active.

Local complete coverage is **170 / 385**, leaving **215**; raw selections decrease **187 → 186**. This is one repaired connected pair, zero newly detected frames, and one removed false selection. The 312-page fresh-source supplement comparison changes only this page; Wolverine, Magneto and three manga chapters retain identical descriptors. The changed page passes a full detector rerun and real Reader crop review. All 90 suites pass locally and in CI; source `f9a68b6` is published and the [isolated Android build](https://github.com/bdredenbach/Nth-Shelf/actions/runs/37374620934) succeeded. The downloaded Test94 APK is saved and verified against its checksum, signature/identity record and all 95 packaged web files. Build and phone status are recorded in [validation](TEST94-VALIDATION.json) and [handoff](HANDOFF-2.79.94.md). Phone acceptance remains pending.

## Test95

[Handoff](HANDOFF-2.79.95.md) · [Validation receipt](TEST95-VALIDATION.json)

### Test95 — complete water-and-hand frame, 5 October 2026

**2.79.95** completes Apocalypse issue 2 reader **18**, selection **1**, preserving its full wrist, palm, both balloons and background. Two source transition tests witness the closed dark-matte enclosure; all original pixels survive and other owners are unchanged. SWAK remains in the queue.

Available pop-out selections: **186** (same measure as the earlier 185, including incomplete crops). Complete narrative frames: **171 / 385**, leaving **214**; 151 singles plus ten complete pairs contribute 171 frames across 161 complete pop-outs. This repairs one existing single frame and adds no selection. Fresh source-raster supplements over 312 retained pages change only this owner; Wolverine, Magneto and three manga chapters retain identical descriptors. The changed target passes a full detector replay and actual Reader review. All 92 behavioral suites plus the cache/package check pass locally. Published source `bb4ea14` exactly matches the tested source tree. [Android CI](https://github.com/bdredenbach/Nth-Shelf/actions/runs/37378324461) succeeded; the downloaded isolated Test95 APK is verified against its checksum, signature/identity record and all 96 packaged web files. [Validation/build status](TEST95-VALIDATION.json) and [handoff](HANDOFF-2.79.95.md) track publication and APK verification. Brad phone-confirmed the Test95 hand/water repair on 5 October 2026; phone timing remains unmeasured.

### Apocalypse phone sweep — confirmed 5 October 2026

Brad confirmed **189 complete frames** in the full phone sweep, matching the fresh 91-page Test95 regression. Dual-frame pop-outs count two; larger groups count each complete original frame once. **186 selections**, **384 original frames**, **195 incomplete or unavailable**. See [fresh handoff](HANDOFF-APOCALYPSE-TEST95-REGRESSION.md) and [page findings](docs/apocalypse-test95-regression.json). Historical checkpoint counts below used earlier grouping rules. Phone timing remains unmeasured.

## Test96

[Handoff](HANDOFF-2.79.96.md) · [Validation receipt](TEST96-VALIDATION.json)

### Test96 — complete ragged-row dialogue, 5 October 2026

Apocalypse issue4 Reader5 selection2 now retains the entire speaker-owned balloon chain. Its neighboring strip keeps its own dialogue and all non-body artwork. This repairs one existing single frame: **190/384 complete, phone-confirmed**, **194 remaining**, **186 selections**. The **189-frame full phone sweep** remains the confirmed Test95 baseline; Brad confirmed Test96 and the count of 190 on phone on 5 October 2026; phone timing remains unmeasured. Source `91e9dd0` is published; Android run `37385546862` succeeded. The downloaded isolated APK is verified against its checksum/identity/signature record and all 97 exact packaged web files. Fresh source-raster comparisons of all 312 saved maps change only these two owners, and full target detection plus actual Reader crop checks pass. See [handoff](HANDOFF-2.79.96.md) and [validation/build record](TEST96-VALIDATION.json).

## Test97

[Handoff](HANDOFF-2.79.97.md) · [Validation receipt](TEST97-VALIDATION.json)

### Test97 — complete city-scene captions, 5 October 2026

Apocalypse issue4 Reader20 selection1 now retains all opening captions and their lettering. Test96's phone-confirmed **190/384** baseline becomes **191/384 locally**, **193 remaining**, **186 selections**; Brad phone-confirmed Test97 at **191/384**, **193 remaining**, on 5 October 2026. This is one recovered complete frame in an existing pop-out. The Reader restores source-enclosed chromatic caption bodies and includes their extent without changing discovery proofs. The other four target-page canvases are byte-identical to Test96. Published source `2f191f08` exactly matches the tested tree; Android run `37389515841` succeeded. The downloaded Test97 APK matches its checksum, identity/signature record and all97 frozen web files. See [handoff](HANDOFF-2.79.97.md), [per-frame delta](docs/apocalypse-test97-delta.json) and [validation/build record](TEST97-VALIDATION.json).

## Test98

[Handoff](HANDOFF-2.79.98.md) · [Validation receipt](TEST98-VALIDATION.json)

### Test98 — complete explosion speech balloon, 5 October 2026

Apocalypse issue4 Reader18 selection4 now retains its complete opening explosion balloon, including the long zigzag tail. The accepted Test97 baseline is **191/384**, **193 remaining**; Test98 is **192/384 phone-confirmed**, **192 remaining**, **186 selections**; Brad accepted it on 5 October 2026. Source enclosure, two tail openings and two body-collar witnesses restore the whole speech body to one proven neighboring row. Discovery is unchanged. S1/S2 canvases are identical; S3 loses only its546-pixel foreign speech fragment and remains incomplete. All98 behavioral suites and312-page native Reader checks passed. Published source7bd0d1f2 exactly matches the tested tree; Android run37393752703 succeeded. The downloaded APK matches its checksum, isolated identity, signing record and all98 frozen web files. See [handoff](HANDOFF-2.79.98.md), [frame delta](docs/apocalypse-test98-delta.json) and [validation](TEST98-VALIDATION.json).

## Test99

[Handoff](HANDOFF-2.79.99.md) · [Validation receipt](TEST99-VALIDATION.json)

### Test99 — complete column-crossing speech chain, 5 October 2026

Apocalypse issue3 Reader13 selection1 now retains its entire enclosed flirting / Osiris balloon chain. Brad phone-confirmed Test99 on 5 October 2026: **193/384 complete original frames**, **191 remaining**, **186 selections**. This is the accepted baseline for the next pass; phone timing remains unmeasured. A short speech tail at two opening scales and two terminal collars witnesses one proven adjacent-column owner. Only speech pixels transfer; source artwork outside that body and discovery descriptors are unchanged. S2 loses only its917-pixel foreign fragment and remains incomplete. All99 behavioral suites, the cache/package contract and312-page/1,284-selection Reader comparisons pass. Published source `bf588874` matches the tested tree; [Android run37396911201](https://github.com/bdredenbach/Nth-Shelf/actions/runs/37396911201) succeeded. The downloaded APK matches its checksum, compiled isolated identity, CI-verified signer record and all99 exact packaged web files. See [handoff](HANDOFF-2.79.99.md), [frame delta](docs/apocalypse-test99-delta.json) and [validation](TEST99-VALIDATION.json).

## Test100

[Handoff](HANDOFF-2.79.100.md) · [Validation receipt](TEST100-VALIDATION.json)

### Test100 — complete jagged crossing speech, 5 October 2026

Apocalypse issue3 Reader13 selection2 now retains the complete opening DO NOT GRASP balloon and zigzag tail. The phone-confirmed Test99 baseline is **193/384**, **191 remaining**; Test100 locally reaches **194/384**, **190 remaining**, **186 selections**, phone-confirmed on6 October2026. A separate substantial-tail route requires two agreeing tail/core measurements, exclusive terminal ownership and two body-collar witnesses between proven columns. Only enclosed speech transfers; S3 loses its foreign fragment while retaining its own dialogue and artwork. All101 behavioral suites plus cache/package and syntax checks pass. Fresh native Reader comparisons cover 312 pages/1,284 selections; only the two intended speech owners change. Published source `177ed19b` matches the tested tree; [Android run37403679715](https://github.com/bdredenbach/Nth-Shelf/actions/runs/37403679715) succeeded. The downloaded APK matches its checksum, isolated compiled identity/signature record and all99 packaged web files. See [handoff](HANDOFF-2.79.100.md), [frame delta](docs/apocalypse-test100-delta.json) and [validation](TEST100-VALIDATION.json).

## Test101

[Handoff](HANDOFF-2.79.101.md) · [Validation receipt](TEST101-VALIDATION.json)

### Test101 — complete hand/wrist row,6 October2026

Brad phone-confirmed Test100 at **194/384,190 remaining**. Test101 locally reaches **195/384,189 remaining**, phone-confirmed by Brad on6 October2026. Apocalypse issue3 Reader13 S5 now includes the full continuous hand/wrist/face row and complete lower chamber:two original frames in one existing pop-out. S6 remains a duplicate fragment worth zero. Source-enclosed bounded composite completion preserves discovery, all existing display pixels and other selections. All103 behavioral suites plus cache/package/syntax and312-page/1,284-selection native comparisons pass; only the intended crop changes. Nine neighboring canvases match Test100 and all ten target selections remain reachable. Published source `58eff0d7` matches the tested tree;[Android run37407535020](https://github.com/bdredenbach/Nth-Shelf/actions/runs/37407535020) succeeded. Downloaded APK checksum,identity/signature record and all100 packaged web files match. See [handoff](HANDOFF-2.79.101.md), [frame delta](docs/apocalypse-test101-delta.json) and [validation](TEST101-VALIDATION.json).

## Test102

[Handoff](HANDOFF-2.79.102.md) · [Validation receipt](TEST102-VALIDATION.json)

### Test102 — complete SWAK reaction frame,6 October2026

Brad phone-confirmed Test101 at195/384. Test102 reaches **196/384,188 remaining**, phone-confirmed by Brad on 6 October2026. Apocalypse issue2 Reader18 S2 restores the full right background and shoulder. The existing water-and-hand crop and earlier accepted targets remain unchanged. Generic bounded lateral source completion preserves discovery and existing display pixels, expands the native crop and supports the first tap in recovered artwork.  All105 behavioral suites plus cache/package/syntax and312-page/1284-selection final native comparisons pass. Only SWAK changes:+7697 pixels,zero removed,zero new foreign-display overlap.11 native canvases match Test101,all12 targets are reachable. [Android run37467779710](https://github.com/bdredenbach/Nth-Shelf/actions/runs/37467779710) succeeded;the downloaded checksum,compiled isolated identity,v2 certificate/CI record and all101 frozen web files match. See [handoff](HANDOFF-2.79.102.md), [frame delta](docs/apocalypse-test102-delta.json) and [validation](TEST102-VALIDATION.json) for actual check/build outcomes.

## Test103

[Handoff](HANDOFF-2.79.103.md) · [Validation receipt](TEST103-VALIDATION.json)

### Test103 — two landscape-frame recoveries, 6 October 2026

Phone-confirmed Test102 at 196/384 advances to **198/384, 186 remaining**, phone-confirmed by Brad on 6 October 2026. Apocalypse issue 1 Reader 18 gains the complete wide punch scene (S3) and standing-silhouette scene at left (S4). The adjacent En portrait remains clipped and adds zero. Existing selections stay intact. The generic landscape paper-cell supplement requires agreeing source masks, measured four-sided boundaries and exclusive ownership. All 107 behavioral suites plus cache/package/syntax pass locally and in CI. Fresh source-raster comparisons over 312 retained discovery maps preserve all 1,284 earlier Reader masks and add exactly two selections; the changed page also reproduces its four-selection full detector map. Twenty original native canvases are byte-identical and all 22 control/target selections are reachable. Published source `83ca4716` matches the tested tree. [Android run 37474402314](https://github.com/bdredenbach/Nth-Shelf/actions/runs/37474402314) succeeded; the downloaded checksum, compiled isolated identity, v2 certificate/CI record and all 102 frozen web files match. See [handoff](HANDOFF-2.79.103.md), [frame delta](docs/apocalypse-test103-delta.json) and [validation](TEST103-VALIDATION.json).

## Test104

[Handoff](HANDOFF-2.79.104.md) · [Validation receipt](TEST104-VALIDATION.json)

### Test104 — two upper landscape originals, 6 October 2026

Brad phone-confirmed Test103 at **198/384, 186 remaining**. Test104 targets two further original frames on Apocalypse issue 1 Reader page 18: the complete upper cavern and the full left dialogue strip beneath it, in new selection 5. Four earlier selections retain their displayed pixels. The right dialogue strip is incomplete and adds zero. **200/384, 184 remaining**, phone-confirmed by Brad on 6 October 2026. All 109 behavioral suites plus cache/package/syntax pass. Fresh retained-source comparisons cover 312 pages and preserve 1,286 earlier displayed masks, with exactly one appended group. All 91 Apocalypse pages receive final ownership-context checks; the other 221 pages are unchanged passthrough controls. Twenty-two earlier native canvases are byte-identical, all 23 selections reachable, and the new displayed mask has zero prior-owner overlap. Fresh full detection reproduces the changed five-selection page. Published source `e47c26ab` matches the tested tree. [Android run 37481696070](https://github.com/bdredenbach/Nth-Shelf/actions/runs/37481696070) succeeded. CI: 109 suites, browser/backup, native archive and package/signature checks passed; downloaded checksum, compiled isolated identity, v2 signer/CI record and all 103 frozen web files match. See [handoff](HANDOFF-2.79.104.md), [frame delta](docs/apocalypse-test104-delta.json) and [validation](TEST104-VALIDATION.json).

## Test105

[Handoff](HANDOFF-2.79.105.md) · [Validation receipt](TEST105-VALIDATION.json)

### Test105 — two portrait-page fight originals, 6 October 2026

Brad phone-confirmed Test104 at **200/384, 184 remaining**. Test105 recovers Apocalypse issue 1 Reader page 13's central sword-fight and lower-left attack in new selection 2. The existing bottom-right pair remains intact; the partial upper-left attacker portrait adds zero. **202/384, 182 remaining**, phone-confirmed by Brad on 6 October 2026. All111 behavioral suites plus cache/package/syntax passed. Retained-source comparisons preserve all1,287 earlier displayed masks across312 pages; one new group is appended. Twenty-four earlier native canvases remain byte-identical, all25 selections reachable, zero new displayed-owner overlap. Fresh full detection reproduces the changed page. Published source `98490a7b` matches the tested tree. [Android run 37487129419](https://github.com/bdredenbach/Nth-Shelf/actions/runs/37487129419) succeeded; CI 111 suites, browser/backup, native archive and package/signature checks passed. Downloaded APK matches isolated compiled identity and all 104 frozen web assets. See [handoff](HANDOFF-2.79.105.md), [frame delta](docs/apocalypse-test105-delta.json) and [validation](TEST105-VALIDATION.json).

## Test106

[Handoff](HANDOFF-2.79.106.md) · [Validation receipt](TEST106-VALIDATION.json)

### Test106 — five complete originals, 6 October 2026

Test105 is phone-confirmed at202/384. Test106 completes the top attack on Apocalypse issue1 Reader13 and four right-hand conversation/Logos originals on issue2 Reader10. **207/384 phone-confirmed,177 remaining**. The tall Nephri silhouette and narrow attacker portrait remain incomplete and add zero. Earlier owners are preserved. All113 suites plus cache/package/syntax passed;312-page final source comparisons preserve all1,288 earlier displayed masks. Twenty-five earlier native canvases unchanged;29 selections reachable and zero new overlap. Both targets pass full detection replay. Published source `600583c8` matches the tested tree. [Android run37492597346](https://github.com/bdredenbach/Nth-Shelf/actions/runs/37492597346) succeeded; downloaded APK identity,v2 signature and all105 frozen web files match. Phone-confirmed by Brad on6 October2026. See [handoff](HANDOFF-2.79.106.md), [frame delta](docs/apocalypse-test106-delta.json) and [validation](TEST106-VALIDATION.json).

## Test107

[Handoff](HANDOFF-2.79.107.md) · [Validation receipt](TEST107-VALIDATION.json)

### Test107 — ten complete original frames, 6 October 2026

Brad phone-confirmed Test106 at207/384. Four new pop-outs preserve ten complete originals on Apocalypse issue1 Reader3(3),Reader4(1),Reader11(4),Reader19(2): **217/384 locally,167 remaining**,198 Apocalypse selections,184 credited groups. All captions, balloons and scene artwork remain intact. A generic dual-scale stable exterior-group rule admits measured paper/color boundaries and page-edge closure while preserving earlier source/display pixels. Printed credits and partial eye/cartouche add zero. Test107 phone acceptance pending; timing unmeasured. Local validation:115 behavioral suites plus cache/package/syntax passed. Original-raster comparison of312 retained Test106 maps preserves all1,292 earlier display masks; final certified source subset appends4 Apocalypse selections, yielding1,296. A final rejection-only palette gate removes one achromatic Wolverine candidate; crop behavior is unchanged. Final source supplementation confirms its rejection. Wolverine,Magneto and all three manga chapters retain their selection maps. Five earlier native canvases are byte-identical; all9 targets are reachable, with zero new displayed overlap. All four changed pages reproduce final discovery through fresh complete detector replay. No full-corpus rerun of the older underlying detector is claimed. Published source `b3c36ae3` matches the tested tree. [Android run37498880250](https://github.com/bdredenbach/Nth-Shelf/actions/runs/37498880250) succeeded; downloaded APK identity,v2 signature and all106 frozen web files match. Phone confirmation pending. See [handoff](HANDOFF-2.79.107.md), [delta](docs/apocalypse-test107-delta.json), and [validation](TEST107-VALIDATION.json).

## Test108

[Handoff](HANDOFF-2.79.108.md) · [Validation receipt](TEST108-VALIDATION.json)

### Test108 — ten more complete original frames,6 October2026

Brad phone-confirmed Test107 at217/384. Four new pop-outs recover ten complete originals: Apocalypse issue1 Reader14 S5/S6(3),Reader17 S2(4),issue2 Reader4 S2(3): **227/384 locally,157 remaining**,202 selections,188 credited groups. A generic stable trailing-edge cell rule preserves prior source and display ownership. Partial earlier-owner speech,printed title/credits/copyright earn zero. Test108 phone acceptance pending;timing unmeasured. Local validation:117 behavioral suites plus cache/package/syntax passed. Original-raster comparison of312 certified Test107 maps preserves all1,296 earlier Reader displayed masks. Exactly4 new Apocalypse selections yield1,300 across the corpus; Wolverine,Magneto and three manga chapters retain their selection maps. One rejected-candidate residue in an intermediate Wolverine map was corrected against the certified baseline, and its final source/Reader row rechecked. Six earlier native canvases are byte-identical; all10 target selections reachable with zero new displayed overlap. All three changed pages reproduce final discovery through fresh full detector replay. Source-independent positive,missing-ink,missing-page-edge and achromatic-exterior negatives pass. No full-corpus rerun of the older underlying detector is claimed. Published source `26d5c797` matches the tested tree. [Android run37504895502](https://github.com/bdredenbach/Nth-Shelf/actions/runs/37504895502) succeeded; downloaded APK identity,v2 signature and all107 frozen web files match. Phone confirmation pending. See [handoff](HANDOFF-2.79.108.md),[delta](docs/apocalypse-test108-delta.json),[validation](TEST108-VALIDATION.json).

## Test109

[Handoff](HANDOFF-2.79.109.md) · [Validation receipt](TEST109-VALIDATION.json)

### Test109 — ten more complete original frames, 6 October 2026

Brad phone-confirmed Test108 at227/384. Four new pop-outs recover ten complete originals: issue1 Reader7 S2(1),issue3 Reader7 S3(3),Reader18 S3(4),Reader22 S1(2). **237/384 locally,147 remaining**,206 selections,192 credited groups. A stable paper-cell rule reunites a touching tall fragment and keeps whole enclosed speech. Three older displays shed foreign fragments; their accepted originals retain their artwork. Test109 phone acceptance pending; timing unmeasured. [Handoff](HANDOFF-2.79.109.md),[delta](docs/apocalypse-test109-delta.json),[validation](TEST109-VALIDATION.json). Local validation:120 behavioral suites plus cache/package/syntax passed. Final recovery and Reader comparison on312 original source rasters retain all1300 earlier source descriptors and1297 earlier displayed masks. Exactly3 earlier displays lose only foreign fragments,with all pixels outside the proven new source/enclosed speech preserved. Four new Apocalypse selections yield1304; Wolverine,Magneto and all three manga chapters retain their masks. Four changed pages reproduce discovery through fresh full detector replay. Nine native selections are reachable;two earlier canvases byte-identical,three foreign-fragment corrections,zero new displayed overlap. Source-independent frontier/speech positives and malformed/ambiguous/partial/unenclosed/unlettered negatives pass. No full-corpus rerun of the older underlying detector is claimed. Published source `16bdde1c` matches tested tree. [Android run37510051452](https://github.com/bdredenbach/Nth-Shelf/actions/runs/37510051452) succeeded; downloaded APK identity,v2 signature and all108 frozen web files verified. Test109 phone confirmation pending.

## Test110

[Handoff](HANDOFF-2.79.110.md) · [Validation receipt](TEST110-VALIDATION.json)

### Test110 — nine additional frame credits,6 October2026

Recovered the completed Test109 checkpoint after the previous chat timed out. Nine additional local credits yield **246/384,138 remaining**: eight newly recovered originals on issue2 Reader22 and issue3 Reader10, plus a previously uncredited issue4 Reader18 S3 verified complete in the unchanged Reader crop. Test109/Test110 phone acceptance remains pending; last explicit phone acceptance is Test108227/384. Generic dual-radius neutral-matte source groups preserve earlier owners and internal boundaries. Local validation:122 behavioral suites plus cache/package/syntax passed. Final recovery and Reader comparisons on312 original rasters retain all1304 earlier source descriptors and displayed masks. Exactly3 new Apocalypse selections yield1307; Wolverine, Magneto and all three manga chapters retain their masks. Both changed pages reproduce discovery through fresh full detector replay. Nine native canvases are reachable; six earlier crops byte-identical,zero new displayed overlap. Issue4 Reader18 S3 audit credit has no runtime change. No full-corpus rerun of the older underlying detector is claimed. Published source643fe6b220d20629a2f19a8c81dd0a5ba5d2a088 matches tested tree3bc5a4bcbe3f76b6ca0755caa4647ce798367b49. Android run37517552313 succeeded: https://github.com/bdredenbach/Nth-Shelf/actions/runs/37517552313. CI122 suites,cache/package/syntax,browser/backup,native streaming archive and frozen web/signature/identity checks passed. Artifact11437523404. Downloaded isolated APK identity,v2 signer/CI certificate record,checksum and all109 frozen web files match tested source. See [handoff](HANDOFF-2.79.110.md), [frame delta](docs/apocalypse-test110-delta.json) and [validation](TEST110-VALIDATION.json).

## Test111

[Handoff](HANDOFF-2.79.111.md) · [Validation receipt](TEST111-VALIDATION.json)

This checkpoint was absent from the old README summary. Its recorded subject is **Test111 / 2.79.111 — nine complete original recoveries**. See the linked handoff for the exact scope, verification and acceptance status.

## Test112

[Handoff](HANDOFF-2.79.112.md) · [Validation receipt](TEST112-VALIDATION.json)

This checkpoint was absent from the old README summary. Its recorded subject is **Test112 / 2.79.112 — nine complete original recoveries**. See the linked handoff for the exact scope, verification and acceptance status.

## Test113

[Handoff](HANDOFF-2.79.113.md) · [Validation receipt](TEST113-VALIDATION.json)

### Test113 — nine more complete originals, 6 October 2026

Brad phone-confirmed Test112 at264/384. Test113 recovers nine complete originals in two broad page-spanning groups: issue3 Reader8 S1(+5) and issue4 Reader11 S1(+4), yielding273/384 locally,111 remaining,225 selections. Generic source enclosure evidence on previously unselected pages retains all internal borders, white speech and peripheral artwork. Groups are larger than individual panels; grouping usability is separate from original coverage. Test113 phone acceptance and timing remain pending. [Handoff](HANDOFF-2.79.113.md), [frame delta](docs/apocalypse-test113-delta.json), [validation](TEST113-VALIDATION.json). All129 retained suites and312 original-source/Reader comparisons pass; all1,322 earlier descriptors and masks are unchanged. Both new groups reproduce through full detector replay and native Reader crops, with zero new displayed overlap. Android run37533421774 succeeded; the downloaded APK identity, actual v2 signer and all113 packaged web files match source7e56c9afe52f475d18a01444e3ae84087322b330.

## Test114

[Handoff](HANDOFF-2.79.114.md) · [Validation receipt](TEST114-VALIDATION.json)

### Test114 — nine more complete originals

Test114 locally reaches282/384,102 remaining from the273 working baseline. Issue2 Reader9 S2(+4), issue4 Reader7 S1(+4), issue4 Reader19 S3(+1). Two broad groups and one speech completion; duplicate originals count zero. Group usability and phone acceptance remain pending. [Handoff](HANDOFF-2.79.114.md), [delta](docs/apocalypse-test114-delta.json), [validation](TEST114-VALIDATION.json).

Test114 build verified: all132 retained checks,312 source/Reader comparisons, three fresh detector runs, three native crops, browser/backup/native archive and Android CI pass. Correct isolated package, APK v2 CI signature record and all115 frozen web bytes verified after download. Source af2ea6b7089eb600a569a1662e3ab94c5b8d2ec5; APK SHA2561caec8db0500344cd0dcc622410fb5dc4bb134ac77e6b74d613e4f6f5d11067e. Review and handoff are saved; see TEST114-VALIDATION.json. Phone acceptance, grouping usability and timing pending.

## Test115

[Handoff](HANDOFF-2.79.115.md) · [Validation receipt](TEST115-VALIDATION.json)

Current continuation: [Test115](HANDOFF-2.79.115.md). Brad supplied282/384 for Test114; Test115 locally reaches291/384,93 remaining. Three new groups: issue2 Reader6(+3), Reader11(+4), issue3 Reader11 S6(+2; two duplicates add zero).230 selections. Earlier descriptors and Reader crops stay unchanged; source overlap is intentional. Read TEST115-VALIDATION.json for actual validation and APK identities. Phone acceptance, group usability and timing pending.

Test115 APK verified: all134 retained checks,312 source/Reader comparisons, three fresh detector runs, three byte-identical native group envelopes and five unchanged earlier canvases. CI browser/backup and native archive pass. Source109ce5fd3cefd23f2feb868400db16f0f152503b; downloaded APK SHA25669ffbf1ceedf1f244f7a9218ec654eb4da08b00eb45c950f99ebcd28149df6f4. Actual isolated identity, v2 signer against CI record and all117 frozen packaged web files verified. Review and handoff saved; see TEST115-VALIDATION.json. Phone acceptance, grouping usability and timing pending.

## Test116

[Handoff](HANDOFF-2.79.116.md) · [Validation receipt](TEST116-VALIDATION.json)

Current continuation: [Test116](HANDOFF-2.79.116.md), locally300/384,84 remaining from Test115 local291. Nine new complete originals in three groups: issue1 Reader12 S3(+3), issue2 Reader10 S4(+1), issue3 Reader19 S1(+5).233 selections. Earlier source/display/tap priority remains intact. Six duplicate originals and sphinx/halo decoration add zero. See TEST116-VALIDATION.json. Phone acceptance, group usability and timing pending.

Test116 APK verified:136 retained checks,312 source/Reader comparisons, three fresh detector runs, three byte-identical native source envelopes and five unchanged earlier canvases. CI browser/backup and native archive pass. Source4c091e45c1e40f43a69805ddb4c5ae0bd6441efc; downloaded APK SHA2563e6ef43e8fb344ad439689fade6caa1e4fbe4c89d360fa94d36422a48fd6d959. Actual isolated identity, v2 signer against CI record and all118 frozen packaged web files verified. See TEST116-VALIDATION.json. Phone acceptance, grouping usability and timing pending.

## Test117

[Handoff](HANDOFF-2.79.117.md) · [Validation receipt](TEST117-VALIDATION.json)

This checkpoint was absent from the old README summary. Its recorded subject is **Test117 / 2.79.117 — nine complete original recoveries**. See the linked handoff for the exact scope, verification and acceptance status.

## Test118

[Handoff](HANDOFF-2.79.118.md) · [Validation receipt](TEST118-VALIDATION.json)

This checkpoint was absent from the old README summary. Its recorded subject is **Test118 /2.79.118 — nine complete original recoveries**. See the linked handoff for the exact scope, verification and acceptance status.

## Test119

[Handoff](HANDOFF-2.79.119.md) · [Validation receipt](TEST119-VALIDATION.json)

This checkpoint was absent from the old README summary. Its recorded subject is **Test119 / 2.79.119 — nine complete original recoveries**. See the linked handoff for the exact scope, verification and acceptance status.

## Test120

[Handoff](HANDOFF-2.79.120.md) · [Validation receipt](TEST120-VALIDATION.json)

Current continuation: Test120 /2.79.120 — Brad requests ONE frame at a time, or at most TWO with immediate continuity, comic by comic. New strict focus baseline for Apocalypse#1:36/99,63 remaining; Test120 campfire P03-F2/Reader3 S1 yields37/99,62 remaining (29 singles +4 pairs). All32 previously qualifying steps and50 other native issue1 crops stay intact. Whole-page groups with3+ frames, meaningful partial neighbors and clipped lettering fail. Old83/99 and327/384 remain historical artwork-preservation counts, not focused reading readiness. Nine-original cadence is superseded. Read HANDOFF-2.79.120.md and TEST120-VALIDATION.json for exact local/build/phone state. Phone acceptance and automatic reading remain pending.

## Test121

[Handoff](HANDOFF-2.79.121.md) · [Validation receipt](TEST121-VALIDATION.json)

Current test: [Test121 single/dual checkpoint](HANDOFF-2.79.121.md). Two originals recovered as one immediate direction/sandstorm continuity pair on Rise of Apocalypse #1 Reader3. Local focus39/99,60 remaining; all prior qualifying pop-outs retained. Test120 campfire user-confirmed; Test121 pair phone review pending. Read TEST121-VALIDATION.json for build/verification facts.

## Test122

[Handoff](HANDOFF-2.79.122.md) · [Validation receipt](TEST122-VALIDATION.json)

Current checkpoint: HANDOFF-2.79.122.md and TEST122-VALIDATION.json.

Test122 recovers ONE original, Reader5 S1/P05-F1 night camp. Current focused count30 singles+5 pairs=40/99 originals;59 remain,35 qualifying steps/53 selections. Test121 direction/sandstorm pair user-confirmed: "Yes that worked 💪🏻 Let's continue". Test122 phone acceptance pending. Next Reader5 P05-F2 horsemen conversation, one original by default or at most a justified immediate pair. Finish comic1 before comic2. Automatic playback/timer remain planned.

## Test123

[Handoff](HANDOFF-2.79.123.md) · [Validation receipt](TEST123-VALIDATION.json)

This checkpoint was absent from the old README summary. Its recorded subject is **Test123 — one complete horsemen conversation original**. See the linked handoff for the exact scope, verification and acceptance status.

## Test124

[Handoff](HANDOFF-2.79.124.md) · [Validation receipt](TEST124-VALIDATION.json)

This checkpoint was absent from the old README summary. Its recorded subject is **Test124: one complete round portrait**. See the linked handoff for the exact scope, verification and acceptance status.

## Test125

Source-only lower mounted-frame checkpoint; the handoff distinguishes future package configuration from a compiled APK.

[Handoff](HANDOFF-2.79.125.md) · [Validation receipt](TEST125-VALIDATION.json)

This checkpoint was absent from the old README summary. Its recorded subject is **Test125 — source-only lower mounted frame**. See the linked handoff for the exact scope, verification and acceptance status.

## Test126

Bulk recovery began with 54 originals still needing fixes; this was not a completed bulk task.

[Handoff](HANDOFF-2.79.126.md) · [Validation receipt](TEST126-VALIDATION.json)

This checkpoint was absent from the old README summary. Its recorded subject is **Test126 — bulk56 checkpoint1, source only**. See the linked handoff for the exact scope, verification and acceptance status.

## Test127

[Handoff](HANDOFF-2.79.127.md) · [Validation receipt](TEST127-VALIDATION.json)

This checkpoint was absent from the old README summary. Its recorded subject is **Test127 — atomic speech ownership; no APK**. See the linked handoff for the exact scope, verification and acceptance status.

## Test128

[Handoff](HANDOFF-2.79.128.md) · [Validation receipt](TEST128-VALIDATION.json)

This checkpoint was absent from the old README summary. Its recorded subject is **Test128 — ornate training inset; no APK**. See the linked handoff for the exact scope, verification and acceptance status.

## Test129

[Handoff](HANDOFF-2.79.129.md) · [Validation receipt](TEST129-VALIDATION.json)

This checkpoint was absent from the old README summary. Its recorded subject is **Test129 — source ownership checkpoint; no APK**. See the linked handoff for the exact scope, verification and acceptance status.

## Test130

[Handoff](HANDOFF-2.79.130.md) · [Validation receipt](TEST130-VALIDATION.json)

This checkpoint was absent from the old README summary. Its recorded subject is **Test130 — excluded speech and saved-map ownership; no APK**. See the linked handoff for the exact scope, verification and acceptance status.

## Test131

[Handoff](HANDOFF-2.79.131.md) · [Validation receipt](TEST131-VALIDATION.json)

This checkpoint was absent from the old README summary. Its recorded subject is **Test131 source checkpoint — bulk task in progress**. See the linked handoff for the exact scope, verification and acceptance status.

## Test132

[Handoff](HANDOFF-2.79.132.md) · [Validation receipt](TEST132-VALIDATION.json)

Current source checkpoint: [Test132](HANDOFF-2.79.132.md). Reader18's complete lower dialogue pair restores the full forehead.38 singles+8 pairs=54/99 originals;45 remain. All166 retained suites and58 native overlays pass, with all45 earlier accepted crops unchanged. Source-only: no APK, Gradle or workflow dispatch. Phone confirmation and automatic frame playback remain pending. [Validation](TEST132-VALIDATION.json).

## Test133

[Handoff](HANDOFF-2.79.133.md) · [Validation receipt](TEST133-VALIDATION.json)

Current source checkpoint: Test133, complete source-witnessed caption-gutter ownership.55/99 original frames covered;44 remain. See HANDOFF-2.79.133.md. Source only; no new APK.

## Test134

[Handoff](HANDOFF-2.79.134.md) · [Validation receipt](TEST134-VALIDATION.json)

Current source checkpoint: Test134, complete page-edge rail cell. 56/99 original frames covered; 43 remain. See HANDOFF-2.79.134.md. Source only; no new APK.

## Test135

[Handoff](HANDOFF-2.79.135.md) · [Validation receipt](TEST135-VALIDATION.json)

Current source checkpoint: Test135, complete upper cavern paper cell. 57/99 original frames covered; 42 remain. See HANDOFF-2.79.135.md. Source only; no new APK.

## Test136

[Handoff](HANDOFF-2.79.136.md) · [Validation receipt](TEST136-VALIDATION.json)

Current source checkpoint: Test136, complete round general reaction and atomic lettering. 58/99 original frames covered; 41 remain. See HANDOFF-2.79.136.md. Source only; no new APK.

## Test137

[Handoff](HANDOFF-2.79.137.md) · [Validation receipt](TEST137-VALIDATION.json)

Current source checkpoint: Test137, separate complete eye-sword inset and lightning scene. 60/99 original frames covered; 39 remain. See HANDOFF-2.79.137.md. Source only; no new APK.

## Test138

[Handoff](HANDOFF-2.79.138.md) · [Validation receipt](TEST138-VALIDATION.json)

Current source checkpoint: Test138, complete right court portrait with projecting crown. 61/99 original frames covered; 38 remain. See HANDOFF-2.79.138.md. Source only; no new APK.

## Test139

[Handoff](HANDOFF-2.79.139.md) · [Validation receipt](TEST139-VALIDATION.json)

Current source checkpoint: Test139, complete left court portrait at its oblique foreground boundary. 62/99 original frames covered; 37 remain. See HANDOFF-2.79.139.md. Source only; no new APK.

## Test140

[Handoff](HANDOFF-2.79.140.md) · [Validation receipt](TEST140-VALIDATION.json)

Current source checkpoint: Test140, complete lower court composition with whole crossing dialogue. 63/99 original frames covered; 36 remain. See HANDOFF-2.79.140.md. Source only; no new APK.

## Test141

[Handoff](HANDOFF-2.79.141.md) · [Validation receipt](TEST141-VALIDATION.json)

Current source checkpoint: Test141, shared upper warning pair and complete lower relic scene. 66/99 original frames covered; 33 remain. See HANDOFF-2.79.141.md. Source only; no new APK.

## Test142

[Handoff](HANDOFF-2.79.142.md) · [Validation receipt](TEST142-VALIDATION.json)

Current source checkpoint: Test142, complete second-row dialogue singles. 68/99 original frames covered; 31 remain. See HANDOFF-2.79.142.md. Source only; no new APK.

## Test143

[Handoff](HANDOFF-2.79.143.md) · [Validation receipt](TEST143-VALIDATION.json)

Current source checkpoint: Test143, complete reaction inset and collapse scene. 70/99 original frames covered; 29 remain. See HANDOFF-2.79.143.md. Source only; no new APK.

## Test144

[Handoff](HANDOFF-2.79.144.md) · [Validation receipt](TEST144-VALIDATION.json)

Current source checkpoint: Test144, complete adjacent dialogue pair. 72/99 original frames covered; 27 remain. See HANDOFF-2.79.144.md. Source only; no new APK.

## Test145

[Handoff](HANDOFF-2.79.145.md) · [Validation receipt](TEST145-VALIDATION.json)

Current source checkpoint: Test145, complete capped-rim baby-hand cell. 73/99 original frames covered; 26 remain. See HANDOFF-2.79.145.md. Source only; no new APK.

## Test146

[Handoff](HANDOFF-2.79.146.md) · [Validation receipt](TEST146-VALIDATION.json)

Current source checkpoint: Test146, complete rounded crowd strip. 74/99 original frames covered; 25 remain. See HANDOFF-2.79.146.md. Source only; no new APK.

## Test147

[Handoff](HANDOFF-2.79.147.md) · [Validation receipt](TEST147-VALIDATION.json)

Current source checkpoint: Test147, complete shared-seam attack singles. 79/105 original frames covered; 26 remain. See HANDOFF-2.79.147.md. Source only; no new APK.

## Test148

[Handoff](HANDOFF-2.79.148.md) · [Validation receipt](TEST148-VALIDATION.json)

Current source checkpoint: Test148, complete chromatic side portrait. 80/105 original frames covered; 25 remain. See HANDOFF-2.79.148.md. Source only; no new APK.

## Test149

[Handoff](HANDOFF-2.79.149.md) · [Validation receipt](TEST149-VALIDATION.json)

Current source checkpoint: Test149, complete lower attack original. 81/105 original frames covered; 24 remain. See HANDOFF-2.79.149.md. Source only; no new APK.

## Test150

[Handoff](HANDOFF-2.79.150.md) · [Validation receipt](TEST150-VALIDATION.json)

Current source checkpoint: Test150, complete corner portrait and linked action scenes. 85/105 original frames covered; 20 remain. See HANDOFF-2.79.150.md. Source only; no new APK.

## Test151

[Handoff](HANDOFF-2.79.151.md) · [Validation receipt](TEST151-VALIDATION.json)

Current source checkpoint: Test151, complete stone-rimmed departure original. 86/105 original frames covered; 19 remain. See HANDOFF-2.79.151.md. Source only; no new APK.

## Test152

[Handoff](HANDOFF-2.79.152.md) · [Validation receipt](TEST152-VALIDATION.json)

Current source checkpoint: Test152, preserve authenticated taps and complete lower inset action pair. 88/105 original frames covered; 17 remain. See HANDOFF-2.79.152.md. Source only; no new APK.

## Test153

[Handoff](HANDOFF-2.79.153.md) · [Validation receipt](TEST153-VALIDATION.json)

Current source checkpoint: Test153, complete procession and Baal action pair. 90/105 original frames covered; 15 remain. See HANDOFF-2.79.153.md. Source only; no new APK.

## Test154

[Handoff](HANDOFF-2.79.154.md) · [Validation receipt](TEST154-VALIDATION.json)

Current source checkpoint: Test154, complete tall stone-rimmed conversation. 91/105 original frames covered; 14 remain. See HANDOFF-2.79.154.md. Source only; no new APK.

## Test155

Added the exterior camp scene bounded by the two authenticated stone cells, preserving the earlier inset outputs.

[Handoff](HANDOFF-2.79.155.md) · [Validation receipt](TEST155-VALIDATION.json)

This checkpoint was absent from the old README summary. Its recorded subject is **Test155: complete exterior camp scene**. See the linked handoff for the exact scope, verification and acceptance status.

## Test156

Reused validation only for exact current detector-issued articulated owners; copied or restored owners retained full validation. Geometry did not change.

[Handoff](HANDOFF-2.79.156.md) · [Validation receipt](TEST156-VALIDATION.json)

This checkpoint was absent from the old README summary. Its recorded subject is **Test156: faster first opening for source-issued articulated frames**. See the linked handoff for the exact scope, verification and acceptance status.

## Test157

Separated the two terminal originals and retired the broad host from selection; local coverage reached 94/105 with 11 remaining.

[Handoff](HANDOFF-2.79.157.md) · [Validation receipt](TEST157-VALIDATION.json)

This checkpoint was absent from the old README summary. Its recorded subject is **Test157: two terminal originals and reliable settled closes**. See the linked handoff for the exact scope, verification and acceptance status.

## Test158

A speed-only checkpoint with Test157 geometry and coverage unchanged; it did not recover another original.

[Handoff](HANDOFF-2.79.158.md) · [Validation receipt](TEST158-VALIDATION.json)

This checkpoint was absent from the old README summary. Its recorded subject is **Test158: faster source-issued96 verification, unchanged coverage**. See the linked handoff for the exact scope, verification and acceptance status.

## Test159

The later approval note in this handoff supersedes its original pending-review title: both city/palace and feline inset previews were approved, bringing accepted coverage to 96/105.

[Handoff](HANDOFF-2.79.159.md) · [Validation receipt](TEST159-VALIDATION.json)

This checkpoint was absent from the old README summary. Its recorded subject is **Test159: city and rounded inset pop-outs — later approved**. See the linked handoff for the exact scope, verification and acceptance status.

## Test160

The later approval note supersedes the original pending-review title: the baby-discovery preview was approved, bringing accepted coverage to 97/105.

[Handoff](HANDOFF-2.79.160.md) · [Validation receipt](TEST160-VALIDATION.json)

This checkpoint was absent from the old README summary. Its recorded subject is **Test160: baby-discovery pop-out — later approved**. See the linked handoff for the exact scope, verification and acceptance status.

## Test161

The middle crowd preview was approved; accepted coverage reached 98/105.

[Handoff](HANDOFF-2.79.161.md) · [Validation receipt](TEST161-VALIDATION.json)

This checkpoint was absent from the old README summary. Its recorded subject is **Test161: middle crowd pop-out — approved**. See the linked handoff for the exact scope, verification and acceptance status.

## Test162

The sacrifice discussion preview was approved; accepted coverage reached 99/105.

[Handoff](HANDOFF-2.79.162.md) · [Validation receipt](TEST162-VALIDATION.json)

This checkpoint was absent from the old README summary. Its recorded subject is **Test162: sacrifice discussion pop-out — approved**. See the linked handoff for the exact scope, verification and acceptance status.

## Test163

Baal with baby was approved, establishing 100/105 accepted originals and authorization for the final five-frame batch and APK at that time.

[Handoff](HANDOFF-2.79.163.md) · [Validation receipt](TEST163-VALIDATION.json)

This checkpoint was absent from the old README summary. Its recorded subject is **Test163 approved; final batch authorized**. See the linked handoff for the exact scope, verification and acceptance status.

## Test164

Upper corpse checkpoint: local coverage 101/105; accepted visual baseline remained 100/105 pending regression.

[Handoff](HANDOFF-2.79.164.md) · [Validation receipt](TEST164-VALIDATION.json)

This checkpoint was absent from the old README summary. Its recorded subject is **Test164: Upper corpse — final batch checkpoint**. See the linked handoff for the exact scope, verification and acceptance status.

## Test165

Circular general reaction checkpoint: local coverage 102/105; accepted visual baseline remained 100/105 pending regression.

[Handoff](HANDOFF-2.79.165.md) · [Validation receipt](TEST165-VALIDATION.json)

This checkpoint was absent from the old README summary. Its recorded subject is **Test165: Circular general reaction — final batch checkpoint**. See the linked handoff for the exact scope, verification and acceptance status.

## Test166

Narrow standing figure checkpoint: local coverage 103/105; accepted visual baseline remained 100/105 pending regression.

[Handoff](HANDOFF-2.79.166.md) · [Validation receipt](TEST166-VALIDATION.json)

This checkpoint was absent from the old README summary. Its recorded subject is **Test166: Narrow standing figure — final batch checkpoint**. See the linked handoff for the exact scope, verification and acceptance status.

## Test167

Red warrior/sword inset checkpoint: local coverage 104/105; accepted visual baseline remained 100/105 pending regression.

[Handoff](HANDOFF-2.79.167.md) · [Validation receipt](TEST167-VALIDATION.json)

This checkpoint was absent from the old README summary. Its recorded subject is **Test167: Red warrior and sword inset — final batch checkpoint**. See the linked handoff for the exact scope, verification and acceptance status.

## Test168

[Handoff](HANDOFF-2.79.168.md) · [Validation receipt](TEST168-VALIDATION.json)

Current regression build: Test168 /2.79.168, locally complete105/105 originals (88 selections). Separate Test168 APK built; phone acceptance pending. See [handoff](HANDOFF-2.79.168.md) and [validation receipt](TEST168-VALIDATION.json). Cold/overall one-second timing remains unfinished.

## Source173: accepted detector baseline

[Handoff](HANDOFF-DETECTOR-SOURCE173.md). Reconstructed from Test168 web assets and the accepted combined detector patch; the reconstruction does not reproduce the old local commit identity. The native audit records 97/97 taps, 73 usable singles, 19 groups and three partial/wrong story targets. Browser/compositor and phone lifecycle/performance qualification were still pending in this handoff. Source173 is not an APK version.

## Source176: published shared-lettering candidate

[Handoff](HANDOFF-DETECTOR-SOURCE176.md). The Git checkpoint explicitly labels source176 **UNACCEPTED**. It records 97/97 native receipts opening, complete shared lettering and an independent inset, with 94 crops/styles matching source173. Its provisional story grade is not accepted coverage; actual rendering qualification was pending. The handoff also records that the lost source175 boat improvement was absent from this source checkpoint. Later deliveries outside this Git history must be reconciled before treating that queue as current.

## Later delivered candidates: recovery boundary

The published Git checkpoint above was followed by separate deliveries. The recovered Test179 handoff explicitly compares against Test178 and preserves the later boat, lettering-group and inset results. This archive does not invent missing Test174–178 release receipts or treat a source checkpoint number as proof of a corresponding APK. Refer to recovered delivery evidence for their exact identities and acceptance status.

## Test179: exact repeat-search reuse and new issue audit

[Recovered handoff](HANDOFF-2.79.179.md). An isolated candidate, neither promoted nor pushed in its recorded state; source173 remains accepted. All 171 known fixed-tap PNGs/styles match Test178. The new Apocalypse issue 3 audit has 110 tap outcomes, 106 opening, with four misses and additional incomplete, contaminated or review-needed outputs. No new-issue geometry repair was included in this speed candidate.

Exact completed-search reuse improves identical-repeat native handler median from 6.583 s to 0.324 s; first/nearby searches remain costly. The measurements are not phone timings. The signed Test179 APK is a verified Test178-shell repack rather than a Gradle rebuild. Browser/compositor, actual Worker/IndexedDB, Android rendering and restart/phone interactions remain unqualified. Continue with the landscape title-page misses and whole speech/foreground ownership while preserving known outputs, as detailed in the handoff.

## 22 October 2026: recovery and unreleased caption repair

The delivered Test179 source and evidence were recovered and verified against the APK. The README was separated into current status and this chronological history, preserving the earlier checkpoint details and links. Source173 remains the accepted detector baseline.

The unreleased [caption repair](qa27900/frame-accuracy/test180/README.md) completes issue 3 page 3's clipped narration. Final native replay covers 281 Test179 taps plus 88 recovered issue 1 taps: only the intended caption crop changes. Three issue 1 differences from historical Test168 are inherited, explicitly recorded, and not counted as repaired tap outcomes. Independent guard review, 52 new controls and retained synthetic/navigation checks pass. This checkpoint is not a new APK, Git publication, promotion, or browser/phone acceptance.

## 22 October 2026, later: source-cell ownership research

[Research checkpoint](RESEARCH-2026-10-22.md). The qualified caption candidate remains unchanged. Independent printed-frame controls prevent promotion of an incomplete winding-only proposal. Exact native graph/face audits recover a closed neighboring source cell, but attached-stroke ownership remains unresolved. Recovered pre-growth components reproduce the upstream contamination with byte-identical detector output, so missing metadata is not the fix. No additional pop-out, APK, Git publication or acceptance is claimed. The next design needs independent source-cell ownership and explicit ambiguity, not broader clipping or majority labels.

## 22 October 2026: source candidate publication

Recovered Test179, the native-qualified caption repair, public synthetic controls and current documentation are checkpointed on `candidate/test179-caption-repair-20261022`. This source publication does not promote the candidate, build an APK, qualify another ownership repair, or establish browser/phone acceptance. Source173 remains the accepted baseline. Earlier statements about unpublished work describe their historical checkpoints.


## 24 October 2026: regression evidence hardening and missing-scene audit

Added a dependency-free, fail-closed native regression evidence gate and synthetic corruption tests. The gate binds current runtime assets, runner, source, tap inputs, independent reference and actual PNG artifacts; it does not reuse cached pass decisions. An independent seven-tap native replay matches its separately frozen baseline, with three opens and four inherited misses. This is test-tooling validation, not a new frame repair or full-suite qualification.

The four issue 3 title-page misses correspond to three intended scenes. Two additional taps reach an already existing narrow standing-figure candidate; that is newly measured existing behavior, not recovered artwork. Other experimental speech, protrusion and balloon-rim branches remain unpromoted after incomplete or contaminated results. The stored historical 281-row references lack the stronger raw/final-style evidence for all 277 opened rows; their original narrower comparisons are not retroactively invalidated or upgraded. Source173 remains accepted; the caption source remains unchanged. No APK, merge, release or phone acceptance is included.
