'use strict';
// Optional local artwork test. The copyrighted comic is deliberately absent
// from the repository/CI. Invoke with --comic when the harness fixture exists.
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
if(!process.argv.includes('--comic')){console.log('Use --comic with the local 74-page Wolverine fixture.');process.exit(0);}
const fresh=require('./harness'),plain=v=>JSON.parse(JSON.stringify(v));
const labels=require('./frame-accuracy/queue-artwork-27916.json');
const ctx=vm.createContext({console,PanelGeometry:fresh.api.PanelGeometry,localStorage:{getItem(){return null;}},
  requestAnimationFrame(){},clamp:(v,a,b)=>Math.max(a,Math.min(b,v))});
vm.runInContext(fs.readFileSync(path.join(__dirname,'../js/reader.js'),'utf8'),ctx);
const reader=vm.runInContext('Reader',ctx),rect={left:0,top:0,width:600,height:900};
reader.mode='single';reader.scale=1;reader.panelZoomEnabled=true;reader.comic={id:'artwork-fixture'};
reader.els={stage:{getBoundingClientRect:()=>rect}};
reader.getPanelImageContext=()=>({img:{},rect});
let captures=[];reader.zoomToPanel=p=>captures.push(plain(p));
const shape=p=>[p.x,p.y,p.w,p.h,p._quad];
function point(q,u,v){return [0,1].map(a=>(1-v)*((1-u)*q[0][a]+u*q[1][a])+v*((1-u)*q[3][a]+u*q[2][a]));}
const positions=[[.5,.5],[.16,.5],[.84,.5],[.5,.16],[.5,.84]];
(async()=>{
  let count=0;
  for(const page of [3,6]){
    const panels=await fresh.api.PanelDetect.detect(fresh.pages[page-1]);
    assert.equal(panels.length,{3:5,6:5}[page],`page${page}: independently identified frame count`);
    if(process.env.NTH_BASELINE_ROOT&&page===6){
      const old=require(path.resolve(process.env.NTH_BASELINE_ROOT,'qa27900/harness'));
      const previous=await old.api.PanelDetect.detect(old.pages[page-1]);
      previous.forEach(p=>assert.ok(panels.some(n=>JSON.stringify(plain(n))===JSON.stringify(plain(p))),
        `page${page}: preserve every existing .15 frame and all its evidence`));
    }
    reader.index=page-1;reader.currentPanels=panels;reader.getPageUrl=async()=>fresh.pages[page-1];
    let targets=labels.frames.filter(f=>f.page===page);
    const owners=new Set();
    for(const target of targets){
      captures=[];
      for(const [u,v]of positions){const[x,y]=point(target.quad,u,v);assert.ok(reader.findPanelAt(x,y),`page${page} ${target.name}: tap has a page identity`);await reader.handleSingleTap({x:x*600,y:y*900});}
      assert.equal(captures.length,5);
      captures.forEach(p=>assert.deepEqual(shape(p),shape(captures[0]),`page${page} ${target.name}: moved taps keep one whole frame`));
      const p=captures[0];if(target.source)assert.equal(p._identitySource,target.source);
      if(target.tolerance){assert.equal(p._quad.length,4);p._quad.forEach((v,i)=>{assert.ok(Math.abs(v.x-target.quad[i][0])<=target.tolerance&&Math.abs(v.y-target.quad[i][1])<=target.tolerance,`page${page} ${target.name}: fitted corner${i} follows independent artwork label`);});}
      owners.add(JSON.stringify(shape(p)));count+=5;
    }
    assert.equal(owners.size,targets.length,`page${page}: separate printed panels keep distinct owners`);
    console.log(`page${page}: ${targets.length*5} whole-frame reader taps passed`);
  }
  console.log(`${count} reader-handler tap checks passed; artwork labels are approximate, phone verification still required.`);
})().catch(e=>{console.error(e);process.exitCode=1;});
