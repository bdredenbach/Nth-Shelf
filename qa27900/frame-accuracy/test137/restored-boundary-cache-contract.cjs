'use strict';
// Generated source only. Restored valid proofs receive the same immutable cache
// as newly discovered owners; changed geometry or evidence cannot borrow it.
const assert=require('node:assert/strict');
global.PanelMatteCells=require('../../../js/panels-matte-cells.js');
global.PanelRaggedGutters=require('../../../js/panels-ragged-gutters.js');
const D=require('../../../js/panels-local-boundary-consensus.js');
const w=300,h=450,a=new Uint8ClampedArray(w*h*4).fill(255);
for(const[lo,hi]of[[10,215],[235,440]])for(let y=lo;y<hi;y++)for(let x=10;x<290;x++){const n=(x*13+y*19)%151+20;a.set([n,(n+43)%220,(n+73)%220,255],(y*w+x)*4);}
const original=D.analyzeRGBA(a,w,h,[]);assert.equal(original.length,2);
let traces=0;const trace=PanelMatteCells.tracePixelContours;PanelMatteCells.tracePixelContours=function(...args){traces++;return trace.apply(this,args);};
let cachedChecks=0,rejected=0;
for(const source of original){
 const p=JSON.parse(JSON.stringify(source)),before=JSON.stringify(p);traces=0;assert(D.validPanel(p));assert(traces>0,'restored proof must be fully reconstructed once');assert.equal(JSON.stringify(p),before);
 assert(Object.isFrozen(p._structuralGridProof)&&Object.isFrozen(p._contours)&&Object.isFrozen(p._contours[0][0]));
 traces=0;for(let k=0;k<1000;k++){assert(D.validPanel(p));cachedChecks++;}assert.equal(traces,0,'repeated validation must not retrace source-sized masks');
 assert.throws(()=>{p._structuralGridProof.pixels++;},TypeError);assert.throws(()=>{p._contours[0][0].x+=.01;},TypeError);
 for(const mutate of [q=>q.x+=.01,q=>q.w+=.01,q=>q._geometryType='unproved',q=>q._quad=[],q=>q._outline=[]]){const q={...p};mutate(q);assert.equal(D.validPanel(q),false);rejected++;}
 for(const mutate of [q=>q._structuralGridProof.pixels++,q=>q._structuralGridProof.boundary.samples[0]++,q=>q._contours[0][0].x+=.01]){const q=JSON.parse(before);mutate(q);assert.equal(D.validPanel(q),false);rejected++;}
 const fresh=JSON.parse(before);traces=0;assert(D.validPanel(fresh));assert(traces>0,'new proof identity gets its own replay');
}
console.log(JSON.stringify({passed:true,generatedOwners:2,cachedChecks,tamperRejections:rejected,restoredProofFullyReplayedBeforeCache:true,repeatMaskTraces:0,proofAndContoursDeepFrozen:true,geometryUnchanged:true,originalPixels:false}));
