'use strict';
const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../../..'),api=new Function(fs.readFileSync(root+'/js/panels-matte-cells.js','utf8')+'\n'+fs.readFileSync(root+'/js/panels-crop-repair.js','utf8')+'\nconst PanelTrailingEdgeGroups={validPanel:p=>p.certified===true};\n'+fs.readFileSync(root+'/js/panels-detached-captions.js','utf8')+';return PanelDetachedCaptions;')();
const w=300,h=600,owner={x:0,y:.3,w:.6,h:.7,certified:true},peer={x:.65,y:.3,w:.35,h:.7},masks=[new Uint8Array(w*h),new Uint8Array(w*h)];
function source({alpha=255,ink=true,color=true,gap=false}={}){const a=new Uint8ClampedArray(w*h*4);for(let i=0;i<w*h;i++)a.set([15,120,170,alpha],i*4);for(let y=195;y<221;y++)for(let x=20;x<145;x++)a.set(color?[255,220,35,alpha]:[255,255,255,alpha],(y*w+x)*4);if(ink)for(let n=0;n<12;n++)for(let y=202;y<214;y++)for(let x=27+n*9;x<31+n*9;x++)a.set([20,20,20,alpha],(y*w+x)*4);if(gap)for(let y=195;y<221;y++)for(let x=70;x<78;x++)a.set([15,120,170,alpha],(y*w+x)*4);return a;}
const a=source(),out=api.analyzeRGBA(a,w,h,[owner,peer],masks);assert.equal(out.length,1);assert.equal(out[0].owner,0);assert(out[0].indices.includes(208*w+28));assert.deepEqual(out[0].sourceThresholds,[45,65]);
for(const option of[{alpha:200},{ink:false},{color:false},{gap:true}])assert.equal(api.analyzeRGBA(source(option),w,h,[owner,peer],masks).length,0,JSON.stringify(option));
assert.equal(api.analyzeRGBA(a,w,h,[{...owner,certified:false},peer],masks).length,0,'Uncertified geometry');
assert.equal(api.analyzeRGBA(a,w,h,[owner,{...peer,x:0,w:1}],masks).length,0,'Competing bounds');
assert.equal(api.analyzeRGBA(a,w,h,[{...owner,x:.2},peer],masks).length,0,'Caption crosses owner bounds');
const blocked=masks.map(m=>m.slice());blocked[1][208*w+28]=1;assert.equal(api.analyzeRGBA(a,w,h,[owner,peer],blocked).length,0,'Borrowed foreign ink');
const retained=masks.map(m=>m.slice());for(const i of out[0].indices)retained[0][i]=1;assert.equal(api.analyzeRGBA(a,w,h,[owner,peer],retained).length,0,'Existing caption duplicated');
assert.deepEqual(api.analyzeRGBA(a,w,h,[owner,peer],masks),out,'Stable replay');
console.log(JSON.stringify({passed:true,completeDetachedCaption:true,foreignInkVeto:true,ambiguousBoundsVeto:true,sourceRequired:true,uncertifiedVeto:true,existingOwnerUnchanged:true,negativeCases:8}));
