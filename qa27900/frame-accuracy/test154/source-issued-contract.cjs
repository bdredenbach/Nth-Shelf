'use strict';
const assert=require('node:assert/strict'),path=require('node:path');
const {root,cv,load}=require('./load.cjs');
const A=require(path.join(root,'qa27900/frame-accuracy/test136/round-atomic-fixtures.cjs'));
const S=require(path.join(root,'qa27900/frame-accuracy/test143/round-speech-fixtures.cjs'));
(async()=>{
 const q=S.anchoredFixture(A.scene()),rt=load(root),url=q.canvas.toBuffer('image/png');
 const original=rt.ragged.analyzeRGBA(q.rgba,q.w,q.h),a=rt.atomic.analyzeRGBA(q.rgba,q.w,q.h,original),s=rt.speech.analyzeRGBA(q.rgba,q.w,q.h,original.concat(a));
 assert.equal(original.length,3);assert.equal(a.length,1);assert.equal(s.length,1);
 const expected=JSON.stringify(original.concat(a,s));
 let before={...rt.calls};assert(rt.atomic.replayRGBA(q.rgba,q.w,q.h,a,original));assert(rt.calls.atomic>before.atomic,'public source helper cannot mint identity');
 const prior=rt.ragged.analyzeRGBA(q.rgba,q.w,q.h);assert(!Object.isFrozen(prior[0]._structuralGridProof));
 const d={detect:async()=>prior};rt.atomic.install(d);rt.speech.install(d);
 const panels=await d.detect(url);assert.equal(JSON.stringify(panels),expected);assert(Object.isFrozen(prior[0]._structuralGridProof));
 function replay(p=panels,rgba=q.rgba){return [rt.atomic.replayRGBA(rgba,q.w,q.h,[p[3]],p.slice(0,3)),rt.speech.replayRGBA(rgba,q.w,q.h,[p[4]],p.slice(0,4))];}
 before={...rt.calls};assert.deepEqual(replay(),[true,true]);assert.deepEqual(rt.calls,before,'exact source-issued result skips full replay');
 const restored=JSON.parse(expected);before={...rt.calls};assert.deepEqual(replay(restored),[true,true]);assert(rt.calls.atomic>before.atomic&&rt.calls.speech>before.speech,'restored equal owners take full replay');
 const badAlpha=q.rgba.slice();badAlpha[3]=254;assert.deepEqual(replay(panels,badAlpha),[false,false]);
 before={...rt.calls};assert.deepEqual(replay(),[true,true]);assert.deepEqual(rt.calls,before,'failed source cannot evict completed identity');
 const onePixel=q.rgba.slice(),pixel=panels[3]._structuralGridProof.atoms[0].runs[0][0];for(let k=0;k<3;k++)onePixel[4*pixel+k]=onePixel[4*pixel+k]<128?255:0;
 before={...rt.calls};assert.equal(rt.atomic.replayRGBA(onePixel,q.w,q.h,[panels[3]],panels.slice(0,3)),false,'same-size single RGB pixel change rejects stale ownership');assert(rt.calls.atomic>before.atomic,'RGB mismatch cannot bypass original source route');
 assert.deepEqual(replay(),[true,true]);
 const token=rt.provider.token(new Uint8ClampedArray([1,1,1,255]),1,1);assert(rt.provider.commit(token));before={...rt.calls};assert.deepEqual(replay(),[true,true]);assert(rt.calls.atomic>before.atomic&&rt.calls.speech>before.speech,'cross-family eviction takes full replay');
 assert.equal(JSON.stringify(panels),expected,'caller graph stays exact');
 const readiness=[];
 for(const kind of ['zero-natural-width','zero-natural-height','canvas']) {
  function ImageOverride(){if(kind!=='canvas'){const img=new cv.Image();Object.defineProperty(img,kind==='zero-natural-width'?'naturalWidth':'naturalHeight',{value:0});return img;}const canvas=cv.createCanvas(q.w,q.h);canvas.getContext('2d').drawImage(q.canvas,0,0);canvas.decode=async()=>{};return canvas;}
  const runtime=load(root,ImageOverride),prior=runtime.ragged.analyzeRGBA(q.rgba,q.w,q.h),detector={detect:async()=>prior};runtime.atomic.install(detector);runtime.speech.install(detector);
  const output=await detector.detect(url);assert.equal(JSON.stringify(output),expected);
  const calls={...runtime.calls};assert(runtime.atomic.replayRGBA(q.rgba,q.w,q.h,[output[3]],output.slice(0,3)));assert(runtime.speech.replayRGBA(q.rgba,q.w,q.h,[output[4]],output.slice(0,4)));
  const issued=runtime.calls.atomic===calls.atomic&&runtime.calls.speech===calls.speech;assert.equal(issued,kind==='canvas');readiness.push({kind,issued});
 }
 console.log(JSON.stringify({passed:true,generatedSourcesOnly:true,controls:['public helpers cannot mint','normal mutable predecessor transition','exact full source output','source-issued native replay','restored copy full fallback','alpha failure preserves completed evidence','one RGB pixel rejects stale ownership','shared witness eviction','caller graph exact'],readiness,resourceUsage:process.resourceUsage()},null,2));
})().catch(e=>{console.error(e.stack);process.exitCode=1});
