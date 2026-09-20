# Nth Shelf

![Nth Shelf](assets/nth-shelf-empty.jpg)

**Nth Shelf** is a local-first comic reader and personal comic library built as an installable Progressive Web App.

**Everything stays on this device.**

## ✨ Features

### 📚 Personal Comic Library
- Import **CBZ, ZIP, CBT, CB7, 7Z, CBR, and RAR** comics.
- Import a ZIP containing multiple supported comic archives as a batch.
- Search your collection.
- Organize comics into collections.
- Track reading progress and unread status.
- Sort by **Recent, Title, Unread, In Progress,** and **ADDED**.
- Use **↑ ASC / ↓ DESC** ordering.
- The library starts in **ASC** order by default.
- **ADDED** sorts by the time comics were imported.

## 🔎 Animated Search Mode
- Browse covers in an animated, console-style carousel.
- The selected cover becomes larger and centered.
- Neighboring covers shrink, fade, and angle away for depth.
- Swipe, tap, use arrows, or use keyboard navigation.
- Search filters the carousel live.
- Tap the centered cover to open it.

### 🔖 Animated Bookmarks
- Switch Search Mode to **Bookmarks**.
- Browse bookmarked pages using the same animated carousel.
- See bookmarks from different comics together.
- Filter bookmarks by comic title.
- Select a bookmark to jump directly to that page.

## 📖 Reading Modes
- **Page** — one page at a time.
- **Two Page** — two pages side by side.
- **Scroll** — continuous horizontal reading.
- **Manga** — continuous horizontal right-to-left reading.
- **Webcomic** — continuous vertical reading.

### Two Page Fullscreen
Two Page automatically requests fullscreen and landscape orientation for a larger, more readable spread.

The **Exit Fullscreen** button appears only in Two Page fullscreen landscape.

## 💬 Bubble Zoom
- Double-tap a detected bubble.
- The page dims behind the enlarged bubble.
- The bubble appears as a readable pop-out.
- Bubble positioning adapts to the reading layout.
- Two Page supports bubbles on either displayed page.

## 🖱️ Auto Scroll
Auto Scroll is available in **Scroll, Manga,** and **Webcomic** modes.

- The **Auto Scroll** button appears only in modes that support continuous scrolling.
- The button is dark when off and red when active, matching the Bubble Zoom control style.
- Use the linear **0–2×** speed slider and exact live readout. The **− / +** buttons adjust by **0.01×**.
- Use the play/pause control to stop and resume scrolling without leaving the mode.
- The control panel fades almost completely into the artwork while idle and becomes visible when interacted with.
- The control panel can be moved to a more convenient position.
- Auto Scroll automatically stops when switching to a reading mode that does not support it, preventing unexpected movement when changing modes.

## 🔖 Bookmarks & Progress
- Bookmark the current page.
- Return directly to bookmarked pages.
- Preserve reading position locally.
- Keep collections and metadata with the local library.

## 🎨 Themes
Use the built-in theme swatches to change the reading appearance.

## 💾 Backup & Restore
Android full .nthshelf backups stream pages to the selected destination and verify the written archive. Android restores stage pages on disk and publish only after validation. The former 512 MiB total-size ceiling remains only in the browser/legacy route. Legacy JSON restores contain metadata only and require the original comic archives.

**Recommendation:** keep a current backup before major browser or device changes.

## 🛡️ Persistence Protection
Nth Shelf uses IndexedDB for local storage and keeps a stable database identity across application updates. It records library metadata and requests persistent browser storage where supported, helping protect against accidental storage loss.

## 📱 Installable & Offline-Friendly
Nth Shelf can be installed as a PWA on supported devices. The app shell is cached for offline use, subject to browser storage and locally available content.

## 🧰 Supported Formats

| Format | |
|---|:---:|
| CBZ | ✅ |
| ZIP | ✅ |
| CBT | ✅ |
| CB7 | ✅ |
| 7Z | ✅ |
| CBR | ✅ |
| RAR | ✅ |

## 🚀 Getting Started
1. Open Nth Shelf.
2. Import a comic or a ZIP containing supported comic archives.
3. Choose a reading layout.
4. Search or organize your shelf.
5. Bookmark pages you want to revisit.
6. Use Bubble Zoom or Auto Scroll when appropriate.
7. Use Backup/Restore to keep a safety copy.

## 🧪 Current Release
**Version 2.79.23 Test 1 — Overlapping upper panels on pages 9–10**

