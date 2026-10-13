'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../../..');
const context=vm.createContext({console,setTimeout,clearTimeout,localStorage:{getItem:()=>null}});
vm.runInContext(fs.readFileSync(root+'/js/reader.js','utf8')+'\n;this.reader=Reader;',context);
vm.runInContext(fs.readFileSync(process.argv[2]||root+'/js/panels-split-cell-completion.js','utf8')+'\n;this.completion=PanelSplitCellCompletion;',context);
const r=context.reader,img={},p={x:.1,y:.1,w:.6,h:.5},other={x:.8,y:.8,w:.1,h:.1};
r.panelZoomEnabled=true;r.currentPanels=[p,other];r.getPanelImageContext=()=>({img});
r.panelContours=()=>null;r.panelPolygon=()=>null;
const originalFind=r.findPanelAt;
context.completion.installReader(r);
assert.equal(r.displayPanelContours(p),null);
assert.equal(r.findPanelAt(.4,.35),p,'Warm ordinary rectangle remains selectable');
assert.equal(r.findPanelAt(.85,.85),other,'Uncached rectangle delegates');
assert.equal(r.findPanelAt(.75,.75),null,'Unowned point stays unowned');
const cache=r._splitCellDisplay;
for(const identity of ['composite-frame','rim-frame','inset-neighbor-frame','curved-rim-frame','matte-cell-frame']){
 p._identitySource=identity;assert.equal(originalFind.call(r,.4,.35),null);
 assert.equal(r.findPanelAt(.4,.35),null,'Absent claimed contour proof must still reject '+identity);
}
delete p._identitySource;
r._splitCellDisplay={...cache,img:{}};assert.equal(r.findPanelAt(.4,.35),p);
r._splitCellDisplay={...cache,owners:[p]};assert.equal(r.findPanelAt(.4,.35),p);
console.log(JSON.stringify({passed:true,warmedNullContourRectangle:true,unownedPointPreserved:true,missingProofIdentitiesRejected:5,foreignCacheIgnored:true}));
