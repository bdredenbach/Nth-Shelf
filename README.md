# Nth Shelf

A local-first comic reader and personal comic library for Android and the web.

## Current status · 27 October 2026

Continue from the recovered **Test179 source plus the reviewed candidate fixes**, not the old Test158 or source176 work queue. The ongoing source branch is **`Test_Branch`**. Historical development branches have been consolidated into it; **`Android` is retained unchanged**. **Source173 remains the accepted detector baseline.** This branch is not an accepted release, a new APK, or phone-qualified software.

The candidate contains the following bounded runtime corrections:

- [Caption preservation](qa27900/frame-accuracy/test180/README.md): restores the clipped narration on Apocalypse #3 page 3 without changing owner boxes or tap routing.
- [WASM reattachment](qa27900/wasm-reattach/README.md): invalidates prior source-upload state after successful kernel replacement. No search or ownership policy changes.
- [Retained-owner contour handoff](qa27900/retained-terminal-contours/README.md): restores two lost pop-outs on Apocalypse #1 page 20 by looking up retained contours in their authenticated prior context. It does not expand or trim their geometry.
- [Source-context recovery](docs/source-context-recovery-2026-10-27.md): native-source inset topology and a final-miss landscape route open two additional intended targets. Source proofs and focus lifecycle are held without arbitrary rectangular rescue.

### Latest verified results

A fresh native replay covers **369 fixed taps across 93 page entries / 92 original sources**. All 93 strict per-page gates pass.

- **367 opens and two remaining missed taps**, not 367 complete frames. The remaining taps correspond to one lower-left scene.
- Two additional Apocalypse #3 page 4 targets open: the stone-pulling inset and broad sphinx/pyramid panorama. All **365 previously open outputs remain byte-exact** in raw/display PNGs and unchanged in non-timing/non-log receipt fields.
- Independent native review confirms substantial intended artwork and readable captions. The inset still omits a pale interior region. The panorama groups the upper inset and retains identifiable neighboring hand/finger fragments. Do not double-count the inset within that group or call either output quality-perfect.
- Prior page 20 recoveries, caption preservation and WASM reattachment remain unchanged, including their known edge-quality limitations.
- New public checks cover 27 inset contracts, 14 landscape contracts and 40 actual-method Reader routing/lifecycle cases. Source-only sweeps and exposed development pages are not unseen-page generalization evidence.

These are native harness results, not browser/compositor, actual Worker/IndexedDB, Android or phone-performance qualification. This run used about **43.4 aggregate minutes** with peak sampled process-tree memory **1.48 GiB**; these are test resources, not a phone benchmark or claimed speedup. No APK was built or workflow dispatched.

## Current research and next steps

