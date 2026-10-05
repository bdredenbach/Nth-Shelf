'use strict';
const assert=require('node:assert/strict'),D=require('../../../js/panels-matte-cells.js');
const source=new Uint8ClampedArray([0,0,0,255,100,40,20,255,40,100,80,255,200,200,200,255]);
const center=D.sampleBilinearRGBA(source,2,2,1,1);
assert.deepEqual([...center],[85,85,75,255]);
assert.deepEqual([...D.sampleBilinearRGBA(source,2,2,2,2)],[...source]);
const enlarged=D.sampleBilinearRGBA(source,2,2,3,3);
assert.deepEqual([...enlarged.slice(0,4)],[0,0,0,255]);
assert.deepEqual([...enlarged.slice(16,20)],[85,85,75,255]);
assert.deepEqual([...enlarged.slice(-4)],[200,200,200,255]);
assert.deepEqual([...D.sampleBilinearRGBA(new Uint8ClampedArray([20,30,40,80]),1,1,2,2)],Array(4).fill([20,30,40,80]).flat());
for(const args of [[null,2,2,1,1],[source,3,2,1,1],[source,2,2,0,1],[source,2,2,1.5,1]])assert.equal(D.sampleBilinearRGBA(...args),null);
const panels=require('./captured-geometry.json');
assert.equal(panels.length,8);assert(panels.every(D.validPanel));
for(const panel of panels.filter(p=>p._matteCellProof.version===2)){
  for(const mutate of [p=>p._matteCellProof.rimCompletion.rim.matched=0,p=>p._matteCellProof.rimCompletion.retainedPixels--,p=>p._matteCellProof.rimCompletion.matches[0].otherFraction=.5,p=>p._contours[0][0].x+=.01]){
    const bad=structuredClone(panel);mutate(bad);assert(!D.validPanel(bad));
  }
}
console.log('PASS explicit native-pixel sampling, edge/alpha handling, eight proofs and rejection mutations');
