# Test37 — tap-independent structural grid completion

Reader page **23 / 74** was supplied directly after the user abandoned the old 1–12 video queue. Test36 publishes only **2** page-wide identities on this six-panel page, leaving four cells to tap-dependent V100 rescue; the supplied phone screenshot shows a bad three-panel T-shaped focus.

Test37 adds `js/panels-structural-grid.js`. It proves the conservative guillotine grid once from sustained dark rails / quiet gutters, removes uniform exterior-matte leaves with artwork statistics, and can supplement only a map containing exactly two independently validated perimeter anchors: one `rim-frame` and one `bleed-strip-frame`. Those two anchors are retained byte-for-byte in structural reading order; only missing cells are added. There is no page number, comic title, filename, image hash, tap coordinate or stored crop in runtime.

Recorded private-fixture result: page23 **2 → 6** page-wide identities; four new structural cells; 6 textured cells from 6 proved splits; retained coverage **0.942** on the 585×900 analysis page. The uniform bottom matte leaf is rejected. In the preserved Test32 74-page descriptor fixture, no other two-entry map has the same rim-frame + bleed-strip-frame anchor combination.

Real Reader/NthPageDeck browser checks: **30/30** center/left/right/north/south ownership points across all six panels; **20/20** focus renders across the four new cells; zero page errors. A middle-right south-point render contains only the intended face panel, not the prior T-shaped merge. Local harness focus calls for the four new page-wide cells took 0.005–0.027 s; the prior V100 center rescue on this page took about 11.6 s. These are local browser timings, not Android guarantees.

Synthetic contract accepts a six-cell grid, rejects proof tampering, and verifies runtime fixture keys are absent. Test36 page13 is phone-accepted. Android build and page23 phone acceptance remain separate gates.


## Phone acceptance update — 2026-09-24

The user confirmed Test37 worked on the phone. Reader page23 is accepted. The manual page-by-page queue now advances to page27.
