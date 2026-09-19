'use strict';
const assert=require('node:assert/strict'),det=require('../js/panels-partition');
function fixture({tilted=false,inset=false,partialInset=false,broken=false,noVertical=false,flat=false,thinDivider=0,edgeDivider=false,oneEnded=false}={}){
 const w=420,h=700,data=new Uint8Array(w*h*4),pad=20,rx=w-pad,by=h-pad;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const v=x<pad||x>rx||y<pad||y>by?250:150+35*Math.sin(x*.083+y*.12)+20*Math.sin(x*.157-y*.111);data[i]=data[i+1]=data[i+2]=flat?5:Math.round(v);data[i+3]=255;}
 function line(a,b,gap=false,thickness=2.2){const dx=b[0]-a[0],dy=b[1]-a[1],length=dx*dx+dy*dy;for(let y=Math.max(0,Math.floor(Math.min(a[1],b[1])-3));y<=Math.min(h-1,Math.ceil(Math.max(a[1],b[1])+3));y++)for(let x=Math.max(0,Math.floor(Math.min(a[0],b[0])-3));x<=Math.min(w-1,Math.ceil(Math.max(a[0],b[0])+3));x++){const t=((x-a[0])*dx+(y-a[1])*dy)/length;if(t<0||t>1||gap&&t>.32&&t<.54)continue;if(Math.hypot(x-a[0]-dx*t,y-a[1]-dy*t)>thickness)continue;const i=(y*w+x)*4;data[i]=data[i+1]=data[i+2]=5;}}
 const top=[pad,pad],right=[rx,pad],bottomR=[rx,by],bottomL=[pad,by];for(const[a,b]of[[top,right],[right,bottomR],[bottomR,bottomL],[bottomL,top]])line(a,b);
 const h1=[[pad,210],[rx,tilted?224:210]],h2=[[pad,450],[rx,tilted?432:450]];line(...h1,broken);line(...h2);
 const middleX=270,bottomX=180,bottomEnd=tilted?160:bottomX;const at=(seg,x)=>seg[0][1]+(seg[1][1]-seg[0][1])*(x-seg[0][0])/(seg[1][0]-seg[0][0]);
 const mp=[middleX,at(h1,middleX)],mq=[tilted?276:middleX,at(h2,tilted?276:middleX)],bp=[bottomX,at(h2,bottomX)],bq=[bottomEnd,by];if(!noVertical){line(mp,mq);line(bp,bq);}
 if(inset){const iq=[[55,65],[170,65],[170,145],[55,145]];for(let i=0;i<4;i++)line(iq[i],iq[(i+1)%4],partialInset&&i===3);}
 if(thinDivider){const y=110+(thinDivider%2===0?.5:0);line([pad,y],[rx,y],false,thinDivider/2-.01);}
 if(edgeDivider)line([pad,34],[rx,34]);
 if(oneEnded)for(let y=215;y<=246;y++)for(let x=266;x<=274;x++){const i=(y*w+x)*4;data[i]=data[i+1]=data[i+2]=Math.round(150+35*Math.sin(x*.083+y*.12)+20*Math.sin(x*.157-y*.111));}
 const expected=[[top,right,h1[1],h1[0]],[h1[0],mp,mq,h2[0]],[mp,h1[1],h2[1],mq],[h2[0],bp,bq,bottomL],[bp,h2[1],bottomR,bq]];
 return {data,w,h,expected};
}
function run(opts){const f=fixture(opts);return {f,ps:det.analyzeRGBA(f.data,f.w,f.h)};}
for(const tilted of [false,true]){const{f,ps}=run({tilted});assert.equal(ps.length,5,'five independently drawn leaves found');for(let k=0;k<5;k++){assert.equal(ps[k]._partitionProof.connected,true);for(let c=0;c<4;c++){const p=ps[k]._quad[c],q=f.expected[k][c];assert(Math.hypot(p.x*f.w-q[0],p.y*f.h-q[1])<4,'fitted leaf follows actual printed border');}}if(tilted)assert(Math.abs(ps[3]._quad[1].x-ps[3]._quad[2].x)>.03,'tilted vertical divider retained');}
assert.equal(run({inset:true}).ps.length,0,'inset invalidates whole partition instead of being absorbed');
assert.equal(run({inset:true,partialInset:true}).ps.length,0,'partly obscured inset invalidates whole partition');
assert.equal(run({broken:true}).ps.length,0,'interrupted full divider cannot silently merge leaves');
assert.equal(run({oneEnded:true}).ps.length,0,'one-ended interrupted divider cannot merge middle leaves');
for(const thinDivider of [1,2])assert.equal(run({thinDivider}).ps.length,0,'thin real divider vetoes merged parent even when unsuitable for splitting');
assert.equal(run({edgeDivider:true}).ps.length,0,'narrow edge panel must defer rather than merge');
assert.equal(run({noVertical:true}).ps.length,0,'one-axis layout outside conservative partition scope');
assert.equal(run({flat:true}).ps.length,0,'uniform dark artwork abstains');
assert.equal(det.analyzeRGBA(new Uint8Array(8),420,700).length,0,'malformed data rejected');
console.log('page-partition: independently drawn connected leaves, two-axis tilt, insets, partial borders and malformed input passed');
// Existing independent frames keep priority unless a complete partition proves
// matching borders and disjoint additions (covered by partition-completion).
const fs=require('node:fs'),vm=require('node:vm');
(async()=>{
 let base=[],stack=[],closed=[{id:'already-proved'}],calls=0,fail=false;
 const offered=[{id:'partition-leaf'}];
 const scope={console,window:{},Image:class{set src(value){queueMicrotask(()=>this.onload());}},
   PanelPageLayout:{analyze:()=>stack},PanelClosedFrames:{analyzeImage:()=>closed},
   PanelPartition:{analyzeImage(){calls++;if(fail)throw new Error('uncertain');return offered;}}};
 vm.createContext(scope);vm.runInContext(fs.readFileSync(require.resolve('../js/panels.js'),'utf8'),scope);
 const reader=scope.window.PanelDetect;reader._analyze=()=>base;
 assert.equal(await reader.detect('fixture'),closed);assert.equal(calls,1,'an incomplete partition cannot alter an established identity');
 closed=[];base=[{id:'baseline'}];assert.equal(await reader.detect('fixture'),base);assert.equal(calls,1);
 base=[];stack=Array.from({length:5},(_,i)=>({id:i}));assert.equal(await reader.detect('fixture'),stack);assert.equal(calls,1);
 stack=[];assert.equal(await reader.detect('fixture'),offered);assert.equal(calls,2,'partition can fill an empty page identity result');
 fail=true;assert.equal((await reader.detect('fixture')).length,0,'partition failure leaves the original tap fallback available');
 console.log('page-partition: established route priority and failure fallback passed');
})().catch(error=>{console.error(error);process.exitCode=1;});
