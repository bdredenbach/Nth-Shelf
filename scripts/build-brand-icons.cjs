// Deterministically rasterize the editable mark; npm dependency: sharp.
const fs=require('fs'),path=require('path'),sharp=require('sharp');
const root=path.resolve(__dirname,'..');
(async()=>{const logo=fs.readFileSync(path.join(root,'assets/nth-shelf-brand.svg'),'utf8').replace(/^<svg[^>]*>/,'').replace('</svg>','');
for(const maskable of [false,true])for(const size of maskable?[512,1024]:[192,512,1024]){
 const transform=maskable?'translate(74 133) scale(.71)':'translate(30 105) scale(.88)';
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" fill="#050505"/><g transform="${transform}">${logo}</g></svg>`;
 await sharp(Buffer.from(svg)).resize(size,size).png().toFile(path.join(root,`icons/icon-${maskable?'maskable-':''}${size}.png`));
}})().catch(e=>{console.error(e);process.exitCode=1;});
