'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('node:assert/strict'),cv=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/@napi-rs/canvas');
const root=path.resolve(__dirname,'../../..'),ctx=vm.createContext({console,window:{},document:{createElement:()=>cv.createCanvas(1,1)}}),scripts=[...fs.readFileSync(root+'/index.html','utf8').matchAll(/src="(js\/panels[^\"]*\.js)"/g)].map(m=>m[1]);
vm.runInContext(scripts.map(p=>fs.readFileSync(root+'/'+p,'utf8')).join('\n')+';globalThis.R=PanelRaggedGutters;globalThis.D=PanelGutterTailSpeech;globalThis.G=PanelCropRepair;',ctx);
function source(color,dx=0,variant='tail'){
 const w=585,h=900,c=cv.createCanvas(w,h),g=c.getContext('2d');g.fillStyle='white';g.fillRect(0,0,w,h);
 const a=new Uint8ClampedArray(w*h*4);a.fill(255);for(let k=0;k<3;k++)for(let y=15+k*290;y<285+k*290;y++)for(let x=15;x<570;x++){const i=4*(y*w+x),m=(x+y)%6<3?.65:1;for(let j=0;j<3;j++)a[i+j]=Math.round(color[j]*m);}
 g.putImageData(new cv.ImageData(a,w,h),0,0);g.fillStyle='black';g.beginPath();g.ellipse(155+dx,289,37,24,0,0,Math.PI*2);g.fill();if(variant!=='tailless'){g.beginPath();g.moveTo(128+dx,302);g.lineTo(140+dx,328);g.lineTo(147+dx,302);g.fill();}
 g.fillStyle='white';g.beginPath();g.ellipse(155+dx,289,35,22,0,0,Math.PI*2);g.fill();if(variant!=='tailless'){g.beginPath();g.moveTo(130+dx,300);g.lineTo(140+dx,325);g.lineTo(145+dx,300);g.fill();}
 if(variant!=='unlettered'){g.fillStyle='black';for(let y=276;y<302;y+=8)for(let x=134+dx;x<178+dx;x+=6)g.fillRect(x,y,3,5);}
 const data=g.getImageData(0,0,w,h);for(let i=0;i<data.data.length;i+=4)if(data.data[i]===data.data[i+1]&&data.data[i]===data.data[i+2])data.data[i]=data.data[i+1]=data.data[i+2]=data.data[i]>185?255:0;
 g.putImageData(data,0,0);return{a:data.data,w,h,img:c};
}
let positives=0,negatives=0;
for(const color of [[170,205,100],[100,170,205],[205,100,170]])for(const dx of [-12,12]){const q=source(color,dx),owners=ctx.R.analyzeRGBA(q.a,q.w,q.h),before=JSON.stringify(owners),b=ctx.D.analyzeRGBA(q.a,q.w,q.h,owners);assert.equal(owners.length,3);assert.equal(b.length,1);assert.equal(b[0].owner,1);assert.equal(b[0].foreign,0);assert.equal(b[0].tails.length,2);assert.equal(JSON.stringify(owners),before);positives++;}
for(const variant of ['tailless','unlettered']){const q=source([170,205,100],0,variant),p=ctx.R.analyzeRGBA(q.a,q.w,q.h);assert.equal(ctx.D.analyzeRGBA(q.a,q.w,q.h,p).length,0);negatives++;}
const q=source([170,205,100]),owners=ctx.R.analyzeRGBA(q.a,q.w,q.h);
for(const mutate of [p=>p[0].x+=.01,p=>p.reverse(),p=>p[0]._structuralGridProof.pixels--,p=>p[0]._contours[0][0].x+=.01]){const p=JSON.parse(JSON.stringify(owners));mutate(p);assert.equal(ctx.D.analyzeRGBA(q.a,q.w,q.h,p).length,0);negatives++;}
const transparent=q.a.slice();transparent[3]=0;assert.equal(ctx.D.analyzeRGBA(transparent,q.w,q.h,owners).length,0);assert.equal(ctx.D.analyzeRGBA(source([100,170,205]).a,q.w,q.h,owners).length,0);negatives+=2;
let calls=0;const r={currentPanels:owners,panelZoomEnabled:true,panelContours:p=>p._contours,getPanelImageContext:()=>({img:q.img}),displayPanelContours(p,c){calls++;return c;},findPanelAt(){return null;}};
ctx.D.installReader(r);const b=ctx.D.analyzeRGBA(q.a,q.w,q.h,owners)[0],allowed=new Set(b.indices);let changed=0;
for(let k=0;k<3;k++){const before=ctx.G.raster(owners[k]._contours,q.w,q.h),result=r.displayPanelContours(owners[k]),after=ctx.G.raster(result,q.w,q.h);for(let i=0;i<before.length;i++){if(!allowed.has(i)||k===2)assert.equal(after[i],before[i]);else assert.equal(after[i],+(k===b.owner));changed+=+(after[i]!==before[i]);}assert.equal(r.displayPanelContours(owners[k]),result);}
assert(changed>0);for(const i of b.indices)assert.equal(r.findPanelAt((i%q.w+.5)/q.w,((i/q.w|0)+.5)/q.h),owners[b.owner]);assert.equal(calls,3);assert.equal(r.currentPanels,owners);
console.log(JSON.stringify({passed:true,positives,negatives,discoveryUnchanged:true,outsideBodyByteIdentical:true,completeBodyExclusive:true,thirdOwnerUnchanged:true,allBodyTapsOwned:true}));
