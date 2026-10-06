/* Append independently stable source cells closed by the trailing page edge.
 * Dual erosion must agree, the first map retains unique pixel ownership and every non-edge frontier has exterior paper and ink
 * support, and all earlier discovery and displayed ownership is preserved.
 * Dark achromatic gutters stay with existing detectors. Internal scene
 * identity/completeness is reviewed separately from geometry. */
const PanelTrailingEdgeGroups=(()=>{
 'use strict';
 const VERSION=55,METHOD='stable-trailing-edge-group',E=()=>PanelLocalBoundaryConsensus.pixelEvidence,same=(a,b)=>JSON.stringify(a)===JSON.stringify(b),cache=new WeakMap();
 function freeze(v){if(v&&typeof v==='object'&&!Object.isFrozen(v)){for(const a of Object.values(v))freeze(a);Object.freeze(v);}return v;}
 function dimensions(w,h){return Number.isInteger(w)&&Number.isInteger(h)&&w>=350&&h>=350&&w<=900&&h<=900&&h>=w*.7&&h<=w*1.8;}
 function source(p,r,w,h){const v=p?._structuralGridProof;if(!v||v.version!==18||v.seedRadius!==r||v.analysisWidth!==w||v.analysisHeight!==h||typeof v.palette?.paper!=='boolean'||v.count<2||v.count>24||v.variance<700||!v.palette.paper&&(!v.palette.colors?.length||v.palette.colors.some(c=>Math.max(...c)-Math.min(...c)<24||.299*c[0]+.587*c[1]+.114*c[2]<35))||p._contours?.length!==1)return false;const copy={...p,_structuralGridProof:{...v,count:Math.max(3,v.count)}};delete copy._structuralGridProof.seedRadius;return PanelRaggedGutters.validPanel(copy);}
 function supported(b){
  if(!b||!['samples','edges','white','exterior','ink','mixed'].every(k=>Array.isArray(b[k])&&b[k].length===4&&b[k].every(n=>Number.isInteger(n)&&n>=0)))return false;
  if(b.edges[1]<b.samples[1]*.66||b.edges.filter(n=>n>0).length>3)return false;
  return b.samples.every((n,k)=>n>=60&&b.edges[k]<=n&&b.white[k]<=n-b.edges[k]&&b.exterior[k]<=b.white[k]&&b.ink[k]<=n-b.edges[k]&&b.mixed[k]<=n-b.edges[k]&&b.mixed[k]>=.75*(n-b.edges[k])&&b.white[k]>=.66*(n-b.edges[k])&&b.exterior[k]>=.55*(n-b.edges[k])&&(k===1||b.ink[k]>=.30*(n-b.edges[k])));
 }
 function continuation(g,w,h,paper){const b=g.box,W=b[2]-b[0],H=b[3]-b[1],fill=g.pixels/(W*H);return b[3]===h&&W>=w*.30&&H>=h*.30&&H<=h*.85&&g.pixels>=w*h*.14&&g.pixels<=w*h*.82&&fill>=.80&&fill<=.99;}
 function measured(first,second,w,h,exclusions=[]){
  const A=PanelLocalBoundaryConsensus.raster(first,w,h),B=PanelLocalBoundaryConsensus.raster(second,w,h),mask=A.slice(),difference=A.reduce((s,v,i)=>s+ +(v!==B[i]),0),g=E().extent(mask,w,h);
  if(!same(first._structuralGridProof.palette,second._structuralGridProof.palette)||!g.pixels||difference>g.pixels*.002||!continuation(g,w,h,first._structuralGridProof.palette.paper))return null;
  for(const p of exclusions){if(!PanelGeometryOrthogonal._provenContours(p))return null;const other=PanelLocalBoundaryConsensus.raster(p,w,h);if(mask.some((v,i)=>v&&other[i]))return null;}
  const raw=PanelMatteCells.tracePixelContours(mask,w,h,1);if(!raw||raw.length!==1)return null;
  return{mask,g,difference,raw,contours:raw.map(q=>q.map(([x,y])=>({x:x/w,y:y/h})))};
 }
 function construct(v,c,w,h){const[x0,y0,x1,y1]=c.g.box;return{x:x0/w,y:y0/h,w:(x1-x0)/w,h:(y1-y0)/h,_identitySource:'structural-grid-frame',_geometryOwner:'structural-grid-contours',_geometryType:'trailing-edge-group',_contours:c.contours,_structuralGridProof:v};}
 function validPanel(p){const v=p?._structuralGridProof,hit=v&&cache.get(v);if(hit&&p._contours===hit.contours)return p._identitySource==='structural-grid-frame'&&p._geometryOwner==='structural-grid-contours'&&p._geometryType==='trailing-edge-group'&&!p._quad&&!p._outline&&same([p.x,p.y,p.w,p.h],hit.box);try{const w=v?.analysisWidth,h=v?.analysisHeight;if(v?.version!==VERSION||v.method!==METHOD||v.connected!==true||!dimensions(w,h)||!source(v.first,4,w,h)||!source(v.second,6,w,h)||v.originalOwnerOverlap!==0||!supported(v.boundary)||typeof v.internalDivider!=='boolean'||!Array.isArray(v.exclusions)||v.exclusions.length>24)return false;const c=measured(v.first,v.second,w,h,v.exclusions||[]);if(!c||v.difference!==c.difference||v.pixels!==c.g.pixels||!same(v.box,c.g.box)||!same(v.pixelContours,c.raw)||!continuation(c.g,w,h,v.first._structuralGridProof.palette.paper))return false;const blank=new Uint8Array(w*h),front=E().boundary(c.mask,new Uint8ClampedArray(w*h*4),{near:blank,nearExterior:blank},w,h);if(!same(front.samples,v.boundary.samples)||!same(front.edges,v.boundary.edges))return false;const expected=construct(v,c,w,h);if(!same(p._contours,expected._contours)||p._identitySource!==expected._identitySource||p._geometryOwner!==expected._geometryOwner||p._geometryType!==expected._geometryType||p._quad||p._outline||!same([p.x,p.y,p.w,p.h],[expected.x,expected.y,expected.w,expected.h]))return false;freeze(v);freeze(p._contours);cache.set(v,{contours:p._contours,box:[p.x,p.y,p.w,p.h]});return true;}catch(_){return false;}}
 function analyzeRGBA(rgba,w,h,prior=[],log){
  if(!dimensions(w,h)||rgba?.length!==w*h*4||!Array.isArray(prior)||prior.length>24||prior.some(p=>!PanelGeometryOrthogonal._provenContours(p)))return[];for(let i=3;i<rgba.length;i+=4)if(rgba[i]!==255)return[];
  const first=PanelRaggedGutters.analyzeCooperativeRGBA(rgba,w,h,4).filter(p=>source(p,4,w,h));if(!first.length)return[];const second=PanelRaggedGutters.analyzeCooperativeRGBA(rgba,w,h,6).filter(p=>source(p,6,w,h)),out=[];
  for(const a of first){const matches=second.filter(b=>Math.max(Math.abs(a.x-b.x),Math.abs(a.y-b.y),Math.abs(a.w-b.w),Math.abs(a.h-b.h))<.015).map(b=>({b,c:measured(a,b,w,h,prior)})).filter(q=>q.c);if(matches.length!==1)continue;const {b,c}=matches[0],P=E().paper(rgba,w,h,a._structuralGridProof.palette),boundary=E().boundary(c.mask,rgba,P,w,h);if(!supported(boundary))continue;
   const internalDivider=E().internalDivider(c.mask,rgba,P,w,h);
   const v={version:VERSION,method:METHOD,connected:true,analysisWidth:w,analysisHeight:h,first:a,second:b,exclusions:prior.slice(),difference:c.difference,pixels:c.g.pixels,box:c.g.box,pixelContours:c.raw,boundary,internalDivider,originalOwnerOverlap:0},p=construct(v,c,w,h);if(validPanel(p))out.push(p);
  }
  if(out.length)log?.('trailing edge groups: stable source boundaries, earlier owners preserved');return out;
 }
 function supplementImage(img,prior,log){const W=img.naturalWidth||img.width,H=img.naturalHeight||img.height;if(!W||!H||H<W*.7||H>W*1.8||W*H>24000000 )return[];let c;try{c=document.createElement('canvas');c.width=W;c.height=H;const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0);const s=Math.min(1,900/Math.max(W,H)),w=Math.round(W*s),h=Math.round(H*s);return analyzeRGBA(PanelMatteCells.sampleBilinearRGBA(ctx.getImageData(0,0,W,H).data,W,H,w,h),w,h,prior,log);}finally{if(c)c.width=c.height=1;}}
 function installReader(reader){
  if(!reader||reader._trailingEdgeGroupsReader)return;
  const old=reader.displayPanelContours;
  reader.displayPanelContours=function(p,contours=this.panelContours(p)){
   const owners=this.currentPanels;
   if(!owners?.some(validPanel))return old.call(this,p,contours);
   const img=this.getPanelImageContext()?.img;
   let state=this._trailingEdgeGroupsDisplay;
   if(!state||state.owners!==owners||state.img!==img)state=this._trailingEdgeGroupsDisplay={owners,img,prior:owners.filter(q=>!validPanel(q)),cache:new WeakMap()};
   this.currentPanels=state.prior;
   try{
    if(!validPanel(p))return old.call(this,p,contours);
    if(state.cache.has(p))return state.cache.get(p);
    const v=p._structuralGridProof,w=v.analysisWidth,h=v.analysisHeight,mask=PanelLocalBoundaryConsensus.raster(p,w,h);
    // Earlier displayed pixels retain ownership, including existing repairs.
    for(const peer of state.prior){const q=old.call(this,peer,this.panelContours(peer));if(!q)return contours;const blocked=PanelCropRepair.raster(q,w,h);for(let i=0;i<mask.length;i++)if(blocked[i])mask[i]=0;}
    const rings=PanelMatteCells.tracePixelContours(mask,w,h,1),result=rings?.map(q=>q.map(([x,y])=>({x:x/w,y:y/h})))||contours;
    state.cache.set(p,result);return result;
   }finally{this.currentPanels=owners;}
  };
  reader._trailingEdgeGroupsReader=true;
 }
 function install(detector){if(typeof PanelStructuralGrid!=='undefined'&&!PanelStructuralGrid._trailingEdgeGroups){const old=PanelStructuralGrid.validPanel;PanelStructuralGrid.validPanel=p=>p?._structuralGridProof?.version===VERSION?validPanel(p):old(p);PanelStructuralGrid._trailingEdgeGroups=true;}if(typeof PanelGeometry!=='undefined'&&!PanelGeometry._trailingEdgeGroups){const old=PanelGeometry.refine;PanelGeometry.refine=async function(url,p,log){return validPanel(p)?{...p}:old.call(this,url,p,log);};PanelGeometry._trailingEdgeGroups=true;}if(typeof PanelEdgeSpill!=='undefined'&&!PanelEdgeSpill._trailingEdgeGroups){for(const name of['analyzeImage','analyzeRGBA']){const old=PanelEdgeSpill[name];if(typeof old==='function')PanelEdgeSpill[name]=function(...args){return validPanel(args[name==='analyzeImage'?1:3])?null:old.apply(this,args);};}PanelEdgeSpill._trailingEdgeGroups=true;}if(!detector||detector._trailingEdgeGroups)return;const old=detector.detect;detector.detect=async function(url,log){const prior=await old.call(this,url,log);try{const img=new Image();img.src=url;await img.decode();const out=supplementImage(img,prior,log);return out.length?prior.concat(out):prior;}catch(e){log?.('trailing edge groups deferred: '+e.message);return prior;}};detector._trailingEdgeGroups=true;}
 return{analyzeRGBA,supplementImage,validPanel,install,installReader};
})();
if(typeof PanelDetect!=='undefined')PanelTrailingEdgeGroups.install(PanelDetect);
if(typeof module!=='undefined')module.exports=PanelTrailingEdgeGroups;
