// NTH SHELF V2.78.10 — ORTHOGONAL PANEL GEOMETRY
// Conservative rectangle/near-rectangle geometry. Unproven legacy seeds remain
// rectangles. A connected four-rail proof keeps its exact vertices even when
// its angle classification is orthogonal: a label must not expand the crop.

const PanelGeometryOrthogonal = {
  _provenQuad(panel) {
    const q = panel?._quad;
    const connected = (panel?._openRegionProof?.version === 1 && panel._openRegionProof.connected === true) ||
      panel?._frameEnvelope?.chainConnected === true ||
      (panel?._pageLayoutProof?.kind === 'stacked-strips' && panel._pageLayoutProof.closed === true) ||
      (panel?._closedFrameProof?.version === 1 && panel._closedFrameProof.connected === true) ||
      (panel?._partitionProof?.version === 1 && panel._partitionProof.connected === true);
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

  _provenOutline(panel) {
    const q=panel?._outline, proof=panel?._overlapProof;
    if(proof?.version!==1||proof.connected!==true||proof.method!=='paired-edge-insets'||
       !Array.isArray(q)||q.length<4||q.length>20||
       q.some(p=>!Number.isFinite(p?.x)||!Number.isFinite(p?.y)||p.x<0||p.x>1||p.y<0||p.y>1))return null;
    const cross=(a,b,c)=>(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);
    let area=0;
    for(let i=0;i<q.length;i++){
      const a=q[i],b=q[(i+1)%q.length];
      if(Math.hypot(a.x-b.x,a.y-b.y)<1e-8)return null;
      area+=a.x*b.y-b.x*a.y;
      for(let j=i+2;j<q.length;j++){
        if(i===0&&j===q.length-1)continue;
        const c=q[j],d=q[(j+1)%q.length];
        if(Math.max(a.x,b.x)<Math.min(c.x,d.x)||Math.max(c.x,d.x)<Math.min(a.x,b.x)||
           Math.max(a.y,b.y)<Math.min(c.y,d.y)||Math.max(c.y,d.y)<Math.min(a.y,b.y))continue;
        if(cross(a,b,c)*cross(a,b,d)<=0&&cross(c,d,a)*cross(c,d,b)<=0)return null;
      }
    }
    return Math.abs(area)>.0002?q.map(p=>({x:p.x,y:p.y})):null;
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
    const outline=this._provenOutline(panel);
    if(outline)out._outline=outline;
    else delete out._outline;
    if (log) log(`ORTHOGONAL geometry x=${x.toFixed(4)} y=${y.toFixed(4)} w=${w.toFixed(4)} h=${h.toFixed(4)}`);
    return out;
  }
};
