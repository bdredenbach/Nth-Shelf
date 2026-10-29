# Source-backed inset pale-interior restoration · 28 October 2026

## Status and scope

Restoration **179b** follows the published bounded panorama fragment cleanup (`a69a8e649217e7c05319929afd1a6e2041cff924`, Test_Branch). It restores source-supported pale interior in the standalone inset, rather than removing panorama contamination or inventing missing artwork. The predecessor baseline and its Pages deployment are distinct from this restoration; deployment is verified separately from benchmark qualification.

<!-- FINAL-179B-REGRESSION-STATUS -->
**Independent full regression passes: 369/369 opening taps across 93 entries / 92 sources.** Only the standalone inset changes; the other **368 outputs remain exact**, including the panorama. Execution is an audited disjoint union of 60 entries / 251 taps and 33 / 118, with identical frozen runtime, the disclosed Path2D-adapted harness and unchanged 2 GiB / 300-second caps. One interrupted session became unavailable; host termination was not independently verified. Its incomplete entry is retained but excluded. All 738 current PNGs and 738 alpha artifacts were checked against authenticated baseline bytes or the approved target. This is fixed-benchmark preservation, not perfect-frame, unseen-comic or platform qualification.

Source173 remains the accepted detector baseline. Internal candidate/proof labels are not new acceptance checkpoints. Android and APK identity are unchanged.

## Source and owner safeguards

The original version-171 inset owner must win normally. Its identity, contours, crop box and hit routing remain unchanged. Only afterward may a separate positive display plan be admitted, bound to the source, lifecycle and current owner bank. The source plan is limited to 24 million source pixels, requires unique seam/endpoints and vetoes conflicts. The restoration is original source sampling, not appearance-based pale fill or synthesized art.

The renderer adds only where the existing destination alpha is exactly zero and the addition raster alpha is 255. Integer runs bound the admitted pixels. Rendering is limited to 9 million output pixels and 8,192 runs; admission is all-or-nothing rather than accepting a partial over-budget plan. A single nearest-neighbor identity blit is clipped by Path2D runs while preserving the caller's current path and state. This identity transfer does not replace the original high-quality source sampling.

Display restoration does **not** expand ownership or make newly restored regions tappable. Any future change to hit support needs separate evidence and qualification.

## Focused native/source verification

Independent review of actual raw and display output confirms:

- **35,935 restored pixels** match the original-source draw with its original high-quality sampling exactly in RGBA.
- **Zero previously nonzero-alpha pixels change in RGBA.**
- **Zero changes outside the frozen addition footprint.**
- **Twenty uncertain novel bridge cells remain unchanged**, not painted into a new connection.
- The other **four targeted crops remain byte-exact**, including the panorama and its earlier caption/foreground preservation.

Native review finds the pale interior continuous around the pulling figure and ropes beneath the top rail, with captions and foreground retained. Thin unresolved seam/edge cells remain outside the admitted additions. Default low-quality source sampling is not the reference for the exact-RGBA comparison.

## Harness, comparison and failed-trial disclosure

The native harness has one explicit adaptation: a single-symbol native **Path2D** adapter. Replaying the published baseline through that adapter preserved all five targeted rows, ten PNGs and ten alpha outputs exactly. The original controller, guards and **2 GiB RSS-tree / 300-second per-entry caps** remain unchanged. This adapter replay is focused harness validation, not full candidate qualification or browser qualification.

The strict comparator changes only its predeclared single-target substitution: prior panorama `f02` / proof 175 becomes standalone inset `f01` / proof 171. No gate relaxation or tap-ID remapping is allowed. Full-suite coverage must be audited for complete unique entries/taps, runtime consistency, expected target change and exact preservation elsewhere; any resumed union and incomplete attempts must be disclosed rather than described as one uninterrupted run.

The first 179 renderer used an offscreen high-smoothing identity blit and **failed preservation**. It is retained and superseded, never mixed into final 179b qualification. Diagnostics 177 and 178 certified no further cleanup and introduced no runtime changes.

## Reproducible synthetic checks

```sh
node qa27900/inset-positive-contract.cjs
node qa27900/inset-positive-routing.cjs
node qa27900/inset-positive-raster-contract.cjs
```

The source contract has 25 checks and the actual-Reader-method suite has 168 checks. The 16 raster checks additionally require `@napi-rs/canvas` available through standard Node module resolution; they exercise a native Canvas implementation, not a browser or phone. All fixtures are synthetic and contain no private artwork or saved source masks.

## Remaining limits

Gold caption halos, ambiguous panorama hair contact, thin residual slivers and older clipping/contamination defects remain. Focused source recovery is not complete-frame acceptance, broader-library or unseen-comic generalization, browser/compositor or phone qualification, a speed result, or a new APK. No hidden artwork is generated. Private originals, coordinates, masks, frozen footprints and native receipts stay outside public Git.

See the [previous bounded cleanup](panorama-fragment-cleanup-2026-10-28.md), [inset separation](panorama-ownership-2026-10-27.md), and [current handoff](../HANDOFF.md#current-state).
