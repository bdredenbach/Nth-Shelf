'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib');
global.PanelMatteCells=require('../../../js/panels-matte-cells.js');
global.PanelRaggedGutters=require('../../../js/panels-ragged-gutters.js');
global.PanelStructuralGrid=require('../../../js/panels-structural-grid.js');
global.PanelGeometry=require('../../../js/panels-geometry.js');
global.PanelEdgeSpill=require('../../../js/panels-edge-spill.js');
global.PanelNeighborCompletion=require('../../../js/panels-neighbor-completion.js');PanelNeighborCompletion.bind();
const D=require('../../../js/panels-shared-boundaries.js');D.bind();
function page(mode='grid'){
 const w=400,h=600,a=new Uint8ClampedArray(w*h*4).fill(255);
 const boxes=mode==='grid'?[[20,20,190,280],[210,20,380,280],[20,300,190,570],[210,300,380,570]]:[[20,20,130,290],[145,20,255,290],[270,20,380,290],[20,310,380,490]];
 for(const [x0,y0,x1,y1] of boxes)for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){const i=(y*w+x)*4,v=45+(7*x+11*y)%140;a[i]=v;a[i+1]=v+12;a[i+2]=v-5;}
 return {a,w,h};
}
const f=page(),r4=PanelRaggedGutters.analyzeCooperativeRGBA(f.a,400,600,4),r6=PanelRaggedGutters.analyzeCooperativeRGBA(f.a,400,600,6),r8=PanelRaggedGutters.analyzeCooperativeRGBA(f.a,400,600,8);
assert.deepEqual([r4.length,r6.length,r8.length],[4,4,4]);assert(r8.every(p=>PanelRaggedGutters.validPanel(p)),'Radius8 is generated AND validated');
assert.deepEqual(PanelRaggedGutters.analyzeRGBA(f.a,400,600,null,false,false,8),[],'Radius8 remains opt-in for cooperative generation');
const prior=[r4[0]],before=JSON.stringify(prior),diag=[];
const out=D.supplementRGBA(f.a,400,600,prior,null,x=>diag.push(x));
assert.equal(out.length,3,'Two direct neighbors plus one rooted diagonal descendant');
assert.equal(out.filter(p=>p._structuralGridProof.depth===1).length,2);
assert.equal(out.filter(p=>p._structuralGridProof.depth===2).length,1);
assert(out.every(p=>D.validPanel(p)&&PanelStructuralGrid.validPanel(p)));
assert.equal(JSON.stringify(prior),before);
assert.deepEqual(D.supplementRGBA(f.a,400,600,[]),[],'An unrooted candidate group must not justify itself');
assert.deepEqual(D.supplementRGBA(f.a,400,600,r4),[],'A complete map must not change');
assert.equal(D.eligible([{}]),false);assert.equal(D.eligible([]),false);
const g=page('wide'),s=PanelRaggedGutters.analyzeCooperativeRGBA(g.a,400,600,4);
assert.equal(s.length,4);
const combined=D.supplementRGBA(g.a,400,600,s.slice(0,3));
assert.equal(combined.length,1);assert.equal(combined[0]._structuralGridProof.shared.neighbors.length,3,'Three smaller neighbors collectively witness the wide boundary');
const fromOne=D.supplementRGBA(g.a,400,600,[s[0]]);const wideDescendant=fromOne.find(p=>p.w>.8);assert(wideDescendant&&wideDescendant._structuralGridProof.depth>1,'One small root may reach the wide scene only after independently proving additional neighbors');
// A differently colored bar is not a white corridor, even when it is narrow.
const colored=g.a.slice();for(let y=290;y<310;y++)for(let x=0;x<400;x++){const i=(y*400+x)*4;colored[i]=50;colored[i+1]=130;colored[i+2]=190;}
assert.deepEqual(D.supplementRGBA(colored,400,600,s.slice(0,3)),[]);
const fixtures=JSON.parse(zlib.brotliDecompressSync(Buffer.from(Array.from({length:13},(_,i)=>fs.readFileSync(path.join(__dirname,'fixture',String(i).padStart(2,'0')+'.b64'),'utf8')).join(''),'base64')));
assert.equal(fixtures.length,1);assert(fixtures.every(p=>D.validPanel(p)));
const copy=v=>JSON.parse(JSON.stringify(v));let tampered=0;
for(const mut of [
 p=>p.x+=.01,p=>p.h-=.01,p=>p._contours[0][0].x+=.01,
 p=>p._geometryOwner='rectangle',p=>p._geometryType='other',p=>p._structuralGridProof.version=28,
 p=>p._structuralGridProof.method='other',p=>p._structuralGridProof.connected=false,
 p=>p._structuralGridProof.radii=[2,6],p=>p._structuralGridProof.depth=0,p=>p._structuralGridProof.depth=4,
 p=>p._structuralGridProof.originalOwnerOverlap=1,p=>p._structuralGridProof.stability.differencePixels++,
 p=>p._structuralGridProof.stability.pixels--,p=>p._structuralGridProof.stability.boundaryRadius=4,
 p=>p._structuralGridProof.blockers=[],p=>p._structuralGridProof.first.x+=.01,
 p=>p._structuralGridProof.second._structuralGridProof.seedRadius=4,
 p=>p._structuralGridProof.shared.side=4,p=>p._structuralGridProof.shared.limit++,
 p=>p._structuralGridProof.shared.rays=[],p=>p._structuralGridProof.shared.rays[0][3]=0,
 p=>p._structuralGridProof.shared.rays[0][5]=90,p=>p._structuralGridProof.shared.samples++,
 p=>p._structuralGridProof.shared.neighbors=[],p=>p._structuralGridProof.shared.neighbors[0].x+=.01
]){const p=copy(fixtures[0]);mut(p);assert.equal(D.validPanel(p),false);tampered++;}
const cyclic=copy(fixtures[0]);cyclic._structuralGridProof.shared.neighbors[0]=cyclic;assert.equal(D.validPanel(cyclic),false);
(async()=>{
 for(const p of fixtures){assert.deepEqual(await PanelGeometry.refine('unused',p),p);assert.equal(PanelEdgeSpill.analyzeImage({},p),null);}
 const detector={async detect(){return[];}};D.install(detector);const fn=detector.detect;D.install(detector);assert.equal(detector.detect,fn);assert.deepEqual(await detector.detect('unused'),[]);
 console.log(JSON.stringify({passed:true,radius8Candidates:r8.length,rootedGridAdditions:out.length,combinedNeighbors:combined[0]._structuralGridProof.shared.neighbors.length,realGeometryFixtures:fixtures.length,tamperRejections:tampered+1,priorDescriptorsUnchanged:true}));
})().catch(e=>{console.error(e);process.exitCode=1;});
