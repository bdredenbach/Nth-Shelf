'use strict';
const {fixture:dialogue}=require('./dialogue-generated-fixture.cjs');
function fixture(cv,seed=0,mode='positive'){
 const f=dialogue(cv,seed),{c,w,h,geometry:b}=f,g=c.getContext('2d'),x=b.X+20,X=w-20,y=24,Y=b.bottom+37,ink='#242021',matte=['#247d9f','#8a4aac','#409065'][seed%3];
 // A source-drawn tall side original touches an independently textured lower
 // scene across its complete ink rim. These are deliberately abstract pixels.
 g.fillStyle=matte;g.fillRect(0,b.bottom+27,x-1,Y+4-(b.bottom+27));g.fillStyle=ink;g.fillRect(x-3,Y-1,7,12);g.fillStyle=matte;g.fillRect(X+2,y-5,w-X-2,Y-y+10);
 g.fillStyle=['#9c826b','#8b798e','#927f66'][seed%3];g.fillRect(x,y,X-x,Y-y);
 for(let yy=y+8;yy<Y-5;yy+=17)for(let xx=x+6;xx<X-5;xx+=19){g.fillStyle=(Math.floor(xx/19)+Math.floor(yy/17))%3?'#b1a49a':'#6a4e56';g.fillRect(xx,yy,10,8);}
 g.putImageData(new cv.ImageData(f.a,w,h),0,0,b.x+130,b.bottom+27,46,Y+4-(b.bottom+27));g.strokeStyle=ink;g.lineWidth=4;g.strokeRect(x,y,X-x,Y-y);g.fillStyle=ink;g.fillRect(X-4,Y-1,4,11);
 // A bright sky in the same hue as the surrounding chromatic gutter must be
 // retained by the closed outer envelope, despite matching the gutter hue.
 g.fillStyle=['#5fd6fb','#d395f5','#83eab2'][seed%3];g.fillRect(x+3,y+3,X-x-6,42);
 if(mode==='missingTop'){g.fillStyle=['#5fd6fb','#d395f5','#83eab2'][seed%3];g.fillRect(x+15,y-5,X-x-30,9);}
 if(mode==='missingBottom'){g.fillStyle='#9c826b';g.fillRect(x-3,Y-4,X-x+6,9);}
 if(mode==='missingSide'){g.fillStyle='#9c826b';g.fillRect(X-4,b.top+40,9,Y-b.top-35);}
 if(mode==='ambiguousBottom'){g.fillStyle=ink;g.fillRect(x-2,Y+31,X-x+4,4);g.fillStyle='#b7a399';g.fillRect(x-2,Y+25,X-x+4,6);}
 const cx=(x+X)/2,cy=Y-100;g.fillStyle='#fff';g.strokeStyle=ink;g.lineWidth=2;
 if(mode!=='noSpeech'){g.beginPath();g.ellipse(cx,cy,Math.min(73,(X-x)*.39),43,0,0,Math.PI*2);g.fill();g.stroke();g.fillStyle=ink;for(let yy=-26;yy<=26;yy+=9)for(let xx=-48;xx<=48;xx+=8)g.fillRect(cx+xx,cy+yy,3,4);g.fillStyle='#fff';for(let k=0;k<3;k++){g.beginPath();g.ellipse(cx+18+k*7,cy-53-k*17,5-k,3+k*.2,0,0,Math.PI*2);g.fill();g.stroke();}}
 const a=g.getImageData(0,0,w,h).data;if(mode==='alpha')a[3]=0;return{...f,a,c};
}
module.exports={fixture};