Page 11's five frames are now phone-confirmed. This build targets the three
upper scenes on each of pages 9 and 10. The detector proves the exposed borders
of a rear panel and its two foreground panels, then keeps their visible
outlines. The stepped edge preserves the rear artwork without including its
neighbors. Page 9's overhanging caption stays with the motorcycle inset.

The reader uses those same outlines for taps, crops and second-level tap
mapping. Transparent cutouts cannot select a neighboring caption. Existing
frame identities and fallback composites are retained. The new layout rule
uses image evidence; no comic coordinates or page numbers enter runtime code.

**Phone priorities:** on pages 9 and 10, try five positions in each of the
three upper scenes, closing the pop-out between taps. On page 9 also tap the
caption extending left of the motorcycle inset. Recheck the confirmed lower
panels and page 11. These new page-9/10 crops still need phone confirmation.

See [2.79.23 results](qa27900/frame-accuracy/queue-results-27923.md) and the
[work queue](qa27900/frame-accuracy/work-queue.md). Page-19 upper groups/syringe,
page-6 uncertainty and explicit bubble checks remain queued. Accuracy work
stays in the 2.79 series. Source comics and recordings are excluded from the
repository/APK.

## 🧪 Release History (Newest First)

## V2.79.19 Test 1 — Whole page-19 middle scene

Page 19's middle room scene now has one complete frame owner, including
Wolverine at the left. Its bottom full-width scene also has a stable identity.
Both pass center/left/right/north/south Reader taps under three browser-like
Skia resampling settings. The full syringe panel and upper speech are recovered
under Sharp, but remain unproved under Skia; that case is still open.

The new partial recovery runs only when all established identity routes return
empty, requires a uniformly dark exterior, and retains independently closed
leaves. An uncertain neighboring region does not become a panel. Full-length
ink, attached separators, missing-border and inset checks remain required.
The 74-page comparison changes only page 19; every existing identity remains
exact. Previously confirmed pages 7/17 and the earlier controls remain passing.

**Phone priorities:** on page 19, tap left/right/center/north/south inside the
middle room scene. Every result should retain Wolverine and the whole room.
Recheck the bottom scene and report the syringe result. The upper-right room
and eye/injection strip, and the upper groups on pages 9–11, remain queued.
Bubble behavior is unchanged; its explicit second-level phone checks remain.

See [2.79.19 results](qa27900/frame-accuracy/queue-results-27919.md) and the
[work queue](qa27900/frame-accuracy/work-queue.md). This remains the 2.79 accuracy
series. Comic pages and recordings are excluded from the repository and APK.

## V2.79.18 Test 1 — Whole bomber and SNIKT frames

Page 7's red bomber strip has one whole-frame owner. Page 17 now has six
independent frames, including the full-height SNIKT column and both neighboring
lower panels. These targets also pass three Skia resampling settings. Sparse
marks in page 9 snow and page 13 pale artwork no longer create caption cutouts;
real caption controls retain their previous selections.

The 74-page identity comparison adds frames only on pages 7, 8, 17 and 58.
All previous identities and their evidence remain exact. Page 8 adds the
machine-gun strip; page 58 adds the bottom conversation strip. The original
155 Reader-handler controls remain passing; new artwork checks and synthetic
missing-border/inset tests cover the additions.

**Phone priorities:** move taps around page 7's red bomber strip; open all six
page-17 frames, especially SNIKT and its right neighbors; then try the page-9
snow and page-13 pale artwork as second-level selections. Real captions should
still open. These are local test results pending confirmation on the phone.

**Still open:** upper composites on pages 9–11, page 6's remaining two unproved
identities, and resampling-dependent misses. Page 7's bottom strip gains an
identity with Sharp but remains on its prior fallback with Skia. Page 7's upper
right frame is still unproved. This is another 2.79 accuracy test, not 2.80.00.

See [2.79.18 results](qa27900/frame-accuracy/queue-results-27918.md) and the
[work queue](qa27900/frame-accuracy/work-queue.md). Comic pages and recordings
remain excluded from the repository and APK.

## V2.79.17 Test 1 — Separate bottom frames and snow rejection

Page 12's bottom-left Wolverine/airplanes and bottom-right searchlights now
have separate whole-frame owners. Five page-12 frames pass 25 moved-tap Reader
checks. All 130 established Reader controls remain passing; the 74-page identity
comparison changes only page 12. Gray/colored exterior gutters propose complete
ink-bounded frames while preserving existing identities and divider/inset vetoes.

