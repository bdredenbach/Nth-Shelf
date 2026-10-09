'use strict';
// Independently drawn generic scenes; no source artwork or audit coordinates.
const path=require('node:path');let cv;try{cv=require('@napi-rs/canvas')}catch(_){cv=require(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'@napi-rs/canvas'))}
function fixture({dx=0,dy=0,mirror=false,matte='#1c9aa5',negative=null}={}){
 const w=640,h=900,c=cv.createCanvas(w,h),g=c.getContext('2d');g.fillStyle=matte;g.fillRect(0,0,w,h);g.save();if(mirror){g.translate(w,0);g.scale(-1,1)}g.translate(dx,dy);
 const ink='#202126';g.fillStyle='#aca492';g.beginPath();g.moveTo(-80,290);g.bezierCurveTo(140,215,250,270,330,380);g.bezierCurveTo(490,315,625,370,730,405);g.lineTo(730,930);g.lineTo(-80,930);g.closePath();g.fill();g.strokeStyle=ink;g.lineWidth=4;g.stroke();
 // A rounded reflective object remains part of the continuous foreground.
 g.fillStyle='#879eb8';g.beginPath();g.ellipse(200,550,96,130,-.2,0,Math.PI*2);g.fill();g.stroke();g.fillStyle='#dbbd8e';g.fillRect(375,530,150,300);g.strokeRect(375,530,150,300);g.fillStyle=ink;g.fillRect(400,560,16,55);g.fillRect(460,560,16,55);
 const rects=[[34,64,270,264],[330,69,270,254]],owners=[];for(const [i,b]of rects.entries()){const[x,y,W,H]=b;g.fillStyle=i?'#9283b2':'#bd8357';g.fillRect(x,y,W,H);g.strokeStyle=ink;g.lineWidth=5;g.strokeRect(x,y,W,H);g.fillStyle='#64565f';g.beginPath();g.moveTo(x+20,y+H-4);g.lineTo(x+90,y+100);g.lineTo(x+140,y+110);g.lineTo(x+W-8,y+H-4);g.fill();g.fillStyle='#dfc7a6';g.beginPath();g.arc(x+125,y+100,30,0,Math.PI*2);g.fill();g.stroke();g.fillStyle='#fbf7e9';g.beginPath();g.ellipse(x+55,y+63,38,30,0,0,Math.PI*2);g.fill();g.stroke();g.fillStyle=ink;for(let k=0;k<3;k++)g.fillRect(x+34,y+51+k*9,42-k*5,3);owners.push([x+125,y+100]);}
 if(negative!=='no-shared-mark'){g.fillStyle='#d5e4ed';g.strokeStyle=ink;g.lineWidth=3;g.beginPath();g.moveTo(272,102);g.lineTo(363,103);g.lineTo(357,127);g.lineTo(278,127);g.closePath();g.fill();g.stroke();}
 if(negative==='open-top'){g.fillStyle=matte;g.fillRect(115,58,95,12)}
 if(negative==='open-side'){g.fillStyle=matte;g.fillRect(25,165,20,80)}
 if(negative==='open-bottom'){g.fillStyle='#aca492';g.fillRect(110,321,110,16)}
 if(negative==='third-inset'){g.fillStyle=matte;g.fillRect(302,440,330,230);g.fillStyle='#d399be';g.fillRect(338,471,270,160);g.strokeStyle=ink;g.lineWidth=5;g.strokeRect(338,471,270,160)}
 if(negative==='detached-foreground'){g.fillStyle=matte;g.fillRect(-dx,830-dy,w,100)}
 if(negative==='no-foreground'){g.fillStyle=matte;g.fillRect(-dx,345-dy,w,560);g.fillRect(-dx,290-dy,30-dx,55);g.fillRect(609,290-dy,w-609,55)}
 if(negative==='ambiguous-two-marks'){g.fillStyle='#d5e4ed';g.fillRect(280,180,75,18)}
 g.restore();if(negative==='lower-divider'){g.fillStyle=ink;g.fillRect(0,630,w,5)}if(negative==='transparent')g.clearRect(0,0,1,1);
 const labels=cv.createCanvas(w,h),lg=labels.getContext('2d');if(mirror){lg.translate(w,0);lg.scale(-1,1)}lg.translate(dx,dy);lg.fillStyle='#fff';lg.strokeStyle='#fff';lg.lineWidth=5;for(const[x,y,W,H]of rects){lg.fillRect(x,y,W,H);lg.strokeRect(x,y,W,H)}lg.lineWidth=3;lg.beginPath();lg.moveTo(272,102);lg.lineTo(363,103);lg.lineTo(357,127);lg.lineTo(278,127);lg.closePath();lg.fill();lg.stroke();const pixels=lg.getImageData(0,0,w,h).data,expectedPair=new Uint8Array(w*h);for(let i=0;i<expectedPair.length;i++)expectedPair[i]=+(pixels[i*4+3]>127);
 const transform=([x,y])=>[(mirror?w-x-dx:x+dx),y+dy];return{rgba:g.getImageData(0,0,w,h).data,w,h,canvas:c,expectedPair,name:negative||`${dx},${dy},${mirror},${matte}`,marks:{first:transform(owners[0]),second:transform(owners[1]),shared:transform([316,114]),object:transform([200,550]),lower:transform([450,700]),lowerSpeech:transform([130,720])}};
}
module.exports={fixture};
