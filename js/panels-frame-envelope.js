// NTH SHELF V2.78.15 — FINITE RAIL ENDPOINTS
//
// Recover one connected four-sided frame around the tapped panel, but treat
// every fitted rail as a FINITE supported segment rather than an infinite line.
// Corners may only be formed where the supported spans of neighboring rails
// actually approach the same intersection.  This prevents a legitimate slanted
// rail from being extrapolated hundreds of pixels into a wild corner.

const PanelFrameEnvelope = {
  detect(imgUrl, panel, log) {
    if (!imgUrl || !panel) return Promise.resolve(null);
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        try { resolve(this._detect(img, panel, log)); }
        catch (err) {
          console.warn('Connected frame failed:', err);
          if (log) log(`FINITE RAIL ERROR ${err.message}`);
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = imgUrl;
    });
  },

  _detect(img, panel, log) {
    const maxDim=900;
    const scale=Math.min(1,maxDim/Math.max(img.width,img.height));
    const w=Math.max(1,Math.round(img.width*scale));
    const h=Math.max(1,Math.round(img.height*scale));
    const canvas=document.createElement('canvas'); canvas.width=w; canvas.height=h;
    const ctx=canvas.getContext('2d',{willReadFrequently:true});
    ctx.drawImage(img,0,0,w,h);
    const rgba=ctx.getImageData(0,0,w,h).data;
    const lum=new Uint8Array(w*h);
    for(let i=0,j=0;i<rgba.length;i+=4,j++) lum[j]=Math.round(.299*rgba[i]+.587*rgba[i+1]+.114*rgba[i+2]);

    const x0=Math.max(2,Math.round(panel.x*w));
    const y0=Math.max(2,Math.round(panel.y*h));
    const x1=Math.min(w-3,Math.round((panel.x+panel.w)*w)-1);
    const y1=Math.min(h-3,Math.round((panel.y+panel.h)*h)-1);
    const rw=x1-x0+1,rh=y1-y0+1;
    if(rw<30||rh<30)return null;

    const tap=panel._tap||{x:panel.x+panel.w/2,y:panel.y+panel.h/2};
    const tx=Math.max(2,Math.min(w-3,tap.x*(w-1)));
    const ty=Math.max(2,Math.min(h-3,tap.y*(h-1)));
    if(log)log(`FINITE RAIL start tap=${tx.toFixed(1)},${ty.toFixed(1)} seed=${x0},${y0}-${x1},${y1}`);

    const pixelLum=(x,y)=>{
      x=Math.max(1,Math.min(w-2,Math.round(x))); y=Math.max(1,Math.min(h-2,Math.round(y)));
      return (lum[(y-1)*w+x]+lum[y*w+x]+lum[(y+1)*w+x]+lum[y*w+x-1]+lum[y*w+x+1])/5;
    };

    // A rail is fitted as one coherent line near the OUTSIDE of the stable seed.
    // We reward long continuous support and proximity to the nearest enclosing
    // boundary at the tap.  This prevents a stronger far-away page border from
    // winning over the panel divider the tap actually sits behind.
    const fitRail=(kind)=>{
      const horizontal=kind==='top'||kind==='bottom';
      const negative=kind==='top'||kind==='left';
      const seedCross=kind==='top'?y0:kind==='bottom'?y1:kind==='left'?x0:x1;
      const tapCross=horizontal?ty:tx;
      const along0=horizontal?x0:y0, along1=horizontal?x1:y1;
      const alongSpan=horizontal?rw:rh, crossSpan=horizontal?rh:rw;
      const dimAlong=horizontal?w:h, dimCross=horizontal?h:w;
      const outward=Math.max(22,Math.min(dimCross*.18,crossSpan*.80));
      const inward=Math.max(4,crossSpan*.07);
      const anchorLo=negative?seedCross-outward:seedCross-inward;
      const anchorHi=negative?seedCross+inward:seedCross+outward;
      const a0=Math.max(2,Math.round(along0-alongSpan*.10));
      const a1=Math.min(dimAlong-3,Math.round(along1+alongSpan*.10));
      const step=Math.max(2,Math.round((a1-a0)/120));
      let best=null;

      const evaluate=(m,anchor)=>{
        const b=anchor-m*(horizontal?tx:ty);
        const atTap=m*(horizontal?tx:ty)+b;
        if(negative&&atTap>=tapCross-4)return null;
        if(!negative&&atTap<=tapCross+4)return null;
        if(negative&&atTap>seedCross+inward)return null;
        if(!negative&&atTap<seedCross-inward)return null;
        let n=0,dark=0,strong=0,longest=0,run=0,segments=0,inSeg=false;
        for(let a=a0;a<=a1;a+=step){
          const p=m*a+b;
          if(p<2||p>=dimCross-2){run=0;inSeg=false;continue;}
          const v=horizontal?pixelLum(a,p):pixelLum(p,a); n++;
          if(v<=172){dark++;run++;if(run>longest)longest=run;if(!inSeg){segments++;inSeg=true;}}else{run=0;inSeg=false;}
          if(v<=112)strong++;
        }
        if(n<16)return null;
        const support=dark/n, continuity=longest/n, strongRate=strong/n;
        if(support<.34||continuity<.18)return null;
        const outwardDist=negative?seedCross-atTap:atTap-seedCross;
        const nearestPenalty=Math.max(0,outwardDist)/Math.max(25,outward)*.40;
        const fragmentationPenalty=Math.max(0,segments-4)*.035;
        const score=support*2.35+continuity*1.8+strongRate*.45-nearestPenalty-fragmentationPenalty;

        // V2.78.15: record the finite span where this rail is actually supported.
        // Small gaps are bridged, but we do not allow the fitted line to become
        // an infinite geometric object later.
        const samples=[];
        for(let a=a0;a<=a1;a+=step){
          const p=m*a+b;
          if(p<2||p>=dimCross-2)continue;
          const v=horizontal?pixelLum(a,p):pixelLum(p,a);
          samples.push({a,dark:v<=178,strong:v<=128});
        }
        let bestStart=null,bestEnd=null,curStart=null,lastDark=null,bestLen=-1;
        const maxGap=Math.max(step*3,8);
        for(const sm of samples){
          if(sm.dark){
            if(curStart===null || (lastDark!==null && sm.a-lastDark>maxGap)) curStart=sm.a;
            lastDark=sm.a;
            const len=lastDark-curStart;
            if(len>bestLen){bestLen=len;bestStart=curStart;bestEnd=lastDark;}
          }
        }
        if(bestStart===null||bestEnd===null||bestEnd-bestStart<Math.max(12,alongSpan*.16))return null;
        return {kind,horizontal,m,b,anchor,atTap,support,continuity,strongRate,segments,score,span0:bestStart,span1:bestEnd,spanLen:bestEnd-bestStart};
      };

      for(let m=-.65;m<=.65+1e-9;m+=.035){
        for(let anchor=anchorLo;anchor<=anchorHi;anchor+=3){
          const c=evaluate(m,anchor); if(c&&(!best||c.score>best.score))best=c;
        }
      }
      if(best){
        let fine=best;
        for(let m=Math.max(-.70,best.m-.055);m<=Math.min(.70,best.m+.055)+1e-9;m+=.006){
          for(let anchor=best.anchor-9;anchor<=best.anchor+9;anchor+=1){
            const c=evaluate(m,anchor); if(c&&c.score>fine.score)fine=c;
          }
        }
        best=fine;
      }
      if(log)log(best?`FINITE RAIL ${kind} HIT m=${best.m.toFixed(3)} support=${best.support.toFixed(2)} cont=${best.continuity.toFixed(2)} span=${best.span0.toFixed(0)}-${best.span1.toFixed(0)} atTap=${best.atTap.toFixed(1)}`:`FINITE RAIL ${kind} MISS`);
      return best;
    };

    const top=fitRail('top'),bottom=fitRail('bottom'),left=fitRail('left'),right=fitRail('right');
    const rails=[top,bottom,left,right];
    if(rails.some(r=>!r)){if(log)log(`FINITE RAIL MISS rails=${rails.filter(Boolean).length}/4`);return null;}

    const intersect=(hl,vl)=>{
      const den=1-hl.m*vl.m;
      if(Math.abs(den)<.08)return null;
      const x=(vl.m*hl.b+vl.b)/den;
      return {x,y:hl.m*x+hl.b};
    };
    const q=[intersect(top,left),intersect(top,right),intersect(bottom,right),intersect(bottom,left)];
    if(q.some(p=>!p||!Number.isFinite(p.x)||!Number.isFinite(p.y))){if(log)log('FINITE RAIL MISS intersections');return null;}

    // V2.78.15: an intersection is legal only when it lies close to the ACTUAL
    // supported span of both rails.  A small extension is allowed for thick or
    // interrupted ink, but not unlimited extrapolation.
    const spanContains=(rail,p)=>{
      const a=rail.horizontal?p.x:p.y;
      const pad=Math.max(12,Math.min(34,rail.spanLen*.10));
      return a>=rail.span0-pad && a<=rail.span1+pad;
    };
    const finitePairs=[[top,left],[top,right],[bottom,right],[bottom,left]];
    for(let i=0;i<4;i++){
      const [ra,rb]=finitePairs[i], p=q[i];
      const okA=spanContains(ra,p),okB=spanContains(rb,p);
      if(log)log(`FINITE RAIL corner ${i} raw=${p.x.toFixed(1)},${p.y.toFixed(1)} spans=${okA?'Y':'N'}/${okB?'Y':'N'}`);
      if(!okA||!okB){if(log)log(`FINITE RAIL MISS corner-${i} beyond-supported-span`);return null;}
    }

    // A legal corner must be the intersection of the SAME two proven rails, and
    // both rails must carry dark support right up to that intersection.  The
    // vertex itself is never moved. This remains the connected-frame rule from V2.78.14; V2.78.15 additionally requires finite supported spans.
    const armSupport=(corner,hRail,vRail)=>{
      const radius=Math.max(6,Math.min(18,Math.round(Math.min(rw,rh)*.06)));
      let hs=0,hn=0,vs=0,vn=0;
      for(let d=-radius;d<=radius;d+=2){
        const x=corner.x+d, yh=hRail.m*x+hRail.b;
        if(x>=2&&x<w-2&&yh>=2&&yh<h-2){hs+=pixelLum(x,yh)<=178?1:0;hn++;}
        const y=corner.y+d, xv=vRail.m*y+vRail.b;
        if(y>=2&&y<h-2&&xv>=2&&xv<w-2){vs+=pixelLum(xv,y)<=178?1:0;vn++;}
      }
      return {h:hn?hs/hn:0,v:vn?vs/vn:0};
    };
    const pairs=[[top,left],[top,right],[bottom,right],[bottom,left]];
    for(let i=0;i<4;i++){
      const p=q[i];
      if(p.x<-8||p.x>w+8||p.y<-8||p.y>h+8){if(log)log(`FINITE RAIL MISS corner-${i} outside`);return null;}
      const a=armSupport(p,pairs[i][0],pairs[i][1]);
      if(log)log(`FINITE RAIL corner ${i} x=${p.x.toFixed(1)} y=${p.y.toFixed(1)} arms=${a.h.toFixed(2)}/${a.v.toFixed(2)}`);
      if(a.h<.28||a.v<.28){if(log)log(`FINITE RAIL MISS corner-${i} disconnected`);return null;}
    }

    const cross=(a,b,c)=>(b.x-a.x)*(c.y-b.y)-(b.y-a.y)*(c.x-b.x);
    const cs=[cross(q[0],q[1],q[2]),cross(q[1],q[2],q[3]),cross(q[2],q[3],q[0]),cross(q[3],q[0],q[1])];
    if(!(cs.every(v=>v>0)||cs.every(v=>v<0))){if(log)log('FINITE RAIL MISS non-convex');return null;}

    const area=Math.abs(q.reduce((s,p,i)=>{const n=q[(i+1)%4];return s+p.x*n.y-n.x*p.y;},0)/2);
    const areaRatio=area/(rw*rh);
    if(areaRatio<.60||areaRatio>1.85){if(log)log(`FINITE RAIL MISS whole-frame area=${areaRatio.toFixed(2)}`);return null;}

    const pointInPoly=(x,y,poly)=>{let inside=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if(((a.y>y)!==(b.y>y))&&(x<(b.x-a.x)*(y-a.y)/(b.y-a.y+1e-9)+a.x))inside=!inside;}return inside;};
    if(!pointInPoly(tx,ty,q)){if(log)log('FINITE RAIL MISS tap outside');return null;}

    // Corners may escape the seed because the seed is axis-aligned, but not by
    // an unlimited amount. This remains a coarse sanity guard, not a snap rule.
    const sc=[{x:x0,y:y0},{x:x1,y:y0},{x:x1,y:y1},{x:x0,y:y1}];
    const tolX=Math.max(30,rw*.62),tolY=Math.max(30,rh*.62);
    for(let i=0;i<4;i++){
      const dx=Math.abs(q[i].x-sc[i].x),dy=Math.abs(q[i].y-sc[i].y);
      if(dx>tolX||dy>tolY){if(log)log(`FINITE RAIL MISS corner-${i} seed-drift=${dx.toFixed(1)}/${dy.toFixed(1)}`);return null;}
    }

    const quad=q.map(p=>({x:p.x/(w-1),y:p.y/(h-1)}));
    const xs=quad.map(p=>p.x),ys=quad.map(p=>p.y);
    const bx=Math.max(0,Math.min(...xs)),by=Math.max(0,Math.min(...ys));
    const br=Math.min(1,Math.max(...xs)),bb=Math.min(1,Math.max(...ys));
    const confidence=Math.min(1,rails.reduce((s,r)=>s+r.support+r.continuity,0)/8);
    if(log)log(`FINITE RAIL HIT area=${areaRatio.toFixed(2)} confidence=${confidence.toFixed(2)} quad=${quad.map(p=>`${p.x.toFixed(3)},${p.y.toFixed(3)}`).join(' | ')}`);
    return {...panel,x:bx,y:by,w:Math.max(.001,br-bx),h:Math.max(.001,bb-by),_quad:quad,_geometryType:'connected-frame',_frameEnvelope:{confidence,areaRatio,sides:4,connected:true}};
  }
};
