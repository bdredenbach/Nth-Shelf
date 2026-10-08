'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('node:assert/strict'),cv=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/@napi-rs/canvas');
const root=path.resolve(__dirname,'../../..'),scripts=[...fs.readFileSync(root+'/index.html','utf8').matchAll(/src="(js\/panels[^\"]*\.js)"/g)].map(m=>m[1]),ctx=vm.createContext({console,window:{},document:{}});
vm.runInContext(scripts.map(p=>fs.readFileSync(root+'/'+p,'utf8')).join('\n'),ctx);
// Isolate speech evidence from the separately tested discovery validators.
vm.runInContext("PanelLocalBoundaryConsensus.validPanel=p=>p.kind==='upper';PanelTrailingEdgeGroups.validPanel=p=>p.kind==='lower';",ctx);
const api=vm.runInContext('PanelAtomicBoundarySpeech',ctx),w=400,h=600;
function panel(kind,y,H){const proof={analysisWidth:w,analysisHeight:h,first:{_structuralGridProof:{palette:{paper:true}}},second:{_structuralGridProof:{palette:{paper:true}}}};return{kind,x:0,y,w:1,h:H,_structuralGridProof:proof,_contours:[[{x:0,y},{x:1,y},{x:1,y:y+H},{x:0,y:y+H}]]};}
const owners=[panel('upper',0,.5),panel('lower',.5,.5)];
function source({rim='#ee2044',ink=true,tail=true,alpha=255,offset=0}={}){const c=cv.createCanvas(w,h),g=c.getContext('2d'),x=245+offset,y=299;
 g.fillStyle='#dedede';g.fillRect(0,0,w,h);g.fillStyle='#161616';g.beginPath();g.ellipse(x,y,70,33,0,0,Math.PI*2);g.fill();g.fillStyle=rim;g.beginPath();g.ellipse(x,y,67,30,0,0,Math.PI*2);g.fill();
 if(tail){g.fillStyle='#161616';g.beginPath();g.moveTo(x-38,y+12);g.lineTo(x-70,y+50);g.lineTo(x-13,y+23);g.closePath();g.fill();g.fillStyle=rim;g.beginPath();g.moveTo(x-45,y+7);g.lineTo(x-69,y+49);g.lineTo(x-5,y+26);g.closePath();g.fill();}
 g.fillStyle='#fff';g.beginPath();g.ellipse(x,y,59,23,0,0,Math.PI*2);g.fill();if(tail){g.beginPath();g.moveTo(x-34,y+12);g.lineTo(x-62,y+43);g.lineTo(x-17,y+20);g.closePath();g.fill();}
 if(ink){g.fillStyle='#111';for(let k=0;k<24;k++)g.fillRect(x-45+(k%12)*8,y-13+Math.floor(k/12)*14,4,8);}
 const a=g.getImageData(0,0,w,h).data;if(alpha!==255)for(let i=3;i<a.length;i+=4)a[i]=alpha;return a;
}
const a=source(),out=api.analyzeRGBA(a,w,h,owners);assert.equal(out.length,1);assert.equal(out[0].owner,1);assert.equal(out[0].foreign,0);assert(out[0].letters>=12);assert(out[0].indices.length>out[0].hits[0]+out[0].hits[1]);
for(const option of[{rim:'#777777'},{ink:false},{tail:false},{alpha:200}])assert.equal(api.analyzeRGBA(source(option),w,h,owners).length,0,JSON.stringify(option));
assert.equal(api.analyzeRGBA(a,w,h,[owners[0]]).length,0);assert.equal(api.analyzeRGBA(a,w,h,[owners[0],{...owners[1],y:.65}]).length,0,'Separated owners');
const corrupt=JSON.parse(JSON.stringify(owners));corrupt[0]._structuralGridProof.first._structuralGridProof.palette.paper=false;assert.equal(api.analyzeRGBA(a,w,h,corrupt).length,0,'Non-paper proof');
for(const option of[{rim:'#24ba50'},{rim:'#405fe0',offset:20}]){const q=api.analyzeRGBA(source(option),w,h,owners);assert.equal(q.length,1,'Independent outline hue/placement');assert.equal(q[0].owner,1);}
assert.equal(api.analyzeRGBA(a,w+.5,h,owners).length,0,'Fractional dimensions');assert.equal(api.analyzeRGBA(a,w,h-1,owners).length,0,'Dimension mismatch');assert.equal(api.analyzeRGBA(a,w,901,owners).length,0,'Oversized sample');
assert.deepEqual(api.analyzeRGBA(a,w,h,owners),out,'Stable replay');
console.log(JSON.stringify({passed:true,completeSourceRim:true,exclusiveTailConsensus:true,syntheticAlternateHuesAndPlacement:true,negativeCases:10,stableReplay:true}));
