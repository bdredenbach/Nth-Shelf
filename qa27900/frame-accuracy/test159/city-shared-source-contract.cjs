'use strict';
// NOT RUN during preparation. Generated city geometry is explicit;96 geometry
// and both installed source/Reader adapters execute their bound production code.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {parentRoot,load,sha}=require('./city-source-loader.cjs');
const root=path.resolve(__dirname,'..');
const {realLoadReplacement}=require('./city-real-load-entry.cjs');
const {fixture}=require(path.join(parentRoot,'qa27900/frame-accuracy/test156/generated-articulated-fixture.cjs'));
assert.equal(process.argv.length,2,'All25 cases run; no case selector or external receipt path');
const rt=load({definitionOnly:true,cityGeometryStub:require('./city-generated-geometry.cjs'),observe96:true});
const {P,M,A,W,C,F,cv,calls}=rt,state=rt.read('CityFixture'),rows=[];
const rings=(x,y,w,h)=>[[{x,y},{x:x+w,y},{x:x+w,y:y+h},{x,y:y+h}]];
function prior(w,h){return [{kind:'generated-city-prior',x:0,y:0,w:1,h:.4,_contours:rings(0,0,1,.4),_structuralGridProof:{version:31,analysisWidth:w,analysisHeight:h}},
 {kind:'generated-city-prior',x:0,y:.4,w:1,h:.6,_contours:rings(0,.4,1,.6),_structuralGridProof:{version:31,analysisWidth:w,analysisHeight:h}}];}
async function image(bytes){const img=new cv.Image();img.src=bytes;await img.decode();const events=new Map();img.addEventListener=(name,fn)=>{const set=events.get(name)||new Set();set.add(fn);events.set(name,set);};img.removeEventListener=(name,fn)=>events.get(name)?.delete(fn);img.fire=name=>events.get(name)?.forEach(fn=>fn());return img;}
function reader(owners,img){const r={currentPanels:owners,img,comic:{id:'generated-shared-witness'},index:0,_panelLoadToken:1,panelOverlayToken:0,panelZoomEnabled:true,focusMode:null,
 getPanelImageContext(){return {img:this.img};},panelContours:p=>p?._contours,displayPanelContours:(p,c)=>c,
 pointInContours:(contours,x,y)=>(contours||[]).reduce((v,ring)=>v^+C.inside(ring,x,y),0),
 findPanelAt(x,y){return this.currentPanels.find(p=>this.pointInContours(this.displayPanelContours(p),x,y))||null;},
 async zoomToPanel(p){this.calls=(this.calls||[]).concat(p);this.panelOverlayToken++;this.before=this.displayPanelContours(p);if(this.hold)await new Promise(resolve=>this.release=resolve);this.after=this.displayPanelContours(p);return this.after;}};
 P.installReader(r);A.installReader(r);return r;}
