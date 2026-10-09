"use strict";
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
let cv;try{cv=require('@napi-rs/canvas');}catch(_){cv=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/@napi-rs/canvas');}
const root=path.resolve(process.env.NTH_SHELF_SOURCE||path.join(__dirname,'../../..'));
const moduleFile=process.env.NTH_CHROMATIC_OCCLUSION_MODULE||path.join(root,'js/panels-chromatic-occlusion-cell.js');
const scriptFiles=[...fs.readFileSync(root+'/index.html','utf8').matchAll(/src="(js\/panels[^\"]*\.js)"/g)].map(m=>m[1]);
if(!scriptFiles.includes('js/panels-chromatic-occlusion-cell.js'))scriptFiles.push('js/panels-chromatic-occlusion-cell.js');
const ctx=vm.createContext({console,window:{},document:{createElement:()=>cv.createCanvas(1,1)},Image:cv.Image,setTimeout,clearTimeout});
vm.runInContext(scriptFiles.map(p=>fs.readFileSync(p==='js/panels-chromatic-occlusion-cell.js'?moduleFile:path.join(root,p),'utf8')).join('\n'),ctx);
const M=vm.runInContext('PanelChromaticOcclusionCell',ctx),R=vm.runInContext('PanelColoredRims',ctx),C=vm.runInContext('PanelCropRepair',ctx),clone=x=>JSON.parse(JSON.stringify(x));
function fixture(options={}){const c=cv.createCanvas(700,900),g=c.getContext('2d');g.fillStyle='#5e2643';g.fillRect(0,0,700,900);function body(x,y,w,h){g.fillStyle='#111111';g.fillRect(x-3,y-3,w+6,h+6);g.fillStyle='#de4747';g.fillRect(x,y,w,h);g.fillStyle='#242424';g.fillRect(x+7,y+7,w-14,h-14);for(let j=y+10;j<y+h-10;j+=9){g.fillStyle=(j%27===1)?'#d4c589':'#647475';g.fillRect(x+12,j,w-24,4);}}
 body(130,130,360,355);body(535,65,130,570);g.fillStyle='#5e2643';g.fillRect(587,60,25,16);g.beginPath();g.moveTo(588,80);g.lineTo(587,35);g.lineTo(596,26);g.lineTo(605,33);g.lineTo(611,80);g.closePath();g.fillStyle='#e5c276';g.fill();g.lineWidth=3;g.strokeStyle='#151515';g.stroke();
 function balloon(x,y){g.beginPath();g.ellipse(x,y,34,24,0,0,2*Math.PI);g.fillStyle='#fafafa';g.fill();g.strokeStyle='#151515';g.lineWidth=2;g.stroke();g.fillStyle='#111111';for(let j=-10;j<=10;j+=8)for(let i=-22;i<=20;i+=6)g.fillRect(x+i,y+j,3,4);}
 balloon(600,335);if(options.foreignBalloon)balloon(628,655);if(options.missingRail){g.fillStyle='#5e2643';g.fillRect(655,200,20,90);}if(options.openCap){g.fillStyle='#5e2643';g.fillRect(583,16,34,80);}if(options.ambiguous){g.fillStyle='#5e2643';g.fillRect(575,7,80,35);}if(options.flat){g.fillStyle='#242424';g.fillRect(0,0,700,900);}if(options.stacked){g.fillStyle='#fafafa';g.fillRect(537,365,126,22);g.fillStyle='#de4747';g.fillRect(535,364,130,6);g.fillRect(535,386,130,6);}if(options.wideGap){g.fillStyle='#5e2643';g.fillRect(560,60,75,20);}
 let out=c;if(options.mirror||options.shift){const d=cv.createCanvas(700,900),q=d.getContext('2d');q.fillStyle='#5e2643';q.fillRect(0,0,700,900);q.translate(options.mirror?700:0,0);q.scale(options.mirror?-1:1,1);q.drawImage(c,options.shift?-24:0,options.shift?18:0);out=d;}
 if(options.scale){const d=cv.createCanvas(Math.round(700*options.scale),Math.round(900*options.scale));d.getContext('2d').drawImage(out,0,0,d.width,d.height);out=d;}
 const image=out.getContext('2d').getImageData(0,0,out.width,out.height);if(options.hue){for(let i=0;i<image.data.length;i+=4){const [r,g,b]=[image.data[i],image.data[i+1],image.data[i+2]];image.data[i]=g;image.data[i+1]=b;image.data[i+2]=r;}out.getContext('2d').putImageData(image,0,0);}
 return{a:image.data,w:out.width,h:out.height,canvas:out};}

const records=[];let seed;
for(const[name,options,expected]of [['base',{},1],['mirrored',{mirror:true},1],['translated',{shift:true},1],['smaller',{scale:.9},1],['palette-cycle',{hue:true},1],['foreign-balloon',{foreignBalloon:true},1],['missing-rail',{missingRail:true},0],['missing-protrusion',{openCap:true},0],['wide-gap',{wideGap:true},0],['stacked-frames',{stacked:true},0],['flat-interior',{flat:true},0]]){
 const q=fixture(options),prior=R.analyzeRGBA(q.a,q.w,q.h),added=M.analyzeRGBA(q.a,q.w,q.h,prior);assert.equal(added.length,expected,name);if(expected)assert(M.validPanel(clone(added[0])),'persisted '+name);
 records.push({name,added:added.length});if(name==='base')seed={...q,prior,child:added[0]};console.log('PASS generated',name);
}
const{a,w,h,prior,child}=seed;
assert(M.sourceReplay(clone(child),a,w,h,clone(prior)),'persisted source replay');
assert.equal(M.analyzeRGBA(a,w,h,[]).length,0,'missing anchor');
assert.equal(M.analyzeRGBA(a,w,h,[...prior,...prior]).length,0,'duplicate anchor');
assert.equal(M.analyzeRGBA(a,w-1,h,prior).length,0,'wrong dimensions');
const alpha=a.slice();alpha[3]=0;assert.equal(M.analyzeRGBA(alpha,w,h,prior).length,0,'transparent source');
let tampered=0;for(const change of[p=>p.x+=.01,p=>p._contours[0][0].x+=.01,p=>p._structuralGridProof.pixels++,p=>p._structuralGridProof.rows[0][1]++,p=>p._structuralGridProof.witnesses[0].cap[0]++,p=>p._structuralGridProof.witnesses[1].capPixels++,p=>p._structuralGridProof.internalRows[0][1]=9999,p=>p._structuralGridProof.backdrop.domain[1]++,p=>p._structuralGridProof.difference++,p=>p._structuralGridProof.anchor.x+=.01,p=>p._structuralGridProof.version++,p=>p._geometryType='other',p=>p._quad=[]]){const p=clone(child);change(p);assert.equal(M.validPanel(p),false,'tamper '+tampered);tampered++;}
const forged=clone(child);forged._structuralGridProof.variance++;assert.equal(M.sourceReplay(forged,a,w,h,prior),false,'source-bound variance is replayed');
assert.equal(M.sourceReplay(child,fixture({openCap:true}).a,w,h,prior),false,'stale descriptor after missing protrusion');
console.log('PASS persisted/source replay and',tampered,'tamper cases');
function fakeReader(owners,img){return{currentPanels:owners,panelZoomEnabled:true,getPanelImageContext:()=>img?{img}:null,panelContours:p=>p._contours||null,pointInContours:(rings,x,y)=>{let hit=false;for(const ring of rings||[])if(C.inside(ring,x,y))hit=!hit;return hit;},displayPanelContours(p,c){this.oldDisplayOwners=this.currentPanels;return c;},findPanelAt(x,y){this.oldFindOwners=this.currentPanels;return this.panelZoomEnabled?this.currentPanels.find(p=>x>=p.x&&x<=p.x+p.w&&y>=p.y&&y<=p.y+p.h&&(!p._contours||this.pointInContours(p._contours,x,y)))||null:null;},zoomToPanel(p){this.zoomed=p;}};}
(async()=>{
 const img=new cv.Image();img.src=seed.canvas.toBuffer('image/png');await img.decode();
 const owners=[clone(prior[0]),clone(child)],r=fakeReader(owners,img);M.installReader(r);const displayed=r.displayPanelContours(owners[1]);assert(displayed);assert.equal(r.oldDisplayOwners.length,1,'old display sees trusted prior only');
 const mask=C.raster(displayed,w,h),anchor=C.raster(r.displayPanelContours(owners[0]),w,h);let hits=0;for(let i=0;i<mask.length;i++)if(mask[i]){assert.equal(anchor[i],0);assert.equal(r.findPanelAt((i%w+.5)/w,((i/w|0)+.5)/h),owners[1]);hits++;}assert.equal(r.oldFindOwners.length,1);assert.equal(r.currentPanels,owners,'restore owner context');
 r.zoomToPanel(owners[1]);assert.equal(r.zoomed,owners[1]);r.panelZoomEnabled=false;assert.equal(r.findPanelAt(.85,.4),null);r.panelZoomEnabled=true;
 const invalid=clone(child);invalid._structuralGridProof.pixels++;r.currentPanels=[owners[0],invalid];assert.equal(r.displayPanelContours(invalid),null);r.zoomed=null;r.zoomToPanel(invalid);assert.equal(r.zoomed,null);assert.notEqual(r.findPanelAt(.85,.4),invalid);assert.deepEqual(clone(r.displayPanelContours(owners[0])),clone(owners[0]._contours),'trusted prior survives malformed child');
 r.currentPanels=[clone(child)];assert.equal(r.displayPanelContours(r.currentPanels[0]),null,'missing prior quarantined');
 const unavailable=fakeReader([clone(prior[0]),clone(child)],null);M.installReader(unavailable);assert.equal(unavailable.displayPanelContours(unavailable.currentPanels[1]),null);assert.notEqual(unavailable.findPanelAt(.85,.4),unavailable.currentPanels[1]);unavailable.zoomToPanel(unavailable.currentPanels[1]);assert.equal(unavailable.zoomed,undefined);unavailable.displayPanelContours(unavailable.currentPanels[0]);assert.equal(unavailable.oldDisplayOwners.length,1,'missing source excludes child rectangles from old crop repair');
 const normal={x:.05,y:.8,w:.2,h:.1},base=fakeReader([normal],null);M.installReader(base);assert.equal(base.findPanelAt(.1,.85),normal,'ordinary rectangle fallback');base.getPanelImageContext=()=>{throw Error('viewport unavailable');};assert.equal(base.displayPanelContours(normal),null);assert.equal(base.findPanelAt(.1,.85),normal,'absent family never reads image context');base.zoomToPanel(normal);assert.equal(base.zoomed,normal);
 const stale=fakeReader([clone(prior[0]),clone(child)],img);M.installReader(stale);assert(stale.displayPanelContours(stale.currentPanels[1]));const wrong=new cv.Image();wrong.src=fixture({flat:true}).canvas.toBuffer('image/png');await wrong.decode();stale.getPanelImageContext=()=>({img:wrong});assert.equal(stale.displayPanelContours(stale.currentPanels[1]),null,'changed source clears valid state');
 console.log('PASS',hits,'exclusive generated taps; source binding, trusted prior, invalid child display/taps/zoom, missing image/owner, disabled taps, and rectangle fallback');
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>clearInterval(keepAlive));
const keepAlive=setInterval(()=>{},1000);
