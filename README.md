# Nth Shelf

A local-first comic reader and personal comic library for Android and the web.

## Current status · 27 October 2026

Continue from the recovered **Test179 source plus the reviewed candidate fixes**, not the old Test158 or source176 work queue. The ongoing source branch is **`Test_Branch`**. Historical development branches have been consolidated into it; **`Android` is retained unchanged**. **Source173 remains the accepted detector baseline.** This branch is not an accepted release, a new APK, or phone-qualified software.

The candidate contains the following bounded runtime corrections:

- [Caption preservation](qa27900/frame-accuracy/test180/README.md): restores the clipped narration on Apocalypse #3 page 3 without changing owner boxes or tap routing.
- [WASM reattachment](qa27900/wasm-reattach/README.md): invalidates prior source-upload state after successful kernel replacement. No search or ownership policy changes.
- [Retained-owner contour handoff](qa27900/retained-terminal-contours/README.md): restores two lost pop-outs on Apocalypse #1 page 20 by looking up retained contours in their authenticated prior context. It does not expand or trim their geometry.
- [Source-context recovery](docs/source-context-recovery-2026-10-27.md): native inset topology, a final-miss landscape route and isolated source-seeded terminal separation open three intended scenes. Source proofs and focus lifecycle are held without arbitrary rectangular rescue.

### Latest verified results

A fully audited split-harness native replay covers **369 fixed taps across 93 entries / 92 original sources**: **369 opens, zero fixed-suite misses**. This is not 369 clean complete frames or unseen-comic qualification.

- Four previously missed Apocalypse #3 page 4 taps open **three intended scenes**. The two lower-left taps select the same compact work scene; do not double-count it.
- All **365 previously open outputs retain exact authenticated raw/display PNG hashes and non-timing/non-log receipt fields**. Earlier caption, WASM and page-20 corrections remain unchanged.
- Native review confirms substantial intended artwork and readable captions. The compact work scene retains its profile, workers, monument and both captions while excluding credits/title and the standing neighbor. Its approved output and the other three recovery rows are strictly bound by hashes and geometry.
- Quality limits remain: missing pale inset interior, panorama grouping/neighboring hand fragments, small compact-edge flecks, and historical clipping/contamination. No hidden artwork is synthesized.
- An earlier eager-hook terminal candidate failed preservation on another page and was not published. The qualified variant removes those global hooks and uses explicit source-held Reader admission. This is architectural containment, **not a proven root-cause diagnosis or guarantee against intermittent behavior**; successful isolated retries did not qualify the rejected candidate.
- The first 30 entries completed with optional full-proof capture. The next page hit the unchanged 2 GiB RSS guard during that capture stage. Only this optional serialization was removed; its single recovery and the remaining 62 entries used the original harness, unchanged runtime, resource cap and semantic gates. Independent audit verifies the immutable 30 + 1 + 62 union without duplicate or selected retries. This is not one uninterrupted uniform-harness run.
- Public checks cover 27 inset, 14 landscape, 16 terminal-context, 23 terminal-appearance, 18 viewport and 112 actual-method routing/lifecycle cases. New modules load without wrapping legacy validation/refine/contour functions.

Qualified coverage execution resources (excluding preserved failed attempts): **43.8 aggregate minutes**, peak sampled process-tree RSS **1.49 GiB**. These are not phone benchmarks. Browser/compositor, Worker/IndexedDB and Android qualification remain separate. No APK or manual build workflow was dispatched.

## Current research and next steps

The isolated learning pilots are not part of the runtime. More varied training taps are the latest hypothesis, but the 26 October attempt timed out after 567 of 600 updates. It produced no final adapter or evaluation, so the approach has not been judged. No retry has started; current work prioritizes actual source-backed Reader recovery, not public-model scores. See the [single consolidated handoff](HANDOFF.md#current-state) for the complete current research state.

### Runtime work

1. Preserve this source and its independent raw/display receipts. Keep the functional page 20 recovery separate from the unresolved edge-quality problem; do not remove a guard or trim by color merely to make a crop look cleaner.
2. Investigate complete scene ownership only where original-source evidence supports a genuinely distinct mechanism. The formerly missed issue 3 page 4 taps now open three intended scenes in the fixed suite; broader source and device coverage remain unqualified. Existing clipped, contaminated and ownership-review outcomes remain open work.
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
node qa27900/terminal-context-contract.cjs
node qa27900/terminal-appearance-contract.cjs
node qa27900/source-group-viewport-contract.cjs
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
