# Nth Shelf

A local-first comic reader and personal comic library for Android and the web.

## Test89 — neighbor-witnessed page-edge scenes

Test89 recovers a tall scene whose outline meets one vertical and one horizontal page edge. Two independent seed contours must agree, the remaining perimeter needs source-paper/ink evidence, and an already validated neighboring frame supplies the boundary witness. Internal dividers, enclosed insets and existing ownership still veto additions. Runtime detection contains no book or page lookup.

The current phone target is **Rise of Apocalypse #1, reader 4/24**: the complete tall horse-and-rider scene at the far right, including its upper speech balloon and both yellow captions. The rejected page-13 experiment joined two scenes and is not shipped. Test88's accepted gradient-gutter scene and all earlier detector routes remain packaged.

All **80** retained/new suites pass. The full **91-page** Test88 → Test89 Apocalypse replay preserves all **182** earlier descriptors and adds the complete page-4 scene, reaching **183**. A separate **221-page** supplement comparison retains **1,094** cached Wolverine/Magneto/manga descriptors with no additions. The target survives mirroring, enlargement and JPEG82 recompression; a 0.67x pre-resample safely abstains when candidate proof is lost. General frame coverage remains incomplete.

Identity: **2.79.89 / 28017**, isolated package `io.github.bdredenbach.nthshelf.frametest89`, label **Nth Shelf Test89**. Test89 phone acceptance is pending. See [handoff](HANDOFF-2.79.89.md), [validation](TEST89-VALIDATION.json), and [contracts](qa27900/frame-accuracy/test89/README.md).

## Test88 — closed frames in gradient gutters

Test88 follows locally smooth exterior colors around thin frame borders, then requires stable complete contours, source-pixel side evidence, retained divider/inset checks and zero prior-owner overlap. It adds the complete upper-left tall scene on Rise of Apocalypse issue2 reader **17/23**, including all speech balloons. The actual published Test84 → Test88 detector target passes **0→1**; original, mirrored, reduced/enlarged and JPEG82 sources recover the frame.

All **78** retained/new suites pass. A separate 312-page comparison preserves all **1,278** saved Test87 descriptors and adds one frame; the unpublished Test87 implementation is unavailable, so this APK builds on exact published Test84 source. The full 91-page published Test84 → Test88 replay passes **181→182**, with every old descriptor unchanged. Android CI, signature, package identity and all **88** packaged web files pass; the downloaded artifact/source bytes are independently verified. General frame detection, the **360+ goal** and phone acceptance remain pending. Identity: **2.79.88 / 28016**, isolated package `io.github.bdredenbach.nthshelf.frametest88`, label **Nth Shelf Test88**. See [handoff](HANDOFF-2.79.88.md), [validation](TEST88-VALIDATION.json) and [contracts](qa27900/frame-accuracy/test88/README.md).

## Test84 — enclosed scenes with interior ink strokes

Test84 recovers modest, independently enclosed scenes when a short stroke inside the artwork falsely triggers the divider veto. Two global seed radii and the original perimeter must agree. Boundary-reaching lines, long separators, paper corridors and independently enclosed insets still veto additions; existing ownership keeps priority.

The 230-page native-raster supplement comparison preserves all **852** prior descriptors and adds two pixel-disjoint frames: Apocalypse **180→181**, issue 2 reader **22/23** complete bottom panel; Wolverine **383→384**, source 018/reader 19 complete narrow upper-left syringe scene. Manga and Magneto remain unchanged. The full 91-page Apocalypse replay confirms all 180 prior owners unchanged and 181 total. All 76 retained suites and Android CI checks pass; the downloaded APK and all 87 packaged web files match the verified build. Source-transform results and build details are in [validation](TEST84-VALIDATION.json). The **360+ goal remains incomplete**; phone acceptance is pending.

Identity: **2.79.84 / 28012**, package `io.github.bdredenbach.nthshelf.frametest84`, label **Nth Shelf Test84**. See [handoff](HANDOFF-2.79.84.md) and [contracts](qa27900/frame-accuracy/test84/README.md).

