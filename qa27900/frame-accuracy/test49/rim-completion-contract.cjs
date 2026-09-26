'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),D=require('../../../js/panels-matte-cells.js'),panels=require('./captured-geometry.json'),qa=require('./page44-anchors.json');
assert.equal(panels.length,8);assert(panels.every(D.validPanel));assert(qa.frames.every(f=>f.points.length===9));assert.equal(qa.frames.length,8);
const added=panels.filter(p=>p._matteCellProof.version===2);assert.equal(added.length,6);
const mutations={
 missingEvidence:p=>delete p._matteCellProof.rimCompletion,
 weakRim:p=>p._matteCellProof.rimCompletion.rim.matched=0,
 weakPriorMatch:p=>p._matteCellProof.rimCompletion.matches[0].matched=0,
 mixedOwners:p=>p._matteCellProof.rimCompletion.matches[0].otherFraction=.1,
 duplicateOwner:p=>p._matteCellProof.rimCompletion.matches[1].index=p._matteCellProof.rimCompletion.matches[0].index,
 lostPriorPixels:p=>p._matteCellProof.rimCompletion.retainedPixels--,
 wrongPriorOwner:p=>p._matteCellProof.rimCompletion.priorIndex=11,
 badCoverage:p=>p._matteCellProof.rimCompletion.coverage=.2,
 changedContour:p=>p._contours[0][0].x+=.01,
 wrongArea:p=>p._matteCellProof.pixels++,
 wrongMode:p=>p._matteCellProof.mode='paper',
 downgradedProof:p=>p._matteCellProof.version=1
};
let rejected=0;for(const panel of added)for(const [name,mutate] of Object.entries(mutations)){const p=structuredClone(panel);mutate(p);assert(!D.validPanel(p),name);rejected++;}
const enclosed=added.find(p=>p._matteCellProof.rimCompletion.enclosure);assert(enclosed);for(const change of [e=>e.radius=20,e=>e.matchedPixels=0,e=>e.addedPixels=999999,e=>e.rim.matched=0]){const p=structuredClone(enclosed);change(p._matteCellProof.rimCompletion.enclosure);assert(!D.validPanel(p));rejected++;}
assert.deepEqual(D.completeRimNetworkRGBA(null,585,900,[]),[]);
const source=fs.readFileSync(path.resolve(__dirname,'../../../js/panels-matte-cells.js'),'utf8');assert(!source.includes('1000-043'));assert(!source.includes('page44-anchors'));
console.log(JSON.stringify({validFrames:panels.length,version2Proofs:added.length,independentPoints:72,tamperedProofsRejected:rejected}));
