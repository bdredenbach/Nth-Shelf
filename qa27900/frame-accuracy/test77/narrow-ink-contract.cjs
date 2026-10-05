'use strict';
global.PanelMatteCells=require('../../../js/panels-matte-cells.js');
const assert=require('node:assert/strict'),D=require('../../../js/panels-narrow-ink-frames.js');
function image({open=false,flat=false,broad=false,divider=false}={}){
 const w=500,h=750,a=new Uint8ClampedArray(w*h*4);for(let i=0;i<w*h;i++){a[i*4]=155;a[i*4+1]=166;a[i*4+2]=147;a[i*4+3]=255;}
 for(const [x0,y0,x1,y1] of [[35,35,235,235],[275,455,465,695]]){
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){let v=flat?160:92+(x*13+y*11)%145;const t=broad?30:3;let border=x<x0+t||x>x1-t||y<y0+t||y>y1-t;
   if(open&&x>x1-t&&y>y0+25&&y<y1-25)border=false;
   if(divider&&Math.abs(x-(x0+x1)/2)<2)border=true;
   if(border)v=20;const i=(y*w+x)*4;a[i]=v;a[i+1]=border?v:Math.min(255,v+17);a[i+2]=border?v:Math.max(0,v-23);
  }
 }
 return {a,w,h};
}
const f=image(),ps=D.analyzeRGBA(f.a,f.w,f.h);assert.equal(ps.length,2);assert(ps.every(D.validPanel));assert(ps.every(p=>p._structuralGridProof.version===33));
assert.equal(D.analyzeRGBA(image({open:true}).a,500,750).length,0);
assert.equal(D.analyzeRGBA(image({flat:true}).a,500,750).length,0);
assert.equal(D.analyzeRGBA(image({broad:true}).a,500,750).length,0);
const occupied=JSON.parse(JSON.stringify(ps));const snapshot=JSON.stringify(occupied);assert.equal(D.analyzeRGBA(f.a,f.w,f.h,occupied).length,0);assert.equal(JSON.stringify(occupied),snapshot);
assert.equal(D.analyzeRGBA(f.a,0,750).length,0);assert.equal(D.analyzeRGBA(null,500,750).length,0);
const mono=f.a.slice();for(let i=0;i<mono.length;i+=4)mono[i+1]=mono[i+2]=mono[i];assert.equal(D.analyzeRGBA(mono,500,750).length,0,'framed black/white copyright text is not a colour-comic panel');
const changes=[p=>p._structuralGridProof.safetyInset=0,p=>p._structuralGridProof.version=32,p=>p._structuralGridProof.method='wrong',p=>p._structuralGridProof.connected=false,p=>p._structuralGridProof.originalOwnerOverlap=1,p=>p._structuralGridProof.boundaries.sides[0][0]+=20,p=>p._structuralGridProof.variance=0,p=>p._structuralGridProof.railBox[0]++,p=>p._structuralGridProof.box[1]++,p=>p._structuralGridProof.rails[0].dark--,p=>p._structuralGridProof.rails[1].narrow--,p=>p._structuralGridProof.rails[0].samples--,p=>p._structuralGridProof.rails[0].values[0][0]=256,p=>p._structuralGridProof.pixelContours[0][0][0]++,p=>p.x+=.01,p=>p._contours[0][1].y+=.01,p=>p._geometryOwner='unproved',p=>p._geometryType='unproved',p=>p._quad=[{x:0,y:0}]];
for(const change of changes){const p=JSON.parse(JSON.stringify(ps[0]));change(p);assert.equal(D.validPanel(p),false);}
// Proof-version routing: Test76 owns version32; Test77 must delegate it.
const proof32={_structuralGridProof:{version:32,method:'two-core-stable-chromatic-shared-border'},test76:true};
global.PanelStructuralGrid={validPanel:p=>p?.sentinel===true||p?.test76===true};
global.PanelGeometry={refine:async(u,p)=>({...p,delegated:true})};
global.PanelEdgeSpill={analyzeImage:()=>({delegate:true}),analyzeRGBA:()=>({delegate:true})};
D.bind();
assert(PanelStructuralGrid.validPanel({sentinel:true}));
assert(PanelStructuralGrid.validPanel(proof32),'Test76 proof32 must delegate through Test77');
assert(PanelStructuralGrid.validPanel(ps[0]));
assert.equal(PanelEdgeSpill.analyzeImage({},ps[0]),null);
assert.deepEqual(PanelEdgeSpill.analyzeImage({},proof32),{delegate:true});
(async()=>{assert.deepEqual(await PanelGeometry.refine('',ps[0]),ps[0]);assert((await PanelGeometry.refine('',proof32)).delegated);console.log(JSON.stringify({passed:true,syntheticOwners:2,proofVersion:33,tamperRejections:changes.length,openBorderRejected:true,broadDarkFieldRejected:true,flatInteriorRejected:true,priorOwnerVeto:true,test76Proof32Delegates:true}));})().catch(e=>{console.error(e);process.exit(1)});
