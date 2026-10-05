# Nth Shelf Test47 — recovery checkpoint, 2026-09-26

Current task: Wolverine 1000 Reader page36, six user-marked frames. Earlier page queues are historical; do not resume page19 in place of this task. The prior chats were deleted. Recover state from this file and the Test47 reports.

Baseline Test46: f66a4311aa90829f8f206479c8bb57f06eef4d44, identical to the user's supplied ZIP. Actual Reader returned two proven frames, so the old seven-cell completion was inactive. The user's video showed the resulting fallback mistakes.

Test47 retains the exact shower and top-right descriptors and appends four independently bounded outlines. The middle scene owns the entire hallway plus Logan, including his head projecting into the sheriff inset. The sheriff remains separate with both balloons; bottom-right room excludes the shower. See qa27900/frame-accuracy/test47/RESULTS.md for evidence and reproduction.

Local results: 35 touch/ownership/crop checks pass, zero page errors, three erased-border negatives reject, and all 74 comic pages compared to baseline. Only page36 changes from two to six; all original descriptors remain exact. These are browser results, not phone acceptance.

Android identity: 2.79.47, code27975, io.github.bdredenbach.nthshelf.frametest47, label Nth Shelf Test47. Install separately and import the comic. The workflow verifies signature, package identity, and every packaged web asset against its source commit. Its BUILD.json records the exact delivered source and APK digest.

Next action after delivery: ask the user to test all six page36 frames, especially sheriff versus the whole middle scene, foreground head, and independent bottom pair. Do not mark this page phone-confirmed until the user confirms. Retain older page35/Test44 phone acceptance as recorded in Test46 handoff. Do not commit comic artwork or the user's video.
