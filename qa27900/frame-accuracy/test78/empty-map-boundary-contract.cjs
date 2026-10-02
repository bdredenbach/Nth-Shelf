'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../../..');
const source=fs.readFileSync(path.join(root,'js/panels.js'),'utf8');
const marker='// Test78: expose the already-strict v20 independent-boundary proof only';
const start=source.indexOf(marker);assert(start>=0,'Test78 route marker missing');
const resolve=source.indexOf('resolve(closed);',start);assert(resolve>start,'Test78 route must run before final resolve');
const route=source.slice(start,resolve);
assert(route.includes('if(!closed.length)try {'),'recovery must be empty-map-only');
assert(route.includes('PanelRaggedGutters.analyzeImage(img,log,true)'),'must explicitly request validated recovery mode');
assert(route.includes('recovered.length===1'),'must accept only one independent recovered owner');
assert(route.includes('recovered.every(p=>PanelRaggedGutters.validPanel(p))'),'must revalidate serialized v20 proof');
const complete=source.lastIndexOf('PanelRaggedGutters.completeImage(img,closed,log)',start);
assert(complete>=0&&complete<start,'Test78 recovery must follow the established ragged completion route');
function gate(closed,R){
 if(!closed.length){
  const recovered=R.analyzeImage({},null,true);
  if(recovered.length===1&&recovered.every(p=>R.validPanel(p)))closed=recovered;
 }
 return closed;
}
let calls=0;const prior={id:'prior'};
assert.deepEqual(gate([prior],{analyzeImage(){calls++;return[{ok:true}]},validPanel(){return true}}),[prior]);
assert.equal(calls,0,'prior owner must have absolute priority');
assert.deepEqual(gate([],{analyzeImage(_,__,recover){calls++;assert.equal(recover,true);return[{ok:true}]},validPanel:p=>p.ok}),[{ok:true}]);
assert.deepEqual(gate([],{analyzeImage(){return[{ok:true},{ok:true}]},validPanel:p=>p.ok}),[],'multi-owner recovery must defer');
assert.deepEqual(gate([],{analyzeImage(){return[{ok:false}]},validPanel:p=>p.ok}),[],'invalid recovery must defer');
global.PanelMatteCells=require('../../../js/panels-matte-cells.js');
const R=require('../../../js/panels-ragged-gutters.js');
function synthetic(w=600,h=900){
 const a=new Uint8ClampedArray(w*h*4);a.fill(255);
 const rect=(x0,y0,x1,y1)=>{for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){const v=(x+y)%13<6?35:155;a.set([v,v+15,v+25,255],(y*w+x)*4);}};
 rect(40,0,Math.floor(w*.5),Math.floor(h*.18));rect(12,Math.floor(h*.23),w-12,h-12);return a;
}
const sample=R.analyzeRecoveryRGBA(synthetic(),600,900);assert.equal(sample.length,1);assert(R.validPanel(sample[0]));assert.equal(sample[0]._structuralGridProof.version,20);assert.equal(sample[0]._structuralGridProof.method,'independent-boundary-cell');
const tampered=structuredClone(sample[0]);tampered._structuralGridProof.coverage=0;assert.equal(R.validPanel(tampered),false);
console.log(JSON.stringify({passed:true,emptyMapOnly:true,priorOwnerPriority:true,exactlyOne:true,v20ProofPreserved:true}));
