/* Nth Shelf Frame Test 12 — paired, locally isolated matte cells.
 * A page can have a trustworthy dark gutter without a quiet margin on every
 * image edge. Use a FIXED exterior colour, flood only exterior-connected matte,
 * and prove two adjacent compact artwork islands independently. Their enclosing
 * pixel hulls retain curved/uneven rims; they are not arbitrary tap rectangles.
 * A joined multi-scene component, crossing artwork, unproved divider/inset or
 * ambiguous neighbour is withheld. No page index, title, hash or stored crop.
 * This route is add-only on an otherwise empty stable page identity map.
 */
const PanelLocalIslands = (() => {
  'use strict';
  const METHOD = 'paired-local-matte-islands';
  const finite = Number.isFinite;
  const inRange = (n, a, b) => finite(n) && n >= a && n <= b;
  const cross = (a,b,p) => (b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0]);
  const area = q => q.reduce((s,p,i) => {const n=q[(i+1)%q.length];return s+p[0]*n[1]-p[1]*n[0];},0)/2;
  const bounds = q => [Math.min(...q.map(p=>p[0])),Math.min(...q.map(p=>p[1])),Math.max(...q.map(p=>p[0])),Math.max(...q.map(p=>p[1]))];
  const inside = (q,x,y,pad=0) => q.every((p,i) => {const n=q[(i+1)%q.length];return cross(p,n,[x,y]) >= -pad*Math.hypot(n[0]-p[0],n[1]-p[1])-1e-9;});
  function hull(points) {
    const pts=[...new Map(points.map(p=>[p.join(','),p])).values()].sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
    if(pts.length<4)return null;
    const build = ps => {const out=[];for(const p of ps){while(out.length>1&&cross(out.at(-2),out.at(-1),p)<=0)out.pop();out.push(p);}out.pop();return out;};
    return build(pts).concat(build(pts.slice().reverse()));
  }
  function exterior(rgba,w,h) {
    const sides=[[],[],[],[]];
    for(let x=0;x<w;x+=2){sides[0].push(x);sides[1].push((h-1)*w+x);}
    for(let y=0;y<h;y+=2){sides[2].push(y*w);sides[3].push(y*w+w-1);}
    const edge=sides.flat(),color=[0,1,2].map(c=>{const v=edge.map(i=>rgba[i*4+c]).sort((a,b)=>a-b);return v[v.length>>1];});
    const matches = (i,d) => [0,1,2].every(c=>Math.abs(rgba[i*4+c]-color[c])<=d);
    const fractions=sides.map(s=>s.filter(i=>matches(i,6)).length/s.length),matched=edge.filter(i=>matches(i,6)).length;
    if(color[0]*.299+color[1]*.587+color[2]*.114>25 || matched/edge.length<.65 || Math.max(...fractions)<.98)return null;
    const bg=new Uint8Array(w*h),queue=new Int32Array(w*h);let head=0,tail=0;
    const offer=i=>{if(!bg[i]&&matches(i,5)){bg[i]=1;queue[tail++]=i;}};
    for(let x=0;x<w;x++){offer(x);offer((h-1)*w+x);}for(let y=0;y<h;y++){offer(y*w);offer(y*w+w-1);}
    while(head<tail){const i=queue[head++],x=i%w,y=i/w|0;if(x)offer(i-1);if(x+1<w)offer(i+1);if(y)offer(i-w);if(y+1<h)offer(i+w);}
    if(tail<w*h*.025)return null;
    return {bg,color,edgeSamples:edge.length,edgeMatched:matched,edgeFractions:fractions,exteriorPixels:tail};
  }
  function components(bg,w,h) {
    const labels=new Int32Array(bg.length),queue=new Int32Array(bg.length),all=[];let id=0;
    for(let seed=0;seed<bg.length;seed++)if(!bg[seed]&&!labels[seed]){
      if(++id>12000)return null;
      let head=0,tail=1,x0=w,y0=h,x1=0,y1=0;queue[0]=seed;labels[seed]=id;
      const minX=new Int32Array(h).fill(w),maxX=new Int32Array(h).fill(-1);
      while(head<tail){const i=queue[head++],x=i%w,y=i/w|0;
        x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);minX[y]=Math.min(minX[y],x);maxX[y]=Math.max(maxX[y],x);
        for(const j of [x?i-1:-1,x+1<w?i+1:-1,y?i-w:-1,y+1<h?i+w:-1])if(j>=0&&!bg[j]&&!labels[j]){labels[j]=id;queue[tail++]=j;}
      }
      const c={id,pixels:tail,box:[x0,y0,x1,y1]};
      if(tail>=w*h*.025&&x1-x0>w*.10&&y1-y0>h*.15){
        const points=[];for(let y=y0;y<=y1;y++)if(maxX[y]>=0)points.push([minX[y],y],[maxX[y],y]);
        const core=hull(points);if(core)c.q=hull(core.flatMap(p=>[-.5,.5].flatMap(dx=>[-.5,.5].map(dy=>[p[0]+dx,p[1]+dy]))));
      }
      all.push(c);
    }
    return {labels,all};
  }
  function perimeterProof(q,bg,w,h) {
    const bySide=Array.from({length:4},()=>({samples:0,matched:0,maxGap:0}));let total=0,matched=0,diagonal=0,lengthSum=0;
    for(let i=0;i<q.length;i++){
      const a=q[i],b=q[(i+1)%q.length],dx=b[0]-a[0],dy=b[1]-a[1],L=Math.hypot(dx,dy),nx=dy/L,ny=-dx/L;
      lengthSum+=L;
      if(Math.min(Math.abs(dx),Math.abs(dy))/L>.10)diagonal+=L;
      const side=Math.abs(nx)>Math.abs(ny)?(nx<0?2:3):(ny<0?0:1),row=bySide[side];let gap=0;
      for(let t=1;t<L-1;t++){
        const x=a[0]+dx*t/L,y=a[1]+dy*t/L;let yes=false;
        for(const d of [.5,1,1.5,2]){const xx=Math.round(x+nx*d),yy=Math.round(y+ny*d);if(xx>=0&&xx<w&&yy>=0&&yy<h&&bg[yy*w+xx])yes=true;}
        row.samples++;total++;row.matched+=yes;matched+=yes;gap=yes?0:gap+1;row.maxGap=Math.max(row.maxGap,gap);
      }
    }
    if(diagonal/lengthSum>.075 || !bySide.every(r=>r.samples>=35&&r.matched/r.samples>=.91&&r.maxGap<=Math.max(6,r.samples*.09)) || matched/total<.965)return null;
    return {bySide,total,matched,diagonalLength:diagonal,perimeter:lengthSum};
  }
  function crossSection(q,y) {
    const xs=[];for(let i=0;i<q.length;i++){const a=q[i],b=q[(i+1)%q.length];if(y>=Math.min(a[1],b[1])&&y<Math.max(a[1],b[1]))xs.push(a[0]+(y-a[1])*(b[0]-a[0])/(b[1]-a[1]));}
    return xs.length>=2?[Math.min(...xs),Math.max(...xs)]:null;
  }
  // Convex clipping proves disjoint ownership even in the short corner spans
  // that are intentionally trimmed from colour sampling below.
  function overlapArea(a,b) {
    let out=a.map(p=>p.slice());
    for(let i=0;i<b.length&&out.length;i++){
      const u=b[i],v=b[(i+1)%b.length],old=out;out=[];
      for(let j=0;j<old.length;j++){
        const p=old[j],q=old[(j+1)%old.length],x=cross(u,v,p),y=cross(u,v,q),pin=x>=0,qin=y>=0;
        if(pin)out.push(p);
        if(pin!==qin){const t=x/(x-y);out.push([p[0]+t*(q[0]-p[0]),p[1]+t*(q[1]-p[1])]);}
      }
    }
    return Math.abs(area(out));
  }
  function pairProof(a,b,bg,w,h) {
    const A=bounds(a.q),B=bounds(b.q);
    if(overlapArea(a.q,b.q)>1e-6)return null;
    if(A[0]>=B[0]||Math.max(Math.abs(A[1]-B[1]),Math.abs(A[3]-B[3]))>h*.018 || Math.min(A[3]-A[1],B[3]-B[1])<h*.18)return null;
    const lo=Math.ceil(Math.max(A[1],B[1]))+4,hi=Math.floor(Math.min(A[3],B[3]))-4;
    let samples=0,matched=0,minGap=Infinity,maxGap=0,maxMissing=0,missing=0;
    for(let y=lo;y<=hi;y++){
      const xA=crossSection(a.q,y),xB=crossSection(b.q,y);if(!xA||!xB)return null;
      const left=xA[1],right=xB[0],gap=right-left;
      if(gap < -1e-7 || gap>w*.028)return null;
      let found=false;for(let x=Math.ceil(left-1);x<=Math.floor(right+1);x++)if(x>=0&&x<w&&bg[y*w+x])found=true;
      samples++;matched+=found;minGap=Math.min(minGap,gap);maxGap=Math.max(maxGap,gap);missing=found?0:missing+1;maxMissing=Math.max(maxMissing,missing);
    }
    if(samples<80||matched/samples<.985||maxMissing>3)return null;
    return {lo,hi,samples,matched,minGap,maxGap,maxMissing,collar:1};
  }
  function analyzeRGBA(rgba,w,h,log) {
    if(!Number.isInteger(w)||!Number.isInteger(h)||w<250||h<350||w>900||h>900||!rgba||rgba.length!==w*h*4)return [];
    const quiet=exterior(rgba,w,h);if(!quiet)return [];
    const cc=components(quiet.bg,w,h);if(!cc)return [];
    const provisional=[];
    for(const c of cc.all){
      const q=c.q;if(!q||q.length<4||q.length>64)continue;
      const b=bounds(q),A=area(q),boxArea=(b[2]-b[0])*(b[3]-b[1]);
      if(b[0]<1||b[1]<1||b[2]>w-1||b[3]>h-1||A/(w*h)<.03||A/(w*h)>.25||A/boxArea<.972||c.pixels/A<.93||c.pixels/A>1.001)continue;
      const rim=perimeterProof(q,quiet.bg,w,h);if(!rim)continue;
      // An envelope may include quiet ink and tiny antialias fragments, but
      // cannot swallow even part of another substantial foreground island.
      let foreign=0,retained=0;const otherCounts=new Map();const sizes=new Map(cc.all.map(x=>[x.id,x.pixels]));
      for(let y=Math.max(0,Math.floor(b[1]));y<=Math.min(h-1,Math.ceil(b[3]));y++)for(let x=Math.max(0,Math.floor(b[0]));x<=Math.min(w-1,Math.ceil(b[2]));x++){
        const id=cc.labels[y*w+x];if(!inside(q,x,y))continue;
        retained+=id===c.id;if(id&&id!==c.id)otherCounts.set(id,(otherCounts.get(id)||0)+1);
      }
      const detached=[];
      for(const [id,n] of otherCounts){if(n===sizes.get(id)&&n<A*.02)detached.push(n);else if(sizes.get(id)>=20)foreign+=n;}
      if(foreign||retained!==c.pixels||detached.reduce((n,v)=>n+v,0)>A*.02)continue;
      provisional.push({...c,area:A,bounds:b,boxArea,rim,detachedPixels:detached,retainedPixels:retained,foreignPixels:foreign});
    }
    if(provisional.length<2||provisional.length>10)return [];
    provisional.sort((a,b)=>a.bounds[0]-b.bounds[0]);
    const pairs=[];
    for(let i=0;i<provisional.length;i++)for(let j=i+1;j<provisional.length;j++){
      const p=pairProof(provisional[i],provisional[j],quiet.bg,w,h);if(p)pairs.push({left:i,right:j,proof:p});
    }
    // A single unambiguous independently separated pair is this route's scope.
    // Multi-neighbour networks and edge-bleed silhouettes retain old routes.
    if(pairs.length!==1)return [];
    const pair=pairs[0],cells=[provisional[pair.left],provisional[pair.right]];
    if(typeof PanelClosedFrames==='undefined')return [];
    const matteRGBA=new Uint8ClampedArray(rgba.length);for(let i=0;i<quiet.bg.length;i++){const v=quiet.bg[i]?0:200;matteRGBA[i*4]=matteRGBA[i*4+1]=matteRGBA[i*4+2]=v;matteRGBA[i*4+3]=255;}
    for(const c of cells){
      // Actual-colour insets plus fixed-palette spanning dividers are vetoes,
      // not crop proposals. The existing strict detectors are unchanged.
      const b=c.bounds,check={box:[Math.ceil(b[0])+4,Math.ceil(b[1])+4,Math.floor(b[2])-4,Math.floor(b[3])-4]};
      if(PanelClosedFrames.analyzeRGBA(rgba,w,h,null,{gradientOnly:true,localMatteInset:true,vetoCandidates:[check]}).length!==1 ||
         PanelClosedFrames.analyzeRGBA(matteRGBA,w,h,null,{gradientOnly:true,darkMatte:true,localMatteInset:true,vetoCandidates:[check]}).length!==1){log?.('local islands: divider/inset veto');return [];}
      c.dividerVetoPassed=true;c.insetVetoPassed=true;
    }
    const proof={version:1,method:METHOD,analysisWidth:w,analysisHeight:h,color:quiet.color,edgeSamples:quiet.edgeSamples,edgeMatched:quiet.edgeMatched,edgeFractions:quiet.edgeFractions,exteriorPixels:quiet.exteriorPixels,
      pair:pair.proof,cells:cells.map(c=>({q:c.q,pixels:c.pixels,area:c.area,bounds:c.bounds,boxArea:c.boxArea,rim:c.rim,detachedPixels:c.detachedPixels,retainedPixels:c.retainedPixels,foreignPixels:c.foreignPixels,dividerVetoPassed:c.dividerVetoPassed,insetVetoPassed:c.insetVetoPassed}))};
    const out=cells.map((c,index)=>({x:c.bounds[0]/w,y:c.bounds[1]/h,w:(c.bounds[2]-c.bounds[0])/w,h:(c.bounds[3]-c.bounds[1])/h,_outline:c.q.map(p=>({x:p[0]/w,y:p[1]/h})),_identitySource:'local-island-frame',_geometryOwner:'local-island-outline',_geometryType:'exterior-isolated-pixel-hull',_islandProof:{...proof,index}}));
    log?.('local islands: '+out.length+' paired complete hulls; validation '+out.map(validPanel));
    return out.every(validPanel)?out:[];
  }
  function validPanel(p){try{return validate(p);}catch(_){return false;}}
  function validate(p) {
    const pr=p?._islandProof,W=pr?.analysisWidth,H=pr?.analysisHeight;
    if(p?._identitySource!=='local-island-frame'||pr?.version!==1||pr.method!==METHOD||!Number.isInteger(W)||!Number.isInteger(H)||!inRange(W,250,900)||!inRange(H,350,900)||![0,1].includes(pr.index)||!Array.isArray(pr.cells)||pr.cells.length!==2)return false;
    if(!Array.isArray(pr.color)||pr.color.length!==3||pr.color.some(c=>!Number.isInteger(c)||!inRange(c,0,255))||pr.color[0]*.299+pr.color[1]*.587+pr.color[2]*.114>25||!Number.isInteger(pr.edgeSamples)||pr.edgeSamples<100||!Number.isInteger(pr.edgeMatched)||!inRange(pr.edgeMatched/pr.edgeSamples,.65,1)||!Array.isArray(pr.edgeFractions)||pr.edgeFractions.length!==4||pr.edgeFractions.some(n=>!inRange(n,0,1))||Math.max(...pr.edgeFractions)<.98||!Number.isInteger(pr.exteriorPixels)||!inRange(pr.exteriorPixels,W*H*.025,W*H))return false;
    for(const c of pr.cells){
      if(!Array.isArray(c.q)||c.q.length<4||c.q.length>64||c.q.some(p=>!Array.isArray(p)||p.length!==2||!inRange(p[0],1,W-1)||!inRange(p[1],1,H-1)||Math.abs(p[0]*2-Math.round(p[0]*2))>1e-8||Math.abs(p[1]*2-Math.round(p[1]*2))>1e-8))return false;
      if(c.q.some((p,i)=>cross(p,c.q[(i+1)%c.q.length],c.q[(i+2)%c.q.length])<=0))return false;
      const b=bounds(c.q),A=area(c.q),B=(b[2]-b[0])*(b[3]-b[1]);
      if(!inRange(A/(W*H),.03,.25)||A/B<.972||!finite(c.area)||Math.abs(A-c.area)>1e-6||!finite(c.boxArea)||Math.abs(B-c.boxArea)>1e-6||JSON.stringify(b)!==JSON.stringify(c.bounds)||!Number.isInteger(c.pixels)||!inRange(c.pixels/A,.93,1.001)||c.retainedPixels!==c.pixels||!Array.isArray(c.detachedPixels)||c.detachedPixels.length>200||c.detachedPixels.some(n=>!Number.isInteger(n)||n<1||n>=A*.02)||c.detachedPixels.reduce((n,v)=>n+v,0)>A*.02||c.foreignPixels!==0||c.dividerVetoPassed!==true||c.insetVetoPassed!==true)return false;
      const r=c.rim;
      if(!r||!Array.isArray(r.bySide)||r.bySide.length!==4||r.bySide.some(s=>!Number.isInteger(s.samples)||s.samples<35||!Number.isInteger(s.matched)||!inRange(s.matched/s.samples,.91,1)||!Number.isInteger(s.maxGap)||!inRange(s.maxGap,0,Math.max(6,s.samples*.09)))||!Number.isInteger(r.total)||!Number.isInteger(r.matched)||r.total!==r.bySide.reduce((a,s)=>a+s.samples,0)||r.matched!==r.bySide.reduce((a,s)=>a+s.matched,0)||!inRange(r.matched/r.total,.965,1)||!inRange(r.diagonalLength,0,r.perimeter*.075))return false;
      const P=c.q.reduce((a,p,i)=>a+Math.hypot(p[0]-c.q[(i+1)%c.q.length][0],p[1]-c.q[(i+1)%c.q.length][1]),0);if(!finite(r.perimeter)||Math.abs(P-r.perimeter)>1e-6)return false;
    }
    const a=pr.cells[0],b=pr.cells[1],pair=pr.pair,lo=Math.ceil(Math.max(a.bounds[1],b.bounds[1]))+4,hi=Math.floor(Math.min(a.bounds[3],b.bounds[3]))-4;
    if(overlapArea(a.q,b.q)>1e-6)return false;
    if(a.bounds[0]>=b.bounds[0]||Math.max(Math.abs(a.bounds[1]-b.bounds[1]),Math.abs(a.bounds[3]-b.bounds[3]))>H*.018||Math.min(a.bounds[3]-a.bounds[1],b.bounds[3]-b.bounds[1])<H*.18||!pair||pair.lo!==lo||pair.hi!==hi||pair.samples!==hi-lo+1||pair.samples<80||!Number.isInteger(pair.matched)||!inRange(pair.matched/pair.samples,.985,1)||!Number.isInteger(pair.maxMissing)||!inRange(pair.maxMissing,0,3)||pair.collar!==1||!inRange(pair.minGap,-1e-7,W*.028)||!inRange(pair.maxGap,pair.minGap,W*.028))return false;
    let minimum=Infinity,maximum=0;
    for(let y=lo;y<=hi;y++){const ca=crossSection(a.q,y),cb=crossSection(b.q,y);if(!ca||!cb)return false;const d=cb[0]-ca[1];if(d < -1e-7 || d>W*.028)return false;minimum=Math.min(minimum,d);maximum=Math.max(maximum,d);}
    if(Math.abs(pair.minGap-minimum)>1e-7||Math.abs(pair.maxGap-maximum)>1e-7)return false;
    const c=pr.cells[pr.index],q=c.q,bb=c.bounds;
    return Array.isArray(p._outline)&&p._outline.length===q.length&&p._outline.every((v,i)=>inRange(v?.x,0,1)&&inRange(v?.y,0,1)&&Math.abs(v.x-q[i][0]/W)<1e-10&&Math.abs(v.y-q[i][1]/H)<1e-10)&&['x','y','w','h'].every(k=>finite(p[k]))&&Math.max(Math.abs(p.x-bb[0]/W),Math.abs(p.y-bb[1]/H),Math.abs(p.w-(bb[2]-bb[0])/W),Math.abs(p.h-(bb[3]-bb[1])/H))<1e-10;
  }
  function analyzeImage(img,log) {
    const s=Math.min(1,900/Math.max(img.width,img.height)),w=Math.round(img.width*s),h=Math.round(img.height*s),c=document.createElement('canvas');c.width=w;c.height=h;
    const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0,w,h);return analyzeRGBA(ctx.getImageData(0,0,w,h).data,w,h,log);
  }
  /* Frame Test 13: a locally isolated pair can corroborate a neighbouring
   * edge-bleed cell. Do not replace the pair, infer its contents, or follow a
   * tap seed. A whole foreground component, an exterior side, a real image
   * edge, and a closed far-side matte band must agree. This keeps dark tree
   * branches inside their scene instead of treating every dark path as a gutter.
   * Deliberately bounded: one unambiguous neighbour; no overlapping silhouettes.
   */
  const NEIGHBOR_METHOD='pair-anchored-edge-cell';
  function neighborOutline(box,cuts,side,pageWidth){
    const [x0,y0,x1,y1]=box,outer=side?pageWidth-x1:x0,inner=side?pageWidth-x0:x1;
    const values=new Map(cuts.map(c=>[c.row,side?pageWidth-c.edge:c.edge]));
    const q=[[outer,y0],[inner,y0]];let current=inner;
    for(let y=Math.max(0,Math.ceil(y0));y<=Math.floor(y1);y++){
      const next=values.get(y)??inner,t=Math.max(y0,y-.5);
      if(next!==current){q.push([current,t],[next,t]);current=next;}
    }
    q.push([current,y1],[outer,y1]);
    const unique=q.filter((p,i)=>i===0||p[0]!==q[i-1][0]||p[1]!==q[i-1][1]);
    const clean=unique.filter((p,i)=>{const a=unique[(i+unique.length-1)%unique.length],b=unique[(i+1)%unique.length];return cross(a,p,b)!==0;});
    return side?clean.map(p=>[pageWidth-p[0],p[1]]).reverse():clean;
  }
  // Rejection-only scan, independent of exterior connectivity: a divider or
  // sizeable inset may use neutral grey ink rather than the page's exact matte.
  // A repeated thin ink stroke must span most of a complete cell, not merely
  // be a dark tree/clothing detail. Large closed rectangular interiors veto too.
  function neighborInkVeto(rgba,w,h,b){
    const ink=new Uint8Array(w*h),keys=new Int32Array(w*h).fill(-1);
    for(let i=0;i<ink.length;i++){
      const r=rgba[i*4],g=rgba[i*4+1],z=rgba[i*4+2];
      if(Math.max(r,g,z)<=70&&Math.max(r,g,z)-Math.min(r,g,z)<=14){ink[i]=1;keys[i]=((r>>2)<<10)+((g>>2)<<5)+(z>>2);}
    }
    for(const vertical of [false,true]){
      const lo=Math.ceil(vertical?b[1]:b[0])+4,hi=Math.floor(vertical?b[3]:b[2])-4;
      const a=Math.ceil(vertical?b[0]:b[1]),z=Math.floor(vertical?b[2]:b[3]),margin=Math.max(12,(z-a)*.06),n=hi-lo+1;
      const ix=(t,p)=>vertical?t*w+p:p*w+t;
      for(let p=Math.ceil(a+margin);p<z-margin;p++){
        const bins=new Map();for(let t=lo;t<=hi;t++){const k=keys[ix(t,p)];if(k>=0)bins.set(k,(bins.get(k)||0)+1);}
        const best=[...bins].sort((a,b)=>b[1]-a[1])[0];if(!best||best[1]<n*.72)continue;
        const k=best[0],halves=[0,0];let before=0,after=0;
        for(let t=lo;t<=hi;t++){
          if(keys[ix(t,p)]===k)halves[t<(lo+hi+1)/2?0:1]++;
          before+=keys[ix(t,p-8)]===k;after+=keys[ix(t,p+8)]===k;
        }
        if(Math.min(...halves)<Math.floor(n/2)*.65||before/n>.25||after/n>.25)continue;
        return {kind:'thin-uniform-ink-divider',vertical,position:p,samples:n,matched:best[1]};
      }
    }
    const cc=components(ink,w,h);if(!cc)return {kind:'ambiguous-ink-components'};
    const A=(b[2]-b[0])*(b[3]-b[1]);
    for(const c of cc.all){
      const [x0,y0,x1,y1]=c.box,W=x1-x0+1,H=y1-y0+1,B=W*H;
      if(x0<b[0]+12||x1>b[2]-12||y0<b[1]+12||y1>b[3]-12||W<w*.10||H<h*.08||B<A*.06||B>A*.65||c.pixels/B<.90)continue;
      const sides=[[],[],[],[]];
      for(let x=x0+2;x<=x1-2;x++){sides[0].push(ink[(y0-1)*w+x]);sides[1].push(ink[(y1+1)*w+x]);}
      for(let y=y0+2;y<=y1-2;y++){sides[2].push(ink[y*w+x0-1]);sides[3].push(ink[y*w+x1+1]);}
      if(sides.every(s=>s.length>=30&&s.reduce((a,v)=>a+v,0)/s.length>=.92))return {kind:'closed-neutral-ink-inset',box:c.box,pixels:c.pixels};
    }
    return null;
  }
  function neighborRGBA(rgba,w,h,anchors,log) {
    if(!Number.isInteger(w)||!Number.isInteger(h)||w<250||h<350||w>900||h>900||!rgba||rgba.length!==w*h*4||!Array.isArray(anchors)||anchors.length!==2||!anchors.every(validPanel))return [];
    if(anchors.some(p=>p._islandProof.analysisWidth!==w||p._islandProof.analysisHeight!==h))return [];
    for(let i=3;i<rgba.length;i+=4)if(rgba[i]!==255)return [];
    // Recheck the anchors against these pixels; a valid stale proof is not a
    // licence to add a neighbour on a different or edited page.
    const fresh=analyzeRGBA(rgba,w,h);
    if(JSON.stringify(fresh)!==JSON.stringify(anchors))return [];
    const ex=exterior(rgba,w,h);if(!ex)return [];
    const cc=components(ex.bg,w,h);if(!cc)return [];
    const sizes=new Map(cc.all.map(c=>[c.id,c.pixels]));
    const pairBox=bounds(anchors.flatMap(p=>p._outline.map(v=>[v.x*w,v.y*h]))),out=[];
    const band=(samples)=>{let matched=0,run=0,maxMissing=0,pixels=0,quiet=0;const halves=[{samples:0,matched:0},{samples:0,matched:0}];
      for(let j=0;j<samples.length;j++){const row=samples[j],n=row.reduce((s,v)=>s+v,0),hit=n>0;matched+=hit;pixels+=row.length;quiet+=n;run=hit?0:run+1;maxMissing=Math.max(maxMissing,run);const half=halves[j<samples.length/2?0:1];half.samples++;half.matched+=hit;}
      return {samples:samples.length,matched,maxMissing,pixels,quiet,halves};};
    for(const side of [0,1])for(const edge of [0,1])for(const c of cc.all){
      const b=c.box,inner=side?pairBox[2]:pairBox[0],near=edge?h:0,far=edge?b[1]-.5:b[3]+.5;
      const x0=side?inner:0,x1=side?w:inner,y0=edge?far:0,y1=edge?h:far;
      const W=x1-x0,H=y1-y0,A=W*H;
      if((edge?b[3]!==h-1:b[1]!==0)||W<w*.20||W>w*.65||H<h*.25||H>h*.68||c.pixels/A<.84||c.pixels/A>1.001)continue;
      if((edge?h-pairBox[3]:pairBox[1])>h*.08||(!edge&&(far<pairBox[3]+h*.025||far>pairBox[3]+h*.30))||(edge&&(far>pairBox[1]-h*.025||far<pairBox[1]-h*.30)))continue;
      // The foreground reaches the image edge, but stays on its own side of
      // the established pair. This also rejects a connected two-scene union.
      if(b[0]<x0||b[2]>x1||b[1]<y0||b[3]>y1)continue;
      let q=[[x0,y0],[x1,y0],[x1,y1],[x0,y1]];const ix0=Math.ceil(x0),ix1=Math.floor(x1),iy0=Math.ceil(y0),iy1=Math.floor(y1);
      if(anchors.some(p=>overlapArea(q,p._outline.map(v=>[v.x*w,v.y*h]))>1e-6))continue;
      const outside=[],seam=[];
      for(let y=Math.max(0,iy0);y<=Math.min(h-1,iy1);y++){
        outside.push([ex.bg[y*w+(side?w-1:0)]]);const s=[];
        for(let x=Math.floor(inner)-1;x<=Math.ceil(inner)+1;x++)if(x>=0&&x<w)s.push(ex.bg[y*w+x]);
        seam.push(s);
      }
      const outer=band(outside),shared=band(seam),farSamples=[];const dir=edge?-1:1;
      for(let x=Math.max(0,ix0);x<=Math.min(w-1,ix1);x++){
        const s=[];for(let d=0;d<3;d++){const y=edge?Math.floor(far)-d:Math.ceil(far)+d;if(y>=0&&y<h)s.push(ex.bg[y*w+x]);}farSamples.push(s);
      }
      const closing=band(farSamples);
      const good=(p,support,quiet)=>p.samples>=50&&p.matched/p.samples>=support&&p.quiet/p.pixels>=quiet&&p.maxMissing<=4&&p.halves.every(a=>a.samples>=25&&a.matched/a.samples>=support-.02);
      if(!good(outer,.995,.995)||!good(shared,.985,.40)||!good(closing,.985,.90))continue;
      let bleedSamples=0,bleedForeground=0,innerSamples=0,innerForeground=0,outerSamples=0,outerForeground=0;
      for(let x=Math.max(0,ix0);x<=Math.min(w-1,ix1);x++){
        bleedSamples++;bleedForeground+=!ex.bg[(edge?h-1:0)*w+x];
        for(let d=3;d<=7;d++){
          const a=Math.round(far-dir*d),b=Math.round(far+dir*d);
          if(a>=0&&a<h){innerSamples++;innerForeground+=!ex.bg[a*w+x];}
          if(b>=0&&b<h){outerSamples++;outerForeground+=!ex.bg[b*w+x];}
        }
      }
      if(bleedForeground/bleedSamples<.60||innerForeground/innerSamples<.50||outerForeground/outerSamples<.40)continue;
      let retained=0,foreign=0;const others=new Map();
      for(let y=Math.max(0,iy0);y<=Math.min(h-1,iy1);y++)for(let x=Math.max(0,ix0);x<=Math.min(w-1,ix1);x++){
        const id=cc.labels[y*w+x];if(id===c.id)retained++;else if(id)others.set(id,(others.get(id)||0)+1);
      }
      const detached=[],fringeParts=[],foreignIds=new Set();
      for(const [id,n]of others){const total=sizes.get(id);if(n===total&&total<A*.02)detached.push(n);else if(total<8&&n<total)fringeParts.push({inside:n,total});else foreignIds.add(id);}
      // A thin shared gutter can carry a few antialias pixels of a separate
      // neighbour. Bend the boundary inward there, rather than importing that
      // fragment or clipping any pixel of this cell's main component. A notch
      // may move at most three analysis pixels; larger crossings are deferred.
      const cutRows=new Map();let excludedPixels=0,unsafe=false;
      for(let y=Math.max(0,iy0);y<=Math.min(h-1,iy1);y++)for(let x=Math.max(0,ix0);x<=Math.min(w-1,ix1);x++)if(foreignIds.has(cc.labels[y*w+x])){
        const edge=side?x+.5:x-.5;
        if(Math.abs(edge-inner)>3){unsafe=true;continue;}
        const old=cutRows.get(y);cutRows.set(y,old===undefined?edge:side?Math.max(old,edge):Math.min(old,edge));excludedPixels++;
      }
      const cuts=[...cutRows].sort((a,b)=>a[0]-b[0]).map(([row,edge])=>({row,edge}));
      if(unsafe||cuts.length>12||excludedPixels>20||fringeParts.reduce((s,p)=>s+p.inside,0)>8)continue;
      q=neighborOutline([x0,y0,x1,y1],cuts,side,w);
      if(q.length>64||A-area(q)>30)continue;
      // Recount the final footprint. Detached, fully included ink is owned;
      // every substantive foreign component must now be entirely outside.
      let lost=0;
      for(let y=Math.max(0,iy0);y<=Math.min(h-1,iy1);y++)for(let x=Math.max(0,ix0);x<=Math.min(w-1,ix1);x++){
        const id=cc.labels[y*w+x],edge=cutRows.get(y),keep=edge===undefined||(side?x>=edge:x<=edge);
        if(!keep&&id&& !foreignIds.has(id))lost++;
        if(keep&&foreignIds.has(id))foreign++;
      }
      if(retained!==c.pixels||foreign||lost||detached.reduce((s,n)=>s+n,0)>A*.08)continue;
      const inkVeto=neighborInkVeto(rgba,w,h,[x0,y0,x1,y1]);if(inkVeto){log?.('local matte neighbour rejected: '+inkVeto.kind);continue;}
      if(typeof PanelClosedFrames==='undefined')return [];
      const check=[{box:[Math.ceil(x0)+4,Math.ceil(y0)+4,Math.floor(x1)-4,Math.floor(y1)-4]}];
      if(PanelClosedFrames.analyzeRGBA(rgba,w,h,null,{gradientOnly:true,localMatteInset:true,vetoCandidates:check}).length!==1)continue;
      const matteRGBA=new Uint8ClampedArray(rgba.length);for(let i=0;i<ex.bg.length;i++){const v=ex.bg[i]?0:200;matteRGBA[i*4]=matteRGBA[i*4+1]=matteRGBA[i*4+2]=v;matteRGBA[i*4+3]=255;}
      if(PanelClosedFrames.analyzeRGBA(matteRGBA,w,h,null,{gradientOnly:true,darkMatte:true,localMatteInset:true,vetoCandidates:check}).length!==1)continue;
      const proof={version:1,method:NEIGHBOR_METHOD,analysisWidth:w,analysisHeight:h,anchors,side,edge,q,cuts,excludedPixels,fringeParts,componentBox:b,pixels:c.pixels,retainedPixels:retained,foreignPixels:foreign,detachedPixels:detached,outer,shared,closing,bleedSamples,bleedForeground,innerSamples,innerForeground,outerSamples,outerForeground,uniformInkVetoPassed:true,dividerVetoPassed:true,insetVetoPassed:true};
      const p={x:x0/w,y:y0/h,w:W/w,h:H/h,_outline:q.map(v=>({x:v[0]/w,y:v[1]/h})),_identitySource:'matte-neighbor-frame',_geometryOwner:'matte-neighbor-outline',_geometryType:'pair-anchored-edge-cell',_neighborProof:proof};
      if(validNeighbor(p))out.push(p);
    }
    log?.('local matte neighbour: '+out.length+' independently closed edge cells');
    // Ambiguity is a miss, never choose the most convenient/nearest shape.
    return out.length===1?out:[];
  }
  function validNeighbor(p){try{return validateNeighbor(p);}catch(_){return false;}}
  function validateNeighbor(p){
    const pr=p?._neighborProof,W=pr?.analysisWidth,H=pr?.analysisHeight;
    if(p?._identitySource!=='matte-neighbor-frame'||pr?.version!==1||pr.method!==NEIGHBOR_METHOD||!Number.isInteger(W)||!Number.isInteger(H)||!inRange(W,250,900)||!inRange(H,350,900)||!Array.isArray(pr.anchors)||pr.anchors.length!==2||!pr.anchors.every(validPanel)||pr.anchors.some(a=>a._islandProof.analysisWidth!==W||a._islandProof.analysisHeight!==H)||![0,1].includes(pr.side)||![0,1].includes(pr.edge))return false;
    // Same complete pair, not two copies of one valid cell or unrelated proofs.
    if(pr.anchors[0]._islandProof.index!==0||pr.anchors[1]._islandProof.index!==1||JSON.stringify(pr.anchors[0]._islandProof.cells)!==JSON.stringify(pr.anchors[1]._islandProof.cells)||JSON.stringify(pr.anchors[0]._islandProof.pair)!==JSON.stringify(pr.anchors[1]._islandProof.pair))return false;
    const pairBox=bounds(pr.anchors.flatMap(a=>a._outline.map(v=>[v.x*W,v.y*H]))),b=pr.componentBox;
    if(!Array.isArray(b)||b.length!==4||b.some(n=>!Number.isInteger(n))||b[0]<0||b[1]<0||b[2]>=W||b[3]>=H||b[0]>=b[2]||b[1]>=b[3])return false;
    const inner=pr.side?pairBox[2]:pairBox[0],far=pr.edge?b[1]-.5:b[3]+.5,x0=pr.side?inner:0,x1=pr.side?W:inner,y0=pr.edge?far:0,y1=pr.edge?H:far,w=x1-x0,h=y1-y0,A=w*h;
    if(!Array.isArray(pr.cuts)||pr.cuts.length>12||pr.cuts.some((c,i)=>!Number.isInteger(c?.row)||!inRange(c.row,Math.max(0,Math.ceil(y0)),Math.min(H-1,Math.floor(y1)))||!finite(c.edge)||Math.abs(c.edge*2-Math.round(c.edge*2))>1e-8||!inRange(pr.side?c.edge-inner:inner-c.edge,0,3)||(i&&c.row<=pr.cuts[i-1].row))||!Number.isInteger(pr.excludedPixels)||!inRange(pr.excludedPixels,pr.cuts.length,20)||!Array.isArray(pr.fringeParts)||pr.fringeParts.length>8||pr.fringeParts.some(c=>!Number.isInteger(c?.inside)||!Number.isInteger(c?.total)||!inRange(c.total,2,7)||!inRange(c.inside,1,c.total-1))||pr.fringeParts.reduce((s,p)=>s+p.inside,0)>8)return false;
    const q=neighborOutline([x0,y0,x1,y1],pr.cuts,pr.side,W);if(q.length>64||A-area(q)>30)return false;
    if((pr.edge?b[3]!==H-1:b[1]!==0)||!inRange(w,W*.20,W*.65)||!inRange(h,H*.25,H*.68)||b[0]<x0||b[2]>x1||b[1]<y0||b[3]>y1||(pr.edge?H-pairBox[3]:pairBox[1])>H*.08||(!pr.edge&&(far<pairBox[3]+H*.025||far>pairBox[3]+H*.30))||(pr.edge&&(far>pairBox[1]-H*.025||far<pairBox[1]-H*.30)))return false;
    if(pr.anchors.some(a=>overlapArea(q,a._outline.map(v=>[v.x*W,v.y*H]))>1e-6)||JSON.stringify(q)!==JSON.stringify(pr.q))return false;
    if(!Number.isInteger(pr.pixels)||!inRange(pr.pixels/A,.84,1.001)||pr.retainedPixels!==pr.pixels||pr.foreignPixels!==0||!Array.isArray(pr.detachedPixels)||pr.detachedPixels.length>12000||pr.detachedPixels.some(n=>!Number.isInteger(n)||n<1||n>=A*.02)||pr.detachedPixels.reduce((s,n)=>s+n,0)>A*.08||pr.uniformInkVetoPassed!==true||pr.dividerVetoPassed!==true||pr.insetVetoPassed!==true)return false;
    const rows=Math.min(H-1,Math.floor(y1))-Math.max(0,Math.ceil(y0))+1,cols=Math.min(W-1,Math.floor(x1))-Math.max(0,Math.ceil(x0))+1;
    const good=(v,n,support,quiet,minDepth,maxDepth)=>{
      if(!v||v.samples!==n||n<50||!Number.isInteger(v.matched)||!inRange(v.matched/n,support,1)||!Number.isInteger(v.maxMissing)||!inRange(v.maxMissing,0,Math.min(4,n-v.matched))||!Number.isInteger(v.pixels)||!inRange(v.pixels,n*minDepth,n*maxDepth)||!Number.isInteger(v.quiet)||!inRange(v.quiet/v.pixels,quiet,1)||v.quiet<v.matched||!Array.isArray(v.halves)||v.halves.length!==2)return false;
      return v.halves.every((a,i)=>a.samples===(i?Math.floor(n/2):Math.ceil(n/2))&&a.samples>=25&&Number.isInteger(a.matched)&&inRange(a.matched/a.samples,support-.02,1))&&v.halves[0].matched+v.halves[1].matched===v.matched;
    };
    if(!good(pr.outer,rows,.995,.995,1,1)||!good(pr.shared,rows,.985,.40,3,4)||!good(pr.closing,cols,.985,.90,3,3))return false;
    if(pr.bleedSamples!==cols||!Number.isInteger(pr.bleedForeground)||!inRange(pr.bleedForeground/cols,.60,1)||pr.innerSamples!==cols*5||!Number.isInteger(pr.innerForeground)||!inRange(pr.innerForeground/pr.innerSamples,.50,1)||pr.outerSamples!==cols*5||!Number.isInteger(pr.outerForeground)||!inRange(pr.outerForeground/pr.outerSamples,.40,1))return false;
    return Array.isArray(p._outline)&&p._outline.length===q.length&&p._outline.every((a,i)=>inRange(a?.x,0,1)&&inRange(a?.y,0,1)&&Math.abs(a.x-q[i][0]/W)<1e-10&&Math.abs(a.y-q[i][1]/H)<1e-10)&&['x','y','w','h'].every(k=>finite(p[k]))&&Math.max(Math.abs(p.x-x0/W),Math.abs(p.y-y0/H),Math.abs(p.w-w/W),Math.abs(p.h-h/H))<1e-10;
  }
  function neighborImage(img,anchors,log){
    if(!Array.isArray(anchors)||anchors.length!==2||!anchors.every(validPanel))return [];
    const s=Math.min(1,900/Math.max(img.width,img.height)),w=Math.round(img.width*s),h=Math.round(img.height*s),c=document.createElement('canvas');c.width=w;c.height=h;
    const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0,w,h);return neighborRGBA(ctx.getImageData(0,0,w,h).data,w,h,anchors,log);
  }

  return {analyzeRGBA,analyzeImage,validPanel,neighborRGBA,neighborImage,validNeighbor};
})();
