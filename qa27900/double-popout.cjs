'use strict';
// Exercise actual Reader handlers with controlled asynchronous bubble results.
// Pixel classification is covered separately by bubble-selection.cjs.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const plain=v=>JSON.parse(JSON.stringify(v));
const rect={left:20,top:30,width:600,height:900,right:620,bottom:930};
const overlayRect={left:100,top:200,width:400,height:300,right:500,bottom:500};
const image={naturalWidth:1200,naturalHeight:1800};
let requests=[],shown=[],rendered=[],extract=async()=>null;
function element(){return {style:{setProperty(){}},dataset:{},classList:{add(){},remove(){}},
 setAttribute(){},appendChild(c){c.parentNode=this;},remove(){this.parentNode=null;},
 getBoundingClientRect:()=>overlayRect,getContext:()=>({drawImage(){}}),animate:()=>({cancel(){}})};}
const ctx=vm.createContext({console,setTimeout,clearTimeout,requestAnimationFrame(){},
 localStorage:{getItem:()=>null},document:{createElement:element},
 BubbleDetect:{extract(...args){requests.push(args);return extract(...args);}}});
vm.runInContext(fs.readFileSync(require.resolve('../js/panels-geometry-orthogonal.js'),'utf8'),ctx);
vm.runInContext(fs.readFileSync(require.resolve('../js/reader.js'),'utf8'),ctx);
const r=vm.runInContext('Reader',ctx);
r.mode='single';r.scale=1;r.comic={id:'fixture'};r.index=0;r.bubbleAltZoomEnabled=true;
r.els={stage:{getBoundingClientRect:()=>rect,appendChild(n){n.parentNode=this;}},viewport:element()};
r.getPanelImageContext=()=>({img:image,rect});r.getPageUrl=async()=>`page-${r.index}`;
r.setFocusDim=()=>{};r.applyTransform=()=>{};
r.showBubbleOverlay=(bubble,stage,imageRect)=>{shown.push(bubble);rendered.push({stage,imageRect});r.bubbleOverlayActive=true;r.focusMode='bubble';r.els.bubbleOverlay=element();};
const frame={x:.2,y:.3,w:.6,h:.4,_quad:[{x:.2,y:.3},{x:.8,y:.3},{x:.8,y:.7},{x:.2,y:.7}]};
const flush=()=>new Promise(resolve=>setImmediate(resolve));
async function open(p=frame){r.resetZoom({animate:false});r.index=0;r.mode='single';await r.zoomToPanel(p,rect,rect);requests=[];shown=[];}
(async()=>{
 // Actual crop-to-page mapping and intentional caption focus, then dismissal.
 await open();extract=async()=>({caption:1});await r.handleDoubleTap({x:200,y:350});
 assert.ok(Math.abs(requests[0][1]-.35)<1e-9&&Math.abs(requests[0][2]-.5)<1e-9,'map enlarged frame coordinate back to source image');
 assert.equal(r.panelOverlayActive,false);assert.equal(r.focusMode,'bubble');assert.equal(shown.length,1);
 await r.handleDoubleTap({x:200,y:350});assert.equal(r.bubbleOverlayActive,false);assert.equal(r.focusMode,null);
 await open();extract=async()=>null;await r.handleDoubleTap({x:200,y:350});assert.equal(r.focusMode,null,'no caption dismisses the focused panel');

 // A slow result must not reopen a panel that was closed on the same page.
 await open();let finish;extract=()=>new Promise(resolve=>finish=resolve);
 const pending=r.handleDoubleTap({x:200,y:350});await flush();
 r.resetZoom({animate:false});finish({caption:'stale'});await pending;
 assert.equal(shown.length,0,'dismissed panel cannot be resurrected by a pending caption');

 // Newer gestures supersede older asynchronous requests in the same frame.
 await open();const finishes=[];extract=()=>new Promise(resolve=>finishes.push(resolve));
 const first=r.handleDoubleTap({x:200,y:350});await flush();
 const second=r.handleDoubleTap({x:300,y:350});await flush();
 finishes[1]({caption:'new'});await second;finishes[0]({caption:'old'});await first;
 assert.deepEqual(plain(shown),[{caption:'new'}],'only latest request may become focus owner');

 // A pending URL lookup is part of the same gesture, not permission to retarget.
 await open();let urlDone;const originalURL=r.getPageUrl;r.getPageUrl=()=>new Promise(resolve=>urlDone=resolve);
 extract=async()=>({caption:'late-url'});const loading=r.handleDoubleTap({x:200,y:350});
 r.resetZoom({animate:false});urlDone('page-0');await loading;r.getPageUrl=originalURL;
 assert.equal(requests.length,0,'closing before URL load must cancel bubble detection');

 // Both miss and exception branches of deferred double taps must obey navigation.
 for(const rejects of [false,true]){
  await open();r.resetZoom({animate:false});let resolve,reject,singles=0;
  const original=r.handleSingleTap;r.handleSingleTap=()=>{singles++;};
  r._deferredPanelTap={comicId:'fixture',pageIndex:0,pos:{x:200,y:350},promise:new Promise((a,b)=>{resolve=a;reject=b;})};
  const waiting=r.handleDeferredPanelDoubleTap({x:200,y:350});r.index=1;
  if(rejects)reject(Error('expected'));else resolve({bubble:null});await waiting;
  assert.equal(singles,0,'stale deferred miss/error cannot tap a different page');r.handleSingleTap=original;
 }

 // Opening a new frame supersedes an earlier deferred page-level request.
 await open();r.resetZoom({animate:false});let resolveDeferred;
 r._deferredPanelTap={comicId:'fixture',pageIndex:0,pos:{x:200,y:350},promise:new Promise(resolve=>resolveDeferred=resolve)};
 const deferred=r.handleDeferredPanelDoubleTap({x:200,y:350});
 await r.zoomToPanel(frame,rect,rect);resolveDeferred({bubble:{caption:'old-page-tap'},imgRect:rect});await deferred;
 assert.equal(shown.length,0,'opening a new frame cancels older deferred page bubble request');
 assert.equal(r.focusMode,'panel');assert.equal(r.panelOverlayActive,true);

 // Detection keeps its source point; placement follows the resized viewport.
 await open();let rotatedDone;extract=()=>new Promise(resolve=>rotatedDone=resolve);
 const rotating=r.handleDoubleTap({x:200,y:350});await flush();
 const rotated={left:0,top:0,width:900,height:600,right:900,bottom:600};
 r.getPanelImageContext=()=>({img:image,rect:rotated});r.els.stage.getBoundingClientRect=()=>rotated;
 rotatedDone({caption:'rotated'});await rotating;
 assert.equal(rendered.at(-1).stage,rotated);assert.equal(rendered.at(-1).imageRect,rotated);
 assert.ok(Math.abs(requests[0][1]-.35)<1e-9,'rotation does not remap original gesture onto a different source point');
 r.getPanelImageContext=()=>({img:image,rect});r.els.stage.getBoundingClientRect=()=>rect;

 // Use the rendered quad envelope, not an inconsistent legacy seed rectangle.
 await open({...frame,x:.1,y:.1,w:.8,h:.8});extract=async()=>({caption:'quad'});
 await r.handleDoubleTap({x:200,y:350});
 assert.ok(Math.abs(requests[0][1]-.35)<1e-9&&Math.abs(requests[0][2]-.5)<1e-9,'mapping follows actual canvas source crop');
 await open();extract=async()=>({caption:'outside'});await r.handleDoubleTap({x:50,y:350});
 assert.equal(requests.length,0,'outside gesture must not be clamped onto edge caption');
 assert.equal(r.focusMode,null,'outside double tap dismisses focused panel');
 // Concave overlap outlines: the missing corner is not a caption target.
 const concave={x:.2,y:.3,w:.6,h:.4,
  _overlapProof:{version:1,connected:true,method:'paired-edge-insets'},
  _outline:[{x:.2,y:.3},{x:.8,y:.3},{x:.8,y:.4},{x:.6,y:.4},{x:.6,y:.6},{x:.8,y:.6},{x:.8,y:.7},{x:.2,y:.7}]};
 await open(concave);assert.equal(r.els.panelOverlay.dataset.geometry,'outline');
 extract=async()=>({caption:'hidden neighbor'});await r.handleDoubleTap({x:450,y:350});
 assert.equal(requests.length,0,'transparent notch cannot target covered neighboring artwork');
 assert.equal(r.focusMode,null,'notch double tap dismisses the panel');
 await open(concave);extract=async()=>({caption:'visible'});await r.handleDoubleTap({x:200,y:350});
 assert.equal(shown.length,1,'visible area retains second-level caption behavior');
 assert.ok(Math.abs(requests[0][1]-.35)<1e-9&&Math.abs(requests[0][2]-.5)<1e-9,'concave crop maps to exact source point');
 console.log('Double pop-out: crop mapping, caption open/close, cancellation, request order, deferred navigation and outside taps passed');
})().catch(e=>{console.error(e);process.exitCode=1;});
