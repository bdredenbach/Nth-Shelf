# Test45 — page36 stepped shared-scene completion

## Target

Reader page36 currently publishes seven broad matte-cell identities. Artwork review confirms only six real frames: top-left, top-right, sheriff inset, one complete middle scene, bottom-left and bottom-right. The former middle-left and middle-right taps are inside the same scene.

## Detector change

Test45 adds a bounded structural completion over an existing seven-cell matte map. Eligibility requires two top cells, one overlapping inset cell, two mutually overlapping middle fragments and two bottom cells with a specific overlap signature. Five anchors are independently re-fit through the existing frame-envelope proof. The two middle fragments are replaced by one shared-scene outline.

The lower edge of the middle scene is shared with both bottom panels. Test45 derives its left/right endpoint neighborhoods from the existing matte/frame evidence, then uses one smooth sloped seam across the page rather than following speech bubbles or artwork edges. The same seam is used by the middle, bottom-left and bottom-right owners.

Runtime contains no comic title, filename, reader page number, image hash, tap coordinate or saved crop.

## Private fixture verification

- Test44 page36: 7 matte-cell owners.
- Test45 page36: **6 structural owners**.
- Directional ownership/geometry: **30/30** center/left/right/north/south checks across all six owners.
- Render review: top-left, top-right and sheriff inset remain separate; hallway + Logan are one complete middle scene; shower stays bottom-left; Logan + woman remain one bottom-right scene.
- The shared lower seam runs smoothly from the left side down toward the right and does not chase speech balloons or interior artwork.

## Applicability

A full direct matte-cell sweep over all 74 source pages found five pages with seven matte cells: **17, 32, 36, 44 and56**. Running the Test45 topology gate over those five produced **only page36**; the other four return no completion.

Retained Test37–44 contracts pass locally. Android build and page36 phone acceptance remain separate gates.
