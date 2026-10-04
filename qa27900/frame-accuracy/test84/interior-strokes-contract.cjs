'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),zlib=require('node:zlib');
global.PanelMatteCells=require('../../../js/panels-matte-cells.js');
global.PanelRaggedGutters=require('../../../js/panels-ragged-gutters.js');
global.PanelLocalBoundaryConsensus=require('../../../js/panels-local-boundary-consensus.js');
global.PanelContextCells=require('../../../js/panels-context-cells.js');
global.PanelNarrowInkFrames=require('../../../js/panels-narrow-ink-frames.js');
global.PanelColoredRims=require('../../../js/panels-colored-rims.js');
const D=require('../../../js/panels-interior-strokes.js');
const fixtures=JSON.parse(zlib.gunzipSync(Buffer.from(fs.readFileSync(__dirname+'/geometry.json.gz.b64','utf8'),'base64')));
assert.equal(fixtures.length,2);
const mutations=[p=>p.x+=.001,p=>p._quad=[],p=>p._outline=[],p=>p._geometryType='ragged-gutter-cells',p=>p._contours[0][0].x+=.001,
 p=>p._structuralGridProof.pixels++,p=>p._structuralGridProof.version=35,p=>p._structuralGridProof.method='unproved',
 p=>p._structuralGridProof.difference++,p=>p._structuralGridProof.union++,p=>p._structuralGridProof.box[0]++,p=>p._structuralGridProof.analysisHeight++,
 p=>p._structuralGridProof.boundary.samples[0]++,p=>p._structuralGridProof.boundary.white[0]=0,p=>p._structuralGridProof.boundary.exterior[0]=0,
 p=>p._structuralGridProof.boundary.edges[0]++,p=>p._structuralGridProof.originalOwnerOverlap=1,p=>p._structuralGridProof.originalDivider=false,
 p=>p._structuralGridProof.internalDivider=true,p=>p._structuralGridProof.enclosedInset=true,p=>p._structuralGridProof.insetChecks=[],
 p=>p._structuralGridProof.first._structuralGridProof.seedRadius=6,p=>p._structuralGridProof.second._structuralGridProof.coverage=0,
 p=>p._structuralGridProof.first._structuralGridProof.count=1.5,p=>p._structuralGridProof.first._structuralGridProof.index=p._structuralGridProof.first._structuralGridProof.count,
 p=>p._structuralGridProof.first._structuralGridProof.palette.paper=true,p=>p._structuralGridProof.second._structuralGridProof.pixelContours[0][0][0]++,
 p=>p._structuralGridProof.radii=[2,4],p=>p._structuralGridProof.content.colored=0,p=>p._structuralGridProof.content.bins[0][1]++,p=>p._structuralGridProof.content.pixels++,
 p=>p._structuralGridProof.interiorInkRuns=[],p=>p._structuralGridProof.interiorInkRuns[0].first[0]++,p=>p._structuralGridProof.interiorInkRuns[0].last[1]++,
 p=>p._structuralGridProof.interiorInkRuns[0].distances[0]=8,p=>p._structuralGridProof.interiorInkRuns[0].span++,p=>p._structuralGridProof.interiorInkRuns[0].offset++,
 p=>p._structuralGridProof.interiorInkRuns[0].slope=.03,p=>p._structuralGridProof.interiorInkRuns[0].run=Math.ceil(p._structuralGridProof.interiorInkRuns[0].span*.6),
 p=>p._structuralGridProof.interiorInkRuns[0].both=0,p=>p._structuralGridProof.interiorInkRuns[0].either=0];
