/* Nth Shelf Frame Test 16 — isolated edge cells with one sloping rail.
 * This is a bounded supplement for an otherwise empty stable map. Two fixed
 * exterior-matte tolerances must independently enclose the same tall cell.
 * A tap never supplies geometry. The complete pixel hull is retained, while
 * four measured sides, an exterior collar, foreground ownership and rejection
 * only divider/inset checks veto uncertain unions. Existing routes are not
 * weakened. Deliberately not a general solution for overlapping montages.
 */
const PanelEdgeCells = (() => {
  'use strict';
  const METHOD='dual-matte-enclosed-sloping-edge-cell';
  const finite=Number.isFinite,range=(v,a,b)=>finite(v)&&v>=a&&v<=b;
  const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
  const area=q=>q.reduce((s,a,i)=>{const b=q[(i+1)%q.length];return s+a[0]*b[1]-a[1]*b[0];},0)/2;
  const bounds=q=>[Math.min(...q.map(p=>p[0])),Math.min(...q.map(p=>p[1])),Math.max(...q.map(p=>p[0])),Math.max(...q.map(p=>p[1]))];
  const inside=(q,x,y)=>q.every((a,i)=>cross(a,q[(i+1)%q.length],[x,y])>=-1e-8);
  function hull(points){
    const ps=[...new Map(points.map(p=>[p.join(','),p])).values()].sort((a,b)=>a[0]-b[0]||a[1]-b[1]);if(ps.length<4)return null;
    const half=ps=>{const a=[];for(const p of ps){while(a.length>1&&cross(a.at(-2),a.at(-1),p)<=0)a.pop();a.push(p);}a.pop();return a;};
    return half(ps).concat(half(ps.slice().reverse()));
  }
  function exterior(rgba,w,h,tolerance){
    const sides=[[],[],[],[]];
    for(let x=0;x<w;x+=2){sides[0].push(x);sides[1].push((h-1)*w+x);}for(let y=0;y<h;y+=2){sides[2].push(y*w);sides[3].push(y*w+w-1);}
    const edge=sides.flat(),color=[0,1,2].map(c=>{const v=edge.map(i=>rgba[i*4+c]).sort((a,b)=>a-b);return v[v.length>>1];});
    const match=(i,d)=>[0,1,2].every(c=>Math.abs(rgba[i*4+c]-color[c])<=d);
    const fractions=sides.map(s=>s.filter(i=>match(i,6)).length/s.length),matched=edge.filter(i=>match(i,6)).length;
    if(color[0]*.299+color[1]*.587+color[2]*.114>25||matched/edge.length<.93||Math.min(...fractions)<.80)return null;
    const raw=new Uint8Array(w*h),bg=new Uint8Array(w*h),queue=new Int32Array(w*h);
    for(let i=0;i<raw.length;i++)raw[i]=match(i,tolerance);
    let head=0,n=0;const offer=i=>{if(raw[i]&&!bg[i]){bg[i]=1;queue[n++]=i;}};
    for(let x=0;x<w;x++){offer(x);offer((h-1)*w+x);}for(let y=0;y<h;y++){offer(y*w);offer(y*w+w-1);}
    while(head<n){const i=queue[head++],x=i%w,y=i/w|0;if(x)offer(i-1);if(x+1<w)offer(i+1);if(y)offer(i-w);if(y+1<h)offer(i+w);}
    return n>w*h*.025?{bg,color,tolerance,edgeSamples:edge.length,edgeMatched:matched,edgeFractions:fractions,exteriorPixels:n}:null;
  }
  function components(bg,w,h){
    const labels=new Int32Array(w*h),queue=new Int32Array(w*h),all=[];let id=0;
    for(let seed=0;seed<labels.length;seed++)if(!bg[seed]&&!labels[seed]){
      if(++id>16000)return null;let head=0,n=1,x0=w,y0=h,x1=0,y1=0;queue[0]=seed;labels[seed]=id;
      const offer=i=>{if(!labels[i]&&!bg[i]){labels[i]=id;queue[n++]=i;}};
      while(head<n){const i=queue[head++],x=i%w,y=i/w|0;x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);if(x)offer(i-1);if(x+1<w)offer(i+1);if(y)offer(i-w);if(y+1<h)offer(i+w);}
      const c={id,pixels:n,box:[x0,y0,x1,y1]};all.push(c);
      if(n<w*h*.04||n>w*h*.20||x1-x0<w*.12||x1-x0>w*.34||y1-y0<h*.25||y1-y0>h*.62||(y1-y0)/(x1-x0)<2)continue;
      const min=new Int32Array(h).fill(w),max=new Int32Array(h).fill(-1);
      for(let k=0;k<n;k++){const i=queue[k],x=i%w,y=i/w|0;min[y]=Math.min(min[y],x);max[y]=Math.max(max[y],x);}
      const pts=[];for(let y=y0;y<=y1;y++)if(max[y]>=0)pts.push([min[y],y],[max[y],y]);const core=hull(pts);
      if(core)c.q=hull(core.flatMap(p=>[-.5,.5].flatMap(x=>[-.5,.5].map(y=>[p[0]+x,p[1]+y]))));
    }return {labels,all};
  }
  function section(q,t,vertical){
    const values=[];for(let i=0;i<q.length;i++){const a=q[i],b=q[(i+1)%q.length],j=vertical?0:1,k=1-j;if(t>=Math.min(a[j],b[j])&&t<Math.max(a[j],b[j]))values.push(a[k]+(t-a[j])*(b[k]-a[k])/(b[j]-a[j]));}
    return values.length===2?values.sort((a,b)=>a-b):null;
  }
  function fit(samples){
    const n=samples.length;if(n<50)return null;let sx=0,sy=0,sxx=0,sxy=0;
    for(const [x,y] of samples){sx+=x;sy+=y;sxx+=x*x;sxy+=x*y;}
    const den=n*sxx-sx*sx;if(den<=0)return null;const slope=(n*sxy-sx*sy)/den,offset=(sy-slope*sx)/n;
    let squared=0,maxError=0;for(const [x,y] of samples){const e=Math.abs(y-offset-slope*x);squared+=e*e;maxError=Math.max(maxError,e);}
    return {samples:n,slope,offset,rms:Math.sqrt(squared/n),maxError};
  }
  function shape(q,w,h){
    if(!Array.isArray(q)||q.length<4||q.length>64||q.some(a=>!Array.isArray(a)||a.length!==2||a.some(n=>!finite(n)||Math.abs(n*2-Math.round(n*2))>1e-9))||q.some((a,i)=>cross(a,q[(i+1)%q.length],q[(i+2)%q.length])<=0))return null;
    const b=bounds(q),A=area(q),ww=b[2]-b[0],hh=b[3]-b[1];
    if(b[0]<1||b[1]<1||b[2]>w-1||b[3]>h-1||!range(ww/w,.12,.34)||!range(hh/h,.25,.62)||!range(hh/ww,2,5)||!range(A/(w*h),.04,.20)||A/(ww*hh)<.88)return null;
    if(Math.min(b[0],w-b[2])>w*.07||Math.min(b[1],h-b[3])>h*.07)return null;
    const fitSides=[];
    for(const vertical of [true,false]){
      const j=vertical?0:1;
      let lo=Math.ceil(b[j]+(b[j+2]-b[j])*.06),hi=Math.floor(b[j+2]-(b[j+2]-b[j])*.06);
      if(!vertical){const [top,bottom]=fitSides;lo=Math.max(lo,Math.ceil(Math.max(top.offset+top.slope*b[0],top.offset+top.slope*b[2]))+4);hi=Math.min(hi,Math.floor(Math.min(bottom.offset+bottom.slope*b[0],bottom.offset+bottom.slope*b[2]))-4);}
      const samples=[[],[]];
      for(let t=lo;t<=hi;t++){const v=section(q,t,vertical);if(!v)return null;for(let k=0;k<2;k++)samples[k].push([t,v[k]]);}
      for(const v of samples){const f=fit(v);if(!f||f.rms>1.2||f.maxError>3)return null;fitSides.push(f);}
    }
    const slopes=fitSides.map(s=>Math.abs(s.slope)),tilted=slopes.slice(0,2).map((s,i)=>range(s,.12,.55)?i:-1).filter(i=>i>=0);
    if(tilted.length!==1||slopes[1-tilted[0]]>.045||slopes[2]>.045||slopes[3]>.045)return null;
    return {bounds:b,area:A,fitSides,tiltedSide:tilted[0]};
  }
  function rim(q,bg,w,h){
    const sides=Array.from({length:4},()=>({samples:0,matched:0,maxGap:0}));let total=0,matched=0;
    for(let i=0;i<q.length;i++){
      const a=q[i],b=q[(i+1)%q.length],dx=b[0]-a[0],dy=b[1]-a[1],L=Math.hypot(dx,dy),nx=dy/L,ny=-dx/L;
      const side=Math.abs(nx)>Math.abs(ny)?(nx<0?2:3):(ny<0?0:1),r=sides[side];let gap=0;
      for(let t=1;t<L-1;t++){
        let yes=false;for(const d of [.5,1,1.5,2,3]){const x=Math.round(a[0]+dx*t/L+nx*d),y=Math.round(a[1]+dy*t/L+ny*d);if(x>=0&&x<w&&y>=0&&y<h&&bg[y*w+x])yes=true;}
        total++;matched+=yes;r.samples++;r.matched+=yes;gap=yes?0:gap+1;r.maxGap=Math.max(r.maxGap,gap);
      }
    }
    return sides.every(s=>s.samples>=50&&s.matched/s.samples>=.95&&s.maxGap<=Math.min(6,s.samples*.055))&&matched/total>=.98?{sides,total,matched}:null;
  }
  function owned(c,cc,w,h){
    const b=bounds(c.q),A=area(c.q),found=new Map(),sizes=new Map(cc.all.map(p=>[p.id,p.pixels]));let retained=0;
    for(let y=Math.ceil(b[1]);y<=Math.floor(b[3]);y++)for(let x=Math.ceil(b[0]);x<=Math.floor(b[2]);x++)if(inside(c.q,x,y)){
      const id=cc.labels[y*w+x];retained+=id===c.id;if(id&&id!==c.id)found.set(id,(found.get(id)||0)+1);
    }
    const detached=[];let foreign=0;
    for(const [id,n] of found){if(n===sizes.get(id)&&n<A*.02)detached.push(n);else foreign+=n;}
    if(retained!==c.pixels||foreign||detached.reduce((s,n)=>s+n,0)>A*.02)return null;
    return {retainedPixels:retained,foreignPixels:foreign,detachedPixels:detached};
  }
  function candidates(ex,w,h){
    const cc=components(ex.bg,w,h);if(!cc)return [];const out=[];
    for(const c of cc.all){if(!c.q)continue;const s=shape(c.q,w,h);if(!s||c.pixels/s.area<.94)continue;const r=rim(c.q,ex.bg,w,h),o=owned(c,cc,w,h);if(r&&o)out.push({...c,...s,rim:r,...o});}
    return out;
  }
  function distance(a,b){
    const one=(a,b)=>Math.max(...a.map(p=>Math.min(...b.map((v,i)=>{const e=b[(i+1)%b.length],dx=e[0]-v[0],dy=e[1]-v[1],t=Math.max(0,Math.min(1,((p[0]-v[0])*dx+(p[1]-v[1])*dy)/(dx*dx+dy*dy)));return Math.hypot(p[0]-v[0]-t*dx,p[1]-v[1]-t*dy);})))) ;
    return Math.max(one(a,b),one(b,a));
  }
  // Thin uniform neutral strokes can remain disconnected from exterior matte.
  // This is a veto only. Hatching/long shower rays are not used to create cells.
  function inkDivider(rgba,w,h,q){
    const b=bounds(q),gray=i=>.299*rgba[i*4]+.587*rgba[i*4+1]+.114*rgba[i*4+2];
    for(const vertical of [false,true]){
      const j=vertical?0:1,lo=Math.ceil(b[j]+(b[j+2]-b[j])*.12),hi=Math.floor(b[j+2]-(b[j+2]-b[j])*.12);
      for(let pos=lo;pos<=hi;pos++){
        const sec=section(q,pos,vertical);if(!sec)continue;
        const start=Math.ceil(sec[0])+4,end=Math.floor(sec[1])-4;if(end-start<40)continue;
        const index=(t,p)=>vertical?t*w+p:p*w+t;let n=0,matched=0,first=0,last=0;
        for(let t=start;t<=end;t++){
          n++;const i=index(t,pos),g=gray(i);if(g>65||Math.max(rgba[i*4],rgba[i*4+1],rgba[i*4+2])-Math.min(rgba[i*4],rgba[i*4+1],rgba[i*4+2])>12)continue;
          let l=pos,r=pos;while(l>pos-6&&Math.abs(gray(index(t,l-1))-g)<=3)l--;while(r<pos+6&&Math.abs(gray(index(t,r+1))-g)<=3)r++;
          if(l===pos-6||r===pos+6||r-l>7)continue;
          let before=0,after=0;for(let d=2;d<=4;d++){before+=gray(index(t,l-d));after+=gray(index(t,r+d));}
          if(Math.min(before/3-g,after/3-g)<=14)continue;
          matched++;if(t<start+(end-start)*.18)first++;if(t>end-(end-start)*.18)last++;
        }
        if(matched/n>=.60&&first/(n*.18)>=.45&&last/(n*.18)>=.45)return true;
      }
    }return false;
  }
  function analyzeRGBA(rgba,w,h,log){
    if(!Number.isInteger(w)||!Number.isInteger(h)||!range(w,250,900)||!range(h,350,900)||!(rgba instanceof Uint8Array||rgba instanceof Uint8ClampedArray)||rgba.length!==w*h*4)return [];
    for(let i=3;i<rgba.length;i+=4)if(rgba[i]!==255)return [];
    const ex=[6,8].map(t=>exterior(rgba,w,h,t));if(ex.some(e=>!e))return [];
    const sets=ex.map(e=>candidates(e,w,h));if(sets.some(s=>s.length===0||s.length>4))return [];
    const out=[];
    for(const a of sets[0]){
      const paired=sets[1].filter(b=>distance(a.q,b.q)<=2&&Math.abs(a.area-b.area)/a.area<=.01&&a.tiltedSide===b.tiltedSide);
      if(paired.length!==1)continue;const b=paired[0];
      // A second tolerance may remove noise, never add foreground: retain the
      // wider strict-tolerance outline and prove its complete collar again.
      const secondRim=rim(a.q,ex[1].bg,w,h);if(!secondRim)continue;
      const box=[Math.ceil(a.bounds[0])+4,Math.ceil(a.bounds[1])+4,Math.floor(a.bounds[2])-4,Math.floor(a.bounds[3])-4];
      if(inkDivider(rgba,w,h,a.q)||typeof PanelClosedFrames==='undefined'||PanelClosedFrames.analyzeRGBA(rgba,w,h,null,{gradientOnly:true,localMatteInset:true,vetoCandidates:[{box}]}).length!==1){log?.('sloping edge cell withheld: divider/inset');continue;}
      const record=(c,e)=>({q:c.q,pixels:c.pixels,area:c.area,bounds:c.bounds,fitSides:c.fitSides,tiltedSide:c.tiltedSide,rim:c.rim,retainedPixels:c.retainedPixels,foreignPixels:c.foreignPixels,detachedPixels:c.detachedPixels,
        tolerance:e.tolerance,color:e.color,edgeSamples:e.edgeSamples,edgeMatched:e.edgeMatched,edgeFractions:e.edgeFractions,exteriorPixels:e.exteriorPixels});
      const pr={version:1,method:METHOD,analysisWidth:w,analysisHeight:h,cells:[record(a,ex[0]),record(b,ex[1])],distance:distance(a.q,b.q),secondRim,dividerVetoPassed:true,insetVetoPassed:true,uniformInkVetoPassed:true};
      const panel={x:a.bounds[0]/w,y:a.bounds[1]/h,w:(a.bounds[2]-a.bounds[0])/w,h:(a.bounds[3]-a.bounds[1])/h,_outline:a.q.map(p=>({x:p[0]/w,y:p[1]/h})),_identitySource:'sloping-edge-frame',_geometryOwner:'sloping-edge-outline',_geometryType:'dual-matte-enclosed-edge-cell',_edgeCellProof:pr};
      if(validPanel(panel))out.push(panel);else log?.('sloping edge cell withheld: proof validation');
    }
    log?.('sloping edge cells: '+out.length+' independently enclosed tall outlines');return out.length<=2?out:[];
  }
  function validPanel(panel){try{return validate(panel);}catch(_){return false;}}
  function validate(p){
    const pr=p?._edgeCellProof,w=pr?.analysisWidth,h=pr?.analysisHeight;
    if(p?._identitySource!=='sloping-edge-frame'||pr?.version!==1||pr.method!==METHOD||!Number.isInteger(w)||!Number.isInteger(h)||!range(w,250,900)||!range(h,350,900)||!Array.isArray(pr.cells)||pr.cells.length!==2||pr.dividerVetoPassed!==true||pr.insetVetoPassed!==true||pr.uniformInkVetoPassed!==true)return false;
    function rimValid(r,q){
      if(!r||!Array.isArray(r.sides)||r.sides.length!==4)return false;const counts=Array(4).fill(0);
      for(let i=0;i<q.length;i++){const a=q[i],b=q[(i+1)%q.length],dx=b[0]-a[0],dy=b[1]-a[1],L=Math.hypot(dx,dy),nx=dy/L,ny=-dx/L,side=Math.abs(nx)>Math.abs(ny)?(nx<0?2:3):(ny<0?0:1);for(let t=1;t<L-1;t++)counts[side]++;}
      if(r.sides.some((s,i)=>s.samples!==counts[i]||s.samples<50||!Number.isInteger(s.matched)||!range(s.matched/s.samples,.95,1)||!Number.isInteger(s.maxGap)||!range(s.maxGap,0,Math.min(6,s.samples*.055,s.samples-s.matched))))return false;
      return r.total===counts.reduce((s,n)=>s+n,0)&&r.matched===r.sides.reduce((s,r)=>s+r.matched,0)&&r.matched/r.total>=.98;
    }
    for(let i=0;i<2;i++){
      const c=pr.cells[i],s=shape(c?.q,w,h);if(!s||c.tolerance!==[6,8][i]||JSON.stringify(s.bounds)!==JSON.stringify(c.bounds)||s.area!==c.area||s.tiltedSide!==c.tiltedSide||JSON.stringify(s.fitSides)!==JSON.stringify(c.fitSides))return false;
      if(!Array.isArray(c.color)||c.color.length!==3||c.color.some(n=>!Number.isInteger(n)||!range(n,0,255))||c.color[0]*.299+c.color[1]*.587+c.color[2]*.114>25)return false;
      const lengths=[Math.ceil(w/2),Math.ceil(w/2),Math.ceil(h/2),Math.ceil(h/2)];
      if(c.edgeSamples!==lengths.reduce((s,n)=>s+n,0)||!Number.isInteger(c.edgeMatched)||!range(c.edgeMatched/c.edgeSamples,.93,1)||!Array.isArray(c.edgeFractions)||c.edgeFractions.length!==4||c.edgeFractions.some((v,i)=>!range(v,.80,1)||Math.abs(v*lengths[i]-Math.round(v*lengths[i]))>1e-8)||Math.abs(c.edgeFractions.reduce((s,v,i)=>s+v*lengths[i],0)-c.edgeMatched)>1e-8||!Number.isInteger(c.exteriorPixels)||!range(c.exteriorPixels,w*h*.025,w*h))return false;
      if(!Number.isInteger(c.pixels)||!range(c.pixels/c.area,.94,1.001)||c.retainedPixels!==c.pixels||c.foreignPixels!==0||!Array.isArray(c.detachedPixels)||c.detachedPixels.length>16000||c.detachedPixels.some(n=>!Number.isInteger(n)||n<1||n>=c.area*.02)||c.detachedPixels.reduce((s,n)=>s+n,0)>c.area*.02||!rimValid(c.rim,c.q))return false;
    }
    const [a,b]=pr.cells;if(a.tiltedSide!==b.tiltedSide||JSON.stringify(a.color)!==JSON.stringify(b.color)||b.exteriorPixels<a.exteriorPixels||Math.abs(a.area-b.area)/a.area>.01||pr.distance!==distance(a.q,b.q)||pr.distance>2||!rimValid(pr.secondRim,a.q))return false;
    const box=a.bounds,q=a.q;
    return Array.isArray(p._outline)&&p._outline.length===q.length&&p._outline.every((v,i)=>range(v?.x,0,1)&&range(v?.y,0,1)&&Math.abs(v.x-q[i][0]/w)<1e-10&&Math.abs(v.y-q[i][1]/h)<1e-10)&&['x','y','w','h'].every(k=>finite(p[k]))&&Math.max(Math.abs(p.x-box[0]/w),Math.abs(p.y-box[1]/h),Math.abs(p.w-(box[2]-box[0])/w),Math.abs(p.h-(box[3]-box[1])/h))<1e-10;
  }
  function analyzeImage(img,log){if(!img||!finite(img.width)||!finite(img.height)||img.width<1||img.height<1)return [];const s=Math.min(1,900/Math.max(img.width,img.height)),w=Math.round(img.width*s),h=Math.round(img.height*s),c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0,w,h);return analyzeRGBA(ctx.getImageData(0,0,w,h).data,w,h,log);}
  return {analyzeRGBA,analyzeImage,validPanel};
})();
