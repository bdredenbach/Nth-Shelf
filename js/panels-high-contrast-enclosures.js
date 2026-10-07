/* Independent high-contrast exterior maps prove a dense broad source
 * enclosure with no owner or one sparse proven owner. Measured novelty,
 * paired color-channel boundaries and bounded peripheral islands preserve
 * complete opaque source interiors. Earlier displays and taps retain priority. */
const PanelHighContrastEnclosures=(()=>{
 'use strict';
 const VERSION=68,METHOD='independent-high-contrast-enclosure-envelope',E=()=>PanelLocalBoundaryConsensus.pixelEvidence,same=(a,b)=>JSON.stringify(a)===JSON.stringify(b),cache=new WeakMap();
 function freeze(v){if(v&&typeof v==='object'&&!Object.isFrozen(v)){for(const q of Object.values(v))freeze(q);Object.freeze(v);}return v;}
 function dims(w,h){return Number.isInteger(w)&&Number.isInteger(h)&&w>=350&&h>=350&&w<=900&&h<=900&&h>=w*1.15&&h<=w*1.8;}
 function encode(m){const out=[];for(let i=0;i<m.length;){if(!m[i]){i++;continue;}const a=i;while(i<m.length&&m[i])i++;out.push(a,i);}return out;}
 function decode(r,w,h){if(!Array.isArray(r)||r.length%2||r.length>100000)return null;const m=new Uint8Array(w*h);let last=-1;for(let k=0;k<r.length;k+=2){const a=r[k],b=r[k+1];if(!Number.isInteger(a)||!Number.isInteger(b)||a<0||a>=b||b>m.length||a<=last)return null;m.fill(1,a,b);last=b;}return m;}
 function components(mask,w,h){
  const ids=new Int32Array(w*h),q=new Int32Array(w*h),items=[];let id=0;
  for(let seed=0;seed<mask.length;seed++)if(mask[seed]&&!ids[seed]){
   let n=1,head=0,x0=w,y0=h,x1=0,y1=0;q[0]=seed;ids[seed]=++id;
   while(head<n){const i=q[head++],x=i%w,y=Math.floor(i/w);x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x+1);y1=Math.max(y1,y+1);
    for(const j of[x?i-1:-1,x+1<w?i+1:-1,i>=w?i-w:-1,i+w<mask.length?i+w:-1])if(j>=0&&mask[j]&&!ids[j]){ids[j]=id;q[n++]=j;}}
   items.push({id,pixels:n,box:[x0,y0,x1,y1]});
  }return{ids,items};
 }
 function broad(g,w,h){const[x0,y0,x1,y1]=g.box;return x1-x0>=w*.90&&y1-y0>=h*.90&&g.pixels>=w*h*.78&&g.pixels<=w*h*.88;}
 function boundaryOK(b){return b?.sides?.length===4&&b.sides.every(s=>Number.isInteger(s.samples)&&s.samples>=200&&Number.isInteger(s.exterior)&&s.exterior>=s.samples*.97&&s.exterior<=s.samples&&Number.isInteger(s.contrast)&&s.contrast>=s.samples*.85&&s.contrast<=s.exterior)&&b.sides.reduce((n,s)=>n+s.contrast,0)>=b.sides.reduce((n,s)=>n+s.samples,0)*.92;}
 // The group envelope includes peripheral source islands within a measured
 // collar of the dominant enclosure. It retains interior white speech bodies
 // and original gutters; it does not assert individual frame segmentation.
 function remainder(A,B,w,h,prior){
  if(prior.length>1||prior.some(p=>!PanelGeometryOrthogonal._provenContours(p)))return null;
  const C=components(A,w,h),D=components(B,w,h),big=C.items.filter(g=>broad(g,w,h));if(big.length!==1)return null;const g=big[0],matches=D.items.filter(q=>broad(q,w,h)&&q.box.every((v,k)=>Math.abs(v-g.box[k])<=2));if(matches.length!==1)return null;
  const one=C.ids.map(v=>+(v===g.id)),two=D.ids.map(v=>+(v===matches[0].id)),difference=one.reduce((s,v,i)=>s+ +(v!==two[i]),0);if(difference>Math.max(8,g.pixels*.002))return null;
  const box=g.box.slice(),collar=Math.ceil(Math.min(w,h)*.06),islands=C.items.filter(q=>q.id!==g.id&&q.pixels>=8&&q.box[0]<=g.box[2]+collar&&q.box[2]>=g.box[0]-collar&&q.box[1]<=g.box[3]+collar&&q.box[3]>=g.box[1]-collar);
  if(islands.reduce((s,q)=>s+q.pixels,0)>g.pixels*.04)return null;
  for(const q of islands){box[0]=Math.min(box[0],q.box[0]);box[1]=Math.min(box[1],q.box[1]);box[2]=Math.max(box[2],q.box[2]);box[3]=Math.max(box[3],q.box[3]);}
  const mask=new Uint8Array(w*h);for(let y=box[1];y<box[3];y++)mask.fill(1,y*w+box[0],y*w+box[2]);const final=E().extent(mask,w,h),rings=[[[box[0],box[1]],[box[2],box[1]],[box[2],box[3]],[box[0],box[3]]]];
  const occupied=new Uint8Array(w*h);for(const p of prior){const m=PanelLocalBoundaryConsensus.raster(p,w,h);for(let i=0;i<m.length;i++)occupied[i]|=m[i];}const filled=PanelSmoothGutterBoundaries.filled(C.ids,g.id,w,h),novelty=filled.reduce((s,v,i)=>s+ +(v&&!occupied[i]),0);if(novelty<g.pixels*.70)return null;const mode=prior.length?'sparse-prior-enclosure':'empty-enclosure';const overlap=mask.reduce((s,v,i)=>s+ +(v&&occupied[i]),0);return{mode,mask,g,final,difference,novelty,overlap,rings,components:islands.map(q=>({pixels:q.pixels,box:q.box})),contours:rings.map(q=>q.map(([x,y])=>({x:x/w,y:y/h})))};
 }
 function construct(v,c,w,h){const[x0,y0,x1,y1]=c.final.box;return{x:x0/w,y:y0/h,w:(x1-x0)/w,h:(y1-y0)/h,_identitySource:'structural-grid-frame',_geometryOwner:'structural-grid-contours',_geometryType:'high-contrast-enclosure-envelope',_contours:c.contours,_structuralGridProof:v};}
 function validPanel(p){const v=p?._structuralGridProof,hit=v&&cache.get(v);if(hit&&p._contours===hit.contours)return p._identitySource==='structural-grid-frame'&&p._geometryOwner==='structural-grid-contours'&&p._geometryType==='high-contrast-enclosure-envelope'&&!p._quad&&!p._outline&&same([p.x,p.y,p.w,p.h],hit.box);try{const w=v?.analysisWidth,h=v?.analysisHeight;if(!dims(w,h)||v.version!==VERSION||v.method!==METHOD||v.connected!==true||!same(v.thresholds,[18,20])||!Array.isArray(v.exclusions)||v.exclusions.length>1||!boundaryOK(v.boundary)||!boundaryOK(v.secondBoundary)||v.contrastThresholds?.join()!=='25,18'||v.secondBoundary.sides.reduce((n,s)=>n+s.contrast,0)<v.secondBoundary.sides.reduce((n,s)=>n+s.samples,0)*.92||!PanelContextCells.contentEvidence.signatureValid(v.content,v.pixels))return false;
  const A=decode(v.first,w,h),B=decode(v.second,w,h);if(!A||!B)return false;const c=remainder(A,B,w,h,v.exclusions);if(!c||v.mode!==c.mode||v.difference!==c.difference||v.novelty!==c.novelty||v.originalOwnerOverlap!==c.overlap||v.pixels!==c.final.pixels||!same(v.box,c.final.box)||!same(v.enclosureBox,c.g.box)||!same(v.components,c.components)||!same(v.pixelContours,c.rings))return false;
  const blank=new Uint8ClampedArray(w*h*4),front=PanelSmoothGutterBoundaries.boundary(PanelSmoothGutterBoundaries.filled(components(A,w,h).ids,c.g.id,w,h),blank,new Uint8Array(w*h),w,h);if(!same(front.sides.map(q=>q.samples),v.boundary.sides.map(q=>q.samples))||!same(front.sides.map(q=>q.samples),v.secondBoundary.sides.map(q=>q.samples)))return false;
  const expected=construct(v,c,w,h);if(p._quad||p._outline||p._identitySource!==expected._identitySource||p._geometryOwner!==expected._geometryOwner||p._geometryType!==expected._geometryType||!same(p._contours,expected._contours)||!same([p.x,p.y,p.w,p.h],[expected.x,expected.y,expected.w,expected.h]))return false;freeze(v);freeze(p._contours);cache.set(v,{contours:p._contours,box:[p.x,p.y,p.w,p.h]});return true;}catch(_){return false;}}
 function colorBoundary(mask,rgba,ext,w,h,threshold=25){
  const sides=Array.from({length:4},()=>({samples:0,exterior:0,contrast:0}));
  const visit=(i,k,step)=>{const z=sides[k];z.samples++;let edge=false,good=false;for(let d=1;d<=6;d++){const j=i+d*step;if(ext[j]){edge=true;for(let b=0;b<=4;b++){const l=i-b*step;if([0,1,2].some(v=>Math.abs(rgba[4*j+v]-rgba[4*l+v])>threshold))good=true;}}}z.exterior+=edge;z.contrast+=good;};
  for(let x=0;x<w;x++){let lo=-1,hi=-1;for(let y=0;y<h;y++)if(mask[y*w+x]){if(lo<0)lo=y;hi=y;}if(lo>=6&&hi<h-6){visit(lo*w+x,0,-w);visit(hi*w+x,1,w);}}
  for(let y=0;y<h;y++){let lo=-1,hi=-1;for(let x=0;x<w;x++)if(mask[y*w+x]){if(lo<0)lo=x;hi=x;}if(lo>=6&&hi<w-6){visit(y*w+lo,2,-1);visit(y*w+hi,3,1);}}return{sides};
 }
 function installReader(reader){if(!reader||reader._highContrastEnclosuresReader)return;const old=reader.displayPanelContours;reader.displayPanelContours=function(p,contours=this.panelContours(p)){
  const owners=this.currentPanels;if(!owners?.some(validPanel))return old.call(this,p,contours);if(validPanel(p))return contours;
  let state=this._highContrastEnclosuresDisplay;if(!state||state.owners!==owners||state.img!==this.getPanelImageContext()?.img)state=this._highContrastEnclosuresDisplay={owners,img:this.getPanelImageContext()?.img,prior:owners.filter(q=>!validPanel(q)),cache:new WeakMap()};
  if(state.cache.has(p))return state.cache.get(p);this.currentPanels=state.prior;let result;try{result=old.call(this,p,contours);}finally{this.currentPanels=owners;}state.cache.set(p,result);return result;
 };reader._highContrastEnclosuresReader=true;}
 function analyzeRGBA(rgba,w,h,prior=[],log){
  if(!dims(w,h)||rgba?.length!==w*h*4||!Array.isArray(prior)||prior.length>1)return[];for(let i=3;i<rgba.length;i+=4)if(rgba[i]!==255)return[];
  const G=PanelSmoothGutterBoundaries,ext=[18,20].map(t=>G.exterior(rgba,w,h,t)),A=ext[0].mask.map(v=>1-v),B=ext[1].mask.map(v=>1-v),c=remainder(A,B,w,h,prior);if(!c)return[];
  const dominant=G.filled(components(A,w,h).ids,c.g.id,w,h),boundary=colorBoundary(dominant,rgba,ext[0].mask,w,h);const secondBoundary=colorBoundary(dominant,rgba,ext[0].mask,w,h,18);if(!boundaryOK(boundary)||!boundaryOK(secondBoundary)||secondBoundary.sides.reduce((n,s)=>n+s.contrast,0)<secondBoundary.sides.reduce((n,s)=>n+s.samples,0)*.92)return[];const content=PanelContextCells.contentEvidence.signature(c.mask,rgba);if(!PanelContextCells.contentEvidence.signatureValid(content,c.final.pixels))return[];
  const v={version:VERSION,method:METHOD,connected:true,mode:c.mode,analysisWidth:w,analysisHeight:h,thresholds:[18,20],first:encode(A),second:encode(B),exclusions:prior.slice(),difference:c.difference,novelty:c.novelty,pixels:c.final.pixels,box:c.final.box,enclosureBox:c.g.box,components:c.components,pixelContours:c.rings,boundary,secondBoundary,contrastThresholds:[25,18],content,originalOwnerOverlap:c.overlap},p=construct(v,c,w,h);return validPanel(p)?[p]:[];
 }
 function supplementImage(img,prior,log){const W=img.naturalWidth||img.width,H=img.naturalHeight||img.height;if(!W||!H||W*H>24000000||!Array.isArray(prior)||prior.length>1)return[];let c;try{c=document.createElement('canvas');c.width=W;c.height=H;const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0);const s=Math.min(1,900/Math.max(W,H)),w=Math.round(W*s),h=Math.round(H*s);return analyzeRGBA(PanelMatteCells.sampleBilinearRGBA(ctx.getImageData(0,0,W,H).data,W,H,w,h),w,h,prior,log);}finally{if(c)c.width=c.height=1;}}
 function install(detector){if(typeof PanelStructuralGrid!=='undefined'&&!PanelStructuralGrid._highContrastEnclosures){const old=PanelStructuralGrid.validPanel;PanelStructuralGrid.validPanel=p=>p?._structuralGridProof?.version===VERSION?validPanel(p):old(p);PanelStructuralGrid._highContrastEnclosures=true;}if(typeof PanelGeometry!=='undefined'&&!PanelGeometry._highContrastEnclosures){const old=PanelGeometry.refine;PanelGeometry.refine=async function(url,p,log){return validPanel(p)?{...p}:old.call(this,url,p,log);};PanelGeometry._highContrastEnclosures=true;}if(typeof PanelEdgeSpill!=='undefined'&&!PanelEdgeSpill._highContrastEnclosures){for(const name of['analyzeImage','analyzeRGBA']){const old=PanelEdgeSpill[name];if(typeof old==='function')PanelEdgeSpill[name]=function(...args){return validPanel(args[name==='analyzeImage'?1:3])?null:old.apply(this,args);};}PanelEdgeSpill._highContrastEnclosures=true;}if(!detector||detector._highContrastEnclosures)return;const old=detector.detect;detector.detect=async function(url,log){const prior=await old.call(this,url,log);try{const img=new Image();img.src=url;await img.decode();const out=supplementImage(img,prior,log);return out.length?prior.concat(out):prior;}catch(e){log?.('unselected enclosure deferred: '+e.message);return prior;}};detector._highContrastEnclosures=true;}
 return{analyzeRGBA,supplementImage,validPanel,install,installReader,colorBoundary,encode,decode,components,remainder};
})();
if(typeof PanelDetect!=='undefined')PanelHighContrastEnclosures.install(PanelDetect);
if(typeof module!=='undefined')module.exports=PanelHighContrastEnclosures;
