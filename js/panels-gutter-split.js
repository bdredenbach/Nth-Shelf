/* Split an existing selection only at a continuous exterior paper gutter.
 * The source contour is partitioned, never replaced by bounding rectangles.
 * Source artwork and original proof stay in each child descriptor. */
const PanelGutterSplit=(()=>{
 'use strict';
 const VERSION=44,METHOD='source-paper-seam-partition',same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
 function raster(rings,w,h){return PanelCropRepair.raster(rings,w,h);}
 function extent(mask,w,h){let x0=w,y0=h,x1=0,y1=0,pixels=0;for(let i=0;i<mask.length;i++)if(mask[i]){pixels++;const x=i%w,y=i/w|0;x0=Math.min(x0,x);x1=Math.max(x1,x+1);y0=Math.min(y0,y);y1=Math.max(y1,y+1);}return{box:[x0,y0,x1,y1],pixels};}
 function exterior(rgba,w,h,threshold){
  const paper=Uint8Array.from({length:w*h},(_,i)=>+(Math.min(rgba[4*i],rgba[4*i+1],rgba[4*i+2])>threshold&&Math.max(rgba[4*i],rgba[4*i+1],rgba[4*i+2])-Math.min(rgba[4*i],rgba[4*i+1],rgba[4*i+2])<30));
  let near=paper;for(let k=0;k<2;k++){const next=near.slice();for(let i=0;i<near.length;i++)if(!near[i]){const x=i%w,y=i/w|0;next[i]=+(x&&near[i-1]||x+1<w&&near[i+1]||y&&near[i-w]||y+1<h&&near[i+w]);}near=next;}
  const seen=new Uint8Array(w*h),q=new Int32Array(w*h);let n=0;const add=i=>{if(!seen[i]&&near[i]){seen[i]=1;q[n++]=i;}};for(let x=0;x<w;x++){add(x);add((h-1)*w+x);}for(let y=0;y<h;y++){add(y*w);add(y*w+w-1);}for(let k=0;k<n;k++){const i=q[k],x=i%w,y=i/w|0;if(x)add(i-1);if(x+1<w)add(i+1);if(y)add(i-w);if(y+1<h)add(i+w);}return Uint8Array.from(seen,(v,i)=>+(v&&paper[i]));
 }
 function partition(mask,w,h,box,seam){const parts=[new Uint8Array(w*h),new Uint8Array(w*h)],x0=box[0];for(let i=0;i<mask.length;i++)if(mask[i]){const x=i%w,y=i/w|0;parts[y<seam[x-x0]?0:1][i]=1;}return parts;}
 function seamPath(paper,mask,w,h,box){
  const [x0,y0,x1,y1]=box,W=x1-x0,H=y1-y0;
  if(W<w*.35||H<h*.20)return null;
  const col=Array.from({length:W},()=>[]);for(let x=x0;x<x1;x++)for(let y=Math.ceil(y0+H*.18);y<y0+H*.82;y++)if(paper[y*w+x])col[x-x0].push(y);
  // A paper seam must run from one exterior flank to the other. Raster paths
  // can bend by six pixels per column, matching jagged hand-drawn gutters.
  let paths=new Map();const margin=Math.max(3,Math.round(W*.025));
  for(const y of col[margin])paths.set(y,{cost:0,ys:[y]});
  for(let x=margin+1;x<W-margin&&paths.size;x++){
   const next=new Map();for(const y of col[x]){let best=null;for(let dy=-6;dy<=6;dy++){const p=paths.get(y+dy);if(p){const cost=p.cost+Math.abs(dy)+((paper[(y-1)*w+x0+x]&&paper[(y+1)*w+x0+x])?0:6);if(!best||cost<best.cost)best={cost,prev:p};}}if(best)next.set(y,{cost:best.cost,ys:best.prev.ys.concat(y)});}paths=next;
  }
  if(!paths.size)return null;
  const candidates=[...paths.values()].sort((a,b)=>a.cost-b.cost);for(const path of candidates){
   const ys=Array(margin).fill(path.ys[0]).concat(path.ys,Array(margin).fill(path.ys.at(-1)));
   if(ys.length!==W||Math.max(...ys)-Math.min(...ys)>H*.30)continue;
   let thick=0,flanks=0,owned=0;const band=Math.max(10,Math.round(H*.055));
   for(let x=margin;x<W-margin;x++){const i=ys[x]*w+x0+x;thick+=paper[i-w]&&paper[i+w];flanks+=mask[i-band*w]&&mask[i+band*w];owned+=mask[i];}
   const span=W-2*margin;if(thick/span<.80||flanks/span<.65)continue;
   return{ys,margin,span,thick,flanks,owned,cost:path.cost};
  }return null;
 }
 function child(parent,mask,seam,bodies,leaf,w,h,content){const g=extent(mask,w,h),rings=PanelMatteCells.tracePixelContours(mask,w,h,1);if(!rings)return null;const[x0,y0,x1,y1]=g.box;return{x:x0/w,y:y0/h,w:(x1-x0)/w,h:(y1-y0)/h,_identitySource:'structural-grid-frame',_geometryOwner:'structural-grid-contours',_geometryType:'paper-seam-child',_contours:rings.map(q=>q.map(([x,y])=>({x:x/w,y:y/h}))),_structuralGridProof:{version:VERSION,method:METHOD,connected:true,analysisWidth:w,analysisHeight:h,parent,seam,bodies,leaf,pixels:g.pixels,box:g.box,pixelContours:rings,content}};}
 function applyBodies(parts,bodies,w,h){
  if(!Array.isArray(bodies)||bodies.length>128)return false;
  for(const body of bodies){
   if(![0,1].includes(body.leaf)||!Array.isArray(body.contours)||!body.contours.length||body.contours.some(q=>q.length<4||q.length>4096||q.some(p=>!Number.isFinite(p.x)||!Number.isFinite(p.y)||p.x<0||p.x>1||p.y<0||p.y>1)))return false;
   const m=raster(body.contours,w,h);if(extent(m,w,h).pixels!==body.pixels||body.pixels<120||body.pixels>w*h*.075||body.collar?.length!==3||body.collar.some(n=>!Number.isInteger(n)||n<0)||body.collar[0]<1)return false;
   if(body.ownership==='caption-majority'){
    if(body.hits?.length!==2||body.hits.some(n=>!Number.isInteger(n)||n<0)||body.hits[body.leaf]/(body.hits[0]+body.hits[1])<=.80||body.bodyBox?.length!==4||body.bodyBox.some(n=>!Number.isInteger(n))||!Number.isInteger(body.bodyPixels)||body.bodyPixels/((body.bodyBox[2]-body.bodyBox[0])*(body.bodyBox[3]-body.bodyBox[1]))<=.85)return false;
   }else if(body.ownership!=='collar'||body.collar[body.leaf+1]<body.collar[0]*.55||Math.abs(body.collar[1]-body.collar[2])<body.collar[0]*.25)return false;
   for(let i=0;i<m.length;i++)if(m[i]){parts[body.leaf][i]=1;parts[1-body.leaf][i]=0;}
  }return true;
 }
 function attachPaper(parts,parent,rgba,w,h,others){
  const white=Uint8Array.from({length:w*h},(_,i)=>+(Math.min(rgba[4*i],rgba[4*i+1],rgba[4*i+2])>195&&Math.max(rgba[4*i],rgba[4*i+1],rgba[4*i+2])-Math.min(rgba[4*i],rgba[4*i+1],rgba[4*i+2])<40)),found=PanelColoredRims.whiteBodies(white,w,h);
  if(!found)return null;const out=[];let blocked=null;
  for(const body of found.items){
   const bw=body.box[2]-body.box[0],bh=body.box[3]-body.box[1];if(body.pixels/(bw*bh)<.40||bw/bh>8||bh/bw>8)continue;
   const hits=[0,0];for(const i of body.indices){hits[0]+=parts[0][i];hits[1]+=parts[1][i];}
   if(Math.min(...hits)<3)continue;
   const collar=[body.collarIndices.length,0,0];for(const i of body.collarIndices){collar[1]+=parts[0][i];collar[2]+=parts[1][i];}
   let leaf=collar[1]>collar[2]?0:1;let ownership='collar';
   if(body.pixels/(bw*bh)>.85&&Math.max(...hits)/(hits[0]+hits[1])>.80){leaf=hits[0]>hits[1]?0:1;ownership='caption-majority';}
   else if(collar[leaf+1]<collar[0]*.55||Math.abs(collar[1]-collar[2])<collar[0]*.25)return null;
   if(!blocked){blocked=new Uint8Array(w*h);for(const p of others){const m=PanelLocalBoundaryConsensus.raster(p,w,h);for(let i=0;i<m.length;i++)blocked[i]|=m[i];}}
   const mask=new Uint8Array(w*h);for(const i of body.indices)mask[i]=1;
   if(ownership==='caption-majority')for(let y=Math.max(0,body.box[1]-4);y<Math.min(h,body.box[3]+4);y++)for(let x=Math.max(0,body.box[0]-4);x<Math.min(w,body.box[2]+4);x++)mask[y*w+x]=1;
   if(mask.some((v,i)=>v&&blocked[i]&&!parent[i]))return null;
   const raw=PanelMatteCells.tracePixelContours(mask,w,h,1);if(!raw)return null;
   out.push({leaf,collar,ownership,hits,bodyBox:body.box,bodyPixels:body.pixels,pixels:extent(mask,w,h).pixels,contours:raw.map(q=>q.map(([x,y])=>({x:x/w,y:y/h})))});
  }return applyBodies(parts,out,w,h)?out:null;
 }
 function validPanel(p){try{
  const v=p?._structuralGridProof,w=v?.analysisWidth,h=v?.analysisHeight,s=v?.seam;
  if(v?.version!==VERSION||v.method!==METHOD||v.connected!==true||!Number.isInteger(w)||!Number.isInteger(h)||w<250||h<350||w>900||h>900||!['x','y','w','h'].every(k=>Number.isFinite(p[k]))||p._identitySource!=='structural-grid-frame'||p._geometryOwner!=='structural-grid-contours'||p._geometryType!=='paper-seam-child'||p._quad||p._outline||![0,1].includes(v.leaf)||v.parent?._structuralGridProof?.version===VERSION)return false;
  const rings=PanelGeometryOrthogonal._provenContours(v.parent);if(!rings)return false;
  const source=raster(rings,w,h),g=extent(source,w,h),W=g.box[2]-g.box[0],H=g.box[3]-g.box[1];
  if(W<w*.35||H<h*.20||!Array.isArray(s?.ys)||s.ys.length!==W||s.ys.some(y=>!Number.isInteger(y)||y<g.box[1]+H*.18||y>=g.box[1]+H*.82)||s.ys.some((y,i)=>i&&Math.abs(y-s.ys[i-1])>6)||Math.max(...s.ys)-Math.min(...s.ys)>H*.30||s.margin!==Math.max(3,Math.round(W*.025))||s.span!==W-2*s.margin||!['thick','flanks','owned','cost'].every(k=>Number.isInteger(s[k])&&s[k]>=0)||s.thick<s.span*.80||s.thick>s.span||s.flanks<s.span*.65||s.flanks>s.span||s.owned>s.span)return false;
  const parts=partition(source,w,h,g.box,s.ys);
  if(!applyBodies(parts,v.bodies,w,h))return false;
  const sizes=parts.map(m=>extent(m,w,h).pixels);if(sizes.some(n=>n<w*h*.035||n<g.pixels*.18))return false;
  const m=parts[v.leaf],out=extent(m,w,h),raw=PanelMatteCells.tracePixelContours(m,w,h,1),[x0,y0,x1,y1]=out.box;
  return same([p.x,p.y,p.w,p.h],[x0/w,y0/h,(x1-x0)/w,(y1-y0)/h])&&v.pixels===out.pixels&&same(v.box,out.box)&&same(v.pixelContours,raw)&&same(p._contours,raw.map(q=>q.map(([x,y])=>({x:x/w,y:y/h}))))&&PanelContextCells.contentEvidence.signatureValid(v.content,out.pixels);
 }catch(_){return false;}}
 function analyzeRGBA(rgba,w,h,prior=[],log){
  if(!Number.isInteger(w)||!Number.isInteger(h)||w<250||h<350||w>900||h>900||rgba?.length!==w*h*4||!Array.isArray(prior)||prior.length>24)return prior;
  for(let i=0;i<w*h;i++)if(rgba[4*i+3]!==255)return prior;
  const paper=exterior(rgba,w,h,220),peer=exterior(rgba,w,h,210),out=[];
  for(const parent of prior){const rings=PanelGeometryOrthogonal._provenContours(parent);if(!rings||parent._structuralGridProof?.version===VERSION){out.push(parent);continue;}
   const m=raster(rings,w,h),g=extent(m,w,h),seam=seamPath(paper,m,w,h,g.box),other=seam&&seamPath(peer,m,w,h,g.box);
   if(!seam||!other){out.push(parent);continue;}
   if(seam.ys.slice(seam.margin,-seam.margin).some((y,i)=>!peer[y*w+g.box[0]+i+seam.margin])){out.push(parent);continue;}
   const parts=partition(m,w,h,g.box,seam.ys),bodies=attachPaper(parts,m,rgba,w,h,prior.filter(p=>p!==parent));
   if(!bodies){log?.("speech ownership deferred");out.push(parent);continue;}
   const sizes=parts.map(m=>extent(m,w,h).pixels),content=parts.map(m=>PanelContextCells.contentEvidence.signature(m,rgba));
   if(sizes.some(n=>n<w*h*.035||n<g.pixels*.18)||content.some((s,i)=>!PanelContextCells.contentEvidence.signatureValid(s,sizes[i]))){out.push(parent);continue;}
   const kids=parts.map((m,i)=>child(parent,m,seam,bodies,i,w,h,content[i]));if(kids.some(p=>!validPanel(p))){log?.("child proof invalid");out.push(parent);continue;}
   out.push(...kids);log?.('source paper seam: one merged selection -> two independent crops');
  }return out;
 }
 function supplementImage(img,prior,log){const W=img.naturalWidth||img.width,H=img.naturalHeight||img.height;if(!W||!H||W*H>24000000)return prior;let c;try{c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d',{willReadFrequently:true});g.drawImage(img,0,0);const scale=Math.min(1,900/Math.max(W,H)),w=Math.round(W*scale),h=Math.round(H*scale);return analyzeRGBA(PanelMatteCells.sampleBilinearRGBA(g.getImageData(0,0,W,H).data,W,H,w,h),w,h,prior,log);}finally{if(c)c.width=c.height=1;}}
 function install(detector){if(typeof PanelStructuralGrid!=='undefined'&&!PanelStructuralGrid._paperSeamSplit){const old=PanelStructuralGrid.validPanel;PanelStructuralGrid.validPanel=p=>p?._structuralGridProof?.version===VERSION?validPanel(p):old(p);PanelStructuralGrid._paperSeamSplit=true;}if(typeof PanelGeometry!=='undefined'&&!PanelGeometry._paperSeamSplit){const old=PanelGeometry.refine;PanelGeometry.refine=async function(url,p,log){return validPanel(p)?{...p}:old.call(this,url,p,log);};PanelGeometry._paperSeamSplit=true;}
 if(typeof PanelEdgeSpill!=='undefined'&&!PanelEdgeSpill._paperSeamSplit){for(const name of['analyzeImage','analyzeRGBA']){const old=PanelEdgeSpill[name];if(typeof old==='function')PanelEdgeSpill[name]=function(...args){return validPanel(args[name==='analyzeImage'?1:3])?null:old.apply(this,args);};}PanelEdgeSpill._paperSeamSplit=true;}
 if(!detector||detector._paperSeamSplit)return;const old=detector.detect;detector.detect=async function(url,log){const prior=await old.call(this,url,log);try{const img=new Image();img.src=url;await img.decode();return supplementImage(img,prior,log);}catch(e){log?.('paper seam split deferred: '+e.message);return prior;}};detector._paperSeamSplit=true;}
 return{analyzeRGBA,supplementImage,validPanel,install};
})();
if(typeof PanelDetect!=='undefined')PanelGutterSplit.install(PanelDetect);
if(typeof module!=='undefined')module.exports=PanelGutterSplit;
