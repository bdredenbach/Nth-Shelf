# Recovered Test179 controls

The exact delivered Test179 APK supplied the recovered starting web assets.
`recovered-web-assets.json` records all 186 asset hashes and the APK hash; it is
provenance, not a claim that a later working candidate remains byte-identical.
Only five web files differed from the published source176 branch.

Run from the repository root with the runtime-provided native canvas package:

```sh
export NTH_SHELF_SOURCE="$PWD"
node qa27900/frame-accuracy/test179/exact-search-controls.cjs
node qa27900/frame-accuracy/test179/scene-controls.cjs
node qa27900/frame-accuracy/test179/legacy-scene-controls.cjs
```

`CODEX_PRIMARY_RUNTIME_NODE_MODULES` must contain `@napi-rs/canvas`.
These are the recovered public synthetic controls: 31 exact-search, 29 scene
and 30 earlier scene checks. They contain no private comic art or frozen taps.
The native harness is not a browser compositor, Worker/IndexedDB or phone test.

On recovery, all 90 checks passed, as did 110 Reader navigation controls and
22 preserved Apocalypse issue 1 entry gates. Fresh fixed-center execution on
issue 3 Reader page 4 reproduced four missing popups and one geometry-rescue
popup, with no exceptions. Opening that last popup does not qualify its crop.
All 171 known outputs were then freshly replayed across 47 pages against the
immutable recovered Test179 source: exact displayed PNG bytes and popup styles,
with no Reader exceptions. Any new detector fix requires its own fresh replay.

See [the Test179 handoff](../../../HANDOFF.md#archive-handoff-2-79-179-md) for the historical full
audit, exact acceptance boundary and remaining defects. Keep private native
art, receipts and signing material outside Git.

## Recovered issue 1 audit caveat

The subsequent full fresh 88-center replay against unchanged Test179 did **not**
reproduce all historical Test168 tap outcomes: 85 were exact, one produced a
different fallback crop, and two produced no popup. The old 168 harness directly
zoomed selected owners, so its crop receipts did not establish center-tap reachability.
Separate fresh-owner checks reproduce all three historical crops, but remain
explicitly separate from actual tap results. The historical 22 entry gates and
their original Reader hash expectation have not been rewritten to hide this gap.
