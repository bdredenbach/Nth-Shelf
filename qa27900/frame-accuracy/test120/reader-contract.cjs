'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('node:assert/strict'),{api,fixture}=require('./source-contract.cjs');
const ctx=vm.createContext({...api,console,setTimeout,clearTimeout,requestAnimationFrame(){},localStorage:{getItem:()=>null},document:{createElement(){throw Error('Source image deliberately unavailable in this ownership-context contract');}}});vm.runInContext(fs.readFileSync(path.resolve(__dirname,'../../../js/reader.js'),'utf8'),ctx);const r=vm.runInContext('Reader',ctx),D=api.PanelFocusedPaperCell,v=fixture._structuralGridProof,w=v.analysisWidth,h=v.analysisHeight,peer=v.peers[0],parent=v.parent;
const source=api.PanelLocalBoundaryConsensus.raster(fixture,w,h),peerSource=api.PanelLocalBoundaryConsensus.raster(peer,w,h),i=source.findIndex((n,i)=>n&&!peerSource[i]),x=i%w,y=i/w|0;assert(i>=0);
// Independent simulated annex: an older accepted owner depends on its broad
// neighbor and owns a protrusion outside its discovery contour. Narrowing the
// neighbor must preserve that context and exclude the annex from the new cell.
const annex=[{x:x/w,y:y/h},{x:(x+1)/w,y:y/h},{x:(x+1)/w,y:(y+1)/h},{x:x/w,y:(y+1)/h}],expectedPeer=[...peer._contours,annex];let calls=0;
r._focusedPaperCellReader=false;r.panelZoomEnabled=true;r.getPanelImageContext=()=>null;r.panelContours=p=>api.PanelGeometryOrthogonal._provenContours(p);r.displayPanelContours=function(p,c=this.panelContours(p)){if(p===peer){assert(this.currentPanels.includes(parent),'Original repair neighbor missing');calls++;return expectedPeer;}return c;};D.installReader(r);
const owners=[fixture,peer];r.currentPanels=owners;const result=r.displayPanelContours(fixture),mask=api.PanelCropRepair.raster(result,w,h);assert.equal(mask[i],0,'Accepted neighbor annex leaked into focused cell');assert.equal(r.currentPanels,owners);assert.equal(JSON.stringify(r.displayPanelContours(peer)),JSON.stringify(expectedPeer));assert.equal(r.currentPanels,owners);assert.equal(r.displayPanelContours(fixture),result,'Focused display cache not reused');assert(calls>=2);
let taps=0;for(let j=0;j<mask.length;j+=97)if(mask[j]){const X=(j%w+.5)/w,Y=((j/w|0)+.5)/h;assert.equal(r.findPanelAt(X,Y),fixture);taps++;}assert(taps>100);
const lower=(parent.y+parent.h*.90);assert.equal(r.findPanelAt(.5,lower),null,'Unresolved lower group still pops out');
const unchanged={...r,_focusedPaperCellReader:false,currentPanels:[peer],displayPanelContours:()=>expectedPeer};D.installReader(unchanged);assert.equal(unchanged.displayPanelContours(peer),expectedPeer);
console.log(JSON.stringify({passed:true,legacyRepairContextRetained:true,neighborAnnexExcluded:true,focusedTaps:taps,unresolvedRemainderHasNoGroupTap:true,cacheHeld:true,ownersRestored:true,unrelatedOwnersUnchanged:true}));
