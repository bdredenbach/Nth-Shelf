# Nth Shelf 2.79.44 / Test44 handoff

The follow-up phone video showed Test43's furl motion is available, but the touch start areas are vertically misplaced. The upper-right hot zone sits too high and the lower-right hot zone too low, forcing the user toward the mathematical page corners instead of the natural inside-paper grab points.

Test44 introduces one shared `PageMode.cornerZoneMetrics(width,height)` calculation. On the recorded portrait page it yields a 96 px grab box with roughly a 47 px vertical inset: the top box starts about 47 px below the paper top and the bottom box ends about 47 px above the paper bottom. Forward grabs are constrained to the visible paper width. The left-side reverse corner behavior is deliberately unchanged.

The Reader tutorial uses that same function to position its red upper/lower cues, so the boxes on screen are now the exact touch targets. Test43's mirrored furl geometry is retained unchanged.

The Test44 contract rejects the extreme top/bottom right corners, accepts the two inset forward zones, rejects touches outside the paper right edge, and verifies the legacy left reverse corner still works.

Android debug identity: `io.github.bdredenbach.nthshelf.frametest44`, version 2.79.44 / code 27972, label `Nth Shelf Test44`.
