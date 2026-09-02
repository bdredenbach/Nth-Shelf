// NTH SHELF V2.78.22 — ORTHOGONAL AUTHORITY / CLOSED-FRAME RESCUE ROUTER
//
// Stable/local orthogonal geometry is authoritative. The skew-frame envelope
// may run only when V99 returns an oversized/composite structural band instead
// of a panel-scale region. This prevents diagonal artwork inside a known good
// rectangle from replacing that rectangle with a skewed polygon.

const PanelGeometry = {
  _seedPolicy(panel) {
    const w=Math.max(0,Number(panel?.w)||0);
    const h=Math.max(0,Number(panel?.h)||0);
    const area=w*h;
    const composite=area>.24||(w>.82&&h>.28)||(h>.82&&w>.28);
    const inferred=panel?._identitySource||
      (panel?._v100Hybrid?'v100':panel?._v87BoundarySet?'v99':'unknown');

    if(inferred==='v73') return {rescue:false,source:'V73',reason:'stable-orthogonal'};
    if(inferred==='v100') return {rescue:false,source:'V100',reason:'structural-orthogonal'};
    if(inferred==='v99'&&!composite) {
      return {
        rescue:false,
        source:'V99',
        reason:panel?._v99InteriorClean===false?'local-seed':'local-clean-rectangle'
      };
    }
    if(!composite) return {rescue:false,source:String(inferred).toUpperCase(),reason:'local-seed'};
    return {rescue:true,source:String(inferred).toUpperCase(),reason:'oversized-composite',area};
  },

  async refine(imgUrl, panel, log) {
    if (!panel) return null;
    if (log) log('ROUTER V2.78.22 orthogonal-authority start');

    const policy=this._seedPolicy(panel);
    if(!policy.rescue){
      const held=(typeof PanelGeometryOrthogonal!=='undefined'&&PanelGeometryOrthogonal.refine)
        ? PanelGeometryOrthogonal.refine(panel,log)
        : {...panel};
      held._geometryOwner='orthogonal-authority';
      if(log)log(`ORTHOGONAL AUTHORITY HOLD source=${policy.source} reason=${policy.reason}`);
      if(log)log('ROUTER -> ORTHOGONAL AUTHORITY');
      return held;
    }

    if(log)log(`COMPOSITE SEED RESCUE ELIGIBLE source=${policy.source} area=${policy.area.toFixed(3)}`);

    if (imgUrl && typeof PanelFrameEnvelope !== 'undefined' && PanelFrameEnvelope.detect) {
      const envelope = await PanelFrameEnvelope.detect(imgUrl, panel, log);
      if (envelope && Array.isArray(envelope._quad) && envelope._quad.length===4) {
        envelope._geometryOwner='unclassified-envelope';
        if (log) log('ROUTER -> TAP-NEIGHBORHOOD FRAME (composite rescue)');
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
