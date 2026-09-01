// NTH SHELF V2.78.06 — SKEWED RAIL ACQUISITION
// Geometry-only engine for trapezoids/slanted quadrilaterals. Panel identity
// comes from panels.js. Unlike V2.78.05, each side may migrate progressively
// away from the orthogonal seed while remaining a coherent dark rail.

const PanelGeometrySkewed = {
  refine(imgUrl, panel, log) {
    if (!imgUrl || !panel) return Promise.resolve(null);
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        try { resolve(this._analyze(img, panel, log)); }
        catch (err) {
          console.warn('Skewed geometry failed:', err);
          if (log) log(`SKEWED ERROR: ${err.message}`);
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = imgUrl;
    });
  },

  _analyze(img, panel, log) {
    const maxDim = 900;
    const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
    const w = Math.max(1, Math.round(img.width * scale));
    const h = Math.max(1, Math.round(img.height * scale));
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const cx = c.getContext('2d', { willReadFrequently: true });
    cx.drawImage(img, 0, 0, w, h);
    const d = cx.getImageData(0, 0, w, h).data;
    const lum = new Uint8Array(w * h);
    for (let i=0,j=0;i<d.length;i+=4,j++) lum[j]=Math.round(.299*d[i]+.587*d[i+1]+.114*d[i+2]);

    const x0 = Math.max(1, Math.round(panel.x * w));
    const y0 = Math.max(1, Math.round(panel.y * h));
    const x1 = Math.min(w-2, Math.round((panel.x + panel.w) * w)-1);
    const y1 = Math.min(h-2, Math.round((panel.y + panel.h) * h)-1);
    const rw=x1-x0+1, rh=y1-y0+1;
    if (rw < 24 || rh < 24) return null;

    const sampleInk = (axis, a, pos) => {
      let best=255;
      for(let t=-2;t<=2;t++){
        const p=Math.round(pos+t);
        if(axis==='H'){
          if(p<1||p>=h-1||a<1||a>=w-1) continue;
          const v=(lum[(p-1)*w+a]+lum[p*w+a]+lum[(p+1)*w+a])/3;
          if(v<best) best=v;
        } else {
          if(p<1||p>=w-1||a<1||a>=h-1) continue;
          const v=(lum[(a-1)*w+p]+lum[a*w+p]+lum[(a+1)*w+p])/3;
          if(v<best) best=v;
        }
      }
      return best;
    };

    // Search for a complete straight-ish rail as a line hypothesis first.
    // This is the key V106 change: distance from the seed is judged mainly at
    // the rail midpoint, so a legitimate diagonal can drift substantially at
    // its ends without being punished on every sample.
    const acquireRail = (axis, guess, a0, a1, label) => {
      const span=Math.max(1,a1-a0);
      const cross=axis==='H'?h:w;
      const mid=(a0+a1)/2;
      const offsetRadius=Math.min(64,Math.max(14,Math.round(cross*.070)));
      const slopeMax=Math.min(.48, Math.max(.20, (offsetRadius*1.75)/Math.max(40,span*.5)));
      const evalStep=Math.max(2,Math.round(span/110));
      const aStart=Math.round(a0+span*.025), aEnd=Math.round(a1-span*.025);
      let best=null;

      // Coarse-to-fine slope scan. A true comic rail generally has sustained
      // dark support and a long contiguous run; speed-lines usually do not.
      for(let pass=0;pass<2;pass++){
        const slopeStep=pass===0?.025:.006;
        const offStep=pass===0?4:1;
        const mLo=best?Math.max(-slopeMax,best.m-.035):-slopeMax;
        const mHi=best?Math.min(slopeMax,best.m+.035):slopeMax;
        const oLo=best?Math.max(-offsetRadius,best.off-7):-offsetRadius;
        const oHi=best?Math.min(offsetRadius,best.off+7):offsetRadius;
        let passBest=best;
        for(let m=mLo;m<=mHi+1e-9;m+=slopeStep){
          for(let off=oLo;off<=oHi;off+=offStep){
            let dark=0, veryDark=0, total=0, longest=0, run=0, lumSum=0;
            for(let a=aStart;a<=aEnd;a+=evalStep){
              const pos=guess+off+m*(a-mid);
              if(pos<2||pos>=cross-2){ run=0; continue; }
              const v=sampleInk(axis,a,pos);
              total++; lumSum+=v;
              if(v<=166){ dark++; run++; if(run>longest) longest=run; } else run=0;
              if(v<=105) veryDark++;
            }
            if(total<10) continue;
            const support=dark/total, strong=veryDark/total, continuity=longest/total;
            // Favor sustained rails. Offset at midpoint costs a little; slope
            // itself is not punished because skew is the thing we're seeking.
            const score=support*2.15 + continuity*1.35 + strong*.55 - (lumSum/total)/420 - Math.abs(off)/(offsetRadius*4.0);
            const cand={axis,m,off,b:guess+off-m*mid,support,continuity,strong,meanLum:lumSum/total,score};
            if(!passBest || cand.score>passBest.score) passBest=cand;
          }
        }
        best=passBest;
      }
      if(!best) return null;

      // Reject short accidental artwork lines before refinement.
      if(best.support<.34 || best.continuity<.20 || (best.support<.44 && best.continuity<.32)){
        if(log) log(`SKEWED rail ${label} weak support=${best.support.toFixed(2)} run=${best.continuity.toFixed(2)}`);
        return null;
      }

      // Pull actual dark samples in a narrow corridor around the winning line,
      // then robustly refit. This keeps the final rail attached to ink rather
      // than to the coarse hypothesis grid.
      const slots=[];
      const refineStep=Math.max(1,Math.round(span/175));
      for(let a=aStart;a<=aEnd;a+=refineStep){
        const predicted=best.m*a+best.b;
        let pick=null;
        for(let dd=-6;dd<=6;dd++){
          const pos=Math.round(predicted+dd);
          if(pos<2||pos>=cross-2) continue;
          const v=sampleInk(axis,a,pos);
          const score=v+Math.abs(dd)*3.0;
          if(!pick||score<pick.score) pick={a,pos,v,score};
        }
        if(pick&&pick.v<=174) slots.push(pick);
      }
      if(slots.length<12) return null;

      let keep=slots.slice(), model=null, residualMed=99;
      for(let iter=0;iter<4;iter++){
        if(keep.length<10) return null;
        let sa=0,sp=0,saa=0,sap=0,n=keep.length;
        for(const q of keep){sa+=q.a;sp+=q.pos;saa+=q.a*q.a;sap+=q.a*q.pos;}
        const den=n*saa-sa*sa;
        const m=Math.abs(den)>1e-7?(n*sap-sa*sp)/den:0, b=(sp-m*sa)/n;
        model={axis,m,b};
        const rs=keep.map(q=>Math.abs(q.pos-(m*q.a+b))).sort((a,b)=>a-b);
        residualMed=rs[Math.floor(rs.length/2)]||0;
        const tol=Math.max(2.2,Math.min(6.0,residualMed*2.8+1.4));
        keep=keep.filter(q=>Math.abs(q.pos-(m*q.a+b))<=tol);
      }
      if(!model||keep.length<10) return null;
      const bins=new Set();
      for(const q of keep){
        const t=(q.a-aStart)/Math.max(1,aEnd-aStart);
        bins.add(Math.max(0,Math.min(9,Math.floor(t*10))));
      }
      const totalSlots=Math.max(1,Math.floor((aEnd-aStart)/refineStep)+1);
      model.support=keep.length/totalSlots;
      model.coverage=bins.size/10;
      model.residual=residualMed;
      model.continuity=best.continuity;
      model.offsetMid=(model.m*mid+model.b)-guess;
      if(model.coverage<.50 || model.support<.26 || residualMed>5.4 || Math.abs(model.m)>.52) return null;
      if(Math.abs(model.offsetMid)>offsetRadius*.92) return null;
      if(log) log(`SKEWED rail ${label} HIT m=${model.m.toFixed(3)} support=${model.support.toFixed(2)} cover=${model.coverage.toFixed(2)} run=${best.continuity.toFixed(2)}`);
      return model;
    };

    const top=acquireRail('H',y0,x0,x1,'top');
    const bottom=acquireRail('H',y1,x0,x1,'bottom');
    const left=acquireRail('V',x0,y0,y1,'left');
    const right=acquireRail('V',x1,y0,y1,'right');
    const sides=[top,bottom,left,right].filter(Boolean).length;
    if(sides<4){ if(log) log(`SKEWED MISS rails=${sides}/4`); return null; }

    const intersect=(hl,vl)=>{
      const den=1-hl.m*vl.m;
      if(Math.abs(den)<.08) return null;
      const x=(vl.m*hl.b+vl.b)/den, y=hl.m*x+hl.b;
      return {x,y};
    };
    const q=[intersect(top,left),intersect(top,right),intersect(bottom,right),intersect(bottom,left)];
    if(q.some(p=>!p||!Number.isFinite(p.x)||!Number.isFinite(p.y))) return null;

    const refs=[{x:x0,y:y0},{x:x1,y:y0},{x:x1,y:y1},{x:x0,y:y1}];
    // A skewed rail is allowed more endpoint drift than V105, while the final
    // polygon still has to overlap the stable seed strongly enough to preserve
    // panel identity.
    const maxDx=Math.max(24,rw*.32), maxDy=Math.max(24,rh*.28);
    for(let i=0;i<4;i++) if(Math.abs(q[i].x-refs[i].x)>maxDx || Math.abs(q[i].y-refs[i].y)>maxDy){
      if(log) log('SKEWED MISS corner escaped seed'); return null;
    }

    const cross=(a,b,c)=>(b.x-a.x)*(c.y-b.y)-(b.y-a.y)*(c.x-b.x);
    const cs=[cross(q[0],q[1],q[2]),cross(q[1],q[2],q[3]),cross(q[2],q[3],q[0]),cross(q[3],q[0],q[1])];
    if(!(cs.every(v=>v>0)||cs.every(v=>v<0))){ if(log) log('SKEWED MISS non-convex'); return null; }
    const area=Math.abs(q.reduce((s,p,i)=>{const n=q[(i+1)%4];return s+p.x*n.y-n.x*p.y},0)/2);
    if(area<rw*rh*.52 || area>rw*rh*1.48){ if(log) log('SKEWED MISS area'); return null; }

    const cornerShift=Math.max(...q.map((p,i)=>Math.hypot(p.x-refs[i].x,p.y-refs[i].y)));
    const slopeSignal=Math.max(Math.abs(top.m),Math.abs(bottom.m),Math.abs(left.m),Math.abs(right.m));
    const skewed = slopeSignal >= .024 || cornerShift >= Math.max(5,Math.min(rw,rh)*.030);
    if(!skewed){ if(log) log(`SKEWED DECLINE slope=${slopeSignal.toFixed(3)} shift=${cornerShift.toFixed(1)}`); return null; }

    const clamp = (v)=>Math.max(0,Math.min(1,v));
    const nq=q.map(p=>({x:clamp(p.x/(w-1)),y:clamp(p.y/(h-1))}));
    const out={...panel,_quad:nq,_geometryType:'skewed'};
    if(log) log(`SKEWED HIT slope=${slopeSignal.toFixed(3)} shift=${cornerShift.toFixed(1)} support=${[top,bottom,left,right].map(s=>s.support.toFixed(2)).join('/')}`);
    return out;
  }
};
