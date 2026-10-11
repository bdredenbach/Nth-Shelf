'use strict';
const assert=require('node:assert/strict'),v8=require('node:v8');
const {load,cv,sha,fixture}=require('./fresh-reuse-loader.cjs');
const SOURCE='4a8ac8932998bc1f9c1e886dab27193bba54f40aaca5bd4aaeff4866efe267be',GRAPH='e4ef60678ddc0aa8673e169a901c30f5e9abb6871aefbbc5441deddb66cdb192';
const family=process.argv[2];assert.equal(process.argv.length,3);assert(['maps','evidence','lifecycle','public','weak-missing','weak-collected','allocation96','allocation100','analyzer100'].includes(family));assert(v8.getHeapStatistics().heap_size_limit<=512*1024*1024);
const rows=[],progress=name=>console.error(JSON.stringify({utc:new Date().toISOString(),family,name}));
function row(name,extra={}){rows.push({name,passed:true,...extra});progress(name);}
const options={holdImages:family!=='weak-collected',weakRefMissing:family==='weak-missing',failCopy:family==='allocation96'?96:family==='allocation100'?100:null,failAnalyzer:family==='analyzer100'?100:null};
const rt=load('candidate',options),{P,U,M,F,C,control,calls}=rt,q=fixture(cv),bytes=q.canvas.toBuffer('image/png');assert.equal(sha(q.a),SOURCE);const ancestor=F.analyzeRGBA(q.a,q.w,q.h,[]),ancestorDescriptors=Object.getOwnPropertyDescriptors(ancestor[0]);
let base=async()=>ancestor;const stages={},d={detect:(...args)=>base(...args)};
for(const [version,module] of [[96,P],[100,U],[103,M]]){module.install(d);const wrapped=d.detect;d.detect=async function(...args){const owners=await wrapped.apply(this,args);stages[version]=owners;return owners;};}
function evidence(owners){const text=JSON.stringify(owners);return{graphSha256:sha(text),contoursSha256:sha(JSON.stringify(owners.map(p=>p._contours))),masksSha256:owners.map(p=>sha(C.raster(p._contours,q.w,q.h))),sourceSha256:sha(q.a),ownerVersions:owners.map(p=>p._structuralGridProof.version)};}
async function detect({full=true}={}){const result=await d.detect(bytes);assert.deepEqual(Object.getOwnPropertyDescriptors(ancestor[0]),ancestorDescriptors,'No caller-root freeze or mutation');if(full){assert.deepEqual(result.map(p=>p._structuralGridProof.version),[96,100,103]);assert.equal(sha(JSON.stringify(result)),GRAPH);}return result;}
function args(version,owners=stages[version]){const img=control.images[version];assert(img,'Diagnostic issuing image retained for '+version);const proof=owners[version===96?0:1]._structuralGridProof,a=rt.matte.sampleBilinearRGBA(q.a,q.w,q.h,proof.analysisWidth,proof.analysisHeight);return[img,q.a,q.w,q.h,a,proof.analysisWidth,proof.analysisHeight,owners];}
function match(version,a){return(version===96?P:U).matchesDetectedAnalysis(...a);}
function counts(){return Object.fromEntries([66,96,100,103].map(v=>[v,calls[v+'.analyzeRGBA']||0]));}
function delta(before){return Object.fromEntries([66,96,100,103].map(v=>[v,(calls[v+'.analyzeRGBA']||0)-(before[v]||0)]));}
function ordinaryHits(){assert.equal(calls['96.hit'],1);assert.equal(calls['100.hit'],1);assert.deepEqual(counts(),{66:2,96:1,100:1,103:1});}
async function main(){
 let owners=await detect({full:family!=='analyzer100'});const initial=evidence(owners);
 if(!['weak-missing','weak-collected','allocation96','allocation100','analyzer100'].includes(family))ordinaryHits();
 if(family==='maps'){
  const map=stages[100],original=map.slice(),descriptors=Object.getOwnPropertyDescriptors(map),prototype=Object.getPrototypeOf(map),a=args(100,map);assert.equal(match(100,a),true);
  function mutation(name,change,restore){change();try{assert.equal(match(100,a),false,name);}finally{restore();}assert.equal(match(100,a),true,name+' restores exact ordinary pair');row(name,{synthetic:true});}
  for(const index of [0,1]){let getterCalls=0;mutation('own accessor '+index,()=>Object.defineProperty(map,String(index),{configurable:true,enumerable:true,get(){getterCalls++;if(index===0&&getterCalls===2)map[1]={...original[1]};return original[index];}}),()=>{Object.defineProperties(map,descriptors);});assert.equal(getterCalls,0,'Descriptor matcher must not execute the accessor');}
  mutation('throwing accessor',()=>Object.defineProperty(map,'0',{configurable:true,enumerable:true,get(){throw Error('Getter must not execute');}}),()=>Object.defineProperties(map,descriptors));
  mutation('extra map metadata',()=>{map.syntheticMetadata=true;},()=>{delete map.syntheticMetadata;});
  mutation('changed map prototype',()=>Object.setPrototypeOf(map,Object.create(Array.prototype)),()=>Object.setPrototypeOf(map,prototype));
  mutation('non-enumerable member',()=>Object.defineProperty(map,'1',{...descriptors[1],enumerable:false}),()=>Object.defineProperties(map,descriptors));
  mutation('member replacement',()=>{map[1]={...original[1]};},()=>Object.defineProperties(map,descriptors));
  mutation('owner order replacement',()=>map.reverse(),()=>Object.defineProperties(map,descriptors));
  mutation('missing owner',()=>map.pop(),()=>Object.defineProperties(map,descriptors));
  assert.equal(match(100,[...a.slice(0,7),map.slice()]),false);assert.equal(match(96,[...args(96).slice(0,7),stages[96].slice()]),false);row('copied exact owner arrays miss',{synthetic:true});
  assert.equal(sha(JSON.stringify(owners)),GRAPH);assert.deepEqual(Object.getOwnPropertyDescriptors(map),descriptors);row('ordinary pair and complete graph preserved');
 }else if(family==='evidence'){
  for(const version of [96,100]){const a=args(version);assert.equal(match(version,a),true);const changedAnalysis=a.slice();changedAnalysis[4]=new Uint8ClampedArray(a[4]);changedAnalysis[4][0]^=1;assert.equal(match(version,changedAnalysis),false);const changedNative=a.slice();changedNative[1]=new Uint8ClampedArray(a[1]);changedNative[1][0]^=1;assert.equal(match(version,changedNative),false);for(const index of [2,3,5,6]){const altered=a.slice();altered[index]++;assert.equal(match(version,altered),false);}row(version+' native/analysis bytes and dimensions are independent');}
  const sampler=rt.matte.sampleBilinearRGBA,a96=args(96),a100=args(100);rt.matte.sampleBilinearRGBA=(...a)=>sampler(...a);try{assert.equal(match(96,a96),false);assert.equal(match(100,a100),false);}finally{rt.matte.sampleBilinearRGBA=sampler;}
  for(const replacement of [undefined,Object.freeze({...rt.provider})]){rt.setWitness(replacement);try{assert.equal(match(96,a96),false);assert.equal(match(100,a100),false);}finally{rt.setWitness(rt.provider);}}row('sampler and native provider replacement miss');
  for(const version of [96,100]){const a=args(version),img=a[0],descriptor=Object.getOwnPropertyDescriptor(img,'complete');Object.defineProperty(img,'complete',{configurable:true,value:false});try{assert.equal(match(version,a),false);}finally{if(descriptor)Object.defineProperty(img,'complete',descriptor);else delete img.complete;}assert.equal(match(version,a),true);control.emit(img,version===96?'load':'error');assert.equal(match(version,a),false);row(version+' readiness and same-source event epoch invalidate',{syntheticImageEvents:true});}
 }else if(family==='lifecycle'){
  {const a96=args(96),a100=args(100);base=async()=>[];assert.deepEqual(await detect({full:false}),[]);assert.equal(match(96,a96),false);assert.equal(match(100,a100),false);row('empty new generation clears old records');}
  base=async()=>ancestor;owners=await detect();
  {const a96=args(96),a100=args(100);base=async()=>{throw Error('Synthetic predecessor failure');};await assert.rejects(d.detect(bytes),/Synthetic predecessor failure/);assert.equal(match(96,a96),false);assert.equal(match(100,a100),false);row('failed new generation clears old records');}
  const deferred=[];base=()=>new Promise(resolve=>deferred.push(resolve));const older=d.detect(bytes),newer=d.detect(bytes);assert.equal(deferred.length,2);deferred[1](ancestor);const latest=await newer;assert.equal(sha(JSON.stringify(latest)),GRAPH);const retained=control.retentions.length,latestImages={...control.images};deferred[0](ancestor);const stale=await older;assert.equal(sha(JSON.stringify(stale)),GRAPH);assert.equal(control.retentions.length,retained,'Stale completions cannot retain analysis evidence');assert.equal(control.images[96],latestImages[96]);assert.equal(control.images[100],latestImages[100]);assert.equal(match(96,args(96,stages[96])),false);assert.equal(match(100,args(100,stages[100])),false);row('older predecessor settles after newer generation without reissuance');
  owners=stale;
 }else if(family==='public'){
  const proof=owners[0]._structuralGridProof,w=proof.analysisWidth,h=proof.analysisHeight,a=rt.matte.sampleBilinearRGBA(q.a,q.w,q.h,w,h),public96=P.analyzeRGBA(a,w,h,ancestor,true);assert.equal(JSON.stringify(public96),JSON.stringify([owners[0]]));assert.equal(match(96,[...args(96).slice(0,7),public96]),false);row('public96 results cannot issue');
  for(const [version,module,prior,child] of [[100,U,[owners[0]],owners[1]],[103,M,owners.slice(0,2),owners[2]]])for(const extra of [true,false]){const before=counts(),result=module.analyzeRGBA(a,w,h,prior,extra),used=delta(before);assert.equal(JSON.stringify(result),JSON.stringify([child]));assert(used[96]>=1&&used[66]>=1,'Public API must replay predecessors');row(version+' public analyzer extra '+extra,{analyzerDelta:used});}
  const white=new Uint8ClampedArray(a.length);white.fill(255);for(const [version,module,child,prior] of [[96,P,owners[0],ancestor],[100,U,owners[1],[owners[0]]],[103,M,owners[2],owners.slice(0,2)]]){const before=counts();assert.equal(module.sourceReplay(child,white,w,h,prior),false);const used=delta(before);assert(used[version]>=1);row(version+' public sourceReplay decides changed source',{analyzerDelta:used});}
  const image=control.images[96],before=counts(),publicImage=P.replaceImage(image,ancestor);assert.equal(JSON.stringify(publicImage),JSON.stringify([owners[0]]));assert(delta(before)[66]>=1);assert.equal(match(96,[...args(96).slice(0,7),publicImage]),false);row('public image helper cannot issue');
 }else if(family==='weak-missing'){
  assert.equal(control.retentions.length,0);assert.equal(calls['96.hit']||0,0);assert.equal(calls['100.hit']||0,0);assert.deepEqual(counts(),{66:4,96:3,100:2,103:1});row('WeakRef missing preserves complete replay and graph');
 }else if(family==='weak-collected'){
  assert.equal(typeof global.gc,'function','Run with --expose-gc');assert.equal(control.lastImage,null);assert.deepEqual(control.images,{});assert(control.imageRefs[96]&&control.imageRefs[100]);let collected=[];
  for(let attempt=0;attempt<24;attempt++){await new Promise(resolve=>setImmediate(resolve));global.gc();await new Promise(resolve=>setImmediate(resolve));collected=[96,100].filter(v=>control.imageRefs[v].deref()===undefined);if(collected.length===2)break;}
  if(collected.length!==2){console.log(JSON.stringify({passed:false,status:'INCONCLUSIVE_REFERENT_NOT_COLLECTED',family,collected,attempts:24,browserTimingClaim:false,resourceUsage:process.resourceUsage()},null,2));process.exitCode=2;return;}
  const image=new cv.Image();image.src=bytes;await image.decode();for(const version of [96,100]){const map=stages[version],v=map[version===96?0:1]._structuralGridProof,a=rt.matte.sampleBilinearRGBA(q.a,q.w,q.h,v.analysisWidth,v.analysisHeight);assert.equal(match(version,[image,q.a,q.w,q.h,a,v.analysisWidth,v.analysisHeight,map]),false);}row('actually collected issuing Images miss',{collected,syntheticGcEnvironment:true});
 }else if(family.startsWith('allocation')){
  const version=Number(family.slice('allocation'.length));assert.deepEqual(control.copyFaults,[version]);assert(!control.retentions.includes(version));assert.equal(calls['96.hit']||0,0);assert.equal(calls['100.hit']||0,version===96?1:0);assert.deepEqual(counts(),version===96?{66:3,96:2,100:1,103:1}:{66:4,96:3,100:2,103:1});row('optional '+version+' snapshot copy failure preserves complete graph and fallback',{faultScope:'only optional snapshot copy expression'});
 }else if(family==='analyzer100'){
  assert.deepEqual(control.analyzerFaults,[100]);assert.deepEqual(control.copyFaults,[]);assert.deepEqual(owners.map(p=>p._structuralGridProof.version),[96]);assert(!control.retentions.includes(100));row('genuine100 analyzer failure retains original deferral');
 }
 assert.equal(sha(q.a),SOURCE);assert.deepEqual(Object.getOwnPropertyDescriptors(ancestor[0]),ancestorDescriptors);
 console.log(JSON.stringify({passed:true,family,generatedOnly:true,geometryDoubles:false,browserTimingClaim:false,diagnosticStrongImageRetention:control.holdImages,initialEvidence:initial,finalEvidence:evidence(owners),rows,calls,retentions:control.retentions,matches:control.matches,sourceHashes:rt.sourceHashes,instrumentedSourceHashes:rt.instrumentedSourceHashes,resourceUsage:process.resourceUsage()},null,2));
}
main().catch(error=>{console.error(error.stack);process.exitCode=1;});
