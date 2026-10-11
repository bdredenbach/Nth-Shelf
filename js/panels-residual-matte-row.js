/* A wide source-matte scene below authenticated upper owners. Narrow paint
 * contacts are opened independently; whole bright source bodies are assigned
 * by their current surrounding source components. No book/page crop lookup. */
const PanelResidualMatteRow=(()=>{
'use strict';
const VERSION=161,METHOD='source-residual-matte-row';
const E=PanelPageEdgeRailCell,C=PanelCappedRimCell,Q=PanelCropRepair;
function eligible(prior){
 if(!Array.isArray(prior)||prior.length!==3)return false;
 const [l,r,t]=prior;
 return l?._structuralGridProof?.version===79&&r?._structuralGridProof?.version===88&&t?._structuralGridProof?.version===160&&
  l.x+l.w<r.x&&t.y<.1&&t.w>.3&&t.h<.5;
}
function raster(prior,w,h){const masks=prior.map(p=>Q.raster(p._contours,w,h));return masks.every(m=>m?.length===w*h)?masks:null;}
function bodyRegion(b,w,h){
 const x=Math.max(0,b.box[0]-5),y=Math.max(0,b.box[1]-5),W=Math.min(w,b.box[2]+5)-x,H=Math.min(h,b.box[3]+5)-y,m=new Uint8Array(W*H);
 for(const i of b.indices)m[((i/w|0)-y)*W+i%w-x]=1;
 const mask=C.grow(C.fill(m,W,H),W,H,2),around=C.grow(mask,W,H,3);
 return{x,y,w:W,h:H,mask,around};
}
function analyzeRGBA(a,w,h,prior){
 if(!eligible(prior)||a?.length!==w*h*4)return null;
 const e=E.evidence(a,w,h),masks=raster(prior,w,h);if(!e||!masks)return null;
 const occupied=new Uint8Array(w*h);for(const m of masks)for(let i=0;i<m.length;i++)occupied[i]|=m[i];
 const bodies=e.bodies.map(b=>bodyRegion(b,w,h));
 const bodyUnion=new Uint8Array(w*h);for(const b of bodies)for(let i=0;i<b.mask.length;i++)if(b.mask[i])bodyUnion[(b.y+(i/b.w|0))*w+b.x+i%b.w]=1;
 const residual=e.matte.map((n,i)=>+(!n&&!occupied[i]&&!bodyUnion[i]));
 const components=C.components(residual,w,h);if(!components)return null;
 const floor=Math.max(...prior.map(p=>p.y+p.h))*h;
 const proposals=[],passes=[];
 for(const radius of [3,4]){
  const eroded=C.grow(residual.map(n=>1-n),w,h,radius).map(n=>1-n),cores=C.components(eroded,w,h);if(!cores)return null;
  const candidates=cores.items.filter(q=>{const[x,y,X,Y]=q.box;return X-x>w*.85&&Y-y>h*.1&&Y-y<h*.3&&y>=floor-h*.1&&y<=floor+h*.05&&q.pixels>w*h*.08&&q.pixels<w*h*.25;});
  if(candidates.length!==1)return null;const selected=candidates[0];
  let componentId=0;for(let i=0;i<cores.ids.length&&!componentId;i++)if(cores.ids[i]===selected.id)componentId=components.ids[i];
  passes.push({radius,cores,selected,componentId});
 }
 if(passes[0].componentId!==passes[1].componentId||Math.abs(passes[0].selected.box[1]-passes[1].selected.box[1])>h*.025)return null;
 const envelope=[0,1,2,3].map(k=>k<2?Math.min(...passes.map(p=>p.selected.box[k])):Math.max(...passes.map(p=>p.selected.box[k])));
 for(const {radius,cores,selected,componentId} of passes){
  // Independent openings can separate a dark backdrop from foreground ink.
  // Their agreed scene envelope recovers both, while excluding outside spurs.
  const [x,y,X,Y]=envelope,kept=new Set(cores.items.filter(q=>q.box[0]>=x-radius*2&&q.box[1]>=y-radius*2&&q.box[2]<=X+radius*2&&q.box[3]<=Y+radius*2).map(q=>q.id));
  const core=cores.ids.map((id,i)=>+(kept.has(id)&&components.ids[i]===componentId)),grown=C.grow(core,w,h,Math.max(...passes.map(p=>p.radius))*2);
  let mask=C.fill(grown.map((n,i)=>+(n&&residual[i])),w,h);const assignments=[];
  for(let k=0;k<bodies.length;k++){
   const b=e.bodies[k],body=bodies[k],counts=new Map();let total=0;
   for(let j=0;j<body.around.length;j++)if(body.around[j]&&!body.mask[j]){
    const i=(body.y+(j/body.w|0))*w+body.x+j%body.w,id=occupied[i]?-1:components.ids[i];if(!id)continue;counts.set(id,(counts.get(id)||0)+1);total++;
   }
   const ours=counts.get(componentId)||0;if(!ours)continue;
   const foreign=Math.max(0,...[...counts].filter(([id])=>id!==componentId).map(([,n])=>n));
   total=ours+foreign;
   const ambiguous=Math.abs(ours-foreign)<Math.max(8,total*.04);
   if(ambiguous&&b.pixels>=w*h*.001)return null;
   // An uncertain small highlight stays wholly unclaimed; large bright bodies
   // require a clear source attachment before any scene is admitted.
   const owned=!ambiguous&&ours>foreign;assignments.push({box:b.box,ours,foreign,total,owned,deferred:ambiguous});
   if(owned&&b.indices.some(i=>occupied[i]))return null;
   for(let j=0;j<body.mask.length;j++)if(body.mask[j]){const i=(body.y+(j/body.w|0))*w+body.x+j%body.w;mask[i]=+(owned&&!occupied[i]);}
  }
  for(let i=0;i<mask.length;i++)if(occupied[i])mask[i]=0;
  const g=C.extent(mask,w,h);if(g.pixels<w*h*.08||g.pixels>w*h*.3)return null;
  proposals.push({radius,mask,box:g.box,pixels:g.pixels,coreBox:selected.box,assignments});
 }
 return{e,proposals};
}
function geometry(a,w,h,prior){
 const q=analyzeRGBA(a,w,h,prior);if(!q)return null;
 const [one,two]=q.proposals;let difference=0,pixels=0;const mask=one.mask.map((n,i)=>{difference+=+(n!==two.mask[i]);const yes=n|two.mask[i];pixels+=yes;return yes;});
 if(difference>pixels*.01||!same(one.assignments,two.assignments))return null;
 const g=C.extent(mask,w,h),rings=PanelMatteCells.tracePixelContours(mask,w,h,1);
 if(!rings?.length||rings.length>64||rings.some(r=>r.length>4096||r.length<4))return null;
 return{box:g.box,pixels,difference,cores:q.proposals.map(p=>({radius:p.radius,box:p.coreBox})),assignments:one.assignments,rings};
}
const S=PanelSharedTopCell,ParentRead=S.verifiedSource;
const P=PanelArticulatedRimCell,G=P.readerScopeGuard,T=PanelMatteCells.sampleBilinearRGBA,Witness=PanelRasterWitness;
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b),equal=(a,b)=>Array.isArray(a)&&Array.isArray(b)&&a.length===b.length&&a.every((x,i)=>x===b[i]);
const accepted=new WeakSet();let issued=null;
function claims(p){return p?._structuralGridProof?.version===VERSION||p?._geometryType==='residual-matte-row';}
function freeze(v){if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;}
function encode(a){let text='';for(let i=0;i<a.length;i+=8192)text+=String.fromCharCode(...a.subarray(i,i+8192));return btoa(text);}
function decode(text,n){if(typeof text!=='string'||text.length!==Math.ceil(n/3)*4)return null;try{const s=atob(text);if(s.length!==n)return null;return Uint8ClampedArray.from(s,c=>c.charCodeAt(0));}catch(_){return null;}}
function dimensions(w,h){return Number.isInteger(w)&&Number.isInteger(h)&&w>=700&&h>=1200&&w<=1800&&h<=1800&&w*h<=4000000;}
function construct(v){const [x,y,X,Y]=v.geometry.box,w=v.analysisWidth,h=v.analysisHeight;return{x:x/w,y:y/h,w:(X-x)/w,h:(Y-y)/h,_identitySource:'structural-grid-frame',_geometryOwner:'structural-grid-contours',_geometryType:'residual-matte-row',_contours:v.geometry.rings.map(r=>r.map(([x,y])=>({x:x/w,y:y/h}))),_structuralGridProof:v};}
function validPanel(p){try{
 if(accepted.has(p))return true;
 const v=p?._structuralGridProof,w=v?.analysisWidth,h=v?.analysisHeight;
 if(v?.version!==VERSION||v.method!==METHOD||v.originalFrames!==1||!dimensions(w,h)||!eligible(v.prior)||!E.validPanel(v.prior[0])||!C.validPanel(v.prior[1])||!S.validPanel(v.prior[2]))return false;
 const a=decode(v.sourceRGBA,w*h*4);if(!a)return false;
 const g=geometry(a,w,h,v.prior);return!!g&&same(g,v.geometry)&&same(construct(v),p);
 }catch(_){return false;}}
function native(img){let canvas;try{
 if(!(img instanceof Image)||!P.sourceReady(img)||PanelMatteCells.sampleBilinearRGBA!==T||PanelRasterWitness!==Witness||S.verifiedSource!==ParentRead)return null;
 const source=P.sourceState(img),w=img.naturalWidth||img.width,h=img.naturalHeight||img.height;
 if(!Number.isSafeInteger(w)||!Number.isSafeInteger(h)||w*h>8000000)return null;
 canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0);
 const a=ctx.getImageData(0,0,w,h).data;
 return equal(source,P.sourceState(img))?{a,w,h,source}:null;
 }catch(_){return null;}finally{if(canvas)canvas.width=canvas.height=1;}}
