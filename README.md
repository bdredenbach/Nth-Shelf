# Nth Shelf

A local-first comic reader and personal comic library for Android and the web.

## Test75 — gradient-guided separation of touching frames

Test75 adds a bounded edge-guided watershed supplement. Two seed scales and two contact-window widths must agree exactly; the original RGB edges determine the split where paper-cell scenes touch. The entire foreground statue head stays in the lower throne scene, not partly in the upper pyramid scene on **Rise of Apocalypse #1, reader8/24**. Earlier detector paths and owner descriptors remain unchanged. See [validation](TEST75-VALIDATION.json), [handoff](HANDOFF-2.79.75.md), and [contracts](qa27900/frame-accuracy/test75/README.md).

Identity: **2.79.75 /28003**, package `io.github.bdredenbach.nthshelf.frametest75`, label **Nth Shelf Test75**. The original-artwork corpus comparison and browser touch/crop checks are recorded separately from CI and physical Android acceptance. This is an incremental expansion, not a claim that all panels now work.

## Test73 — shared-boundary completion

Version **2.79.73**, Android code **28001**, isolated package
`io.github.bdredenbach.nthshelf.frametest73`, label **Nth Shelf Test73**.

The previously inactive radius-8 candidate pass is now implemented and validated.
A separate, optional supplement combines measured white-gutter evidence from
accepted neighbors. Candidates must agree across two seed scales away from a
small boundary band. Existing owners are never trimmed, replaced or reordered.
Rooted chains can reach another frame; proximity or an unassigned area alone is
not sufficient. The accepted Test71 detector and its proof-27 route remain intact.

### Original-image results

- Rise of Apocalypse **#3, reader 9/23** (image index 8): **3 to 6** selections.
  Adds the left tall scene and both lower-wide scenes.
- Rise of Apocalypse **#1, reader 19/24** (image index 18): **1 to 2** selections.
  Adds the lower-left scene using measured gutter evidence.
- All **91** supplied Apocalypse page images compared; **89** complete maps
  identical; all **150** earlier descriptors and their order preserved.
  Detected selections increase from **150 to 154**.

The four additions passed 33 touchscreen reader tests; 30 prior-frame touches
also passed. Six resized/mirrored page variants passed their inclusion/exclusion
checks. Local tests retain all previous regression contracts and add rooted-chain,
combined-border, radius-8, malformed-proof and cyclic-proof tests.

These are measured results on the supplied artwork, not a claim that all panels
or all comics work. The historical Wolverine/manga/Magneto original images were
unavailable for a fresh corpus rerun. Phone acceptance of Test73 is pending.

See [validation](TEST73-VALIDATION.json), [handoff](HANDOFF-2.79.73.md), and
[test notes](qa27900/frame-accuracy/test73/README.md). Build status is recorded in
the validation file after the downloaded APK is verified.

[Previous release notes and project documentation](README-through-Test71.md)
are preserved without removing their earlier content or changing relative links.
