'use strict';
// Public generated artwork only. Real source certificates, Reader, clipping,
// taps and zoom; no stored private proof, image, audit or crop is loaded.
const assert=require('node:assert/strict'),{performance}=require('node:perf_hooks');
const H=require('./reader-edge-rail-contract.cjs');
const copy=x=>JSON.parse(JSON.stringify(x));
async function run(){
 const source=H.resolveSource(),api=H.setup(source),M=api.PanelPageEdgeRailCell,f=H.fixtures.makeProductionFixture(),{w,h,rgba}=f;
 const scale=900/Math.max(w,h),pw=Math.round(w*scale),ph=Math.round(h*scale),prior=api.PanelHighContrastEnclosures.analyzeRGBA(api.PanelMatteCells.sampleBilinearRGBA(rgba,w,h,pw,ph),pw,ph,[]);
 assert.equal(prior.length,1);assert.equal(prior[0]._structuralGridProof.mode,'empty-enclosure');
 const panels=M.analyzeRGBA(rgba,w,h,prior),child=panels[0];assert.equal(panels.length,1);assert(M.validPanel(child));
 const original=JSON.stringify(panels),img=H.sourceImage(f);await img.decode();
 const state=H.configureReader(api,img,panels,f),r=state.reader,mask=H.ownershipMask(M,child,w,h),i=mask.findIndex(Boolean),point=[(i%w+.5)/w,(Math.floor(i/w)+.5)/h];
 let canvases=0;async function zoom(p){r.resetZoom({animate:false});await r.zoomToPanel(p,state.stageRect,state.imgRect);const c=r.els.panelOverlay?.children[0];if(c){assert(r.panelOverlayActive);assert(r.els.focusDim.classList.contains('active'));canvases++;return H.hash(c.toBuffer('image/png'));}assert(!r.panelOverlayActive);return null;}
 let start=performance.now();assert(r.findPanelAt(...point)===child);const coldMs=performance.now()-start,childHash=await zoom(child),created=api.counters.canvases;
 start=performance.now();for(let k=0;k<10000;k++)assert(r.findPanelAt(...point)===child);const cachedMs=performance.now()-start;assert.equal(api.counters.canvases,created,'Cached taps do not draw or reread source pixels.');
 r.currentPanels=prior;const acceptedHash=await zoom(prior[0]),acceptedDisplay=JSON.stringify(r.displayPanelContours(prior[0]));
 const failures=[];
 for(const [name,mutate] of [
  ['witness-ink',p=>p._structuralGridProof.witnesses[0].ink[0]++],
  ['missing-witness',p=>delete p._structuralGridProof.witnesses],
  ['missing-proof',p=>delete p._structuralGridProof],
  ['box',p=>p.w+=.015],
  ['contour',p=>p._contours[0][0].x+=.01],
  ['version-marker',p=>p._structuralGridProof.version++],
  ['method-marker',p=>p._structuralGridProof.method='invalid'],
  ['geometry-marker',p=>p._geometryType='invalid'],
  ['quad-fallback',p=>p._quad=[{x:0,y:0},{x:1,y:0},{x:1,y:1},{x:0,y:1}]],
 ]){
  const bad=copy(child);mutate(bad);r.currentPanels=[bad];assert(r.findPanelAt(...point)===null,name+' tap');assert.equal(r.displayPanelContours(bad).length,0,name+' display');assert.equal(await zoom(bad),null,name+' zoom');
  const owners=prior.concat(bad);r.currentPanels=owners;assert.equal(await zoom(prior[0]),acceptedHash,name+' accepted canvas');assert.equal(JSON.stringify(r.displayPanelContours(prior[0])),acceptedDisplay,name+' accepted contours');assert.equal(r.currentPanels,owners,name+' ownership restored');failures.push(name);
 }
 r.currentPanels=[child];assert.equal(await zoom(child),childHash);
 const extra=copy(child);extra.w+=.01;r.currentPanels=[extra,child];assert(r.findPanelAt(...point)===child,'An invalid extra child cannot steal or hide the valid owner.');assert.equal(await zoom(child),childHash);assert.equal(await zoom(extra),null);r.currentPanels=[child];
 const originalWidth=child.w;child.w+=.01;assert(r.findPanelAt(...point)===null,'In-place cached child mutation blocked.');assert.equal(await zoom(child),null);child.w=originalWidth;assert.equal(await zoom(child),childHash,'Repaired descriptor revalidated.');
 const owners=[child];r.currentPanels=owners;assert(r.findPanelAt(...point)===child);owners.push(prior[0]);assert.equal(await zoom(child),null,'In-place extra owner invalidates child.');assert.equal(await zoom(prior[0]),acceptedHash);owners.pop();assert.equal(await zoom(child),childHash);
 const offMap=copy(child);assert.equal(await zoom(offMap),null,'A valid off-map descriptor has no zoom ownership.');
 owners[0]=copy(child);owners[0].x+=.01;assert(r.findPanelAt(...point)===null,'Same-array child replacement invalidates cache.');owners[0]=child;assert.equal(await zoom(child),childHash);
 // A changed decoded image, including reuse of the same image object, must
 // replay its actual source evidence before any stored owner becomes usable.
 const changed=H.fixtures.makeProductionFixture({matte:'#a14bdd'}),other=H.sourceImage(changed);await other.decode();
 r.getPanelImageContext=()=>({img:other,rect:state.imgRect});assert(r.findPanelAt(...point)===null);assert.equal(await zoom(child),null);assert.equal(M.sourceMatches(other,child),false);
 r.getPanelImageContext=()=>({img,rect:state.imgRect});assert.equal(await zoom(child),childHash);
 img.src=changed.canvas.toBuffer('image/png');await img.decode();assert(r.findPanelAt(...point)===null,'Same image object, changed src must reject.');assert.equal(await zoom(child),null);
 img.src=f.canvas.toBuffer('image/png');await img.decode();assert.equal(await zoom(child),childHash);
 const unavailable=[undefined,{}, {naturalWidth:w,naturalHeight:h,complete:false}, {naturalWidth:w,naturalHeight:h,complete:true}, {naturalWidth:0,naturalHeight:0,complete:true}];
 for(const unavailableImage of unavailable){r.getPanelImageContext=()=>({img:unavailableImage,rect:state.imgRect});assert(r.findPanelAt(...point)===null);assert.equal(r.displayPanelContours(child).length,0);assert.equal(await zoom(child),null);}
 r.getPanelImageContext=()=>{throw Error('Source context unavailable');};assert(r.findPanelAt(...point)===null);assert.equal(await zoom(child),null);
 r.getPanelImageContext=()=>({img,rect:state.imgRect});r.currentPanels=[child];assert.equal(await zoom(child),childHash,'Source reentry restores byte-identical canvas.');
 r.resetZoom({animate:false});r.currentPanels=prior.concat(extra);const pending=r.zoomToPanel(prior[0],state.stageRect,state.imgRect),newPage=[];r.currentPanels=newPage;await pending;assert.equal(r.currentPanels,newPage,'Completing old zoom must not restore a superseded owner list.');
 // A new load event may change pixels even if the URL and dimensions stay the
 // same. The real image event invalidates the cached source certification.
 let load;img.addEventListener=(name,fn)=>{if(name==='load')load=fn;};const fresh=H.setup(source),restored=copy(child),next=H.configureReader(fresh,img,[restored],f),rr=next.reader;
 assert(rr.findPanelAt(...point)===restored);assert.equal(typeof load,'function');const before=fresh.counters.canvases;load();assert(rr.findPanelAt(...point)===restored);assert(fresh.counters.canvases>before,'Load event causes fresh source replay.');
 assert.equal(JSON.stringify(panels),original,'Discovery is unchanged.');
 return{passed:true,syntheticOnly:true,genuineParent:true,realReaderCanvas:true,candidateSha256:source.candidateSha256,corruptions:failures,acceptedContextPreserved:true,changedSourceObjectRejected:true,sameImageChangedSourceRejected:true,unavailableSourceCases:unavailable.length+1,ownerArrayMutationRejected:true,offMapZoomRejected:true,loadEventInvalidatesCache:true,navigationDuringZoomPreserved:true,reentryCanvasByteIdentical:true,canvases,childPngSha256:childHash,acceptedPngSha256:acceptedHash,coldSourceValidationMs:Math.round(coldMs),cachedTapCalls:10000,cachedTapMs:Math.round(cachedMs),cachedTapSourceReads:0,phoneTest:false};
}
module.exports={run};
if(require.main===module){const alive=setInterval(()=>{},1000);run().then(result=>console.log(JSON.stringify(result,null,2))).catch(error=>{console.error(error.stack||error);process.exitCode=1;}).finally(()=>clearInterval(alive));}
