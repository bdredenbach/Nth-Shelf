'use strict';
const {fixture:portrait}=require('./portrait-generated-fixture.cjs');
function fixture(cv,seed=0,mode='positive'){
 const f=portrait(cv,seed),{c,w,h,geometry:b}=f,g=c.getContext('2d'),X=w-20,Y=b.bottom+37,ink='#242021',matte=['#247d9f','#8a4aac','#409065'][seed%3],metal=['#5fd6fb','#d395f5','#83eab2'][seed%3],capY=Y-108;
 // A foreground object rises beside the inset and remains attached to the
 // open lower scene. Its source ink rim distinguishes it from the gutter.
 if(mode!=='missingEdgeCap'){g.fillStyle=metal;g.strokeStyle=ink;g.lineWidth=3;g.beginPath();g.moveTo(X+1,capY);g.lineTo(X+7,capY);g.lineTo(w,capY+4);g.lineTo(w,Y+44);g.lineTo(X+1,Y+44);g.closePath();g.fill();g.stroke();if(mode==='openEdgeCap'){g.fillStyle=metal;g.fillRect(X+9,capY-4,8,10);}}
 // Entirely invented lower artwork provides connected dark foreground and
 // varied source color without an interior page-spanning gutter.
 g.fillStyle=ink;g.beginPath();g.moveTo(0,h*.86);g.lineTo(w*.22,h*.70);g.lineTo(w*.4,h*.79);g.lineTo(w*.61,h*.69);g.lineTo(w*.96,h*.75);g.lineTo(w,h);g.lineTo(0,h);g.closePath();g.fill();
 for(let k=0;k<12;k++){g.fillStyle=k%2?'#b98751':'#536d94';g.beginPath();g.moveTo(w*(.06+k*.071),h*(.88+(k%3)*.01));g.lineTo(w*(.08+k*.071),h*(.76+(k%3)*.025));g.lineTo(w*(.125+k*.071),h*.97);g.closePath();g.fill();}
 if(mode!=='noSpeech'){
  const cy=b.bottom+75,cx=b.x+180;g.fillStyle='#fff';g.strokeStyle=ink;g.lineWidth=2;
  g.beginPath();g.ellipse(cx,cy,65,33,0,0,Math.PI*2);g.fill();g.stroke();g.beginPath();g.ellipse(cx+102,cy+27,61,36,0,0,Math.PI*2);g.fill();g.stroke();g.fillRect(cx+49,cy+5,13,13);
  g.beginPath();g.moveTo(cx-48,cy+10);g.lineTo(cx-82,cy+19);g.lineTo(cx-50,cy+23);g.closePath();g.fill();g.stroke();
  g.fillStyle=ink;for(const[x,y]of[[cx,cy],[cx+102,cy+27]])for(let yy=-17;yy<=17;yy+=8)for(let xx=-38;xx<=38;xx+=8)g.fillRect(x+xx,y+yy,3,4);
 }
 if(mode==='internalGutter'){g.fillStyle=ink;g.fillRect(0,h*.78,w,4);g.fillStyle=matte;g.fillRect(0,h*.78+4,w,8);}
 if(mode==='unknownUpperForeground'){g.fillStyle='#af8260';g.strokeStyle=ink;g.lineWidth=3;g.beginPath();g.moveTo(0,b.shared-34);g.lineTo(12,b.shared-34);g.lineTo(12,b.bottom+70);g.lineTo(0,b.bottom+70);g.closePath();g.fill();g.stroke();}
 const a=g.getImageData(0,0,w,h).data;if(mode==='alpha')a[3]=0;return{...f,a,c};
}
module.exports={fixture};
