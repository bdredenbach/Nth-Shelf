'use strict';
const assert=require('node:assert/strict'),path=require('node:path');
const D=require(path.resolve(__dirname,'../../../js/panels-structural-grid.js'));
const W=600,H=900;
const anchorBoxes=[[20,15,290,305],[305,20,580,230],[285,230,555,375],[20,305,195,535],[175,310,575,650],[25,510,165,890],[170,545,570,890]];
const q0=[[20,15],[298,16],[298,305],[20,305]],q1=[[305,20],[580,20],[580,230],[305,230]],q2=[[285,230],[558,230],[558,375],[285,375]],q5=[[25,510],[165,545],[165,890],[25,890]],q6=[[170,545],[570,650],[570,890],[170,890]];
const stepRail={x:250,lo:246,hi:252,samples:146,dark:142,maxRun:130,left:132,right:80,both:48,score:1.4,groupScore:1.3};
const outlines=[[[20,15],[298,16],[298,230],[250,230],[250,305],[20,305]],q1,[[250,230],[558,230],[558,375],[250,375]],[[20,305],[250,305],[250,375],[575,375],[570,650],[170,545],[165,545],[25,510]],q5,q6];
function area(q){return Math.abs(q.reduce((s,a,i)=>{const b=q[(i+1)%q.length];return s+a[0]*b[1]-a[1]*b[0];},0)/2)}
function panel(index){const q=outlines[index],xs=q.map(v=>v[0]),ys=q.map(v=>v[1]),x0=Math.min(...xs),y0=Math.min(...ys),x1=Math.max(...xs),y1=Math.max(...ys),pixels=Math.max(1000,Math.round(area(q)));return{x:x0/W,y:y0/H,w:(x1-x0)/W,h:(y1-y0)/H,_identitySource:'structural-grid-frame',_geometryOwner:'structural-grid-outline',_geometryType:index===0||index===3?'stepped-shared-outline':'orthogonal',_outline:q.map(([x,y])=>({x:x/W,y:y/H})),_structuralGridProof:{version:7,method:'tap-independent-stepped-inset-shared-seam-v2',connected:true,analysisWidth:W,analysisHeight:H,baselineCount:7,count:6,anchorBoxes,refinedQuads:[q0,q1,q2,q5,q6],stepRail,outlines,index,pixelOutline:q,stats:{pixels,mean:95,variance:2200,dark:Math.floor(pixels*.28),light:Math.floor(pixels*.21)}}};}
const panels=outlines.map((_,i)=>panel(i));assert(panels.every(D.validPanel));
let bad=JSON.parse(JSON.stringify(panels[0]));bad._structuralGridProof.stepRail.dark=10;assert(!D.validPanel(bad));
bad=JSON.parse(JSON.stringify(panels[3]));bad._outline[2].x+=.01;assert(!D.validPanel(bad));
bad=JSON.parse(JSON.stringify(panels[4]));bad._structuralGridProof.anchorBoxes[5][2]=500;assert(!D.validPanel(bad));
console.log(JSON.stringify({sixProofsValid:true,weakStepRailRejected:true,tamperedOutlineRejected:true,anchorTamperRejected:true}));
