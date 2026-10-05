# Test71: use an accepted neighbor to complete a paper cell

Run `node qa27900/frame-accuracy/test71/neighbor-completion-contract.cjs` and
`node qa27900/frame-accuracy/test71/service-worker.test.cjs` from the repository
root. The full retained gate is `bash qa27900/frame-accuracy/test71/run-retained.sh`.

The compressed fixture contains numeric geometry/evidence only, not comic art.
The synthetic test generates its own textured panels and enclosed white bodies.
It checks two adjacent additions, rejects an unwitnessed diagonal candidate,
preserves previous descriptors exactly, supports the existing proof26 map
classification, rejects19 altered proofs and tests geometry/spill binding.

Original-image validation (not rerun in CI without user artwork):91 Apocalypse
pages,90 maps identical to Test70,149 old descriptors preserved,150 total owners.
The sole addition is the complete lower-middle dialogue scene on issue1 image17,
reader18/24. Target reader and resize summaries are committed beside this file.
The frozen77-file web asset manifest ties local tests to the APK verification.

Safety is based on exact contour stability at two seed scales, zero overlap with
accepted owner pixels, measured enclosed white content, an internal-divider
rejection and a paper corridor to an independently accepted neighbor. An
unassigned patch of image alone is never sufficient. Existing runtime paths are
unchanged; the candidate interface is opt-in and supplement integration is
idempotent. The new module does not yet fuse arbitrary black, colored or diagonal
rails, and does not guarantee that all missing neighbors can be recovered.
