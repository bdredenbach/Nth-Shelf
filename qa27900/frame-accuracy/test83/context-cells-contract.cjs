'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),zlib=require('node:zlib');
global.PanelMatteCells=require('../../../js/panels-matte-cells.js');
global.PanelRaggedGutters=require('../../../js/panels-ragged-gutters.js');
global.PanelLocalBoundaryConsensus=require('../../../js/panels-local-boundary-consensus.js');
const D=require('../../../js/panels-context-cells.js');
const fixtures=JSON.parse(zlib.gunzipSync(Buffer.from(fs.readFileSync(__dirname+'/geometry.json.gz.b64','utf8'),'base64')));
assert.equal(fixtures.length,1);
const mutations=[
 p=>p.x+=.001,p=>p._quad=[],p=>p._outline=[],p=>p._geometryType='ragged-gutter-cells',
 p=>p._contours[0][0].x+=.001,p=>p._structuralGridProof.pixels++,
 p=>p._structuralGridProof.version=34,p=>p._structuralGridProof.method='unproved',
 p=>p._structuralGridProof.seedDifferences[0]++,p=>p._structuralGridProof.seedUnions[1]++,
 p=>p._structuralGridProof.contextDifference++,p=>p._structuralGridProof.contextUnion++,
 p=>p._structuralGridProof.contextPadding=5,p=>p._structuralGridProof.expandedWindow[0]++,
 p=>p._structuralGridProof.window[0]++,p=>p._structuralGridProof.analysisHeight++,
 p=>p._structuralGridProof.boundaries[0].samples[0]++,
 p=>p._structuralGridProof.boundaries[0].white[0]=0,
 p=>p._structuralGridProof.boundaries[1].exterior[0]=0,
 p=>p._structuralGridProof.boundaries[0].edges[0]++,
 p=>p._structuralGridProof.originalOwnerOverlap=1,p=>p._structuralGridProof.internalDivider=true,
 p=>p._structuralGridProof.sources[0]._structuralGridProof.seedRadius=6,
 p=>p._structuralGridProof.sources[1]._structuralGridProof.coverage=0,
 p=>p._structuralGridProof.sources[2]._structuralGridProof.count=1.5,
 p=>p._structuralGridProof.sources[2]._structuralGridProof.index=p._structuralGridProof.sources[2]._structuralGridProof.count,
 p=>p._structuralGridProof.sources[0]._structuralGridProof.palette.paper=false,
 p=>p._structuralGridProof.sources[3]._structuralGridProof.pixelContours[0][0][0]++,
 p=>p._structuralGridProof.radii=[2,4],p=>p._structuralGridProof.content.colored=0,
 p=>p._structuralGridProof.content.bins[0][1]++,p=>p._structuralGridProof.content.pixels++
];
let rejected=0;
for(const p of fixtures){assert(D.validPanel(p));assert(D.validPanel(structuredClone(p)));for(const mutate of mutations){const q=structuredClone(p);mutate(q);assert.equal(D.validPanel(q),false);rejected++;}}
const w=585,h=900,rgba=new Uint8ClampedArray(w*h*4).fill(255);
for(const[lo,hi]of[[10,430],[470,890]])for(let y=lo;y<hi;y++)for(let x=10;x<575;x++){
 const v=(x*13+y*19)%151+20;rgba.set([v,(v+43)%220,(v+73)%220,255],(y*w+x)*4);
}
const full=D.analyzeRGBA(rgba,w,h,[]);assert(full.length>=1);assert(full.every(D.validPanel));
const prior=[full[0]],before=JSON.stringify(prior),add=D.analyzeRGBA(rgba,w,h,prior);
assert.equal(add.length,1);assert.equal(JSON.stringify(prior),before);
const mask=PanelLocalBoundaryConsensus.raster(prior[0],w,h),newMask=PanelLocalBoundaryConsensus.raster(add[0],w,h);assert(!newMask.some((v,i)=>v&&mask[i]));
assert.equal(D.analyzeRGBA(rgba,w,h,[...prior,...add]).length,0);
assert.equal(D.analyzeRGBA(new Uint8ClampedArray(w*h*4).fill(255),w,h,[]).length,0);
const mono=rgba.slice();for(let i=0;i<mono.length;i+=4)mono[i+1]=mono[i+2]=mono[i];assert.equal(D.analyzeRGBA(mono,w,h,[]).length,0);
const flat=rgba.slice();for(let i=0;i<flat.length;i+=4)if(flat[i]!==255)flat.set([240,180,20,255],i);assert.equal(D.analyzeRGBA(flat,w,h,[]).length,0);
const transparent=rgba.slice();transparent[3]=0;assert.equal(D.analyzeRGBA(transparent,w,h,[]).length,0);
assert.equal(D.analyzeRGBA(rgba,w,h,[{x:-.1,y:0,w:1,h:1}]).length,0);
assert.equal(D.analyzeRGBA(rgba,w,h,[{x:NaN,y:0,w:1,h:1}]).length,0);
assert.equal(D.analyzeRGBA(new Uint8ClampedArray(450*300*4),450,300,[]).length,0);
const small=new Uint8ClampedArray(w*450*4);for(let y=0;y<450;y++)small.set(rgba.subarray(y*w*4,(y+1)*w*4),y*w*4);
assert.equal(PanelRaggedGutters.analyzeCooperativeRGBA(small,w,450,4).length,0);
const single=PanelRaggedGutters.analyzeContextCandidatesRGBA(small,w,450,4);assert.equal(single.length,1);assert(!PanelRaggedGutters.validPanel(single[0]));
assert.equal(PanelRaggedGutters.analyzeContextCandidatesRGBA(small,w,450,2).length,0);
assert.equal(PanelRaggedGutters.analyzeContextCandidatesRGBA(small,w,450,8).length,0);
console.log(JSON.stringify({passed:true,capturedContours:fixtures.length,rejectedMutations:rejected,singleCellOptIn:true,legacyPolicyUnchanged:true,appendOnly:true,pixelDisjoint:true}));
