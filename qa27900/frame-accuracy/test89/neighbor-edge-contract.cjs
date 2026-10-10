'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib');
const root=path.resolve(__dirname,'../../..'),scripts=[...fs.readFileSync(root+'/index.html','utf8').matchAll(/src="(js\/(?!terminal-native-bootstrap\.js)(?:panels|terminal)[^\"]*\.js)"/g)].map(m=>m[1]);
const api=new Function('document','Image','window',scripts.map(p=>fs.readFileSync(path.join(root,p),'utf8')).join('\n')+'\nreturn{PanelNeighborEdgeCells,PanelRaggedGutters,PanelStructuralGrid,PanelLocalBoundaryConsensus};')({},class{},{});
const D=api.PanelNeighborEdgeCells,fixtures=JSON.parse(zlib.gunzipSync(Buffer.from(fs.readFileSync(__dirname+'/geometry.json.gz.b64','utf8'),'base64')));
const mutations=[
 p=>p.x+=.001,p=>p._quad=[],p=>p._outline=[],p=>p._geometryType='ragged-gutter-cells',
 p=>p._contours[0][0].x+=.001,p=>p._structuralGridProof.pixels++,
 p=>p._structuralGridProof.version=40,p=>p._structuralGridProof.method='unproved',
 p=>p._structuralGridProof.difference++,p=>p._structuralGridProof.union++,
 p=>p._structuralGridProof.boundary.samples[0]++,p=>p._structuralGridProof.boundary.white[0]=0,
 p=>p._structuralGridProof.boundary.exterior[0]=0,p=>p._structuralGridProof.boundary.edges[0]++,
 p=>p._structuralGridProof.originalOwnerOverlap=1,p=>p._structuralGridProof.internalDivider=true,
 p=>p._structuralGridProof.first._structuralGridProof.seedRadius=6,
 p=>p._structuralGridProof.second._structuralGridProof.coverage=0,
 p=>p._structuralGridProof.first._structuralGridProof.palette.paper=false,
 p=>p._structuralGridProof.second._structuralGridProof.pixelContours[0][0][0]++,
 p=>p._structuralGridProof.radii=[2,4],p=>p._structuralGridProof.content.colored=0,
 p=>p._structuralGridProof.neighbor.x+=.01,p=>p._structuralGridProof.neighborRelation.gap+=.01,
 p=>p._structuralGridProof.neighbor._structuralGridProof.version=41,
 p=>p._structuralGridProof.neighborRelation=null,p=>p._structuralGridProof.enclosedInset=true,
 p=>p._structuralGridProof.insetChecks=[]
];
let rejected=0;
for(const p of fixtures){assert(D.validPanel(p));assert(api.PanelStructuralGrid.validPanel(p));for(const mutate of mutations){const q=structuredClone(p);mutate(q);assert.equal(D.validPanel(q),false);rejected++;}}
const w=450,h=350,rgba=new Uint8ClampedArray(w*h*4).fill(255);
function frame(x0,y0,x1,y1,seed){for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){const v=(x*13+y*19+seed)%151+20;rgba.set([v,(v+43)%220,(v+73)%220,255],(y*w+x)*4);}}
frame(20,10,365,70,1);frame(20,90,350,270,2);frame(369,10,450,350,3);
const base=api.PanelRaggedGutters.analyzeRGBA(rgba,w,h),anchor=base.find(p=>p.w>.5&&p.h<.25);
assert(anchor,'Synthetic accepted neighbor');assert(api.PanelStructuralGrid.validPanel(anchor));
const prior=[anchor],before=JSON.stringify(prior),add=D.analyzeRGBA(rgba,w,h,prior);
assert.equal(add.length,1,'Neighbor witnesses the complete clipped scene');assert.equal(JSON.stringify(prior),before);
assert(D.validPanel(add[0]));assert.equal(D.analyzeRGBA(rgba,w,h,[...prior,...add]).length,0);
assert.equal(D.analyzeRGBA(rgba,w,h,[]).length,0,'No accepted neighbor means no addition');
const mask=api.PanelLocalBoundaryConsensus.raster(prior[0],w,h),newMask=api.PanelLocalBoundaryConsensus.raster(add[0],w,h);assert(!newMask.some((v,i)=>v&&mask[i]));
const divider=rgba.slice();for(let y=170;y<180;y++)for(let x=369;x<450;x++)divider.set([255,255,255,255],(y*w+x)*4);
assert.equal(D.analyzeRGBA(divider,w,h,prior).length,0,'Two separated scenes are not one owner');
const mono=rgba.slice();for(let i=0;i<mono.length;i+=4)mono[i+1]=mono[i+2]=mono[i];assert.equal(D.analyzeRGBA(mono,w,h,prior).length,0);
const flat=new Uint8ClampedArray(w*h*4).fill(255);assert.equal(D.analyzeRGBA(flat,w,h,prior).length,0);
const transparent=rgba.slice();transparent[3]=0;assert.equal(D.analyzeRGBA(transparent,w,h,prior).length,0);
assert.equal(D.analyzeRGBA(rgba,w,h,[{x:-.1,y:0,w:1,h:1}]).length,0);
assert.equal(D.analyzeRGBA(rgba.slice(1),w,h,prior).length,0);
console.log(JSON.stringify({passed:true,capturedContours:fixtures.length,rejectedMutations:rejected,syntheticAddition:1,neighborRequired:true,dividersAndMonochromeRejected:true,appendOnly:true,pixelDisjoint:true}));
