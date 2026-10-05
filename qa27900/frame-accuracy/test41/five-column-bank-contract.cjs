'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../../..'),D=require(path.join(root,'js/panels-structural-grid.js')),W=600,H=900,bankBox=[0,400,599,680],terminalBox=[0,690,599,899],samples=281;
const separators=[
 {lo:110,hi:118,x:114,samples,dark:260,maxRun:230,left:210,right:245,both:175},
 {lo:220,hi:226,x:223,samples,dark:255,maxRun:225,left:205,right:240,both:170},
 {lo:330,hi:332,x:331,samples,dark:250,maxRun:220,left:200,right:238,both:165},
 {lo:480,hi:486,x:483,samples,dark:265,maxRun:240,left:212,right:250,both:180}
];
const boxes=[[0,400,109,680],[119,400,219,680],[227,400,329,680],[333,400,479,680],[487,400,599,680],[0,690,599,899]];
function panel(index){const box=boxes[index],pixels=(box[2]-box[0]+1)*(box[3]-box[1]+1);return{x:box[0]/W,y:box[1]/H,w:(box[2]-box[0]+1)/W,h:(box[3]-box[1]+1)/H,_identitySource:'structural-grid-frame',_geometryType:'orthogonal',_structuralGridProof:{version:4,method:'tap-independent-five-column-bank-over-terminal-strip-v1',connected:true,analysisWidth:W,analysisHeight:H,baselineCount:3,count:6,bankBox,terminalBox,separators,index,box,stats:{pixels,mean:92,variance:2300,dark:Math.floor(pixels*.30),light:Math.floor(pixels*.22)}}};}
const panels=boxes.map((_,i)=>panel(i));assert(panels.every(D.validPanel));
let bad=JSON.parse(JSON.stringify(panels[2]));bad._structuralGridProof.separators[2].dark=10;assert(!D.validPanel(bad));
bad=JSON.parse(JSON.stringify(panels[4]));bad._structuralGridProof.separators[3].hi=520;assert(!D.validPanel(bad));
bad=JSON.parse(JSON.stringify(panels[5]));bad._structuralGridProof.terminalBox[1]=681;assert(!D.validPanel(bad));
const src=fs.readFileSync(path.join(root,'js/panels-structural-grid.js'),'utf8');for(const forbidden of ['Wolverine (2010-2012) 1000-032.jpg','readerPage:33','d279ab7d794f4acf27ecbece27e0efe149d0aef1769860c3519200d738514d7b'])assert(!src.includes(forbidden));
console.log(JSON.stringify({sixProofsValid:true,weakRailRejected:true,tamperedSeparatorRejected:true,terminalGapTamperRejected:true,runtimeFixtureKeysAbsent:true}));
