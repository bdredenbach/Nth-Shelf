'use strict';
// Execute the real reader crop builder with validated captured geometry.
// The legacy spill transport is deliberately adversarial: it proposes foreign
// margin content even though the new proofs already own a complete silhouette.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),zlib=require('node:zlib');
global.PanelMatteCells=require('../../../js/panels-matte-cells.js');
global.PanelRaggedGutters=require('../../../js/panels-ragged-gutters.js');
global.PanelPaperRecovery=require('../../../js/panels-paper-recovery.js');
global.PanelColoredRims=require('../../../js/panels-colored-rims.js');
const S=require('../../../js/panels-structural-grid.js');
const fixture=name=>JSON.parse(zlib.gunzipSync(Buffer.from(fs.readFileSync(path.join(__dirname,name+'-geometry.json.gz.b64'),'utf8'),'base64')));
const gamut=fixture('continuous-gamut'),newPanels=[...gamut.new,...fixture('paper'),...fixture('colored-rim')];
const O=vm.runInNewContext(fs.readFileSync(require.resolve('../../../js/panels-geometry-orthogonal.js'),'utf8')+';PanelGeometryOrthogonal',{PanelStructuralGrid:S,clamp01:v=>Math.max(0,Math.min(1,v))});
const rect={left:0,top:0,width:600,height:900,right:600,bottom:900},img={naturalWidth:1200,naturalHeight:1800};
let spillCalls=0,spillDraws=0;
function element(){return{style:{setProperty(){}},dataset:{},classList:{add(){},remove(){}},setAttribute(){},appendChild(c){c.parentNode=this;},getContext(){return{drawImage(){},save(){},restore(){},beginPath(){},moveTo(){},lineTo(){},closePath(){},clip(){}};}};}
const context=vm.createContext({console,setTimeout,clearTimeout,requestAnimationFrame(){},localStorage:{getItem:()=>null},document:{createElement:element},PanelGeometryOrthogonal:O,
 PanelEdgeSpill:{analyzeImage(){spillCalls++;return{spills:[{box:[0,0,1,1]}]};}}});
vm.runInContext(fs.readFileSync(require.resolve('../../../js/reader.js'),'utf8'),context);const reader=vm.runInContext('Reader',context);
reader.els={stage:element(),viewport:element()};reader.getPanelImageContext=()=>({img,rect});reader.setFocusDim=()=>{};reader.drawPanelEdgeSpill=()=>spillDraws++;
(async()=>{
 for(const panel of newPanels){assert(S.validPanel(panel));assert(O._provenContours(panel));reader.focusMode=null;await reader.zoomToPanel(panel,rect,rect);
  assert.equal(spillCalls,0,'A complete new contour must not invoke legacy margin recovery');assert.equal(spillDraws,0);
  const focused=reader.panelFocusMeta.panel;for(const k of ['x','y','w','h'])assert.equal(focused[k],panel[k],'Crop bounds must retain the exact reviewed silhouette');
  assert.equal(JSON.stringify(focused._contours),JSON.stringify(panel._contours));assert(!focused._edgeSpillProof);assert(reader.panelOverlayActive);
 }
 for(const panel of gamut.baseline){assert(S.validPanel(panel));reader.focusMode=null;const before=spillCalls;await reader.zoomToPanel(panel,rect,rect);assert.equal(spillCalls,before+1,'Existing proof versions keep their previous margin behavior');assert(reader.panelFocusMeta.panel._edgeSpillProof);}
 assert.equal(spillDraws,gamut.baseline.length);
 console.log(JSON.stringify({passed:true,completeContourCrops:newPanels.length,legacySpillOwnersPreserved:gamut.baseline.length}));
})().catch(e=>{console.error(e);process.exitCode=1;});
