/* Recover the open scene between independently source-proved upper insets.
 * The lower separator follows the current exterior matte and its ink collar.
 * Neither a book identity nor a saved crop supplies the separator. */
const PanelSharedTopCell=(()=>{
'use strict';
const VERSION=160,METHOD='source-shared-upper-matte-cell';
const E=PanelPageEdgeRailCell,C=PanelCappedRimCell,Q=PanelCropRepair;
function eligible(prior){
 if(!Array.isArray(prior)||prior.length!==2)return false;
 const [l,r]=prior;
 return l?._structuralGridProof?.version===79&&r?._structuralGridProof?.version===88&&
  l.x+l.w<r.x&&l.y<l.h*.2&&r.y<r.h*.2&&Math.abs(l.y+l.h-r.y-r.h)<Math.max(l.h,r.h)*.2;
}
function raster(prior,w,h){const masks=prior.map(p=>Q.raster(p._contours,w,h));if(masks.some(m=>m?.length!==w*h))return null;return masks;}
function separator(e,w,h,prior,threshold){
 const [l,r]=prior,x0=Math.ceil((l.x+l.w)*w),x1=Math.floor(r.x*w);
 const left=(l.y+l.h)*h,right=(r.y+r.h)*h,margin=Math.ceil(h*.035);
 const y0=Math.max(1,Math.floor(Math.min(left,right)-margin)),y1=Math.min(h-2,Math.ceil(Math.max(left,right)+margin));
 if(x1-x0<w*.2||x1-x0>w*.65||y1-y0>h*.2)return null;
 const H=y1-y0+1,W=x1-x0+1,back=new Int16Array(W*H);let previous=new Float64Array(H);
 const cost=(x,y)=>{
  const i=y*w+x,guide=left+(right-left)*(x-x0)/(x1-x0);
  let near=false;for(let d=-3;d<=3;d++)if(e.matte[(y+d)*w+x])near=true;
  let above=0,below=0;for(let d=3;d<=8;d++){above+=e.V[(y-d)*w+x];below+=e.V[(y+d)*w+x];}
  const contrast=Math.abs(above-below)/6;
  return (e.matte[i]?0:e.V[i]<threshold&&(near||contrast>35)?1:15)+Math.abs(y-guide)*.12;
 };
 for(let j=0;j<H;j++)previous[j]=Math.abs(y0+j-left)<=3?cost(x0,y0+j):Infinity;
 for(let x=1;x<W;x++){
  const next=new Float64Array(H);next.fill(Infinity);
  for(let j=0;j<H;j++)for(let d=-3;d<=3;d++){
   const k=j+d;if(k<0||k>=H)continue;
   const v=previous[k]+Math.abs(d)*.5+cost(x+x0,j+y0);
   if(v<next[j]){next[j]=v;back[x*H+j]=k;}
  }previous=next;
 }
 let j=Math.max(0,Math.min(H-1,Math.round(right-y0)));
 for(let k=0;k<H;k++)if(Math.abs(k+y0-right)<=3&&previous[k]<previous[j])j=k;
 const ys=Array(W);for(let x=W-1;x>=0;x--){ys[x]=j+y0;j=back[x*H+j];}
 let support=0,miss=0,longest=0;for(let x=0;x<W;x++){
  const i=ys[x]*w+x+x0;let near=false;for(let d=-3;d<=3;d++)if(e.matte[i+d*w])near=true;
  let above=0,below=0;for(let d=3;d<=8;d++){above+=e.V[i-d*w];below+=e.V[i+d*w];}
  const yes=e.matte[i]||e.V[i]<threshold&&(near||Math.abs(above-below)/6>35);support+=+yes;miss=yes?0:miss+1;longest=Math.max(longest,miss);
 }
 return{x0,x1,ys,support,coverage:support/W,longest,threshold};
}
function proposed(e,w,h,prior,seam){
 const masks=raster(prior,w,h);if(!masks)return null;
 const [l,r]=prior,leftFallback=Math.floor((l.x+l.w)*w),rightFallback=Math.ceil(r.x*w),mask=new Uint8Array(w*h);
 const rim=prior[1]._structuralGridProof.witnesses[0].rim.path;
 const rightLimit=Math.max(...rim)+2;
 for(let y=0;y<=Math.max(...seam.ys);y++){
  let left=-1,right=w;
  for(let x=0;x<w;x++){if(masks[0][y*w+x])left=Math.max(left,x);if(masks[1][y*w+x])right=Math.min(right,x);}
  left=left<0?leftFallback:left+1;right=Math.min(rightLimit,right===w?rightFallback:right);
  for(let x=left;x<right;x++){
   const floor=seam.ys[Math.max(0,Math.min(seam.ys.length-1,x-seam.x0))];
   if(y<floor&&!masks.some(m=>m[y*w+x]))mask[y*w+x]=1;
  }
 }
 const bodyResults=[];
 for(const b of e.bodies){
  let inside=0;for(const i of b.indices)inside+=mask[i];if(!inside)continue;
  const ratio=inside/b.indices.length;bodyResults.push({box:b.box,ratio});
  if(ratio>.2&&ratio<.8)return{ambiguous:true,bodyResults,mask};
  // Bright bodies remain indivisible, including their ink collar.
  const m=new Uint8Array(w*h);for(const i of b.indices)m[i]=1;
  const filled=C.grow(C.fill(m,w,h),w,h,1);
  for(let i=0;i<mask.length;i++)if(filled[i])mask[i]=+(ratio>=.8&&!masks.some(m=>m[i]));
 }
 const g=C.extent(mask,w,h),rings=PanelMatteCells.tracePixelContours(mask,w,h,1);
 return{mask,g,rings,bodyResults};
}
function analyzeRGBA(a,w,h,prior,diagnostic){
 if(!eligible(prior)||a?.length!==w*h*4)return null;
 const e=E.evidence(a,w,h);if(!e)return null;
 const seams=[85,105].map(t=>separator(e,w,h,prior,t));if(seams.some(s=>!s))return null;
 const results=seams.map(s=>proposed(e,w,h,prior,s));
 diagnostic?.({seams:seams.map(s=>({...s,ys:undefined})),results:results.map(q=>q&&({ambiguous:q.ambiguous,g:q.g,bodies:q.bodyResults}))});
 return {e,seams,results};
}
const P=PanelArticulatedRimCell,G=P.readerScopeGuard,T=PanelMatteCells.sampleBilinearRGBA,Witness=PanelRasterWitness;
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b),equal=(a,b)=>Array.isArray(a)&&Array.isArray(b)&&a.length===b.length&&a.every((x,i)=>x===b[i]);
const accepted=new WeakSet();let issued=null;
function claims(p){return p?._structuralGridProof?.version===VERSION||p?._geometryType==='shared-upper-matte-cell';}
function freeze(v){if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;}
function encode(a){let text='';for(let i=0;i<a.length;i+=8192)text+=String.fromCharCode(...a.subarray(i,i+8192));return btoa(text);}
function decode(text,n){if(typeof text!=='string'||text.length!==Math.ceil(n/3)*4)return null;try{const s=atob(text);if(s.length!==n)return null;return Uint8ClampedArray.from(s,c=>c.charCodeAt(0));}catch(_){return null;}}
function dimensions(w,h){return Number.isInteger(w)&&Number.isInteger(h)&&w>=700&&h>=1200&&w<=1800&&h<=1800&&w*h<=4000000;}
function geometry(a,w,h,prior){
 const q=analyzeRGBA(a,w,h,prior);if(!q||q.seams.some(s=>s.coverage<.93||s.longest>Math.ceil(w*.006))||q.results.some(r=>!r?.rings||r.ambiguous))return null;
 const [one,two]=q.results;let difference=0,pixels=0;const mask=one.mask.map((n,i)=>{difference+=+(n!==two.mask[i]);const yes=n|two.mask[i];pixels+=yes;return yes;});
 if(difference>pixels*.0025||pixels<w*h*.05||pixels>w*h*.3)return null;
 const g=C.extent(mask,w,h),rings=PanelMatteCells.tracePixelContours(mask,w,h,1);
 if(!rings?.length||rings.length>64||rings.some(r=>r.length>4096||r.length<4))return null;
 return{box:g.box,pixels,difference,separators:q.seams,rings,bodies:q.results.map(r=>r.bodyResults)};
}
function construct(v){const [x,y,X,Y]=v.geometry.box,w=v.analysisWidth,h=v.analysisHeight;return{x:x/w,y:y/h,w:(X-x)/w,h:(Y-y)/h,_identitySource:'structural-grid-frame',_geometryOwner:'structural-grid-contours',_geometryType:'shared-upper-matte-cell',_contours:v.geometry.rings.map(r=>r.map(([x,y])=>({x:x/w,y:y/h}))),_structuralGridProof:v};}
function validPanel(p){try{
 if(accepted.has(p))return true;
 const v=p?._structuralGridProof,w=v?.analysisWidth,h=v?.analysisHeight;
 if(v?.version!==VERSION||v.method!==METHOD||v.originalFrames!==1||!dimensions(w,h)||!eligible(v.prior)||!E.validPanel(v.prior[0])||!C.validPanel(v.prior[1]))return false;
 const a=decode(v.sourceRGBA,w*h*4);if(!a)return false;
 const g=geometry(a,w,h,v.prior);return!!g&&same(g,v.geometry)&&same(construct(v),p);
 }catch(_){return false;}}
function native(img){let canvas;try{
 if(!(img instanceof Image)||!P.sourceReady(img)||PanelMatteCells.sampleBilinearRGBA!==T||PanelRasterWitness!==Witness)return null;
 const source=P.sourceState(img),w=img.naturalWidth||img.width,h=img.naturalHeight||img.height;
 if(!Number.isSafeInteger(w)||!Number.isSafeInteger(h)||w*h>8000000)return null;
 canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0);
 const a=ctx.getImageData(0,0,w,h).data;
 return equal(source,P.sourceState(img))?{a,w,h,source}:null;
 }catch(_){return null;}finally{if(canvas)canvas.width=canvas.height=1;}}
