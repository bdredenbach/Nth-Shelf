'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
for(const [file,name] of [['panels-edge-cells','PanelEdgeCells'],['panels-corner-frames','PanelCornerFrames']])vm.runInThisContext(fs.readFileSync(path.resolve(__dirname,'../../../js/'+file+'.js'),'utf8')+';globalThis.'+name+'='+name+';');
const detector=require('../../../js/panels-structural-grid.js'),fixture=require('./captured-geometry.json');
const panels=fixture.added.map(p=>({...p,_structuralGridProof:{...fixture.base,...p._structuralGridProof}}));
assert.equal(panels.length,4);assert(panels.every(detector.validPanel));
const mutations={
 'changed outline':p=>p._outline[0].x+=.01,
 'missing anchors':p=>p._structuralGridProof.anchors=[],
 'wrong anchor type':p=>p._structuralGridProof.anchors[0]._identitySource='corner-rim-frame',
 'weak step':p=>p._structuralGridProof.stepEvidence.dark=0,
 'missing band':p=>p._structuralGridProof.band=null,
 'weak rim':p=>p._structuralGridProof.rims[0].dark=0,
 'nonfinite seam':p=>p._structuralGridProof.geometry.profile[1][1]=NaN,
 'nonmonotonic seam':p=>p._structuralGridProof.geometry.profile[1][0]=-1,
 'fractional dimensions':p=>p._structuralGridProof.analysisWidth+=.5,
 'bad bounds':p=>p.w+=.01,
 'wrong version':p=>p._structuralGridProof.version=9
};
for(const [name,mutate] of Object.entries(mutations))for(const panel of panels){const p=structuredClone(panel);mutate(p);assert(!detector.validPanel(p),name);}
assert.deepEqual(detector.completeWitnessedSteppedImage(null,[]),[]);
assert.deepEqual(detector.completeWitnessedSteppedImage(null,fixture.base.anchors.slice(0,1)),[]);
console.log(JSON.stringify({capturedProofsValid:4,tamperedProofsRejected:Object.keys(mutations).length*4,incompleteAnchorsRejected:true}));
