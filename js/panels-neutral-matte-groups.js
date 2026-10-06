/* Append stable groups against a measured neutral colored exterior. Two
 * independent erosion radii, four-sided exterior and ink evidence, and a
 * bounded broad contour are required. Earlier source
 * descriptors remain intact; displayed foreign repairs yield to proven source
 * ownership, and an almost wholly enclosed speech body stays complete. */
const PanelNeutralMatteGroups=(()=>{
 'use strict';
 const VERSION=57,METHOD='neutral-matte-group',E=()=>PanelLocalBoundaryConsensus.pixelEvidence,same=(a,b)=>JSON.stringify(a)===JSON.stringify(b),cache=new WeakMap();
 function freeze(v){if(v&&typeof v==='object'&&!Object.isFrozen(v)){for(const a of Object.values(v))freeze(a);Object.freeze(v);}return v;}
 function dimensions(w,h){return Number.isInteger(w)&&Number.isInteger(h)&&w>=350&&h>=350&&w<=900&&h<=900&&h>=w*.7&&h<=w*1.8;}
 function source(p,r,w,h){const v=p?._structuralGridProof;if(!v||v.version!==18||v.seedRadius!==r||v.analysisWidth!==w||v.analysisHeight!==h||!neutral(v.palette)||v.count<2||v.count>24||v.variance<700||p._contours?.length!==1)return false;const copy={...p,_structuralGridProof:{...v,count:Math.max(3,v.count)}};delete copy._structuralGridProof.seedRadius;return PanelRaggedGutters.validPanel(copy);}
 function neutral(p){return p?.paper===false&&p.colors?.length>=1&&p.colors.length<=3&&p.colors.every(c=>c.length===3&&c.every(Number.isFinite)&&Math.min(...c)>=96&&Math.max(...c)<=210&&Math.max(...c)-Math.min(...c)<=32);}
 function supported(b){return b&&['samples','edges','white','exterior','ink','mixed'].every(k=>Array.isArray(b[k])&&b[k].length===4&&b[k].every(n=>Number.isInteger(n)&&n>=0))&&b.samples.every((n,k)=>{const free=n-b.edges[k];return n>=60&&free>=0&&b.white[k]<=free&&b.exterior[k]<=b.white[k]&&b.ink[k]<=free&&b.mixed[k]<=free&&b.mixed[k]>=.92*free&&b.white[k]>=.85*free&&b.exterior[k]>=.80*free&&b.ink[k]>=.60*free;});}
 function continuation(g,w,h){const b=g.box,W=b[2]-b[0],H=b[3]-b[1],fill=g.pixels/(W*H);return W>=w*.90&&H>=h*.30&&H<=h*.80&&g.pixels>=w*h*.20&&g.pixels<=w*h*.72&&fill>=.50&&fill<=.98;}
 function measured(first,second,w,h,exclusions=[]){
  const A=PanelLocalBoundaryConsensus.raster(first,w,h),B=PanelLocalBoundaryConsensus.raster(second,w,h),mask=A.slice(),difference=A.reduce((s,v,i)=>s+ +(v!==B[i]),0);let g=E().extent(mask,w,h);
  if(!same(first._structuralGridProof.palette,second._structuralGridProof.palette)||!g.pixels||difference>g.pixels*.002||!continuation(g,w,h,first._structuralGridProof.palette.paper))return null;
  for(const p of exclusions){if(!PanelGeometryOrthogonal._provenContours(p))return null;const other=PanelLocalBoundaryConsensus.raster(p,w,h);if(mask.some((v,i)=>v&&other[i]))return null;}
  const raw=PanelMatteCells.tracePixelContours(mask,w,h,1);if(!raw||raw.length!==1)return null;
  return{mask,g,difference,raw,contours:raw.map(q=>q.map(([x,y])=>({x:x/w,y:y/h})))};
 }
 function construct(v,c,w,h){const[x0,y0,x1,y1]=c.g.box;return{x:x0/w,y:y0/h,w:(x1-x0)/w,h:(y1-y0)/h,_identitySource:'structural-grid-frame',_geometryOwner:'structural-grid-contours',_geometryType:'neutral-matte-group',_contours:c.contours,_structuralGridProof:v};}
 function validPanel(p){const v=p?._structuralGridProof,hit=v&&cache.get(v);if(hit&&p._contours===hit.contours)return p._identitySource==='structural-grid-frame'&&p._geometryOwner==='structural-grid-contours'&&p._geometryType==='neutral-matte-group'&&!p._quad&&!p._outline&&same([p.x,p.y,p.w,p.h],hit.box);try{const w=v?.analysisWidth,h=v?.analysisHeight;if(v?.version!==VERSION||v.method!==METHOD||v.connected!==true||!dimensions(w,h)||!source(v.first,4,w,h)||!source(v.second,6,w,h)||v.originalOwnerOverlap!==0||!supported(v.boundary)||v.attachment!==undefined||typeof v.internalDivider!=='boolean'||!Array.isArray(v.exclusions)||v.exclusions.length>24)return false;const c=measured(v.first,v.second,w,h,v.exclusions||[]);if(!c||v.difference!==c.difference||v.pixels!==c.g.pixels||!same(v.box,c.g.box)||!same(v.pixelContours,c.raw))return false;const blank=new Uint8Array(w*h),front=E().boundary(c.mask,new Uint8ClampedArray(w*h*4),{near:blank,nearExterior:blank},w,h);if(!same(front.samples,v.boundary.samples)||!same(front.edges,v.boundary.edges))return false;const expected=construct(v,c,w,h);if(!same(p._contours,expected._contours)||p._identitySource!==expected._identitySource||p._geometryOwner!==expected._geometryOwner||p._geometryType!==expected._geometryType||p._quad||p._outline||!same([p.x,p.y,p.w,p.h],[expected.x,expected.y,expected.w,expected.h]))return false;freeze(v);freeze(p._contours);cache.set(v,{contours:p._contours,box:[p.x,p.y,p.w,p.h]});return true;}catch(_){return false;}}
 // Rejection-only fast path: the source palette uses the same quantized edge
 // histogram. A nonneutral primary can never satisfy neutral() below.
 function neutralEdge(rgba,w,h){const hist=new Map();const add=i=>{const c=[0,1,2].map(k=>Math.min(255,Math.floor(rgba[i*4+k]/12)*12+6)),key=c.join(',');const q=hist.get(key);if(q)q.n++;else hist.set(key,{c,n:1});};for(let x=0;x<w;x+=2){add(x);add((h-1)*w+x);}for(let y=0;y<h;y+=2){add(y*w);add(y*w+w-1);}const p=[...hist.values()].sort((a,b)=>b.n-a.n)[0];return !!p&&neutral({paper:false,colors:[p.c]});}
 function analyzeRGBA(rgba,w,h,prior=[],log){
  if(!dimensions(w,h)||rgba?.length!==w*h*4||!Array.isArray(prior)||prior.length>24||prior.some(p=>!PanelGeometryOrthogonal._provenContours(p)))return[];for(let i=3;i<rgba.length;i+=4)if(rgba[i]!==255)return[];
  if(!neutralEdge(rgba,w,h))return[];
  const first=PanelRaggedGutters.analyzeCooperativeRGBA(rgba,w,h,4).filter(p=>source(p,4,w,h));if(!first.length)return[];const second=PanelRaggedGutters.analyzeCooperativeRGBA(rgba,w,h,6).filter(p=>source(p,6,w,h)),out=[];
  for(const a of first){const matches=second.filter(b=>Math.max(Math.abs(a.x-b.x),Math.abs(a.y-b.y),Math.abs(a.w-b.w),Math.abs(a.h-b.h))<.015).map(b=>({b,c:measured(a,b,w,h,prior)})).filter(q=>q.c);if(matches.length!==1)continue;const {b,c}=matches[0],P=E().paper(rgba,w,h,a._structuralGridProof.palette),boundary=E().boundary(c.mask,rgba,P,w,h);if(!supported(boundary))continue;
   const merged=c,finalBoundary=boundary;
   const internalDivider=E().internalDivider(merged.mask,rgba,P,w,h);
   const v={version:VERSION,method:METHOD,connected:true,analysisWidth:w,analysisHeight:h,first:a,second:b,exclusions:prior.slice(),difference:c.difference,pixels:merged.g.pixels,box:merged.g.box,pixelContours:merged.raw,boundary:finalBoundary,internalDivider,originalOwnerOverlap:0},p=construct(v,merged,w,h);if(validPanel(p))out.push(p);
  }
  if(out.length)log?.('neutral matte groups: stable source boundaries, earlier owners preserved');return out;
 }
 function supplementImage(img,prior,log){const W=img.naturalWidth||img.width,H=img.naturalHeight||img.height;if(!W||!H||H<W*.7||H>W*1.8||W*H>24000000 )return[];let c;try{c=document.createElement('canvas');c.width=W;c.height=H;const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0);const s=Math.min(1,900/Math.max(W,H)),w=Math.round(W*s),h=Math.round(H*s);return analyzeRGBA(PanelMatteCells.sampleBilinearRGBA(ctx.getImageData(0,0,W,H).data,W,H,w,h),w,h,prior,log);}finally{if(c)c.width=c.height=1;}}
 function displayBodies(rgba,w,h,parents){
  const white=Uint8Array.from({length:w*h},(_,i)=>+(Math.min(rgba[4*i],rgba[4*i+1],rgba[4*i+2])>190&&Math.max(rgba[4*i],rgba[4*i+1],rgba[4*i+2])-Math.min(rgba[4*i],rgba[4*i+1],rgba[4*i+2])<40));
  const masks=parents.map(p=>PanelLocalBoundaryConsensus.raster(p,w,h)),out=[];
  for(const body of PanelColoredRims.whiteBodies(white,w,h)?.items||[]){
   const n=body.indices.length,[x0,y0,x1,y1]=body.box;if(n<500||n>w*h*.035||x0<3||y0<3||x1>w-3||y1>h-3||n/((x1-x0)*(y1-y0))<.48)continue;
   const hits=masks.map(m=>body.indices.reduce((s,i)=>s+m[i],0)),owner=hits.indexOf(Math.max(...hits));if(hits[owner]<n*.97||hits.filter(v=>v>=n*.97).length!==1)continue;
   const mask=new Uint8Array(w*h);for(const i of body.indices)mask[i]=1;let edges=0,ink=0,paper=0,dark=0;
   for(const i of body.indices){paper+=white[i];dark+=+(Math.max(rgba[4*i],rgba[4*i+1],rgba[4*i+2])<100);const x=i%w,y=i/w|0;if(!mask[i-1]||!mask[i+1]||!mask[i-w]||!mask[i+w]){edges++;let lo=255;for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){const j=4*((y+dy)*w+x+dx);lo=Math.min(lo,.299*rgba[j]+.587*rgba[j+1]+.114*rgba[j+2]);}ink+=+(lo<90);}}
   if(ink<edges*.90||paper<n*.60||paper>n*.95||dark<n*.05||dark>n*.35)continue;
   out.push({owner,indices:body.indices,box:body.box});
  }return out;
 }
 function installReader(reader){
  if(!reader||reader._neutralMatteGroupsReader)return;
  const old=reader.displayPanelContours;
  reader.displayPanelContours=function(p,contours=this.panelContours(p)){
   const owners=this.currentPanels;if(!owners?.some(validPanel))return old.call(this,p,contours);
   const img=this.getPanelImageContext()?.img;let state=this._neutralMatteGroupsDisplay;
   if(!state||state.owners!==owners||state.img!==img){
    state=this._neutralMatteGroupsDisplay={owners,img,prior:owners.filter(q=>!validPanel(q)),added:owners.filter(validPanel),cache:new WeakMap(),bodies:[],before:new WeakMap(),addedMasks:[]};
    const v=state.added[0]._structuralGridProof,w=v.analysisWidth,h=v.analysisHeight;state.w=w;state.h=h;state.addedMasks=state.added.map(q=>PanelLocalBoundaryConsensus.raster(q,w,h));
    // Preserve the earlier repair context; newly proven exclusive source cells
    // retain their pixels when an older repair extends beyond its own source.
    // Enclosed speech almost wholly inside the new cell moves as one body.
    this.currentPanels=state.prior;try{for(const peer of state.prior)state.before.set(peer,old.call(this,peer,this.panelContours(peer)));}finally{this.currentPanels=owners;}
    if(img)try{const W=img.naturalWidth||img.width,H=img.naturalHeight||img.height,c=document.createElement('canvas');c.width=W;c.height=H;try{const g=c.getContext('2d',{willReadFrequently:true});g.drawImage(img,0,0);const rgba=PanelMatteCells.sampleBilinearRGBA(g.getImageData(0,0,W,H).data,W,H,w,h);state.bodies=displayBodies(rgba,w,h,state.added);}finally{c.width=c.height=1;}}catch(_){/* Abstain from speech completion if source pixels are unavailable. */}
   }
   if(state.cache.has(p))return state.cache.get(p);
   const w=state.w,h=state.h,added=state.added.indexOf(p),before=added<0?state.before.get(p):contours;if(!before)return contours;
   const mask=PanelCropRepair.raster(before,w,h),original=mask.slice();
   if(added<0){for(const owned of state.addedMasks)for(let i=0;i<mask.length;i++)if(owned[i])mask[i]=0;}
   for(const body of state.bodies)for(const i of body.indices)mask[i]=+(body.owner===added);
   if(added<0&&!mask.some((v,i)=>v!==original[i])){state.cache.set(p,before);return before;}
   const rings=PanelMatteCells.tracePixelContours(mask,w,h,1),result=rings?.map(q=>q.map(([x,y])=>({x:x/w,y:y/h})))||before;state.cache.set(p,result);return result;
  };
  reader._neutralMatteGroupsReader=true;
 }
 function install(detector){if(typeof PanelStructuralGrid!=='undefined'&&!PanelStructuralGrid._neutralMatteGroups){const old=PanelStructuralGrid.validPanel;PanelStructuralGrid.validPanel=p=>p?._structuralGridProof?.version===VERSION?validPanel(p):old(p);PanelStructuralGrid._neutralMatteGroups=true;}if(typeof PanelGeometry!=='undefined'&&!PanelGeometry._neutralMatteGroups){const old=PanelGeometry.refine;PanelGeometry.refine=async function(url,p,log){return validPanel(p)?{...p}:old.call(this,url,p,log);};PanelGeometry._neutralMatteGroups=true;}if(typeof PanelEdgeSpill!=='undefined'&&!PanelEdgeSpill._neutralMatteGroups){for(const name of['analyzeImage','analyzeRGBA']){const old=PanelEdgeSpill[name];if(typeof old==='function')PanelEdgeSpill[name]=function(...args){return validPanel(args[name==='analyzeImage'?1:3])?null:old.apply(this,args);};}PanelEdgeSpill._neutralMatteGroups=true;}if(!detector||detector._neutralMatteGroups)return;const old=detector.detect;detector.detect=async function(url,log){const prior=await old.call(this,url,log);try{const img=new Image();img.src=url;await img.decode();const out=supplementImage(img,prior,log);return out.length?prior.concat(out):prior;}catch(e){log?.('neutral matte groups deferred: '+e.message);return prior;}};detector._neutralMatteGroups=true;}
 return{analyzeRGBA,supplementImage,validPanel,install,installReader,displayBodies};
})();
if(typeof PanelDetect!=='undefined')PanelNeutralMatteGroups.install(PanelDetect);
if(typeof module!=='undefined')module.exports=PanelNeutralMatteGroups;
