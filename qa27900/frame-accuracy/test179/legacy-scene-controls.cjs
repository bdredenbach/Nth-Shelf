'use strict';
const fs=require('fs'),assert=require('node:assert/strict'),cv=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/@napi-rs/canvas'),root=process.env.NTH_SHELF_SOURCE;
const code=['panels-matte-cells','panels-colored-rims','panels-ragged-gutters','panels-source-layout'].map(p=>fs.readFileSync(root+'/js/'+p+'.js','utf8')).join('\n'),P=new Function('document',code+';return PanelSourceLayout;')({createElement:()=>cv.createCanvas(1,1)}),checks=[];
const q=(x,y,w,h)=>({x:x/1480,y:y/2200,w:w/1480,h:h/2200});
function inside(p,[x,y]){let v=false;for(const r of p._contours||[])for(let i=0,j=r.length-1;i<r.length;j=i++){const a=r[i],b=r[j];if((a.y>y)!==(b.y>y)&&x<(b.x-a.x)*(y-a.y)/(b.y-a.y)+a.x)v=!v;}return v;}
async function fixture(mode,transform='none'){
 let c=cv.createCanvas(1480,2200),g=c.getContext('2d');g.fillStyle='#f4e4b4';g.fillRect(0,0,c.width,c.height);
 const rect=(x,y,w,h,black=false)=>{const a=g.createLinearGradient(x,y,x+w,y+h);a.addColorStop(0,'#284657');a.addColorStop(1,'#b4c690');g.fillStyle=black?'black':a;g.fillRect(x,y,w,h);g.strokeStyle='black';g.lineWidth=6;g.strokeRect(x,y,w,h);};
 rect(40,40,660,850);rect(760,40,660,850,true);rect(40,980,660,1130);rect(760,980,660,1130);
 g.fillStyle='#9ba67c';g.beginPath();g.ellipse(1090,430,250,190,0,0,Math.PI*2);g.fill();g.fillStyle='white';g.fillRect(950,90,210,95);g.fillRect(1020,730,240,100);g.fillStyle='black';g.font='bold 30px sans-serif';g.fillText('Above view',965,145);g.fillText('Below view',1035,785);
 let prior=mode==='aperture'?[q(40,40,660,850),q(760,40,660,170),q(760,230,660,400),q(760,700,660,190),q(40,980,660,1130),q(760,980,660,1130)]:[q(40,40,1380,850),q(40,980,660,1130),q(760,980,660,1130)];
 let target=[1090/1480,430/2200],above=[1050/1480,145/2200],below=[1140/1480,785/2200],left=[360/1480,430/2200];
 const map=transform==='mirror'?p=>[1-p[0],p[1]]:transform==='rotate'?p=>[1-p[1],p[0]]:p=>p;
 if(transform!=='none'){const r=cv.createCanvas(transform==='rotate'?2200:1480,transform==='rotate'?1480:2200),ctx=r.getContext('2d');if(transform==='mirror')ctx.setTransform(-1,0,0,1,1480,0);else ctx.setTransform(0,1,-1,0,2200,0);ctx.drawImage(c,0,0);c=r;prior=prior.map(p=>transform==='mirror'?{...p,x:1-p.x-p.w}:{...p,x:1-p.y-p.h,y:p.x,w:p.h,h:p.w});}
 target=map(target);above=map(above);below=map(below);left=map(left);const img=new cv.Image();img.src=c.toBuffer('image/png');await img.decode();const panels=P.refineImage(img,prior),p=panels.find(p=>p._identitySource==='structural-grid-frame'&&inside(p,target));
 const test=(name,fn)=>{fn();checks.push({name:mode+' '+transform+': '+name,passed:true});};
 test('complete measured scene selected',()=>assert(p));test('outside-aperture dialogue retained',()=>assert(inside(p,above)&&inside(p,below)));test('neighboring original scene excluded',()=>assert(!inside(p,left)));test('many-to-one or one-to-many legacy ownership corrected',()=>assert(!panels.includes(prior[mode==='aperture'?2:0])));
 test('other scenes stay as the same prior objects',()=>{for(const old of prior.slice(-2))assert(panels.includes(old));});
}
(async()=>{for(const mode of ['aperture','composite'])for(const t of ['none','mirror','rotate'])await fixture(mode,t);console.log(JSON.stringify({passed:true,controls:checks.length,checks},null,2));})().catch(e=>{console.error(e);process.exitCode=1});
