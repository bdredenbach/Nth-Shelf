'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
global.PanelMatteCells=require('../../../js/panels-matte-cells.js');
global.PanelRaggedGutters=require('../../../js/panels-ragged-gutters.js');
const D=PanelRaggedGutters,S=require('../../../js/panels-structural-grid.js'),fixtures=require('./geometry.json');
const O=vm.runInNewContext(fs.readFileSync(require.resolve('../../../js/panels-geometry-orthogonal.js'),'utf8')+';PanelGeometryOrthogonal',{PanelStructuralGrid:S,clamp01:v=>Math.max(0,Math.min(1,v))});
let mutations=0;
for(const p of fixtures){
 assert(D.validPanel(p));assert(S.validPanel(p));assert.equal(JSON.stringify(O.refine(p)._contours),JSON.stringify(p._contours));
 const edits=[q=>q.x+=.01,q=>q._contours[0][0].x+=.01,q=>q._structuralGridProof.version=99,q=>q._structuralGridProof.method='wrong',q=>q._structuralGridProof.connected='true',q=>q._structuralGridProof.analysisWidth=NaN,q=>q._structuralGridProof.count=2,q=>q._structuralGridProof.index=99,q=>q._structuralGridProof.exteriorPixels=0,q=>q._structuralGridProof.coverage=.1,q=>q._structuralGridProof.variance=0,q=>q._structuralGridProof.seed.pixels=0,q=>q._structuralGridProof.seed.box[2]=0,q=>q._structuralGridProof.palette.colors=[],q=>q._structuralGridProof.palette.edgeMatched=0,q=>q._structuralGridProof.palette.edgeSamples=NaN,q=>q._structuralGridProof.pixelContours[0][0][0]++,q=>q._structuralGridProof.pixels--];
 for(let i=0;i<p._structuralGridProof.seed.splits.length;i++)edits.push(q=>q._structuralGridProof.seed.splits[i].support=0,q=>q._structuralGridProof.seed.splits[i].flank=0);
 for(const edit of edits){const q=structuredClone(p);edit(q);assert.equal(D.validPanel(q),false,String(edit));assert.equal(O._provenContours(q),null);mutations++;}
}
function raster(w,h,bg,rows,cols){
 const a=new Uint8ClampedArray(w*h*4);for(let i=0;i<w*h;i++)a.set([...bg,255],i*4);
 const boxes=[];for(let row=0;row<rows;row++)for(let col=0;col<cols;col++){
  const x0=18+Math.floor(col*(w-30)/cols),x1=Math.floor((col+1)*(w-30)/cols),y0=18+Math.floor(row*(h-30)/rows),y1=Math.floor((row+1)*(h-30)/rows);boxes.push([x0,y0,x1,y1]);
  for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){const border=x<x0+3||x>x1-4||y<y0+3||y>y1-4,v=border?15:((x+y)%17<8?75:190);a.set([v,Math.max(0,v-25),Math.max(0,v-40),255],(y*w+x)*4);}
 }return {a,boxes};
}
let layouts=0;
for(const [w,h,bg,rows,cols]of [[540,810,[255,255,255],3,1],[630,900,[255,255,255],2,3],[720,850,[35,85,125],3,2],[900,640,[125,60,145],1,3]]){
 const {a,boxes}=raster(w,h,bg,rows,cols),panels=D.analyzeRGBA(a,w,h);assert.equal(panels.length,boxes.length);assert(panels.every(D.validPanel));layouts++;
 assert.equal(D.analyzeRGBA(new Uint8ClampedArray(w*h*4),w,h).length,0,'transparent images are rejected');
}
for(const col of [0,128,255]){const a=new Uint8ClampedArray(540*810*4);for(let i=0;i<a.length;i+=4)a.set([col,col,col,255],i);assert.equal(D.analyzeRGBA(a,540,810).length,0);}
assert.equal(D.analyzeRGBA(null,540,810).length,0);assert.equal(D.eligible(fixtures),false);assert.equal(D.eligible([{x:0,y:0,w:.5,h:.5}]),true);
const Router=vm.runInNewContext(fs.readFileSync(require.resolve('../../../js/panels-geometry.js'),'utf8')+';PanelGeometry',{PanelStructuralGrid:S,PanelGeometryOrthogonal:O});
Promise.all(fixtures.map(async p=>{const refined=await Router.refine('unused',p);assert(S.validPanel(refined));assert.equal(JSON.stringify(O._provenContours(refined)),JSON.stringify(p._contours));})).then(()=>console.log(`PASS ${fixtures.length} captured frame proofs, ${mutations} rejected mutations, ${layouts} arbitrary layouts, router round trips and negative inputs`)).catch(e=>{console.error(e);process.exitCode=1;});

// Retain the provenance of measured legacy gutters without altering saved maps.
const legacy=vm.runInNewContext(fs.readFileSync(require.resolve('../../../js/panels.js'),'utf8')+';PanelDetect',{window:{}});
const W=600,H=900,a=new Uint8ClampedArray(W*H*4);for(let y=0;y<H;y++)for(let x=0;x<W;x++){const v=y>430&&y<460?255:((x+y)%2?220:20);a.set([v,v,v,255],(y*W+x)*4);}
const refined=legacy._splitInternalGutters(a,W,H,[{x:0,y:0,w:1,h:1}]);assert.equal(refined.length,2);assert.equal(refined._provedInternalGutters,true);assert(!JSON.stringify(refined).includes('_provedInternalGutters'));
console.log('PASS internal-gutter provenance remains outside serialized geometry');
