'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../../..'),D=require(path.join(root,'js/panels-structural-grid.js')),W=585,H=900,pageBox=[11,20,571,899];
const rails={mainSpine:{lo:292,hi:297,center:295,samples:439,meanDark:.97,maxDark:.99},rightSplit:{lo:445,hi:452,center:449,samples:250,meanDark:.96,maxDark:.99},rightMid:{lo:270,hi:280,center:276,samples:274,meanDark:.97,maxDark:.99},topBottom:{lo:459,hi:471,center:466,samples:561,meanDark:.97,maxDark:.99},terminalTop:{lo:730,hi:738,center:734,samples:561,meanDark:.96,maxDark:1}};
const seam=[[11,665],[24,655],[75,641],[140,640],[155,631],[226,614],[351,609],[358,598],[366,602],[416,593],[488,592],[526,583],[571,584]];
const rect=(a,b,c,d)=>[[a,b],[c+1,b],[c+1,d+1],[a,d+1]],rev=[...seam].reverse(),outlines=[rect(11,20,291,458),rect(298,20,444,269),rect(453,20,571,269),rect(298,281,571,458),[[11,472],[572,472],...rev.map(([x,y])=>[x+1,y])],[...seam,[572,730],[11,730]],rect(11,739,571,899)];
function area(q){return Math.abs(q.reduce((s,a,i)=>{const b=q[(i+1)%q.length];return s+a[0]*b[1]-a[1]*b[0];},0)/2);}
function panel(index){const q=outlines[index],xs=q.map(v=>v[0]),ys=q.map(v=>v[1]),x0=Math.min(...xs),y0=Math.min(...ys),x1=Math.max(...xs),y1=Math.max(...ys),pixels=Math.round(area(q));return{x:x0/W,y:y0/H,w:(x1-x0)/W,h:(y1-y0)/H,_identitySource:'structural-grid-frame',_geometryOwner:'structural-grid-outline',_geometryType:index===4||index===5?'curved-shared-seam':'orthogonal',_outline:q.map(([x,y])=>({x:x/W,y:y/H})),_structuralGridProof:{version:5,method:'tap-independent-branched-stack-curved-seam-v1',connected:true,analysisWidth:W,analysisHeight:H,baselineCount:4,count:7,pageBox,rails,seam,seamMeanScore:197.9,seamStart:665,seamEnd:584,index,pixelOutline:q,stats:{pixels,mean:82,variance:2500,dark:Math.max(1,Math.floor(pixels*.35)),light:Math.max(1,Math.floor(pixels*.15))}}};}
const panels=outlines.map((_,i)=>panel(i));assert(panels.every(D.validPanel));
let bad=JSON.parse(JSON.stringify(panels[4]));bad._structuralGridProof.seamMeanScore=20;assert(!D.validPanel(bad));
bad=JSON.parse(JSON.stringify(panels[0]));bad._structuralGridProof.rails.mainSpine.meanDark=.2;assert(!D.validPanel(bad));
bad=JSON.parse(JSON.stringify(panels[5]));bad._outline[3].y+=.01;assert(!D.validPanel(bad));
bad=JSON.parse(JSON.stringify(panels[6]));bad._structuralGridProof.seamEnd=650;assert(!D.validPanel(bad));
const src=fs.readFileSync(path.join(root,'js/panels-structural-grid.js'),'utf8');for(const forbidden of ['Wolverine (2010-2012) 1000-034.jpg','readerPage:35','e717fa720ec34448fd184d20c419364ad7e3ecbd9d9ef66a65efa74085297842'])assert(!src.includes(forbidden));
console.log(JSON.stringify({sevenProofsValid:true,weakSeamRejected:true,weakSpineRejected:true,tamperedOutlineRejected:true,seamEndpointTamperRejected:true,runtimeFixtureKeysAbsent:true}));
