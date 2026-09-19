/* Exact-origin Android messages; absent in ordinary browsers. */
if (window.NthShelfHost) {
  const pending = new Map();
  let serial = 0;
  NthShelfHost.onmessage = event => {
    if(event.data instanceof ArrayBuffer) {
      if(event.data.byteLength<8)return;
      const header=new DataView(event.data);
      if(header.getUint32(0,true)!==0x4e544852)return;
      const id=header.getUint32(4,true),request=pending.get(id);
      if(request){pending.delete(id);request.resolve(new Uint8Array(event.data,8));}
      return;
    }
    const result = JSON.parse(event.data), request = pending.get(result.id);
    if (!request) return;
    if (result.progress != null) { request.progress?.(result.progress); return; }
    pending.delete(result.id);
    result.ok ? request.resolve(result.data !== undefined ? result.data : result.message) : request.reject(new Error(result.message));
  };
  window.NthShelfNative = {
    streaming:true,
    binaryChunk(bytes) {
      return new Promise((resolve,reject)=>{
        const id=++serial,packet=new Uint8Array(bytes.byteLength+8),header=new DataView(packet.buffer);
        header.setUint32(0,0x4e544842,true);header.setUint32(4,id,true);packet.set(bytes,8);
        pending.set(id,{resolve,reject});
        try{NthShelfHost.postMessage(packet.buffer);}catch(error){pending.delete(id);reject(error);}
      });
    },
    request(action, values = {}, progress) {
      return new Promise((resolve,reject) => {
        const id=++serial; pending.set(id,{resolve,reject,progress});
        NthShelfHost.postMessage(JSON.stringify({id,action,...values}));
      });
    },
    setImmersive(enabled) { return this.request("immersive",{enabled}).catch(console.warn); },
    async save(blob, name, progress) {
      await this.request("begin",{name,mime:blob.type || "application/zip"});
      try {
        for(let offset=0;offset<blob.size;offset+=196608) {
          const bytes=new Uint8Array(await blob.slice(offset,offset+196608).arrayBuffer());
          let binary="";
          for(let i=0;i<bytes.length;i+=8192) binary+=String.fromCharCode(...bytes.subarray(i,i+8192));
          await this.request("chunk",{data:btoa(binary)});
          progress?.(offset+bytes.length,blob.size);
        }
        return await this.request("finish");
      } catch(error) { await this.request("cancel"); throw error; }
    }
  };
}
