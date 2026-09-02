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
- Use the speed control to select **0.0x, 0.33x, 0.50x, 0.66x,** or **1.0x**.
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
Back up and restore the metadata for your comics, collections, bookmarks, reading progress, and library. You'll need to re sync your collection, however if db gets destroyed.

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
**Version 2.78.20 Tap-Neighborhood Frame Consensus Test**




## V2.78.20 Tap-Neighborhood Frame Consensus Test

V2.78.20 fixes two failures exposed by the `140153.jpg` sandbox comparison. Rail adjacency is now judged relative to the competing rails on the same side, so a strongly proven top or left divider can beat a corner-convenient artwork edge without requiring the outer page border to have bright pixels on both sides. When the stable detector supplies an oversized or weak seed, the envelope also runs a bounded set of local panel-scale seeds and nearby tap probes. Only already closed, convex, tap-containing four-rail families remain eligible; the rescue ranks those proven loops by side-relative evidence, geometry confidence, seed coverage, and cross-seed agreement. In the five-position sandbox sweep, center, upper, lower, left, and right taps inside the test panel converged on the same complete skewed frame. Ownership remains deferred. V2.78.00 remains the stable production baseline.

## V2.78.19 Neighbor-Side Consistency Test

V2.78.19 adds neighbor-side consistency as ranking evidence after closed-loop validation. Each candidate rail samples the dark rail and the image regions immediately on both sides. This evidence cannot manufacture an open rail or bypass the closed-family protections. The build showed that absolute adjacency alone was too weak and could give a correct outer page rail a score of zero; V2.78.20 replaces that final comparison with side-relative evidence and local-seed consensus.

## V2.78.17 Chain-Connected Rail Family Test

V2.78.17 keeps the finite-rail and short-bridge safety work from V2.78.15–V2.78.16 but changes rail acquisition fundamentally. The frame envelope now generates several plausible rails per side and searches for one **closed rail family** around the tap: top → right → bottom → left → top. A rail is no longer allowed to win simply because it is individually strong; every selected side must participate in the same finite, connected enclosure. This directly targets the V2.78.16 failure where excellent rails at very different structural scales produced a 500+ px endpoint mismatch. Ownership remains deferred: this build tests only whether one coherent whole frame can be recovered around the tap before orthogonal/skewed classification. V2.78.00 remains the stable production baseline.

## V2.78.16 Endpoint Convergence / Short-Bridge Corners Test

V2.78.16 keeps V2.78.15 finite rail spans, but allows a tightly bounded short bridge when two proven neighboring rail endpoints stop just before a real comic-frame corner. The engine projects each rail only a small distance and accepts the corner only when both endpoints converge on the same intersection, both endpoints still have local frame ink, and the endpoint gap stays below a panel-scaled hard limit. Infinite extrapolation remains forbidden. Direct corners still require connected intersection support; bridged corners are explicitly logged as BRIDGED. Ownership remains deferred so this build tests only whether finite rails can recover the complete frame despite short border interruptions. V2.78.00 remains the stable production baseline.

## 🔒 Privacy
Nth Shelf is designed around local-first storage. Your comics are stored on your device rather than uploaded to an Nth Shelf server simply to read them.

## 📜 License
This project is licensed under the **MIT License**. The license applies to the software and does not grant rights to comic artwork or other copyrighted material imported by users.




## V2.78.07 Skewed Classifier + Corner Freedom Test

V2.78.07 keeps the dual-geometry router and V2.78.06 rail acquisition unchanged, but adjusts the final skewed decision and polygon validation. A single high-confidence oblique rail can now classify a panel as skewed, and opposing-rail divergence is considered directly instead of relying only on an averaged slope/shift signal. Corner escape is now directional: corners adjacent to a strongly oblique, well-supported rail may move farther outside the orthogonal seed while convexity, area, seed-center containment, and four-rail proof remain mandatory. This specifically targets the two V2.78.06 outcomes observed in testing: `SKEWED DECLINE` after four rails were found and `SKEWED MISS corner escaped seed` after a strong diagonal rail was acquired. V2.78.00 remains the stable production baseline.

