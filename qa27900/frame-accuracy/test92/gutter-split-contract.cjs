'use strict';
const assert=require('node:assert/strict'),fs=require('fs'),path=require('path'),zlib=require('zlib');
const root=path.resolve(__dirname,'../../..'),scripts=[...fs.readFileSync(root+'/index.html','utf8').matchAll(/src="(js\/(?!terminal-native-bootstrap\.js)(?:panels|terminal)[^\"]*\.js)"/g)].map(m=>m[1]);
const api=new Function('document','Image','window',scripts.map(p=>fs.readFileSync(root+'/'+p,'utf8')).join('\n')+';return{PanelGutterSplit,PanelGeometryOrthogonal,PanelCropRepair,PanelGeometry,PanelEdgeSpill};')({},class{},{}),D=api.PanelGutterSplit;
const fixtures=JSON.parse(zlib.gunzipSync(Buffer.from(fs.readFileSync(__dirname+'/geometry.json.gz.b64','utf8'),'base64'))),clone=p=>JSON.parse(JSON.stringify(p));let rejected=0;
for(const p of fixtures){assert(D.validPanel(p));assert(api.PanelGeometryOrthogonal._provenContours(p));for(const mutate of[p=>p.x+=.001,p=>p._contours[0][0].x+=.002,p=>p._structuralGridProof.leaf=2,p=>p._structuralGridProof.seam.ys.pop(),p=>p._structuralGridProof.seam.flanks=0,p=>p._structuralGridProof.pixels++,p=>p._structuralGridProof.parent.x+=.002,p=>p._geometryType='unknown',p=>p._quad=[]]){const bad=clone(p);mutate(bad);assert(!D.validPanel(bad));rejected++;}}
for(let i=0;i<fixtures.length;i+=2){const a=fixtures[i],b=fixtures[i+1],v=a._structuralGridProof,w=v.analysisWidth,h=v.analysisHeight,original=api.PanelCropRepair.raster(api.PanelGeometryOrthogonal._provenContours(v.parent),w,h),left=api.PanelCropRepair.raster(a._contours,w,h),right=api.PanelCropRepair.raster(b._contours,w,h);assert(original.every((x,i)=>!x||left[i]||right[i]),'Original artwork lost');assert(left.every((x,i)=>!x||!right[i]),'Sibling masks overlap');for(const body of v.bodies){const m=api.PanelCropRepair.raster(body.contours,w,h),owner=body.leaf===0?left:right,other=body.leaf===0?right:left;assert(m.every((x,i)=>!x||owner[i]&&!other[i]),'Caption assigned to both scenes');}}
// Source tests use captured geometry with artificial pixels, never comic art.
const parent=fixtures[0]._structuralGridProof.parent,w=585,h=900,rgba=new Uint8ClampedArray(w*h*4);
for(let i=0;i<w*h;i++)rgba.set([170+(i%5)*9,100+(i%7)*8,70+(i%11)*6,255],i*4);
assert.deepEqual(D.analyzeRGBA(rgba,w,h,[parent]),[parent],'Colored artwork split without a paper gutter');
// An enclosed white caption plate does not reach both outer scene flanks.
for(let y=620;y<700;y++)for(let x=150;x<380;x++)rgba.set([255,255,255,255],4*(y*w+x));
assert.deepEqual(D.analyzeRGBA(rgba,w,h,[parent]),[parent],'Caption mistaken for gutter');

const source=api.PanelCropRepair.raster(api.PanelGeometryOrthogonal._provenContours(parent),w,h),seam=fixtures[0]._structuralGridProof.seam,box=fixtures[0]._structuralGridProof.parent;
const x0=Math.round(box.x*w);
for(let i=0;i<w*h;i++)rgba.set(source[i]?[170+(i%5)*9,100+(i%7)*8,70+(i%11)*6,255]:[255,255,255,255],i*4);
for(let x=0;x<seam.ys.length;x++)for(let y=seam.ys[x]-4;y<=seam.ys[x]+4;y++)rgba.set([255,255,255,255],4*(y*w+x+x0));
const cut=D.analyzeRGBA(rgba,w,h,[parent]);assert.equal(cut.length,2,'Continuous source gutter was not split');assert(cut.every(D.validPanel));
// A caption protrudes across the gutter; all its paper, border and lettering
// must stay together in the lower leaf.
const cx=145,cy=seam.ys[cx-x0]-5,cw=100,ch=55;
for(let y=cy;y<cy+ch;y++)for(let x=cx;x<cx+cw;x++)rgba.set(x<cx+2||x>=cx+cw-2||y<cy+2||y>=cy+ch-2?[0,0,0,255]:[255,255,255,255],4*(y*w+x));
for(let y=cy+12;y<cy+ch-7;y+=9)for(let x=cx+12;x<cx+cw-12;x++)rgba.set([0,0,0,255],4*(y*w+x));
const caption=D.analyzeRGBA(rgba,w,h,[parent]);assert.deepEqual(caption,[parent],'Obscured gutter should abstain when caption ownership cannot be established');
assert.deepEqual(D.analyzeRGBA(new Uint8ClampedArray(10),w,h,[parent]),[parent]);
console.log(JSON.stringify({passed:true,capturedChildren:fixtures.length,mutationsRejected:rejected,sourcePixelsRetained:true,siblingsDisjoint:true,captionAtomic:true,uniformArtworkNegative:true,enclosedCaptionNegative:true,syntheticGutterPositive:true,obscuredCaptionAbstention:true}));
