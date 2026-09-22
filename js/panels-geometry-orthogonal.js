// NTH SHELF V2.78.10 — ORTHOGONAL PANEL GEOMETRY
// Conservative rectangle/near-rectangle geometry. Unproven legacy seeds remain
// rectangles. A connected four-rail proof keeps its exact vertices even when
// its angle classification is orthogonal: a label must not expand the crop.

const PanelGeometryOrthogonal = {
  _provenContours(panel) {
    if(panel?._identitySource==='matte-cell-frame')return typeof PanelMatteCells!=='undefined'&&PanelMatteCells.validPanel(panel)?panel._contours.map(r=>r.map(p=>({x:p.x,y:p.y}))):null;
    if(panel?._identitySource==='curved-rim-frame')return typeof PanelCurvedRims!=='undefined'&&PanelCurvedRims.validPanel(panel)?panel._contours.map(r=>r.map(p=>({x:p.x,y:p.y}))):null;
    if(panel?._identitySource==='inset-neighbor-frame')return typeof PanelInsetNeighbors!=='undefined'&&PanelInsetNeighbors.validPanel(panel)?panel._contours.map(r=>r.map(p=>({x:p.x,y:p.y}))):null;
    if(panel?._identitySource==='rim-frame')return typeof PanelRimFrames!=='undefined'&&PanelRimFrames.validPanel(panel)?panel._contours.map(r=>r.map(p=>({x:p.x,y:p.y}))):null;
    return panel?._contours&&typeof PanelCompositeFrames!=='undefined'&&PanelCompositeFrames.validPanel(panel)
      ?panel._contours.map(ring=>ring.map(p=>({x:p.x,y:p.y}))):null;
  },

  _provenQuad(panel) {
    if(['matte-cell-frame','curved-rim-frame','inset-neighbor-frame','rim-frame','terraced-frame','local-island-frame','matte-neighbor-frame','bordered-inset-frame','sloping-edge-frame','corner-rim-frame','terminal-rim-frame'].includes(panel?._identitySource))return null;
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


  _validMatteOutlineProof(panel) {
    const p=panel?._matteOutlineProof,q=panel?._outline;
    if(p?.version!==1||p.connected!==true||p.method!=='paired-exterior-matte-components'||
       !Array.isArray(q)||q.length<4||q.length>64||
       q.some(v=>!Number.isFinite(v?.x)||!Number.isFinite(v?.y)||v.x<0||v.x>1||v.y<0||v.y>1))return false;
    const W=p.analysisWidth,H=p.analysisHeight,within=(n,a,b)=>Number.isFinite(n)&&n>=a&&n<=b;
    if(!Number.isInteger(W)||!Number.isInteger(H)||!within(W,80,900)||!within(H,80,900)||
       ![0,1].includes(p.pairIndex)||p.sourceEdge!==(p.pairIndex===0?'left':'right')||
       !Array.isArray(p.color)||p.color.length!==3||p.color.some(v=>!Number.isInteger(v)||!within(v,0,255))||
       p.color[0]*.299+p.color[1]*.587+p.color[2]*.114>=35||
       !Number.isInteger(p.componentPixels)||p.componentPixels<W*H*.02||
       !within(p.envelopeArea,W*H*.02,W*H*.5)||!within(p.componentAreaRatio,.72,1.001)||
       Math.abs(p.componentPixels/p.envelopeArea-p.componentAreaRatio)>1e-10||
       !within(p.interiorMatteRatio,0,.28)||p.lostPixels!==0||p.foreignLargePixels!==0)return false;
    const d=p.sharedDivider,line=(f,min)=>f&&within(f.m,-.12,.12)&&Number.isFinite(f.b)&&
      within(f.support,min,1)&&within(f.residual,0,1.15);
    if(d?.axis!=='vertical'||!line(d.left,.60)||!line(d.right,.60)||
       Math.abs(d.left.m-d.right.m)>.012||!within(d.exteriorSupport,.98,1)||
       !Array.isArray(d.span)||d.span.length!==2||!within(d.span[0],0,H)||!within(d.span[1],0,H)||
       d.span[1]-d.span[0]<H*.085||!Array.isArray(d.gap)||d.gap.length!==2||
       d.gap.some((gap,i)=>!within(gap,3,12)||
         Math.abs(gap-((d.right.b-d.left.b)+(d.right.m-d.left.m)*d.span[i]))>1e-8)||
       !Array.isArray(p.horizontalSides)||p.horizontalSides.length!==2||
       p.horizontalSides.some(f=>!line(f,.72)))return false;
    const a=p.attachment,unitQuad=a?.anchorQuad;
    if(!['top','bottom'].includes(a?.side)||!Array.isArray(unitQuad)||unitQuad.length!==4||
       unitQuad.some(v=>!within(v?.x,0,1)||!within(v?.y,0,1))||
       !Array.isArray(a.coverages)||a.coverages.length!==2||a.coverages.some(v=>!within(v,.75,1))||
       !Array.isArray(a.supports)||a.supports.length!==2||a.supports.some(v=>!within(v,.975,1))||
       !Array.isArray(a.separations)||a.separations.length!==2||a.separations.some(pair=>
         !Array.isArray(pair)||pair.length!==2||pair.some(v=>!within(v,2,14))))return false;
    const cross=(a,b,c)=>(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);
    if(unitQuad.some((v,i)=>cross(v,unitQuad[(i+1)%4],unitQuad[(i+2)%4])<=0)||
       q.some((v,i)=>cross(v,q[(i+1)%q.length],q[(i+2)%q.length])<=0))return false;
    const minX=Math.min(...q.map(v=>v.x)),maxX=Math.max(...q.map(v=>v.x));
    const minY=Math.min(...q.map(v=>v.y)),maxY=Math.max(...q.map(v=>v.y));
    if(['x','y','w','h'].some(k=>!Number.isFinite(panel[k]))||
       Math.max(Math.abs(panel.x-minX),Math.abs(panel.y-minY),Math.abs(panel.w-(maxX-minX)),Math.abs(panel.h-(maxY-minY)))>1e-8||
       (p.pairIndex===0?minX*W>2:maxX*W<W-2))return false;
    const area=Math.abs(q.reduce((sum,v,i)=>sum+v.x*q[(i+1)%q.length].y-v.y*q[(i+1)%q.length].x,0))/2*W*H;
    if(Math.abs(area-p.envelopeArea)>1e-5)return false;
    const mid={m:(d.left.m+d.right.m)/2,b:(d.left.b+d.right.b)/2};
    if(q.some(v=>p.pairIndex===0?v.x*W>mid.b+mid.m*v.y*H-.25:v.x*W<mid.b+mid.m*v.y*H+.25))return false;
    if(a.side==='bottom'?Math.min(...unitQuad.map(v=>v.y))*H<maxY*H-2:
                         Math.max(...unitQuad.map(v=>v.y))*H>minY*H+2)return false;
    return true;
  },

  _provenOutline(panel) {
    if(panel?._identitySource==='terminal-rim-frame')return typeof PanelTerminalFrames!=='undefined'&&PanelTerminalFrames.validPanel(panel)?panel._outline.map(p=>({x:p.x,y:p.y})):null;
    if(panel?._identitySource==='corner-rim-frame')return typeof PanelCornerFrames!=='undefined'&&PanelCornerFrames.validPanel(panel)?panel._outline.map(p=>({x:p.x,y:p.y})):null;
    if(panel?._identitySource==='sloping-edge-frame'&&!(typeof PanelEdgeCells!=='undefined'&&PanelEdgeCells.validPanel(panel)))return null;
    if(['matte-cell-frame','curved-rim-frame','inset-neighbor-frame'].includes(panel?._identitySource))return null;
    if(panel?._identitySource==='bordered-inset-frame'&&!(typeof PanelFramedInsets!=='undefined'&&PanelFramedInsets.validPanel(panel)))return null;
    if(panel?._identitySource==='matte-neighbor-frame'&&!(typeof PanelLocalIslands!=='undefined'&&PanelLocalIslands.validNeighbor?.(panel)))return null;
    if(panel?._identitySource==='local-island-frame'&&!(typeof PanelLocalIslands!=='undefined'&&PanelLocalIslands.validPanel(panel)))return null;
    if(panel?._identitySource==='terraced-frame'&&!(typeof PanelTerracedFrames!=='undefined'&&PanelTerracedFrames.validPanel(panel)))return null;
    if(panel?._identitySource==='rim-frame')return null;
    if(panel?._identitySource==='bleed-strip-frame'&&
       !(typeof PanelAbuttingFrames!=='undefined'&&PanelAbuttingFrames.validBleedStrip?.(panel)))return null;
    const q=panel?._outline, overlap=panel?._overlapProof, occlusion=panel?._occlusionProof;
    const inset=overlap?.version===1&&overlap.connected===true&&overlap.method==='paired-edge-insets';
    const balloon=occlusion?.version===1&&occlusion.connected===true&&
      occlusion.method==='text-balloon-collinear-divider'&&panel?._partitionProof?.occlusionRefinement===true;
    const matte=this._validMatteOutlineProof(panel);
    const abutment=typeof PanelAbuttingFrames!=='undefined'&&(PanelAbuttingFrames.validPanel(panel)||PanelAbuttingFrames.validBleedStrip?.(panel));
    const terraced=typeof PanelTerracedFrames!=='undefined'&&PanelTerracedFrames.validPanel(panel);
    const edgeCell=typeof PanelEdgeCells!=='undefined'&&PanelEdgeCells.validPanel(panel);
    const framedInset=typeof PanelFramedInsets!=='undefined'&&PanelFramedInsets.validPanel(panel);
    const islands=typeof PanelLocalIslands!=='undefined'&&(PanelLocalIslands.validPanel(panel)||PanelLocalIslands.validNeighbor?.(panel));
    if((!inset&&!balloon&&!matte&&!abutment&&!terraced&&!islands&&!framedInset&&!edgeCell)||
       !Array.isArray(q)||q.length<4||q.length>(balloon?128:(matte||islands||framedInset||edgeCell)?64:20)||
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
    const contours=this._provenContours(panel);
    if(contours)out._contours=contours;else delete out._contours;
    if (log) log(`ORTHOGONAL geometry x=${x.toFixed(4)} y=${y.toFixed(4)} w=${w.toFixed(4)} h=${h.toFixed(4)}`);
    return out;
  }
};