async function check(name,fn){try{await fn();rows.push({name,passed:true});}catch(error){rows.push({name,passed:false,error:error.stack});throw error;}}
async function main(){
 const q=fixture(cv);assert.equal(sha(q.a),'4a8ac8932998bc1f9c1e886dab27193bba54f40aaca5bd4aaeff4866efe267be');
 const rimBytes=q.canvas.toBuffer('image/png'),rimImage=await image(rimBytes),rimPrior=F.analyzeRGBA(q.a,q.w,q.h,[]),rimDetector={detect:async()=>rimPrior};
 P.install(rimDetector);M.install(rimDetector);
 const white=cv.createCanvas(96,128),g=white.getContext('2d');g.fillStyle='#ffffff';g.fillRect(0,0,96,128);const cityBytes=white.toBuffer('image/png');
 async function city(bytes=cityBytes,w=96,h=128){const roots=prior(w,h),d={detect:async()=>roots};P.install(d);M.install(d);const owners=await d.detect(bytes),img=await image(bytes);return {roots,owners,img,r:reader(owners,img)};}
 async function rim(){const owners=await rimDetector.detect(rimBytes);assert.equal(owners.length,1);assert.equal(owners[0]._structuralGridProof.version,96);const mask=C.raster(owners[0]._contours,q.w,q.h),i=mask.findIndex(Boolean);assert(i>=0);return {owners,img:rimImage,point:[(i%q.w+.5)/q.w,((i/q.w|0)+.5)/q.h]};}
 function queryRim(f,expectedReplays){const before=calls.rimReplay||0,r=reader(f.owners,f.img);assert.equal(r.findPanelAt(...f.point),f.owners[0]);assert.equal((calls.rimReplay||0)-before,expectedReplays);return r;}
 function queryCity(f,expectedReplays){const before=state.replays;assert.equal(f.r.findPanelAt(.25,.2),f.owners[0]);assert.equal(f.r.findPanelAt(.75,.2),f.owners[2]);assert.equal(state.replays-before,expectedReplays);assert.equal(f.r.currentPanels[1],f.roots[1]);assert.equal(f.r.displayPanelContours(f.roots[0]),null);assert(!f.r.currentPanels.includes(f.roots[0]));return f.r;}
 await check('city-to96 eviction before first city query requires strict city replay',async()=>{const c=await city();await rim();queryCity(c,1);});
 await check('96-to-city eviction before first96 query requires exact96 replay',async()=>{const f=await rim();await city();queryRim(f,1);});
 await check('same raster city-to96 retains both private family records',async()=>{const c=await city(rimBytes,q.w,q.h),f=await rim();assert(M.takeIssued(c.r)?.privateDetectionHandoff);queryRim(f,0);});
 await check('same raster96-to-city retains both private family records',async()=>{const f=await rim(),c=await city(rimBytes,q.w,q.h);assert(M.takeIssued(c.r)?.privateDetectionHandoff);queryRim(f,0);});
 await check('failed city tentative capture preserves committed96',async()=>{const f=await rim();state.fail=true;try{const c=await city();assert.equal(c.owners,c.roots);}finally{state.fail=false;}queryRim(f,0);});
 await check('failed96 tentative source preserves committed city',async()=>{const c=await city(),out=await rimDetector.detect(cityBytes);assert.equal(out,rimPrior);assert(M.takeIssued(c.r)?.privateDetectionHandoff);});
 await check('public city construction cannot issue private source authority',async()=>{const c=await city(),children=M.supplementImage(c.img,c.roots),owners=M.integrate(c.roots,children);assert.equal(M.takeIssued(reader(owners,c.img)),null);});
 await check('one changed native byte rejects city issuance and replay',async()=>{const c=await city(),changed=cv.createCanvas(96,128);changed.getContext('2d').drawImage(c.img,0,0);changed.getContext('2d').fillStyle='#fefefe';changed.getContext('2d').fillRect(95,127,1,1);c.r.img=await image(changed.toBuffer('image/png'));assert.equal(M.takeIssued(c.r),null);assert.equal(c.r.findPanelAt(.25,.2),null);});
 for(const [name,mutate] of [
  ['owner-order',c=>c.owners.reverse()],['root-mutation',c=>c.owners[0].x+=.001],
  ['retained-court-mutation',c=>c.roots[1]._contours[0][0].x+=.001],['ancestor-mutation',c=>c.roots[0].x+=.001],
  ['map-replacement',c=>c.r.currentPanels=c.owners.slice()]
 ])await check('caller '+name+' cannot take installed city generation',async()=>{const c=await city();mutate(c);assert.equal(M.takeIssued(c.r),null);});
 for(const [name,mutate] of [
  ['navigation',c=>{c.r.index++;}],['close',c=>{c.r.panelOverlayToken++;}],
  ['load-replacement',c=>{c.r._panelLoadToken++;}],['image-replacement',async c=>{c.r.img=await image(cityBytes);}],
  ['source-load-event',c=>{c.img.fire('load');}],['owner-map-replacement',c=>{c.r.currentPanels=c.owners.slice();}]
 ])await check('pending retained court survives96 eviction only until '+name,async()=>{
  const c=await city();queryCity(c,0);c.r.hold=true;const pending=c.r.zoomToPanel(c.roots[1]);assert.equal(c.r.currentPanels,c.owners);
  await rim();await mutate(c);const live=c.r.currentPanels;c.r.release();await pending;
  assert.equal(c.r.after.length,0);assert.equal(c.r.currentPanels,live);assert(!c.r.currentPanels.includes(c.roots[0]));assert(!(c.r.displayPanelContours(c.roots[0])||[]).length);
 });
 for(const [name,mutate] of [['navigation',r=>r.index++],['close',r=>r.panelOverlayToken++],['map',r=>r.currentPanels=r.currentPanels.slice()],['image',async r=>r.img=await image(cityBytes)],['actual-load-entry',realLoadReplacement]])
  await check('pending96 after city eviction rejects '+name,async()=>{const f=await rim(),r=queryRim(f,0);r.hold=true;const pending=r.zoomToPanel(f.owners[0]);await city();await mutate(r);const current=r.currentPanels;r.release();await pending;assert.equal(r.after.length,0);assert.equal(r.currentPanels,current);});
 await check('provider capacity remains one committed plus one tentative, without larger caps',()=>{const a=new Uint8ClampedArray([1,2,3,255]),b=new Uint8ClampedArray([4,5,6,255]),t=W.token(a,1,1);assert(W.commit(t));const tentative=W.token(b,1,1);assert(W.matchesRetained(a,1,1,t));W.discard(tentative);assert(W.matchesRetained(a,1,1,t));const next=W.token(b,1,1);assert(W.commit(next));assert(!W.matchesRetained(a,1,1,t));});
 return {passed:true,accepted:false,geometryDoubles:['city source discovery and native construction only'],realProductionComponents:['96 geometry and private issuance','city installed partition and Reader','common raster witness','source identity and pending scope guard'],
  qualification:'Generated combined-family prerequisite only. No original city geometry, original retained court crop, trusted browser input or production acceptance.',
  manifestSha256:rt.manifestSha256,loadedSources:rt.loadedSources,sourceHash:sha(q.a),results:rows,
  harnessSha256:sha(fs.readFileSync(__filename)),geometryStubSha256:sha(fs.readFileSync(require.resolve('./city-generated-geometry.cjs'))),resourceUsage:process.resourceUsage()};
}
main().then(report=>{assert.equal(rows.length,25);console.log(JSON.stringify(report,null,2));}).catch(error=>{console.error(JSON.stringify({passed:false,accepted:false,results:rows,error:error.stack,manifestSha256:rt.manifestSha256},null,2));process.exitCode=1;});
