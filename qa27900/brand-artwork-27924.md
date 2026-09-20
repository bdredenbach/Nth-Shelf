# Artwork restoration — 2.79.24

The reference is the user's black/red Nth Shelf screenshot: left caped figure,
right gothic city and a stack of comics inside a red circle. The composition
retains that arrangement, with separate text/vector branding and matching
atmospheric top/bottom images. Import and Restore remain normal app controls.

## Final project assets

| Asset | Dimensions / format | Role |
| --- | --- | --- |
| `assets/nth-shelf-hero-hd.webp` | 1448×1086 | Shared central illustration |
| `assets/nth-shelf-top-hd.webp` | 2164×727 | Upper city/cloud atmosphere |
| `assets/nth-shelf-bottom-hd.webp` | 2164×727 | Lower rooftop/fog atmosphere |
| `assets/nth-shelf-brand.svg` | Vector, 512×340 viewBox | Sharp mark and outlined wordmark |
| `android/app/src/main/res/drawable/nth_shelf_brand.xml` | Android vector | Native launch branding |
| `icons/icon-{192,512,1024}.png` | Square PNGs | Regular icons |
| `icons/icon-maskable-{512,1024}.png` | Square PNGs | Safe-area maskable/native icons |

The three illustrations were made with the built-in image-generation tool,
not the CLI. Actual returned dimensions above differ from requested dimensions.
WebP encoding retained source pixels, without resizing or cropping. The central
red circle/comic stack is preserved by contain-style layout. Edge masks apply to
illustration only, never to branding. The screen uses live headings, privacy
copy and archive-format labels to avoid baked-in text blur.

The mark is code-built vector artwork, with outlined DejaVu Sans Bold lettering.
Its license is included at `assets/DejaVu-LICENSE.txt`. Rebuild using
`scripts/build-brand-mark.py` (fontTools and installed DejaVu Sans Bold), then
`scripts/build-brand-icons.cjs` (sharp). Android artwork sync uses the 1024px
maskable icon and the new shared hero.

## Generation prompt set

These record the design instructions and constraints used for the three outputs.

1. **Hero / precise-object-edit.** Reference the existing Nth Shelf welcome art.
   Preserve the black/charcoal/white/red comic-ink style, caped male figure on
   the left, gothic city on the right, and complete central red circle with
   stacked comics. Improve crisp ink detail without crushing shadows. Keep
   generous safe area around the whole circle/stack. Remove app logo, wordmark,
   heading, privacy text, archive badges, rules, buttons and phone/status UI;
   these will be separate code/vector layers. Only the COMICS cover title
   remains. Blend upper/lower edges into near-black #050505. Requested 2048×1536,
   4:3; actual output 1448×1086.
2. **Top / compositing.** Reference the new hero. Make a separate matching 3:1
   upper extension with subdued gothic spires/clouds at the sides and nearly
   black empty center for the logo. No figures, books, circle, text, buttons or
   border. Fade the lower third to #050505; keep the upper edge dark for the
   status area. Requested 2048×688; actual output 2164×727.
3. **Bottom / compositing.** Reference the new hero. Make a separate matching
   3:1 lower extension. Fade the top half from #050505 into subdued rooftop
   ledges and fog at lower corners, leaving a dark quiet center for controls.
   Add only tiny red reflected glow. No figures, books, circle, text, buttons
   or border. Blend outer edges to #050505. Requested 2048×688; actual 2164×727.

Responsive browser layouts were visually inspected in portrait and landscape.
Automated bounds checks cover compact/portrait/landscape sizes. Native splash
uses the same artwork with aspect-preserving fit; device appearance remains
part of this build's requested phone check.