Page 11's snow/fence artwork is rejected as speech. Real caption controls,
including short two-letter speech, retain their previous selections. Eight
synthetic bubble cases and the wider local artwork replay cover this change.

**Phone priorities:** repeat page 12's bottom pair and middle strip from five
positions, then verify page 11 snow produces no second pop-out while real captions
still work. One local resampling setting leaves the middle strip on its existing
fallback; Android rendering is not certified by these local tests.

**Still open:** page 7's red bomber strip, the upper composites on pages 9–11,
and page 6's remaining two unproved identities. Overlapping/borderless artwork
needs further ownership work. This release advances two targets; it does not
complete the accuracy queue or move to 2.80.00.

See [2.79.17 results](qa27900/frame-accuracy/queue-results-27917.md) and the
[work queue](qa27900/frame-accuracy/work-queue.md). Comic pages, videos and
source-artwork crops remain excluded from the repository and APK.

## V2.79.16 Test 1 — Whole frames and double pop-outs

This accuracy test starts the queue from recording `179289.mp4`. The previously phone-confirmed page-5/page-13 fixes remain controls alongside pages 9 and 16.

- Page 3 receives five complete horizontal frame identities. Taps in its pilot strip retain the left narration and artwork.
- Page 6's bottom-middle and bottom-right frames are separate. Five frames now have proved identities: top-left, both middle frames and the two wider bottom frames. The existing bottom-middle identity is preserved exactly. **The top-right and narrow bottom-left frames remain unresolved.**
- Second-level bubble selection requires aligned letter evidence inside the selected light region. The page-5 sky/propeller patch is rejected while its captions remain available.
- Double pop-outs map through the actual rendered frame crop. Dismissal, a newer focus or navigation cancels stale caption results; a pending result uses the current layout after rotation.

Local tests pass **130 Reader handler probes**: 80 established controls on pages 5/9/13/16 and 50 new probes on pages 3/6. The complete 74-page page-identity comparison changes only pages 3 and 6, each from one identity to five; all other 72 outputs are exactly unchanged. Caption and interaction tests also pass. These are source-artwork and handler checks, not Android device or animation verification.

**Phone test priorities:** page 6's two separate wider bottom frames, page 3's complete pilot strip, then caption open/close on pages 4/5. Recheck all established controls. Try center/left/right/north/south within each target and repeat consecutive openings.

The older fallback can still crop incorrectly in unresolved areas. Page 6's remaining two frames, other queued pages and stepped/overlapping shapes stay open. Accuracy comes before speed tuning or automatic sequential pop-outs; this is not 2.80.00.

See [queue results](qa27900/frame-accuracy/queue-results-27916.md) for changes, commands and evidence limits, and the [work queue](qa27900/frame-accuracy/work-queue.md) for remaining targets. Comic pages and recordings are excluded from the repository and APK.

## V2.79.15 Test 1 — Connected panels and shared borders

The latest phone recording confirms the whole page-13 airplane crop, but shows merged neighboring panels on page 5 and two different partial crops of page 13's tall star-and-bombs strip. This accuracy test addresses those two patterns.

- Measure a complete, closed page border and recursively fit the dividers that connect its sides. Page 5's six slightly tilted panels become separate identities, including the hand, small shattered-glass caption, and lower-right Wolverine frames.
- Complete a frame beneath an independently proved neighbor by reusing their shared border and proving its other three sides. Page 13's star-and-bombs strip stays one whole frame. Existing frame geometry remains unchanged.
- Reject uncertain partitions, interrupted dividers and inset conflicts. Run the partition route only when the established baseline, stacked-page and independent-frame routes have no result. Preserve fitted corners through physical-angle classification and rendering.

The local reader-handler test passes 80 tap positions across pages 5, 9, 13 and 16. Five positions within each tested frame return the same whole-frame geometry. Pages 9 and 16 and both previous page-13 identities match 2.79.14 exactly. The 74-page detector sweeps add only the one shared-border strip on page 13 and the six-panel partition on page 5; this does not certify all other fallback results.

**Device test priorities:** page 5's six panels, then page 13's complete star-and-bombs strip. Try left/right/center/north/south inside each, and repeat the known-good airplane, page-9 and page-16 controls.

