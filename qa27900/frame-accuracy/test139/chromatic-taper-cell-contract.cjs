"use strict";
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
let cv;try{cv=require('@napi-rs/canvas');}catch(_){cv=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/@napi-rs/canvas');}
const root=path.resolve(process.env.NTH_SHELF_SOURCE||path.join(__dirname,'../../..'));
const module82=process.env.NTH_CHROMATIC_OCCLUSION_MODULE||path.join(root,'js/panels-chromatic-occlusion-cell.js'),module85=process.env.NTH_CHROMATIC_TAPER_MODULE||path.join(root,'js/panels-chromatic-taper-cell.js');
const scripts=[...fs.readFileSync(root+'/index.html','utf8').matchAll(/src="(js\/panels[^\"]*\.js)"/g)].map(m=>m[1]);
for(const p of ['js/panels-chromatic-occlusion-cell.js','js/panels-chromatic-taper-cell.js'])if(!scripts.includes(p))scripts.push(p);
const ctx=vm.createContext({console,window:{},document:{createElement:()=>cv.createCanvas(1,1)},Image:cv.Image,setTimeout,clearTimeout});
vm.runInContext(scripts.map(p=>fs.readFileSync(p==='js/panels-chromatic-occlusion-cell.js'?module82:p==='js/panels-chromatic-taper-cell.js'?module85:path.join(root,p),'utf8')).join('\n'),ctx);
const M=vm.runInContext('PanelChromaticTaperCell',ctx),P=vm.runInContext('PanelChromaticOcclusionCell',ctx),R=vm.runInContext('PanelColoredRims',ctx),C=vm.runInContext('PanelCropRepair',ctx),clone=x=>JSON.parse(JSON.stringify(x));
function fixture(cv,options={}){
 const c=cv.createCanvas(900,900),g=c.getContext('2d');g.fillStyle='#5e2643';g.fillRect(0,0,900,900);
 function texture(x,y,w,h){g.fillStyle='#242424';g.fillRect(x,y,w,h);for(let j=y+10;j<y+h-10;j+=9){g.fillStyle=(j%27===1)?'#d4c589':'#647475';g.fillRect(x+12,j,w-24,4);}}
 function body(x,y,w,h){g.fillStyle='#111111';g.fillRect(x-3,y-3,w+6,h+6);g.fillStyle='#de4747';g.fillRect(x,y,w,h);texture(x+7,y+7,w-14,h-14);}
 function taperPath(){g.beginPath();g.moveTo(28,80);g.lineTo(214,80);g.lineTo(214,450);g.lineTo(28,615);g.closePath();}
 g.save();taperPath();g.clip();texture(20,70,220,560);g.restore();taperPath();g.lineWidth=14;g.strokeStyle='#111111';g.stroke();g.lineWidth=8;g.strokeStyle='#de4747';g.stroke();
 body(214,190,471,260);body(745,85,130,650);
 g.fillStyle='#5e2643';g.fillRect(797,80,25,16);g.beginPath();g.moveTo(798,100);g.lineTo(797,55);g.lineTo(806,46);g.lineTo(815,53);g.lineTo(821,100);g.closePath();g.fillStyle='#e5c276';g.fill();g.lineWidth=3;g.strokeStyle='#151515';g.stroke();
 function balloon(x,y){g.beginPath();g.ellipse(x,y,34,24,0,0,2*Math.PI);g.fillStyle='#fafafa';g.fill();g.strokeStyle='#151515';g.lineWidth=2;g.stroke();g.fillStyle='#111111';for(let j=-10;j<=10;j+=8)for(let i=-22;i<=20;i+=6)g.fillRect(x+i,y+j,3,4);}
 balloon(810,355);balloon(115,240);
 if(options.foreignBalloon)balloon(145,590);
 if(options.missingTop){g.fillStyle='#5e2643';g.fillRect(20,70,200,22);}
 if(options.missingSide){g.fillStyle='#5e2643';g.fillRect(18,300,20,110);}
 if(options.missingCollar){g.beginPath();g.moveTo(28,615);g.lineTo(214,450);g.lineWidth=48;g.strokeStyle='#5e2643';g.stroke();}
 if(options.stacked){g.fillStyle='#fafafa';g.fillRect(28,342,186,22);g.fillStyle='#de4747';g.fillRect(28,342,186,6);g.fillRect(28,358,186,6);}
 if(options.flat){g.fillStyle='#242424';g.fillRect(0,0,900,900);}
 let out=c;if(options.mirror||options.shift){const d=cv.createCanvas(900,900),q=d.getContext('2d');q.fillStyle='#5e2643';q.fillRect(0,0,900,900);q.translate(options.mirror?900:0,0);q.scale(options.mirror?-1:1,1);q.drawImage(c,options.shift?14:0,options.shift?18:0);out=d;}
 if(options.scale){const d=cv.createCanvas(Math.round(900*options.scale),Math.round(900*options.scale));d.getContext('2d').drawImage(out,0,0,d.width,d.height);out=d;}
 const im=out.getContext('2d').getImageData(0,0,out.width,out.height);if(options.hue){for(let i=0;i<im.data.length;i+=4){const[r,g,b]=[im.data[i],im.data[i+1],im.data[i+2]];im.data[i]=g;im.data[i+1]=b;im.data[i+2]=r;}out.getContext('2d').putImageData(im,0,0);}
 return{a:im.data,w:out.width,h:out.height,canvas:out};
}


const records=[];let seed;
for(const[name,options,expected]of [['base',{},1],['mirrored',{mirror:true},1],['translated',{shift:true},1],['smaller',{scale:.9},1],['palette-cycle',{hue:true},1],['foreign-balloon',{foreignBalloon:true},1],['missing-top',{missingTop:true},0],['missing-side',{missingSide:true},0],['missing-collar',{missingCollar:true},0],['stacked',{stacked:true},0],['flat',{flat:true},0]]){
 const q=fixture(cv,options),anchor=R.analyzeRGBA(q.a,q.w,q.h),cap=P.analyzeRGBA(q.a,q.w,q.h,anchor),prior=anchor.concat(cap),before=JSON.stringify(prior),added=M.analyzeRGBA(q.a,q.w,q.h,prior);assert.equal(added.length,expected,name);assert.equal(JSON.stringify(prior),before,'retained descriptors '+name);if(expected)assert(M.validPanel(clone(added[0])),'persisted '+name);records.push({name,added:added.length});if(name==='base')seed={...q,prior,child:added[0]};console.log('PASS generated',name);
}
const{a,w,h,prior,child}=seed;
assert(M.sourceReplay(clone(child),a,w,h,clone(prior)),'persisted source replay');
assert.equal(M.analyzeRGBA(a,w,h,[]).length,0,'missing prior');assert.equal(M.analyzeRGBA(a,w,h,[prior[0],prior[0]]).length,0,'duplicate parent');assert.equal(M.analyzeRGBA(a,w,h,prior.slice().reverse()).length,0,'wrong prior order');assert.equal(M.analyzeRGBA(a,w-1,h,prior).length,0,'wrong dimensions');const alpha=a.slice();alpha[3]=0;assert.equal(M.analyzeRGBA(alpha,w,h,prior).length,0,'transparent source');
let tampered=0;for(const change of[p=>p.x+=.01,p=>p._contours[0][0].x+=.01,p=>p._structuralGridProof.pixels++,p=>p._structuralGridProof.rows[0][1]++,p=>p._structuralGridProof.witnesses[0].path[0]+=10,p=>p._structuralGridProof.witnesses[1].ink=0,p=>p._structuralGridProof.separators[0][1]=9999,p=>p._structuralGridProof.candidate.intercept++,p=>p._structuralGridProof.difference++,p=>p._structuralGridProof.prior[0].x+=.01,p=>p._structuralGridProof.version++,p=>p._geometryType='other',p=>p._quad=[]]){const p=clone(child);change(p);assert.equal(M.validPanel(p),false,'tamper '+tampered);tampered++;}
const forged=clone(child);forged._structuralGridProof.variance++;assert.equal(M.sourceReplay(forged,a,w,h,prior),false,'source-bound variance');assert.equal(M.sourceReplay(child,fixture(cv,{missingCollar:true}).a,w,h,prior),false,'stale lower collar source');console.log('PASS persistence/source replay and',tampered,'tamper controls');
function fakeReader(owners,img){return{currentPanels:owners,panelZoomEnabled:true,getPanelImageContext:()=>img?{img}:null,panelContours:p=>p._contours||null,pointInContours:(rings,x,y)=>{let hit=false;for(const ring of rings||[])if(C.inside(ring,x,y))hit=!hit;return hit;},displayPanelContours(p,c){this.oldDisplayOwners=this.currentPanels;return c;},findPanelAt(x,y){this.oldFindOwners=this.currentPanels;return this.panelZoomEnabled?this.currentPanels.find(p=>x>=p.x&&x<=p.x+p.w&&y>=p.y&&y<=p.y+p.h&&(!p._contours||this.pointInContours(p._contours,x,y)))||null:null;},zoomToPanel(p){this.zoomed=p;this.oldZoomOwners=this.currentPanels;return this.deferred;}};}
(async()=>{
 const img=new cv.Image();img.src=seed.canvas.toBuffer('image/png');await img.decode();const owners=clone(prior).concat(clone(child)),r=fakeReader(owners,img);P.installReader(r);M.installReader(r);const displayed=r.displayPanelContours(owners[2]);assert(displayed);const mask=C.raster(displayed,w,h),blocked=new Uint8Array(w*h);for(const p of owners.slice(0,2)){const m=C.raster(r.displayPanelContours(p),w,h);for(let i=0;i<m.length;i++)blocked[i]|=m[i];}let hits=0;for(let i=0;i<mask.length;i++)if(mask[i]){assert.equal(blocked[i],0);assert.equal(r.findPanelAt((i%w+.5)/w,((i/w|0)+.5)/h),owners[2]);hits++;}assert.equal(r.currentPanels,owners);
 await r.zoomToPanel(owners[1]);assert.equal(r.zoomed,owners[1],'accepted prior child still zooms');assert.equal(r.oldZoomOwners.length,2,'older zoom gets original prior context');assert.equal(r.currentPanels,owners,'async zoom restores owners');await r.zoomToPanel(owners[2]);assert.equal(r.zoomed,owners[2]);r.panelZoomEnabled=false;assert.equal(r.findPanelAt(.12,.2),null);r.panelZoomEnabled=true;
 const invalid=clone(child);invalid._structuralGridProof.pixels++;r.currentPanels=owners.slice(0,2).concat(invalid);assert.equal(r.displayPanelContours(invalid),null);r.zoomed=null;await r.zoomToPanel(invalid);assert.equal(r.zoomed,null);assert.notEqual(r.findPanelAt(.12,.2),invalid);await r.zoomToPanel(owners[1]);assert.equal(r.zoomed,owners[1],'malformed new child preserves prior child zoom');
 r.currentPanels=[clone(child)];assert.equal(r.displayPanelContours(r.currentPanels[0]),null,'missing prior quarantines child');
 const unavailable=fakeReader(clone(prior).concat(clone(child)),null);P.installReader(unavailable);M.installReader(unavailable);assert.equal(unavailable.displayPanelContours(unavailable.currentPanels[2]),null);assert.notEqual(unavailable.findPanelAt(.12,.2),unavailable.currentPanels[2]);await unavailable.zoomToPanel(unavailable.currentPanels[2]);assert.equal(unavailable.zoomed,undefined);
 const normal={x:.05,y:.8,w:.2,h:.1},base=fakeReader([normal],null);P.installReader(base);M.installReader(base);base.getPanelImageContext=()=>{throw Error('viewport unavailable');};assert.equal(base.displayPanelContours(normal),null);assert.equal(base.findPanelAt(.1,.85),normal);await base.zoomToPanel(normal);assert.equal(base.zoomed,normal);
 const stale=fakeReader(clone(prior).concat(clone(child)),img);P.installReader(stale);M.installReader(stale);assert(stale.displayPanelContours(stale.currentPanels[2]));let resolve;stale.deferred=new Promise(r=>resolve=r);const pending=stale.zoomToPanel(stale.currentPanels[1]),newOwners=[];stale.currentPanels=newOwners;resolve();await pending;assert.equal(stale.currentPanels,newOwners,'async restoration does not overwrite newer navigation');stale.currentPanels=clone(prior).concat(clone(child));const wrong=new cv.Image();wrong.src=fixture(cv,{flat:true}).canvas.toBuffer('image/png');await wrong.decode();stale.getPanelImageContext=()=>({img:wrong});assert.equal(stale.displayPanelContours(stale.currentPanels[2]),null,'changed source invalidates state');
 console.log('PASS',hits,'exclusive generated taps; prior child display/zoom preservation, quarantine, source binding, disabled taps, absent-family viewport, fallback, and concurrent navigation');
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>clearInterval(keepAlive));
const keepAlive=setInterval(()=>{},1000);
