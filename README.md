# Nth Shelf

A local-first comic reader and personal comic library for Android and the web.

## Start here

**Continue from the recovered [Test179 handoff](HANDOFF-2.79.179.md), not the old Test158 or source176 work queue.** The next detector work is Rise of Apocalypse issue 3: landscape title-page misses, complete speech/foreground ownership, and the expensive first or nearby tap. Preserve the 171 known Test178 outputs while repairing new targets.

The project has three separate notions of “latest”:

| Checkpoint | What it means |
| --- | --- |
| **Source173** | Accepted detector baseline. Its [handoff](HANDOFF-DETECTOR-SOURCE173.md) records native evidence, not complete browser or phone qualification. |
| **Source176** | Last published detector candidate on `detector/source176-shared-lettering` before recovery. Explicitly **unaccepted** in its [handoff](HANDOFF-DETECTOR-SOURCE176.md); not the latest delivered work. |
| **Test179 / 2.79.179** | Recovered, isolated candidate delivered after Test177 and Test178. Its original recorded state was **neither promoted nor pushed**; the recovered source plus caption repair is now checkpointed on the candidate branch below. Do not equate its higher number with acceptance. |

Detector source checkpoints and Android build numbers are different identities. The historical [Test168 APK](HANDOFF-2.79.168.md) remains an important reconstruction/regression reference, not the current continuation target. A published branch alone does not contain every later delivered candidate.

## Current continuation: Test179

The [recovered notes](HANDOFF-2.79.179.md) are the technical starting point. Before editing, verify the working source against the recovered candidate; do not silently resume an older checkout.

- **Known outputs preserved:** 171 fixed taps retain exact Test178 displayed PNG bytes and popup styles across Wolverine, Sub-Mariner and held-out Apocalypse issue 2 pages.
- **Original Test179 issue audit:** Apocalypse issue 3 has 110 audited tap outcomes over 23 pages. Of these, 106 open; four produce no popup, 12 are incomplete, four contain neighboring content, and three need ownership review. These are tap outcomes, not distinct panel counts. Groups are not qualified individual pop-outs.
- **Speed improvement is narrow:** median identical-repeat native handler time fell from 6.583 s to 0.324 s. The first tap remained about 6.4 s; nearby taps still require fresh search. These are not phone or animation-to-finish measurements.
- **Recorded checks:** 281 fresh taps produced no Reader exceptions. The handoff records 31 new exact-search controls, 59 existing scene controls, 110 navigation controls and 22 issue 1 entry gates passing. The 22 gates are not a fresh 88-tap replay. These are historical receipts, not a claim that this checkout has just rerun them.

### Unreleased caption repair · 22 October 2026

This candidate branch contains a [native-qualified caption repair](qa27900/frame-accuracy/test180/README.md), not a new APK or accepted release. It restores the whole clipped narration caption on issue 3 Reader page 3 without changing detector owner boxes or tap routing.

- All 171 known outputs and all 88 newly recovered issue 1 tap outcomes match frozen Test179. Of 110 issue 3 outcomes, only the intended caption crop changes; no Reader exceptions occur.
- Issue 1 has three **inherited** differences from Test168: one fallback crop and two missing popups. Separate owner-selected checks reproduce those historical crops, but do not turn misses into successful taps.
- The 52 new controls, 90 recovered controls, 110 navigation checks and legacy detached-caption tests pass. Native measurements and remaining qualification limits are in the repair notes.
- Source173 remains accepted. Published for review on `candidate/test179-caption-repair-20261022`; no new APK or promotion is included. The unchanged Test179 app/version labels are provenance, not deployment-ready release identity.

### Ownership research · 22 October 2026

[Research findings and next design](RESEARCH-2026-10-22.md) now supersede the old immediate repair queue. Source-native cycles recover useful frame and neighboring-cell geometry, but independent controls and source-core replay show that ownership is still unresolved. No additional crop is qualified. The revised outstanding inventory is nine incomplete outputs, four contaminated outputs, four misses and three review cases; two earlier apparent defects were source-authentic artwork, not fixes.

### Next bounded repair

1. Evaluate a source-cell-first ownership model with independently calibrated appearance/scene context and new independent controls. The bounded graph-only audit left all 11 contact chains unknown. The existing contour and pre-growth component labels are already contaminated; they cannot certify their own repair. Preserve the qualified caption source and frozen failed experiments. The four page 4 title targets and the separate contaminated rescue crop remain unresolved, not newly repaired. Reader numbering includes both covers.
2. Derive repairs from source pixels and independent ownership evidence. Preserve whole lettering, captions and foreground; do not use comic identity, frozen taps or audit rectangles as production geometry. The handoff lists the remaining speech/crop defects and ownership questions.
3. Recheck all 171 known outputs byte-for-byte, rerun applicable source/Reader/navigation controls, and distinguish native rendering evidence from real browser/compositor and phone behavior.
4. Address the costly first/nearby-tap fallback without broadening exact-repeat cache authority to unproved neighboring taps. Qualify Worker/IndexedDB behavior, Android rendering, app restart, memory and cold/warm interaction before rollout.

Do not revive the source176 “reconstruct the lost boat fix” task without checking later evidence: Test179's regression already includes the boat repair from later deliveries. Do not promote a candidate, publish source or build another APK merely because an old handoff recorded authorization for a previous checkpoint.

## Build and evidence identity

Test179 is a **verified Test178-shell repack, not a Gradle rebuild**:

- Package: `io.github.bdredenbach.nthshelf.frametest179`
- Version: `2.79.179`; version code: `28107`; label: `Nth Shelf Test179`
- APK SHA256: `c396ba6955687787d7372af16eb3f925d20a04ab004b538edccd5937d658cf66`
- Frame-envelope module SHA256: `42ec85329bd7125a24415c7a86a2b39a56959d94e60e4b254d91354e2eb70c79`
- Source-layout module SHA256: `0ec2c0fde0ba8ae9d168060eaef9c5299eea16921b463790273abc097562ffd3`

The recovered notes record all 186 packaged web assets exact, 42 native entries unchanged outside manifest/resources, and successful ZIP/alignment, v2 signature and identity checks. Those checks do not establish physical-device acceptance.

Comic artwork, frozen audit centers, private receipts and signing material belong outside public Git and CI. Public synthetic controls are not substitutes for private source-image regressions. Browser/compositor, actual Worker/IndexedDB and Android qualification remain separate requirements.

## Documentation and chronology

- [Release history](RELEASE-HISTORY.md): chronological Test73–168 checkpoint notes, published source173/176, and the recovered Test179 continuation. Existing historical details and links are preserved; missing README entries are indexed to their handoffs.
- [History through Test71](README-through-Test71.md): unchanged earlier documentation.
- [Test179 handoff](HANDOFF-2.79.179.md): recovered candidate results, exact defect queue and qualification limits.
- [Source173 baseline](HANDOFF-DETECTOR-SOURCE173.md) and [source176 publication](HANDOFF-DETECTOR-SOURCE176.md): provenance and historical acceptance boundaries.
- [Test168 handoff](HANDOFF-2.79.168.md) and [validation](TEST168-VALIDATION.json): earlier full issue 1 regression APK and reconstruction reference.
- [Project memory](PROJECT-MEMORY.md): longer project background; reconcile older instructions and counts with later checkpoint evidence.

Historical “current,” “next,” “pending” and coverage figures in archived notes apply to the checkpoint where they were written. Compare like-for-like audits; do not combine detector selections, original-frame coverage, pairs/groups, native checks and phone acceptance into one success count.
