// NTH SHELF V2.78.23 — PROVEN-FRAME OWNERSHIP ROUTER
//
// Frame extraction and geometry ownership are separate decisions. The envelope
// first proves a complete four-rail cell; only that finished quadrilateral may
// be classified as skewed or orthogonal. Ownership never invents new corners.

const PanelGeometry = {
  _seedPolicy(panel) {
    const w=Math.max(0,Number(panel?.w)||0);
    const h=Math.max(0,Number(panel?.h)||0);
    const area=w*h;
    const composite=area>.24||(w>.82&&h>.28)||(h>.82&&w>.28);
    const inferred=panel?._identitySource||
      (panel?._v100Hybrid?'v100':panel?._v87BoundarySet?'v99':'unknown');

    if(inferred==='v73') return {mode:'hold',source:'V73',reason:'stable-orthogonal'};
    if(inferred==='v100') return {mode:'hold',source:'V100',reason:'structural-orthogonal'};
    if(inferred==='v99'&&!composite) {
      return {mode:'inspect',source:'V99',reason:'local-frame-ownership'};
    }
    if(!composite) return {mode:'hold',source:String(inferred).toUpperCase(),reason:'local-seed'};
    return {mode:'frame',source:String(inferred).toUpperCase(),reason:'oversized-composite',area};
  },

  async refine(imgUrl, panel, log) {
    if (!panel) return null;
    if (log) log('ROUTER V2.78.23 proven-frame-ownership start');

    const policy=this._seedPolicy(panel);
    if(policy.mode==='hold'){
      const held=(typeof PanelGeometryOrthogonal!=='undefined'&&PanelGeometryOrthogonal.refine)
        ? PanelGeometryOrthogonal.refine(panel,log)
        : {...panel};
      held._geometryOwner='orthogonal-authority';
      if(log)log(`ORTHOGONAL AUTHORITY HOLD source=${policy.source} reason=${policy.reason}`);
      if(log)log('ROUTER -> ORTHOGONAL AUTHORITY');
      return held;
    }

    if(log)log(`FRAME OWNERSHIP ELIGIBLE source=${policy.source} mode=${policy.mode}${policy.area?` area=${policy.area.toFixed(3)}`:''}`);

    if (imgUrl && typeof PanelFrameEnvelope !== 'undefined' && PanelFrameEnvelope.detect) {
      const frameSeed=policy.mode==='inspect'
        ? {...panel,x:.011,y:.013,w:.954,h:.957,_tap:panel._tap,_ownershipProbe:true}
        : panel;
      const envelope = await PanelFrameEnvelope.detect(imgUrl, frameSeed, log);
      if (envelope && Array.isArray(envelope._quad) && envelope._quad.length===4) {
        const ownership=(typeof PanelGeometrySkewed!=='undefined'&&PanelGeometrySkewed.classifyQuad)
          ? PanelGeometrySkewed.classifyQuad(envelope,log)
          : {owns:true,owner:'skewed',reason:'classifier-unavailable'};
        envelope._frameOwnership=ownership;
        if(ownership.owns){
          envelope._geometryOwner='skewed-frame';
          if(log)log('ROUTER -> SKEWED FRAME (proven whole-frame ownership)');
          return envelope;
        }

        const envelopeArea=Math.abs(envelope._quad.reduce((sum,p,i)=>{
          const next=envelope._quad[(i+1)%4];return sum+p.x*next.y-next.x*p.y;
        },0)/2);
        const seedArea=Math.max(.0001,(Number(panel.w)||0)*(Number(panel.h)||0));
        const fragment=policy.mode==='inspect'&&envelopeArea/seedArea>2.0;
        if(policy.mode==='inspect'&&!fragment){
          const held=(typeof PanelGeometryOrthogonal!=='undefined'&&PanelGeometryOrthogonal.refine)
            ? PanelGeometryOrthogonal.refine(panel,log):{...panel};
          held._geometryOwner='orthogonal-authority';
          held._frameOwnership=ownership;
          if(log)log(`ORTHOGONAL AUTHORITY HOLD source=${policy.source} frameRatio=${(envelopeArea/seedArea).toFixed(2)}`);
          if(log)log('ROUTER -> ORTHOGONAL AUTHORITY');
          return held;
        }

        const ortho=(typeof PanelGeometryOrthogonal!=='undefined'&&PanelGeometryOrthogonal.refine)
          ? PanelGeometryOrthogonal.refine(envelope,log):{...envelope};
        ortho._geometryOwner='orthogonal-frame';
        ortho._frameOwnership=ownership;
        if(log)log(`ROUTER -> ORTHOGONAL FRAME (${fragment?'fragment seed replaced':'proven frame'})`);
        return ortho;
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