**Still unresolved:** page 3's unresponsive/slow attempts in the recording, other missed or merged scenes, and complex stepped/overlapping shapes. The old fallback remains and can still crop incorrectly outside independently proved frames. Speed tuning and automatic sequential pop-outs remain deferred; this is not 2.80.00.

Run `node qa27900/phone-frame-check.cjs --comic` with the local 74-page fixture for the artwork tap tests. The comic and videos stay outside the repository/APK. CI runs the synthetic border, partition, neighbor, geometry, browser and transfer checks. See `qa27900/frame-accuracy/connected-frames-27915.md` for evidence and limitations.

## V2.79.08 Test 1 — An Nth Experience

Page navigation hides after five seconds. Swipe inward from the top or bottom to
show it for another five seconds. Slow page drags begin after eight pixels of
horizontal intent, and the touched page stays connected throughout the fold.

Uses Nth Reader's independent Nth Page Deck for page folds and reverse turns.
Turn.js (including its minified copy) and the jQuery runtime reference have been
removed. Page and Two Page pinch gestures take priority over page turning.
Android Two Page requests native immersive landscape and releases it on exit.
The shelf carousel is raised, and first-use guides introduce each reading area.
Replay a reading guide or open Licenses & Credits from the Reader Guide (?).

Full .nthshelf backups contain comic page images, reading history, bookmarks,
and collections. Restore validates pages before one atomic, additive database
transaction; existing comics are never overwritten. Collection downloads
reconstruct a ZIP of CBZ issues from stored pages, not original source archives.
Transfers show progress; Android uses its save-document picker and reports the
actual save result. Legacy progress-only JSON restore remains available.
The in-memory transfer safety limit is 512 MiB; larger libraries need smaller
collection exports. Full backups do not include disposable panel-map caches
or device-specific preferences. The frame detection and WASM sources are unchanged.

This is a device-test build, not commercial clearance. Review the optional
filing/libarchive compiled dependency inventory before production publication.

## V2.79.06 RC2 Android Splash + Shelf Animation

V2.79.06 RC2 replaces the Android 12–16 icon-only startup with a black system handoff and a full, safe-area-aware Nth Shelf launch composition. The artwork uses fit-center scaling so tall API 36 displays cannot crop or zoom it, and the transient empty-shelf headline and Import button are omitted. It also restores the intended first-tap shelf interaction: the selected comic lifts slightly before the second tap opens it. The root shelf's entrance animation now releases its transform when it finishes—or immediately when tapped—so it no longer suppresses that lift.

## V2.79.06 RC1 Android Polish

V2.79.06 RC1 keeps the proven V2.79.05 panel-map and WebAssembly frame path unchanged while correcting the Android shell around it. The packaged app now uses the supplied Nth Shelf launcher icon, accepts directly selected CBZ and other supported comic archives through Android's document picker, hides the browser-only Install action, and routes Android Back through the active modal, focused frame, reader, shelf/search mode, or collection before exiting. Reader geometry now uses the safe visible viewport instead of a translated full-screen stage: Page sheets are centered, Two Page spreads stay within the system bars, and the empty-shelf artwork is shown uncropped. When Auto Scroll is active, revealing reader navigation also reveals its speed control; hiding navigation fades the control back into the page.

## V2.79.05 Paired-Row Panel Map Prototype

V2.79.05 moves proven skew-frame work completely off the tap path. A dedicated Web Worker decodes the current page once, reuses its 900-pixel luminance buffer and WebAssembly rail kernel across six deterministic probes, and persists only strict V2.79.04-approved geometry in a SHA-256-versioned IndexedDB panel map. A tap first preserves V73 rectangle authority, then performs a synchronous smallest-containing-polygon lookup; a missing, incomplete, unsupported, or invalid map falls through to the unchanged V2.79.04 route. Broad precomputation initially exposed unsafe singleton crops and multi-panel unions on unrelated layouts, so background authority now requires two distinct skewed frames that independently prove a compatible page-wide row. Across the complete 74-page Wolverine regression comic, this retained only six visually valid background frames—two on page 13 and the four difficult skewed frames on the sepia stress page—while rejecting the page-39 artwork loop and every observed composite. The stress-page map built in roughly 0.72–0.78 seconds with WebAssembly, all eight canonical/moved skew-frame lookups matched V2.79.04 geometry, and in-memory lookup averaged under 0.001 ms. Forced JavaScript preparation also preserved geometry; it remained safely off-thread and the live V2.79.04 fallback stayed available.

## V2.79.04 Optional WebAssembly Rail Kernel

