'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const gutters=require('../js/panels-gutter-frames');
function fixture({empty=false,twins=false,crossing=false,inset=false,mirror=false,fringe=false}={}){
 const w=400,h=600,data=new Uint8Array(w*h*4),anchors=[];
 const put=(x,y,c)=>{if(mirror)x=w-1-x;const i=(y*w+x)*4;data.set([...c,255],i);};
 for(let y=0;y<h;y++)for(let x=0;x<w;x++)put(x,y,[90,120,125]);
 const fill=(a,b,c,d,color)=>{for(let y=b;y<=d;y++)for(let x=a;x<=c;x++)put(x,y,color);};
 function frame(x,y,r,b){fill(x,y,r,b,[8,8,8]);fill(x+3,y+3,r-3,b-3,[210,180,150]);
  if(mirror)[x,r]=[w-1-r,w-1-x];
  anchors.push({x:x/w,y:y/h,w:(r-x)/w,h:(b-y)/h,_quad:[{x:x/w,y:y/h},{x:r/w,y:y/h},{x:r/w,y:b/h},{x:x/w,y:b/h}],_identitySource:'closed-frame',
   _closedFrameProof:{version:1,connected:true,analysisWidth:w,analysisHeight:h,railFits:[{slope:0,offset:y},{slope:0,offset:b},{slope:0,offset:x},{slope:0,offset:r}],gutterProof:{method:'exterior-gradient-gutter',exteriorSupport:[1,1,1,1]}}});
 }
 frame(20,20,380,100);if(fringe)fill(20,101,380,102,[8,8,8]);frame(220,112,380,438);frame(20,450,380,550);
 if(!empty){
  for(let y=230;y<440;y++)for(let x=25;x<207;x++)if(((x-116)/87)**2+((y-335)/104)**2<1)put(x,y,[40,45,50]);
  fill(28,115,64,191,[220,210,175]);fill(78,168,117,198,[220,210,175]);
 }
 if(twins){fill(1,103,217,447,[90,120,125]);fill(25,120,90,430,[35,40,45]);fill(130,120,197,430,[35,40,45]);}
 if(crossing)fill(100,95,105,350,[35,40,45]);
 if(inset)frame(40,230,190,420);
 return{data,w,h,anchors};
}
const run=o=>{const f=fixture(o);return gutters.openRegionsRGBA(f.data,f.w,f.h,f.anchors);};
for(const mirror of [false,true]){
 const result=run({mirror});assert.equal(result.length,1,'isolated whole borderless artwork and captions');
 const p=result[0];assert.equal(p._identitySource,'open-region');assert(p._openRegionProof.exteriorSupport.every(v=>v===1));
 for(const[x,y]of[[.29,.55],[.1,.25],[.25,.3]]){const xx=mirror?1-x:x;assert(xx>p.x&&xx<p.x+p.w&&y>p.y&&y<p.y+p.h,'art and both captions remain inside');}
}
assert.equal(run({fringe:true}).length,1,'quiet edge survives decoder ink fringe without relaxing its proof');
for(const opts of [{empty:true},{twins:true},{crossing:true},{inset:true}])assert.equal(run(opts).length,0,JSON.stringify(opts));
const f=fixture();assert.equal(gutters.openRegionsRGBA(f.data,f.w,f.h,f.anchors.slice(0,2)).length,0,'missing neighbor abstains');
f.anchors[0]._closedFrameProof.gutterProof.exteriorSupport[0]=.8;assert.equal(gutters.openRegionsRGBA(f.data,f.w,f.h,f.anchors).length,0,'unproved neighbor abstains');
const context=vm.createContext({console,window:{}});vm.runInContext(fs.readFileSync(require.resolve('../js/panels.js'),'utf8'),context);
const detector=context.window.PanelDetect,p=run({})[0],parent={x:0,y:0,w:1,h:.75};
assert.equal(detector._refineOpenRegions([parent],[parent],[p]).length,1);
assert.equal(detector._refineOpenRegions([parent],[parent,{x:.1,y:.3,w:.1,h:.1}],[p]).length,0,'another identity cannot be overwritten');
console.log('open regions: whole artwork/captions, mirror, empty/two-scene/crossing/inset negatives, neighbor proof and identity preservation passed');
