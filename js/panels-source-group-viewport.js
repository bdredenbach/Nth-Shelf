/* Display-only fit for authenticated narrow, tall source groups.
 * The caller must hold a validated source contour. No mask/owner changes.
 * Older owners and ordinary source groups retain their existing zoom policy.
 */
const PanelSourceGroupViewport = (() => {
  'use strict';
  const RULES=Object.freeze({minHeight:.86,maxWidth:.45,maxBoxArea:.35,minAspect:2,minScale:1.08,maxScale:4.5,fitMargin:.96});
  function layout(reader,geom,stage,sourceW,sourceH) {
    if(!geom||![geom.x,geom.y,geom.w,geom.h,stage?.left,stage?.top,stage?.width,stage?.height,sourceW,sourceH].every(Number.isFinite))return null;
    if(geom.x<0||geom.y<0||geom.w<=0||geom.h<=0||geom.x+geom.w>1.000001||geom.y+geom.h>1.000001||sourceW<=0||sourceH<=0||stage.width<=0||stage.height<=0)return null;
    const R=RULES;if(geom.h<R.minHeight||geom.w>R.maxWidth||geom.w*geom.h>R.maxBoxArea||geom.h/geom.w<R.minAspect)return null;
    const pad=Math.max(8,Math.min(18,Math.round(Math.min(stage.width,stage.height)*.025)));
    const barHeight=selector=>{const bar=reader?.els?.chrome?.querySelector?.(selector);if(!bar)return 0;const h=bar.getBoundingClientRect?.()?.height;return Number.isFinite(h)&&h>=0?h:NaN;};
    // Reserve measured controls even while chrome is hidden; revealing it must
    // not obscure this newly enlarged group. Stage already excludes safe insets.
    const topBar=barHeight('.reader-topbar'),bottomBar=barHeight('.reader-bottombar');
    if(!Number.isFinite(topBar)||!Number.isFinite(bottomBar))return null;
    const left=stage.left+pad,right=stage.left+stage.width-pad,top=stage.top+pad+topBar,bottom=stage.top+stage.height-pad-bottomBar;
    if(![left,right,top,bottom,(left+right)/2,(top+bottom)/2].every(Number.isFinite)||right<=left||bottom<=top)return null;
    const scale=Math.min(R.maxScale,R.fitMargin*Math.min((right-left)/sourceW,(bottom-top)/sourceH));
    if(!Number.isFinite(scale)||scale<=R.minScale)return null;
    return Object.freeze({left,right,top,bottom,scale,centerX:(left+right)/2,centerY:(top+bottom)/2});
  }
  function bind(reader,overlay,img,token) {
    const registrations=[];let done=false;
    const cleanup=()=>{if(done)return;done=true;for(const[o,event,fn]of registrations)o.removeEventListener?.(event,fn);registrations.length=0;};
    const invalidate=()=>{if(done)return;if(reader.els?.panelOverlay===overlay&&reader.panelOverlayToken===token){cleanup();reader.resetZoom({animate:false});}else cleanup();};
    const add=(o,event)=>{if(o?.addEventListener){o.addEventListener(event,invalidate,{passive:true});registrations.push([o,event,invalidate]);}};
    if(typeof window!=='undefined'){add(window,'resize');add(window,'orientationchange');add(window.visualViewport,'resize');}
    add(img,'load');add(img,'error');
    overlay._sourceViewportCleanup=cleanup;
  }
  return {RULES,layout,bind};
})();
if(typeof module!=='undefined')module.exports=PanelSourceGroupViewport;
