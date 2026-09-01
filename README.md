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
**Version 2.78.05 Dual Geometry Router Test**


## 🔒 Privacy
Nth Shelf is designed around local-first storage. Your comics are stored on your device rather than uploaded to an Nth Shelf server simply to read them.

## 📜 License
This project is licensed under the **MIT License**. The license applies to the software and does not grant rights to comic artwork or other copyrighted material imported by users.




## V2.78.05 Dual Geometry Router Test — Clean Geometry Architecture

V2.78.05 separates panel identity from panel shape. `js/panels.js` is returned to the stable V2.78.00-style role: V73/V100/V99/V92 identify the tapped panel and return a rectangle seed, but no longer perform V101–V104 polygon refinement. Geometry is routed afterward through three dedicated modules: `panels-geometry.js` (router), `panels-geometry-orthogonal.js` (rectangle/near-rectangle path), and `panels-geometry-skewed.js` (trapezoid/slanted quadrilateral path). The skewed engine inherits the useful rail-fitting, continuity, corner, convexity, and area-validation lessons from V2.78.01–V2.78.04, but cannot choose a different panel. If skewed geometry cannot prove itself, the router falls back to the orthogonal seed. Debug logs use the `V105 geometry` prefix and explicitly report `ROUTER -> SKEWED` or `ROUTER -> ORTHOGONAL`. V2.78.00 remains the stable production baseline.

The V2.78.01–V2.78.04 geometry experiments are retained below as R&D history only; their geometry implementations have been removed from `panels.js` in this build.


## V2.78.04 Trace Stabilizer Test — Geometry Branch

V2.78.04 keeps the V2.78.00 stable detector and the V2.78.03 authority routing, but makes polygon geometry deliberately harder to earn. Each of the four rails is now fit as one robust mostly-straight structure with distributed support across the side. Dark artwork can no longer pull a trace through a chain of locally attractive pixels. Opposite rails must agree, corners must remain near the proven seed, the quadrilateral must stay convex, and area/support/coverage checks reject malformed cutouts. If the stabilizer cannot prove all four sides, the existing safe fallback behavior remains in force. Debug logs use `V104 trace-stabilizer HIT/MISS`. V2.78.00 remains the stable baseline.

## V2.78.03 Trace Authority Test — Routing Branch

V2.78.03 keeps the V2.78.00 stable hybrid detector and the V102 boundary tracer, but changes who is allowed to declare a difficult fallback panel complete. If V100 misses, V99/V92 may provide a legacy seed rectangle. V102 then gets the first chance to prove the four true rails and supply a polygon. A legacy candidate supported by only two sides is rejected when tracing cannot prove the missing geometry; it can no longer silently become the final pop-out. Four-side legacy candidates remain available as a safe rectangular fallback. Debug logs explicitly report `HYBRID MISS`, `TRACE ATTEMPT`, `TRACE HIT/MISS`, and whether the renderer receives a polygon or rectangle. V2.78.00 remains the stable baseline.

## V2.78.02 Boundary Trace Test — Geometry Branch

V2.78.02 is an experimental geometry branch built on the V2.78.00 stable hybrid baseline. V100 still identifies the panel; V102 traces coherent frame rails around that proven region and may supply a four-corner polygon. If tracing is weak, the stable rectangle is preserved. V2.78.00 remains the stable baseline. V73 remains the first panel-detection pass. When V73 misses, the structural detector analyzes sustained black frame bands and quiet gutter bands to identify a proven panel region. If it cannot prove a region, Nth Shelf falls back to the existing V99 boundary-set + V92 interior-validation path rather than forcing a result.

This release establishes the structural hybrid detector as the baseline for future panel-geometry improvements. Internal debug messages continue to use the `V100 hybrid` prefix so test logs remain comparable with the successful prototype run.
