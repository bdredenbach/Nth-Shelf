/* Test76 candidate — stable chromatic/shared-ink border separation.
 *
 * Some inset banks use one connected chromatic rim around multiple scenes and
 * finish the shared side with black ink. A colour-only hole therefore merges
 * two scenes. This supplement accepts only a two-lobed enclosed chromatic hole
 * whose two independently eroded cores produce the exact same minimum-barrier
 * watershed on the source luminance gradient. The shared cut must itself be a
 * strong image edge. Existing owners are never reassigned.
 *
 * No filenames, page numbers, hashes, tap positions, or fixed layouts are used.
 */
const PanelChromaticSharedBorder=(()=>{
 'use strict';
 const VERSION=32,METHOD='two-core-stable-chromatic-shared-border';
 const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
 const range=(x,a,b)=>Number.isFinite(x)&&x>=a&&x<=b;
 const count=a=>a.reduce((s,v)=>s+!!v,0);
 const verified=new WeakMap();
 function freeze(x){if(x&&typeof x==='object'&&!Object.isFrozen(x)){Object.freeze(x);for(const y of Object.values(x))freeze(y);}return x;}
 function area(q){let a=0;for(let i=0;i<q.length;i++){const p=q[i],n=q[(i+1)%q.length];a+=p[0]*n[1]-n[0]*p[1];}return a/2;}
 function cc(mask,w,h,diag=false){
  const ids=new Int32Array(mask.length),queue=new Int32Array(mask.length),items=[];let id=0;
  for(let seed=0;seed<mask.length;seed++)if(mask[seed]&&!ids[seed]){
   let n=1,head=0,x0=w,y0=h,x1=0,y1=0,sx=0,sy=0;queue[0]=seed;ids[seed]=++id;
   while(head<n){const i=queue[head++],x=i%w,y=i/w|0;x0=Math.min(x0,x);x1=Math.max(x1,x+1);y0=Math.min(y0,y);y1=Math.max(y1,y+1);sx+=x;sy+=y;
    const add=j=>{if(mask[j]&&!ids[j]){ids[j]=id;queue[n++]=j;}};
    if(x)add(i-1);if(x+1<w)add(i+1);if(y)add(i-w);if(y+1<h)add(i+w);
    if(diag){if(x&&y)add(i-w-1);if(x+1<w&&y)add(i-w+1);if(x&&y+1<h)add(i+w-1);if(x+1<w&&y+1<h)add(i+w+1);}
   }
   items.push({id,pixels:n,box:[x0,y0,x1,y1],centroid:[sx/n,sy/n]});if(id>32000)return null;
  }return{ids,items};
 }
 function dilate8(a,w,h){const b=a.slice();for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=y*w+x;if(a[i])continue;let hit=false;for(let dy=-1;dy<=1&&!hit;dy++)for(let dx=-1;dx<=1;dx++){if(!dx&&!dy)continue;const X=x+dx,Y=y+dy;if(X>=0&&Y>=0&&X<w&&Y<h&&a[Y*w+X]){hit=true;break;}}if(hit)b[i]=1;}return b;}
 function raster(p,w,h){
  const mask=new Uint8Array(w*h),rings=p._contours||[p._outline||p._quad||[{x:p.x,y:p.y},{x:p.x+p.w,y:p.y},{x:p.x+p.w,y:p.y+p.h},{x:p.x,y:p.y+p.h}]];
  for(let y=0;y<h;y++){const Y=(y+.5)/h,xs=[];for(const q of rings)for(let j=0;j<q.length;j++){const a=q[j],b=q[(j+1)%q.length];if((a.y>Y)!==(b.y>Y))xs.push((a.x+(Y-a.y)*(b.x-a.x)/(b.y-a.y))*w);}xs.sort((a,b)=>a-b);for(let j=0;j+1<xs.length;j+=2)for(let x=Math.max(0,Math.ceil(xs[j]-.5));x<Math.min(w,Math.ceil(xs[j+1]-.5));x++)mask[y*w+x]=1;}return mask;
 }
 function extent(a,w,h){let x0=w,y0=h,x1=0,y1=0;for(let i=0;i<a.length;i++)if(a[i]){const x=i%w,y=i/w|0;x0=Math.min(x0,x);x1=Math.max(x1,x+1);y0=Math.min(y0,y);y1=Math.max(y1,y+1);}return[x0,y0,x1,y1];}
 function colourFields(rgba,w,h){
  const N=w*h,hue=new Float32Array(N),sat=new Float32Array(N),val=new Uint8Array(N),lum=new Float32Array(N);
  for(let i=0;i<N;i++){
   if(rgba[i*4+3]!==255)return null;const r=rgba[i*4],g=rgba[i*4+1],b=rgba[i*4+2],mx=Math.max(r,g,b),mn=Math.min(r,g,b),d=mx-mn;
   val[i]=mx;sat[i]=mx?d/mx:0;hue[i]=!d?0:mx===r?(((g-b)/d+6)%6)/6:mx===g?((b-r)/d+2)/6:((r-g)/d+4)/6;lum[i]=r*.299+g*.587+b*.114;
  }return{hue,sat,val,lum};
 }
 function gradient(lum,w,h){
  const out=new Float32Array(w*h),refl=(x,n)=>x<0?-x:x>=n?2*n-2-x:x,scale=5.656854249492381;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
   const at=(X,Y)=>lum[refl(Y,h)*w+refl(X,w)]/255;
   const a=at(x-1,y-1),b=at(x,y-1),c=at(x+1,y-1),d=at(x-1,y),e=at(x+1,y),f=at(x-1,y+1),g=at(x,y+1),j=at(x+1,y+1);
   const gx=-a+c-2*d+2*e-f+j,gy=-a-2*b-c+f+2*g+j;out[y*w+x]=Math.hypot(gx,gy)/scale;
  }return out;
 }
 function chamfer(mask,w,h){
  const INF=1<<26,d=new Int32Array(mask.length);for(let i=0;i<d.length;i++)d[i]=mask[i]?INF:0;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=y*w+x;if(!mask[i])continue;let v=d[i];if(x)v=Math.min(v,d[i-1]+3);if(y)v=Math.min(v,d[i-w]+3);if(x&&y)v=Math.min(v,d[i-w-1]+4);if(x+1<w&&y)v=Math.min(v,d[i-w+1]+4);d[i]=v;}
  for(let y=h-1;y>=0;y--)for(let x=w-1;x>=0;x--){const i=y*w+x;if(!mask[i])continue;let v=d[i];if(x+1<w)v=Math.min(v,d[i+1]+3);if(y+1<h)v=Math.min(v,d[i+w]+3);if(x+1<w&&y+1<h)v=Math.min(v,d[i+w+1]+4);if(x&&y+1<h)v=Math.min(v,d[i+w-1]+4);d[i]=v;}
  return d;
 }
 function coreField(dist,threshold,holePixels,w,h){
  const m=new Uint8Array(dist.length);for(let i=0;i<m.length;i++)m[i]=dist[i]>threshold?1:0;const c=cc(m,w,h,true);if(!c)return null;
  const min=Math.max(160,Math.floor(holePixels*.025)),keep=c.items.filter(q=>q.pixels>=min);if(keep.length!==2)return null;
  const dx=Math.abs(keep[0].centroid[0]-keep[1].centroid[0]),dy=Math.abs(keep[0].centroid[1]-keep[1].centroid[1]),axis=dx>=dy?0:1;keep.sort((a,b)=>a.centroid[axis]-b.centroid[axis]);
  const labels=new Uint8Array(dist.length);for(let i=0;i<labels.length;i++){const id=c.ids[i],k=keep[0].id===id?1:keep[1].id===id?2:0;if(k)labels[i]=k;}
  return{labels,axis,cores:keep.map(q=>({box:q.box.slice(),pixels:q.pixels,centroid:q.centroid.slice()}))};
 }
 function floodHole(hole,G,markers,w,h){
  const out=Uint8Array.from(markers),heap=[];let age=0;
  const less=(a,b)=>a[0]<b[0]||(a[0]===b[0]&&a[1]<b[1]);
  function push(a){let i=heap.length;heap.push(a);while(i){const p=(i-1)>>1;if(!less(a,heap[p]))break;heap[i]=heap[p];i=p;}heap[i]=a;}
  function pop(){const min=heap[0],a=heap.pop();if(heap.length){let i=0;while(2*i+1<heap.length){let c=2*i+1;if(c+1<heap.length&&less(heap[c+1],heap[c]))c++;if(!less(heap[c],a))break;heap[i]=heap[c];i=c;}heap[i]=a;}return min;}
  const front=i=>{const x=i%w,y=i/w|0;return(y&&hole[i-w]&&!out[i-w])||(y+1<h&&hole[i+w]&&!out[i+w])||(x&&hole[i-1]&&!out[i-1])||(x+1<w&&hole[i+1]&&!out[i+1]);};
  for(let i=0;i<out.length;i++)if(out[i]&&front(i))push([G[i],age++,i,out[i]]);
  while(heap.length){const [cost,t,i,label]=pop();if(out[i]!==label)continue;const x=i%w,y=i/w|0,adj=[y?i-w:-1,x?i-1:-1,x+1<w?i+1:-1,y+1<h?i+w:-1];for(const j of adj)if(j>=0&&hole[j]&&!out[j]){out[j]=label;push([Math.max(cost,G[j]),age++,j,label]);}}
  return out;
 }
 function percentile(a,p){if(!a.length)return 0;const b=a.slice().sort((x,y)=>x-y),x=(b.length-1)*p,lo=Math.floor(x),hi=Math.ceil(x);return lo===hi?b[lo]:b[lo]*(hi-x)+b[hi]*(x-lo);}
 function variance(mask,lum){let n=0,s=0,q=0;for(let i=0;i<mask.length;i++)if(mask[i]){const v=lum[i];n++;s+=v;q+=v*v;}return n?q/n-(s/n)**2:0;}
 function splitHole(hole,holeDesc,componentDesc,hueBin,G,lum,w,h){
  const minDim=Math.min(w,h),dist=chamfer(hole,w,h),thresholds=[Math.round(minDim*.0275*3),Math.round(minDim*.0305*3)],A=coreField(dist,thresholds[0],holeDesc.pixels,w,h),B=coreField(dist,thresholds[1],holeDesc.pixels,w,h);if(!A||!B||A.axis!==B.axis)return null;
  for(let k=0;k<2;k++){const a=A.cores[k].box,b=B.cores[k].box;if(b[0]<a[0]||b[1]<a[1]||b[2]>a[2]||b[3]>a[3])return null;}
  const X=floodHole(hole,G,A.labels,w,h),Y=floodHole(hole,G,B.labels,w,h);let diff=0,filled=0;for(let i=0;i<hole.length;i++){if(hole[i]){filled++;if(!X[i]||!Y[i])return null;}if(X[i]!==Y[i])diff++;}if(diff>Math.max(4,Math.floor(holeDesc.pixels*.00025))||filled!==holeDesc.pixels)return null;
  const regions=[],masks=[];for(let k=1;k<=2;k++){
   const m=new Uint8Array(hole.length);for(let i=0;i<m.length;i++)m[i]=Y[i]===k?1:0;const pixels=count(m),box=extent(m,w,h),boxArea=(box[2]-box[0])*(box[3]-box[1]),fill=pixels/boxArea,v=variance(m,lum);if(pixels<holeDesc.pixels*.28||pixels>holeDesc.pixels*.72||fill<.60||!range(v,500,16257))return null;regions.push({pixels,box,fill,variance:v});masks.push(m);
  }
  const vals=[];let contact=0;for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=y*w+x,a=Y[i];if(!a)continue;if(x+1<w&&Y[i+1]&&Y[i+1]!==a){contact++;vals.push(Math.max(G[i],G[i+1]));}if(y+1<h&&Y[i+w]&&Y[i+w]!==a){contact++;vals.push(Math.max(G[i],G[i+w]));}}
  const hw=holeDesc.box[2]-holeDesc.box[0],hh=holeDesc.box[3]-holeDesc.box[1],median=percentile(vals,.5),q75=percentile(vals,.75);if(contact<Math.max(24,Math.floor(Math.min(hw,hh)*.15))||median<.42||q75<.50)return null;
  return{masks,split:{hueBin,component:componentDesc,hole:holeDesc,thresholds,axis:B.axis===0?'x':'y',cores:[A.cores,B.cores],stabilityDifference:diff,regionPixels:regions.map(q=>q.pixels),regionBoxes:regions.map(q=>q.box),regionFills:regions.map(q=>q.fill),regionVariances:regions.map(q=>q.variance),contactEdges:contact,contactMedianGradient:median,contactQ75Gradient:q75}};
 }
 function panelFrom(mask,split,index,w,h){
  const rings=PanelMatteCells.tracePixelContours(mask,w,h,1);if(!rings||rings.length!==1)return null;const box=extent(mask,w,h),proof={version:VERSION,method:METHOD,connected:true,analysisWidth:w,analysisHeight:h,selectedIndex:index,originalOwnerOverlap:0,...split,pixels:split.regionPixels[index],box:split.regionBoxes[index].slice(),fill:split.regionFills[index],variance:split.regionVariances[index],pixelContours:rings};
  const p={x:box[0]/w,y:box[1]/h,w:(box[2]-box[0])/w,h:(box[3]-box[1])/h,_identitySource:'structural-grid-frame',_geometryOwner:'structural-grid-contours',_geometryType:'chromatic-shared-border-cell',_contours:rings.map(q=>q.map(([x,y])=>({x:x/w,y:y/h}))),_structuralGridProof:proof};return p;
 }
 function proofValid(p){try{
  const v=p?._structuralGridProof,w=v?.analysisWidth,h=v?.analysisHeight,N=w*h,minDim=Math.min(w,h);
  if(p?._quad||p?._outline||p?._identitySource!=='structural-grid-frame'||p._geometryOwner!=='structural-grid-contours'||p._geometryType!=='chromatic-shared-border-cell'||v?.version!==VERSION||v.method!==METHOD||v.connected!==true||v.originalOwnerOverlap!==0||![0,1].includes(v.selectedIndex)||!Number.isInteger(w)||!Number.isInteger(h)||w<250||h<350||w>900||h>900||!Number.isInteger(v.hueBin)||!range(v.hueBin,0,11))return false;
  const thresholds=[Math.round(minDim*.0275*3),Math.round(minDim*.0305*3)];if(!same(v.thresholds,thresholds)||!['x','y'].includes(v.axis)||!Number.isInteger(v.stabilityDifference)||v.stabilityDifference<0||v.stabilityDifference>Math.max(4,Math.floor(v.hole.pixels*.00025)))return false;
  const boxOk=b=>Array.isArray(b)&&b.length===4&&b.every((n,i)=>Number.isInteger(n)&&n>=0&&n<=(i%2?h:w))&&b[0]<b[2]&&b[1]<b[3];
  if(!v.component||!boxOk(v.component.box)||!Number.isInteger(v.component.pixels)||v.component.pixels<350||!v.hole||!boxOk(v.hole.box)||!Number.isInteger(v.hole.pixels)||!range(v.hole.pixels,N*.018,N*.11))return false;
  if(!Array.isArray(v.cores)||v.cores.length!==2||v.cores.some(s=>!Array.isArray(s)||s.length!==2||s.some(c=>!boxOk(c.box)||!Number.isInteger(c.pixels)||c.pixels<160||!Array.isArray(c.centroid)||c.centroid.length!==2||c.centroid.some(Number.isNaN))))return false;
  for(let k=0;k<2;k++){const a=v.cores[0][k].box,b=v.cores[1][k].box;if(b[0]<a[0]||b[1]<a[1]||b[2]>a[2]||b[3]>a[3])return false;}
  if(!Array.isArray(v.regionPixels)||v.regionPixels.length!==2||v.regionPixels.some(n=>!Number.isInteger(n)||n<v.hole.pixels*.28||n>v.hole.pixels*.72)||v.regionPixels[0]+v.regionPixels[1]!==v.hole.pixels)return false;
  if(!Array.isArray(v.regionBoxes)||v.regionBoxes.length!==2||v.regionBoxes.some(b=>!boxOk(b))||!Array.isArray(v.regionFills)||v.regionFills.length!==2||v.regionFills.some(x=>!range(x,.60,1))||!Array.isArray(v.regionVariances)||v.regionVariances.length!==2||v.regionVariances.some(x=>!range(x,500,16257)))return false;
  if(!Number.isInteger(v.contactEdges)||v.contactEdges<24||!range(v.contactMedianGradient,.42,6)||!range(v.contactQ75Gradient,.50,6)||v.contactQ75Gradient<v.contactMedianGradient)return false;
  if(v.pixels!==v.regionPixels[v.selectedIndex]||!same(v.box,v.regionBoxes[v.selectedIndex])||Math.abs(v.fill-v.regionFills[v.selectedIndex])>1e-12||Math.abs(v.variance-v.regionVariances[v.selectedIndex])>1e-9)return false;
  const rings=v.pixelContours;if(!Array.isArray(rings)||rings.length!==1||rings[0].length<4||rings[0].length>4096||rings[0].some(a=>!Array.isArray(a)||a.length!==2||!Number.isInteger(a[0])||!Number.isInteger(a[1])||a[0]<0||a[0]>w||a[1]<0||a[1]>h)||Math.abs(area(rings[0]))!==v.pixels)return false;
  if(!same(p._contours,rings.map(q=>q.map(([x,y])=>({x:x/w,y:y/h})))))return false;const m=raster(p,w,h),b=extent(m,w,h);if(count(m)!==v.pixels||!same(b,v.box))return false;
  return same([p.x,p.y,p.w,p.h],[b[0]/w,b[1]/h,(b[2]-b[0])/w,(b[3]-b[1])/h]);
 }catch(_){return false;}}
 function validPanel(p){const v=p?._structuralGridProof,cache=v&&verified.get(v);return cache&&p._contours===cache.contours?same([p.x,p.y,p.w,p.h],cache.box)&&p._identitySource==='structural-grid-frame'&&p._geometryOwner==='structural-grid-contours'&&p._geometryType==='chromatic-shared-border-cell'&&!p._quad&&!p._outline:proofValid(p);}
 function eligible(prior){return Array.isArray(prior)&&prior.length<=24&&prior.every(p=>p&&['x','y','w','h'].every(k=>Number.isFinite(p[k]))&&p.x>=0&&p.y>=0&&p.w>0&&p.h>0&&p.x+p.w<=1.000001&&p.y+p.h<=1.000001);}
 function supplementRGBA(rgba,w,h,prior,log,audit){
  const report={components:0,holes:0,twoCore:0,stable:0,edge:0,overlap:0,accepted:0};const done=x=>{audit?.(report);return x;};if(!eligible(prior)||!Number.isInteger(w)||!Number.isInteger(h)||w<250||h<350||w>900||h>900||rgba?.length!==w*h*4||typeof PanelMatteCells==='undefined')return done([]);
  const F=colourFields(rgba,w,h);if(!F)return done([]);const G=gradient(F.lum,w,h),N=w*h,minDim=Math.min(w,h),occupied=new Uint8Array(N);for(const p of prior){const m=raster(p,w,h);for(let i=0;i<N;i++)occupied[i]|=m[i];}
  const proposals=[];
  for(let bin=0;bin<12;bin++){
   const center=bin/12,mask=new Uint8Array(N);for(let i=0;i<N;i++){const d=Math.abs(F.hue[i]-center);mask[i]=Math.min(d,1-d)<1/24&&F.sat[i]>.48&&F.val[i]>60?1:0;}
   const C=cc(mask,w,h,true);if(!C)return done([]);
   for(const comp of C.items){const [x0,y0,x1,y1]=comp.box,bw=x1-x0,bh=y1-y0,A=bw*bh;if(comp.pixels<Math.max(350,Math.floor(N*.0007))||bw<minDim*.10||bh<minDim*.10||A>N*.30||comp.pixels/A>.28)continue;report.components++;
    const cm=new Uint8Array(N);for(let i=0;i<N;i++)cm[i]=C.ids[i]===comp.id?1:0;const wall=dilate8(cm,w,h),inv=new Uint8Array(N);for(let i=0;i<N;i++)inv[i]=wall[i]?0:1;const H=cc(inv,w,h,false);if(!H)return done([]);
    for(const hole of H.items){const [hx0,hy0,hx1,hy1]=hole.box,hw=hx1-hx0,hh=hy1-hy0,HA=hw*hh;if(hx0===0||hy0===0||hx1===w||hy1===h||hx0<x0-3||hy0<y0-3||hx1>x1+3||hy1>y1+3||hole.pixels<N*.018||hole.pixels>N*.11||hole.pixels/HA<.62||hw<minDim*.10||hh<minDim*.16)continue;report.holes++;
     const hm=new Uint8Array(N);for(let i=0;i<N;i++)hm[i]=H.ids[i]===hole.id?1:0;const split=splitHole(hm,{box:hole.box.slice(),pixels:hole.pixels},{box:comp.box.slice(),pixels:comp.pixels},bin,G,F.lum,w,h);if(!split)continue;report.twoCore++;report.stable++;
     let collision=false;for(const m of split.masks)for(let i=0;i<N;i++)if(m[i]&&occupied[i]){collision=true;break;}if(collision){report.overlap++;continue;}
     const pair=split.masks.map((m,k)=>panelFrom(m,split.split,k,w,h));if(pair.some(p=>!p||!proofValid(p)))continue;report.edge++;
     proposals.push({pair,masks:split.masks});
    }
   }
  }
  for(let a=0;a<proposals.length;a++)for(let b=0;b<a;b++){let ov=0;for(let k=0;k<N;k++)if((proposals[a].masks[0][k]||proposals[a].masks[1][k])&&(proposals[b].masks[0][k]||proposals[b].masks[1][k])){ov++;if(ov>32)return done([]);}}
  if(proposals.length>2)return done([]);const out=[];for(const q of proposals)for(const p of q.pair){const v=JSON.parse(JSON.stringify(p._structuralGridProof));p._structuralGridProof=freeze(v);p._contours=freeze(p._contours);verified.set(p._structuralGridProof,{contours:p._contours,box:[p.x,p.y,p.w,p.h]});out.push(p);}
  report.accepted=out.length;if(out.length)log?.('chromatic shared border: '+out.length+' two-core stable frames');return done(out);
 }
 function supplementImage(img,prior,log,audit){if(!eligible(prior))return[];const W=img.naturalWidth||img.width,H=img.naturalHeight||img.height;if(!W||!H||W*H>24000000)return[];let c;try{c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d',{willReadFrequently:true});if(!g)return[];g.drawImage(img,0,0);const s=Math.min(1,900/Math.max(W,H)),w=Math.round(W*s),h=Math.round(H*s);return supplementRGBA(PanelMatteCells.sampleBilinearRGBA(g.getImageData(0,0,W,H).data,W,H,w,h),w,h,prior,log,audit);}finally{if(c)c.width=c.height=1;}}
 function bind(){
  if(typeof PanelStructuralGrid!=='undefined'&&!PanelStructuralGrid._chromaticSharedBorder){const old=PanelStructuralGrid.validPanel;PanelStructuralGrid.validPanel=p=>p?._structuralGridProof?.version===VERSION?validPanel(p):old(p);PanelStructuralGrid._chromaticSharedBorder=true;}
  if(typeof PanelGeometry!=='undefined'&&!PanelGeometry._chromaticSharedBorder){const old=PanelGeometry.refine;PanelGeometry.refine=async function(url,p,log){return validPanel(p)?{...p}:old.call(this,url,p,log);};PanelGeometry._chromaticSharedBorder=true;}
  if(typeof PanelEdgeSpill!=='undefined'&&!PanelEdgeSpill._chromaticSharedBorder){for(const name of ['analyzeImage','analyzeRGBA']){const old=PanelEdgeSpill[name];if(typeof old==='function')PanelEdgeSpill[name]=function(...args){return validPanel(args[name==='analyzeImage'?1:3])?null:old.apply(this,args);};}PanelEdgeSpill._chromaticSharedBorder=true;}
 }
 function install(detector){bind();if(!detector||detector._chromaticSharedBorder)return;const old=detector.detect;detector.detect=async function(url,log){const prior=await old.call(this,url,log);if(!eligible(prior))return prior;try{const img=new Image();img.src=url;await img.decode();const added=supplementImage(img,prior,log);return added.length?prior.concat(added):prior;}catch(e){log?.('chromatic shared border deferred: '+e.message);return prior;}};detector._chromaticSharedBorder=true;}
 return{supplementRGBA,supplementImage,validPanel,eligible,bind,install};
})();
if(typeof PanelDetect!=='undefined')PanelChromaticSharedBorder.install(PanelDetect);
if(typeof module!=='undefined')module.exports=PanelChromaticSharedBorder;
