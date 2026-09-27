/* Test73: bounded, rooted completion from several accepted neighbors.
 * Existing detectors and descriptors remain authoritative. Two independent
 * seed radii must agree away from a three-pixel boundary band. Already owned
 * content is excluded before consensus; this never redraws earlier frames.
 * Neighbors contribute actual exterior-paper rays, not proximity alone.
 */
const PanelSharedBoundaries = (() => {
 'use strict';
 const VERSION=29, METHOD='boundary-stable-rooted-paper-network';
 const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
 const geometry=p=>[p.x,p.y,p.w,p.h,p._contours];
 const inRange=(n,a,b)=>Number.isFinite(n)&&n>=a&&n<=b;
 const count=a=>a.reduce((s,v)=>s+!!v,0);
 function raster(p,w,h){
  const a=new Uint8Array(w*h);
  const rings=p?._contours;
  if(!Array.isArray(rings))return a;
  for(let y=0;y<h;y++){
   const Y=(y+.5)/h,xs=[];
   for(const q of rings)for(let k=0;k<q.length;k++){
    const u=q[k],v=q[(k+1)%q.length];
    if((u.y>Y)!==(v.y>Y))xs.push((u.x+(Y-u.y)*(v.x-u.x)/(v.y-u.y))*w);
   }
   xs.sort((a,b)=>a-b);
   for(let k=0;k+1<xs.length;k+=2)for(let x=Math.max(0,Math.ceil(xs[k]-.5));x<Math.min(w,Math.ceil(xs[k+1]-.5));x++)a[y*w+x]=1;
  }return a;
 }
 function oldValid(p){
  if(!p||!Array.isArray(p._contours))return false;
  if(p._identitySource==='matte-cell-frame')return typeof PanelMatteCells!=='undefined'&&PanelMatteCells.validPanel(p);
  const v=p._structuralGridProof?.version;
  return p._identitySource==='structural-grid-frame'&&v>=18&&v<=27&&typeof PanelStructuralGrid!=='undefined'&&PanelStructuralGrid.validPanel(p);
 }
 function eligible(prior){return Array.isArray(prior)&&prior.length>0&&prior.length<=24&&prior.every(oldValid);}
 function sourceValid(p,r){
  const v=p?._structuralGridProof,b=v?.seed?.box,w=v?.analysisWidth,h=v?.analysisHeight;
  return !!(v&&[4,6,8].includes(r)&&v.seedRadius===r&&v.version===18&&v.palette?.paper&&!v.recovery&&!v.seed?.splits?.length&&
   p._identitySource==='structural-grid-frame'&&p._geometryType==='ragged-gutter-cells'&&p._geometryOwner==='structural-grid-contours'&&
   p._contours?.length===1&&!p._quad&&!p._outline&&PanelRaggedGutters.validPanel(p)&&
   inRange(p.w*p.h,.025,.32)&&v.pixels/(p.w*p.h*w*h)>=.68&&v.seed.pixels/((b[2]-b[0])*(b[3]-b[1]))>=.40);
 }
 function dilate(a,w,h){const b=a.slice();for(let i=0;i<a.length;i++)if(a[i]){const x=i%w,y=i/w|0;if(x)b[i-1]=1;if(x+1<w)b[i+1]=1;if(y)b[i-w]=1;if(y+1<h)b[i+w]=1;}return b;}
 function boundaryBand(a,w,h){let b=new Uint8Array(a.length);for(let i=0;i<a.length;i++)if(!a[i])b[i]=1;for(let k=0;k<3;k++)b=dilate(b,w,h);return b;}
 function consensus(first,second,blocked,w,h){
  const a=raster(first,w,h),b=raster(second,w,h),n1=count(a),n2=count(b);let removed1=0,removed2=0,intersection=0,difference=0,union=0;
  for(let i=0;i<a.length;i++){if(blocked[i]){removed1+=a[i];removed2+=b[i];a[i]=b[i]=0;}if(a[i]||b[i])union++;if(a[i]!==b[i])difference++;if(a[i]&&b[i])intersection++;}
  if(!n1||!n2||removed1/n1>.025||removed2/n2>.025||intersection<.025*w*h||difference>Math.ceil(w*h*.00035)||difference/Math.max(union,1)>.002)return null;
  if(difference){const ab=boundaryBand(a,w,h),bb=boundaryBand(b,w,h);for(let i=0;i<a.length;i++)if(a[i]!==b[i]&&((a[i]&&!ab[i])||(b[i]&&!bb[i])))return null;}
  const mask=a.map((v,i)=>v&&b[i]?1:0);
  // A near-edge frame is allowed when its actual contour stays enclosed. No
  // artificial three-pixel margin is added; touching the source edge abstains.
  for(let x=0;x<w;x++)if(mask[x]||mask[(h-1)*w+x])return null;
  for(let y=0;y<h;y++)if(mask[y*w]||mask[y*w+w-1])return null;
  return {mask,evidence:{removedFirst:removed1,removedSecond:removed2,differencePixels:difference,unionPixels:union,pixels:intersection,boundaryRadius:3}};
 }
 function paperMask(rgba,w,h){
  const white=new Uint8Array(w*h),ext=new Uint8Array(w*h),queue=new Int32Array(w*h);let n=0,head=0;
  for(let i=0;i<white.length;i++){if(rgba[i*4+3]!==255)return null;white[i]=Math.min(rgba[4*i],rgba[4*i+1],rgba[4*i+2])>232?1:0;}
  const add=i=>{if(white[i]&&!ext[i]){ext[i]=1;queue[n++]=i;}};
  for(let x=0;x<w;x++){add(x);add((h-1)*w+x);}for(let y=0;y<h;y++){add(y*w);add(y*w+w-1);}
  while(head<n){const i=queue[head++],x=i%w,y=i/w|0;if(x)add(i-1);if(x+1<w)add(i+1);if(y)add(i-w);if(y+1<h)add(i+w);}
  return ext;
 }
 function bbox(mask,w,h){let x0=w,y0=h,x1=0,y1=0;for(let i=0;i<mask.length;i++)if(mask[i]){const x=i%w,y=i/w|0;x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x+1);y1=Math.max(y1,y+1);}return [x0,y0,x1,y1];}
 function internalDivider(a,paper,w,h){
  const [x0,y0,x1,y1]=bbox(a,w,h),total=count(a);
  for(let axis=0;axis<2;axis++){
   const length=axis?x1-x0:y1-y0,span=axis?y1-y0:x1-x0,band=Math.max(8,Math.round(length*.055)),margin=Math.max(2*band,Math.round(length*.12));
   const rowCounts=new Uint32Array(length);for(let t=0;t<length;t++)for(let z=0;z<span;z++)rowCounts[t]+=a[(axis?y0+z:y0+t)*w+(axis?x0+t:x0+z)];
   let before=0;
   for(let pos=0;pos<length;pos++){
    before+=rowCounts[pos];if(pos<margin||pos>=length-margin||Math.min(before,total-before)<total*.12)continue;
    let gap=0,flank=0;
    for(let t=0;t<span;t++){const i=(axis?y0+t:y0+pos)*w+(axis?x0+pos:x0+t),step=axis?1:w;if(paper[i]){gap++;if(a[i-band*step]&&a[i+band*step])flank++;}}
    // Short exterior wedges between protruding edge tips do not bisect a
    // scene. A rejecting seam must span a substantial transverse interior.
    if(gap/span>.45&&flank/span>.28)return true;
   }
  }return false;
 }
 function witness(a,neighbors,paper,w,h){
  const labels=new Uint8Array(w*h);for(let k=0;k<neighbors.length;k++)for(let i=0;i<labels.length;i++)if(neighbors[k].mask[i]&&!labels[i])labels[i]=k+1;
  const limit=Math.max(8,Math.round(Math.min(w,h)*.06)),options=[];
  for(let side=0;side<4;side++){
   const length=side<2?w:h,cross=side<2?h:w,step=side===0||side===2?-1:1,at=(t,z)=>side<2?z*w+t:t*w+z;
   let samples=0;const rays=[];
   for(let t=0;t<length;t++){
    let edge=-1;for(let z=step<0?0:cross-1;z>=0&&z<cross;z-=step)if(a[at(t,z)]){edge=z;break;}
    if(edge<0)continue;samples++;let whites=0,other=0;
    for(let d=1;d<=limit;d++){
     const z=edge+step*d;if(z<0||z>=cross)break;const i=at(t,z);if(a[i])break;
     if(labels[i]){if(whites>=2&&other<=2)rays.push([t,edge,z,whites,other,labels[i]-1]);break;}
     if(paper[i])whites++;else other++;if(other>2)break;
    }
   }
   if(rays.length>=Math.max(24,Math.ceil(Math.min(w,h)*.10))&&rays.length>=samples*.45){
    const used=[...new Set(rays.map(r=>r[5]))].sort((a,b)=>a-b);
    options.push({side,limit,samples,rays:rays.map(r=>[...r.slice(0,5),used.indexOf(r[5])]),neighbors:used.map(k=>neighbors[k].p)});
   }
  }
  options.sort((a,b)=>b.rays.length-a.rays.length||a.side-b.side);return options[0]||null;
 }
 function validPanel(p,seen=new Set()){try{
  const v=p?._structuralGridProof,w=v?.analysisWidth,h=v?.analysisHeight;
  if(seen.has(p)||seen.size>4)return false;seen=new Set(seen);seen.add(p);
  if(p?._identitySource!=='structural-grid-frame'||p._geometryOwner!=='structural-grid-contours'||p._geometryType!=='shared-boundary-paper-cell'||p._quad||p._outline||v?.version!==VERSION||v.method!==METHOD||v.originalOwnerOverlap!==0||v.connected!==true||
   !Number.isInteger(w)||!Number.isInteger(h)||w<250||h<350||w>900||h>900||!Number.isInteger(v.depth)||!inRange(v.depth,1,3)||
   !([4,6].every((n,i)=>v.radii?.[i]===n)||[6,8].every((n,i)=>v.radii?.[i]===n))||v.radii.length!==2||
   !sourceValid(v.first,v.radii[0])||!sourceValid(v.second,v.radii[1]))return false;
  for(const q of [v.first,v.second])if(q._structuralGridProof.analysisWidth!==w||q._structuralGridProof.analysisHeight!==h)return false;
  const rooted=q=>q?._structuralGridProof?.version===VERSION?validPanel(q,seen):oldValid(q);
  if(!Array.isArray(v.blockers)||v.blockers.length>24||v.blockers.some(q=>!rooted(q)))return false;
  const blocked=new Uint8Array(w*h);for(const q of v.blockers){const m=raster(q,w,h);for(let i=0;i<m.length;i++)blocked[i]|=m[i];}
  const c=consensus(v.first,v.second,blocked,w,h);if(!c||!same(c.evidence,v.stability))return false;
  const rings=PanelMatteCells.tracePixelContours(c.mask,w,h,1);if(!rings||rings.length!==1||!same(v.pixelContours,rings)||!same(p._contours,rings.map(q=>q.map(([x,y])=>({x:x/w,y:y/h})))))return false;
  const [x0,y0,x1,y1]=bbox(c.mask,w,h);if(!same([p.x,p.y,p.w,p.h],[x0/w,y0/h,(x1-x0)/w,(y1-y0)/h]))return false;
  const e=v.shared;if(!e||!Number.isInteger(e.side)||!inRange(e.side,0,3)||!Array.isArray(e.neighbors)||!e.neighbors.length||e.neighbors.length>24||e.neighbors.some(q=>!rooted(q))||
   e.limit!==Math.max(8,Math.round(Math.min(w,h)*.06))||!Number.isInteger(e.samples)||!Array.isArray(e.rays)||e.rays.length<Math.max(24,Math.ceil(Math.min(w,h)*.10))||e.rays.length<e.samples*.45||e.rays.length>e.samples)return false;
  const depths=e.neighbors.map(q=>q._structuralGridProof?.version===VERSION?q._structuralGridProof.depth:0);if(v.depth!==Math.max(...depths)+1)return false;
  const masks=e.neighbors.map(q=>raster(q,w,h));if(masks.some(m=>m.some((n,i)=>n&&c.mask[i])))return false;
  const length=e.side<2?w:h,cross=e.side<2?h:w,step=e.side===0||e.side===2?-1:1,at=(t,z)=>e.side<2?z*w+t:t*w+z;
  let prev=-1,samples=0;for(let t=0;t<length;t++){for(let z=0;z<cross;z++)if(c.mask[at(t,z)]){samples++;break;}}if(samples!==e.samples)return false;
  const used=new Set();
  for(const r of e.rays){if(!Array.isArray(r)||r.length!==6||r.some(n=>!Number.isInteger(n)))return false;
   const [t,a,b,white,other,k]=r,d=(b-a)*step;if(t<=prev||t<0||t>=length||a<0||b<0||a>=cross||b>=cross||!inRange(k,0,masks.length-1)||!inRange(d,3,e.limit)||white<2||!inRange(other,0,2)||white+other!==d-1||!c.mask[at(t,a)]||!masks[k][at(t,b)])return false;
   for(let dd=1;dd<d;dd++)if(c.mask[at(t,a+step*dd)]||masks.some(m=>m[at(t,a+step*dd)]))return false;
   prev=t;used.add(k);
  }
  return used.size===masks.length;
 }catch(_){return false;}}
 function supplementRGBA(rgba,w,h,prior,log,audit){
  const report={eligible:eligible(prior),sources:[],pairs:0,consensus:0,dividerRejected:0,unwitnessed:0,accepted:0};
  const finish=out=>{audit?.(report);return out;};
  if(!report.eligible||!Number.isInteger(w)||!Number.isInteger(h)||w<250||h<350||w>900||h>900||rgba?.length!==w*h*4)return finish([]);
  const paper=paperMask(rgba,w,h);if(!paper)return finish([]);
  const sources=[4,6,8].map(r=>PanelRaggedGutters.analyzeCooperativeRGBA(rgba,w,h,r));report.sources=sources.map(p=>p.length);
  const neighbors=prior.map(p=>({p,mask:raster(p,w,h)})),occupied=new Uint8Array(w*h),out=[];
  for(const n of neighbors)for(let i=0;i<occupied.length;i++)occupied[i]|=n.mask[i];
  const proposals=[];
  for(let k=0;k<2;k++)for(const p of sources[k+1]){
   const radii=k?[6,8]:[4,6];if(!sourceValid(p,radii[1]))continue;
   const pm=raster(p,w,h);if(pm.reduce((s,n,i)=>s+(n&&occupied[i]?1:0),0)>.025*count(pm))continue;
   const matches=[];
   for(const q of sources[k]){
    if(!sourceValid(q,radii[0]))continue;
    if(Math.abs(p.x-q.x)> .04||Math.abs(p.y-q.y)>.04||Math.abs(p.w-q.w)>.04||Math.abs(p.h-q.h)>.04)continue;
    report.pairs++;const c=consensus(q,p,occupied,w,h);if(c)matches.push({first:q,second:p,radii,c});
   }
   if(matches.length===1){report.consensus++;proposals.push(matches[0]);}
  }
  // Repeated rounds use only already accepted nodes. No candidate may justify
  // its own boundary or mutually justify an unrooted cycle.
  for(let round=0;round<3;round++){
   const accepted=[];
   for(const pr of proposals){
    if(pr.used)continue;
    const c=consensus(pr.first,pr.second,occupied,w,h);if(!c)continue;
    if(internalDivider(c.mask,paper,w,h)){report.dividerRejected++;pr.used=true;continue;}
    const rings=PanelMatteCells.tracePixelContours(c.mask,w,h,1);if(!rings||rings.length!==1){pr.used=true;continue;}
    const evidence=witness(c.mask,neighbors,paper,w,h);if(!evidence){report.unwitnessed++;continue;}
    const depth=1+Math.max(...evidence.neighbors.map(q=>q._structuralGridProof?.version===VERSION?q._structuralGridProof.depth:0));if(depth>3)continue;
    const rawA=raster(pr.first,w,h),rawB=raster(pr.second,w,h),blockers=neighbors.filter(n=>n.mask.some((v,i)=>v&&(rawA[i]||rawB[i]))).map(n=>n.p);
    const [x0,y0,x1,y1]=bbox(c.mask,w,h);
    const p={x:x0/w,y:y0/h,w:(x1-x0)/w,h:(y1-y0)/h,_identitySource:'structural-grid-frame',_geometryOwner:'structural-grid-contours',_geometryType:'shared-boundary-paper-cell',
     _contours:rings.map(q=>q.map(([x,y])=>({x:x/w,y:y/h}))),_structuralGridProof:{version:VERSION,method:METHOD,connected:true,analysisWidth:w,analysisHeight:h,depth,radii:pr.radii,first:pr.first,second:pr.second,blockers,stability:c.evidence,originalOwnerOverlap:0,pixelContours:rings,shared:evidence}};
    if(!validPanel(p)){pr.used=true;continue;}
    if(c.mask.some((v,i)=>v&&occupied[i]))continue;
    out.push(p);accepted.push({p,mask:c.mask});pr.used=true;
    for(let i=0;i<occupied.length;i++)occupied[i]|=c.mask[i];
   }
   if(!accepted.length)break;neighbors.push(...accepted);if(out.length>=8)break;
  }
  report.accepted=out.length;if(out.length)log?.('shared-boundary network: '+out.length+' rooted, boundary-stable additions');return finish(out);
 }
 function supplementImage(img,prior,log,audit){
  if(!eligible(prior)||typeof PanelMatteCells==='undefined')return[];
  const W=img.naturalWidth||img.width,H=img.naturalHeight||img.height;if(!W||!H||W*H>24000000)return[];let c;
  try{c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d',{willReadFrequently:true});if(!g)return[];g.drawImage(img,0,0);const s=Math.min(1,900/Math.max(W,H)),w=Math.round(W*s),h=Math.round(H*s);return supplementRGBA(PanelMatteCells.sampleBilinearRGBA(g.getImageData(0,0,W,H).data,W,H,w,h),w,h,prior,log,audit);}finally{if(c){c.width=c.height=1;}}
 }
 function bind(){
  if(typeof PanelStructuralGrid!=='undefined'&&!PanelStructuralGrid._sharedBoundariesBound){const old=PanelStructuralGrid.validPanel;PanelStructuralGrid.validPanel=function(p){return p?._structuralGridProof?.version===VERSION?validPanel(p):old.call(this,p);};PanelStructuralGrid._sharedBoundariesBound=true;}
  if(typeof PanelGeometry!=='undefined'&&!PanelGeometry._sharedBoundariesBound){const old=PanelGeometry.refine;PanelGeometry.refine=async function(url,p,log){return validPanel(p)?{...p}:old.call(this,url,p,log);};PanelGeometry._sharedBoundariesBound=true;}
  if(typeof PanelEdgeSpill!=='undefined'&&!PanelEdgeSpill._sharedBoundariesBound){for(const name of ['analyzeImage','analyzeRGBA']){const old=PanelEdgeSpill[name];if(typeof old==='function')PanelEdgeSpill[name]=function(...args){return validPanel(args[name==='analyzeImage'?1:3])?null:old.apply(this,args);};}PanelEdgeSpill._sharedBoundariesBound=true;}
 }
 function install(detector){
  bind();if(!detector||detector._sharedBoundariesInstalled)return;const old=detector.detect;
  detector.detect=async function(url,log){const prior=await old.call(this,url,log);if(!eligible(prior))return prior;try{const img=new Image();img.src=url;await img.decode();const added=supplementImage(img,prior,log);return added.length?prior.concat(added):prior;}catch(e){log?.('shared-boundary completion deferred: '+e.message);return prior;}};detector._sharedBoundariesInstalled=true;
 }
 return {supplementRGBA,supplementImage,validPanel,eligible,bind,install};
})();
if(typeof PanelDetect!=='undefined')PanelSharedBoundaries.install(PanelDetect);
if(typeof module!=='undefined')module.exports=PanelSharedBoundaries;