## Test83 — context-stable enclosed-cell recovery

Test83 adds a conservative supplement that discovers complete cells in local page windows. Two independent seed radii and an expanded window must agree; the original page must prove the perimeter, and existing frames keep exclusive ownership. The reader preserves the new complete contour. Runtime detection contains no book or page lookups.

The 230-page local supplement comparison preserves all **851** existing frame descriptors. A separate full-detector replay confirms Apocalypse **179 → 180** across all 91 pages; the only new target is issue 3 reader **23/23**, the lower-right scene. Wolverine, manga chapter32 and Magneto gain no new frames. Test82 was accepted by the user; no updated phone count was supplied. Physical Test83 acceptance is pending, and the **360+ goal remains incomplete**.

Identity: **2.79.83 / 28011**, package `io.github.bdredenbach.nthshelf.frametest83`, label **Nth Shelf Test83**. See [handoff](HANDOFF-2.79.83.md), [validation](TEST83-VALIDATION.json), and [contracts](qa27900/frame-accuracy/test83/README.md).

## Test82 — independently enclosed contour recovery

Test82 adds a conservative contour supplement: independent ragged-gutter seed radii must agree, each boundary needs local paper/matte or ink evidence, internal dividers veto merged scenes, and additions must be pixel-disjoint from existing owners. The reader preserves the complete validated contour. Runtime detection contains no book or page lookups.

Across the supplied 91-page Rise of Apocalypse corpus, this environment's native-canvas replay measures **175 → 179** frames with every prior descriptor preserved. The saved **174** checkpoint is a separate measurement. Three new saved-checkpoint targets are issue 1 readers **7/24** and **17/24**, and issue 3 reader **10/23**; issue 2 reader **18/23** is a fallback restoration of an already accepted frame. Issue 3 reader 10 abstains on the reduced-scale and JPEG-recompressed variants. Test82 was accepted by the user; an updated phone count was not supplied, and the 360+ goal remains incomplete.

Identity: **2.79.82 / 28010**, package `io.github.bdredenbach.nthshelf.frametest82`, label **Nth Shelf Test82**. See [handoff](HANDOFF-2.79.82.md), [validation](TEST82-VALIDATION.json), and [contracts](qa27900/frame-accuracy/test82/README.md).

## Test80 — stable full-width torn-paper tiers

Test80 adds a conservative horizontal-tier route for portrait pages where the established detector has exactly one owner and the artwork contains two or three strong white-paper separators. The separators are used only as temporary seed barriers. Final contours are re-grown from source pixels by the retained ragged-gutter detector and must remain valid and geometrically stable at barrier half-widths 0, 1, and 2. Exactly one recovered tier must match the established owner; that owner is retained byte-for-byte and only the other tiers are appended.

Across the supplied 91-page Rise of Apocalypse corpus, the route fires on exactly two one-owner pages: issue 2 reader **15/23**, which gains three panels (1 → 4), and issue 4 reader **3/21**, which gains two panels (1 → 3). The checkpoint therefore moves from **169 to 174** owners. Both targets keep the same additions after 0.67x and 1.25x source scaling, horizontal mirroring, and JPEG quality-82 recompression.

Identity: **2.79.80 / 28008**, package `io.github.bdredenbach.nthshelf.frametest80`, label **Nth Shelf Test80**. Physical Android acceptance is pending.

## Test79 — stable top-row dual-barrier recovery

Test79 recovers a three-panel top row when the established detector already owns only lower-page contour cells and a conservative cooperative pass proves one narrow top anchor plus one merged top region. A second, independent interrupted-paper corridor supplies the missing separator. Two measured barriers are used only to split seed ownership; final contours are re-grown from the original artwork and must remain valid under three barrier half-widths (0, 1, and 2 analysis pixels).

On the supplied 91-page Rise of Apocalypse corpus, this pattern fires on exactly one page: issue 3 reader **4**, where it adds the three missing top panels. All three additions are pixel-disjoint from each other and from the two established lower-page owners. The corpus checkpoint therefore moves from **166 to 169** owners. The route also survives horizontal mirroring, 1.25x source scaling, and JPEG quality 0.82 recompression. A deliberately harsher 0.67x pre-resample loses the anchor proof and safely returns no additions rather than guessing.

