// NTH SHELF V2.78.17 — CHAIN-CONNECTED RAIL FAMILY / CLOSED-LOOP TEST
//
// Generate multiple plausible finite rails per side, then choose one four-rail
// FAMILY that closes around the tap.  Rails are no longer selected independently.
// A strong distant line loses if it cannot connect top -> right -> bottom -> left
// -> top using direct or tightly bounded short-bridge corner evidence.

const PanelFrameEnvelope = {
  detect(imgUrl, panel, log) {
    if (!imgUrl || !panel) return Promise.resolve(null);
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        try { resolve(this._detect(img, panel, log)); }
        catch (err) {
          console.warn('Connected frame failed:', err);
          if (log) log(`CHAIN RAIL ERROR ${err.message}`);
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
    if(log)log(`CHAIN RAIL start tap=${tx.toFixed(1)},${ty.toFixed(1)} seed=${x0},${y0}-${x1},${y1}`);

    const pixelLum=(x,y)=>{
      x=Math.max(1,Math.min(w-2,Math.round(x))); y=Math.max(1,Math.min(h-2,Math.round(y)));
      return (lum[(y-1)*w+x]+lum[y*w+x]+lum[(y+1)*w+x]+lum[y*w+x-1]+lum[y*w+x+1])/5;
    };

    // V2.78.17: generate several plausible finite rails for each side instead
    // of independently choosing one "best" line.  A later family search picks
    // the four rails that actually close into one coherent enclosure around
    // the tap.  This is the key change from V2.78.17.
    const railCandidates=(kind)=>{
      const horizontal=kind==='top'||kind==='bottom';
      const negative=kind==='top'||kind==='left';
      const seedCross=kind==='top'?y0:kind==='bottom'?y1:kind==='left'?x0:x1;
      const tapCross=horizontal?ty:tx;
      const along0=horizontal?x0:y0, along1=horizontal?x1:y1;
      const alongSpan=horizontal?rw:rh, crossSpan=horizontal?rh:rw;
      const dimAlong=horizontal?w:h, dimCross=horizontal?h:w;
      const outward=Math.max(22,Math.min(dimCross*.20,crossSpan*.92));
      const inward=Math.max(4,crossSpan*.08);
      const anchorLo=negative?seedCross-outward:seedCross-inward;
      const anchorHi=negative?seedCross+inward:seedCross+outward;
      const a0=Math.max(2,Math.round(along0-alongSpan*.12));
      const a1=Math.min(dimAlong-3,Math.round(along1+alongSpan*.12));
      const step=Math.max(2,Math.round((a1-a0)/120));
      const pool=[];

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
        if(support<.33||continuity<.17)return null;
        const outwardDist=negative?seedCross-atTap:atTap-seedCross;
        const nearestPenalty=Math.max(0,outwardDist)/Math.max(25,outward)*.30;
        const fragmentationPenalty=Math.max(0,segments-4)*.032;
        const score=support*2.30+continuity*1.75+strongRate*.45-nearestPenalty-fragmentationPenalty;

        const samples=[];
        for(let a=a0;a<=a1;a+=step){
          const p=m*a+b;
          if(p<2||p>=dimCross-2)continue;
          const v=horizontal?pixelLum(a,p):pixelLum(p,a);
          samples.push({a,dark:v<=178});
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
        if(bestStart===null||bestEnd===null||bestEnd-bestStart<Math.max(12,alongSpan*.15))return null;
        return {kind,horizontal,m,b,anchor,atTap,support,continuity,strongRate,segments,score,span0:bestStart,span1:bestEnd,spanLen:bestEnd-bestStart};
      };

      for(let m=-.68;m<=.68+1e-9;m+=.040){
        for(let anchor=anchorLo;anchor<=anchorHi;anchor+=4){
          const c=evaluate(m,anchor); if(c)pool.push(c);
        }
      }
      pool.sort((a,b)=>b.score-a.score);
      const kept=[];
      for(const c of pool){
        if(kept.some(k=>Math.abs(k.atTap-c.atTap)<7 && Math.abs(k.m-c.m)<.08))continue;
        kept.push(c);
        if(kept.length>=7)break;
      }
      // Fine-refit only the retained hypotheses.
      for(let i=0;i<kept.length;i++){
        let best=kept[i];
        for(let m=Math.max(-.72,best.m-.05);m<=Math.min(.72,best.m+.05)+1e-9;m+=.008){
          for(let anchor=best.anchor-8;anchor<=best.anchor+8;anchor+=2){
            const c=evaluate(m,anchor); if(c&&c.score>best.score)best=c;
          }
        }
        kept[i]=best;
      }
      kept.sort((a,b)=>b.score-a.score);
      if(log)log(`CHAIN ${kind} candidates=${kept.length}${kept[0]?` best@tap=${kept[0].atTap.toFixed(1)} m=${kept[0].m.toFixed(3)} sup=${kept[0].support.toFixed(2)}`:''}`);
      return kept;
    };

    const tops=railCandidates('top'), bottoms=railCandidates('bottom'), lefts=railCandidates('left'), rights=railCandidates('right');
    if(!tops.length||!bottoms.length||!lefts.length||!rights.length){
      if(log)log(`CHAIN MISS candidate sides=${[tops,bottoms,lefts,rights].filter(a=>a.length).length}/4`);
      return null;
    }

    const intersect=(hl,vl)=>{
      const den=1-hl.m*vl.m;
      if(Math.abs(den)<.08)return null;
      const x=(vl.m*hl.b+vl.b)/den;
      return {x,y:hl.m*x+hl.b};
    };


    const alongAt=(rail,p)=>rail.horizontal?p.x:p.y;
    const basePad=(rail)=>Math.max(8,Math.min(22,rail.spanLen*.07));
    const overrun=(rail,p)=>{
      const a=alongAt(rail,p),pad=basePad(rail);
      if(a<rail.span0-pad)return rail.span0-a-pad;
      if(a>rail.span1+pad)return a-rail.span1-pad;
      return 0;
    };
    const endpointFor=(rail,p)=>{
      const a=alongAt(rail,p);
      const ea=Math.abs(a-rail.span0)<=Math.abs(a-rail.span1)?rail.span0:rail.span1;
      return rail.horizontal?{x:ea,y:rail.m*ea+rail.b}:{x:rail.m*ea+rail.b,y:ea};
    };
    const endpointInk=(rail,ep)=>{
      let hit=0,n=0;
      for(let d=-8;d<=8;d+=2){
        const a=(rail.horizontal?ep.x:ep.y)+d;
        const c=rail.m*a+rail.b;
        const x=rail.horizontal?a:c,y=rail.horizontal?c:a;
        if(x>=2&&x<w-2&&y>=2&&y<h-2){hit+=pixelLum(x,y)<=180?1:0;n++;}
      }
      return n?hit/n:0;
    };
    const cornerFit=(ra,rb,p)=>{
      if(!p||!Number.isFinite(p.x)||!Number.isFinite(p.y))return null;
      const oa=overrun(ra,p),ob=overrun(rb,p);
      const ea=endpointFor(ra,p),eb=endpointFor(rb,p);
      const da=Math.hypot(p.x-ea.x,p.y-ea.y),db=Math.hypot(p.x-eb.x,p.y-eb.y);
      const gap=Math.hypot(ea.x-eb.x,ea.y-eb.y);
      const bridgeMax=Math.max(10,Math.min(34,Math.min(rw,rh)*.11));
      const totalMax=Math.max(18,Math.min(54,Math.min(rw,rh)*.18));
      const ia=endpointInk(ra,ea),ib=endpointInk(rb,eb);
      const direct=oa<=0&&ob<=0;
      const bridged=!direct && da<=bridgeMax && db<=bridgeMax && gap<=totalMax && ia>=.30 && ib>=.30;
      if(!direct&&!bridged)return null;
      // Family score favors literal contact, short endpoint gaps and real endpoint ink.
      const penalty=(da+db)/Math.max(1,bridgeMax)*.28 + gap/Math.max(1,totalMax)*.20;
      return {direct,bridged,da,db,gap,ia,ib,score:(direct?.70:.35)+(ia+ib)*.22-penalty};
    };

    // CHAIN-CONNECTED FAMILY SEARCH:
    // top -> right -> bottom -> left -> back to top.  We score complete loops,
    // not isolated rails.  Thus a very strong far-away right rail cannot win if
    // it does not connect to the same top and bottom family as the other sides.
    let family=null;
    for(const top of tops)for(const right of rights){
      const q1=intersect(top,right), c1=cornerFit(top,right,q1); if(!c1)continue;
      for(const bottom of bottoms){
        const q2=intersect(bottom,right), c2=cornerFit(bottom,right,q2); if(!c2)continue;
        for(const left of lefts){
          const q3=intersect(bottom,left), c3=cornerFit(bottom,left,q3); if(!c3)continue;
          const q0=intersect(top,left), c0=cornerFit(top,left,q0); if(!c0)continue;
          const q=[q0,q1,q2,q3];
          if(q.some(p=>p.x<-10||p.x>w+10||p.y<-10||p.y>h+10))continue;
          const cross=(a,b,c)=>(b.x-a.x)*(c.y-b.y)-(b.y-a.y)*(c.x-b.x);
          const cs=[cross(q[0],q[1],q[2]),cross(q[1],q[2],q[3]),cross(q[2],q[3],q[0]),cross(q[3],q[0],q[1])];
          if(!(cs.every(v=>v>0)||cs.every(v=>v<0)))continue;
          const pointInPoly=(x,y,poly)=>{let inside=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if(((a.y>y)!==(b.y>y))&&(x<(b.x-a.x)*(y-a.y)/(b.y-a.y+1e-9)+a.x))inside=!inside;}return inside;};
          if(!pointInPoly(tx,ty,q))continue;
          const area=Math.abs(q.reduce((s,p,i)=>{const n=q[(i+1)%4];return s+p.x*n.y-n.x*p.y;},0)/2);
          const areaRatio=area/(rw*rh);
          if(areaRatio<.52||areaRatio>1.95)continue;
          const sc=[{x:x0,y:y0},{x:x1,y:y0},{x:x1,y:y1},{x:x0,y:y1}];
          const drift=q.reduce((sum,p,i)=>sum+Math.hypot(p.x-sc[i].x,p.y-sc[i].y),0)/4;
          const railScore=top.score+right.score+bottom.score+left.score;
          const cornerScore=c0.score+c1.score+c2.score+c3.score;
          const areaPenalty=Math.abs(Math.log(Math.max(.001,areaRatio)))*.55;
          const driftPenalty=drift/Math.max(40,Math.hypot(rw,rh))*.65;
          const score=railScore+cornerScore-areaPenalty-driftPenalty;
          if(!family||score>family.score)family={top,right,bottom,left,q,corners:[c0,c1,c2,c3],area,areaRatio,score,drift};
        }
      }
    }
    if(!family){if(log)log('CHAIN MISS no closed rail family around tap');return null;}
    const {top,right,bottom,left}=family;
    const rails=[top,bottom,left,right];
    const q=family.q;
    if(log)log(`CHAIN FAMILY HIT score=${family.score.toFixed(2)} area=${family.areaRatio.toFixed(2)} drift=${family.drift.toFixed(1)} rails=${[top,right,bottom,left].map(r=>`${r.kind}@${r.atTap.toFixed(1)}`).join(' -> ')}`);
    const finitePairs=[[top,left],[top,right],[bottom,right],[bottom,left]];
    const bridgeMeta=[];
    for(let i=0;i<4;i++){
      const [ra,rb]=finitePairs[i], p=q[i];
      const oa=overrun(ra,p),ob=overrun(rb,p);
      const ea=endpointFor(ra,p),eb=endpointFor(rb,p);
      const da=Math.hypot(p.x-ea.x,p.y-ea.y),db=Math.hypot(p.x-eb.x,p.y-eb.y);
      const endpointGap=Math.hypot(ea.x-eb.x,ea.y-eb.y);
      const bridgeMax=Math.max(10,Math.min(34,Math.min(rw,rh)*.11));
      const totalMax=Math.max(18,Math.min(54,Math.min(rw,rh)*.18));
      const ia=endpointInk(ra,ea),ib=endpointInk(rb,eb);
      const direct=oa<=0&&ob<=0;
      const bridged=!direct && da<=bridgeMax && db<=bridgeMax && endpointGap<=totalMax && ia>=.32 && ib>=.32;
      bridgeMeta[i]={direct,bridged,da,db,endpointGap,ia,ib,bridgeMax,totalMax};
      if(log)log(`CHAIN corner ${i} raw=${p.x.toFixed(1)},${p.y.toFixed(1)} direct=${direct?'Y':'N'} proj=${da.toFixed(1)}/${db.toFixed(1)} gap=${endpointGap.toFixed(1)} ink=${ia.toFixed(2)}/${ib.toFixed(2)} max=${bridgeMax.toFixed(1)}`);
      if(!direct&&!bridged){if(log)log(`CHAIN LOOP MISS corner-${i} endpoints do not converge`);return null;}
    }

    // Direct corners still require ink right up to the intersection. For a
    // V2.78.17 short-bridged corner, endpoint convergence replaces that literal
    // intersection-ink requirement; the vertex remains the SAME two-rail
    // intersection and is never independently snapped to unrelated artwork.
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
      if(p.x<-8||p.x>w+8||p.y<-8||p.y>h+8){if(log)log(`CHAIN RAIL MISS corner-${i} outside`);return null;}
      const a=armSupport(p,pairs[i][0],pairs[i][1]);
      const bm=bridgeMeta[i];
      if(log)log(`CHAIN corner ${i} x=${p.x.toFixed(1)} y=${p.y.toFixed(1)} arms=${a.h.toFixed(2)}/${a.v.toFixed(2)} mode=${bm.bridged?'BRIDGED':'DIRECT'}`);
      if(!bm.bridged && (a.h<.28||a.v<.28)){if(log)log(`CHAIN LOOP MISS corner-${i} disconnected`);return null;}
    }

    const cross=(a,b,c)=>(b.x-a.x)*(c.y-b.y)-(b.y-a.y)*(c.x-b.x);
    const cs=[cross(q[0],q[1],q[2]),cross(q[1],q[2],q[3]),cross(q[2],q[3],q[0]),cross(q[3],q[0],q[1])];
    if(!(cs.every(v=>v>0)||cs.every(v=>v<0))){if(log)log('CHAIN RAIL MISS non-convex');return null;}

    const area=Math.abs(q.reduce((s,p,i)=>{const n=q[(i+1)%4];return s+p.x*n.y-n.x*p.y;},0)/2);
    const areaRatio=area/(rw*rh);
    if(areaRatio<.60||areaRatio>1.85){if(log)log(`CHAIN RAIL MISS whole-frame area=${areaRatio.toFixed(2)}`);return null;}

    const pointInPoly=(x,y,poly)=>{let inside=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if(((a.y>y)!==(b.y>y))&&(x<(b.x-a.x)*(y-a.y)/(b.y-a.y+1e-9)+a.x))inside=!inside;}return inside;};
    if(!pointInPoly(tx,ty,q)){if(log)log('CHAIN RAIL MISS tap outside');return null;}

    // Corners may escape the seed because the seed is axis-aligned, but not by
    // an unlimited amount. This remains a coarse sanity guard, not a snap rule.
    const sc=[{x:x0,y:y0},{x:x1,y:y0},{x:x1,y:y1},{x:x0,y:y1}];
    const tolX=Math.max(30,rw*.62),tolY=Math.max(30,rh*.62);
    for(let i=0;i<4;i++){
      const dx=Math.abs(q[i].x-sc[i].x),dy=Math.abs(q[i].y-sc[i].y);
      if(dx>tolX||dy>tolY){if(log)log(`CHAIN RAIL MISS corner-${i} seed-drift=${dx.toFixed(1)}/${dy.toFixed(1)}`);return null;}
    }

    const quad=q.map(p=>({x:p.x/(w-1),y:p.y/(h-1)}));
    const xs=quad.map(p=>p.x),ys=quad.map(p=>p.y);
    const bx=Math.max(0,Math.min(...xs)),by=Math.max(0,Math.min(...ys));
    const br=Math.min(1,Math.max(...xs)),bb=Math.min(1,Math.max(...ys));
    const confidence=Math.min(1,rails.reduce((s,r)=>s+r.support+r.continuity,0)/8);
    if(log)log(`CHAIN LOOP HIT area=${areaRatio.toFixed(2)} confidence=${confidence.toFixed(2)} bridged=${bridgeMeta.filter(b=>b.bridged).length}/4 quad=${quad.map(p=>`${p.x.toFixed(3)},${p.y.toFixed(3)}`).join(' | ')}`);
    return {...panel,x:bx,y:by,w:Math.max(.001,br-bx),h:Math.max(.001,bb-by),_quad:quad,_geometryType:'chain-connected-frame',_frameEnvelope:{confidence,areaRatio,sides:4,connected:true,shortBridge:true,chainConnected:true,bridgedCorners:bridgeMeta.filter(b=>b.bridged).length}};
  }
};
