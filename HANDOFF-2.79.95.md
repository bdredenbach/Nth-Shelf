# Test95 / 2.79.95 — complete water-and-hand artwork

5 October 2026. Repository `bdredenbach/Nth-Shelf`, branch `Test_Branch`.

## Bounded target and outcome

Apocalypse issue 2 reader **18**, selection **1**, the upper-right water-and-hand frame now retains the complete wrist, palm, both balloons and background. The source enclosure repairs 4,266 analysis pixels. All original owner pixels survive; the SWAK selection 2 and every other retained descriptor are identical. Local complete coverage: **151 singles + ten connected pairs = 171 / 385**. Remaining: **214** (197 without qualifying selections, 17 damaged). Raw selections remain **186**. This is one repaired single, zero newly detected frames; phone acceptance remains pending.

The original SWAK probes were rejected: dark-ink erosion merged En or lower scenes, and quiet seed reconstruction did not isolate SWAK. No SWAK improvement is claimed. A closed dark-matte enclosure on the same page provided the bounded accepted gain.

## Runtime rule and safety

`js/panels-dark-matte-completion.js` only completes an already valid local matte owner whose source palette is dark. The local transition floods at thresholds 12 and 14 must enclose matching compact single-contour cells. The final source-cell union retains every old pixel and contains exactly one original owner. Every frontier has strong dark exterior and inward contrast support. Repair growth is bounded at 1–20% of the original area; open, ambiguous, overlapping, divided or independently framed inset scenes veto completion.

Version-48 geometry stores both threshold contours, original owners, frontier witnesses and content evidence. Serialized validation recomputes the contour consensus, frontier positions/counts, original-owner retention, restored area and zero foreign overlap. Immutable proof/display caches preserve repeats. The discovery runtime uses no book/page/name/fingerprint lookup. Private artwork stays outside git/CI. Test94 perimeter consolidation and Test93 speech gates remain unchanged.

## Verification

All 92 retained/new behavioral suites plus the cache/package check pass locally. The new tests cover a source-independent dark-ink positive, a real independently enclosed ink inset, an open-cell neighbor negative, transparency/malformed data, and 21 corrupted proof rejections. Actual Reader checks cover all **4,266** restored-pixel taps, **943** restored edge pixels, serialized proofs, cached display masks and repeated pop-outs. Full native Reader canvases were reviewed against the original source.

Fresh source-raster supplements over final Test94 descriptors cover **312 pages / 1,284 selections**. Only this Apocalypse owner changes. Wolverine 388, Magneto 101 and manga 228/193/188 descriptors remain identical. This is not a fresh full detector replay of every page. The changed target's full detector rerun matches the two reviewed selections, approximately **15 seconds** locally; phone timing is not accepted.

## Publication, build and phone check

User publication/build authorization persists. Isolated identity: `io.github.bdredenbach.nthshelf.frametest95`, label `Nth Shelf Test95`, version `2.79.95`, code `28023`. Live publication/build and verification status is in `TEST95-VALIDATION.json`. Do not describe a build as successful until the downloaded APK is verified.

Phone target: issue 2 reader 18 upper-right hand/water frame, center/edges, wrist, fingers, both balloons and background. SWAK stays unchanged. Retained controls: Test94 issue 3 reader 6 street/portrait pair, Test93 issue 1 reader 16, and Test92 issue 2 readers 12/16.

Further work: SWAK issue 2 reader 18, issue 3 reader 13 lower pair, issue 4 reader 14 narrow red-rim En inset. One bounded target per pass.

Private recovery: repository `/workspace/scratch/36070fbf99e6/Nth-Shelf`; this pass's research `/workspace/scratch/dfc1ab24edfe/research`; fixtures symlink `/workspace/scratch/dfc1ab24edfe/fixtures` points to `/workspace/scratch/5827b11a4a78/fixtures`. Recovery hints, not durable guarantees.
