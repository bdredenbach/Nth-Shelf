'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
global.PanelMatteCells=require('../../../js/panels-matte-cells.js');
global.PanelRaggedGutters=require('../../../js/panels-ragged-gutters.js');
const D=PanelRaggedGutters,S=require('../../../js/panels-structural-grid.js'),fixtures=require('./geometry.json');
const O=vm.runInNewContext(fs.readFileSync(require.resolve('../../../js/panels-geometry-orthogonal.js'),'utf8')+';PanelGeometryOrthogonal',{PanelStructuralGrid:S,clamp01:v=>Math.max(0,Math.min(1,v))});
assert.equal(fixtures.length,8);let mutations=0;
for(const p of fixtures){
 assert(D.validPanel(p));assert(S.validPanel(p));assert.equal(JSON.stringify(O.refine(p)._contours),JSON.stringify(p._contours));
 for(const change of [q=>q.x+=.01,q=>q.w-=.01,q=>q._contours[0][0].x+=.01,q=>q._structuralGridProof.pixelContours[0][0][0]++,q=>q._structuralGridProof.pixels--,q=>q._structuralGridProof.version=99,q=>q._structuralGridProof.method='wrong',q=>q._structuralGridProof.recovery.mode='wrong',q=>q._structuralGridProof.recovery.sourceCount=0,q=>q._structuralGridProof.recovery=null,q=>q._structuralGridProof.count=0,q=>q._structuralGridProof.index=99,q=>q._structuralGridProof.coverage=0,q=>q._structuralGridProof.seed.pixels=0,q=>q._structuralGridProof.palette.edgeMatched=0]){
  const q=structuredClone(p);change(q);assert(!D.validPanel(q));assert.equal(O._provenContours(q),null);mutations++;
 }
}
// Independently drawn arbitrary shapes exercise acceptance and rejection.
for(const [w,h] of [[600,900],[500,760]]){
 const image=(touches)=>{
  const a=new Uint8ClampedArray(w*h*4);a.fill(255);
  const rect=(x0,y0,x1,y1)=>{for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){const v=(x+y)%13<6?35:155;a.set([v,v+15,v+25,255],(y*w+x)*4);}};
  rect(touches===2?0:40,0,Math.floor(w*.5),Math.floor(h*.18));
  rect(12,Math.floor(h*.23),w-12,h-12);return a;
 };
 const a=image(1);assert.equal(D.analyzeRGBA(a,w,h).length,0);
 const p=D.analyzeRecoveryRGBA(a,w,h);assert.equal(p.length,1);assert(p.every(D.validPanel));assert.equal(p[0]._structuralGridProof.version,20);assert.equal(p[0].y,0);
 assert.equal(D.analyzeRecoveryRGBA(image(2),w,h).length,0,'two unbounded edges must defer');
 a.fill(255);assert.equal(D.analyzeRecoveryRGBA(a,w,h).length,0);a.fill(0);assert.equal(D.analyzeRecoveryRGBA(a,w,h).length,0);
}
// A version-19 descriptor cannot borrow the new mode by changing its label.
for(const p of fixtures){const q=structuredClone(p);q._structuralGridProof.version=19;q._structuralGridProof.method='independent-exterior-cells';assert(!D.validPanel(q));}
const Router=vm.runInNewContext(fs.readFileSync(require.resolve('../../../js/panels-geometry.js'),'utf8')+';PanelGeometry',{PanelStructuralGrid:S,PanelGeometryOrthogonal:O});
Promise.all(fixtures.map(async p=>{const q=await Router.refine('unused',p);assert(S.validPanel(q));assert.equal(JSON.stringify(O._provenContours(q)),JSON.stringify(p._contours));})).then(()=>console.log('PASS 8 independent boundary proofs, '+mutations+' mutations, single-edge acceptance / two-edge rejection rasters, router round trips')).catch(e=>{console.error(e);process.exitCode=1});
