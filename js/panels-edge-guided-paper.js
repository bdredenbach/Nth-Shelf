/* Test75 — edge-guided separation of touching paper frames.
 * A bounded gradient watershed corrects only contacts between image-derived
 * cells. Two seed scales and two independent window widths must produce the
 * exact same candidate mask. White-paper or measured gradient contact must
 * witness each boundary; internal separators and old ownership remain vetoes.
 */
const PanelEdgeGuidedPaper=(()=>{
 'use strict';
 const VERSION=31,METHOD='four-way-stable-gradient-paper-contact';
 const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
 const range=(x,a,b)=>Number.isFinite(x)&&x>=a&&x<=b;
 const count=a=>a.reduce((s,v)=>s+!!v,0);
 const verified=new WeakMap();
 function freeze(x){if(x&&typeof x==='object'&&!Object.isFrozen(x)){Object.freeze(x);for(const y of Object.values(x))freeze(y);}return x;}
 function raster(p,w,h){
  const mask=new Uint8Array(w*h),rings=p._contours||[p._outline||p._quad||[{x:p.x,y:p.y},{x:p.x+p.w,y:p.y},{x:p.x+p.w,y:p.y+p.h},{x:p.x,y:p.y+p.h}]];
  for(let y=0;y<h;y++){const Y=(y+.5)/h,xs=[];for(const q of rings)for(let j=0;j<q.length;j++){const a=q[j],b=q[(j+1)%q.length];if((a.y>Y)!==(b.y>Y))xs.push((a.x+(Y-a.y)*(b.x-a.x)/(b.y-a.y))*w);}xs.sort((a,b)=>a-b);for(let j=0;j+1<xs.length;j+=2)for(let x=Math.max(0,Math.ceil(xs[j]-.5));x<Math.min(w,Math.ceil(xs[j+1]-.5));x++)mask[y*w+x]=1;}
  return mask;
 }
 function extent(a,w,h){let x0=w,y0=h,x1=0,y1=0;for(let i=0;i<a.length;i++)if(a[i]){const x=i%w,y=i/w|0;x0=Math.min(x0,x);x1=Math.max(x1,x+1);y0=Math.min(y0,y);y1=Math.max(y1,y+1);}return[x0,y0,x1,y1];}
 function nearPaper(a,w,h){
  let out=a;for(let k=0;k<3;k++){const b=out.slice();for(let i=0;i<out.length;i++)if(out[i]){const x=i%w,y=i/w|0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const X=x+dx,Y=y+dy;if(X>=0&&Y>=0&&X<w&&Y<h)b[Y*w+X]=1;}}out=b;}return out;
 }
 function paper(rgba,w,h){const white=new Uint8Array(w*h),ext=new Uint8Array(w*h),queue=new Int32Array(w*h);let n=0,head=0;for(let i=0;i<white.length;i++){if(rgba[i*4+3]!==255)return null;white[i]=Math.min(rgba[i*4],rgba[i*4+1],rgba[i*4+2])>232?1:0;}const add=i=>{if(white[i]&&!ext[i]){ext[i]=1;queue[n++]=i;}};for(let x=0;x<w;x++){add(x);add((h-1)*w+x);}for(let y=0;y<h;y++){add(y*w);add(y*w+w-1);}while(head<n){const i=queue[head++],x=i%w,y=i/w|0;if(x)add(i-1);if(x+1<w)add(i+1);if(y)add(i-w);if(y+1<h)add(i+w);}return{white,ext};}
 function internalDivider(a,ext,w,h){
  const [x0,y0,x1,y1]=extent(a,w,h),total=count(a);
  for(let axis=0;axis<2;axis++){const length=axis?x1-x0:y1-y0,span=axis?y1-y0:x1-x0,profile=new Uint32Array(length),band=Math.max(8,Math.round(length*.055)),margin=Math.max(2*band,Math.round(length*.12));for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++)profile[axis?x-x0:y-y0]+=a[y*w+x];let left=0;
   for(let k=0;k<length;k++){left+=profile[k];if(k<margin||k>=length-margin||Math.min(left,total-left)<total*.18)continue;let gap=0,flank=0;for(let t=0;t<span;t++){const i=(axis?y0+t:y0+k)*w+(axis?x0+k:x0+t),step=axis?1:w;if(ext[i]){gap++;if(a[i-band*step]&&a[i+band*step])flank++;}}if(gap/span>.20&&flank/span>.12)return true;}}
  return false;
 }
 function internalInkRail(a,rgba,w,h){
  const L=new Float32Array(w*h);for(let i=0;i<L.length;i++)L[i]=.299*rgba[4*i]+.587*rgba[4*i+1]+.114*rgba[4*i+2];
  const [x0,y0,x1,y1]=extent(a,w,h),total=count(a),d=7;
  for(let axis=0;axis<2;axis++){
   const len=axis?x1-x0:y1-y0,span=axis?y1-y0:x1-x0,at=(k,t)=>axis?(y0+t)*w+x0+k:(y0+k)*w+x0+t,step=axis?1:w,minRun=Math.max(100,Math.ceil(Math.min(w,h)*.25),Math.ceil(span*.30));let left=0;
   for(let k=0;k<len;k++){
    for(let t=0;t<span;t++)left+=a[at(k,t)];
    if(k<d+1||k>=len-d-1||Math.min(left,total-left)<total*.16)continue;
    let run=0,both=0,either=0;
    const suspicious=()=>run>=minRun&&both/run>=.20&&either/run>=.72;
    for(let t=0;t<span;t++){
     const i=at(k,t),rail=Math.min(L[i-step],L[i],L[i+step]);
     if(a[i-d*step]&&a[i+d*step]&&rail<65){const b=L[i-d*step]-rail>20,c=L[i+d*step]-rail>20;run++;both+=b&&c;either+=b||c;}
     else{if(suspicious())return true;run=both=either=0;}
    }
    if(suspicious())return true;
   }
  }return false;
 }
 function sourceValid(p,r){try{
  const v=p?._structuralGridProof,w=v?.analysisWidth,h=v?.analysisHeight,b=v?.seed?.box;
  if(p?._identitySource!=='structural-grid-frame'||p._geometryOwner!=='structural-grid-contours'||p._geometryType!=='ragged-gutter-cells'||p._quad||p._outline||v?.version!==18||v.method!=='exterior-color-field-ragged-cells'||v.connected!==true||v.seedRadius!==r||![4,6,8].includes(r)||v.recovery||!v.palette?.paper||!range(v.variance,180,16257))return false;
  if(!Number.isInteger(w)||!Number.isInteger(h)||w<250||h<350||w>900||h>900||!Number.isInteger(v.count)||v.count<2||v.count>24||!Number.isInteger(v.index)||v.index<0||v.index>=v.count||!range(v.coverage,.5,1))return false;
  if(!Array.isArray(b)||b.length!==4||b.some((n,i)=>!Number.isInteger(n)||n<0||n>(i%2?h:w))||b[0]>=b[2]||b[1]>=b[3]||!Number.isInteger(v.seed.pixels)||!range(v.seed.pixels/((b[2]-b[0])*(b[3]-b[1])),.40,1))return false;
  if(!Array.isArray(v.seed.splits)||v.seed.splits.length>6||v.seed.splits.some(s=>![0,1].includes(s.axis)||!Number.isInteger(s.pos)||s.pos<0||s.pos>=(s.axis?w:h)||!range(s.support,.62,1)||!range(s.flank,.4,1)||!Number.isFinite(s.score)||Math.abs(s.score-s.support-.1*s.flank)>1e-9))return false;
  if(!range(v.exteriorPixels,w*h*.04,w*h*.6)||!range(v.palette.edgeMatched/v.palette.edgeSamples,.25,1))return false;
  if(!Array.isArray(v.pixelContours)||v.pixelContours.length!==1||v.pixelContours[0].length<4||v.pixelContours[0].length>4096||v.pixelContours[0].some(a=>a.length!==2||!Number.isInteger(a[0])||!Number.isInteger(a[1])||a[0]<0||a[0]>w||a[1]<0||a[1]>h))return false;
  if(!same(p._contours,v.pixelContours.map(q=>q.map(([x,y])=>({x:x/w,y:y/h})))))return false;
  const A=raster(p,w,h),box=extent(A,w,h),pixels=count(A);if(pixels!==v.pixels||v.seed.pixels>pixels)return false;
  const[x0,y0,x1,y1]=box;return same([p.x,p.y,p.w,p.h],[x0/w,y0/h,(x1-x0)/w,(y1-y0)/h])&&range(p.w*p.h,.001,1);
 }catch(_){return false;}}
