/* Full, local-only page backups and reconstructed CBZ downloads. */
window.ShelfTransfer = {
  busy:false,
  limit:512*1024*1024,
  init() {
    this.dialog=document.createElement("dialog");
    this.dialog.className="nth-dialog transfer-dialog";
    this.dialog.setAttribute("aria-labelledby","transfer-title");
    this.dialog.innerHTML='<div class="nth-eyebrow">AN NTH EXPERIENCE</div><h2 id="transfer-title"></h2><p class="transfer-detail" aria-live="polite"></p><progress max="100" value="0"></progress><p class="transfer-percent"></p><small>Keep Nth Shelf open. Device may get warm during transfer.</small><button class="modal-btn primary">Done</button>';
    document.body.append(this.dialog);
    this.dialog.querySelector("button").onclick=()=>this.dismiss();
    this.dialog.addEventListener("cancel",e=>{e.preventDefault();this.dismiss();});
    const legacyRestore=Library.restoreBackup.bind(Library);
    Library.exportBackup=()=>this.backup();
    Library.restoreBackup=file=>this.restore(file,legacyRestore);
    Library.openBackupMenu=()=>Modal.actions("Protect your shelf",
      "A full backup includes comic pages, collections, bookmarks, and reading progress. Restore adds copies without replacing your current comics. Legacy progress-only JSON backups are still supported.",
      [{label:"Back up entire library",cls:"primary",onClick:()=>this.backup()},
       {label:"Restore a backup",cls:"neutral",onClick:()=>document.getElementById("restore-input").click()},
       {label:"Cancel",cls:"subtle"}]);
    document.getElementById("restore-input").accept=".nthshelf,.zip,.json,application/zip,application/json";
  },
  dismiss() { if(this.busy)return false;this.dialog.close();return true; },
  progress(value,detail) {
    this.dialog.querySelector("progress").value=value;
    this.dialog.querySelector(".transfer-percent").textContent=Math.round(value)+"%";
    this.dialog.querySelector(".transfer-detail").textContent=detail;
  },
  async run(title,action) {
    if(this.busy)return;
    this.busy=true;this.dialog.querySelector("h2").textContent=title;
    this.dialog.querySelector("button").disabled=true;
    this.dialog.querySelector("button").hidden=true;
    this.progress(0,"Preparing…");this.dialog.showModal();
    await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
    try {
      const message=await action();
      this.progress(100,message);
    } catch(error) {
      this.dialog.querySelector("h2").textContent="Transfer not completed";
      this.dialog.querySelector(".transfer-detail").textContent=error.message || "Please try again.";
    } finally {this.busy=false;this.dialog.querySelector("button").disabled=false;this.dialog.querySelector("button").hidden=false;}
  },
  safeName(name) {return String(name||"comic").replace(/[\\/:*?"<>|\u0000-\u001f]/g,"_").slice(0,120);},
  async save(blob,name) {
    if(window.NthShelfNative) {
      await NthShelfNative.save(blob,name,(done,total)=>this.progress(90+9*done/total,"Preparing Android save window…"));
      return "File saved to your chosen location.";
    }
    const url=URL.createObjectURL(blob),a=document.createElement("a");
    a.href=url;a.download=name;a.click();
    setTimeout(()=>URL.revokeObjectURL(url),60000);
    return "Download handed to your browser. Check Downloads to confirm it was saved.";
  },
  async addPages(zip,comic,prefix,counts) {
    for(let i=0;i<comic.pageCount;i++) {
      const blob=await LongboxDB.getPage(comic.id,i);
      if(!blob) throw new Error('Missing page '+(i+1)+' in "'+comic.title+'". No incomplete backup was saved.');
      counts.bytes+=blob.size;
      if(counts.bytes>this.limit)throw new Error("This transfer exceeds the 512 MiB in-memory safety limit. Download smaller collections instead.");
      const ext=({"image/png":"png","image/webp":"webp","image/gif":"gif","image/avif":"avif"})[blob.type]||"jpg";
      const path=prefix+String(i+1).padStart(6,"0")+"."+ext;
      zip.file(path,blob,{compression:"STORE"});
      counts.paths?.push({path,type:blob.type||"image/jpeg"});
      this.progress(5+65*(++counts.done/counts.total),comic.title+" · page "+(i+1)+" of "+comic.pageCount);
      await new Promise(r=>setTimeout(r,0));
    }
  },
  backup() {return this.run("Backing up Nth Shelf",async()=>{
    const comics=await LongboxDB.getAllComics(),collections=await LongboxDB.getAllCollections();
    const zip=new JSZip(),manifest={app:"nth-shelf",version:2,createdAt:new Date().toISOString(),comics:[],collections};
    const counts={bytes:0,done:0,total:comics.reduce((n,c)=>n+c.pageCount,0)};
    for(let i=0;i<comics.length;i++) {
      counts.paths=[];await this.addPages(zip,comics[i],"pages/"+i+"/",counts);
      manifest.comics.push({...comics[i],pages:counts.paths});
    }
    zip.file("nth-shelf-backup.json",JSON.stringify(manifest));
    const blob=await zip.generateAsync({type:"blob",compression:"STORE"},m=>this.progress(70+m.percent*.2,"Packing full backup…"));
    return this.save(blob,"Nth-Shelf-"+new Date().toISOString().slice(0,10)+".nthshelf");
  });},
  downloadCollection(id) {return this.run("Downloading collection",async()=>{
    const collection=await LongboxDB.getCollection(id);
    const comics=(await LongboxDB.getAllComics()).filter(c=>c.collectionId===id).sort((a,b)=>(a.issueNumber||0)-(b.issueNumber||0));
    if(!comics.length)throw new Error("This collection is empty.");
    const zip=new JSZip(),counts={bytes:0,done:0,total:comics.reduce((n,c)=>n+c.pageCount,0)};
    for(let i=0;i<comics.length;i++) {
      const issue=new JSZip();
      await this.addPages(issue,comics[i],"",counts);
      zip.file(String(i+1).padStart(3,"0")+"-"+this.safeName(comics[i].title)+".cbz",
        await issue.generateAsync({type:"blob",compression:"STORE"}),{compression:"STORE"});
    }
    const blob=await zip.generateAsync({type:"blob",compression:"STORE"},m=>this.progress(70+m.percent*.2,"Packing collection…"));
    return this.save(blob,this.safeName(collection?.title)+".zip");
  });},
  restore(file,legacyRestore) {return this.run("Restoring Nth Shelf",async()=>{
    if(file.size>this.limit)throw new Error("This backup exceeds the 512 MiB safety limit.");
    if(/\.json$/i.test(file.name)) {
      const legacy=JSON.parse(await file.text());
      if(legacy?.app!=="longbox" || !Array.isArray(legacy.comics))throw new Error("Not a supported legacy progress backup.");
      this.progress(20,"Restoring legacy progress and bookmarks…");
      await legacyRestore(file);
      return "Legacy restore finished. See the restore summary for matched and missing comics.";
    }
    const zip=await JSZip.loadAsync(file);
    const declared=Object.values(zip.files).reduce((n,f)=>n+(f._data?.uncompressedSize||0),0);
    if(declared>this.limit)throw new Error("Expanded backup exceeds the safety limit.");
    const manifestFile=zip.file("nth-shelf-backup.json");
    if(!manifestFile || manifestFile._data.uncompressedSize>8*1024*1024)throw new Error("Not a supported Nth Shelf full backup.");
    const data=JSON.parse(await manifestFile.async("string"));
    if(data.app!=="nth-shelf"||data.version!==2||!Array.isArray(data.comics)||!Array.isArray(data.collections))throw new Error("Unsupported backup format.");
    if(data.comics.length>2000||data.collections.length>2000)throw new Error("Backup contains too many entries.");
    const collections=[],comics=[],pages=[],ids=new Map();
    for(const c of data.collections) {
      if(!c||typeof c.id!=="string"||typeof c.title!=="string"||ids.has(c.id))throw new Error("Invalid collection data.");
      const id="restore_"+crypto.randomUUID();ids.set(c.id,id);
      collections.push({id,title:c.title,createdAt:Date.now()});
    }
    const total=data.comics.reduce((n,c)=>n+(Array.isArray(c.pages)?c.pages.length:0),0);
    if(total>50000)throw new Error("Backup contains too many pages.");
    let bytes=0;
    for(const c of data.comics) {
      if(!c||typeof c.title!=="string"||!Number.isInteger(c.pageCount)||c.pageCount<1||!Array.isArray(c.pages)||c.pages.length!==c.pageCount)throw new Error("Invalid comic metadata.");
      const id="restore_"+crypto.randomUUID();
      for(let i=0;i<c.pages.length;i++) {
        const p=c.pages[i],entry=zip.file(p.path);
        if(!entry||!/^pages\//.test(p.path)||!/^image\/(jpeg|png|gif|webp|avif)$/.test(p.type))throw new Error("Missing or invalid page in backup.");
        const buffer=await entry.async("uint8array");bytes+=buffer.length;
        if(bytes>this.limit)throw new Error("Expanded backup exceeds the safety limit.");
        const blob=new Blob([buffer],{type:p.type});
        // Verify image bytes before committing any new database records.
        const bitmap=await createImageBitmap(blob);bitmap.close();
        pages.push({key:id+":"+i,comicId:id,index:i,blob});
        this.progress(5+80*pages.length/Math.max(1,total),"Checking "+c.title+" · "+(i+1)+"/"+c.pageCount);
      }
      comics.push({id,title:c.title,pageCount:c.pageCount,
        coverUrl:await blobToDataUrl(await makeThumbnail(pages[pages.length-c.pageCount].blob)),
        lastPage:Math.max(0,Math.min(c.pageCount-1,Number(c.lastPage)||0)),
        bookmarks:Array.isArray(c.bookmarks)?c.bookmarks:[],
        readMode:["single","two-page","scroll","manga","webcomic"].includes(c.readMode)?c.readMode:"single",
        theme:["dark","sepia","light"].includes(c.theme)?c.theme:"dark",
        collectionId:ids.get(c.collectionId)||null,issueNumber:c.issueNumber||null,seriesKey:c.seriesKey||null,addedAt:Date.now()});
    }
    this.progress(90,"Saving verified pages. Do not close the app…");
    const db=await openDB(),t=db.transaction(["comics","collections","pages"],"readwrite");
    const done=txDone(t);
    try {
      for(const row of collections)t.objectStore("collections").add(row);
      for(const row of comics)t.objectStore("comics").add(row);
      for(const row of pages)t.objectStore("pages").add(row);
    } catch(error) {t.abort();await done.catch(()=>{});throw error;}
    await done;
    try {localStorage.setItem(STORAGE_MARKER_KEY,JSON.stringify({hasLibrary:true,updatedAt:Date.now()}));}catch(_){}
    await Library.showRoot();
    return "Restored "+comics.length+" comics. Existing comics were kept unchanged.";
  });}
};
