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
    }
    const t=db.transaction('meta','readwrite');t.objectStore('meta').delete(this.marker);await txDone(t);
  },
  async writeEntry(name,blob) {
    await this.request('archiveEntry',{name});
    for(let offset=0;offset<blob.size;offset+=196608) {
      this.check();const bytes=new Uint8Array(await blob.slice(offset,offset+196608).arrayBuffer());
      let binary='';for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));
      await this.request('archiveChunk',{data:btoa(binary)});
    }
    await this.request('archiveEndEntry');
  },
  async backup() {
    await this.ready;
    const comics=await LongboxDB.getAllComics(),collections=await LongboxDB.getAllCollections();
    const manifest={app:'nth-shelf',version:2,createdAt:new Date().toISOString(),comics:[],collections};
    const total=comics.reduce((n,c)=>n+c.pageCount,0);let count=0,bytes=0;
    ShelfTransfer.progress(0,'Choose where to save your full library…');
    try {
      await this.request('archiveCreate',{name:'Nth-Shelf-'+new Date().toISOString().slice(0,10)+'.nthshelf'});
      for(let j=0;j<comics.length;j++) {
        const comic=comics[j],pages=[];
        for(let i=0;i<comic.pageCount;i++) {
          this.check();const blob=await LongboxDB.getPage(comic.id,i);
          if(!blob)throw Error('Missing page '+(i+1)+' in '+comic.title+'. Backup was not completed.');
          if(blob.size>this.pageLimit)throw Error('One page exceeds the 128 MiB per-image limit: '+comic.title);
          const ext=({'image/png':'png','image/webp':'webp','image/gif':'gif','image/avif':'avif'})[blob.type]||'jpg';
          const path='pages/'+j+'/'+String(i+1).padStart(6,'0')+'.'+ext;
          await this.writeEntry(path,blob);pages.push({path,type:blob.type||'image/jpeg',size:blob.size});bytes+=blob.size;
          ShelfTransfer.progress(85*(++count/Math.max(1,total)),comic.title+' · page '+(i+1)+' / '+comic.pageCount);
        }
        manifest.comics.push({...comic,coverUrl:undefined,pages});
      }
      const index=new Blob([JSON.stringify(manifest)],{type:'application/json'});
      if(index.size>8*1024*1024)throw Error('The backup index is too large. No completed backup was saved.');
      await this.writeEntry('nth-shelf-backup.json',index);
      ShelfTransfer.progress(85,'Verifying the saved backup…');
      const result=await this.request('archiveFinish',{},n=>ShelfTransfer.progress(85+14*Math.min(1,n/Math.max(1,bytes)), 'Verifying saved data · '+Math.round(n/1048576)+' MiB'));
      return result;
    } catch(error) {
      await NthShelfNative.request('archiveCancel').catch(()=>{});
      throw Error(error.message+' Any incomplete destination file should be discarded.');
    }
  },
  catalog(data) {
    if(data?.app!=='nth-shelf'||data.version!==2||!Array.isArray(data.comics)||!Array.isArray(data.collections))throw Error('Unsupported full-library backup.');
    const collections=[],comics=[],wanted=new Map(),collectionIds=new Map(),comicIds=new Set();
    for(const c of data.collections) {
      if(!c||typeof c.id!=='string'||typeof c.title!=='string'||collectionIds.has(c.id))throw Error('Invalid collection index.');
      const id='restore_'+crypto.randomUUID();collectionIds.set(c.id,id);collections.push({...c,id});
    }
    for(const c of data.comics) {
      if(!c||typeof c.id!=='string'||comicIds.has(c.id)||typeof c.title!=='string'||!Number.isInteger(c.pageCount)||c.pageCount<1||!Array.isArray(c.pages)||c.pages.length!==c.pageCount)throw Error('Invalid comic index.');
      if(c.collectionId&&!collectionIds.has(c.collectionId))throw Error('A collection is missing from the backup.');
      comicIds.add(c.id);const id='restore_'+crypto.randomUUID();
      const row={...c,id,coverUrl:null,collectionId:collectionIds.get(c.collectionId)||null,
        lastPage:Math.max(0,Math.min(c.pageCount-1,Number(c.lastPage)||0)),
        bookmarks:Array.isArray(c.bookmarks)?c.bookmarks:[]};
      delete row.pages;comics.push(row);
      c.pages.forEach((p,index)=>{
        if(!p||typeof p.path!=='string'||!/^pages\/[^/]+\/[^/]+$/.test(p.path)||p.path.includes('..')||wanted.has(p.path)||!/^image\/(jpeg|png|gif|webp|avif)$/.test(p.type))throw Error('Invalid or duplicate page index.');
        if(p.size!=null&&(!Number.isSafeInteger(p.size)||p.size<0||p.size>this.pageLimit))throw Error('Invalid page size.');
        wanted.set(p.path,{...p,id,index,row});
      });
    }
    return {collections,comics,wanted};
  },
  async restore() {
    await this.ready;let staged=null,committed=false;
    try {
      ShelfTransfer.progress(0,'Choose a full-library backup…');
      const source=await this.request('archiveOpen',{},n=>ShelfTransfer.progress(0,'Checking archive integrity · '+Math.round(n/1048576)+' MiB'));
      this.check();const {collections,comics,wanted}=this.catalog(JSON.parse(source.manifest));
      const ids=comics.map(c=>c.id),db=await openDB();
      const t=db.transaction('meta','readwrite');t.objectStore('meta').put({key:this.marker,ids});await txDone(t);staged=ids;
      const total=wanted.size;let count=0,entry;
      while((entry=await this.request('archiveNext'))!==null) {
        this.check();const page=wanted.get(entry.name);
        if(!page) {
          // The initial native integrity scan already checked ancillary entries.
          if(!entry.directory&&entry.name!=='nth-shelf-backup.json')throw Error('Unexpected or repeated page in backup.');
          continue;
        }
        const chunks=[];let bytes=0,encoded;
        while((encoded=await this.request('archiveRead'))!==null) {
          const raw=atob(encoded);bytes+=raw.length;
          if(bytes>this.pageLimit)throw Error('One page exceeds the 128 MiB per-image limit.');
          chunks.push(Uint8Array.from(raw,c=>c.charCodeAt(0)));
        }
        if(page.size!=null&&bytes!==page.size)throw Error('A page is incomplete in the backup.');
        const blob=new Blob(chunks,{type:page.type});chunks.length=0;
        this.check();const bitmap=await createImageBitmap(blob);bitmap.close();
        if(page.index===0)page.row.coverUrl=await blobToDataUrl(await makeThumbnail(blob));
        await LongboxDB.putPage(page.id,page.index,blob);wanted.delete(entry.name);
        ShelfTransfer.progress(5+90*(++count/Math.max(1,total)),page.row.title+' · restoring page '+(page.index+1)+' / '+page.row.pageCount);
      }
      if(wanted.size)throw Error('Backup is missing '+wanted.size+' pages.');
      this.check();await this.request('archiveClose');this.check();
      // Only metadata is published in this short atomic transaction. The pages are already on disk.
      ShelfTransfer.setCancellable(false);
      ShelfTransfer.progress(97,'Finishing your restored library…');
      const commit=db.transaction(['comics','collections','meta'],'readwrite');const done=txDone(commit);
      try {
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
