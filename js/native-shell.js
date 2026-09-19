/* Exact-origin Android messages; absent in ordinary browsers. */
if (window.NthShelfHost) {
  const pending = new Map();
  let serial = 0;
  NthShelfHost.onmessage = event => {
    const result = JSON.parse(event.data), request = pending.get(result.id);
    if (!request) return;
    if (result.progress != null) { request.progress?.(result.progress); return; }
    pending.delete(result.id);
    result.ok ? request.resolve(result.data !== undefined ? result.data : result.message) : request.reject(new Error(result.message));
  };
  window.NthShelfNative = {
    streaming:true,
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