## V2.78.06 Skewed Rail Acquisition Test — Directional Rail Search

V2.78.06 keeps the V2.78.05 dual-geometry architecture intact and changes only the skewed geometry engine. The skewed path now searches line hypotheses that may migrate progressively away from the orthogonal seed, then robustly refits those candidates to actual dark frame ink. This is designed for trapezoids and diagonal dividers where a real rail can be close to the seed at its midpoint but far away at one or both ends. The router and orthogonal fallback remain conservative: skewed geometry must still prove four coherent rails, a convex valid polygon, and strong overlap with the stable panel seed. Debug output reports per-rail `SKEWED rail ... HIT/weak`, the final rail count, and `ROUTER -> SKEWED` or `ROUTER -> ORTHOGONAL`. V2.78.00 remains the stable production baseline.

The V2.78.01–V2.78.04 geometry experiments are retained below as R&D history only; their geometry implementations have been removed from `panels.js` in this build.


## V2.78.04 Trace Stabilizer Test — Geometry Branch

V2.78.04 keeps the V2.78.00 stable detector and the V2.78.03 authority routing, but makes polygon geometry deliberately harder to earn. Each of the four rails is now fit as one robust mostly-straight structure with distributed support across the side. Dark artwork can no longer pull a trace through a chain of locally attractive pixels. Opposite rails must agree, corners must remain near the proven seed, the quadrilateral must stay convex, and area/support/coverage checks reject malformed cutouts. If the stabilizer cannot prove all four sides, the existing safe fallback behavior remains in force. Debug logs use `V104 trace-stabilizer HIT/MISS`. V2.78.00 remains the stable baseline.

## V2.78.03 Trace Authority Test — Routing Branch

V2.78.03 keeps the V2.78.00 stable hybrid detector and the V102 boundary tracer, but changes who is allowed to declare a difficult fallback panel complete. If V100 misses, V99/V92 may provide a legacy seed rectangle. V102 then gets the first chance to prove the four true rails and supply a polygon. A legacy candidate supported by only two sides is rejected when tracing cannot prove the missing geometry; it can no longer silently become the final pop-out. Four-side legacy candidates remain available as a safe rectangular fallback. Debug logs explicitly report `HYBRID MISS`, `TRACE ATTEMPT`, `TRACE HIT/MISS`, and whether the renderer receives a polygon or rectangle. V2.78.00 remains the stable baseline.

## V2.78.02 Boundary Trace Test — Geometry Branch

V2.78.02 is an experimental geometry branch built on the V2.78.00 stable hybrid baseline. V100 still identifies the panel; V102 traces coherent frame rails around that proven region and may supply a four-corner polygon. If tracing is weak, the stable rectangle is preserved. V2.78.00 remains the stable baseline. V73 remains the first panel-detection pass. When V73 misses, the structural detector analyzes sustained black frame bands and quiet gutter bands to identify a proven panel region. If it cannot prove a region, Nth Shelf falls back to the existing V99 boundary-set + V92 interior-validation path rather than forcing a result.

This release establishes the structural hybrid detector as the baseline for future panel-geometry improvements. Internal debug messages continue to use the `V100 hybrid` prefix so test logs remain comparable with the successful prototype run.



## V2.78.11 Vertex / Angle Ownership Test

V2.78.11 intentionally separates **geometry ownership** from **full skewed-frame extraction**. `panels.js` remains the stable V2.78 panel-identification core. `panels-geometry-skewed.js` now classifies only from a local four-vertex candidate: it fits local sides near the stable seed, intersects them into four corners, measures the four interior angles and opposing-side divergence, and grants skewed ownership only when the vertex geometry proves a genuinely non-orthogonal quadrilateral. `panels-geometry.js` records that ownership but deliberately renders the stable rectangular seed in this test build. This prevents slivers/malformed polygons while ownership is tuned. Once ownership is reliable, the next phase can add full-frame expansion entirely inside the skewed geometry module.

