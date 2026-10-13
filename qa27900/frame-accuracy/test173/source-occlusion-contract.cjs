'use strict';
const fs=require('fs'),path=require('path'),assert=require('node:assert/strict'),cv=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/@napi-rs/canvas'),root=path.resolve(__dirname,'../../..');
const code=['panels-matte-cells','panels-colored-rims','panels-source-layout'].map(n=>fs.readFileSync(root+'/js/'+n+'.js','utf8')).join('\n');
const P=new Function('document',code+';return PanelSourceLayout;')({createElement:()=>cv.createCanvas(1,1)}),rows=[];
function contains(p,x,y){let inside=false;for(const ring of p._contours)for(let k=0,j=ring.length-1;k<ring.length;j=k++){const a=ring[k],b=ring[j];if((a.y>y)!==(b.y>y)&&x<(b.x-a.x)*(y-a.y)/(b.y-a.y)+a.x)inside=!inside;}return inside;}
function fixture({mirror=false,open=false,paper=false,foreground=false}={}){const c=cv.createCanvas(720,560),g=c.getContext('2d');if(mirror){g.translate(720,0);g.scale(-1,1);}const gradient=(x,y,w,h)=>{const a=g.createLinearGradient(x,y,x+w,y+h);a.addColorStop(0,'#709bc2');a.addColorStop(1,'#d0a865');g.fillStyle=a;g.fillRect(x,y,w,h);};gradient(0,0,720,560);const boxes=[[15,290,225,535],[210,365,355,545],[350,400,415,535],[422,400,625,535],[630,400,705,535]];g.strokeStyle='black';g.lineWidth=4;for(let k=0;k<boxes.length;k++){const [x,y,r,b]=boxes[k];gradient(x,y,r-x,b-y);if(open&&k===1){g.beginPath();g.moveTo(x,b);g.lineTo(r,b);g.lineTo(r,y);g.stroke();}else g.strokeRect(x,y,r-x,b-y);}if(paper){g.fillStyle='white';g.fillRect(260,348,70,48);g.fillStyle='black';for(let row=0;row<3;row++)for(let col=0;col<7;col++)g.fillRect(265+col*9,354+row*11,3,5);}if(foreground){g.font="bold 130px sans-serif";g.strokeStyle="white";g.lineWidth=6;g.fillStyle="#d42132";g.strokeText("R",605,445);g.fillText("R",605,445);}return {c,boxes:boxes.map(b=>mirror?[720-b[2],b[1],720-b[0],b[3]]:b)};}
async function owners(f,prior=[]){const img=new cv.Image();img.src=f.c.toBuffer('image/png');await img.decode();return {img,panels:P.refineImage(img,prior)};}
const host=ps=>ps.find(p=>p._geometryType==='host-remainder'&&contains(p,.5,.2));
function check(name,fn){fn();rows.push({name,passed:true});}
(async()=>{
const f=fixture(),v=await owners(f),p=host(v.panels);check('stepped overlapping bank retains the complete surrounding scene',()=>{assert(p);assert(contains(p,.1,.1)&&contains(p,.9,.1));});
check('every proved peer inset remains excluded from that scene',()=>{for(const b of f.boxes)assert(!contains(p,(b[0]+b[2])/1440,(b[1]+b[3])/1120));});
check('serialized stepped host is recomputed from the decoded source',()=>assert(P.validateImage(JSON.parse(JSON.stringify(p)),v.img)));
check('altered serialized host geometry is rejected',()=>{const q=JSON.parse(JSON.stringify(p));q.w-=.01;assert(!P.validateImage(q,v.img));});
const m=await owners(fixture({mirror:true}));check('occlusion closure works in the opposite overlap direction',()=>assert(host(m.panels)));
const priors=f.boxes.map(b=>({x:b[0]/720,y:b[1]/560,w:(b[2]-b[0])/720,h:(b[3]-b[1])/560,_identitySource:'v73'})),known=await owners(f,priors);check('legacy peer bounds excluded by proved source masks do not veto the host',()=>assert(host(known.panels)));
const unknown={x:.5,y:.1,w:.2,h:.2,_identitySource:'v73'},guarded=await owners(f,[unknown]);check('an unresolved inset inside the scene still vetoes the host',()=>assert(!host(guarded.panels)));
const broken=await owners(fixture({open:true}));check('a missing exposed peer rim cannot explain an occluded rear rim',()=>assert(!host(broken.panels)));
const lettering=await owners(fixture({foreground:true}));check('outlined lettering crossing an inset is not cut by a new host hole',()=>assert(!host(lettering.panels)));
const caption=await owners(fixture({paper:true}));check('unresolved paper occlusion cannot stand in for a closed peer rim',()=>assert(!host(caption.panels)));
check('a changed source cannot replay the old proof',()=>assert(!P.validateImage(JSON.parse(JSON.stringify(p)),caption.img)));
console.log(JSON.stringify({passed:true,controls:rows.length,rows},null,2));
})().catch(e=>{console.error(e);process.exitCode=1});
