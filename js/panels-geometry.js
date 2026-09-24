// NTH SHELF V2.79.05 — QUICK PROVEN-FRAME OWNERSHIP ROUTER
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
    const fragment=area<.040||(w>.22&&h<.070)||(h>.22&&w<.070);
    const edgeClipped=(w<.995||h<.995)&&
      (panel.x<=.003||panel.y<=.003||panel.x+w>=.997||panel.y+h>=.997);
    const inferred=panel?._identitySource||
      (panel?._v100Hybrid?'v100':panel?._v87BoundarySet?'v99':'unknown');

    if(inferred==='matte-cell-frame'&&typeof PanelMatteCells!=='undefined'&&PanelMatteCells.validPanel(panel))
      return {mode:'hold',source:'MATTE-CELL',reason:'measured-edge-connected-matte-cell'};
    if(inferred==='curved-rim-frame'&&typeof PanelCurvedRims!=='undefined'&&PanelCurvedRims.validPanel(panel))
      return {mode:'hold',source:'CURVED-RIM',reason:'measured-noncrossing-pale-rim-network'};
    if(inferred==='terminal-rim-frame'&&typeof PanelTerminalFrames!=='undefined'&&PanelTerminalFrames.validPanel(panel))
      return {mode:'hold',source:'TERMINAL-RIM',reason:'dual-luminance-terminal-band-four-observed-rims'};
    if(inferred==='corner-rim-frame'&&typeof PanelCornerFrames!=='undefined'&&PanelCornerFrames.validPanel(panel))
      return {mode:'hold',source:'CORNER-RIM',reason:'dual-luminance-four-observed-rims'};
    if(inferred==='sloping-edge-frame'&&typeof PanelEdgeCells!=='undefined'&&PanelEdgeCells.validPanel(panel))
      return {mode:'hold',source:'SLOPING-EDGE',reason:'dual-matte-enclosed-sloping-edge-cell'};
    if(inferred==='inset-neighbor-frame'&&typeof PanelInsetNeighbors!=='undefined'&&PanelInsetNeighbors.validPanel(panel))
      return {mode:'hold',source:'INSET-NEIGHBOR',reason:'measured-exterior-corridors-around-proved-inset'};
    if(inferred==='bordered-inset-frame'&&typeof PanelFramedInsets!=='undefined'&&PanelFramedInsets.validPanel(panel))
      return {mode:'hold',source:'BORDERED-INSET',reason:'closed-rim-and-two-exterior-gutter-crossings'};
    if(inferred==='matte-neighbor-frame'&&typeof PanelLocalIslands!=='undefined'&&PanelLocalIslands.validNeighbor?.(panel))
      return {mode:'hold',source:'MATTE-NEIGHBOR',reason:'edge-component-and-closed-matte-band'};
    if(inferred==='local-island-frame'&&typeof PanelLocalIslands!=='undefined'&&PanelLocalIslands.validPanel(panel))
      return {mode:'hold',source:'LOCAL-ISLANDS',reason:'paired-isolated-artwork-and-measured-matte'};
    if(inferred==='terraced-frame'&&typeof PanelTerracedFrames!=='undefined'&&PanelTerracedFrames.validPanel(panel))
      return {mode:'hold',source:'LOCAL-MATTE-STACK',reason:'closed-local-cells-and-segmented-shared-seams'};
    if(inferred==='rim-frame'&&typeof PanelRimFrames!=='undefined'&&PanelRimFrames.validPanel(panel))
      return {mode:'hold',source:'RIM-CONTOURS',reason:'measured-interrupted-rim-and-local-foreground'};
    if(inferred==='bleed-strip-frame'&&typeof PanelAbuttingFrames!=='undefined'&&PanelAbuttingFrames.validBleedStrip?.(panel))
      return {mode:'hold',source:'BLEED-STRIP',reason:'three-local-exterior-sides-and-measured-shared-seam'};
    if(inferred==='abutment-frame'&&typeof PanelAbuttingFrames!=='undefined'&&PanelAbuttingFrames.validPanel(panel))
      return {mode:'hold',source:'ABUTTING-SEAMS',reason:'complete-connected-shared-seam-network'};
    if(inferred==='composite-frame'&&typeof PanelCompositeFrames!=='undefined'&&PanelCompositeFrames.validPanel(panel))
      return {mode:'hold',source:'COMPOSITE-CONTOURS',reason:'measured-shared-rails-and-foreground-ownership'};
    if(inferred==='matte-component-outline'&&typeof PanelGeometryOrthogonal!=='undefined'&&
       PanelGeometryOrthogonal._validMatteOutlineProof(panel))
      return {mode:'hold',source:'MATTE-OUTLINE',reason:'paired-exterior-separated-silhouettes'};
    if(inferred==='overlap-frame'&&panel?._overlapProof?.version===1&&panel._overlapProof.connected===true)
      return {mode:'hold',source:'OVERLAP-FRAME',reason:'visible-occlusion-outline'};
    if(inferred==='open-region'&&panel?._openRegionProof?.version===1&&panel._openRegionProof.connected===true)
      return {mode:'hold',source:'OPEN-REGION',reason:'neighbor-bounded-matte'};
    if(inferred==='page-layout' && panel?._pageLayoutProof?.closed===true)
      return {mode:'hold',source:'PAGE-LAYOUT',reason:'complete-stacked-frame'};
    if(inferred==='structural-grid-frame'&&typeof PanelStructuralGrid!=='undefined'&&PanelStructuralGrid.validPanel(panel))
      return {mode:'hold',source:'STRUCTURAL-GRID',reason:'complete-tap-independent-guillotine-cell'};
    if(inferred==='closed-frame' && panel?._closedFrameProof?.version===1 && panel._closedFrameProof.connected===true)
      return {mode:'hold',source:'CLOSED-FRAME',reason:'independent-connected-borders'};
    if(inferred==='page-partition' && panel?._partitionProof?.version===1 && panel._partitionProof.connected===true)
      return {mode:'hold',source:'PAGE-PARTITION',reason:'complete-connected-partition'};
    if(inferred==='v73') return {mode:'hold',source:'V73',reason:'stable-orthogonal'};
    if(inferred==='v100'&&(fragment||composite||edgeClipped)) {
      return {mode:composite?'frame':'inspect',source:'V100',
        reason:composite?'oversized-composite':fragment?'possible-fragment':'page-edge-clipped',
        area,edgeClipped};
    }
    if(inferred==='v100') return {mode:'hold',source:'V100',reason:'structural-orthogonal'};
    if(inferred==='v99'&&!composite) {
      return {mode:'inspect',source:'V99',reason:'local-frame-ownership',edgeClipped};
    }
    if(!composite) return {mode:'hold',source:String(inferred).toUpperCase(),reason:'local-seed'};
    return {mode:'frame',source:String(inferred).toUpperCase(),reason:'oversized-composite',area};
  },

  _shapeAdaptiveEnvelope(envelope,log){
    if(!envelope||!Array.isArray(envelope._quad)||envelope._quad.length!==4||
      envelope._frameEnvelope?.chainConnected!==true)return null;
    const ownership=(typeof PanelGeometrySkewed!=='undefined'&&PanelGeometrySkewed.classifyQuad)
      ?PanelGeometrySkewed.classifyQuad(envelope,log)
      :{owns:true,owner:'skewed',reason:'classifier-unavailable'};
    envelope._frameOwnership=ownership;
    if(ownership.owns){
      envelope._geometryOwner='skewed-frame';
      if(log)log('QUICK ROUTER -> SKEWED FRAME');
      return envelope;
    }
    const ortho=(typeof PanelGeometryOrthogonal!=='undefined'&&PanelGeometryOrthogonal.refine)
      ?PanelGeometryOrthogonal.refine(envelope,log):{...envelope};
    ortho._geometryOwner='orthogonal-frame';
    ortho._frameOwnership=ownership;
    if(log)log('QUICK ROUTER -> ORTHOGONAL FRAME');
    return ortho;
  },

  // Fast front route for a baseline miss. It accepts only the bounded
  // one-search/local-consensus result and applies the same ownership classifier
  // as the complete router. A miss returns null so V100/V99/V92 stay untouched.
  async refineAdaptiveOnly(imgUrl,panel,log){
    if(!imgUrl||!panel||typeof PanelFrameEnvelope==='undefined'||
      !PanelFrameEnvelope.detectAdaptiveOnly)return null;
    const envelope=await PanelFrameEnvelope.detectAdaptiveOnly(imgUrl,panel,log);
    return this._shapeAdaptiveEnvelope(envelope,log);
  },

  // Synchronous decoded-page twin used only by the background panel-map
  // worker. Geometry ownership and all proof thresholds are shared with the
  // live V2.79.04 route above.
  refineAdaptiveImage(img,panel,log){
    if(!img||!panel||typeof PanelFrameEnvelope==='undefined'||
      !PanelFrameEnvelope.detectAdaptiveImage)return null;
    const envelope=PanelFrameEnvelope.detectAdaptiveImage(img,panel,log);
    return this._shapeAdaptiveEnvelope(envelope,log);
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
      if(policy.source==='MATTE-CELL'){held._geometryOwner='matte-cell-contours';held._geometryType='edge-connected-matte-cell';return held;}
      if(policy.source==='CURVED-RIM'){held._geometryOwner='curved-rim-contours';held._geometryType='noncrossing-pale-rim-network';return held;}
      if(policy.source==='TERMINAL-RIM'){held._geometryOwner='terminal-rim-outline';held._geometryType='four-observed-dark-rims';return held;}
      if(policy.source==='CORNER-RIM'){held._geometryOwner='corner-rim-outline';held._geometryType='four-observed-dark-rims';return held;}
      if(policy.source==='SLOPING-EDGE'){held._geometryOwner='sloping-edge-outline';held._geometryType='dual-matte-enclosed-edge-cell';return held;}
      if(policy.source==='INSET-NEIGHBOR'){held._geometryOwner='inset-neighbor-contours';held._geometryType='inset-guided-corridor-cell';return held;}
      if(policy.source==='BORDERED-INSET'){held._geometryOwner='bordered-inset-outline';held._geometryType='closed-rim-over-gutters';return held;}
      if(policy.source==='MATTE-NEIGHBOR'){held._geometryOwner='matte-neighbor-outline';held._geometryType='pair-anchored-edge-cell';return held;}
      if(policy.source==='LOCAL-ISLANDS'){held._geometryOwner='local-island-outline';held._geometryType='exterior-isolated-pixel-hull';return held;}
      if(policy.source==='RIM-CONTOURS'){held._geometryOwner='rim-outline';held._geometryType='interrupted-matte-rim-contours';return held;}
      if(policy.source==='ABUTTING-SEAMS'){
        held._geometryOwner='shared-seam-outline';held._geometryType='abutting-seam-network';
        if(log)log('ABUTTING SEAM AUTHORITY HOLD: retain stepped shared boundaries');
        return held;
      }
      if(policy.source==='COMPOSITE-CONTOURS'){
        held._geometryOwner='composite-outline';held._geometryType='shared-rail-foreground-contours';
        if(log)log('COMPOSITE CONTOUR AUTHORITY HOLD: retain cutouts and visible islands');
        return held;
      }
      if(policy.source==='MATTE-OUTLINE'){
        held._geometryOwner='matte-outline';held._geometryType='matte-silhouette-frame';
        if(log)log('MATTE OUTLINE AUTHORITY HOLD: preserve complete measured silhouette');
        return held;
      }
      if((policy.source==='PAGE-PARTITION'||(policy.source==='CLOSED-FRAME'&&
          panel?._closedFrameProof?.gutterProof?.method==='exterior-dark-component')) && typeof PanelGeometrySkewed!=='undefined'){
        const ownership=PanelGeometrySkewed.classifyQuad(held,log);
        held._frameOwnership=ownership;
        held._geometryOwner=ownership.owns?'skewed-frame':'orthogonal-frame';
        if(log)log(`PARTITION AUTHORITY HOLD owner=${held._geometryOwner}`);
        return held;
      }
      if(log)log(`ORTHOGONAL AUTHORITY HOLD source=${policy.source} reason=${policy.reason}`);
      if(log)log('ROUTER -> ORTHOGONAL AUTHORITY');
      return held;
    }

    if(log)log(`FRAME OWNERSHIP ELIGIBLE source=${policy.source} mode=${policy.mode}${policy.area?` area=${policy.area.toFixed(3)}`:''}`);

    if (imgUrl && typeof PanelFrameEnvelope !== 'undefined' && PanelFrameEnvelope.detect) {
      const frameSeed=policy.mode==='inspect'
        ? {...panel,x:.011,y:.013,w:.954,h:.957,_tap:panel._tap,_ownershipProbe:true,
            _identitySeed:{x:panel.x,y:panel.y,w:panel.w,h:panel.h},_edgeClippedSeed:!!policy.edgeClipped}
        : {...panel,_structuralCompositeSeed:policy.source==='V100',_edgeClippedSeed:!!policy.edgeClipped};
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
        const frameRatio=envelopeArea/seedArea;
        const e=envelope._frameEnvelope||{};
        const xs=envelope._quad.map(p=>p.x),ys=envelope._quad.map(p=>p.y);
        const spanX=Math.max(...xs)-Math.min(...xs),spanY=Math.max(...ys)-Math.min(...ys);
        const pagePerimeter=(spanX>=.80||spanY>=.80)&&
          (Math.min(...xs)<=.08||Math.max(...xs)>=.92||Math.min(...ys)<=.08||Math.max(...ys)>=.92);
        const perimeterCorrection=pagePerimeter&&(e.seedConsensus||0)>=3&&
          (e.weakestAdj||0)>=.12&&(e.relativeAdjScore||0)>=.90&&(e.minThickness||0)>=.66;
        const strongCorrection=(e.weakestAdj||0)>=.30&&(e.relativeAdjScore||0)>=.80&&(e.minThickness||0)>=.66;
        const expansion=policy.mode==='inspect'&&(
          (frameRatio>2.0&&(policy.source!=='V100'||strongCorrection||perimeterCorrection))||
          (policy.edgeClipped&&frameRatio>1.15&&(strongCorrection||perimeterCorrection))
        );
        const provenSplit=policy.mode==='inspect'&&frameRatio<.78&&envelopeArea>=.025&&strongCorrection;
        const edgeRealign=policy.mode==='inspect'&&policy.edgeClipped&&frameRatio>=.80&&frameRatio<=1.15&&
          (strongCorrection||perimeterCorrection);
        const localIdentityRealign=policy.mode==='inspect'&&/^identity-local-/.test(String(e.seedSource||''))&&
          frameRatio>=.75&&frameRatio<=1.85&&(e.adjacencyScore||0)>=.14&&(e.relativeAdjScore||0)>=.80&&
          (e.minThickness||0)>=.72&&(policy.edgeClipped||frameRatio>1.12);
        const identityCorrection=expansion||provenSplit||edgeRealign||localIdentityRealign;
        if(policy.mode==='inspect'&&!identityCorrection){
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
        if(log)log(`ROUTER -> ORTHOGONAL FRAME (${expansion?'fragment seed expanded':provenSplit?'composite seed split':edgeRealign?'page-edge realigned':localIdentityRealign?'local identity realigned':'proven frame'})`);
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