function sourceParents(img,prior){
 return eligible(prior)&&S.verifiedSource===ParentRead&&same(S.supplementImage(img,prior.slice(0,2))?.child,prior[2]);
}
function supplementImage(img,prior){
 try{
  if(!eligible(prior)||S.verifiedSource!==ParentRead)return null;
  const admitted=ParentRead(img,prior);
  if(!admitted&&!sourceParents(img,prior))return null;
  const raw=admitted||native(img),v=prior[0]._structuralGridProof,w=v.analysisWidth,h=v.analysisHeight;
  if(!raw||!dimensions(w,h))return null;
  const a=T(raw.a,raw.w,raw.h,w,h),g=geometry(a,w,h,prior);if(!g)return null;
  const proof={version:VERSION,method:METHOD,originalFrames:1,analysisWidth:w,analysisHeight:h,prior:prior.slice(),sourceRGBA:encode(a),geometry:g};
  const child=freeze(construct(proof));accepted.add(child);return{child,raw};
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
// Read-only successor query. Only exact installed owners and current native
// pixels can reuse this family’s private admission; public analyses cannot.
function verifiedSource(img,owners){
 const q=issued;if(q?.owners!==owners||!generationCurrent(q))return null;
 const raw=native(img);return raw&&raw.w===q.w&&raw.h===q.h&&Witness.matchesRetained(raw.a,raw.w,raw.h,q.token)&&generationCurrent(q)?raw:null;
}
function install(d){
 if(!PanelStructuralGrid._residualMatteRow){const old=PanelStructuralGrid.validPanel;PanelStructuralGrid.validPanel=p=>claims(p)?validPanel(p):old(p);PanelStructuralGrid._residualMatteRow=true;}
 if(typeof PanelGeometry!=='undefined'&&!PanelGeometry._residualMatteRow){const old=PanelGeometry.refine;PanelGeometry.refine=async function(url,p,log){return claims(p)?validPanel(p)?{...p}:null:old.call(this,url,p,log);};PanelGeometry._residualMatteRow=true;}
 if(typeof PanelEdgeSpill!=='undefined'&&!PanelEdgeSpill._residualMatteRow){for(const name of['analyzeImage','analyzeRGBA']){const old=PanelEdgeSpill[name];if(old)PanelEdgeSpill[name]=function(...args){return claims(args[name==='analyzeImage'?1:3])?null:old.apply(this,args);};}PanelEdgeSpill._residualMatteRow=true;}
 if(!d||d._residualMatteRow)return;
 const old=d.detect;d.detect=async function(url,log){const prior=await old.call(this,url,log);if(!eligible(prior))return prior;try{const img=new Image();img.src=url;await img.decode();return issue(img,prior);}catch(e){log?.('Residual matte row deferred: '+e.message);return prior;}};d._residualMatteRow=true;
}
function installReader(r){
 if(!r||r._residualMatteRowReader)return;
 const prepare=r._prepareSharedTopPanels,display=r.displayPanelContours,find=r.findPanelAt,zoom=r.zoomToPanel,key='_residualMatteRowState';
 function context(reader){
  G.check(reader);const owners=reader.currentPanels;
  if(!Array.isArray(owners)||!owners.some(claims))return null;
  if(G.blocked(reader,key))return{valid:false};
  let img;try{img=reader.getPanelImageContext?.()?.img;}catch(_){}
  const source=P.sourceState(img),before=reader[key];
  if(before?.owners===owners&&before.img===img&&PanelMatteCells.sampleBilinearRGBA===T&&PanelRasterWitness===Witness&&S.verifiedSource===ParentRead&&P.sourceReady(img)&&equal(before.items,owners)&&equal(before.source,source)&&G.unchanged(before.input,owners))return before;
  const state={owners,items:owners.slice(),input:G.identity(owners),img,source,prior:owners.filter(p=>!claims(p)),children:owners.filter(claims),valid:false};reader[key]=state;
  if(!state.input||!P.sourceReady(img)||state.children.length!==1||!eligible(state.prior))return state;
  const child=state.children[0];state.child=child;
  if(issued?.owners===owners&&generationCurrent(issued))state.prior=issued.prior;
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
 r._prepareSharedTopPanels=function(){return this.currentPanels?.some(claims)?context(this)?.valid===true:prepare?.call(this);};
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
 r._residualMatteRowReader=true;
}
return{VERSION,METHOD,eligible,raster,analyzeRGBA,geometry,claims,validPanel,supplementImage,verifiedSource,install,installReader};
})();
if(typeof module!=='undefined')module.exports=PanelResidualMatteRow;
