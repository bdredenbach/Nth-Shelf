'use strict';
const {cv,load}=require('./load.cjs');
let runtime;
function fixture(options={}){
 const w=options.w||560,h=options.h||840,scale=w/560,dy=options.dy||0,dx=options.dx||0,mirror=!!options.mirror,hue=options.hue??.56,ink=options.ink??28;
 const L=Math.round((26+dx)*scale),S=Math.round((274+dx)*scale),R=Math.round((539+dx)*scale),T=Math.round((160+dy)*h/840),Y=Math.round((461+dy)*h/840),bottomY=Math.round(((options.include65?571:624)+dy)*h/840),ix=Math.round((37+dx)*scale),iy=Math.round((34+dy)*h/840),iX=S-2,iY=T-3,rx=Math.round((53+dx)*scale),rX=Math.round((518+dx)*scale),rY=Math.round((570+dy)*h/840),rad=Math.round(25*scale);
 const canvas=cv.createCanvas(w,h),g=canvas.getContext('2d'),rgba=new Uint8ClampedArray(w*h*4),owned=[new Uint8Array(w*h),new Uint8Array(w*h)],art=[new Uint8Array(w*h),new Uint8Array(w*h)];
 const hsv=(hh,s,v)=>{hh=((hh%1)+1)%1;const i=Math.floor(hh*6),f=hh*6-i,p=v*(1-s),q=v*(1-f*s),t=v*(1-(1-f)*s);return[[v,t,p],[q,v,p],[p,v,t],[p,q,v],[t,p,v],[v,p,q]][i%6].map(n=>Math.round(n*255));};
 const round=(x,y,d=0)=>{const l=rx+d,r=rX-d,t=Y+d,b=rY-d,rr=Math.max(0,rad-d);if(x<l||x>=r||y<t||y>=b)return false;const cx=Math.max(l+rr,Math.min(r-rr,x)),cy=Math.max(t+rr,Math.min(b-rr,y));return (x-cx)**2+(y-cy)**2<=rr*rr;};
 const inset=(x,y)=>x>=ix&&x<=iX&&y>=iy&&y<=iY;
 const scene=(k,x,y)=>{if(k===0){const left=L+(y>T+30&&y<Y-35?Math.round(2*Math.sin(y/15)):0);return x>=left&&x<S&&y>=T&&y<Y+15||x>=L&&x<L+4&&y>=T-16&&y<T||y>=Y+15&&y<Y+31&&x>=L-(y-Y-15)*.5&&x<L+31-(y-Y-15)*1.5;}return x>=S&&x<R&&y>=0&&y<Y+23;};
 for(let yy=0;yy<h;yy++)for(let xx=0;xx<w;xx++){
  const x=mirror?w-1-xx:xx,y=yy,i=yy*w+xx;let rgb=[255,255,255];
  for(let k=0;k<2;k++)if(scene(k,x,y)){owned[k][i]=1;const near=!scene(k,x-2,y)||!scene(k,x+2,y)||!scene(k,x,y-2)||!scene(k,x,y+2);rgb=near?[ink,ink,ink]:hsv(hue+k*.33+(x-S)/w*.08,.65,(options.include65?.49+.31*((x+y)%2):.49+.31*((x*17+y*11)%113)/112));if(!near)art[k][i]=1;}
  
  if(inset(x,y)){const edge=x<ix+3||x>iX-3||y<iy+3||y>iY-3;const v=80+((x*13+y*11)%145);rgb=edge?[ink,ink,ink]:[v,Math.min(255,v+17),Math.max(0,v-23)];owned[0][i]=owned[1][i]=0;}
  if(x>=S-2&&x<=S+1&&y>=iy&&y<=Y+22)rgb=[ink,ink,ink];
  // Top clipped pale arc and fully enclosed pale speech shapes are source art.
  if(scene(1,x,y)){const pale=((x-(S+28))/(34*scale))**2+(y/(35*scale))**2<1;const balloon=((x-(R-47*scale))/(34*scale))**2+((y-94*h/840)/(23*h/840))**2<1;const tail=x>R-69*scale&&x<R-62*scale&&y>=108*h/840&&y<129*h/840;if(pale)rgb=[250,239,201];if(balloon||tail)rgb=[255,255,255];}
  if(round(x+.5,y+.5)){owned[0][i]=owned[1][i]=art[0][i]=art[1][i]=0;rgb=round(x+.5,y+.5,3)?hsv(hue+.42,.63,.5+.24*(y-Y)/(rY-Y)+.07*Math.sin(x/11)):[ink,ink,ink];}
  if(x>=0&&x<(options.include65?Math.round((499+dx)*scale):R)&&y>=bottomY&&(!options.include65||y<h-9)){const v=options.include65?70+((x+y)%2)*130:60+((x*7+y*13)%150);rgb=[v,Math.min(230,v+15),Math.max(25,v-15)];}
  if(options.orphanPatch&&x>=L-14&&x<L&&y>=Y+60&&y<Y+83)rgb=options.orphanPatch==='ink'?[ink,ink,ink]:hsv(hue+.2,.6,.7);
  if(options.openSeam&&x>=S-8&&x<=S+8&&y>T+75&&y<T+95)rgb=hsv(hue+.1,.5,.7);
  if(options.missingSeam&&x>=S-4&&x<=S+4&&y>T&&y<Y)rgb=hsv(hue+.1,.5,.7);
  if(options.openInset&&x>=iX-6&&x<=S+6&&y>iy+20&&y<iY-20)rgb=hsv(hue,.5,.7);
  if(options.openRound&&x>rx+(rX-rx)*.4&&x<rx+(rX-rx)*.55&&y>Y-5&&y<Y+8)rgb=hsv(hue,.5,.7);
  rgba.set([...rgb,255],i*4);
 }
 g.putImageData(new cv.ImageData(rgba,w,h),0,0);
 if(options.transparent)rgba[3]=0;
 runtime ||= load();const prior30=runtime.exterior.supplementRGBA(rgba,w,h,[]),prior33=runtime.narrow.analyzeRGBA(rgba,w,h,prior30),pre0=prior30.concat(prior33),p65=options.include65?runtime.continuation.analyzeRGBA(rgba,w,h,pre0):[],pre=pre0.concat(p65),p90=runtime.rounded.analyzeRGBA(rgba,w,h,pre),prior=pre.concat(p90);
 return{rgba,w,h,canvas,owned,art,points:[{x:(mirror?w-(L+S)/2:(L+S)/2)/w,y:(T+Y)/2/h},{x:(mirror?w-(S+R)/2:(S+R)/2)/w,y:(T+Y)/2/h}],prior,geometry:{L,S,R,T,Y,ix,iy,iX,iY,rx,rX,rY,bottomY},anchorCounts:options.include65?[prior30.length,prior33.length,p65.length,p90.length]:[prior30.length,prior33.length,p90.length]};
}
module.exports={fixture};
