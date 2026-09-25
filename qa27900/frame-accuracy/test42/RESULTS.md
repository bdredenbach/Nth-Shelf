# Test42 — branched stack with curved shared seam

## Target

Reader **page35 / 74** was supplied directly after page33 acceptance. Test41 publishes four coarse owners: one giant region covering almost the entire page and three false fragments cut from the final hotel panel. The page actually contains seven frames.

## Detector change

Test42 extends `js/panels-structural-grid.js` with a bounded branched-stack route. It requires exactly four unproved legacy owners with one large upper body and three aligned terminal fragments, then independently proves the actual frame tree from pixels: one long main vertical spine, one upper-right secondary divider, the right-side horizontal divider, the full-width top-stack bottom rail and the full-width terminal rail.

The boundary between the sheriff panel and the forest panel is not orthogonal. Test42 traces that shared seam with a continuity-constrained dynamic path over luminance edge/brightness evidence, simplifies the path to a small polygonal outline, and gives the two neighboring panels the same measured seam. No stored crop, page number, title, image hash or tap coordinate supplies geometry.

## Private fixture evidence

Analysis size: **585×900**. Test41 page35 goes **4 → 7 page-wide owners**. The main spine is the dark rail group x **292–297**; the secondary upper-right divider is x **445–452**; the upper-right horizontal divider is y **270–280**; the top-stack bottom rail is y **459–471**; and the terminal rail is y **730–738**. The curved shared seam runs from approximately y **665** on the left to **584** on the right with mean path evidence about **197.9**.

Reader ownership/geometry verification: **35/35** center/left/right/north/south points across all seven panels, all seven structural proofs valid before and after geometry routing, zero ownership collisions.

## Applicability / regression

The preserved 74-page Test32 descriptor fixture has eight four-entry pages: **7, 12, 14, 35, 50, 67, 68 and72**. Re-running the Test42 completion against those page images and preserved owners yields **only page35**; all seven others reject the topology. Retained Test37–41 contracts remain part of CI.

Page13, page23, page27, page28, page32 and page33 are phone-accepted. Android build and page35 phone acceptance are separate gates.


## Phone acceptance update — page35

The user confirmed the page35 frame repair worked while testing the later Test44 build. Reader page35 is accepted for the manual page-by-page queue.
