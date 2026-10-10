'use strict';
// Private source artwork and previously replayed descriptors are supplied locally.
const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const cv=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'@napi-rs/canvas'):'@napi-rs/canvas');
const root=path.resolve(__dirname,'../../..'),scripts=[...fs.readFileSync(root+'/index.html','utf8').matchAll(/src="(js\/(?!terminal-native-bootstrap\.js)(?:panels|terminal)[^\"]*\.js)"/g)].map(m=>m[1]);
const api=new Function('document','Image','ImageData','window',scripts.map(p=>fs.readFileSync(root+'/'+p,'utf8')).join('\n')+';return{PanelCropRepair,PanelGeometryOrthogonal};')({createElement:()=>cv.createCanvas(1,1)},cv.Image,cv.ImageData,{});
const [dir,baseline,out]=process.argv.slice(2);if(!out)throw Error('Usage: native-crop-corpus.cjs SOURCE_DIRECTORY BASELINE_JSON OUTPUT_JSON');
const rows=JSON.parse(fs.readFileSync(baseline)),results=fs.existsSync(out)?JSON.parse(fs.readFileSync(out)):[],done=new Set(results.map(r=>r.key));
const keepAlive=setInterval(()=>{},1000);
(async()=>{for(const row of rows){if(done.has(row.key))continue;const image=await cv.loadImage(path.join(dir,row.key)),panels=row.panels,record={key:row.key,owners:panels.length,repaired:[]};
const serialized=JSON.stringify(panels);const samples=new Map();
for(let index=0;index<panels.length;index++){const p=panels[index],contours=api.PanelGeometryOrthogonal._provenContours(p);if(!contours)continue;
const proof=p._structuralGridProof||p._matteCellProof||p._rimFrameProof||p._curvedRimProof||p._compositeFrameProof,w=proof?.analysisWidth,h=proof?.analysisHeight;if(!Number.isInteger(w)||!Number.isInteger(h)||w<80||h<80||w>900||h>900)continue;
const key=w+'x'+h;if(!samples.has(key)){const c=cv.createCanvas(w,h),g=c.getContext('2d');g.drawImage(image,0,0,w,h);samples.set(key,g.getImageData(0,0,w,h).data);}
const other=panels.filter(q=>q!==p&&q.x<p.x+p.w&&q.x+q.w>p.x&&q.y<p.y+p.h&&q.y+q.h>p.y).map(q=>api.PanelGeometryOrthogonal._provenContours(q)||[api.PanelGeometryOrthogonal._provenOutline(q)||[{x:q.x,y:q.y},{x:q.x+q.w,y:q.y},{x:q.x+q.w,y:q.y+q.h},{x:q.x,y:q.y+q.h}]]);
const start=performance.now(),repair=api.PanelCropRepair.repair(contours,w,h,other,samples.get(key)),ms=performance.now()-start;if(!repair)continue;
const before=api.PanelCropRepair.raster(contours,w,h),after=api.PanelCropRepair.raster(repair.contours,w,h);assert(before.every((v,i)=>!v||after[i]),'Owned pixel removed: '+row.key+' '+index);
for(const group of other){const foreign=api.PanelCropRepair.raster(group,w,h);assert(after.every((v,i)=>!v||before[i]||!foreign[i]),'Foreign owner borrowed: '+row.key+' '+index);}
record.repaired.push({selection:index+1,addedPixels:repair.addedPixels,patches:repair.patches,ms:Math.round(ms)});
}assert.equal(JSON.stringify(panels),serialized,'Detector descriptor changed');results.push(record);fs.writeFileSync(out,JSON.stringify(results));console.log(row.key,record.repaired.length+'/'+panels.length);
}assert.equal(results.length,rows.length,'Incomplete corpus');console.log(JSON.stringify({pages:results.length,owners:results.reduce((s,r)=>s+r.owners,0),modifiedMasks:results.reduce((s,r)=>s+r.repaired.length,0),allOriginalPixelsRetained:true,noOtherOwnerPixelsAdded:true,allDescriptorsUnchanged:true}));})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>clearInterval(keepAlive));
