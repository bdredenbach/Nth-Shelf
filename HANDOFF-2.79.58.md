# Test58 handoff — general monochrome manga frames

Test58 is complete and the verified APK is saved for delivery. The user authorized detector generalization with the supplied `29_Chapter_30.cbz`, testing and fixing every page. Prior Test57 was delivered.

Implementation and local validation are complete. A new exterior-paper gutter graph in `js/panels-gutter-graph.js` uses image evidence rather than page IDs or layout/count templates. Proof version 16 delegates through the existing structural-grid geometry contract. Unsupported layouts retain legacy detection. Version 2.79.58 / code 27986 / frametest58; cache shell 2.79.58, map-exp-56, proof 2.79.58. 70 packaged web assets expected.

All 41 chapter pages were audited: cover/logo have no internal frames; remaining 39 pages contain 228 frames. Every frame passed five real browser touchscreen taps (1,140 total), preserved focus geometry, and 36,334 fully opaque interior samples. Crossing-art/foreign-mask checks passed. All 39 mirrored pages preserve counts. Six arbitrary/mirrored synthetic layouts and 3,905 proof corruptions checked. All 74 Wolverine maps are exactly unchanged from Test57. Full retained gate passed. See `qa27900/frame-accuracy/test58/RESULTS.md` and `results.json`.

Scope is manga content in PAGE mode. Existing continuous MANGA mode has no single-tap frame detector. No navigation/gesture changes. This chapter does not demonstrate majority-of-comics coverage; independent books, color/tinted/borderless layouts remain broader evaluation work. Phone acceptance pending.

Private local assets: `manga-chapter30`, `recovery-manga30`, `comic-wolverine-1000`; source CBZ remains unchanged at the supplied upload path. Never commit comic artwork/screenshots. Numeric geometry fixture is gzip/base64 in QA. Current base aa20707273265d4a86c93e3a7b10ab4d69b1fc9d; Test57 comparison source 2d40bbb648b216f9e095656b949a349b49469823.


## Verified build and delivery

- Source commit: `7b65360b4f201373a5769dd8b9e0252756e5f120`; tested tree: `5455374a549e865b99979338e0cf1420719f9945`.
- Build Test58 APK run [36280395311](https://github.com/bdredenbach/Nth-Shelf/actions/runs/36280395311) completed successfully; retained regression, browser/backup, native archive, Android build and signature/asset gates all passed.
- Artifact: `10918886605`; archive SHA-256 `dbbb4c4af7f13091363cda7e73bc6604839d5e4e904e17096073489e28864b90`.
- APK: `Nth-Shelf-2.79.58-Test58.apk`, 3,307,055 bytes. SHA-256 `a9cd9b6f79d5a7b93d471f48b957110899dac361d6ba7fbe977e4081eca75382`.
- Package/version/label match Test58. APK ZIP integrity and v2 signature verified; every one of 70 packaged web files matches the tested source byte-for-byte.
- Local delivery: `/workspace/scratch/9419335135cd/recovery-manga30/Test58/Nth-Shelf-2.79.58-Test58.apk`.
- Persistent saved file: `libfile_4c98b2fd254c81919e92cfea8079bc2b`. Save succeeded and local version metadata applied.

Remaining: user phone acceptance and evaluation on additional independent comics/manga. Do not claim universal or majority coverage from this chapter. No Test58 implementation/build work remains pending.
