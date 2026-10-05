'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),zlib=require('node:zlib');
global.PanelMatteCells=require('../../../js/panels-matte-cells.js');
global.PanelRaggedGutters=require('../../../js/panels-ragged-gutters.js');
const D=require('../../../js/panels-local-boundary-consensus.js');
const fixtures=JSON.parse(zlib.gunzipSync(Buffer.from(fs.readFileSync(__dirname+'/geometry.json.gz.b64','utf8'),'base64')));
assert.equal(fixtures.length,4);
const mutations=[
 p=>p.x+=.001,p=>p._quad=[],p=>p._outline=[],
 p=>p._contours[0][0].x+=.001,p=>p._structuralGridProof.pixels++,
 p=>p._structuralGridProof.version=31,p=>p._structuralGridProof.method='unproved',
 p=>p._structuralGridProof.difference++,p=>p._structuralGridProof.union++,
 p=>p._structuralGridProof.boundary.samples[0]++,
 p=>p._structuralGridProof.boundary.white[0]=0,
 p=>p._structuralGridProof.boundary.exterior[0]=0,
 p=>p._structuralGridProof.boundary.edges[1]++,
 p=>p._structuralGridProof.originalOwnerOverlap=1,
 p=>p._structuralGridProof.internalDivider=true,
 p=>p._structuralGridProof.first._structuralGridProof.seedRadius=6,
 p=>p._structuralGridProof.second._structuralGridProof.coverage=0,
 p=>p._structuralGridProof.second._structuralGridProof.pixelContours[0][0][0]++,
 p=>p._structuralGridProof.radii=[2,4]
];
let rejected=0;
for(const p of fixtures){
 assert(D.validPanel(p));assert(D.validPanel(structuredClone(p)));
 for(const mutate of mutations){const q=structuredClone(p);mutate(q);assert.equal(D.validPanel(q),false);rejected++;}
}
const w=300,h=450,rgba=new Uint8ClampedArray(w*h*4);rgba.fill(255);
for(const[lo,hi]of[[10,215],[235,440]])for(let y=lo;y<hi;y++)for(let x=10;x<290;x++){
 const v=(x*13+y*19)%151+20;rgba.set([v,(v+43)%220,(v+73)%220,255],(y*w+x)*4);
}
const full=D.analyzeRGBA(rgba,w,h,[]);assert.equal(full.length,2);assert(full.every(D.validPanel));
const prior=[full[0]],before=JSON.stringify(prior),add=D.analyzeRGBA(rgba,w,h,prior);
assert.equal(add.length,1);assert.equal(JSON.stringify(prior),before);
const mask=D.raster(prior[0],w,h),newMask=D.raster(add[0],w,h);
assert(!newMask.some((v,i)=>v&&mask[i]));
assert.equal(D.analyzeRGBA(rgba,w,h,full).length,0);
assert.equal(D.analyzeRGBA(new Uint8ClampedArray(w*h*4).fill(255),w,h,[]).length,0);
const transparent=rgba.slice();transparent[3]=0;assert.equal(D.analyzeRGBA(transparent,w,h,[]).length,0);
assert.equal(D.analyzeRGBA(rgba,w,h,[{x:NaN,y:0,w:1,h:1}]).length,0);
assert.equal(D.analyzeRGBA(new Uint8ClampedArray(450*300*4),450,300,[]).length,0);
console.log(JSON.stringify({passed:true,capturedContours:fixtures.length,rejectedMutations:rejected,syntheticOwners:full.length,appendOnly:true,pixelDisjoint:true}));
