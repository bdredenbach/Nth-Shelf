# Test50 — page44 resampling mismatch

Test49 is a **failed phone candidate**. Screenshots 209637–209643 show clipped BLAM/bottom artwork and fallback crops spanning several scenes. A single successful Chromium decoder was inadequate evidence.

## Reproduction and change

The same source JPEG produces seven incomplete matte cells under four alternative downsamplers (Skia low/medium/high and Sharp). Test49's completion returns no replacement. Its enlarged pale boundary erases the thin SHLIK core below the component-size threshold; other variants also alter connectivity or create a mixed prior region.

For an existing multi-cell dark matte map, Test50 reads the native-sized image into a CPU canvas and explicitly bilinear samples to the analysis dimensions. Both cell extraction and completion consume those same pixels. Browser-scaled pixels cannot affect this route. A narrow, independently proved cell may be retained when its eroded core disappears, but only with at most 5% overlap with new cores and at least 90% measured rim support. Existing one-to-one correspondence, coverage, perimeter and contour proofs still apply. Uncertain results defer; the explicit native allocation is capped at 24 million pixels.

No page number, comic title, file hash or stored test geometry enters runtime detection.

## Results

| Check | Result |
| --- | --- |
| Default Chromium Reader | 72/72 real touches; eight complete pop-outs inspected |
| Low resampling injected into scaled drawImage calls | 72/72 touches; 8,335/8,335 dense interior pixels opaque |
| High resampling injected into scaled drawImage calls | 72/72 touches; 8,335/8,335 dense interior pixels opaque |
| Low, medium, high and Sharp full detector replays | Exactly the same eight canonical frame descriptors |
| Test49 under each replay | Seven incomplete cells; different from repaired map |
| 74-page comparison against 4ab6b6c | Only page44 changes; other 73 descriptor lists byte-identical |
| Erased separator, transparent image, flat matte | Both direct and native completion reject |
| Explicit sampler and proof mutation checks | Pass |
| Full retained frame regression step from Android workflow | Pass locally; see retained-regression-report.txt |

The dense samples lie in manually inset artwork polygons, independent of the detector's output. They complement the user's nine real touches per frame; they are not a claim about every border pixel or every possible tap. Source artwork and screenshots remain private and are not committed.

## Reproduce

Serve a common parent with `nth-shelf-current`, a Test49 checkout named `baseline-test49`, and the user's `comic-wolverine-1000` image folder. Playwright and Chromium are required for `reader.cjs`, `resampling.cjs`, `negative.cjs`, and `sweep.cjs`. Source index43 is Reader page44. `QA_ORIGIN`, `QA_APP_PATH`, `QA_BASELINE_PATH`, `QA_OUTPUT`, `CHROME_BIN`, and the existing comic-path variables may override defaults.

Use `build-rasters.cjs` with Sharp and @napi-rs/canvas to generate the private alternative scaled rasters. `QA_RASTER=low` or `high` enables Reader injection; `QA_RASTER_PATH` controls their HTTP folder in the detector replay. Ordinary drawing at native size and actual pop-out drawing are not overridden. `native-raster-contract.cjs` needs no private image and runs in Android CI, alongside the retained regression suite.

**Android phone acceptance is pending.** The exact device raster has not been captured. The alternative resampling paths are local reproductions of the failure mechanism, not a device trace. Build/signature checks are recorded separately in the APK artifact's BUILD.json and logs.
