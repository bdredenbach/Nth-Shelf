/* Recover a uniquely bounded lower continuation behind an already proved
 * focused paper cell. Independent seed maps retain source-pixel protrusions;
 * complete earlier Reader displays keep ownership and tap priority. Geometry
 * proves extraction only: single/two-frame continuity is reviewed separately.
 * No book, page, title, text, image identity or stored crop chooses the target. */
const PanelFocusedPaperContinuation=(()=>{
 'use strict';
 const VERSION=70,METHOD='stable-lower-paper-continuation',E=()=>PanelLocalBoundaryConsensus.pixelEvidence,same=(a,b)=>JSON.stringify(a)===JSON.stringify(b),cache=new WeakMap();
 function freeze(q){if(q&&typeof q==='object'&&!Object.isFrozen(q)){for(const v of Object.values(q))freeze(v);Object.freeze(q);}return q;}
 function eligible(p){return PanelFocusedPaperCell.validPanel(p);}
 function source(p,r,w,h){const v=p?._structuralGridProof;if(v?.version!==18||v.seedRadius!==r||v.analysisWidth!==w||v.analysisHeight!==h||v.count!==3||!v.palette?.paper||v.variance<700)return false;const q={...p,_structuralGridProof:{...v}};delete q._structuralGridProof.seedRadius;return PanelRaggedGutters.validPanel(q);}
 function measured(first,second,anchor,prior){
  const v=anchor._structuralGridProof,w=v.analysisWidth,h=v.analysisHeight,A=PanelLocalBoundaryConsensus.raster(first,w,h),B=PanelLocalBoundaryConsensus.raster(second,w,h),P=PanelLocalBoundaryConsensus.raster(v.parent,w,h),blocked=new Uint8Array(w*h);
  if(prior.length<1||prior.length>24||prior.filter(eligible).length!==1||!prior.some(q=>same(q,anchor))||prior.some(q=>!PanelGeometryOrthogonal._provenContours(q)))return null;
  for(const q of prior){const m=PanelLocalBoundaryConsensus.raster(q,w,h);for(let i=0;i<m.length;i++)blocked[i]|=m[i];}
  let difference=0,outside=0,overlap=0;const mask=A.map((n,i)=>{difference+=+(n!==B[i]);outside+=+(n&&!P[i]);overlap+=+(n&&blocked[i]);return +(n&&P[i]&&!blocked[i]);}),g=E().extent(mask,w,h),parentPixels=P.reduce((s,n)=>s+n,0),[x0,y0,x1,y1]=g.box;
  if(!g.pixels||difference>g.pixels*.004||outside>g.pixels*.002||overlap>g.pixels*.002||g.pixels<parentPixels*.20||g.pixels>parentPixels*.55||x0>w*.10||x1<w*.95||y0< (anchor.y+anchor.h*.70)*h||y1-y0<h*.18||y1-y0>h*.45||y1<(v.parent.y+v.parent.h-.025)*h||g.pixels/((x1-x0)*(y1-y0))<.70)return null;
  const rings=PanelMatteCells.tracePixelContours(mask,w,h,1);if(rings?.length!==1)return null;return{mask,g,difference,outside,overlap,parentPixels,rings};
 }
 function boundaryOK(b){return b&&['samples','edges','white','exterior','ink','mixed'].every(k=>Array.isArray(b[k])&&b[k].length===4&&b[k].every(n=>Number.isInteger(n)&&n>=0))&&b.samples.every((n,k)=>{const inner=n-b.edges[k];return n>=20&&b.edges[k]<=n&&b.white[k]<=inner&&b.exterior[k]<=b.white[k]&&b.ink[k]<=inner&&b.mixed[k]<=inner&&b.mixed[k]>=inner*.90&&b.white[k]>=inner*[.90,.95,.65,.65][k]&&b.exterior[k]>=inner*[.30,.95,.70,.40][k];});}
 function construct(v,c){const w=v.analysisWidth,h=v.analysisHeight,[a,b,d,e]=c.g.box;return{x:a/w,y:b/h,w:(d-a)/w,h:(e-b)/h,_identitySource:'structural-grid-frame',_geometryOwner:'structural-grid-contours',_geometryType:'focused-paper-continuation',_contours:c.rings.map(q=>q.map(([x,y])=>({x:x/w,y:y/h}))),_structuralGridProof:v};}
 function validPanel(p){const v=p?._structuralGridProof,hit=v&&cache.get(v);if(hit&&p._contours===hit.contours)return same([p.x,p.y,p.w,p.h],hit.box)&&p._identitySource==='structural-grid-frame'&&p._geometryOwner==='structural-grid-contours'&&p._geometryType==='focused-paper-continuation'&&!p._quad&&!p._outline;
  try{if(v?.version!==VERSION||v.method!==METHOD||v.connected!==true||!eligible(v.anchor)||v.analysisWidth!==v.anchor._structuralGridProof.analysisWidth||v.analysisHeight!==v.anchor._structuralGridProof.analysisHeight||!Array.isArray(v.prior)||!source(v.first,4,v.analysisWidth,v.analysisHeight)||!source(v.second,6,v.analysisWidth,v.analysisHeight)||v.internalDivider!==false||!boundaryOK(v.boundary))return false;
   const c=measured(v.first,v.second,v.anchor,v.prior);if(!c||c.difference!==v.difference||c.outside!==v.outside||c.overlap!==v.overlap||c.parentPixels!==v.parentPixels||c.g.pixels!==v.pixels||!same(c.g.box,v.box)||!same(c.rings,v.pixelContours))return false;
   const w=v.analysisWidth,h=v.analysisHeight,empty=new Uint8Array(w*h),b=E().boundary(c.mask,new Uint8ClampedArray(w*h*4),{near:empty,nearExterior:empty},w,h);if(!same(b.samples,v.boundary.samples)||!same(b.edges,v.boundary.edges))return false;
   const expected=construct(v,c);if(!same(expected._contours,p._contours)||!same([p.x,p.y,p.w,p.h],[expected.x,expected.y,expected.w,expected.h])||p._identitySource!==expected._identitySource||p._geometryOwner!==expected._geometryOwner||p._geometryType!==expected._geometryType||p._quad||p._outline)return false;
   freeze(v);freeze(p._contours);cache.set(v,{contours:p._contours,box:[p.x,p.y,p.w,p.h]});return true;
  }catch(_){return false;}
 }
 function supplementRGBA(rgba,w,h,prior=[],log){
  if(!Array.isArray(prior)||prior.length>24||prior.some(validPanel)||prior.filter(eligible).length!==1||rgba?.length!==w*h*4)return[];
  const anchor=prior.find(eligible),a=anchor._structuralGridProof;if(w!==a.analysisWidth||h!==a.analysisHeight)return[];for(let i=3;i<rgba.length;i+=4)if(rgba[i]!==255)return[];
  // Replay source-paper paths; serialized geometry alone cannot select artwork.
  const paths=[[10,.3],[12,.4]].map(([weight,travel])=>PanelFocusedPaperCell.paperPath(rgba,w,h,a.corridorY,weight,travel));if(!same(paths,a.paths))return[];
  const lower=paths.map((ys,k)=>{const barrier=new Uint8Array(w*h);ys.forEach((y,x)=>{barrier[y*w+x]=1;});return PanelRaggedGutters.analyzeRGBA(rgba,w,h,null,'cooperative-candidates',false,k?6:4,barrier).filter(p=>source(p,k?6:4,w,h)&&p.y>anchor.y+anchor.h*.70&&p.y+p.h>=a.parent.y+a.parent.h-.025);});
  if(lower.some(q=>q.length!==1))return[];const[first,second]=lower.map(q=>q[0]),c=measured(first,second,anchor,prior);if(!c)return[];
  const paper=E().paper(rgba,w,h,{paper:true}),boundary=E().boundary(c.mask,rgba,paper,w,h);if(!boundaryOK(boundary)||E().internalDivider(c.mask,rgba,paper,w,h))return[];
  const v={version:VERSION,method:METHOD,connected:true,analysisWidth:w,analysisHeight:h,anchor,prior:prior.slice(),first,second,difference:c.difference,outside:c.outside,overlap:c.overlap,parentPixels:c.parentPixels,pixels:c.g.pixels,box:c.g.box,pixelContours:c.rings,boundary,internalDivider:false},p=construct(v,c);
  if(!validPanel(p))return[];log?.('focused continuation: one complete bounded lower source candidate; continuity requires review');return[p];
 }
 function supplementImage(img,prior,log){if(!Array.isArray(prior)||prior.filter(eligible).length!==1||prior.some(validPanel))return[];const W=img.naturalWidth||img.width,H=img.naturalHeight||img.height;if(!W||!H||W*H>24000000)return[];let c;try{c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d',{willReadFrequently:true});g.drawImage(img,0,0);const s=Math.min(1,900/Math.max(W,H)),w=Math.round(W*s),h=Math.round(H*s);return supplementRGBA(PanelMatteCells.sampleBilinearRGBA(g.getImageData(0,0,W,H).data,W,H,w,h),w,h,prior,log);}finally{if(c)c.width=c.height=1;}}
 function installReader(reader){if(!reader||reader._focusedPaperContinuationReader)return;const old=reader.displayPanelContours;reader.displayPanelContours=function(p,contours=this.panelContours(p)){
  const owners=this.currentPanels;if(!owners?.some(validPanel))return old.call(this,p,contours);const img=this.getPanelImageContext()?.img;let entry=this._focusedPaperContinuationDisplay;
  if(!entry||entry.owners!==owners||entry.img!==img)entry=this._focusedPaperContinuationDisplay={owners,img,baseline:owners.filter(q=>!validPanel(q)),cache:new WeakMap()};
  this.currentPanels=entry.baseline;try{
   if(!validPanel(p))return old.call(this,p,contours);
   if(entry.cache.has(p))return entry.cache.get(p);
   const v=p._structuralGridProof,w=v.analysisWidth,h=v.analysisHeight,mask=PanelLocalBoundaryConsensus.raster(p,w,h);
   for(const peer of entry.baseline){const before=old.call(this,peer,this.panelContours(peer));if(!before)return contours;const blocked=PanelCropRepair.raster(before,w,h);for(let i=0;i<mask.length;i++)if(blocked[i])mask[i]=0;}
   const rings=PanelMatteCells.tracePixelContours(mask,w,h,1),result=rings?.map(q=>q.map(([x,y])=>({x:x/w,y:y/h})))||contours;entry.cache.set(p,result);return result;
  }finally{this.currentPanels=owners;}
 };reader._focusedPaperContinuationReader=true;}
 function install(detector){if(typeof PanelStructuralGrid!=='undefined'&&!PanelStructuralGrid._focusedPaperContinuation){const old=PanelStructuralGrid.validPanel;PanelStructuralGrid.validPanel=p=>p?._structuralGridProof?.version===VERSION?validPanel(p):old(p);PanelStructuralGrid._focusedPaperContinuation=true;}if(typeof PanelGeometry!=='undefined'&&!PanelGeometry._focusedPaperContinuation){const old=PanelGeometry.refine;PanelGeometry.refine=async function(url,p,log){return validPanel(p)?{...p}:old.call(this,url,p,log);};PanelGeometry._focusedPaperContinuation=true;}if(typeof PanelEdgeSpill!=='undefined'&&!PanelEdgeSpill._focusedPaperContinuation){for(const name of['analyzeImage','analyzeRGBA']){const old=PanelEdgeSpill[name];if(typeof old==='function')PanelEdgeSpill[name]=function(...args){return validPanel(args[name==='analyzeImage'?1:3])?null:old.apply(this,args);};}PanelEdgeSpill._focusedPaperContinuation=true;}if(!detector||detector._focusedPaperContinuation)return;const old=detector.detect;detector.detect=async function(url,log){const prior=await old.call(this,url,log);if(prior.filter(eligible).length!==1||prior.some(validPanel))return prior;try{const img=new Image();img.src=url;await img.decode();const out=supplementImage(img,prior,log);return out.length?prior.concat(out):prior;}catch(e){log?.('focused continuation deferred: '+e.message);return prior;}};detector._focusedPaperContinuation=true;}
 return{eligible,source,measured,boundaryOK,supplementRGBA,supplementImage,validPanel,install,installReader};
})();
if(typeof PanelDetect!=='undefined')PanelFocusedPaperContinuation.install(PanelDetect);
if(typeof module!=='undefined')module.exports=PanelFocusedPaperContinuation;
