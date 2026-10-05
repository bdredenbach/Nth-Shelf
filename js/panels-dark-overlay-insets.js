/* Nth Shelf Test68 — dark overlay inset recovery.
 * A large inset can sit over continuous artwork rather than paper gutters.
 * Recover only one closed rectangular frame whose dark border has three
 * independently complete rails and one rail occluded by foreground artwork.
 * The route is image-derived and runs only after every earlier empty-map
 * recovery has abstained. No title/page/hash/tap lookup is used.
 */
const PanelDarkOverlayInsets = (() => {
  'use strict';
  const METHOD='three-dark-rails-one-occluded-overlay-rail';
  const finite=Number.isFinite,range=(n,a,b)=>finite(n)&&n>=a&&n<=b;
  const sum=a=>a.reduce((n,v)=>n+v,0);
  function sideStats(lum,w,h,box,band,d,side,thr){
    const [x0,y0,x1,y1]=box,vals=[];
    const push=(rail,inside,outside)=>vals.push([rail,inside,outside]);
    if(side<2){
      const y=side===0?y0:y1,ins=side===0?1:-1;
      for(let x=x0+8;x<x1-8;x++){
        let rail=255;for(let yy=Math.max(0,y-band);yy<=Math.min(h-1,y+band);yy++)rail=Math.min(rail,lum[yy*w+x]);
        push(rail,lum[Math.max(0,Math.min(h-1,y+ins*d))*w+x],lum[Math.max(0,Math.min(h-1,y-ins*d))*w+x]);
      }
    }else{
      const x=side===2?x0:x1,ins=side===2?1:-1;
      for(let y=y0+8;y<y1-8;y++){
        let rail=255;for(let xx=Math.max(0,x-band);xx<=Math.min(w-1,x+band);xx++)rail=Math.min(rail,lum[y*w+xx]);
        push(rail,lum[y*w+Math.max(0,Math.min(w-1,x+ins*d))],lum[y*w+Math.max(0,Math.min(w-1,x-ins*d))]);
      }
    }
    if(vals.length<30)return null;
    let dark=0,inside=0,outside=0,both=0;
    for(const [r,i,o] of vals){const di=i-r>20,do_=o-r>20;dark+=r<thr;inside+=di;outside+=do_;both+=di&&do_;}
    return {samples:vals.length,rail:dark/vals.length,inside:inside/vals.length,outside:outside/vals.length,both:both/vals.length};
  }
  function validPanel(p){try{
    const pr=p?._structuralGridProof,w=pr?.analysisWidth,h=pr?.analysisHeight,box=pr?.box;
    if(p?._quad||p?._outline||p?._identitySource!=='structural-grid-frame'||p._geometryOwner!=='structural-grid-contours'||p._geometryType!=='occluded-dark-overlay-inset'||pr?.version!==25||pr.method!==METHOD||pr.connected!==true)return false;
    if(!Number.isInteger(w)||!Number.isInteger(h)||w<250||h<350||w>480||h>480||!Number.isInteger(pr.threshold)||pr.threshold!==60||!Number.isInteger(pr.band)||!range(pr.band,1,3)||!Number.isInteger(pr.contrastDistance)||!range(pr.contrastDistance,8,14))return false;
    if(!Array.isArray(box)||box.length!==4||box.some((v,i)=>!Number.isInteger(v)||v<0||v>(i%2?h:w))||box[0]>=box[2]||box[1]>=box[3])return false;
    const [x0,y0,x1,y1]=box,W=x1-x0,H=y1-y0,A=W*H/(w*h);
    if(W<w*.32||H<h*.22||!range(A,.14,.66)||x0<w*.03||x1>w*.97||y0<h*.015||y1>h*.95)return false;
    if(!Array.isArray(pr.supports)||pr.supports.length!==4||pr.supports.some(v=>!range(v,.74,1))||pr.supports.filter(v=>v>=.94).length!==3)return false;
    if(!Number.isInteger(pr.weakSide)||pr.weakSide<0||pr.weakSide>3||pr.supports[pr.weakSide]>=.94||pr.supports.some((v,i)=>i!==pr.weakSide&&v<.94))return false;
    if(!Array.isArray(pr.sideMetrics)||pr.sideMetrics.length!==4)return false;
    for(const m of pr.sideMetrics)if(!Number.isInteger(m.samples)||m.samples<30||!range(m.rail,.72,1)||!range(m.inside,0,1)||!range(m.outside,.65,1)||!range(m.both,0,1))return false;
    if(pr.sideMetrics.filter(m=>m.rail>=.94).length<3||pr.sideMetrics.filter(m=>m.inside>=.70).length<3||pr.sideMetrics.filter(m=>m.both>=.50).length<3)return false;
    if(pr.sideMetrics[pr.weakSide].rail>=.94||pr.sideMetrics[pr.weakSide].inside<.70||pr.sideMetrics[pr.weakSide].outside<.70)return false;
    if(!range(pr.interiorVariance,700,17000)||!finite(pr.score))return false;
    const expectedScore=sum(pr.supports)+sum(pr.sideMetrics.map(m=>m.inside+m.outside));if(Math.abs(pr.score-expectedScore)>1e-12)return false;
    const ring=[[x0,y0],[x1,y0],[x1,y1],[x0,y1]];
    if(!Array.isArray(pr.pixelContours)||pr.pixelContours.length!==1||JSON.stringify(pr.pixelContours[0])!==JSON.stringify(ring)||!Array.isArray(p._contours)||JSON.stringify(p._contours)!==JSON.stringify([ring.map(([x,y])=>({x:x/w,y:y/h}))]))return false;
    return Math.abs(p.x-x0/w)<1e-12&&Math.abs(p.y-y0/h)<1e-12&&Math.abs(p.w-W/w)<1e-12&&Math.abs(p.h-H/h)<1e-12;
  }catch(_){return false;}}
  function analyzeRGBA(rgba,w,h,log){
    if(!Number.isInteger(w)||!Number.isInteger(h)||w<250||h<350||w>480||h>480||!rgba||rgba.length!==w*h*4)return[];
    const N=w*h,lum=new Float32Array(N),dark=new Uint8Array(N),thr=60,band=Math.max(1,Math.min(3,Math.round(Math.min(w,h)*.004)));
    for(let i=0;i<N;i++){if(rgba[i*4+3]!==255)return[];const v=.299*rgba[i*4]+.587*rgba[i*4+1]+.114*rgba[i*4+2];lum[i]=v;dark[i]=v<thr?1:0;}
    const hb=new Uint8Array(N),hp=new Int32Array(h*(w+1));
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){
      let yes=0;for(let yy=Math.max(0,y-band);yy<=Math.min(h-1,y+band);yy++)if(dark[yy*w+x]){yes=1;break;}hb[y*w+x]=yes;hp[y*(w+1)+x+1]=hp[y*(w+1)+x]+yes;
    }
    const vb=new Uint8Array(N),vp=new Int32Array(w*(h+1));
    for(let x=0;x<w;x++)for(let y=0;y<h;y++){
      let yes=0;for(let xx=Math.max(0,x-band);xx<=Math.min(w-1,x+band);xx++)if(dark[y*w+xx]){yes=1;break;}vb[y*w+x]=yes;vp[x*(h+1)+y+1]=vp[x*(h+1)+y]+yes;
    }
    const hs=(y,x0,x1)=>(hp[y*(w+1)+x1]-hp[y*(w+1)+x0])/Math.max(1,x1-x0);
    const vs=(x,y0,y1)=>(vp[x*(h+1)+y1]-vp[x*(h+1)+y0])/Math.max(1,y1-y0);
    const rows=[];
    for(let y=0;y<h;y++){
      let x=0;while(x<w){while(x<w&&!hb[y*w+x])x++;const x0=x;while(x<w&&hb[y*w+x])x++;const x1=x;if(x1-x0>=w*.35&&x0>=w*.015&&x1<=w*.985)rows.push([y,x0,x1,x1-x0]);}
    }
    const groups=[];
    for(const c of rows){const [y,x0,x1,L]=c;let g=null;for(let i=Math.max(0,groups.length-30);i<groups.length;i++){const q=groups[i];if(y-q.lastY<=1&&Math.abs(x0-q.x0)<w*.05&&Math.abs(x1-q.x1)<w*.05){g=q;break;}}
      if(g){g.items.push(c);g.lastY=y;if(L>g.best[3])g.best=c;}else groups.push({items:[c],lastY:y,x0,x1,best:c});}
    const horiz=groups.filter(g=>g.items.length>=2&&g.items.length<=18).map(g=>g.best),candidates=[];
    const d=Math.max(8,Math.min(14,Math.round(Math.min(w,h)*.017)));
    for(const [yT,xA,xB] of horiz){
      if(yT>h*.75)continue;const span=xB-xA,ys=[];
      const yStart=Math.max(yT+Math.round(h*.15),yT+Math.max(40,Math.round(h*.125))),yEnd=Math.min(h-Math.round(h*.025),yT+Math.round(h*.75));
      for(let y=yStart;y<yEnd;y++){const s=hs(y,xA,xB);if(s>=.82)ys.push([y,s]);}
      const yg=[];for(const item of ys){const last=yg.at(-1);if(last&&item[0]===last.at(-1)[0]+1)last.push(item);else yg.push([item]);}
      for(const g of yg){if(g.length<2||g.length>20)continue;let best=g[0];for(const z of g)if(z[1]>best[1])best=z;const yB=best[0];
        let lsp=-1,xL=-1,rsp=-1,xR=-1;const sideWindow=Math.max(10,Math.round(span*.12));
        for(let x=Math.max(1,xA-8);x<Math.min(w-1,xA+sideWindow);x++){const s=vs(x,yT,yB);if(s>lsp){lsp=s;xL=x;}}
        for(let x=Math.max(1,xB-sideWindow);x<Math.min(w-1,xB+8);x++){const s=vs(x,yT,yB);if(s>rsp){rsp=s;xR=x;}}
        if(xL<0||xR-xL<w*.30)continue;const supports=[hs(yT,xL,xR),hs(yB,xL,xR),lsp,rsp];
        if(Math.min(...supports)<.74||supports.filter(v=>v>=.94).length!==3)continue;
        const W=xR-xL,H=yB-yT,A=W*H/(w*h);if(W<w*.32||H<h*.22||A<.14||A>.66||xL<w*.03||xR>w*.97||yT<h*.015||yB>h*.95)continue;
        const box=[xL,yT,xR,yB],metrics=[0,1,2,3].map(side=>sideStats(lum,w,h,box,band,d,side,thr));if(metrics.some(m=>!m))continue;
        if(Math.min(...metrics.map(m=>m.rail))<.72||metrics.filter(m=>m.rail>=.94).length<3||Math.min(...metrics.map(m=>m.outside))<.65||metrics.filter(m=>m.inside>=.70).length<3||metrics.filter(m=>m.both>=.50).length<3)continue;
        const weakSide=supports.indexOf(Math.min(...supports));if(metrics[weakSide].rail>=.94||metrics[weakSide].inside<.70||metrics[weakSide].outside<.70)continue;
        let n=0,s1=0,s2=0;for(let y=yT+d;y<yB-d;y++)for(let x=xL+d;x<xR-d;x++){const v=lum[y*w+x];n++;s1+=v;s2+=v*v;}if(n<1000)continue;const interiorVariance=s2/n-(s1/n)**2;if(interiorVariance<700)continue;
        const score=sum(supports)+sum(metrics.map(m=>m.inside+m.outside)),ring=[[xL,yT],[xR,yT],[xR,yB],[xL,yB]],proof={version:25,method:METHOD,connected:true,analysisWidth:w,analysisHeight:h,threshold:thr,band,contrastDistance:d,box,supports,weakSide,sideMetrics:metrics,interiorVariance,score,pixelContours:[ring]};
        const panel={x:xL/w,y:yT/h,w:W/w,h:H/h,_identitySource:'structural-grid-frame',_geometryOwner:'structural-grid-contours',_geometryType:'occluded-dark-overlay-inset',_contours:[ring.map(([x,y])=>({x:x/w,y:y/h}))],_structuralGridProof:proof};
        if(validPanel(panel))candidates.push(panel);
      }
    }
    candidates.sort((a,b)=>b._structuralGridProof.score-a._structuralGridProof.score);const out=[];
    for(const p of candidates){const b=p._structuralGridProof.box;if(out.some(q=>q._structuralGridProof.box.reduce((n,v,i)=>n+Math.abs(v-b[i]),0)<30))continue;out.push(p);}
    if(out.length===1)log?.('dark overlay inset: three complete rails + one foreground-occluded rail');
    return out.length===1?out:[];
  }
  function completeImage(img,baseline,log){
    if(!Array.isArray(baseline)||baseline.length||!img||typeof PanelMatteCells==='undefined')return[];const W=img.naturalWidth||img.width,H=img.naturalHeight||img.height;if(!W||!H||W*H>24000000)return[];let c;
    try{c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d',{willReadFrequently:true});if(!g)return[];g.drawImage(img,0,0);const s=Math.min(1,480/Math.max(W,H)),w=Math.round(W*s),h=Math.round(H*s),rgba=PanelMatteCells.sampleBilinearRGBA(g.getImageData(0,0,W,H).data,W,H,w,h);return analyzeRGBA(rgba,w,h,log);}finally{if(c){c.width=1;c.height=1;}}
  }
  return {analyzeRGBA,completeImage,validPanel};
})();
if(typeof module!=='undefined')module.exports=PanelDarkOverlayInsets;
