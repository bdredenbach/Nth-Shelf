'use strict';
const assert=require('node:assert/strict'),det=require('../js/panels-closed-frames');
function fixture({sloped=false,divider=false,inset=false,partial=false,gap=false,flat=false,darkArt=false}={}){
 const w=360,h=600,data=new Uint8Array(w*h*4),q=sloped?[[30,30],[330,32],[332,275],[29,273]]:[[30,30],[330,30],[330,275],[30,275]];
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){let v=flat?100:140+40*Math.sin(x*.091+y*.133)+30*Math.sin(x*.131-y*.127);const i=(y*w+x)*4;data[i]=data[i+1]=data[i+2]=Math.round(v);data[i+3]=255;}
 function segment(a,b,broken){const dx=b[0]-a[0],dy=b[1]-a[1],len=dx*dx+dy*dy;for(let y=Math.max(0,Math.floor(Math.min(a[1],b[1])-2));y<Math.min(h,Math.ceil(Math.max(a[1],b[1])+3));y++)for(let x=Math.max(0,Math.floor(Math.min(a[0],b[0])-2));x<Math.min(w,Math.ceil(Math.max(a[0],b[0])+3));x++){const t=((x-a[0])*dx+(y-a[1])*dy)/len;if(t<0||t>1||broken&&t>.32&&t<.56)continue;if(Math.hypot(x-a[0]-t*dx,y-a[1]-t*dy)>1.5)continue;const i=(y*w+x)*4;data[i]=data[i+1]=data[i+2]=5;}}
 if(darkArt)for(let y=266;y<=284;y++)for(let x=70;x<=292;x++){const i=(y*w+x)*4;data[i]=data[i+1]=data[i+2]=45;}
 if(!flat)for(let i=0;i<4;i++)segment(q[i],q[(i+1)%4],gap&&i===1);
 if(divider)segment([30,150],[330,150],partial);
 if(inset){const inner=[[210,70],[290,70],[290,150],[210,150]];for(let i=0;i<4;i++)segment(inner[i],inner[(i+1)%4],partial&&i===3);}
 return {data,w,h,q};
}
function run(opts){const f=fixture(opts);return {f,ps:det.analyzeRGBA(f.data,f.w,f.h)};}
for(const sloped of [false,true]){const {f,ps}=run({sloped});assert.equal(ps.length,1,'complete independently drawn frame found');const p=ps[0];assert.equal(p._closedFrameProof.connected,true);for(let i=0;i<4;i++)assert(Math.hypot(p._quad[i].x*f.w-f.q[i][0],p._quad[i].y*f.h-f.q[i][1])<=3,'fitted corner follows drawn rail');if(sloped)assert(Math.abs(p._quad[1].y-p._quad[0].y)>.001,'small measured slope retained');}
assert.equal(run({flat:true}).ps.length,0,'quiet artwork is not a frame');
assert.equal(run({gap:true}).ps.length,0,'missing outer edge rejects frame');
const divided=run({divider:true}).ps;assert(divided.length>=1);assert(!divided.some(p=>p.y<.1&&p.y+p.h>.4),'full internal divider forbids merged outer crop');
assert(!run({divider:true,partial:true}).ps.some(p=>p.y<.1&&p.y+p.h>.4),'interrupted divider joining both outer rails forbids merged crop');
for(const partial of [false,true]){const inset=run({inset:true,partial}).ps;assert(!inset.some(p=>p.w>.7),'complete and interrupted insets veto enclosing parent');}
{
 const f=fixture({darkArt:true}),supplement=anchors=>det.analyzeRGBA(f.data,f.w,f.h,null,{supplementOnly:true,anchors});
 assert.equal(det.analyzeRGBA(f.data,f.w,f.h).length,0,'original strict route remains unchanged beside dark art');
 const ps=supplement([]);assert.equal(ps.length,1,'uniform narrow ink core recovers a complete printed frame');
 assert(ps[0]._closedFrameProof.inkCoreProof);
 assert.equal(supplement(ps).length,0,'new proof never duplicates or replaces an established frame');
 const anchor=y=>({_quad:[{x:30/f.w,y:10/f.h},{x:330/f.w,y:10/f.h},{x:330/f.w,y:y/f.h},{x:30/f.w,y:y/f.h}]});
 const old=anchor(31),saved=JSON.stringify(old),trimmed=supplement([old]);
 assert.equal(trimmed.length,1,'shared finite-width ink permits a bounded inward adjustment');
 assert.equal(JSON.stringify(old),saved,'anchor stays byte-for-byte unchanged');
 assert(trimmed[0]._closedFrameProof.inkCoreProof.ownershipTrim.inwardPixels<=2);
 assert.equal(supplement([anchor(35)]).length,0,'overlap extending into artwork cannot be trimmed away');
 for(const opts of [{gap:true},{divider:true,partial:true},{inset:true,partial:true}]){
   const n=fixture({darkArt:true,...opts}),out=det.analyzeRGBA(n.data,n.w,n.h,null,{supplementOnly:true,anchors:[]});
   assert(!out.some(p=>p.w>.7&&p.h>.35),'ink-core route retains missing-edge and internal-uncertainty vetoes');
 }
}
assert.equal(det.analyzeRGBA(new Uint8Array(10),360,600).length,0,'invalid data rejects');
console.log('closed-frames: drawn corners, measured tilt, missing sides, internal divisions and inset ownership passed');
// Real detector routing with independently controlled candidates proves the new
// fallback cannot displace identities already established by either old route.
const fs=require('node:fs'),vm=require('node:vm');
(async()=>{
 let base=[],stack=[],calls=0,fail=false;
 const offered=[{_identitySource:'closed-frame'}],scope={console,window:{},Image:class{set src(v){queueMicrotask(()=>this.onload());}},PanelPageLayout:{analyze:()=>stack},PanelClosedFrames:{analyzeImage(){calls++;if(fail)throw new Error('unavailable');return offered;}}};
 vm.createContext(scope);vm.runInContext(fs.readFileSync(require.resolve('../js/panels.js'),'utf8'),scope);const panel=scope.window.PanelDetect;panel._analyze=()=>base;
 base=[{id:'existing'}];assert.equal(await panel.detect('unused'),base);assert.equal(calls,0,'baseline skips new detector');
 base=[];stack=Array.from({length:5},(_,i)=>({id:i}));assert.equal(await panel.detect('unused'),stack);assert.equal(calls,0,'whole strip stack skips new detector');
 stack=[];assert.equal(await panel.detect('unused'),offered);assert.equal(calls,1,'empty established routes invoke independent proof');
 fail=true;assert.equal((await panel.detect('unused')).length,0,'failed proof leaves legacy fallback available');
 console.log('closed-frames: established baseline and stack priority, empty-page routing and safe failure passed');
})().catch(error=>{console.error(error);process.exitCode=1;});
