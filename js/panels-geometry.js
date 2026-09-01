// NTH SHELF V2.78.05 — PANEL GEOMETRY ROUTER
// panels.js identifies the tapped panel. This router decides only how that
// already-identified panel should be represented: orthogonal rectangle or a
// proven skewed quadrilateral.

const PanelGeometry = {
  async refine(imgUrl, panel, log) {
    if (!panel) return null;
    if (log) log('ROUTER geometry classification start');

    // Skewed geometry must prove itself. Ambiguous cases remain orthogonal.
    if (typeof PanelGeometrySkewed !== 'undefined' && PanelGeometrySkewed.refine) {
      const skewed = await PanelGeometrySkewed.refine(imgUrl, panel, log);
      if (skewed) {
        if (log) log('ROUTER -> SKEWED');
        return skewed;
      }
    }

    const ortho = (typeof PanelGeometryOrthogonal !== 'undefined' && PanelGeometryOrthogonal.refine)
      ? PanelGeometryOrthogonal.refine(panel, log)
      : panel;
    if (log) log('ROUTER -> ORTHOGONAL');
    return ortho;
  }
};