V2.79.04 transplants the exact finite-rail evidence kernel into WebAssembly while leaving JavaScript in control of routing, ownership, caching, and rendering. The compiled kernel evaluates the same luminance, continuity, contrast, finite-span, and candidate-ranking values as V2.79.03, with automatic JavaScript fallback when WebAssembly cannot initialize. All 12 cold stress taps passed in 0.49–0.86 seconds, consecutive first taps completed in 0.41–0.65 seconds, cached taps completed in 0.11–0.12 seconds, and all six canonical quadrilaterals matched the JavaScript route byte-for-byte apart from floating-point score noise near 10^-15. The 93-probe safety set rejected every known false candidate, and the forced JavaScript fallback passed all 12 frame tests.

## V2.79.03 Quick Proven-Frame Route

V2.79.03 moves the bounded one-search/local-consensus proof directly behind a V73 baseline miss, ahead of the slower sequential identity fallbacks. This front route cannot enter the three-search or exhaustive banks: a miss immediately defers to the complete V2.79.02 V100 → V99/V92 → geometry-rescue chain. Rail evaluation now precomputes the exact five-pixel luminance averages once per decoded page and folds duplicate finite-span sampling into the primary pass; the 900-pixel analysis resolution and every existing enclosure, thickness, adjacency, ownership, and false-positive gate remain unchanged. On the six-frame sepia stress page, all 12 cold canonical/moved app-path tests passed in 1.45–2.02 seconds (1.71-second average), down from V2.79.02's 8.82-second average. A consecutive live-process run resolved first-time panels in 1.40–2.32 seconds and cached taps in 0.12–0.15 seconds, with no ownership change and at most 0.00005 normalized vertex drift. Both the 25-route quick/full safety sweeps and the broader 43-route uncovered-page sweep produced zero unsafe acceptances, errors, or timeouts.

## V2.79.02 One-Search Local Consensus Fast Path

V2.79.02 accelerates V2.79.01's proven-frame path without relaxing its frame-ownership gates. The preferred adaptive seed performs one complete four-rail search; two alternate seed windows then verify the same finished quadrilateral using cached luminance, local reach, enclosure, coverage, and sustained rail ink. The bounded bottom-left page-edge family retains its existing two-proof exception. If local confirmation is insufficient, the complete V2.79.01 three-search consensus runs unchanged. On the six-frame sepia stress page, direct adaptive-search time fell from 69.7 seconds to 17.8 seconds across all six canonical taps (74.4% lower), while every returned quadrilateral remained identical. The release passed all 12 cold canonical/moved app-path tests, a 12-tap consecutive live-cache sequence, and a 25-route cross-page rejection sweep including the page-39 artwork-loop regression.

## V2.79.01 Adaptive Proven-Frame Fast Path

V2.79.01 adds a conservative tap-adaptive seed bank ahead of the established exhaustive four-rail search. Rail discovery now uses a stable internal viewpoint for each candidate cell, while the user's actual tap is used separately to prove containment; moving a tap within one panel therefore cannot change the seed's rail ranking. Large or wide frames require three agreeing seeds and stronger relative rail separation, while the narrow bottom-left page-edge family retains a bounded two-seed exception. The six-frame sepia stress page passed all 12 cold app-path checks: both top frames remained orthogonal and all four overlapping lower frames retained skew ownership from canonical and moved taps. Across the other 73 pages, all 25 routes eligible to invoke the new fast bank rejected it safely, including the page-39 artwork loop found during regression testing; unchanged hold, inspect, and exhaustive fallback behavior remains intact.

## V2.78.23 Proven-Frame Ownership Test

V2.78.23 classifies geometry ownership only after V2.78.22 proves the complete four-rail frame. A skewed owner must have a visibly non-axial rail whose neighbor-side separation and printed-band thickness are both strong, plus corroborating corner-angle or opposite-rail evidence. Proven skewed frames keep their four vertices; proven orthogonal frames render the bounding rectangle around those same rails. A small local V99 rectangle that occupies less than half of a larger proven orthogonal frame is treated as an interior fragment and replaced by the whole-frame rectangle, while a matching known-good orthogonal seed remains authoritative. Logs now report `FRAME OWNERSHIP angles=... axis=... trusted=... adj=...`, followed by `FRAME OWNERSHIP -> SKEWED` or `FRAME OWNERSHIP -> ORTHOGONAL`. On `140153.jpg`, all five tap positions agreed on ownership for every frame: top and both middle frames were orthogonal, while the bottom-left, narrow right strip, and bottom-right frames were skewed. All 30 app-path trials produced whole-panel pop-outs, both fragment seeds captured in `141470.mp4` expanded to full frames, and the earlier orthogonal-authority regression seed remained unchanged.

