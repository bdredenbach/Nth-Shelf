# Nth Shelf Test48 — recovery checkpoint, 2026-09-26

Current task: Wolverine 1000 Reader page43, highlighted lower-right area of the middle slanted K-KRASH scene. Center tap already produced the complete frame; the corner produced a partial crop. User attached 209611.png, 209613.png and 209618.jpg. Test47 baseline: b6d60c8b3754d86f5ec0444fdc3ef4c04b18282a.

Root cause: a one-analysis-pixel exterior-color connection through an interrupted pale rim removed dark artwork from the known middle frame mask. Corner taps fell into the legacy crop search. A bounded repair now restores unassigned interior pixels using the measured rim neck and opposing pale arms. It preserves all previously assigned pixels, all four neighboring descriptors and all other pages. No gesture or Reader change.

Verification: 32 real Reader touchscreen/crop checks pass, zero page errors; full 74-page comparison changes only page43's middle frame. Test47's six page36 frames remain exact. Wider rim opening and missing pale evidence both reject repair. See qa27900/frame-accuracy/test48/RESULTS.md and saved reports.

Android candidate: 2.79.48, versionCode27976, package io.github.bdredenbach.nthshelf.frametest48, label Nth Shelf Test48. Install separately and import the comic. Workflow BUILD.json records commit, APK digest and all packaged web files.

Next: user tests corner versus center of page43's slanted middle scene, then its four neighbors. Phone acceptance is pending. Do not mark page36 explicitly phone-confirmed solely because the user moved on to page43. Earlier handoffs/queue entries are historical, not new assignments.
