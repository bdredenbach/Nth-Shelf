'use strict';
const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
global.PanelMatteCells=require('../../../js/panels-matte-cells.js');
global.PanelFramedInsets=require('../../../js/panels-framed-insets.js');
const D=PanelFramedInsets,S=require('../../../js/panels-structural-grid.js'),panels=require('./overlay-geometry.json');
const O=vm.runInNewContext(fs.readFileSync(require.resolve('../../../js/panels-geometry-orthogonal.js'),'utf8')+';PanelGeometryOrthogonal',{PanelStructuralGrid:S,clamp01:v=>Math.max(0,Math.min(1,v))});
let mutations=0;
for(const p of panels){assert(D.validOverlayPanel(p));assert(S.validPanel(p));assert.deepEqual(JSON.stringify(O.refine(p)._contours),JSON.stringify(p._contours));
 const edits=[p=>p.x+=.01,p=>p._contours[0][0].x+=.01,p=>p._structuralGridProof.rims[0].interior.nonInk=0,p=>p._structuralGridProof.method='wrong',p=>p._structuralGridProof.index=99,p=>p._structuralGridProof.pixels--,p=>p._structuralGridProof.connected=false,p=>p._structuralGridProof.analysisWidth=NaN,p=>p._structuralGridProof.parentBox[3]=0,p=>p._structuralGridProof.pixelContours[0][0][0]++,p=>p._structuralGridProof.expanded[0][0]++];
 for(let n=0;n<p._structuralGridProof.rims.length;n++)for(let j=0;j<4;j++){edits.push(p=>p._structuralGridProof.rims[n].rims[j].matched=0);edits.push(p=>p._structuralGridProof.rims[n].rims[j].ridges=0);edits.push(p=>p._structuralGridProof.rims[n].rims[j].maxGap=1000);}
 for(const edit of edits){const q=structuredClone(p);edit(q);assert.equal(D.validOverlayPanel(q),false,String(edit));assert.equal(O._provenContours(q),null);mutations++;}
}
function raster(w,h,boxes,solid=false){const a=new Uint8ClampedArray(w*h*4);for(let i=0;i<w*h;i++)a.set([175,105,70,255],i*4);for(const[x0,y0,x1,y1]of boxes)for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)a.set(solid||x<x0+3||x>x1-3||y<y0+3||y>y1-3?[5,5,5,255]:[190,150,95,255],(y*w+x)*4);return a;}
let layouts=0;
for(const[w,h,boxes]of [[600,480,[[340,245,450,469],[462,245,590,469]]],[720,600,[[12,310,142,585],[156,310,290,585]]],[800,640,[[290,340,440,624],[450,340,600,624],[610,340,788,624]]]]){
 const raw=raster(w,h,boxes),r=D.completeOverlayRGBA(raw,w,h);assert.equal(r.length,boxes.length+1);assert(r.every(D.validOverlayPanel));layouts++;
 assert.equal(D.completeOverlayRGBA(raster(w,h,boxes,true),w,h).length,0,'Solid art masses are not narrow frame rims');
 assert.equal(D.completeOverlayRGBA(raw,w,h,r).length,0,'Never replace proved owners');
}
assert.equal(D.completeOverlayRGBA(null,600,480).length,0);assert.equal(D.completeOverlayRGBA(new Uint8ClampedArray(600*480*4),600,480).length,0);
console.log('PASS '+panels.length+' overlay proofs, '+mutations+' corruptions rejected, '+layouts+' arbitrary inset banks, solid-art and existing-owner negatives');

// The reader reclassifies geometry labels; the measured proof and contours must survive.
const Router=vm.runInNewContext(fs.readFileSync(require.resolve('../../../js/panels-geometry.js'),'utf8')+';PanelGeometry',{PanelStructuralGrid:S,PanelGeometryOrthogonal:O});
Promise.all(panels.map(async p=>{const refined=await Router.refine('unused',p);assert(S.validPanel(refined));assert.deepEqual(JSON.stringify(O._provenContours(refined)),JSON.stringify(p._contours));assert(S.validPanel(O.refine(refined)));})).then(()=>console.log('PASS full geometry-router round trip for all overlay owners')).catch(e=>{console.error(e);process.exitCode=1;});
