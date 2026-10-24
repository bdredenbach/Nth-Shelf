'use strict';
const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const root=path.resolve(process.argv[2]||path.join(__dirname,'../..')),code=fs.readFileSync(root+'/js/panels-frame-wasm.js','utf8'),bytes=fs.readFileSync(root+'/js/panels-frame-kernel.wasm');
const load=()=>new Function('fetch','document',code+';return PanelFrameWasm;')(undefined,undefined);
const checks=[];function check(name,fn){fn();checks.push({name,passed:true})}
(async()=>{
 const W=load(),a=await WebAssembly.instantiate(bytes),b=await WebAssembly.instantiate(bytes),c=await WebAssembly.instantiate(bytes);const smooth=new Float32Array(70*70).fill(255);smooth.fill(40,70*20,70*21);
 const memory=()=>[...new Float32Array(W._memory.buffer,0,smooth.length)];const evaluate=()=>W.evaluate(true,true,70,70,35,35,35,20,22,4,2,67,2,40,60,0,20);
 W.attach(a);check('first begin uploads exact pixels',()=>{assert(W.begin(smooth,70,70));assert.deepEqual(memory(),[...smooth])});const first=evaluate();check('actual rail kernel returns a finite result',()=>{assert(first);assert(Number.isFinite(first.score))});
 check('same-source repeat preserves pixels and result',()=>{assert(W.begin(smooth,70,70));assert.deepEqual(memory(),[...smooth]);assert.deepEqual(evaluate(),first)});
 W.attach(b);check('fresh attachment clears source-specific state',()=>{assert.equal(W._source,null);assert.equal(W._sourceWidth,0);assert.equal(W._sourceHeight,0);assert.equal(W._outPtr,0)});
 check('same source object uploads into fresh memory',()=>{assert(W.begin(smooth,70,70));assert.deepEqual(memory(),[...smooth])});check('reattached actual kernel result matches',()=>assert.deepEqual(evaluate(),first));
 W.attach(b);check('reattaching same instance remains exact',()=>{assert(W.begin(smooth,70,70));assert.deepEqual(evaluate(),first)});
 const other=smooth.slice();other.fill(140,70*20,70*21);check('different array uploads on existing memory',()=>{assert(W.begin(other,70,70));assert.deepEqual(memory(),[...other])});const changed=evaluate();assert.notDeepEqual(changed,first);
 W.attach(c);check('second distinct source survives fresh attachment',()=>{assert(W.begin(other,70,70));assert.deepEqual(memory(),[...other]);assert.deepEqual(evaluate(),changed)});
 check('missing-export rejection leaves prior valid state',()=>{assert.throws(()=>W.attach({exports:{}}));assert(W.begin(other,70,70));assert.deepEqual(evaluate(),changed)});
 check('invalid input remains rejected',()=>{assert.equal(W.begin(new Uint8Array(4900),70,70),false);assert.equal(W.begin(new Float32Array(1100*1100),1100,1100),false)});
 check('old source can be restored exactly',()=>{assert(W.begin(smooth,70,70));assert.deepEqual(memory(),[...smooth]);assert.deepEqual(evaluate(),first)});
 console.log(JSON.stringify({passed:true,controls:checks.length,scope:'Actual WASM attachment/upload lifecycle only; no complete-frame claim',checks},null,2));
})().catch(e=>{console.error(e);process.exitCode=1});
