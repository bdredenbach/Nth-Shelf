'use strict';

const fs=require('fs');
const path=require('path');
const sharp=require('sharp');
const {pages}=require('./harness');

const input=process.argv[2]||'/tmp/nth-panel-map-sweep.json';
const outputDir=process.argv[3]||'/tmp/nth-panel-map-overlays';
const sweep=JSON.parse(fs.readFileSync(input,'utf8'));
const mapped=sweep.results.filter(row=>row.frameCount);
const colors=['#00ff7f','#00d9ff','#ffd600','#ff4fa3','#ff7a00','#b388ff'];
const imageW=280,imageH=430,labelH=34,tileW=300,tileH=484,columns=4,rows=4;

function escapeXml(value){
  return String(value).replace(/[&<>"']/g,char=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'
  })[char]);
}

async function tile(row){
  const image=await sharp(pages[row.pageIndex]).resize(imageW,imageH,{fit:'fill'}).jpeg({quality:86}).toBuffer();
  const polygons=row.frames.map((frame,index)=>{
    const points=frame.quad.map(([x,y])=>`${(x*imageW).toFixed(1)},${(y*imageH).toFixed(1)}`).join(' ');
    return `<polygon points="${points}" fill="none" stroke="${colors[index%colors.length]}" stroke-width="3"/>`;
  }).join('');
  const overlay=Buffer.from(`<svg width="${imageW}" height="${imageH}" xmlns="http://www.w3.org/2000/svg">${polygons}</svg>`);
  const marked=await sharp(image).composite([{input:overlay,top:0,left:0}]).png().toBuffer();
  const label=Buffer.from(`<svg width="${tileW}" height="${tileH}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#111318"/>
    <text x="10" y="23" fill="#fff" font-family="sans-serif" font-size="16">${escapeXml(`Page ${row.humanPage} — ${row.frameCount} map frame${row.frameCount===1?'':'s'}`)}</text>
  </svg>`);
  return sharp(label).composite([{input:marked,left:10,top:labelH}]).png().toBuffer();
}

(async()=>{
  fs.mkdirSync(outputDir,{recursive:true});
  for(let start=0,sheet=1;start<mapped.length;start+=columns*rows,sheet++){
    const batch=mapped.slice(start,start+columns*rows);
    const tiles=await Promise.all(batch.map(tile));
    const composites=tiles.map((input,index)=>({input,left:(index%columns)*tileW,top:Math.floor(index/columns)*tileH}));
    const file=path.join(outputDir,`panel-map-review-${sheet}.jpg`);
    await sharp({create:{width:columns*tileW,height:rows*tileH,channels:3,background:'#090a0d'}})
      .composite(composites).jpeg({quality:90}).toFile(file);
    process.stdout.write(`${file}\n`);
  }
})().catch(error=>{console.error(error);process.exitCode=1;});
