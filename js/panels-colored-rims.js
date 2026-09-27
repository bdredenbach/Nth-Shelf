/* Independently enclosed chromatic rims. A hue is never a panel identity:
 * four long narrow strokes with darker collars must surround a textured cell.
 * Compact paper bodies can close occlusions; only the majority-owned bodies
 * are retained. Open rims and foreground silhouettes are deliberately deferred.
 * Empty-map supplement; no filenames, page numbers, tap positions or layouts. */
const PanelColoredRims=(()=>{
 'use strict';
 const METHOD='four-chromatic-ridges-with-paper-occlusion',finite=Number.isFinite;
 const area=q=>q.reduce((s,a,i)=>{const b=q[(i+1)%q.length];return s+a[0]*b[1]-b[0]*a[1]},0)/2;
 const range=(v,a,b)=>finite(v)&&v>=a&&v<=b;
 function cc(mask,w,h){const ids=new Int32Array(mask.length),queue=new Int32Array(mask.length),items=[];let id=0;for(let seed=0;seed<mask.length;seed++)if(mask[seed]&&!ids[seed]){let n=1,head=0,x0=w,y0=h,x1=0,y1=0;queue[0]=seed;ids[seed]=++id;while(head<n){const i=queue[head++],x=i%w,y=i/w|0;x0=Math.min(x0,x);x1=Math.max(x1,x+1);y0=Math.min(y0,y);y1=Math.max(y1,y+1);const add=j=>{if(mask[j]&&!ids[j]){ids[j]=id;queue[n++]=j;}};if(x)add(i-1);if(x+1<w)add(i+1);if(y)add(i-w);if(y+1<h)add(i+w);}items.push({id,pixels:n,box:[x0,y0,x1,y1]});if(id>32000)return null;}return {ids,items};}
 function dilate(a,w,h){const b=a.slice();for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=y*w+x;if(!a[i]&&((x&&a[i-1])||(x+1<w&&a[i+1])||(y&&a[i-w])||(y+1<h&&a[i+w])))b[i]=1;}return b;}
 function outside(mask,w,h){const seen=new Uint8Array(mask.length),queue=new Int32Array(mask.length);let n=0,head=0;const add=i=>{if(!mask[i]&&!seen[i]){seen[i]=1;queue[n++]=i;}};for(let x=0;x<w;x++){add(x);add((h-1)*w+x);}for(let y=0;y<h;y++){add(y*w);add(y*w+w-1);}while(head<n){const i=queue[head++],x=i%w,y=i/w|0;if(x)add(i-1);if(x+1<w)add(i+1);if(y)add(i-w);if(y+1<h)add(i+w);}return seen;}
 function whiteBodies(white,w,h){const bodies=cc(white,w,h);if(!bodies)return null;const out=[],wall=new Uint8Array(w*h);for(const c of bodies.items){if(c.pixels<=120||c.pixels>=w*h*.07)continue;const [x0,y0,x1,y1]=c.box,W=x1-x0+10,H=y1-y0+10,patch=new Uint8Array(W*H);for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++)if(bodies.ids[y*w+x]===c.id)patch[(y-y0+5)*W+x-x0+5]=1;const ex=outside(patch,W,H),obj=new Uint8Array(W*H);let pixels=0;for(let y=5;y<H-5;y++)for(let x=5;x<W-5;x++)if(!ex[y*W+x]){obj[y*W+x]=1;pixels++;}if(pixels>=w*h*.07)continue;const grown=dilate(dilate(obj,W,H),W,H);let collar=grown;for(let k=0;k<3;k++)collar=dilate(collar,W,H);const indices=[],collarIndices=[];for(let y=0;y<H;y++)for(let x=0;x<W;x++){const xx=x+x0-5,yy=y+y0-5;if(xx<0||xx>=w||yy<0||yy>=h)continue;const i=yy*w+xx,j=y*W+x;if(grown[j]){wall[i]=1;indices.push(i);}else if(collar[j])collarIndices.push(i);}out.push({box:c.box,pixels,indices,collarIndices});if(out.length>128)return null;}return {items:out,wall};}
 function longRuns(mask,w,h,vertical){const out=new Uint8Array(mask.length),T=vertical?h:w,P=vertical?w:h;let hits=0;for(let p=0;p<P;p++)for(let t=0;t<T;t++){const at=u=>vertical?u*w+p:p*w+u;if(!mask[at(t)])continue;const lo=t;while(t+1<T&&mask[at(t+1)])t++;if(t-lo+1>=60)for(let k=lo;k<=t;k++){out[at(k)]=1;hits++;}}return {mask:out,hits};}
 function narrowRidges(runs,mask,mean,w,h,vertical){const out=new Uint8Array(mask.length);let hits=0;const step=vertical?1:w,limit=vertical?w:h;for(let i=0;i<mask.length;i++)if(runs[i]){const p=vertical?i%w:i/w|0;let lo=0,hi=0;while(lo<12&&p-lo>0&&mask[i-(lo+1)*step])lo++;while(hi<12&&p+hi+1<limit&&mask[i+(hi+1)*step])hi++;if(lo+hi+1>12)continue;let a=255,b=255;for(let d=1;d<=3;d++){a=Math.min(a,mean[i-Math.min(p,lo+d)*step]);b=Math.min(b,mean[i+Math.min(limit-1-p,hi+d)*step]);}if(Math.max(a,b)>Math.max(70,mean[i]*.8))continue;out[i]=1;hits++;}return {mask:out,hits};}
 function sideEvidence(horizontal,vertical,w,h,box){const [x0,y0,x1,y1]=box,out=[];for(let side=0;side<4;side++){const v=side>=2,lo=v?y0:x0,hi=v?y1:x1,edge=[y0,y1-1,x0,x1-1][side],start=Math.max(0,edge-(side%2?3:10)),end=Math.min(v?w:h,edge+(side%2?10:3)),mask=v?vertical:horizontal;let matched=0;for(let t=lo;t<hi;t++){let found=false;for(let p=start;p<end;p++)if(mask[v?t*w+p:p*w+t]){found=true;break;}matched+=found;}out.push({samples:hi-lo,matched});}return out;}
 function euclideanNear(mask,w,h,radius,box){const out=new Uint8Array(mask.length),offsets=[];for(let dy=-radius;dy<=radius;dy++)for(let dx=-radius;dx<=radius;dx++)if(dx*dx+dy*dy<=radius*radius)offsets.push([dx,dy]);for(let y=Math.max(0,box[1]-radius);y<Math.min(h,box[3]+radius);y++)for(let x=Math.max(0,box[0]-radius);x<Math.min(w,box[2]+radius);x++){const i=y*w+x;if(mask[i]){out[i]=1;continue;}for(const [dx,dy]of offsets){const xx=x+dx,yy=y+dy;if(xx>=0&&xx<w&&yy>=0&&yy<h&&mask[yy*w+xx]){out[i]=1;break;}}}return out;}
 function analyzeRGBA(rgba,w,h,log){
  if(!Number.isInteger(w)||!Number.isInteger(h)||w<250||h<350||w>900||h>900||rgba?.length!==w*h*4||typeof PanelMatteCells==='undefined')return[];
  const N=w*h,hue=new Float32Array(N),sat=new Float32Array(N),val=new Uint8Array(N),mean=new Float32Array(N),lum=new Float32Array(N),white=new Uint8Array(N);let chromatic=0;
  for(let i=0;i<N;i++){if(rgba[i*4+3]!==255)return[];const r=rgba[i*4],g=rgba[i*4+1],b=rgba[i*4+2],mx=Math.max(r,g,b),mn=Math.min(r,g,b),d=mx-mn;val[i]=mx;sat[i]=mx?d/mx:0;hue[i]=!d?0:mx===r?(((g-b)/d+6)%6)/6:mx===g?((b-r)/d+2)/6:((r-g)/d+4)/6;mean[i]=(r+g+b)/3;lum[i]=r*.299+g*.587+b*.114;white[i]=mn>195&&d<40;chromatic+=sat[i]>.48&&sat[i]<.89&&mx>60;}
  if(chromatic<N*.02)return[];let bodies=null;const out=[],candidateMasks=[];
  // Every hue has the same gates. Narrow ridge evidence, not an edge palette
  // or a chosen ink colour, selects the connected chromatic network.
  for(let bin=0;bin<12;bin++){
   const mask=new Uint8Array(N),center=bin/12;for(let i=0;i<N;i++){const d=Math.abs(hue[i]-center);mask[i]=Math.min(d,1-d)<1/24&&sat[i]>.48&&sat[i]<.89&&val[i]>60;}
   const hr=longRuns(mask,w,h,false),vr=longRuns(mask,w,h,true);if(hr.hits<200||vr.hits<200)continue;
   const hs=narrowRidges(hr.mask,mask,mean,w,h,false),vs=narrowRidges(vr.mask,mask,mean,w,h,true);if(hs.hits<120||vs.hits<120)continue;
   const comps=cc(mask,w,h);if(!comps)return[];const hits=new Uint32Array(comps.items.length+1);for(let i=0;i<N;i++)if(hs.mask[i]||vs.mask[i])hits[comps.ids[i]]++;
   const allowed=new Set(comps.items.filter(c=>c.pixels>300&&hits[c.id]>60&&c.pixels/((c.box[2]-c.box[0])*(c.box[3]-c.box[1]))<.25).map(c=>c.id));if(!allowed.size)continue;
   if(!bodies){bodies=whiteBodies(white,w,h);if(!bodies)return[];}
   const rim=new Uint8Array(N);for(let i=0;i<N;i++)rim[i]=allowed.has(comps.ids[i]);const wall=dilate(rim,w,h);for(let i=0;i<N;i++)wall[i]|=bodies.wall[i];const ex=outside(wall,w,h),holeMask=new Uint8Array(N);for(let i=0;i<N;i++)holeMask[i]=!wall[i]&&!ex[i];const holes=cc(holeMask,w,h);if(!holes)return[];
   for(const hole of holes.items){const [x0,y0,x1,y1]=hole.box,A=(x1-x0)*(y1-y0);if(hole.pixels<=N*.035||hole.pixels>=N*.5||hole.pixels/A<.75||x1-x0-1<w*.15||y1-y0-1<h*.1)continue;
    const sides=sideEvidence(hs.mask,vs.mask,w,h,hole.box);if(sides.some(e=>e.matched/e.samples<.5))continue;
    const base=new Uint8Array(N);let sum=0,sq=0;for(let i=0;i<N;i++)if(holes.ids[i]===hole.id){base[i]=1;sum+=lum[i];sq+=lum[i]*lum[i];}const variance=sq/hole.pixels-(sum/hole.pixels)**2;if(variance<500)continue;
    const near=euclideanNear(base,w,h,5,hole.box),nearRim=new Uint8Array(N);for(let i=0;i<N;i++)nearRim[i]=rim[i]&&near[i];const fringe=dilate(nearRim,w,h),core=base.slice();for(let i=0;i<N;i++)core[i]|=fringe[i];const ownership=[];let ambiguous=false;
    for(const body of bodies.items){const samples=body.collarIndices.length;let matched=0;for(const i of body.collarIndices)matched+=base[i];if(!samples)continue;const ratio=matched/samples;if(ratio>.35&&ratio<=.65){ambiguous=true;break;}const retained=ratio>.65;if(retained)for(const i of body.indices)core[i]=1;if(matched)ownership.push({box:body.box,pixels:body.pixels,samples,matched,retained});}
    if(ambiguous)continue;const innerFringe=dilate(base,w,h);for(let i=0;i<N;i++)if(innerFringe[i]&&!bodies.wall[i])core[i]=1;
    const parts=cc(core,w,h);if(!parts||parts.items.length!==1)continue;const pixels=parts.items[0].pixels,rings=PanelMatteCells.tracePixelContours(core,w,h,1);if(!rings)continue;const pts=rings.flat(),xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]),box=[Math.min(...xs),Math.min(...ys),Math.max(...xs),Math.max(...ys)],proof={version:23,method:METHOD,connected:true,analysisWidth:w,analysisHeight:h,hueBin:bin,horizontalRidgePixels:hs.hits,verticalRidgePixels:vs.hits,networkComponents:allowed.size,hole:{box:hole.box,pixels:hole.pixels,variance},sides,ownership,pixels,pixelContours:rings};
    const panel={x:box[0]/w,y:box[1]/h,w:(box[2]-box[0])/w,h:(box[3]-box[1])/h,_identitySource:'structural-grid-frame',_geometryOwner:'structural-grid-contours',_geometryType:'chromatic-rim-cell',_contours:rings.map(q=>q.map(([x,y])=>({x:x/w,y:y/h}))),_structuralGridProof:proof};if(validPanel(panel)){out.push(panel);candidateMasks.push(core);}
   }
  }
  // Competing colour explanations do not establish independent identities.
  for(let i=0;i<out.length;i++)for(let j=0;j<i;j++){for(let k=0;k<N;k++)if(candidateMasks[i][k]&&candidateMasks[j][k])return[];const a=out[i],b=out[j],ov=Math.max(0,Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x))*Math.max(0,Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y));if(ov>.10*Math.min(a.w*a.h,b.w*b.h))return[];}
  if(out.length>8)return[];if(out.length)log?.('chromatic rims: '+out.length+' independently enclosed scenes');return out;
 }

 const PAIR_METHOD='paired-chromatic-perimeter-components';
 function pairedSideSupport(mask,w,h,box,band,side){
  const [x0,y0,x1,y1]=box,vertical=side>=2,lo=vertical?y0:x0,hi=vertical?y1:x1;
  let matched=0;
  for(let t=lo;t<hi;t++){
   let found=false;
   if(side===0)for(let y=y0;y<Math.min(y1,y0+band)&&!found;y++)found=!!mask[y*w+t];
   else if(side===1)for(let y=Math.max(y0,y1-band);y<y1&&!found;y++)found=!!mask[y*w+t];
   else if(side===2)for(let x=x0;x<Math.min(x1,x0+band)&&!found;x++)found=!!mask[t*w+x];
   else for(let x=Math.max(x0,x1-band);x<x1&&!found;x++)found=!!mask[t*w+x];
   matched+=found;
  }
  return hi>lo?matched/(hi-lo):0;
 }
 function validPairedPanel(p){try{
  const pr=p?._structuralGridProof,w=pr?.analysisWidth,h=pr?.analysisHeight,raw=pr?.rawBox,box=pr?.box;
  if(p?._quad||p?._outline||p?._identitySource!=='structural-grid-frame'||p._geometryOwner!=='structural-grid-contours'||p._geometryType!=='paired-chromatic-inset'||pr?.version!==24||pr.method!==PAIR_METHOD||pr.connected!==true||!Number.isInteger(w)||!Number.isInteger(h)||w<250||h<350||w>900||h>900||!Number.isInteger(pr.hueBin)||!range(pr.hueBin,0,11)||!Number.isInteger(pr.band)||!range(pr.band,4,14)||!Number.isInteger(pr.padding)||!range(pr.padding,2,4))return false;
  if(!Array.isArray(pr.components)||!range(pr.components.length,1,2)||pr.components.some(c=>!Array.isArray(c?.box)||c.box.length!==4||c.box.some((v,k)=>!Number.isInteger(v)||v<0||v>(k%2?h:w))||c.box[0]>=c.box[2]||c.box[1]>=c.box[3]||!Number.isInteger(c.pixels)||c.pixels<=220||c.pixels>(c.box[2]-c.box[0])*(c.box[3]-c.box[1])*.40))return false;
  const union=[Math.min(...pr.components.map(c=>c.box[0])),Math.min(...pr.components.map(c=>c.box[1])),Math.max(...pr.components.map(c=>c.box[2])),Math.max(...pr.components.map(c=>c.box[3]))];
  if(!Array.isArray(raw)||JSON.stringify(raw)!==JSON.stringify(union))return false;
  const rw=raw[2]-raw[0],rh=raw[3]-raw[1],A=rw*rh,N=w*h;
  if(rw<w*.18||rh<h*.10||A<N*.025||A>N*.35||raw[0]<3||raw[1]<3||raw[2]>w-3||raw[3]>h-3)return false;
  if(pr.components.length===2){const a=pr.components[0].box,b=pr.components[1].box,gx=Math.max(0,Math.max(a[0],b[0])-Math.min(a[2],b[2])),gy=Math.max(0,Math.max(a[1],b[1])-Math.min(a[3],b[3]));if(gx>w*.04||gy>h*.04)return false;}
  if(!Array.isArray(pr.sides)||pr.sides.length!==4||pr.sides.some(v=>!range(v,.52,1))||pr.sides.filter(v=>v>.75).length<2)return false;
  const pixels=pr.components.reduce((n,c)=>n+c.pixels,0),fill=pixels/A;
  if(!range(pr.fill,.001,.30)||Math.abs(pr.fill-fill)>1e-12||!range(pr.insideVariance,500,16257)||!finite(pr.score)||Math.abs(pr.score-(pr.sides.reduce((a,b)=>a+b,0)-pr.fill)>1e-12))return false;
  const expected=[raw[0]-pr.padding,raw[1]-pr.padding,raw[2]+pr.padding,raw[3]+pr.padding];
  if(!Array.isArray(box)||JSON.stringify(box)!==JSON.stringify(expected)||box[0]<0||box[1]<0||box[2]>w||box[3]>h)return false;
  const ring=[[box[0],box[1]],[box[2],box[1]],[box[2],box[3]],[box[0],box[3]]];
  if(!Array.isArray(pr.pixelContours)||pr.pixelContours.length!==1||JSON.stringify(pr.pixelContours[0])!==JSON.stringify(ring)||!Array.isArray(p._contours)||JSON.stringify(p._contours)!==JSON.stringify([ring.map(([x,y])=>({x:x/w,y:y/h}))]))return false;
  return Math.abs(p.x-box[0]/w)<1e-12&&Math.abs(p.y-box[1]/h)<1e-12&&Math.abs(p.w-(box[2]-box[0])/w)<1e-12&&Math.abs(p.h-(box[3]-box[1])/h)<1e-12;
 }catch(_){return false;}}
 function analyzePairedRGBA(rgba,w,h,log){
  if(!Number.isInteger(w)||!Number.isInteger(h)||w<250||h<350||w>900||h>900||rgba?.length!==w*h*4)return[];
  const N=w*h,hue=new Float32Array(N),sat=new Float32Array(N),val=new Uint8Array(N),lum=new Float32Array(N);
  for(let i=0;i<N;i++){
   if(rgba[i*4+3]!==255)return[];
   const r=rgba[i*4],g=rgba[i*4+1],b=rgba[i*4+2],mx=Math.max(r,g,b),mn=Math.min(r,g,b),d=mx-mn;
   val[i]=mx;sat[i]=mx?d/mx:0;hue[i]=!d?0:mx===r?(((g-b)/d+6)%6)/6:mx===g?((b-r)/d+2)/6:((r-g)/d+4)/6;lum[i]=r*.299+g*.587+b*.114;
  }
  const candidates=[];
  for(let bin=0;bin<12;bin++){
   const center=bin/12,mask=new Uint8Array(N);
   for(let i=0;i<N;i++){const d=Math.abs(hue[i]-center);mask[i]=Math.min(d,1-d)<1/12&&sat[i]>.42&&val[i]>45;}
   const comps=cc(mask,w,h);if(!comps)return[];const eligible=[];
   for(const c of comps.items){const [x0,y0,x1,y1]=c.box,bw=x1-x0,bh=y1-y0,A=bw*bh;if(c.pixels<=220||bw<w*.07||bh<h*.06||A>N*.42||c.pixels/A>.40)continue;eligible.push(c);}
   const groups=eligible.map(c=>[c]);
   for(let i=0;i<eligible.length;i++)for(let j=i+1;j<eligible.length;j++){
    const a=eligible[i].box,b=eligible[j].box,gx=Math.max(0,Math.max(a[0],b[0])-Math.min(a[2],b[2])),gy=Math.max(0,Math.max(a[1],b[1])-Math.min(a[3],b[3]));
    if(gx<=w*.04&&gy<=h*.04)groups.push([eligible[i],eligible[j]]);
   }
   for(const group of groups){
    const raw=[Math.min(...group.map(c=>c.box[0])),Math.min(...group.map(c=>c.box[1])),Math.max(...group.map(c=>c.box[2])),Math.max(...group.map(c=>c.box[3]))],rw=raw[2]-raw[0],rh=raw[3]-raw[1],A=rw*rh;
    if(rw<w*.18||rh<h*.10||A<N*.025||A>N*.35||raw[0]<3||raw[1]<3||raw[2]>w-3||raw[3]>h-3)continue;
    const ids=new Set(group.map(c=>c.id)),owned=new Uint8Array(N);for(let i=0;i<N;i++)owned[i]=ids.has(comps.ids[i]);
    const band=Math.max(4,Math.min(14,Math.round(Math.min(rw,rh)*.06))),sides=[0,1,2,3].map(side=>pairedSideSupport(owned,w,h,raw,band,side));
    if(sides.some(v=>v<.52)||sides.filter(v=>v>.75).length<2)continue;
    let n=0,sum=0,sq=0;for(let y=raw[1]+band;y<raw[3]-band;y++)for(let x=raw[0]+band;x<raw[2]-band;x++){const v=lum[y*w+x];n++;sum+=v;sq+=v*v;}if(n<500)continue;const insideVariance=sq/n-(sum/n)**2;if(insideVariance<500)continue;
    const pixels=group.reduce((n,c)=>n+c.pixels,0),fill=pixels/A;if(fill>.30)continue;
    const score=sides.reduce((a,b)=>a+b,0)-fill,padding=3,box=[raw[0]-padding,raw[1]-padding,raw[2]+padding,raw[3]+padding];
    if(box[0]<0||box[1]<0||box[2]>w||box[3]>h)continue;
    const ring=[[box[0],box[1]],[box[2],box[1]],[box[2],box[3]],[box[0],box[3]]],proof={version:24,method:PAIR_METHOD,connected:true,analysisWidth:w,analysisHeight:h,hueBin:bin,band,padding,components:group.map(c=>({box:c.box.slice(),pixels:c.pixels})),rawBox:raw,box,sides,fill,insideVariance,score,pixelContours:[ring]};
    const panel={x:box[0]/w,y:box[1]/h,w:(box[2]-box[0])/w,h:(box[3]-box[1])/h,_identitySource:'structural-grid-frame',_geometryOwner:'structural-grid-contours',_geometryType:'paired-chromatic-inset',_contours:[ring.map(([x,y])=>({x:x/w,y:y/h}))],_structuralGridProof:proof};
    if(validPairedPanel(panel))candidates.push(panel);
   }
  }
  candidates.sort((a,b)=>b._structuralGridProof.score-a._structuralGridProof.score);const out=[];
  for(const p of candidates){const ov=out.some(q=>{const x=Math.max(0,Math.min(p.x+p.w,q.x+q.w)-Math.max(p.x,q.x)),y=Math.max(0,Math.min(p.y+p.h,q.y+q.h)-Math.max(p.y,q.y));return x*y/Math.min(p.w*p.h,q.w*q.h)>.65;});if(!ov)out.push(p);}
  if(out.length>4)return[];if(out.length)log?.('paired chromatic perimeters: '+out.length+' closed inset scenes');return out;
 }
 function validPanel(p){if(p?._structuralGridProof?.version===24)return validPairedPanel(p);try{const pr=p?._structuralGridProof,w=pr?.analysisWidth,h=pr?.analysisHeight,box=pr?.hole?.box;if(p?._quad||p?._outline||p?._identitySource!=='structural-grid-frame'||p._geometryOwner!=='structural-grid-contours'||p._geometryType!=='chromatic-rim-cell'||pr?.version!==23||pr.method!==METHOD||pr.connected!==true||!Number.isInteger(w)||!Number.isInteger(h)||w<250||h<350||w>900||h>900||!Number.isInteger(pr.hueBin)||!range(pr.hueBin,0,11)||!Number.isInteger(pr.horizontalRidgePixels)||!range(pr.horizontalRidgePixels,120,w*h)||!Number.isInteger(pr.verticalRidgePixels)||!range(pr.verticalRidgePixels,120,w*h)||!Number.isInteger(pr.networkComponents)||!range(pr.networkComponents,1,1000)||!Array.isArray(box)||box.length!==4||box.some((v,k)=>!Number.isInteger(v)||v<0||v>(k%2?h:w))||box[2]-box[0]-1<w*.15||box[3]-box[1]-1<h*.1||!Number.isInteger(pr.hole.pixels)||pr.hole.pixels<=w*h*.035||pr.hole.pixels>=w*h*.5||pr.hole.pixels/((box[2]-box[0])*(box[3]-box[1]))<.75||!range(pr.hole.variance,500,16257))return false;
  if(!Array.isArray(pr.sides)||pr.sides.length!==4||pr.sides.some((e,k)=>!Number.isInteger(e.samples)||e.samples!==(k<2?box[2]-box[0]:box[3]-box[1])||!Number.isInteger(e.matched)||!range(e.matched/e.samples,.5,1))||!Array.isArray(pr.ownership)||pr.ownership.length>128||pr.ownership.some(e=>!Array.isArray(e.box)||e.box.length!==4||e.box.some((v,k)=>!Number.isInteger(v)||v<0||v>(k%2?h:w))||!Number.isInteger(e.pixels)||e.pixels<=120||e.pixels>=w*h*.07||!Number.isInteger(e.samples)||e.samples<=0||!Number.isInteger(e.matched)||!range(e.matched,1,e.samples)||e.matched/e.samples>.35&&e.matched/e.samples<=.65||e.retained!==(e.matched/e.samples>.65)))return false;
  const rings=pr.pixelContours;if(!Number.isInteger(pr.pixels)||!range(pr.pixels,pr.hole.pixels,w*h*.60)||!Array.isArray(rings)||!rings.length||rings.length>64||rings.some(q=>!Array.isArray(q)||q.length<4||q.length>4096||q.some(a=>!Array.isArray(a)||a.length!==2||!Number.isInteger(a[0])||!Number.isInteger(a[1])||a[0]<0||a[1]<0||a[0]>w||a[1]>h))||Math.abs(rings.reduce((s,q)=>s+area(q),0))!==pr.pixels||JSON.stringify(p._contours)!==JSON.stringify(rings.map(q=>q.map(([x,y])=>({x:x/w,y:y/h})))))return false;
  const pts=rings.flat(),xs=pts.map(a=>a[0]),ys=pts.map(a=>a[1]),b=[Math.min(...xs)/w,Math.min(...ys)/h,(Math.max(...xs)-Math.min(...xs))/w,(Math.max(...ys)-Math.min(...ys))/h];return ['x','y','w','h'].every((key,k)=>finite(p[key])&&Math.abs(p[key]-b[k])<1e-10);
 }catch(_){return false;}}
 function completeImage(img,baseline,log){if(!Array.isArray(baseline)||baseline.length||typeof PanelMatteCells==='undefined')return[];const W=img.naturalWidth||img.width,H=img.naturalHeight||img.height;if(!W||!H||W*H>24000000)return[];let c;try{c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d',{willReadFrequently:true});if(!g)return[];g.drawImage(img,0,0);const s=Math.min(1,900/Math.max(W,H)),w=Math.round(W*s),h=Math.round(H*s),rgba=PanelMatteCells.sampleBilinearRGBA(g.getImageData(0,0,W,H).data,W,H,w,h),prior=analyzeRGBA(rgba,w,h,log);if(prior.length)return prior;const ps=Math.min(1,480/Math.max(w,h)),pw=Math.round(w*ps),ph=Math.round(h*ps),pairedRGBA=ps<1?PanelMatteCells.sampleBilinearRGBA(rgba,w,h,pw,ph):rgba;return analyzePairedRGBA(pairedRGBA,pw,ph,log);}finally{if(c){c.width=1;c.height=1;}}}
 return {analyzeRGBA,analyzePairedRGBA,completeImage,validPanel};
})();
if(typeof module!=='undefined')module.exports=PanelColoredRims;