Expected diagnostic paths are `VERTEX OWNERSHIP -> SKEWED` / `ROUTER OWNERSHIP -> SKEWED ... (render seed only)` for true skewed panels and `VERTEX OWNERSHIP -> ORTHOGONAL` / `ROUTER OWNERSHIP -> ORTHOGONAL` for normal panels.

## V2.78.10 Skew Proof Gate Test

V2.78.10 keeps the V2.78.09 tap-ownership and enclosure-completion work, but adds a strict pairwise skew gate before the skewed engine is allowed to own a tap. Three strong rails alone are no longer sufficient, and one isolated diagonal rail can no longer claim an otherwise orthogonal panel. The engine now requires an opposing rail pair to prove either meaningful angular divergence (trapezoid) or a strong shared lean (parallelogram-like geometry). If that proof is absent, routing returns immediately to the orthogonal engine. The same proof is checked again before rendering. `panels.js`, the orthogonal engine, and the stable V2.78.00 detector behavior remain unchanged.

## V2.78.09 Skewed Ownership Test

V2.78.09 changes the geometry contract rather than the stable detector. When the skewed engine proves at least three strong rails and has trusted non-orthogonal evidence, it now claims temporary ownership of that tap instead of immediately surrendering to orthogonal geometry. A missing fourth rail is reacquired at the scale of the stable panel seed. If the first four-rail polygon is too small, the owned skewed path performs one controlled outward expansion pass, favoring rails near the expected frame distance while preserving the detected slopes. Orthogonal geometry remains the fallback only when skewed ownership or completion fails. Large/page-sized polygons are still rejected, and the final polygon must remain convex and contain the tap. V2.78.00 remains the stable production baseline.

## V2.78.08 Tap-Anchored Enclosure Test

V2.78.08 keeps the V2.78 dual-geometry architecture intact and changes only how the skewed engine chooses its four rails. The user's tap is now passed into the geometry layer and becomes the origin of the search. Each side is selected as the nearest sustained enclosing rail on its respective side of the tap; a stronger but more distant page border is no longer allowed to jump across a nearer proven divider. Rail tracing may still extend beyond the orthogonal seed to reach true trapezoid corners, but the final polygon must remain convex, contain the actual tap, stay within a sane area ratio, and remain local to the seed. This directly targets the page-sized skewed polygons seen in V2.78.07 while preserving the working router and stable panel identity system. V2.78.00 remains the stable production baseline.


## V2.78.13 Junction-Locked Envelope Test

V2.78.13 deliberately moves **full-frame recovery ahead of geometry ownership**. The stable V2.78 panel detector still identifies the tapped panel. A new `js/panels-frame-envelope.js` stage then searches for the complete four-sided enclosure around that seed and tap. It rejects tiny interior slivers by requiring a whole-frame area comparable to the stable seed, keeps the tap inside the recovered quadrilateral, requires four connected/convex corners, and allows real trapezoid corners to escape outward from the orthogonal seed.

For this test build, angle ownership is intentionally deferred. When a complete envelope is proven, the reader renders that four-corner envelope directly so testing can answer one question cleanly: **did we find the whole comic-panel frame?** If the envelope cannot prove itself, the router falls back to the stable orthogonal rectangle. Once full-frame recovery is reliable, the existing vertex/angle classifier can be applied to those actual frame vertices to route between orthogonal and skewed geometry.


## V2.78.13 — Junction-Locked Envelope Test
This test keeps the V2.78.12 whole-frame envelope architecture, but adds per-corner junction locking. Each mathematically inferred corner must now snap to nearby local evidence from both neighboring frame rails before the polygon is accepted. The goal is to stop oversized quadrilaterals whose fitted sides intersect beyond the actual comic-frame corner.
