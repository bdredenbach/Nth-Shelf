const fs=require('fs'),path=require('path'),sharp=require('sharp'),{loadImage,createCanvas}=require('@napi-rs/canvas');
(async()=>{const file=process.env.QA_SOURCE_IMAGE||'comic-wolverine-1000/Wolverine (2010-2012) 1000-046.jpg',out=process.env.QA_RASTER_DIR||'recovery-page47';fs.mkdirSync(out,{recursive:true});const image=await loadImage(file);
for(const quality of ['low','medium','high']){const canvas=createCanvas(585,900),ctx=canvas.getContext('2d');ctx.imageSmoothingQuality=quality;ctx.drawImage(image,0,0,585,900);fs.writeFileSync(path.join(out,quality+'52.rgba'),ctx.getImageData(0,0,585,900).data);}
fs.writeFileSync(path.join(out,'sharp52.rgba'),await sharp(file).resize(585,900,{fit:'fill'}).ensureAlpha().raw().toBuffer());console.log('Private alternative rasters written to',out);
})().catch(e=>{console.error(e);process.exitCode=1});
