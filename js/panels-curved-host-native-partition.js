/* Staged native source proof. The old canonical model supplies discovery only;
 * its former masks are never used as the final city or inset geometry. */
const PanelCurvedHostNativePartition=(()=>{
'use strict';
const Seed=PanelCurvedHostPartition,Native=PanelCurvedHostNative,P=PanelArticulatedRimCell;
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const Construction=Native.proofRecords.createInstalledEngine({eligible:Seed.eligible,sourceOwners:Seed.sourceOwners,discover:Seed.discover,captionEvidence:Seed.captionEvidence,captionSeeds:PanelGradientInsetPair.captionSeeds,raster:PanelCropRepair.raster,assemble:Native.assemble,extent:PanelSharedRimPair.extent,trace:PanelMatteCells.tracePixelContours});
const Engine=Construction.engine;
function claims(p){return p?._structuralGridProof?.version===Engine.VERSION||p?._structuralGridProof?.method===Engine.METHOD||p?._geometryType==='native-curved-host-complementary-single';}
function readWindows(img,W,H){return box=>{let c;try{if(!P.sourceReady(img)||(img.naturalWidth||img.width)!==W||(img.naturalHeight||img.height)!==H)return null;const[x,y,X,Y]=box;if(!box.every(Number.isSafeInteger)||x<0||y<0||X>W||Y>H||X<=x||Y<=y||(X-x)*(Y-y)>1000000)return null;c=document.createElement('canvas');c.width=X-x;c.height=Y-y;const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,x,y,X-x,Y-y,0,0,X-x,Y-y);return ctx.getImageData(0,0,X-x,Y-y).data;}finally{if(c)c.width=c.height=1;}};}
function supplementImage(img,prior){try{if(!Seed.eligible(prior)||!P.sourceReady(img))return[];const before=P.sourceState(img),snapshot=JSON.stringify(prior),v=prior[0]._structuralGridProof,W=img.naturalWidth||img.width,H=img.naturalHeight||img.height,a=PanelGradientInsetPair.imageRaster(img,v.analysisWidth,v.analysisHeight);if(!a)return[];const children=Engine.prepare(a,v.analysisWidth,v.analysisHeight,prior,W,H,readWindows(img,W,H));return same(before,P.sourceState(img))&&snapshot===JSON.stringify(prior)?children:[];}catch(_){return[];}}
function replayImage(img,children,prior){try{if(!P.sourceReady(img)||!Engine.validPreparedPair(children,prior))return false;const before=P.sourceState(img),v=children[0]._structuralGridProof,W=img.naturalWidth||img.width,H=img.naturalHeight||img.height,a=PanelGradientInsetPair.imageRaster(img,v.analysisWidth,v.analysisHeight);return!!a&&Engine.replayPrepared(a,v.analysisWidth,v.analysisHeight,W,H,readWindows(img,W,H),children,prior)&&same(before,P.sourceState(img));}catch(_){return false;}}
function integrate(prior,children){if(!Engine.validPreparedPair(children,prior))return prior;const index=children[0]._structuralGridProof.geometry.retiredIndex;return prior.map((p,k)=>k===index?children[0]:p).concat(children[1]);}
// A single installed-detector generation may hand its exact source result to
// the Reader. Public supplement/replay helpers never issue this record. The
// shared provider retains the only native raster; this family keeps no pixels.
const G=P.readerScopeGuard;
let issuedGeneration=null;
function itemsEqual(a,b){return Array.isArray(a)&&Array.isArray(b)&&a.length===b.length&&a.every((p,i)=>p===b[i]&&Object.hasOwn(a,i)&&Object.hasOwn(b,i));}
function generationCurrent(s){return !!s&&issuedGeneration===s&&itemsEqual(s.owners,s.items)&&itemsEqual(s.prior,s.priorItems)&&G.unchanged(s.input,s.owners)&&G.unchanged(s.priorInput,s.prior);}
function captureNative(img,run){let canvas;try{
 const source=P.sourceState(img),W=img?.naturalWidth||img?.width,H=img?.naturalHeight||img?.height;
 if(!P.sourceReady(img)||!Number.isSafeInteger(W)||!Number.isSafeInteger(H)||W<=0||H<=0||W*H*4>32*1024*1024)return null;
 const stable=()=>P.sourceReady(img)&&itemsEqual(source,P.sourceState(img));
 canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;const context=canvas.getContext('2d',{willReadFrequently:true});if(!context)return null;context.drawImage(img,0,0);const rgba=context.getImageData(0,0,W,H).data;if(!stable())return null;const result=run(rgba,W,H,stable);return stable()?result:null;
 }catch(_){return null;}finally{if(canvas)canvas.width=canvas.height=1;}}
function contourProjection(p){
 let points=0;if(!Array.isArray(p._contours)||!p._contours.length||p._contours.length>64)return null;
 for(const ring of p._contours){if(!Array.isArray(ring)||ring.length<4||ring.length>4096)return null;points+=ring.length;if(points>32768)return null;for(const q of ring)if(!q||!Number.isFinite(q.x)||!Number.isFinite(q.y)||q.x<0||q.x>1||q.y<0||q.y>1)return null;}
 // Geometry only. The exact live proof remains bound by input identity; no
 // second serialized ancestry/source-window graph is retained here.
 return G.canonical({x:p.x,y:p.y,w:p.w,h:p.h,_contours:p._contours});
}
function issuedImage(img,prior){let token=null;try{
 const source=P.sourceState(img),priorInput=G.identity(prior),priorItems=prior.slice();
 if(!priorInput||!P.sourceReady(img))return prior;
 const stable=()=>P.sourceReady(img)&&itemsEqual(source,P.sourceState(img))&&itemsEqual(prior,priorItems)&&G.unchanged(priorInput,prior);
 token=captureNative(img,(rgba,W,H)=>PanelRasterWitness.token(rgba,W,H));
 // Source checks, discovery, native assembly and contour construction execute
 // inside this private capability. No public proposal is promoted by identity.
 if(!Seed.eligible(prior))return prior;
 const v=prior[0]._structuralGridProof,W=img.naturalWidth||img.width,H=img.naturalHeight||img.height;
 const a=PanelGradientInsetPair.imageRaster(img,v.analysisWidth,v.analysisHeight);
 if(!a||!stable())return prior;
 const built=Construction.prepareInstalled(a,v.analysisWidth,v.analysisHeight,prior,W,H,readWindows(img,W,H));
 if(!built||!stable())return prior;
 const children=built.children,index=built.retiredIndex;
 if(!Number.isSafeInteger(index)||index<0||index>=prior.length)return prior;
 const owners=prior.map((p,k)=>k===index?children[0]:p).concat(children[1]);
 const canonical=children.map(contourProjection),input=G.identity(owners);
 if(!token||!input||canonical.some(p=>!p))return owners;
 const plan={owners,items:owners.slice(),input,prior,priorItems,priorInput,children:children.slice(),canonical:Object.freeze(canonical),token,consumed:false};
 const exact=()=>stable()&&itemsEqual(owners,plan.items)&&G.unchanged(input,owners);
 const complete=captureNative(img,(rgba,W,H,live)=>{if(!exact()||!live()||!PanelRasterWitness.matches(rgba,W,H,token)||!exact()||!PanelRasterWitness.commit(token)||!PanelRasterWitness.matchesRetained(rgba,W,H,token)||!exact())return false;plan.W=W;plan.H=H;return true;});
 if(complete&&exact())issuedGeneration=plan;
 return owners;
 }catch(_){return prior;}finally{if(token)try{PanelRasterWitness.discard(token);}catch(_){}}}
function takeIssued(reader){
 const s=issuedGeneration,owners=reader.currentPanels;if(!s||s.consumed||owners!==s.owners||!generationCurrent(s))return null;
 let img;try{img=reader.getPanelImageContext?.()?.img;}catch(_){return null;}
 const source=P.sourceState(img),comic=reader.comic,index=reader.index,loadToken=reader._panelLoadToken;
 const current=(r,scoped=false)=>r===reader&&(scoped||r.currentPanels===owners)&&r.comic===comic&&r.index===index&&r._panelLoadToken===loadToken&&r.getPanelImageContext?.()?.img===img&&P.sourceReady(img)&&itemsEqual(source,P.sourceState(img))&&generationCurrent(s);
 // An attempted real admission consumes this generation's handoff. Copies,
 // later image/map replacements and navigated contexts must replay normally.
 s.consumed=true;
 const verified=captureNative(img,(rgba,W,H,stable)=>W===s.W&&H===s.H&&current(reader)&&stable()&&PanelRasterWitness.matchesRetained(rgba,W,H,s.token)&&current(reader));
 if(!verified||!current(reader))return null;
 return Object.freeze({prior:s.prior,canonical:s.canonical,current,sourceWidth:s.W,sourceHeight:s.H,privateDetectionHandoff:true});
}
function issuedPanel(p){const s=issuedGeneration;return generationCurrent(s)&&s.children.includes(p);}
function validPanel(p){return issuedPanel(p)||Engine.validPreparedPanel(p);}
function install(detector){
 if(typeof PanelStructuralGrid!=='undefined'&&!PanelStructuralGrid._nativeCurvedHost){const old=PanelStructuralGrid.validPanel;PanelStructuralGrid.validPanel=p=>claims(p)?validPanel(p):old(p);PanelStructuralGrid._nativeCurvedHost=true;}
 if(typeof PanelGeometry!=='undefined'&&!PanelGeometry._nativeCurvedHost){const old=PanelGeometry.refine;PanelGeometry.refine=async function(url,p,log){return claims(p)?validPanel(p)?{...p}:null:old.call(this,url,p,log);};PanelGeometry._nativeCurvedHost=true;}
 if(typeof PanelEdgeSpill!=='undefined'&&!PanelEdgeSpill._nativeCurvedHost){for(const name of['analyzeImage','analyzeRGBA']){const old=PanelEdgeSpill[name];if(old)PanelEdgeSpill[name]=function(...args){return claims(args[name==='analyzeImage'?1:3])?null:old.apply(this,args);};}PanelEdgeSpill._nativeCurvedHost=true;}
 if(!detector||detector._nativeCurvedHost)return;const old=detector.detect;detector.detect=async function(url,log){const prior=await old.call(this,url,log);if(!Seed.eligible(prior))return prior;try{const img=new Image();img.src=url;await img.decode();return issuedImage(img,prior);}catch(e){log?.('Native curved owner deferred: '+e.message);return prior;}};detector._nativeCurvedHost=true;
}
return{VERSION:Engine.VERSION,METHOD:Engine.METHOD,eligible:Seed.eligible,claims,validPanel,takeIssued,pairValid:Engine.validPreparedPair,integrate,supplementImage,replayImage,install,engine:Engine,scope:'staged source and Reader admission; independent visual ownership review remains required'};
})();
if(typeof module!=='undefined')module.exports=PanelCurvedHostNativePartition;
