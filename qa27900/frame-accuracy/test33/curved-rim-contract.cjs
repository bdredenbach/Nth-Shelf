'use strict';
// Replays geometry/proof contracts from the image-free captured descriptors.
// Raw-pixel evidence is tested separately by pixel-negatives.py with a private comic.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),zlib=require('node:zlib'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../../..');
const capture=JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(__dirname,'fresh74-descriptors.json.gz'))));
const panels=capture.pages.find(p=>p.readerPage===42).entries;
assert.equal(panels.length,7);
const context=vm.createContext({console,setTimeout,clearTimeout,localStorage:{getItem:()=>null}});
for(const f of ['panels-curved-rims.js','panels-geometry-orthogonal.js','panels-geometry.js','reader.js'])vm.runInContext(fs.readFileSync(path.join(root,'js',f),'utf8'),context);
const get=x=>vm.runInContext(x,context),det=get('PanelCurvedRims'),ortho=get('PanelGeometryOrthogonal'),geo=get('PanelGeometry'),reader=get('Reader');
const copy=p=>JSON.parse(JSON.stringify(p));
const anchors=JSON.parse(fs.readFileSync(path.join(__dirname,'page42-anchors.json')));
let ownership=0,proofRejections=0;
reader.panelZoomEnabled=true;reader.currentPanels=panels;
for(let i=0;i<panels.length;i++){
 const p=panels[i];assert(det.validPanel(p));assert.equal(geo._seedPolicy(p).mode,'hold');assert.deepEqual(JSON.parse(JSON.stringify(ortho._provenContours(p))),p._contours);
 for(const [x,y] of anchors.panels[i].points){assert.equal(reader.findPanelAt(x/585,y/900)?._curvedRimProof?.index,i);ownership++;}
}
const mutations={
 missingProof:p=>delete p._curvedRimProof,
 badVersion:p=>p._curvedRimProof.version++,
 badMethod:p=>p._curvedRimProof.method='rectangle',
 badOwner:p=>p._geometryOwner='orthogonal',
 badGeometry:p=>p._geometryType='quad',
 movedBounds:p=>p.x+=.01,
 expandedBounds:p=>p.w+=.01,
 missingContours:p=>delete p._contours,
 changedContour:p=>p._contours[0][0].x+=.01,
 nonIntegerContour:p=>p._curvedRimProof.pixelContours[0][0][0]+=.2,
 changedArea:p=>p._curvedRimProof.pixels++,
 missingRim:p=>p._curvedRimProof.network.model.paths.pop(),
 crossedRims:p=>p._curvedRimProof.network.model.paths[2][100]=0,
 missingEvidence:p=>p._curvedRimProof.network.model.evidence[2].matched=0,
 longGap:p=>p._curvedRimProof.network.model.evidence[2].maxGap=80,
 missingFanEvidence:p=>p._curvedRimProof.network.fan.evidence[0].matched=0,
 wrongFanJoin:p=>{for(const pnt of p._curvedRimProof.network.fan.paths[0])pnt[0]-=25;},
 matteMismatch:p=>p._curvedRimProof.network.matte.matched=0,
 blankArt:p=>p._curvedRimProof.network.stats[0].variance=0,
 invalidBalloonOwner:p=>p._curvedRimProof.network.balloons[0].owner=20,
 missingProofRing:p=>p._curvedRimProof.pixelContours=[],
 quadFallback:p=>p._quad=[{x:0,y:0},{x:1,y:0},{x:1,y:1},{x:0,y:1}],
 outlineFallback:p=>p._outline=[{x:0,y:0},{x:1,y:0},{x:1,y:1},{x:0,y:1}]
};
for(const [name,change] of Object.entries(mutations))for(const original of panels){const p=copy(original);change(p);assert(!det.validPanel(p),name);assert.equal(ortho._provenContours(p),null,name);reader.currentPanels=[p];assert.equal(reader.findPanelAt(p.x+p.w/2,p.y+p.h/2),null,name);proofRejections++;}
for(const [data,w,h] of [[null,585,900],[[],585,900],[new Uint8Array(4),1,1],[new Uint8Array(4),-1,900]])assert.equal(det.analyzeRGBA(data,w,h).length,0);
console.log(JSON.stringify({panels:panels.length,ownership,proofRejections,malformedInputs:4}));
