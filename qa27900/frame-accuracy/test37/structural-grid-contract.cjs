'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../../..'),D=require(path.join(root,'js/panels-structural-grid.js'));
const W=300,H=450,rgba=new Uint8ClampedArray(W*H*4),set=(x,y,v)=>{const i=(y*W+x)*4;rgba[i]=rgba[i+1]=rgba[i+2]=v;rgba[i+3]=255;};
for(let y=0;y<H;y++)for(let x=0;x<W;x++)set(x,y,8);
const cells=[[10,10,145,220],[155,10,290,70],[155,80,290,220],[10,230,165,350],[175,230,290,350],[10,360,290,425]];
for(let n=0;n<cells.length;n++){const [x0,y0,x1,y1]=cells[n];for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const stripe=((x>>3)+(y>>3)+n)%3;set(x,y,stripe===0?55:stripe===1?135:210);}}
const out=D.analyzeRGBA(rgba,W,H);assert.equal(out.length,6);assert(out.every(D.validPanel));assert.deepEqual(out.map(p=>p._structuralGridProof.index),[0,1,2,3,4,5]);
const bad=JSON.parse(JSON.stringify(out[2]));bad._structuralGridProof.stats.variance=1;assert(!D.validPanel(bad));
const src=fs.readFileSync(path.join(root,'js/panels-structural-grid.js'),'utf8');for(const forbidden of ['Wolverine (2010-2012) 1000-022.jpg','readerPage:23','26c072f75ffbc0612d13ab8da8a3acb39ccb699329b267b95f17d1cab6286ec6'])assert(!src.includes(forbidden));
console.log(JSON.stringify({syntheticCells:out.length,allProofsValid:true,tamperRejected:true,runtimeFixtureKeysAbsent:true}));
