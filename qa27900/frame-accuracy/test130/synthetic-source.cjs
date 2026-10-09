function source(color=[200,60,60],variant='foreign'){
 const w=400,h=600,a=new Uint8ClampedArray(w*h*4),put=(x,y,c)=>a.set([...c,255],(y*w+x)*4);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){let c=[90,90,90];if(x>=50&&x<350&&y>=100&&y<390){const d=Math.min(x-50,349-x,y-100,389-y),v=(x+y)%23<11?45:175;c=d<2?[20,20,20]:d<8?color:d<10?[20,20,20]:[v,v,v];}put(x,y,c);}
 function body(cx,cy,r){for(let y=cy-r;y<=cy+r;y++)for(let x=cx-r;x<=cx+r;x++){const d=(x-cx)**2+(y-cy)**2;if(d<=r*r)put(x,y,d>(r-1)**2?[20,20,20]:[250,250,250]);}if(variant!=='unlettered')for(let y=cy-14;y<cy+14;y++)for(let x=cx-16;x<cx+16;x++)if((x-cx+18)%6<2&&(y-cy+18)%6<3)put(x,y,[20,20,20]);}
 body(145,125,30);body(140,400,30);
 if(variant!=='tailless'){const toward=variant==='inside-tail';const pts=toward?[[148,378],[167,355],[157,378]]:[[150,420],[162,448],[160,420]];function inside(x,y){let yes=false;for(let i=0,j=2;i<3;j=i++){const p=pts[i],q=pts[j];if((p[1]>y)!==(q[1]>y)&&x<(q[0]-p[0])*(y-p[1])/(q[1]-p[1])+p[0])yes=!yes;}return yes;}for(let y=350;y<451;y++)for(let x=145;x<169;x++)if(inside(x,y)){const edge=!inside(x-1,y)||!inside(x+1,y)||!inside(x,y-1)||!inside(x,y+1);put(x,y,edge&&(x-140)**2+(y-400)**2>=30*30?[20,20,20]:[250,250,250]);}}
 if(variant==='transparent')a[3]=0;return{a,w,h};
}
function shifted(color,variant,dx=0,dy=0){const{a,w,h}=source(color,variant);if(!dx&&!dy)return{a,w,h};const b=new Uint8ClampedArray(a.length);for(let i=0;i<w*h;i++)b.set([90,90,90,255],i*4);for(let y=0;y<h;y++)for(let x=0;x<w;x++){const X=x+dx,Y=y+dy;if(X>=0&&X<w&&Y>=0&&Y<h)b.set(a.subarray((y*w+x)*4,(y*w+x)*4+4),(Y*w+X)*4);}return{a:b,w,h};}module.exports={source:shifted};
