'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
global.PanelMatteCells=require('../../../js/panels-matte-cells.js');
global.PanelGutterGraph=require('../../../js/panels-gutter-graph.js');
const D=require('../../../js/panels-structural-grid.js'),pages=JSON.parse(require('node:zlib').gunzipSync(Buffer.from(fs.readFileSync(__dirname+'/captured-geometry.json.gz.b64','utf8'),'base64'))),centers=require('./manual-centers.json');
const O=vm.runInNewContext(fs.readFileSync(require.resolve('../../../js/panels-geometry-orthogonal.js'),'utf8')+';PanelGeometryOrthogonal',{PanelStructuralGrid:D,clamp01:v=>Math.max(0,Math.min(1,v))});
let proofs=0,mutations=0;
for(const[page,panels]of Object.entries(pages)){
 assert.equal(panels.length,centers[page].length);
 for(const p of panels){
  proofs++;assert(D.validPanel(p));assert.equal(JSON.stringify(O.refine(p)._contours),JSON.stringify(p._contours));
  const edits=[p=>p._contours[0][0].x+=.01,p=>p.x+=.01,p=>p._structuralGridProof.pixelContours[0][0][0]++,p=>p._structuralGridProof.pixels--,p=>p._structuralGridProof.index=24,p=>p._structuralGridProof.coverage=NaN,p=>p._structuralGridProof.method='wrong',p=>p._structuralGridProof.connected=false,p=>p._structuralGridProof.frame.quad[0][0]=NaN];
  for(let i=0;i<4;i++){edits.push(p=>p._structuralGridProof.frame.rails[i].paper=0);edits.push(p=>p._structuralGridProof.frame.rails[i].ink=NaN);}
  for(let i=0;i<p._structuralGridProof.splits.length;i++)edits.push(p=>p._structuralGridProof.splits[i].ends=0);
  for(const mutate of edits){const bad=structuredClone(p);mutate(bad);assert.equal(D.validPanel(bad),false,`page${page} mutation ${mutate}`);assert.equal(O._provenContours(bad),null);mutations++;}
 }
}
assert.equal(proofs,193);
const G=PanelGutterGraph;assert.equal(G.analyzeRGBA(null,616,900),null);
for(const value of [0,128,255]){const data=new Uint8ClampedArray(400*600*4).fill(value);for(let i=3;i<data.length;i+=4)data[i]=255;assert.equal(G.analyzeRGBA(data,400,600),null);data.fill(0);assert.equal(G.analyzeRGBA(data,400,600),null);}
// Held-out arbitrary layouts, generated pixels only: no comic fixture required.
function raster(w,h,boxes){const a=new Uint8ClampedArray(w*h*4).fill(255);for(const[x0,y0,x1,y1]of boxes)for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){const n=(y*w+x)*4,c=(x<x0+3||x>=x1-3||y<y0+3||y>=y1-3)?0:200;a[n]=a[n+1]=a[n+2]=c;}return a;}
let layouts=0;
for(const[w,h,boxes]of [[400,600,[[15,15,185,275],[200,15,385,275],[15,290,385,585]]],[520,780,[[20,20,220,420],[235,20,500,200],[235,215,500,420],[20,435,500,760]]],[400,600,[[0,0,390,190],[0,210,180,590],[195,210,390,590]]]]){
 const raw=raster(w,h,boxes),result=G.analyzeRGBA(raw,w,h);assert.equal(result?.panels.length,boxes.length);assert(result.panels.every(G.validPanel));layouts++;
 const mirror=raw.slice();for(let y=0;y<h;y++)for(let x=0;x<w;x++)mirror.set(raw.subarray((y*w+x)*4,(y*w+x+1)*4),(y*w+w-1-x)*4);assert.equal(G.analyzeRGBA(mirror,w,h)?.panels.length,boxes.length);layouts++;
 const color=raw.slice();for(let i=0;i<color.length;i+=4)color[i+1]=0;assert.equal(G.analyzeRGBA(color,w,h),null);
}
console.log('PASS '+proofs+' proofs, '+mutations+' corruptions rejected, '+layouts+' arbitrary/mirrored layouts and negative inputs');
// Flat saturated title-style artwork must not be sliced into fake panels.
const w=400,h=600,graphic=new Uint8ClampedArray(w*h*4);
for(let i=0;i<w*h;i++)graphic.set([235,181,99,255],i*4);
for(const[cx,cy]of [[110,140],[290,140],[110,420],[290,420]])for(let y=cy-85;y<=cy+85;y++)for(let x=cx-68;x<=cx+68;x++)if(((x-cx)/68)**2+((y-cy)/85)**2<1)graphic.set([20,35,80,255],(y*w+x)*4);
assert.equal(G.analyzeRGBA(graphic,w,h)?.kind,'unframed');
const framed=raster(w,h,[[18,18,185,280],[210,18,382,280],[18,305,185,582],[210,305,382,582]]);
for(let i=0;i<framed.length;i+=4)if(framed[i]===255)framed.set([235,181,99,255],i);
assert.equal(G.analyzeRGBA(framed,w,h),null,'Color frames must retain the legacy route');
// An open top edge exposes isolated character ink to the paper flood.
const open=raster(w,h,[[15,0,385,260],[15,285,185,585],[205,285,385,585]]);
for(let y=0;y<257;y++)for(let x=18;x<382;x++)open.set([255,255,255,255],(y*w+x)*4);
for(let y=55;y<175;y++)for(let x=140;x<250;x++)if(((x-195)/50)**2+((y-115)/58)**2<1)open.set([0,0,0,255],(y*w+x)*4);
assert.equal(G.analyzeRGBA(open,w,h)?.panels.length,3,'Enclosed character ink must not veto its proved open-edge scene');
console.log('PASS saturated graphic, genuine color frames and open-edge interior artwork');
