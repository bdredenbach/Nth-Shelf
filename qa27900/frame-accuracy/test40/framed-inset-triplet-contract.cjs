'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../../..'),D=require(path.join(root,'js/panels-structural-grid.js'));
const W=585,H=900,parentBox=[168,485,572,878],insetBox=[299,522,368,818];
const leftEdge={x:298,start:490,end:819,hits:321,length:330,coverage:321/330,maxGap:5};
const rightEdge={x:367,start:514,end:820,hits:302,length:307,coverage:302/307,maxGap:5};
const top={y:521,matched:65,samples:65,support:1},bottom={y:817,matched:65,samples:65,support:1};
const common={version:3,method:'tap-independent-framed-inset-triplet-v1',connected:true,analysisWidth:W,analysisHeight:H,baselineCount:6,upperCount:4,parent:{x:168/W,y:485/H,w:(572-168)/W,h:(878-485)/H},parentBox,insetBox,verticalEdges:[leftEdge,rightEdge],caps:[top,bottom],edgeThreshold:25,maxGap:5,edgeSeparation:69};
const defs={left:{q:[[168,485],[299,485],[299,818],[368,818],[368,878],[168,878]],pixels:55623},inset:{q:[[299,522],[368,522],[368,818],[299,818]],pixels:20424},right:{q:[[299,485],[572,485],[572,878],[368,878],[368,522],[299,522]],pixels:82725}};
function panel(role){const {q,pixels}=defs[role],xs=q.map(p=>p[0]),ys=q.map(p=>p[1]),x0=Math.min(...xs),y0=Math.min(...ys),x1=Math.max(...xs),y1=Math.max(...ys);return {x:x0/W,y:y0/H,w:(x1-x0)/W,h:(y1-y0)/H,_identitySource:'structural-grid-frame',_geometryType:'orthogonal',_geometryOwner:'structural-grid-outline',_outline:q.map(([x,y])=>({x:x/W,y:y/H})),_structuralGridProof:{...JSON.parse(JSON.stringify(common)),role,pixelOutline:q,stats:{pixels,mean:92,variance:2300,dark:Math.floor(pixels*.31),light:Math.floor(pixels*.22)}}};}
const left=panel('left'),inset=panel('inset'),right=panel('right');assert(D.validPanel(left));assert(D.validPanel(inset));assert(D.validPanel(right));
let bad=JSON.parse(JSON.stringify(inset));bad._structuralGridProof.caps[0].support=.2;assert(!D.validPanel(bad));
bad=JSON.parse(JSON.stringify(right));bad._outline[3].x+=.01;assert(!D.validPanel(bad));
bad=JSON.parse(JSON.stringify(left));bad._structuralGridProof.verticalEdges[0].coverage=.5;assert(!D.validPanel(bad));
bad=JSON.parse(JSON.stringify(inset));bad._structuralGridProof.edgeSeparation=70;assert(!D.validPanel(bad));
const src=fs.readFileSync(path.join(root,'js/panels-structural-grid.js'),'utf8');for(const forbidden of ['Wolverine (2010-2012) 1000-031.jpg','readerPage:32','bfcb55c5cbaa118e9bf4f0515b4ea7d6a1279963db5045f9bd897b296f7cab1f'])assert(!src.includes(forbidden));
console.log(JSON.stringify({leftValid:true,insetValid:true,rightValid:true,weakCapRejected:true,tamperedOutlineRejected:true,weakRailRejected:true,separationTamperRejected:true,runtimeFixtureKeysAbsent:true}));