Identity: **2.79.79 / 28007**, package `io.github.bdredenbach.nthshelf.frametest79`, label **Nth Shelf Test79**. Physical Android acceptance is pending.

## Test78 — empty-map isolated boundary recovery

Test78 scales an already-proven detector path instead of loosening a new threshold. Only after every established panel-owner route leaves a page empty, it asks the retained ragged-gutter detector for its strict proof-version-20 `independent-boundary-cell` recovery. Exactly one valid contour may be published; any existing owner, multiple recovery candidates, or malformed proof leaves the map unchanged.

Across the **39** still-empty maps in the supplied Rise of Apocalypse corpus, the exact recovery pass fires on only two pages: issue 2 reader **18/23** (isolated upper-right hand/scarab scene) and issue 4 reader **21/21** (isolated upper-right close-up/caption scene). The other 37 empty maps remain empty. The saved corpus count therefore moves from **164 to 166** while all 164 Test77 owners retain priority. Both additions survive 0.67x, 1.25x and horizontal-mirror source transforms.

Identity: **2.79.78 / 28006**, package `io.github.bdredenbach.nthshelf.frametest78`, label **Nth Shelf Test78**. This is an incremental detector checkpoint; physical Android acceptance is pending.

## Test77 — narrow black inset rails

Test77 adds an append-only four-rail detector for independently enclosed black-bordered insets. It requires nearly continuous thin dark rails with two-sided contrast, textured/color interior evidence, no prior-owner overlap, and a one-analysis-pixel safety inset. The narrow-ink proof uses **version 33** so Test76's accepted chromatic shared-border proof32 owners continue to route unchanged. On the supplied Rise of Apocalypse corpus it adds exactly one complete inset on issue 1 reader 12/24: the SKRITCH hand scene including the yellow OR SO THEY HOPED caption.

Identity: **2.79.77 / 28005**, package `io.github.bdredenbach.nthshelf.frametest77`, label **Nth Shelf Test77**. The accepted Test76 count is 163; this checkpoint raises the saved count to 164 pending phone acceptance.

## Test76 — chromatic shared-border separation

Test76 adds an append-only separator for two scenes enclosed by one connected chromatic perimeter but divided by a strong black shared edge. Two independently eroded seed cores must produce the same bounded minimum-barrier watershed, prior owners are never reassigned, and weak/open/flat/broad-bridge negatives are rejected. On the supplied Rise of Apocalypse corpus this adds exactly two complete owners on issue 4 reader 14/21 while retaining all 161 Test75 selections. See [handoff](HANDOFF-2.79.76.md) and [contracts](qa27900/frame-accuracy/test76/README.md).

Identity: **2.79.76 / 28004**, package `io.github.bdredenbach.nthshelf.frametest76`, label **Nth Shelf Test76**. This is an incremental detector checkpoint, not a claim of universal panel coverage.

## Test75 — gradient-guided separation of touching frames

Test75 adds a bounded edge-guided watershed supplement. Two seed scales and two contact-window widths must agree exactly; the original RGB edges determine the split where paper-cell scenes touch. The entire foreground statue head stays in the lower throne scene, not partly in the upper pyramid scene on **Rise of Apocalypse #1, reader8/24**. Earlier detector paths and owner descriptors remain unchanged. See [validation](TEST75-VALIDATION.json), [handoff](HANDOFF-2.79.75.md), and [contracts](qa27900/frame-accuracy/test75/README.md).

Identity: **2.79.75 /28003**, package `io.github.bdredenbach.nthshelf.frametest75`, label **Nth Shelf Test75**. The original-artwork corpus comparison and browser touch/crop checks are recorded separately from CI and physical Android acceptance. This is an incremental expansion, not a claim that all panels now work.

## Test73 — shared-boundary completion

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

[Previous release notes and project documentation](README-through-Test71.md)
are preserved without removing their earlier content or changing relative links.
