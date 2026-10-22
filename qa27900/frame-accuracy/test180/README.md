# Unreleased partial-caption repair

Status: native-qualified source candidate published for review on
`candidate/test179-caption-repair-20261022`; not accepted, packaged, or phone-qualified.
The directory name is a QA checkpoint, not an issued Test180 APK. Test179 app and
service-worker identities remain unchanged until a separately authorized release.

## Production change

Only `js/panels-detached-captions.js` and one guarded condition in `js/reader.js`
change relative to the exact recovered Test179 web source. The existing caption
body detector can now finish a partially displayed caption belonging to one
validated matte-cell owner. Detector boxes, routing and scene membership stay unchanged.

A candidate body needs dual-palette lettering evidence, at least 90% of its
measured extent inside one owner, 15–85% existing display coverage, and no
competing owner's bounds or displayed pixels. A checked native-pixel fringe
preserves lettering antialiasing while rejecting foreign strokes and disconnected
same-color artwork. Missing or oversized source evidence defers to the old display.

Expansion uses private state tied to the image, owner generation and bounded,
revalidated geometry. It never serializes recursive proof graphs or source-image
buffers. Failed or malformed tracing cannot authorize expansion; successful new
contours are deeply immutable. The previous trailing-edge repair path is preserved.

## Final native validation

- 52 new positive/negative controls, including scaling, reflection, native thin
  strokes, competing ownership, stale/forged state, source replacement, trace
  failures and returned-geometry mutation.
- 31 exact-search, 29 scene, 30 earlier scene and 110 navigation checks, plus
  the legacy detached-caption contract.
- All 171 known fixed-tap PNGs and popup styles exact to frozen Test179.
- All 110 issue 3 outcomes replayed: 109 unchanged; only page 3's intended caption
  crop changes. Four inherited no-popup outcomes remain. No Reader exceptions.
- All 88 issue 1 actual-tap outcomes exact to a fresh frozen-Test179 replay,
  including raw/CSS-clipped PNGs, canvas sizes and animation-end styles.
- Three separately labeled owner-selected issue 1 crops also match the historical
  Test168 native hashes. They are not additional successful actual taps.

The repaired caption retains all 48,507 independently annotated native foreground
samples at full alpha; 36,489 were missing before. The other two page 3 crop PNGs
and styles remain exact. Retracing the intentionally changed crop slightly changes
edge antialiasing elsewhere: one previously 50/255-alpha gray edge sample disappears,
and nine formerly opaque samples become 207–244/255 alpha. No formerly fully opaque
foreground sample disappears. This is not a claim of pixel identity outside the caption.

## Historical issue 1 gap remains explicit

Against Test168's archived crop receipts, actual taps still give 85 exact crops,
one different fallback crop (`p10-s02`), and two missing popups (`p20-s02`, `p20-s03`).
These occur in untouched Test179 and remain unchanged in this candidate. Each
historical owner uniquely matches fresh detector geometry and reproduces its old
crop when directly selected. That does not establish tap reachability or phone
acceptance. The original 22 entry-gate hash expectation is retained, not weakened.

## Performance and limits

Alternating fresh native processes were run after the full regressions finished.
Shared-host scheduling remains uncontrolled; these are not Android timings.

| Case | Runs per version | Prepare ms, 179 → candidate | Peak RSS MiB, 179 → candidate |
| --- | ---: | ---: | ---: |
| Repaired issue 3 caption | 3 | 956.7 → 1287.3 | 682.9 → 710.8 |
| Unchanged held-out matte page | 2 | 1720.8 → 1740.5 | 709.6 → 706.3 |
| High-memory issue 1 page | 1 | 793.3 → 758.1 | 1432.4 → 1430.7 |

Values are medians where repeated. Caption preparation costs about 331 ms more
and peak native memory about 28 MiB more in this sample. Handler medians fluctuate
in both directions, so no speedup is claimed. The high-memory native pipeline
already exists in Test179; its roughly 1.40 GiB process peak is not a phone-memory
bound. All benchmark PNGs and styles matched their qualified version's receipts.

This repairs one caption, not the whole issue, landscape detection, speech ownership,
or expensive first/nearby fallback searches. A landscape-hole prototype was rejected
because its ownership evidence was insufficient; it is not shipped. The remaining
scene defects need whole-source ownership proof, not a broad box, contact relaxation,
or a comic/page lookup. Real browser/compositor, Worker/IndexedDB, Android memory,
restart, rendering and cold/warm interactions remain unqualified.

## Reproduce public controls

From a Git checkout containing historical commit `b9ebeeb` (needed by the
navigation contract), with `@napi-rs/canvas` available beneath
`CODEX_PRIMARY_RUNTIME_NODE_MODULES`:

```sh
node qa27900/frame-accuracy/test180/partial-caption-contract.cjs
node qa27900/frame-accuracy/test179/exact-search-controls.cjs
node qa27900/frame-accuracy/test179/scene-controls.cjs
node qa27900/frame-accuracy/test179/legacy-scene-controls.cjs
node qa27900/frame-accuracy/test126/detached-caption-contract.cjs
node qa27900/frame-accuracy/test170/reader-navigation-contract.cjs
```

See `validation.json` for source identities and measured counts. Source art,
immutable audit centers, native receipts and private replay harnesses are retained
outside Git. Do not infer acceptance from the control count or higher checkpoint number.
