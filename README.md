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
**Version 2.78.10 Skew Proof Gate Test**


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


## V2.78.10 Skew Proof Gate Test

V2.78.10 keeps the V2.78.09 tap-ownership and enclosure-completion work, but adds a strict pairwise skew gate before the skewed engine is allowed to own a tap. Three strong rails alone are no longer sufficient, and one isolated diagonal rail can no longer claim an otherwise orthogonal panel. The engine now requires an opposing rail pair to prove either meaningful angular divergence (trapezoid) or a strong shared lean (parallelogram-like geometry). If that proof is absent, routing returns immediately to the orthogonal engine. The same proof is checked again before rendering. `panels.js`, the orthogonal engine, and the stable V2.78.00 detector behavior remain unchanged.

## V2.78.09 Skewed Ownership Test

V2.78.09 changes the geometry contract rather than the stable detector. When the skewed engine proves at least three strong rails and has trusted non-orthogonal evidence, it now claims temporary ownership of that tap instead of immediately surrendering to orthogonal geometry. A missing fourth rail is reacquired at the scale of the stable panel seed. If the first four-rail polygon is too small, the owned skewed path performs one controlled outward expansion pass, favoring rails near the expected frame distance while preserving the detected slopes. Orthogonal geometry remains the fallback only when skewed ownership or completion fails. Large/page-sized polygons are still rejected, and the final polygon must remain convex and contain the tap. V2.78.00 remains the stable production baseline.

## V2.78.08 Tap-Anchored Enclosure Test

V2.78.08 keeps the V2.78 dual-geometry architecture intact and changes only how the skewed engine chooses its four rails. The user's tap is now passed into the geometry layer and becomes the origin of the search. Each side is selected as the nearest sustained enclosing rail on its respective side of the tap; a stronger but more distant page border is no longer allowed to jump across a nearer proven divider. Rail tracing may still extend beyond the orthogonal seed to reach true trapezoid corners, but the final polygon must remain convex, contain the actual tap, stay within a sane area ratio, and remain local to the seed. This directly targets the page-sized skewed polygons seen in V2.78.07 while preserving the working router and stable panel identity system. V2.78.00 remains the stable production baseline.
