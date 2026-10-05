/* Test74 — independently enclosed paper frames, including measured page edges.
 * Supplement only. Source pixels, contours and order of accepted owners remain
 * unchanged. Two seed scales must agree on a closed scene; original paper must
 * witness its exposed boundary. A source-page edge is a measured boundary, not
 * a fitted or extrapolated rectangle. No page/book/tap lookup.
 */
const PanelExteriorCompletion=(()=>{
 'use strict';
 const VERSION=30,METHOD='independent-paper-envelope-consensus';
 const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b),range=(x,a,b)=>Number.isFinite(x)&&x>=a&&x<=b,count=a=>a.reduce((s,v)=>s+!!v,0);
 const immutable=new WeakMap();
 function freeze(v){if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.freeze(v);for(const x of Object.values(v))freeze(x);}return v;}
 function raster(p,w,h){
  const mask=new Uint8Array(w*h),rings=p._contours||[p._outline||p._quad||[{x:p.x,y:p.y},{x:p.x+p.w,y:p.y},{x:p.x+p.w,y:p.y+p.h},{x:p.x,y:p.y+p.h}]];
  for(let y=0;y<h;y++){const Y=(y+.5)/h,xs=[];for(const q of rings)for(let j=0;j<q.length;j++){const a=q[j],b=q[(j+1)%q.length];if((a.y>Y)!==(b.y>Y))xs.push((a.x+(Y-a.y)*(b.x-a.x)/(b.y-a.y))*w);}xs.sort((a,b)=>a-b);for(let j=0;j+1<xs.length;j+=2)for(let x=Math.max(0,Math.ceil(xs[j]-.5));x<Math.min(w,Math.ceil(xs[j+1]-.5));x++)mask[y*w+x]=1;}
  return mask;
 }
 function extent(a,w,h){let x0=w,y0=h,x1=0,y1=0;for(let i=0;i<a.length;i++)if(a[i]){const x=i%w,y=i/w|0;x0=Math.min(x0,x);x1=Math.max(x1,x+1);y0=Math.min(y0,y);y1=Math.max(y1,y+1);}return[x0,y0,x1,y1];}
 function dilate(a,w,h,r){let out=a;for(let k=0;k<r;k++){const b=out.slice();for(let i=0;i<out.length;i++)if(out[i]){const x=i%w,y=i/w|0;if(x)b[i-1]=1;if(x+1<w)b[i+1]=1;if(y)b[i-w]=1;if(y+1<h)b[i+w]=1;}out=b;}return out;}
 function nearPaper(a,w,h){
  let out=a;for(let k=0;k<3;k++){const b=out.slice();for(let i=0;i<out.length;i++)if(out[i]){const x=i%w,y=i/w|0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const X=x+dx,Y=y+dy;if(X>=0&&Y>=0&&X<w&&Y<h)b[Y*w+X]=1;}}out=b;}return out;
 }
 function sourceValid(p,r){try{
  const v=p?._structuralGridProof,w=v?.analysisWidth,h=v?.analysisHeight,b=v?.seed?.box;
  if(p?._identitySource!=='structural-grid-frame'||p._geometryOwner!=='structural-grid-contours'||p._geometryType!=='ragged-gutter-cells'||p._quad||p._outline||v?.version!==18||v.method!=='exterior-color-field-ragged-cells'||v.connected!==true||v.seedRadius!==r||![4,6,8].includes(r)||v.recovery||!v.palette?.paper||!range(v.variance,500,16257))return false;
  if(!Number.isInteger(w)||!Number.isInteger(h)||w<250||h<350||w>900||h>900||!Number.isInteger(v.count)||v.count<2||v.count>24||!Number.isInteger(v.index)||v.index<0||v.index>=v.count||!range(v.coverage,.5,1))return false;
  if(!Array.isArray(b)||b.length!==4||b.some((n,i)=>!Number.isInteger(n)||n<0||n>(i%2?h:w))||b[0]>=b[2]||b[1]>=b[3]||!Number.isInteger(v.seed.pixels)||!range(v.seed.pixels/((b[2]-b[0])*(b[3]-b[1])),.40,1))return false;
  if(!Array.isArray(v.seed.splits)||v.seed.splits.length>6||v.seed.splits.some(s=>![0,1].includes(s.axis)||!Number.isInteger(s.pos)||s.pos<0||s.pos>=(s.axis?w:h)||!range(s.support,.62,1)||!range(s.flank,.4,1)||!Number.isFinite(s.score)||Math.abs(s.score-s.support-.1*s.flank)>1e-9))return false;
  if(!range(v.exteriorPixels,w*h*.04,w*h*.6)||!range(v.palette.edgeMatched/v.palette.edgeSamples,.25,1))return false;
  if(!Array.isArray(v.pixelContours)||v.pixelContours.length!==1||v.pixelContours[0].length<4||v.pixelContours[0].length>4096||v.pixelContours[0].some(a=>a.length!==2||!Number.isInteger(a[0])||!Number.isInteger(a[1])||a[0]<0||a[0]>w||a[1]<0||a[1]>h))return false;
  if(!same(p._contours,v.pixelContours.map(q=>q.map(([x,y])=>({x:x/w,y:y/h})))))return false;
  const A=raster(p,w,h),box=extent(A,w,h),pixels=count(A);if(pixels!==v.pixels||v.seed.pixels>pixels)return false;
  const[x0,y0,x1,y1]=box;return same([p.x,p.y,p.w,p.h],[x0/w,y0/h,(x1-x0)/w,(y1-y0)/h])&&range(p.w*p.h,.04,.32)&&pixels/(p.w*p.h*w*h)>=.72;
 }catch(_){return false;}}
 function consensus(first,second,w,h){
  const A=raster(first,w,h),B=raster(second,w,h);let diff=0,union=0;for(let i=0;i<A.length;i++){diff+=A[i]!==B[i];union+=!!(A[i]||B[i]);}
  if(!union||diff>Math.ceil(w*h*.00035)||diff/union>.002)return null;
  if(diff){const ba=dilate(A.map(v=>!v?1:0),w,h,3),bb=dilate(B.map(v=>!v?1:0),w,h,3);if(A.some((v,i)=>v!==B[i]&&((v&&!ba[i])||(B[i]&&!bb[i]))))return null;}
  const mask=A.map((v,i)=>v&&B[i]?1:0);return{mask,difference:diff,union,pixels:count(mask)};
 }
 function paper(rgba,w,h){const white=new Uint8Array(w*h),ext=new Uint8Array(w*h),queue=new Int32Array(w*h);let n=0,head=0;for(let i=0;i<white.length;i++){if(rgba[i*4+3]!==255)return null;white[i]=Math.min(rgba[i*4],rgba[i*4+1],rgba[i*4+2])>232?1:0;}const add=i=>{if(white[i]&&!ext[i]){ext[i]=1;queue[n++]=i;}};for(let x=0;x<w;x++){add(x);add((h-1)*w+x);}for(let y=0;y<h;y++){add(y*w);add(y*w+w-1);}while(head<n){const i=queue[head++],x=i%w,y=i/w|0;if(x)add(i-1);if(x+1<w)add(i+1);if(y)add(i-w);if(y+1<h)add(i+w);}return{white,ext};}
 function boundary(a,nearWhite,nearExterior,w,h){
  const samples=[0,0,0,0],edges=[0,0,0,0],white=[0,0,0,0],exterior=[0,0,0,0];
  for(let i=0;i<a.length;i++)if(a[i]){const x=i%w,y=i/w|0,adj=[y?i-w:-1,y+1<h?i+w:-1,x?i-1:-1,x+1<w?i+1:-1];for(let k=0;k<4;k++){if(adj[k]>=0&&a[adj[k]])continue;samples[k]++;if(adj[k]<0)edges[k]++;else{white[k]+=nearWhite[i];exterior[k]+=nearExterior[i];}}}
  return{radius:3,metric:'chebyshev',samples,edges,white,exterior};
 }
 function boundaryValid(b){
  if(!b||b.radius!==3||b.metric!=='chebyshev'||!['samples','edges','white','exterior'].every(k=>Array.isArray(b[k])&&b[k].length===4&&b[k].every(Number.isInteger)))return false;
  if(b.edges.filter(n=>n>0).length>2)return false;
  return b.samples.every((n,k)=>n>=20&&range(b.edges[k],0,n)&&range(b.white[k],(n-b.edges[k])*.95,n-b.edges[k])&&range(b.exterior[k],(n-b.edges[k])*.80,b.white[k]));
 }
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
 function proofValid(p){try{
  const v=p?._structuralGridProof,w=v?.analysisWidth,h=v?.analysisHeight;
  if(p?._identitySource!=='structural-grid-frame'||p._geometryOwner!=='structural-grid-contours'||p._geometryType!=='exterior-completed-paper-cell'||p._quad||p._outline||v?.version!==VERSION||v.method!==METHOD||v.connected!==true||v.originalOwnerOverlap!==0||v.internalDivider!==false||v.internalInkRail!==false)return false;
  if(!Number.isInteger(w)||!Number.isInteger(h)||w<250||h<350||w>900||h>900||![[4,6],[6,8]].some(a=>same(a,v.radii))||!sourceValid(v.first,v.radii[0])||!sourceValid(v.second,v.radii[1])||[v.first,v.second].some(q=>q._structuralGridProof.analysisWidth!==w||q._structuralGridProof.analysisHeight!==h))return false;
  const c=consensus(v.first,v.second,w,h);if(!c||c.difference!==v.differencePixels||c.union!==v.unionPixels||c.pixels!==v.pixels)return false;
  const rings=PanelMatteCells.tracePixelContours(c.mask,w,h,1);if(!rings||rings.length!==1||!same(rings,v.pixelContours)||!same(p._contours,rings.map(q=>q.map(([x,y])=>({x:x/w,y:y/h})))))return false;
  const[x0,y0,x1,y1]=extent(c.mask,w,h);if(!same([p.x,p.y,p.w,p.h],[x0/w,y0/h,(x1-x0)/w,(y1-y0)/h])||!boundaryValid(v.boundary))return false;
  const b=boundary(c.mask,new Uint8Array(w*h),new Uint8Array(w*h),w,h);return same(b.samples,v.boundary.samples)&&same(b.edges,v.boundary.edges);
 }catch(_){return false;}}
 function validPanel(p){const q=p?._structuralGridProof&&immutable.get(p._structuralGridProof);return q&&p._contours===q.contours?p._identitySource==='structural-grid-frame'&&p._geometryOwner==='structural-grid-contours'&&p._geometryType==='exterior-completed-paper-cell'&&!p._quad&&!p._outline&&same([p.x,p.y,p.w,p.h],q.box):proofValid(p);}
 function eligible(prior){return Array.isArray(prior)&&prior.length<=24&&prior.every(p=>p&&['x','y','w','h'].every(k=>Number.isFinite(p[k]))&&p.w>0&&p.h>0&&p.x>=0&&p.y>=0&&p.x+p.w<=1.000001&&p.y+p.h<=1.000001);}
 function fromSources(rgba,w,h,prior,src,log,audit){
  const report={candidates:0,stable:0,boundaryRejected:0,dividerRejected:0,overlapRejected:0,accepted:0};const done=out=>{audit?.(report);return out;};
  const P=paper(rgba,w,h);if(!P)return done([]);const nw=nearPaper(P.white,w,h),ne=nearPaper(P.ext,w,h),occupied=new Uint8Array(w*h);for(const p of prior){const m=raster(p,w,h);for(let i=0;i<m.length;i++)occupied[i]|=m[i];}
  const qualified=[],keys=new Set();
  for(let k=0;k<2;k++)for(const first of src[k]){
   if(!sourceValid(first,4+k*2))continue;report.candidates++;const F=raster(first,w,h);if(F.some((v,i)=>v&&occupied[i])){report.overlapRejected++;continue;}
   const matches=[];for(const second of src[k+1]){if(!sourceValid(second,6+k*2)||Math.abs(first.x-second.x)>.03||Math.abs(first.y-second.y)>.03||Math.abs(first.w-second.w)>.03||Math.abs(first.h-second.h)>.03)continue;const c=consensus(first,second,w,h);if(c)matches.push({first,second,radii:[4+k*2,6+k*2],...c});}
   if(matches.length!==1)continue;const c=matches[0];report.stable++;if(c.mask.some((v,i)=>v&&occupied[i])){report.overlapRejected++;continue;}
   c.boundary=boundary(c.mask,nw,ne,w,h);if(!boundaryValid(c.boundary)){report.boundaryRejected++;continue;}
   if(internalDivider(c.mask,P.ext,w,h)||internalInkRail(c.mask,rgba,w,h)){report.dividerRejected++;continue;}
   c.rings=PanelMatteCells.tracePixelContours(c.mask,w,h,1);if(!c.rings||c.rings.length!==1)continue;const key=JSON.stringify(c.rings);if(keys.has(key))continue;keys.add(key);qualified.push(c);
  }
  qualified.sort((a,b)=>a.difference-b.difference||extent(a.mask,w,h)[1]-extent(b.mask,w,h)[1]);const out=[];
  for(const c of qualified){if(c.mask.some((v,i)=>v&&occupied[i]))continue;const[x0,y0,x1,y1]=extent(c.mask,w,h),v={version:VERSION,method:METHOD,connected:true,analysisWidth:w,analysisHeight:h,radii:c.radii,first:c.first,second:c.second,differencePixels:c.difference,unionPixels:c.union,pixels:c.pixels,pixelContours:c.rings,boundary:c.boundary,originalOwnerOverlap:0,internalDivider:false,internalInkRail:false};
   const p={x:x0/w,y:y0/h,w:(x1-x0)/w,h:(y1-y0)/h,_identitySource:'structural-grid-frame',_geometryOwner:'structural-grid-contours',_geometryType:'exterior-completed-paper-cell',_contours:c.rings.map(q=>q.map(([x,y])=>({x:x/w,y:y/h}))),_structuralGridProof:v};if(!validPanel(p))continue;
   p._structuralGridProof=freeze(JSON.parse(JSON.stringify(v)));p._contours=freeze(p._contours);immutable.set(p._structuralGridProof,{contours:p._contours,box:[p.x,p.y,p.w,p.h]});out.push(p);for(let i=0;i<occupied.length;i++)occupied[i]|=c.mask[i];
  }
  report.accepted=out.length;if(out.length)log?.('independent paper enclosure: '+out.length+' additional frames');return done(out);
 }
 function supplementRGBA(rgba,w,h,prior,log,audit){if(!eligible(prior)||!Number.isInteger(w)||!Number.isInteger(h)||w<250||h<350||w>900||h>900||rgba?.length!==w*h*4||typeof PanelRaggedGutters==='undefined'||typeof PanelMatteCells==='undefined')return[];const src=[4,6,8].map(r=>PanelRaggedGutters.analyzeCooperativeRGBA(rgba,w,h,r));return fromSources(rgba,w,h,prior,src,log,audit);}
 function supplementImage(img,prior,log,audit){if(!eligible(prior)||typeof PanelMatteCells==='undefined')return[];const W=img.naturalWidth||img.width,H=img.naturalHeight||img.height;if(!W||!H||W*H>24000000)return[];let c;try{c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d',{willReadFrequently:true});if(!g)return[];g.drawImage(img,0,0);const s=Math.min(1,900/Math.max(W,H)),w=Math.round(W*s),h=Math.round(H*s);return supplementRGBA(PanelMatteCells.sampleBilinearRGBA(g.getImageData(0,0,W,H).data,W,H,w,h),w,h,prior,log,audit);}finally{if(c)c.width=c.height=1;}}
 function bind(){if(typeof PanelStructuralGrid!=='undefined'&&!PanelStructuralGrid._exteriorCompletionBound){const old=PanelStructuralGrid.validPanel;PanelStructuralGrid.validPanel=p=>p?._structuralGridProof?.version===VERSION?validPanel(p):old(p);PanelStructuralGrid._exteriorCompletionBound=true;}if(typeof PanelGeometry!=='undefined'&&!PanelGeometry._exteriorCompletionBound){const old=PanelGeometry.refine;PanelGeometry.refine=async function(url,p,log){return validPanel(p)?{...p}:old.call(this,url,p,log);};PanelGeometry._exteriorCompletionBound=true;}if(typeof PanelEdgeSpill!=='undefined'&&!PanelEdgeSpill._exteriorCompletionBound){for(const name of ['analyzeImage','analyzeRGBA']){const old=PanelEdgeSpill[name];if(typeof old==='function')PanelEdgeSpill[name]=function(...args){return validPanel(args[name==='analyzeImage'?1:3])?null:old.apply(this,args);};}PanelEdgeSpill._exteriorCompletionBound=true;}}
 function install(detector){bind();if(!detector||detector._exteriorCompletionInstalled)return;const old=detector.detect;detector.detect=async function(url,log){const prior=await old.call(this,url,log);if(!eligible(prior))return prior;try{const img=new Image();img.src=url;await img.decode();const add=supplementImage(img,prior,log);return add.length?prior.concat(add):prior;}catch(e){log?.('paper enclosure deferred: '+e.message);return prior;}};detector._exteriorCompletionInstalled=true;}
 return{supplementRGBA,supplementImage,validPanel,eligible,bind,install};
})();
if(typeof PanelDetect!=='undefined')PanelExteriorCompletion.install(PanelDetect);
if(typeof module!=='undefined')module.exports=PanelExteriorCompletion;
