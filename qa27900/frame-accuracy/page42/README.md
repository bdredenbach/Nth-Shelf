# Page42 — pale-rim research checkpoint

**Status: partial research only. Not integrated into the reader, not an APK,
not phone-accepted, and not version 2.79.33.** The first five panel footprints
have useful candidate crops; the two lower-right panels remain withheld.

## What was actually run

The original uploaded comic was decoded in Chromium 144.0.7559.96. Reader page42
is zero-based archive index41. Its 1988 x 3056 image becomes the existing
585 x 900 analysis raster. The unmodified Test32 detector returns zero page-level
identities for this page; interactive fallback behavior is a separate question.

`propose_pale_rims.py` combines a measured, exterior-connected near-black matte
with thin pale strokes. Short joins require opposing endpoint tangents. A
bounded stack-layout gate withholds unfamiliar or inconsistent arrangements.
A white-balloon ownership vote restores the complete crossing balloon to the
third proposal rather than cutting it at the nominal third/fourth divider.
No filename, reader-page number, image hash, OCR result or stored crop polygon
selects geometry inside the proposal function. Fixture coordinates occur only
in the separate test program.

Five candidate masks are returned: the three upper bands, the large pointed
center panel, and the large concave bottom-left panel. The unresolved lower-right
composite is context, **not a sixth accepted panel**. No crop from that composite
is emitted.

The local prototype passed **61 checks**:

- 45 intended-point selection checks and 6 exclusion/withholding checks.
- 5 independent Chromium cell-edge contour rasterizations: zero alpha-pixel
  differences from their corresponding proposal masks.
- 5 rejection cases: black and white blank images, an unproved mirrored layout,
  a removed long divider section, and an added large closed inset.

These are **prototype checks**, not Reader/Page Deck/native/phone tests. The
raster comparisons prove contour-to-mask consistency, not semantic accuracy of
all artwork pixels. The connectivity diagnostic retains two tiny interior holes
(1 and 17 pixels) and a detached 1-pixel piece in proposal5. They are recorded,
not hidden by a single-ring assumption or asserted to be production quality.

See `results-summary.json`. The full local results, contour coordinates and
rendered previews are preserved in the downloadable research checkpoint; the
test program regenerates them from the privately supplied comic. Comic images
are deliberately excluded from this repository and application assets.

## Protected Test32 baseline

A separate fresh run completed all 74 images with **298 descriptors** and no
page errors. All 74 image hashes, counts and descriptor hashes exactly matched
the prior fresh checkpoint. Page41 retained nine entries, including its five
version-4 column panels. Nine entries include a legacy merged fallback and do
not mean nine intended scenes.

All 40 runtime JavaScript files remain byte-for-byte identical to the supplied
Test32 APK and passed `node --check`. The existing service-worker contract passed
16 checks. The prototype is not loaded by `index.html` or the service worker.
This is a rerun of the unchanged baseline, **not** a 74-page evaluation of a new
production route. Historical Test32's reported 301 total remains a distinct,
unreconciled record; this run does not claim to reproduce it.

The GitHub branch still requires its full Test32 runtime-source import. This
research commit does not claim to complete that separate bulk synchronization.
The local full project archive contains the recovered Test32 source and the new
research work. Existing GitHub runtime files and older tests are not overwritten
by this checkpoint.

## Remaining boundary problem

The final pair shares an interrupted pale rim crossed by projecting sound-effect
lettering. A longer-join trial separated the pair but clipped face artwork; it
was rejected. A color/lettering trial still assigned face-fringe pixels to the
lettering panel and was also rejected. Neither trial is enabled in the app.

Next acceptance work is to resolve that ownership boundary without sacrificing
the face, frame rim, lettering or the first five footprints; then implement and
verify a separate, proof-checked empty-map route in JavaScript. Full-image
regression checks, actual Reader/Page Deck rendering, and phone testing are still
required before promoting page42. Keep page41 and earlier accepted pages fixed.
Reserve **2.79.33** for the successful page42 iteration.

## Reproduce locally

Use Python 3.13 and a local Chromium executable. The recorded dependency versions
are in `requirements-research.txt`.

```sh
python -m pip install -r qa27900/frame-accuracy/page42/requirements-research.txt
python qa27900/frame-accuracy/page42/test_pale_rims.py \
  --comic '/path/to/Wolverine 1000.zip' \
  --browser /path/to/chromium --out /tmp/nth-page42-research
```

The test reads the comic in place and writes crops/results only to the explicit
output directory. Do not point that directory inside a public repository.
