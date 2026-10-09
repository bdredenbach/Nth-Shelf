'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=process.env.NTH_SHELF_SOURCE||path.resolve(__dirname,'../../..'),file=process.env.NTH_SHARED_SEAM_READER||path.join(root,'js/panels-shared-seam-reader.js'),code=fs.readFileSync(file,'utf8');
let serializations=0,sourceCalls=0,validationCalls=0,delegated=0;
const family={claims:p=>p?._structuralGridProof?.version===91||p?._geometryType==='source-shared-seam-child'};
const api=new Function('PanelSharedSeamChildren','PanelRoundedCrowdStrip',code+';return PanelSharedSeamReader;')(family,{validPanel(){validationCalls++;return false;}});
(async()=>{
for(const version of [1,79,88,98]){
 const owner={x:.1,y:.1,w:.8,h:.8,_structuralGridProof:{version,unrelatedEvidence:{toJSON(){serializations++;return Array(20).fill(version);}}}},owners=[owner],contours=[[{x:.1,y:.1},{x:.9,y:.1},{x:.9,y:.9},{x:.1,y:.9}]],reader={currentPanels:owners,panelZoomEnabled:true,getPanelImageContext(){sourceCalls++;throw Error('unrelated viewport unavailable');},panelContours:()=>contours,displayPanelContours(p,c){delegated++;assert.equal(p,owner);return c;},findPanelAt(){delegated++;return owner;},zoomToPanel(p){delegated++;return p;}};
 api.installReader(reader);
 for(let i=0;i<100;i++){assert.equal(reader.displayPanelContours(owner),contours);assert.equal(reader.findPanelAt(.5,.5),owner);assert.equal(await reader.zoomToPanel(owner),owner);assert.equal(reader.currentPanels,owners);}
}
assert.equal(delegated,1200);assert.equal(serializations,0,'unrelated pages must not serialize their stored geometry');assert.equal(sourceCalls,0);assert.equal(validationCalls,0);
console.log(JSON.stringify({passed:true,unrelatedGeometryFamilies:4,exactDelegations:delegated,unrelatedProofSerializations:serializations,sourceCalls,foreignProofValidations:validationCalls}));

})().catch(e=>{console.error(e);process.exitCode=1;});
