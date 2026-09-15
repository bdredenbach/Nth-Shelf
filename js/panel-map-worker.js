// NTH SHELF V2.79.05 — BACKGROUND STRICT PANEL-MAP WORKER

if(typeof OffscreenCanvas==='undefined'||typeof createImageBitmap!=='function'){
  self.postMessage({type:'panel-map-worker-unavailable'});
}else{
  self.clamp01=value=>Math.min(1,Math.max(0,Number(value)||0));
  // The existing detector creates a canvas through `document`. Give it an
  // OffscreenCanvas factory without changing any of its image or proof math.
  self.document={
    createElement(kind){
      if(kind!=='canvas')throw new Error(`unsupported worker element: ${kind}`);
      return new OffscreenCanvas(1,1);
    }
  };

  importScripts(
    'panels-frame-wasm.js',
    'panels-geometry-orthogonal.js',
    'panels-geometry-skewed.js',
    'panels-frame-envelope.js',
    'panels-geometry.js',
    'panel-map-core.js'
  );

  self.onmessage=async(event)=>{
    const message=event.data||{};
    if(message.type!=='build'||!message.id||!message.blob)return;
    let bitmap=null;
    try{
      await PanelFrameWasm.init(new URL('panels-frame-kernel.wasm',self.location.href).href);
      bitmap=await createImageBitmap(message.blob);
      const result=PanelMapCore.build(bitmap);
      self.postMessage({type:'built',id:message.id,result});
    }catch(error){
      self.postMessage({type:'failed',id:message.id,error:String(error?.message||error)});
    }finally{
      try{bitmap?.close?.();}catch(_){}
    }
  };
}
