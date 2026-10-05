'use strict';
const assert=require('node:assert/strict'),D=require('../../../js/panels-structural-grid.js'),panels=require('./captured-geometry.json');
assert.equal(panels.length,10);assert(panels.every(D.validPanel));
for(const p of panels){for(const mutate of [p=>p._outline[0].x+=.01,p=>p.x+=.01,p=>p._structuralGridProof.pixelOutline[0][0]++,p=>p._structuralGridProof.seams[0].matched=0,p=>p._structuralGridProof.vertical[0].maxGap=99,p=>p._structuralGridProof.rails[0].meanDark=0,p=>p._structuralGridProof.cap.meanDark=0,p=>p._structuralGridProof.index=10,p=>p._structuralGridProof.stats.variance=0,p=>p._structuralGridProof.method='unwitnessed']){const bad=structuredClone(p);mutate(bad);assert.equal(D.validPanel(bad),false);}}
assert.deepEqual(D.completeMixedRimsRGBA(null,585,900,[]),[]);
const flat=new Uint8ClampedArray(585*900*4);for(let i=3;i<flat.length;i+=4)flat[i]=255;
const baseline=[{x:.02,y:0,w:.96,h:.60},{x:.03,y:.615,w:.43,h:.36},{x:.48,y:.615,w:.49,h:.36}];
assert.deepEqual(D.completeMixedRimsRGBA(flat,585,900,baseline),[]);baseline[0]._identitySource='existing-proved-owner';assert.deepEqual(D.completeMixedRimsRGBA(flat,585,900,baseline),[]);
console.log('PASS ten mixed-rim proofs, 100 evidence/geometry mutations, invalid input, flat image and existing-owner rejection');
