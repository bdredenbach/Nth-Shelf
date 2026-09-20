// Visible outlines for a bounded overlap layout: two right-edge foreground
// frames and one rear frame. Three exposed rear-rail intervals establish the
// T-junctions. The result describes visible artwork; it never reconstructs
// hidden art or substitutes a rectangle for an occluded side.
const PanelOverlapFrames = (() => {
'use strict';
function group(rgba,w,h,parent,log=()=>{}){
 const g=new Float32Array(w*h);for(let i=0;i<g.length;i++)g[i]=.299*rgba[i*4]+.587*rgba[i*4+1]+.114*rgba[i*4+2];
 const lum=(x,y)=>x>=0&&x<w&&y>=0&&y<h?g[(y|0)*w+(x|0)]:255;
 const color=[0,1,2].map(c=>{const a=[];for(let y=0;y<5;y++)for(let x=w-5;x<w;x++)a.push(rgba[(y*w+x)*4+c]);return a.sort((a,b)=>a-b)[12];});
 const quiet=(x,y)=>x>=0&&x<w&&y>=0&&y<h&&[0,1,2].every(c=>Math.abs(rgba[((y|0)*w+(x|0))*4+c]-color[c])<=12);
 const ink=(x,y,r=1)=>{for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++)if(lum(x+dx,y+dy)<70)return true;return false;};
 const y0=Math.round(parent.y*h),y3=Math.round((parent.y+parent.h)*h),xmin=Math.floor(w*.68);
 function fit(points){const mx=points.reduce((s,p)=>s+p[0],0)/points.length,my=points.reduce((s,p)=>s+p[1],0)/points.length;let xy=0,xx=0;for(const[t,p]of points){xy+=(t-mx)*(p-my);xx+=(t-mx)**2;}const m=xy/xx,b=my-m*mx,err=points.map(([t,p])=>Math.abs(p-m*t-b)).sort((a,b)=>a-b);return Number.isFinite(m)&&Math.abs(m)<.025&&err[Math.floor(err.length*.9)]<1.5?{m,b}:null;}
 // Locate the four foreground horizontal rails against the outer matte.
 const hor=[];
 for(const dir of [-1,1]){const rows=[];for(let y=Math.max(2,y0+5);y<Math.min(h-3,y3-5);y++){let dark=0,q=0,n=0;for(let x=xmin;x<w-1;x++){dark+=ink(x,y);q+=quiet(x,y+dir*3)&&quiet(x,y+dir*4);n++;}if(dark/n>.97&&q/n>.95)rows.push({y,score:dark/n+q/n});}
 const groups=[];for(const row of rows){if(!groups.length||row.y-groups.at(-1).at(-1).y>3)groups.push([]);groups.at(-1).push(row);}for(const group of groups){const y=group.sort((a,b)=>b.score-a.score)[0].y,points=[];for(let x=xmin;x<w-1;x++){const ps=[];for(let p=y-3;p<=y+3;p++)if(lum(x,p)<70&&quiet(x,p+dir*2))ps.push(p);if(ps.length)points.push([x,dir<0?Math.min(...ps):Math.max(...ps)]);}const rail=fit(points);if(rail&&points.length/(w-1-xmin)>.94)hor.push({...rail,dir,y:rail.m*w*.8+rail.b});}}
 hor.sort((a,b)=>a.y-b.y);log('hor',hor);if(hor.length!==4||hor.map(a=>a.dir).join()!=='-1,1,-1,1')return [];
 const [t1,b1,t2,b2]=hor;if(b1.y-t1.y<h*.06||b2.y-t2.y<h*.06||t2.y-b1.y<5||t2.y-b1.y>h*.04)return [];
 // The rear side must reappear above, between and below the foregrounds.
 const intervals=[[y0+4,Math.floor(t1.y-3)],[Math.ceil(b1.y+3),Math.floor(t2.y-3)],[Math.ceil(b2.y+3),y3-3]];
 const backs=[];for(let x=Math.floor(w*.35);x<w*.75;x++){const supports=intervals.map(([lo,hi])=>{let d=0,q=0,n=0;for(let y=lo;y<=hi;y++){d+=ink(x,y);q+=quiet(x+3,y)&&quiet(x+4,y);n++;}return n>=4?[d/n,q/n]:[0,0];});if(supports.every(s=>s[0]>.94&&s[1]>.94))backs.push(x);}log('back xs',backs);if(!backs.length||backs.at(-1)-backs[0]>5)return [];
 const bx=backs[Math.floor(backs.length/2)],bp=[];for(const[lo,hi]of intervals)for(let y=lo;y<=hi;y++){let x=bx+3;while(x>bx-4&&lum(x,y)>=70)x--;if(lum(x,y)<70)bp.push([y,x]);}const back=fit(bp);log('back',back);if(!back)return [];
 // Independently fit the foreground side; dark artwork alone is insufficient.
 const sides=[];for(let x=Math.ceil(bx-w*.10);x<bx-3;x++){let d=0,ridge=0,n=0;for(let y=Math.ceil(t2.y+4);y<b2.y-4;y++){d+=ink(x,y);let m=255;for(let a=-1;a<=1;a++)m=Math.min(m,lum(x+a,y));ridge+=lum(x-4,y)-m>20&&lum(x+4,y)-m>20;n++;}if(d/n>.98)sides.push({x,ridge:ridge/n});}sides.sort((a,b)=>b.ridge-a.ridge);log('front xs',sides.slice(0,10));if(!sides.length||sides[0].ridge<.12)return [];
 const sx=sides[0].x,sp=[];for(let y=Math.ceil(t2.y+4);y<b2.y-4;y++){const ps=[];for(let x=sx-2;x<=sx+2;x++)if(lum(x,y)<70)ps.push(x);if(ps.length)sp.push([y,ps.reduce((a,b)=>a+b,0)/ps.length]);}const side=fit(sp);log('side',side);
 if(!side)return [];
 const val=(r,t)=>r.m*t+r.b;
 function border(vertical,guess,lo,hi){
  let best=null;
  for(let p=Math.round(guess)-4;p<=Math.round(guess)+4;p++){
   if(p<0||p>=(vertical?w:h))continue;let d=0,r=0,n=0;
   for(let t=Math.ceil(lo)+3;t<hi-3;t++){
    const x=vertical?p:t,y=vertical?t:p;d+=ink(x,y);let mid=255;for(let k=-1;k<=1;k++)mid=Math.min(mid,lum(x+(vertical?k:0),y+(vertical?0:k)));
    r+=lum(x+(vertical?-4:0),y+(vertical?0:-4))-mid>20&&lum(x+(vertical?4:0),y+(vertical?0:4))-mid>20;n++;
   }
   const score=d/n+r/n*.1-Math.abs(p-guess)*.003;if(d/n>.97&&(!best||score>best.score))best={p,score};
  }
  if(!best)return null;const points=[];
  for(let t=Math.ceil(lo)+3;t<hi-3;t++){
   let pick=best.p,value=255;
   for(let p=best.p-2;p<=best.p+2;p++){const v=vertical?lum(p,t):lum(t,p);if(v<value){value=v;pick=p;}}
   if(value<70)points.push([t,pick]);
  }
  return fit(points);
 }
 const left=parent.x*w<3?{m:0,b:0}:border(true,parent.x*w,y0,y3);
 const bt=border(false,y0,Math.max(0,parent.x*w),bx),bb=border(false,y3,Math.max(0,parent.x*w),bx);
 log('outer',{left,bt,bb});if(!left||!bt||!bb)return [];
 if(y0<3){bt.m=0;bt.b=0;}
 // An interrupted foreground side is accepted only for a closed text box.
 function caption(rail,t,b){
  const lo=Math.ceil(val(t,rail.b)+3),hi=Math.floor(val(b,rail.b)-3),missing=[];
  for(let y=lo;y<=hi;y++)if(!ink(Math.round(val(rail,y)),y,2))missing.push(y);
  if(missing.length/(hi-lo+1)<.025)return {box:null,rail};
  const cy=missing[Math.floor(missing.length/2)],cx=Math.round(val(rail,cy));let seed=null;
  for(let dy=-3;dy<=3&&!seed;dy++)for(let dx=-3;dx<=3;dx++)if(lum(cx+dx,cy+dy)>210){seed=[cx+dx,cy+dy];break;}
  if(!seed)return null;const seen=new Uint8Array(w*h),todo=[seed[1]*w+seed[0]],box=[...seed,...seed];seen[todo[0]]=1;
  for(let i=0;i<todo.length;i++){
   const k=todo[i],x=k%w,y=k/w|0;box[0]=Math.min(box[0],x);box[1]=Math.min(box[1],y);box[2]=Math.max(box[2],x);box[3]=Math.max(box[3],y);
   if(todo.length>w*h*.04)return null;
   for(const j of [k-1,k+1,k-w,k+w]){const xx=j%w,yy=j/w|0;if(j<0||j>=w*h||Math.abs(xx-x)>1||seen[j]||lum(xx,yy)<=210)continue;seen[j]=1;todo.push(j);}
  }
  const [a,c,r,d]=box,fill=todo.length/((r-a+1)*(d-c+1));
  log('caption',{box,fill,missing:[missing[0],missing.at(-1)]});
  if(a>cx-4||r<cx+4||r-a>w*.25||d-c>(hi-lo)*.55||c<lo||d>hi||fill<.55||missing.some(y=>y<c-2||y>d+2)||typeof BubbleDetect==='undefined'||!BubbleDetect._hasTextLayout(rgba,w,seen,{minX:a,maxX:r,minY:c,maxY:d,fill},210))return null;
  const q=[a-2,c-2,r+2,d+2];
  for(const vertical of [false,true])for(const p of vertical?[q[0],q[2]]:[q[1],q[3]]){let n=0,good=0;for(let t=vertical?q[1]:q[0];t<=(vertical?q[3]:q[2]);t++){let edge=false;for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++)edge||=lum((vertical?p:t)+dx,(vertical?t:p)+dy)<170;good+=edge;n++;}log('caption border',{vertical,p,coverage:good/n});if(good/n<.97)return null;}
  return {box:q,rail};
 }
 const caps=[caption(side,t1,b1),caption(side,t2,b2)];log('caps',caps);if(caps.some(c=>!c))return [];
 const meet=(a,b)=>{const x=(b.b+b.m*a.b)/(1-b.m*a.m);return [x,val(a,x)];},atY=(r,y)=>[val(r,y),y];
 const outlineFront=(t,b,cap)=>{const q=[meet(t,side),[w,val(t,w)],[w,val(b,w)],meet(b,side)];if(cap)q.push(atY(side,cap[3]),[cap[0],cap[3]],[cap[0],cap[1]],atY(side,cap[1]));return q;};
 // Both owners share each cut edge, so caption/occlusion interiors do not overlap.
 const fronts=[outlineFront(t1,b1,caps[0].box),outlineFront(t2,b2,caps[1].box)];
 const rear=[meet(bt,left),meet(bt,back)];
 for(let i=0;i<2;i++){const t=hor[i*2],b=hor[i*2+1],cap=caps[i].box;rear.push(meet(t,back),meet(t,side));if(cap)rear.push(atY(side,cap[1]),[cap[0],cap[1]],[cap[0],cap[3]],atY(side,cap[3]));rear.push(meet(b,side),meet(b,back));}
 rear.push(meet(bb,back),meet(bb,left));
 const outlines=[rear,...fronts];
 for(let i=0;i<2;i++){
  const a=hor[i*2],b=hor[i*2+1],cap=caps[i].box;
  for(const r of [a,b]){let good=0,n=0;for(let x=Math.ceil(val(side,r.y));x<w;x++){good+=ink(x,Math.round(val(r,x)),2);n++;}if(good/n<.97)return [];}
  let good=0,n=0;for(let y=Math.ceil(a.y)+3;y<b.y-3;y++){if(cap&&y>=cap[1]-2&&y<=cap[3]+2)continue;good+=ink(Math.round(val(side,y)),y,2);n++;}if(good/n<.97)return [];
 }
 const candidates=outlines.map(outline=>({box:[Math.min(...outline.map(v=>v[0])),Math.min(...outline.map(v=>v[1])),Math.max(...outline.map(v=>v[0])),Math.max(...outline.map(v=>v[1]))].map(Math.round)}));
 if(PanelClosedFrames.vetoRegionsRGBA(rgba,w,h,candidates).length!==3){log('inset/divider veto');return [];}
 log('OUTLINES',outlines);return {hor,back,side,color,outer:{left,bt,bb},caps,outlines:[rear,...fronts]};
}
 function analyzeRGBA(rgba,w,h,parents,logger){
  if(!Number.isInteger(w)||!Number.isInteger(h)||w<80||h<80||w>900||h>900||rgba?.length!==w*h*4||!Array.isArray(parents))return [];
  const result=[];
  for(const parent of parents){
   if(!parent||!['x','y','w','h'].every(k=>Number.isFinite(parent[k]))||parent.x<0||parent.y<0||parent.x+parent.w>1.001||parent.y+parent.h>1.001||parent._quad||parent._identitySource||parent.w<.8||parent.h<.3||parent.w*parent.h<.3||parent.x+parent.w<.995)continue;
   const data=group(rgba,w,h,parent,logger?((name,value)=>logger(name+' '+JSON.stringify(value))):undefined);
   if(!data?.outlines||data.outlines.length!==3||data.outlines.some(points=>points.length<4||points.length>20||points.some(p=>p.some(v=>!Number.isFinite(v))||p[0]<0||p[0]>w||p[1]<0||p[1]>h)))continue;
   const groupId=result.length;
   for(let index=0;index<data.outlines.length;index++){
    const points=data.outlines[index];
    const xs=points.map(p=>p[0]/w),ys=points.map(p=>p[1]/h);
    result.push({x:Math.min(...xs),y:Math.min(...ys),w:Math.max(...xs)-Math.min(...xs),h:Math.max(...ys)-Math.min(...ys),
     _outline:points.map(p=>({x:p[0]/w,y:p[1]/h})),_identitySource:'overlap-frame',_geometryType:'visible-overlap-outline',
     _overlapProof:{version:1,connected:true,method:'paired-edge-insets',analysisWidth:w,analysisHeight:h,group:groupId,index,
      parent:{x:parent.x,y:parent.y,w:parent.w,h:parent.h},horizontalRails:data.hor,rearRail:data.back,foregroundRail:data.side,
      outerRails:data.outer,captionBoxes:data.caps.map(c=>c.box)}});
   }
  }
  return result;
 }
 function analyzeImage(img,parents,log){
  const scale=Math.min(1,900/Math.max(img.width,img.height)),w=Math.round(img.width*scale),h=Math.round(img.height*scale);
  const c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0,w,h);
  return analyzeRGBA(ctx.getImageData(0,0,w,h).data,w,h,parents,log);
 }
 return {analyzeRGBA,analyzeImage};
})();
if(typeof module!=='undefined')module.exports=PanelOverlapFrames;
