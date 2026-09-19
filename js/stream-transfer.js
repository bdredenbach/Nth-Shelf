/* Native full-library archives: bounded chunks; restore pages stage on disk until publication. */
window.ShelfStream = {
  marker:'nth-shelf-pending-restore-v1',
  pageLimit:128*1024*1024,
  check() { if(ShelfTransfer.cancelRequested) throw Error('Transfer cancelled. Your existing library was not changed.'); },
  request(action,values={},progress) {this.check();return NthShelfNative.request(action,values,progress);},
  async recover() {
    const db=await openDB(),t=db.transaction('meta','readonly');
    const record=await reqResult(t.objectStore('meta').get(this.marker));
    if(record)await this.rollback(record.ids);
  },
  async rollback(ids) {
    const db=await openDB();
    for(const id of ids) {
      const t=db.transaction('pages','readwrite'),store=t.objectStore('pages');
      const req=store.index('comicId').openKeyCursor(IDBKeyRange.only(id));
      req.onsuccess=()=>{const c=req.result;if(c){store.delete(c.primaryKey);c.continue();}};
      await txDone(t);
      await NthShelfNative.request("archiveDropCache",{key:id});
    }
    const t=db.transaction('meta','readwrite');t.objectStore('meta').delete(this.marker);await txDone(t);
  },
  async writeEntry(name,blob,key) {
    await this.request('archiveEntry',{name,...(key?{key}:{})});
    const binary=this.capabilities?.binary && NthShelfNative.binaryChunk;
    const size=binary?1048576:196608,queue=[];
    const wait=async()=>{const result=await queue.shift();if(result.error)throw result.error;};
    try {
      for(let offset=0;offset<blob.size;offset+=size) {
        this.check();const bytes=new Uint8Array(await blob.slice(offset,offset+size).arrayBuffer());
        let operation;
        if(binary)operation=NthShelfNative.binaryChunk(bytes);
        else {
          let text='';for(let i=0;i<bytes.length;i+=8192)text+=String.fromCharCode(...bytes.subarray(i,i+8192));
          operation=this.request('archiveChunk',{data:btoa(text)});
        }
        queue.push(operation.then(()=>({}),error=>({error})));
        if(queue.length>=(binary?2:1))await wait();
      }
      while(queue.length)await wait();
    } catch(error) {await Promise.all(queue);throw error;}
    await this.request('archiveEndEntry');
  },
  async backup() {
    await this.ready;
    this.capabilities=await this.request('archiveCapabilities');
    const comics=await LongboxDB.getAllComics(),collections=await LongboxDB.getAllCollections();
    const manifest={app:'nth-shelf',version:3,createdAt:new Date().toISOString(),comics:[],collections};
    let bytes=0;
    ShelfTransfer.progress(0,'Choose where to save your full library…');
    try {
      await this.request('archiveCreate',{name:'Nth-Shelf-'+new Date().toISOString().slice(0,10)+'.nthshelf'});
      for(let j=0;j<comics.length;j++) {
        this.check();const comic=comics[j];let source=await LongboxDB.getSource(comic.id);
        let cached=source && await this.request('archiveCacheInfo',{key:comic.id});
        let name=source?.name || ShelfTransfer.safeName(comic.title).replace(/\.\./g,'_')+'.cbz';
        let path='sources/'+(j+1)+'-'+ShelfTransfer.safeName(name).replace(/\.\./g,'_');
        if(source&&cached) {
          await this.request('archiveCachedSource',{key:comic.id,name:path},n=>ShelfTransfer.progress(85*(j+Math.min(1,n/cached.size))/Math.max(1,comics.length),'Copying '+name));
        } else if(source?.blob) {
          ShelfTransfer.progress(85*j/Math.max(1,comics.length),'Copying original archive · '+name);
          await this.writeEntry(path,source.blob,comic.id);
        } else {
          name=ShelfTransfer.safeName(comic.title).replace(/\.\./g,'_')+'.cbz';path='sources/'+(j+1)+'-'+name;
          source={comicId:comic.id,name,pages:[],original:false};
          await this.request('archiveBookBegin',{key:comic.id,name:path});
          for(let i=0;i<comic.pageCount;i++) {
            this.check();const blob=await LongboxDB.getPage(comic.id,i);
            if(!blob)throw Error('Missing page '+(i+1)+' in '+comic.title);
            if(blob.size>this.pageLimit)throw Error('One page exceeds the 128 MiB per-image limit.');
            const ext=({'image/png':'png','image/webp':'webp','image/gif':'gif','image/avif':'avif'})[blob.type]||'jpg';
            const page=String(i+1).padStart(6,'0')+'.'+ext;source.pages.push(page);
            await this.writeEntry(page,blob);
            ShelfTransfer.progress(85*(j+(i+1)/comic.pageCount)/Math.max(1,comics.length),'Preparing reusable CBZ · '+comic.title+' · '+(i+1)+' / '+comic.pageCount);
          }
          await this.request('archiveBookEnd');
        }
        cached=await this.request('archiveCacheInfo',{key:comic.id});
        if(!cached)throw Error('Comic archive could not be retained.');
        // Native originals live in app files, not the OS-evictable cache. Drop duplicate IndexedDB bytes.
        const retained={...source,size:cached.size,native:true};delete retained.blob;
        await LongboxDB.putSource(retained);bytes+=cached.size;
        manifest.comics.push({...comic,coverUrl:undefined,source:{path,name,size:cached.size,pages:retained.pages,original:retained.original}});
        ShelfTransfer.progress(85*(j+1)/Math.max(1,comics.length),'Copied '+name);
      }
      const index=new Blob([JSON.stringify(manifest)],{type:'application/json'});
      if(index.size>8*1024*1024)throw Error('The backup index is too large.');
      await this.writeEntry('nth-shelf-backup.json',index);
      ShelfTransfer.progress(85,'Verifying the saved backup…');
      return await this.request('archiveFinish',{},n=>ShelfTransfer.progress(85+14*Math.min(1,n/Math.max(1,bytes)),'Verifying saved data · '+Math.round(n/1048576)+' MiB'));
    } catch(error) {
      await NthShelfNative.request('archiveCancel').catch(()=>{});
      throw Error(error.message+' Any incomplete destination file should be discarded.');
    }
  },
  async readBlob(type,limit=this.pageLimit,onProgress) {
    const chunks=[];let size=0,data;
    while((data=await this.request('archiveRead',{binary:!!this.capabilities?.binary}))!==null) {
      let bytes;
      if(data instanceof Uint8Array)bytes=data;
      else {const raw=atob(data);bytes=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);}
      size+=bytes.length;
      if(size>limit)throw Error('Archive image exceeds the supported size.');
      chunks.push(bytes);onProgress?.(size);
    }
    return new Blob(chunks,{type});
  },
  async restoreSource(source,progress,status) {
    const seen=new Set();
    const zip=/\.(cbz|zip)$/i.test(source.name),pending=new Map(source.pages.map((n,i)=>[n,i]));
    await this.request('archiveSourceOpen',{key:source.id,nested:zip});
    const put=async(name,blob)=>{
      this.check();const index=pending.get(name);if(index==null)return;
      const typed=new Blob([blob],{type:guessMime(name)});
      if(typed.size>this.pageLimit)throw Error('One image exceeds the supported size.');
      const bitmap=await createImageBitmap(typed);bitmap.close();
      if(index===0)source.row.coverUrl=await blobToDataUrl(await makeThumbnail(typed));
      await LongboxDB.putPage(source.id,index,typed);pending.delete(name);progress();
    };
    if(zip) {
      let entry;
      while((entry=await this.request('archiveSourceNext'))!==null) {
        if(seen.has(entry.name))throw Error('Duplicate entry in comic archive.');seen.add(entry.name);
        if(!entry.directory&&pending.has(entry.name)){
          const label=source.row.title+' · page '+(pending.get(entry.name)+1)+' / '+source.pages.length;
          status('Reading '+label);
          const blob=await this.readBlob(guessMime(entry.name),this.pageLimit,n=>status('Reading '+label+' · '+(n/1048576).toFixed(1)+' MiB'));
          status('Saving '+label);await put(entry.name,blob);
        }
      }
    } else {
      // The existing 7Z/RAR/TAR importer processes one original archive at a time.
      const blob=await this.readBlob('application/octet-stream',Number.MAX_SAFE_INTEGER,n=>status('Reading '+source.name+' · '+(n/1048576).toFixed(1)+' / '+(source.size/1048576).toFixed(1)+' MiB'));
      status('Opening '+source.name);
      const file=new File([blob],source.name);
      const entries=/\.(cbt|tar)$/i.test(source.name)?await Library.readTarEntries(file):await Library.readLibarchiveEntries(file);
      for(const e of entries)if(pending.has(e.name))await put(e.name,await e.getBlob());
    }
    if(pending.size)throw Error('A comic archive is missing '+pending.size+' pages.');
    const cached=await this.request('archiveCacheInfo',{key:source.id});
    if(!cached||cached.size!==source.size)throw Error('Source archive size does not match the backup index.');
  },
  catalog(data) {
    if(data?.app!=='nth-shelf'||![2,3].includes(data.version)||!Array.isArray(data.comics)||!Array.isArray(data.collections))throw Error('Unsupported full-library backup.');
    const collections=[],comics=[],wanted=new Map(),sources=new Map(),collectionIds=new Map(),comicIds=new Set();
    for(const c of data.collections) {
      if(!c||typeof c.id!=='string'||typeof c.title!=='string'||collectionIds.has(c.id))throw Error('Invalid collection index.');
      const id='restore_'+crypto.randomUUID();collectionIds.set(c.id,id);collections.push({...c,id});
    }
    for(const c of data.comics) {
      if(!c||typeof c.id!=='string'||comicIds.has(c.id)||typeof c.title!=='string'||!Number.isInteger(c.pageCount)||c.pageCount<1||(data.version===2&&(!Array.isArray(c.pages)||c.pages.length!==c.pageCount)))throw Error('Invalid comic index.');
      if(c.collectionId&&!collectionIds.has(c.collectionId))throw Error('A collection is missing from the backup.');
      comicIds.add(c.id);const id='restore_'+crypto.randomUUID();
      const row={...c,id,coverUrl:null,collectionId:collectionIds.get(c.collectionId)||null,
        lastPage:Math.max(0,Math.min(c.pageCount-1,Number(c.lastPage)||0)),
        bookmarks:Array.isArray(c.bookmarks)?c.bookmarks:[]};
      delete row.pages;delete row.source;comics.push(row);
      if(data.version===3) {
        const source=c.source;
        if(!source||!Number.isSafeInteger(source.size)||source.size<1||typeof source.name!=='string'||typeof source.path!=='string'||!/^sources\/[^/]+$/.test(source.path)||source.path.includes('..')||sources.has(source.path)||!Array.isArray(source.pages)||source.pages.length!==c.pageCount||new Set(source.pages).size!==c.pageCount||!source.pages.every(n=>typeof n==='string'&&IMAGE_EXT.test(n))||!ARCHIVE_EXT.test(source.name))throw Error('Invalid source archive index.');
        sources.set(source.path,{...source,row,id});continue;
      }
      c.pages.forEach((p,index)=>{
        if(!p||typeof p.path!=='string'||!/^pages\/[^/]+\/[^/]+$/.test(p.path)||p.path.includes('..')||wanted.has(p.path)||!/^image\/(jpeg|png|gif|webp|avif)$/.test(p.type))throw Error('Invalid or duplicate page index.');
        if(p.size!=null&&(!Number.isSafeInteger(p.size)||p.size<0||p.size>this.pageLimit))throw Error('Invalid page size.');
        wanted.set(p.path,{...p,id,index,row});
      });
    }
    return {collections,comics,wanted,sources};
  },
  async restore() {
    await this.ready;await this.recover();let staged=null,committed=false;
    try {
      this.capabilities=await this.request('archiveCapabilities');
      ShelfTransfer.progress(0,'Choose a full-library backup…');
      const source=await this.request('archiveOpen',{},n=>ShelfTransfer.progress(0,'Checking archive integrity · '+Math.round(n/1048576)+' MiB'));
      this.check();const {collections,comics,wanted,sources}=this.catalog(JSON.parse(source.manifest));
      const ids=comics.map(c=>c.id),db=await openDB();
      const t=db.transaction('meta','readwrite');t.objectStore('meta').put({key:this.marker,ids});await txDone(t);staged=ids;
      const total=comics.reduce((n,c)=>n+c.pageCount,0),retained=[];let count=0,entry;
      while((entry=await this.request('archiveNext'))!==null) {
        this.check();
        const sourceEntry=sources.get(entry.name);
        if(sourceEntry) {
          await this.restoreSource(sourceEntry,()=>{count++;ShelfTransfer.progress(5+90*count/Math.max(1,total),'Restoring '+sourceEntry.row.title);},text=>ShelfTransfer.progress(5+90*count/Math.max(1,total),text));
          retained.push({comicId:sourceEntry.id,name:sourceEntry.name,size:sourceEntry.size,pages:sourceEntry.pages,original:sourceEntry.original,native:true});
          sources.delete(entry.name);continue;
        }
        const page=wanted.get(entry.name);
        if(!page) {
          // The initial native integrity scan already checked ancillary entries.
          if(!entry.directory&&entry.name!=='nth-shelf-backup.json')throw Error('Unexpected or repeated page in backup.');
          continue;
        }
        const label=page.row.title+' · page '+(page.index+1)+' / '+page.row.pageCount;
        ShelfTransfer.progress(5+90*count/Math.max(1,total),'Reading '+label);
        const blob=await this.readBlob(page.type,this.pageLimit,n=>ShelfTransfer.progress(5+90*count/Math.max(1,total),'Reading '+label+' · '+(n/1048576).toFixed(1)+' MiB'));
        if(page.size!=null&&blob.size!==page.size)throw Error('A page is incomplete in the backup.');
        ShelfTransfer.progress(5+90*count/Math.max(1,total),'Saving '+label);
        this.check();const bitmap=await createImageBitmap(blob);bitmap.close();
        if(page.index===0)page.row.coverUrl=await blobToDataUrl(await makeThumbnail(blob));
        await LongboxDB.putPage(page.id,page.index,blob);wanted.delete(entry.name);
        ShelfTransfer.progress(5+90*(++count/Math.max(1,total)),page.row.title+' · restoring page '+(page.index+1)+' / '+page.row.pageCount);
      }
      if(sources.size)throw Error("Backup is missing source archives.");
      if(wanted.size)throw Error('Backup is missing '+wanted.size+' pages.');
      this.check();await this.request('archiveClose');this.check();
      // Only metadata is published in this short atomic transaction. The pages are already on disk.
      ShelfTransfer.setCancellable(false);
      ShelfTransfer.progress(97,'Finishing your restored library…');
      const commit=db.transaction(['comics','collections','meta','sources'],'readwrite');const done=txDone(commit);
      try {
        for(const s of retained)commit.objectStore('sources').add(s);
        for(const c of comics)commit.objectStore('comics').add(c);
        for(const c of collections)commit.objectStore('collections').add(c);
        commit.objectStore('meta').delete(this.marker);
      } catch(error) {commit.abort();await done.catch(()=>{});throw error;}
      await done;committed=true;
      try {localStorage.setItem(STORAGE_MARKER_KEY,JSON.stringify({hasLibrary:true,updatedAt:Date.now()}));await Library.refresh();}catch(_){}
      return 'Restored '+comics.length+' comics and '+total+' pages. Your existing books were kept.';
    } catch(error) {
      if(staged&&!committed) {
        ShelfTransfer.setCancellable(false);ShelfTransfer.progress(0,'Removing unfinished restore data…');
        await this.rollback(staged);
      }
      throw error;
    } finally {await NthShelfNative.request('archiveCancel').catch(()=>{});}
  }
};
