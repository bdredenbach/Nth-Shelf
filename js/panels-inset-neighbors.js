/* Nth Shelf Frame Test 15 — separate the cells around a proved inset.
 * A known closed light rim is an occluder, not permission to merge its rows.
 * Flood a fixed, witnessed exterior palette; recursively prove narrow, straight
 * quiet corridors, allowing ONLY that measured inset to interrupt a corridor.
 * Each separator follows actual quiet samples, and all detached foreground in
 * a leaf contributes to its envelope. Clip envelopes to their measured region
 * and remove the inset before serializing exact even-odd pixel contours.
 * No comic/page identifiers, saved coordinates, image hash, or tap-derived crop.
 * Earlier supplements append identities. Test29 may prepend independently
 * proved subdivisions of a legacy composite, retaining all old objects and
 * their relative order as fallbacks. It never rewrites an accepted descriptor.
 */
const PanelInsetNeighbors = (() => {
  'use strict';
  const METHOD='inset-guided-exterior-corridor-partition',TOLERANCE=10;
  const finite=Number.isFinite,range=(v,a,b)=>finite(v)&&v>=a&&v<=b;
  const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
  const area=q=>q.reduce((s,a,i)=>{const b=q[(i+1)%q.length];return s+a[0]*b[1]-a[1]*b[0];},0)/2;
  const bounds=q=>[Math.min(...q.map(p=>p[0])),Math.min(...q.map(p=>p[1])),Math.max(...q.map(p=>p[0])),Math.max(...q.map(p=>p[1]))];
  const inside=(q,x,y)=>q.every((a,i)=>cross(a,q[(i+1)%q.length],[x,y])>=-1e-8);
  function hull(points){
    const ps=[...new Map(points.map(p=>[p.join(','),p])).values()].sort((a,b)=>a[0]-b[0]||a[1]-b[1]);if(ps.length<4)return null;
    const half=a=>{const out=[];for(const p of a){while(out.length>1&&cross(out.at(-2),out.at(-1),p)<=0)out.pop();out.push(p);}out.pop();return out;};
    return half(ps).concat(half(ps.slice().reverse()));
  }
  function exterior(rgba,w,h,color){
    const raw=new Uint8Array(w*h),bg=new Uint8Array(w*h),queue=new Int32Array(w*h);
    for(let i=0;i<raw.length;i++){if(rgba[i*4+3]!==255)return null;raw[i]=[0,1,2].every(c=>Math.abs(rgba[i*4+c]-color[c])<=TOLERANCE);}
    let head=0,n=0;const offer=i=>{if(raw[i]&&!bg[i]){bg[i]=1;queue[n++]=i;}};
    for(let x=0;x<w;x++){offer(x);offer((h-1)*w+x);}for(let y=0;y<h;y++){offer(y*w);offer(y*w+w-1);}
    while(head<n){const i=queue[head++],x=i%w,y=i/w|0;if(x)offer(i-1);if(x+1<w)offer(i+1);if(y)offer(i-w);if(y+1<h)offer(i+w);}
    return n>w*h*.025?{bg,pixels:n}:null;
  }
  function contentBounds(bg,occluder,w,h){
    const seen=new Uint8Array(w*h),queue=new Int32Array(w*h),large=[];let components=0;
    for(let seed=0;seed<seen.length;seed++)if(!seen[seed]&&!bg[seed]&&!occluder[seed]){
      if(++components>16000)return null;let head=0,n=1,x0=w,y0=h,x1=0,y1=0;seen[seed]=1;queue[0]=seed;
      const offer=i=>{if(!seen[i]&&!bg[i]&&!occluder[i]){seen[i]=1;queue[n++]=i;}};
      while(head<n){const i=queue[head++],x=i%w,y=i/w|0;x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);if(x)offer(i-1);if(x+1<w)offer(i+1);if(y)offer(i-w);if(y+1<h)offer(i+w);}
      if(n>=w*h*.008)large.push({box:[x0,y0,x1+1,y1+1],pixels:n});
    }
    if(large.length<3||large.length>24)return null;
    const b=bounds(large.flatMap(c=>[[c.box[0],c.box[1]],[c.box[2],c.box[3]]]));
    const root=[Math.max(1,b[0]-2),Math.max(1,b[1]-2),Math.min(w-1,b[2]+2),Math.min(h-1,b[3]+2)];
    return (root[2]-root[0])*(root[3]-root[1])>w*h*.5?{root,large}:null;
  }
  function scan(box,axis,bg,occ,w,h){
    const [x0,y0,x1,y1]=box,lo=axis?x0:y0,hi=axis?x1:y1,a=axis?y0:x0,b=axis?y1:x1;
    const index=(t,p)=>axis?t*w+p:p*w+t,minSize=Math.max(32,Math.round(axis?w*.10:h*.05)),depth=Math.max(14,Math.round(Math.max(w,h)*.025));
    if(hi-lo<2*minSize||b-a<50)return [];
    const opts=[];
    for(let p=lo+minSize;p<hi-minSize;p++){
      let good=0,quiet=0,actual=0,occluded=0;
      for(let t=a;t<b;t++){
        let found=0,ex=0,allOcc=1;
        for(let d=-2;d<=2;d++){const i=index(t,p+d),yes=bg[i]||occ[i];quiet+=yes;found|=yes;ex|=bg[i];allOcc&=occ[i];}
        good+=found;actual+=ex;occluded+=allOcc;
      }
      // Every coordinate needs a witnessed quiet pixel. No path through dark
      // artwork and no interpolation across an unproved speech balloon.
      if(good!==b-a)continue;
      const pureInset=occluded===b-a;
      if((actual/(b-a)>=.45&&quiet/(5*(b-a))>=.65)||pureInset)opts.push({p,quiet,actual,pureInset});
    }
    const runs=[];for(const p of opts){if(!runs.length||p.p!==runs.at(-1).at(-1).p+1||p.pureInset!==runs.at(-1).at(-1).pureInset)runs.push([]);runs.at(-1).push(p);}
    const out=[];
    for(const g of runs){
      const pure=g[0].pureInset,left=g[0].p,right=g.at(-1).p;
      if(!pure&&g.length>Math.max(25,Math.round((hi-lo)*.08)))continue;
      let before=0,after=0,bn=0,an=0;
      // Broad occluder corridors are tested outside their whole width.
      const refL=pure?left:(left+right)/2,refR=pure?right:refL;
      for(let p=Math.max(lo,Math.floor(refL-depth));p<Math.floor(refL)-2;p++)for(let t=a;t<b;t++){const i=index(t,p);before+=!bg[i]&&!occ[i];bn++;}
      for(let p=Math.ceil(refR)+3;p<Math.min(hi,Math.ceil(refR+depth));p++)for(let t=a;t<b;t++){const i=index(t,p);after+=!bg[i]&&!occ[i];an++;}
      if(!bn||!an||before/bn<.30||after/an<.30)continue;
      const best=pure?g[g.length>>1]:g.reduce((a,b)=>b.quiet>a.quiet?b:a),position=best.p;
      const path=[];
      for(let t=a;t<b;t++){
        const choices=[];for(let p=position-2;p<=position+2;p++){const i=index(t,p);if(bg[i]||occ[i])choices.push(p);}
        if(!choices.length)throw Error('corridor changed during sampling');
        // Keep the center of the closest contiguous quiet run, bounded to
        // the same five-pixel search band used to prove the separator.
        const near=choices.reduce((x,y)=>Math.abs(y-position)<Math.abs(x-position)?y:x);let l=near,r=near;
        while(choices.includes(l-1))l--;while(choices.includes(r+1))r++;
        path.push((l+r+1)/2);
      }
      let maxStep=0;for(let i=1;i<path.length;i++)maxStep=Math.max(maxStep,Math.abs(path[i]-path[i-1]));
      if(maxStep>4)continue;
      out.push({axis,box:box.slice(),position,start:a,path,samples:b-a,matched:b-a,quiet:best.quiet,actual:best.actual,pureInset:pure,before:before/bn,after:after/an,maxStep,
        score:(b-a)*(pure?1:1+best.quiet/(5*(b-a)))});
    }
    return out;
  }
  function partition(root,bg,occ,w,h){
    const cuts=[],leaves=[];
    function visit(box,path,depth){
      if(depth>8||leaves.length>16)return false;
      const options=[...scan(box,0,bg,occ,w,h),...scan(box,1,bg,occ,w,h)].sort((a,b)=>b.score-a.score||a.axis-b.axis||a.position-b.position);
      if(!options.length){leaves.push({box,path});return true;}
      const c=options[0],id=cuts.length;cuts.push(c);const [x0,y0,x1,y1]=box,p=c.position;
      return visit(c.axis?[x0,y0,p,y1]:[x0,y0,x1,p],path.concat({id,side:0}),depth+1)&&visit(c.axis?[p,y0,x1,y1]:[x0,p,x1,y1],path.concat({id,side:1}),depth+1);
    }
    if(!visit(root,[],0)||leaves.length<4||leaves.length>16)return null;
    const region=new Uint8Array(w*h);
    for(let y=root[1];y<root[3];y++)for(let x=root[0];x<root[2];x++){
      const leaf=leaves.findIndex(l=>l.path.every(p=>{const c=cuts[p.id],t=c.axis?y:x;const edge=c.path[Math.max(0,Math.min(c.path.length-1,t-c.start))];return ((c.axis?x:y)+.5<edge?0:1)===p.side;}));
      if(leaf<0)return null;region[y*w+x]=leaf+1;
    }
    return {cuts,leaves,region};
  }
  function outline(leaf,id,region,bg,occ,w,h,rgba,color){
    // Every substantial disconnected part contributes to the envelope. Tiny
    // scanned specks do not move a border into the exterior matte; they are
    // still retained when inside the measured envelope (including its halo).
    const labels=new Int32Array(w*h),queue=new Int32Array(w*h),parts=[],pts=[];
    const minComponentPixels=Math.max(12,Math.round(w*h*.000057));let next=0,foreground=0;
    for(let seed=0;seed<labels.length;seed++)if(region[seed]===id&&!bg[seed]&&!occ[seed]&&!labels[seed]){
      const partId=++next;let head=0,n=1,contrast=0;queue[0]=seed;labels[seed]=partId;
      const offer=i=>{if(region[i]===id&&!bg[i]&&!occ[i]&&!labels[i]){labels[i]=partId;queue[n++]=i;}};
      while(head<n){const i=queue[head++],x=i%w,y=i/w|0;contrast=Math.max(contrast,...[0,1,2].map(c=>Math.abs(rgba[i*4+c]-color[c])));if(x)offer(i-1);if(x+1<w)offer(i+1);if(y)offer(i-w);if(y+1<h)offer(i+w);}
      parts.push(n);foreground+=n;
      if(n>=minComponentPixels||contrast>24){const min=new Int32Array(h).fill(w),max=new Int32Array(h).fill(-1);for(let k=0;k<n;k++){const i=queue[k],x=i%w,y=i/w|0;min[y]=Math.min(min[y],x);max[y]=Math.max(max[y],x);}for(let y=0;y<h;y++)if(max[y]>=0)pts.push([min[y],y],[max[y]+1,y],[min[y],y+1],[max[y]+1,y+1]);}
    }
    if(foreground<w*h*.012)return null;
    const core=hull(pts);if(!core)return null;
    const q=hull(core.flatMap(p=>[-1,1].flatMap(x=>[-1,1].map(y=>[p[0]+x,p[1]+y]))));
    const label=new Uint8Array(w*h);let pixels=0,retained=0;
    const b=bounds(q);
    for(let y=Math.max(0,Math.floor(b[1]));y<Math.min(h,Math.ceil(b[3]));y++)for(let x=Math.max(0,Math.floor(b[0]));x<Math.min(w,Math.ceil(b[2]));x++){
      const i=y*w+x;if(region[i]===id&&!occ[i]&&inside(q,x+.5,y+.5)){label[i]=1;pixels++;retained+=!bg[i];}}
    let excludedScanSpecks=0,largePartLoss=0,maxDiscardedContrast=0;
    for(let i=0;i<labels.length;i++)if(labels[i]&&!label[i]){excludedScanSpecks++;maxDiscardedContrast=Math.max(maxDiscardedContrast,...[0,1,2].map(c=>Math.abs(rgba[i*4+c]-color[c])));if(parts[labels[i]-1]>=minComponentPixels)largePartLoss++;}
    if(largePartLoss||maxDiscardedContrast>24||excludedScanSpecks>Math.max(80,foreground*.0025)||retained!==foreground-excludedScanSpecks||pixels<w*h*.020||pixels>w*h*.40||foreground/pixels<.42)return {withheld:'foreground retention '+JSON.stringify({largePartLoss,excludedScanSpecks,foreground,retained,pixels,maxDiscardedContrast})};
    const contours=trace(label,w,h,1);if(!contours||contours.length!==1||contours[0].length>1024)return {withheld:'contour topology '+JSON.stringify(contours?.map(q=>[q.length,area(q)]))};
    const box=bounds(contours[0]),A=(box[2]-box[0])*(box[3]-box[1]);
    if(pixels/A<.80||box[2]-box[0]<w*.10||box[3]-box[1]<h*.045)return null;
    // Check the whole silhouette boundary, including the measured inset notch.
    const rim=Array.from({length:4},()=>({samples:0,matched:0}));
    for(const ring of contours)for(let j=0;j<ring.length;j++){
      const a=ring[j],b=ring[(j+1)%ring.length],dx=b[0]-a[0],dy=b[1]-a[1],L=Math.hypot(dx,dy),nx=dy/L,ny=-dx/L;
      const side=Math.abs(nx)>Math.abs(ny)?(nx<0?2:3):(ny<0?0:1),s=rim[side];
      for(let t=.5;t<L;t++){
        let yes=0;for(const d of [.5,1.5,2.5]){const x=Math.floor(a[0]+dx*t/L+nx*d),y=Math.floor(a[1]+dy*t/L+ny*d);if(x>=0&&x<w&&y>=0&&y<h&&(bg[y*w+x]||occ[y*w+x]))yes=1;}
        s.samples++;s.matched+=yes;
      }
    }
    if(rim.some(s=>s.samples<25||s.matched/s.samples<.93))return {withheld:'rim',rim,box};
    return {contours,box,pixels,foreground:retained,rawForeground:foreground,excludedScanSpecks,minComponentPixels,maxDiscardedContrast,rim,label};
  }
  function trace(labels,w,h,id) {
    const stride=w+1,edges=[],next=new Map();
    const add=(x1,y1,x2,y2,dir)=>{const a=y1*stride+x1,b=y2*stride+x2,index=edges.length;edges.push({a,b,dir});if(!next.has(a))next.set(a,[]);next.get(a).push(index);};
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){const k=y*w+x;if(labels[k]!==id)continue;
      if(!y||labels[k-w]!==id)add(x,y,x+1,y,0);
      if(x+1===w||labels[k+1]!==id)add(x+1,y,x+1,y+1,1);
      if(y+1===h||labels[k+w]!==id)add(x+1,y+1,x,y+1,2);
      if(!x||labels[k-1]!==id)add(x,y+1,x,y,3);
    }
    if(edges.length>16000)return null;
    const used=new Uint8Array(edges.length),rings=[];
    for(let seed=0;seed<edges.length;seed++)if(!used[seed]){
      let at=seed;const points=[];
      for(let steps=0;steps<=edges.length;steps++){
        if(used[at])return null;const e=edges[at];used[at]=1;points.push([e.a%stride,e.a/stride|0]);
        if(e.b===edges[seed].a)break;
        const opts=(next.get(e.b)||[]).filter(k=>!used[k]);if(!opts.length)return null;
        opts.sort((a,b)=>{const rank=k=>{const d=(edges[k].dir-e.dir+4)%4;return d===1?0:d===0?1:d===3?2:3;};return rank(a)-rank(b);});at=opts[0];
      }
      // Exact collinear simplification does not move any contour edge.
      const q=points.filter((p,i)=>{const a=points[(i+points.length-1)%points.length],b=points[(i+1)%points.length];return (p[0]-a[0])*(b[1]-p[1])!==(p[1]-a[1])*(b[0]-p[0]);});
      if(q.length<4||q.length>2048||!area(q))return null;rings.push(q);
      if(rings.length>12)return null;
    }
    return rings.sort((a,b)=>Math.abs(area(b))-Math.abs(area(a)));
  }
  function uniformInset(rgba,gray,w,h,box){
    const lines=[[],[]];
    for(const v of [false,true]){
      const [x0,y0,x1,y1]=box,lo=v?y0:x0,hi=v?y1:x1,a=v?x0:y0,b=v?x1:y1,index=(t,p)=>v?t*w+p:p*w+t;
      const neutral=i=>gray[i]<80&&Math.max(rgba[i*4],rgba[i*4+1],rgba[i*4+2])-Math.min(rgba[i*4],rgba[i*4+1],rgba[i*4+2])<=10;
      for(let p=a+3;p<=b-3;p++){
        for(let t=lo+3;t<=hi-3;t++){
          const k=index(t,p);if(!neutral(k))continue;const first=t,ink=gray[k];
          while(t+1<=hi-3&&neutral(index(t+1,p))&&Math.abs(gray[index(t+1,p)]-ink)<=2.5)t++;
          if(t-first<Math.max(24,(hi-lo)*.20))continue;
          let n=0,thin=0;
          for(let u=first+2;u<=t-2;u++){
            const c=gray[index(u,p)];let l=p,r=p;n++;
            while(l>p-6&&Math.abs(gray[index(u,l-1)]-c)<=3)l--;while(r<p+6&&Math.abs(gray[index(u,r+1)]-c)<=3)r++;
            if(l===p-6||r===p+6||r-l>7)continue;
            let before=0,after=0;for(let d=2;d<=4;d++){before+=gray[index(u,l-d)];after+=gray[index(u,r+d)];}
            if(Math.max(Math.abs(before/3-c),Math.abs(after/3-c))>18)thin++;
          }
          if(n&&thin/n>=.88)lines[v?1:0].push({p,lo:first,hi:t});
        }
      }
    }
    const [hs,vs]=lines,local=(box[2]-box[0])*(box[3]-box[1]);
    for(let i=0;i<hs.length;i++)for(let j=i+1;j<hs.length;j++){
      const a=hs[i],b=hs[j];if(b.p-a.p<24||Math.abs(a.lo-b.lo)>5||Math.abs(a.hi-b.hi)>5)continue;
      const left=(a.lo+b.lo)/2,right=(a.hi+b.hi)/2,A=(right-left)*(b.p-a.p);
      if(A<local*.04||A>local*.82||left<box[0]+3||right>box[2]-3)continue;
      const ends=[left,right].map(x=>vs.some(r=>Math.abs(r.p-x)<=5&&Math.abs(r.lo-a.p)<=5&&Math.abs(r.hi-b.p)<=5));
      if(ends.every(Boolean))return true;
    }
    return false;
  }
  // A nearly spanning quiet corridor with a real break is evidence AGAINST
  // accepting its containing leaf. Reconstruct only known-inset occlusions;
  // unknown bubbles/artwork must never become permission to merge two scenes.
  function interruptedDivider(box,bg,occ,w,h){
    for(const axis of [0,1]){
      const [x0,y0,x1,y1]=box,lo=axis?x0:y0,hi=axis?x1:y1,a=axis?y0:x0,b=axis?y1:x1;
      const index=(t,p)=>axis?t*w+p:p*w+t,min=Math.max(32,Math.round(axis?w*.10:h*.05)),depth=Math.max(14,Math.round(Math.max(w,h)*.025));
      if(hi-lo<2*min||b-a<50)continue;
      for(let p=lo+min;p<hi-min;p++){
        let matched=0,actual=0,quiet=0;
        for(let t=a;t<b;t++){let yes=0,ex=0;for(let d=-2;d<=2;d++){const i=index(t,p+d);yes|=bg[i]||occ[i];ex|=bg[i];quiet+=bg[i]||occ[i];}matched+=yes;actual+=ex;}
        if(matched/(b-a)<.90||actual/(b-a)<.45||quiet/(5*(b-a))<.65)continue;
        let before=0,after=0,bn=0,an=0;
        for(let v=Math.max(lo,p-depth);v<p-2;v++)for(let t=a;t<b;t++){const i=index(t,v);before+=!bg[i]&&!occ[i];bn++;}
        for(let v=p+3;v<Math.min(hi,p+depth);v++)for(let t=a;t<b;t++){const i=index(t,v);after+=!bg[i]&&!occ[i];an++;}
        if(bn&&an&&before/bn>=.30&&after/an>=.30)return {axis,position:p,matched,samples:b-a};
      }
    }return null;
  }
  function analyzeRGBA(rgba,w,h,anchors,log){
    if(!Number.isInteger(w)||!Number.isInteger(h)||w<250||h<350||w>900||h>900||!rgba||rgba.length!==w*h*4||!Array.isArray(anchors)||anchors.length!==1||typeof PanelFramedInsets==='undefined'||!PanelFramedInsets.validPanel(anchors[0]))return [];
    const anchor=anchors[0];if(anchor._insetRimProof.analysisWidth!==w||anchor._insetRimProof.analysisHeight!==h)return [];
    // Bind a supplied anchor to this actual raster, not just well-formed JSON.
    const witnessed=PanelFramedInsets.analyzeRGBA(rgba,w,h);if(witnessed.length!==1||JSON.stringify(witnessed[0])!==JSON.stringify(anchor))return [];
    const ex=exterior(rgba,w,h,anchor._insetRimProof.color);if(!ex)return [];
    const aq=anchor._outline.map(p=>[p.x*w,p.y*h]),occ=new Uint8Array(w*h);
    for(let y=0;y<h;y++)for(let x=0;x<w;x++)occ[y*w+x]=inside(aq,x+.5,y+.5);
    const content=contentBounds(ex.bg,occ,w,h);if(!content)return [];
    const result=partition(content.root,ex.bg,occ,w,h);if(!result)return [];
    log?.('inset corridor partition: '+result.leaves.length+' candidate cells');
    const out=[],gray=new Float32Array(w*h);for(let i=0;i<gray.length;i++)gray[i]=rgba[i*4]*.299+rgba[i*4+1]*.587+rgba[i*4+2]*.114;
    for(let i=0;i<result.leaves.length;i++){
      const partial=interruptedDivider(result.leaves[i].box,ex.bg,occ,w,h);
      if(partial){log?.('inset neighbour '+i+' withheld: unproved interrupted divider '+JSON.stringify(partial));continue;}
      const shape=outline(result.leaves[i],i+1,result.region,ex.bg,occ,w,h,rgba,anchor._insetRimProof.color);if(!shape||shape.withheld){log?.('inset neighbour '+i+' withheld: '+JSON.stringify(shape?.withheld?{reason:shape.withheld,rim:shape.rim,box:shape.box}:'small/ambiguous silhouette'));continue;}
      const b=shape.box,check={box:[b[0]+5,b[1]+5,b[2]-5,b[3]-5]};
      if(uniformInset(rgba,gray,w,h,check.box)){log?.('inset neighbour '+i+' withheld: internal uniform-ink inset');continue;}
      if(typeof PanelClosedFrames==='undefined'||PanelClosedFrames.analyzeRGBA(rgba,w,h,null,{gradientOnly:true,localMatteInset:true,vetoCandidates:[check]}).length!==1){log?.('inset neighbour '+i+' withheld: divider/inset');continue;}
      const proof={version:1,method:METHOD,analysisWidth:w,analysisHeight:h,tolerance:TOLERANCE,padding:1,anchor,root:content.root,cuts:result.cuts.map(({score,...rest})=>rest),path:result.leaves[i].path,index:i,leafCount:result.leaves.length,
        foregroundPixels:shape.foreground,retainedPixels:shape.foreground,rawForegroundPixels:shape.rawForeground,excludedScanSpecks:shape.excludedScanSpecks,minComponentPixels:shape.minComponentPixels,maxDiscardedContrast:shape.maxDiscardedContrast,pixelCount:shape.pixels,foreignPixels:0,rim:shape.rim,pixelContours:shape.contours,uniformInkVetoPassed:true,interruptedDividerVetoPassed:true,dividerVetoPassed:true,insetVetoPassed:true};
      const p={x:b[0]/w,y:b[1]/h,w:(b[2]-b[0])/w,h:(b[3]-b[1])/h,_contours:shape.contours.map(q=>q.map(p=>({x:p[0]/w,y:p[1]/h}))),_identitySource:'inset-neighbor-frame',_geometryOwner:'inset-neighbor-contours',_geometryType:'inset-guided-corridor-cell',_insetNeighborProof:proof};
      if(validPanel(p))out.push(p);else log?.('inset neighbour '+i+' withheld: proof');
    }
    log?.('inset neighbours: '+out.length+' independently bounded visible cells');return out;
  }
  function validPanel(p){try{return validate(p);}catch(_){return false;}}
  function validate(p){
    if(p?._insetNeighborProof?.version===10)return validPairPanel(p);
    if(p?._insetNeighborProof?.version===9)return validWideResidualPanel(p);
    if(p?._insetNeighborProof?.version===8)return validWideActionPanel(p);
    if(p?._insetNeighborProof?.version===7)return validWideCalloutPanel(p);
    if(p?._insetNeighborProof?.version===6)return validWideInnerPanel(p);
    if(p?._insetNeighborProof?.version===5)return validWideFlankPanel(p);
    if(p?._insetNeighborProof?.version===4)return validWideTerminalPanel(p);
    if(p?._insetNeighborProof?.version===2)return validBandPanel(p);
    if(p?._insetNeighborProof?.version===3)return validTierPanel(p);
    const pr=p?._insetNeighborProof,W=pr?.analysisWidth,H=pr?.analysisHeight,rings=p?._contours;
    if(p?._identitySource!=='inset-neighbor-frame'||pr?.version!==1||pr.method!==METHOD||!Number.isInteger(W)||!Number.isInteger(H)||!range(W,250,900)||!range(H,350,900)||pr.tolerance!==TOLERANCE||pr.padding!==1||typeof PanelFramedInsets==='undefined'||!PanelFramedInsets.validPanel(pr.anchor)||pr.anchor._insetRimProof.analysisWidth!==W||pr.anchor._insetRimProof.analysisHeight!==H)return false;
    const b=pr.root;if(!Array.isArray(b)||b.length!==4||b.some(v=>!Number.isInteger(v))||b[0]<1||b[1]<1||b[2]>=W||b[3]>=H||b[0]>=b[2]||b[1]>=b[3]||(b[2]-b[0])*(b[3]-b[1])<=W*H*.5)return false;
    if(!Number.isInteger(pr.leafCount)||!range(pr.leafCount,4,16)||!Number.isInteger(pr.index)||!range(pr.index,0,pr.leafCount-1)||!Array.isArray(pr.cuts)||pr.cuts.length!==pr.leafCount-1||!Array.isArray(pr.path)||!range(pr.path.length,1,9))return false;
    for(const c of pr.cuts){
      if(![0,1].includes(c?.axis)||!Array.isArray(c.box)||c.box.length!==4||c.box.some(v=>!Number.isInteger(v))||c.box[0]<b[0]||c.box[1]<b[1]||c.box[2]>b[2]||c.box[3]>b[3]||c.box[0]>=c.box[2]||c.box[1]>=c.box[3]||!Number.isInteger(c.position)||typeof c.pureInset!=='boolean')return false;
      const lo=c.axis?c.box[0]:c.box[1],hi=c.axis?c.box[2]:c.box[3],a=c.axis?c.box[1]:c.box[0],z=c.axis?c.box[3]:c.box[2],min=Math.max(32,Math.round(c.axis?W*.10:H*.05));
      if(c.position<lo+min||c.position>=hi-min||c.start!==a||c.samples!==z-a||c.samples<50||c.matched!==c.samples||!Number.isInteger(c.quiet)||!range(c.quiet/(5*c.samples),c.pureInset?1:.65,1)||!Number.isInteger(c.actual)||!range(c.actual/c.samples,c.pureInset?0:.45,1)||!range(c.before,.30,1)||!range(c.after,.30,1)||!Array.isArray(c.path)||c.path.length!==c.samples||c.path.some(v=>!finite(v)||!range(v,c.position-1.5,c.position+2.5)||Math.abs(v*2-Math.round(v*2))>1e-8))return false;
      let step=0;for(let i=1;i<c.path.length;i++)step=Math.max(step,Math.abs(c.path[i]-c.path[i-1]));if(c.maxStep!==step||step>4)return false;
    }
    let region=b.slice(),used=new Set();for(const v of pr.path){if(!Number.isInteger(v?.id)||!range(v.id,0,pr.cuts.length-1)||![0,1].includes(v.side)||used.has(v.id))return false;used.add(v.id);const c=pr.cuts[v.id];if(JSON.stringify(c.box)!==JSON.stringify(region))return false;if(c.axis)region[v.side?0:2]=c.position;else region[v.side?1:3]=c.position;}
    if(!range(pr.maxDiscardedContrast,0,24)||pr.minComponentPixels!==Math.max(12,Math.round(W*H*.000057))||!Number.isInteger(pr.rawForegroundPixels)||!Number.isInteger(pr.excludedScanSpecks)||!range(pr.excludedScanSpecks,0,Math.max(80,pr.rawForegroundPixels*.0025))||pr.rawForegroundPixels-pr.excludedScanSpecks!==pr.foregroundPixels||!Number.isInteger(pr.foregroundPixels)||!range(pr.foregroundPixels,W*H*.012,W*H)||pr.retainedPixels!==pr.foregroundPixels||pr.foreignPixels!==0||!Number.isInteger(pr.pixelCount)||!range(pr.pixelCount,W*H*.020,W*H*.40)||!range(pr.foregroundPixels/pr.pixelCount,.42,1)||pr.uniformInkVetoPassed!==true||pr.interruptedDividerVetoPassed!==true||pr.dividerVetoPassed!==true||pr.insetVetoPassed!==true||!Array.isArray(pr.rim)||pr.rim.length!==4||pr.rim.some(s=>!Number.isInteger(s?.samples)||s.samples<25||!Number.isInteger(s.matched)||!range(s.matched/s.samples,.93,1)))return false;
    if(!Array.isArray(rings)||rings.length!==1||!Array.isArray(rings[0])||rings[0].length<4||rings[0].length>1024)return false;
    const q=[];for(const p of rings[0]){if(!range(p?.x,0,1)||!range(p?.y,0,1)||Math.abs(p.x*W-Math.round(p.x*W))>1e-7||Math.abs(p.y*H-Math.round(p.y*H))>1e-7)return false;q.push([Math.round(p.x*W),Math.round(p.y*H)]);}
    if(!Array.isArray(pr.pixelContours)||pr.pixelContours.length!==1||JSON.stringify(pr.pixelContours[0])!==JSON.stringify(q))return false;
    const qb=bounds(q);if(qb[0]<region[0]-3||qb[1]<region[1]-3||qb[2]>region[2]+3||qb[3]>region[3]+3)return false;
    const seen=new Set();for(let i=0;i<q.length;i++){const a=q[i],c=q[(i+1)%q.length],key=a.join(',');if(seen.has(key)||(a[0]!==c[0]&&a[1]!==c[1])||(a[0]===c[0]&&a[1]===c[1]))return false;seen.add(key);}
    if(area(q)!==pr.pixelCount)return false;
    const box=bounds(q);if(box[0]<b[0]||box[1]<b[1]||box[2]>b[2]||box[3]>b[3]||box[2]-box[0]<W*.10||box[3]-box[1]<H*.045||pr.pixelCount/((box[2]-box[0])*(box[3]-box[1]))<.80)return false;
    // Axis-aligned contour edges must not cross themselves. Adjacent segments
    // can share only their common endpoint; exact collinear vertices are gone.
    for(let i=0;i<q.length;i++)for(let j=i+2;j<q.length;j++){
      if(i===0&&j===q.length-1)continue;const a=q[i],b=q[(i+1)%q.length],c=q[j],d=q[(j+1)%q.length];
      if(Math.max(a[0],b[0])<Math.min(c[0],d[0])||Math.max(c[0],d[0])<Math.min(a[0],b[0])||Math.max(a[1],b[1])<Math.min(c[1],d[1])||Math.max(c[1],d[1])<Math.min(a[1],b[1]))continue;
      if(cross(a,b,c)*cross(a,b,d)<=0&&cross(c,d,a)*cross(c,d,b)<=0)return false;
    }
    return ['x','y','w','h'].every(k=>finite(p[k]))&&Math.max(Math.abs(p.x-box[0]/W),Math.abs(p.y-box[1]/H),Math.abs(p.w-(box[2]-box[0])/W),Math.abs(p.h-(box[3]-box[1])/H))<1e-10;
  }
  function supplementImage(img,anchors,log){
    if(!Array.isArray(anchors)||anchors.length!==1||typeof PanelFramedInsets==='undefined'||!PanelFramedInsets.validPanel(anchors[0]))return [];
    const s=Math.min(1,900/Math.max(img.width,img.height)),w=Math.round(img.width*s),h=Math.round(img.height*s),c=document.createElement('canvas');c.width=w;c.height=h;
    const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0,w,h);return analyzeRGBA(ctx.getImageData(0,0,w,h).data,w,h,anchors,log);
  }
  // Test20: two locally bounded scenes between a terminal rim and a re-proved
  // crossing inset. Palette samples propose quiet corridors; every coordinate
  // and every bend must be witnessed. Only the known inset may occlude a rim.
  // This opt-in supplement leaves the earlier whole-page partition unchanged.
  const BAND_METHOD='terminal-inset-local-band-with-witnessed-stepped-corridors';
  function quietRows(bg,rgba,w,h,x0,x1,lo,hi){
    const rows=[];
    for(let y=lo;y<=hi;y++){
      let matched=0,quiet=0,before=0,after=0;
      for(let x=x0;x<x1;x++){
        let yes=0,a=0,b=0;
        for(let d=-2;d<=2;d++){yes|=bg[(y+d)*w+x];quiet+=bg[(y+d)*w+x];}
        for(let d=3;d<=14;d++)for(const side of [-1,1]){const k=((y+side*d)*w+x)*4,g=rgba[k]*.299+rgba[k+1]*.587+rgba[k+2]*.114;if(side<0)a=Math.max(a,g);else b=Math.max(b,g);}
        matched+=yes;before+=a>40;after+=b>40;
      }
      const n=x1-x0;if(matched===n&&quiet/(5*n)>=.70&&before/n>=.40&&after/n>=.40)rows.push({y,quiet,samples:n,before,after});
    }
    const groups=[];for(const r of rows){if(!groups.length||r.y!==groups.at(-1).at(-1).y+1)groups.push([]);groups.at(-1).push(r);}
    return groups.filter(g=>g.length<=Math.max(20,Math.round(h*.025))).map(g=>{
      const best=g.reduce((a,b)=>b.quiet>a.quiet?b:a);return {...best,run:[g[0].y,g.at(-1).y]};
    });
  }
  function corridor(bg,occ,w,h,x0,x1,target,spread,minExterior=.60){
    const lo=Math.max(1,target-spread),hi=Math.min(h-2,target+spread),H=hi-lo+1,N=x1-x0;
    if(N<60||H>81||H<3)return null;
    let old=new Float64Array(H).fill(Infinity);const parents=new Int16Array(N*H).fill(-1);
    const yes=(x,y)=>bg[y*w+x]||occ[y*w+x];
    for(let j=0;j<H;j++)if(yes(x0,lo+j))old[j]=Math.abs(lo+j-target)*.07;
    for(let t=1;t<N;t++){
      const x=x0+t,now=new Float64Array(H).fill(Infinity),runs=[];
      for(let j=0;j<H;j++)if(yes(x,lo+j)){const start=j;while(j+1<H&&yes(x,lo+j+1))j++;runs.push([start,j]);}
      for(const [a,b] of runs)for(let j=a;j<=b;j++){
        let best=Infinity,from=-1;
        for(let k=a;k<=b;k++)if(finite(old[k])){const score=old[k]+Math.abs(j-k)*1.8+Math.abs(lo+j-target)*.07+(j===a||j===b?.06:0);if(score<best){best=score;from=k;}}
        now[j]=best;parents[t*H+j]=from;
      }
      old=now;
    }
    let end=-1;for(let j=0;j<H;j++)if(finite(old[j])&&(end<0||old[j]<old[end]))end=j;if(end<0)return null;
    const path=new Array(N);let at=end;for(let t=N-1;t>=0;t--){path[t]=lo+at+.5;if(t)at=parents[t*H+at];if(at<0)return null;}
    let variation=0,maxStep=0,samples=0,exteriorSamples=0;
    for(let t=0;t<N;t++){
      const a=Math.floor(t?path[t-1]:path[t]),b=Math.floor(path[t]);variation+=Math.abs(a-b);maxStep=Math.max(maxStep,Math.abs(a-b));
      for(let y=Math.min(a,b);y<=Math.max(a,b);y++){if(!yes(x0+t,y))return null;samples++;exteriorSamples+=bg[y*w+x0+t];}
    }
    if(variation>Math.max(12,N*.14)||maxStep>Math.max(3,Math.round(h*.025))||exteriorSamples/samples<minExterior)return null;
    return {x0,x1,target,spread,path,samples,matched:samples,exteriorSamples,variation,maxStep,minExterior};
  }
  function bandProofPath(c,w,h,minExterior=.60){
    if(!c||![c.x0,c.x1,c.target,c.spread,c.samples,c.matched,c.exteriorSamples,c.variation,c.maxStep].every(Number.isInteger)||c.x0<1||c.x1>=w||c.x1-c.x0<60||!range(c.spread,3,40)||c.target-c.spread<1||c.target+c.spread>=h-1||!Array.isArray(c.path)||c.path.length!==c.x1-c.x0)return false;
    let variation=0,max=0;for(let i=0;i<c.path.length;i++){const y=c.path[i];if(!finite(y)||y<Math.max(1,c.target-c.spread)+.5||y>Math.min(h-2,c.target+c.spread)+.5||Math.abs(y-Math.floor(y)-.5)>1e-8)return false;const d=i?Math.abs(y-c.path[i-1]):0;variation+=d;max=Math.max(max,d);}
    return c.variation===variation&&c.maxStep===max&&variation<=Math.max(12,c.path.length*.14)&&max<=Math.max(3,Math.round(h*.025))&&c.samples===c.path.length+variation&&c.matched===c.samples&&c.minExterior===minExterior&&range(c.exteriorSamples/c.samples,minExterior,1);
  }
  function bandUniformDivider(rgba,gray,w,h,box){
    for(const v of [false,true]){
      const [x0,y0,x1,y1]=box,lo=v?y0:x0,hi=v?y1:x1,a=v?x0:y0,b=v?x1:y1,margin=Math.max(10,(b-a)*.10),index=(t,p)=>v?t*w+p:p*w+t;
      for(let p=Math.ceil(a+margin);p<b-margin;p++){
        let n=0,neutral=0,narrow=0,sum=0,square=0;
        for(let t=lo+3;t<=hi-3;t++){
          const i=index(t,p),g=gray[i],r=rgba[i*4],gg=rgba[i*4+1],bb=rgba[i*4+2];n++;
          if(g>=80||Math.max(r,gg,bb)-Math.min(r,gg,bb)>10)continue;
          neutral++;sum+=g;square+=g*g;let l=p,rr=p;
          while(l>p-6&&Math.abs(gray[index(t,l-1)]-g)<=3)l--;while(rr<p+6&&Math.abs(gray[index(t,rr+1)]-g)<=3)rr++;
          if(l===p-6||rr===p+6||rr-l>7)continue;
          let before=0,after=0;for(let d=2;d<=4;d++){before+=gray[index(t,l-d)];after+=gray[index(t,rr+d)];}
          narrow+=Math.min(Math.abs(before/3-g),Math.abs(after/3-g))>8;
        }
        if(n>=40&&neutral/n>=.98&&narrow/n>=.72&&square/neutral-(sum/neutral)**2<=36)return true;
      }
    }return false;
  }

  // A large, almost-flat island bounded by a contrasting collar is a
  // nested-frame veto even when its dark border joins surrounding artwork.
  // Small caption plates do not meet the required area and two-axis extent.
  function bandFlatInset(rgba,gray,w,h,box){
    const [x0,y0,x1,y1]=box,local=(x1-x0)*(y1-y0),seen=new Uint8Array(w*h),queue=new Int32Array(w*h);
    for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){
      const seed=y*w+x;if(seen[seed]||gray[seed]<55)continue;
      const color=[rgba[seed*4],rgba[seed*4+1],rgba[seed*4+2]];let head=0,n=1,L=x,R=x,T=y,B=y;seen[seed]=1;queue[0]=seed;
      const offer=i=>{if(!seen[i]&&[0,1,2].every(c=>Math.abs(rgba[i*4+c]-color[c])<=3)){seen[i]=1;queue[n++]=i;}};
      while(head<n){const i=queue[head++],u=i%w,v=i/w|0;L=Math.min(L,u);R=Math.max(R,u);T=Math.min(T,v);B=Math.max(B,v);if(u>x0)offer(i-1);if(u+1<x1)offer(i+1);if(v>y0)offer(i-w);if(v+1<y1)offer(i+w);}
      const A=(R-L+1)*(B-T+1);if(n<local*.065||n/A<.88||A>local*.65||R-L<24||B-T<24||L<x0+8||R>x1-8||T<y0+8||B>y1-8)continue;
      const base=color[0]*.299+color[1]*.587+color[2]*.114,sides=[];
      for(let s=0;s<4;s++){
        const vertical=s>=2,lo=vertical?T:L,hi=vertical?B:R,p=s===0?T:s===1?B:s===2?L:R,dir=s===0||s===2?-1:1;let matched=0,total=0;
        for(let a=lo+3;a<=hi-3;a++){let ink=Infinity;for(let d=1;d<=7;d++){const xx=vertical?p+dir*d:a,yy=vertical?a:p+dir*d;ink=Math.min(ink,gray[yy*w+xx]);}matched+=ink<base-24;total++;}sides.push(matched/total);
      }
      if(sides.every(f=>f>=.92))return true;
    }return false;
  }
  function bandOutline(id,region,bg,occ,w,h){
    const label=new Uint8Array(w*h);let pixels=0,foreground=0;
    for(let i=0;i<label.length;i++)if(region[i]===id&&!occ[i]){label[i]=1;pixels++;foreground+=!bg[i];}
    if(pixels<w*h*.020||pixels>w*h*.40||foreground<w*h*.012||foreground/pixels<.42)return null;
    const contours=trace(label,w,h,1);if(!contours||contours.length!==1||contours[0].length>1024)return null;
    const box=bounds(contours[0]);if(pixels/((box[2]-box[0])*(box[3]-box[1]))<.80)return null;
    // A witnessed quiet pixel may lie just inside the integer contour after
    // rasterizing a half-pixel path. Include that pixel, not an extrapolated
    // outside-only test which can land in the adjacent scene.
    const rim=Array.from({length:4},()=>({samples:0,matched:0}));
    for(const q of contours)for(let j=0;j<q.length;j++){
      const a=q[j],b=q[(j+1)%q.length],dx=b[0]-a[0],dy=b[1]-a[1],L=Math.hypot(dx,dy),nx=dy/L,ny=-dx/L;
      const s=rim[Math.abs(nx)>Math.abs(ny)?(nx<0?2:3):(ny<0?0:1)];
      for(let t=.5;t<L;t++){let yes=0;for(const d of [-.5,.5,1.5,2.5]){const x=Math.floor(a[0]+dx*t/L+nx*d),y=Math.floor(a[1]+dy*t/L+ny*d);if(x>=0&&x<w&&y>=0&&y<h&&(bg[y*w+x]||occ[y*w+x]))yes=1;}s.samples++;s.matched+=yes;}
    }
    if(rim.some(s=>s.samples<25||s.matched/s.samples<.93))return {withheld:'observed contour rim',box,rim};
    return {contours,box,pixels,foreground,rawForeground:foreground,excludedScanSpecks:0,minComponentPixels:Math.max(12,Math.round(w*h*.000057)),maxDiscardedContrast:0,rim,label};
  }
  function terminalBandRGBA(rgba,w,h,anchors,log){
    if(!Number.isInteger(w)||!Number.isInteger(h)||!range(w,250,900)||!range(h,350,900)||!(rgba instanceof Uint8Array||rgba instanceof Uint8ClampedArray)||rgba.length!==w*h*4||!Array.isArray(anchors)||anchors.length!==2||typeof PanelTerminalFrames==='undefined'||typeof PanelFramedInsets==='undefined')return [];
    const [terminal,anchor]=anchors;
    if(!PanelTerminalFrames.validPanel(terminal)||!PanelFramedInsets.validPanel(anchor)||anchor._insetRimProof.version!==2||anchor._insetRimProof.analysisWidth!==w||anchor._insetRimProof.analysisHeight!==h||JSON.stringify(anchor._insetRimProof.anchor)!==JSON.stringify(terminal))return [];
    // A current-raster reproof includes the terminal anchor as well. No
    // coordinates from an unrelated/previous image may seed this route.
    const witness=PanelFramedInsets.terminalInsetsRGBA(rgba,w,h,[terminal]);
    if(witness.length!==1||JSON.stringify(witness[0])!==JSON.stringify(anchor))return [];
    const color=anchor._insetRimProof.color,ex=exterior(rgba,w,h,color);if(!ex)return [];
    const aq=anchor._outline.map(p=>[p.x*w,p.y*h]),ab=bounds(aq),occ=new Uint8Array(w*h),side=anchor._insetRimProof.stem.side,rails=terminal._terminalProof.rails;
    for(let y=Math.floor(ab[1]);y<Math.ceil(ab[3]);y++)for(let x=Math.floor(ab[0]);x<Math.ceil(ab[2]);x++)occ[y*w+x]=inside(aq,x+.5,y+.5);
    const leftAt=y=>rails[2].m*y+rails[2].b,rightAt=y=>rails[3].m*y+rails[3].b,tq=terminal._outline.map(p=>[p.x*w,p.y*h]);
    const nearY=ab[1],x0=side===0?anchor._insetRimProof.stem.x:Math.floor(leftAt(nearY))-3,x1=side===1?anchor._insetRimProof.stem.x+1:Math.ceil(rightAt(nearY))+3;
    if(x0<2||x1>=w-2||!range((x1-x0)/w,.35,.80))return [];
    const free0=side===0?Math.max(Math.ceil(ab[2])+5,x0+Math.round((x1-x0)*.34)):x0+7;
    const free1=side===1?Math.min(Math.floor(ab[0])-5,x1-Math.round((x1-x0)*.34)):x1-7;
    if(free1-free0<w*.25)return [];
    const splitRows=quietRows(ex.bg,rgba,w,h,free0,free1,Math.max(16,Math.floor(ab[1]-h*.06)),Math.min(h-16,Math.ceil(ab[1]+h*.07)));
    if(splitRows.length!==1){log?.('terminal band withheld: ambiguous shared corridor '+splitRows.length);return [];}
    const split=corridor(ex.bg,occ,w,h,x0,x1,splitRows[0].y,5);if(!split)return [];
    const topRows=quietRows(ex.bg,rgba,w,h,free0,free1,Math.max(16,split.target-Math.round(h*.24)),split.target-Math.round(h*.055));
    if(topRows.length!==1){log?.('terminal band withheld: ambiguous upper corridor '+topRows.length);return [];}
    const top=corridor(ex.bg,occ,w,h,x0,x1,topRows[0].y,Math.min(40,Math.round(h*.03)));
    const bottomTarget=Math.round(rails[0].m*((x0+x1)/2)+rails[0].b);
    const bottom=corridor(ex.bg,occ,w,h,x0,x1,bottomTarget,5);
    if(!top||!bottom){log?.('terminal band withheld: incomplete top/bottom path');return [];}
    if(top.path.some((v,i)=>split.path[i]-v<h*.04||bottom.path[i]-split.path[i]<h*.10)||Math.min(...top.path)<=h*.15)return [];
    const exT=new Uint8Array(w*h),occT=new Uint8Array(w*h);
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){exT[x*h+y]=ex.bg[y*w+x];occT[x*h+y]=occ[y*w+x];}
    const leftStart=Math.ceil(top.path[0]),leftEnd=Math.ceil(bottom.path[0]),rightStart=Math.ceil(top.path.at(-1)),rightEnd=Math.ceil(bottom.path.at(-1));
    const left=corridor(exT,occT,h,w,leftStart,leftEnd,Math.round(leftAt((leftStart+leftEnd)/2)),5,.25);
    const right=corridor(exT,occT,h,w,rightStart,rightEnd,Math.round(rightAt((rightStart+rightEnd)/2)),5,.25);
    if(!left||!right){log?.('terminal band withheld: unobserved lateral corridor');return [];}
    const region=new Uint8Array(w*h),root=[x0,Math.floor(Math.min(...top.path)),x1,Math.ceil(Math.max(...bottom.path))];
    for(let x=x0;x<x1;x++)for(let y=root[1];y<root[3];y++){
      const t=x-x0;if(y+.5<top.path[t]||y+.5>=bottom.path[t])continue;
      if(y>=left.x0&&y<left.x1&&x+.5<left.path[y-left.x0])continue;
      if(y>=right.x0&&y<right.x1&&x+.5>=right.path[y-right.x0])continue;
      if(inside(tq,x+.5,y+.5))continue;
      region[y*w+x]=y+.5<split.path[t]?1:2;
    }
    const gray=new Float32Array(w*h);for(let i=0;i<gray.length;i++)gray[i]=rgba[i*4]*.299+rgba[i*4+1]*.587+rgba[i*4+2]*.114;
    const out=[];
    for(let index=0;index<2;index++){
      const shape=bandOutline(index+1,region,ex.bg,occ,w,h);
      if(!shape||shape.withheld){log?.('terminal band '+index+' withheld: '+JSON.stringify(shape?.withheld?{reason:shape.withheld,box:shape.box,rim:shape.rim}:'small silhouette'));return [];}
      const b=shape.box;
      // The unoccluded rectangular portion is mandatory; the known inset is
      // not a reason to suppress arbitrary internal divider or nested-rim vetoes.
      const inner=[side===0?Math.ceil(Math.max(b[0],ab[2]))+5:b[0]+5,b[1]+5,side===1?Math.floor(Math.min(b[2],ab[0]))-5:b[2]-5,b[3]-5];
      if(inner[2]-inner[0]<60||inner[3]-inner[1]<30||uniformInset(rgba,gray,w,h,inner)||bandUniformDivider(rgba,gray,w,h,inner)||bandFlatInset(rgba,gray,w,h,inner)||interruptedDivider(inner,ex.bg,new Uint8Array(w*h),w,h)||typeof PanelClosedFrames==='undefined'||PanelClosedFrames.analyzeRGBA(rgba,w,h,null,{gradientOnly:true,localMatteInset:true,vetoCandidates:[{box:inner}]}).length!==1){log?.('terminal band '+index+' withheld: internal divider/inset');return [];}
      const adjacent=[];
      const ax0=side===0?b[0]+5:Math.max(b[0],Math.ceil(ab[0]))+5,ax1=side===0?Math.min(b[2],Math.floor(ab[2]))-5:b[2]-5;
      const above=[ax0,Math.max(b[1]+5,Math.ceil(Math.max(...top.path))+5),ax1,Math.min(b[3]-5,Math.floor(ab[1])-5)];
      const below=[ax0,Math.max(b[1]+5,Math.ceil(ab[3])+5),ax1,b[3]-5];
      for(const box of [above,below])if(box[2]-box[0]>=35&&box[3]-box[1]>=35){
        if(uniformInset(rgba,gray,w,h,box)||bandUniformDivider(rgba,gray,w,h,box)||bandFlatInset(rgba,gray,w,h,box)||interruptedDivider(box,ex.bg,new Uint8Array(w*h),w,h)||PanelClosedFrames.analyzeRGBA(rgba,w,h,null,{gradientOnly:true,localMatteInset:true,vetoCandidates:[{box}]}).length!==1){log?.('terminal band '+index+' withheld: adjacent visible cell divider/inset');return [];}adjacent.push(box);
      }
      let foreign=0;for(let y=b[1];y<b[3];y++)for(let x=b[0];x<b[2];x++)if(shape.label[y*w+x]&&(occ[y*w+x]||inside(tq,x+.5,y+.5)))foreign++;
      if(foreign)return [];
      const proof={version:2,method:BAND_METHOD,analysisWidth:w,analysisHeight:h,tolerance:TOLERANCE,padding:1,anchor,terminal,root,top,split,bottom,left,right,side,index,exteriorPixels:ex.pixels,rowEvidence:{upper:topRows[0],shared:splitRows[0],free0,free1},inner,adjacent,
        foregroundPixels:shape.foreground,retainedPixels:shape.foreground,rawForegroundPixels:shape.rawForeground,excludedScanSpecks:shape.excludedScanSpecks,minComponentPixels:shape.minComponentPixels,maxDiscardedContrast:shape.maxDiscardedContrast,pixelCount:shape.pixels,foreignPixels:foreign,rim:shape.rim,pixelContours:shape.contours,uniformInkVetoPassed:true,interruptedDividerVetoPassed:true,dividerVetoPassed:true,insetVetoPassed:true};
      const p={x:b[0]/w,y:b[1]/h,w:(b[2]-b[0])/w,h:(b[3]-b[1])/h,_contours:shape.contours.map(q=>q.map(p=>({x:p[0]/w,y:p[1]/h}))),_identitySource:'inset-neighbor-frame',_geometryOwner:'inset-neighbor-contours',_geometryType:'terminal-inset-band-cell',_insetNeighborProof:proof};
      if(!validBandPanel(p)){log?.('terminal band '+index+' withheld: validation');return [];}out.push(p);
    }
    log?.('terminal inset band: 2 separately witnessed stepped/notched scenes');return out;
  }
  function validBandPanel(p){try{
    const pr=p?._insetNeighborProof,w=pr?.analysisWidth,h=pr?.analysisHeight;
    if(p?._identitySource!=='inset-neighbor-frame'||pr?.version!==2||pr.method!==BAND_METHOD||!Number.isInteger(w)||!Number.isInteger(h)||!range(w,250,900)||!range(h,350,900)||pr.tolerance!==TOLERANCE||pr.padding!==1||![0,1].includes(pr.side)||![0,1].includes(pr.index)||typeof PanelFramedInsets==='undefined'||typeof PanelTerminalFrames==='undefined'||!PanelFramedInsets.validPanel(pr.anchor)||!PanelTerminalFrames.validPanel(pr.terminal)||pr.anchor._insetRimProof.version!==2||pr.anchor._insetRimProof.analysisWidth!==w||pr.anchor._insetRimProof.analysisHeight!==h||JSON.stringify(pr.anchor._insetRimProof.anchor)!==JSON.stringify(pr.terminal)||pr.side!==pr.anchor._insetRimProof.stem.side)return false;
    const paths=[pr.top,pr.split,pr.bottom];if(paths.some(c=>!bandProofPath(c,w,h))||paths.some(c=>c.x0!==pr.top.x0||c.x1!==pr.top.x1)||pr.top.spread!==Math.min(40,Math.round(h*.03))||pr.split.spread!==5||pr.bottom.spread!==5||pr.top.path.some((y,i)=>pr.split.path[i]-y<h*.04||pr.bottom.path[i]-pr.split.path[i]<h*.10))return false;
    if(!bandProofPath(pr.left,h,w,.25)||!bandProofPath(pr.right,h,w,.25)||pr.left.spread!==5||pr.right.spread!==5||pr.left.x0!==Math.ceil(pr.top.path[0])||pr.left.x1!==Math.ceil(pr.bottom.path[0])||pr.right.x0!==Math.ceil(pr.top.path.at(-1))||pr.right.x1!==Math.ceil(pr.bottom.path.at(-1)))return false;
    const root=[pr.top.x0,Math.floor(Math.min(...pr.top.path)),pr.top.x1,Math.ceil(Math.max(...pr.bottom.path))];if(JSON.stringify(root)!==JSON.stringify(pr.root)||!range((root[2]-root[0])/w,.35,.80))return false;
    const ab=bounds(pr.anchor._outline.map(v=>[v.x*w,v.y*h])),rails=pr.terminal._terminalProof.rails,leftAt=y=>rails[2].m*y+rails[2].b,rightAt=y=>rails[3].m*y+rails[3].b;
    const x0=pr.side===0?pr.anchor._insetRimProof.stem.x:Math.floor(leftAt(ab[1]))-3,x1=pr.side===1?pr.anchor._insetRimProof.stem.x+1:Math.ceil(rightAt(ab[1]))+3;
    if(root[0]!==x0||root[2]!==x1||pr.bottom.target!==Math.round(rails[0].m*((x0+x1)/2)+rails[0].b)||pr.left.target!==Math.round(leftAt((pr.left.x0+pr.left.x1)/2))||pr.right.target!==Math.round(rightAt((pr.right.x0+pr.right.x1)/2))||pr.split.target<Math.max(16,Math.floor(ab[1]-h*.06))||pr.split.target>Math.min(h-16,Math.ceil(ab[1]+h*.07))||pr.top.target<Math.max(16,pr.split.target-Math.round(h*.24))||pr.top.target>pr.split.target-Math.round(h*.055))return false;
    const ev=pr.rowEvidence;if(!ev||!Number.isInteger(ev.free0)||!Number.isInteger(ev.free1)||ev.free0<root[0]||ev.free1>root[2]||ev.free1-ev.free0<w*.25)return false;
    for(const [key,path] of [['upper',pr.top],['shared',pr.split]]){const e=ev[key];if(!e||![e.y,e.samples,e.quiet,e.before,e.after].every(Number.isInteger)||e.y!==path.target||e.samples!==ev.free1-ev.free0||!range(e.quiet/(5*e.samples),.70,1)||!range(e.before/e.samples,.40,1)||!range(e.after/e.samples,.40,1)||!Array.isArray(e.run)||e.run.length!==2||!e.run.every(Number.isInteger)||e.y<e.run[0]||e.y>e.run[1]||e.run[1]-e.run[0]+1>Math.max(20,Math.round(h*.025)))return false;}
    if(!range(pr.exteriorPixels,w*h*.025,w*h)||!Number.isInteger(pr.exteriorPixels)||!range(pr.maxDiscardedContrast,0,24)||pr.minComponentPixels!==Math.max(12,Math.round(w*h*.000057))||!Number.isInteger(pr.rawForegroundPixels)||!Number.isInteger(pr.excludedScanSpecks)||!range(pr.excludedScanSpecks,0,Math.max(80,pr.rawForegroundPixels*.0025))||pr.rawForegroundPixels-pr.excludedScanSpecks!==pr.foregroundPixels||!Number.isInteger(pr.foregroundPixels)||!range(pr.foregroundPixels,w*h*.012,w*h)||pr.retainedPixels!==pr.foregroundPixels||pr.foreignPixels!==0||!Number.isInteger(pr.pixelCount)||!range(pr.pixelCount,w*h*.020,w*h*.40)||!range(pr.foregroundPixels/pr.pixelCount,.42,1)||pr.uniformInkVetoPassed!==true||pr.interruptedDividerVetoPassed!==true||pr.dividerVetoPassed!==true||pr.insetVetoPassed!==true||!Array.isArray(pr.rim)||pr.rim.length!==4||pr.rim.some(s=>!Number.isInteger(s?.samples)||s.samples<25||!Number.isInteger(s.matched)||!range(s.matched/s.samples,.93,1)))return false;
    const rings=p._contours;if(!Array.isArray(rings)||rings.length!==1||!Array.isArray(rings[0])||!range(rings[0].length,4,1024))return false;
    const q=[];for(const v of rings[0]){if(!range(v?.x,0,1)||!range(v?.y,0,1)||Math.abs(v.x*w-Math.round(v.x*w))>1e-7||Math.abs(v.y*h-Math.round(v.y*h))>1e-7)return false;q.push([Math.round(v.x*w),Math.round(v.y*h)]);}
    if(JSON.stringify([q])!==JSON.stringify(pr.pixelContours)||area(q)!==pr.pixelCount)return false;
    const b=bounds(q);if(b[0]<root[0]||b[1]<root[1]||b[2]>root[2]||b[3]>root[3]||b[2]-b[0]<w*.10||b[3]-b[1]<h*.045||pr.pixelCount/((b[2]-b[0])*(b[3]-b[1]))<.80)return false;
    const seen=new Set();for(let i=0;i<q.length;i++){const a=q[i],b=q[(i+1)%q.length],k=a.join(',');if(seen.has(k)||(a[0]!==b[0]&&a[1]!==b[1])||(a[0]===b[0]&&a[1]===b[1]))return false;seen.add(k);}
    for(let i=0;i<q.length;i++)for(let j=i+2;j<q.length;j++){if(i===0&&j===q.length-1)continue;const a=q[i],b=q[(i+1)%q.length],c=q[j],d=q[(j+1)%q.length];if(Math.max(a[0],b[0])<Math.min(c[0],d[0])||Math.max(c[0],d[0])<Math.min(a[0],b[0])||Math.max(a[1],b[1])<Math.min(c[1],d[1])||Math.max(c[1],d[1])<Math.min(a[1],b[1]))continue;if(cross(a,b,c)*cross(a,b,d)<=0&&cross(c,d,a)*cross(c,d,b)<=0)return false;}
    // Independently rasterize serialized contours and verify their entire
    // support lies between the measured paths and outside both old anchors.
    const aq=pr.anchor._outline.map(v=>[v.x*w,v.y*h]),tq=pr.terminal._outline.map(v=>[v.x*w,v.y*h]);let pixels=0;
    for(let y=b[1];y<b[3];y++){
      const xs=[];for(let i=0;i<q.length;i++){const a=q[i],b=q[(i+1)%q.length];if(y+.5>=Math.min(a[1],b[1])&&y+.5<Math.max(a[1],b[1]))xs.push(a[0]);}xs.sort((a,b)=>a-b);if(xs.length%2)return false;
      for(let i=0;i<xs.length;i+=2)for(let x=xs[i];x<xs[i+1];x++){
        const j=x-root[0],low=pr.index?pr.split.path[j]:pr.top.path[j],high=pr.index?pr.bottom.path[j]:pr.split.path[j];
        if(y+.5<low||y+.5>=high||inside(aq,x+.5,y+.5)||inside(tq,x+.5,y+.5))return false;
        if(y>=pr.left.x0&&y<pr.left.x1&&x+.5<pr.left.path[y-pr.left.x0])return false;
        if(y>=pr.right.x0&&y<pr.right.x1&&x+.5>=pr.right.path[y-pr.right.x0])return false;
        pixels++;
      }
    }
    if(pixels!==pr.pixelCount||!Array.isArray(pr.inner)||pr.inner.length!==4||!pr.inner.every(Number.isInteger)||pr.inner[0]<b[0]||pr.inner[1]<b[1]||pr.inner[2]>b[2]||pr.inner[3]>b[3]||pr.inner[2]-pr.inner[0]<60||pr.inner[3]-pr.inner[1]<30)return false;
    const inner=[pr.side===0?Math.ceil(Math.max(b[0],ab[2]))+5:b[0]+5,b[1]+5,pr.side===1?Math.floor(Math.min(b[2],ab[0]))-5:b[2]-5,b[3]-5];
    if(JSON.stringify(inner)!==JSON.stringify(pr.inner))return false;
    const ax0=pr.side===0?b[0]+5:Math.max(b[0],Math.ceil(ab[0]))+5,ax1=pr.side===0?Math.min(b[2],Math.floor(ab[2]))-5:b[2]-5;
    const adjacent=[[ax0,Math.max(b[1]+5,Math.ceil(Math.max(...pr.top.path))+5),ax1,Math.min(b[3]-5,Math.floor(ab[1])-5)],[ax0,Math.max(b[1]+5,Math.ceil(ab[3])+5),ax1,b[3]-5]].filter(box=>box[2]-box[0]>=35&&box[3]-box[1]>=35);
    if(JSON.stringify(adjacent)!==JSON.stringify(pr.adjacent))return false;
    return ['x','y','w','h'].every(k=>finite(p[k]))&&Math.max(Math.abs(p.x-b[0]/w),Math.abs(p.y-b[1]/h),Math.abs(p.w-(b[2]-b[0])/w),Math.abs(p.h-(b[3]-b[1])/h))<1e-10;
  }catch(_){return false;}}
  function supplementTerminalBandImage(img,anchors,log){
    if(!img||!finite(img.width)||!finite(img.height)||img.width<1||img.height<1||!Array.isArray(anchors)||anchors.length!==2||anchors[1]?._insetRimProof?.version!==2)return [];
    const s=Math.min(1,900/Math.max(img.width,img.height)),w=Math.round(img.width*s),h=Math.round(img.height*s),c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0,w,h);
    return terminalBandRGBA(ctx.getImageData(0,0,w,h).data,w,h,anchors,log);
  }

  // Test21: prove a staggered upper tier from long shared ink rims. The
  // existing terminal/inset/band group is only an exclusion/scale anchor.
  // Its complete proof is reproduced on these pixels before proposing a tier.
  const TIER_METHOD='band-anchored-staggered-ink-rim-tier';
  function tierGray(rgba,w,h,color){
    const gray=new Float32Array(w*h);for(let i=0;i<gray.length;i++){if(rgba[4*i+3]!==255)return null;gray[i]=.299*rgba[4*i]+.587*rgba[4*i+1]+.114*rgba[4*i+2];}
    return {gray,base:.299*color[0]+.587*color[1]+.114*color[2]};
  }
  function tierSample(gray,w,h,vertical,t,p){
    const x=vertical?p:t,y=vertical?t:p;return x>=0&&x<w&&y>=0&&y<h?gray[y*w+x]:Infinity;
  }
  function tierEvidence(gray,w,h,vertical,m,b,lo,hi,base,dir=0){
    let matched=0,deep=0,core=0,before=0,after=0,nearBefore=0,nearAfter=0,maxGap=0,gap=0;
    const quarters=Array.from({length:4},()=>({samples:0,matched:0,before:0,after:0}));
    for(let t=lo;t<=hi;t++){
      const p=Math.round(m*t+b),val=d=>tierSample(gray,w,h,vertical,t,p+d);
      let q=Infinity,L=0,R=0,nL=0,nR=0;
      for(let d=-1;d<=1;d++)q=Math.min(q,val(d));
      for(let d=1;d<=10;d++){if(d>=3){L=Math.max(L,val(-d));R=Math.max(R,val(d));}if(d<=5){nL=Math.max(nL,val(-d));nR=Math.max(nR,val(d));}}
      const yes=q<=base+24,brL=L>base+28,brR=R>base+28;
      matched+=yes;deep+=q<=base+12;core+=val(0)<=base+12;before+=brL;after+=brR;nearBefore+=nL>base+28;nearAfter+=nR>base+28;gap=yes?0:gap+1;maxGap=Math.max(maxGap,gap);
      const part=quarters[Math.min(3,Math.floor(4*(t-lo)/(hi-lo+1)))];part.samples++;part.matched+=yes;part.before+=brL;part.after+=brR;
    }
    return {samples:hi-lo+1,matched,deep,core,before,after,nearBefore,nearAfter,maxGap,quarters};
  }
  function tierSeams(gray,w,h,ceiling,base){
    const lo=Math.max(12,Math.round(ceiling*.15)),hi=Math.round(ceiling*.92),mid=(lo+hi)/2,options=[];
    // Cheap rejection at spaced samples comes before the full evidence pass.
    for(let center=Math.round(w*.08);center<=Math.round(w*.92);center++){
      let best=null;
      for(let sm=-20;sm<=20;sm++){
        const m=sm*.002,b=center-m*mid;let cheap=0;
        for(let t=lo;t<=hi;t+=9){const p=Math.round(m*t+b);if(Math.min(gray[t*w+p-1],gray[t*w+p],gray[t*w+p+1])>base+24){cheap=1;break;}}
        if(cheap)continue;
        const e=tierEvidence(gray,w,h,true,m,b,lo,hi,base);
        if(e.matched!==e.samples||e.deep/e.samples<.94||e.core/e.samples<.80||Math.min(e.before,e.after)/e.samples<.40||e.quarters.some(q=>Math.min(q.before,q.after)/q.samples<.20))continue;
        const score=Math.min(e.before,e.after)/e.samples+.25*e.core/e.samples-.3*Math.abs(m);
        if(!best||score>best.score)best={vertical:true,center,m,b,lo,hi,...e,score};
      }
      if(best)options.push(best);
    }
    const groups=[];for(const r of options){if(!groups.length||r.center>groups.at(-1).at(-1).center+4)groups.push([]);groups.at(-1).push(r);}
    if(groups.length<1||groups.length>4)return null;
    return groups.map(g=>g.reduce((a,b)=>b.score>a.score?b:a));
  }
  function tierForegroundBounds(gray,w,h,ceiling,base){
    const hi=Math.round(ceiling*.92),seen=new Uint8Array(w*(hi+1)),queue=new Int32Array(seen.length);let components=0,x0=w,x1=-1,retained=0,discarded=0;
    const minPixels=Math.max(8,Math.round(w*h*.00002));
    for(let seed=0;seed<seen.length;seed++)if(!seen[seed]&&gray[seed]>base+20){
      if(++components>16000)return null;let head=0,n=1,L=w,R=-1;seen[seed]=1;queue[0]=seed;
      const add=i=>{if(!seen[i]&&gray[i]>base+20){seen[i]=1;queue[n++]=i;}};
      while(head<n){const i=queue[head++],x=i%w,y=i/w|0;L=Math.min(L,x);R=Math.max(R,x);if(x)add(i-1);if(x+1<w)add(i+1);if(y)add(i-w);if(y<hi)add(i+w);}
      if(n>=minPixels){x0=Math.min(x0,L);x1=Math.max(x1,R);retained+=n;}else discarded+=n;
    }
    if(x1-x0<w*.65||retained<w*h*.08||x0<3||x1>=w-3)return null;
    return {x0:x0-1,x1:x1+1,foregroundMin:x0,foregroundMax:x1,retained,discarded,minPixels,hi};
  }
  function tierHorizontal(gray,w,h,left,right,ceiling,base,side){
    const y0=side?Math.floor(ceiling*.82):3,y1=side?Math.min(h-12,Math.ceil(ceiling+Math.max(10,h*.02))):Math.floor(ceiling*.27),ym=(y0+y1)/2;
    const lo=Math.ceil(left.m*ym+left.b)+4,hi=Math.floor(right.m*ym+right.b)-4,mid=(lo+hi)/2;if(hi-lo<w*.08)return null;
    const opts=[];
    for(let center=y0;center<y1;center++){
      let best=null;
      for(let sm=-10;sm<=10;sm++){
        const m=sm*.002,b=center-m*mid;let cheap=0;
        for(let t=lo;t<=hi;t+=7){const p=Math.round(m*t+b);if(Math.min(gray[(p-1)*w+t],gray[p*w+t],gray[(p+1)*w+t])>base+24){cheap=1;break;}}
        if(cheap)continue;
        const e=tierEvidence(gray,w,h,false,m,b,lo,hi,base),inward=(side?e.nearBefore:e.nearAfter)/e.samples;
        if(e.matched!==e.samples||e.deep/e.samples<.85||e.core/e.samples<.55||inward<.30)continue;
        const score=inward+.2*e.core/e.samples-.2*Math.abs(m);
        if(!best||score>best.score)best={vertical:false,side,center,m,b,lo,hi,...e,score};
      }if(best)opts.push(best);
    }
    const groups=[];for(const r of opts){if(!groups.length||r.center>groups.at(-1).at(-1).center+2)groups.push([]);groups.at(-1).push(r);}
    const winners=groups.map(g=>g.reduce((a,b)=>b.score>a.score?b:a)).sort((a,b)=>b.score-a.score);
    if(!winners.length||winners.length>4||winners.length>1&&winners[0].score-winners[1].score<.12)return null;
    return {...winners[0],alternativeCount:winners.length-1,scoreGap:winners.length>1?winners[0].score-winners[1].score:1};
  }
  function tierTrack(gray,w,h,vertical,rail,base){
    const n=vertical?h:w,back=new Int8Array(n*3).fill(-1);let prev=new Float64Array(3).fill(Infinity);
    const center=t=>Math.round(rail.m*t+rail.b);
    for(let t=0;t<n;t++){
      const p=center(t),next=new Float64Array(3).fill(Infinity);
      for(let k=0;k<3;k++){
        const pos=p+k-1,v=tierSample(gray,w,h,vertical,t,pos),cost=Math.abs(k-1)+(v<=base+24?.03*Math.max(0,v-base)/24:100+Math.min(200,Math.max(0,v-base-24))*.1);
        if(!t){next[k]=cost;continue;}
        for(let j=0;j<3;j++){
          const before=center(t-1)+j-1,step=Math.abs(before-pos);if(step>1)continue;
          const bridge=step&&Math.min(tierSample(gray,w,h,vertical,t-1,pos),tierSample(gray,w,h,vertical,t,before))>base+24?80:0;
          const score=prev[j]+cost+.15*step+bridge;if(score<next[k]){next[k]=score;back[t*3+k]=j;}
        }
      }prev=next;
    }
    let k=0;for(let i=1;i<3;i++)if(prev[i]<prev[k])k=i;const path=new Array(n);
    for(let t=n-1;t>=0;t--){path[t]=center(t)+k-1+.5;if(t)k=back[t*3+k];if(k<0&&t)return [];}
    return path;
  }
  // An interrupted divider must still be a narrow, sustained ink ridge with
  // contrasting artwork on both sides. A broad black stair/branch/shadow is
  // not a divider merely because it joins the exterior matte.
  function tierInterruptedDivider(rgba,gray,w,h,box,base){
    const [x0,y0,x1,y1]=box;
    for(const vertical of [false,true]){
      const lo=vertical?x0:y0,hi=vertical?x1:y1,start=vertical?y0:x0,end=vertical?y1:x1,min=Math.max(28,Math.round((hi-lo)*.12));if(hi-lo<2*min||end-start<45)continue;
      for(let p=lo+min;p<hi-min;p++){
        let matched=0,first=0,last=0;const samples=end-start;
        for(let t=start;t<end;t++){
          const value=v=>tierSample(gray,w,h,vertical,t,v);let q=p;
          for(let d=-1;d<=1;d++)if(value(p+d)<value(q))q=p+d;
          const g=value(q);if(g>base+24)continue;
          let l=q,r=q;while(l>q-6&&value(l-1)<=base+24)l--;while(r<q+6&&value(r+1)<=base+24)r++;
          if(l===q-6||r===q+6||r-l+1>8)continue;
          let before=0,after=0;for(let d=1;d<=4;d++){before=Math.max(before,value(l-d));after=Math.max(after,value(r+d));}
          if(Math.min(before,after)-g<20)continue;
          matched++;if(t<start+samples*.18)first++;if(t>=end-samples*.18)last++;
        }
        if(matched/samples>=.70&&first/(samples*.18)>=.45&&last/(samples*.18)>=.45)return {vertical,position:p,samples,matched,first,last};
      }
    }return null;
  }
  function tierUniformCoreDivider(gray,w,h,box,base){
    const [x0,y0,x1,y1]=box;
    for(const vertical of [false,true]){
      const lo=vertical?x0:y0,hi=vertical?x1:y1,start=vertical?y0:x0,end=vertical?y1:x1,margin=Math.max(28,Math.round((hi-lo)*.12)),samples=end-start;
      if(samples<45||hi-lo<2*margin)continue;
      for(let p=lo+margin;p<hi-margin;p++){
        let quiet=0,sum=0,square=0,first=0,last=0;
        for(let t=start;t<end;t++){
          const v=tierSample(gray,w,h,vertical,t,p);if(v>base+24)continue;quiet++;sum+=v;square+=v*v;if(t<start+samples*.18)first++;if(t>=end-samples*.18)last++;
        }
        if(quiet/samples<.92||first/(samples*.18)<.88||last/(samples*.18)<.88||square/quiet-(sum/quiet)**2>9)continue;
        let narrow=0,before=0,after=0;
        for(let t=start;t<end;t++){
          const value=q=>tierSample(gray,w,h,vertical,t,q),v=value(p);let L=0,R=0;
          for(let d=3;d<=15;d++){L=Math.max(L,value(p-d));R=Math.max(R,value(p+d));}before+=L>base+28;after+=R>base+28;
          if(v>base+24)continue;let l=p,r=p;
          while(l>p-8&&Math.abs(value(l-1)-v)<=3)l--;while(r<p+8&&Math.abs(value(r+1)-v)<=3)r++;
          narrow+=l>p-8&&r<p+8&&r-l+1<=10;
        }
        if(narrow/samples>=.35&&Math.min(before,after)/samples>=.30)return {vertical,position:p,samples,quiet,variance:square/quiet-(sum/quiet)**2,narrow,before,after};
      }
    }return null;
  }
  function tierIsInside(contours,x,y){
    let yes=false;for(const q of contours)for(let j=0,i=q.length-1;j<q.length;i=j++){
      const a=q[i],b=q[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])yes=!yes;
    }return yes;
  }
  function tierRaster(model,w,h,anchor){
    const label=new Uint8Array(w*h),n=model.cells.length;let overlaps=0;
    const use=(x,y,id)=>{const i=y*w+x;if(label[i]&&label[i]!==id)overlaps++;else label[i]=id;};
    for(let id=0;id<n;id++){
      const c=model.cells[id],left=model.vertical[id].path,right=model.vertical[id+1].path;
      const box=[Math.max(0,Math.floor(Math.min(...left))),Math.max(0,Math.floor(Math.min(...c.top.path))),Math.min(w,Math.ceil(Math.max(...right))),Math.min(h,Math.ceil(Math.max(...c.bottom.path)))];
      for(let y=box[1];y<box[3];y++)for(let x=box[0];x<box[2];x++)if(x+.5>=left[y]&&x+.5<right[y]&&y+.5>=c.top.path[x]&&y+.5<c.bottom.path[x])use(x,y,id+1);
    }
    for(const e of model.extensions){
      const top=model.cells[e.owner].top.path,bottom=model.cells[e.front].top.path,edge=model.vertical[Math.max(e.owner,e.front)].path;
      for(let y=0;y<Math.ceil(model.ceiling);y++)for(let x=e.x0;x<e.x1;x++){
        if(y+.5<top[x]||y+.5>=bottom[x])continue;
        if(e.owner>e.front&&x+.5>=edge[y]||e.owner<e.front&&x+.5<edge[y])continue;
        use(x,y,e.owner+1);
      }
    }
    const excluded=new Array(n).fill(0);let foreignBeyondRim=0;
    // A previously proved lower scene may have a small step/protrusion into
    // this tier. Its exact contour owns those pixels. Only a bounded notch
    // adjoining a new cell's bottom rim may be removed; not an arbitrary mask.
    if(anchor){
      const aq=anchor._contours.map(q=>q.map(p=>[p.x*w,p.y*h])),box=bounds(aq[0]),maxDepth=Math.max(8,Math.round(h*.012));
      for(let y=Math.max(0,Math.floor(box[1]));y<Math.min(h,Math.ceil(model.ceiling)+19);y++)for(let x=Math.max(0,Math.floor(box[0]));x<Math.min(w,Math.ceil(box[2]));x++){
        const i=y*w+x,id=label[i];if(!id||!tierIsInside(aq,x+.5,y+.5))continue;
        const depth=model.cells[id-1].bottom.path[x]-(y+.5);if(depth<0||depth>maxDepth){foreignBeyondRim++;continue;}
        excluded[id-1]++;label[i]=0;
      }
    }
    return {label,overlaps,excluded,foreignBeyondRim};
  }
  function tierExtensions(gray,w,h,model,base){
    const out=[],scan=[];
    for(let owner=0;owner<model.cells.length;owner++)for(const front of [owner-1,owner+1]){
      if(front<0||front>=model.cells.length)continue;
      const a=model.cells[owner].top,b=model.cells[front].top,bound=model.vertical[Math.max(owner,front)],middle=bound.b;
      const delta=(b.m-a.m)*middle+b.b-a.b;if(delta<4||delta>h*.045)continue;
      const side=owner>front?0:1,xlo=Math.ceil(model.vertical[front].b)+2,xhi=Math.floor(model.vertical[front+1].b)-1;
      let min=w,max=-1,pixels=0;
      for(let x=xlo;x<xhi;x++)for(let y=Math.max(0,Math.floor(a.path[x]));y<Math.ceil(b.path[x]);y++)if(y+.5>=a.path[x]&&y+.5<b.path[x]&&gray[y*w+x]>base+24){min=Math.min(min,x);max=Math.max(max,x);pixels++;}
      if(pixels<Math.max(20,w*h*.00007)){scan.push({owner,front,pixels,empty:true});continue;}
      const x0=side===0?min-1:Math.floor(bound.b)-2,x1=side===0?Math.ceil(bound.b)+3:max+2;
      if(x0<1||x1>=w-1||x1-x0<w*.025||x1-x0>(xhi-xlo)*.90)return null;
      // The narrow visible ledge must actually join the owner's image: a
      // continuous divider across the junction would mean a separate cell.
      let open=0,junctionSamples=0;
      for(let y=Math.ceil(a.m*middle+a.b)+1;y<Math.floor(b.m*middle+b.b);y++){
        const x=Math.round(bound.m*y+bound.b);let low=Infinity;
        for(let dx=-1;dx<=1;dx++)low=Math.min(low,gray[y*w+x+dx]);open+=low>base+24;junctionSamples++;
      }
      if(open<1||junctionSamples<3)return null;
      out.push({owner,front,side,x0,x1,foregroundPixels:pixels,delta,openJunctionSamples:open,junctionSamples});
    }
    return {extensions:out,scan};
  }
  function tierRim(gray,w,h,contours,base){
    const rim=Array.from({length:4},()=>({samples:0,matched:0,deep:0}));
    for(const q of contours)for(let i=0;i<q.length;i++){
      const a=q[i],b=q[(i+1)%q.length],dx=b[0]-a[0],dy=b[1]-a[1],L=Math.hypot(dx,dy),nx=dy/L,ny=-dx/L;
      const s=rim[Math.abs(nx)>Math.abs(ny)?nx<0?2:3:ny<0?0:1];
      for(let t=.5;t<L;t++){
        let v=Infinity;for(const d of [-.5,.5,1.5]){const x=Math.floor(a[0]+dx*t/L+nx*d),y=Math.floor(a[1]+dy*t/L+ny*d);if(x>=0&&x<w&&y>=0&&y<h)v=Math.min(v,gray[y*w+x]);}
        s.samples++;s.matched+=v<=base+24;s.deep+=v<=base+12;
      }
    }return rim;
  }
  function tierModelRGBA(rgba,w,h,anchor,log){
    const old=anchor._insetNeighborProof,color=old.anchor._insetRimProof.color,analysis=tierGray(rgba,w,h,color);if(!analysis)return null;
    const {gray,base}=analysis,ceiling=Math.max(...old.top.path);
    if(!range(ceiling/h,.25,.62))return null;
    const seams=tierSeams(gray,w,h,ceiling,base),fg=tierForegroundBounds(gray,w,h,ceiling,base);
    if(!seams||!fg){log?.('upper tier withheld: unproved shared seams or exterior bounds');return null;}
    const at=(r,t)=>r.m*t+r.b,position=ceiling*.5;
    const vertical=[{vertical:true,m:0,b:fg.x0,outer:true},...seams,{vertical:true,m:0,b:fg.x1,outer:true}];
    if(vertical.some((v,i)=>i&&at(v,position)-at(vertical[i-1],position)<w*.10))return null;
    // At least one long shared seam has to meet a witnessed step in the
    // already accepted lower-band boundary. A tree trunk cannot supply that.
    const joins=[];for(let i=1;i<old.top.path.length;i++)if(Math.abs(old.top.path[i]-old.top.path[i-1])>=4){const x=old.top.x0+i;for(let k=0;k<seams.length;k++)if(Math.abs(at(seams[k],old.top.path[i])-x)<=5)joins.push({seam:k,x,y:old.top.path[i],step:old.top.path[i]-old.top.path[i-1]});}
    if(!joins.length)return null;
    for(const v of vertical)v.path=tierTrack(gray,w,h,true,v,base);
    const cells=[];
    for(let i=0;i+1<vertical.length;i++){
      const top=tierHorizontal(gray,w,h,vertical[i],vertical[i+1],ceiling,base,0),bottom=tierHorizontal(gray,w,h,vertical[i],vertical[i+1],ceiling,base,1);
      if(!top||!bottom){log?.('upper tier '+i+' withheld: ambiguous top/bottom rims');return null;}
      top.path=tierTrack(gray,w,h,false,top,base);bottom.path=tierTrack(gray,w,h,false,bottom,base);
      if(bottom.center-top.center<h*.25||bottom.center-top.center>h*.60)return null;cells.push({top,bottom});
    }
    const model={ceiling,base,color:color.slice(),foreground:fg,vertical,cells,joins,extensions:[]};
    const ex=tierExtensions(gray,w,h,model,base);if(!ex){log?.('upper tier withheld: ambiguous exposed ledge');return null;}model.extensions=ex.extensions;model.emptyLedges=ex.scan;
    log?.('upper tier proposal '+JSON.stringify({bounds:[fg.x0,fg.x1],seams:seams.map(r=>[r.center,r.m]),tops:cells.map(c=>[c.top.center,c.top.m]),bottoms:cells.map(c=>[c.bottom.center,c.bottom.m]),extensions:ex.extensions,joins}));
    return {model,gray,base};
  }
  function tierRGBA(rgba,w,h,anchors,log){
    if(!Number.isInteger(w)||!Number.isInteger(h)||!range(w,250,900)||!range(h,350,900)||!(rgba instanceof Uint8Array||rgba instanceof Uint8ClampedArray)||rgba.length!==w*h*4||!Array.isArray(anchors)||anchors.length!==4||!validBandPanel(anchors[2])||!validBandPanel(anchors[3])||anchors[2]._insetNeighborProof.index!==0||anchors[3]._insetNeighborProof.index!==1)return [];
    const witness=terminalBandRGBA(rgba,w,h,anchors.slice(0,2));
    if(witness.length!==2||JSON.stringify(witness)!==JSON.stringify(anchors.slice(2)))return [];
    const proposal=tierModelRGBA(rgba,w,h,anchors[2],log);if(!proposal)return [];
    const {model,gray,base}=proposal,raster=tierRaster(model,w,h,anchors[2]);if(raster.overlaps||raster.foreignBeyondRim)return [];
    let unassignedUpperForeground=0;
    for(let x=model.foreground.x0;x<model.foreground.x1;x++){
      const j=model.vertical.findIndex((v,i)=>i<model.cells.length&&x>=v.b&&x<model.vertical[i+1].b);if(j<0)continue;
      for(let y=0;y<model.cells[j].top.path[x];y++)if(!raster.label[y*w+x]&&gray[y*w+x]>base+24)unassignedUpperForeground++;
    }
    if(unassignedUpperForeground){log?.('upper tier withheld: unowned foreground above a proposed rim');return [];}
    const anchorQ=anchors[2]._contours.map(q=>q.map(p=>[p.x*w,p.y*h])),out=[];
    for(let index=0;index<model.cells.length;index++){
      const contours=trace(raster.label,w,h,index+1);if(!contours||contours.length!==1||contours[0].length>1024)return [];
      const box=bounds(contours[0]),rim=tierRim(gray,w,h,contours,base);
      if(rim.some(r=>r.samples<25||r.matched!==r.samples||r.deep/r.samples<.85)){log?.('upper tier '+index+' withheld: exposed contour rim '+JSON.stringify(rim));return [];}
      let pixels=0,foreground=0,foreign=0;
      for(let y=box[1];y<box[3];y++)for(let x=box[0];x<box[2];x++)if(raster.label[y*w+x]===index+1){pixels++;foreground+=gray[y*w+x]>base+24;foreign+=tierIsInside(anchorQ,x+.5,y+.5);}
      if(foreign||!range(pixels/(w*h),.02,.36)||foreground/pixels<.18)return [];
      const c=model.cells[index],mid=(c.top.center+c.bottom.center)/2,inner=[Math.ceil(model.vertical[index].m*mid+model.vertical[index].b)+6,Math.ceil(Math.max(...c.top.path))+6,Math.floor(model.vertical[index+1].m*mid+model.vertical[index+1].b)-6,Math.floor(Math.min(...c.bottom.path))-6];
      if(inner[2]-inner[0]<40||inner[3]-inner[1]<60)return [];
      if(uniformInset(rgba,gray,w,h,inner)||bandUniformDivider(rgba,gray,w,h,inner)||bandFlatInset(rgba,gray,w,h,inner)||tierInterruptedDivider(rgba,gray,w,h,inner,base)||tierUniformCoreDivider(gray,w,h,inner,base)||typeof PanelClosedFrames==='undefined'||PanelClosedFrames.analyzeRGBA(rgba,w,h,null,{gradientOnly:true,localMatteInset:true,vetoCandidates:[{box:inner}]}).length!==1){log?.('upper tier '+index+' withheld: internal divider/inset');return [];}
      const pr={version:3,method:TIER_METHOD,analysisWidth:w,analysisHeight:h,anchor:anchors[2],model,index,pixelCount:pixels,foregroundPixels:foreground,foreignPixels:foreign,excludedPriorPixels:raster.excluded[index],unassignedUpperForeground,coreRidgeVetoPassed:true,rim,inner,pixelContours:contours,dividerVetoPassed:true,insetVetoPassed:true,uniformInkVetoPassed:true,interruptedDividerVetoPassed:true};
      const p={x:box[0]/w,y:box[1]/h,w:(box[2]-box[0])/w,h:(box[3]-box[1])/h,_contours:contours.map(q=>q.map(v=>({x:v[0]/w,y:v[1]/h}))),_identitySource:'inset-neighbor-frame',_geometryOwner:'inset-neighbor-contours',_geometryType:'staggered-upper-rim-cell',_insetNeighborProof:pr};
      if(!validTierPanel(p)){log?.('upper tier '+index+' withheld: serialized proof');return [];}out.push(p);
    }
    log?.('staggered upper tier: '+out.length+' separately enclosed scenes, with observed ledge ownership');return out;
  }
  function validTierPanel(p){try{
    const pr=p?._insetNeighborProof,w=pr?.analysisWidth,h=pr?.analysisHeight,m=pr?.model;
    if(p?._identitySource!=='inset-neighbor-frame'||(p._geometryType!=null&&!['staggered-upper-rim-cell','inset-guided-corridor-cell'].includes(p._geometryType))||(p._geometryOwner!=null&&p._geometryOwner!=='inset-neighbor-contours')||pr?.version!==3||pr.method!==TIER_METHOD||!Number.isInteger(w)||!Number.isInteger(h)||!range(w,250,900)||!range(h,350,900)||!validBandPanel(pr.anchor)||pr.anchor._insetNeighborProof.index!==0||pr.anchor._insetNeighborProof.analysisWidth!==w||pr.anchor._insetNeighborProof.analysisHeight!==h||!m)return false;
    const a=pr.anchor._insetNeighborProof;if(m.ceiling!==Math.max(...a.top.path)||!range(m.ceiling/h,.25,.62)||JSON.stringify(m.color)!==JSON.stringify(a.anchor._insetRimProof.color)||m.base!==.299*m.color[0]+.587*m.color[1]+.114*m.color[2])return false;
    if(!Array.isArray(m.cells)||!range(m.cells.length,2,5)||!Array.isArray(m.vertical)||m.vertical.length!==m.cells.length+1||!Array.isArray(m.joins)||!range(m.joins.length,1,16)||!Array.isArray(m.extensions)||m.extensions.length>m.cells.length*2||!Array.isArray(m.emptyLedges)||m.emptyLedges.length>m.cells.length*2||!Number.isInteger(pr.index)||!range(pr.index,0,m.cells.length-1))return false;
    const f=m.foreground;if(!f||![f.x0,f.x1,f.foregroundMin,f.foregroundMax,f.retained,f.discarded,f.minPixels,f.hi].every(Number.isInteger)||f.x0!==f.foregroundMin-1||f.x1!==f.foregroundMax+1||f.x0<2||f.x1>=w-2||f.x1-f.x0<w*.65||!range(f.retained,w*h*.08,w*h)||!range(f.discarded,0,w*h)||f.minPixels!==Math.max(8,Math.round(w*h*.00002))||f.hi!==Math.round(m.ceiling*.92))return false;
    const track=(r,vertical)=>{
      if(!r||r.vertical!==vertical||!finite(r.m)||Math.abs(r.m)>.041||!finite(r.b)||!Array.isArray(r.path)||r.path.length!==(vertical?h:w))return false;
      return r.path.every((v,t)=>finite(v)&&Math.abs(v*2-Math.round(v*2))<1e-8&&Math.abs(v-(Math.round(r.m*t+r.b)+.5))<=1);
    };
    const evidence=r=>{
      if(!finite(r?.score))return false;
      if(![r.lo,r.hi,r.samples,r.matched,r.deep,r.core,r.before,r.after,r.nearBefore,r.nearAfter,r.maxGap].every(Number.isInteger)||r.lo<0||r.hi>=(r.vertical?h:w)||r.hi-r.lo+1!==r.samples||r.samples<40||r.matched!==r.samples||r.maxGap!==0||[r.deep,r.core,r.before,r.after,r.nearBefore,r.nearAfter].some(n=>!range(n,0,r.samples)))return false;
      if(!Array.isArray(r.quarters)||r.quarters.length!==4||r.quarters.some(q=>![q.samples,q.matched,q.before,q.after].every(Number.isInteger)||q.samples<8||q.matched!==q.samples||!range(q.before,0,q.samples)||!range(q.after,0,q.samples))||r.quarters.reduce((n,q)=>n+q.samples,0)!==r.samples||r.quarters.reduce((n,q)=>n+q.before,0)!==r.before||r.quarters.reduce((n,q)=>n+q.after,0)!==r.after)return false;return true;
    };
    for(let i=0;i<m.vertical.length;i++){
      const r=m.vertical[i];if(!track(r,true))return false;
      if(i===0||i===m.vertical.length-1){if(r.outer!==true||r.m!==0||r.b!==(i?f.x1:f.x0))return false;}
      else if(!evidence(r)||!Number.isInteger(r.center)||r.lo!==Math.max(12,Math.round(m.ceiling*.15))||r.hi!==Math.round(m.ceiling*.92)||r.b!==r.center-r.m*(r.lo+r.hi)/2||r.deep/r.samples<.94||r.core/r.samples<.80||Math.min(r.before,r.after)/r.samples<.40||r.quarters.some(q=>Math.min(q.before,q.after)/q.samples<.20)||Math.abs(r.score-(Math.min(r.before,r.after)/r.samples+.25*r.core/r.samples-.3*Math.abs(r.m)))>1e-10)return false;
      if(i&&r.m*m.ceiling*.5+r.b-(m.vertical[i-1].m*m.ceiling*.5+m.vertical[i-1].b)<w*.10)return false;
    }
    const expectedJoins=[];for(let i=1;i<a.top.path.length;i++)if(Math.abs(a.top.path[i]-a.top.path[i-1])>=4){const x=a.top.x0+i;for(let k=1;k<m.vertical.length-1;k++)if(Math.abs(m.vertical[k].m*a.top.path[i]+m.vertical[k].b-x)<=5)expectedJoins.push({seam:k-1,x,y:a.top.path[i],step:a.top.path[i]-a.top.path[i-1]});}
    if(JSON.stringify(expectedJoins)!==JSON.stringify(m.joins))return false;
    for(const c of m.cells){for(const [side,r] of [[0,c.top],[1,c.bottom]]){
      if(!track(r,false)||!evidence(r)||r.side!==side||!Number.isInteger(r.center)||r.b!==r.center-r.m*(r.lo+r.hi)/2||r.deep/r.samples<.85||r.core/r.samples<.55||(side?r.nearBefore:r.nearAfter)/r.samples<.30||!Number.isInteger(r.alternativeCount)||!range(r.alternativeCount,0,3)||!range(r.scoreGap,.12,2)||Math.abs(r.score-((side?r.nearBefore:r.nearAfter)/r.samples+.2*r.core/r.samples-.2*Math.abs(r.m)))>1e-10)return false;
      if(side?r.center<Math.floor(m.ceiling*.82)||r.center>=Math.min(h-12,Math.ceil(m.ceiling+Math.max(10,h*.02))):r.center<3||r.center>=Math.floor(m.ceiling*.27))return false;
    }if(!range(c.bottom.center-c.top.center,h*.25,h*.60))return false;}
    const seen=new Set();for(const e of m.extensions){
      if(![e.owner,e.front,e.side,e.x0,e.x1,e.foregroundPixels,e.openJunctionSamples,e.junctionSamples].every(Number.isInteger)||!range(e.owner,0,m.cells.length-1)||!range(e.front,0,m.cells.length-1)||Math.abs(e.owner-e.front)!==1||e.side!==(e.owner>e.front?0:1)||e.x0<1||e.x1>=w-1||e.x1-e.x0<w*.025||!range(e.foregroundPixels,Math.max(20,w*h*.00007),w*h)||!range(e.delta,4,h*.045)||!range(e.openJunctionSamples,1,e.junctionSamples)||e.junctionSamples<3||e.junctionSamples>h*.05||seen.has(e.owner+':'+e.front))return false;seen.add(e.owner+':'+e.front);
      const back=m.cells[e.owner].top,front=m.cells[e.front].top,bound=m.vertical[Math.max(e.owner,e.front)];if(Math.abs(e.delta-((front.m-back.m)*bound.b+front.b-back.b))>1e-8)return false;
      const xlo=Math.ceil(m.vertical[e.front].b)+2,xhi=Math.floor(m.vertical[e.front+1].b)-1;if(e.x1-e.x0>(xhi-xlo)*.90||e.x0<xlo-1||e.x1>xhi+6)return false;
      if(e.side===0&&e.x1!==Math.ceil(bound.b)+3||e.side===1&&e.x0!==Math.floor(bound.b)-2)return false;
    }
    if(pr.foreignPixels!==0||pr.unassignedUpperForeground!==0||pr.coreRidgeVetoPassed!==true||!Number.isInteger(pr.pixelCount)||!range(pr.pixelCount/(w*h),.02,.36)||!Number.isInteger(pr.foregroundPixels)||!range(pr.foregroundPixels/pr.pixelCount,.18,1)||['dividerVetoPassed','insetVetoPassed','uniformInkVetoPassed','interruptedDividerVetoPassed'].some(k=>pr[k]!==true)||!Array.isArray(pr.rim)||pr.rim.length!==4||pr.rim.some(r=>![r.samples,r.matched,r.deep].every(Number.isInteger)||r.samples<25||r.matched!==r.samples||!range(r.deep/r.samples,.85,1)))return false;
    const raster=tierRaster(m,w,h,pr.anchor);if(raster.overlaps||raster.foreignBeyondRim||pr.excludedPriorPixels!==raster.excluded[pr.index])return false;
    const contours=trace(raster.label,w,h,pr.index+1);if(!contours||contours.length!==1||!range(contours[0].length,4,1024)||JSON.stringify(contours)!==JSON.stringify(pr.pixelContours))return false;
    if(!Array.isArray(p._contours)||p._contours.length!==1||JSON.stringify(p._contours)!==JSON.stringify(contours.map(q=>q.map(v=>({x:v[0]/w,y:v[1]/h})))))return false;
    const box=bounds(contours[0]),aq=pr.anchor._contours.map(q=>q.map(p=>[p.x*w,p.y*h]));let pixels=0,foreign=0;
    for(let y=box[1];y<box[3];y++)for(let x=box[0];x<box[2];x++)if(raster.label[y*w+x]===pr.index+1){pixels++;foreign+=tierIsInside(aq,x+.5,y+.5);}
    if(pixels!==pr.pixelCount||area(contours[0])!==pixels||foreign)return false;
    const c=m.cells[pr.index],mid=(c.top.center+c.bottom.center)/2,inner=[Math.ceil(m.vertical[pr.index].m*mid+m.vertical[pr.index].b)+6,Math.ceil(Math.max(...c.top.path))+6,Math.floor(m.vertical[pr.index+1].m*mid+m.vertical[pr.index+1].b)-6,Math.floor(Math.min(...c.bottom.path))-6];
    if(JSON.stringify(pr.inner)!==JSON.stringify(inner)||inner[2]-inner[0]<40||inner[3]-inner[1]<60)return false;
    return ['x','y','w','h'].every(k=>finite(p[k]))&&Math.max(Math.abs(p.x-box[0]/w),Math.abs(p.y-box[1]/h),Math.abs(p.w-(box[2]-box[0])/w),Math.abs(p.h-(box[3]-box[1])/h))<1e-10;
  }catch(_){return false;}}
  function supplementTierImage(img,anchors,log){
    if(!img||!finite(img.width)||!finite(img.height)||img.width<1||img.height<1||!Array.isArray(anchors)||anchors.length!==4||anchors[2]?._insetNeighborProof?.version!==2||anchors[3]?._insetNeighborProof?.version!==2)return [];
    const s=Math.min(1,900/Math.max(img.width,img.height)),w=Math.round(img.width*s),h=Math.round(img.height*s),c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0,w,h);
    return tierRGBA(ctx.getImageData(0,0,w,h).data,w,h,anchors,log);
  }

  // Test23: the terminal scene beside a re-proved wide inset. Only the
  // measured inset can interrupt the shared gutter; the foreground envelope
  // must end in witnessed exterior matte on every remaining side. This does
  // not alter either the wide inset or any earlier partition/selection route.
  const WIDE_TERMINAL_METHOD='wide-inset-terminal-matte-neighbor';
  // Remove every analysis cell touched by the known inset, not just cells
  // whose centers are inside. The conservative subpixel collar prevents a
  // pale rim fragment appearing in its neighbour after full-size rendering.
  function wideTerminalTouches(q,x,y){
    return [[x,y],[x+1,y],[x,y+1],[x+1,y+1],[x+.5,y+.5]].some(p=>tierIsInside([q],p[0],p[1]))||q.some(p=>p[0]>=x&&p[0]<=x+1&&p[1]>=y&&p[1]<=y+1);
  }

  function wideTerminalRGBA(rgba,w,h,anchors,log){
    if(!Number.isInteger(w)||!Number.isInteger(h)||!range(w,250,900)||!range(h,350,900)||!(rgba instanceof Uint8Array||rgba instanceof Uint8ClampedArray)||rgba.length!==w*h*4||!Array.isArray(anchors)||anchors.length!==1||typeof PanelFramedInsets==='undefined')return [];
    const anchor=anchors[0],ap=anchor?._insetRimProof;
    if(ap?.version!==3||!PanelFramedInsets.validPanel(anchor)||ap.analysisWidth!==w||ap.analysisHeight!==h)return [];
    // Re-observe the current raster, not a stale or invented anchor descriptor.
    const witnessed=PanelFramedInsets.wideInsetsRGBA(rgba,w,h);
    if(witnessed.length!==1||JSON.stringify(witnessed[0])!==JSON.stringify(anchor))return [];
    const ex=exterior(rgba,w,h,ap.color);if(!ex)return [];
    const aq=anchor._outline.map(p=>[p.x*w,p.y*h]),ab=bounds(aq),occ=new Uint8Array(w*h);
    for(let y=Math.max(0,Math.floor(ab[1]));y<Math.min(h,Math.ceil(ab[3]));y++)for(let x=Math.max(0,Math.floor(ab[0]));x<Math.min(w,Math.ceil(ab[2]));x++)occ[y*w+x]=wideTerminalTouches(aq,x,y);
    const target=Math.round((ap.crossing.lo+ap.crossing.hi)/2);
    // A terminal lower cell only: no extrapolated subdivision of the complex
    // group above the inset, and no permission to accept another unproved row.
    if(!range(target/h,.45,.82)||h-ab[3]<h*.12)return [];
    const seam=corridor(ex.bg,occ,w,h,1,w-1,target,8,.20);
    if(!seam){log?.('wide terminal withheld: shared gutter does not span');return [];}
    const root=[1,Math.floor(Math.min(...seam.path)),w-1,h-1],region=new Uint8Array(w*h);
    for(let x=1;x<w-1;x++)for(let y=root[1];y<h-1;y++)if(y+.5>=seam.path[x-1])region[y*w+x]=1;
    const shape=outline({box:root},1,region,ex.bg,occ,w,h,rgba,ap.color);
    if(!shape||shape.withheld){log?.('wide terminal withheld: '+JSON.stringify(shape?.withheld?{reason:shape.withheld,rim:shape.rim,box:shape.box}:'shape'));return [];}
    const b=shape.box;
    if(b[0]<=1||b[1]<=root[1]||b[2]>=w-1||b[3]>=h-1||!range((b[2]-b[0])/w,.70,.985)||!range((b[3]-b[1])/h,.12,.40)||b[3]<h*.94||b[0]>=ab[0]-12||b[2]<=ab[2]+4||b[1]>=ab[3]-12){log?.('wide terminal withheld: not an enclosed broad terminal cell '+JSON.stringify(b));return [];}
    const gray=new Float32Array(w*h);for(let i=0;i<gray.length;i++)gray[i]=rgba[i*4]*.299+rgba[i*4+1]*.587+rgba[i*4+2]*.114;
    // Veto the whole unobstructed lower core AND both visible side wings.
    // Known inset pixels are never passed as artwork to an internal-border test.
    const core=[b[0]+5,Math.ceil(ab[3])+5,b[2]-5,b[3]-5],cells=[core];
    if(core[2]-core[0]<w*.65||core[3]-core[1]<h*.10)return [];
    const wings=[[b[0]+5,b[1]+5,Math.floor(ab[0])-5,b[3]-5],[Math.ceil(ab[2])+5,b[1]+5,b[2]-5,b[3]-5]];
    for(const box of wings)if(box[2]-box[0]>=24&&box[3]-box[1]>=40)cells.push(box);
    for(const box of cells){
      const partial=interruptedDivider(box,ex.bg,new Uint8Array(w*h),w,h);
      if(partial||uniformInset(rgba,gray,w,h,box)||bandUniformDivider(rgba,gray,w,h,box)||bandFlatInset(rgba,gray,w,h,box)||typeof PanelClosedFrames==='undefined'||PanelClosedFrames.analyzeRGBA(rgba,w,h,null,{gradientOnly:true,localMatteInset:true,vetoCandidates:[{box}]}).length!==1){log?.('wide terminal withheld: internal divider/inset '+JSON.stringify({box,partial}));return [];}
    }
    let foreign=0,notch=0;for(let y=b[1];y<b[3];y++)for(let x=b[0];x<b[2];x++){const i=y*w+x;if(shape.label[i]&&occ[i])foreign++;if(region[i]&&occ[i])notch++;}
    if(foreign||notch<w*h*.005)return [];
    const proof={version:4,method:WIDE_TERMINAL_METHOD,analysisWidth:w,analysisHeight:h,tolerance:TOLERANCE,padding:1,anchor,side:'below',root,seam,cells,
      foregroundPixels:shape.foreground,retainedPixels:shape.foreground,rawForegroundPixels:shape.rawForeground,excludedScanSpecks:shape.excludedScanSpecks,minComponentPixels:shape.minComponentPixels,maxDiscardedContrast:shape.maxDiscardedContrast,pixelCount:shape.pixels,foreignPixels:foreign,notchPixels:notch,rim:shape.rim,pixelContours:shape.contours,uniformInkVetoPassed:true,interruptedDividerVetoPassed:true,dividerVetoPassed:true,insetVetoPassed:true};
    const p={x:b[0]/w,y:b[1]/h,w:(b[2]-b[0])/w,h:(b[3]-b[1])/h,_contours:shape.contours.map(q=>q.map(([x,y])=>({x:x/w,y:y/h}))),_identitySource:'inset-neighbor-frame',_geometryOwner:'inset-neighbor-contours',_geometryType:'wide-terminal-inset-cell',_insetNeighborProof:proof};
    if(!validWideTerminalPanel(p)){log?.('wide terminal withheld: proof');return [];}
    log?.('wide terminal: one independently enclosed scene with inset notch');return [p];
  }
  function validWideTerminalPanel(p){try{
    const pr=p?._insetNeighborProof,w=pr?.analysisWidth,h=pr?.analysisHeight,ap=pr?.anchor?._insetRimProof;
    if(p?._identitySource!=='inset-neighbor-frame'||pr?.version!==4||pr.method!==WIDE_TERMINAL_METHOD||!Number.isInteger(w)||!Number.isInteger(h)||!range(w,250,900)||!range(h,350,900)||pr.tolerance!==TOLERANCE||pr.padding!==1||pr.side!=='below'||typeof PanelFramedInsets==='undefined'||ap?.version!==3||!PanelFramedInsets.validPanel(pr.anchor)||ap.analysisWidth!==w||ap.analysisHeight!==h)return false;
    // Reader's generic proven-contour handoff uses the established geometry
    // label; the proof and the coordinates must remain byte-for-byte intact.
    if(p._geometryOwner!=null&&p._geometryOwner!=='inset-neighbor-contours'||p._geometryType!=null&&!['wide-terminal-inset-cell','inset-guided-corridor-cell'].includes(p._geometryType))return false;
    const c=pr.seam,target=Math.round((ap.crossing.lo+ap.crossing.hi)/2),aq=pr.anchor._outline.map(a=>[a.x*w,a.y*h]),ab=bounds(aq);
    if(!range(target/h,.45,.82)||h-ab[3]<h*.12||!bandProofPath(c,w,h,.20)||c.x0!==1||c.x1!==w-1||c.target!==target||c.spread!==8)return false;
    const root=[1,Math.floor(Math.min(...c.path)),w-1,h-1];if(JSON.stringify(root)!==JSON.stringify(pr.root))return false;
    if(pr.minComponentPixels!==Math.max(12,Math.round(w*h*.000057))||!range(pr.maxDiscardedContrast,0,24)||!Number.isInteger(pr.rawForegroundPixels)||!Number.isInteger(pr.excludedScanSpecks)||!range(pr.excludedScanSpecks,0,Math.max(80,pr.rawForegroundPixels*.0025))||pr.rawForegroundPixels-pr.excludedScanSpecks!==pr.foregroundPixels||!Number.isInteger(pr.foregroundPixels)||!range(pr.foregroundPixels,w*h*.012,w*h)||pr.retainedPixels!==pr.foregroundPixels||!Number.isInteger(pr.pixelCount)||!range(pr.pixelCount,w*h*.020,w*h*.40)||!range(pr.foregroundPixels/pr.pixelCount,.42,1)||pr.foreignPixels!==0||!Number.isInteger(pr.notchPixels)||!range(pr.notchPixels,w*h*.005,w*h*.20)||['uniformInkVetoPassed','interruptedDividerVetoPassed','dividerVetoPassed','insetVetoPassed'].some(k=>pr[k]!==true))return false;
    if(!Array.isArray(pr.rim)||pr.rim.length!==4||pr.rim.some(s=>!Number.isInteger(s?.samples)||s.samples<25||!Number.isInteger(s.matched)||!range(s.matched/s.samples,.93,1)))return false;
    if(!Array.isArray(p._contours)||p._contours.length!==1||!Array.isArray(p._contours[0])||!range(p._contours[0].length,4,1024))return false;
    const q=[];for(const a of p._contours[0]){if(!range(a?.x,0,1)||!range(a?.y,0,1)||Math.abs(a.x*w-Math.round(a.x*w))>1e-7||Math.abs(a.y*h-Math.round(a.y*h))>1e-7)return false;q.push([Math.round(a.x*w),Math.round(a.y*h)]);}
    if(JSON.stringify([q])!==JSON.stringify(pr.pixelContours)||area(q)!==pr.pixelCount)return false;
    const b=bounds(q);if(b[0]<=1||b[1]<=root[1]||b[2]>=w-1||b[3]>=h-1||!range((b[2]-b[0])/w,.70,.985)||!range((b[3]-b[1])/h,.12,.40)||b[3]<h*.94||b[0]>=ab[0]-12||b[2]<=ab[2]+4||b[1]>=ab[3]-12||pr.pixelCount/((b[2]-b[0])*(b[3]-b[1]))<.80)return false;
    const core=[b[0]+5,Math.ceil(ab[3])+5,b[2]-5,b[3]-5],cells=[core],wings=[[b[0]+5,b[1]+5,Math.floor(ab[0])-5,b[3]-5],[Math.ceil(ab[2])+5,b[1]+5,b[2]-5,b[3]-5]];
    if(core[2]-core[0]<w*.65||core[3]-core[1]<h*.10)return false;
    for(const box of wings)if(box[2]-box[0]>=24&&box[3]-box[1]>=40)cells.push(box);
    if(JSON.stringify(cells)!==JSON.stringify(pr.cells))return false;
    const seen=new Set();
    for(let i=0;i<q.length;i++){
      const a=q[i],b=q[(i+1)%q.length],key=a.join(',');if(seen.has(key)||(a[0]!==b[0]&&a[1]!==b[1])||(a[0]===b[0]&&a[1]===b[1]))return false;seen.add(key);
      for(let j=i+2;j<q.length;j++){
        if(i===0&&j===q.length-1)continue;const c=q[j],d=q[(j+1)%q.length];
        if(Math.max(a[0],b[0])<Math.min(c[0],d[0])||Math.max(c[0],d[0])<Math.min(a[0],b[0])||Math.max(a[1],b[1])<Math.min(c[1],d[1])||Math.max(c[1],d[1])<Math.min(a[1],b[1]))continue;
        if(cross(a,b,c)*cross(a,b,d)<=0&&cross(c,d,a)*cross(c,d,b)<=0)return false;
      }
      // Each interior boundary pixel must lie below the witnessed seam and
      // outside the re-proved inset. No arbitrary contour may cut through it.
      const dx=b[0]-a[0],dy=b[1]-a[1],L=Math.hypot(dx,dy),nx=-dy/L,ny=dx/L;
      for(let t=.5;t<L;t++){
        const x=Math.floor(a[0]+dx*t/L+nx*.5),y=Math.floor(a[1]+dy*t/L+ny*.5);
        if(x<1||x>=w-1||y+.5<c.path[x-1]||wideTerminalTouches(aq,x,y))return false;
      }
    }
    return ['x','y','w','h'].every(k=>finite(p[k]))&&Math.max(Math.abs(p.x-b[0]/w),Math.abs(p.y-b[1]/h),Math.abs(p.w-(b[2]-b[0])/w),Math.abs(p.h-(b[3]-b[1])/h))<1e-10;
  }catch(_){return false;}}
  function supplementWideTerminalImage(img,anchors,log){
    if(!img||!finite(img.width)||!finite(img.height)||img.width<1||img.height<1||!Array.isArray(anchors)||anchors.length!==1||anchors[0]?._insetRimProof?.version!==3)return [];
    const s=Math.min(1,900/Math.max(img.width,img.height)),w=Math.round(img.width*s),h=Math.round(img.height*s),c=document.createElement('canvas');c.width=w;c.height=h;
    const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0,w,h);return wideTerminalRGBA(ctx.getImageData(0,0,w,h).data,w,h,anchors,log);
  }

  // Test24: a wide, independently re-proved inset can border a tall side cell.
  // A matte component is only a proposal. Four quiet corridors, full component
  // retention, no foreign major component, and the existing divider/inset vetoes
  // must all agree before the complete cell (not merely its bright pixels) wins.
  // The closed inset, terminal cell, and all earlier identities are immutable.
  const FLANK_METHOD='wide-inset-four-corridor-flank-cell';
  function flankRelation(b,ab,w,h,crossing){
    // Its exposed lower edge must meet the re-observed exterior row break.
    // An internal shirt stroke must not truncate the side wing into a new cell.
    if(!crossing||Math.abs(b?.[3]-crossing.lo)>Math.max(6,Math.round(crossing.depth*.30)))return null;
    if(!Array.isArray(b)||b.length!==4||b.some(v=>!Number.isInteger(v))||b[0]<6||b[1]<6||b[2]>w-6||b[3]>h-6||!range((b[2]-b[0])/w,.10,.36)||!range((b[3]-b[1])/h,.15,.50)||(b[3]-b[1])/(b[2]-b[0])<1.5||b[1]>=ab[1]-h*.12||b[3]<=ab[1]+12||b[3]>=ab[3]-8)return null;
    if(b[0]>ab[0]+24&&b[0]<ab[2]-32&&b[2]>ab[2]+8)return 'right';
    if(b[0]<ab[0]-8&&b[2]>ab[0]+32&&b[2]<ab[2]-24)return 'left';
    return null;
  }
  function flankComponents(bg,occ,w,h){
    const labels=new Int32Array(w*h),queue=new Int32Array(w*h),parts=[];let id=0;
    for(let seed=0;seed<labels.length;seed++)if(!labels[seed]&&!bg[seed]&&!occ[seed]){
      if(++id>20000)return null;let head=0,n=1,L=w,T=h,R=0,B=0;labels[seed]=id;queue[0]=seed;
      const add=i=>{if(!labels[i]&&!bg[i]&&!occ[i]){labels[i]=id;queue[n++]=i;}};
      while(head<n){const i=queue[head++],x=i%w,y=i/w|0;L=Math.min(L,x);R=Math.max(R,x);T=Math.min(T,y);B=Math.max(B,y);if(x)add(i-1);if(x+1<w)add(i+1);if(y)add(i-w);if(y+1<h)add(i+w);}
      parts.push({id,pixels:n,box:[L,T,R+1,B+1]});
    }
    return {labels,parts};
  }
  function flankLimits(b){return {root:[b[0]-4,b[1]-4,b[2]+4,b[3]+4],targets:[b[1]-2,b[3]+1,b[0]-2,b[2]+1]};}
  function flankPaths(bg,occ,w,h,b){
    const {root,targets}=flankLimits(b),[x0,y0,x1,y1]=root,trBg=new Uint8Array(w*h),trOcc=new Uint8Array(w*h);
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){trBg[x*h+y]=bg[y*w+x];trOcc[x*h+y]=occ[y*w+x];}
    const paths=[corridor(bg,occ,w,h,x0,x1,targets[0],3,.85),corridor(bg,occ,w,h,x0,x1,targets[1],3,.10),corridor(trBg,trOcc,h,w,y0,y1,targets[2],3,.45),corridor(trBg,trOcc,h,w,y0,y1,targets[3],3,.45)];
    return paths.every(p=>p&&p.exteriorSamples>=8)?{root,paths}:null;
  }
  function flankRaster(w,h,root,paths,aq,occ=null){
    const [x0,y0,x1,y1]=root,[top,bottom,left,right]=paths,region=new Uint8Array(w*h),label=new Uint8Array(w*h);let notch=0,pixels=0;
    for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++)if(y+.5>=top.path[x-x0]&&y+.5<bottom.path[x-x0]&&x+.5>=left.path[y-y0]&&x+.5<right.path[y-y0]){
      const i=y*w+x;region[i]=1;if(occ?occ[i]:wideTerminalTouches(aq,x,y))notch++;else{label[i]=1;pixels++;}
    }
    return {region,label,notch,pixels};
  }
  function flankCells(box,ab,side,paths){
    const top=Math.ceil(Math.max(...paths[0].path))+4,bottom=Math.floor(ab[1])-4;
    const core=[box[0]+4,top,box[2]-4,bottom];
    const wing=side==='right'?[Math.ceil(ab[2])+2,Math.ceil(ab[1])+8,box[2]-3,box[3]-5]:[box[0]+3,Math.ceil(ab[1])+8,Math.floor(ab[0])-2,box[3]-5];
    return {core,wing};
  }
  function flankWingDivider(gray,w,box,base){
    const [x0,y0,x1,y1]=box;if(x1-x0<6||y1-y0<16)return false;
    for(let y=y0+4;y<y1-4;y++){
      let ink=0,bright0=0,bright1=0,sum=0,square=0;const n=x1-x0;
      for(let x=x0;x<x1;x++){const g=gray[y*w+x];ink+=g<=base+20;sum+=g;square+=g*g;let a=0,b=0;for(let d=2;d<=4;d++){a=Math.max(a,gray[(y-d)*w+x]);b=Math.max(b,gray[(y+d)*w+x]);}bright0+=a>base+28;bright1+=b>base+28;}
      if(ink===n&&Math.min(bright0,bright1)/n>=.70&&square/n-(sum/n)**2<=25)return true;
    }return false;
  }
  function wideFlankRGBA(rgba,w,h,anchors,log){
    if(!Number.isInteger(w)||!Number.isInteger(h)||!range(w,250,900)||!range(h,350,900)||!(rgba instanceof Uint8Array||rgba instanceof Uint8ClampedArray)||rgba.length!==w*h*4||!Array.isArray(anchors)||anchors.length!==2||typeof PanelFramedInsets==='undefined'||typeof PanelClosedFrames==='undefined')return [];
    const [anchor,terminal]=anchors,ap=anchor?._insetRimProof;
    if(ap?.version!==3||!PanelFramedInsets.validPanel(anchor)||terminal?._insetNeighborProof?.version!==4||!validWideTerminalPanel(terminal)||ap.analysisWidth!==w||ap.analysisHeight!==h||JSON.stringify(terminal._insetNeighborProof.anchor)!==JSON.stringify(anchor))return [];
    const witnessed=PanelFramedInsets.wideInsetsRGBA(rgba,w,h);if(witnessed.length!==1||JSON.stringify(witnessed[0])!==JSON.stringify(anchor))return [];
    const tw=wideTerminalRGBA(rgba,w,h,[anchor]);if(tw.length!==1||JSON.stringify(tw[0])!==JSON.stringify(terminal))return [];
    const ex=exterior(rgba,w,h,ap.color);if(!ex)return [];
    const aq=anchor._outline.map(p=>[p.x*w,p.y*h]),ab=bounds(aq),occ=new Uint8Array(w*h);
    for(let y=Math.floor(ab[1]);y<=Math.ceil(ab[3]);y++)for(let x=Math.floor(ab[0]);x<=Math.ceil(ab[2]);x++)occ[y*w+x]=wideTerminalTouches(aq,x,y);
    const cc=flankComponents(ex.bg,occ,w,h);if(!cc)return [];
    const proposals=cc.parts.filter(p=>p.pixels>=w*h*.02&&flankRelation(p.box,ab,w,h,ap.crossing));
    if(proposals.length<1||proposals.length>2)return [];
    const gray=new Float32Array(w*h);for(let i=0;i<gray.length;i++)gray[i]=rgba[4*i]*.299+rgba[4*i+1]*.587+rgba[4*i+2]*.114;
    const out=[];
    for(const candidate of proposals){
      const side=flankRelation(candidate.box,ab,w,h,ap.crossing),witness=flankPaths(ex.bg,occ,w,h,candidate.box);if(!witness){log?.('wide flank withheld: enclosing corridors');continue;}
      const {root,paths}=witness,raster=flankRaster(w,h,root,paths,aq,occ),shape=bandOutline(1,raster.region,ex.bg,occ,w,h);
      if(!shape||shape.withheld||shape.rim.some(s=>s.matched/s.samples<.97)){log?.('wide flank withheld: silhouette/rim '+JSON.stringify(shape?.withheld?shape.rim:null));continue;}
      let retained=0,foreign=0;const minMajor=Math.max(1500,Math.round(w*h*.008));
      for(let i=0;i<shape.label.length;i++)if(shape.label[i]&&cc.labels[i]){const id=cc.labels[i];if(id===candidate.id)retained++;else if(cc.parts[id-1].pixels>=minMajor)foreign++;}
      if(retained!==candidate.pixels||foreign||shape.foreground-retained>retained*.25||raster.notch<w*h*.002||raster.notch>w*h*.06){log?.('wide flank withheld: artwork ownership');continue;}
      const {core,wing}=flankCells(shape.box,ab,side,paths);
      if(core[2]-core[0]<40||core[3]-core[1]<h*.12||wing[2]-wing[0]<6||wing[3]-wing[1]<16||uniformInset(rgba,gray,w,h,core)||bandUniformDivider(rgba,gray,w,h,core)||bandFlatInset(rgba,gray,w,h,core)||interruptedDivider(core,ex.bg,new Uint8Array(w*h),w,h)||flankWingDivider(gray,w,wing,ap.base)||PanelClosedFrames.analyzeRGBA(rgba,w,h,null,{gradientOnly:true,localMatteInset:true,vetoCandidates:[{box:core}]}).length!==1){log?.('wide flank withheld: internal divider/inset');continue;}
      const proof={version:5,method:FLANK_METHOD,analysisWidth:w,analysisHeight:h,tolerance:TOLERANCE,padding:0,anchor,terminal,side,proposal:candidate.box,root,paths,core,wing,sourceComponentPixels:candidate.pixels,retainedSourcePixels:retained,foreignMajorPixels:foreign,detachedPixels:shape.foreground-retained,foregroundPixels:shape.foreground,pixelCount:shape.pixels,notchPixels:raster.notch,rim:shape.rim,pixelContours:shape.contours,dividerVetoPassed:true,insetVetoPassed:true,wingVetoPassed:true};
      const b=shape.box,p={x:b[0]/w,y:b[1]/h,w:(b[2]-b[0])/w,h:(b[3]-b[1])/h,_contours:shape.contours.map(q=>q.map(([x,y])=>({x:x/w,y:y/h}))),_identitySource:'inset-neighbor-frame',_geometryOwner:'inset-neighbor-contours',_geometryType:'wide-inset-flank-cell',_insetNeighborProof:proof};
      if(!validWideFlankPanel(p)){log?.('wide flank withheld: proof');continue;}out.push(p);
    }
    if(new Set(out.map(p=>p._insetNeighborProof.side)).size!==out.length)return [];
    log?.('wide inset flank: '+out.length+' independently enclosed tall cell(s)');return out;
  }
  function validWideFlankPanel(p){try{
    const pr=p?._insetNeighborProof,w=pr?.analysisWidth,h=pr?.analysisHeight,ap=pr?.anchor?._insetRimProof;
    if(p?._identitySource!=='inset-neighbor-frame'||pr?.version!==5||pr.method!==FLANK_METHOD||!Number.isInteger(w)||!Number.isInteger(h)||!range(w,250,900)||!range(h,350,900)||pr.tolerance!==TOLERANCE||pr.padding!==0||ap?.version!==3||typeof PanelFramedInsets==='undefined'||!PanelFramedInsets.validPanel(pr.anchor)||ap.analysisWidth!==w||ap.analysisHeight!==h||!validWideTerminalPanel(pr.terminal)||JSON.stringify(pr.terminal._insetNeighborProof.anchor)!==JSON.stringify(pr.anchor))return false;
    if(p._geometryOwner!=null&&p._geometryOwner!=='inset-neighbor-contours'||p._geometryType!=null&&!['wide-inset-flank-cell','inset-guided-corridor-cell'].includes(p._geometryType))return false;
    const aq=pr.anchor._outline.map(p=>[p.x*w,p.y*h]),ab=bounds(aq),side=flankRelation(pr.proposal,ab,w,h,ap.crossing);if(!side||side!==pr.side)return false;
    const {root,targets}=flankLimits(pr.proposal);if(JSON.stringify(root)!==JSON.stringify(pr.root)||!Array.isArray(pr.paths)||pr.paths.length!==4)return false;
    for(let i=0;i<4;i++){const v=i>=2,c=pr.paths[i],minimum=[.85,.10,.45,.45][i];if(!bandProofPath(c,v?h:w,v?w:h,minimum)||c.x0!==root[v?1:0]||c.x1!==root[v?3:2]||c.target!==targets[i]||c.spread!==3||c.exteriorSamples<8)return false;}
    if(!Number.isInteger(pr.sourceComponentPixels)||!range(pr.sourceComponentPixels,w*h*.02,w*h*.18)||pr.retainedSourcePixels!==pr.sourceComponentPixels||pr.foreignMajorPixels!==0||!Number.isInteger(pr.detachedPixels)||!range(pr.detachedPixels,0,pr.sourceComponentPixels*.25)||pr.foregroundPixels!==pr.sourceComponentPixels+pr.detachedPixels||!Number.isInteger(pr.pixelCount)||!range(pr.pixelCount,w*h*.02,w*h*.20)||!range(pr.foregroundPixels/pr.pixelCount,.42,1)||!Number.isInteger(pr.notchPixels)||!range(pr.notchPixels,w*h*.002,w*h*.06)||['dividerVetoPassed','insetVetoPassed','wingVetoPassed'].some(k=>pr[k]!==true))return false;
    if(!Array.isArray(pr.rim)||pr.rim.length!==4||pr.rim.some(r=>!Number.isInteger(r?.samples)||r.samples<25||!Number.isInteger(r.matched)||!range(r.matched/r.samples,.97,1)))return false;
    if(!Array.isArray(p._contours)||p._contours.length!==1||!Array.isArray(p._contours[0])||!range(p._contours[0].length,4,1024))return false;
    const q=[];for(const a of p._contours[0]){if(!range(a?.x,0,1)||!range(a?.y,0,1)||Math.abs(a.x*w-Math.round(a.x*w))>1e-7||Math.abs(a.y*h-Math.round(a.y*h))>1e-7)return false;q.push([Math.round(a.x*w),Math.round(a.y*h)]);}
    if(JSON.stringify([q])!==JSON.stringify(pr.pixelContours)||area(q)!==pr.pixelCount)return false;
    const raster=flankRaster(w,h,root,pr.paths,aq),contours=trace(raster.label,w,h,1);if(raster.pixels!==pr.pixelCount||raster.notch!==pr.notchPixels||JSON.stringify(contours)!==JSON.stringify(pr.pixelContours))return false;
    const box=bounds(q),cells=flankCells(box,ab,side,pr.paths);if(JSON.stringify(cells.core)!==JSON.stringify(pr.core)||JSON.stringify(cells.wing)!==JSON.stringify(pr.wing)||cells.core[2]-cells.core[0]<40||cells.core[3]-cells.core[1]<h*.12||cells.wing[2]-cells.wing[0]<6||cells.wing[3]-cells.wing[1]<16||pr.pixelCount/((box[2]-box[0])*(box[3]-box[1]))<.80)return false;
    return ['x','y','w','h'].every(k=>finite(p[k]))&&Math.max(Math.abs(p.x-box[0]/w),Math.abs(p.y-box[1]/h),Math.abs(p.w-(box[2]-box[0])/w),Math.abs(p.h-(box[3]-box[1])/h))<1e-10;
  }catch(_){return false;}}
  function supplementWideFlankImage(img,anchors,log){
    if(!img||!finite(img.width)||!finite(img.height)||img.width<1||img.height<1||!Array.isArray(anchors)||anchors.length!==2||anchors[0]?._insetRimProof?.version!==3||anchors[1]?._insetNeighborProof?.version!==4)return [];
    const s=Math.min(1,900/Math.max(img.width,img.height)),w=Math.round(img.width*s),h=Math.round(img.height*s),c=document.createElement('canvas');c.width=w;c.height=h;
    const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0,w,h);return wideFlankRGBA(ctx.getImageData(0,0,w,h).data,w,h,anchors,log);
  }

  // Test25: a complete shared-ink cell between an independently observed
  // tall flank and a wide inset. Unlike exterior flood fill, a printed black
  // separator need not have exactly the exterior matte's RGB value. All
  // sampled rows must still contain ink on the measured rail; no gap is
  // bridged and no image/page IDs or remembered crop coordinates are used.
  const INNER_METHOD='wide-inset-shared-ink-inner-cell';
  function innerRails(gray,w,h,base,ab,flank){
    const f=flank._insetNeighborProof,side=f.side;
    if(side!=='right')return []; // unproved mirror topology is withheld
    const lo=Math.ceil(Math.max(...f.paths[0].path))+8,hi=Math.floor(ab[1])-4;
    const edge=Math.min(...f.paths[2].path),mid=(lo+hi)/2,options=[];
    if(hi-lo<h*.12)return [];
    const first=Math.max(Math.ceil(ab[0])+20,Math.ceil(edge-w*.42)),last=Math.floor(edge-Math.max(54,w*.10));
    for(let center=first;center<=last;center++){
      let best=null;
      for(let sm=-20;sm<=20;sm++){
        const m=sm*.002,b=center-m*mid;let cheap=false;
        for(let y=lo;y<=hi;y+=9){const x=Math.round(m*y+b);if(x<8||x>=w-8||Math.min(gray[y*w+x-1],gray[y*w+x],gray[y*w+x+1])>base+24){cheap=true;break;}}
        if(cheap)continue;
        const e=tierEvidence(gray,w,h,true,m,b,lo,hi,base);
        if(e.matched!==e.samples||e.deep/e.samples<.90||e.core/e.samples<.65||Math.min(e.before,e.after)/e.samples<.40||e.quarters.some(q=>Math.min(q.before,q.after)/q.samples<.20))continue;
        const score=Math.min(e.before,e.after)/e.samples+.25*e.core/e.samples-.3*Math.abs(m);
        if(!best||score>best.score)best={vertical:true,center,m,b,lo,hi,...e,score};
      }if(best)options.push(best);
    }
    const groups=[];for(const q of options){if(!groups.length||q.center>groups.at(-1).at(-1).center+4)groups.push([]);groups.at(-1).push(q);}
    return groups.map(g=>g.reduce((a,b)=>b.score>a.score?b:a));
  }
  function innerLimits(rail,ab,flank,h){
    const f=flank._insetNeighborProof;
    const y0=f.root[1]-4,y1=Math.min(Math.floor(ab[3])-8,Math.ceil(ab[1])+Math.round(h*.04));
    const x0=Math.floor(Math.min(rail.m*y0+rail.b,rail.m*y1+rail.b))-4;
    const x1=Math.ceil(Math.max(...f.paths[2].path))+3;
    return {root:[x0,y0,x1,y1],topTarget:f.paths[0].target,inkTarget:rail.center};
  }
  function innerRaster(w,h,root,top,left,flank,aq){
    const [x0,y0,x1,y1]=root,f=flank._insetNeighborProof,label=new Uint8Array(w*h),region=new Uint8Array(w*h),occ=new Uint8Array(w*h);let pixels=0,anchorContacts=0;
    for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){
      const i=y*w+x;occ[i]=wideTerminalTouches(aq,x,y);
      const right=f.paths[2].path[y-f.root[1]];
      if(y+.5>=top.path[x-x0]&&x+.5>=left.path[y-y0]&&x+.5<right){region[i]=1;if(!occ[i]){label[i]=1;pixels++;}else anchorContacts++;}
    }
    return {label,region,occ,pixels,anchorContacts};
  }
  function innerCore(box,ab,paths){return [box[0]+5,Math.ceil(Math.max(...paths.top.path))+5,box[2]-5,Math.floor(ab[1])-5];}
  function wideInnerRGBA(rgba,w,h,anchors,log){
    if(!Number.isInteger(w)||!Number.isInteger(h)||!range(w,250,900)||!range(h,350,900)||!(rgba instanceof Uint8Array||rgba instanceof Uint8ClampedArray)||rgba.length!==w*h*4||!Array.isArray(anchors)||anchors.length!==3||typeof PanelFramedInsets==='undefined'||typeof PanelClosedFrames==='undefined')return [];
    const [anchor,terminal,flank]=anchors,ap=anchor?._insetRimProof;
    if(ap?.version!==3||!PanelFramedInsets.validPanel(anchor)||!validWideTerminalPanel(terminal)||!validWideFlankPanel(flank)||ap.analysisWidth!==w||ap.analysisHeight!==h||flank._insetNeighborProof.side!=='right'||JSON.stringify(flank._insetNeighborProof.anchor)!==JSON.stringify(anchor)||JSON.stringify(flank._insetNeighborProof.terminal)!==JSON.stringify(terminal))return [];
    // Fresh observations prevent cached anchors from authorizing a changed page.
    const aw=PanelFramedInsets.wideInsetsRGBA(rgba,w,h),tw=wideTerminalRGBA(rgba,w,h,aw),fw=wideFlankRGBA(rgba,w,h,aw.concat(tw));
    if(aw.length!==1||tw.length!==1||fw.length!==1||JSON.stringify(aw.concat(tw,fw))!==JSON.stringify(anchors))return [];
    const ex=exterior(rgba,w,h,ap.color),g=tierGray(rgba,w,h,ap.color);if(!ex||!g)return [];
    const {gray,base}=g,aq=anchor._outline.map(p=>[p.x*w,p.y*h]),ab=bounds(aq),rails=innerRails(gray,w,h,base,ab,flank);
    if(rails.length!==1){log?.('wide inner withheld: ambiguous or missing shared ink rail '+rails.length);return [];}
    const rail=rails[0],limits=innerLimits(rail,ab,flank,h),{root}=limits,[x0,y0,x1,y1]=root;
    if(x0<6||y0<6||x1>=w-6||y1>=h-6||y1>flank._insetNeighborProof.root[3])return [];
    const occ=new Uint8Array(w*h),ink=new Uint8Array(w*h),trInk=new Uint8Array(w*h),trOcc=new Uint8Array(w*h);
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){
      const i=y*w+x;ink[i]=gray[i]<=base+24;
      if(x>=Math.floor(ab[0])&&x<=Math.ceil(ab[2])&&y>=Math.floor(ab[1])&&y<=Math.ceil(ab[3]))occ[i]=wideTerminalTouches(aq,x,y);
      trInk[x*h+y]=ink[i];trOcc[x*h+y]=occ[i];
    }
    const top=corridor(ex.bg,occ,w,h,x0,x1,limits.topTarget,6,.95),left=corridor(trInk,trOcc,h,w,y0,y1,limits.inkTarget,5,.75);
    if(!top||!left){log?.('wide inner withheld: incomplete top or ink path');return [];}
    let thin=0,railSamples=0,railMatched=0,bridgePixels=0;
    for(let y=y0;y<y1;y++){
      const x=Math.floor(left.path[y-y0]);if(Math.abs(x+.5-(rail.m*y+rail.b))>3){log?.('wide inner withheld: ink path leaves measured rail');return [];}
      if(occ[y*w+x])continue;
      railSamples++;railMatched+=ink[y*w+x];
      let l=x,r=x;while(l>x-5&&ink[y*w+l-1])l--;while(r<x+5&&ink[y*w+r+1])r++;
      if(r-l+1<=8)thin++;
      if(y>y0){const old=Math.floor(left.path[y-y0-1]);for(let u=Math.min(old,x);u<=Math.max(old,x);u++){bridgePixels++;if(!ink[y*w+u]&&!occ[y*w+u])return [];}}
    }
    if(railMatched!==railSamples||thin/railSamples<.40){log?.('wide inner withheld: broad or incomplete ink');return [];}
    const paths={top,left},raster=innerRaster(w,h,root,top,left,flank,aq),shape=bandOutline(1,raster.region,ink,raster.occ,w,h);
    if(!shape||shape.withheld||shape.pixels!==raster.pixels){log?.('wide inner withheld: contour '+JSON.stringify(shape?.withheld||null));return [];}
    const box=shape.box,core=innerCore(box,ab,paths);
    if(core[2]-core[0]<45||core[3]-core[1]<h*.12||!range((box[2]-box[0])/w,.10,.42)||!range((box[3]-box[1])/h,.12,.45)||raster.anchorContacts<500)return [];
    const empty=new Uint8Array(w*h);
    if(uniformInset(rgba,gray,w,h,core)||bandUniformDivider(rgba,gray,w,h,core)||bandFlatInset(rgba,gray,w,h,core)||interruptedDivider(core,ex.bg,empty,w,h)||tierInterruptedDivider(rgba,gray,w,h,core,base)||PanelClosedFrames.analyzeRGBA(rgba,w,h,null,{gradientOnly:true,localMatteInset:true,vetoCandidates:[{box:core}]}).length!==1){log?.('wide inner withheld: internal divider/inset');return [];}
    const proof={version:6,method:INNER_METHOD,analysisWidth:w,analysisHeight:h,tolerance:TOLERANCE,inkTolerance:24,padding:0,anchor,terminal,flank,side:'inside-right-flank',rail,root,paths,core,railSamples,railMatched,thinSamples:thin,bridgePixels,foregroundPixels:shape.foreground,pixelCount:shape.pixels,anchorContacts:raster.anchorContacts,rim:shape.rim,pixelContours:shape.contours,dividerVetoPassed:true,insetVetoPassed:true};
    const p={x:box[0]/w,y:box[1]/h,w:(box[2]-box[0])/w,h:(box[3]-box[1])/h,_contours:shape.contours.map(q=>q.map(([x,y])=>({x:x/w,y:y/h}))),_identitySource:'inset-neighbor-frame',_geometryOwner:'inset-neighbor-contours',_geometryType:'wide-inset-inner-cell',_insetNeighborProof:proof};
    if(!validWideInnerPanel(p)){log?.('wide inner withheld: descriptor validation');return [];}
    log?.('wide inner: one whole cell between re-observed shared ink, flank and inset');return [p];
  }
  function validWideInnerPanel(p){try{
    const pr=p?._insetNeighborProof,w=pr?.analysisWidth,h=pr?.analysisHeight,ap=pr?.anchor?._insetRimProof,f=pr?.flank?._insetNeighborProof;
    if(p?._identitySource!=='inset-neighbor-frame'||pr?.version!==6||pr.method!==INNER_METHOD||!Number.isInteger(w)||!Number.isInteger(h)||!range(w,250,900)||!range(h,350,900)||pr.tolerance!==TOLERANCE||pr.inkTolerance!==24||pr.padding!==0||pr.side!=='inside-right-flank'||ap?.version!==3||typeof PanelFramedInsets==='undefined'||!PanelFramedInsets.validPanel(pr.anchor)||ap.analysisWidth!==w||ap.analysisHeight!==h||!validWideTerminalPanel(pr.terminal)||!validWideFlankPanel(pr.flank)||f.side!=='right'||JSON.stringify(f.anchor)!==JSON.stringify(pr.anchor)||JSON.stringify(f.terminal)!==JSON.stringify(pr.terminal))return false;
    if(p._geometryOwner!=null&&p._geometryOwner!=='inset-neighbor-contours'||p._geometryType!=null&&!['wide-inset-inner-cell','inset-guided-corridor-cell'].includes(p._geometryType))return false;
    const aq=pr.anchor._outline.map(p=>[p.x*w,p.y*h]),ab=bounds(aq),r=pr.rail;
    const lo=Math.ceil(Math.max(...f.paths[0].path))+8,hi=Math.floor(ab[1])-4,edge=Math.min(...f.paths[2].path);
    if(!r||r.vertical!==true||!Number.isInteger(r.center)||r.center<Math.max(Math.ceil(ab[0])+20,Math.ceil(edge-w*.42))||r.center>Math.floor(edge-Math.max(54,w*.10))||!range(r.m,-.04,.04)||Math.abs(r.b-(r.center-r.m*(lo+hi)/2))>1e-9||r.lo!==lo||r.hi!==hi||r.samples!==hi-lo+1||r.matched!==r.samples||r.maxGap!==0||!range(r.deep/r.samples,.90,1)||!range(r.core/r.samples,.65,1)||Math.min(r.before,r.after)/r.samples<.40||!Array.isArray(r.quarters)||r.quarters.length!==4)return false;
    let qs=0;for(const q of r.quarters){if(!['samples','matched','before','after'].every(k=>Number.isInteger(q[k]))||q.samples<1||q.matched!==q.samples||!range(q.before/q.samples,.20,1)||!range(q.after/q.samples,.20,1))return false;qs+=q.samples;}if(qs!==r.samples)return false;
    const limits=innerLimits(r,ab,pr.flank,h),{root}=limits,[x0,y0,x1,y1]=root;
    if(JSON.stringify(root)!==JSON.stringify(pr.root)||x0<6||y0<6||x1>=w-6||y1>=h-6||y1>f.root[3])return false;
    const top=pr.paths?.top,left=pr.paths?.left;
    if(!bandProofPath(top,w,h,.95)||top.x0!==x0||top.x1!==x1||top.target!==limits.topTarget||top.spread!==6||!bandProofPath(left,h,w,.75)||left.x0!==y0||left.x1!==y1||left.target!==limits.inkTarget||left.spread!==5)return false;
    for(let y=y0;y<y1;y++)if(Math.abs(left.path[y-y0]-(r.m*y+r.b))>3)return false;
    if(!Number.isInteger(pr.railSamples)||pr.railSamples<h*.12||pr.railMatched!==pr.railSamples||!Number.isInteger(pr.thinSamples)||!range(pr.thinSamples/pr.railSamples,.40,1)||!Number.isInteger(pr.bridgePixels)||pr.bridgePixels<pr.railSamples-1||!Number.isInteger(pr.foregroundPixels)||!Number.isInteger(pr.pixelCount)||!range(pr.pixelCount,w*h*.02,w*h*.20)||!range(pr.foregroundPixels/pr.pixelCount,.42,1)||!Number.isInteger(pr.anchorContacts)||pr.anchorContacts<500||pr.dividerVetoPassed!==true||pr.insetVetoPassed!==true)return false;
    if(!Array.isArray(pr.rim)||pr.rim.length!==4||pr.rim.some(s=>!Number.isInteger(s?.samples)||s.samples<25||!Number.isInteger(s.matched)||!range(s.matched/s.samples,.93,1)))return false;
    if(!Array.isArray(p._contours)||p._contours.length!==1||!Array.isArray(p._contours[0])||!range(p._contours[0].length,4,1024))return false;
    const q=[];for(const a of p._contours[0]){if(!range(a?.x,0,1)||!range(a?.y,0,1)||Math.abs(a.x*w-Math.round(a.x*w))>1e-7||Math.abs(a.y*h-Math.round(a.y*h))>1e-7)return false;q.push([Math.round(a.x*w),Math.round(a.y*h)]);}
    if(JSON.stringify([q])!==JSON.stringify(pr.pixelContours)||area(q)!==pr.pixelCount)return false;
    const raster=innerRaster(w,h,root,top,left,pr.flank,aq),contours=trace(raster.label,w,h,1);
    if(raster.pixels!==pr.pixelCount||raster.anchorContacts!==pr.anchorContacts||JSON.stringify(contours)!==JSON.stringify(pr.pixelContours))return false;
    const box=bounds(q),core=innerCore(box,ab,pr.paths);
    if(JSON.stringify(core)!==JSON.stringify(pr.core)||core[2]-core[0]<45||core[3]-core[1]<h*.12||!range((box[2]-box[0])/w,.10,.42)||!range((box[3]-box[1])/h,.12,.45))return false;
    return ['x','y','w','h'].every(k=>finite(p[k]))&&Math.max(Math.abs(p.x-box[0]/w),Math.abs(p.y-box[1]/h),Math.abs(p.w-(box[2]-box[0])/w),Math.abs(p.h-(box[3]-box[1])/h))<1e-10;
  }catch(_){return false;}}
  function supplementWideInnerImage(img,anchors,log){
    if(!img||!finite(img.width)||!finite(img.height)||img.width<1||img.height<1||!Array.isArray(anchors)||anchors.length!==3||anchors[2]?._insetNeighborProof?.version!==5)return [];
    const s=Math.min(1,900/Math.max(img.width,img.height)),w=Math.round(img.width*s),h=Math.round(img.height*s),c=document.createElement('canvas');c.width=w;c.height=h;
    const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0,w,h);return wideInnerRGBA(ctx.getImageData(0,0,w,h).data,w,h,anchors,log);
  }

  // Test26: a pale-rim callout with a saturated, side-projecting effect lobe.
  // The existing wide-inset topology supplies only a search ceiling, never a
  // stored crop. A connected pale rim must independently witness the top,
  // right and bottom and both ends of the interrupted left side. Only the
  // connected, chromatically coherent effect can explain that interruption.
  // Visible marks inside the effect footprint are retained as printed; this
  // does not infer or reconstruct artwork hidden behind foreground tendrils.
  const CALLOUT_METHOD='wide-anchors-pale-rim-with-observed-effect-lobe';
  function calloutComponents(mask,w,h){
    const labels=new Int32Array(w*h),queue=new Int32Array(w*h),parts=[];let next=0;
    for(let seed=0;seed<mask.length;seed++)if(mask[seed]&&!labels[seed]){
      if(++next>16000)return null;let head=0,n=1,x0=w,y0=h,x1=-1,y1=-1;labels[seed]=next;queue[0]=seed;
      while(head<n){const i=queue[head++],x=i%w,y=i/w|0;x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);
        for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){if((!dx&&!dy)||x+dx<0||x+dx>=w||y+dy<0||y+dy>=h)continue;const j=i+dy*w+dx;if(mask[j]&&!labels[j]){labels[j]=next;queue[n++]=j;}}
      }parts.push({id:next,box:[x0,y0,x1+1,y1+1],pixels:n});
    }return {labels,parts};
  }
  function calloutHue(r,g,b){
    const hi=Math.max(r,g,b),lo=Math.min(r,g,b),d=hi-lo;
    if(hi<110||d<40||d/hi<.35)return -1;
    const t=hi===r?(g-b)/d:hi===g?2+(b-r)/d:4+(r-g)/d;return (60*t+360)%360;
  }
  function calloutInterpolate(samples,lo,hi,fallback){
    const path=samples.slice(),witness=[];for(let t=lo;t<hi;t++)if(finite(path[t]))witness.push(t);
    if(witness.length<2)return null;let k=0;
    for(let t=lo;t<hi;t++)if(!finite(path[t])){while(k+1<witness.length&&witness[k+1]<t)k++;const a=witness[k],b=witness[Math.min(k+1,witness.length-1)];path[t]=t<a||t>b||a===b?fallback:path[a]+(path[b]-path[a])*(t-a)/(b-a);}
    return {path,witness};
  }
  function calloutMask(model,w,h){
    const {box,paths,lobe}=model,[x0,y0,x1,y1]=box,label=new Uint8Array(w*h);let pixels=0;
    const bb=bounds(lobe),lo=Math.max(0,Math.floor(Math.min(x0-2,bb[0]))),hi=Math.min(w,Math.ceil(Math.max(x1+2,bb[2])));
    for(let y=Math.max(0,y0-2);y<Math.min(h,y1+2);y++)for(let x=lo;x<hi;x++){
      const xx=Math.max(x0,Math.min(x1-1,x)),yy=Math.max(y0,Math.min(y1-1,y));
      const core=x+.5>=paths.left[yy]-1&&x+.5<paths.right[yy]+2&&y+.5>=paths.top[xx]-1&&y+.5<paths.bottom[xx]+2;
      if(core||inside(lobe,x+.5,y+.5)){label[y*w+x]=1;pixels++;}
    }return {label,pixels};
  }
  function calloutWitness(paths,box,labels,id,w,h,lobe){
    const [x0,y0,x1,y1]=box,lob=bounds(lobe),W=x1-x0,H=y1-y0,out=[];
    for(const side of ['top','bottom','left','right']){
      const v=side==='left'||side==='right',lo=v?y0+10:x0+8,hi=v?y1-4:x1-8;let samples=0,matched=0,gap=0,maxGap=0,unexplained=0,upper=0,upperN=0,lower=0,lowerN=0;
      for(let t=lo;t<hi;t++){
        const p=paths[side][t],coord=Math.round(p);let yes=false;
        for(let d=-1;d<=1;d++){const x=v?coord+d:t,y=v?t:coord+d;if(x>=0&&x<w&&y>=0&&y<h&&labels[y*w+x]===id)yes=true;}
        samples++;matched+=yes;gap=yes?0:gap+1;maxGap=Math.max(maxGap,gap);
        if(!yes&&!(side==='left'&&t>=lob[1]-6&&t<=lob[3]+6))unexplained++;
        if(v&&t<lob[1]-8){upperN++;upper+=yes;}if(v&&t>lob[3]+3){lowerN++;lower+=yes;}
      }
      if(samples<30||unexplained>Math.max(2,samples*.035)||side!=='left'&&matched/samples<.96||side==='left'&&(matched/samples<.60||upperN<60||upper/upperN<.96||lowerN<5||lower/lowerN<.70))return null;
      out.push({side,samples,matched,maxGap,unexplained,upper,upperN,lower,lowerN});
    }return out;
  }
  function calloutModel(rgba,w,h,anchors,log){
    const ap=anchors[0]._insetRimProof,g=tierGray(rgba,w,h,ap.color);if(!g)return null;const {gray,base}=g;
    const ceiling=Math.min(anchors[2].y,anchors[3].y)*h,cutoff=Math.max(145,base+130);
    if(!range(ceiling/h,.22,.48))return null;
    const light=new Uint8Array(w*h);for(let i=0;i<light.length;i++)light[i]=(i/w|0)<ceiling-2&&gray[i]>cutoff;
    const cc=calloutComponents(light,w,h);if(!cc)return null;
    const cs=cc.parts.filter(c=>{const [x0,y0,x1,y1]=c.box,W=x1-x0,H=y1-y0;return range(W/w,.12,.40)&&range(H/h,.13,.40)&&range(c.pixels/(W*H),.012,.16)&&y1<=ceiling&&ceiling-y1<=Math.max(8,h*.012)&&x0>anchors[3].x*w&&x1>anchors[2].x*w;});
    if(cs.length!==1){log?.('callout withheld: ambiguous pale-rim component '+cs.length);return null;}
    const c=cs[0],[x0,y0,x1,y1]=c.box,W=x1-x0,H=y1-y0;
    // Every color proposal comes from this rim's interior, not a named color.
    const hues=new Float32Array(w*h).fill(-1),hist=new Int32Array(18),tones=new Map();
    for(let y=y0;y<y1;y++)for(let x=Math.max(0,Math.floor(x0-W*.80));x<x1;x++){
      const i=y*w+x,hue=calloutHue(rgba[i*4],rgba[i*4+1],rgba[i*4+2]);hues[i]=hue;
      if(hue>=0&&x>x0+W*.12&&x<x1-5&&y>y0+H*.60&&y<y1-5){hist[Math.floor(hue/20)]++;const key=[0,1,2].map(k=>rgba[i*4+k]>>5).join(',');const tone=tones.get(key)||{n:0,r:0,g:0,b:0};tone.n++;tone.r+=rgba[i*4];tone.g+=rgba[i*4+1];tone.b+=rgba[i*4+2];tones.set(key,tone);}
    }
    const bin=Array.from(hist).reduce((best,n,i)=>n>hist[best]?i:best,0);if(hist[bin]<W*H*.025)return null;
    const hueCenter=bin*20+10,tone=[...tones.values()].reduce((a,b)=>b.n>a.n?b:a),toneColor=[tone.r/tone.n,tone.g/tone.n,tone.b/tone.n],valueFloor=Math.max(...toneColor)*.90,body=new Uint8Array(w*h);
    for(let i=0;i<body.length;i++){const x=i%w,y=i/w|0,d=Math.abs(hues[i]-hueCenter);body[i]=Math.max(rgba[i*4],rgba[i*4+1],rgba[i*4+2])>=valueFloor&&hues[i]>=0&&Math.min(d,360-d)<=20&&y>y0+H*.40&&y<y1&&x>x0-W*.80&&x<x1;}
    const bc=calloutComponents(body,w,h);if(!bc)return null;
    const parts=bc.parts.filter(q=>q.pixels>=Math.max(12,Math.round(w*h*.000035)));if(parts.length<2||parts.length>200)return null;
    const seeds=parts.filter(q=>q.box[2]>x0+W*.35&&q.box[1]>y0+H*.45);if(!seeds.length)return null;
    const seed=seeds.reduce((a,b)=>b.pixels>a.pixels?b:a),selected=new Set([seed.id]),radius=Math.max(3,Math.round(Math.min(w,h)*.010));
    let change=true;while(change){change=false;for(const a of parts)if(selected.has(a.id))for(const b of parts)if(!selected.has(b.id)){
      const dx=Math.max(0,a.box[0]-b.box[2],b.box[0]-a.box[2]),dy=Math.max(0,a.box[1]-b.box[3],b.box[1]-a.box[3]);if(Math.hypot(dx,dy)<=radius*2){selected.add(b.id);change=true;}
    }}
    const group=new Uint8Array(w*h),nearLight=new Set();let bodyPixels=0,outsidePixels=0;const outer=[];
    for(let i=0;i<body.length;i++)if(selected.has(bc.labels[i])){group[i]=1;bodyPixels++;const x=i%w,y=i/w|0;if(x<x0){outsidePixels++;outer.push([x,y]);}}
    if(outsidePixels<Math.max(80,w*h*.0004)||bodyPixels<W*H*.05||bodyPixels>W*H*.45)return null;
    const ob=bounds(outer),reach=Math.max(5,Math.round(radius*1.7)),points=[];
    for(let y=Math.max(y0,Math.floor(ob[1]-reach));y<Math.min(y1,Math.ceil(ob[3]+reach));y++)for(let x=Math.max(0,Math.floor(ob[0]-reach));x<Math.min(x1,x0+8);x++){
      const i=y*w+x;if(group[i])points.push([x,y],[x+1,y+1]);
      if(!light[i])continue;let near=false;
      for(let dy=-radius;dy<=radius&&!near;dy++)for(let dx=-radius;dx<=radius;dx++){if(dx*dx+dy*dy>radius*radius)continue;const xx=x+dx,yy=y+dy;if(xx>=0&&xx<w&&yy>=0&&yy<h&&group[yy*w+xx]){near=true;break;}}
      if(near)nearLight.add(cc.labels[i]);
    }
    let lobeLightPixels=0;
    for(let y=Math.max(y0,Math.floor(ob[1]-reach));y<Math.min(y1,Math.ceil(ob[3]+reach));y++)for(let x=Math.max(0,Math.floor(ob[0]-reach));x<Math.min(x1,x0+8);x++){
      const i=y*w+x;if(nearLight.has(cc.labels[i])&&light[i]){points.push([x,y],[x+1,y+1]);lobeLightPixels++;}
    }
    if(lobeLightPixels<30)return null;
    const lobe=hull(points.flatMap(p=>[-1,1].flatMap(x=>[-1,1].map(y=>[p[0]+x,p[1]+y]))));if(!lobe)return null;
    const lob=bounds(lobe);
    if(!range((x0-lob[0])/W,.18,.80)||lob[1]<y0+H*.52||lob[3]>y1-7||!range((lob[3]-lob[1])/H,.12,.36)||lob[2]<x0+2)return null;
    // Trace only the outer samples of the same pale rim. Its missing left
    // interval is bracketed by witnessed upper/lower strokes AND the lobe.
    const raw={top:new Array(w).fill(null),bottom:new Array(w).fill(null),left:new Array(h).fill(null),right:new Array(h).fill(null)};
    for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++)if(cc.labels[y*w+x]===c.id){
      if(y<y0+H*.10)raw.top[x]=raw.top[x]===null?y:Math.min(raw.top[x],y);
      if(y>y1-H*.10)raw.bottom[x]=raw.bottom[x]===null?y:Math.max(raw.bottom[x],y);
      if(x<x0+W*.18)raw.left[y]=raw.left[y]===null?x:Math.min(raw.left[y],x);
      if(x>x1-W*.15)raw.right[y]=raw.right[y]===null?x:Math.max(raw.right[y],x);
    }
    // The bottom rim can be paler/darker than the connected proposal. A
    // disconnected sample is accepted only as a narrow local light ridge
    // with dark collars on BOTH sides in the same measured end band.
    const observed=new Uint8Array(w*h);for(let i=0;i<observed.length;i++)observed[i]=cc.labels[i]===c.id;
    let detachedRimPixels=0;
    for(let x=x0;x<x1;x++)for(let y=y1-7;y<Math.min(h-4,y1+2);y++){
      const i=y*w+x,v=gray[i];if(v<Math.max(80,base+70))continue;
      let above=Infinity,below=Infinity;for(let d=1;d<=3;d++){above=Math.min(above,gray[i-d*w]);below=Math.min(below,gray[i+d*w]);}
      if(above>base+65||below>base+40||v-Math.max(above,below)<35)continue;
      if(!observed[i])detachedRimPixels++;observed[i]=1;raw.bottom[x]=raw.bottom[x]===null?y:Math.max(raw.bottom[x],y);
    }
    for(const side of ['left','right']){
      const known=raw[side].filter(finite).sort((a,b)=>a-b);if(known.length<20)return null;
      const predicted=calloutInterpolate(raw[side],y0,y1,known[known.length>>1]);if(!predicted)return null;
      for(let y=y0;y<y1;y++){
        if(raw[side][y]!==null||side==='left'&&y>lob[1]+5&&y<lob[3]-3)continue;
        const target=predicted.path[y],lo=Math.max(3,Math.floor(target)-5),hi=Math.min(w-3,Math.ceil(target)+6);let best=null;
        for(let x=lo;x<hi;x++){
          const i=y*w+x,v=gray[i];if(v<Math.max(80,base+70))continue;
          let a=Infinity,b=Infinity;for(let d=1;d<=3;d++){a=Math.min(a,gray[i-d]);b=Math.min(b,gray[i+d]);}
          const outer=side==='left'?a:b;
          if(a>base+65||b>base+65||outer>base+45||v-Math.max(a,b)<35)continue;
          const score=v-18*Math.abs(x-target);if(!best||score>best.score)best={x,i,score};
        }
        if(best){if(!observed[best.i])detachedRimPixels++;observed[best.i]=1;raw[side][y]=best.x;}
      }
    }
    const paths={},witnesses={};
    for(const side of ['top','bottom','left','right']){
      const v=side==='left'||side==='right',lo=v?y0:x0,hi=v?y1:x1,a=raw[side].filter(finite).sort((a,b)=>a-b);if(a.length<(hi-lo)*(side==='left'?.60:.85))return null;
      const fit=calloutInterpolate(raw[side],lo,hi,a[a.length>>1]);if(!fit)return null;paths[side]=fit.path;witnesses[side]=fit.witness;
    }
    const rim=calloutWitness(paths,c.box,observed,1,w,h,lobe);if(!rim){log?.('callout withheld: incomplete or unexplained pale rim');return null;}
    const core=[Math.ceil(Math.max(...paths.left.slice(y0+20,Math.floor(lob[1])-5)))+5,y0+20,x1-8,Math.floor(lob[1])-5];
    if(core[2]-core[0]<45||core[3]-core[1]<h*.10||bandUniformDivider(rgba,gray,w,h,core)||bandFlatInset(rgba,gray,w,h,core)||tierUniformCoreDivider(gray,w,h,core,base)){log?.('callout withheld: internal divider/inset');return null;}
    let bridge=0;for(let y=Math.ceil(lob[1]);y<Math.floor(lob[3]);y++){let left=0,right=0;for(let dx=1;dx<=5;dx++){left+=group[y*w+x0-dx];right+=group[y*w+x0+dx];}bridge+=left>1&&right>1;}
    if(bridge<8){log?.('callout withheld: detached effect');return null;}
    const model={box:c.box,paths,lobe},raster=calloutMask(model,w,h),contours=trace(raster.label,w,h,1);
    if(!contours||contours.length!==1||contours[0].length>1024||raster.pixels<w*h*.035||raster.pixels>w*h*.16)return null;
    const bb=bounds(contours[0]);if(bb[3]>ceiling)return null;
    let keptBody=0,keptRim=0;for(let i=0;i<raster.label.length;i++){if(group[i]&&raster.label[i])keptBody++;if(cc.labels[i]===c.id&&raster.label[i])keptRim++;}
    // Every selected body pixel and every main-rim pixel must survive.
    if(keptBody!==bodyPixels||keptRim!==c.pixels){log?.('callout withheld: clipped colored body/rim '+JSON.stringify({keptBody,bodyPixels,keptRim,rimPixels:c.pixels}));return null;}
    log?.('pale-rim callout: complete rim and side effect '+JSON.stringify({box:c.box,lobe:lob,bodyPixels,outsidePixels,bridge,pixels:raster.pixels}));
    return {model,contours,pixels:raster.pixels,base,cutoff,ceiling,rim,witnesses,detachedRimPixels,componentPixels:c.pixels,bodyPixels,outsidePixels,lobeLightPixels,hueCenter,toneColor,valueFloor,bridge,core,keptBody,keptRim};
  }
  function wideCalloutRGBA(rgba,w,h,anchors,log){
    if(!Number.isInteger(w)||!Number.isInteger(h)||!range(w,250,900)||!range(h,350,900)||!(rgba instanceof Uint8Array||rgba instanceof Uint8ClampedArray)||rgba.length!==w*h*4||!Array.isArray(anchors)||anchors.length!==4||typeof PanelFramedInsets==='undefined')return [];
    if(!validWideInnerPanel(anchors[3])||anchors[0]?._insetRimProof?.analysisWidth!==w||anchors[0]?._insetRimProof?.analysisHeight!==h)return [];
    const old=anchors[3]._insetNeighborProof;if(JSON.stringify([old.anchor,old.terminal,old.flank])!==JSON.stringify(anchors.slice(0,3)))return [];
    const observed=wideInnerRGBA(rgba,w,h,anchors.slice(0,3));if(observed.length!==1||JSON.stringify(observed[0])!==JSON.stringify(anchors[3]))return [];
    const found=calloutModel(rgba,w,h,anchors,log);if(!found)return [];
    const {contours,...proof}=found,bb=bounds(contours[0]);
    const pr={version:7,method:CALLOUT_METHOD,analysisWidth:w,analysisHeight:h,anchor:anchors[3],...proof,pixelContours:contours,dividerVetoPassed:true,insetVetoPassed:true};
    const out={x:bb[0]/w,y:bb[1]/h,w:(bb[2]-bb[0])/w,h:(bb[3]-bb[1])/h,_identitySource:'inset-neighbor-frame',_geometryOwner:'inset-neighbor-contours',_geometryType:'inset-guided-corridor-cell',_contours:contours.map(q=>q.map(([x,y])=>({x:x/w,y:y/h}))),_insetNeighborProof:pr};
    if(!validWideCalloutPanel(out)){log?.('callout withheld: descriptor validation');return [];}return [out];
  }
  function validWideCalloutPanel(p){try{
    const pr=p?._insetNeighborProof,w=pr?.analysisWidth,h=pr?.analysisHeight;
    if(p?._identitySource!=='inset-neighbor-frame'||pr?.version!==7||pr.method!==CALLOUT_METHOD||!Number.isInteger(w)||!Number.isInteger(h)||!range(w,250,900)||!range(h,350,900)||!validWideInnerPanel(pr.anchor)||pr.anchor._insetNeighborProof.analysisWidth!==w||pr.anchor._insetNeighborProof.analysisHeight!==h||pr.dividerVetoPassed!==true||pr.insetVetoPassed!==true)return false;
    if(p._geometryOwner!=null&&p._geometryOwner!=='inset-neighbor-contours'||p._geometryType!=null&&p._geometryType!=='inset-guided-corridor-cell')return false;
    const {box,paths,lobe}=pr.model||{};if(!Array.isArray(box)||box.length!==4||box.some(v=>!Number.isInteger(v)))return false;
    const [x0,y0,x1,y1]=box,W=x1-x0,H=y1-y0,anchor=pr.anchor._insetNeighborProof,ceiling=Math.min(pr.anchor.y,anchor.flank.y)*h;
    if(x0<10||x1>=w||y0<1||y1>=h||!range(W/w,.12,.40)||!range(H/h,.13,.40)||pr.ceiling!==ceiling||y1>ceiling||ceiling-y1>Math.max(8,h*.012)||!range(pr.base,0,25)||pr.cutoff!==Math.max(145,pr.base+130))return false;
    if(!Array.isArray(lobe)||lobe.length<4||lobe.length>256||lobe.some(p=>!Array.isArray(p)||p.length!==2||p.some(v=>!finite(v)))||JSON.stringify(hull(lobe))!==JSON.stringify(lobe))return false;
    const lb=bounds(lobe);if(!range((x0-lb[0])/W,.18,.80)||lb[1]<y0+H*.52||lb[3]>y1-7||!range((lb[3]-lb[1])/H,.12,.36)||lb[2]<x0+2||lb[2]>x0+12)return false;
    for(const side of ['top','bottom','left','right']){
      const v=side==='left'||side==='right',a=paths?.[side],lo=v?y0:x0,hi=v?y1:x1,cap=v?w:h;
      if(!Array.isArray(a)||a.length!==(v?h:w)||!Array.isArray(pr.witnesses?.[side])||pr.witnesses[side].length<(hi-lo)*(side==='left'?.60:.85))return false;
      for(let t=0;t<a.length;t++){if(t<lo||t>=hi){if(a[t]!==null)return false;}else {const limits=side==='top'?[y0,y0+H*.10]:side==='bottom'?[y1-H*.10,y1+2]:side==='left'?[x0-5,x0+W*.20]:[x1-W*.15,x1+2];if(!range(a[t],0,cap-1)||!range(a[t],limits[0],limits[1]))return false;}}
      if(pr.witnesses[side].some((t,i)=>!Number.isInteger(t)||t<lo||t>=hi||i&&t<=pr.witnesses[side][i-1]))return false;
    }
    const expectedCore=[Math.ceil(Math.max(...paths.left.slice(y0+20,Math.floor(lb[1])-5)))+5,y0+20,x1-8,Math.floor(lb[1])-5];
    if(JSON.stringify(pr.core)!==JSON.stringify(expectedCore)||expectedCore[2]-expectedCore[0]<45||expectedCore[3]-expectedCore[1]<h*.10)return false;
    if(!Array.isArray(pr.toneColor)||pr.toneColor.length!==3||pr.toneColor.some(v=>!range(v,0,255))||pr.valueFloor!==Math.max(...pr.toneColor)*.90||!Number.isInteger(pr.detachedRimPixels)||!range(pr.detachedRimPixels,0,(W+H)*6))return false;
    if(!Array.isArray(pr.rim)||pr.rim.length!==4)return false;
    for(let i=0;i<4;i++){const r=pr.rim[i],side=['top','bottom','left','right'][i];if(r?.side!==side||!Number.isInteger(r.samples)||r.samples<30||!Number.isInteger(r.matched)||!range(r.matched/r.samples,side==='left'?.60:.96,1)||!Number.isInteger(r.unexplained)||!range(r.unexplained,0,Math.max(2,r.samples*.035))||side==='left'&&(r.upperN<60||!range(r.upper/r.upperN,.96,1)||r.lowerN<5||!range(r.lower/r.lowerN,.70,1)))return false;}
    if(!Number.isInteger(pr.bodyPixels)||!range(pr.bodyPixels,W*H*.05,W*H*.45)||!Number.isInteger(pr.outsidePixels)||!range(pr.outsidePixels,Math.max(80,w*h*.0004),pr.bodyPixels)||!Number.isInteger(pr.componentPixels)||!range(pr.componentPixels/(W*H),.012,.16)||pr.keptBody!==pr.bodyPixels||pr.keptRim!==pr.componentPixels||!Number.isInteger(pr.lobeLightPixels)||pr.lobeLightPixels<30||!Number.isInteger(pr.bridge)||pr.bridge<8||!range(pr.hueCenter,10,350)||pr.hueCenter%20!==10)return false;
    const raster=calloutMask(pr.model,w,h),contours=trace(raster.label,w,h,1);if(!contours||contours.length!==1||contours[0].length>1024||JSON.stringify(contours)!==JSON.stringify(pr.pixelContours)||raster.pixels!==pr.pixels||!range(pr.pixels,w*h*.035,w*h*.16))return false;
    if(JSON.stringify(p._contours)!==JSON.stringify(contours.map(q=>q.map(([x,y])=>({x:x/w,y:y/h})))))return false;
    const bb=bounds(contours[0]);if(bb[3]>ceiling)return false;
    return ['x','y','w','h'].every(k=>finite(p[k]))&&Math.max(Math.abs(p.x-bb[0]/w),Math.abs(p.y-bb[1]/h),Math.abs(p.w-(bb[2]-bb[0])/w),Math.abs(p.h-(bb[3]-bb[1])/h))<1e-10;
  }catch(_){return false;}}
  function supplementWideCalloutImage(img,anchors,log){
    if(!img||!finite(img.width)||!finite(img.height)||img.width<1||img.height<1||!Array.isArray(anchors)||anchors.length!==4||anchors[3]?._insetNeighborProof?.version!==6)return [];
    const s=Math.min(1,900/Math.max(img.width,img.height)),w=Math.round(img.width*s),h=Math.round(img.height*s),c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0,w,h);return wideCalloutRGBA(ctx.getImageData(0,0,w,h).data,w,h,anchors,log);
  }

  // Test27: the upper scene next to a separately proved rim/effect callout.
  // A partial bottom matte rail is measured where it is visible at the page
  // margin. Its continuation is allowed only with a witnessed foreground
  // crossing, not by taking the bounds of connected dark artwork. Printed
  // overlap pixels inside that underlying frame are kept as printed; no
  // hidden artwork or semantic tendril separation is invented.
  const ACTION_METHOD='callout-neighbor-three-observed-rims-with-crossed-baseline';
  function actionLeastSquares(points){
    let st=0,sv=0,stt=0,stv=0;for(const [t,v] of points){st+=t;sv+=v;stt+=t*t;stv+=t*v;}
    const n=points.length,d=n*stt-st*st;if(n<8||d<=0)return null;
    const m=(n*stv-st*sv)/d,b=(sv-m*st)/n,rs=points.map(([t,v])=>v-(m*t+b));
    return {m,b,count:n,span:[points[0][0],points.at(-1)[0]],minResidual:Math.min(...rs),maxResidual:Math.max(...rs),witnesses:points};
  }
  function actionFit(points){
    if(points.length<20)return null;let best=null;
    for(let s=-35;s<=35;s++){
      const m=s*.002,counts=new Map();for(const [t,v] of points){const k=Math.round(v-m*t);counts.set(k,(counts.get(k)||0)+1);}
      for(const [b,n] of counts){if(n<3)continue;const a=points.filter(([t,v])=>Math.abs(v-m*t-b)<=2.6);if(!best||a.length>best.length)best=a;}
    }
    if(!best)return null;
    for(let k=0;k<2;k++){const f=actionLeastSquares(best);if(!f)return null;best=points.filter(([t,v])=>Math.abs(v-f.m*t-f.b)<=2.6);}
    const f=actionLeastSquares(best);return f&&Math.abs(f.m)<=.07?f:null;
  }
  function actionLine(f,side){return {m:f.m,b:f.b+(side==='bottom'?f.maxResidual+1:f.minResidual-1)};}
  function actionRim(gray,w,h,base,line,vertical,lo,hi,sign){
    let quiet=0,foreground=0;const samples=hi-lo+1;
    for(let t=lo;t<=hi;t++){
      const at=Math.round(line.m*t+line.b);let q=0,v=0;
      for(let d=1;d<=5;d++)q+=tierSample(gray,w,h,vertical,t,at-sign*d)<=base+24;
      for(let d=2;d<=14;d++)v=Math.max(v,tierSample(gray,w,h,vertical,t,at+sign*d));
      quiet+=q>=4;foreground+=v>base+35;
    }
    return {lo,hi,samples,quiet,foreground};
  }
  function actionRight(anchor,w,h){
    const mask=calloutMask(anchor._insetNeighborProof.model,w,h).label,right=new Array(h).fill(null);
    for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(mask[y*w+x]){right[y]=x;break;}
    return {right,mask};
  }
  function actionRaster(model,w,h,anchor){
    const {top,left,bottom}=model,{right,mask}=actionRight(anchor,w,h),label=new Uint8Array(w*h);let pixels=0,foreignPixels=0;
    for(let y=0;y<h;y++)if(right[y]!==null)for(let x=0;x<right[y];x++){
      if(x+.5>=left.m*(y+.5)+left.b&&y+.5>=top.m*(x+.5)+top.b&&y+.5<bottom.m*(x+.5)+bottom.b){label[y*w+x]=1;pixels++;foreignPixels+=mask[y*w+x];}
    }
    return {label,pixels,foreignPixels};
  }
  // Near-edge strips are still real potential subframes. The older broad-core
  // veto intentionally has larger margins; do not weaken it globally. This
  // local extra veto admits no merging across a sustained narrow ink ridge,
  // including a short-height strip just above the reconstructed bottom edge.
  function actionNearEdgeDivider(gray,w,h,box,base){
    const [x0,y0,x1,y1]=box;
    for(const vertical of [false,true]){
      const lo=vertical?x0:y0,hi=vertical?x1:y1,start=vertical?y0:x0,end=vertical?y1:x1,samples=end-start;
      if(samples<65||hi-lo<24)continue;
      for(let p=lo+6;p<hi-6;p++){
        let matched=0,first=0,last=0,quiet=0,sum=0,square=0,uniformFirst=0,uniformLast=0,narrow=0,before=0,after=0;
        for(let t=start;t<end;t++){
          const val=q=>tierSample(gray,w,h,vertical,t,q);let q=p;for(let d=-1;d<=1;d++)if(val(p+d)<val(q))q=p+d;
          const v=val(q),v0=val(p);
          if(v<=base+24){let l=q,r=q;while(l>q-6&&val(l-1)<=base+24)l--;while(r<q+6&&val(r+1)<=base+24)r++;
            if(l>q-6&&r<q+6&&r-l+1<=8){let L=0,R=0;for(let d=1;d<=4;d++){L=Math.max(L,val(l-d));R=Math.max(R,val(r+d));}if(Math.min(L,R)-v>=20){matched++;first+=t<start+samples*.18;last+=t>=end-samples*.18;}}
          }
          let L=0,R=0;for(let d=3;d<=12;d++){L=Math.max(L,val(p-d));R=Math.max(R,val(p+d));}before+=L>base+28;after+=R>base+28;
          if(v0<=base+24){quiet++;sum+=v0;square+=v0*v0;uniformFirst+=t<start+samples*.18;uniformLast+=t>=end-samples*.18;
            let l=p,r=p;while(l>p-8&&Math.abs(val(l-1)-v0)<=3)l--;while(r<p+8&&Math.abs(val(r+1)-v0)<=3)r++;narrow+=l>p-8&&r<p+8&&r-l+1<=10;
          }
        }
        if(matched/samples>=.70&&Math.min(first,last)/(samples*.18)>=.45)return {vertical,position:p,samples,matched,first,last,kind:'narrow-interrupted'};
        if(quiet/samples>=.92&&Math.min(uniformFirst,uniformLast)/(samples*.18)>=.88&&square/quiet-(sum/quiet)**2<=9&&narrow/samples>=.35&&Math.min(before,after)/samples>=.30)return {vertical,position:p,samples,quiet,narrow,before,after,kind:'uniform-shared-ink'};
      }
    }
    return null;
  }
  function actionModelRGBA(rgba,w,h,anchor,color,log){
    const g=tierGray(rgba,w,h,color);if(!g)return null;const {gray,base}=g,{box}=anchor._insetNeighborProof.model,[cx,cy,cX,cY]=box;
    if(cx<w*.48||cx>w*.86||cy>h*.08||cY>h*.45)return null;
    const topPoints=[],leftPoints=[];
    for(let x=6;x<cx-5;x++)for(let y=2;y<Math.floor(cY*.30);y++)if(gray[y*w+x]>base+35){topPoints.push([x,y]);break;}
    for(let y=cy+3;y<cY;y++)for(let x=3;x<Math.floor(cx*.20);x++)if(gray[y*w+x]>base+35){leftPoints.push([y,x]);break;}
    const tf=actionFit(topPoints),lf=actionFit(leftPoints);if(!tf||!lf||tf.count<cx*.52||tf.span[1]-tf.span[0]<cx*.85||lf.count<h*.18||lf.count/(lf.span[1]-lf.span[0]+1)<.78)return null;
    const top=actionLine(tf,'top'),left=actionLine(lf,'left'),end=lf.span[1],start=Math.ceil(lf.m*end+lf.b);
    if(top.b<3||top.b>h*.08||left.b<3||left.b>w*.10||end<cy+(cY-cy)*.60||end>cY+3||start>=cx*.15)return null;
    const bottomPoints=[];
    for(let x=start+3;x<cx-5;x++)for(let y=end-8;y<=end+6;y++){
      if(y<5||y+8>=h)return null;let low=0,bright=0;
      for(let d=1;d<=7;d++)low=Math.max(low,gray[(y+d)*w+x]);for(let d=-4;d<=0;d++)bright=Math.max(bright,gray[(y+d)*w+x]);
      if(low<=base+24&&bright>base+35){bottomPoints.push([x,y+1]);break;}
    }
    const tentative=actionFit(bottomPoints);if(!tentative)return null;
    // A contiguous exterior gutter from the left border must support the
    // extrapolation. Farther accidental dark texture is not another witness.
    let supportEnd=start+3,bad=0;
    for(let x=start+3;x<cx-5;x++){
      const y=Math.round(tentative.m*x+tentative.b);let quiet=0;for(let d=2;d<=7;d++)quiet+=gray[(y+d)*w+x]<=base+24;
      if(quiet>=5){bad=0;supportEnd=x;}else if(++bad>4){supportEnd=x-bad;break;}
    }
    if(supportEnd-start<(cx-start)*.30||supportEnd-start>(cx-start)*.78){log?.('upper scene withheld: insufficient/ambiguous exposed baseline');return null;}
    const bf=actionFit(bottomPoints.filter(([x])=>x<=supportEnd));if(!bf||bf.count<(supportEnd-start)*.60||Math.abs(bf.m)>.035||Math.abs(bf.m*start+bf.b-end)>6)return null;
    const bottom=actionLine(bf,'bottom'),model={top,left,bottom},raster=actionRaster(model,w,h,anchor),contours=trace(raster.label,w,h,1);
    if(!contours||contours.length!==1||contours[0].length>1024||raster.pixels<w*h*.12||raster.pixels>w*h*.30||raster.foreignPixels)return null;
    const b=bounds(contours[0]);if(b[0]<3||b[1]<3||b[2]>cx+20||b[3]>cY||b[2]-b[0]<w*.48)return null;
    const rims=[actionRim(gray,w,h,base,top,false,start+4,cx-6,1),actionRim(gray,w,h,base,left,true,Math.ceil(top.b)+6,end-4,1),actionRim(gray,w,h,base,bottom,false,start+3,supportEnd-3,-1)];
    if(rims.some(r=>r.samples<60||r.quiet/r.samples<.94||r.foreground/r.samples<.45)){log?.('upper scene withheld: outer rim evidence '+JSON.stringify(rims));return null;}
    const {right}=actionRight(anchor,w,h),validRight=right.slice(b[1],b[3]).filter(finite),minRight=Math.min(...validRight);let crossing=0,crossSamples=0;
    for(let x=supportEnd+8;x<minRight-5;x++){
      const y=Math.round(bottom.m*x+bottom.b);let above=0,below=0;
      for(let d=1;d<=10;d++){above=Math.max(above,gray[(y-d)*w+x]);below=Math.max(below,gray[(y+d)*w+x]);}
      crossSamples++;crossing+=Math.min(above,below)>base+35;
    }
    if(crossSamples<45||crossing/crossSamples<.55){log?.('upper scene withheld: no bounded lower foreground crossing');return null;}
    const lobeTop=Math.floor(bounds(anchor._insetNeighborProof.model.lobe)[1]),cores=[[b[0]+7,b[1]+9,Math.floor(minRight)-6,b[3]-8],[b[0]+7,b[1]+9,cx-8,lobeTop-6]];
    for(const core of cores){
      if(core[2]-core[0]<w*.35||core[3]-core[1]<h*.12)return null;
      if(bandUniformDivider(rgba,gray,w,h,core)||bandFlatInset(rgba,gray,w,h,core)||tierUniformCoreDivider(gray,w,h,core,base)||tierInterruptedDivider(rgba,gray,w,h,core,base)||actionNearEdgeDivider(gray,w,h,core,base)){log?.('upper scene withheld: internal divider/inset '+JSON.stringify(core));return null;}
    }
    log?.('upper scene: three observed outer rims, crossed baseline and excluded callout '+JSON.stringify({box:b,pixels:raster.pixels,supportEnd,crossing,crossSamples}));
    return {model,topFit:tf,leftFit:lf,bottomFit:bf,supportStart:start,supportEnd,rims,crossing,crossSamples,cores,pixels:raster.pixels,foreignPixels:0,base,color,pixelContours:contours};
  }
  function wideActionRGBA(rgba,w,h,anchors,log){
    if(!Number.isInteger(w)||!Number.isInteger(h)||!range(w,250,900)||!range(h,350,900)||!(rgba instanceof Uint8Array||rgba instanceof Uint8ClampedArray)||rgba.length!==w*h*4||!Array.isArray(anchors)||anchors.length!==5)return [];
    const anchor=anchors[4];if(!validWideCalloutPanel(anchor)||anchor._insetNeighborProof.analysisWidth!==w||anchor._insetNeighborProof.analysisHeight!==h||JSON.stringify(anchor._insetNeighborProof.anchor)!==JSON.stringify(anchors[3]))return [];
    const fresh=wideCalloutRGBA(rgba,w,h,anchors.slice(0,4));if(fresh.length!==1||JSON.stringify(fresh[0])!==JSON.stringify(anchor))return [];
    const found=actionModelRGBA(rgba,w,h,anchor,anchors[0]._insetRimProof.color,log);if(!found)return [];
    const b=bounds(found.pixelContours[0]),pr={version:8,method:ACTION_METHOD,analysisWidth:w,analysisHeight:h,anchor,...found,dividerVetoPassed:true,insetVetoPassed:true};
    const p={x:b[0]/w,y:b[1]/h,w:(b[2]-b[0])/w,h:(b[3]-b[1])/h,_identitySource:'inset-neighbor-frame',_geometryOwner:'inset-neighbor-contours',_geometryType:'inset-guided-corridor-cell',_contours:found.pixelContours.map(q=>q.map(([x,y])=>({x:x/w,y:y/h}))),_insetNeighborProof:pr};
    if(!validWideActionPanel(p)){log?.('upper scene withheld: descriptor validation');return [];}return [p];
  }
  function validActionFit(f,vertical,w,h){
    const q=f?.witnesses;if(!Array.isArray(q)||q.length<20||q.length>(vertical?h:w)||q.some((a,i)=>!Array.isArray(a)||a.length!==2||a.some(v=>!Number.isInteger(v))||!range(a[0],0,(vertical?h:w)-1)||!range(a[1],0,(vertical?w:h)-1)||i&&a[0]<=q[i-1][0]))return false;
    const expected=actionLeastSquares(q);return expected&&Math.abs(expected.m)<=.07&&expected.minResidual>=-3.1&&expected.maxResidual<=3.1&&JSON.stringify(expected)===JSON.stringify(f);
  }
  function validWideActionPanel(p){try{
    const pr=p?._insetNeighborProof,w=pr?.analysisWidth,h=pr?.analysisHeight;
    if(p?._identitySource!=='inset-neighbor-frame'||pr?.version!==8||pr.method!==ACTION_METHOD||!Number.isInteger(w)||!Number.isInteger(h)||!range(w,250,900)||!range(h,350,900)||!validWideCalloutPanel(pr.anchor)||pr.anchor._insetNeighborProof.analysisWidth!==w||pr.anchor._insetNeighborProof.analysisHeight!==h||pr.dividerVetoPassed!==true||pr.insetVetoPassed!==true)return false;
    if(p._geometryOwner!=null&&p._geometryOwner!=='inset-neighbor-contours'||p._geometryType!=null&&p._geometryType!=='inset-guided-corridor-cell')return false;
    const {topFit:tf,leftFit:lf,bottomFit:bf}=pr;
    if(!validActionFit(tf,false,w,h)||!validActionFit(lf,true,w,h)||!validActionFit(bf,false,w,h))return false;
    const model={top:actionLine(tf,'top'),left:actionLine(lf,'left'),bottom:actionLine(bf,'bottom')};if(JSON.stringify(model)!==JSON.stringify(pr.model))return false;
    const {box,lobe}=pr.anchor._insetNeighborProof.model,[cx,cy,cX,cY]=box,end=lf.span[1],start=Math.ceil(lf.m*end+lf.b);
    if(cx<w*.48||cx>w*.86||cy>h*.08||cY>h*.45||tf.count<cx*.52||tf.span[1]-tf.span[0]<cx*.85||lf.count<h*.18||lf.count/(lf.span[1]-lf.span[0]+1)<.78)return false;
    if(model.top.b<3||model.top.b>h*.08||model.left.b<3||model.left.b>w*.10||end<cy+(cY-cy)*.60||end>cY+3||start>=cx*.15||pr.supportStart!==start||!Number.isInteger(pr.supportEnd)||!range((pr.supportEnd-start)/(cx-start),.30,.78)||bf.count<(pr.supportEnd-start)*.60||bf.span[1]>pr.supportEnd||Math.abs(bf.m)>.035||Math.abs(bf.m*start+bf.b-end)>6)return false;
    const raster=actionRaster(model,w,h,pr.anchor),contours=trace(raster.label,w,h,1),b=contours&&bounds(contours[0]);
    if(!contours||contours.length!==1||contours[0].length>1024||!range(raster.pixels,w*h*.12,w*h*.30)||raster.pixels!==pr.pixels||pr.foreignPixels!==0||raster.foreignPixels!==0||JSON.stringify(contours)!==JSON.stringify(pr.pixelContours))return false;
    if(b[0]<3||b[1]<3||b[2]>cx+20||b[3]>cY||b[2]-b[0]<w*.48)return false;
    const expectedRanges=[[start+4,cx-6],[Math.ceil(model.top.b)+6,end-4],[start+3,pr.supportEnd-3]];
    if(!Array.isArray(pr.rims)||pr.rims.length!==3||pr.rims.some((r,i)=>r?.lo!==expectedRanges[i][0]||r?.hi!==expectedRanges[i][1]||r.samples!==r.hi-r.lo+1||r.samples<60||!Number.isInteger(r.quiet)||!range(r.quiet/r.samples,.94,1)||!Number.isInteger(r.foreground)||!range(r.foreground/r.samples,.45,1)))return false;
    const {right}=actionRight(pr.anchor,w,h),minRight=Math.min(...right.slice(b[1],b[3]).filter(finite)),crossSamples=Math.max(0,minRight-5-(pr.supportEnd+8));
    const cores=[[b[0]+7,b[1]+9,Math.floor(minRight)-6,b[3]-8],[b[0]+7,b[1]+9,cx-8,Math.floor(bounds(lobe)[1])-6]];
    if(pr.crossSamples!==crossSamples||crossSamples<45||!Number.isInteger(pr.crossing)||!range(pr.crossing/crossSamples,.55,1)||JSON.stringify(cores)!==JSON.stringify(pr.cores)||cores.some(c=>c[2]-c[0]<w*.35||c[3]-c[1]<h*.12))return false;
    const color=pr.anchor._insetNeighborProof.anchor._insetNeighborProof.anchor._insetRimProof.color;
    if(JSON.stringify(color)!==JSON.stringify(pr.color)||pr.base!==color[0]*.299+color[1]*.587+color[2]*.114||!range(pr.base,0,25))return false;
    if(JSON.stringify(p._contours)!==JSON.stringify(contours.map(q=>q.map(([x,y])=>({x:x/w,y:y/h})))))return false;
    return ['x','y','w','h'].every(k=>finite(p[k]))&&Math.max(Math.abs(p.x-b[0]/w),Math.abs(p.y-b[1]/h),Math.abs(p.w-(b[2]-b[0])/w),Math.abs(p.h-(b[3]-b[1])/h))<1e-10;
  }catch(_){return false;}}
  function supplementWideActionImage(img,anchors,log){
    if(!img||!finite(img.width)||!finite(img.height)||img.width<1||img.height<1||!Array.isArray(anchors)||anchors.length!==5||anchors[4]?._insetNeighborProof?.version!==7)return [];
    const s=Math.min(1,900/Math.max(img.width,img.height)),w=Math.round(img.width*s),h=Math.round(img.height*s),c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0,w,h);return wideActionRGBA(ctx.getImageData(0,0,w,h).data,w,h,anchors,log);
  }

  // Test28: the last unclaimed cell is not simply "everything left over".
  // Re-prove the surrounding layout, observe a major foreground component,
  // fit its exposed left/bottom rims, preserve detached marks within that
  // bounded cell, then remove every established neighbor pixel. Printed
  // foreground inside those neighbors is deliberately NOT reassigned here.
  const RESIDUAL_METHOD='observed-exterior-silhouette-between-proved-neighbors';
  function residualAnchors(action){
    const callout=action?._insetNeighborProof?.anchor,inner=callout?._insetNeighborProof?.anchor;
    return [inner?._insetNeighborProof?.anchor,inner?._insetNeighborProof?.terminal,inner?._insetNeighborProof?.flank,inner,callout,action];
  }
  function residualPaint(p,w,h,mask,value){
    const rings=(p._contours||[p._outline]).map(q=>q.map(a=>[a.x*w,a.y*h]));
    for(let y=Math.max(0,Math.floor(p.y*h));y<Math.min(h,Math.ceil((p.y+p.h)*h));y++){
      const xs=[];for(const q of rings)for(let j=0,i=q.length-1;j<q.length;i=j++){
        const a=q[i],b=q[j];if((a[1]>y+.5)!==(b[1]>y+.5))xs.push(a[0]+(y+.5-a[1])*(b[0]-a[0])/(b[1]-a[1]));
      }
      xs.sort((a,b)=>a-b);for(let i=0;i+1<xs.length;i+=2)for(let x=Math.max(0,Math.ceil(xs[i]-.5));x<Math.min(w,Math.ceil(xs[i+1]-.5));x++)mask[y*w+x]=value;
    }
  }
  function residualDomain(anchors,w,h){
    const occupied=new Uint8Array(w*h),side=new Uint8Array(w*h);
    anchors.forEach(p=>residualPaint(p,w,h,occupied,1));
    for(const i of [0,3,4])residualPaint(anchors[i],w,h,side,1);
    const right=new Array(h).fill(w);for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(side[y*w+x]){right[y]=x;break;}
    const edge=anchors[5]._insetNeighborProof.model.bottom;
    return {occupied,right,top:Math.floor(Math.min(edge.b,edge.m*w+edge.b))-1,bottom:Math.floor(anchors[1].y*h)};
  }
  function residualRaster(rows,w,h,occupied){
    const label=new Uint8Array(w*h);let pixels=0,excluded=0;
    for(const [y,L,R] of rows)for(let x=L;x<R;x++){const i=y*w+x;if(occupied[i]){excluded++;continue;}label[i]=1;pixels++;}
    return {label,pixels,excluded};
  }
  function residualCore(anchors,box,w,h){
    const left=Math.ceil(box[0])+16,top=Math.ceil(anchors[3].y*h)+20,right=Math.floor(anchors[3].x*w)-8,bottom=Math.floor(anchors[0].y*h)-12;
    return [left,top,right,bottom];
  }
  function residualObservedRim(gray,w,h,base,fit,vertical,lo,hi){
    let quiet=0,foreground=0;const witnesses=[];
    for(let t=lo;t<=hi;t++){
      const pos=Math.round(fit.m*t+fit.b);let q=0,f=0;
      // A projection can interrupt the outside matte; only recorded quiet
      // witnesses count as rim support. Do not treat an occluding arm as a cut.
      for(let d=3;d<=7;d++){const x=vertical?pos-d:t,y=vertical?t:pos+d;if(x>=0&&x<w&&y>=0&&y<h)q+=gray[y*w+x]<=base+14;}
      for(let d=1;d<=18;d++){const x=vertical?pos+d:t,y=vertical?t:pos-d;if(x>=0&&x<w&&y>=0&&y<h)f=Math.max(f,gray[y*w+x]);}
      const a=q>=4,b=f>base+28;quiet+=a;foreground+=b;if(a&&b)witnesses.push(t);
    }
    return {lo,hi,samples:hi-lo+1,quiet,foreground,witnesses};
  }
  function residualModelRGBA(rgba,w,h,anchors,log){
    const color=anchors[0]._insetRimProof.color,ex=exterior(rgba,w,h,color),g=tierGray(rgba,w,h,color);if(!ex||!g)return null;
    const {gray,base}=g,domain=residualDomain(anchors,w,h),{occupied,right,top,bottom}=domain;
    if(top<4||bottom>=h-4||bottom-top<h*.22||bottom-top>h*.58)return null;
    const fg=new Uint8Array(w*h);for(let y=top;y<bottom;y++)for(let x=0;x<right[y];x++){const i=y*w+x;fg[i]=!occupied[i]&&!ex.bg[i];}
    const cc=calloutComponents(fg,w,h);if(!cc)return null;
    const major=cc.parts.filter(p=>p.pixels>w*h*.035);
    if(major.length!==1){log?.('residual scene withheld: ambiguous major foreground '+major.length);return null;}
    const part=major[0],[L,T,R,B]=part.box;
    if(L<6||L>w*.15||T<top||T>top+h*.10||R<anchors[3].x*w-10||R>anchors[3].x*w+8||B<anchors[0].y*h+20||B>bottom-8||part.pixels<w*h*.10||part.pixels>w*h*.30)return null;
    const rawRows=[],rawColumns=[];
    for(let y=T;y<B;y++){let lo=w,hi=0;for(let x=L;x<R;x++)if(cc.labels[y*w+x]===part.id){lo=Math.min(lo,x);hi=x+1;}if(hi>lo)rawRows.push([y,lo,hi]);}
    for(let x=L;x<R;x++){let hi=0;for(let y=T;y<B;y++)if(cc.labels[y*w+x]===part.id)hi=y+1;if(hi)rawColumns.push([x,hi-1]);}
    const leftFit=actionFit(rawRows.filter(r=>r[0]>anchors[3].y*h+15&&r[0]<anchors[0].y*h-10).map(r=>[r[0],r[1]]));
    const bottomFit=actionFit(rawColumns.filter(r=>r[0]>L+15&&r[0]<anchors[0].x*w-8));
    if(!leftFit||!bottomFit||leftFit.count<h*.16||leftFit.count/(leftFit.span[1]-leftFit.span[0]+1)<.70||bottomFit.count<w*.10||bottomFit.span[1]-bottomFit.span[0]<w*.12)return null;
    const model={left:actionLine(leftFit,'left'),bottom:actionLine(bottomFit,'bottom'),coreTop:leftFit.span[0]};
    if(Math.abs(model.bottom.m)>.035||Math.abs(model.left.m)>.035||Math.abs(model.bottom.b-B)>6)return null;
    const rim=[residualObservedRim(gray,w,h,base,leftFit,true,leftFit.span[0],leftFit.span[1]),residualObservedRim(gray,w,h,base,bottomFit,false,bottomFit.span[0],bottomFit.span[1])];
    if(rim.some(r=>r.samples<40||r.quiet/r.samples<.65||r.foreground/r.samples<.75)){log?.('residual scene withheld: outer rim evidence '+JSON.stringify(rim.map(r=>({...r,witnesses:undefined}))));return null;}
    // Detached hair, fence ink, and the left projection are retained within
    // this observed band. Tiny isolated scan noise cannot expand its envelope.
    const keep=new Uint8Array(cc.parts.length+1);let detachedPixels=0;
    for(const p of cc.parts)if(p.id===part.id||p.pixels>=4&&p.box[0]>=L-2&&p.box[1]>=T-1&&p.box[3]<=B+1){keep[p.id]=1;if(p.id!==part.id)detachedPixels+=p.pixels;}
    const rows=[];let retained=0;
    for(let y=T;y<B;y++){
      let lo=w,hi=0;
      for(let x=Math.max(1,L-2);x<Math.min(w-1,right[y]);x++){const i=y*w+x;if(keep[cc.labels[i]]){lo=Math.min(lo,x);hi=x+1;retained++;}}
      if(y>=model.coreTop){const l=Math.floor(model.left.m*(y+.5)+model.left.b),r=Math.min(right[y],Math.ceil(anchors[3].x*w)+1);if(y+.5<model.bottom.m*l+model.bottom.b){lo=Math.min(lo,l);hi=Math.max(hi,r);}}
      if(hi<=lo)continue;
      lo=Math.max(1,lo-1);hi=Math.min(w-1,hi+1,right[y]);
      // The measured bottom rim limits every column, not the next row's box.
      while(lo<hi&&y+.5>=model.bottom.m*(lo+.5)+model.bottom.b)lo++;
      while(hi>lo&&y+.5>=model.bottom.m*(hi-.5)+model.bottom.b)hi--;
      if(hi>lo)rows.push([y,lo,hi]);
    }
    const raster=residualRaster(rows,w,h,occupied),contours=trace(raster.label,w,h,1);if(!contours||contours.length!==1||contours[0].length>1400)return null;
    const box=bounds(contours[0]),core=residualCore(anchors,box,w,h);
    if(core[2]-core[0]<w*.35||core[3]-core[1]<h*.20||!range(raster.pixels,w*h*.12,w*h*.30)||retained<part.pixels*.97)return null;
    if(uniformInset(rgba,gray,w,h,core)||bandUniformDivider(rgba,gray,w,h,core)||bandFlatInset(rgba,gray,w,h,core)||tierUniformCoreDivider(gray,w,h,core,base)||tierInterruptedDivider(rgba,gray,w,h,core,base)||actionNearEdgeDivider(gray,w,h,core,base)){log?.('residual scene withheld: internal separator/inset');return null;}
    // The narrow lower wing is not permission to bridge a new divided strip.
    const wing=[Math.ceil(model.left.b)+5,Math.floor(anchors[0].y*h)+5,Math.floor(anchors[0].x*w)-7,Math.floor(model.bottom.b)-5];
    if(wing[2]-wing[0]>50&&wing[3]-wing[1]>25&&(bandUniformDivider(rgba,gray,w,h,wing)||actionNearEdgeDivider(gray,w,h,wing,base))){log?.('residual scene withheld: divided lower wing');return null;}
    log?.('residual scene: witnessed outer rims, detached marks retained, six neighbors excluded '+JSON.stringify({box,pixels:raster.pixels,detachedPixels}));
    return {model,leftFit,bottomFit,rim,rows,core,wing,box,sourceBox:part.box,sourcePixels:part.pixels,retainedPixels:retained,detachedPixels,pixelCount:raster.pixels,excludedPixels:raster.excluded,pixelContours:contours,color,base};
  }
  function wideResidualRGBA(rgba,w,h,anchors,log){
    if(!Number.isInteger(w)||!Number.isInteger(h)||!range(w,250,900)||!range(h,350,900)||!(rgba instanceof Uint8Array||rgba instanceof Uint8ClampedArray)||rgba.length!==w*h*4||!Array.isArray(anchors)||anchors.length!==6)return [];
    const anchor=anchors[5];if(!validWideActionPanel(anchor)||anchor._insetNeighborProof.analysisWidth!==w||anchor._insetNeighborProof.analysisHeight!==h||JSON.stringify(residualAnchors(anchor))!==JSON.stringify(anchors))return [];
    const fresh=wideActionRGBA(rgba,w,h,anchors.slice(0,5));if(fresh.length!==1||JSON.stringify(fresh[0])!==JSON.stringify(anchor))return [];
    const found=residualModelRGBA(rgba,w,h,anchors,log);if(!found)return [];
    const b=found.box,pr={version:9,method:RESIDUAL_METHOD,analysisWidth:w,analysisHeight:h,anchor,...found,dividerVetoPassed:true,insetVetoPassed:true};
    const p={x:b[0]/w,y:b[1]/h,w:(b[2]-b[0])/w,h:(b[3]-b[1])/h,_identitySource:'inset-neighbor-frame',_geometryOwner:'inset-neighbor-contours',_geometryType:'inset-guided-corridor-cell',_contours:found.pixelContours.map(q=>q.map(([x,y])=>({x:x/w,y:y/h}))),_insetNeighborProof:pr};
    if(!validWideResidualPanel(p)){log?.('residual scene withheld: descriptor validation');return [];}return [p];
  }
  function validWideResidualPanel(p){try{
    const pr=p?._insetNeighborProof,w=pr?.analysisWidth,h=pr?.analysisHeight;
    if(p?._identitySource!=='inset-neighbor-frame'||pr?.version!==9||pr.method!==RESIDUAL_METHOD||!Number.isInteger(w)||!Number.isInteger(h)||!range(w,250,900)||!range(h,350,900)||!validWideActionPanel(pr.anchor)||pr.anchor._insetNeighborProof.analysisWidth!==w||pr.anchor._insetNeighborProof.analysisHeight!==h||pr.dividerVetoPassed!==true||pr.insetVetoPassed!==true)return false;
    if(p._geometryOwner!=null&&p._geometryOwner!=='inset-neighbor-contours'||p._geometryType!=null&&p._geometryType!=='inset-guided-corridor-cell')return false;
    const anchors=residualAnchors(pr.anchor),lf=pr.leftFit,bf=pr.bottomFit;
    if(!validActionFit(lf,true,w,h)||!validActionFit(bf,false,w,h)||lf.count<h*.16||lf.count/(lf.span[1]-lf.span[0]+1)<.70||bf.count<w*.10||bf.span[1]-bf.span[0]<w*.12)return false;
    const model={left:actionLine(lf,'left'),bottom:actionLine(bf,'bottom'),coreTop:lf.span[0]};if(JSON.stringify(model)!==JSON.stringify(pr.model)||Math.abs(model.left.m)>.035||Math.abs(model.bottom.m)>.035)return false;
    const domain=residualDomain(anchors,w,h),rows=pr.rows;
    if(!Array.isArray(rows)||rows.length<h*.20||rows.length>h*.58||rows.some((r,i)=>!Array.isArray(r)||r.length!==3||r.some(v=>!Number.isInteger(v))||r[0]<domain.top||r[0]>=domain.bottom||r[1]<1||r[2]>=w||r[2]<=r[1]||r[2]>domain.right[r[0]]||i&&r[0]!==rows[i-1][0]+1))return false;
    const raster=residualRaster(rows,w,h,domain.occupied),contours=trace(raster.label,w,h,1);if(!contours||contours.length!==1||contours[0].length>1400||!range(raster.pixels,w*h*.12,w*h*.30)||raster.pixels!==pr.pixelCount||raster.excluded!==pr.excludedPixels||JSON.stringify(contours)!==JSON.stringify(pr.pixelContours))return false;
    const b=bounds(contours[0]),core=residualCore(anchors,b,w,h),wing=[Math.ceil(model.left.b)+5,Math.floor(anchors[0].y*h)+5,Math.floor(anchors[0].x*w)-7,Math.floor(model.bottom.b)-5];
    if(JSON.stringify(b)!==JSON.stringify(pr.box)||JSON.stringify(core)!==JSON.stringify(pr.core)||JSON.stringify(wing)!==JSON.stringify(pr.wing)||core[2]-core[0]<w*.35||core[3]-core[1]<h*.20)return false;
    if(!Array.isArray(pr.sourceBox)||pr.sourceBox.length!==4||pr.sourceBox.some(v=>!Number.isInteger(v))||pr.sourceBox[0]<6||pr.sourceBox[0]>w*.15||pr.sourceBox[1]<domain.top||pr.sourceBox[1]>domain.top+h*.10||pr.sourceBox[2]<anchors[3].x*w-10||pr.sourceBox[2]>anchors[3].x*w+8||pr.sourceBox[3]<anchors[0].y*h+20||pr.sourceBox[3]>domain.bottom-8||Math.abs(model.bottom.b-pr.sourceBox[3])>6)return false;
    if(!Number.isInteger(pr.sourcePixels)||!range(pr.sourcePixels,w*h*.10,w*h*.30)||!Number.isInteger(pr.retainedPixels)||!range(pr.retainedPixels,pr.sourcePixels*.97,pr.pixelCount+pr.excludedPixels)||!Number.isInteger(pr.detachedPixels)||!range(pr.detachedPixels,0,w*h*.05))return false;
    const limits=[lf.span,bf.span];if(!Array.isArray(pr.rim)||pr.rim.length!==2||pr.rim.some((r,i)=>r.lo!==limits[i][0]||r.hi!==limits[i][1]||r.samples!==r.hi-r.lo+1||r.samples<40||!Number.isInteger(r.quiet)||!Number.isInteger(r.foreground)||!range(r.quiet/r.samples,.65,1)||!range(r.foreground/r.samples,.75,1)||!Array.isArray(r.witnesses)||r.witnesses.length<Math.max(0,r.quiet+r.foreground-r.samples)||r.witnesses.length>Math.min(r.quiet,r.foreground)||r.witnesses.some((v,j)=>!Number.isInteger(v)||v<r.lo||v>r.hi||j&&v<=r.witnesses[j-1])))return false;
    const color=anchors[0]._insetRimProof.color;if(JSON.stringify(color)!==JSON.stringify(pr.color)||pr.base!==color[0]*.299+color[1]*.587+color[2]*.114)return false;
    if(JSON.stringify(p._contours)!==JSON.stringify(contours.map(q=>q.map(([x,y])=>({x:x/w,y:y/h})))))return false;
    return ['x','y','w','h'].every(k=>finite(p[k]))&&Math.max(Math.abs(p.x-b[0]/w),Math.abs(p.y-b[1]/h),Math.abs(p.w-(b[2]-b[0])/w),Math.abs(p.h-(b[3]-b[1])/h))<1e-10;
  }catch(_){return false;}}
  function supplementWideResidualImage(img,anchors,log){
    if(!img||!finite(img.width)||!finite(img.height)||img.width<1||img.height<1||!Array.isArray(anchors)||anchors.length!==6||anchors[5]?._insetNeighborProof?.version!==8)return [];
    const s=Math.min(1,900/Math.max(img.width,img.height)),w=Math.round(img.width*s),h=Math.round(img.height*s),c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0,w,h);return wideResidualRGBA(ctx.getImageData(0,0,w,h).data,w,h,anchors,log);
  }

  /* Test29 — two bounded inset cells sharing a large terminal composite.
   * Legacy rectangles only propose a search region. Independently observe a
   * dual-threshold edge cell, four pale rim segments, and the surrounding rim.
   * A single clipped pale-rim corner is allowed only with a connected, sampled
   * warm foreground bridge. Subtract both measured cells from the outer scene.
   * This is a conservative topology, not arbitrary residual-page flood fill.
   */
  const PAIR_METHOD='dual-tone-edge-cell-and-partial-light-rim-in-terminal-composite';
  function pairInput(rgba,w,h){
    if(!Number.isInteger(w)||!Number.isInteger(h)||!range(w,250,900)||!range(h,350,900)||!(rgba instanceof Uint8Array||rgba instanceof Uint8ClampedArray)||rgba.length!==w*h*4)return null;
    const gray=new Float32Array(w*h),edge=[];
    for(let i=0;i<w*h;i++){if(rgba[4*i+3]!==255)return null;gray[i]=.299*rgba[4*i]+.587*rgba[4*i+1]+.114*rgba[4*i+2];}
    for(let x=0;x<w;x+=2)edge.push(x,(h-1)*w+x);for(let y=0;y<h;y+=2)edge.push(y*w,y*w+w-1);
    const color=[0,1,2].map(c=>edge.map(i=>rgba[4*i+c]).sort((a,b)=>a-b)[edge.length>>1]);
    const base=.299*color[0]+.587*color[1]+.114*color[2],matched=edge.filter(i=>[0,1,2].every(c=>Math.abs(rgba[4*i+c]-color[c])<=7)).length;
    return base<=25&&matched/edge.length>=.95?{gray,color,base,edgeSamples:edge.length,edgeMatched:matched}:null;
  }
  function pairParent(p){return p&&!p._identitySource&&!p._quad&&!p._outline&&!p._contours&&['x','y','w','h'].every(k=>finite(p[k]))&&range(p.x,0,.12)&&range(p.y,.22,.64)&&range(p.w,.72,.99)&&range(p.h,.30,.74)&&range(p.x+p.w,.86,.997)&&range(p.y+p.h,.94,.998);}
  function pairComponents(mask,w,h,root,diagonal=false){
    const labels=new Int32Array(w*h),queue=new Int32Array(w*h),parts=[];let next=0;
    for(let y=root[1];y<=root[3];y++)for(let x=root[0];x<=root[2];x++){
      const seed=y*w+x;if(!mask[seed]||labels[seed])continue;if(++next>16000)return null;
      let n=1,head=0,x0=x,x1=x,y0=y,y1=y;labels[seed]=next;queue[0]=seed;
      while(head<n){const i=queue[head++],X=i%w,Y=i/w|0;x0=Math.min(x0,X);x1=Math.max(x1,X);y0=Math.min(y0,Y);y1=Math.max(y1,Y);
        for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
          if(!dx&&!dy||!diagonal&&dx&&dy)continue;const xx=X+dx,yy=Y+dy;if(xx<root[0]||xx>root[2]||yy<root[1]||yy>root[3])continue;
          const j=yy*w+xx;if(mask[j]&&!labels[j]){labels[j]=next;queue[n++]=j;}
        }
      }
      if(n>=12)parts.push({id:next,box:[x0,y0,x1,y1],pixels:n});
    }
    return {labels,parts};
  }
  function pairRidges(gray,w,h,root,base,vertical){
    const mask=new Uint8Array(w*h),d=vertical?1:w;
    for(let y=root[1]+3;y<root[3]-3;y++)for(let x=root[0]+3;x<root[2]-3;x++){
      const i=y*w+x,g=gray[i];if(g<=base+40)continue;let a=Infinity,b=Infinity;
      for(let j=1;j<=3;j++){a=Math.min(a,gray[i-j*d]);b=Math.min(b,gray[i+j*d]);}
      if(a<base+35&&b<base+35&&g-Math.max(a,b)>25)mask[i]=1;
    }
    const cc=pairComponents(mask,w,h,root,true);if(!cc)return [];const out=[];
    for(const c of cc.parts){
      const j=vertical?1:0,k=1-j,b=c.box,len=b[j+2]-b[j]+1,spread=b[k+2]-b[k];
      if(len<Math.max(30,(vertical?h:w)*.05)||spread>15||spread/len>.06)continue;
      const points=[];for(let t=b[j];t<=b[j+2];t++){const line=[];for(let p=b[k];p<=b[k+2];p++){const i=vertical?t*w+p:p*w+t;if(cc.labels[i]===c.id)line.push(p);}if(line.length)points.push([t,line.reduce((s,n)=>s+n,0)/line.length]);}
      const n=points.length;if(n/len<.95)continue;const tx=points.reduce((s,p)=>s+p[0],0)/n,ty=points.reduce((s,p)=>s+p[1],0)/n;
      const m=points.reduce((s,p)=>s+(p[0]-tx)*(p[1]-ty),0)/points.reduce((s,p)=>s+(p[0]-tx)**2,0),offset=ty-m*tx;
      const error=Math.max(...points.map(p=>Math.abs(p[1]-m*p[0]-offset)));if(Math.abs(m)>.04||error>2.5)continue;
      out.push({vertical,m,b:offset,lo:b[j],hi:b[j+2],box:b,pixels:c.pixels,samples:len,matched:n,error,points});
    }return out;
  }
  function pairDarkFit(gray,w,h,base,box,vertical,side,exteriorSide,log){
    const j=vertical?1:0,k=1-j,lo=box[j]+4,hi=box[j+2]-4,center=box[k+side*2],dir=side?1:-1,mid=(lo+hi)/2;let best=null;
    const val=(t,p)=>{const x=vertical?p:t,y=vertical?t:p;return x>=0&&x<w&&y>=0&&y<h?gray[y*w+x]:Infinity;};
    for(let sm=-10;sm<=10;sm++)for(let off=-2;off<=9;off++){
      const m=sm*.003,b=center+dir*off-m*mid;let dark=0,inner=0,outer=0,opposite=0,gap=0,maxGap=0,loss=0;
      for(let t=lo;t<=hi;t++){
        const p=Math.round(m*t+b),yes=val(t,p)<=base+32;dark+=yes;gap=yes?0:gap+1;maxGap=Math.max(maxGap,gap);
        let inside=0,outside=0,quiet=0;for(let d=2;d<=6;d++){inside=Math.max(inside,val(t,p-dir*d));outside=Math.max(outside,val(t,p+dir*d));quiet+=val(t,p+dir*d)<=base+32;}
        inner+=inside>base+45;outer+=quiet>=4;opposite+=outside>base+45;
        const inward=center+(side?-1:1);loss+=side?(m*t+b<inward):(m*t+b>inward);
      }
      const n=hi-lo+1;
      if(dark/n<.97||maxGap>3||inner/n<.42||loss/n>.05||(exteriorSide?outer/n<.90:opposite/n<.34))continue;
      const score=dark/n+inner/n*.45+(exteriorSide?outer:opposite)/n*.10-.025*Math.abs(off)-.05*Math.abs(m);
      if(!best||score>best.score)best={vertical,side,m,b,lo,hi,offset:off,samples:n,dark,inner,outer,opposite,maxGap,loss,exteriorSide,score};
    }
    log?.('pair dark '+vertical+side+' '+JSON.stringify(best));return best;
  }
  function pairPalePath(r,gray,w,h,base){
    const points=[];let matched=0,maxGap=0,gap=0;
    for(let t=r.lo;t<=r.hi;t++){
      const p=Math.round(r.m*t+r.b),hits=[];
      for(let q=p-3;q<=p+3;q++){
        const i=r.vertical?t*w+q:q*w+t;if(i<0||i>=w*h)continue;
        const step=r.vertical?1:w;let a=Infinity,b=Infinity;for(let d=1;d<=3;d++){a=Math.min(a,gray[i-d*step]);b=Math.min(b,gray[i+d*step]);}
        if(gray[i]>base+40&&a<base+35&&b<base+35&&gray[i]-Math.max(a,b)>25)hits.push(q);
      }
      if(hits.length){matched++;gap=0;points.push([t,Math.min(...hits)-1,Math.max(...hits)+2]);}else{gap++;maxGap=Math.max(maxGap,gap);points.push([t,p-2,p+3]);}
    }
    return matched/points.length>=.95&&maxGap<=3?{points,matched,samples:points.length,maxGap}:null;
  }
  function pairCorner(rgba,gray,w,h,base,rims,log){
    const [top,bottom,left,right]=rims,at=(r,t)=>r.m*t+r.b;
    const x0=bottom.hi+3,y0=right.hi+1,x1=Math.ceil(at(right,y0))+7,y1=Math.ceil(at(bottom,x0))+7;
    if(x1-x0<15||y1-y0<15||x1-x0>w*.18||y1-y0>h*.12||x0<0||y0<0||x1>=w||y1>=h)return null;
    // The missing corner must contain a warm, pale foreground group connected
    // to the artwork outside BOTH open rim ends. Sampling excludes the pale
    // rim itself and does not use caption text or a preselected color sample.
    const tone=new Uint8Array(w*h),grown=new Uint8Array(w*h),root=[x0,y0,x1,y1];
    for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
      const i=y*w+x,R=rgba[4*i],G=rgba[4*i+1],B=rgba[4*i+2];
      const limit=at(bottom,x0)+(x-x0)*(y0-at(bottom,x0))/(at(right,y0)-x0);
      tone[i]=y>=limit-3&&R>base+75&&G>=R*.52&&B>=R*.23&&R>B+12;
    }
    const radius=Math.max(3,Math.round(Math.min(x1-x0,y1-y0)*.17));for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)if(tone[y*w+x])for(let dy=-radius;dy<=radius;dy++)for(let dx=-radius;dx<=radius;dx++)if(dx*dx+dy*dy<=radius*radius&&x+dx>=x0&&x+dx<=x1&&y+dy>=y0&&y+dy<=y1)grown[(y+dy)*w+x+dx]=1;
    const cc=pairComponents(grown,w,h,root,true);if(!cc)return null;
    const candidates=cc.parts.filter(c=>c.box[0]<=x0+4&&c.box[1]<=y0+4&&c.box[2]>=x1-3&&c.box[3]>=y1-3);if(candidates.length!==1){log?.('pair corner components '+JSON.stringify(cc.parts));return null;}
    const id=candidates[0].id,anchors=[],notch=[];let runMin=Infinity,retained=0;
    for(let x=x0;x<=Math.floor(at(right,y0))+2;x++){
      const ys=[];for(let y=y0;y<=y1;y++)if(tone[y*w+x]&&cc.labels[y*w+x]===id)ys.push(y);
      if(ys.length){const y=Math.min(...ys);anchors.push([x,y]);runMin=Math.min(runMin,y-2);retained+=ys.length;}
      notch.push([x,Math.min(Math.floor(at(bottom,x))+2,Number.isFinite(runMin)?runMin:Math.floor(at(bottom,x))+2)]);
    }
    if(anchors.length/notch.length<.60||retained<100||anchors.at(-1)[1]>y0+8)return null;
    // Interior bright lettering/skin not linked to the corner cannot drive it.
    // Verify a majority of the upper side is darker/warmer than the retained
    // connected highlights. Gaps retain the last evidenced hair envelope.
    let contrast=0;for(const [x,y]of anchors){const i=y*w+x,j=Math.max(y0,y-5)*w+x;contrast+=gray[i]-gray[j]>15||rgba[4*i+1]/Math.max(1,rgba[4*i])-rgba[4*j+1]/Math.max(1,rgba[4*j])>.10;}
    if(contrast/anchors.length<.60)return null;
    const minima=[];for(const [x,y]of notch)if(!minima.length||y<minima.at(-1)[1])minima.push([x,y]);
    for(let k=0;k+1<minima.length;k++){
      const [x,y]=minima[k],[X,Y]=minima[k+1];if(X-x>Math.max(18,notch.length*.25))return null;
      for(let xx=x+1;xx<X;xx++)notch[xx-x0][1]=Math.min(notch[xx-x0][1],Math.floor(y+(xx-x)*(Y-y)/(X-x)));
    }
    log?.('pair corner '+JSON.stringify({root,anchors,notch,retained,contrast}));return {root,anchors,notch,retained,contrast,radius};
  }
  function pairRaster(model,w,h){
    const labels=new Uint8Array(w*h),counts=[0,0,0],{outer,dark,rims,paths,corner}=model;
    const at=(r,t)=>r.m*t+r.b;
    const bound=(path,t,side,r)=>{const k=Math.round(t)-r.lo;return k>=0&&k<path.points.length?path.points[k][side?2:1]:at(r,t)+(side?2:-2);};
    const notchMap=new Map(corner.notch);const [T,B,L,R]=rims;
    for(let y=outer[1];y<outer[3];y++)for(let x=outer[0];x<outer[2];x++){
      const xx=x+.5,yy=y+.5;
      let id=3;
      if(yy>=at(dark[0],xx)&&yy<at(dark[1],xx)&&xx>=at(dark[2],yy)&&xx<at(dark[3],yy))id=1;
      else if(yy>=bound(paths[0],x,0,T)&&yy<bound(paths[1],x,1,B)&&xx>=bound(paths[2],y,0,L)&&xx<bound(paths[3],y,1,R)){
        const notch=notchMap.get(x);if(notch===undefined||yy<notch)id=2;
      }
      labels[y*w+x]=id;counts[id-1]++;
    }
    return {labels,counts};
  }
  function pairOuter(gray,w,h,base,parent,log){
    const expected=[Math.round(parent.x*w),Math.round(parent.y*h),Math.round((parent.x+parent.w)*w),Math.round((parent.y+parent.h)*h)];
    // Derive the matte box from observed content close to the proposed edges.
    // This bounded expansion is checked on all four sides and cannot infer a
    // missing exterior border from the existence of the legacy rectangle.
    const box=[Math.max(4,expected[0]-7),Math.max(4,expected[1]-7),Math.min(w-4,expected[2]+7),Math.min(h-4,expected[3]+7)];
    let x0=w,y0=h,x1=0,y1=0,pixels=0;
    for(let y=box[1];y<=box[3];y++)for(let x=box[0];x<=box[2];x++)if(gray[y*w+x]>base+28){pixels++;x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}
    if(!pixels||x0<box[0]+1||y0<box[1]+1||x1>box[2]-1||y1>box[3]-1)return null;
    const outer=[x0-2,y0-2,x1+3,y1+3],rims=[];
    for(let side=0;side<4;side++){
      const v=side>=2,dir=side%2?1:-1,p=outer[(side%2)*2+(v?0:1)],lo=outer[v?1:0]+4,hi=outer[v?3:2]-5;let quiet=0,adjacent=0;
      for(let t=lo;t<=hi;t++){
        const val=(d)=>gray[v?t*w+Math.round(p+d):Math.round(p+d)*w+t];
        quiet+=Math.min(val(0),val(dir))<=base+32;
        adjacent+=Math.max(...[3,4,5,6,7,8].map(d=>val(-dir*d)))>base+40;
      }
      rims.push({vertical:v,side:side%2,lo,hi,samples:hi-lo+1,quiet,adjacent});
    }
    log?.('pair outer '+JSON.stringify({outer,rims}));if(rims.some(r=>r.quiet/r.samples<.97))return null;
    return {outer,outerEvidence:rims,exposedPixels:pixels};
  }
  function pairMaskedDivider(rgba,gray,w,h,labels,id,log){
    const b=[w,h,0,0];let count=0;for(let i=0;i<labels.length;i++)if(labels[i]===id){const x=i%w,y=i/w|0;count++;b[0]=Math.min(b[0],x);b[1]=Math.min(b[1],y);b[2]=Math.max(b[2],x);b[3]=Math.max(b[3],y);}if(!count)return true;
    for(const v of [false,true]){
      const j=v?0:1,k=1-j,lo=b[j]+8,hi=b[j+2]-8,index=(t,p)=>v?t*w+p:p*w+t;
      for(let p=lo;p<=hi;p++){
        const spans=[];let start=null;
        for(let t=b[k];t<=b[k+2]+1;t++){
          const yes=t<=b[k+2]&&labels[index(t,p)]===id;
          if(yes&&start===null)start=t;
          if(!yes&&start!==null){if(t-start>=Math.max(60,(b[k+2]-b[k])*.30))spans.push([start,t-1]);start=null;}
        }
        for(const [a,z]of spans){
          let n=0,matched=0,first=0,last=0,neutral=0,sum=0,square=0;
          for(let t=a+3;t<=z-3;t++){
            const i=index(t,p),g=gray[i];n++;
            if(g>65||Math.max(rgba[4*i],rgba[4*i+1],rgba[4*i+2])-Math.min(rgba[4*i],rgba[4*i+1],rgba[4*i+2])>12)continue;
            neutral++;sum+=g;square+=g*g;let l=p,r=p;
            while(l>p-7&&labels[index(t,l-1)]===id&&Math.abs(gray[index(t,l-1)]-g)<=3)l--;
            while(r<p+7&&labels[index(t,r+1)]===id&&Math.abs(gray[index(t,r+1)]-g)<=3)r++;
            if(l===p-7||r===p+7||r-l>7||labels[index(t,l-3)]!==id||labels[index(t,r+3)]!==id)continue;
            let before=0,after=0;for(let d=2;d<=4;d++){before+=gray[index(t,l-d)];after+=gray[index(t,r+d)];}
            if(Math.min(before/3-g,after/3-g)<=14)continue;
            matched++;first+=t<a+(z-a)*.18;last+=t>z-(z-a)*.18;
          }
          if((matched/n>=.70&&Math.min(first,last)/(n*.18)>=.45)||(neutral/n>=.97&&square/neutral-(sum/neutral)**2<=4&&matched/n>=.23&&Math.min(first,last)/(n*.18)>=.10)){log?.('mask divider '+JSON.stringify({v,p,a,z,n,matched,first,last}));return true;}
        }
      }
    }return false;
  }

  function pairSolidInset(gray,w,h,labels,id,base,log){
    const root=[w,h,0,0];let n=0;const mask=new Uint8Array(w*h);
    for(let i=0;i<labels.length;i++)if(labels[i]===id){const x=i%w,y=i/w|0;n++;root[0]=Math.min(root[0],x);root[1]=Math.min(root[1],y);root[2]=Math.max(root[2],x);root[3]=Math.max(root[3],y);mask[i]=gray[i]>base+100;}
    const cc=pairComponents(mask,w,h,root);if(!cc)return true;
    for(const part of cc.parts){
      const [x,y,X,Y]=part.box,bw=X-x+1,bh=Y-y+1,area=bw*bh;
      if(bw<30||bh<30||area<n*.035||area>n*.60||part.pixels/area<.94||x<root[0]+5||X>root[2]-5||y<root[1]+5||Y>root[3]-5)continue;
      let sides=0;
      for(const vertical of [false,true])for(const end of [false,true]){
        const lo=vertical?y:x,hi=vertical?Y:X,p=vertical?(end?X:x):(end?Y:y),dir=end?1:-1;let quiet=0,samples=0;
        for(let t=lo+2;t<=hi-2;t++){samples++;let collar=Infinity;for(let d=1;d<=4;d++){const a=vertical?t*w+p+dir*d:(p+dir*d)*w+t;if(labels[a]===id)collar=Math.min(collar,gray[a]);}quiet+=collar<=base+28;}
        sides+=quiet/samples>=.95;
      }
      if(sides===4){log?.('pair closed bright inset '+JSON.stringify({id,box:part.box,area,pixels:part.pixels}));return true;}
    }return false;
  }

  function pairedCompositeRGBA(rgba,w,h,parent,log){
    if(!pairParent(parent))return [];const input=pairInput(rgba,w,h);if(!input)return [];const {gray,base,color}=input;
    const search=[Math.max(4,Math.round(parent.x*w)-6),Math.max(4,Math.round(parent.y*h)-6),Math.min(w-5,Math.round((parent.x+parent.w)*w)+6),Math.min(h-5,Math.round((parent.y+parent.h)*h)+6)];
    const proposals=[34,49].map(offset=>{const mask=Uint8Array.from(gray,g=>g>base+offset),cc=pairComponents(mask,w,h,search);return cc?cc.parts.filter(c=>{const [x,y,X,Y]=c.box,bw=X-x+1,bh=Y-y+1;return bw>=w*.15&&bw<=w*.40&&bh>=h*.18&&bh<=h*.42&&x<=parent.x*w+8&&y<=parent.y*h+h*.03&&Y<search[3]-h*.10&&c.pixels/(bw*bh)>.40;}):[];});
    log?.('pair cell proposals '+JSON.stringify(proposals));if(proposals.some(a=>a.length!==1)||proposals[0][0].box.some((n,i)=>Math.abs(n-proposals[1][0].box[i])>3))return [];
    const cell=proposals[0][0],dark=[];for(const v of [false,true])for(const s of [0,1]){const r=pairDarkFit(gray,w,h,base,cell.box,v,s,!s,log);if(r)dark.push(r);}if(dark.length!==4)return [];
    const hs=pairRidges(gray,w,h,search,base,false),vs=pairRidges(gray,w,h,search,base,true),groups=[];
    log?.('pair pale ridges '+JSON.stringify({hs,vs}));
    const at=(r,t)=>r.m*t+r.b;
    for(const t of hs)for(const l of vs)for(const r of vs)for(const b of hs){
      const width=r.b-l.b,height=b.b-t.b;if(l===r||t===b||!range(width/w,.12,.35)||!range(height/h,.16,.40)||width/height>.90||width/height<.25)continue;
      if(Math.abs(t.lo-at(l,t.b))>7||Math.abs(t.hi-at(r,t.b))>7||Math.abs(l.lo-at(t,l.b))>7||Math.abs(r.lo-at(t,r.b))>7||Math.abs(b.lo-at(l,b.b))>7||Math.abs(l.hi-at(b,l.b))>7)continue;
      if(!range((r.hi-r.lo)/height,.55,.93)||!range((b.hi-b.lo)/width,.30,.85))continue;
      const gap=at(l,l.lo)-at(dark[3],l.lo);if(!range(gap,3,w*.065)||Math.abs(t.b-dark[0].b)>h*.06||Math.abs(b.b-dark[1].b)>h*.06)continue;
      groups.push([t,b,l,r]);
    }
    if(groups.length!==1){log?.('pair pale groups '+groups.length);return [];}const rims=groups[0],paths=rims.map(r=>pairPalePath(r,gray,w,h,base));if(paths.some(p=>!p))return [];
    const corner=pairCorner(rgba,gray,w,h,base,rims,log);if(!corner)return [];
    const outer=pairOuter(gray,w,h,base,parent,log);if(!outer)return [];
    const model={outer:outer.outer,dark,rims,paths,corner};const raster=pairRaster(model,w,h),contours=[1,2,3].map(id=>trace(raster.labels,w,h,id));
    if(contours.some(c=>!c||c.length<1||c.length>3||c.reduce((n,q)=>n+q.length,0)>1800)||raster.counts.some((n,i)=>!range(n/(w*h),[.04,.03,.15][i],[.17,.14,.40][i])))return [];
    // Full-span, interrupted neutral ink and nested rectangular rims are
    // rejection evidence. They never create a panel from interior textures.
    const innerBox=[Math.ceil(rims[2].b)+5,Math.ceil(rims[0].b)+5,Math.floor(rims[3].b)-5,rims[3].hi-5];
    for(const b of [cell.box,innerBox])if(tierInterruptedDivider(rgba,gray,w,h,b,base)||tierUniformCoreDivider(gray,w,h,b,base)||uniformInset(rgba,gray,w,h,b)){log?.('pair small-cell divider/inset '+b);return [];}
    if(pairMaskedDivider(rgba,gray,w,h,raster.labels,3,log)){log?.('pair real-boundary divider');return [];}
    if([1,2,3].some(id=>pairSolidInset(gray,w,h,raster.labels,id,base,log)))return [];
    const stats=[1,2,3].map(id=>{let n=0,sum=0,squares=0,dark=0,light=0;for(let i=0;i<raster.labels.length;i++)if(raster.labels[i]===id){const g=gray[i];n++;sum+=g;squares+=g*g;dark+=g<45;light+=g>100;}return {pixels:n,mean:sum/n,variance:squares/n-(sum/n)**2,dark,light};});
    if(stats.some(s=>s.variance<600||s.mean<10||s.mean>220||s.dark/s.pixels<.06||s.light/s.pixels<.05)){log?.('pair texture withheld '+JSON.stringify(stats));return [];}
    const out=contours.map((rings,index)=>{
      const b=bounds(rings.flat());const proof={version:10,method:PAIR_METHOD,analysisWidth:w,analysisHeight:h,index,parent:{...parent},color,base,edgeSamples:input.edgeSamples,edgeMatched:input.edgeMatched,proposals:proposals.map((p,i)=>({...p[0],threshold:base+[34,49][i]})),model,outerEvidence:outer.outerEvidence,pixelCounts:raster.counts,stats,pixelContours:rings,uniformInkVetoPassed:true,nestedInsetVetoPassed:true};
      return {x:b[0]/w,y:b[1]/h,w:(b[2]-b[0])/w,h:(b[3]-b[1])/h,_contours:rings.map(q=>q.map(([x,y])=>({x:x/w,y:y/h}))),_identitySource:'inset-neighbor-frame',_geometryOwner:'inset-neighbor-contours',_geometryType:'inset-guided-corridor-cell',_insetNeighborProof:proof};
    });
    log?.('pair candidates '+JSON.stringify(out.map(p=>({box:[p.x,p.y,p.w,p.h],valid:validPairPanel(p)}))));return out.every(validPairPanel)?out:[];
  }
  function validPairPanel(p){try{
    const pr=p?._insetNeighborProof,w=pr?.analysisWidth,h=pr?.analysisHeight,m=pr?.model;
    if(p?._identitySource!=='inset-neighbor-frame'||(p._geometryOwner!==undefined&&p._geometryOwner!=='inset-neighbor-contours')||(p._geometryType!==undefined&&p._geometryType!=='inset-guided-corridor-cell')||pr.version!==10||pr.method!==PAIR_METHOD||!Number.isInteger(w)||!Number.isInteger(h)||!range(w,250,900)||!range(h,350,900)||!Number.isInteger(pr.index)||!range(pr.index,0,2)||!pairParent(pr.parent)||!m)return false;
    if(!Array.isArray(pr.color)||pr.color.length!==3||pr.color.some(v=>!Number.isInteger(v)||!range(v,0,255))||pr.base!==pr.color[0]*.299+pr.color[1]*.587+pr.color[2]*.114||!range(pr.base,0,25)||pr.edgeSamples!==2*(Math.ceil(w/2)+Math.ceil(h/2))||!Number.isInteger(pr.edgeMatched)||!range(pr.edgeMatched/pr.edgeSamples,.95,1)||pr.uniformInkVetoPassed!==true||pr.nestedInsetVetoPassed!==true)return false;
    if(!Array.isArray(m.outer)||m.outer.length!==4||m.outer.some(v=>!Number.isInteger(v))||m.outer[0]<1||m.outer[1]<1||m.outer[2]>=w||m.outer[3]>=h||m.outer[0]>=m.outer[2]||m.outer[1]>=m.outer[3])return false;
    if(!Array.isArray(m.dark)||m.dark.length!==4||m.dark.some((r,i)=>r.vertical!==(i>=2)||r.side!==i%2||!range(r.m,-.031,.031)||!finite(r.b)||!Number.isInteger(r.lo)||!Number.isInteger(r.hi)||r.samples!==r.hi-r.lo+1||r.samples<50||!Number.isInteger(r.dark)||!range(r.dark/r.samples,.97,1)||!Number.isInteger(r.inner)||!range(r.inner/r.samples,.42,1)||!range(r.maxGap,0,3)||!range(r.loss/r.samples,0,.05)))return false;
    if(!Array.isArray(m.rims)||m.rims.length!==4||m.rims.some((r,i)=>r.vertical!==(i>=2)||!range(r.m,-.04,.04)||!finite(r.b)||!Number.isInteger(r.lo)||!Number.isInteger(r.hi)||r.samples!==r.hi-r.lo+1||r.samples<30||!Number.isInteger(r.matched)||!range(r.matched/r.samples,.95,1)||!range(r.error,0,2.5)))return false;
    if(!Array.isArray(m.paths)||m.paths.length!==4||m.paths.some((r,i)=>r.samples!==m.rims[i].samples||r.points.length!==r.samples||!Number.isInteger(r.matched)||!range(r.matched/r.samples,.95,1)||!range(r.maxGap,0,3)||r.points.some((p,j)=>p.length!==3||p.some(v=>!Number.isInteger(v))||p[0]!==m.rims[i].lo+j||p[1]>=p[2]||Math.abs((p[1]+p[2]-1)/2-(m.rims[i].m*p[0]+m.rims[i].b))>5)))return false;
    const c=m.corner;if(!c||c.radius!==Math.max(3,Math.round(Math.min(c.root[2]-c.root[0],c.root[3]-c.root[1])*.17))||!Array.isArray(c.notch)||c.notch.length<15||c.notch.length>w*.18||!Array.isArray(c.anchors)||c.anchors.length/c.notch.length<.60||!Number.isInteger(c.retained)||c.retained<100||!Number.isInteger(c.contrast)||!range(c.contrast/c.anchors.length,.60,1)||c.notch.some((p,i)=>p.length!==2||p.some(v=>!Number.isInteger(v))||p[0]!==c.root[0]+i||p[1]<c.root[1]-2||p[1]>c.root[3]||i&&p[1]>c.notch[i-1][1]+1))return false;
    if(!Array.isArray(pr.outerEvidence)||pr.outerEvidence.length!==4||pr.outerEvidence.some(r=>r.samples!==r.hi-r.lo+1||!Number.isInteger(r.quiet)||!range(r.quiet/r.samples,.97,1)))return false;
    if(!Array.isArray(pr.proposals)||pr.proposals.length!==2||pr.proposals.some((p,i)=>p.threshold!==pr.base+[34,49][i]||!Array.isArray(p.box)||p.box.length!==4||p.box.some(v=>!Number.isInteger(v))||!Number.isInteger(p.pixels)||p.pixels<1000)||pr.proposals[0].box.some((n,i)=>Math.abs(n-pr.proposals[1].box[i])>3))return false;
    const [T,B,L,R]=m.rims,at=(r,t)=>r.m*t+r.b,wide=R.b-L.b,tall=B.b-T.b;
    if(!range(wide/w,.12,.35)||!range(tall/h,.16,.40)||!range(wide/tall,.25,.90)||!range((R.hi-R.lo)/tall,.55,.93)||!range((B.hi-B.lo)/wide,.30,.85))return false;
    if(Math.abs(T.lo-at(L,T.b))>7||Math.abs(T.hi-at(R,T.b))>7||Math.abs(L.lo-at(T,L.b))>7||Math.abs(R.lo-at(T,R.b))>7||Math.abs(B.lo-at(L,B.b))>7||Math.abs(L.hi-at(B,L.b))>7||!range(at(L,L.lo)-at(m.dark[3],L.lo),3,w*.065)||Math.abs(T.b-m.dark[0].b)>h*.06||Math.abs(B.b-m.dark[1].b)>h*.06)return false;
    const root=[B.hi+3,R.hi+1,Math.ceil(at(R,R.hi+1))+7,Math.ceil(at(B,B.hi+3))+7];
    if(JSON.stringify(c.root)!==JSON.stringify(root)||c.notch.length!==Math.floor(at(R,root[1]))+3-root[0]||c.anchors.some((p,i)=>p.length!==2||p.some(v=>!Number.isInteger(v))||p[0]<root[0]||p[0]>root[2]||p[1]<root[1]||p[1]>root[3]||i&&p[0]<=c.anchors[i-1][0]))return false;
    let low=Infinity;const curve=[];const raw=new Map(c.anchors);
    for(let x=root[0];x<=Math.floor(at(R,root[1]))+2;x++){if(raw.has(x))low=Math.min(low,raw.get(x)-2);curve.push([x,Math.min(Math.floor(at(B,x))+2,finite(low)?low:Math.floor(at(B,x))+2)]);}
    const minima=[];for(const [x,y]of curve)if(!minima.length||y<minima.at(-1)[1])minima.push([x,y]);
    for(let k=0;k+1<minima.length;k++){const [x,y]=minima[k],[X,Y]=minima[k+1];if(X-x>Math.max(18,curve.length*.25))return false;for(let xx=x+1;xx<X;xx++)curve[xx-root[0]][1]=Math.min(curve[xx-root[0]][1],Math.floor(y+(xx-x)*(Y-y)/(X-x)));}
    if(JSON.stringify(curve)!==JSON.stringify(c.notch))return false;
    const e=[Math.round(pr.parent.x*w),Math.round(pr.parent.y*h),Math.round((pr.parent.x+pr.parent.w)*w),Math.round((pr.parent.y+pr.parent.h)*h)];
    if(m.outer.some((v,i)=>Math.abs(v-e[i])>9)||m.outer[0]>pr.proposals[0].box[0]||m.outer[1]>pr.proposals[0].box[1]||m.outer[2]<R.b+20||m.outer[3]<B.b+40)return false;
    for(let i=0;i<4;i++){
      const q=pr.outerEvidence[i],v=i>=2,lo=m.outer[v?1:0]+4,hi=m.outer[v?3:2]-5;
      if(q.vertical!==v||q.side!==i%2||q.lo!==lo||q.hi!==hi||q.samples!==hi-lo+1||!Number.isInteger(q.adjacent)||!range(q.adjacent,0,q.samples))return false;
      const d=m.dark[i],j=v?1:0,k=1-j,box=pr.proposals[0].box,dir=i%2?1:-1;
      if(d.exteriorSide!==!(i%2)||d.lo!==box[j]+4||d.hi!==box[j+2]-4||!Number.isInteger(d.offset)||!range(d.offset,-2,9)||Math.abs(d.b-(box[k+(i%2)*2]+dir*d.offset-d.m*(d.lo+d.hi)/2))>1e-8||!Number.isInteger(d.maxGap)||!Number.isInteger(d.loss)||!Number.isInteger(d.inner)||!Number.isInteger(d.outer)||!Number.isInteger(d.opposite)||(d.exteriorSide?!range(d.outer/d.samples,.90,1):!range(d.opposite/d.samples,.34,1)))return false;
    }
    if(!Array.isArray(pr.stats)||pr.stats.length!==3||pr.stats.some((s,i)=>!Number.isInteger(s.pixels)||s.pixels!==pr.pixelCounts[i]||!range(s.mean,10,220)||!range(s.variance,600,16257)||!Number.isInteger(s.dark)||!range(s.dark/s.pixels,.06,1)||!Number.isInteger(s.light)||!range(s.light/s.pixels,.05,1)||s.dark+s.light>s.pixels))return false;
    const r=pairRaster(m,w,h),rings=trace(r.labels,w,h,pr.index+1);if(!rings||rings.length<1||rings.length>3||JSON.stringify(pr.pixelCounts)!==JSON.stringify(r.counts)||JSON.stringify(rings)!==JSON.stringify(pr.pixelContours)||r.counts.some((n,i)=>!range(n/(w*h),[.04,.03,.15][i],[.17,.14,.40][i])))return false;
    if(JSON.stringify(p._contours)!==JSON.stringify(rings.map(q=>q.map(([x,y])=>({x:x/w,y:y/h})))))return false;
    const b=bounds(rings.flat());return ['x','y','w','h'].every(k=>finite(p[k]))&&Math.max(Math.abs(p.x-b[0]/w),Math.abs(p.y-b[1]/h),Math.abs(p.w-(b[2]-b[0])/w),Math.abs(p.h-(b[3]-b[1])/h))<1e-10;
  }catch(_){return false;}}
  function refineCompositePairImage(img,identities,baseline,log){
    if(!img||!finite(img.width)||!finite(img.height)||img.width<1||img.height<1||!Array.isArray(identities)||!Array.isArray(baseline))return [];
    const parents=baseline.filter(pairParent);if(parents.length!==1)return [];const parent=parents[0];
    if(identities.some(p=>p._identitySource&&Math.max(0,Math.min(parent.x+parent.w,p.x+p.w)-Math.max(parent.x,p.x))*Math.max(0,Math.min(parent.y+parent.h,p.y+p.h)-Math.max(parent.y,p.y))>.00001))return [];
    try{const s=Math.min(1,900/Math.max(img.width,img.height)),w=Math.round(img.width*s),h=Math.round(img.height*s),c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d',{willReadFrequently:true});if(!ctx)return [];ctx.drawImage(img,0,0,w,h);
    return pairedCompositeRGBA(ctx.getImageData(0,0,w,h).data,w,h,parent,log);}catch(_){return [];}
  }

  return {pairedCompositeRGBA,refineCompositePairImage,wideResidualRGBA,supplementWideResidualImage,wideActionRGBA,supplementWideActionImage,wideCalloutRGBA,supplementWideCalloutImage,wideInnerRGBA,supplementWideInnerImage,wideFlankRGBA,supplementWideFlankImage,analyzeRGBA,supplementImage,validPanel,terminalBandRGBA,supplementTerminalBandImage,tierRGBA,supplementTierImage,wideTerminalRGBA,supplementWideTerminalImage};
})();
