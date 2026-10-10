# Generated source-issued replay contracts

Run from the repository with Node and its normal `@napi-rs/canvas` dependency:

- `node --max-old-space-size=512 qa27900/frame-accuracy/source-issued-replay/identity-binding-contract.cjs`
- `node --max-old-space-size=512 qa27900/frame-accuracy/source-issued-replay/source-issued-contract.cjs`

The contracts use existing public procedural fixtures from test136/test143 and load runtime scripts in index order. They contain no original source images, private maps, page identities, crops or private research paths. `NTH_SHELF_SOURCE` optionally selects an explicit repository root; ordinary execution uses the repository-relative default. The existing QA canvas dependency fallback is supported.

The binding contract exercises the actual private factory in an isolated test registry; it does not manufacture a runtime admitted owner. The source contract exercises installed detector wrappers and all original source validators on procedural pixels. The observer counts complete source analysis calls and delegates unchanged bodies. Restored copies, source changes, eviction, native readiness and failed issuance remain covered. These focused contracts do not replace retained Reader/lifecycle or real browser input gates.
