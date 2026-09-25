'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../../..'),D=require(path.join(root,'js/panels-structural-grid.js'));
const W=300,H=450,rgba=new Uint8ClampedArray(W*H*4),set=(x,y,v)=>{const i=(y*W+x)*4;rgba[i]=rgba[i+1]=rgba[i+2]=v;rgba[i+3]=255;};for(let y=0;y<H;y++)for(let x=0;x<W;x++)set(x,y,8);
const boxes=[[5,5,90,210],[100,5,295,210],[5,220,295,280],[5,290,140,445],[150,290,205,445],[215,290,295,445]];
for(let n=0;n<boxes.length;n++){const [x0,y0,x1,y1]=boxes[n];for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){let v=[55,135,210][((x>>3)+(y>>3)+n)%3];if(n===4&&y>=390)v=[20,90,130][((x>>2)+(y>>2))%3];set(x,y,v);}}
for(let x=150;x<=205;x++)for(let y=386;y<=390;y++)set(x,y,10);
const logs=[],out=D.analyzeRGBA(rgba,W,H,m=>logs.push(m));assert.equal(out.length,6);assert(out.every(D.validPanel));assert.equal(out[4]._structuralGridProof.box[3],449);assert.equal(out[4]._structuralGridProof.splits.length,5);assert(logs.some(x=>x.includes('retracted orphan H split')));
const src=fs.readFileSync(path.join(root,'js/panels-structural-grid.js'),'utf8');for(const forbidden of ['Wolverine (2010-2012) 1000-027.jpg','readerPage:28','242d5b1db336b249b7177e90c9863f0f05ab4da75677b2231324112b06b85e41'])assert(!src.includes(forbidden));
console.log(JSON.stringify({syntheticCells:out.length,narrowPanelReunited:true,remainingSplits:out[4]._structuralGridProof.splits.length,allProofsValid:true,runtimeFixtureKeysAbsent:true}));
