# Test32 baseline and next queue — 2026-09-22

## Acceptance and scope

Brad accepted page41 before this chat. It is not pending phone confirmation.
Preserve its top scene, strip, bottom scene and five tall middle columns. The
next target is page42. Version 2.79.33 is reserved until page42 works and is
accepted; pages43–44 follow afterward. This sync does not fix those pages.

Reuse the principle behind page39's GRRR scene: follow the full irregular
outline, reconnect interruptions only with corroborating border evidence, and
retain lettering/balloons belonging to that scene without absorbing a neighbor.
Page42 has jagged pale rims and a crossing balloon; page43 has diagonal borders
and projecting lettering; page44 has pointed/concave borders and BLAM lettering.
These are investigation notes, not completed patches.

## Evidence ledger

Historical Test32 handoff: 162 targeted page41 checks; 400 selected Page Deck
checks; 296 earlier descriptors preserved; 301 entries across 74 images; only
page41 changed, from four to nine entries. Keep those historical claims without
pretending their missing raw report/crop files were recovered or rerun here.

Fresh local capture: unmodified detector JavaScript recovered from the supplied
APK; Chromium 144.0.7559.96; all 74 original JPEGs decoded through data URLs;
PanelDetect.detect invoked in the index.html detector-script order. Result:
298 entries, no script errors. Page41 has nine entries, including five
_terminalProof.version=4 column panels. Pages42–44 have zero page-level entries.
The prior 301 total was not reproduced, so historical parity remains unverified.
Do not replace either record or weaken the detector to reconcile the count.

Numbering: reader page41 is zero-based archive index040; page42 is index041.
The full local descriptor capture and source-asset hashes are included in the
handoff ZIP. The repository retains a compact per-page counts, the full-summary checksum and a
portable capture script. Fixtures are QA-only, never runtime page-specific crops.

Service-worker contract: 16 local checks pass for both the repository-checkpoint
and recovered-Test32 workers, covering install failure, activation cleanup,
current-cache lookup, approved origins, failed writes, offline failure and POST.
JavaScript syntax and APK/source-byte parity are checked separately.

## Promotion gate for 2.79.33

Fix page42 without changing accepted owners. Check center/left/right/top/bottom
selection, whole artwork/balloons/tails, overlapping lettering, adjacent scenes,
and Page Deck rendering. Compare against the preserved current-environment
snapshot and retain the historical ledger. Obtain the page42 phone acceptance,
then update native/web build labels, service-worker cache, proof/map identifiers,
README and artifact names together. Keep page41 accepted; do not reset the queue.
