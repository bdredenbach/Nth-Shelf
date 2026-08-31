// NTH SHELF V92 — V91 BASELINE / PANEL INTERIOR VALIDATION
// V73 remains authoritative whenever it contains the tap.
// V92 keeps the V91 boundary-set + iterative internal-gutter path, then adds
// a conservative interior validation gate. A fallback result is rejected if
// a strong, sustained internal gutter still cuts through its interior.
// No smallest/largest rule and no recovery pass.

const PanelDetect = {
  detect(imgUrl, log) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        try { resolve(this._analyze(img, log)); }
        catch (err) {
          console.warn("Panel detection failed:", err);
          if (log) log(`ERROR: ${err.message}`);
          resolve([]);
        }
      };
      img.onerror = () => resolve([]);
      img.src = imgUrl;
    });
  },

  // V99 fallback: V91 coherent boundary SET plus internal-gutter refinement. A boundary is
  // not selected because it is merely nearest, smallest, or largest. Each
  // side is scored for continuity and edge support, then opposite/adjacent
  // boundaries are paired only when their support spans are mutually
  // compatible and the resulting region contains the tap.
  detectTapLocalFallback(imgUrl, relX, relY, log) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        try { resolve(this._analyzeFrankenstein(img, relX, relY, log)); }
        catch (err) {
          console.warn("V102 Frankenstein failed:", err);
          if (log) log(`V102 Frankenstein ERROR: ${err.message}`);
          // V99 remains the safety fallback for this one-off experiment.
          try { resolve(this._analyzeBoundarySet(img, relX, relY, log)); }
          catch (fallbackErr) {
            console.warn("V99 fallback failed after V102 error:", fallbackErr);
            resolve(null);
          }
        }
      };
      img.onerror = () => resolve(null);
      img.src = imgUrl;
    });
  },

  // V102 ONE-OFF FRANKENSTEIN RESEARCH HYBRID.
  // Combines V99 with region/barrier reasoning, panel-outline evidence,
  // recursive region splitting, contour-style recovery, and neighboring-panel
  // context. This is intentionally a standalone experiment; V99 remains the
  // fallback if the hybrid cannot produce a confident candidate.
  _analyzeFrankenstein(img, relX, relY, log) {
    const v99 = this._analyzeBoundarySet(img, relX, relY, log);
    const maxDim = 900;
    const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
    const w = Math.max(1, Math.round(img.width * scale));
    const h = Math.max(1, Math.round(img.height * scale));
    const tx = clamp01(relX) * (w - 1);
    const ty = clamp01(relY) * (h - 1);

    const canvas = document.createElement("canvas");
    canvas.width=w; canvas.height=h;
    const ctx=canvas.getContext("2d",{willReadFrequently:true});
    ctx.drawImage(img,0,0,w,h);
    const data=ctx.getImageData(0,0,w,h).data;
    const lum=new Float32Array(w*h);
    for(let y=0;y<h;y++) for(let x=0;x<w;x++){
      const i=(y*w+x)*4;
      lum[y*w+x]=0.299*data[i]+0.587*data[i+1]+0.114*data[i+2];
    }

    const sample=[];
    const step=Math.max(1,Math.floor(Math.max(w,h)/180));
    for(let y=1;y<h-1;y+=step) for(let x=1;x<w-1;x+=step){
      sample.push(
        Math.abs(lum[y*w+x]-lum[(y-1)*w+x])+
        Math.abs(lum[(y+1)*w+x]-lum[y*w+x])+
        Math.abs(lum[y*w+x]-lum[y*w+x-1])+
        Math.abs(lum[y*w+x+1]-lum[y*w+x])
      );
    }
    sample.sort((a,b)=>a-b);
    const med=sample.length?sample[Math.floor(sample.length*.5)]:0;
    const edgeCut=Math.max(9,med*2.5);
    const quietCut=Math.max(2.5,edgeCut*.44);

    const blackH=this._findBlackFirstBoundaries(lum,w,h,tx,ty,"H");
    const blackV=this._findBlackFirstBoundaries(lum,w,h,tx,ty,"V");
    const greyH=this._findHorizontalBoundaries(lum,w,h,tx,ty,edgeCut,quietCut);
    const greyV=this._findVerticalBoundaries(lum,w,h,tx,ty,edgeCut,quietCut);
    this._confirmBlackWithGrey(blackH,greyH,"H",w,h);
    this._confirmBlackWithGrey(blackV,greyV,"V",w,h);
    const hCandidates=blackH.concat(greyH);
    const vCandidates=blackV.concat(greyV);

    const candidates=[];
    if(v99){
      candidates.push({...v99,_v102Source:"V99"});
      const split=this._v102RecursiveRegionSplit(lum,w,h,tx,ty,v99,edgeCut,quietCut,log);
      if(split) candidates.push({...split,_v102Source:"V102-recursive-from-V99"});
    }

    const region=this._v102FloodPanelRegion(lum,w,h,tx,ty,hCandidates,vCandidates,edgeCut,quietCut);
    if(region){
      candidates.push({...region,_v102Source:"V102-region"});
      const recovered=this._v102RecoverContourRegion(region,hCandidates,vCandidates,w,h);
      if(recovered) candidates.push({...recovered,_v102Source:"V102-contour-recovery"});
      const split=this._v102RecursiveRegionSplit(lum,w,h,tx,ty,region,edgeCut,quietCut,log);
      if(split) candidates.push({...split,_v102Source:"V102-recursive-region"});
      if(split){
        const splitRecovered=this._v102RecoverContourRegion(split,hCandidates,vCandidates,w,h);
        if(splitRecovered) candidates.push({...splitRecovered,_v102Source:"V102-recursive-contour"});
      }
    }

    // Add candidate rectangles from coherent combinations of the strongest
    // black/grey boundaries. This is V99's boundary language feeding the new
    // region/context scorer instead of being the only decision mechanism.
    const top=hCandidates.filter(c=>c.pos<ty).sort((a,b)=>Math.abs(ty-a.pos)-Math.abs(ty-b.pos)).slice(0,6);
    const bottom=hCandidates.filter(c=>c.pos>ty).sort((a,b)=>Math.abs(ty-a.pos)-Math.abs(ty-b.pos)).slice(0,6);
    const left=vCandidates.filter(c=>c.pos<tx).sort((a,b)=>Math.abs(tx-a.pos)-Math.abs(tx-b.pos)).slice(0,6);
    const right=vCandidates.filter(c=>c.pos>tx).sort((a,b)=>Math.abs(tx-a.pos)-Math.abs(tx-b.pos)).slice(0,6);
    top.unshift({pos:0,edge:true,quality:0,span:[0,w-1]});
    bottom.unshift({pos:h-1,edge:true,quality:0,span:[0,w-1]});
    left.unshift({pos:0,edge:true,quality:0,span:[0,h-1]});
    right.unshift({pos:w-1,edge:true,quality:0,span:[0,h-1]});
    for(const T of top) for(const B of bottom) for(const L of left) for(const R of right){
      const pw=R.pos-L.pos, ph=B.pos-T.pos;
      if(pw<=w*.05||ph<=h*.05) continue;
      if(!(tx>=L.pos&&tx<=R.pos&&ty>=T.pos&&ty<=B.pos)) continue;
      const hs=[T,B].filter(c=>!c.edge),vs=[L,R].filter(c=>!c.edge);
      if(hs.length+vs.length<2) continue;
      const hOverlap=boundarySpanOverlap(T,B,w),vOverlap=boundarySpanOverlap(L,R,h);
      const hNeed=Math.max(w*.12,pw*.25),vNeed=Math.max(h*.12,ph*.25);
      const hCov=Math.min(T.edge?1:intervalCoverage(T.span,L.pos,R.pos)/Math.max(1,pw),B.edge?1:intervalCoverage(B.span,L.pos,R.pos)/Math.max(1,pw));
      const vCov=Math.min(L.edge?1:intervalCoverage(L.span,T.pos,B.pos)/Math.max(1,ph),R.edge?1:intervalCoverage(R.span,T.pos,B.pos)/Math.max(1,ph));
      if(hCov<.36||vCov<.36) continue;
      candidates.push({
        x:L.pos/w,y:T.pos/h,w:pw/w,h:ph/h,
        _v102Source:"V102-outline-combination",
        _v102Sides:hs.length+vs.length,
        _v102Outline:{T,B,L,R,hOverlap,vOverlap,hCov,vCov}
      });
    }

    const scored=[];
    for(const c of candidates){
      const x0=Math.max(1,Math.round(c.x*w)), y0=Math.max(1,Math.round(c.y*h));
      const x1=Math.min(w-2,Math.round((c.x+c.w)*w)), y1=Math.min(h-2,Math.round((c.y+c.h)*h));
      if(x1<=x0||y1<=y0) continue;
      if(!(tx>=x0&&tx<=x1&&ty>=y0&&ty<=y1)) continue;

      const regionStats=this._v102RegionStats(lum,w,h,x0,y0,x1,y1,tx,ty,edgeCut,quietCut);
      const outline=this._v102OutlineScore(c,hCandidates,vCandidates,x0,y0,x1,y1,w,h);
      const splitInfo=this._v102InternalSeparatorScore(lum,w,h,x0,y0,x1,y1,tx,ty,edgeCut,quietCut);
      const context=this._v102NeighborContext(lum,w,h,x0,y0,x1,y1,tx,ty,edgeCut,quietCut);

      // Frankenstein score: no single signal is sovereign. V99 evidence,
      // region enclosure, outline/T-junction evidence, recursive separator
      // behavior, contour recovery, and neighbor context all contribute.
      let score=0;
      if(c._v102Source==="V99") score+=2.2;
      if(c._v102Source && c._v102Source.includes("contour")) score+=1.0;
      score += regionStats.enclosure*2.25;
      score += regionStats.content*0.55;
      score += outline.score*1.45;
      score += splitInfo.complete*1.25;
      score += context.context*1.10;
      score -= splitInfo.badInternal*1.80;
      score -= context.neighborPenalty*1.15;
      score += Math.min(1,regionStats.areaRatio/.10)*0.35;
      // Tighter is only a weak preference, never a hard size rule.
      score -= Math.max(0,Math.min(.45,(c.w*c.h)-.48))*.20;

      scored.push({c,score,regionStats,outline,splitInfo,context});
    }

    if(!scored.length) return v99||null;
    scored.sort((a,b)=>b.score-a.score);
    const best=scored[0];
    if(log){
      log(`V102 Frankenstein candidates=${scored.length} winner=${best.c._v102Source} score=${best.score.toFixed(2)} enclosure=${best.regionStats.enclosure.toFixed(2)} outline=${best.outline.score.toFixed(2)} internal=${best.splitInfo.complete.toFixed(2)} context=${best.context.context.toFixed(2)}`);
      log(`V102 runnerUp=${scored[1]?scored[1].c._v102Source:"none"} score=${scored[1]?scored[1].score.toFixed(2):"-"}`);
    }

    // Safety: if the Frankenstein winner is substantially less supported than
    // V99, keep V99. This makes the one-off experiment additive rather than a
    // blind replacement of the proven baseline.
    if(v99){
      const v99Score=scored.find(s=>s.c._v102Source==="V99");
      if(v99Score && best!==v99Score && best.score < v99Score.score + 0.65) {
        return {...v99,_v102Source:"V99-safety-winner"};
      }
    }
    const result={x:best.c.x,y:best.c.y,w:best.c.w,h:best.c.h,
      _v102Frankenstein:true,_v102Source:best.c._v102Source,
      _v102Score:best.score,_v102Enclosure:best.regionStats.enclosure};
    return result;
  },

  _v102FloodPanelRegion(lum,w,h,tx,ty,hCandidates,vCandidates,edgeCut,quietCut){
    const startX=Math.max(0,Math.min(w-1,Math.round(tx))), startY=Math.max(0,Math.min(h-1,Math.round(ty)));
    const maxCells=w*h;
    const seen=new Uint8Array(maxCells);
    const qx=new Int32Array(maxCells), qy=new Int32Array(maxCells);
    let head=0,tail=0; qx[tail]=startX;qy[tail]=startY;tail++;
    let minX=startX,maxX=startX,minY=startY,maxY=startY,count=0;
    const hBar=hCandidates.filter(c=>Number.isFinite(c.pos));
    const vBar=vCandidates.filter(c=>Number.isFinite(c.pos));
    // Compile candidate barriers once so the flood fill is O(1) per crossing.
    const hMask=new Uint8Array(w*h);
    const vMask=new Uint8Array(w*h);
    for(const c of hBar){
      const y=Math.max(0,Math.min(h-1,Math.round(c.pos)));
      const sp=c.span||[0,w-1];
      const a=Math.max(0,Math.floor(sp[0]-2)), b=Math.min(w-1,Math.ceil(sp[1]+2));
      for(let x=a;x<=b;x++) hMask[y*w+x]=1;
      if(y>0) for(let x=a;x<=b;x++) hMask[(y-1)*w+x]=1;
    }
    for(const c of vBar){
      const x=Math.max(0,Math.min(w-1,Math.round(c.pos)));
      const sp=c.span||[0,h-1];
      const a=Math.max(0,Math.floor(sp[0]-2)), b=Math.min(h-1,Math.ceil(sp[1]+2));
      for(let y=a;y<=b;y++) vMask[y*w+x]=1;
      if(x>0) for(let y=a;y<=b;y++) vMask[y*w+x-1]=1;
    }
    const crossed=(x,y,nx,ny)=>{
      if(nx!==x){
        const xx=Math.min(x,nx);
        return !!vMask[y*w+xx];
      }
      if(ny!==y){
        const yy=Math.min(y,ny);
        return !!hMask[yy*w+x];
      }
      return false;
    };
    seen[startY*w+startX]=1;
    while(head<tail && count<Math.min(maxCells,450000)){
      const x=qx[head],y=qy[head];head++;count++;
      if(x<minX)minX=x;if(x>maxX)maxX=x;if(y<minY)minY=y;if(y>maxY)maxY=y;
      const dirs=[[1,0],[-1,0],[0,1],[0,-1]];
      for(const [dx,dy] of dirs){
        const nx=x+dx,ny=y+dy;
        if(nx<1||nx>=w-1||ny<1||ny>=h-1) continue;
        if(crossed(x,y,nx,ny)) continue;
        const ni=ny*w+nx;if(seen[ni])continue;
        // Keep ordinary high-contrast artwork traversable. The barrier lists
        // above are what define panel separators in this experiment.
        seen[ni]=1;qx[tail]=nx;qy[tail]=ny;tail++;
      }
    }
    const area=count/(w*h);
    if(area<.018||area>.94) return null;
    const bw=Math.max(1,maxX-minX+1), bh=Math.max(1,maxY-minY+1);
    const bboxArea=bw*bh;
    const fill=count/Math.max(1,bboxArea);
    if(fill<.18) return null;
    return {x:minX/w,y:minY/h,w:bw/w,h:bh/h,_v102RegionCount:count,_v102Fill:fill};
  },

  _v102RegionStats(lum,w,h,x0,y0,x1,y1,tx,ty,edgeCut,quietCut){
    const bw=Math.max(1,x1-x0+1),bh=Math.max(1,y1-y0+1);
    const areaRatio=(bw*bh)/(w*h);
    let dark=0,edge=0,quiet=0,samples=0;
    const step=Math.max(1,Math.round(Math.min(bw,bh)/80));
    for(let y=y0;y<=y1;y+=step) for(let x=x0;x<=x1;x+=step){
      const v=lum[y*w+x];samples++;if(v<80)dark++;
      const g=Math.abs(lum[y*w+x]-lum[(Math.max(0,y-1))*w+x])+Math.abs(lum[y*w+x]-lum[y*w+Math.max(0,x-1)]);
      if(g>edgeCut)edge++;if(g<=quietCut)quiet++;
    }
    const borderH=[];
    for(let y=Math.max(1,y0);y<=Math.min(h-2,y1);y++){
      let q=0;for(let x=x0;x<=x1;x+=step){const g=Math.abs(lum[y*w+x]-lum[(y-1)*w+x])+Math.abs(lum[(y+1)*w+x]-lum[y*w+x]);if(g<=quietCut)q++;}
      borderH.push(q/Math.max(1,Math.ceil((x1-x0+1)/step)));
    }
    const borderV=[];
    for(let x=Math.max(1,x0);x<=Math.min(w-2,x1);x++){
      let q=0;for(let y=y0;y<=y1;y+=step){const g=Math.abs(lum[y*w+x]-lum[y*w+x-1])+Math.abs(lum[y*w+x+1]-lum[y*w+x]);if(g<=quietCut)q++;}
      borderV.push(q/Math.max(1,Math.ceil((y1-y0+1)/step)));
    }
    const topQ=borderH.length?Math.max(...borderH.slice(0,Math.max(1,Math.floor(borderH.length*.12)))):0;
    const botQ=borderH.length?Math.max(...borderH.slice(Math.floor(borderH.length*.88))):0;
    const leftQ=borderV.length?Math.max(...borderV.slice(0,Math.max(1,Math.floor(borderV.length*.12)))):0;
    const rightQ=borderV.length?Math.max(...borderV.slice(Math.floor(borderV.length*.88))):0;
    const enclosure=(topQ+botQ+leftQ+rightQ)/4;
    return {areaRatio,content:Math.min(1,dark/Math.max(1,samples)),edgeDensity:edge/Math.max(1,samples),quietDensity:quiet/Math.max(1,samples),enclosure};
  },

  _v102OutlineScore(c,hCandidates,vCandidates,x0,y0,x1,y1,w,h){
    const tol=Math.max(5,Math.min(18,Math.round(Math.min(w,h)*.025)));
    const sides=[
      ["T",hCandidates,y0,"H",x0,x1], ["B",hCandidates,y1,"H",x0,x1],
      ["L",vCandidates,x0,"V",y0,y1], ["R",vCandidates,x1,"V",y0,y1]
    ];
    let strong=0,coverage=0,tj=0;
    for(const [name,list,pos,axis,a,b] of sides){
      let best=null;
      for(const c of list){
        if(Math.abs(c.pos-pos)>tol)continue;
        const sp=c.span||[0,(axis==="H"?w-1:h-1)];
        const ov=Math.max(0,Math.min(b,sp[1])-Math.max(a,sp[0])+1)/Math.max(1,b-a+1);
        const s=(c.quality||0)*.55+ov*.95+(c.greyConfirmed?.25:0);
        if(!best||s>best.s)best={c,s,ov};
      }
      if(best){strong++;coverage+=best.ov;}
    }
    // T-junction/corner evidence: a horizontal and vertical candidate meeting
    // near the same corner is stronger evidence of an actual panel outline.
    const near=(a,b)=>Math.abs(a-b)<=tol*1.4;
    for(const hy of [y0,y1]) for(const vx of [x0,x1]){
      const hh=hCandidates.some(c=>Math.abs(c.pos-hy)<=tol && intervalCoverage(c.span||[0,w-1],vx-20,vx+20)>8);
      const vv=vCandidates.some(c=>Math.abs(c.pos-vx)<=tol && intervalCoverage(c.span||[0,h-1],hy-20,hy+20)>8);
      if(hh&&vv)tj++;
    }
    const score=(strong/4)*.58+(coverage/4)*.25+Math.min(1,tj/4)*.17;
    return {score,strong,coverage:coverage/4,tj};
  },

  _v102InternalSeparatorScore(lum,w,h,x0,y0,x1,y1,tx,ty,edgeCut,quietCut){
    const p={x:x0/w,y:y0/h,w:(x1-x0)/w,h:(y1-y0)/h};
    const split=this._splitAtInternalGuttersOnce(lum,w,h,tx,ty,p,edgeCut,quietCut,null);
    if(!split) return {complete:1,badInternal:0};
    const nx=Math.round(split.w*w),ny=Math.round(split.h*h);
    const original=(x1-x0)*(y1-y0),child=Math.max(1,nx*ny);
    const reduction=1-child/Math.max(1,original);
    // If the splitter finds a strong separator and the tap lies on one side,
    // the child is preferred; otherwise a separator that leaves a huge merged
    // region is treated as unresolved context.
    return {complete:Math.min(1,.35+reduction),badInternal:reduction>.12?0:.35};
  },

  _v102RecursiveRegionSplit(lum,w,h,tx,ty,p,edgeCut,quietCut,log){
    let cur={...p}; let changed=false;
    for(let i=0;i<3;i++){
      const next=this._splitAtInternalGuttersOnce(lum,w,h,tx,ty,cur,edgeCut,quietCut,null);
      if(!next)break;
      cur=next;changed=true;
    }
    if(!changed)return null;
    cur._v102Recursive=true;
    return cur;
  },

  _v102RecoverContourRegion(p,hCandidates,vCandidates,w,h){
    const x0=p.x*w,y0=p.y*h,x1=(p.x+p.w)*w,y1=(p.y+p.h)*h;
    const padX=Math.max(4,w*.012),padY=Math.max(4,h*.012);
    const nearH=(pos,lo,hi)=>hCandidates.filter(c=>Math.abs(c.pos-pos)<=Math.max(8,h*.018)&&intervalCoverage(c.span||[0,w-1],lo,hi)>(hi-lo)*.42).sort((a,b)=>(b.quality||0)-(a.quality||0))[0];
    const nearV=(pos,lo,hi)=>vCandidates.filter(c=>Math.abs(c.pos-pos)<=Math.max(8,w*.018)&&intervalCoverage(c.span||[0,h-1],lo,hi)>(hi-lo)*.42).sort((a,b)=>(b.quality||0)-(a.quality||0))[0];
    const T=nearH(y0,x0,x1),B=nearH(y1,x0,x1),L=nearV(x0,y0,y1),R=nearV(x1,y0,y1);
    let nx0=x0,ny0=y0,nx1=x1,ny1=y1;
    if(T&&T.pos<ny0)ny0=T.pos;if(B&&B.pos>ny1)ny1=B.pos;if(L&&L.pos<nx0)nx0=L.pos;if(R&&R.pos>nx1)nx1=R.pos;
    if(nx1<=nx0||ny1<=ny0)return null;
    const changed=Math.abs(nx0-x0)+Math.abs(ny0-y0)+Math.abs(nx1-x1)+Math.abs(ny1-y1);
    if(changed<3)return null;
    return {x:nx0/w,y:ny0/h,w:(nx1-nx0)/w,h:(ny1-ny0)/h,_v102ContourRecovered:true};
  },

  _v102NeighborContext(lum,w,h,x0,y0,x1,y1,tx,ty,edgeCut,quietCut){
    // Compare the immediate outside bands with the inside. A real frame should
    // look more separator-like at the candidate boundary than in its interior.
    const bandX=Math.max(4,Math.round((x1-x0)*.035)),bandY=Math.max(4,Math.round((y1-y0)*.035));
    let outside=0,inside=0,n=0;
    const sampleBand=(xa,ya,xb,yb,target)=>{
      for(let y=Math.max(1,ya);y<=Math.min(h-2,yb);y+=2) for(let x=Math.max(1,xa);x<=Math.min(w-2,xb);x+=2){
        const g=Math.abs(lum[y*w+x]-lum[y*w+x-1])+Math.abs(lum[y*w+x]-lum[y*w+x+1])+Math.abs(lum[y*w+x]-lum[(y-1)*w+x])+Math.abs(lum[(y+1)*w+x]-lum[y*w+x]);
        if(target===0)outside+=g;else inside+=g;n++;
      }
    };
    sampleBand(x0-bandX,y0-bandY,x1+bandX,y0+bandY,0);
    sampleBand(x0+bandX,y0+bandY,x1-bandX,y1-bandY,1);
    const per=Math.max(1,n);
    const ratio=Math.min(2,outside/per)/Math.max(1,inside/per);
    // Look for a strong internal separator. If present, neighboring context
    // says the candidate may actually contain more than one panel.
    let internal=0;
    const spanW=Math.max(1,x1-x0),spanH=Math.max(1,y1-y0);
    for(let y=y0+Math.round(spanH*.15);y<y1-spanH*.15;y+=Math.max(2,Math.round(spanH*.03))){
      let quiet=0,total=0;for(let x=x0+Math.round(spanW*.1);x<x1-spanW*.1;x+=2){const g=Math.abs(lum[y*w+x]-lum[(y-1)*w+x])+Math.abs(lum[(y+1)*w+x]-lum[y*w+x]);if(g<=quietCut)quiet++;total++;}
      if(total&&quiet/total>.78)internal=Math.max(internal,quiet/total);
    }
    for(let x=x0+Math.round(spanW*.15);x<x1-spanW*.15;x+=Math.max(2,Math.round(spanW*.03))){
      let quiet=0,total=0;for(let y=y0+Math.round(spanH*.1);y<y1-spanH*.1;y+=2){const g=Math.abs(lum[y*w+x]-lum[y*w+x-1])+Math.abs(lum[y*w+x+1]-lum[y*w+x]);if(g<=quietCut)quiet++;total++;}
      if(total&&quiet/total>.78)internal=Math.max(internal,quiet/total);
    }
    return {context:Math.min(1,Math.max(0,(ratio-.7))),neighborPenalty:internal>.84?internal:0};
  },

  _analyzeBoundarySet(img, relX, relY, log) {
    const maxDim = 900;
    const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
    const w = Math.max(1, Math.round(img.width * scale));
    const h = Math.max(1, Math.round(img.height * scale));
    const tx = clamp01(relX) * (w - 1);
    const ty = clamp01(relY) * (h - 1);

    if (log) log(`V92 boundary-set source=${img.width}x${img.height} downscaled=${w}x${h} tap=${Math.round(tx)},${Math.round(ty)}`);

    const canvas = document.createElement("canvas");
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(img, 0, 0, w, h);
    const data = ctx.getImageData(0, 0, w, h).data;
    const lum = new Float32Array(w * h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      lum[y * w + x] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    }

    // Robust global scale. This is deliberately only used to normalize
    // boundary evidence; it does not choose a panel by itself.
    const sample = [];
    const step = Math.max(1, Math.floor(Math.max(w, h) / 180));
    for (let y = 1; y < h - 1; y += step) for (let x = 1; x < w - 1; x += step) {
      sample.push(
        Math.abs(lum[y*w+x] - lum[(y-1)*w+x]) +
        Math.abs(lum[(y+1)*w+x] - lum[y*w+x]) +
        Math.abs(lum[y*w+x] - lum[y*w+x-1]) +
        Math.abs(lum[y*w+x+1] - lum[y*w+x])
      );
    }
    sample.sort((a,b)=>a-b);
    const med = sample.length ? sample[Math.floor(sample.length * 0.5)] : 0;
    const edgeCut = Math.max(9, med * 2.5);
    const quietCut = Math.max(2.5, edgeCut * 0.44);

    // V97: reverse the evidence order for panel boundaries.
    // Black frame lines are primary candidates; grey gutter evidence confirms
    // them when present. This is deliberately separate from the V96
    // gutter-first approach.
    const blackH = this._findBlackFirstBoundaries(lum, w, h, tx, ty, "H");
    const blackV = this._findBlackFirstBoundaries(lum, w, h, tx, ty, "V");
    const greyH = this._findHorizontalBoundaries(lum, w, h, tx, ty, edgeCut, quietCut);
    const greyV = this._findVerticalBoundaries(lum, w, h, tx, ty, edgeCut, quietCut);

    this._confirmBlackWithGrey(blackH, greyH, "H", w, h);
    this._confirmBlackWithGrey(blackV, greyV, "V", w, h);

    const hCandidates = blackH.concat(greyH);
    const vCandidates = blackV.concat(greyV);

    if (log) {
      log(`V97 black-first H=${blackH.length} V=${blackV.length}`);
    }

    if (log) {
      log(`V99 boundary candidates H=${hCandidates.length} V=${vCandidates.length} edgeCut=${edgeCut.toFixed(1)} quietCut=${quietCut.toFixed(1)}`);
      log(`V99 H candidates=${JSON.stringify(hCandidates.slice(0,8))}`);
      log(`V99 V candidates=${JSON.stringify(vCandidates.slice(0,8))}`);
    }

    const top = hCandidates.filter(c => c.pos < ty).sort((a,b)=>Math.abs(ty-a.pos)-Math.abs(ty-b.pos)).slice(0,5);
    const bottom = hCandidates.filter(c => c.pos > ty).sort((a,b)=>Math.abs(ty-a.pos)-Math.abs(ty-b.pos)).slice(0,5);
    const left = vCandidates.filter(c => c.pos < tx).sort((a,b)=>Math.abs(tx-a.pos)-Math.abs(tx-b.pos)).slice(0,5);
    const right = vCandidates.filter(c => c.pos > tx).sort((a,b)=>Math.abs(tx-a.pos)-Math.abs(tx-b.pos)).slice(0,5);

    // Page edges are valid boundaries, but never count as gutter evidence.
    top.unshift({pos:0, edge:true, quality:0, span:[0,w-1]});
    bottom.unshift({pos:h-1, edge:true, quality:0, span:[0,w-1]});
    left.unshift({pos:0, edge:true, quality:0, span:[0,h-1]});
    right.unshift({pos:w-1, edge:true, quality:0, span:[0,h-1]});

    let best = null;
    for (const T of top) for (const B of bottom) for (const L of left) for (const R of right) {
      const pw = R.pos - L.pos, ph = B.pos - T.pos;
      if (pw <= w*0.04 || ph <= h*0.04) continue;
      if (!(tx >= L.pos && tx <= R.pos && ty >= T.pos && ty <= B.pos)) continue;

      const hs = [T,B].filter(c=>!c.edge);
      const vs = [L,R].filter(c=>!c.edge);
      const sides = hs.length + vs.length;
      if (sides < 2) continue;

      const hOverlap = boundarySpanOverlap(T, B, w);
      const vOverlap = boundarySpanOverlap(L, R, h);
      const hNeed = Math.max(w*0.14, pw*0.28);
      const vNeed = Math.max(h*0.14, ph*0.28);
      const hCoherent = (T.edge || B.edge || hOverlap >= hNeed);
      const vCoherent = (L.edge || R.edge || vOverlap >= vNeed);
      if (!hCoherent || !vCoherent) continue;

      // V91: opposing-boundary agreement. A candidate is only trustworthy when
      // the boundaries on the same axis actually support the same proposed
      // panel span. This is a consistency test, not a smallest/largest rule.
      // Each non-edge boundary must cover a meaningful portion of the candidate
      // span, and opposing supports must overlap strongly enough to describe
      // the same enclosure. Edge boundaries are valid but contribute no gutter
      // evidence. This specifically rejects large regions whose detected
      // boundaries only cover a small local slice of the proposed rectangle.
      const hTopCov = T.edge ? 1 : intervalCoverage(T.span, L.pos, R.pos) / Math.max(1, pw);
      const hBotCov = B.edge ? 1 : intervalCoverage(B.span, L.pos, R.pos) / Math.max(1, pw);
      const vLeftCov = L.edge ? 1 : intervalCoverage(L.span, T.pos, B.pos) / Math.max(1, ph);
      const vRightCov = R.edge ? 1 : intervalCoverage(R.span, T.pos, B.pos) / Math.max(1, ph);
      const hPair = (T.edge || B.edge) ? Math.min(hTopCov, hBotCov) : Math.min(hTopCov, hBotCov, hOverlap / Math.max(1, pw));
      const vPair = (L.edge || R.edge) ? Math.min(vLeftCov, vRightCov) : Math.min(vLeftCov, vRightCov, vOverlap / Math.max(1, ph));
      const pairNeed = 0.42;
      if (hPair < pairNeed || vPair < pairNeed) continue;

      // Score only evidence quality and mutual coherence. Region area is not
      // rewarded or penalized, so V87 does not reintroduce smallest/largest.
      let score = 0;
      score += T.edge ? 0.45 : T.quality;
      score += B.edge ? 0.45 : B.quality;
      score += L.edge ? 0.45 : L.quality;
      score += R.edge ? 0.45 : R.quality;
      if (!T.edge && !B.edge) score += Math.min(1.0, hOverlap / Math.max(1,hNeed));
      if (!L.edge && !R.edge) score += Math.min(1.0, vOverlap / Math.max(1,vNeed));
      score += sides * 0.35;

      // Prefer boundary sets with evidence on both axes, or two opposing
      // same-axis gutters for full-width/full-height comic panels.
      const axisBonus = (hs.length >= 2 ? 0.5 : 0) + (vs.length >= 2 ? 0.5 : 0);
      score += axisBonus;

      // V99: the V98 nearest-valid idea must act at the actual boundary-set
      // selection point. Keep evidence quality primary, but when two coherent
      // sets are close in score, prefer the set whose valid boundaries are
      // closer to the tap. This is a tie-breaker only.
      const tapBoundaryDistance =
        Math.max(0, ty - T.pos) +
        Math.max(0, B.pos - ty) +
        Math.max(0, tx - L.pos) +
        Math.max(0, R.pos - tx);

      if (!best) {
        best = {T,B,L,R,score,sides,hOverlap,vOverlap,hPair,vPair,pw,ph,tapBoundaryDistance};
      } else {
        const scoreGap = score - best.score;
        const tieBand = 0.45;
        const distanceImprovement = best.tapBoundaryDistance - tapBoundaryDistance;
        const meaningfulDistance = Math.max(6, Math.min(w,h) * 0.035);

        if (
          scoreGap > 0 ||
          (Math.abs(scoreGap) <= tieBand && distanceImprovement > meaningfulDistance)
        ) {
          best = {T,B,L,R,score,sides,hOverlap,vOverlap,hPair,vPair,pw,ph,tapBoundaryDistance};
        }
      }
    }

    if (!best) {
      if (log) log("V99 boundary-set REJECTED: no coherent boundary set around tap");
      return null;
    }

    let p = {
      x: best.L.pos / w,
      y: best.T.pos / h,
      w: best.pw / w,
      h: best.ph / h,
      _v87BoundarySet: true,
      _gutterSides: best.sides
    };

    // V89: A good outer boundary set can still contain multiple panels.
    // Iteratively inspect the selected region for strong internal gutters.
    // Each split is chosen by gutter continuity/evidence, while the tap
    // determines which side survives. We do NOT choose the smallest child.
    const refined = this._splitAtInternalGuttersIterative(lum, w, h, tx, ty, p, edgeCut, quietCut, log);
    if (refined) p = refined;

    // V92: panel interior validation. Even a coherent outer boundary set can
    // still contain multiple visual panels if an internal gutter survived the
    // V89 iterative refinement. Reject that result rather than accepting a
    // multi-panel pop-out. This is deliberately not a size rule: small and
    // large panels are both allowed when their interior is not divided by a
    // strong sustained gutter.
    const interior = this._validatePanelInterior(lum, w, h, tx, ty, p, edgeCut, quietCut, log);
    if (!interior.ok) {
      if (log) log(`V99 interior validation REJECTED: ${interior.reason}`);
      return null;
    }

    if (log) log(`V99 boundary-set ACCEPTED x=${p.x.toFixed(4)} y=${p.y.toFixed(4)} w=${p.w.toFixed(4)} h=${p.h.toFixed(4)} sides=${p._gutterSides} score=${best.score.toFixed(2)} hOverlap=${Math.round(best.hOverlap)} vOverlap=${Math.round(best.vOverlap)} hPair=${best.hPair.toFixed(2)} vPair=${best.vPair.toFixed(2)} interior=clean`);
    return p;
  },

  _splitAtInternalGuttersIterative(lum, w, h, tx, ty, p, edgeCut, quietCut, log) {
    let current = {...p};
    const maxSplits = 4;
    let changed = false;
    for (let i = 0; i < maxSplits; i++) {
      const next = this._splitAtInternalGuttersOnce(lum, w, h, tx, ty, current, edgeCut, quietCut, log);
      if (!next) break;
      current = next;
      changed = true;
      if (log) log(`V99 internal refinement pass ${i + 1}/${maxSplits}`);
    }
    return changed ? current : null;
  },

  _splitAtInternalGuttersOnce(lum, w, h, tx, ty, p, edgeCut, quietCut, log) {
    const x0 = Math.max(1, Math.round(p.x * w));
    const y0 = Math.max(1, Math.round(p.y * h));
    const x1 = Math.min(w - 2, Math.round((p.x + p.w) * w));
    const y1 = Math.min(h - 2, Math.round((p.y + p.h) * h));
    const pw = Math.max(1, x1 - x0);
    const ph = Math.max(1, y1 - y0);
    // Minimum continuity is a safety gate only; region size is never used
    // to prefer one resulting child over another.
    const minSpanH = 0.66;
    const minSpanV = 0.66;

    const findH = () => {
      let best = null;
      const xa = Math.max(x0 + 2, Math.round(x0 + pw * 0.08));
      const xb = Math.min(x1 - 2, Math.round(x1 - pw * 0.08));
      const span = Math.max(1, xb - xa + 1);
      for (let y = y0 + Math.max(3, Math.round(ph * 0.05)); y <= y1 - Math.max(3, Math.round(ph * 0.05)); y++) {
        if (Math.abs(y - ty) < Math.max(3, Math.round(ph * 0.025))) continue;
        let sum = 0, quiet = 0;
        for (let x = xa; x <= xb; x++) {
          const g = Math.abs(lum[y*w+x]-lum[(y-1)*w+x]) + Math.abs(lum[(y+1)*w+x]-lum[y*w+x]);
          sum += g;
          if (g <= quietCut) quiet++;
        }
        const avg = sum / span;
        const quietFrac = quiet / span;
        const before = this._axisEdgeSupportH(lum, w, h, y - 1, xa, xb);
        const after = this._axisEdgeSupportH(lum, w, h, y + 1, xa, xb);
        const support = (before + after) / 2;
        if (quietFrac < 0.62 || support < edgeCut * 0.90) continue;
        const quality = (support / Math.max(1, edgeCut)) * (0.55 + quietFrac * 0.45);
        if (!best || quality > best.quality) best = {pos:y, quality, quietFrac, spanFrac:span/pw};
      }
      return best && best.spanFrac >= minSpanH ? best : null;
    };

    const findV = () => {
      let best = null;
      const ya = Math.max(y0 + 2, Math.round(y0 + ph * 0.08));
      const yb = Math.min(y1 - 2, Math.round(y1 - ph * 0.08));
      const span = Math.max(1, yb - ya + 1);
      for (let x = x0 + Math.max(3, Math.round(pw * 0.05)); x <= x1 - Math.max(3, Math.round(pw * 0.05)); x++) {
        if (Math.abs(x - tx) < Math.max(3, Math.round(pw * 0.025))) continue;
        let sum = 0, quiet = 0;
        for (let y = ya; y <= yb; y++) {
          const g = Math.abs(lum[y*w+x]-lum[y*w+x-1]) + Math.abs(lum[y*w+x+1]-lum[y*w+x]);
          sum += g;
          if (g <= quietCut) quiet++;
        }
        const avg = sum / span;
        const quietFrac = quiet / span;
        const before = this._axisEdgeSupportV(lum, w, h, x - 1, ya, yb);
        const after = this._axisEdgeSupportV(lum, w, h, x + 1, ya, yb);
        const support = (before + after) / 2;
        if (quietFrac < 0.62 || support < edgeCut * 0.90) continue;
        const quality = (support / Math.max(1, edgeCut)) * (0.55 + quietFrac * 0.45);
        if (!best || quality > best.quality) best = {pos:x, quality, quietFrac, spanFrac:span/ph};
      }
      return best && best.spanFrac >= minSpanV ? best : null;
    };

    let refined = {...p};
    const hg = findH();
    const vg = findV();
    let did = false;
    if (hg) {
      if (ty < hg.pos) refined.h = (hg.pos / h) - refined.y;
      else refined.y = hg.pos / h, refined.h = (p.y + p.h) - refined.y;
      did = true;
      if (log) log(`V99 internal H gutter split at ${hg.pos} quality=${hg.quality.toFixed(2)} quiet=${hg.quietFrac.toFixed(2)}`);
    }
    if (vg) {
      if (tx < vg.pos) refined.w = (vg.pos / w) - refined.x;
      else refined.x = vg.pos / w, refined.w = (p.x + p.w) - refined.x;
      did = true;
      if (log) log(`V99 internal V gutter split at ${vg.pos} quality=${vg.quality.toFixed(2)} quiet=${vg.quietFrac.toFixed(2)}`);
    }
    if (!did) return null;
    refined.w = clamp01(refined.w);
    refined.h = clamp01(refined.h);
    refined._v88InternalSplit = true;
    return refined;
  },

  _validatePanelInterior(lum, w, h, tx, ty, p, edgeCut, quietCut, log) {
    const x0 = Math.max(1, Math.round(p.x * w));
    const y0 = Math.max(1, Math.round(p.y * h));
    const x1 = Math.min(w - 2, Math.round((p.x + p.w) * w));
    const y1 = Math.min(h - 2, Math.round((p.y + p.h) * h));
    const pw = Math.max(1, x1 - x0);
    const ph = Math.max(1, y1 - y0);

    // Validation is intentionally conservative. We only call something an
    // internal gutter when it forms a long, quiet corridor with strong edge
    // support on both sides. Short artwork strokes and speech-balloon edges
    // should not be enough to invalidate a panel.
    const marginX = Math.max(3, Math.round(pw * 0.08));
    const marginY = Math.max(3, Math.round(ph * 0.08));
    const xa = Math.min(x1 - 2, x0 + marginX);
    const xb = Math.max(x0 + 2, x1 - marginX);
    const ya = Math.min(y1 - 2, y0 + marginY);
    const yb = Math.max(y0 + 2, y1 - marginY);
    const spanNeed = 0.72;
    const quietNeed = 0.70;
    const supportNeed = edgeCut * 1.05;

    let strongestH = null;
    for (let y = ya + 2; y <= yb - 2; y++) {
      // Do not let a tap sitting immediately on a gutter invalidate the panel;
      // V89's split logic has already had the opportunity to use that gutter.
      if (Math.abs(y - ty) <= Math.max(3, Math.round(ph * 0.025))) continue;
      let quiet = 0;
      for (let x = xa; x <= xb; x++) {
        const g = Math.abs(lum[y*w+x] - lum[(y-1)*w+x]) +
                  Math.abs(lum[(y+1)*w+x] - lum[y*w+x]);
        if (g <= quietCut) quiet++;
      }
      const span = Math.max(1, xb - xa + 1);
      const quietFrac = quiet / span;
      if (quietFrac < quietNeed) continue;
      const support = this._axisEdgeSupportH(lum, w, h, y - 1, xa, xb) * 0.5 +
                      this._axisEdgeSupportH(lum, w, h, y + 1, xa, xb) * 0.5;
      const spanFrac = span / Math.max(1, pw);
      if (spanFrac < spanNeed || support < supportNeed) continue;
      const quality = (support / Math.max(1, edgeCut)) * (0.60 + quietFrac * 0.40) * spanFrac;
      if (!strongestH || quality > strongestH.quality) {
        strongestH = { pos: y, quality, quietFrac, support, spanFrac };
      }
    }

    let strongestV = null;
    for (let x = xa + 2; x <= xb - 2; x++) {
      if (Math.abs(x - tx) <= Math.max(3, Math.round(pw * 0.025))) continue;
      let quiet = 0;
      for (let y = ya; y <= yb; y++) {
        const g = Math.abs(lum[y*w+x] - lum[y*w+x-1]) +
                  Math.abs(lum[y*w+x+1] - lum[y*w+x]);
        if (g <= quietCut) quiet++;
      }
      const span = Math.max(1, yb - ya + 1);
      const quietFrac = quiet / span;
      if (quietFrac < quietNeed) continue;
      const support = this._axisEdgeSupportV(lum, w, h, x - 1, ya, yb) * 0.5 +
                      this._axisEdgeSupportV(lum, w, h, x + 1, ya, yb) * 0.5;
      const spanFrac = span / Math.max(1, ph);
      if (spanFrac < spanNeed || support < supportNeed) continue;
      const quality = (support / Math.max(1, edgeCut)) * (0.60 + quietFrac * 0.40) * spanFrac;
      if (!strongestV || quality > strongestV.quality) {
        strongestV = { pos: x, quality, quietFrac, support, spanFrac };
      }
    }

    if (log) {
      if (strongestH) log(`V92 interior H gutter candidate y=${strongestH.pos} quality=${strongestH.quality.toFixed(2)} span=${strongestH.spanFrac.toFixed(2)} quiet=${strongestH.quietFrac.toFixed(2)}`);
      if (strongestV) log(`V92 interior V gutter candidate x=${strongestV.pos} quality=${strongestV.quality.toFixed(2)} span=${strongestV.spanFrac.toFixed(2)} quiet=${strongestV.quietFrac.toFixed(2)}`);
    }

    if (strongestH && strongestV) return { ok: false, reason: "strong internal H+V gutters remain" };
    if (strongestH) return { ok: false, reason: `strong internal H gutter at ${strongestH.pos}` };
    if (strongestV) return { ok: false, reason: `strong internal V gutter at ${strongestV.pos}` };
    return { ok: true };
  },

  _axisEdgeSupportH(lum, w, h, y, xa, xb) {
    y = Math.max(1, Math.min(h-2, y));
    let sum = 0;
    for (let x = xa; x <= xb; x++) sum += Math.abs(lum[y*w+x]-lum[(y-1)*w+x]) + Math.abs(lum[(y+1)*w+x]-lum[y*w+x]);
    return sum / Math.max(1, xb-xa+1);
  },

  _axisEdgeSupportV(lum, w, h, x, ya, yb) {
    x = Math.max(1, Math.min(w-2, x));
    let sum = 0;
    for (let y = ya; y <= yb; y++) sum += Math.abs(lum[y*w+x]-lum[y*w+x-1]) + Math.abs(lum[y*w+x+1]-lum[y*w+x]);
    return sum / Math.max(1, yb-ya+1);
  },


  _v98RankBoundaryCandidates(candidates, tapPos, total) {
    const valid = (candidates || []).filter(c =>
      Number.isFinite(c.pos) && Number.isFinite(c.quality)
    );

    // Quality remains primary. Only candidates within a narrow evidence tier
    // can be reordered by distance to the tap.
    valid.sort((a,b) => {
      const qa = a.quality || 0;
      const qb = b.quality || 0;
      const gap = Math.abs(qa-qb);
      if (gap <= 0.55) {
        const da = Math.abs(a.pos-tapPos);
        const db = Math.abs(b.pos-tapPos);
        const distanceGap = Math.abs(da-db);
        if (distanceGap > Math.max(3,total*0.012)) return da-db;
      }
      return qb-qa;
    });
    return valid;
  },

  _findBlackFirstBoundaries(lum, w, h, tx, ty, axis) {
    const out = [];
    const darkCut = 55;
    const lightCut = 105;
    const minDarkFrac = 0.62;
    const minRunFrac = 0.45;
    const minSpanFrac = 0.34;
    const total = axis === "H" ? h : w;
    const spanLimit = axis === "H" ? w : h;

    const spans = [0.38, 0.52, 0.68, 0.84];

    for (const frac of spans) {
      if (axis === "H") {
        const half = Math.max(12, Math.round(w * frac / 2));
        const xa = Math.max(2, Math.round(tx) - half);
        const xb = Math.min(w - 3, Math.round(tx) + half);
        if (xb <= xa) continue;

        for (let y = 2; y < h - 2; y++) {
          if (Math.abs(y - ty) < Math.max(4, Math.round(h * 0.02))) continue;

          let dark = 0, bestRun = 0, run = 0;
          let sum = 0;
          for (let x = xa; x <= xb; x++) {
            const v = lum[y*w+x];
            sum += v;
            if (v <= darkCut) {
              dark++; run++;
              if (run > bestRun) bestRun = run;
            } else run = 0;
          }
          const span = xb-xa+1;
          const darkFrac = dark/span;
          const runFrac = bestRun/span;
          if (darkFrac < minDarkFrac || runFrac < minRunFrac) continue;

          let above=0, below=0;
          for (let x=xa; x<=xb; x++) {
            above += lum[(y-1)*w+x];
            below += lum[(y+1)*w+x];
          }
          above/=span; below/=span;
          const isolated = Math.min(above, below);
          if (isolated < lightCut) continue;

          let a=y, b=y;
          while (a>1 && b-a<5 && this._blackRowScore(lum,w,a-1,xa,xb,darkCut)>=minDarkFrac) a--;
          while (b<h-2 && b-a<5 && this._blackRowScore(lum,w,b+1,xa,xb,darkCut)>=minDarkFrac) b++;

          const quality =
            1.55 +
            Math.min(1, darkFrac)*0.85 +
            Math.min(1, runFrac)*0.90 +
            Math.min(1, (isolated-55)/150)*0.80;

          out.push({
            pos:(a+b)/2, width:b-a+1, quality,
            gutterQuality:0, thickness:b-a+1,
            span:[xa,xb], axis, blackFrame:true,
            darkFrac, runFrac, neighborLight:isolated
          });
        }
      } else {
        const half = Math.max(12, Math.round(h * frac / 2));
        const ya = Math.max(2, Math.round(ty) - half);
        const yb = Math.min(h - 3, Math.round(ty) + half);
        if (yb <= ya) continue;

        for (let x = 2; x < w - 2; x++) {
          if (Math.abs(x - tx) < Math.max(4, Math.round(w * 0.02))) continue;

          let dark=0, bestRun=0, run=0, sum=0;
          for (let y=ya; y<=yb; y++) {
            const v=lum[y*w+x]; sum+=v;
            if (v<=darkCut) { dark++; run++; if(run>bestRun) bestRun=run; }
            else run=0;
          }
          const span=yb-ya+1;
          const darkFrac=dark/span, runFrac=bestRun/span;
          if(darkFrac<minDarkFrac || runFrac<minRunFrac) continue;

          let left=0,right=0;
          for(let y=ya;y<=yb;y++){
            left+=lum[y*w+x-1]; right+=lum[y*w+x+1];
          }
          left/=span; right/=span;
          const isolated=Math.min(left,right);
          if(isolated<lightCut) continue;

          let a=x,b=x;
          while(a>1 && b-a<5 && this._blackColScore(lum,w,a-1,ya,yb,darkCut)>=minDarkFrac) a--;
          while(b<w-2 && b-a<5 && this._blackColScore(lum,w,b+1,ya,yb,darkCut)>=minDarkFrac) b++;

          const quality =
            1.55 +
            Math.min(1,darkFrac)*0.85 +
            Math.min(1,runFrac)*0.90 +
            Math.min(1,(isolated-55)/150)*0.80;

          out.push({
            pos:(a+b)/2, width:b-a+1, quality,
            gutterQuality:0, thickness:b-a+1,
            span:[ya,yb], axis, blackFrame:true,
            darkFrac, runFrac, neighborLight:isolated
          });
        }
      }
    }

    // Collapse repeated detections from overlapping scan spans.
    const ranked = this._v98RankBoundaryCandidates(
      out,
      axis === "H" ? tx : ty,
      total
    );
    ranked.sort((a,b)=>a.pos-b.pos || b.quality-a.quality);
    const merged=[];
    const mergeDist=Math.max(3,Math.round(total*0.012));
    for(const c of out){
      const last=merged[merged.length-1];
      if(last && Math.abs(last.pos-c.pos)<=mergeDist){
        if(c.quality>last.quality) merged[merged.length-1]=c;
      } else merged.push(c);
    }
    return merged.slice(0,24);
  },

  _blackRowScore(lum,w,y,xa,xb,cut){
    let n=0, span=Math.max(1,xb-xa+1);
    for(let x=xa;x<=xb;x++) if(lum[y*w+x]<=cut) n++;
    return n/span;
  },

  _blackColScore(lum,w,x,ya,yb,cut){
    let n=0, span=Math.max(1,yb-ya+1);
    for(let y=ya;y<=yb;y++) if(lum[y*w+x]<=cut) n++;
    return n/span;
  },

  _confirmBlackWithGrey(black, grey, axis, w, h) {
    if(!black.length || !grey.length) return;
    const tolerance=Math.max(5, Math.round((axis==="H"?h:w)*0.025));

    for(const b of black){
      let best=null;
      for(const g of grey){
        if(Math.abs(g.pos-b.pos)>tolerance) continue;

        // Prefer grey evidence whose span overlaps most of the black frame.
        const bs=b.span||[0,axis==="H"?w-1:h-1];
        const gs=g.span||[0,axis==="H"?w-1:h-1];
        const overlap=Math.max(0,Math.min(bs[1],gs[1])-Math.max(bs[0],gs[0])+1);
        const union=Math.max(bs[1],gs[1])-Math.min(bs[0],gs[0])+1;
        const overlapFrac=overlap/Math.max(1,union);

        const score=(g.quality||0)+overlapFrac;
        if(!best || score>best.score) best={g,score,overlapFrac};
      }

      if(best){
        b.greyConfirmed=true;
        b.greyConfirmationScore=Math.min(1,best.overlapFrac);
        // Confirmation is a meaningful bonus, but black remains primary.
        b.quality += 0.70 + 0.55*b.greyConfirmationScore;
      }
    }
  },

  _findHorizontalBoundaries(lum, w, h, tx, ty, edgeCut, quietCut) {
    const candidates = [];
    // Evaluate several horizontal support spans centered on the tap. A real
    // gutter can stop at a panel corner, so full-page coverage is not required.
    const spans = [0.22, 0.34, 0.48, 0.66];
    for (const frac of spans) {
      const half = Math.max(8, Math.round(w * frac / 2));
      const xa = Math.max(1, Math.round(tx) - half);
      const xb = Math.min(w - 2, Math.round(tx) + half);
      const width = Math.max(1, xb-xa+1);
      const prof = new Float32Array(h);
      for (let y=1;y<h-1;y++) {
        let sum=0, quiet=0;
        for (let x=xa;x<=xb;x++) {
          const g=Math.abs(lum[y*w+x]-lum[(y-1)*w+x]) + Math.abs(lum[(y+1)*w+x]-lum[y*w+x]);
          sum += g;
          if (g <= quietCut) quiet++;
        }
        prof[y] = sum / width;
        prof[y] += (1 - quiet/width) * edgeCut * 0.35;
      }
      this._collectBoundaryCandidates(prof, h, edgeCut, quietCut, xa, xb, candidates, "H");
    }
    return dedupeBoundaryCandidates(candidates, Math.max(2, Math.round(h*0.012)), 12);
  },

  _findVerticalBoundaries(lum, w, h, tx, ty, edgeCut, quietCut) {
    const candidates = [];
    const spans = [0.22, 0.34, 0.48, 0.66];
    for (const frac of spans) {
      const half = Math.max(8, Math.round(h * frac / 2));
      const ya = Math.max(1, Math.round(ty) - half);
      const yb = Math.min(h - 2, Math.round(ty) + half);
      const height = Math.max(1, yb-ya+1);
      const prof = new Float32Array(w);
      for (let x=1;x<w-1;x++) {
        let sum=0, quiet=0;
        for (let y=ya;y<=yb;y++) {
          const g=Math.abs(lum[y*w+x]-lum[y*w+x-1]) + Math.abs(lum[y*w+x+1]-lum[y*w+x]);
          sum += g;
          if (g <= quietCut) quiet++;
        }
        prof[x] = sum / height;
        prof[x] += (1 - quiet/height) * edgeCut * 0.35;
      }
      this._collectBoundaryCandidates(prof, w, edgeCut, quietCut, ya, yb, candidates, "V");
    }
    return dedupeBoundaryCandidates(candidates, Math.max(2, Math.round(w*0.012)), 12);
  },

  _collectBoundaryCandidates(profile, total, edgeCut, quietCut, spanA, spanB, out, axis) {
    for (let i=2;i<total-2;i++) {
      if (profile[i] > quietCut) continue;
      // A gutter is a quiet corridor with edge support immediately outside it.
      let a=i, b=i;
      const maxRun=Math.max(2,Math.round(total*0.014));
      while (a>1 && profile[a-1] <= quietCut && i-a < maxRun) a--;
      while (b<total-2 && profile[b+1] <= quietCut && b-i < maxRun) b++;
      const before=profile[Math.max(1,a-1)];
      const after=profile[Math.min(total-2,b+1)];
      const support=(Math.max(0,before)+Math.max(0,after))/2;
      const quietFrac=Math.max(0, Math.min(1, 1 - profile[i]/Math.max(1,quietCut)));
      if (support < edgeCut*0.78) continue;
      const pos=(a+b)/2;
      const quality=Math.min(3, support/Math.max(1,edgeCut)) * (0.65 + quietFrac*0.35);
      const span=[spanA,spanB];
      out.push({pos, width:b-a+1, quality, span, axis});
      i=b;
    }
  },

  _analyze(img, log) {
    const maxDim = 900;
    const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
    const w = Math.max(1, Math.round(img.width * scale));
    const h = Math.max(1, Math.round(img.height * scale));
    if (log) log(`source=${img.width}x${img.height} downscaled=${w}x${h}`);
    const canvas=document.createElement("canvas"); canvas.width=w; canvas.height=h;
    const ctx=canvas.getContext("2d",{willReadFrequently:true}); ctx.drawImage(img,0,0,w,h);
    const data=ctx.getImageData(0,0,w,h).data;
    const lumAt=(x,y)=>{const i=(y*w+x)*4; return .299*data[i]+.587*data[i+1]+.114*data[i+2];};
    const rowStd=new Array(h);
    for(let y=0;y<h;y++){let sum=0,sumSq=0;for(let x=0;x<w;x++){const l=lumAt(x,y);sum+=l;sumSq+=l*l;}const mean=sum/w;rowStd[y]=Math.sqrt(Math.max(0,sumSq/w-mean*mean));}
    if(log){const min=Math.min(...rowStd),max=Math.max(...rowStd),flat=rowStd.filter(v=>v<10).length;log(`row-stddev min=${min.toFixed(1)} max=${max.toFixed(1)} flat-rows(<10)=${flat}/${h}`);}
    const thresh=10, minRow=Math.max(2,Math.round(h*.006)), minCol=Math.max(2,Math.round(w*.006));
    const strips=splitByGutter(rowStd,h,thresh,minRow); if(log)log(`row-split found ${strips.length} strip(s): ${JSON.stringify(strips)}`);
    const panels=[];
    for(const [sy,ey] of strips){const stripH=ey-sy;if(stripH<h*.05)continue;const colStd=new Array(w);for(let x=0;x<w;x++){let sum=0,sumSq=0;for(let y=sy;y<ey;y++){const l=lumAt(x,y);sum+=l;sumSq+=l*l;}const mean=sum/stripH;colStd[x]=Math.sqrt(Math.max(0,sumSq/stripH-mean*mean));}const cols=splitByGutter(colStd,w,thresh,minCol);for(const [sx,ex] of cols){const pw=ex-sx;if(pw<w*.05)continue;panels.push({x:sx/w,y:sy/h,w:pw/w,h:stripH/h});}}
    if(log)log(`raw panel count before collapse-check: ${panels.length}`);
    if(panels.length<=1){if(log)log("-> collapsed to 0 (<=1 panel found)");return [];}return panels;
  }
};

