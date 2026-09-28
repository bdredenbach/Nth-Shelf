# Test75: edge-guided separation of touching paper frames

Run `bash qa27900/frame-accuracy/test75/run-retained.sh` at the repository root.
The suite retains the prior tests unchanged and adds a synthetic two-scene
contact fixture with a protruding foreground object. It tests 38 malformed proofs,
serialized reconstruction, old-owner protection, rejection of internal dividers,
and geometry/edge-spill delegation.

Original-image tests are recorded in corpus-comparison.json and reader-validation.json.
They are not rerun by CI without the private user comic archive. web-assets.json
freezes the exact tested web bytes for APK verification.

Proof31 is `four-way-stable-gradient-paper-contact`. Image-derived seed maps at
two radii and two bounded contact-window widths must produce an identical owner
mask. Gradient cost comes from the original RGB image. White or measured contact
edges must surround a complete scene; high-contrast content alone is insufficient.
The two verified scenes are issue1 reader8/24. This is not proof of coverage of all
remaining pages, and no speed improvement is claimed.
