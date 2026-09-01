// NTH SHELF V2.78.12 — FRAME ENVELOPE
//
// Purpose: given the stable panel seed from panels.js, recover the COMPLETE
// enclosing four-sided frame around the tap BEFORE deciding whether that frame
// is orthogonal or skewed.  This module deliberately does not assign geometry
// ownership.  It returns a four-corner envelope only when all four sides behave
// like outer boundaries of the seed rather than small interior slivers.

const PanelFrameEnvelope = {
  detect(imgUrl, panel, log) {
    if (!imgUrl || !panel) return Promise.resolve(null);
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        try { resolve(this._detect(img, panel, log)); }
        catch (err) {
          console.warn('Frame envelope failed:', err);
          if (log) log(`ENVELOPE ERROR ${err.message}`);
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = imgUrl;
    });
  },

  _detect(img, panel, log) {
    const maxDim = 900;
    const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
    const w = Math.max(1, Math.round(img.width * scale));
    const h = Math.max(1, Math.round(img.height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d', { willReadFrequently:true });
    ctx.drawImage(img, 0, 0, w, h);
    const rgba = ctx.getImageData(0, 0, w, h).data;
    const lum = new Uint8Array(w*h);
    for (let i=0,j=0;i<rgba.length;i+=4,j++) {
      lum[j] = Math.round(.299*rgba[i] + .587*rgba[i+1] + .114*rgba[i+2]);
    }

    const x0 = Math.max(2, Math.round(panel.x*w));
    const y0 = Math.max(2, Math.round(panel.y*h));
    const x1 = Math.min(w-3, Math.round((panel.x+panel.w)*w)-1);
    const y1 = Math.min(h-3, Math.round((panel.y+panel.h)*h)-1);
    const rw=x1-x0+1, rh=y1-y0+1;
    if (rw<30 || rh<30) return null;

    const tap = panel._tap || {x:panel.x+panel.w/2,y:panel.y+panel.h/2};
    const tx = Math.max(2, Math.min(w-3, tap.x*(w-1)));
    const ty = Math.max(2, Math.min(h-3, tap.y*(h-1)));
    if (log) log(`ENVELOPE start tap=${tx.toFixed(1)},${ty.toFixed(1)} seed=${x0},${y0}-${x1},${y1}`);

    const pixelLum=(x,y)=>{
      x=Math.max(1,Math.min(w-2,Math.round(x)));
      y=Math.max(1,Math.min(h-2,Math.round(y)));
      return (lum[(y-1)*w+x]+lum[y*w+x]+lum[(y+1)*w+x]+lum[y*w+x-1]+lum[y*w+x+1])/5;
    };

    // Search one OUTER side. A valid envelope side may lean, but its position at
    // the tap must lie on the expected side of the tap and it may not intrude
    // deeply inside the stable seed. This is the anti-sliver rule.
    const fitOuterSide=(kind)=>{
      const horizontal=kind==='top'||kind==='bottom';
      const negative=kind==='top'||kind==='left';
      const alongSeed0=horizontal?x0:y0;
      const alongSeed1=horizontal?x1:y1;
      const seedCross=kind==='top'?y0:kind==='bottom'?y1:kind==='left'?x0:x1;
      const tapAlong=horizontal?tx:ty;
      const tapCross=horizontal?ty:tx;
      const crossSpan=horizontal?rh:rw;
      const alongSpan=horizontal?rw:rh;
      const dimensionCross=horizontal?h:w;
      const dimensionAlong=horizontal?w:h;

      // Allow expansion well outside the orthogonal seed, but only a small
      // amount inward. This lets trapezoid corners escape without selecting a
      // little shape from the middle of the panel.
      const outward=Math.max(24,Math.min(dimensionCross*.16,crossSpan*.72));
      const inward=Math.max(5,crossSpan*.10);
      const minAnchor=negative?seedCross-outward:seedCross-inward;
      const maxAnchor=negative?seedCross+inward:seedCross+outward;
      const a0=Math.max(2,Math.round(alongSeed0-alongSpan*.14));
      const a1=Math.min(dimensionAlong-3,Math.round(alongSeed1+alongSpan*.14));
      const sampleStep=Math.max(2,Math.round((a1-a0)/110));
      const slopeMax=.62;
      let best=null;

      for(let pass=0;pass<2;pass++){
        const mStep=pass===0?.035:.007;
        const pStep=pass===0?3:1;
        const mLo=best?Math.max(-slopeMax,best.m-.06):-slopeMax;
        const mHi=best?Math.min(slopeMax,best.m+.06):slopeMax;
        const pLo=best?Math.max(minAnchor,best.anchor-10):minAnchor;
        const pHi=best?Math.min(maxAnchor,best.anchor+10):maxAnchor;
        let passBest=best;
        for(let m=mLo;m<=mHi+1e-9;m+=mStep){
          for(let anchor=pLo;anchor<=pHi;anchor+=pStep){
            const b=anchor-m*tapAlong;
            const atTap=m*tapAlong+b;
            if(negative && atTap>=tapCross-4) continue;
            if(!negative && atTap<=tapCross+4) continue;
            // Prevent a candidate from sitting well inside the seed at the tap.
            if(negative && atTap>seedCross+inward) continue;
            if(!negative && atTap<seedCross-inward) continue;

            let n=0,dark=0,strong=0,longest=0,run=0,sum=0;
            for(let a=a0;a<=a1;a+=sampleStep){
              const p=m*a+b;
              if(p<2||p>=dimensionCross-2){run=0;continue;}
              const v=horizontal?pixelLum(a,p):pixelLum(p,a);
              n++;sum+=v;
              if(v<=170){dark++;run++;if(run>longest)longest=run;}else run=0;
              if(v<=112)strong++;
            }
            if(n<14)continue;
            const support=dark/n, continuity=longest/n, strongRate=strong/n;
            if(support<.34||continuity<.16)continue;

            const outwardDist=negative?seedCross-atTap:atTap-seedCross;
            const interiorPenalty=outwardDist<0?Math.abs(outwardDist)/Math.max(6,inward):0;
            const distancePenalty=Math.max(0,outwardDist)/Math.max(30,outward)*.16;
            const score=support*2.35+continuity*1.55+strongRate*.5-(sum/n)/500-interiorPenalty*.9-distancePenalty;
            const cand={kind,horizontal,m,b,anchor,atTap,support,continuity,strongRate,score};
            if(!passBest||score>passBest.score)passBest=cand;
          }
        }
        best=passBest;
      }
      if(log) log(best
        ? `ENVELOPE side ${kind} HIT m=${best.m.toFixed(3)} support=${best.support.toFixed(2)} cont=${best.continuity.toFixed(2)} atTap=${best.atTap.toFixed(1)}`
        : `ENVELOPE side ${kind} MISS`);
      return best;
    };

    const top=fitOuterSide('top'),bottom=fitOuterSide('bottom'),left=fitOuterSide('left'),right=fitOuterSide('right');
    const sides=[top,bottom,left,right].filter(Boolean).length;
    if(sides<4){if(log)log(`ENVELOPE MISS rails=${sides}/4`);return null;}

    const intersect=(hl,vl)=>{
      const den=1-hl.m*vl.m;
      if(Math.abs(den)<.08)return null;
      const x=(vl.m*hl.b+vl.b)/den;
      return {x,y:hl.m*x+hl.b};
    };
    const q=[intersect(top,left),intersect(top,right),intersect(bottom,right),intersect(bottom,left)];
    if(q.some(p=>!p||!Number.isFinite(p.x)||!Number.isFinite(p.y))){if(log)log('ENVELOPE MISS intersections');return null;}

    const cross=(a,b,c)=>(b.x-a.x)*(c.y-b.y)-(b.y-a.y)*(c.x-b.x);
    const cs=[cross(q[0],q[1],q[2]),cross(q[1],q[2],q[3]),cross(q[2],q[3],q[0]),cross(q[3],q[0],q[1])];
    if(!(cs.every(v=>v>0)||cs.every(v=>v<0))){if(log)log('ENVELOPE MISS non-convex');return null;}

    const area=Math.abs(q.reduce((s,p,i)=>{const n=q[(i+1)%4];return s+p.x*n.y-n.x*p.y;},0)/2);
    const areaRatio=area/(rw*rh);
    // Whole-frame requirement. Tiny interior slivers are rejected outright.
    if(areaRatio<.58||areaRatio>2.05){if(log)log(`ENVELOPE MISS whole-frame area=${areaRatio.toFixed(2)}`);return null;}

    // Tap must be inside the recovered envelope.
    const pointInPoly=(x,y,poly)=>{
      let inside=false;
      for(let i=0,j=poly.length-1;i<poly.length;j=i++){
        const a=poly[i],b=poly[j];
        if(((a.y>y)!==(b.y>y))&&(x<(b.x-a.x)*(y-a.y)/(b.y-a.y+1e-9)+a.x))inside=!inside;
      }
      return inside;
    };
    if(!pointInPoly(tx,ty,q)){if(log)log('ENVELOPE MISS tap outside');return null;}

    // Every corner should still correspond to its seed quadrant, but can escape
    // significantly outward on a skewed frame.
    const seedCorners=[{x:x0,y:y0},{x:x1,y:y0},{x:x1,y:y1},{x:x0,y:y1}];
    const tolX=Math.max(28,rw*.70),tolY=Math.max(28,rh*.70);
    for(let i=0;i<4;i++){
      const dx=Math.abs(q[i].x-seedCorners[i].x),dy=Math.abs(q[i].y-seedCorners[i].y);
      if(dx>tolX||dy>tolY){if(log)log(`ENVELOPE MISS corner-${i} dx=${dx.toFixed(1)} dy=${dy.toFixed(1)}`);return null;}
    }

    const quad=q.map(p=>({x:p.x/(w-1),y:p.y/(h-1)}));
    const xs=quad.map(p=>p.x),ys=quad.map(p=>p.y);
    const bx=Math.max(0,Math.min(...xs)),by=Math.max(0,Math.min(...ys));
    const br=Math.min(1,Math.max(...xs)),bb=Math.min(1,Math.max(...ys));
    const confidence=Math.min(1,[top,bottom,left,right].reduce((s,r)=>s+r.support+r.continuity,0)/8);
    if(log)log(`ENVELOPE HIT area=${areaRatio.toFixed(2)} confidence=${confidence.toFixed(2)} quad=${quad.map(p=>`${p.x.toFixed(3)},${p.y.toFixed(3)}`).join(' | ')}`);
    return {
      ...panel,
      x:bx,y:by,w:Math.max(.001,br-bx),h:Math.max(.001,bb-by),
      _quad:quad,
      _geometryType:'frame-envelope',
      _frameEnvelope:{confidence,areaRatio,sides:4}
    };
  }
};
