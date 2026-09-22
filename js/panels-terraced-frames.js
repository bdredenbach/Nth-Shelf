/* Nth Shelf Frame Test 11 — locally proved matte columns with edge bleed.
 * A page-wide quiet-margin requirement cannot describe artwork reaching the
 * image boundary. Two or more independently closed matte cells establish a
 * column; matching opposite rims and segmented colour-seam fits then prove
 * the neighbouring tall cell and outer strips. No page numbers or templates.
 * This route only supplements an otherwise empty stable identity map.
 */
const PanelTerracedFrames = (() => {
  'use strict';
  const METHOD='local-matte-stack-and-segmented-seams';
  const finite=Number.isFinite, range=(x,a,b)=>finite(x)&&x>=a&&x<=b;
  const at=(r,t)=>r.m*t+r.b;
  const quant=(a,p)=>{if(!a.length)return NaN;const b=a.slice().sort((x,y)=>x-y);return b[Math.floor((b.length-1)*p)];};
  function regress(pts){
    if(pts.length<12)return null;let sx=0,sy=0,sxx=0,sxy=0;
    for(const [x,y]of pts){sx+=x;sy+=y;sxx+=x*x;sxy+=x*y;}const n=pts.length,d=n*sxx-sx*sx;if(d<=0)return null;
    const m=(n*sxy-sx*sy)/d,b=(sy-m*sx)/n;
    return finite(m)&&finite(b)?{m,b,samples:n,residual:quant(pts.map(p=>Math.abs(p[1]-m*p[0]-b)),.9)}:null;
  }
  function robust(pts){
    let f=regress(pts);if(!f)return null;let clean=pts;
    for(let i=0;i<4;i++){clean=pts.filter(p=>Math.abs(p[1]-at(f,p[0]))<1.6);const next=regress(clean);if(!next)return null;f=next;}
    const t=(pts[0][0]+pts.at(-1)[0])/2,a=regress(clean.filter(p=>p[0]<t)),b=regress(clean.filter(p=>p[0]>=t));
    if(!a||!b||Math.abs(a.m-b.m)>.035||Math.abs(at(a,t)-at(b,t))>2.1||Math.abs(f.m)>.030||f.residual>1.05)return null;
    return {...f,totalSamples:pts.length,support:clean.length/pts.length,independentFits:[a,b]};
  }
  const meet=(a,b)=>{if(a.v)[a,b]=[b,a];const x=(b.b+b.m*a.b)/(1-a.m*b.m);return [x,a.m*x+a.b];};
  const quad=rs=>[meet(rs[0],rs[2]),meet(rs[0],rs[3]),meet(rs[1],rs[3]),meet(rs[1],rs[2])];
  const area=q=>q.reduce((s,p,i)=>{const a=q[(i+1)%q.length];return s+p[0]*a[1]-a[0]*p[1];},0)/2;
  const box=q=>[Math.min(...q.map(p=>p[0])),Math.min(...q.map(p=>p[1])),Math.max(...q.map(p=>p[0])),Math.max(...q.map(p=>p[1]))];
  function palette(rgba,w,h){
    const edges=[[],[],[],[]];
    for(let x=0;x<w;x+=2){edges[0].push(Array.from(rgba.slice(x*4,x*4+3)));const i=((h-1)*w+x)*4;edges[1].push(Array.from(rgba.slice(i,i+3)));}
    for(let y=0;y<h;y+=2){const i=y*w*4,j=(y*w+w-1)*4;edges[2].push(Array.from(rgba.slice(i,i+3)));edges[3].push(Array.from(rgba.slice(j,j+3)));}
    const border=edges.flat(),color=[0,1,2].map(c=>quant(border.map(p=>p[c]),.5));
    const matched=p=>p.every((x,c)=>Math.abs(x-color[c])<=6),fractions=edges.map(e=>e.filter(matched).length/e.length),support=border.filter(matched).length/border.length;
    if(color[0]*.299+color[1]*.587+color[2]*.114>25||support<.65||Math.max(...fractions)<.98)return null;
    const bg=new Uint8Array(w*h);for(let i=0;i<bg.length;i++)bg[i]=Number([0,1,2].every(c=>Math.abs(rgba[i*4+c]-color[c])<=5));
    return {bg,color,support,fractions};
  }
  function closedCells(bg,w,h){
    const labels=new Int32Array(bg.length),queue=new Int32Array(bg.length),cs=[];let id=0;
    for(let start=0;start<labels.length;start++)if(!bg[start]&&!labels[start]){
      if(++id>20000)return [];let head=0,n=1;queue[0]=start;labels[start]=id;let x0=w,y0=h,x1=0,y1=0;
      while(head<n){const i=queue[head++],x=i%w,y=i/w|0;x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);
        for(const j of [x?i-1:-1,x+1<w?i+1:-1,y?i-w:-1,y+1<h?i+w:-1])if(j>=0&&!bg[j]&&!labels[j]){labels[j]=id;queue[n++]=j;}
      }
      if(n<w*h*.045||x0<1||y0<1||x1>w-2||y1>h-2||x1-x0<w*.30||y1-y0<h*.085||y1-y0>h*.35||n/((x1-x0+1)*(y1-y0+1))<.90)continue;
      const rs=[];
      for(const v of [false,true])for(const side of [0,1]){
        const pts=[],lo=v?y0:x0,hi=v?y1:x1,begin=v?x0:y0,end=v?x1:y1;
        for(let t=lo+4;t<=hi-4;t++){let p=side?end:begin;while(p>=begin&&p<=end&&labels[v?t*w+p:p*w+t]!==id)p+=side?-1:1;if(p>=begin&&p<=end)pts.push([t,p+(side?.5:-.5)]);}
        const f=robust(pts);if(!f||f.support<.955)break;rs.push({...f,v,kind:'matte-cell',side,lo,hi});
      }
      if(rs.length!==4)continue;const q=quad(rs),A=area(q);if(A<w*h*.045||A>w*h*.30||n/A<.90||n/A>1.015)continue;
      const exterior=[];let good=true;
      for(let i=0;i<4;i++){
        const r=rs[i],lo=i<2?q[i===0?0:3][0]:q[i===2?0:1][1],hi=i<2?q[i===0?1:2][0]:q[i===2?3:2][1],dir=i%2?1:-1;let total=0,yes=0;
        for(let t=Math.ceil(lo)+4;t<hi-4;t++){let count=0;for(let d=1;d<=2;d++){const p=Math.round(at(r,t)+dir*d),x=r.v?p:t,y=r.v?t:p;if(x>=0&&x<w&&y>=0&&y<h)count+=bg[y*w+x];}total++;yes+=count>=1;}
        if(total<35||yes/total<.985){good=false;break;}exterior.push({samples:total,matched:yes,support:yes/total});
      }
      if(good)cs.push({rails:rs,q,pixelCount:n,exterior});
    }
    return cs;
  }
  function outside(bg,w,h,v,side,lo,hi){
    const T=v?h:w,P=v?w:h,pts=[];lo=Math.max(0,Math.ceil(lo)+4);hi=Math.min(T-1,Math.floor(hi)-4);
    for(let t=lo;t<=hi;t++){let p=side?P-1:0;while(p>=0&&p<P&&bg[v?t*w+p:p*w+t])p+=side?-1:1;if(p>=0&&p<P)pts.push([t,side?Math.min(P,p+.5):Math.max(0,p-.5)]);}
    if(pts.length<40||pts.length/(hi-lo+1)<.98)return null;
    // The physical image edge closes a crop even when a short patch of
    // equally dark ink touches it. Require witnessed artwork in a narrow
    // exterior collar over >=90% of the span, including both end quarters;
    // an inset edge or a long unwitnessed continuation cannot use this route.
    const distances=pts.map(p=>side?P-p[1]:p[1]),depth=Math.max(4,P*.010),hits=distances.map(d=>d<=depth);
    let gap=0,maxGap=0;for(const hit of hits){gap=hit?0:gap+1;maxGap=Math.max(maxGap,gap);}
    const count=hits.filter(Boolean).length,Q=Math.floor(hits.length/4),ends=[hits.slice(0,Q),hits.slice(-Q)].map(v=>v.filter(Boolean).length/v.length);
    if(count/hits.length>=.90&&ends.every(v=>v>=.90)&&maxGap<=Math.max(4,hits.length*.08))return {v,side,m:0,b:side?P:0,kind:'image-edge',lo,hi,samples:count,support:count/pts.length,residual:0,collar:depth,maxGap,endSupport:ends,totalSamples:pts.length};
    const f=robust(pts);if(!f||f.support<.98)return null;
    if(pts.some(p=>(side?P-p[1]:p[1])>P*.08))return null;
    return {...f,v,side,lo,hi,kind:'exterior-matte'};
  }
  function matteBand(bg,w,h,a,b,lo,hi){
    const v=a.v;let n=0,yes=0,pixels=0,matte=0,min=Infinity,max=0;
    for(let t=Math.ceil(lo)+4;t<hi-4;t++){
      const left=Math.min(at(a,t),at(b,t)),right=Math.max(at(a,t),at(b,t)),gap=right-left;
      if(gap<1.5||gap>Math.max(w,h)*.026)return null;min=Math.min(min,gap);max=Math.max(max,gap);
      let N=0,B=0;for(let p=Math.ceil(left)+1;p<Math.floor(right);p++){const x=v?p:t,y=v?t:p;if(x<0||x>=w||y<0||y>=h)return null;N++;B+=bg[y*w+x];}
      if(!N)continue;n++;yes+=B/N>=.90;pixels+=N;matte+=B;
    }
    if(n<40||yes/n<.94||matte/pixels<.96)return null;
    return {samples:n,matched:yes,support:yes/n,pixels,mattePixels:matte,matteFraction:matte/pixels,minGap:min,maxGap:max};
  }
  // Rejection only: a fully spanning, uniform neutral-ink stroke is a
  // divider even when it is lighter than the measured exterior matte. Red
  // crosshatching cannot qualify merely by following a partly dark chord.
  function uniformInkDivider(rgba,w,h,bounds,proposals){
    const gray=new Float32Array(w*h),ink=new Uint8Array(w*h);
    for(let i=0;i<ink.length;i++){const r=rgba[i*4],g=rgba[i*4+1],b=rgba[i*4+2];gray[i]=r*.299+g*.587+b*.114;ink[i]=Number(gray[i]<70&&Math.max(r,g,b)-Math.min(r,g,b)<=8);}
    for(const v of [false,true]){
      const [x0,y0,x1,y1]=bounds,lo=v?y0:x0,hi=v?y1:x1,a=v?x0:y0,b=v?x1:y1,margin=Math.max(12,(b-a)*.085),center=(lo+hi)/2;
      const ls=proposals.filter(r=>r.v===v&&Math.abs(r.m)<=.10).map(r=>({m:r.m,b:r.b}));
      for(let p=Math.ceil(a+margin);p<b-margin;p+=2)ls.push({m:0,b:p});
      const index=(t,p)=>v?t*w+p:p*w+t;
      for(const line of ls){
        if([lo,hi].some(t=>at(line,t)<=a+margin||at(line,t)>=b-margin))continue;
        let matched=0,total=0,sum=0,square=0;const points=[],core=[];
        for(let t=Math.ceil(lo)+3;t<hi-3;t++){
          const q=Math.round(at(line,t));let pick=-1,best=Infinity;total++;if(ink[index(t,q)])core.push(gray[index(t,q)]);
          for(let d=-2;d<=2;d++){const i=index(t,q+d);if(ink[i]&&gray[i]<best){best=gray[i];pick=q+d;}}
          if(pick<0)continue;let left=pick,right=pick;while(left>pick-7&&ink[index(t,left-1)])left--;while(right<pick+7&&ink[index(t,right+1)])right++;
          if(right-left>8||left===pick-7||right===pick+7)continue;
          let pre=0,post=0;for(let d=2;d<=4;d++){pre+=gray[index(t,left-d)];post+=gray[index(t,right+d)];}
          if(Math.min(pre/3-best,post/3-best)<18)continue;
          matched++;sum+=best;square+=best*best;points.push([t,(left+right)/2]);
        }
        // A genuine divider can meet dark artwork, temporarily hiding its
        // side contrast. Such gaps are admissible only when an independently
        // sampled neutral centre stroke stays uniformly present over 98% of
        // the entire span; partially aligned hatching cannot qualify.
        const median=quant(core,.5),uniform=core.filter(g=>Math.abs(g-median)<=3.5).length;
        if(total<40||matched/total<.80||uniform/total<.98)continue;
        const f=regress(points),mean=sum/matched,std=Math.sqrt(Math.max(0,square/matched-mean*mean));
        if(!f||f.residual>1.1||Math.abs(f.m-line.m)>.018||std>8)continue;
        return {v,...f,mean,std,support:matched/total,totalSamples:total};
      }
    }
    return null;
  }
  function selectUnique(candidates){
    if(!candidates.length)return null;candidates.sort((a,b)=>b.fit.support-a.fit.support);const best=candidates[0];
    for(const c of candidates)if(Math.max(Math.abs(at(c.fit,best.fit.lo)-at(best.fit,best.fit.lo)),Math.abs(at(c.fit,best.fit.hi)-at(best.fit,best.fit.hi)))>2.5)return null;
    return best;
  }
  function analyzeRGBA(rgba,w,h,log){
    if(!Number.isInteger(w)||!Number.isInteger(h)||w<250||h<350||w>900||h>900||!rgba||rgba.length!==w*h*4)return [];
    for(let i=3;i<rgba.length;i+=4)if(rgba[i]!==255)return [];
    const quiet=palette(rgba,w,h);if(!quiet)return [];const {bg}=quiet,cells=closedCells(bg,w,h);
    if(cells.length<2||cells.length>4)return [];cells.sort((a,b)=>a.q[0][1]-b.q[0][1]);
    // This first admission is bounded to a right-hand wide exterior column.
    // Other orientations remain on their unchanged detection routes.
    const first=cells[0],last=cells.at(-1),side=first.q[0][0]>w*.10?0:1;
    if(side!==0)return [];
    if(first.q[0][0]<w*.12||first.q[0][0]>w*.38||first.q[1][0]<w*.94||first.q[0][1]<h*.16||last.q[3][1]>h*.84)return [];
    for(const c of cells){if(Math.abs(c.q[0][0]-first.q[0][0])>5||Math.abs(c.q[1][0]-first.q[1][0])>5)return [];}
    const joins=[];for(let i=1;i<cells.length;i++){const b=matteBand(bg,w,h,cells[i-1].rails[1],cells[i].rails[0],first.q[0][0],first.q[1][0]);if(!b)return [];joins.push(b);}
    const seam=typeof PanelAbuttingFrames!=='undefined'?PanelAbuttingFrames.localSeamEvidenceRGBA?.(rgba,w,h):null;if(!seam)return [];
    const {lines,fit}=seam,hs=lines.filter(r=>!r.v&&Math.abs(r.m)<.03),vs=lines.filter(r=>r.v&&Math.abs(r.m)<.03);
    const leftX=first.q[0][0],rightX=first.q[1][0],spanTop=first.q[0][1],spanBottom=last.q[2][1];
    const bottomNarrow=outside(bg,w,h,false,1,0,leftX-12);if(!bottomNarrow||at(bottomNarrow,leftX)<spanBottom+h*.10)return [];
    const sepChoices=[];
    for(const r of vs){
      if(at(r,(spanTop+spanBottom)/2)>=leftX-2||at(r,(spanTop+spanBottom)/2)<leftX-w*.04)continue;
      const f=fit(r,spanTop,at(bottomNarrow,leftX));if(!f)continue;
      const bands=cells.map(c=>matteBand(bg,w,h,f,c.rails[2],c.q[0][1],c.q[3][1]));if(bands.some(b=>!b))continue;
      const tail=fit(r,spanBottom+5,at(bottomNarrow,leftX));if(!tail)continue;
      sepChoices.push({fit:{...f,kind:'shared-seam'},segments:[tail],bands});
    }
    const sep=selectUnique(sepChoices);if(!sep){log?.('terraced: no independently continued vertical seam');return [];}
    const topChoices=[];
    for(const r of hs){
      if(at(r,w/2)>=at(first.rails[0],w/2)-2||at(r,w/2)<at(first.rails[0],w/2)-h*.025)continue;
      const f=fit(r,4,w-4),narrow=fit(r,4,at(sep.fit,spanTop)-3),wide=fit(r,leftX+3,rightX-3);
      if(!f||!narrow||!wide)continue;const band=matteBand(bg,w,h,f,first.rails[0],leftX+3,rightX-3);if(!band)continue;
      topChoices.push({fit:{...f,kind:'shared-seam'},segments:[narrow,wide],bands:[band]});
    }
    const topJoin=selectUnique(topChoices);if(!topJoin){log?.('terraced: no two-segment upper seam');return [];}
    const lowerChoices=[];
    for(const r of hs){
      if(at(r,w/2)<=at(last.rails[1],w/2)+1||at(r,w/2)>at(last.rails[1],w/2)+h*.025)continue;
      const f=fit(r,at(sep.fit,spanBottom)+2,w-4);if(!f)continue;const band=matteBand(bg,w,h,last.rails[1],f,leftX+3,rightX-3);if(!band)continue;
      lowerChoices.push({fit:{...f,kind:'shared-seam'},bands:[band],segments:[]});
    }
    const lowerJoin=selectUnique(lowerChoices);if(!lowerJoin){log?.('terraced: no separated lower seam');return [];}
    const topOuter=outside(bg,w,h,false,0,0,w),topL=outside(bg,w,h,true,0,at(topOuter||{m:0,b:0},0)+4,at(topJoin.fit,0)-4),topR=outside(bg,w,h,true,1,at(topOuter||{m:0,b:0},w)+4,at(topJoin.fit,w)-4);
    const narrowL=outside(bg,w,h,true,0,at(topJoin.fit,0)+3,at(bottomNarrow,0)-3);
    const lowerB=outside(bg,w,h,false,1,at(sep.fit,h)+3,w),lowerR=outside(bg,w,h,true,1,at(lowerJoin.fit,w)+3,h-2);
    if([topOuter,topL,topR,narrowL,lowerB,lowerR].some(r=>!r)){log?.('terraced: missing local exterior');return [];}
    const lowerL=fit(sep.fit,at(lowerJoin.fit,leftX)+3,h-4);if(!lowerL){log?.('terraced: lower side does not continue');return [];}
    // Use a common measured shared side, never independently overlapping crops.
    const commonSep={...sep.fit};
    const specs=[{role:'top',rails:[topOuter,topJoin.fit,topL,topR]},
      {role:'tall',rails:[topJoin.fit,bottomNarrow,narrowL,commonSep]},
      ...cells.map((c,i)=>({role:'stack',rails:c.rails,cellIndex:i})),
      {role:'bottom',rails:[lowerJoin.fit,lowerB,commonSep,lowerR]}];
    // Raw-colour fitted boxes remain inset vetoes. Through-divider checks
    // additionally use the FIXED exterior matte palette, not every dark
    // crosshatch stroke. This is local to this proved matte-column route;
    // existing detectors' darkness thresholds and rejection rules are intact.
    const matteRGBA=new Uint8ClampedArray(rgba.length);for(let i=0;i<bg.length;i++){const c=bg[i]?0:200;matteRGBA[i*4]=matteRGBA[i*4+1]=matteRGBA[i*4+2]=c;matteRGBA[i*4+3]=255;}
    for(const s of specs){s.q=quad(s.rails);const A=area(s.q);
      if(s.q.some(p=>p[0]<-1e-6||p[1]<-1e-6||p[0]>w+1e-6||p[1]>h+1e-6)||A<w*h*.045||A>w*h*.45){log?.('terraced: invalid closed face');return [];}
      const b=box(s.q),check={box:[Math.ceil(Math.max(s.q[0][0],s.q[3][0]))+4,Math.ceil(Math.max(s.q[0][1],s.q[1][1]))+4,Math.floor(Math.min(s.q[1][0],s.q[2][0]))-4,Math.floor(Math.min(s.q[3][1],s.q[2][1]))-4]};
      if(uniformInkDivider(rgba,w,h,check.box,lines)){log?.('terraced: uniform-ink divider veto '+s.role);return [];}
      if(typeof PanelClosedFrames==='undefined'||PanelClosedFrames.analyzeRGBA(rgba,w,h,null,{gradientOnly:true,localMatteInset:true,vetoCandidates:[check]}).length!==1||PanelClosedFrames.analyzeRGBA(matteRGBA,w,h,null,{gradientOnly:true,darkMatte:true,localMatteInset:true,vetoCandidates:[check]}).length!==1){log?.('terraced: divider/inset veto '+s.role);return [];}
      s.dividerVetoPassed=true;s.insetVetoPassed=true;s.uniformInkVetoPassed=true;s.vetoMethod='fixed-matte-uniform-ink-and-raw-insets';
    }
    const summed=specs.reduce((n,s)=>n+area(s.q),0);if(summed<w*h*.82||summed>w*h*.985)return [];
    const proof={version:1,method:METHOD,analysisWidth:w,analysisHeight:h,color:quiet.color,exteriorSupport:quiet.support,edgeFractions:quiet.fractions,
      cells:cells.map(c=>({rails:c.rails,quad:c.q,pixelCount:c.pixelCount,exterior:c.exterior})),joins,vertical:sep,upper:topJoin,lower:lowerJoin,lowerSide:{...lowerL,kind:'shared-seam'},faces:specs,totalArea:summed};
    const out=specs.map((s,index)=>{const b=box(s.q);return {x:b[0]/w,y:b[1]/h,w:(b[2]-b[0])/w,h:(b[3]-b[1])/h,_outline:s.q.map(p=>({x:p[0]/w,y:p[1]/h})),_identitySource:'terraced-frame',_geometryOwner:'local-matte-seam-outline',_geometryType:'locally-closed-edge-bleed',_terraceProof:{...proof,index}};});
    log?.('terraced: '+out.length+' locally closed faces; validate '+out.map(validPanel));return out.every(validPanel)?out:[];
  }
  function validPanel(panel){try{return validate(panel);}catch(_){return false;}}
  function validate(p){
    const pr=p?._terraceProof,W=pr?.analysisWidth,H=pr?.analysisHeight;
    if(p?._identitySource!=='terraced-frame'||pr?.version!==1||pr.method!==METHOD||!Number.isInteger(W)||!Number.isInteger(H)||!range(W,250,900)||!range(H,350,900)||!Array.isArray(pr.faces)||!range(pr.faces.length,5,7)||!Number.isInteger(pr.index)||pr.index<0||pr.index>=pr.faces.length)return false;
    if(!Array.isArray(pr.color)||pr.color.length!==3||pr.color.some(x=>!Number.isInteger(x)||!range(x,0,255))||pr.color[0]*.299+pr.color[1]*.587+pr.color[2]*.114>25||!range(pr.exteriorSupport,.65,1)||!Array.isArray(pr.edgeFractions)||pr.edgeFractions.length!==4||pr.edgeFractions.some(x=>!range(x,0,1))||Math.max(...pr.edgeFractions)<.98)return false;
    if(!Array.isArray(pr.cells)||pr.cells.length!==pr.faces.length-3||!Array.isArray(pr.joins)||pr.joins.length!==pr.cells.length-1)return false;
    const band=b=>b&&Number.isInteger(b.samples)&&b.samples>=40&&Number.isInteger(b.matched)&&range(b.matched,0,b.samples)&&Math.abs(b.support-b.matched/b.samples)<1e-9&&range(b.support,.94,1)&&Number.isInteger(b.pixels)&&b.pixels>0&&Number.isInteger(b.mattePixels)&&range(b.mattePixels,0,b.pixels)&&Math.abs(b.matteFraction-b.mattePixels/b.pixels)<1e-9&&range(b.matteFraction,.96,1)&&range(b.minGap,1.5,Math.max(W,H)*.026)&&range(b.maxGap,b.minGap,Math.max(W,H)*.026);
    if(!pr.joins.every(band))return false;
    const line=r=>{
      if(!r||typeof r.v!=='boolean'||!range(r.m,-.030,.030)||!finite(r.b)||!Number.isInteger(r.samples)||r.samples<12||!range(r.support,.74,1)||!range(r.residual,0,1.05)||!range(r.lo,0,r.v?H:W)||!range(r.hi,0,r.v?H:W)||r.hi<=r.lo)return false;
      if(r.kind==='image-edge')return [0,1].includes(r.side)&&r.m===0&&r.b===(r.side?(r.v?W:H):0)&&r.residual===0&&Number.isInteger(r.totalSamples)&&r.totalSamples>=r.samples&&Math.abs(r.samples/r.totalSamples-r.support)<1e-9&&range(r.support,.90,1)&&r.collar===Math.max(4,(r.v?W:H)*.010)&&Number.isInteger(r.maxGap)&&range(r.maxGap,0,Math.max(4,r.totalSamples*.08))&&Array.isArray(r.endSupport)&&r.endSupport.length===2&&r.endSupport.every(x=>range(x,.90,1));
      const independent=r.independentFits;
      if(!Array.isArray(independent)||independent.length!==2||independent.some(f=>!range(f?.m,-.2,.2)||!finite(f.b)||!Number.isInteger(f.samples)||f.samples<12||!range(f.residual,0,1.8)))return false;
      const [a,b]=independent,t=(r.lo+r.hi)/2;
      if(r.kind==='matte-cell'||r.kind==='exterior-matte')return [0,1].includes(r.side)&&Number.isInteger(r.totalSamples)&&r.totalSamples>=r.samples&&Math.abs(r.samples/r.totalSamples-r.support)<1e-9&&r.support>=(r.kind==='matte-cell'?.955:.98)&&Math.abs(a.m-b.m)<=.035&&Math.abs(at(a,t)-at(b,t))<=2.1;
      if(r.kind&&r.kind!=='shared-seam')return false;
      const n=Math.floor(r.hi)-Math.ceil(r.lo)-5;
      return n>=30&&Math.abs(r.samples/n-r.support)<1e-9&&range(r.coverage,.96,1)&&Number.isInteger(r.maxGap)&&range(r.maxGap,0,Math.max(4,n*.035))&&Math.abs(a.m-b.m)<=.02&&Math.abs(at(a,t)-at(b,t))<=2.2;
    };
    for(const s of [pr.vertical,pr.upper,pr.lower])if(!line(s?.fit)||s.fit.kind!=='shared-seam'||!Array.isArray(s.bands)||!s.bands.length||!s.bands.every(band)||!Array.isArray(s.segments)||s.segments.some(r=>!line(r)))return false;
    if(pr.vertical.bands.length!==pr.cells.length||pr.vertical.segments.length!==1||pr.upper.bands.length!==1||pr.upper.segments.length!==2||pr.lower.bands.length!==1||pr.lower.segments.length!==0||!line(pr.lowerSide))return false;
    const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
    for(const [i,c]of pr.cells.entries()){
      if(!Array.isArray(c.rails)||c.rails.length!==4||c.rails.some((r,j)=>!line(r)||r.kind!=='matte-cell'||r.v!==(j>=2)||r.side!==j%2)||!Number.isInteger(c.pixelCount))return false;
      const q=quad(c.rails),A=area(q);
      if(!range(A,W*H*.045,W*H*.30)||!range(c.pixelCount/A,.90,1.015)||!same(q,c.quad)||!same(c.rails,pr.faces[i+2]?.rails)||!Array.isArray(c.exterior)||c.exterior.length!==4||c.exterior.some(e=>!Number.isInteger(e.samples)||e.samples<35||!Number.isInteger(e.matched)||!range(e.matched,0,e.samples)||Math.abs(e.support-e.matched/e.samples)>1e-9||!range(e.support,.985,1)))return false;
    }
    if(!same(pr.faces[0].rails[1],pr.upper.fit)||!same(pr.faces[1].rails[0],pr.upper.fit)||!same(pr.faces[1].rails[3],pr.vertical.fit)||!same(pr.faces.at(-1).rails[2],pr.vertical.fit)||!same(pr.faces.at(-1).rails[0],pr.lower.fit))return false;
    // Stored shared-rim evidence cannot drift away from its paired cell.
    for(const [i,c]of pr.cells.entries()){
      const lo=c.quad[0][1],hi=c.quad[3][1];for(const t of [lo,hi])if(!range(at(c.rails[2],t)-at(pr.vertical.fit,t),1.5,Math.max(W,H)*.026))return false;
    }
    for(const x of [pr.cells[0].quad[0][0],pr.cells[0].quad[1][0]])if(!range(at(pr.cells[0].rails[0],x)-at(pr.upper.fit,x),1.5,Math.max(W,H)*.026))return false;
    for(const x of [pr.cells.at(-1).quad[3][0],pr.cells.at(-1).quad[2][0]])if(!range(at(pr.lower.fit,x)-at(pr.cells.at(-1).rails[1],x),1.5,Math.max(W,H)*.026))return false;
    for(const y of [pr.lowerSide.lo,pr.lowerSide.hi])if(Math.abs(at(pr.lowerSide,y)-at(pr.vertical.fit,y))>2.5)return false;
    let total=0;
    for(const [i,f]of pr.faces.entries()){
      if(!Array.isArray(f.rails)||f.rails.length!==4||f.rails.some((r,j)=>!line(r)||r.v!==(j>=2))||f.dividerVetoPassed!==true||f.insetVetoPassed!==true||f.uniformInkVetoPassed!==true||f.vetoMethod!=='fixed-matte-uniform-ink-and-raw-insets')return false;
      const q=quad(f.rails),A=area(q);if(!range(A,W*H*.045,W*H*.45)||q.some(x=>!range(x[0],-1e-6,W+1e-6)||!range(x[1],-1e-6,H+1e-6))||!Array.isArray(f.q)||f.q.length!==4||f.q.some((p,j)=>!Array.isArray(p)||p.length!==2||!finite(p[0])||!finite(p[1])||Math.hypot(p[0]-q[j][0],p[1]-q[j][1])>1e-8))return false;total+=A;
      if(i===0&&f.role!=='top'||i===1&&f.role!=='tall'||i===pr.faces.length-1&&f.role!=='bottom'||i>1&&i<pr.faces.length-1&&(f.role!=='stack'||f.cellIndex!==i-2))return false;
    }
    for(const f of pr.faces){for(let i=0;i<4;i++){const a=f.q[i],b=f.q[(i+1)%4],c=f.q[(i+2)%4];if((b[0]-a[0])*(c[1]-b[1])-(b[1]-a[1])*(c[0]-b[0])<=0)return false;}}
    function intersection(a,b){let q=a.map(p=>p.slice());const cross=(a,b,p)=>(b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0]);for(let i=0;i<4&&q.length;i++){const x=b[i],y=b[(i+1)%4],old=q;q=[];for(let j=0;j<old.length;j++){const p=old[j],r=old[(j+1)%old.length],u=cross(x,y,p),v=cross(x,y,r),pin=u>=-1e-8,rin=v>=-1e-8;if(pin)q.push(p);if(pin!==rin){const t=u/(u-v);q.push([p[0]+t*(r[0]-p[0]),p[1]+t*(r[1]-p[1])]);}}}return Math.abs(area(q));}
    for(let i=0;i<pr.faces.length;i++)for(let j=i+1;j<pr.faces.length;j++)if(intersection(pr.faces[i].q,pr.faces[j].q)>1e-5)return false;
    if(!range(total,W*H*.82,W*H*.985)||!finite(pr.totalArea)||Math.abs(total-pr.totalArea)>1e-5)return false;
    const q=pr.faces[pr.index].q,b=box(q);
    if(!Array.isArray(p._outline)||p._outline.length!==4||p._outline.some((x,i)=>!range(x?.x,0,1)||!range(x?.y,0,1)||Math.abs(x.x-q[i][0]/W)>1e-9||Math.abs(x.y-q[i][1]/H)>1e-9))return false;
    return ['x','y','w','h'].every(k=>finite(p[k]))&&Math.max(Math.abs(p.x-b[0]/W),Math.abs(p.y-b[1]/H),Math.abs(p.w-(b[2]-b[0])/W),Math.abs(p.h-(b[3]-b[1])/H))<1e-9;
  }
  function analyzeImage(img,log){const scale=Math.min(1,900/Math.max(img.width,img.height)),w=Math.round(img.width*scale),h=Math.round(img.height*scale),c=document.createElement('canvas');c.width=w;c.height=h;const cx=c.getContext('2d',{willReadFrequently:true});cx.drawImage(img,0,0,w,h);return analyzeRGBA(cx.getImageData(0,0,w,h).data,w,h,log);}
  return {analyzeRGBA,analyzeImage,validPanel};
})();