function intervalCoverage(span, lo, hi){
  if (!span || span.length < 2) return 0;
  const a = Math.min(span[0], span[1]);
  const b = Math.max(span[0], span[1]);
  const overlap = Math.max(0, Math.min(b, hi) - Math.max(a, lo) + 1);
  return overlap;
}
function boundarySpanOverlap(a,b,total){
  if(a.edge || b.edge) return Math.max(0,total-1);
  const lo=Math.max(a.span[0],b.span[0]), hi=Math.min(a.span[1],b.span[1]);
  return Math.max(0,hi-lo+1);
}
function dedupeBoundaryCandidates(list,posTol,maxKeep){
  list.sort((a,b)=>b.quality-a.quality);
  const out=[];
  for(const c of list){
    if(out.some(o=>Math.abs(o.pos-c.pos)<=posTol)) continue;
    out.push(c); if(out.length>=maxKeep) break;
  }
  return out.sort((a,b)=>a.pos-b.pos);
}
function splitByGutter(arr,total,thresh,minGutterRun){const spans=[];let contentStart=0,inG=false,gStart=0;for(let i=0;i<=total;i++){const isG=i<total?arr[i]<thresh:true;if(isG){if(!inG){inG=true;gStart=i;}}else if(inG){const run=i-gStart;inG=false;if(run>=minGutterRun){if(gStart-contentStart>0)spans.push([contentStart,gStart]);contentStart=i;}}}if(total-contentStart>0)spans.push([contentStart,total]);return spans;}
function clamp01(v){return Math.min(1,Math.max(0,Number(v)||0));}
window.PanelDetect=PanelDetect;
