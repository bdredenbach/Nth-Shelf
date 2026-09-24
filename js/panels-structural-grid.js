/* Nth Shelf Test37 — tap-independent structural guillotine grid.
 *
 * Reuses the conservative visual evidence class behind V100, but proves the
 * complete page partition once instead of asking a tap which leaf it wants.
 * Existing stronger identities are retained byte-for-byte when they corroborate
 * one and only one grid cell. Uniform exterior-matte leaves are discarded.
 * No page number, title, filename, hash, tap coordinate or stored crop is used.
 */
const PanelStructuralGrid = (() => {
  'use strict';
  const METHOD='tap-independent-structural-guillotine-grid-v1';
  const finite=Number.isFinite, range=(v,a,b)=>finite(v)&&v>=a&&v<=b;
  const overlap=(a,b)=>Math.max(0,Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x))*Math.max(0,Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y));
  function partitionRGBA(rgba,w,h,log){
    if(!(rgba instanceof Uint8Array||rgba instanceof Uint8ClampedArray)||!Number.isInteger(w)||!Number.isInteger(h)||w<120||h<160||w>900||h>900||rgba.length!==w*h*4)return null;
    const lum=new Uint8Array(w*h);for(let i=0;i<lum.length;i++)lum[i]=Math.round(.299*rgba[i*4]+.587*rgba[i*4+1]+.114*rgba[i*4+2]);
    const darkCut=82,rowRun=(y,a,b)=>{let best=0,run=0;for(let x=a;x<=b;x++){if(lum[y*w+x]<=darkCut){run++;best=Math.max(best,run)}else run=0;}return best;},colRun=(x,a,b)=>{let best=0,run=0;for(let y=a;y<=b;y++){if(lum[y*w+x]<=darkCut){run++;best=Math.max(best,run)}else run=0;}return best;};
    let x0=0,x1=w-1,y0=0,y1=h-1;const minHR=Math.round(w*.55),minVR=Math.round(h*.55);
    for(let y=0;y<Math.round(h*.12);y++)if(rowRun(y,0,w-1)>=minHR){y0=y;break;}
    for(let y=h-1;y>Math.round(h*.88);y--)if(rowRun(y,0,w-1)>=minHR){y1=y;break;}
    for(let x=0;x<Math.round(w*.12);x++)if(colRun(x,0,h-1)>=minVR){x0=x;break;}
    for(let x=w-1;x>Math.round(w*.88);x--)if(colRun(x,0,h-1)>=minVR){x1=x;break;}
    const leaves=[],splits=[];
    const split=(a,b,c,d,depth)=>{
      const rw=b-a+1,rh=d-c+1;if(depth>7||rw<w*.075||rh<h*.055){leaves.push([a,c,b,d]);return;}
      let best=null;const sepBand=Math.max(2,Math.min(7,Math.round(Math.min(rw,rh)*.018))),my=Math.max(4,Math.round(rh*.05));
      for(let y=c+my;y<=d-my;y++){
        let dark=0,run=0,bestRun=0,rawDark=0,rawRun=0,rawBestRun=0,sum=0,sq=0;
        for(let x=a;x<=b;x++){let rail=255;for(let yy=Math.max(c,y-sepBand);yy<=Math.min(d,y+sepBand);yy++)rail=Math.min(rail,lum[yy*w+x]);const v=lum[y*w+x];if(rail<=darkCut){dark++;run++;bestRun=Math.max(bestRun,run)}else run=0;if(v<=darkCut){rawDark++;rawRun++;rawBestRun=Math.max(rawBestRun,rawRun)}else rawRun=0;sum+=v;sq+=v*v;}
        const n=rw,mean=sum/n,sd=Math.sqrt(Math.max(0,sq/n-mean*mean)),darkFrac=dark/n,runFrac=bestRun/n,rawDarkFrac=rawDark/n,rawRunFrac=rawBestRun/n,side=sepBand+3;let sa=0,sb=0;for(let x=a;x<=b;x++){sa+=lum[Math.max(c,y-side)*w+x];sb+=lum[Math.min(d,y+side)*w+x];}const contrast=(sa+sb)/(2*n)-mean,straight=rawRunFrac>=.86&&rawDarkFrac>=.70?rawRunFrac+rawDarkFrac:0,drift=runFrac>=.86&&darkFrac>=.68&&rawDarkFrac>=.16?(runFrac+darkFrac)*.90:0,black=Math.max((contrast>=18||mean<=35)?straight:0,(contrast>=30||mean<=35)?drift:0),gutter=sd<=10&&(mean>=165||mean<=150)?(.95+(10-sd)/20):0,score=Math.max(black,gutter);
        if(score>0&&(!best||score>best.score))best={axis:'H',pos:y,score,mode:black>=gutter?'rail':'gutter',rawDarkFrac,rawRunFrac,darkFrac,runFrac,mean,sd,railContrast:contrast};
      }
      const mx=Math.max(4,Math.round(rw*.05));
      for(let x=a+mx;x<=b-mx;x++){
        let dark=0,run=0,bestRun=0,rawDark=0,rawRun=0,rawBestRun=0,sum=0,sq=0;
        for(let y=c;y<=d;y++){let rail=255;for(let xx=Math.max(a,x-sepBand);xx<=Math.min(b,x+sepBand);xx++)rail=Math.min(rail,lum[y*w+xx]);const v=lum[y*w+x];if(rail<=darkCut){dark++;run++;bestRun=Math.max(bestRun,run)}else run=0;if(v<=darkCut){rawDark++;rawRun++;rawBestRun=Math.max(rawBestRun,rawRun)}else rawRun=0;sum+=v;sq+=v*v;}
        const n=rh,mean=sum/n,sd=Math.sqrt(Math.max(0,sq/n-mean*mean)),darkFrac=dark/n,runFrac=bestRun/n,rawDarkFrac=rawDark/n,rawRunFrac=rawBestRun/n,side=sepBand+3;let sa=0,sb=0;for(let y=c;y<=d;y++){sa+=lum[y*w+Math.max(a,x-side)];sb+=lum[y*w+Math.min(b,x+side)];}const contrast=(sa+sb)/(2*n)-mean,straight=rawRunFrac>=.86&&rawDarkFrac>=.70?rawRunFrac+rawDarkFrac:0,drift=runFrac>=.86&&darkFrac>=.68&&rawDarkFrac>=.16?(runFrac+darkFrac)*.90:0,black=Math.max((contrast>=18||mean<=35)?straight:0,(contrast>=30||mean<=35)?drift:0),gutter=sd<=10&&(mean>=165||mean<=150)?(.95+(10-sd)/20):0,score=Math.max(black,gutter);
        if(score>0&&(!best||score>best.score+.03))best={axis:'V',pos:x,score,mode:black>=gutter?'rail':'gutter',rawDarkFrac,rawRunFrac,darkFrac,runFrac,mean,sd,railContrast:contrast};
      }
      if(!best){leaves.push([a,c,b,d]);return;}
      const pad=Math.max(2,Math.round((best.axis==='H'?rh:rw)*.006));
      if(best.axis==='H'){
        if(best.pos-c<rh*.09||d-best.pos<rh*.09){leaves.push([a,c,b,d]);return;}
        splits.push({region:[a,c,b,d],depth,pad,...best});split(a,b,c,Math.max(c,best.pos-pad),depth+1);split(a,b,Math.min(d,best.pos+pad),d,depth+1);
      }else{
        if(best.pos-a<rw*.09||b-best.pos<rw*.09){leaves.push([a,c,b,d]);return;}
        splits.push({region:[a,c,b,d],depth,pad,...best});split(a,Math.max(a,best.pos-pad),c,d,depth+1);split(Math.min(b,best.pos+pad),b,c,d,depth+1);
      }
    };
    split(x0,x1,y0,y1,0);if(splits.length<3||splits.length>18||leaves.length<4||leaves.length>12)return null;
    const cells=[];
    for(const box of leaves){const [a,c,b,d]=box,rw=b-a+1,rh=d-c+1,pixels=rw*rh;if(pixels<w*h*.018)continue;let sum=0,sq=0,dark=0,light=0;for(let y=c;y<=d;y++)for(let x=a;x<=b;x++){const v=lum[y*w+x];sum+=v;sq+=v*v;dark+=v<65;light+=v>140;}const mean=sum/pixels,variance=sq/pixels-mean*mean,st={pixels,mean,variance,dark,light};if(!range(mean,20,235)||variance<500||dark/pixels<.02||dark/pixels>.94||light/pixels<.015||light/pixels>.95)continue;cells.push({box,stats:st});}
    if(cells.length<4||cells.length>10)return null;const area=cells.reduce((s,c)=>s+c.stats.pixels,0)/(w*h);if(!range(area,.62,.975))return null;
    if(splits.length<cells.length-1||splits.length>cells.length+3)return null;
    log?.(`structural grid: ${cells.length} textured cells from ${splits.length} proved splits; coverage=${area.toFixed(3)}`);
    return {w,h,outer:[x0,y0,x1,y1],cells,splits,coverage:area};
  }
  function validSplit(s,w,h){return s&&['H','V'].includes(s.axis)&&Number.isInteger(s.pos)&&Array.isArray(s.region)&&s.region.length===4&&s.region.every(Number.isInteger)&&Number.isInteger(s.depth)&&range(s.depth,0,7)&&Number.isInteger(s.pad)&&range(s.pad,2,12)&&range(s.score,.95,2.01)&&['rail','gutter'].includes(s.mode)&&range(s.rawDarkFrac,0,1)&&range(s.rawRunFrac,0,1)&&range(s.darkFrac,0,1)&&range(s.runFrac,0,1)&&range(s.mean,0,255)&&range(s.sd,0,128)&&range(s.railContrast,-255,255)&&s.pos>=0&&(s.axis==='H'?s.pos<h:s.pos<w);}
  function validPanel(p){try{const pr=p?._structuralGridProof,w=pr?.analysisWidth,h=pr?.analysisHeight;if(p?._identitySource!=='structural-grid-frame'||pr?.version!==1||pr.method!==METHOD||pr.connected!==true||!Number.isInteger(w)||!Number.isInteger(h)||!range(w,120,900)||!range(h,160,900)||!Number.isInteger(pr.index)||!Number.isInteger(pr.count)||!range(pr.count,4,10)||!range(pr.index,0,pr.count-1)||!Array.isArray(pr.box)||pr.box.length!==4||pr.box.some(v=>!Number.isInteger(v))||!Array.isArray(pr.splits)||pr.splits.length<pr.count-1||pr.splits.length>pr.count+3||pr.splits.some(s=>!validSplit(s,w,h))||!range(pr.coverage,.62,.975))return false;const [x0,y0,x1,y1]=pr.box,st=pr.stats,pixels=(x1-x0+1)*(y1-y0+1);if(x0<0||y0<0||x1>=w||y1>=h||x1<=x0||y1<=y0||!st||st.pixels!==pixels||!range(st.mean,20,235)||!range(st.variance,500,16257)||!Number.isInteger(st.dark)||!range(st.dark/pixels,.02,.94)||!Number.isInteger(st.light)||!range(st.light/pixels,.015,.95))return false;return ['x','y','w','h'].every(k=>finite(p[k]))&&Math.max(Math.abs(p.x-x0/w),Math.abs(p.y-y0/h),Math.abs(p.w-(x1-x0+1)/w),Math.abs(p.h-(y1-y0+1)/h))<1e-10;}catch(_){return false;}}
  function analyzeRGBA(rgba,w,h,log){const m=partitionRGBA(rgba,w,h,log);if(!m)return[];const proofBase={version:1,method:METHOD,connected:true,analysisWidth:w,analysisHeight:h,count:m.cells.length,outer:m.outer,coverage:m.coverage,splits:m.splits};const out=m.cells.map((c,index)=>({x:c.box[0]/w,y:c.box[1]/h,w:(c.box[2]-c.box[0]+1)/w,h:(c.box[3]-c.box[1]+1)/h,_identitySource:'structural-grid-frame',_geometryType:'orthogonal',_structuralGridProof:{...proofBase,index,box:c.box,stats:c.stats}}));return out.every(validPanel)?out:[];}
  function imageData(img){const W=img.naturalWidth||img.width,H=img.naturalHeight||img.height;if(!W||!H)return null;const s=Math.min(1,900/Math.max(W,H)),w=Math.round(W*s),h=Math.round(H*s),c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d',{willReadFrequently:true});if(!g)return null;g.drawImage(img,0,0,w,h);return {rgba:g.getImageData(0,0,w,h).data,w,h};}
  function analyzeImage(img,log){const d=imageData(img);return d?analyzeRGBA(d.rgba,d.w,d.h,log):[];}
  function completeImage(img,anchors,log){
    if(!Array.isArray(anchors)||anchors.length!==2||anchors.some(a=>!a||!a._identitySource||!['x','y','w','h'].every(k=>finite(a[k]))))return[];
    const rims=anchors.filter(a=>a._identitySource==='rim-frame'&&typeof PanelRimFrames!=='undefined'&&PanelRimFrames.validPanel?.(a));
    const bleeds=anchors.filter(a=>a._identitySource==='bleed-strip-frame'&&typeof PanelAbuttingFrames!=='undefined'&&PanelAbuttingFrames.validBleedStrip?.(a));
    if(rims.length!==1||bleeds.length!==1)return[];
    const grid=analyzeImage(img,log);if(grid.length<4)return[];const owner=new Array(grid.length).fill(null);
    for(const a of anchors){const matches=[];for(let i=0;i<grid.length;i++){const c=grid[i],ov=overlap(a,c);if(ov/(c.w*c.h)>=.80)matches.push(i);}if(matches.length!==1||owner[matches[0]])return[];owner[matches[0]]=a;}
    const additions=owner.filter(x=>!x).length;if(additions<2)return[];const merged=grid.map((c,i)=>owner[i]||c);
    log?.(`structural grid completion: 2 perimeter anchors + ${additions} proved cells = ${merged.length}`);return merged;
  }
  return {analyzeRGBA,analyzeImage,completeImage,validPanel};
})();
if(typeof window!=='undefined')window.PanelStructuralGrid=PanelStructuralGrid;
if(typeof module!=='undefined'&&module.exports)module.exports=PanelStructuralGrid;