## V2.78.22 Rail-Band Cell Integrity Test

V2.78.22 makes the smallest-complete-cell rescue distinguish a printed panel gutter from a thin line inside the artwork. Every retained rail now receives a cross-rail band-thickness score, and a page/row rescue may select a small cell only when all four rails have sufficient band integrity in addition to the existing closed-loop, adjacency, convexity, and tap-containment proofs. If V73, V100, and V99/V92 all miss panel identity, the reader now makes one final page-seed geometry attempt and accepts it only when the envelope proves a connected four-rail frame; it never displays the orthogonal whole-page fallback. Debug logs add `thick=min/average` and four side-ordered thickness values. On `140153.jpg`, all six visible skewed frames passed both the 30-position page-seed sweep and the 30-position aligned-seed sweep without slivers, while the V2.78.21 orthogonal-authority gate remains in place.

## V2.78.21 Orthogonal Authority Gate Test

V2.78.21 prevents the tap-neighborhood rescue from replacing known good orthogonal geometry. V73 and V100 panel identities now remain authoritative rectangles. A clean, panel-scale V99/V92 result also remains a rectangle; only an oversized or composite V99 seed may enter the bounded local-seed rescue. Wide, shallow panels are no longer considered suspicious merely because they occupy more than half the page width. Logs now report `ORTHOGONAL AUTHORITY HOLD ...` for protected rectangles and `COMPOSITE SEED RESCUE ELIGIBLE ...` when the skew-frame search is allowed. The exact orthogonal seed captured in the phone recording was preserved, while five taps on the oversized `140153.jpg` middle-row seed still recovered the intended right-hand skewed frame.

## V2.78.20 Tap-Neighborhood Frame Consensus Test

V2.78.20 fixes two failures exposed by the `140153.jpg` sandbox comparison. Rail adjacency is judged relative to competing rails on the same side, and oversized or weak seeds trigger a bounded set of local panel-scale seeds and nearby tap probes. Only closed, convex, tap-containing four-rail families remain eligible. Five sandbox tap positions converged on the same complete skewed frame. Ownership remained deferred.

## V2.78.19 Neighbor-Side Consistency Test

V2.78.19 adds neighbor-side consistency as ranking evidence after closed-loop validation. Each candidate rail samples the dark rail and the image regions immediately on both sides. This evidence cannot manufacture an open rail or bypass the closed-family protections.

## V2.78.18 Outermost Coherent Loop Test

V2.78.18 retains all structurally credible closed families, measures how much of the stable panel seed each explains, and prefers the outermost coherent panel-scale enclosure among candidates whose rail and corner evidence remains close to the best evidence.

## V2.78.17 Chain-Connected Rail Family Test

V2.78.17 generates several plausible rails per side and searches for one closed rail family around the tap: top → right → bottom → left → top. Every selected rail must participate in the same finite, connected enclosure.

## V2.78.16 Endpoint Convergence / Short-Bridge Corners Test

V2.78.16 allows a tightly bounded short bridge when two proven neighboring rail endpoints stop just before a real frame corner. Infinite extrapolation remains forbidden, and bridged corners are explicitly logged.

## V2.78.13 Junction-Locked Envelope Test

V2.78.13 keeps the V2.78.12 whole-frame envelope architecture but adds per-corner junction locking. Each inferred corner must snap to nearby local evidence from both neighboring frame rails.

## V2.78.12 Whole-Frame Envelope Test

V2.78.12 moves full-frame recovery ahead of geometry ownership. The stable detector identifies the tapped panel, then the frame-envelope stage searches for a complete four-sided enclosure. It rejects tiny interior slivers, requires a convex tap-containing polygon, and falls back to the stable rectangle when a complete envelope cannot be proven.

## V2.78.11 Vertex / Angle Ownership Test

V2.78.11 separates geometry ownership from full skewed-frame extraction. The skewed module fits four local sides, intersects them into corners, measures angles and opposing-side divergence, and grants skewed ownership only when the vertex geometry proves a non-orthogonal quadrilateral. This build still rendered the stable seed rectangle.

## V2.78.10 Skew Proof Gate Test

