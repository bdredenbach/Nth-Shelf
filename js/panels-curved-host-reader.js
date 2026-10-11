/* Research-only Reader admission. Both complementary singles must be present
 * in their exact prescribed order: replacement first, appended second. Accepted retained owners are delegated through
 * their original source-authenticated context without changing their objects. */
const PanelCurvedHostReader=(()=>{
'use strict';
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const P=PanelArticulatedRimCell,G=P.readerScopeGuard,M=PanelCurvedHostNativePartition;
const equal=(a,b)=>Array.isArray(a)&&Array.isArray(b)&&a.length===b.length&&a.every((v,i)=>v===b[i]);
function completeContours(rings){return Array.isArray(rings)&&rings.length>0&&rings.length<=64&&rings.every(r=>Array.isArray(r)&&r.length>=4&&r.length<=4096&&r.every(p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y)&&p.x>=0&&p.x<=1&&p.y>=0&&p.y<=1));}
function retainedDisplays(reader,prior,retained,img,display){
 const out=new Map();if(!retained.length)return out;
 const v=prior[0]?._structuralGridProof,w=v?.analysisWidth,h=v?.analysisHeight;
 if(!Number.isInteger(w)||!Number.isInteger(h)||w<80||h<80||w>900||h>900||!P.sourceReady(img))return null;
 const a=PanelGradientInsetPair.imageRaster(img,w,h);if(a?.length!==w*h*4)return null;
 for(const p of retained){
  const raw=reader.panelContours(p);if(!completeContours(raw)||!same(raw,p._contours))return null;
  const neighbors=prior.filter(q=>q!==p&&q.x<p.x+p.w&&q.x+q.w>p.x&&q.y<p.y+p.h&&q.y+q.h>p.y),foreign=neighbors.map(q=>reader.panelContours(q));
  if(foreign.some(c=>!completeContours(c)))return null;
  // The original Reader may repair a detector contour. Preserve that exact
  // current-source contract, including its original ordered foreign owners.
  // A stale cache or a neighboring display cannot pass this independent replay.
  const repair=PanelCropRepair.repair(raw,w,h,foreign,a),expected=repair?.contours||raw,shown=display.call(reader,p,raw);
  if(!completeContours(expected)||!same(shown,expected))return null;
  out.set(p,G.canonical(expected));
 }
 return out;
}
// Keep ancestor-owner context local to a delegated call. Its ordinary Reader
// state writes still reach the live Reader; temporary ancestor maps never do.
// The live scope pin remains authoritative for the retained crop display.
function ancestorReader(reader,owners,key,child,display){
 let current=owners;
 return new Proxy(reader,{
  get(target,property,receiver){
   if(property==='currentPanels')return current;
   if(property==='displayPanelContours')return function(p,c=this.panelContours(p)){
    if(p===child)return reader.displayPanelContours(p,c)||[];
    return display.call(this,p,c);
   };
   return Reflect.get(target,property,receiver);
  },
  set(target,property,value){if(property==='currentPanels'){current=value;return true;}return Reflect.set(target,property,value,target);}
 });
}
function installReader(r){
 if(!r||r._curvedHostReader)return;
 const display=r.displayPanelContours,find=r.findPanelAt,zoom=r.zoomToPanel,key='_curvedHostState';
 function context(reader){
  G.check(reader);const owners=reader.currentPanels;
  if(!Array.isArray(owners)||!owners.some(M.claims))return null;
  if(G.blocked(reader,key))return{owners,valid:false,retained:[],prior:[]};
  let img;try{img=reader.getPanelImageContext?.()?.img;}catch(_){}
  const source=P.sourceState(img),before=reader[key];
  if(before&&before.owners===owners&&before.img===img&&equal(before.source,source)&&equal(before.items,owners)&&G.unchanged(before.input,owners)&&(!before.issued||before.issued.current(reader)))return before;
  const state={owners,items:owners.slice(),img,source,input:G.identity(owners),children:owners.filter(M.claims),retained:owners.filter(p=>!M.claims(p)),prior:[],previous:new Map(),valid:false};reader[key]=state;
  if(!state.input||!img||!P.sourceReady(img)||state.children.length!==2)return state;
  // Only an installed detector can have registered this exact map. Its
  // full native raster is compared with the shared witness on this first
  // ordinary Reader query; frozen-looking or copied descriptors cannot issue.
  const issued=M.takeIssued?.(reader);
  if(issued){
   state.issued=issued;state.prior=issued.prior;
   const previous=G.under(reader,state.prior,()=>retainedDisplays(reader,state.prior,state.retained,img,display));
   if(!previous||!issued.current(reader)||!G.unchanged(state.input,owners))return state;
   state.previous=previous;state.canonical=issued.canonical;state.displays=state.canonical.map(p=>p._contours);state.valid=true;return state;
  }
  const stored=state.children[0]._structuralGridProof?.anchors;
  if(!M.eligible(stored))return state;
  const retired=state.children[0]._structuralGridProof.geometry?.retiredIndex;
  const prior=stored.map((p,i)=>i===retired?p:state.retained.find(q=>same(q,p)));
  if(prior.some(p=>!p)||state.retained.length!==prior.length-1||!M.pairValid(state.children,prior)||!same(M.integrate(prior,state.children),owners))return state;
  // Ordered value equality is insufficient when duplicated caller references
  // move around; compare exact integration references too.
  if(!equal(M.integrate(prior,state.children),owners))return state;
  state.prior=prior;
  if(!M.replayImage(img,state.children,prior)||!G.unchanged(state.input,owners))return state;
  const previous=G.under(reader,prior,()=>retainedDisplays(reader,prior,state.retained,img,display));
  if(!previous)return state;state.previous=previous;
  state.canonical=state.children.map(G.canonical);state.displays=state.canonical.map(p=>p._contours);
  if(reader.currentPanels!==owners||reader.getPanelImageContext?.()?.img!==img||!equal(source,P.sourceState(img))||!G.unchanged(state.input,owners))return state;
  state.valid=true;return state;
 }
 r.displayPanelContours=function(p,c=this.panelContours(p)){
  const pinned=G.display(this,key,p);if(pinned){const s=this[key];return s?.issued&&!s.issued.current(this,true)?[]:pinned.display;}
  const s=context(this);if(M.claims(p)){const i=s?.children?.indexOf(p);return s?.valid&&i>=0?s.displays[i]:null;}
  if(!s)return display.call(this,p,c);
  return s.valid&&s.retained.includes(p)?s.previous.get(p):null;
 };
 r.findPanelAt=function(x,y){const s=context(this);if(!s){const hit=find.call(this,x,y);return M.claims(hit)?null:hit;}if(!s.valid||!this.panelZoomEnabled)return null;for(let i=0;i<s.children.length;i++)if(this.pointInContours(s.displays[i],x,y))return s.children[i];const hit=G.under(this,s.prior,()=>find.call(this,x,y));return s.retained.includes(hit)?hit:null;};
 r.zoomToPanel=function(p,...args){const pinned=G.display(this,key,p);if(pinned&&!pinned.display.length)return;const s=context(this);if(!s)return M.claims(p)?undefined:zoom.call(this,p,...args);if(!s.valid)return;const i=s.children.indexOf(p);if(i>=0){const state={...s,child:p,canonical:s.canonical[i],display:s.displays[i]};return G.run(this,key,state,()=>zoom.call(this,p,...args));}if(s.retained.includes(p)){
   const state={...s,child:p,canonical:G.canonical(p),display:s.previous.get(p)},ancestor=ancestorReader(this,s.prior,key,p,display);
   return G.run(this,key,state,()=>zoom.call(ancestor,p,...args));
  }};
 // Finish source admission while the page is preparing, before a user's
 // first tap. context() still checks source, owners and navigation on every
 // query; preparation does not grant authority to restored/caller evidence.
 r._prepareCurvedHostPanels=function(){
  if(!Array.isArray(this.currentPanels)||!this.currentPanels.some(M.claims))return false;
  return context(this)?.valid===true;
 };
 r._curvedHostReader=true;
}
return{installReader};
})();
if(typeof module!=='undefined')module.exports=PanelCurvedHostReader;
