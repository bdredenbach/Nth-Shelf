# Nth Shelf

A local-first comic reader and personal comic library for Android and the web.

## Current status · 24 October 2026

Continue from the recovered **Test179 source plus the reviewed candidate fixes**, not the old Test158 or source176 work queue. The source branch is `candidate/test179-caption-repair-20261022`. **Source173 remains the accepted detector baseline.** This branch is not an accepted release, a new APK, or phone-qualified software.

The candidate contains three bounded runtime corrections:

- [Caption preservation](qa27900/frame-accuracy/test180/README.md): restores the clipped narration on Apocalypse #3 page 3 without changing owner boxes or tap routing.
- [WASM reattachment](qa27900/wasm-reattach/README.md): invalidates prior source-upload state after successful kernel replacement. No search or ownership policy changes.
- [Retained-owner contour handoff](qa27900/retained-terminal-contours/README.md): restores two lost pop-outs on Apocalypse #1 page 20 by looking up retained contours in their authenticated prior context. It does not expand or trim their geometry.

### Latest verified results

A fresh native replay covers **369 fixed taps across 93 page entries / 92 original sources**: 171 retained outputs, 88 issue 1 taps, and 110 issue 3 outcomes.

- **Two restored pop-outs; the other 367 outcomes unchanged** against the stronger pre-routing baseline. All 93 strict per-page gates pass; semantic fields also match except timing and diagnostic logs.
- **365 opens and four inherited misses**, not 365 complete frames. The two recovered raw/display PNGs exactly reproduce archived Test168 outputs.
- The recovered crops still have a **known inherited red edge sliver and uncertain boundary-contact remnants**. This is a verified functional routing repair, **not two complete clean-frame repairs**. Hidden artwork behind another scene's dialogue is not synthesized.
- Ten public mocked dispatch checks, seventeen private real-source guard checks, and eight stale-state mutations with eight restored actual-tap checks cover the handoff. Mock tests alone do not establish source admission.
- The caption and successful-reattachment fixes remain unchanged. Experimental speech, protrusion, balloon-rim, residue-trimming and speed-cache variants are not included.

These are native harness results, not browser/compositor, actual Worker/IndexedDB, Android or phone-performance qualification. The fresh 369-tap run took about 43.3 minutes in aggregate with peak sampled process-tree memory about 1.35 GiB; this is test-run resource evidence, not a phone benchmark or claimed speedup.

## Next steps

1. Preserve this source and its independent raw/display receipts. Keep the functional page 20 recovery separate from the unresolved edge-quality problem; do not remove a guard or trim by color merely to make a crop look cleaner.
2. Investigate complete scene ownership only where original-source evidence supports a genuinely distinct mechanism. Four remaining issue 3 page 4 missed taps represent three intended scenes, not four frames. Existing clipped, contaminated and ownership-review outcomes remain open work.
3. Keep failed local contour/contact, fragment/source-cell and merged-ink experiments paused unless new discriminating evidence changes the hypothesis. [Research notes](RESEARCH-2026-10-22.md) and [chronology](RELEASE-HISTORY.md) explain prior limits; historical inventories are not a current all-Library census.
4. For another runtime change, freeze independent controls and explicit intended differences, review complete native artwork/rim/dialogue and neighboring exclusions, then rerun the applicable 171/88/110 suite through the [strict evidence gate](qa27900/native-regression-gate/README.md). Opening a popup is not enough to qualify its scene.
5. Qualify real browser and Android rendering, navigation/restart behavior, memory and cold/warm interactions separately before rollout. First and nearby taps remain expensive; the tested local rail memo was slower and rejected.

## Run the public checks

The focused handoff check uses Node and no private comic input:

```sh
node qa27900/retained-terminal-contours/test-dispatch.cjs
node qa27900/wasm-reattach/test-reattach.cjs
python3 -m unittest discover -s qa27900/native-regression-gate -p 'test_*.py'
```

Follow each linked QA directory for exact scope. Public synthetic controls do not replace the private original-source regression. The repository's APK workflow is manual and restricted to `Test_Branch`; a candidate-branch push does not automatically run it or produce an APK.

## Source and build identity

Detector source checkpoints and Android build numbers are different identities:

| Checkpoint | Meaning |
| --- | --- |
| [Source173](HANDOFF-DETECTOR-SOURCE173.md) | Accepted detector baseline; its native evidence is not complete browser/phone qualification. |
| [Source176](HANDOFF-DETECTOR-SOURCE176.md) | Older published, explicitly unaccepted candidate. Its lost-boat queue is superseded by later recovered work. |
| [Test179](HANDOFF-2.79.179.md) | Recovered candidate delivered after Test177/178, originally neither promoted nor pushed. The current branch adds the bounded corrections listed above. |
| [Test168](HANDOFF-2.79.168.md) | Earlier issue 1 reconstruction/regression reference, not the current continuation target. |

Test179's original APK was a **verified Test178-shell repack, not a Gradle rebuild**: package `io.github.bdredenbach.nthshelf.frametest179`, version `2.79.179`, code `28107`, label `Nth Shelf Test179`. APK SHA256: `c396ba6955687787d7372af16eb3f925d20a04ab004b538edccd5937d658cf66`. The [handoff](HANDOFF-2.79.179.md) retains original module hashes and packaging checks. Existing app/version labels are provenance, not a deployment-ready identity for these newer source fixes.

Comic artwork, frozen audit coordinates, private receipts and signing material stay outside public Git and CI. No merge, release or APK is included in this source checkpoint.

## Documentation and chronological history

- [Release history](RELEASE-HISTORY.md): oldest-to-newest checkpoint notes, recovery, research and subsequent candidate fixes. Historical “current,” “next” and coverage figures apply only to their dated checkpoints.
- [History through Test71](README-through-Test71.md): preserved earlier documentation.
- [Test179 handoff](HANDOFF-2.79.179.md): original recovered candidate, defect audit and qualification limits.
- [Strong baseline recapture](qa27900/native-regression-gate/RECAPTURE-2026-10-24.md): independent 369-tap baseline pairs before the later routing repair. Its 363 opens / six misses are historical, not the latest result above.
- [Project background](PROJECT-MEMORY.md): reconcile older instructions and counts against later evidence.

Do not combine taps, individual frames, pairs/groups, source checkpoints and phone acceptance into one success count. Archived authorization for an earlier checkpoint is not release approval for a later candidate.