V2.78.10 requires an opposing rail pair to prove meaningful angular divergence or a strong shared lean before the skewed engine may own a tap. One isolated diagonal rail can no longer claim an otherwise orthogonal panel.

## V2.78.09 Skewed Ownership Test

V2.78.09 lets a proven three-rail skew candidate claim temporary ownership and reacquire a missing fourth rail at the scale of the stable panel seed. Final polygons must remain local, convex, and tap-containing.

## V2.78.08 Tap-Anchored Enclosure Test

V2.78.08 anchors rail selection to the user's tap. Each side is selected as the nearest sustained enclosing rail, while final polygons remain constrained by convexity, area, locality, and tap containment.

## V2.78.07 Skewed Classifier + Corner Freedom Test

V2.78.07 lets high-confidence oblique evidence influence classification and gives corners directional freedom near strongly supported oblique rails while retaining convexity, area, containment, and four-rail checks.

## V2.78.06 Directional Rail Search Test

V2.78.06 searches line hypotheses that may migrate progressively away from the orthogonal seed and robustly refits them to dark frame ink. Skewed geometry must still prove four coherent rails and a valid convex polygon.

## V2.78.04 Trace Stabilizer Test

V2.78.04 fits each rail as one robust, mostly straight structure with distributed support. Opposing rails, corner locality, convexity, area, support, and coverage checks reject malformed artwork-driven cutouts.

## V2.78.03 Trace Authority Test

V2.78.03 gives boundary tracing the first chance to prove four true rails after a V99/V92 fallback seed. Two-side legacy candidates are rejected when tracing cannot prove the missing geometry; four-side candidates retain a safe rectangular fallback.

## V2.78.02 Boundary Trace Test

V2.78.02 adds an experimental geometry branch to the stable hybrid baseline. V100 identifies the panel, V102 may trace a four-corner polygon, and weak tracing preserves the stable rectangle.

## 🔒 Privacy

Nth Shelf is designed around local-first storage. Your comics are stored on your device rather than uploaded to an Nth Shelf server simply to read them.

## 📜 License

This project is licensed under the **MIT License**. The license applies to the software and does not grant rights to comic artwork or other copyrighted material imported by users.

## V2.79.08 Test 1 — Streaming full-library backups

Android Backup and Restore now use bounded archive chunks through the native bridge.
All comic pages, collection records, bookmarks and reading positions are included.
Comic covers are regenerated on restore; panel detection caches and device preferences
are not included. Restore adds copies and never overwrites existing comics.
Cancel removes staged pages; interrupted restores are cleaned up on the next startup.
Backup reads the saved file back and compares SHA-256 before reporting success.
A failed/cancelled export attempts to delete its incomplete file; discard any partial
file a storage provider leaves behind. Keep the app open throughout the operation.
Available storage/provider limits still apply. There is a 128 MiB per-image limit and
an 8 MiB manifest limit, not a 512 MiB whole-library limit. Collection downloads and
browser backups still use the existing 512 MiB route. Import legacy backup preserves
support for older JSON and small ZIP backups.

Regression gates: 600 MiB archive write/verify/read with a 32 MiB JVM heap, corrupt
data rejection, cancellation, browser fixture round-trip, missing-page rollback and
startup recovery. Native Android document-provider behavior still needs phone testing.


## V2.79.09 Test 1 — Whole-archive backups

Android full-library backups now contain `sources/` (one original CBZ/CB7/CBT/CBR/ZIP/7Z/RAR/TAR per book when retained) and a v3 `nth-shelf-backup.json` index. Reading positions, bookmarks and collections travel with the library. Newly imported original archives are retained; older page-only books are reconstructed as CBZ once during backup. Retained archives consume additional app storage, roughly their combined archive size. Removing a comic removes its retained source too.

The first backup streams source bytes (or existing pages) into Android using bounded 1 MiB binary messages, with at most two awaiting acknowledgement, when supported by WebView. Older WebViews use the base64 transport. Android retains the resulting original/CBZ in private app files; later backups copy it directly without sending pages through JavaScript. ZIP compression remains level 0 because source archives and images are already compressed. Every completed backup is reopened and SHA-256 verified.

Restore supports both v2 page backups and v3 source backups. CBZ/ZIP pages are streamed through a nested native ZIP reader. CBT/TAR/CB7/7Z/CBR/RAR use the existing import engine one archive at a time (these formats still require memory for an individual archive; the existing 7Z/RAR engine availability requirements apply). Restored sources are retained for subsequent backups. Publication is atomic after all pages validate; cancellation/failure rolls back staged pages and sources. Existing books remain intact.

