'use strict';
const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');const root=path.resolve(__dirname,'../../..'),api=new Function(fs.readFileSync(root+'/js/panels-matte-cells.js','utf8')+'\n'+fs.readFileSync(root+'/js/panels-crop-repair.js','utf8')+';return PanelCropRepair;')();
const w=300,h=300,rect=(x,y,W,H)=>[{x:x/w,y:y/h},{x:(x+W)/w,y:y/h},{x:(x+W)/w,y:(y+H)/h},{x:x/w,y:(y+H)/h}],outer=rect(20,30,260,240),hole=rect(45,90,30,20).reverse(),rings=[outer,hole],snapshot=JSON.stringify(rings);
function source({alpha=255,ink=true,color=true,gap=false}={}){const rgba=new Uint8ClampedArray(w*h*4);for(let i=0;i<w*h;i++)rgba.set([110,110,110,alpha],i*4);for(let y=85;y<111;y++)for(let x=35;x<160;x++)rgba.set(color?[255,220,35,alpha]:[255,255,255,alpha],(y*w+x)*4);if(ink)for(let n=0;n<12;n++)for(let y=92;y<104;y++)for(let x=42+n*9;x<46+n*9;x++)rgba.set([20,20,20,alpha],(y*w+x)*4);if(gap)for(let y=85;y<111;y++)for(let x=90;x<98;x++)rgba.set([110,110,110,alpha],(y*w+x)*4);return rgba;}
const original=api.raster(rings,w,h),rgba=source(),fixed=api.repair(rings,w,h,[],rgba);assert(fixed);const m=api.raster(fixed.contours,w,h);for(let y=90;y<111;y++)for(let x=45;x<75;x++)assert.equal(m[y*w+x],1,'Caption lettering lost');assert(original.every((v,i)=>!v||m[i]));assert.equal(JSON.stringify(rings),snapshot);
const geometryOnly=api.repair(rings,w,h);assert.equal(geometryOnly,null,'Inset hole flattened without source');
for(const options of[{alpha:200},{ink:false},{color:false},{gap:true}]){const r=api.repair(rings,w,h,[],source(options));assert(!r||!api.raster(r.contours,w,h)[100*w+60],JSON.stringify(options));}
const foreign=api.repair(rings,w,h,[[rect(45,90,30,20)]],rgba);assert(!foreign||!api.raster(foreign.contours,w,h)[100*w+60],'Foreign owner borrowed');
// A yellow framed picture with connected artwork is not caption lettering.
const picture=source({ink:false});for(let y=89;y<108;y++)for(let x=85;x<140;x++)if(Math.abs(x-112)<5||Math.abs(y-99)<4)picture.set([20,20,20,255],(y*w+x)*4);
const insetArt=api.repair(rings,w,h,[],picture);assert(!insetArt||!api.raster(insetArt.contours,w,h)[100*w+60],'Unowned framed artwork mistaken for text');
const unstable=source();for(let y=85;y<111;y++)for(let x=35;x<95;x++){const i=(y*w+x)*4;if(unstable[i]>100)unstable.set([230,190,158,255],i);}
const paletteMismatch=api.repair(rings,w,h,[],unstable);assert(!paletteMismatch||!api.raster(paletteMismatch.contours,w,h)[100*w+60],'Unstable source palettes accepted');
const cached=api.repair(rings,w,h,[],rgba);assert.deepEqual(cached.contours,fixed.contours);
const lowOverlap=[rect(130,30,150,240),rect(135,90,15,20).reverse()],ambiguous=api.repair(lowOverlap,w,h,[],rgba);assert(!ambiguous||!api.raster(ambiguous.contours,w,h)[100*w+140],'Small-overlap caption borrowed');
console.log(JSON.stringify({passed:true,wholeCaptionRestored:true,sourceRequired:true,foreignVeto:true,opaqueSourceRequired:true,inkRequired:true,chromaticEnclosureRequired:true,openBodyRejected:true,ownerMajorityRequired:true,stableCache:true,framedArtworkRejected:true,unstablePaletteRejected:true,originalRetained:true}));
