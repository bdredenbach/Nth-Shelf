'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib');
global.PanelMatteCells=require('../../../js/panels-matte-cells.js');
global.PanelRaggedGutters=require('../../../js/panels-ragged-gutters.js');
global.PanelInterruptedGutters=require('../../../js/panels-interrupted-gutters.js');
global.PanelOrthogonalWhiteGutters=require('../../../js/panels-orthogonal-white-gutters.js');
global.PanelStructuralGrid=require('../../../js/panels-structural-grid.js');
global.PanelGeometry=require('../../../js/panels-geometry.js');
global.PanelEdgeSpill=require('../../../js/panels-edge-spill.js');
const C=require('../../../js/panels-neighbor-completion.js');C.bind();
function image({whiteBodies=true,colored=false}={}){
 const w=585,h=900,a=new Uint8ClampedArray(w*h*4).fill(255);
 const rects=[[20,20,275,435],[295,20,565,435],[20,455,275,880],[295,455,565,880]];
 for(let k=0;k<rects.length;k++){
  const [x0,y0,x1,y1]=rects[k],cx=(x0+x1)/2,cy=(y0+y1)/2;
  for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){
   let v=45+(x*7+y*11+k*13)%140;
   if(whiteBodies&&((x-cx)/90)**2+((y-cy)/85)**2<1)v=250;
   const i=(y*w+x)*4;a[i]=v;a[i+1]=v;a[i+2]=v;
  }
 }
 if(colored)for(let y=0;y<h;y++)for(let x=275;x<295;x++){const i=(y*w+x)*4;a[i]=60;a[i+1]=170;a[i+2]=190;}
 return {a,w,h};
}
const f=image(),source=PanelRaggedGutters.analyzeRGBA(f.a,f.w,f.h),prior=[source[0]],before=JSON.stringify(prior),diagnostics=[];
assert.equal(source.length,4);assert(source.every(p=>PanelRaggedGutters.validPanel(p)));
const additions=C.supplementRGBA(f.a,f.w,f.h,prior,null,x=>diagnostics.push(x));
assert.equal(additions.length,2,'Only the two directly adjacent cells may be added, not a diagonal cell');
assert(additions.every(p=>C.validPanel(p)&&PanelStructuralGrid.validPanel(p)));
assert.equal(JSON.stringify(prior),before);assert.equal(diagnostics[0].accepted,2);
assert.equal(C.supplementRGBA(f.a,f.w,f.h,source).length,0,'Existing complete maps must remain exact');
assert.equal(C.supplementRGBA(f.a,f.w,f.h,[]).length,0,'No neighbor is not sufficient evidence');
assert.equal(C.eligible([{}]),false);
const specialized=PanelOrthogonalWhiteGutters.refinePanels(source);
assert.equal(specialized.length,4);assert(C.eligible(specialized),'Identical contours must not lose eligibility after proof26 promotion');
const noBodies=image({whiteBodies:false});const noBodyPrior=PanelRaggedGutters.analyzeRGBA(noBodies.a,585,900);
assert.equal(C.supplementRGBA(noBodies.a,585,900,[noBodyPrior[0]]).length,0,'This speech-heavy exception must not widen ordinary low-evidence scenes');
const fixture=JSON.parse(zlib.gunzipSync(Buffer.from(fs.readFileSync(path.join(__dirname,'neighbor-geometry.json.gz.b64'),'utf8'),'base64')));
assert(C.validPanel(fixture));assert(PanelStructuralGrid.validPanel(fixture));
assert.equal(PanelEdgeSpill.analyzeImage({},fixture),null);assert.equal(PanelEdgeSpill.analyzeRGBA([],0,0,fixture),null);
const clone=v=>JSON.parse(JSON.stringify(v));let rejected=0;
for(const mutate of [
 p=>p.x+=.01,p=>p.w-=.01,p=>p._contours[0][0].x+=.01,
 p=>p._structuralGridProof.version=28,p=>p._structuralGridProof.method='other',p=>p._structuralGridProof.connected=false,
 p=>p._structuralGridProof.radii=[2,6],p=>p._structuralGridProof.exactStableContours=false,p=>p._structuralGridProof.originalOwnerOverlap=1,
 p=>p._structuralGridProof.first.x+=.01,p=>p._structuralGridProof.second._structuralGridProof.seedRadius=4,
 p=>p._structuralGridProof.neighbor.x+=.01,p=>p._structuralGridProof.shared.side=8,p=>p._structuralGridProof.shared.limit+=1,
 p=>p._structuralGridProof.shared.rays=[],p=>p._structuralGridProof.shared.rays[0][3]=0,p=>p._structuralGridProof.enclosedWhitePixels=0,
 p=>p._structuralGridProof.pixels+=1,p=>p._geometryOwner='rectangle'
]){const q=clone(fixture);mutate(q);assert.equal(C.validPanel(q),false);rejected++;}
(async()=>{
 const actual=await PanelGeometry.refine('unused',fixture);assert.deepEqual(actual,fixture);
 const detector={async detect(){return[]}};C.install(detector);const fn=detector.detect;C.install(detector);assert.equal(detector.detect,fn);assert.deepEqual(await detector.detect('unused'),[]);
 console.log(JSON.stringify({passed:true,syntheticSourceOwners:source.length,syntheticAdded:additions.length,proof26Eligible:true,oldDescriptorsUnchanged:true,tamperRejections:rejected,geometryAndSpillBindings:true,diagnostics:diagnostics[0]}));
})().catch(e=>{console.error(e);process.exitCode=1;});
