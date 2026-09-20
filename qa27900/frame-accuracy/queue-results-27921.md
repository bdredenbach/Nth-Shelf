# 2.79.21 Test 1 — browser gutter continuity

FQ-10 remains the target: isolate page 11's whole right-hand fortifications
frame, including both captions. The forest and borderless portrait remain
unresolved. The preceding phone recording failed the .20 candidate despite
passing local Sharp and Skia simulations.

## Reproduced cause and bounded change

Real Chromium 151.0.7922.34, using the original 1988×3056 JPEG and the app's
585×900 analysis canvas, reproduces the missing frame. Its quiet-gutter track
on the left rail has samples at rows 168–275 and 280–518: four absent rows
split one printed border into two tracks. Neither track can form the complete
frame. The merged selection follows from the remaining legacy identity; no
cache or hit-order defect is needed to reproduce the video behavior.

The gradient route's track may now span at most five missing samples while
remaining within two cross-axis pixels. Its combined points must still pass
the existing slope/residual fit, complete ink support, four exterior-gutter
support checks, corner joins and interior-divider/inset rejection. Other gutter
routes retain their original gap limit. No source coordinates or comic-specific
exceptions enter runtime. Frame ownership and bubble code are unchanged.

This establishes and fixes the reproduced Chromium cause. It does not prove
the exact WebView version or active installed build on the user's phone.

## Verification

- **74-page real Chromium comparison:** only page 11 changes, from three to
  four identities. Every old identity remains byte-for-byte equivalent as JSON;
  the other 73 pages are unchanged. The old version fails to identify the
  fortifications, while the candidate matches the independent artwork label.
- **10 actual browser touch/overlay checks:** five interior positions repeated
  twice without clearing cache, using IndexedDB, Reader's page load, native
  Chromium canvas, touchscreen events and the real rendered pop-out. The whole
  fortifications crop retains both captions and excludes the forest/portrait.
  The screenshot was visually inspected. Tutorial completion is fixture setup;
  detector, Reader, image mapping and renderer remain real.
- **391 existing Reader-handler checks:** 229 Sharp checks and 162 Skia checks
  at low/medium/high resampling qualities. These retain all earlier covered
  controls, including the phone-confirmed page-19 middle scene.
- The new synthetic regression fails with the old tracker and passes with the
  candidate. It accepts a four-row interruption of exterior quiet-color evidence
  beside intact ink, and rejects a nine-row interruption. Existing missing-side,
  full/interrupted divider, inset, overlap and identity-priority checks remain.
- Existing geometry, partition, pilot-strip, bubble and cancellation gates pass.
  CI separately gates browser/backup behavior, native archive streaming, APK
  metadata and signature before artifact delivery.

The all-page browser comparison is stronger than the earlier simulated-canvas
comparison for this failure, but still is not device certification or a
whole-comic five-position acceptance claim. Earlier fallback and resampling
limitations remain recorded. No device speed or bubble-improvement claim.

## Repeat the browser artwork check

Serve the repository's parent directory, with the private original comic at
`comic-wolverine-1000/`. Set `CHROME_BIN` if Chromium is not installed through
Playwright. Optional `NTH_BASELINE_URL` points to the previous app root served
by the same server and enables the 74-page comparison.

```sh
NTH_BASELINE_URL=http://127.0.0.1:8765/nth-shelf-baseline20/ \
  node qa27900/browser-frame-artwork.cjs --comic
```

The fixture, decoded pixels, screenshots and recordings are excluded from the
repository and APK. The independent border label remains `queue-artwork-27920.json`.

Version `2.79.21-test1`, Android code `27925`; shell/map/proof versions advance.

## Phone acceptance and remaining queue

Retest left/right/center/north/south taps inside page 11's fortifications panel.
Every opening must retain the whole printed panel and both captions. Recheck
page 19's middle scene and the established page-5/7/9/13/16/17 controls.

Keep FQ-10 open until this phone check passes. Its forest and borderless portrait
are not fixed by this change. Pages 9–10's upper groups, page-19 upper room/eye
and syringe problems, page-6 proof gaps, and explicit second-level caption/artwork
checks remain queued. Accuracy work stays in the 2.79 series.
