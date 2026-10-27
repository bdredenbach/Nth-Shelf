'use strict';
// Public synthetic routing checks: no private artwork, page IDs or source taps.
// Executes the actual Reader method and actual request/selection lifecycle code.
const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const source=fs.readFileSync(path.join(__dirname,'../js/reader.js'),'utf8');
const prefix=source.slice(0,source.indexOf('const Reader = {'));
const start=source.indexOf(' async handleSingleTap(pos) {');
const end=source.indexOf('\n async handleDeferredPanelDoubleTap(',start);
assert(start>0&&end>start,'Actual Reader method boundaries required');
const method=source.slice(start,end);assert(method.includes('PanelSupportedLandscape.findMissCandidate'));
const checks=[];
async function check(name,fn){await fn();checks.push(name);}
function fixture(options={}){
 const rect={left:0,top:0,width:100,height:100};
 const listeners=new Map();let img={src:'synthetic-source',currentSrc:'synthetic-source',naturalWidth:100,naturalHeight:100,width:100,height:100,complete:true,
  addEventListener(k,fn){if(!listeners.has(k))listeners.set(k,new Set());listeners.get(k).add(fn);},removeEventListener(k,fn){listeners.get(k)?.delete(fn);}};
 const contours=[[{x:.1,y:.1},{x:.9,y:.1},{x:.9,y:.9},{x:.1,y:.9}]];
 const owner={x:.1,y:.1,w:.8,h:.8,_identitySource:'synthetic-existing',_contours:contours};
 const supported={x:.1,y:.1,w:.8,h:.8,_identitySource:'synthetic-supported',_contours:contours};
 const calls={newRoute:0,zoom:[],chrome:0,validate:0};let api,reader;
 const geometry={refineAdaptiveOnly:async()=>options.route==='quick'?owner:null,
  refine:async(_,seed)=>options.route==='rescue'?{...seed,_geometryOwner:'orthogonal-frame',_frameEnvelope:{chainConnected:true}}:seed};
 const detector={detectTapHybrid:async()=>options.route==='hybrid'?owner:null,detectTapLocalFallback:async()=>options.route==='local'?owner:null};
 const landscape={findMissCandidate:async()=>{calls.newRoute++;await Promise.resolve();if(options.during)options.during({reader,api,replaceImage(x){img=x;},img,fire(k){for(const fn of [...(listeners.get(k)||[])])fn();}});if(options.error)throw Error('synthetic analysis error');return options.absent?null:supported;},validateImage(){calls.validate++;return options.valid!==false;}};
 api=new Function('clamp','PanelMap','PanelGeometry','PanelDetect','PanelSupportedLandscape',prefix+'\nconst methods={'+method+'};return {handle:methods.handleSingleTap,request:PanelTapRequest};')((x,a,b)=>Math.max(a,Math.min(b,x)),{findAt:()=>options.route==='map'?owner:null},geometry,detector,landscape);
 reader={mode:'single',scale:1,comic:{id:'synthetic'},index:0,_panelLoadToken:1,panelOverlayToken:1,currentPanels:options.route==='owner'?[owner]:[],els:{stage:{getBoundingClientRect:()=>rect}},getPanelImageContext:()=>({img,rect}),getPageUrl:async()=> 'synthetic-source',findPanelAt:()=>options.route==='owner'?owner:null,panelContours:()=>contours,displayPanelContours:()=>options.display===false?null:contours,pointInContours:()=>options.hit!==false,zoomToPanel(p){calls.zoom.push(p);},toggleChrome(){calls.chrome++;}};
 return {reader,calls,run:()=>api.handle.call(reader,{x:50,y:50}),supported};
}
(async()=>{
 for(const route of ['owner','map','quick','hybrid','local','rescue'])await check(route+' priority bypasses new final-miss route',async()=>{const f=fixture({route});await f.run();assert.equal(f.calls.newRoute,0);assert.equal(f.calls.zoom.length,1);assert.equal(f.calls.chrome,0);});
 await check('validated final miss and displayed contour hit zooms',async()=>{const f=fixture();await f.run();assert.equal(f.calls.newRoute,1);assert.equal(f.calls.validate,1);assert.equal(f.calls.zoom[0],f.supported);assert.equal(f.calls.chrome,0);});
 for(const [name,options] of [['absent candidate',{absent:true}],['outside displayed contour',{hit:false}],['invalid source',{valid:false}],['missing displayed contours',{display:false}],['analysis rejection',{error:true}]])await check(name+' stays a miss',async()=>{const f=fixture(options);await f.run();assert.equal(f.calls.newRoute,1);assert.equal(f.calls.zoom.length,0);assert.equal(f.calls.chrome,1);});
 const changes={
  cancel:({reader,api})=>api.request.cancel(reader),
  page:({reader})=>reader.index++,
  comic:({reader})=>reader.comic={id:'replacement'},
  image:({img,replaceImage})=>replaceImage({...img}),
  source:({img})=>{img.src='replacement';img.currentSrc='replacement';},
  loading:({img})=>{img.complete=false;},
  reload:({fire})=>fire('load'),
  error:({fire})=>fire('error'),
  mode:({reader})=>{reader.mode='scroll';},
  zoom:({reader})=>{reader.scale=2;},
  owners:({reader})=>{reader.currentPanels=[];}
 };
 for(const [name,during] of Object.entries(changes))await check(name+' change during await cannot zoom or toggle',async()=>{const f=fixture({during});await f.run();assert.equal(f.calls.newRoute,1);assert.equal(f.calls.zoom.length,0);assert.equal(f.calls.chrome,0);});

 const zoomStart=source.indexOf(' async zoomToPanel(panel, stageRect, imgRect) {');
 const zoomEnd=source.indexOf('\n};',zoomStart);assert(zoomStart>0&&zoomEnd>zoomStart);
 const zoomMethod=source.slice(zoomStart,zoomEnd);
 function zoomFixture({kind='host',valid=true,hasContours=true,actualPanorama=false,malform}={}){
  const rect={left:0,top:0,right:100,bottom:100,width:100,height:100};
  const img={naturalWidth:100,naturalHeight:100};
  const rings=[[{x:.2,y:.2},{x:.8,y:.2},{x:.8,y:.8},{x:.2,y:.8}]];
  const panel={x:.2,y:.2,w:.6,h:.6,_identitySource:'structural-grid-frame',_geometryType:kind,_contours:rings,_structuralGridProof:{version:kind==='host'?171:kind==='landscape'?172:1}};
  if(malform)malform(panel);
  const calls={spill:0,validate:0,draw:0,clip:0};
  const context={save(){},restore(){},beginPath(){},lineTo(){},moveTo(){},closePath(){},clip(){calls.clip++;},drawImage(){calls.draw++;}};
  const make=()=>({style:{setProperty(){}},dataset:{},children:[],setAttribute(){},appendChild(x){this.children.push(x);x.parentNode=this;},getContext(){return context;}});
  const dom={createElement:make};
  const host={claims:p=>p._geometryType==='host',validateImage(){calls.validate++;return valid;}};
  const landscape=actualPanorama?require('../js/panels-supported-landscape.js'):{isClaim:p=>p._geometryType==='landscape',validateImage(){calls.validate++;return valid;}};
  const zoom=new Function('clamp','document','requestAnimationFrame','PanelHostBackgroundIslands','PanelSupportedLandscape','PanelEdgeSpill','PanelMap','const methods={'+zoomMethod+'};return methods.zoomToPanel;')((x,a,b)=>Math.max(a,Math.min(b,x)),dom,()=>{},host,landscape,{analyzeImage(){calls.spill++;return null;}},{remember(){}});
  const reader={currentPanels:[],focusMode:null,panelOverlayToken:0,_bubbleRequestToken:0,index:0,comic:{id:'synthetic'},els:{stage:make(),viewport:{classList:{add(){}}}},panelContours:()=>hasContours?rings:null,panelPolygon:()=>null,displayPanelContours:(_,c)=>c,getPanelImageContext:()=>({img}),setFocusDim(){}};
  return {reader,panel,calls,run:()=>zoom.call(reader,panel,rect,rect)};
 }
 for(const kind of ['host','landscape']){
  await check(kind+' actual zoom holds issued owner and suppresses edge spill',async()=>{const f=zoomFixture({kind});await f.run();assert.equal(f.calls.validate,1);assert.equal(f.calls.spill,0);assert.equal(f.calls.draw,1);assert.equal(f.calls.clip,1);assert.equal(f.reader.panelFocusMeta.panel,f.panel);assert.equal(f.reader.panelOverlayActive,true);});
  for(const bad of [{valid:false},{hasContours:false}])await check(kind+' invalid/missing source contours fail closed',async()=>{const f=zoomFixture({kind,...bad});await f.run();assert.equal(f.calls.draw,0);assert.equal(f.calls.spill,0);assert.equal(f.reader.focusMode,null);assert.equal(f.reader.panelFocusMeta,undefined);});
 }
 await check('existing owner zoom does not validate new modules or suppress old spill route',async()=>{const f=zoomFixture({kind:'old'});await f.run();assert.equal(f.calls.validate,0);assert.equal(f.calls.spill,1);assert.equal(f.calls.draw,1);assert.notEqual(f.reader.panelFocusMeta.panel,f.panel);});

 for(const [name,malform] of [['wrong type',p=>{p._geometryType='unrecognized';p._structuralGridProof.method='source-supported-upper-landscape';}],['wrong method',p=>{p._geometryType='supported-landscape';p._structuralGridProof.method='unrecognized';}],['missing method',p=>{p._geometryType='supported-landscape';delete p._structuralGridProof.method;}]])await check('actual172module '+name+' claim cannot fall through to rectangle',async()=>{const f=zoomFixture({kind:'landscape',actualPanorama:true,malform});await f.run();assert.equal(f.calls.draw,0);assert.equal(f.calls.spill,0);assert.equal(f.reader.focusMode,null);});

 const doubleStart=source.indexOf(' async handleDoubleTap(pos) {');
 const doubleEnd=source.indexOf('\n showBubbleOverlay(',doubleStart);assert(doubleStart>0&&doubleEnd>doubleStart);
 const doubleMethod=source.slice(doubleStart,doubleEnd);
 function doubleFixture({kind='host',valid=true,invalidateAt}={}){
  const calls={validate:0,extract:0,show:0,reset:0,contains:0};let live=valid;
  const rect={left:0,top:0,width:100,height:100};const img={src:'synthetic',naturalWidth:100,naturalHeight:100};
  const rings=[[{x:0,y:0},{x:1,y:0},{x:1,y:1},{x:0,y:1}]];
  const panel={x:0,y:0,w:1,h:1,kind};const overlay={getBoundingClientRect:()=>rect};
  const validate=()=>{calls.validate++;return live;};
  const method=new Function('PanelTapRequest','PanelHostBackgroundIslands','PanelSupportedLandscape','BubbleDetect','clamp','const methods={'+doubleMethod+'};return methods.handleDoubleTap;')({cancel(){}},{claims:p=>p?.kind==='host',validateImage:validate},{isClaim:p=>p?.kind==='landscape',validateImage:validate},{extract:async()=>{calls.extract++;if(invalidateAt==='detector')live=false;return{canvas:{}};}},(x,a,b)=>Math.max(a,Math.min(b,x)));
  const reader={mode:'single',bubbleAltZoomEnabled:true,_bubbleRequestToken:0,focusMode:'panel',panelOverlayActive:true,comic:{id:'synthetic'},index:0,els:{stage:{getBoundingClientRect:()=>rect},panelOverlay:overlay},panelFocusMeta:{panel,cropContours:rings},getPanelImageContext:()=>({img,rect}),pointInContours(){calls.contains++;return true;},getPageUrl:async()=>{if(invalidateAt==='url')live=false;return'synthetic';},resetZoom(){calls.reset++;},removePanelOverlay(){},setFocusDim(){},showBubbleOverlay(){calls.show++;}};
  return {calls,run:()=>method.call(reader,{x:50,y:50})};
 }
 for(const kind of ['host','landscape']){
  await check(kind+' stale source focus rejects cached crop contours before hit test',async()=>{const f=doubleFixture({kind,valid:false});await f.run();assert.equal(f.calls.contains,0);assert.equal(f.calls.extract,0);assert.equal(f.calls.show,0);assert.equal(f.calls.reset,1);});
  for(const invalidateAt of ['url','detector'])await check(kind+' focus source invalidation during '+invalidateAt+' await cannot show bubble',async()=>{const f=doubleFixture({kind,invalidateAt});await f.run();assert.equal(f.calls.show,0);assert.equal(f.calls.reset,0);assert.equal(f.calls.extract,invalidateAt==='url'?0:1);});
 }
 await check('old focus double tap does not validate new source modules',async()=>{const f=doubleFixture({kind:'old'});await f.run();assert.equal(f.calls.validate,0);assert.equal(f.calls.extract,1);assert.equal(f.calls.show,1);});
 console.log(JSON.stringify({passed:checks.length,method:'actual Reader single-tap, zoom, double-tap methods; synthetic service mocks and actual tap lifecycle guards',checks},null,2));
})().catch(e=>{console.error(e);process.exitCode=1;});