The isolated learning pilots are not part of the runtime. More varied training taps are the latest hypothesis, but the 26 October attempt timed out after 567 of 600 updates. It produced no final adapter or evaluation, so the approach has not been judged. No retry has started; current work prioritizes actual source-backed Reader recovery, not public-model scores. See the [single consolidated handoff](HANDOFF.md#current-state) for the complete current research state.

### Runtime work

1. Preserve this source and its independent raw/display receipts. Keep the functional page 20 recovery separate from the unresolved edge-quality problem; do not remove a guard or trim by color merely to make a crop look cleaner.
2. Investigate complete scene ownership only where original-source evidence supports a genuinely distinct mechanism. Two remaining issue 3 page 4 missed taps represent one intended lower-left scene, not two frames. Existing clipped, contaminated and ownership-review outcomes remain open work.
3. Keep failed local contour/contact, fragment/source-cell and merged-ink experiments paused unless new discriminating evidence changes the hypothesis. [Research notes](RESEARCH-2026-10-22.md) and [chronology](RELEASE-HISTORY.md) explain prior limits; historical inventories are not a current all-Library census.
4. For another runtime change, freeze independent controls and explicit intended differences, review complete native artwork/rim/dialogue and neighboring exclusions, then rerun the applicable 171/88/110 suite through the [strict evidence gate](qa27900/native-regression-gate/README.md). Opening a popup is not enough to qualify its scene.
5. Qualify real browser and Android rendering, navigation/restart behavior, memory and cold/warm interactions separately before rollout. First and nearby taps remain expensive; the tested local rail memo was slower and rejected.

## Run the public checks

The focused handoff check uses Node and no private comic input:

```sh
node qa27900/retained-terminal-contours/test-dispatch.cjs
node qa27900/wasm-reattach/test-reattach.cjs
node qa27900/host-background-islands.cjs
node qa27900/supported-landscape-contract.cjs
node qa27900/supported-landscape-routing.cjs
python3 -m unittest discover -s qa27900/native-regression-gate -p 'test_*.py'
python3 scripts/verify-consolidated-handoff.py
```

Follow each linked QA directory for exact scope. Public synthetic controls do not replace the private original-source regression. The repository's APK workflow is manual and restricted to `Test_Branch`; pushing does not run it or produce an APK. Its Test168 identity and asset manifest are historical and need explicit requalification before building the newer source. No workflow was dispatched for this consolidation.

## Source and build identity

Detector source checkpoints and Android build numbers are different identities:

| Checkpoint | Meaning |
| --- | --- |
| [Source173](HANDOFF.md#archive-handoff-detector-source173-md) | Accepted detector baseline; its native evidence is not complete browser/phone qualification. |
| [Source176](HANDOFF.md#archive-handoff-detector-source176-md) | Older published, explicitly unaccepted candidate. Its lost-boat queue is superseded by later recovered work. |
| [Test179](HANDOFF.md#archive-handoff-2-79-179-md) | Recovered candidate delivered after Test177/178, originally neither promoted nor pushed. The current branch adds the bounded corrections listed above. |
| [Test168](HANDOFF.md#archive-handoff-2-79-168-md) | Earlier issue 1 reconstruction/regression reference, not the current continuation target. |

Test179's original APK was a **verified Test178-shell repack, not a Gradle rebuild**: package `io.github.bdredenbach.nthshelf.frametest179`, version `2.79.179`, code `28107`, label `Nth Shelf Test179`. APK SHA256: `c396ba6955687787d7372af16eb3f925d20a04ab004b538edccd5937d658cf66`. The [handoff](HANDOFF.md#archive-handoff-2-79-179-md) retains original module hashes and packaging checks. Existing app/version labels are provenance, not a deployment-ready identity for these newer source fixes.

Comic artwork, frozen audit coordinates, private receipts and signing material stay outside public Git and CI. This branch consolidation preserves history and does not create a release, APK, phone qualification or detector acceptance. Runtime extends the reviewed `9149b3a` candidate only with the qualified source-context changes above; source acceptance and phone qualification remain separate.

## Documentation and chronological history

- [Release history](RELEASE-HISTORY.md): oldest-to-newest checkpoint notes, recovery, research and subsequent candidate fixes. Historical “current,” “next” and coverage figures apply only to their dated checkpoints.
- [History through Test71](README-through-Test71.md): preserved earlier documentation.
- [Consolidated handoff](HANDOFF.md): current continuation instructions followed by all 139 historical handoffs in one indexed file.
- [Historical validation index](docs/evidence/validation/README.md): 106 original JSON receipts, moved unchanged out of the repository root.
- [Branch preservation manifest](docs/branch-consolidation-2026-10-27.json): former branch tips, merge decisions and original handoff hashes for recovery.
- [Strong baseline recapture](qa27900/native-regression-gate/RECAPTURE-2026-10-24.md): independent 369-tap baseline pairs before the later routing repair. Its 363 opens / six misses are historical, not the latest result above.
- [Project background](PROJECT-MEMORY.md): reconcile older instructions and counts against later evidence.

Do not combine taps, individual frames, pairs/groups, source checkpoints and phone acceptance into one success count. Archived authorization for an earlier checkpoint is not release approval for a later candidate.