No phone speed multiplier is claimed. Compare the first backup (which prepares existing books) with a second unchanged-library backup on the same device and destination. Regression gates cover original byte preservation, reconstruction, warm native copying, binary/base64 paths, v2/v3 restore, metadata, rollback and crash recovery, plus native nested ZIP/cache parity and 600 MiB streaming under a 32 MiB JVM heap.


## V2.79.09 Test 2 — Welcome actions

The empty library now has actual Import and Restore buttons in a bottom action row, clear of system insets. Import opens the existing comic picker; Restore opens the existing full-backup flow. The edited welcome artwork removes the painted Import button and blends into the continuous dark textured background. The artwork scales within the remaining height without cropping, including landscape. Pop-out and backup algorithms are unchanged from Test 1.


## V2.79.10 Test 1 — Restore buffering and contextual tutorials

Fixes a restore transport defect: a large destination buffer does not guarantee a large `ZipInputStream.read` result. The old bridge replied after one read, potentially sending only a few hundred bytes per request. `ArchiveIO.readChunk` now fills up to 1 MiB at the current entry boundary, checking cancellation between reads. Supported WebViews return binary ArrayBuffers; older WebViews retain the base64 fallback. ZIP compression and the backup format are unchanged, so existing v2/v3 backups can be retried directly. The progress window now identifies the page, bytes read, and saving stage. Source integrity, image validation, transaction publication and rollback remain in place.

The native regression compares old short-read counts against filled bridge payloads on the same 600 MiB ZIP, verifies byte totals and cancellation, and runs under a 32 MiB heap. Browser tests cover binary and base64 restore. Device timing remains necessary; test-runner message counts are not a phone speed claim.

Tutorials follow the contextual approach in Nth Reader's Android `js/feature-guide.js`: highlight the actual control, explain one action and its result, and position the guidance away from it. Nth Shelf has its own red/charcoal styling, Back/Next/Finish controls, replay, and first-use tracking. Empty and populated shelves receive separate tours. Each reader mode explains its gestures, controls, bookmarks and returning to the shelf. Tutorials only present the existing interface; they do not perform imports or change books.

Binary response API: https://developer.android.com/reference/androidx/webkit/JavaScriptReplyProxy#postMessage(byte[])


## V2.79.11 Test 1 — Accurate Auto Scroll speed

- Linear 0–2× scale, matching quarter-position labels, exact live readout and 0.01× minus/plus controls. The existing 1× pace remains 38 CSS pixels per second.
- Fractional scroll targets survive rounded WebView offsets, so small speed changes accumulate proportionally. Manual scrolling and pause/resume rebase the target to avoid jumping back. Scroll, Manga and Webcomic use the same timing logic.
- Deterministic scrolling checks cover 30/60/90/120 Hz, rounded offsets, speed changes, zero, bounds and pause/manual-scroll behavior. Browser checks exercise the visible controls and actual scroll distance. Phone testing remains necessary for Android rendering smoothness.


## V2.79.12 Test 1 — Frame borders and geometry preservation

Accuracy comes before speed in this series. Version 2.80.00 is reserved for verified whole-frame accuracy; automatic sequential frame focus at 0.15× scrolling is future work.

- Close trailing gutters at page edges so right/bottom margins are not swallowed into the last baseline panel. The gutter thresholds are unchanged.
- Preserve a valid, connected four-corner frame after an orthogonal classification instead of replacing it with its bounding rectangle. Unproven rectangular seeds retain their established behavior.
- Compute frame angles in image proportions, not in a distorted unit square. Keep those dimensions when serializing panel maps, and invalidate older maps.
- Regression checks distinguish geometry preservation from actual panel-boundary accuracy.

**Known limitation discovered during visual review:** the supplied Wolverine #1000 image `1000-035.jpg` (reader page 36) contains overlapping/stepped visible regions. The historic six-tap test mistakenly treated two taps in the same large middle scene as different panels and missed the smaller sheriff close-up inset. Its stored quadrilaterals are not reliable ground truth. Preserving a detected polygon does not fix incorrectly detected boundaries. Historical parity/safety counts above must not be read as full-comic visual accuracy claims.

The first test build repairs trailing-gutter cropping, geometry loss and classification; the overlapping-panel detector remains under investigation. No comic images are included in the repository or APK.
