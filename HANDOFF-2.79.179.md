# Test179: exact repeat-search reuse and a new issue audit

Test179 is an isolated candidate. All171 known fixed taps retain exact Test178 displayed PNG bytes and popup styles. The new issue is **not fully qualified**: four targets do not open,12 crop outcomes are incomplete, and four contain unwanted neighboring content. Three more need a speech/foreground ownership decision. No new-issue geometry fixes were added in this speed candidate.

## Responsiveness

The slow Wolverine issue2 Reader page5 frame2 takes246 rail searches on its first tap. Exact completed-search replay now avoids repeating that work after matching every analysis luminance byte and the complete supported seed/tap input. It does not give one-seed evidence authority over nearby taps. Cache storage is bounded to two pages and eight exact inputs per page; issue changes and closing a comic clear it. Changed pixels, dimensions, seed bounds, probe positions, flags and execution mode force fresh search. Returned geometry is cloned so caller mutations cannot poison retained evidence.

| Native handler benchmark, three isolated runs | Test178 median | Test179 median |
| --- | ---: | ---: |
| First tap | 6.831s | 6.401s |
| Identical repeat tap | 6.583s | 0.324s |

The identical-repeat median is 20.3x faster. All benchmark crop bytes and styles match. The first search is unchanged; its timing difference is not claimed as a reliable cold-speed improvement. These are handler timings in native NAPI canvas, not phone timings or animation-to-finish measurements. An adjacent tap remains a fresh search, and mobile fingers may not repeat an identical coordinate. This is a narrow reuse improvement, not a claim that every reopening is faster.

## Fresh regression

| Audit | Fixed taps | Result |
| --- | ---: | --- |
| Wolverine supplied issues1–3,22 pages |62|All exact to178;52 previously qualified complete story singles preserved|
| Sub-Mariner,22 pages |97|All exact to178, including boat, lettering groups and inset|
| Apocalypse issue2 heldout pages4,8,13 |12|All exact to178|
| Untouched Apocalypse issue3,23 pages |110|106 open; see outcome table and defects below|

All281 fresh taps have zero Reader exceptions.71 immutable page/supplement aggregate receipts cover70 unique page sources. All loaded production-script hashes, source hashes, fixed centers, target/aggregate correspondence, PNG hashes/decodes and known popup styles are verified.

## New issue outcome

109 taps were frozen before running the detector. Full source review found one omitted separate panel on Reader page23; one additional source-chosen tap was audited and is explicitly marked supplemental. No center was moved and no output-based rescue tap was searched. Source review also corrected three targets that share an existing source frame (page9 f02, page12 f05, page16 f04). Counts below are **tap outcomes, not distinct panel counts**.

| Outcome | Taps |
| --- | ---: |
| nonstory control | 2 |
| incomplete | 12 |
| complete single | 45 |
| review needed | 3 |
| no popup | 4 |
| contaminated | 4 |
| complete group | 37 |
| same scene control | 3 |

Complete groups retain the sampled scene with other scene regions; they are not qualified as separate scene popouts. Some represent shared speech or foreground compositions and need source-ownership judgment. Whole-scene grades are visual source comparisons, not an exhaustive native-alpha oracle. Cover controls only qualify opening. The page23 NEXT title is footer paratext; its inclusion is unqualified.

Clear misses and crop defects, with Reader page numbers including both covers:

| Target | Finding |
| --- | --- |
| p03-f01 | Top-right yellow narration caption is cut off; the eye/sphinx artwork otherwise opens separately. |
| p05-f01 | Left dialogue bubble is clipped by the measured contour. |
| p05-f02 | Sword-attack crop cuts the SWAK effect and the right side of the struck figure, and includes a neighboring speech fragment. |
| p05-f07 | Lower composition cuts the top of Isis's head and halo where it protrudes above the nominal row. |
| p04-f01 | Fixed source-enumerated target produced no popup. |
| p04-f02 | Fixed source-enumerated target produced no popup. |
| p04-f03 | Fixed source-enumerated target produced no popup. |
| p04-f04 | Fixed source-enumerated target produced no popup. |
| p04-f05 | Geometry-rescue quadrilateral cuts the bandaged figure on the left and includes artwork from the landscape above. |
| p06-f01 | Ra scene is retained but the crop also includes a clipped fragment of the lower-left scene's speech. |
| p06-f02 | Upper floating and burning-sands speech bubbles are omitted. |
| p09-f04 | The YOU speech tail is clipped at the right edge of the center strip. |
| p11-f02 | Upper Reed dialogue is cut off above the narrow scene crop. |
| p11-f03 | All central Pharaoh thought text is retained but a clipped neighbor dialogue fragment remains at the left edge. |
| p12-f02 | Wheel scene is retained, with cropped fragments of the bedside dialogue at its right edge. |
| p12-f03 | Two dialogue bubbles along the left boundary are truncated. |
| p13-f05 | Refusal crop omits the right-hand face/body and NO/Get away from me speech. |
| p15-f02 | Most of the right-hand dialogue above the leaning man is omitted. |
| p15-f03 | Pharaoh scene is retained but contains a clipped neighboring speech fragment at the left edge. |
| p16-f01 | Upper moon/halo arc is cut by the crop's top notch. |

Ownership review remains for page5 f04 (Isis halo crossing the row) and page22 f01/f02 (speech crossing into the lower group). Grouped selections and all individual notes are retained in the private evidence.

## Controls and packaging

31 new exact-search controls pass: complete-byte invalidation, neighboring taps and seed/identity/flag changes, kernel mode, caller mutation isolation, storage bounds, issue lifecycle, unsupported inputs, null misses, and real cached/uncached arithmetic parity with both JavaScript and WASM.59 existing scene controls,110 navigation controls and22 Apocalypse issue1 entry gates also pass. The entry gates are not a new88-tap issue1 replay. The unchanged source-layout module retains SHA2560ec2c0fde0ba8ae9d168060eaef9c5299eea16921b463790273abc097562ffd3.

Production logic changes are confined to js/panels-frame-envelope.js and the issue-lifecycle hooks in js/panel-map.js. index.html and sw.js carry Test179 identity. No comic title, page number, filename, frozen target, saved audit envelope or artwork hash selects production geometry. Full analysis luminance comparison validates reuse; it is not a known-art lookup.

The signed APK uses io.github.bdredenbach.nthshelf.frametest179, label Nth Shelf Test179, version2.79.179 /28107. It is a verified Test178-shell repack, not a Gradle rebuild. All186 packaged web assets are exact, all42 native entries outside manifest/resources are unchanged, ZIP integrity/alignment and v2 signature pass, and package identity and launch activity are verified.163 JavaScript files parse.

APK SHA256: c396ba6955687787d7372af16eb3f925d20a04ab004b538edccd5937d658cf66
Frame-envelope module SHA256:42ec85329bd7125a24415c7a86a2b39a56959d94e60e4b254d91354e2eb70c79

Browser compositing, actual Worker/IndexedDB behavior, Android rendering, app-restart cache behavior and phone interactions remain unqualified. The native harness executes production detector/Reader/map mathematics and emitted CSS clipping in a minimal DOM. Source173 remains accepted; Test179 is neither promoted nor pushed.

Next detector work should target the landscape title-page misses, whole speech/foreground ownership in the new issue, and the unchanged costly first/nearby-tap fallback. Preserve the171 exact known outputs while doing so.
