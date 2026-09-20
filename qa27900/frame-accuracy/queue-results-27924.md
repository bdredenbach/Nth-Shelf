# 2.79.24 Test 1 — Artwork and page-19 syringe candidate

Pages 9 and 10 are now phone-confirmed by the user, alongside page 11 and
all earlier controls. This build advances only the tall syringe frame on page 19;
it does not claim the whole page is finished.

## Detector change

Where two existing dark-margin partition frames are already proved and a
full-width row remains unresolved, an optional supplement checks for a uniform
continuous ink core. It requires near-complete paired thickness, low variance,
attachment at both ends, distributed fit samples and a tight residual. Original
separator candidates retain priority. Missing/weak dividers and internal insets
still block ambiguous cells. Additions must lie within a previously unresolved
region and preserve every existing boundary exactly. Existing frame objects
and evidence are retained, not replaced by the supplementary pass.

The real Chromium failure was a complete syringe border whose contrast was
hidden by neighboring dark artwork. The new crop includes the full syringe,
hand and upper speech balloon. No comic-specific coordinates enter runtime.

## Completed local verification

- Real Chromium, original 74-page comic: only page 19 changes; every earlier
  frame identity and its evidence are exact, including confirmed pages 9–11.
- Thirty actual touch/rendered-overlay checks: five positions repeated twice
  across the syringe, whole middle room including Wolverine, and bottom scene.
- Sharp: all three independent artwork labels pass 15 Reader-handler checks.
- Skia low/medium/high: respectively 2/3/2 proven identities; 35 handler probes
  pass and every baseline identity remains exact. Low/high still defer the
  syringe due ambiguous grid/border evidence. This cautious fallback is retained.
- Independent synthetic layout proves the new mechanism and preserves old
  boundaries. Seven negative images cover broken, one-ended, variable-ink,
  thin, inset, partial-inset and white-margin cases. Invalid anchors also reject.
- Existing geometry, partition, completion, queue, overlap, open-region,
  gradient-gutter, bubble-selection and double-pop-out regressions pass.
- Responsive empty-shelf artwork and existing import/restore/backup browser
  gate pass at 412×915, 360×640 and 915×412. Branding/text remain crisp and
  within the viewport; buttons retain their existing behavior.

## Art restoration

See [artwork notes](../brand-artwork-27924.md). The central illustration is
1448×1086; top/bottom companions are each 2164×727. Branding is vector and UI
text is rendered live. Regular and maskable 1024px icons are included, with
smaller variants regenerated from the same master. Native splash preserves
illustration proportions and draws branding/text separately.

Native compilation, APK metadata/signature and exact packaged-source checks
are required before delivery. Native screen appearance still needs device review;
no emulator or phone result is implied by browser checks.

## Phone priorities

1. Inspect launch splash, initialization/empty-shelf screen and launcher icon.
2. On page 19, tap center/left/right/top/bottom inside the tall syringe panel,
   dismissing each time. Retain the upper speech and the complete syringe/hand.
3. Recheck the whole middle room including Wolverine and the bottom scene.
4. Preserve confirmed pages 9, 10 and 11.

Page-19 upper-room/eye groups, page-6 remaining proof gaps and explicit
second-level artwork negatives remain queued. New syringe behavior is a
candidate pending phone confirmation, not a whole-comic accuracy claim.
