// NTH SHELF V2.79.05 — PERSISTENT BACKGROUND PANEL MAP
//
// The interactive contract is intentionally small: `findAt` is synchronous
// and returns only strict frames already approved by PanelMapCore. Everything
// expensive happens in a worker before the tap. A missing/incomplete/invalid
// map is not an error; reader.js simply runs the complete V2.79.04 route.

const PanelMap = {
  _records:new Map(),
  _jobs:new Map(),
  _queue:Promise.resolve(),
  _issueId:null,
  _generation:0,
  _activeWorker:null,
  _activeFinish:null,
  _jobSerial:0,
  _workerUrl:(()=>{
    try{
      const source=document.currentScript?.src||new URL('js/panel-map.js',location.href).href;
      return new URL('panel-map-worker.js',source).href;
    }catch(_){return './js/panel-map-worker.js';}
  })(),

  _key(comicId,pageIndex){return `${comicId}:${pageIndex}`;},

  _log(logger,message){
    if(logger)logger(`PANEL MAP ${message}`);
  },

  _clearIssueMemory(comicId){
    if(!comicId)return;
    const prefix=`${comicId}:`;
    for(const key of this._records.keys())if(key.startsWith(prefix))this._records.delete(key);
  },

  beginIssue(comicId){
    if(this._issueId===comicId)return;
    this._clearIssueMemory(comicId);
    this._issueId=comicId||null;
    this._generation++;
    this._cancelWorker();
    this._jobs.clear();
    this._queue=Promise.resolve();
  },

  endIssue(comicId){
    if(comicId&&this._issueId!==comicId)return;
    this._clearIssueMemory(this._issueId);
    this._issueId=null;
    this._generation++;
    this._cancelWorker();
    this._jobs.clear();
    this._queue=Promise.resolve();
  },

  _cancelWorker(){
    const finish=this._activeFinish;
    this._activeFinish=null;
    try{this._activeWorker?.terminate?.();}catch(_){}
    this._activeWorker=null;
    if(finish)finish(null,'cancelled');
  },

  async _fingerprint(blob){
    if(!blob||!globalThis.crypto?.subtle||typeof blob.arrayBuffer!=='function')return null;
    const bytes=await blob.arrayBuffer();
    const digest=await crypto.subtle.digest('SHA-256',bytes);
    const hex=Array.from(new Uint8Array(digest),byte=>byte.toString(16).padStart(2,'0')).join('');
    return `sha256:${hex}`;
  },

  _runWorker(blob,generation,logger){
    if(typeof Worker==='undefined'||typeof PanelMapCore==='undefined'){
      this._log(logger,'worker unavailable; V2.79.04 fallback remains active');
      return Promise.resolve(null);
    }
    return new Promise(resolve=>{
      let worker=null,finished=false,timer=null;
      const id=`panel-map-${Date.now()}-${++this._jobSerial}`;
      const finish=(result,error)=>{
        if(finished)return;
        finished=true;
        if(timer)clearTimeout(timer);
        try{worker?.terminate?.();}catch(_){}
        if(this._activeWorker===worker)this._activeWorker=null;
        if(this._activeFinish===finish)this._activeFinish=null;
        if(error&&error!=='cancelled')this._log(logger,`build deferred (${error})`);
        resolve(result||null);
      };
      try{
        worker=new Worker(this._workerUrl);
        this._activeWorker=worker;
        this._activeFinish=finish;
        worker.onmessage=event=>{
          const message=event.data||{};
          if(message.type==='panel-map-worker-unavailable')return finish(null,'browser worker canvas unavailable');
          if(message.id!==id)return;
          if(message.type==='built')return finish(message.result,null);
          if(message.type==='failed')return finish(null,message.error||'worker build failed');
        };
        worker.onerror=event=>finish(null,event?.message||'worker error');
        timer=setTimeout(()=>finish(null,'30-second worker ceiling'),30000);
        if(generation!==this._generation)return finish(null,'cancelled');
        worker.postMessage({type:'build',id,blob});
      }catch(error){
        finish(null,String(error?.message||error));
      }
    });
  },

  prepare(comicId,pageIndex,blob,{logger}={}){
    if(!comicId||!Number.isInteger(pageIndex)||!blob)return Promise.resolve(null);
    const key=this._key(comicId,pageIndex);
    const memory=this._records.get(key);
    if(memory?._validated)return Promise.resolve(memory);
    if(this._jobs.has(key))return this._jobs.get(key);
    const generation=this._generation;
    const task=this._queue.catch(()=>null).then(()=>
      this._prepareNow(comicId,pageIndex,blob,generation,logger)
    );
    this._queue=task.catch(()=>null);
    this._jobs.set(key,task);
    task.then(()=>{
      if(this._jobs.get(key)===task)this._jobs.delete(key);
    },()=>{
      if(this._jobs.get(key)===task)this._jobs.delete(key);
    });
    return task;
  },

  async _prepareNow(comicId,pageIndex,blob,generation,logger){
    if(generation!==this._generation||this._issueId!==comicId)return null;
    const key=this._key(comicId,pageIndex);
    let fingerprint=null,stored=null;
    try{
      [fingerprint,stored]=await Promise.all([
        this._fingerprint(blob),
        typeof LongboxDB!=='undefined'&&LongboxDB.getPanelMap
          ?LongboxDB.getPanelMap(comicId,pageIndex).catch(()=>null)
          :Promise.resolve(null)
      ]);
    }catch(error){
      this._log(logger,`fingerprint/cache read failed (${error?.message||error})`);
    }
    if(generation!==this._generation||this._issueId!==comicId)return null;

    if(fingerprint&&PanelMapCore.isCompatible(stored,fingerprint)){
      const record={...stored,frames:PanelMapCore.mergeFrames([],stored.frames),_validated:true};
      this._records.set(key,record);
      this._log(logger,`persistent hit p${pageIndex+1} frames=${record.frames.length}`);
      return record;
    }

    const existing=this._records.get(key);
    const provisional={
      key,comicId,pageIndex,
      mapVersion:PanelMapCore.MAP_VERSION,
      proofVersion:PanelMapCore.PROOF_VERSION,
      fingerprint,
      pageSize:Number(blob.size)||0,
      pageType:String(blob.type||''),
      status:'partial',
      frames:PanelMapCore.mergeFrames([],existing?.frames||[]),
      createdAt:Date.now(),
      _validated:false
    };
    this._records.set(key,provisional);
    this._log(logger,`build start p${pageIndex+1}`);
    const built=await this._runWorker(blob,generation,logger);
    if(!built||generation!==this._generation||this._issueId!==comicId)return provisional;

    const record={
      ...provisional,
      mapVersion:PanelMapCore.MAP_VERSION,
      proofVersion:PanelMapCore.PROOF_VERSION,
      status:'partial',
      frames:PanelMapCore.mergeFrames(provisional.frames,built.frames),
      probeCount:Number(built.probeCount)||0,
      acceptedCount:Number(built.acceptedCount)||0,
      buildElapsedMs:Number(built.elapsedMs)||0,
      attempts:Array.isArray(built.attempts)?built.attempts:[],
      updatedAt:Date.now(),
      _validated:true
    };
    this._records.set(key,record);
    this._log(logger,`ready p${pageIndex+1} frames=${record.frames.length} build=${record.buildElapsedMs}ms`);
    if(fingerprint&&typeof LongboxDB!=='undefined'&&LongboxDB.putPanelMap){
      const persisted={...record};
      delete persisted._validated;
      LongboxDB.putPanelMap(comicId,pageIndex,persisted).catch(error=>
        this._log(logger,`cache write failed (${error?.message||error})`)
      );
    }
    return record;
  },

  findAt(comicId,pageIndex,x,y){
    const record=this._records.get(this._key(comicId,pageIndex));
    const frame=PanelMapCore.findAt(record?.frames,x,y);
    if(!frame)return null;
    frame._panelMapHit=true;
    frame._frameEnvelope={...(frame._frameEnvelope||{}),panelMapHit:true,
      panelMapVersion:PanelMapCore.MAP_VERSION};
    return frame;
  },

  remember(comicId,pageIndex,result,{logger}={}){
    if(!comicId||!Number.isInteger(pageIndex))return false;
    const frame=PanelMapCore.serializeFrame(result);
    if(!frame)return false;
    const key=this._key(comicId,pageIndex);
    const old=this._records.get(key)||{
      key,comicId,pageIndex,
      mapVersion:PanelMapCore.MAP_VERSION,
      proofVersion:PanelMapCore.PROOF_VERSION,
      fingerprint:null,status:'partial',frames:[],createdAt:Date.now(),_validated:false
    };
    const frames=PanelMapCore.mergeFrames(old.frames,[frame]);
    if(frames.length===old.frames.length&&old.frames.some(candidate=>
      PanelMapCore._quadDistance(candidate._quad,frame._quad)<=.025))return true;
    const record={...old,frames,updatedAt:Date.now()};
    this._records.set(key,record);
    this._log(logger,`learned strict frame p${pageIndex+1} frames=${frames.length}`);
    if(record.fingerprint&&record._validated&&typeof LongboxDB!=='undefined'&&LongboxDB.putPanelMap){
      const persisted={...record};
      delete persisted._validated;
      LongboxDB.putPanelMap(comicId,pageIndex,persisted).catch(()=>{});
    }
    return true;
  },

  status(comicId,pageIndex){
    const record=this._records.get(this._key(comicId,pageIndex));
    return record?{status:record.status,frames:record.frames?.length||0,
      validated:record._validated===true,buildElapsedMs:record.buildElapsedMs||0}:null;
  }
};