function gradient(rgba,w,h){
 const out=new Float32Array(w*h);
 const refl=(x,n)=>x<0?-x:x>=n?2*n-2-x:x;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  let v=0;
  for(let c=0;c<3;c++){
   const at=(X,Y)=>rgba[4*(refl(Y,h)*w+refl(X,w))+c]/255;
   const a=at(x-1,y-1),b=at(x,y-1),d=at(x+1,y-1),e=at(x-1,y),f=at(x+1,y),g=at(x-1,y+1),j=at(x,y+1),k=at(x+1,y+1);
   const gx=-a+d-2*e+2*f-g+k,gy=-a-2*b-d+g+2*j+k;
   v=Math.max(v,Math.hypot(gx,gy));
  }out[y*w+x]=v;
 }return out;
}
function contactBand(labels,w,h,r){
 const C=new Uint8Array(w*h),P=new Int32Array((w+1)*(h+1));let contact=0;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const i=y*w+x,v=labels[i];if(v&&((x&&labels[i-1]&&v!==labels[i-1])||(x+1<w&&labels[i+1]&&v!==labels[i+1])||(y&&labels[i-w]&&v!==labels[i-w])||(y+1<h&&labels[i+w]&&v!==labels[i+w]))) {C[i]=1;contact++;}
  P[(y+1)*(w+1)+x+1]=C[i]+P[(y+1)*(w+1)+x]+P[y*(w+1)+x+1]-P[y*(w+1)+x];
 }
 const band=new Uint8Array(w*h);let size=0;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const a=Math.max(0,x-r),b=Math.min(w,x+r+1),c=Math.max(0,y-r),d=Math.min(h,y+r+1);
  if(labels[y*w+x]&&P[d*(w+1)+b]-P[d*(w+1)+a]-P[c*(w+1)+b]+P[c*(w+1)+a]>0){band[y*w+x]=1;size++;}
 }return {band,size,contact};
}
function flood(labels,grad,w,h,r){
 const {band,size,contact}=contactBand(labels,w,h,r),out=Uint16Array.from(labels),heap=[];
 let age=0;
 const less=(a,b)=>a[0]<b[0]||(a[0]===b[0]&&a[1]<b[1]);
 function push(a){let i=heap.length;heap.push(a);while(i){const p=(i-1)>>1;if(!less(a,heap[p]))break;heap[i]=heap[p];i=p;}heap[i]=a;}
 function pop(){const min=heap[0],a=heap.pop();if(heap.length){let i=0;while(2*i+1<heap.length){let c=2*i+1;if(c+1<heap.length&&less(heap[c+1],heap[c]))c++;if(!less(heap[c],a))break;heap[i]=heap[c];i=c;}heap[i]=a;}return min;}
 const adj=i=>{const x=i%w,y=(i/w)|0;return[y?i-w:-1,x?i-1:-1,x+1<w?i+1:-1,y+1<h?i+w:-1];};
 for(let i=0;i<labels.length;i++)if(band[i])out[i]=0;
 // Marker fronts only; all other markers can never enter the uncertain band.
 for(let i=0;i<labels.length;i++)if(out[i]&&adj(i).some(j=>j>=0&&band[j]))push([grad[i],age++,i]);
 while(heap.length){const [cost,t,i]=pop();for(const j of adj(i)){
  if(j<0||!band[j]||out[j])continue;out[j]=out[i];push([Math.max(cost,grad[j]),age++,j]);
 }}
 return {out,band,size,contact};
}
function internalWhiteRail(A,rgba,w,h){
 let x0=w,y0=h,x1=0,y1=0;for(let i=0;i<A.length;i++)if(A[i]){const x=i%w,y=i/w|0;x0=Math.min(x0,x);x1=Math.max(x1,x+1);y0=Math.min(y0,y);y1=Math.max(y1,y+1);}
 const white=new Uint8Array(w*h);for(let i=0;i<white.length;i++)white[i]=Math.min(rgba[4*i],rgba[4*i+1],rgba[4*i+2])>225;
 for(let axis=0;axis<2;axis++){
  const len=axis?x1-x0:y1-y0,span=axis?y1-y0:x1-x0,d=Math.max(7,Math.round(len*.025)),margin=Math.max(d+3,Math.round(len*.10)),at=(k,t)=>axis?(y0+t)*w+x0+k:(y0+k)*w+x0+t,step=axis?1:w;
  for(let k=margin;k<len-margin;k++){
   let support=0,longest=0,run=0,gap=0;for(let t=0;t<span;t++){
    const i=at(k,t),present=white[i-step]||white[i]||white[i+step],flanks=A[i-d*step]&&A[i+d*step]&&!white[i-d*step]&&!white[i+d*step];
    if(present&&flanks){support++;run++;gap=0;}else if(run&&++gap<=3){run++;}else{longest=Math.max(longest,run);run=0;gap=0;}
   }longest=Math.max(longest,run);
   if(support>=Math.max(60,.58*span)&&longest>=.40*span)return{axis,pos:k+(axis?x0:y0),support,longest,span};
  }
 }return null;
}

 function field(sources,r,w,h){
  if(!Array.isArray(sources)||sources.length<2||sources.length>12||sources.some((p,i)=>!sourceValid(p,r)||p._structuralGridProof.count!==sources.length||p._structuralGridProof.index!==i||p._structuralGridProof.analysisWidth!==w||p._structuralGridProof.analysisHeight!==h))return null;
  const a=new Uint16Array(w*h);
  for(let k=0;k<sources.length;k++){
   const m=raster(sources[k],w,h);
   for(let i=0;i<m.length;i++)if(m[i]){if(a[i])return null;a[i]=k+1;}
  }return a;
 }
 function nearRequired(labels,w,h,r){
  const c=contactBand(labels,w,h,r),required=c.band.slice();
  for(let i=0;i<required.length;i++)if(c.band[i]){const x=i%w,y=i/w|0;for(const j of[y?i-w:-1,x?i-1:-1,x+1<w?i+1:-1,y+1<h?i+w:-1])if(j>=0&&labels[j])required[j]=1;}
  return {required,...c};
 }
 function replay(first,second,radii,windowRadii,samples,w,h){
  const A=field(first,radii[0],w,h),B=field(second,radii[1],w,h);if(!A||!B||first.length!==second.length)return null;
  const ar=nearRequired(A,w,h,windowRadii[1]),br=nearRequired(B,w,h,windowRadii[1]);
  if(!ar.contact||!br.contact||ar.size>w*h*.14||br.size>w*h*.14)return null;
  const req=ar.required.map((v,i)=>v||br.required[i]?1:0),n=count(req);
  if(!Array.isArray(samples)||samples.length!==n||n>w*h*.18)return null;
  const G=new Float32Array(w*h);let last=-1;
  for(const q of samples){if(!Array.isArray(q)||q.length!==2||!Number.isInteger(q[0])||q[0]<=last||q[0]>=G.length||!req[q[0]]||!range(q[1],0,6))return null;G[q[0]]=q[1];last=q[0];}
  const outputs=[flood(A,G,w,h,windowRadii[0]),flood(A,G,w,h,windowRadii[1]),flood(B,G,w,h,windowRadii[0]),flood(B,G,w,h,windowRadii[1])];
  return {A,B,G,outputs,contacts:[ar.contact,br.contact],windowPixels:[ar.size,br.size]};
 }
 function candidateMask(replayed,index){
  const {outputs,A,B}=replayed,k=index+1,mask=Uint8Array.from(outputs[0].out,v=>v===k?1:0);
  if(outputs.some(o=>o.out.some((v,i)=>(v===k?1:0)!==mask[i])))return null;
  const changed=[A,B].map(L=>mask.reduce((s,v,i)=>s+(v!==(L[i]===k?1:0)),0));
  const pixels=count(mask);if(changed.some(n=>n<Math.max(32,Math.ceil(pixels*.001))||n>pixels*.05))return null;
  return {mask,changed,pixels};
 }
 function perimeter(mask,labels,G,white,ext,w,h){
  const samples=[0,0,0,0],edges=[0,0,0,0],ink=[0,0,0,0],wh=[0,0,0,0],ex=[0,0,0,0],mixed=[0,0,0,0];
  for(let i=0;i<mask.length;i++)if(mask[i]){const x=i%w,y=i/w|0,adj=[y?i-w:-1,y+1<h?i+w:-1,x?i-1:-1,x+1<w?i+1:-1];for(let k=0;k<4;k++){
   const j=adj[k];if(j>=0&&mask[j])continue;samples[k]++;if(j<0){edges[k]++;continue;}
   const hit=!!(labels[j]&&labels[j]!==labels[i]&&Math.max(G[i],G[j])>=.5);
   ink[k]+=hit;wh[k]+=white[i];ex[k]+=ext[i];mixed[k]+=!!(hit||white[i]);
  }}return{samples,edges,ink,white:wh,exterior:ex,mixed};
 }
 function boundaryValid(b){
  if(!b||!['samples','edges','ink','white','exterior','mixed'].every(k=>Array.isArray(b[k])&&b[k].length===4&&b[k].every(n=>Number.isInteger(n)&&n>=0)))return false;
  // Adjacent page-edge corners may be unframed foreground spanning two scenes.
  // This route accepts at most two opposing physical edges, not such corners.
  if(b.edges.filter(n=>n>0).length>2||(b.edges.slice(0,2).some(Boolean)&&b.edges.slice(2).some(Boolean)))return false;
  return b.samples.every((n,k)=>{const a=n-b.edges[k];return n>=20&&a>=0&&b.ink[k]<=a&&b.white[k]<=a&&b.exterior[k]<=b.white[k]&&b.mixed[k]<=a&&b.mixed[k]<=b.white[k]+b.ink[k]&&b.mixed[k]>=Math.max(b.white[k],b.ink[k])&&b.mixed[k]>=.95*a&&b.exterior[k]>=.80*Math.max(0,a-b.ink[k]);});
 }
 function shapeValid(mask,w,h){
  const pixels=count(mask),b=extent(mask,w,h),area=(b[2]-b[0])*(b[3]-b[1]);
  return pixels>=w*h*.025&&area<=w*h*.80&&pixels/area>=.70;
 }
 function proofValid(p){try{
  const v=p?._structuralGridProof,w=v?.analysisWidth,h=v?.analysisHeight;
  if(p?._identitySource!=='structural-grid-frame'||p._geometryOwner!=='structural-grid-contours'||p._geometryType!=='gradient-separated-paper-cell'||p._quad||p._outline||v?.version!==VERSION||v.method!==METHOD||v.connected!==true||v.originalOwnerOverlap!==0||v.internalDivider!==false||v.internalInkRail!==false||v.internalWhiteRail!==false)return false;
  if(!Number.isInteger(w)||!Number.isInteger(h)||w<250||h<350||w>900||h>900||![[4,6],[6,8]].some(a=>same(a,v.radii))||!same(v.windowRadii,[Math.round(Math.min(w,h)*.036),Math.round(Math.min(w,h)*.041)])||!Number.isInteger(v.selectedIndex)||v.selectedIndex<0||v.selectedIndex>=v.first?.length)return false;
  const r=replay(v.first,v.second,v.radii,v.windowRadii,v.gradientSamples,w,h);if(!r||!same(r.contacts,v.contacts)||!same(r.windowPixels,v.windowPixels))return false;
  const c=candidateMask(r,v.selectedIndex);if(!c||!shapeValid(c.mask,w,h)||!same(c.changed,v.changedPixels)||c.pixels!==v.pixels)return false;
  const rings=PanelMatteCells.tracePixelContours(c.mask,w,h,1);if(!rings||rings.length!==1||!same(rings,v.pixelContours)||!same(p._contours,rings.map(q=>q.map(([x,y])=>({x:x/w,y:y/h})))))return false;
  const [x0,y0,x1,y1]=extent(c.mask,w,h);if(!same([p.x,p.y,p.w,p.h],[x0/w,y0/h,(x1-x0)/w,(y1-y0)/h])||!boundaryValid(v.boundary))return false;
  const b=perimeter(c.mask,r.outputs[0].out,r.G,new Uint8Array(w*h),new Uint8Array(w*h),w,h);
  return same(b.samples,v.boundary.samples)&&same(b.edges,v.boundary.edges)&&same(b.ink,v.boundary.ink);
 }catch(_){return false;}}
 function validPanel(p){
  const v=p?._structuralGridProof,cache=v&&verified.get(v);
  return cache&&p._contours===cache.contours?p._identitySource==='structural-grid-frame'&&p._geometryOwner==='structural-grid-contours'&&p._geometryType==='gradient-separated-paper-cell'&&!p._quad&&!p._outline&&same([p.x,p.y,p.w,p.h],cache.box):proofValid(p);
 }
 function eligible(prior){return Array.isArray(prior)&&prior.length<=24&&prior.every(p=>p&&['x','y','w','h'].every(k=>Number.isFinite(p[k]))&&p.x>=0&&p.y>=0&&p.w>0&&p.h>0&&p.x+p.w<=1.000001&&p.y+p.h<=1.000001);}
 function supplementRGBA(rgba,w,h,prior,log,audit){
  const report={pairs:0,stable:0,overlap:0,boundary:0,divider:0,accepted:0};const done=out=>{audit?.(report);return out;};
  if(!eligible(prior)||!Number.isInteger(w)||!Number.isInteger(h)||w<250||h<350||w>900||h>900||rgba?.length!==w*h*4||typeof PanelRaggedGutters==='undefined'||typeof PanelMatteCells==='undefined')return done([]);
  const P=paper(rgba,w,h);if(!P)return done([]);
  const sources=[4,6,8].map(r=>PanelRaggedGutters.analyzeCooperativeRGBA(rgba,w,h,r));
  const fields=sources.map((s,k)=>field(s,4+k*2,w,h));if(fields.every(f=>!f))return done([]);
  const G=gradient(rgba,w,h),windows=[Math.round(Math.min(w,h)*.036),Math.round(Math.min(w,h)*.041)],W=nearPaper(P.white,w,h),E=nearPaper(P.ext,w,h),occupied=new Uint8Array(w*h),out=[];
  for(const p of prior){const m=raster(p,w,h);for(let i=0;i<m.length;i++)occupied[i]|=m[i];}
  for(let k=0;k<2;k++){
   const A=fields[k],B=fields[k+1];if(!A||!B||sources[k].length!==sources[k+1].length)continue;
   const ar=nearRequired(A,w,h,windows[1]),br=nearRequired(B,w,h,windows[1]);if(!ar.contact||!br.contact||ar.size>w*h*.14||br.size>w*h*.14)continue;report.pairs++;
   const samples=[];for(let i=0;i<G.length;i++)if(ar.required[i]||br.required[i])samples.push([i,G[i]]);
   const radii=[4+k*2,6+k*2],r=replay(sources[k],sources[k+1],radii,windows,samples,w,h);if(!r)continue;
   for(let index=0;index<sources[k].length;index++){
    const c=candidateMask(r,index);if(!c||!shapeValid(c.mask,w,h))continue;report.stable++;
    if(c.mask.some((v,i)=>v&&occupied[i])){report.overlap++;continue;}
    const boundary=perimeter(c.mask,r.outputs[0].out,G,W,E,w,h);if(!boundaryValid(boundary)){report.boundary++;continue;}
    if(internalDivider(c.mask,P.ext,w,h)||internalInkRail(c.mask,rgba,w,h)||internalWhiteRail(c.mask,rgba,w,h)){report.divider++;continue;}
    const rings=PanelMatteCells.tracePixelContours(c.mask,w,h,1);if(!rings||rings.length!==1)continue;const [x0,y0,x1,y1]=extent(c.mask,w,h);
    const v={version:VERSION,method:METHOD,connected:true,analysisWidth:w,analysisHeight:h,radii,windowRadii:windows,first:sources[k],second:sources[k+1],selectedIndex:index,gradientSamples:samples,contacts:r.contacts,windowPixels:r.windowPixels,changedPixels:c.changed,pixels:c.pixels,pixelContours:rings,boundary,originalOwnerOverlap:0,internalDivider:false,internalInkRail:false,internalWhiteRail:false};
    const p={x:x0/w,y:y0/h,w:(x1-x0)/w,h:(y1-y0)/h,_identitySource:'structural-grid-frame',_geometryOwner:'structural-grid-contours',_geometryType:'gradient-separated-paper-cell',_contours:rings.map(q=>q.map(([x,y])=>({x:x/w,y:y/h}))),_structuralGridProof:v};
    if(!proofValid(p))continue;p._structuralGridProof=freeze(JSON.parse(JSON.stringify(v)));p._contours=freeze(p._contours);verified.set(p._structuralGridProof,{contours:p._contours,box:[p.x,p.y,p.w,p.h]});out.push(p);
    for(let i=0;i<occupied.length;i++)occupied[i]|=c.mask[i];
   }
  }
  report.accepted=out.length;if(out.length)log?.('gradient paper contact: '+out.length+' four-way-stable complete frames');return done(out);
 }
 function supplementImage(img,prior,log,audit){
  if(!eligible(prior))return[];const W=img.naturalWidth||img.width,H=img.naturalHeight||img.height;if(!W||!H||W*H>24000000)return[];let c;
  try{c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d',{willReadFrequently:true});if(!g)return[];g.drawImage(img,0,0);const s=Math.min(1,900/Math.max(W,H)),w=Math.round(W*s),h=Math.round(H*s);return supplementRGBA(PanelMatteCells.sampleBilinearRGBA(g.getImageData(0,0,W,H).data,W,H,w,h),w,h,prior,log,audit);}finally{if(c)c.width=c.height=1;}
 }
 function bind(){
  if(typeof PanelStructuralGrid!=='undefined'&&!PanelStructuralGrid._edgeGuidedPaper){const old=PanelStructuralGrid.validPanel;PanelStructuralGrid.validPanel=p=>p?._structuralGridProof?.version===VERSION?validPanel(p):old(p);PanelStructuralGrid._edgeGuidedPaper=true;}
  if(typeof PanelGeometry!=='undefined'&&!PanelGeometry._edgeGuidedPaper){const old=PanelGeometry.refine;PanelGeometry.refine=async function(url,p,log){return validPanel(p)?{...p}:old.call(this,url,p,log);};PanelGeometry._edgeGuidedPaper=true;}
  if(typeof PanelEdgeSpill!=='undefined'&&!PanelEdgeSpill._edgeGuidedPaper){for(const name of ['analyzeImage','analyzeRGBA']){const old=PanelEdgeSpill[name];if(typeof old==='function')PanelEdgeSpill[name]=function(...args){return validPanel(args[name==='analyzeImage'?1:3])?null:old.apply(this,args);};}PanelEdgeSpill._edgeGuidedPaper=true;}
 }
 function install(detector){bind();if(!detector||detector._edgeGuidedPaper)return;const old=detector.detect;detector.detect=async function(url,log){const prior=await old.call(this,url,log);if(!eligible(prior))return prior;try{const img=new Image();img.src=url;await img.decode();const added=supplementImage(img,prior,log);return added.length?prior.concat(added):prior;}catch(e){log?.('gradient paper contact deferred: '+e.message);return prior;}};detector._edgeGuidedPaper=true;}
 return {supplementRGBA,supplementImage,validPanel,eligible,bind,install};
})();
if(typeof PanelDetect!=='undefined')PanelEdgeGuidedPaper.install(PanelDetect);
if(typeof module!=='undefined')module.exports=PanelEdgeGuidedPaper;
