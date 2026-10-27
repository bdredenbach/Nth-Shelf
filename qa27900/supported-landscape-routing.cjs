'use strict';
// Public synthetic routing checks: no private artwork, page IDs or source taps.
// Executes the actual Reader method and actual request/selection lifecycle code.
const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const source=fs.readFileSync(path.join(__dirname,'../js/reader.js'),'utf8');
const prefix=source.slice(0,source.indexOf('const Reader = {'));
const start=source.indexOf(' async handleSingleTap(pos) {');
const end=source.indexOf('\n async handleDeferredPanelDoubleTap(',start);
assert(start>0&&end>start,'Actual Reader method boundaries required');
const method=source.slice(start,end);assert(method.includes('sourceRoute.findMissCandidate'));
const terminalHelpers=source.slice(source.indexOf(' terminalSourceRoute(panel) {'),source.indexOf('\n panelContours(panel) {'));
assert(terminalHelpers.includes('terminalSourceContours'));
const checks=[];
async function check(name,fn){await fn();checks.push(name);}
function fixture(options={}){
 const rect={left:0,top:0,width:100,height:100};
 const listeners=new Map();let img={src:'synthetic-source',currentSrc:'synthetic-source',naturalWidth:100,naturalHeight:100,width:100,height:100,complete:true,
  addEventListener(k,fn){if(!listeners.has(k))listeners.set(k,new Set());listeners.get(k).add(fn);},removeEventListener(k,fn){listeners.get(k)?.delete(fn);}};
 const contours=[[{x:.1,y:.1},{x:.9,y:.1},{x:.9,y:.9},{x:.1,y:.9}]];
 const owner={x:.1,y:.1,w:.8,h:.8,_identitySource:'synthetic-existing',_contours:contours};
 const supported={x:.1,y:.1,w:.8,h:.8,_identitySource:'synthetic-supported',_contours:contours};
 const calls={newRoute:0,appearance:0,terminal:0,zoom:[],chrome:0,validate:0};let api,reader;
 const geometry={refineAdaptiveOnly:async()=>options.route==='quick'?owner:null,
  refine:async(_,seed)=>options.route==='rescue'?{...seed,_geometryOwner:'orthogonal-frame',_frameEnvelope:{chainConnected:true}}:seed};
 const detector={detectTapHybrid:async()=>options.route==='hybrid'?owner:null,detectTapLocalFallback:async()=>options.route==='local'?owner:null};
 const landscape={findMissCandidate:async()=>{calls.newRoute++;await Promise.resolve();if(!options.useTerminal&&!options.useAppearance&&options.during)options.during({reader,api,replaceImage(x){img=x;},img,fire(k){for(const fn of [...(listeners.get(k)||[])])fn();}});if(options.error)throw Error('synthetic analysis error');return options.absent||options.useTerminal||options.useAppearance?null:supported;},validateImage(){calls.validate++;return options.valid!==false;}};
 const terminal={isClaim:p=>!!options.useTerminal&&p===supported,panelContours:()=>options.display===false?null:contours,findMissCandidate:async()=>{calls.terminal++;await Promise.resolve();if(options.useTerminal&&options.during)options.during({reader,api,replaceImage(x){img=x;},img,fire(k){for(const fn of [...(listeners.get(k)||[])])fn();}});if(options.useTerminal&&options.error)throw Error('terminal synthetic error');return options.useTerminal&&!options.absent?supported:null;},validateImage:()=>options.valid!==false};
 const appearance={isClaim:p=>!!options.useAppearance&&p===supported,panelContours:()=>options.display===false?null:contours,hasSourceCandidate(){if(options.sourceInspectionError)throw Error('synthetic inspection failure');return options.sourceAvailable??!!options.useAppearance;},findMissCandidate:async()=>{calls.appearance++;await Promise.resolve();if(options.useAppearance&&options.during)options.during({reader,api,replaceImage(x){img=x;},img,fire(k){for(const fn of [...(listeners.get(k)||[])])fn();}});if(options.useAppearance&&options.error)throw Error('appearance synthetic error');return options.useAppearance&&!options.absent?supported:null;},validateImage:()=>options.valid!==false};
 api=new Function('clamp','PanelMap','PanelGeometry','PanelDetect','PanelSupportedLandscape','PanelTerminalContext','PanelTerminalAppearance',prefix+'\nconst methods={'+terminalHelpers+method+'};return {handle:methods.handleSingleTap,helpers:methods,request:PanelTapRequest};')((x,a,b)=>Math.max(a,Math.min(b,x)),{findAt:()=>options.route==='map'?owner:null},geometry,detector,landscape,terminal,appearance);
 reader={...api.helpers,mode:'single',scale:1,comic:{id:'synthetic'},index:0,_panelLoadToken:1,panelOverlayToken:1,currentPanels:options.route==='owner'?[owner]:[],els:{stage:{getBoundingClientRect:()=>rect}},getPanelImageContext:()=>({img,rect}),getPageUrl:async()=> 'synthetic-source',findPanelAt:()=>options.route==='owner'?owner:null,panelContours:()=>contours,displayPanelContours:()=>options.display===false?null:contours,pointInContours:()=>options.hit!==false,zoomToPanel(p){calls.zoom.push(p);},toggleChrome(){calls.chrome++;}};
 return {reader,calls,run:()=>api.handle.call(reader,{x:50,y:50}),supported};
}
(async()=>{
 for(const route of ['owner','map','quick','hybrid','local','rescue'])await check(route+' priority bypasses new final-miss route',async()=>{const f=fixture({route});await f.run();assert.equal(f.calls.newRoute,0);assert.equal(f.calls.appearance,0);assert.equal(f.calls.terminal,0);assert.equal(f.calls.zoom.length,1);assert.equal(f.calls.chrome,0);});
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
 function zoomFixture({kind='host',valid=true,hasContours=true,actualPanorama=false,actualTerminal=false,actualAppearance=false,malform,viewportHelper=false,tall=false}={}){
  const events=()=>{const m=new Map();return{addEventListener(k,f){if(!m.has(k))m.set(k,new Set());m.get(k).add(f);},removeEventListener(k,f){m.get(k)?.delete(f);},fire(k){for(const f of [...(m.get(k)||[])])f();},count(){return [...m.values()].reduce((n,v)=>n+v.size,0);}};};
  const win=events();win.visualViewport=events();
  const rect={left:0,top:0,right:100,bottom:tall?200:100,width:100,height:tall?200:100};
  const imgRect=tall?{left:0,top:60,right:100,bottom:135,width:100,height:75}:rect;
  const img={...events(),naturalWidth:tall?400:100,naturalHeight:tall?300:100};
  const rings=[[{x:.2,y:.2},{x:.8,y:.2},{x:.8,y:.8},{x:.2,y:.8}]];
  const panel={x:.2,y:.2,w:.6,h:.6,_identitySource:'structural-grid-frame',_geometryType:kind,_contours:rings,_structuralGridProof:{version:kind==='host'?171:kind==='landscape'?172:kind==='terminal'?173:kind==='appearance'?174:1}};
  if(tall){Object.assign(panel,{x:.1,y:0,w:.3,h:.95});rings[0]=[{x:.1,y:0},{x:.4,y:0},{x:.4,y:.95},{x:.1,y:.95}];}
  if(malform)malform(panel);
  const calls={spill:0,validate:0,draw:0,clip:0,reset:0,drawArgs:[]};
  const context={save(){},restore(){},beginPath(){},lineTo(){},moveTo(){},closePath(){},clip(){calls.clip++;},drawImage(...args){calls.draw++;calls.drawArgs.push(args);}};
  const make=()=>({style:{setProperty(k,v){this[k]=v;}},dataset:{},children:[],setAttribute(){},animate(frames,options){calls.animation={frames,options};return{cancel(){}};},remove(){this.parentNode=null;},appendChild(x){this.children.push(x);x.parentNode=this;},getContext(){return context;}});
  const raf=[];const dom={createElement:make};
  const host={claims:p=>p._geometryType==='host',validateImage(){calls.validate++;return valid;}};
  const landscape=actualPanorama?require('../js/panels-supported-landscape.js'):{isClaim:p=>p._geometryType==='landscape',validateImage(){calls.validate++;return valid;}};
  const terminal=actualTerminal?require('../js/panels-terminal-context.js'):{isClaim:p=>p._geometryType==='terminal',panelContours:()=>hasContours?rings:null,validateImage(){calls.validate++;return valid;}};
  const appearance=actualAppearance?require('../js/panels-terminal-appearance.js'):{isClaim:p=>p._geometryType==='appearance',panelContours:()=>hasContours?rings:null,validateImage(){calls.validate++;return valid;}};
  const helper=viewportHelper?new Function('window','module',fs.readFileSync(path.join(__dirname,'../js/panels-source-group-viewport.js'),'utf8')+';return PanelSourceGroupViewport;')(win,{exports:{}}):undefined;
  const zoom=new Function('clamp','document','requestAnimationFrame','PanelHostBackgroundIslands','PanelSupportedLandscape','PanelTerminalContext','PanelTerminalAppearance','PanelSourceGroupViewport','PanelEdgeSpill','PanelMap','const methods={'+terminalHelpers+zoomMethod+'};return Object.assign(methods.zoomToPanel,methods);')((x,a,b)=>Math.max(a,Math.min(b,x)),dom,fn=>raf.push(fn),host,landscape,terminal,appearance,helper,{analyzeImage(){calls.spill++;return null;}},{remember(){}});
  const reader={...zoom,currentPanels:[],focusMode:null,panelOverlayToken:0,_bubbleRequestToken:0,index:0,comic:{id:'synthetic'},els:{stage:make(),chrome:{querySelector(){return{getBoundingClientRect:()=>({height:20})};}},viewport:{classList:{add(){}}}},panelContours:()=>hasContours?rings:null,panelPolygon:()=>null,displayPanelContours:(_,c)=>c,getPanelImageContext:()=>({img}),setFocusDim(){}};
  const removeStart=source.indexOf(' removePanelOverlay(animate = false) {'),removeEnd=source.indexOf('\n removeBubbleOverlay(',removeStart);
  const remove=new Function('PanelTapRequest','const methods={'+source.slice(removeStart,removeEnd)+'};return methods.removePanelOverlay;')({cancel(){}});
  reader.resetZoom=()=>{calls.reset++;remove.call(reader,false);};
  return {reader,panel,calls,win,img,helper,rect,imgRect,remove:()=>remove.call(reader,false),run:async()=>{await zoom.call(reader,panel,rect,imgRect);for(const fn of raf)fn();}};
 }
 for(const kind of ['host','landscape','terminal','appearance']){
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
  const method=new Function('PanelTapRequest','PanelHostBackgroundIslands','PanelSupportedLandscape','PanelTerminalContext','PanelTerminalAppearance','BubbleDetect','clamp','const methods={'+terminalHelpers+doubleMethod+'};return Object.assign(methods.handleDoubleTap,methods);')({cancel(){}},{claims:p=>p?.kind==='host',validateImage:validate},{isClaim:p=>p?.kind==='landscape',validateImage:validate},{isClaim:p=>p?.kind==='terminal',validateImage:validate},{isClaim:p=>p?.kind==='appearance',validateImage:validate},{extract:async()=>{calls.extract++;if(invalidateAt==='detector')live=false;return{canvas:{}};}},(x,a,b)=>Math.max(a,Math.min(b,x)));
  const reader={...method,mode:'single',bubbleAltZoomEnabled:true,_bubbleRequestToken:0,focusMode:'panel',panelOverlayActive:true,comic:{id:'synthetic'},index:0,els:{stage:{getBoundingClientRect:()=>rect},panelOverlay:overlay},panelFocusMeta:{panel,cropContours:rings},getPanelImageContext:()=>({img,rect}),pointInContours(){calls.contains++;return true;},getPageUrl:async()=>{if(invalidateAt==='url')live=false;return'synthetic';},resetZoom(){calls.reset++;},removePanelOverlay(){},setFocusDim(){},showBubbleOverlay(){calls.show++;}};
  return {calls,run:()=>method.call(reader,{x:50,y:50})};
 }
 for(const kind of ['host','landscape','terminal','appearance']){
  await check(kind+' stale source focus rejects cached crop contours before hit test',async()=>{const f=doubleFixture({kind,valid:false});await f.run();assert.equal(f.calls.contains,0);assert.equal(f.calls.extract,0);assert.equal(f.calls.show,0);assert.equal(f.calls.reset,1);});
  for(const invalidateAt of ['url','detector'])await check(kind+' focus source invalidation during '+invalidateAt+' await cannot show bubble',async()=>{const f=doubleFixture({kind,invalidateAt});await f.run();assert.equal(f.calls.show,0);assert.equal(f.calls.reset,0);assert.equal(f.calls.extract,invalidateAt==='url'?0:1);});
 }
 await check('old focus double tap does not validate new source modules',async()=>{const f=doubleFixture({kind:'old'});await f.run();assert.equal(f.calls.validate,0);assert.equal(f.calls.extract,1);assert.equal(f.calls.show,1);});

 await check('landscape accepted owner keeps priority over terminal route',async()=>{const f=fixture();await f.run();assert.equal(f.calls.newRoute,1);assert.equal(f.calls.terminal,0);assert.equal(f.calls.zoom.length,1);});
 await check('terminal runs only after landscape miss and valid contour hit opens',async()=>{const f=fixture({useTerminal:true});await f.run();assert.equal(f.calls.newRoute,1);assert.equal(f.calls.terminal,1);assert.equal(f.calls.zoom[0],f.supported);assert.equal(f.calls.chrome,0);});
 for(const [name,options] of [['outside contour',{hit:false}],['invalid source',{valid:false}],['missing contours',{display:false}],['analysis error',{error:true}]])await check('terminal '+name+' remains miss',async()=>{const f=fixture({useTerminal:true,...options});await f.run();assert.equal(f.calls.zoom.length,0);assert.equal(f.calls.chrome,1);});
 for(const [name,during] of Object.entries(changes))await check('terminal '+name+' during await cannot zoom or toggle',async()=>{const f=fixture({useTerminal:true,during});await f.run();assert.equal(f.calls.terminal,1);assert.equal(f.calls.zoom.length,0);assert.equal(f.calls.chrome,0);});
 for(const [name,malform] of [['wrong type',p=>{p._geometryType='unrecognized';}],['wrong method',p=>{p._geometryType='terminal-context';p._structuralGridProof.method='unrecognized';}],['missing method',p=>{p._geometryType='terminal-context';delete p._structuralGridProof.method;}]])await check('actual173module '+name+' claim cannot fall through to rectangle',async()=>{const f=zoomFixture({kind:'terminal',actualTerminal:true,malform});await f.run();assert.equal(f.calls.draw,0);assert.equal(f.calls.spill,0);assert.equal(f.reader.focusMode,null);});

 for(const kind of ['old','host','landscape'])await check(kind+' nonmatching viewport fit leaves all source draws and display fields unchanged',async()=>{const a=zoomFixture({kind}),b=zoomFixture({kind,viewportHelper:true});await a.run();await b.run();assert.equal(JSON.stringify(a.reader.els.panelOverlay.style),JSON.stringify(b.reader.els.panelOverlay.style));assert.deepEqual(a.reader.els.panelOverlay.dataset,b.reader.els.panelOverlay.dataset);assert.deepEqual(a.calls.drawArgs.map(x=>x.slice(1)),b.calls.drawArgs.map(x=>x.slice(1)));});
 await check('terminal viewport fit magnifies whole unchanged mask inside measured controls',async()=>{const a=zoomFixture({kind:'terminal',tall:true}),b=zoomFixture({kind:'terminal',tall:true,viewportHelper:true});await a.run();await b.run();const o=b.reader.els.panelOverlay,scale=Number(o.style['--panel-scale']);assert(scale>1.08);assert.equal(o.dataset.sourceViewportFit,'true');assert.deepEqual(a.calls.drawArgs.map(x=>x.slice(1)),b.calls.drawArgs.map(x=>x.slice(1)));assert.equal(o.children[0].width,a.reader.els.panelOverlay.children[0].width);assert.equal(o.children[0].height,a.reader.els.panelOverlay.children[0].height);assert.equal(b.reader.panelFocusMeta.panel,b.panel);assert.equal(b.reader.panelFocusMeta.cropContours,b.panel._contours);const fit=b.helper.layout(b.reader,b.panel,b.rect,30,71.25),left=parseFloat(o.style.left)+parseFloat(o.style['--panel-dx']),top=parseFloat(o.style.top)+parseFloat(o.style['--panel-dy']);assert(left>=fit.left&&left+30*scale<=fit.right+1e-8&&top>=fit.top&&top+71.25*scale<=fit.bottom+1e-8);});
 for(const [name,target,event] of [['resize','win','resize'],['orientation','win','orientationchange'],['visual viewport','visual','resize'],['source reload','img','load'],['source error','img','error']])await check('actual fitted zoom '+name+' invalidation dismisses once and cleans listeners',async()=>{const f=zoomFixture({kind:'terminal',tall:true,viewportHelper:true});await f.run();(target==='visual'?f.win.visualViewport:f[target]).fire(event);assert.equal(f.calls.reset,1);assert.equal(f.reader.els.panelOverlay,null);assert.equal(f.win.count()+f.win.visualViewport.count()+f.img.count(),0);});
 await check('actual removePanelOverlay navigation cleanup prevents stale viewport callbacks',async()=>{const f=zoomFixture({kind:'terminal',tall:true,viewportHelper:true});await f.run();f.remove();assert.equal(f.win.count()+f.win.visualViewport.count()+f.img.count(),0);f.win.fire('resize');f.img.fire('load');assert.equal(f.calls.reset,0);});
 await check('only new fitted groups use nonovershooting animation easing',async()=>{const a=zoomFixture({kind:'old',viewportHelper:true}),b=zoomFixture({kind:'terminal',tall:true,viewportHelper:true});await a.run();await b.run();assert.equal(a.calls.animation.options.easing,'cubic-bezier(0.12,1.24,0.24,1)');assert.equal(b.calls.animation.options.easing,'cubic-bezier(0.2,0.8,0.2,1)');});

 await check('landscape accepted owner bypasses appearance and context routes',async()=>{const f=fixture();await f.run();assert.equal(f.calls.appearance,0);assert.equal(f.calls.terminal,0);assert.equal(f.calls.zoom.length,1);});
 await check('appearance final miss route wins before broad context fallback',async()=>{const f=fixture({useAppearance:true});await f.run();assert.equal(f.calls.newRoute,1);assert.equal(f.calls.appearance,1);assert.equal(f.calls.terminal,0);assert.equal(f.calls.zoom[0],f.supported);});
 await check('context fallback still runs when appearance abstains',async()=>{const f=fixture({useTerminal:true});await f.run();assert.equal(f.calls.appearance,1);assert.equal(f.calls.terminal,1);assert.equal(f.calls.zoom.length,1);});
 for(const [name,options] of [['outside contour',{hit:false}],['invalid source',{valid:false}],['missing contours',{display:false}],['analysis error',{error:true}]])await check('appearance '+name+' remains miss without context support',async()=>{const f=fixture({useAppearance:true,...options});await f.run();assert.equal(f.calls.zoom.length,0);assert.equal(f.calls.chrome,1);});
 for(const [name,during] of Object.entries(changes))await check('appearance '+name+' during await cannot zoom or toggle',async()=>{const f=fixture({useAppearance:true,during});await f.run();assert.equal(f.calls.appearance,1);assert.equal(f.calls.zoom.length,0);assert.equal(f.calls.chrome,0);});
 for(const [name,malform] of [['wrong type',p=>{p._geometryType='unrecognized';}],['wrong method',p=>{p._geometryType='terminal-appearance';p._structuralGridProof.method='unrecognized';}],['missing method',p=>{p._geometryType='terminal-appearance';delete p._structuralGridProof.method;}]])await check('actual174module '+name+' claim cannot fall through to rectangle',async()=>{const f=zoomFixture({kind:'appearance',actualAppearance:true,malform});await f.run();assert.equal(f.calls.draw,0);assert.equal(f.calls.spill,0);assert.equal(f.reader.focusMode,null);});
 await check('compact appearance owner keeps normal fit policy and full source mask',async()=>{const a=zoomFixture({kind:'appearance'}),b=zoomFixture({kind:'appearance',viewportHelper:true});await a.run();await b.run();assert.equal(b.reader.els.panelOverlay.dataset.sourceViewportFit,undefined);assert.equal(JSON.stringify(a.reader.els.panelOverlay.style),JSON.stringify(b.reader.els.panelOverlay.style));assert.deepEqual(a.calls.drawArgs.map(x=>x.slice(1)),b.calls.drawArgs.map(x=>x.slice(1)));assert.equal(b.reader.panelFocusMeta.panel,b.panel);});
 await check('available compact source outside tap suppresses broader context reopening',async()=>{const f=fixture({useTerminal:true,sourceAvailable:true});await f.run();assert.equal(f.calls.appearance,1);assert.equal(f.calls.terminal,0);assert.equal(f.calls.zoom.length,0);assert.equal(f.calls.chrome,1);});
 await check('absent compact source permits existing context fallback',async()=>{const f=fixture({useTerminal:true,sourceAvailable:false});await f.run();assert.equal(f.calls.terminal,1);assert.equal(f.calls.zoom.length,1);});
 await check('compact source inspection error fails closed before broader context',async()=>{const f=fixture({useTerminal:true,sourceInspectionError:true});await f.run();assert.equal(f.calls.terminal,0);assert.equal(f.calls.zoom.length,0);assert.equal(f.calls.chrome,1);});
 for(const [kind,methodName,typeName] of [['terminal','source-supported-terminal-context','terminal-context'],['appearance','source-context-seeded-terminal-appearance','terminal-appearance']]){
  for(const keep of ['method','type'])await check(kind+' malformed version reserved '+keep+' cannot evade explicit Reader guard',async()=>{const f=zoomFixture({kind,actualTerminal:kind==='terminal',actualAppearance:kind==='appearance',malform:p=>{p._structuralGridProof.version=-1;p._structuralGridProof.method=keep==='method'?methodName:'wrong';p._geometryType=keep==='type'?typeName:'wrong';}});await f.run();assert.equal(f.calls.draw,0);assert.equal(f.calls.spill,0);assert.equal(f.reader.focusMode,null);});
 }
 console.log(JSON.stringify({passed:checks.length,method:'actual Reader single-tap, zoom, double-tap methods; synthetic service mocks and actual tap lifecycle guards',checks},null,2));
})().catch(e=>{console.error(e);process.exitCode=1;});
