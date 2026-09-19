// NTH SHELF V2.78.10 — ORTHOGONAL PANEL GEOMETRY
// Conservative rectangle/near-rectangle geometry. Unproven legacy seeds remain
// rectangles. A connected four-rail proof keeps its exact vertices even when
// its angle classification is orthogonal: a label must not expand the crop.

const PanelGeometryOrthogonal = {
  _provenQuad(panel) {
    const q = panel?._quad;
    const connected = panel?._frameEnvelope?.chainConnected === true ||
      (panel?._pageLayoutProof?.kind === 'stacked-strips' && panel._pageLayoutProof.closed === true);
    if (!connected ||
        !Array.isArray(q) || q.length !== 4 ||
        q.some(p => !Number.isFinite(p?.x) || !Number.isFinite(p?.y))) return null;
    const turns = q.map((p, i) => {
      const b = q[(i + 1) % 4], c = q[(i + 2) % 4];
      return (b.x - p.x) * (c.y - b.y) - (b.y - p.y) * (c.x - b.x);
    });
    if (!turns.every(v => v > 1e-10) && !turns.every(v => v < -1e-10)) return null;
    return q.map(p => ({ x: p.x, y: p.y }));
  },

  refine(panel, log) {
    if (!panel) return null;
    const x = clamp01(panel.x), y = clamp01(panel.y);
    const w = Math.max(0.001, Math.min(1 - x, panel.w || 0));
    const h = Math.max(0.001, Math.min(1 - y, panel.h || 0));
    if (w <= 0.01 || h <= 0.01) return null;
    const out = { ...panel, x, y, w, h, _geometryType: 'orthogonal' };
    const provenQuad = this._provenQuad(panel);
    if (provenQuad) out._quad = provenQuad;
    else delete out._quad;
    if (log) log(`ORTHOGONAL geometry x=${x.toFixed(4)} y=${y.toFixed(4)} w=${w.toFixed(4)} h=${h.toFixed(4)}`);
    return out;
  }
};
