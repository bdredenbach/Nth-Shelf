/* A source-enclosed speech body can cross a scene's bounding box. Assign the
 * whole body to one strongly witnessed collar owner, including its lettering.
 * Transfer only body pixels; all artwork outside it and the union survive. */
const PanelSpeechOwnership=(()=>{
 'use strict';
 const VERSION=46,METHOD='atomic-cross-boundary-speech',same=(a,b)=>JSON.stringify(a)===JSON.stringify(b),E=()=>PanelLocalBoundaryConsensus.pixelEvidence,cache=new WeakMap();
 function freeze(v){if(v&&typeof v==='object'&&!Object.isFrozen(v)){for(const q of Object.values(v))freeze(q);Object.freeze(v);}return v;}
 function grow(m,w,h,r){for(let k=0;k<r;k++){const n=m.slice();for(let i=0;i<m.length;i++)if(m[i]){const x=i%w,y=i/w|0;if(x)n[i-1]=1;if(x+1<w)n[i+1]=1;if(y)n[i-w]=1;if(y+1<h)n[i+w]=1;}m=n;}return m;}
 function geometry(m,w,h){const g=E().extent(m,w,h),rings=PanelMatteCells.tracePixelContours(m,w,h,1);return rings?{...g,rings}:null;}
 function outline(m,w,h){return geometry(m,w,h)?.rings.map(q=>q.map(([x,y])=>({x:x/w,y:y/h})));}
 function front(mask,w,h){const out=[];for(let i=0;i<mask.length;i++)if(mask[i]){const x=i%w,y=i/w|0;if(x&&x<w-1&&y&&y<h-1&&(!mask[i-1]||!mask[i+1]||!mask[i-w]||!mask[i+w]))out.push(i);}return out;}
 function assignment(body,w,h){
  if(!Array.isArray(body?.contours)||body.contours.length!==1||body.contours[0].length<4||body.contours[0].length>4096||body.contours[0].some(p=>!Number.isFinite(p.x)||!Number.isFinite(p.y)||p.x<0||p.x>1||p.y<0||p.y>1)||!Array.isArray(body.participants)||body.participants.length<1||body.participants.length>24||!Number.isInteger(body.owner)||body.owner<0||body.owner>=body.participants.length)return null;
  const mask=PanelCropRepair.raster(body.contours,w,h),g=geometry(mask,w,h);if(!g||!same(body.contours,g.rings.map(q=>q.map(([x,y])=>({x:x/w,y:y/h}))))||!same(g.box,body.box)||g.pixels!==body.pixels||g.pixels<500||g.pixels>w*h*.075||g.box[0]<1||g.box[1]<1||g.box[2]>w-1||g.box[3]>h-1||g.pixels/((g.box[2]-g.box[0])*(g.box[3]-g.box[1]))<.48)return null;
  const near=grow(mask,w,h,3),collar=near.map((v,i)=>+(v&&!mask[i])),samples=collar.reduce((s,v)=>s+v,0),edges=front(mask,w,h);
  if(body.collarSamples!==samples||body.inkSamples!==edges.length||!Number.isInteger(body.ink)||body.ink<edges.length*.80||body.ink>edges.length)return null;
  const parents=[],hits=[],collarHits=[];
  for(const parent of body.participants){if(parent?._structuralGridProof?.version===VERSION)return null;const rings=PanelGeometryOrthogonal._provenContours(parent);if(!rings)return null;const m=PanelCropRepair.raster(rings,w,h);parents.push(m);hits.push(m.reduce((s,v,i)=>s+ +(v&&mask[i]),0));collarHits.push(m.reduce((s,v,i)=>s+ +(v&&collar[i]),0));}
  const winner=collarHits.indexOf(Math.max(...collarHits)),other=Math.max(0,...collarHits.filter((v,i)=>i!==winner)),p=body.participants[winner],b=g.box;
  if(winner!==body.owner||hits[winner]<g.pixels*.25||collarHits[winner]<samples*.55||collarHits[winner]-other<samples*.25||!same(hits,body.hits)||!same(collarHits,body.collarHits)||!(b[0]<p.x*w-6||b[1]<p.y*h-6||b[2]>(p.x+p.w)*w+6||b[3]>(p.y+p.h)*h+6))return null;
  return{mask,parents};
 }
 function validPanel(p){const entry=p?._structuralGridProof&&cache.get(p._structuralGridProof);if(entry&&p._contours===entry.contours)return p._identitySource==='structural-grid-frame'&&p._geometryOwner==='structural-grid-contours'&&p._geometryType==='atomic-speech-owner'&&!p._quad&&!p._outline&&same([p.x,p.y,p.w,p.h],entry.box);try{const v=p?._structuralGridProof,w=v?.analysisWidth,h=v?.analysisHeight;if(v?.version!==VERSION||v.method!==METHOD||v.connected!==true||!Number.isInteger(w)||!Number.isInteger(h)||w<250||h<350||w>900||h>900||p._identitySource!=='structural-grid-frame'||p._geometryOwner!=='structural-grid-contours'||p._geometryType!=='atomic-speech-owner'||p._quad||p._outline||!Array.isArray(v.bodies)||!v.bodies.length||v.bodies.length>128||v.parent?._structuralGridProof?.version===VERSION)return false;
  const rings=PanelGeometryOrthogonal._provenContours(v.parent);if(!rings)return false;const m=PanelCropRepair.raster(rings,w,h);
  for(const body of v.bodies){const a=assignment(body,w,h);if(!a)return false;const member=body.participants.findIndex(q=>same(q,v.parent));if(member<0)return false;for(let i=0;i<m.length;i++)if(a.mask[i])m[i]=+(member===body.owner);}
  const g=geometry(m,w,h);if(!g||g.pixels<w*h*.025||!same(g.box,v.box)||g.pixels!==v.pixels||!same(g.rings,v.pixelContours))return false;const[x0,y0,x1,y1]=g.box;if(!same([p.x,p.y,p.w,p.h],[x0/w,y0/h,(x1-x0)/w,(y1-y0)/h])||!same(p._contours,g.rings.map(q=>q.map(([x,y])=>({x:x/w,y:y/h})))))return false;freeze(v);freeze(p._contours);cache.set(v,{contours:p._contours,box:[p.x,p.y,p.w,p.h]});return true;
 }catch(_){return false;}}
 function analyzeRGBA(rgba,w,h,prior=[],log){
  if(!Number.isInteger(w)||!Number.isInteger(h)||w<250||h<350||w>900||h>900||rgba?.length!==w*h*4||!Array.isArray(prior)||!prior.length||prior.length>24||prior.some(p=>p?._structuralGridProof?.version===VERSION))return prior;for(let i=3;i<rgba.length;i+=4)if(rgba[i]!==255)return prior;
  const rings=prior.map(p=>PanelGeometryOrthogonal._provenContours(p)),masks=rings.map(q=>q?PanelCropRepair.raster(q,w,h):null),white=Uint8Array.from({length:w*h},(_,i)=>+(Math.min(rgba[4*i],rgba[4*i+1],rgba[4*i+2])>190&&Math.max(rgba[4*i],rgba[4*i+1],rgba[4*i+2])-Math.min(rgba[4*i],rgba[4*i+1],rgba[4*i+2])<40)),bodies=PanelColoredRims.whiteBodies(white,w,h),changes=prior.map(()=>[]),working=masks.map(m=>m?.slice()),assigned=new Uint8Array(w*h);
  for(const source of bodies?.items||[]){const[x0,y0,x1,y1]=source.box,bw=x1-x0,bh=y1-y0;if(source.pixels<500||source.pixels/(bw*bh)<.48||bw/bh>8||bh/bw>8||x0<3||y0<3||x1>w-3||y1>h-3)continue;
   const mask=new Uint8Array(w*h);for(const i of source.indices)mask[i]=1;if(mask.some((v,i)=>v&&assigned[i]))continue;
   const collar=grow(mask,w,h,3).map((v,i)=>+(v&&!mask[i])),samples=collar.reduce((s,v)=>s+v,0),hits=masks.map(m=>m?m.reduce((s,v,i)=>s+ +(v&&mask[i]),0):0),collarHits=masks.map(m=>m?m.reduce((s,v,i)=>s+ +(v&&collar[i]),0):0),winner=collarHits.indexOf(Math.max(...collarHits)),other=Math.max(0,...collarHits.filter((v,i)=>i!==winner)),p=prior[winner],g=geometry(mask,w,h);if(!p||hits[winner]<g.pixels*.25||collarHits[winner]<samples*.55||collarHits[winner]-other<samples*.25||!(g.box[0]<p.x*w-6||g.box[1]<p.y*h-6||g.box[2]>(p.x+p.w)*w+6||g.box[3]>(p.y+p.h)*h+6))continue;
   // Unproven owners cannot be displaced by this supplement.
   if(prior.some((p,k)=>!masks[k]&&PanelLocalBoundaryConsensus.raster(p,w,h).some((v,i)=>v&&mask[i])))continue;
   const edges=front(mask,w,h);let ink=0;for(const i of edges){let dark=255;const x=i%w,y=i/w|0;for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){const X=x+dx,Y=y+dy;if(X<0||Y<0||X>=w||Y>=h)continue;const j=4*(Y*w+X);dark=Math.min(dark,.299*rgba[j]+.587*rgba[j+1]+.114*rgba[j+2]);}ink+=dark<90;}if(ink<edges.length*.80)continue;
   const members=prior.map((p,k)=>k).filter(k=>hits[k]||collarHits[k]),body={contours:outline(mask,w,h),box:g.box,pixels:g.pixels,participants:members.map(k=>prior[k]),owner:members.indexOf(winner),hits:members.map(k=>hits[k]),collarHits:members.map(k=>collarHits[k]),collarSamples:samples,inkSamples:edges.length,ink};if(!assignment(body,w,h))continue;
   for(const k of members)if(k===winner||hits[k]){changes[k].push(body);for(let i=0;i<mask.length;i++)if(mask[i])working[k][i]=+(k===winner);}for(let i=0;i<mask.length;i++)assigned[i]|=mask[i];
  }
  const out=prior.map((p,k)=>{if(!changes[k].length)return p;const g=geometry(working[k],w,h);if(!g)return null;const[x0,y0,x1,y1]=g.box;return{x:x0/w,y:y0/h,w:(x1-x0)/w,h:(y1-y0)/h,_identitySource:'structural-grid-frame',_geometryOwner:'structural-grid-contours',_geometryType:'atomic-speech-owner',_contours:g.rings.map(q=>q.map(([x,y])=>({x:x/w,y:y/h}))),_structuralGridProof:{version:VERSION,method:METHOD,connected:true,analysisWidth:w,analysisHeight:h,parent:p,bodies:changes[k],box:g.box,pixels:g.pixels,pixelContours:g.rings}};});
  if(out.some((p,k)=>changes[k].length&&!validPanel(p)))return prior;if(changes.some(q=>q.length))log?.('atomic speech: '+changes.filter(q=>q.length).length+' owner contours repaired');return out;
 }
 function supplementImage(img,prior,log){const W=img.naturalWidth||img.width,H=img.naturalHeight||img.height;if(!W||!H||W*H>24000000)return prior;let c;try{c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d',{willReadFrequently:true});g.drawImage(img,0,0);const s=Math.min(1,900/Math.max(W,H)),w=Math.round(W*s),h=Math.round(H*s);return analyzeRGBA(PanelMatteCells.sampleBilinearRGBA(g.getImageData(0,0,W,H).data,W,H,w,h),w,h,prior,log);}finally{if(c)c.width=c.height=1;}}
 function install(detector){if(typeof PanelStructuralGrid!=='undefined'&&!PanelStructuralGrid._atomicSpeech){const old=PanelStructuralGrid.validPanel;PanelStructuralGrid.validPanel=p=>p?._structuralGridProof?.version===VERSION?validPanel(p):old(p);PanelStructuralGrid._atomicSpeech=true;}
  if(typeof PanelGeometry!=='undefined'&&!PanelGeometry._atomicSpeech){const old=PanelGeometry.refine;PanelGeometry.refine=async function(url,p,log){return validPanel(p)?{...p}:old.call(this,url,p,log);};PanelGeometry._atomicSpeech=true;}
  if(typeof PanelEdgeSpill!=='undefined'&&!PanelEdgeSpill._atomicSpeech){for(const name of['analyzeImage','analyzeRGBA']){const old=PanelEdgeSpill[name];if(typeof old==='function')PanelEdgeSpill[name]=function(...args){return validPanel(args[name==='analyzeImage'?1:3])?null:old.apply(this,args);};}PanelEdgeSpill._atomicSpeech=true;}
  if(!detector||detector._atomicSpeech)return;const old=detector.detect;detector.detect=async function(url,log){const prior=await old.call(this,url,log);try{const img=new Image();img.src=url;await img.decode();return supplementImage(img,prior,log);}catch(e){log?.('atomic speech deferred: '+e.message);return prior;}};detector._atomicSpeech=true;
 }
 return{analyzeRGBA,supplementImage,validPanel,install};
})();
if(typeof PanelDetect!=='undefined')PanelSpeechOwnership.install(PanelDetect);
if(typeof module!=='undefined')module.exports=PanelSpeechOwnership;
