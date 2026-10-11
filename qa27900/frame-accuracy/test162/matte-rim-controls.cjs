'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),cv=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/@napi-rs/canvas');
const root=path.resolve(__dirname,'../../..'),files=[...fs.readFileSync(root+'/index.html','utf8').matchAll(/src="(js\/[^\"]+\.js)"/g)].map(m=>m[1]).filter(p=>/^js\/(?:panels[^/]*|terminal[^/]*)\.js$/.test(p)&&!p.endsWith('-bootstrap.js'));
const N=new Function('document','Image','window','console','setTimeout','clearTimeout','btoa','atob',files.map(p=>fs.readFileSync(root+'/'+p,'utf8')).join('\n')+';return PanelMatteRimInset;')({createElement:()=>cv.createCanvas(1,1)},cv.Image,{},console,setTimeout,clearTimeout,s=>Buffer.from(s,'binary').toString('base64'),s=>Buffer.from(s,'base64').toString('binary'));
const w=800,h=1280,rings=(x,y,W,H)=>[[{x,y},{x:x+W,y},{x:x+W,y:y+H},{x,y:y+H}]],prior=[{x:.04,y:0,w:.2,h:.37,_contours:rings(.04,0,.2,.37),_structuralGridProof:{version:79}},{x:.66,y:.03,w:.29,h:.37,_contours:rings(.66,.03,.29,.37),_structuralGridProof:{version:88}},{x:.24,y:0,w:.42,h:.4,_contours:rings(.24,0,.42,.4),_structuralGridProof:{version:160}},{x:.02,y:.4,w:.96,h:.16,_contours:rings(.02,.4,.96,.16),_structuralGridProof:{version:161}}];
function fixture(){
 const c=cv.createCanvas(w,h),g=c.getContext('2d');g.fillStyle='#0078b9';g.fillRect(0,0,w,h);
 g.fillStyle='#222';g.fillRect(50,755,470,200);g.fillStyle='#667676';g.fillRect(53,758,464,194);
 g.fillStyle='#ad3131';g.fillRect(250,810,80,140);
 // A lower foreign body touches and occludes the rim with steep sides.
 g.fillStyle='#222';g.fillRect(340,920,60,230);g.fillStyle='#a33';g.fillRect(343,923,54,220);
 g.fillStyle='#fff';g.beginPath();g.ellipse(200,755,70,30,0,0,Math.PI*2);g.fill();
 g.fillStyle='#eee';g.beginPath();g.ellipse(650,820,50,40,0,0,Math.PI*2);g.fill();
 return{c,g,a:()=>g.getImageData(0,0,w,h).data};
}
const rows=[];function check(name,fn){fn();rows.push({name,passed:true});}
let shape;
check('two complete ink walks recover a generated shared-rim scene',()=>{shape=N.geometry(fixture().a(),w,h,prior);assert(shape);assert(shape.difference<=shape.pixels*.01);assert.deepEqual(shape.witnesses.map(p=>p.threshold),[85,105]);});
check('a steep lower protrusion stays wholly outside the inset',()=>{const mask=N.raster([{_contours:shape.rings.map(r=>r.map(([x,y])=>({x:x/w,y:y/h})))}],w,h)[0];assert.equal(mask[940*w+370],0);assert.equal(mask[925*w+370],0);assert.equal(mask[900*w+370],1);});
check('owned bright bodies stay complete while a foreign bright body stays out',()=>{assert(shape.box[1]<=726);assert(shape.box[2]<600);assert(shape.assignments.some(p=>p.owned));});
check('geometry alone cannot borrow installed native admission',()=>assert(!N.validPanel({_structuralGridProof:{version:162},_geometryType:'matte-rim-inset'})));
check('ordered complete predecessor family is required',()=>{assert(!N.eligible([prior[1],prior[0],prior[2],prior[3]]));assert(!N.eligible(prior.slice(0,3)));assert(!N.eligible(prior.concat(prior[0])));});
check('nonopaque source cannot prove the rim',()=>{const a=fixture().a();a[3]=254;assert.equal(N.geometry(a,w,h,prior),null);});
check('matte alone cannot prove a scene',()=>{const f=fixture();f.g.fillStyle='#0078b9';f.g.fillRect(0,0,w,h);assert.equal(N.geometry(f.a(),w,h,prior),null);});
check('unwitnessed shared boundary defers the scene',()=>{const f=fixture();f.g.fillStyle='#667676';f.g.fillRect(48,750,490,450);assert.equal(N.geometry(f.a(),w,h,prior),null);});
check('earlier owner pixels remain excluded',()=>{const foreign=N.raster(prior,w,h),mask=N.raster([{_contours:shape.rings.map(r=>r.map(([x,y])=>({x:x/w,y:y/h})))}],w,h)[0];for(let i=0;i<mask.length;i++)assert(!(mask[i]&&foreign.some(m=>m[i])));});
console.log(JSON.stringify({passed:true,cases:rows.length,rows,qualification:'Generated source geometry; exact native issuance and actual Reader are checked separately.'},null,2));
