'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),zlib=require('node:zlib');
const path=require('node:path'),root=path.resolve(__dirname,'../../..');
const scripts=[...fs.readFileSync(root+'/index.html','utf8').matchAll(/src="(js\/(?!terminal-native-bootstrap\.js)(?:panels|terminal)[^\"]*\.js)"/g)].map(m=>m[1]);
const api=new Function('document','Image','window',scripts.map(p=>fs.readFileSync(path.join(root,p),'utf8')).join('\n')+'\nreturn{PanelStructuralGrid,PanelLetteringCells,PanelConnectedPairs};')({},class{},{});
const S=api.PanelStructuralGrid;
const O=vm.runInNewContext(fs.readFileSync(require.resolve('../../../js/panels-geometry-orthogonal.js'),'utf8')+';PanelGeometryOrthogonal',{PanelStructuralGrid:S,clamp01:v=>Math.max(0,Math.min(1,v))});
const fixtures=JSON.parse(zlib.gunzipSync(Buffer.from(fs.readFileSync(__dirname+'/geometry.json.gz.b64','utf8'),'base64')));
function element(){return{style:{setProperty(){}},dataset:{},classList:{add(){},remove(){}},setAttribute(){},appendChild(c){c.parentNode=this;},getContext(){return{drawImage(){},save(){},restore(){},beginPath(){},moveTo(){},lineTo(){},closePath(){},clip(){}};}};}
let spillCalls=0;
const ctx=vm.createContext({console,setTimeout,clearTimeout,requestAnimationFrame(){},localStorage:{getItem:()=>null},document:{createElement:element},PanelGeometryOrthogonal:O,PanelEdgeSpill:{analyzeImage(){spillCalls++;return{spills:[{box:[0,0,1,1]}]};}}});
vm.runInContext(fs.readFileSync(require.resolve('../../../js/reader.js'),'utf8'),ctx);
const reader=vm.runInContext('Reader',ctx),rect={left:0,top:0,width:600,height:900,right:600,bottom:900},img={naturalWidth:1200,naturalHeight:1800};
reader.els={stage:element(),viewport:element()};reader.currentPanels=fixtures;reader.getPanelImageContext=()=>({img,rect});reader.setFocusDim=()=>{};
(async()=>{
 for(const p of fixtures){assert(S.validPanel(p));assert(O._provenContours(p));for(const [u,v]of(p._structuralGridProof.version===43?[[.12,.5],[.7,.5],[.12,.2],[.7,.2],[.7,.8]]:[[.5,.5],[.15,.5],[.85,.5],[.5,.15],[.5,.85]])){const x=p.x+u*p.w,y=p.y+v*p.h;assert.equal(JSON.stringify(reader.findPanelAt(x,y)._contours),JSON.stringify(p._contours));}reader.focusMode=null;await reader.zoomToPanel(p,rect,rect);
  assert.equal(spillCalls,0);assert.equal(JSON.stringify(reader.panelFocusMeta.panel._contours),JSON.stringify(p._contours));
  for(const k of['x','y','w','h'])assert.equal(reader.panelFocusMeta.panel[k],p[k]);assert(reader.panelOverlayActive);
 }
 console.log(JSON.stringify({passed:true,exactContourCrops:fixtures.length,legacySpillSkipped:true}));
})().catch(e=>{console.error(e);process.exitCode=1;});
