'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),zlib=require('zlib'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../../..'),scripts=[...fs.readFileSync(root+'/index.html','utf8').matchAll(/src="(js\/panels[^\"]*\.js)"/g)].map(m=>m[1]);
const api=new Function('document','Image','window',scripts.map(p=>fs.readFileSync(root+'/'+p,'utf8')).join('\n')+';return{PanelCropRepair,PanelMatteCells,PanelGeometryOrthogonal};')({},class{},{});
const fixtures=JSON.parse(zlib.gunzipSync(Buffer.from(fs.readFileSync(__dirname+'/geometry.json.gz.b64','utf8'),'base64'))),snapshot=JSON.stringify(fixtures);
function element(){const e={style:{setProperty(){}},dataset:{},classList:{add(){},remove(){}},setAttribute(){},appendChild(c){c.parentNode=this;(this.children||=[]).push(c);}};e.getContext=()=>({drawImage(){},save(){},restore(){},beginPath(){},moveTo(){},lineTo(){},closePath(){},clip(){},getImageData(x,y,w,h){return{data:new Uint8ClampedArray(w*h*4).fill(255)};}});return e;}
const ctx=vm.createContext({console,setTimeout,clearTimeout,requestAnimationFrame(){},localStorage:{getItem:()=>null},document:{createElement:element},...api});vm.runInContext(fs.readFileSync(root+'/js/reader.js','utf8'),ctx);const r=vm.runInContext('Reader',ctx);
const rect={left:0,top:0,width:600,height:900,right:600,bottom:900},img={naturalWidth:1200,naturalHeight:1800};r.currentPanels=fixtures;r.getPanelImageContext=()=>({img,rect});r.els={stage:element(),viewport:element()};r.setFocusDim=()=>{};
(async()=>{const p=fixtures[2],before=r.panelContours(p),display=r.displayPanelContours(p),proof=p._matteCellProof,w=proof.analysisWidth,h=proof.analysisHeight;
assert.notEqual(JSON.stringify(before),JSON.stringify(display));const a=api.PanelCropRepair.raster(before,w,h),b=api.PanelCropRepair.raster(display,w,h);let hit=-1;
for(let i=0;i<a.length;i++)if(!a[i]&&b[i]&&r.findPanelAt((i%w+.5)/w,((i/w|0)+.5)/h)===p){hit=i;break;}assert(hit>=0,'Restored artwork cannot be tapped');
await r.zoomToPanel(p,rect,rect);assert(r.panelOverlayActive);assert.equal(JSON.stringify(r.panelFocusMeta.panel._contours),JSON.stringify(before));assert.equal(JSON.stringify(r.panelFocusMeta.cropContours),JSON.stringify(display));assert(api.PanelGeometryOrthogonal._provenContours(r.panelFocusMeta.panel));assert.equal(JSON.stringify(fixtures),snapshot);
assert.equal(r.displayPanelContours(p),display,'Repaired contours were not cached');
// A corrupted proof must never reuse a formerly valid cached display mask.
const bad=JSON.parse(JSON.stringify(p));bad._matteCellProof.pixels++;assert.equal(r.displayPanelContours(bad),null);
console.log(JSON.stringify({passed:true,repairedPixelTap:true,displayMaskUsedInOverlay:true,originalProofPreserved:true,cacheUsed:true,corruptedProofRejected:true}));})().catch(e=>{console.error(e);process.exitCode=1;});
