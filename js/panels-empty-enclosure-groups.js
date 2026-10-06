/* Broad source groups on pages without proven selections. Two independent
 * exterior maps must retain the same dense enclosure with four-sided contrast.
 * A bounded collar retains peripheral ink; the envelope preserves original
 * borders, white speech bodies and protrusions. Individual credit is reviewed. */
const PanelEmptyEnclosureGroups=(()=>{
 'use strict';
 const VERSION=61,METHOD='independent-unselected-enclosure-envelope',E=()=>PanelLocalBoundaryConsensus.pixelEvidence,same=(a,b)=>JSON.stringify(a)===JSON.stringify(b),cache=new WeakMap();
 function freeze(v){if(v&&typeof v==='object'&&!Object.isFrozen(v)){for(const q of Object.values(v))freeze(q);Object.freeze(v);}return v;}
 function dims(w,h){return Number.isInteger(w)&&Number.isInteger(h)&&w>=350&&h>=350&&w<=900&&h<=900&&h>=w*.7&&h<=w*1.8;}
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
 function broad(g,w,h){const[x0,y0,x1,y1]=g.box;return x1-x0>=w*.90&&y1-y0>=h*.90&&g.pixels>=w*h*.70&&g.pixels<=w*h*.86;}
 function boundaryOK(b){return b?.sides?.length===4&&b.sides.every(s=>Number.isInteger(s.samples)&&s.samples>=150&&Number.isInteger(s.exterior)&&s.exterior>=s.samples*.97&&s.exterior<=s.samples&&Number.isInteger(s.contrast)&&s.contrast>=s.samples*.85&&s.contrast<=s.exterior);}
 // The group envelope includes peripheral source islands within a measured
 // collar of the dominant enclosure. It retains interior white speech bodies
 // and original gutters; it does not assert individual frame segmentation.
 function remainder(A,B,w,h,prior){
  if(prior.length)return null;
  const C=components(A,w,h),D=components(B,w,h),big=C.items.filter(g=>broad(g,w,h));if(big.length!==1)return null;const g=big[0],matches=D.items.filter(q=>broad(q,w,h)&&q.box.every((v,k)=>Math.abs(v-g.box[k])<=2));if(matches.length!==1)return null;
  const one=C.ids.map(v=>+(v===g.id)),two=D.ids.map(v=>+(v===matches[0].id)),difference=one.reduce((s,v,i)=>s+ +(v!==two[i]),0);if(difference>Math.max(8,g.pixels*.002))return null;
  const box=g.box.slice(),collar=Math.ceil(Math.min(w,h)*.06),islands=C.items.filter(q=>q.id!==g.id&&q.pixels>=8&&q.box[0]<=g.box[2]+collar&&q.box[2]>=g.box[0]-collar&&q.box[1]<=g.box[3]+collar&&q.box[3]>=g.box[1]-collar);
  if(islands.reduce((s,q)=>s+q.pixels,0)>g.pixels*.04)return null;
  for(const q of islands){box[0]=Math.min(box[0],q.box[0]);box[1]=Math.min(box[1],q.box[1]);box[2]=Math.max(box[2],q.box[2]);box[3]=Math.max(box[3],q.box[3]);}
  const mask=new Uint8Array(w*h);for(let y=box[1];y<box[3];y++)mask.fill(1,y*w+box[0],y*w+box[2]);const final=E().extent(mask,w,h),rings=[[[box[0],box[1]],[box[2],box[1]],[box[2],box[3]],[box[0],box[3]]]];
  return{mask,g,final,difference,novelty:g.pixels,rings,components:islands.map(q=>({pixels:q.pixels,box:q.box})),contours:rings.map(q=>q.map(([x,y])=>({x:x/w,y:y/h})))};
 }
 function construct(v,c,w,h){const[x0,y0,x1,y1]=c.final.box;return{x:x0/w,y:y0/h,w:(x1-x0)/w,h:(y1-y0)/h,_identitySource:'structural-grid-frame',_geometryOwner:'structural-grid-contours',_geometryType:'unselected-enclosure-envelope',_contours:c.contours,_structuralGridProof:v};}
 function validPanel(p){const v=p?._structuralGridProof,hit=v&&cache.get(v);if(hit&&p._contours===hit.contours)return p._identitySource==='structural-grid-frame'&&p._geometryOwner==='structural-grid-contours'&&p._geometryType==='unselected-enclosure-envelope'&&!p._quad&&!p._outline&&same([p.x,p.y,p.w,p.h],hit.box);try{const w=v?.analysisWidth,h=v?.analysisHeight;if(!dims(w,h)||v.version!==VERSION||v.method!==METHOD||v.connected!==true||!same(v.thresholds,[12,14])||!Array.isArray(v.exclusions)||v.exclusions.length!==0||v.originalOwnerOverlap!==0||!boundaryOK(v.boundary)||!PanelContextCells.contentEvidence.signatureValid(v.content,v.pixels))return false;
  const A=decode(v.first,w,h),B=decode(v.second,w,h);if(!A||!B)return false;const c=remainder(A,B,w,h,v.exclusions);if(!c||v.difference!==c.difference||v.novelty!==c.novelty||v.pixels!==c.final.pixels||!same(v.box,c.final.box)||!same(v.enclosureBox,c.g.box)||!same(v.components,c.components)||!same(v.pixelContours,c.rings))return false;
  const blank=new Uint8ClampedArray(w*h*4),front=PanelSmoothGutterBoundaries.boundary(PanelSmoothGutterBoundaries.filled(components(A,w,h).ids,c.g.id,w,h),blank,new Uint8Array(w*h),w,h);if(!same(front.sides.map(q=>q.samples),v.boundary.sides.map(q=>q.samples)))return false;
  const expected=construct(v,c,w,h);if(p._quad||p._outline||p._identitySource!==expected._identitySource||p._geometryOwner!==expected._geometryOwner||p._geometryType!==expected._geometryType||!same(p._contours,expected._contours)||!same([p.x,p.y,p.w,p.h],[expected.x,expected.y,expected.w,expected.h]))return false;freeze(v);freeze(p._contours);cache.set(v,{contours:p._contours,box:[p.x,p.y,p.w,p.h]});return true;}catch(_){return false;}}
 function analyzeRGBA(rgba,w,h,prior=[],log){
  if(!dims(w,h)||rgba?.length!==w*h*4||!Array.isArray(prior)||prior.length)return[];for(let i=3;i<rgba.length;i+=4)if(rgba[i]!==255)return[];
  const G=PanelSmoothGutterBoundaries,ext=[12,14].map(t=>G.exterior(rgba,w,h,t)),A=ext[0].mask.map(v=>1-v),B=ext[1].mask.map(v=>1-v),c=remainder(A,B,w,h,prior);if(!c)return[];
  const dominant=G.filled(components(A,w,h).ids,c.g.id,w,h),boundary=G.boundary(dominant,rgba,ext[0].mask,w,h);if(!boundaryOK(boundary))return[];const content=PanelContextCells.contentEvidence.signature(c.mask,rgba);if(!PanelContextCells.contentEvidence.signatureValid(content,c.final.pixels))return[];
  const v={version:VERSION,method:METHOD,connected:true,analysisWidth:w,analysisHeight:h,thresholds:[12,14],first:encode(A),second:encode(B),exclusions:[],difference:c.difference,novelty:c.novelty,pixels:c.final.pixels,box:c.final.box,enclosureBox:c.g.box,components:c.components,pixelContours:c.rings,boundary,content,originalOwnerOverlap:0},p=construct(v,c,w,h);return validPanel(p)?[p]:[];
 }
 function supplementImage(img,prior,log){const W=img.naturalWidth||img.width,H=img.naturalHeight||img.height;if(!W||!H||W*H>24000000||!Array.isArray(prior)||prior.length)return[];let c;try{c=document.createElement('canvas');c.width=W;c.height=H;const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0);const s=Math.min(1,900/Math.max(W,H)),w=Math.round(W*s),h=Math.round(H*s);return analyzeRGBA(PanelMatteCells.sampleBilinearRGBA(ctx.getImageData(0,0,W,H).data,W,H,w,h),w,h,prior,log);}finally{if(c)c.width=c.height=1;}}
 function install(detector){if(typeof PanelStructuralGrid!=='undefined'&&!PanelStructuralGrid._emptyEnclosure){const old=PanelStructuralGrid.validPanel;PanelStructuralGrid.validPanel=p=>p?._structuralGridProof?.version===VERSION?validPanel(p):old(p);PanelStructuralGrid._emptyEnclosure=true;}if(typeof PanelGeometry!=='undefined'&&!PanelGeometry._emptyEnclosure){const old=PanelGeometry.refine;PanelGeometry.refine=async function(url,p,log){return validPanel(p)?{...p}:old.call(this,url,p,log);};PanelGeometry._emptyEnclosure=true;}if(typeof PanelEdgeSpill!=='undefined'&&!PanelEdgeSpill._emptyEnclosure){for(const name of['analyzeImage','analyzeRGBA']){const old=PanelEdgeSpill[name];if(typeof old==='function')PanelEdgeSpill[name]=function(...args){return validPanel(args[name==='analyzeImage'?1:3])?null:old.apply(this,args);};}PanelEdgeSpill._emptyEnclosure=true;}if(!detector||detector._emptyEnclosure)return;const old=detector.detect;detector.detect=async function(url,log){const prior=await old.call(this,url,log);try{const img=new Image();img.src=url;await img.decode();const out=supplementImage(img,prior,log);return out.length?prior.concat(out):prior;}catch(e){log?.('unselected enclosure deferred: '+e.message);return prior;}};detector._emptyEnclosure=true;}
 return{analyzeRGBA,supplementImage,validPanel,install,encode,decode,components,remainder};
})();
if(typeof PanelDetect!=='undefined')PanelEmptyEnclosureGroups.install(PanelDetect);
if(typeof module!=='undefined')module.exports=PanelEmptyEnclosureGroups;
