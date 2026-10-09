'use strict';
const {cv}=require('./harness.cjs');
function hsv(h,s,v){h=((h%1)+1)%1;const i=Math.floor(h*6),f=h*6-i,p=v*(1-s),q=v*(1-f*s),t=v*(1-(1-f)*s);return [[v,t,p],[q,v,p],[p,v,t],[p,q,v],[t,p,v],[v,p,q]][i%6].map(n=>Math.round(n*255));}
function fixture(options={}){
 const w=options.w||585,h=options.h||900,x=options.x??43,y=options.y??397,W=options.W??490,H=options.H??126,r=options.r??24,ink=options.ink??31,hue=options.hue??.55,mirror=!!options.mirror;
 const canvas=cv.createCanvas(w,h),g=canvas.getContext('2d'),rgba=new Uint8ClampedArray(w*h*4),owned=new Uint8Array(w*h),art=new Uint8Array(w*h),boundary=new Uint8Array(w*h);
 const inside=(xx,yy,offset=0)=>{const l=x+offset,t=y+offset,R=x+W-offset,B=y+H-offset,rad=Math.max(0,r-offset);if(xx<l||xx>=R||yy<t||yy>=B)return false;const cx=Math.max(l+rad,Math.min(R-rad,xx)),cy=Math.max(t+rad,Math.min(B-rad,yy));return (xx-cx)**2+(yy-cy)**2<=rad**2;};
 for(let yy=0;yy<h;yy++)for(let xx=0;xx<w;xx++){
  const sx=mirror?w-1-xx:xx,i=yy*w+xx;let rgb=[255,255,255];
  // A distinct neighboring scene abuts the top and backs the rounded shoulders.
  if(options.abutting!==false&&sx>x-12&&sx<x+W+16&&yy>y-90&&yy<y+25)rgb=hsv(hue+.39,.38,.58+.12*Math.sin(sx/21));
  const hit=inside(sx+.5,yy+.5);if(hit){owned[i]=1;rgb=hsv(hue+(sx-x)/W*.035,.76,.46+.26*(yy-y)/H+.045*Math.sin(sx*.18));if(!inside(sx+.5,yy+.5,3)){rgb=[ink,ink-3,ink-1];boundary[i]=1;}else{art[i]=1;if((sx-x>W*.08&&sx-x<W*.31&&yy-y>H*.22)||(sx-x>W*.5&&sx-x<W*.76&&yy-y>H*.63))rgb=hsv(hue+.46,.48,.73+.05*Math.sin(yy*.21));if((sx+yy*2)%31<3&&yy>y+H*.45)rgb=[ink,ink-3,ink-1];}}
  if(options.noColor&&hit)rgb=boundary[i]?[ink,ink,ink]:[195,195,195];
  const gaps=options.gaps||[];for(const side of gaps){const near=side==='top'?yy>=y-4&&yy<=y+7&&sx>x+W*.39&&sx<x+W*.53:side==='bottom'?yy>=y+H-7&&yy<=y+H+4&&sx>x+W*.39&&sx<x+W*.53:side==='left'?sx>=x-4&&sx<=x+7&&yy>y+H*.35&&yy<y+H*.65:sx>=x+W-7&&sx<=x+W+4&&yy>y+H*.35&&yy<y+H*.65;if(near)rgb=[245,245,245];}
  if(options.divider&&hit&&Math.abs(yy-(y+H*.48))<3)rgb=[ink,ink-3,ink-1];
  if(options.noBottomPaper&&yy>=y+H&&yy<y+H+24&&sx>=x&&sx<x+W)rgb=hsv(hue+.17,.55,.7);
  if(options.topFlood&&hit&&yy-y<35)rgb=[ink,ink-3,ink-1];
  rgba.set([...rgb,255],i*4);
 }
 // Add large lettering-like interior strokes without using any actual words.
 g.putImageData(new cv.ImageData(rgba,w,h),0,0);g.save();if(mirror){g.translate(w,0);g.scale(-1,1);}g.fillStyle='rgb(230,100,45)';g.strokeStyle='rgb(31,28,30)';g.lineWidth=2;for(let j=0;j<8;j++){const xx=x+W*.35+j*W*.061,yy=y+H*.17;g.beginPath();g.moveTo(xx,yy);g.lineTo(xx+9,yy);g.lineTo(xx+4,yy+H*.29);g.lineTo(xx-5,yy+H*.29);g.closePath();g.fill();g.stroke();}g.restore();const pixels=g.getImageData(0,0,w,h).data;
 if(options.transparent)pixels[3]=0;
 return{rgba:pixels,w,h,canvas,owned,art,boundary,point:{x:(mirror?w-(x+W*.5):x+W*.5)/w,y:(y+H*.55)/h},geometry:{x,y,W,H,r}};
}
module.exports={fixture,hsv};
