'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const cv=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/\x40napi-rs/canvas'),root=path.resolve(__dirname,'../../..');
const files=[...fs.readFileSync(root+'/index.html','utf8').matchAll(/src="(js\/[^\"]+\.js)"/g)].map(m=>m[1]).filter(p=>/^js\/(?:panels[^/]*|terminal[^/]*)\.js$/.test(p)&&!p.endsWith('-bootstrap.js'));
const S=new Function('document','Image','window','console','setTimeout','clearTimeout','btoa','atob',files.map(p=>fs.readFileSync(root+'/'+p,'utf8')).join('\n')+';return PanelSharedTopCell;')({createElement:()=>cv.createCanvas(1,1)},cv.Image,{},console,setTimeout,clearTimeout,s=>Buffer.from(s,'binary').toString('base64'),s=>Buffer.from(s,'base64').toString('binary'));
const w=800,h=1280,rings=(x,y,W,H)=>[[{x,y},{x:x+W,y},{x:x+W,y:y+H},{x,y:y+H}]],left={x:.04,y:0,w:.20,h:.37,_contours:rings(.04,0,.20,.37),_structuralGridProof:{version:79}},right={x:.66,y:.03,w:.29,h:.37,_contours:rings(.66,.03,.29,.37),_structuralGridProof:{version:88,witnesses:[{rim:{path:Array(400).fill(Math.round(.66*w))}}]}},prior=[left,right];
const c=cv.createCanvas(w,h),g=c.getContext('2d');g.fillStyle='rgb(0,120,185)';g.fillRect(0,0,w,h);
g.fillStyle='#d1ba8d';for(let x=Math.round(.24*w);x<.66*w;x++){const y=Math.round(.37*h+.03*h*(x-.24*w)/(.42*w));g.fillRect(x,40,1,y-40);g.fillStyle='#111';g.fillRect(x,y-2,1,3);g.fillStyle='#d1ba8d';}
g.fillStyle='#a33';g.fillRect(.36*w,.2*h,.13*w,.15*h);g.fillStyle='#fff';g.beginPath();g.ellipse(.40*w,.1*h,55,25,0,0,Math.PI*2);g.fill();
const a=g.getImageData(0,0,w,h).data,rows=[];function check(name,fn){fn();rows.push({name,passed:true});}
let shape;check('two source thresholds independently agree on a generated separator',()=>{shape=S.geometry(a,w,h,prior);assert(shape);assert(shape.separators.every(s=>s.coverage>=.93));assert(shape.difference<=shape.pixels*.0025);});
check('generated source geometry is not private installed-detector authority',()=>{assert(!S.validPanel({_structuralGridProof:{version:160},_geometryType:'shared-upper-matte-cell'}));});
check('reordered independent owners are deferred',()=>assert(!S.eligible([right,left])));
check('missing and duplicated owner sets are deferred',()=>{assert(!S.eligible([left]));assert(!S.eligible([left,left]));assert(!S.eligible([left,right,right]));});
check('a page without chromatic exterior evidence produces no cell',()=>{const blank=new Uint8ClampedArray(a.length);blank.fill(220);for(let i=3;i<blank.length;i+=4)blank[i]=255;assert.equal(S.geometry(blank,w,h,prior),null);});
check('no generated owned pixel is inside a foreign inset',()=>{const foreign=S.raster(prior,w,h),owned=S.raster([{_contours:shape.rings.map(r=>r.map(([x,y])=>({x:x/w,y:y/h})))}],w,h)[0];for(let i=0;i<owned.length;i++)assert(!(owned[i]&&foreign.some(m=>m[i])));for(const ring of shape.rings)for(const [x,y]of ring)assert(x>=0&&x<=w&&y>=0&&y<=h);assert(shape.box[0]>=Math.floor(.24*w));assert(shape.box[2]<=Math.ceil(.66*w)+2);});
check('bright source bodies are assigned as wholes or deferred',()=>{g.fillStyle='#fff';g.beginPath();g.ellipse(.45*w,.385*h,45,32,0,0,Math.PI*2);g.fill();const q=S.geometry(g.getImageData(0,0,w,h).data,w,h,prior);if(q)assert(q.bodies.flat().every(b=>b.ratio<=.2||b.ratio>=.8));});
console.log(JSON.stringify({passed:true,cases:rows.length,rows,qualification:'Generated geometry tests; source-parent authentication and Reader are tested separately.'},null,2));
