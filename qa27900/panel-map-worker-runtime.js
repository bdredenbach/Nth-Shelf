'use strict';

const fs=require('fs');
const path=require('path');
const vm=require('vm');
const {loadPage}=require('./harness');

const appRoot=path.resolve(__dirname,'..');
const wasmBytes=fs.readFileSync(path.join(appRoot,'js','panels-frame-kernel.wasm'));
const messages=[];

class QAOffscreenCanvas{
  constructor(width,height){this.width=width;this.height=height;this._img=null;}
  getContext(){
    const canvas=this;
    return {
      drawImage(img){canvas._img=img;},
      getImageData(x,y,w,h){
        const img=canvas._img;
        if(!img?._rgba)throw new Error('worker QA canvas has no decoded image');
        if(w!==img._rawWidth||h!==img._rawHeight){
          throw new Error(`worker QA canvas mismatch requested=${w}x${h} decoded=${img._rawWidth}x${img._rawHeight}`);
        }
        return {data:img._rgba};
      }
    };
  }
}

const context={
  console,Math,Number,Array,Map,Set,WeakMap,Promise,Date,URL,
  Uint8Array,Float32Array,DataView,WebAssembly,
  OffscreenCanvas:QAOffscreenCanvas,
  createImageBitmap:async()=>loadPage(35),
  fetch:async()=>({ok:true,arrayBuffer:async()=>wasmBytes.buffer.slice(
    wasmBytes.byteOffset,wasmBytes.byteOffset+wasmBytes.byteLength)}),
  postMessage:message=>messages.push(message),
  location:{href:'https://nth.test/js/panel-map-worker.js'}
};
context.self=context;context.globalThis=context;
vm.createContext(context);
context.importScripts=(...names)=>{
  for(const name of names){
    vm.runInContext(fs.readFileSync(path.join(appRoot,'js',name),'utf8'),context,{filename:name});
  }
};

(async()=>{
  vm.runInContext(fs.readFileSync(path.join(appRoot,'js','panel-map-worker.js'),'utf8'),context,
    {filename:'panel-map-worker.js'});
  await context.onmessage({data:{type:'build',id:'qa-worker',blob:{}}});
  const message=messages.find(entry=>entry.id==='qa-worker');
  const result=message?.result;
  const pass=message?.type==='built'&&result?.frames?.length===4&&
    result.acceptedRows?.join(',')==='middle,bottom'&&
    result.frames.every(frame=>frame._frameEnvelope?.wasmRailKernel===true);
  process.stdout.write(`${JSON.stringify({pass,type:message?.type||null,
    frames:result?.frames?.length||0,rows:result?.acceptedRows||[],
    elapsedMs:result?.elapsedMs||null,error:message?.error||null},null,2)}\n`);
  if(!pass)process.exitCode=1;
})().catch(error=>{console.error(error);process.exitCode=1;});
