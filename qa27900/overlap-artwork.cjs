'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict');
if(!process.argv.includes('--comic')){console.log('Use --comic with local artwork.');process.exit(0);}
const fresh=require('./harness'),labels=require('./frame-accuracy/queue-artwork-27923.json').frames;
const ctx=vm.createContext({console,PanelGeometry:fresh.api.PanelGeometry,localStorage:{getItem(){return null;}},requestAnimationFrame(){},clamp:(v,a,b)=>Math.max(a,Math.min(b,v))});
for(const f of ['panels-geometry-orthogonal.js','reader.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../js',f),'utf8'),ctx);
const reader=vm.runInContext('Reader',ctx),rect={left:0,top:0,width:600,height:900};reader.mode='single';reader.scale=1;reader.panelZoomEnabled=true;reader.comic={id:'overlap-fixture'};reader.els={stage:{getBoundingClientRect:()=>rect}};reader.getPanelImageContext=()=>({img:{},rect});let captures=[];reader.zoomToPanel=p=>captures.push(JSON.parse(JSON.stringify(p)));
(async()=>{let count=0;
async function check(detect,quality){for(const page of [9,10]){
 reader.currentPanels=await detect.detect(fresh.pages[page-1]);reader.index=page-1;reader.getPageUrl=async()=>fresh.pages[page-1];
 console.log(quality,'page',page,reader.currentPanels.length,'identities');
 assert.equal(reader.currentPanels.filter(p=>p._identitySource==='overlap-frame').length,3,quality+' page'+page);
 for(const label of labels.filter(l=>l.page===page)){
 captures=[];for(const[x,y]of label.points)await reader.handleSingleTap({x:x*600,y:y*900});
 assert.equal(captures.length,label.points.length);for(const p of captures){assert.equal(p._identitySource,'overlap-frame');assert.equal(p._overlapProof.index,label.index,label.name);assert.deepEqual(p._outline,captures[0]._outline,'tap-independent visible crop');assert.equal(p._outline.length,label.outline.length);p._outline.forEach((v,i)=>assert(Math.hypot(v.x-label.outline[i][0],v.y-label.outline[i][1])<.009,quality+' '+label.name+' border'+i));count++;}
 }
}}
await check(fresh.api.PanelDetect,'Sharp');
if(process.argv.includes('--skia')){const{loadImage,createCanvas}=require('@napi-rs/canvas');for(const quality of ['low','medium','high']){
 class Image{set src(file){loadImage(file).then(img=>{this.native=img;this.width=img.width;this.height=img.height;this.onload();}).catch(e=>this.onerror(e));}}
 const document={createElement(){const canvas={};canvas.getContext=()=>({drawImage(img){const c=createCanvas(canvas.width,canvas.height),cx=c.getContext('2d');cx.imageSmoothingQuality=quality;cx.drawImage(img.native,0,0,canvas.width,canvas.height);canvas.cx=cx;},getImageData(...args){return canvas.cx.getImageData(...args);}});return canvas;}};
 const code=['panels-page-layout.js','panels-gutter-frames.js','panels-closed-frames.js','panels-overlap-frames.js','bubbles.js','panels-partition.js','panels.js'].map(n=>fs.readFileSync(path.join(__dirname,'../js',n),'utf8')).join('\n');
 const detect=new Function('Image','document','window',code+'\nreturn PanelDetect;')(Image,document,{});await check(detect,'Skia '+quality);
}}
console.log(count+' overlap artwork handler/border checks passed.');})().catch(e=>{console.error(e);process.exitCode=1;});
