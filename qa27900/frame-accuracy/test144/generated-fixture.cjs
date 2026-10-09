'use strict';
function fixture(cv,seed=0,mode='positive'){
 const w=600+seed%3*40,h=850,c=cv.createCanvas(w,h),g=c.getContext('2d'),dx=seed%3*9,dy=seed%2*7,matte=['#247d9f','#8a4aac','#409065'][seed%3],ink='#242021',x=30+dx,X=325+dx,top=170+dy,shared=330+dy,bottom=470+dy;
 g.fillStyle=matte;g.fillRect(0,0,w,h);
 function texture(x,y,W,H,k){g.fillStyle=['#cc8443','#566f96','#896475'][k%3];g.fillRect(x,y,W,H);for(let i=0;i<120;i++){g.fillStyle=i%2?'#c7c8c9':'#302531';g.fillRect(x+4+(i*47)%Math.max(5,W-8),y+3+(i*29)%Math.max(5,H-7),3+i%5,3+i%4);}}
 // An abstract wide upper cell, and one open lower scene connected to a side
 // scene. Only the two middle cells have the shared lettered speech witness.
 texture(x,20,X-x,top-22,0);g.strokeStyle=ink;g.lineWidth=4;g.strokeRect(x,20,X-x,top-22);g.fillStyle='#cc8443';g.beginPath();g.moveTo(x+90,25);g.lineTo(x+125,0);g.lineTo(x+145,25);g.fill();
 texture(X+20,24,w-X-20,h-24,1);texture(0,bottom+30,w,h-bottom-30,1);for(let yy=24;yy<h;yy+=11)for(let xx=0;xx<w;xx+=13)if(xx>=X+20||yy>=bottom+30){g.fillStyle=['#704336','#aeaea8','#ba525a','#626269','#a58b79','#635a59','#b6aea3','#815638'][(Math.floor(xx/13)*7+Math.floor(yy/11)*3)%8];g.fillRect(xx,yy,13,11);}
 g.strokeStyle=ink;g.lineWidth=4;g.beginPath();g.moveTo(w,24);g.lineTo(X+20,24);g.lineTo(X+20,bottom+30);g.lineTo(0,bottom+30);g.stroke();
 for(const [y,Y,k]of[[top+9,shared-4,1],[shared+7,bottom,2]]){texture(x,y,X-x,Y-y,k);g.strokeStyle=ink;g.lineWidth=4;g.strokeRect(x,y,X-x,Y-y);}
 // Foreground silhouette crosses the internal rail and connects the two
 // cells geometrically; the linked paper chain supplies pair ownership.
 g.fillStyle='#566f96';g.strokeStyle=ink;g.lineWidth=3;g.beginPath();g.moveTo(x+200,shared+24);g.lineTo(x+190,shared-23);g.quadraticCurveTo(x+204,shared-41,x+221,shared-20);g.lineTo(x+237,shared+24);g.closePath();g.fill();g.stroke();
 function ellipse(cx,cy,rx,ry){g.beginPath();g.ellipse(cx,cy,rx,ry,0,0,Math.PI*2);g.fill();g.stroke();}
 const cx=x+79,cy=shared-7;g.fillStyle='#fff';g.strokeStyle=ink;g.lineWidth=2;
 if(mode!=='noSpeech'){
  if(mode!=='unlinkedSpeech'){g.fillRect(cx-8,cy-36,16,72);}
  for(const yy of[cy-37,cy+34])ellipse(cx,yy,49,30);
  if(mode!=='unlinkedSpeech'){g.fillRect(cx-6,cy-37,12,73);}
  g.fillStyle=ink;for(const yy of[cy-37,cy+34])for(let ty=-15;ty<=15;ty+=9)for(let tx=-28;tx<=28;tx+=8)g.fillRect(cx+tx,yy+ty,3,4);
 }
 // One warm foreground cap belongs to the lower scene. Its complete dark
 // enclosure rises through an interruption in the bottom rail.
 if(mode!=='missingCap'){
  const ax=x+147,ay=bottom-28;g.fillStyle='#b0786a';g.strokeStyle=ink;g.lineWidth=4;g.beginPath();g.moveTo(ax-13,bottom+49);g.lineTo(ax-9,ay+9);g.lineTo(ax,ay);g.lineTo(ax+17,ay+2);g.lineTo(ax+25,bottom+49);g.closePath();g.fill();g.stroke();
  if(mode==='openCap'){g.strokeStyle='#b0786a';g.lineWidth=8;g.beginPath();g.moveTo(ax+9,ay-2);g.lineTo(ax+15,ay+7);g.stroke();}
  if(mode==='ambiguousCap'){g.strokeStyle=ink;g.lineWidth=3;g.beginPath();g.moveTo(ax+6,ay);g.lineTo(ax+6,bottom+20);g.stroke();}
 }
 if(mode==='extraRail'){g.fillStyle=ink;g.fillRect(x,shared+60,X-x,4);g.fillStyle=matte;g.fillRect(x,shared+64,X-x,5);}
 if(mode==='missingRail'){g.fillStyle='#896475';g.fillRect(x-3,bottom-4,X-x+6,11);}
 const a=g.getImageData(0,0,w,h).data;if(mode==='alpha')a[3]=0;return{a,w,h,c,geometry:{x,X,top,shared,bottom}};
}
module.exports={fixture};
