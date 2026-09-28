# Test74 — independent paper enclosures

Run `bash qa27900/frame-accuracy/test74/run-retained.sh` from the repository root.
It retains the earlier detector contracts and adds the new two-cell, page-edge,
internal-ink-divider, append-only, serialization and 34 proof-tamper checks.

This supplement follows the published Test73 detector without changing any of
its earlier frame algorithms. It can add an independently enclosed paper cell
even when the page has no accepted neighbor. Up to two physical page edges can
form measured boundaries. Other exposed boundary samples require 95% nearby
white paper and 80% nearby page-connected paper, within a three-pixel square
neighborhood. Two candidate seed scales must agree within the bounded fringe;
their intersection supplies the actual contour. Source candidates with only two
cells can qualify through this separate validator without changing the earlier
whole-map rules. Existing owner pixels and serialized descriptors are protected.

Five supplied original-image targets passed visual and actual Reader checks:

| Issue | Reader page | New selection |
| --- | --- | --- |
| 1 | 4/24 | Top sandstorm scene on the opening spread |
| 1 | 12/24 | Bottom dialogue scene |
| 2 | 15/23 | Top-wide scene with the official and workers |
| 3 | 4/23 | Lower-middle wrapped-worker scene on the spread |
| 3 | 23/23 | Upper-left sword/hand close-up |

A sixth trial candidate on issue2 image13 was rejected during final inspection:
it carried fragments of the next scene's red sound-effect border. Its lower
boundary had only 74.2% page-connected-paper support. The final 80% gate withholds
that ambiguous candidate; no manual page-specific crop or lookup was added.

Original-image comparison: 91 pages, 86 identical maps, all154 previous owners
preserved in order, and159 total selections. The baseline is the published CI
Test73, which already includes issue1 image18; the earlier local Test73 had153.
Reader checks:40 new-frame touches,18 retained-frame touches across the completed
six-scene Test73 page,320 inclusion and200 exclusion alpha checks,293792 distinct
interior and50473 distinct exterior samples, with no alpha failures.

Fourteen of15 resized/mirrored target variants passed. The1.25x variant of issue3
image3 abstains because the two source reconstructions disagree. Its original,
0.67x and mirrored image pass. This limitation is retained, not hidden by a
weakened consensus rule. No fresh historical312-page artwork rerun was possible;
the earlier saved regression fixtures remain included. Artwork is not committed.
