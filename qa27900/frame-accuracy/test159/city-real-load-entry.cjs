'use strict';
// Exact installed Reader method and request guard. Only URL/maps/detector I/O
// use the same generated boundaries as the reviewed predecessor control.
const assert=require('node:assert/strict');
const {root,read,sha}=require('./city-source-loader.cjs');
const source=read('js/reader.js');
function extract(start,end){const i=source.indexOf(start),j=source.indexOf(end,i);assert(i>=0&&j>i);return source.slice(i,j);}
const requestText=extract('const PanelTapRequest =','\n\nconst Reader =');
const loadText=extract(' async loadPanelsForCurrentPage() {','\n getPanelImageContext()');
assert.equal(sha(requestText),'71c0b20ace183022573699f15fce5f0b5653f9cf3ce8386f157385a190dfe6e1');
assert.equal(sha(loadText),'d91350762aabc7e87408b06ad0c748b038a526cf67ff4a1adba746840714ee56');
const binding={productionReader:{path:'js/reader.js',sha256:sha(source)}};
function loadContract(detect){return new Function('PanelDetect',requestText+'\nreturn {request:PanelTapRequest,load:({'+loadText+'}).loadPanelsForCurrentPage};')({detect});}
async function realLoadReplacement(r){
 const oldOwners=r.currentPanels,oldToken=r._panelLoadToken,contract=loadContract(()=>{throw Error('Null-URL generated boundary must not detect');});
 r.mode='single';r.preparePanelMaps=()=>{};r.getPageUrl=async()=>null;
 const request=contract.request.begin(r),pending=contract.load.call(r);
 assert(request.invalid,'Actual PanelTapRequest.cancel must run before replacement');
 assert.notEqual(r.currentPanels,oldOwners,'Actual load entry clears public owners');
 assert.equal(r.currentPanels.length,0);assert.equal(r._panelLoadToken,oldToken+1);
 await pending;assert.equal(r.currentPanels.length,0);
 return{actualMethod:true,tapRequestCancelled:request.invalid,ownersReplaced:true,tokenAdvanced:true,generatedBoundaries:['null getPageUrl','no-op legacy preparePanelMaps'],source:binding.productionReader};
}
module.exports={root,binding,loadContract,realLoadReplacement,sha};
