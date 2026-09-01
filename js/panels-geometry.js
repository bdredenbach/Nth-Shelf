// NTH SHELF V2.78.12 — FRAME ENVELOPE ROUTER
//
// V2.78.12 changes the order of operations:
//   stable panel identity -> COMPLETE frame envelope -> later angle ownership.
//
// This test build intentionally does NOT ask orthogonal/skewed to own the tap.
// If the envelope can prove the whole four-sided frame, we render that envelope
// directly so the phone test can tell us whether the recovered vertices are the
// actual panel corners. If envelope proof fails, the V2.78 stable orthogonal seed
// remains the safe fallback.

const PanelGeometry = {
  async refine(imgUrl, panel, log) {
    if (!panel) return null;
    if (log) log('ROUTER V2.78.12 frame-envelope start');

    if (imgUrl && typeof PanelFrameEnvelope !== 'undefined' && PanelFrameEnvelope.detect) {
      const envelope = await PanelFrameEnvelope.detect(imgUrl, panel, log);
      if (envelope && Array.isArray(envelope._quad) && envelope._quad.length===4) {
        envelope._geometryOwner='unclassified-envelope';
        if (log) log('ROUTER -> FRAME ENVELOPE (ownership deferred)');
        return envelope;
      }
    }

    const ortho=(typeof PanelGeometryOrthogonal!=='undefined'&&PanelGeometryOrthogonal.refine)
      ? PanelGeometryOrthogonal.refine(panel,log)
      : {...panel};
    ortho._geometryOwner='orthogonal-fallback';
    if (log) log('ROUTER -> ORTHOGONAL FALLBACK (envelope not proven)');
    return ortho;
  }
};
