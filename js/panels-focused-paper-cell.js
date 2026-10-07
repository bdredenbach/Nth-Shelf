/* Split the first independently bounded cell from a proven paper group.
 * A witnessed interrupted gutter supplies the search band. Two independently
 * weighted paper paths and eroded seed maps must agree. Paths split seeds only:
 * source-pixel growth retains curved borders, protrusions and complete balloons.
 * Unresolved remainder stays in normal-page reading, never a claimed frame.
 * No book, page, text, image identity, tap or stored crop selects the boundary. */
const PanelFocusedPaperCell=(()=>{
 'use strict';
 const VERSION=69,METHOD='stable-focused-paper-cell',same=(a,b)=>JSON.stringify(a)===JSON.stringify(b),E=()=>PanelLocalBoundaryConsensus.pixelEvidence,cache=new WeakMap();
 function freeze(v){if(v&&typeof v==='object'&&!Object.isFrozen(v)){for(const q of Object.values(v))freeze(q);Object.freeze(v);}return v;}
 function eligible(p){return p?._structuralGridProof?.version===54&&p._structuralGridProof.internalDivider===true&&p._structuralGridProof.first?._structuralGridProof?.palette?.paper===true&&PanelPaperEdgeGroups.validPanel(p);}
 function dimensions(w,h){return Number.isInteger(w)&&Number.isInteger(h)&&w>=350&&h>=350&&w<=900&&h<=900&&h>w*1.15&&h<w*1.8;}
 function corridor(lines,p,w,h){
  const candidates=lines.filter(e=>e.axis===1&&e.pos>(p.y+p.h*.20)*h&&e.pos<(p.y+p.h*.80)*h&&e.before[0]<=p.x*w+w*.04&&e.after[1]>=(p.x+p.w*.52)*w&&e.flank>=.75&&Math.max(...e.exterior)>=.8);
  const groups=[];for(const e of candidates){let g=groups.find(q=>Math.abs(q.pos-e.pos)<=4);if(!g){g={pos:e.pos,lines:[]};groups.push(g);}g.lines.push(e);}
  const strong=groups.filter(g=>new Set(g.lines.map(e=>e.pos)).size>=3);if(strong.length!==1)return null;
  const ys=[...new Set(strong[0].lines.map(e=>e.pos))].sort((a,b)=>a-b);return{y:Math.floor((ys[0]+ys.at(-1))/2),lines:strong[0].lines};
 }
 function paperPath(rgba,w,h,y0,weight,travel){
  const lo=Math.max(1,y0-Math.round(h*.10)),hi=Math.min(h-1,y0+Math.round(h*.135)),H=hi-lo,parents=new Int16Array(w*H),cost=new Float64Array(H);
  for(let j=0;j<H;j++)cost[j]=Math.abs(j+lo-y0)*.3;
  for(let x=0;x<w;x++){const next=new Float64Array(H);for(let j=0;j<H;j++){const y=j+lo,i=(y*w+x)*4,mn=Math.min(rgba[i],rgba[i+1],rgba[i+2]);let best=Infinity,pick=0;for(let d=-5;d<=5;d++)if(j+d>=0&&j+d<H){const c=cost[j+d]+Math.abs(d)*travel;if(c<best){best=c;pick=j+d;}}next[j]=best+(mn>232?0:Math.max(.5,(255-mn)/255*weight))+Math.abs(y-y0)*.0005;parents[x*H+j]=pick;}cost.set(next);}
  let j=0;for(let k=1;k<H;k++)if(cost[k]<cost[j])j=k;const ys=[];for(let x=w-1;x>=0;x--){ys[x]=j+lo;j=parents[x*H+j];}return ys;
 }
 function source(p,r,w,h){const v=p?._structuralGridProof;if(v?.version!==18||v.seedRadius!==r||v.analysisWidth!==w||v.analysisHeight!==h||v.count<3||v.count>24||!v.palette?.paper||v.variance<700)return false;const q={...p,_structuralGridProof:{...v}};delete q._structuralGridProof.seedRadius;return PanelRaggedGutters.validPanel(q);}
 function measured(first,second,parent,peers,w,h){
  const A=PanelLocalBoundaryConsensus.raster(first,w,h),B=PanelLocalBoundaryConsensus.raster(second,w,h),P=PanelLocalBoundaryConsensus.raster(parent,w,h),blocked=new Uint8Array(w*h);
  for(const p of peers){if(!PanelGeometryOrthogonal._provenContours(p))return null;const m=PanelLocalBoundaryConsensus.raster(p,w,h);for(let i=0;i<m.length;i++)blocked[i]|=m[i];}
  let difference=0,inside=0,outside=0;const mask=A.map((v,i)=>{difference+=+(v!==B[i]);inside+=+(v&&P[i]);outside+=+(v&&!P[i]);return +(v&&P[i]&&!blocked[i]);}),g=E().extent(mask,w,h),parentPixels=P.reduce((s,v)=>s+v,0);
  if(!g.pixels||difference>inside*.002||outside>inside*.002||g.pixels<parentPixels*.30||g.pixels>parentPixels*.75||g.box[0]>w*.12||g.box[2]<w*.90||g.box[3]-g.box[1]<h*.20||g.box[3]-g.box[1]>h*.60||g.pixels/((g.box[2]-g.box[0])*(g.box[3]-g.box[1]))<.70)return null;
  const rings=PanelMatteCells.tracePixelContours(mask,w,h,1);if(!rings||rings.length!==1)return null;return{mask,g,difference,outside,parentPixels,rings};
 }
 function construct(v,c,w,h){const[a,b,d,e]=c.g.box;return{x:a/w,y:b/h,w:(d-a)/w,h:(e-b)/h,_identitySource:'structural-grid-frame',_geometryOwner:'structural-grid-contours',_geometryType:'focused-paper-cell',_contours:c.rings.map(q=>q.map(([x,y])=>({x:x/w,y:y/h}))),_structuralGridProof:v};}
 function boundaryValid(b){return b&&['samples','edges','white','exterior','ink','mixed'].every(k=>Array.isArray(b[k])&&b[k].length===4&&b[k].every(n=>Number.isInteger(n)&&n>=0))&&b.samples.every((n,k)=>n>=20&&b.edges[k]<=n&&b.white[k]<=n-b.edges[k]&&b.exterior[k]<=b.white[k]&&b.ink[k]<=n-b.edges[k]&&b.mixed[k]<=n-b.edges[k]&&b.mixed[k]>=.92*(n-b.edges[k])&&b.white[k]>=(k===1?.90:.70)*(n-b.edges[k])&&b.exterior[k]>=(k===1?.30:.55)*(n-b.edges[k]))&&b.ink[1]>=.50*(b.samples[1]-b.edges[1]);}
 function validPanel(p){const v=p?._structuralGridProof,hit=v&&cache.get(v);if(hit&&hit.contours===p._contours)return same([p.x,p.y,p.w,p.h],hit.box)&&p._identitySource==='structural-grid-frame'&&p._geometryOwner==='structural-grid-contours'&&p._geometryType==='focused-paper-cell'&&!p._quad&&!p._outline;
  try{const w=v?.analysisWidth,h=v?.analysisHeight;if(v?.version!==VERSION||v.method!==METHOD||v.connected!==true||!dimensions(w,h)||!eligible(v.parent)||!Array.isArray(v.peers)||v.peers.length>23||!source(v.first,4,w,h)||!source(v.second,6,w,h)||v.internalDivider!==false||!Array.isArray(v.paths)||v.paths.length!==2||!same(v.pathWeights,[[10,.3],[12,.4]])||v.paths.some(ys=>ys.length!==w||ys.some((y,x)=>!Number.isInteger(y)||y<=0||y>=h-1||x&&Math.abs(y-ys[x-1])>5))||!Array.isArray(v.corridors))return false;
   const co=corridor(v.corridors,v.parent,w,h);if(!co||co.y!==v.corridorY)return false;
   const c=measured(v.first,v.second,v.parent,v.peers,w,h);if(!c||c.difference!==v.difference||c.outside!==v.outside||c.parentPixels!==v.parentPixels||c.g.pixels!==v.pixels||!same(c.g.box,v.box)||!same(c.rings,v.pixelContours)||!boundaryValid(v.boundary))return false;
   const empty=new Uint8Array(w*h),b=E().boundary(c.mask,new Uint8ClampedArray(w*h*4),{near:empty,nearExterior:empty},w,h);if(!same(b.samples,v.boundary.samples)||!same(b.edges,v.boundary.edges))return false;
   const expected=construct(v,c,w,h);if(!same(expected._contours,p._contours)||!same([p.x,p.y,p.w,p.h],[expected.x,expected.y,expected.w,expected.h])||p._identitySource!==expected._identitySource||p._geometryOwner!==expected._geometryOwner||p._geometryType!==expected._geometryType||p._quad||p._outline)return false;
   freeze(v);freeze(p._contours);cache.set(v,{contours:p._contours,box:[p.x,p.y,p.w,p.h]});return true;
  }catch(_){return false;}
 }
 function refineRGBA(rgba,w,h,prior=[],log){
  if(!dimensions(w,h)||rgba?.length!==w*h*4||!Array.isArray(prior)||prior.length>24||prior.some(p=>!PanelGeometryOrthogonal._provenContours(p)))return prior;
  const parents=prior.filter(eligible);if(parents.length!==1)return prior;for(let i=3;i<rgba.length;i+=4)if(rgba[i]!==255)return prior;
  const parent=parents[0],peers=prior.filter(p=>p!==parent),co=corridor(PanelInterruptedGutters.corridors(rgba,w,h),parent,w,h);if(!co)return prior;
  const paths=[[10,.3],[12,.4]].map(([weight,travel])=>paperPath(rgba,w,h,co.y,weight,travel));
  if(paths.some(ys=>ys.reduce((s,y,x)=>s+ +(Math.min(rgba[(y*w+x)*4],rgba[(y*w+x)*4+1],rgba[(y*w+x)*4+2])>232),0)<w*.65))return prior;
  const sets=paths.map((ys,k)=>{const barrier=new Uint8Array(w*h);ys.forEach((y,x)=>{barrier[y*w+x]=1;});return PanelRaggedGutters.analyzeRGBA(rgba,w,h,null,'cooperative-candidates',false,k?6:4,barrier);});
  const children=sets.map((set,k)=>set.filter(p=>source(p,k?6:4,w,h)&&p.y<co.y/h-.15&&p.y>=parent.y-.02&&p.y+p.h<parent.y+parent.h-.10));if(children.some(a=>a.length!==1))return prior;
  const[first,second]=children.map(a=>a[0]),c=measured(first,second,parent,peers,w,h);if(!c)return prior;const P=E().paper(rgba,w,h,{paper:true}),boundary=E().boundary(c.mask,rgba,P,w,h);if(!boundaryValid(boundary)||E().internalDivider(c.mask,rgba,P,w,h))return prior;
  const v={version:VERSION,method:METHOD,connected:true,analysisWidth:w,analysisHeight:h,parent,peers,first,second,paths,pathWeights:[[10,.3],[12,.4]],corridors:co.lines,corridorY:co.y,difference:c.difference,outside:c.outside,parentPixels:c.parentPixels,pixels:c.g.pixels,box:c.g.box,pixelContours:c.rings,boundary,internalDivider:false},p=construct(v,c,w,h);if(!validPanel(p))return prior;
  log?.('focused paper cell: stable single source cell; unresolved remainder uses normal page');return prior.map(q=>q===parent?p:q);
 }
 function refineImage(img,prior,log){if(!Array.isArray(prior)||!prior.some(eligible))return prior;const W=img.naturalWidth||img.width,H=img.naturalHeight||img.height;if(!W||!H||W*H>24000000)return prior;let c;try{c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d',{willReadFrequently:true});g.drawImage(img,0,0);const s=Math.min(1,900/Math.max(W,H)),w=Math.round(W*s),h=Math.round(H*s);return refineRGBA(PanelMatteCells.sampleBilinearRGBA(g.getImageData(0,0,W,H).data,W,H,w,h),w,h,prior,log);}finally{if(c)c.width=c.height=1;}}
 function installReader(reader){if(!reader||reader._focusedPaperCellReader)return;const old=reader.displayPanelContours;reader.displayPanelContours=function(p,contours=this.panelContours(p)){
  const owners=this.currentPanels;if(!owners?.some(validPanel))return old.call(this,p,contours);const img=this.getPanelImageContext()?.img;let entry=this._focusedPaperCellDisplay;
  if(!entry||entry.owners!==owners||entry.img!==img)entry=this._focusedPaperCellDisplay={owners,img,baseline:owners.map(q=>validPanel(q)?q._structuralGridProof.parent:q),cache:new WeakMap()};
  this.currentPanels=entry.baseline;
  try{
   // Existing caption/ornament completion still sees its original source
   // neighbor. Narrowing that neighbor must not remove the accepted annex.
   if(!validPanel(p))return old.call(this,p,contours);
   if(entry.cache.has(p))return entry.cache.get(p);
   const v=p._structuralGridProof,w=v.analysisWidth,h=v.analysisHeight,mask=PanelLocalBoundaryConsensus.raster(p,w,h);
   for(const peer of owners.filter(q=>!validPanel(q))){const before=old.call(this,peer,this.panelContours(peer));if(!before)return contours;const blocked=PanelCropRepair.raster(before,w,h);for(let i=0;i<mask.length;i++)if(blocked[i])mask[i]=0;}
   const rings=PanelMatteCells.tracePixelContours(mask,w,h,1),result=rings?.map(q=>q.map(([x,y])=>({x:x/w,y:y/h})))||contours;entry.cache.set(p,result);return result;
  }finally{this.currentPanels=owners;}
 };reader._focusedPaperCellReader=true;}
 function install(detector){if(typeof PanelStructuralGrid!=='undefined'&&!PanelStructuralGrid._focusedPaperCell){const old=PanelStructuralGrid.validPanel;PanelStructuralGrid.validPanel=p=>p?._structuralGridProof?.version===VERSION?validPanel(p):old(p);PanelStructuralGrid._focusedPaperCell=true;}
  if(typeof PanelGeometry!=='undefined'&&!PanelGeometry._focusedPaperCell){const old=PanelGeometry.refine;PanelGeometry.refine=async function(url,p,log){return validPanel(p)?{...p}:old.call(this,url,p,log);};PanelGeometry._focusedPaperCell=true;}
  if(typeof PanelEdgeSpill!=='undefined'&&!PanelEdgeSpill._focusedPaperCell){for(const name of['analyzeImage','analyzeRGBA']){const old=PanelEdgeSpill[name];if(typeof old==='function')PanelEdgeSpill[name]=function(...a){return validPanel(a[name==='analyzeImage'?1:3])?null:old.apply(this,a);};}PanelEdgeSpill._focusedPaperCell=true;}
  if(!detector||detector._focusedPaperCell)return;const old=detector.detect;detector.detect=async function(url,log){const prior=await old.call(this,url,log);if(!prior.some(eligible))return prior;try{const img=new Image();img.src=url;await img.decode();return refineImage(img,prior,log);}catch(e){log?.('focused paper cell deferred: '+e.message);return prior;}};detector._focusedPaperCell=true;
 }
 return{eligible,corridor,paperPath,refineRGBA,refineImage,validPanel,install,installReader};
})();
if(typeof PanelDetect!=='undefined')PanelFocusedPaperCell.install(PanelDetect);
if(typeof module!=='undefined')module.exports=PanelFocusedPaperCell;
