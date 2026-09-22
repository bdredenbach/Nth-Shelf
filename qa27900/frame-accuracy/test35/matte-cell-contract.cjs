'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'../../..');
const context=vm.createContext({console,setTimeout,clearTimeout,localStorage:{getItem:()=>null,setItem(){},removeItem(){}}});
for(const f of ['panels-matte-cells.js','panels-geometry-orthogonal.js','panels-geometry.js','reader.js'])vm.runInContext(fs.readFileSync(path.join(root,'js',f),'utf8'),context);
const det=vm.runInContext('PanelMatteCells',context),ortho=vm.runInContext('PanelGeometryOrthogonal',context),geo=vm.runInContext('PanelGeometry',context),reader=vm.runInContext('Reader',context);
const copy=x=>JSON.parse(JSON.stringify(x)),W=300,H=500,rings=[[[50,50],[150,50],[150,100],[50,100]]];
const panel={x:50/W,y:50/H,w:100/W,h:50/H,_contours:rings.map(q=>q.map(([x,y])=>({x:x/W,y:y/H}))),_identitySource:'matte-cell-frame',_geometryOwner:'matte-cell-contours',_geometryType:'edge-connected-matte-cell',_matteCellProof:{version:1,method:'edge-connected-matte-cells-v1',analysisWidth:W,analysisHeight:H,mode:'dark',edgeColor:[0,0,0],edgeBase:0,edgeSamples:800,edgeMatched:800,exteriorPixels:10000,source:'component',pixels:5000,mean:100,variance:500,dark:100,light:100,pixelContours:rings}};
assert(det.validPanel(panel));assert.equal(geo._seedPolicy(panel).mode,'hold');assert.equal(geo._seedPolicy(panel).source,'MATTE-CELL');assert.deepEqual(JSON.parse(JSON.stringify(ortho._provenContours(panel))),panel._contours);
reader.panelZoomEnabled=true;reader.currentPanels=[panel];assert.equal(reader.findPanelAt(.30,.15),panel);
const mutations={missingProof:p=>delete p._matteCellProof,badMethod:p=>p._matteCellProof.method='saved-page',badMode:p=>p._matteCellProof.mode='page44',badOwner:p=>p._geometryOwner='orthogonal-frame',badType:p=>p._geometryType='rectangle',missingContours:p=>delete p._contours,changedContour:p=>p._contours[0][0].x+=.001,nonIntegerPixel:p=>p._matteCellProof.pixelContours[0][0][0]+=.5,badArea:p=>p._matteCellProof.pixels++};
let rejected=0;for(const [name,change] of Object.entries(mutations)){const p=copy(panel);change(p);assert(!det.validPanel(p),name);assert.equal(ortho._provenContours(p),null,name);reader.currentPanels=[p];assert.equal(reader.findPanelAt(.30,.15),null,name);rejected++;}
const source=fs.readFileSync(path.join(root,'js/panels-matte-cells.js'),'utf8');
for(const forbidden of ['acbee896220ee344f867cc9a4fbea9bbca8c800f9d0b2bca269d942b83636882','Wolverine (2010-2012) 1000-043.jpg','readerPage:44','page44-anchors.json'])assert(!source.includes(forbidden),forbidden);
const sweep=JSON.parse(fs.readFileSync(path.join(__dirname,'remaining-empty-sweep.json')));const counts=Object.fromEntries(Object.entries(sweep).map(([k,v])=>[k,v.count]));assert.deepEqual(counts,{'1':0,'26':0,'44':7,'58':4,'65':0,'66':0,'70':4,'71':4});
const anchors=JSON.parse(fs.readFileSync(path.join(__dirname,'page44-anchors.json')));assert.equal(anchors.panels.reduce((n,p)=>n+p.points.length,0),35);
const summary=JSON.parse(fs.readFileSync(path.join(__dirname,'regression-summary.json')));assert.equal(summary.page44Reader.touchRenders,7);assert.equal(summary.page44Reader.pixelDifferences,0);assert.equal(summary.effectiveFixtureTotal.test35,329);
console.log(JSON.stringify({syntheticProofAccepted:true,tamperedProofsRejected:rejected,page44RecordedAnchors:35,page44RecordedTouchRenders:7,remainingEmptySweep:counts}));
