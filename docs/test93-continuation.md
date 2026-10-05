# Test93 recovery continuation — 5 October 2026

Test92/Test93 source is published with explicit user authorization at `3a3c287`. Its source tree is identical to the saved tested local checkpoint. Android workflow run `37370172377` was started automatically by the branch update and is awaiting a runner.

## Internal speech findings

A scratch prototype replaces the speech supplement's outside-bounding-box gate with a missing-body criterion. Source/Reader inspection on Apocalypse issue 3 reader 6, reader 13, issue 2 reader 18 and issue 4 reader 14 earns **zero additional complete-frame credit**. Runtime remains unchanged; complete coverage remains **168/385**, 217 remaining.

At issue 3 reader 6, strong collar support can establish the intended owner even when very little of the balloon interior survives the existing mask. The `HE IS A GIFT...` balloon has 590 of 757 collar samples with the central owner, but only 810 body pixels are initially retained. The original 25% body gate rejects it. The `QUICK--FETCH WATER...` balloon has weaker, competing collar support (317 central, 175 false inset, 40 right owner of 614 samples). This is not sufficient reason to weaken the production gates globally.

The initial inside-box prototype restores pieces of text but does not complete the scene. A deliberately relaxed probe (10% body support, 50% collar, 20-point lead, reduced final area floor) restores both central balloons; actual Reader source comparison still shows the missing street artwork currently assigned to false selection 5. It is an unaccepted experiment, not a tested detector improvement. A small displaced owner also makes the production 2.5%-page final-area rule reject the whole proposed transfer. Merely reducing that floor bypasses a validation safeguard and must not be shipped as a fix.

Do not count restored lettering, fragments, or duplicate scene outputs as complete frames. The next useful step is physical frame-perimeter evidence for consolidating the central street artwork and rejecting its false inset, with separate negative controls for actual inset frames. The remaining SWAK crop, issue 3 reader 13 lower pair, and issue 4 reader 14 narrow red-rim inset still need physical boundary evidence. Keep Test93's accepted crossing-balloon transfer and all Test92 gains.

Private source artwork and prototype scripts stay outside git/CI. Scratch investigation is in `/workspace/scratch/5827b11a4a78/research/test94/`; it contains several explicitly unaccepted variants and source/crop diagnostics. No full-corpus validation was claimed for those variants.
