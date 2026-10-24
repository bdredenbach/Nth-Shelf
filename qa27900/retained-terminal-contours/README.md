# Retained terminal contour handoff

This isolated trial corrects a mismatch between hit ownership and contour lookup. The cloud-rim composition already delegates retained-owner hit-testing and zoom to the authenticated predecessor context, but its retained contour lookup previously reached terminal admission outside that context and returned null. Later geometry routing could consequently lose the source-owned contour and produce no popup.

The narrow change delegates only exact retained terminal members of a currently valid composition to their mapped prior owner, under the existing guarded owner scope. All source admission stays in the prior implementation. Cloud children and non-composition paths retain their previous contour behavior. No masks, coordinates, geometry thresholds, source data, or pixel math change.

Run the public mock dispatch controls:

    node qa27900/retained-terminal-contours/test-dispatch.cjs

These ten checks extract the actual production wrapper but mock its context and prior admission. They test dispatch, not source-proof validation. Private original-source checks separately cover seventeen live ownership/source/copy/serialized-map conditions, and sixteen actual tap checks cover eight stale-navigation/source mutations plus eight exact restorations.

## Current status

Published candidate source, not an accepted release. Two previously missing actual popouts now open on the exposed development page; the five existing outcomes on that page remain exact. Native review found a thin foreign edge sliver and uncertain boundary-contact remnants, so this is a functional handoff repair, not two complete clean-frame repairs. The underlying native contours are unchanged. Removing a neighboring scene's occluding dialogue leaves transparent holes; hidden artwork is not synthesized.

A separately frozen fresh 369-tap replay across 93 entries / 92 original sources passes all 93 strict page gates: 365 opens and 4 inherited misses. The other 367 outcomes and all semantic fields remain exact, except timing/logs. Its two declared expected differences repeat the exact reviewed functional outputs with the quality limitations above; both raw/display PNGs also match archived Test168 output hashes. A regression pass cannot establish complete-scene quality, browser or Android behavior, phone performance, APK/release acceptance or permission to publish.

No private art or expected comic crop files are included in these public test sources. No residue-trimming experiment, speech variant or speculative speed cache is included.
