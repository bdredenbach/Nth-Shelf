'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const M=require('../../../js/panels-matte-cells.js'),fixtures=JSON.parse(require('node:zlib').gunzipSync(Buffer.from(fs.readFileSync(require('node:path').join(__dirname,'geometry.json.gz.b64'),'utf8'),'base64')));
const O=vm.runInNewContext(fs.readFileSync(require.resolve('../../../js/panels-geometry-orthogonal.js'),'utf8')+';PanelGeometryOrthogonal',{PanelMatteCells:M,clamp01:v=>Math.max(0,Math.min(1,v))});
const Router=vm.runInNewContext(fs.readFileSync(require.resolve('../../../js/panels-geometry.js'),'utf8')+';PanelGeometry',{PanelMatteCells:M,PanelGeometryOrthogonal:O});
function pixels(rings,w,h){
 const mask=new Uint8Array(w*h);
 // Independent scan conversion: count rightward ray crossings at each pixel.
 for(let y=0;y<h;y++){const events=new Int32Array(w+1);for(const ring of rings)for(let k=0;k<ring.length;k++){const a=ring[k],b=ring[(k+1)%ring.length];if(a[0]===b[0]&&y>=Math.min(a[1],b[1])&&y<Math.max(a[1],b[1]))events[a[0]]++;}let parity=0;for(let x=0;x<w;x++){parity^=events[x]%2;mask[y*w+x]=parity;}}
 return mask;
}
assert.equal(fixtures.length,13);let mutations=0,unionPixels=0;
for(const p of fixtures){
 assert(M.validPanel(p));assert.equal(JSON.stringify(O._provenContours(p)),JSON.stringify(p._contours));
 for(const change of [q=>q.x+=.01,q=>q.w-=.01,q=>q._contours[0][0].x+=.01,q=>q._matteCellProof.pixelContours[0][0][0]++,q=>q._matteCellProof.pixels--,q=>q._matteCellProof.version=99,q=>q._matteCellProof.method='wrong',q=>q._matteCellProof.radii=[1,3],q=>q._matteCellProof.parent.x+=.01,q=>q._matteCellProof.parent._matteCellProof.version=3,q=>q._matteCellProof.parent._matteCellProof.source='split',q=>q._matteCellProof.count=0,q=>q._matteCellProof.index=99,q=>q._matteCellProof.contacts++,q=>q._matteCellProof.thickness++,q=>q._quad=[{x:0,y:0}],q=>q._geometryOwner='rectangle']){
  const q=structuredClone(p);change(q);assert(!M.validPanel(q));assert.equal(O._provenContours(q),null);mutations++;
 }
}
const parents=[...new Map(fixtures.map(p=>[JSON.stringify(p._matteCellProof.parent),p._matteCellProof.parent])).values()];assert.equal(parents.length,6);
for(const parent of parents){
 const unchanged={x:.1,y:.1,w:.1,h:.1},out=M.refinePanels([unchanged,parent]);assert.equal(out[0],unchanged);
 const proof=parent._matteCellProof,w=proof.analysisWidth,h=proof.analysisHeight,original=pixels(proof.pixelContours,w,h),sum=new Uint8Array(w*h);
 for(const child of out.slice(1)){const mask=pixels(child._matteCellProof.pixelContours,w,h);for(let i=0;i<sum.length;i++)sum[i]+=mask[i];}
 assert.deepEqual(sum,original,'children must be disjoint and exactly equal their parent');unionPixels+=original.reduce((a,b)=>a+b,0);
 assert.equal(JSON.stringify(M.refinePanels(out)),JSON.stringify(out),'refinement must be idempotent');
}
function synthetic(w,h,neck){
 const mask=new Uint16Array(w*h),rect=(x0,y0,x1,y1,v=1)=>{for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++)mask[y*w+x]=v;};
 const x0=30,x1=w-30,mid=h>>1;rect(x0,40,x1,mid-15);rect(x0,mid+15,x1,h-40);
 if(neck)rect(w/2|0,mid-15,(w/2|0)+neck,mid+15);
 // A retained interior hole and narrow tip must not be filled or trimmed.
 rect(70,90,90,110,0);rect(25,60,30,61);
 const rings=M.tracePixelContours(mask,w,h,1),pts=rings.flat(),xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]),b=[Math.min(...xs),Math.min(...ys),Math.max(...xs),Math.max(...ys)];
 return {x:b[0]/w,y:b[1]/h,w:(b[2]-b[0])/w,h:(b[3]-b[1])/h,_identitySource:'matte-cell-frame',_geometryOwner:'matte-cell-contours',_geometryType:'edge-connected-matte-cell',_contours:rings.map(q=>q.map(([x,y])=>({x:x/w,y:y/h}))),_matteCellProof:{version:1,method:'edge-connected-matte-cells-v1',mode:'paper',analysisWidth:w,analysisHeight:h,edgeColor:[255,255,255],edgeSamples:1000,edgeMatched:1000,exteriorPixels:w*h-mask.reduce((a,b)=>a+b,0),source:'component',pixels:mask.reduce((a,b)=>a+b,0),mean:120,variance:2500,dark:1000,light:1000,pixelContours:rings}};
}
for(const [w,h] of [[600,900],[500,760]]){
 const separated=synthetic(w,h,0);assert(M.validPanel(separated));assert.equal(M.refinePanels([separated]).length,2);
 const narrow=synthetic(w,h,1);assert.equal(M.refinePanels([narrow]).length,2);
 const broad=synthetic(w,h,20);assert.equal(M.refinePanels([broad])[0],broad,'broad artwork connections must remain intact');
 const single=M.refinePanels([separated])[0];assert.equal(M.refinePanels([single])[0],single);
}
Promise.all(fixtures.map(async p=>{const q=await Router.refine('unused',p);assert(M.validPanel(q));assert.equal(JSON.stringify(O._provenContours(q)),JSON.stringify(p._contours));})).then(()=>console.log(JSON.stringify({passed:true,proofs:fixtures.length,mutations,exactUnionPixels:unionPixels,parents:parents.length,syntheticSizes:2}))).catch(e=>{console.error(e);process.exitCode=1});
