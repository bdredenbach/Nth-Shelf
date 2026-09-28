'use strict';
const assert=require('node:assert/strict');
global.PanelMatteCells=require('../../../js/panels-matte-cells.js');
global.PanelRaggedGutters=require('../../../js/panels-ragged-gutters.js');
const D=require('../../../js/panels-edge-guided-paper.js');
function image({flat=false,divider=false}={}){
 const w=500,h=750,a=new Uint8ClampedArray(w*h*4);a.fill(255);
 const set=(x,y,c)=>{const i=(y*w+x)*4;for(let k=0;k<3;k++)a[i+k]=c[k];};
 for(const [k,b] of [[0,[0,20,500,230]],[1,[0,245,500,730]]])for(let y=b[1];y<b[3];y++)for(let x=b[0];x<b[2];x++){
  const v=flat?100:50+((x*7+y*11)%150);set(x,y,k?[v,v,Math.max(10,v-20)]:[v,Math.min(230,v+30),Math.max(10,v-10)]);
 }
 for(let y=219;y<700;y++)for(let x=30;x<120;x++){
  const r=Math.hypot(x-70,y-260),inside=r<40||(Math.abs(x-70)<12&&y>260);
  if(inside)set(x,y,flat?[100,100,100]:r>37&&y<295?[3,3,3]:[82,90,100]);
 }
 if(divider)for(let y=20;y<230;y++)for(let x=248;x<252;x++)set(x,y,[255,255,255]);
 return{a,w,h};
}
function inside(p,x,y){let b=false;for(const q of p._contours)for(let j=0,k=q.length-1;j<q.length;k=j++){const a=q[j],c=q[k];if((a.y>y)!==(c.y>y)&&x<(c.x-a.x)*(y-a.y)/(c.y-a.y)+a.x)b=!b;}return b;}
const f=image(),out=D.supplementRGBA(f.a,f.w,f.h,[]);
assert.equal(out.length,2);assert(out.every(D.validPanel));
const top=out.find(p=>inside(p,.5,.15)),bottom=out.find(p=>inside(p,.5,.7));assert(top&&bottom&&top!==bottom);
assert(!inside(top,70/500,225/750));assert(inside(bottom,70/500,225/750),'the protruding object follows its lower scene');
assert(out.every(p=>Object.isFrozen(p._structuralGridProof)&&Object.isFrozen(p._structuralGridProof.gradientSamples)));
assert.deepEqual(D.supplementRGBA(f.a,f.w,f.h,[{x:0,y:0,w:1,h:1}]),[],'reserve existing ownership');
const prior=[top],before=JSON.stringify(prior);const add=D.supplementRGBA(f.a,f.w,f.h,prior);assert.equal(add.length,1);assert.equal(JSON.stringify(prior),before);
assert.equal(D.supplementRGBA(f.a,f.w,f.h,out).length,0,'already completed maps are idempotent');
const flat=image({flat:true});assert.equal(D.supplementRGBA(flat.a,flat.w,flat.h,[]).length,0,'flat art is not independent frame evidence');
const div=image({divider:true}),parts=D.supplementRGBA(div.a,div.w,div.h,[]);assert(parts.every(p=>!(inside(p,.30,.15)&&inside(p,.70,.15))),'a real interior white divider is not swallowed');
assert.deepEqual(D.supplementRGBA(new Uint8Array(1),500,750,[]),[]);assert.deepEqual(D.supplementRGBA(f.a,901,750,[]),[]);const transparent=f.a.slice();transparent[3]=0;assert.deepEqual(D.supplementRGBA(transparent,500,750,[]),[]);
const clone=x=>JSON.parse(JSON.stringify(x));assert(out.map(clone).every(D.validPanel));let rejected=0;
for(const mutate of [
 p=>p._structuralGridProof.version=32,p=>p._structuralGridProof.method='other',p=>p._structuralGridProof.connected=false,
 p=>p._structuralGridProof.originalOwnerOverlap=1,p=>p._structuralGridProof.internalDivider=true,p=>p._structuralGridProof.internalInkRail=true,p=>p._structuralGridProof.internalWhiteRail=true,
 p=>p._structuralGridProof.analysisWidth=0,p=>p._structuralGridProof.radii=[4,8],p=>p._structuralGridProof.windowRadii[0]++,p=>p._structuralGridProof.selectedIndex=-1,
 p=>p._structuralGridProof.first[0]._structuralGridProof.seedRadius=2,p=>p._structuralGridProof.first[0]._structuralGridProof.palette.paper=false,
 p=>p._structuralGridProof.first[0]._structuralGridProof.count=1,p=>p._structuralGridProof.first[0]._structuralGridProof.pixels--,
 p=>p._structuralGridProof.first[0]._structuralGridProof.seed.pixels=0,p=>p._structuralGridProof.first[0]._structuralGridProof.seed.box[0]=-1,
 p=>p._structuralGridProof.first[0]._contours[0][0].x+=.01,p=>p._structuralGridProof.second.pop(),
 p=>p._structuralGridProof.gradientSamples.pop(),p=>p._structuralGridProof.gradientSamples[0][0]=-1,p=>p._structuralGridProof.gradientSamples[1][0]=p._structuralGridProof.gradientSamples[0][0],
 p=>p._structuralGridProof.gradientSamples[0][1]=7,p=>p._structuralGridProof.gradientSamples.forEach(q=>q[1]=0),
 p=>p._structuralGridProof.contacts[0]++,p=>p._structuralGridProof.windowPixels[0]++,p=>p._structuralGridProof.changedPixels[0]++,p=>p._structuralGridProof.pixels--,
 p=>p._structuralGridProof.boundary.mixed[0]=0,p=>p._structuralGridProof.boundary.samples[0]++,p=>p._structuralGridProof.boundary.ink[0]++,
 p=>p._structuralGridProof.pixelContours[0][0][0]++,p=>p._contours[0][0].x+=.01,p=>p.x+=.01,p=>p._identitySource='other',p=>p._geometryOwner='other',p=>p._geometryType='other',p=>p._quad=[{},{},{},{}]
]){const p=clone(top);mutate(p);assert.equal(D.validPanel(p),false);rejected++;}
let called=0;global.PanelStructuralGrid={validPanel:()=>{called++;return false;}};global.PanelGeometry={refine:async()=>({legacy:true})};global.PanelEdgeSpill={analyzeImage:()=>({legacy:true}),analyzeRGBA:()=>({legacy:true})};D.bind();D.bind();assert(PanelStructuralGrid.validPanel(top));assert(!PanelStructuralGrid.validPanel({}));assert.equal(called,1);assert.equal(PanelEdgeSpill.analyzeImage(null,top),null);
(async()=>{assert.deepEqual(await PanelGeometry.refine('',top),top);assert.deepEqual(await PanelGeometry.refine('',{}),{legacy:true});console.log(JSON.stringify({passed:true,syntheticFrames:out.length,proofTamperRejections:rejected,oldDescriptorsPreserved:true,protrudingObjectAssignedToLowerScene:true,serializedProofs:true}));})().catch(e=>{console.error(e);process.exit(1);});