function sourceParents(img,prior){
 // The capped source replay authenticates its rail ancestor itself. Match
 // that exact ordered ancestor instead of replaying the rail a second time.
 return eligible(prior)&&same(prior[1]._structuralGridProof.prior,[prior[0]])&&C.sourceMatches(img,prior[1]);
}
function supplementImage(img,prior){
 try{
  if(!eligible(prior)||!sourceParents(img,prior))return null;
  const raw=native(img),v=prior[0]._structuralGridProof,w=v.analysisWidth,h=v.analysisHeight;
  if(!raw||!dimensions(w,h))return null;
  const a=T(raw.a,raw.w,raw.h,w,h),g=geometry(a,w,h,prior);if(!g)return null;
  const proof={version:VERSION,method:METHOD,originalFrames:1,analysisWidth:w,analysisHeight:h,prior:prior.slice(),sourceRGBA:encode(a),geometry:g};
  const child=freeze(construct(proof));accepted.add(child);
  return{child,raw};
 }catch(_){return null;}
}
function issue(img,prior){
 const q=supplementImage(img,prior);if(!q)return prior;
 const owners=prior.concat(q.child),input=G.identity(owners),priorInput=G.identity(prior),token=Witness.token(q.raw.a,q.raw.w,q.raw.h);
 try{
  if(!token||!input||!priorInput||!equal(q.raw.source,P.sourceState(img))||!Witness.commit(token))return prior;
  issued={owners,items:owners.slice(),input,prior,priorItems:prior.slice(),priorInput,child:q.child,token,w:q.raw.w,h:q.raw.h};return owners;
 }finally{if(token)Witness.discard(token);}
}
function generationCurrent(q){return q===issued&&equal(q.owners,q.items)&&equal(q.prior,q.priorItems)&&G.unchanged(q.input,q.owners)&&G.unchanged(q.priorInput,q.prior);}
function install(d){
 if(!PanelStructuralGrid._sharedTopCell){const old=PanelStructuralGrid.validPanel;PanelStructuralGrid.validPanel=p=>claims(p)?validPanel(p):old(p);PanelStructuralGrid._sharedTopCell=true;}
 if(typeof PanelGeometry!=='undefined'&&!PanelGeometry._sharedTopCell){const old=PanelGeometry.refine;PanelGeometry.refine=async function(url,p,log){return claims(p)?validPanel(p)?{...p}:null:old.call(this,url,p,log);};PanelGeometry._sharedTopCell=true;}
 if(typeof PanelEdgeSpill!=='undefined'&&!PanelEdgeSpill._sharedTopCell){for(const name of['analyzeImage','analyzeRGBA']){const old=PanelEdgeSpill[name];if(old)PanelEdgeSpill[name]=function(...args){return claims(args[name==='analyzeImage'?1:3])?null:old.apply(this,args);};}PanelEdgeSpill._sharedTopCell=true;}
 if(!d||d._sharedTopCell)return;
 const old=d.detect;d.detect=async function(url,log){const prior=await old.call(this,url,log);if(!eligible(prior))return prior;try{const img=new Image();img.src=url;await img.decode();return issue(img,prior);}catch(e){log?.('Shared upper cell deferred: '+e.message);return prior;}};d._sharedTopCell=true;
}
function installReader(r){
 if(!r||r._sharedTopCellReader)return;
 const display=r.displayPanelContours,find=r.findPanelAt,zoom=r.zoomToPanel,key='_sharedTopCellState';
 function context(reader){
  G.check(reader);const owners=reader.currentPanels;
  if(!Array.isArray(owners)||!owners.some(claims))return null;
  if(G.blocked(reader,key))return{valid:false};
  let img;try{img=reader.getPanelImageContext?.()?.img;}catch(_){}
  const source=P.sourceState(img),before=reader[key];
  if(before?.owners===owners&&before.img===img&&PanelMatteCells.sampleBilinearRGBA===T&&PanelRasterWitness===Witness&&P.sourceReady(img)&&equal(before.items,owners)&&equal(before.source,source)&&G.unchanged(before.input,owners))return before;
  const state={owners,items:owners.slice(),input:G.identity(owners),img,source,prior:owners.filter(p=>!claims(p)),children:owners.filter(claims),valid:false};reader[key]=state;
  if(!state.input||!P.sourceReady(img)||state.children.length!==1||!eligible(state.prior))return state;
  const child=state.children[0];state.child=child;
  if(owners.at(-1)!==child||!validPanel(child)||!same(child._structuralGridProof.prior,state.prior))return state;
  const raw=native(img);if(!raw)return state;
  const q=issued,fast=q?.owners===owners&&q.child===child&&generationCurrent(q)&&raw.w===q.w&&raw.h===q.h&&Witness.matchesRetained(raw.a,raw.w,raw.h,q.token);
  if(!fast){
   if(!sourceParents(img,state.prior))return state;
   const v=child._structuralGridProof,a=T(raw.a,raw.w,raw.h,v.analysisWidth,v.analysisHeight);
   if(encode(a)!==v.sourceRGBA||!validPanel(child))return state;
  }
  const previous=new Map();
  G.under(reader,state.prior,()=>{for(const p of state.prior){const contours=display.call(reader,p,reader.panelContours(p));if(!Array.isArray(contours)||!contours.length)return;previous.set(p,G.canonical(contours));}});
  if(previous.size!==state.prior.length||reader.currentPanels!==owners||!equal(source,P.sourceState(img))||!G.unchanged(state.input,owners))return state;
  state.previous=previous;state.canonical=child;state.display=child._contours;state.valid=true;return state;
 }
 r._prepareSharedTopPanels=function(){return context(this)?.valid===true;};
 r.displayPanelContours=function(p,c=this.panelContours(p)){
  const pin=G.display(this,key,p);if(pin)return pin.display;
  const state=context(this);if(!state)return claims(p)?null:display.call(this,p,c);
  if(!state.valid)return null;if(p===state.child)return state.display;return state.previous.get(p)||null;
 };
 r.findPanelAt=function(x,y){const state=context(this);if(!state)return find.call(this,x,y);if(!state.valid||!this.panelZoomEnabled)return null;if(this.pointInContours(state.display,x,y))return state.child;const p=G.under(this,state.prior,()=>find.call(this,x,y));return state.prior.includes(p)?p:null;};
 r.zoomToPanel=function(p,...args){const pin=G.display(this,key,p);if(pin&&!pin.display.length)return;const state=context(this);if(!state)return claims(p)?undefined:zoom.call(this,p,...args);if(!state.valid)return;
  if(p===state.child)return G.run(this,key,state,()=>G.under(this,[p],()=>zoom.call(this,p,...args)));
  if(state.prior.includes(p)){const held={...state,child:p,canonical:G.canonical(p),display:state.previous.get(p)};return G.run(this,key,held,()=>G.under(this,state.prior,()=>zoom.call(this,p,...args)));}
 };
 r._sharedTopCellReader=true;
}
return{VERSION,METHOD,eligible,raster,separator,proposed,analyzeRGBA,geometry,claims,validPanel,supplementImage,install,installReader};
})();
if(typeof module!=='undefined')module.exports=PanelSharedTopCell;
