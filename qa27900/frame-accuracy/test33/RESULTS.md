# Page42 / 2.79.33 iteration evidence

## Status

Local source candidate, **not a delivered or phone-accepted Android APK**.
No remote source push or GitHub Actions run was performed in this session.
The latest remote branch check is recorded in the project README and handoff.

The input comic has 74 images. Reader page42 is archive index41. The image SHA
and manually chosen ownership points are in `page42-anchors.json`; neither
that file nor the comic's identity is used by the runtime detector. Seven
printed scenes were identified by visual review. A highlighted hand outline
in the lower-left scene is not an eighth panel.

## What changed

`panels-curved-rims.js` discovers supported pale-rim separators, chooses a
noncrossing tier network and terminal fan, assigns compact connected white
balloons to their majority scene, reconciles small detached rim fragments, and
traces the resulting exact grid contours, including holes. Each result carries
its measured network and contour certificate. Invalid certificates cannot
select an enclosing rectangle in Reader.

The route runs only after all established page-level routes return empty.
There is no universal fallback to a guessed panel, no per-page crop lookup, no
comic hash match, no filename/page-number condition and no test-anchor input.

## Fresh 74-page regression

`fresh74-descriptors.json.gz` captures full detector output and script hashes.
`comparison.json` compares every descriptor against the unchanged Test32 fresh
capture, not against a historical aggregate count. Only page42 changes 0 → 7;
all 298 older entries are preserved exactly and in order, giving 305 total.
Page41's nine entries stay identical: eight intended scenes plus one retained
old merged fallback, not nine intended scenes. Pages43 and44 remain empty in
the page-level capture and are still queued.

The historical 301 total and the fresh Test32 count 298 are both retained. Their
difference is unresolved. This iteration does not claim to reproduce the
historical 162/400 touch/render checks or its 296-descriptor comparison.

## Executed checks

- 54/54 manually selected page42 artwork, dialogue and lettering ownership
  anchors; not sampled merely from the detector's own accepted pixels.
- 35 actual Playwright touchscreen taps, five per panel, through the real Reader
  handlers and `NthPageDeck`. All selected the expected contour and retained
  the certificate/contours in second-level focus metadata.
- 35 original-resolution Reader canvas comparisons against independently
  assembled reference canvases using the accepted descriptor and source image:
  **zero differing pixels across 40,714,315 compared pixel positions**. This
  verifies renderer consistency, not by itself semantic panel correctness.
- No Reader JavaScript page errors. The full74 detector run also reported none.
- 17 existing frame/geometry/bubble suites passed; exact output is retained in
  `legacy-suite-log.txt`. Auto Scroll separately passed 240 timing/lifecycle
  checks. These are not counts of phone gestures.
- 161 tampered-certificate rejections: 23 mutations across 7 descriptors; four
  malformed input shapes rejected. See `curved-rim-contract.cjs`.
- Seven raw-pixel negatives rejected: black, white, a transparent pixel, wrong
  exterior matte, erased transverse rim, erased terminal seam, and unstructured
  noise. These were actually run, not inferred from the validation code.
- 17 current service-worker checks and 16 historical worker checks against the
  preserved Test32 worker snapshot. All 41 JS files plus sw.js pass Node syntax.

## Browser harness and limits

Chromium 144.0.7559.96; Reader viewport 412×915, deviceScaleFactor 2.625, mobile and
touch emulation enabled. Network navigation in this environment was blocked,
so the successful Reader harness loads local app HTML/CSS/scripts inline, uses
a private data-image fixture, and stubs only the storage boundary in memory.
It does not establish IndexedDB persistence, import/restore, a real service
worker install, Android WebView behavior or on-device speed.

A measured new-route pass took approximately 0.73seconds on this desktop
browser; that is not whole-page detection latency or a phone benchmark.
The earlier detector-only run measured approximately 0.99seconds. Performance
was not used to waive any contour/ownership requirement.

Visual inspection of the seven actual Reader canvases checked the crossing
balloon, the intact lower-left scene and the projecting final-panel lettering.
Screenshots/crops are private handoff artifacts, deliberately outside Git.

Native Java source, app artwork, icons and CSS are byte-for-byte unchanged from
the recovered checkpoint. Native version metadata/workflow labels changed to
2.79.33 / 27961. No Gradle build, signing, APK installation, app migration or
phone acceptance was executed. The broader browser import/branding integration
gates remain in CI but were not run in this offline harness.

## Reproduce

Run from the project root, with Node.js and Python Playwright/Chromium installed.
The fixture is supplied privately, never committed.

```sh
node qa27900/frame-accuracy/test33/curved-rim-contract.cjs
node qa27900/frame-accuracy/test33/service-worker.test.cjs
node qa27900/frame-accuracy/test32/service-worker.test.cjs \
  qa27900/frame-accuracy/test32/sw-baseline.js
python3 qa27900/frame-accuracy/test33/pixel-negatives.py \
  --comic /private/comic.zip --out /tmp/rim-negatives.json \
  --browser /path/to/chromium
python3 qa27900/frame-accuracy/test33/reader-touch.py \
  --comic /private/comic.zip --out /tmp/reader42 \
  --browser /path/to/chromium
python3 qa27900/frame-accuracy/test32/capture-baseline.py \
  --comic /private/comic.zip --out /tmp/fresh74.json.gz \
  --browser /path/to/chromium \
  --compare qa27900/frame-accuracy/test33/fresh74-descriptors.json.gz
```

Do not add `/tmp/reader42` or the comic archive to Git. Historical tests and
reports remain unchanged; the historical service-worker test deliberately
expects the old version and must be passed its preserved old worker snapshot.
