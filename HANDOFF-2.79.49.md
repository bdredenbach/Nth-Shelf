# Nth Shelf Test49 — page44 nine-point recovery checkpoint

Date: 2026-09-26. User sent 209627.mp4 and specifically requested nine taps in every frame on Reader page44. Baseline Test48: 14faf79ae20d7ec654197ea461999db42333ec8c. Work only in bdredenbach/Nth-Shelf Test_Branch.

Page44 has eight visible scenes, not the prior detector's seven. Missing: narrow red-background profile between SHLIK and BLAM. Incomplete matte masks also made taps elsewhere fall into inconsistent legacy crops. Test49 measures whole cells from a pale rim network, uniquely reconciles every prior owner, and preserves existing owned pixels. SHLIK and the upper lower-strip descriptors remain exact. An independent closed pale envelope restores the claw strip's lower black border, caught during visual review after initial point checks.

QA: all eight frames receive nine real browser touchscreen taps (72 total), with ownership, focused contours and opaque sample checks. All eight crops visually reviewed. Full 74-page comparison against Test48: only page44 changes. Page36's six frames and page43's repair remain exact. Negative images and proof mutations reject. Results and reproduction: qa27900/frame-accuracy/test49/RESULTS.md.

Android candidate: 2.79.49, code27977, io.github.bdredenbach.nthshelf.frametest49, label Nth Shelf Test49. Install separately and import the comic. BUILD.json in the workflow artifact ties the APK digest and exact web assets to the source commit.

Update 2026-09-26: PHONE FAILED. User screenshots 209637–209643 show partial masks and crops spanning neighbors. See HANDOFF-2.79.50.md for the resampling reproduction and follow-up. The following next step is historical: await phone testing of page44, especially both narrow middle strips and the claw/bottom strips. Do not mark phone acceptance until explicit confirmation. Moving on from earlier pages is not explicit confirmation of those builds. Earlier handoffs remain historical.
