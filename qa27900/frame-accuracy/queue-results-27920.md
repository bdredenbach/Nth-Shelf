# 2.79.20 Test 1 — separate page-11 fortifications

FQ-10 advances by one complete frame: the right-hand fortifications panel on
page 11, including both captions. The user confirmed the preceding 2.79.19
page-19 middle-scene test worked; that result is now a phone-confirmed control.
Pages are one-based, including the cover. No comic coordinates enter runtime.

## Change and limits

A quiet tinted gutter may vary in brightness. The optional new proposal uses
colors observed at the page exterior, requires at least 97% chroma consistency,
and never expands its palette while flooding. Accepted frames require at least
95% exterior-connected quiet-background support on each of four sides, complete
ink rails and joined corners. Interior-gutter, divider and inset checks remain.

On this route only, rough interior boxes need three fitted rails to count as
inset evidence; an interrupted fourth side still vetoes the parent. An apparent
interrupted divider needs independently fitted, aligned segments at both ends.
This rejects the fortifications artwork's rough dark-box/line coincidences.
Other routes retain their original weak-evidence rules. The top forest's tree
trunks remain ambiguous and do not gain an identity.

A proved frame can take priority inside one large, unproved legacy composite.
It must fit that region and avoid every other existing identity. Existing
objects and their order remain intact after the new preferred frame. This is
an explicit refinement of tap priority, not a complete disjoint page map.
Taps in the unresolved forest/portrait retain their prior merged selection.

Still queued: pages 9–10's upper groups; the remainder of page 11's upper group;
page 19's balloon-crossed room/eye-strip pair and reliable syringe selection;
page 6's two unproved identities and earlier resampling limitations. Bubble
code and its pending explicit second-level phone checks are unchanged.

## Verification

- 74-page Sharp identity comparison: only page 11 changes, from three entries
  to four. All old identities and evidence remain exact, including page 19.
- Three Skia comparisons on the 26 pages with eligible large legacy regions in
  the Sharp baseline (78 page/quality checks): only page 11 gains the new
  preferred frame. Every previously returned identity remains exact. This is
  not a complete 74-page Skia sweep or certification of every fallback.
- New Reader checks: five fortifications points plus four points outside it,
  under Sharp and three Skia settings (36 total). The new crop follows an
  independently labeled printed border. Outside points preserve the exact old
  forest, portrait and lower-frame selections; the first two remain known bad.
- Earlier 355 Reader checks remain passing: 220 Sharp and 135 Skia checks,
  including pages 7/17 and the phone-confirmed page-19 middle scene. Combined
  total: 391 Reader-handler checks. Local Skia is not Android certification.
- New synthetic gradient checks cover five interior positions, missing borders,
  mismatched exterior colors, full/interrupted dividers, full/partial insets,
  established-identity priority and overlap rejection. Existing geometry,
  partition, gutter, crop, pilot-strip and cancellation gates remain passing.
- CI gates browser/backup interaction, native archives, and APK metadata and
  signature. The new synthetic gradient tests are part of the CI gate.

Local fixture command (source comic excluded from repository/CI/APK):

```sh
NTH_BASELINE_ROOT=/path/to/2.79.19 node qa27900/gradient-gutter-artwork.cjs --comic --skia
```

Version `2.79.20-test1`, Android code `27924`; shell and map/proof versions
advance. No device latency claim is made.

## Phone check

On page 11, move taps left/right/center/north/south inside the fortifications
panel. Every crop should contain the whole printed panel and both captions.
Recheck page 19's middle scene and the established page-5/7/9/13/16/17 controls.
Do not expect the forest or borderless portrait to be fixed in this build.
