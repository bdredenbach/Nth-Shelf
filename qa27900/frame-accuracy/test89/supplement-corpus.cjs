'use strict';const fs=require('fs'),path=require('path'),assert=require('node:assert/strict'),cv=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'@napi-rs/canvas'):'@napi-rs/canvas');
const root=path.resolve(__dirname,'../../..'),html=fs.readFileSync(path.join(root,'index.html'),'utf8'),scripts=[...html.matchAll(/src="(js\/(?!terminal-native-bootstrap\.js)(?:panels|terminal)[^\"]*\.js)"/g)].map(m=>m[1]);const source=scripts.map(n=>fs.readFileSync(path.join(root,n),'utf8')).join('\n');
const api=new Function('document','Image','ImageData','window',source+'\nreturn{PanelDetect,PanelNeighborEdgeCells,PanelMatteCells,PanelGeometry,PanelLocalBoundaryConsensus};')({createElement:()=>cv.createCanvas(1,1)},cv.Image,cv.ImageData,{});
const [dir,baseline,out,startText,endText]=process.argv.slice(2),old=JSON.parse(fs.readFileSync(baseline)),files=fs.readdirSync(dir).filter(n=>/\.(jpg|jpeg|png)$/i.test(n)).sort();assert.equal(files.length,old.length);
const keepAlive=setInterval(()=>{},1000);
(async()=>{const rows=[];for(let index=Number(startText||0);index<Number(endText||files.length);index++){
 const file=files[index],im=new cv.Image();im.src=fs.readFileSync(path.join(dir,file));await im.decode();const W=im.width,H=im.height;assert(W&&H,'Source image did not decode: '+file);const s=Math.min(1,900/Math.max(W,H)),w=Math.round(W*s),h=Math.round(H*s),canvas=cv.createCanvas(W,H),cx=canvas.getContext('2d');cx.drawImage(im,0,0);
 assert([...cx.getImageData(0,0,W,H).data].every((v,i)=>i%4!==3||v===255),'Source is not fully opaque: '+file);
 const rgba=api.PanelMatteCells.sampleBilinearRGBA(cx.getImageData(0,0,W,H).data,W,H,w,h),before=JSON.stringify(old[index].panels),t=performance.now();let audit;
 const additions=api.PanelNeighborEdgeCells.analyzeRGBA(rgba,w,h,old[index].panels,null,a=>audit=a);assert.equal(JSON.stringify(old[index].panels),before);assert(additions.every(api.PanelNeighborEdgeCells.validPanel));
 rows.push({key:old[index].key,sourceFile:file,priorCount:old[index].panels.length,additions,ms:Math.round(performance.now()-t),audit});fs.writeFileSync(out,JSON.stringify(rows));console.log(old[index].key,additions.length,audit);
 }console.log('completed',rows.length);})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>clearInterval(keepAlive));
