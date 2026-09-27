'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
global.PanelMatteCells=require('../../../js/panels-matte-cells.js');
global.PanelRaggedGutters=require('../../../js/panels-ragged-gutters.js');
const D=PanelRaggedGutters,S=require('../../../js/panels-structural-grid.js');
const fixtures=JSON.parse(require('node:zlib').gunzipSync(Buffer.from(fs.readFileSync(path.join(__dirname,'continuous-gamut-geometry.json.gz.b64'),'utf8'),'base64')));
const O=vm.runInNewContext(fs.readFileSync(require.resolve('../../../js/panels-geometry-orthogonal.js'),'utf8')+';PanelGeometryOrthogonal',{PanelStructuralGrid:S,clamp01:v=>Math.max(0,Math.min(1,v))});
const Router=vm.runInNewContext(fs.readFileSync(require.resolve('../../../js/panels-geometry.js'),'utf8')+';PanelGeometry',{PanelStructuralGrid:S,PanelGeometryOrthogonal:O});
function raster(p){const v=p._structuralGridProof,w=v.analysisWidth,h=v.analysisHeight,a=new Uint8Array(w*h);for(let y=0;y<h;y++){const xs=[];for(const q of v.pixelContours)for(let k=0;k<q.length;k++){const u=q[k],v=q[(k+1)%q.length];if((u[1]>y+.5)!==(v[1]>y+.5))xs.push(u[0]);}xs.sort((a,b)=>a-b);for(let k=0;k<xs.length;k+=2)for(let x=xs[k];x<xs[k+1];x++)a[y*w+x]=1;}return a;}
assert.equal(fixtures.new.length,1);assert.equal(fixtures.baseline.length,3);let mutations=0;
for(const p of fixtures.new){
 assert(D.validPanel(p));assert(S.validPanel(p));assert.equal(JSON.stringify(O._provenContours(p)),JSON.stringify(p._contours));
 for(const change of [q=>q.x+=.01,q=>q.w-=.01,q=>q._contours[0][0].x+=.01,q=>q._structuralGridProof.pixelContours[0][0][0]++,q=>q._structuralGridProof.pixels--,q=>q._structuralGridProof.version=99,q=>q._structuralGridProof.method='wrong',q=>q._structuralGridProof.recovery.mode='wrong',q=>q._structuralGridProof.recovery.sourceCount=0,q=>q._structuralGridProof.count=0,q=>q._structuralGridProof.index=99,q=>q._structuralGridProof.coverage=0,q=>q._structuralGridProof.seed.pixels=0,q=>q._structuralGridProof.palette.edgeMatched=0,q=>q._structuralGridProof.palette.colors[0][0]++,q=>q._structuralGridProof.gamut.method='wrong',q=>q._structuralGridProof.gamut.tolerance=30,q=>q._structuralGridProof.gamut.maximumLength=900,q=>q._structuralGridProof.gamut.baseExteriorPixels++,q=>q._structuralGridProof.gamut.additionalExteriorPixels=0,q=>q._structuralGridProof.gamut.segments[0].norm++,q=>q._structuralGridProof.gamut.segments[0].delta[0]++,q=>q._structuralGridProof.gamut.segments=[],q=>q._structuralGridProof.seedRadius=4,q=>q._quad=[{x:0,y:0}],q=>q._geometryOwner='rectangle']){
  const q=structuredClone(p);change(q);assert(!D.validPanel(q));assert.equal(O._provenContours(q),null);mutations++;
 }
 const m=raster(p),w=p._structuralGridProof.analysisWidth;
 // Scene centers, all connected balloon bodies, edge artwork, and foreign
 // scene/gutter probes were chosen visually from the original full page.
 for(const [x,y] of [[85,270],[132,253],[59,40],[80,155],[29,383],[143,400],[82,438]])assert(m[y*w+x]);
 for(const [x,y] of [[154,300],[77,480],[173,245]])assert(!m[y*w+x]);
 for(const retained of fixtures.baseline){assert(D.validPanel(retained));const r=raster(retained);assert(m.every((v,i)=>!v||!r[i]),'new and retained masks must be pixel-disjoint');}
}
function source(w,h){
 const a=new Uint8ClampedArray(w*h*4),boxes=[[.04,.06,.46,.47],[.52,.06,.96,.47],[.04,.54,.96,.95]];
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const t=(x+y)/(w+h);a.set([3,Math.round(180-105*t),Math.round(248-130*t),255],(y*w+x)*4);}
 for(const b of boxes)for(let y=Math.round(b[1]*h);y<Math.round(b[3]*h);y++)for(let x=Math.round(b[0]*w);x<Math.round(b[2]*w);x++){
  const border=x<Math.round(b[0]*w)+4||x>=Math.round(b[2]*w)-4||y<Math.round(b[1]*h)+4||y>=Math.round(b[3]*h)-4,v=border?25:(x+y)%23<11?60:150;a.set([v,v+7,v+20,255],(y*w+x)*4);
 }
 const cx=Math.round(w*.20),cy=Math.round(h*.065),r=Math.round(w*.04);
 for(let y=cy-r;y<=cy+r;y++)for(let x=cx-r;x<=cx+r;x++)if((x-cx)**2+(y-cy)**2<=r*r){const d=(x-cx)**2+(y-cy)**2,ink=d>(r-2)**2||Math.abs(x-cx)<r*.6&&Math.abs(y-cy)<r*.3&&x%8<3;a.set(ink?[20,20,20,255]:[255,255,255,255],(y*w+x)*4);}
 // Same-blue artwork is fully enclosed by its own dark frame. Exterior
 // interpolation must never carve that artwork out or merge its neighbor.
 for(let y=Math.round(h*.23);y<Math.round(h*.3);y++)for(let x=Math.round(w*.65);x<Math.round(w*.77);x++)a.set([3,Math.round(180-105*(x+y)/(w+h)),Math.round(248-130*(x+y)/(w+h)),255],(y*w+x)*4);
 return {a,cx,cy,r};
}
for(const [w,h] of [[600,900],[500,760]]){
 const {a,cx,cy,r}=source(w,h),p=D.continuousCandidatesRGBA(a,w,h);assert.equal(p.length,3);assert(p.every(D.validPanel));const masks=p.map(raster);
 for(let y=cy-r;y<=cy+r;y++)for(let x=cx-r;x<=cx+r;x++)if((x-cx)**2+(y-cy)**2<=r*r)assert(masks[0][y*w+x],'entire balloon including lettering belongs to first frame');
 for(let y=Math.round(h*.23);y<Math.round(h*.3);y++)for(let x=Math.round(w*.65);x<Math.round(w*.77);x++)assert(masks[1][y*w+x],'matching-color interior artwork is preserved');
 for(let k=0;k<3;k++)for(let j=k+1;j<3;j++)assert(masks[k].every((v,i)=>!v||!masks[j][i]));
 const before=JSON.stringify(p.slice(0,1)),add=D.supplementContinuousRGBA(a,w,h,p.slice(0,1));assert.equal(add.length,2);assert.equal(JSON.stringify(p.slice(0,1)),before);
 assert.equal(D.supplementContinuousRGBA(a,w,h,p).length,0,'existing owners are never replaced or duplicated');
 assert.equal(D.supplementContinuousRGBA(a,w,h,[{x:0,y:0,w:1,h:1}]).length,0,'unproved competing maps retain priority');
 const foreign=new Uint8ClampedArray(w*h*4);for(let y=0;y<h;y++)for(let x=0;x<w;x++){const colors=[[230,20,20,255],[20,220,20,255],[20,20,230,255]];foreign.set(colors[Math.floor(x*3/w)],(y*w+x)*4);}assert.equal(D.continuousCandidatesRGBA(foreign,w,h).length,0,'unrelated color families are not interpolated');
 const white=new Uint8ClampedArray(w*h*4).fill(255);assert.equal(D.continuousCandidatesRGBA(white,w,h).length,0);
}
Promise.all(fixtures.new.map(async p=>{const q=await Router.refine('unused',p);assert(D.validPanel(q));assert(S.validPanel(q));assert.equal(JSON.stringify(O._provenContours(q)),JSON.stringify(p._contours));})).then(()=>console.log(JSON.stringify({passed:true,proofs:fixtures.new.length,retainedOwners:fixtures.baseline.length,mutations,syntheticSizes:2}))).catch(e=>{console.error(e);process.exitCode=1});
