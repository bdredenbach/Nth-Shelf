'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../../..'),D=require(path.join(root,'js/panels-structural-grid.js')),W=600,H=900;
const anchorBoxes=[[20,15,290,305],[305,20,580,230],[250,230,560,375],[20,310,190,540],[175,312,575,650],[25,510,165,890],[170,545,570,890]];
const refinedQuads=[
 [[20,15],[300,18],[295,305],[25,308]],
 [[305,20],[580,28],[580,230],[305,228]],
 [[250,230],[560,230],[560,375],[250,375]],
 [[25,510],[165,540],[165,890],[25,890]],
 [[170,545],[570,650],[570,890],[170,890]]
];
const seam=[[20,500],[575,650]],splitX=168;
const outlines=[
 [[20,15],[300,18],[300,230],[250,230],[250,305],[25,308]],
 [[305,20],[580,28],[580,230],[305,228]],
 [[250,230],[560,230],[560,375],[250,375]],
 [[20,308],[250,305],[250,375],[560,375],[575,375],[575,650],[20,500]],
 [[20,500],[168,540],[165,890],[25,890]],
 [[168,540],[575,650],[570,890],[170,890]]
];
function panel(index){const q=outlines[index],xs=q.map(v=>v[0]),ys=q.map(v=>v[1]),x0=Math.min(...xs),y0=Math.min(...ys),x1=Math.max(...xs),y1=Math.max(...ys),pixels=Math.max(1000,Math.round((x1-x0)*(y1-y0)*.75));return{x:x0/W,y:y0/H,w:(x1-x0)/W,h:(y1-y0)/H,_identitySource:'structural-grid-frame',_geometryOwner:'structural-grid-outline',_geometryType:index===3||index>=4?'shared-seam-outline':'orthogonal',_outline:q.map(([x,y])=>({x:x/W,y:y/H})),_structuralGridProof:{version:6,method:'tap-independent-stepped-inset-shared-seam-v1',connected:true,analysisWidth:W,analysisHeight:H,baselineCount:7,count:6,anchorBoxes,refinedQuads,seam,splitX,seamMeanScore:90,seamStartGuess:510,seamEndGuess:650,outlines,index,pixelOutline:q,stats:{pixels,mean:92,variance:2300,dark:Math.floor(pixels*.30),light:Math.floor(pixels*.20)}}};}
const panels=outlines.map((_,i)=>panel(i));assert(panels.every(D.validPanel));
let bad=JSON.parse(JSON.stringify(panels[3]));bad._structuralGridProof.seamMeanScore=20;assert(!D.validPanel(bad));
bad=JSON.parse(JSON.stringify(panels[4]));bad._structuralGridProof.splitX=10;assert(!D.validPanel(bad));
bad=JSON.parse(JSON.stringify(panels[0]));bad._structuralGridProof.anchorBoxes[0][2]=500;assert(!D.validPanel(bad));
bad=JSON.parse(JSON.stringify(panels[5]));bad._outline[1].y+=.01;assert(!D.validPanel(bad));
const src=fs.readFileSync(path.join(root,'js/panels-structural-grid.js'),'utf8');for(const forbidden of ['Wolverine (2010-2012) 1000-035.jpg','readerPage:36'])assert(!src.includes(forbidden));
console.log(JSON.stringify({sixProofsValid:true,weakSeamRejected:true,badSplitRejected:true,anchorTamperRejected:true,outlineTamperRejected:true,runtimeFixtureKeysAbsent:true}));
