# Test84 / 2.79.84

Continue from Test83 source/checkpoint `dc88ab91832ac511d7198b8022f7cb93778930a7`. Test82 was explicitly accepted by the user; no updated phone count was supplied. Test83 physical acceptance remains unconfirmed. Test84 adds one original-page Apocalypse frame and one Wolverine frame in the local supplement comparison, preserving all 852 prior owners across 230 pages.

## Change

`js/panels-interior-strokes.js` adds proof36 scenes whose two global ragged-cell radii agree, whose original pixels prove the full perimeter, and whose old divider veto is caused by a short interior ink run. An explicitly selected policy in `PanelLocalBoundaryConsensus.pixelEvidence.internalDivider` requires both ink-run endpoints more than eight analysis pixels inside the mask and rejects runs spanning 60% or more. The default divider policy and all paper-corridor checks remain intact. A narrow-ink/chromatic-rim inset veto prevents publishing an outer merged scene when an independently enclosed inset is detected. Existing descriptors and reading order retain priority; additions have zero owned-pixel overlap. The reader preserves complete proof36 contours.

## Evidence and next test

The 230-page cached original-raster supplement check passes: Apocalypse180→181, Wolverine383→384, manga188 unchanged, Magneto101 unchanged. Both additions have been visually reviewed. The unsafe merged scene on Apocalypse issue 1 reader 17 stays rejected. The full Apocalypse detector replay also passes all 91 pages, preserving all 180 prior owners and producing 181. The Wolverine target passes the full detector 4→5 with all four old owners intact. All 76 retained suites pass locally and in CI. Browser interaction/backup, native archive, Android build, signature and exact 87-file source-to-APK verification pass. Downloaded artifact/APK hashes and the source archive commit are independently verified. Apocalypse 0.67x and Wolverine JPEG82 variants abstain; the other tested transforms recover the new complete contours. See `TEST84-VALIDATION.json` for the build source commit and results.

Identity: 2.79.84 / 28012, package `io.github.bdredenbach.nthshelf.frametest84`, isolated app **Nth Shelf Test84**. All87 web files are frozen for source-to-APK verification.

Phone targets: Apocalypse issue 2 reader 22/23 complete bottom panel, including every speech balloon; Wolverine 1000 source 018/reader 19 complete narrow upper-left syringe scene. Compare with Test83. Phone acceptance is pending. The 360+ Apocalypse goal is incomplete; broader merged, tilted, inset and overlapping scenes still need conservative recovery work.
