'use strict';
const fs=require('fs'),assert=require('node:assert/strict'),cv=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/@napi-rs/canvas'),root=process.env.NTH_SHELF_SOURCE;
const code=['panels-matte-cells','panels-colored-rims','panels-ragged-gutters','panels-source-layout'].map(p=>fs.readFileSync(root+'/js/'+p+'.js','utf8')).join('\n'),P=new Function('document',code+';return PanelSourceLayout;')({createElement:()=>cv.createCanvas(1,1)}),checks=[];
const q=(x,y,w,h,id='existing-independent')=>({x:x/1480,y:y/2200,w:w/1480,h:h/2200,_identitySource:id});
function contains(p,x,y){let v=false;for(const r of p._contours||[])for(let k=0,j=r.length-1;k<r.length;j=k++){const a=r[k],b=r[j];if((a.y>y)!==(b.y>y)&&x<(b.x-a.x)*(y-a.y)/(b.y-a.y)+a.x)v=!v;}return v;}
function fixture({mirror=false,rotate=false,empty=false,open=false,competitor=false,color='#f4e4b4',fractional=false}={}){
 let c=cv.createCanvas(1480,2200),oracle=cv.createCanvas(1480,2200),g=c.getContext('2d'),o=oracle.getContext('2d');g.fillStyle=color;g.fillRect(0,0,1480,2200);
 if(fractional){g.translate(.37,.61);o.translate(.37,.61);}
 const rect=(x,y,w,h)=>{const v=g.createLinearGradient(x,y,x+w,y+h);v.addColorStop(0,'#284657');v.addColorStop(1,'#b4c690');g.fillStyle=v;g.fillRect(x,y,w,h);g.strokeStyle='black';g.lineWidth=6;g.strokeRect(x,y,w,h);g.beginPath();g.moveTo(x+w*.55,y+6);g.lineTo(x+w*.55,y+h-6);g.stroke();g.fillStyle='white';g.fillRect(x+35,y+35,90,40);};
 rect(40,40,1380,700);rect(40,800,520,1000);rect(940,800,480,1000);
 if(open){g.fillStyle=color;g.fillRect(925,785,510,30);}
 o.save();o.beginPath();o.rect(564,796,372,1008);o.clip();if(!empty)for(const ctx of [g,o]){ctx.fillStyle='#14212b';ctx.beginPath();ctx.ellipse(750,1390,193,320,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#b17844';ctx.beginPath();ctx.ellipse(800,1400,110,200,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='black';ctx.font='bold 54px sans-serif';ctx.fillText('SNIFF',650,880);ctx.fillText('SNIFF',680,950);}
 o.restore();let prior=[q(40,40,1380,700),{...q(40,800,900,1000,'structural-grid-frame'),_structuralGridProof:{version:18,seed:{splits:[{axis:1,pos:940}]}}},q(940,800,480,1000)];if(competitor)prior.push(q(720,1200,100,300));
 let center=[.5,1400/2200],leftCenter=[300/1480,1300/2200];
 const transform=(canvas,matrix,w,h)=>{const d=cv.createCanvas(w,h),ctx=d.getContext('2d');ctx.setTransform(...matrix);ctx.drawImage(canvas,0,0);return d;};
 if(mirror){c=transform(c,[-1,0,0,1,1480,0],1480,2200);oracle=transform(oracle,[-1,0,0,1,1480,0],1480,2200);prior=prior.map(p=>({...p,x:1-p.x-p.w}));center=[1-center[0],center[1]];leftCenter=[1-leftCenter[0],leftCenter[1]];}
 if(rotate){c=transform(c,[0,1,-1,0,2200,0],2200,1480);oracle=transform(oracle,[0,1,-1,0,2200,0],2200,1480);prior=prior.map(p=>({...p,x:1-p.y-p.h,y:p.x,w:p.h,h:p.w}));center=[1-center[1],center[0]];leftCenter=[1-leftCenter[1],leftCenter[0]];}
 return{c,oracle,prior,center,leftCenter};
}
async function run(f){const img=new cv.Image();img.src=f.c.toBuffer('image/png');await img.decode();return{img,panels:P.refineImage(img,f.prior)};}
function check(name,fn){fn();checks.push({name,passed:true});}
(async()=>{
 for(const [name,opt] of [['portrait corridor',{}],['mirrored',{mirror:true}],['quarter turn',{rotate:true}],['fractional source',{fractional:true}],['different matte',{color:'#a7cad9'}]]){
  const f=fixture(opt),{img,panels}=await run(f),p=panels.find(p=>p._geometryType==='borderless-scene-corridor'&&contains(p,...f.center));
  check(name+': independent scene exists',()=>assert(p,name));
  check(name+': neighboring scene excluded',()=>assert(!contains(p,...f.leftCenter)));
  const a=f.oracle.getContext('2d').getImageData(0,0,f.oracle.width,f.oracle.height).data;
  const mask=cv.createCanvas(f.c.width,f.c.height),g=mask.getContext('2d');g.beginPath();for(const ring of p._contours){ring.forEach((v,k)=>k?g.lineTo(v.x*mask.width,v.y*mask.height):g.moveTo(v.x*mask.width,v.y*mask.height));g.closePath();}g.fillStyle='white';g.fill('evenodd');const alpha=g.getImageData(0,0,mask.width,mask.height).data;let missing=0,total=0;
  // The oracle was independently clipped to the declared peer-rim corridor
  // before detector execution. Every source alpha pixel must be retained.
  for(let i=0;i<a.length/4;i++)if(a[i*4+3]){total++;missing+=alpha[i*4+3]!==255;}
  check(name+': effect glyphs and portrait centers retained',()=>{assert(total>40000);assert.equal(missing,0);const effects=opt.rotate?[1-900/2200,730/1480]:[opt.mirror?1-730/1480:730/1480,900/2200];assert(contains(p,...effects));});
  check(name+': serialized evidence replays',()=>assert(P.validateImage(JSON.parse(JSON.stringify(p)),img)));
  const tampered=JSON.parse(JSON.stringify(p));tampered._sourceLayoutProof.evidence.variance+=1;check(name+': forged evidence rejected',()=>assert(!P.validateImage(tampered,img)));
 }
 for(const [name,opt] of [['blank corridor',{empty:true}],['open peer rim',{open:true}],['independent inset veto',{competitor:true}]]){
  const f=fixture(opt),{panels}=await run(f);check(name+': no invented independent corridor',()=>assert(!panels.some(p=>p._geometryType==='borderless-scene-corridor')));
 }
 const f=fixture(),r=await run(f),p=r.panels.find(p=>p._geometryType==='borderless-scene-corridor');const g=f.c.getContext('2d'),a=g.getImageData(0,0,1,1);a.data[0]^=1;g.putImageData(a,0,0);const changed=await run(f);check('source pixel edit invalidates issued native evidence',()=>assert(!P.validateImage(JSON.parse(JSON.stringify(p)),changed.img)));
 console.log(JSON.stringify({passed:true,controls:checks.length,qualification:'Synthetic independently drawn scenes; production pixel rules and serialized proof validation, no comic lookup.',checks},null,2));
})().catch(e=>{console.error(e);process.exitCode=1});
