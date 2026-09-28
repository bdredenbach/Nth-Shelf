'use strict';
const assert=require('node:assert/strict');
global.PanelMatteCells=require('../../../js/panels-matte-cells.js');
global.PanelRaggedGutters=require('../../../js/panels-ragged-gutters.js');
const E=require('../../../js/panels-exterior-completion.js');
function image({flat=false,inkDivider=false,colored=false}={}){
 const w=500,h=750,a=new Uint8ClampedArray(w*h*4);for(let i=0;i<w*h;i++){a[4*i]=colored?90:250;a[4*i+1]=colored?30:250;a[4*i+2]=colored?150:250;a[4*i+3]=255;}
 const rects=[[0,25,475,275],[15,325,485,575]];
 for(let k=0;k<rects.length;k++){const[x0,y0,x1,y1]=rects[k];for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){const i=(y*w+x)*4,v=flat?110:60+((x*7+y*13+k*11)%150);a[i]=v;a[i+1]=Math.min(230,v+15);a[i+2]=Math.max(25,v-15);}}
 if(inkDivider)for(let y=143;y<147;y++)for(let x=0;x<475;x++){const i=(y*w+x)*4;a[i]=a[i+1]=a[i+2]=0;}
 return {a,w,h};
}
const s=image(),out=E.supplementRGBA(s.a,s.w,s.h,[]);assert.equal(out.length,2,'two independent paper cells including a page-edge cell');assert(out.every(E.validPanel));assert(out.some(p=>p.x===0));assert(out.every(p=>p._structuralGridProof.first._structuralGridProof.count===2),'raw two-cell maps supported without changing legacy map rules');
const copied=JSON.parse(JSON.stringify(out));assert(copied.every(E.validPanel),'serialized proofs validate');
const prior=[out[0]],snapshot=JSON.stringify(prior),added=E.supplementRGBA(s.a,s.w,s.h,prior);assert.equal(added.length,1);assert.equal(JSON.stringify(prior),snapshot);assert.equal(E.supplementRGBA(s.a,s.w,s.h,out).length,0,'idempotent');
for(const options of [{flat:true},{colored:true}]){const t=image(options);assert.equal(E.supplementRGBA(t.a,t.w,t.h,[]).length,0);}
const ink=image({inkDivider:true}),parts=E.supplementRGBA(ink.a,ink.w,ink.h,[]);assert(parts.every(p=>p.y>.3),'potential interior black divider is deferred');
assert.deepEqual(E.supplementRGBA(s.a,s.w,s.h,[{x:0,y:0,w:1,h:1}]),[],'reserve unclassified earlier owners');
assert.deepEqual(E.supplementRGBA(new Uint8ClampedArray(3),500,750,[]),[]);assert.deepEqual(E.supplementRGBA(s.a,0,s.h,[]),[]);
let tampered=0;const clone=v=>JSON.parse(JSON.stringify(v));
for(const mutate of [
 p=>p._structuralGridProof.version=31,p=>p._structuralGridProof.method='other',p=>p._structuralGridProof.connected=false,p=>p._structuralGridProof.originalOwnerOverlap=1,
 p=>p._structuralGridProof.internalDivider=true,p=>p._structuralGridProof.internalInkRail=true,p=>p._structuralGridProof.analysisWidth=0,p=>p._structuralGridProof.radii=[4,7],
 p=>p._structuralGridProof.first._structuralGridProof.seedRadius=2,p=>p._structuralGridProof.first._structuralGridProof.count=1,p=>p._structuralGridProof.first._structuralGridProof.variance=1,
 p=>p._structuralGridProof.first._structuralGridProof.palette.paper=false,p=>p._structuralGridProof.first._structuralGridProof.seed.pixels=1,p=>p._structuralGridProof.first._structuralGridProof.seed.box[0]=-1,
 p=>p._structuralGridProof.first._structuralGridProof.seed.splits=[{axis:7,pos:1,support:1,flank:1,score:1.1}],p=>p._structuralGridProof.first._structuralGridProof.pixels--,
 p=>p._structuralGridProof.second._contours[0][0].x+=.1,p=>p._structuralGridProof.second._structuralGridProof.pixelContours[0][0][0]++,p=>p._structuralGridProof.differencePixels++,
 p=>p._structuralGridProof.boundary.exterior[0]=Math.floor((p._structuralGridProof.boundary.samples[0]-p._structuralGridProof.boundary.edges[0])*.79),p=>p._structuralGridProof.boundary.metric='other',p=>p._structuralGridProof.unionPixels++,p=>p._structuralGridProof.pixels--,p=>p._structuralGridProof.boundary.radius=4,p=>p._structuralGridProof.boundary.samples[0]++,
 p=>p._structuralGridProof.boundary.white[0]=0,p=>p._structuralGridProof.boundary.exterior[0]=-1,p=>p._structuralGridProof.boundary.edges[0]++,
 p=>p._contours[0][0].x+=.01,p=>p.x+=.01,p=>p._identitySource='other',p=>p._geometryType='other',p=>p._geometryOwner='other',p=>p._quad=[{}, {}, {}, {}]
]){const p=clone(out[0]);mutate(p);assert.equal(E.validPanel(p),false);tampered++;}
let delegated=0;global.PanelStructuralGrid={validPanel:()=>{delegated++;return false;}};global.PanelGeometry={refine:async()=>({legacy:true})};global.PanelEdgeSpill={analyzeImage:()=>({legacy:true}),analyzeRGBA:()=>({legacy:true})};E.bind();E.bind();assert(PanelStructuralGrid.validPanel(out[0]));assert.equal(PanelEdgeSpill.analyzeImage(null,out[0]),null);assert.equal(PanelStructuralGrid.validPanel({}),false);assert.equal(delegated,1);
(async()=>{assert.deepEqual(await PanelGeometry.refine('',out[0]),out[0]);assert.deepEqual(await PanelGeometry.refine('',{}),{legacy:true});console.log(JSON.stringify({passed:true,syntheticOwners:out.length,tamperRejections:tampered,interiorInkDividerRejected:true,priorDescriptorsUnchanged:true,serializedProofs:true}));})().catch(e=>{console.error(e);process.exit(1);});
