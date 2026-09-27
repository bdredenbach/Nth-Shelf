'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib');
global.PanelMatteCells=require('../../../js/panels-matte-cells.js');
global.PanelRaggedGutters=require('../../../js/panels-ragged-gutters.js');
global.PanelInterruptedGutters=require('../../../js/panels-interrupted-gutters.js');
const R=PanelRaggedGutters,I=PanelInterruptedGutters,S=require('../../../js/panels-structural-grid.js'),E=require('../../../js/panels-edge-spill.js');
const v=JSON.parse(zlib.gunzipSync(Buffer.from(fs.readFileSync(path.join(__dirname,'repaired-geometry.json.gz.b64'),'utf8'),'base64')));
const pts=v.pixelContours.flat(),w=v.analysisWidth,h=v.analysisHeight,x0=Math.min(...pts.map(q=>q[0])),y0=Math.min(...pts.map(q=>q[1])),x1=Math.max(...pts.map(q=>q[0])),y1=Math.max(...pts.map(q=>q[1]));
const fixture={x:x0/w,y:y0/h,w:(x1-x0)/w,h:(y1-y0)/h,_identitySource:'structural-grid-frame',_geometryOwner:'structural-grid-contours',_geometryType:v.version===19?'independent-exterior-cell':'independent-boundary-cell',_contours:v.pixelContours.map(q=>q.map(([x,y])=>({x:x/w,y:y/h}))),_structuralGridProof:v};
assert(I.validRepair(fixture));assert(R.validPanel(fixture));assert(S.validPanel(fixture));
// Full repaired masks must not invoke a second margin expansion.
assert.equal(E.analyzeImage({naturalWidth:2000,naturalHeight:3000},fixture),null);
assert.equal(E.analyzeRGBA(new Uint8Array(0),0,0,fixture),null);
const clone=x=>JSON.parse(JSON.stringify(x));let rejected=0;
for(const mutate of [p=>p.x+=.01,p=>p._structuralGridProof.interrupted.version=2,p=>p._structuralGridProof.interrupted.method='other',p=>p._structuralGridProof.interrupted.stableLimits[0]=.01,p=>p._structuralGridProof.interrupted.exactStableContours=false,p=>p._structuralGridProof.interrupted.originalOwnerOverlap=1,p=>p._structuralGridProof.interrupted.maximumEnvelopeOverlap=.50,p=>p._structuralGridProof.interrupted.sourceAlreadyDetected=true,p=>p._structuralGridProof.interrupted.corridors=[],p=>p._structuralGridProof.interrupted.corridors[0].axis=3,p=>p._structuralGridProof.interrupted.corridors[0].offset=11,p=>p._structuralGridProof.interrupted.corridors[0].flank=0,p=>p._structuralGridProof.interrupted.corridors[0].exterior=[0,0],p=>p._structuralGridProof.pixelContours[0][0][0]+=3,p=>p._contours[0][0].x+=.001]){const q=clone(fixture);mutate(q);assert.equal(I.validRepair(q),false);assert.equal(S.validPanel(q),false);rejected++;}
function page({gap=45,shift=0,colored=false}={}){
 const w=585,h=900,a=new Uint8ClampedArray(w*h*4).fill(255);
 for(let y=20;y<h-20;y++)for(let x=20;x<w-20;x++){
  const X=260+(y>=300+gap?shift:0),gutter=x>=X&&x<X+18;
  let c=gutter&&!(y>=300&&y<300+gap)?(colored?[40,150,170]:[255,255,255]):[40+(x*11+y*7)%140,70+(x*7+y*3)%140,50+(x*3+y*11)%130];
  const i=(y*w+x)*4;for(let k=0;k<3;k++)a[i+k]=c[k];
 }
 return {a,w,h};
}
const near=e=>e.axis===0&&e.pos>=260&&e.pos<278&&e.before[1]===300;
const f=page(),evidence=I.corridors(f.a,f.w,f.h).filter(near);assert(evidence.length>0,'bounded exposed gutter must produce witnesses');
for(const options of [{gap:160},{shift:60},{colored:true}]){const f=page(options);assert.equal(I.corridors(f.a,f.w,f.h).filter(near).length,0);}
// The short obstruction joins two synthetic scenes. Reconnection recovers
// one unambiguous owner; no existing owner may be mutated.
const prior=R.analyzeRGBA(f.a,f.w,f.h,null,'fallback'),frozen=JSON.stringify(prior);
const recovered=I.supplementRGBA(f.a,f.w,f.h,prior);assert.equal(recovered.length,1);assert(I.validRepair(recovered[0]));assert.equal(JSON.stringify(prior),frozen);
assert.equal(I.eligible([{}]),false);assert.equal(I.eligible([fixture]),false);
assert.deepEqual(I.supplementRGBA(new Uint8Array(4),1,1,[]),[]);
const detector={async detect(){return[{x:0,y:0,w:1,h:1}]}};const previous=detector.detect;I.install(detector);const installed=detector.detect;assert.notEqual(previous,installed);I.install(detector);assert.equal(detector.detect,installed);
(async()=>{assert.deepEqual(await detector.detect('invalid'),[{x:0,y:0,w:1,h:1}]);console.log(JSON.stringify({passed:true,syntheticRecovered:recovered.length,corridorWitnesses:evidence.length,tamperRejections:rejected,negativeCorridorFamilies:3,legacyMapsUnchanged:true,installerIdempotent:true}));})().catch(e=>{console.error(e);process.exitCode=1;});
