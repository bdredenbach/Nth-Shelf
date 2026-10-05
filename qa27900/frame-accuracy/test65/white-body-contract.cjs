'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const M=require('../../../js/panels-matte-cells.js'),fixtures=JSON.parse(require('node:zlib').gunzipSync(Buffer.from(fs.readFileSync(path.join(__dirname,'geometry.json.gz.b64'),'utf8'),'base64')));
const O=vm.runInNewContext(fs.readFileSync(require.resolve('../../../js/panels-geometry-orthogonal.js'),'utf8')+';PanelGeometryOrthogonal',{PanelMatteCells:M,clamp01:v=>Math.max(0,Math.min(1,v))});
const Router=vm.runInNewContext(fs.readFileSync(require.resolve('../../../js/panels-geometry.js'),'utf8')+';PanelGeometry',{PanelMatteCells:M,PanelGeometryOrthogonal:O});
function raster(rings,w,h){const a=new Uint8Array(w*h);for(let y=0;y<h;y++){const e=new Int32Array(w+1);for(const q of rings)for(let k=0;k<q.length;k++){const u=q[k],v=q[(k+1)%q.length];if(u[0]===v[0]&&y>=Math.min(u[1],v[1])&&y<Math.max(u[1],v[1]))e[u[0]]++;}let n=0;for(let x=0;x<w;x++){n^=e[x]%2;a[y*w+x]=n;}}return a;}
assert.equal(fixtures.length,21);assert.equal(fixtures.filter(p=>p._matteCellProof.version===4).length,20);let mutations=0,restored=0,bodies=0;
for(const p of fixtures){
 assert(M.validPanel(p));assert.equal(JSON.stringify(O._provenContours(p)),JSON.stringify(p._contours));
 const changes=[q=>q.x+=.01,q=>q.w-=.01,q=>q._contours[0][0].x+=.01,q=>q._matteCellProof.pixelContours[0][0][0]++,q=>q._matteCellProof.pixels--,q=>q._matteCellProof.version=99,q=>q._matteCellProof.method='wrong',q=>q._quad=[{x:0,y:0}],q=>q._geometryOwner='rectangle'];
 if(p._matteCellProof.version===4){
  changes.push(q=>q._matteCellProof.parent.x+=.01,q=>q._matteCellProof.parent._matteCellProof.version=4,q=>q._matteCellProof.repairs=[],q=>q._matteCellProof.repairs[0].whitePixels=0,q=>q._matteCellProof.repairs[0].inkPixels=0,q=>q._matteCellProof.repairs[0].addedPixels++,q=>q._matteCellProof.repairs[0].attachment.matched=0,q=>q._matteCellProof.repairs[0].attachment.foreign=9999,q=>q._matteCellProof.repairs[0].bodyContours[0][0][0]=0,q=>q._matteCellProof.repairs[0].expandedContours[0][0][0]=0);
  const v=p._matteCellProof,w=v.analysisWidth,h=v.analysisHeight,before=raster(v.parent._matteCellProof.pixelContours,w,h),after=raster(v.pixelContours,w,h),expected=before.slice();
  for(const r of v.repairs){const body=raster(r.bodyContours,w,h),add=raster(r.expandedContours,w,h);for(let i=0;i<expected.length;i++){if(body[i])assert(after[i]);if(add[i])expected[i]=1;}bodies++;}
  assert.deepEqual(after,expected,'repair must be the exact additive union');for(let i=0;i<after.length;i++){assert(!before[i]||after[i]);restored+=after[i]&&!before[i];}
 }
 for(const change of changes){const q=structuredClone(p);change(q);assert(!M.validPanel(q));assert.equal(O._provenContours(q),null);mutations++;}
}
function descriptor(mask,w,h,rgba){const rings=M.tracePixelContours(mask,w,h,1),pts=rings.flat(),xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]),b=[Math.min(...xs),Math.min(...ys),Math.max(...xs),Math.max(...ys)];let pixels=0,sum=0,sq=0,dark=0,light=0;for(let i=0;i<mask.length;i++)if(mask[i]){const g=rgba[i*4]*.299+rgba[i*4+1]*.587+rgba[i*4+2]*.114;pixels++;sum+=g;sq+=g*g;dark+=g<50;light+=g>170;}return{x:b[0]/w,y:b[1]/h,w:(b[2]-b[0])/w,h:(b[3]-b[1])/h,_identitySource:'matte-cell-frame',_geometryOwner:'matte-cell-contours',_geometryType:'edge-connected-matte-cell',_contours:rings.map(q=>q.map(([x,y])=>({x:x/w,y:y/h}))),_matteCellProof:{version:1,method:'edge-connected-matte-cells-v1',mode:'paper',analysisWidth:w,analysisHeight:h,edgeColor:[255,255,255],edgeSamples:1000,edgeMatched:1000,exteriorPixels:w*h-pixels,source:'component',pixels,mean:sum/pixels,variance:sq/pixels-(sum/pixels)**2,dark,light,pixelContours:rings}};}
for(const [w,h] of [[600,900],[500,760]]){
 const rgba=new Uint8ClampedArray(w*h*4).fill(255),old=new Uint8Array(w*h),cx=w*.3|0,cy=h*.2|0,r=40;
 for(let y=25;y<h-25;y++)for(let x=25;x<w-25;x++){const i=y*w+x,v=(x+y)%17<8?55:145;rgba.set([v,v+15,v+30,255],i*4);old[i]=1;}
 for(let y=cy-r;y<=cy+r;y++)for(let x=cx-r;x<=cx+r;x++)if((x-cx)**2+(y-cy)**2<=r*r){const i=y*w+x;old[i]=0;const ink=Math.abs(x-cx)<28&&Math.abs(y-cy)<20&&x%11<4&&y%12<7;rgba.set(ink?[0,0,0,255]:[255,255,255,255],i*4);}
 const p=descriptor(old,w,h,rgba);assert(M.validPanel(p));const repaired=M.repairWhiteBodiesRGBA(rgba,w,h,[p]);assert.equal(repaired.length,1);assert.equal(repaired[0]._matteCellProof.version,4);assert(M.validPanel(repaired[0]));assert(repaired[0]._matteCellProof.pixels>p._matteCellProof.pixels+4000);
 assert.equal(M.repairWhiteBodiesRGBA(rgba,w,h,repaired),repaired,'completed repairs are idempotent');
 const left=old.map((v,i)=>v&&i%w<cx?1:0),right=old.map((v,i)=>v&&i%w>=cx?1:0),ambiguous=[descriptor(left,w,h,rgba),descriptor(right,w,h,rgba)];assert.equal(M.repairWhiteBodiesRGBA(rgba,w,h,ambiguous),ambiguous,'conflicting owners must defer');
 const blank=rgba.slice();for(let y=cy-r;y<=cy+r;y++)for(let x=cx-r;x<=cx+r;x++)if((x-cx)**2+(y-cy)**2<=r*r)blank.set([255,255,255,255],(y*w+x)*4);const baseline=[p];assert.equal(M.repairWhiteBodiesRGBA(blank,w,h,baseline),baseline,'plain white art is not text evidence');
 const a=new Uint8ClampedArray(w*h*4).fill(255);for(const [top,bottom] of [[.03,.28],[.34,.59],[.65,.96]])for(let y=Math.round(h*top);y<Math.round(h*bottom);y++)for(let x=25;x<w-25;x++){const v=(x+y)%13<6?35:155;a.set([v,v+15,v+25,255],(y*w+x)*4);}
 const native=M.recoverNativeCellsRGBA(a,w,h);assert.equal(native.length,3);assert(native.every(M.validPanel));a.fill(255);assert.equal(M.recoverNativeCellsRGBA(a,w,h).length,0);
}
Promise.all(fixtures.map(async p=>{const q=await Router.refine('unused',p);assert(M.validPanel(q));assert.equal(JSON.stringify(O._provenContours(q)),JSON.stringify(p._contours));})).then(()=>console.log(JSON.stringify({passed:true,proofs:fixtures.length,mutations,restoredPixels:restored,bodies,syntheticSizes:2,nativeFrame:1}))).catch(e=>{console.error(e);process.exitCode=1});