let rejected=0;for(const p of fixtures){assert(D.validPanel(p));assert(D.validPanel(structuredClone(p)));for(const mutate of mutations){const q=structuredClone(p);mutate(q);assert.equal(D.validPanel(q),false);rejected++;}}
const w=585,h=900;
function scene(kind){const a=new Uint8ClampedArray(w*h*4).fill(255);for(const[lo,hi]of[[10,560],[600,850]])for(let y=lo;y<hi;y++)for(let x=10;x<575;x++){const v=(x*13+y*19)%151+20;a.set([v,(v+43)%220,(v+73)%220,255],(y*w+x)*4);}const ink=(x0,y0,x1,y1)=>{for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++)a.set([0,0,0,255],(y*w+x)*4);};
 if(kind==='inside')ink(200,655,203,785);if(kind==='reaching')ink(200,600,203,730);if(kind==='long')ink(200,615,203,835);
 if(kind==='inset'){ink(100,635,340,639);ink(100,776,340,780);ink(100,635,104,780);ink(336,635,340,780);}
 if(kind==='paper')for(let y=600;y<850;y++)for(let x=200;x<210;x++)a.set([255,255,255,255],(y*w+x)*4);
 return a;}
const rgba=scene('inside'),full=D.analyzeRGBA(rgba,w,h,[]);assert.equal(full.length,1);assert(full.every(D.validPanel));assert(full.every(p=>D.validPanel(structuredClone(p))));
const p=full[0],m=PanelLocalBoundaryConsensus.raster(p,w,h),E=PanelLocalBoundaryConsensus.pixelEvidence,P=E.paper(rgba,w,h,p._structuralGridProof.first._structuralGridProof.palette);
assert(E.internalDivider(m,rgba,P,w,h));const policy={distance:D.distanceToOutside(m,w,h),ignored:[]};assert.equal(E.internalDivider(m,rgba,P,w,h,policy),false);assert(policy.ignored.length>0);assert(E.internalDivider(m,rgba,P,w,h));
const prior=[p],before=JSON.stringify(prior);assert.equal(D.analyzeRGBA(rgba,w,h,prior).length,0);assert.equal(JSON.stringify(prior),before);
const top={x:10/w,y:10/h,w:565/w,h:550/h},add=D.analyzeRGBA(rgba,w,h,[top]);assert.equal(add.length,1);const topMask=PanelLocalBoundaryConsensus.raster(top,w,h);assert(!m.some((v,i)=>v&&topMask[i]));
for(const kind of ['reaching','long','inset'])assert.equal(D.analyzeRGBA(scene(kind),w,h,[]).length,0,kind);
// The original white-corridor veto is identical with or without ink policy.
const paper=scene('paper'),paperP=E.paper(paper,w,h,p._structuralGridProof.first._structuralGridProof.palette);assert(E.internalDivider(m,paper,paperP,w,h));assert(E.internalDivider(m,paper,paperP,w,h,{distance:policy.distance,ignored:[]}));
const mono=rgba.slice();for(let i=0;i<mono.length;i+=4)mono[i+1]=mono[i+2]=mono[i];assert.equal(D.analyzeRGBA(mono,w,h,[]).length,0);
const flat=rgba.slice();for(let i=0;i<flat.length;i+=4)if(flat[i]!==255)flat.set([240,180,20,255],i);assert.equal(D.analyzeRGBA(flat,w,h,[]).length,0);
const transparent=rgba.slice();transparent[3]=0;assert.equal(D.analyzeRGBA(transparent,w,h,[]).length,0);
assert.equal(D.analyzeRGBA(rgba,w,h,[{x:NaN,y:0,w:1,h:1}]).length,0);assert.equal(D.analyzeRGBA(rgba,w,h,[{x:-.1,y:0,w:1,h:1}]).length,0);
assert.equal(D.analyzeRGBA(new Uint8ClampedArray(450*300*4),450,300,[]).length,0);
const small=new Uint8Array(49);for(let y=1;y<6;y++)for(let x=1;x<6;x++)small[y*7+x]=1;assert.equal(D.distanceToOutside(small,7,7)[24],3);small[24]=0;assert.equal(D.distanceToOutside(small,7,7)[23],1);assert.equal(D.distanceToOutside(new Uint8Array(49).fill(1),7,7)[24],4);
console.log(JSON.stringify({passed:true,capturedContours:fixtures.length,rejectedMutations:rejected,interiorStrokes:true,boundaryReachingRejected:true,longSeparatorsRejected:true,enclosedInsetRejected:true,whiteCorridorUnchanged:true,defaultPolicyUnchanged:true,appendOnly:true,pixelDisjoint:true}));
