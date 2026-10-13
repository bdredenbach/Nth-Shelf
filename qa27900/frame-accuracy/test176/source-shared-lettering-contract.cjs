'use strict';
const fs=require('fs'),path=require('path'),assert=require('node:assert/strict'),cv=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/@napi-rs/canvas');
const root=path.resolve(__dirname,'../../..'),code=['panels-matte-cells','panels-colored-rims','panels-source-layout'].map(n=>fs.readFileSync(root+'/js/'+n+'.js','utf8')).join('\n');
const P=new Function('document',code+';return PanelSourceLayout;')({createElement:()=>cv.createCanvas(1,1)}),rows=[];
// The oracle is drawn independently. No detector contour or scene mask draws it.
function fixture({mirror=false,fractional=false,single=false,pair=false,outline=true,detached=false,solid=false,color='#d42132',scale=2.7}={}){
 const c=cv.createCanvas(Math.round(720*scale),Math.round(560*scale)),o=cv.createCanvas(c.width,c.height),g=c.getContext('2d'),a=o.getContext('2d');g.fillStyle='#709bc2';g.fillRect(0,0,c.width,c.height);for(const ctx of [g,a]){ctx.scale(scale,scale);if(mirror){ctx.translate(720,0);ctx.scale(-1,1);}if(fractional)ctx.translate(.37,.61);}
 const gradient=(x,y,w,h)=>{const z=g.createLinearGradient(x,y,x+w,y+h);z.addColorStop(0,'#709bc2');z.addColorStop(1,'#d0a865');g.fillStyle=z;g.fillRect(x,y,w,h);};gradient(0,0,720,560);
 const boxes=[[15,20,280,170],[15,185,280,350],[320,400,705,535]];g.strokeStyle='black';g.lineWidth=4;for(const b of boxes){gradient(b[0],b[1],b[2]-b[0],b[3]-b[1]);g.strokeRect(b[0],b[1],b[2]-b[0],b[3]-b[1]);}
 for(const ctx of [g,a]){ctx.lineWidth=3.5;ctx.strokeStyle='white';ctx.fillStyle=color;for(let k=0;k<(single?1:pair?2:3);k++){const x=470+k*66,y=detached?260:(k===2?385:425);if(solid){ctx.fillRect(x,y-90,48,90);if(outline)ctx.strokeRect(x,y-90,48,90);}else{const p=new cv.Path2D();p.moveTo(x,y);p.lineTo(x,y-90);p.lineTo(x+34,y-90);p.quadraticCurveTo(x+48,y-90,x+48,y-68);p.lineTo(x+48,y-54);p.quadraticCurveTo(x+48,y-39,x+28,y-38);p.lineTo(x+48,y);p.lineTo(x+43,y);p.lineTo(x+24,y-38);p.lineTo(x+6,y-38);p.lineTo(x+6,y);p.closePath();p.moveTo(x+8,y-81);p.lineTo(x+8,y-48);p.lineTo(x+31,y-48);p.quadraticCurveTo(x+39,y-48,x+39,y-60);p.lineTo(x+39,y-70);p.quadraticCurveTo(x+39,y-81,x+31,y-81);p.closePath();ctx.fill(p,'evenodd');if(outline)ctx.stroke(p);}}}
 return {c,o};
}
async function owners(f,prior=[]){const img=new cv.Image();img.src=f.c.toBuffer('image/png');await img.decode();return {img,panels:P.refineImage(img,prior)};}
function contains(p,x,y){let inside=false;for(const ring of p._contours)for(let k=0,j=ring.length-1;k<ring.length;j=k++){const a=ring[k],b=ring[j];if((a.y>y)!==(b.y>y)&&x<(b.x-a.x)*(y-a.y)/(b.y-a.y)+a.x)inside=!inside;}return inside;}
function check(name,fn){fn();rows.push({name,passed:true});}
(async()=>{
for(const [name,options] of [['original',{}],['mirrored',{mirror:true}],['fractional',{fractional:true}],['green',{color:'#21c432'}],['native thin outline',{scale:3.15}]]){
 const f=fixture(options),v=await owners(f),group=v.panels.find(p=>p._geometryType==='shared-lettering-group');assert(group,name+': missing group');const rgba=f.o.getContext('2d').getImageData(0,0,f.o.width,f.o.height).data;let total=0,missing=0;for(let i=0;i<rgba.length/4;i++)if(rgba[i*4+3]){total++;missing+=!contains(group,(i%f.o.width+.5)/f.o.width,(Math.floor(i/f.o.width)+.5)/f.o.height);}
 check(name+': every native ink/outline/antialiased oracle pixel survives',()=>{assert(total>0);assert.equal(missing,0);});
 const inset=v.panels.find(p=>p._geometryType==='shared-scene-cell');check(name+': independent source inset is ordered before the group',()=>{assert(inset);assert(v.panels.indexOf(inset)<v.panels.indexOf(group));assert(inset.w*inset.h<group.w*group.h);});
 check(name+': serialized group recomputes from source',()=>assert(P.validateImage(JSON.parse(JSON.stringify(group)),v.img)));
}
for(const [name,options] of [['isolated single',{single:true}],['two letters',{pair:true}],['no white outline',{outline:false}],['detached token',{detached:true}],['outlined solid artwork',{solid:true}]]){const v=await owners(fixture(options));check(name+' defers shared ownership',()=>assert(!v.panels.some(p=>p._geometryType==='shared-lettering-group')));}
const f=fixture(),v=await owners(f),group=v.panels.find(p=>p._geometryType==='shared-lettering-group'),q=JSON.parse(JSON.stringify(group));q._sourceLayoutProof.evidence.shared=[];const guarded=await owners(f,[{x:.7,y:.77,w:.08,h:.08,_identitySource:'independent-frame'}]);check('a smaller independent inset vetoes a scene union',()=>assert(!guarded.panels.some(p=>p._geometryType==='shared-lettering-group')));
check('serialized ownership tampering is rejected',()=>assert(!P.validateImage(q,v.img)));
const altered=fixture();const d=altered.c.getContext('2d').getImageData(6,0,1,1);d.data[0]^=1;altered.c.getContext('2d').setTransform(1,0,0,1,0,0);altered.c.getContext('2d').putImageData(d,6,0);const im=new cv.Image();im.src=altered.c.toBuffer('image/png');await im.decode();const live=P.refineImage(im,[]).find(p=>p._geometryType==='shared-lettering-group');check('native tampering fixture is invisible to the coarse signature',()=>assert.equal(live._sourceLayoutProof.signature,group._sourceLayoutProof.signature));
check('fine native source edit invalidates serialized proof',()=>assert(!P.validateImage(JSON.parse(JSON.stringify(group)),im)));
console.log(JSON.stringify({passed:true,controls:rows.length,rows},null,2));
})().catch(e=>{console.error(e);process.exitCode=1});
