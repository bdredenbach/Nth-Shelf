// NTH SHELF V2.78.08 — TAP-ANCHORED ENCLOSURE
// Geometry-only engine for trapezoids/slanted quadrilaterals.
// V2.78.08 changes the search origin: the tap is the anchor, and each side is
// chosen as the nearest sustained enclosing rail. Stronger rails farther away
// are not allowed to jump across a nearer proven boundary.

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

    const tapNorm = panel._tap || {x:panel.x+panel.w/2,y:panel.y+panel.h/2};
    const tx = Math.max(2,Math.min(w-3,tapNorm.x*(w-1)));
    const ty = Math.max(2,Math.min(h-3,tapNorm.y*(h-1)));
    if(log) log(`SKEWED tap-anchor px=${tx.toFixed(1)},${ty.toFixed(1)} seed=${x0},${y0}-${x1},${y1}`);

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

    // Find a sustained line that ENCLOSES the tap. Instead of beginning at the
    // old rectangle edge, candidate anchors are scanned outward from the tap.
    // Among lines with adequate structural proof, the nearest one wins.
    const acquireTapRail = (axis, side, a0, a1, label) => {
      const span=Math.max(1,a1-a0);
      const cross=axis==='H'?h:w;
      const tapA=axis==='H'?tx:ty;
      const tapCross=axis==='H'?ty:tx;
      const seedGuess = label==='top'?y0:label==='bottom'?y1:label==='left'?x0:x1;
      const outwardSign=(side==='neg')?-1:1;
      const seedDist=Math.abs(seedGuess-tapCross);
      const maxDist=Math.min(cross*.72, Math.max(seedDist*1.55, (axis==='H'?rh:rw)*.82, 42));
      const minDist=Math.max(5, Math.min(18, (axis==='H'?rh:rw)*.035));
      const aStart=Math.max(2,Math.round(a0+span*.02));
      const aEnd=Math.min((axis==='H'?w:h)-3,Math.round(a1-span*.02));
      const evalStep=Math.max(2,Math.round(span/105));
      const slopeMax=.52;
      let best=null;

      // Coarse then fine. Anchor position is defined at the tap coordinate.
      for(let pass=0;pass<2;pass++){
        const slopeStep=pass===0?.028:.006;
        const distStep=pass===0?5:1;
        const mLo=best?Math.max(-slopeMax,best.m-.04):-slopeMax;
        const mHi=best?Math.min(slopeMax,best.m+.04):slopeMax;
        const dLo=best?Math.max(minDist,best.dist-9):minDist;
        const dHi=best?Math.min(maxDist,best.dist+9):maxDist;
        let passBest=best;
        for(let m=mLo;m<=mHi+1e-9;m+=slopeStep){
          for(let dist=dLo;dist<=dHi;dist+=distStep){
            const pAtTap=tapCross+outwardSign*dist;
            const b=pAtTap-m*tapA;
            let dark=0, veryDark=0, total=0, longest=0, run=0, lumSum=0;
            for(let a=aStart;a<=aEnd;a+=evalStep){
              const pos=m*a+b;
              if(pos<2||pos>=cross-2){run=0;continue;}
              const v=sampleInk(axis,a,pos);
              total++; lumSum+=v;
              if(v<=166){dark++;run++;if(run>longest)longest=run;}else run=0;
              if(v<=105) veryDark++;
            }
            if(total<10) continue;
            const support=dark/total, strong=veryDark/total, continuity=longest/total;
            // Structural proof first. Distance is a strong tie-breaker so a
            // farther page border cannot beat the first enclosing divider.
            const structural=support*2.20+continuity*1.45+strong*.55-(lumSum/total)/430;
            const proximityPenalty=(dist/Math.max(1,maxDist))*.68;
            const score=structural-proximityPenalty;
            const qualifies=support>=.34 && continuity>=.18 && !(support<.44&&continuity<.30);
            if(!qualifies) continue;
            const cand={axis,m,b,dist,pAtTap,support,continuity,strong,meanLum:lumSum/total,score};
            if(!passBest || cand.score>passBest.score+.06 || (Math.abs(cand.score-passBest.score)<=.06 && cand.dist<passBest.dist)) passBest=cand;
          }
        }
        best=passBest;
      }
      if(!best){if(log)log(`SKEWED rail ${label} MISS no enclosing candidate`);return null;}

      // Refine around the winning line with actual dark samples.
      const slots=[];
      const refineStep=Math.max(1,Math.round(span/175));
      for(let a=aStart;a<=aEnd;a+=refineStep){
        const predicted=best.m*a+best.b;
        let pick=null;
        for(let dd=-6;dd<=6;dd++){
          const pos=Math.round(predicted+dd);
          if(pos<2||pos>=cross-2) continue;
          const v=sampleInk(axis,a,pos);
          const s=v+Math.abs(dd)*3;
          if(!pick||s<pick.s) pick={a,pos,v,s};
        }
        if(pick&&pick.v<=174) slots.push(pick);
      }
      if(slots.length<12){if(log)log(`SKEWED rail ${label} MISS refine samples=${slots.length}`);return null;}

      let keep=slots.slice(), model=null, residualMed=99;
      for(let iter=0;iter<4;iter++){
        if(keep.length<10) return null;
        let sa=0,sp=0,saa=0,sap=0,n=keep.length;
        for(const q of keep){sa+=q.a;sp+=q.pos;saa+=q.a*q.a;sap+=q.a*q.pos;}
        const den=n*saa-sa*sa;
        const m=Math.abs(den)>1e-7?(n*sap-sa*sp)/den:0,b=(sp-m*sa)/n;
        model={axis,m,b};
        const rs=keep.map(q=>Math.abs(q.pos-(m*q.a+b))).sort((a,b)=>a-b);
        residualMed=rs[Math.floor(rs.length/2)]||0;
        const tol=Math.max(2.2,Math.min(6,residualMed*2.8+1.4));
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
      model.atTap=model.m*tapA+model.b;
      model.tapDistance=Math.abs(model.atTap-tapCross);
      if(model.coverage<.50||model.support<.26||residualMed>5.4||Math.abs(model.m)>.52) return null;
      // The refined rail must remain on the correct side of the tap.
      if((side==='neg'&&model.atTap>=tapCross-3)||(side==='pos'&&model.atTap<=tapCross+3)) return null;
      if(log) log(`SKEWED rail ${label} HIT m=${model.m.toFixed(3)} d=${model.tapDistance.toFixed(1)} support=${model.support.toFixed(2)} cover=${model.coverage.toFixed(2)}`);
      return model;
    };

    // Search spans are deliberately broader than the seed, but selection is
    // tap-local. This lets a slanted side reach its true corners without letting
    // a distant page rail win simply because it is longer.
    const padX=Math.min(w*.12,Math.max(18,rw*.20));
    const padY=Math.min(h*.12,Math.max(18,rh*.20));
    const sx0=Math.max(2,x0-padX), sx1=Math.min(w-3,x1+padX);
    const sy0=Math.max(2,y0-padY), sy1=Math.min(h-3,y1+padY);
    const top=acquireTapRail('H','neg',sx0,sx1,'top');
    const bottom=acquireTapRail('H','pos',sx0,sx1,'bottom');
    const left=acquireTapRail('V','neg',sy0,sy1,'left');
    const right=acquireTapRail('V','pos',sy0,sy1,'right');
    const sides=[top,bottom,left,right].filter(Boolean).length;
    if(sides<4){if(log)log(`SKEWED MISS rails=${sides}/4`);return null;}

    const intersect=(hl,vl)=>{
      const den=1-hl.m*vl.m;
      if(Math.abs(den)<.08) return null;
      const x=(vl.m*hl.b+vl.b)/den,y=hl.m*x+hl.b;
      return{x,y};
    };
    const q=[intersect(top,left),intersect(top,right),intersect(bottom,right),intersect(bottom,left)];
    if(q.some(p=>!p||!Number.isFinite(p.x)||!Number.isFinite(p.y))) return null;

    const cross=(a,b,c)=>(b.x-a.x)*(c.y-b.y)-(b.y-a.y)*(c.x-b.x);
    const cs=[cross(q[0],q[1],q[2]),cross(q[1],q[2],q[3]),cross(q[2],q[3],q[0]),cross(q[3],q[0],q[1])];
    if(!(cs.every(v=>v>0)||cs.every(v=>v<0))){if(log)log('SKEWED MISS non-convex');return null;}

    const area=Math.abs(q.reduce((s,p,i)=>{const n=q[(i+1)%4];return s+p.x*n.y-n.x*p.y;},0)/2);
    const seedArea=rw*rh;
    if(area<seedArea*.32||area>seedArea*1.65){if(log)log(`SKEWED MISS area ratio=${(area/seedArea).toFixed(2)}`);return null;}

    const pointInQuad=(p,poly)=>{
      let sign=0;
      for(let i=0;i<4;i++){
        const a=poly[i],b=poly[(i+1)%4];
        const z=(b.x-a.x)*(p.y-a.y)-(b.y-a.y)*(p.x-a.x);
        if(Math.abs(z)<1e-6) continue;
        const s=z>0?1:-1;
        if(!sign)sign=s;else if(sign!==s)return false;
      }
      return true;
    };
    if(!pointInQuad({x:tx,y:ty},q)){if(log)log('SKEWED MISS tap outside polygon');return null;}

    // Guard against the V2.78.07 page-sized failure: every chosen rail must be
    // reasonably local to the tap compared with the seed's own extent.
    const maxLocalX=Math.max(rw*.90,48), maxLocalY=Math.max(rh*.90,48);
    if(left.tapDistance>maxLocalX||right.tapDistance>maxLocalX||top.tapDistance>maxLocalY||bottom.tapDistance>maxLocalY){
      if(log)log(`SKEWED MISS nonlocal enclosure d=${top.tapDistance.toFixed(0)}/${right.tapDistance.toFixed(0)}/${bottom.tapDistance.toFixed(0)}/${left.tapDistance.toFixed(0)}`);
      return null;
    }

    const slopeSignal=Math.max(Math.abs(top.m),Math.abs(bottom.m),Math.abs(left.m),Math.abs(right.m));
    const opposingDivergence=Math.max(Math.abs(top.m-bottom.m),Math.abs(left.m-right.m));
    const trustedOblique=[top,bottom,left,right].some(r=>Math.abs(r.m)>=.045&&r.support>=.38&&r.coverage>=.60);
    if(!trustedOblique&&opposingDivergence<.038&&slopeSignal<.028){
      if(log)log(`SKEWED DECLINE slope=${slopeSignal.toFixed(3)} div=${opposingDivergence.toFixed(3)}`);
      return null;
    }

    const clamp=v=>Math.max(0,Math.min(1,v));
    const nq=q.map(p=>({x:clamp(p.x/(w-1)),y:clamp(p.y/(h-1))}));
    const out={...panel,_quad:nq,_geometryType:'skewed-tap-enclosure'};
    if(log) log(`SKEWED HIT tap-enclosure slope=${slopeSignal.toFixed(3)} div=${opposingDivergence.toFixed(3)} area=${(area/seedArea).toFixed(2)} d=${[top,right,bottom,left].map(r=>r.tapDistance.toFixed(0)).join('/')}`);
    return out;
  }
};
