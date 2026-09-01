// NTH SHELF V2.78.07 — ORTHOGONAL PANEL GEOMETRY
// Conservative rectangle/near-rectangle geometry. This module never changes
// panel identity; it only normalizes the seed supplied by panels.js.

const PanelGeometryOrthogonal = {
  refine(panel, log) {
    if (!panel) return null;
    const x = clamp01(panel.x), y = clamp01(panel.y);
    const w = Math.max(0.001, Math.min(1 - x, panel.w || 0));
    const h = Math.max(0.001, Math.min(1 - y, panel.h || 0));
    if (w <= 0.01 || h <= 0.01) return null;
    const out = { ...panel, x, y, w, h, _geometryType: 'orthogonal' };
    delete out._quad;
    if (log) log(`ORTHOGONAL geometry x=${x.toFixed(4)} y=${y.toFixed(4)} w=${w.toFixed(4)} h=${h.toFixed(4)}`);
    return out;
  }
};
