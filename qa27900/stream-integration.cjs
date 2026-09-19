const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN||undefined,args:['--no-sandbox']});
 try {
  const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8765');await page.waitForFunction(()=>window.ShelfTransfer?.dialog);
  const result=await page.evaluate(async()=>{
   await ShelfStream.ready;ShelfGuide.request=()=>{};ShelfGuide.finish();
   const check=(ok,message)=>{if(!ok)throw Error(message+': '+ShelfTransfer.dialog.textContent);};
   const canvas=document.createElement('canvas');canvas.width=20;canvas.height=30;canvas.getContext('2d').fillRect(0,0,20,30);
   const blob=await new Promise(r=>canvas.toBlob(r)),image=new Uint8Array(await blob.arrayBuffer());
   await LongboxDB.addCollection({id:'source-col',title:'My Collection'});
   await LongboxDB.addComic({id:'source',title:'My comic',collectionId:'source-col',pageCount:3,lastPage:2,bookmarks:[1],readMode:'single'});
   for(let i=0;i<3;i++)await LongboxDB.putPage('source',i,blob);
   const originalZip=new JSZip();originalZip.file('02.png',image);originalZip.file('01.png',image);
   originalZip.file('extras.bin',new Uint8Array(2500000).fill(123));
   const original=new File([await originalZip.generateAsync({type:'blob',compression:'STORE'})],'Original.cbz');
   const originalId=await Library.importCbz(original);
   check((await LongboxDB.getSource(originalId)).blob.size===original.size,'Importer did not retain original');
   let saved=[],entry,parts,reading=[],offset=0,mode='normal',reads=0,book=null,bookPath,bookKey,entryKey;
   let readBinaryCalls=0,readTextCalls=0;
   let nested=[],nestedEntry,sourceEntry,sourceKey,binary=true,inflight=0,maxInflight=0,binaryCalls=0,cachedCalls=0;
   const cache=new Map();
   const encode=bytes=>{let s='';for(let i=0;i<bytes.length;i+=8192)s+=String.fromCharCode(...bytes.subarray(i,i+8192));return btoa(s);};
   // Mock only native transport. Real import, IndexedDB, ZIP contents, metadata and restore execute unchanged.
   window.NthShelfNative={streaming:true,async binaryChunk(bytes){
    binaryCalls++;inflight++;maxInflight=Math.max(maxInflight,inflight);parts.push(bytes.slice());
    await new Promise(r=>setTimeout(r,3));inflight--;
   },async request(action,v={}){
    if(action==='archiveCapabilities')return {binary,sources:true};
    if(action==='archiveCacheInfo')return cache.has(v.key)?{size:cache.get(v.key).size}:null;
    if(action==='archiveDropCache'){cache.delete(v.key);return '';}
    if(action==='archiveCreate'){saved=[];return '';}
    if(action==='archiveCachedSource'){cachedCalls++;saved.push({name:v.name,blob:cache.get(v.key)});return '';}
    if(action==='archiveBookBegin'){book=new JSZip();bookPath=v.name;bookKey=v.key;return '';}
    if(action==='archiveBookEnd'){const b=await book.generateAsync({type:'blob',compression:'STORE'});saved.push({name:bookPath,blob:b});cache.set(bookKey,b);book=null;return '';}
    if(action==='archiveEntry'){entry=v.name;parts=[];entryKey=v.key;return '';}
    if(action==='archiveChunk'){parts.push(Uint8Array.from(atob(v.data),c=>c.charCodeAt(0)));return '';}
    if(action==='archiveEndEntry'){const b=new Blob(parts);if(book)book.file(entry,await b.arrayBuffer());else saved.push({name:entry,blob:b});if(entryKey)cache.set(entryKey,b);return '';}
    if(action==='archiveFinish')return 'Saved and verified';
    if(action==='archiveCancel'||action==='archiveClose'){nestedEntry=null;sourceEntry=null;return '';}
    if(action==='archiveOpen'){
     reading=saved.filter(e=>mode!=='missing'||!e.name.startsWith('sources/')).slice();reads=0;
     return {manifest:await saved.find(e=>e.name==='nth-shelf-backup.json').blob.text()};
    }
    if(action==='archiveNext'){entry=reading.shift();offset=0;return entry?{name:entry.name}:null;}
    if(action==='archiveSourceOpen'){
     sourceEntry=entry;sourceKey=v.key;offset=0;
     if(v.nested){const zip=await JSZip.loadAsync(sourceEntry.blob);nested=Object.values(zip.files);}
     return '';
    }
    if(action==='archiveSourceNext'){
     const e=nested.shift();offset=0;
     if(!e){cache.set(sourceKey,sourceEntry.blob);sourceEntry=null;nestedEntry=null;return null;}
     nestedEntry={name:e.name,blob:await e.async('blob')};return {name:e.name,directory:e.dir};
    }
    if(action==='archiveRead'){
     if(mode==='cancel'&&++reads===4)ShelfTransfer.cancelRequested=true;
     const b=(nestedEntry||sourceEntry||entry).blob;
     if(offset>=b.size){if(sourceEntry&&!nestedEntry){cache.set(sourceKey,b);sourceEntry=null;}return null;}
     const bytes=new Uint8Array(await b.slice(offset,offset+1048576).arrayBuffer());offset+=bytes.length;if(v.binary){readBinaryCalls++;return bytes;}readTextCalls++;return encode(bytes);
    }
    throw Error('Unexpected action '+action);
   }};
   await ShelfTransfer.backup();
   check(saved.length===3&&ShelfTransfer.dialog.querySelector('h2').textContent!=='Transfer not completed','Export failed');
   check(maxInflight===2,'Binary pipeline not exercised');
   let manifest=JSON.parse(await saved.find(e=>e.name==='nth-shelf-backup.json').blob.text());
   check(manifest.version===3&&manifest.comics.every(c=>c.source&&!c.pages),'Source format missing');
   const originalRecord=manifest.comics.find(c=>c.id===originalId);
   check(await cache.get(originalId).text()===await original.text(),'Original bytes changed');
   check(originalRecord.source.pages.join(',')==='01.png,02.png','Page order lost');
   check(!(await LongboxDB.getSource(originalId)).blob,'Duplicate source blob retained');
   const firstSaved=saved.slice();ShelfTransfer.dismiss();
   const before=binaryCalls;await ShelfTransfer.backup();
   check(cachedCalls===2&&binaryCalls===before+1,'Warm backup transferred pages instead of native source copies');
   ShelfTransfer.dismiss();
   // Base64 fallback and missing native cache must reconstruct safely.
   binary=false;cache.delete('source');await ShelfTransfer.backup();
   check(ShelfTransfer.dialog.querySelector('h2').textContent!=='Transfer not completed','Legacy bridge fallback failed');ShelfTransfer.dismiss();
   saved=firstSaved;
   for(const bad of ['missing','cancel']) {
    mode=bad;await ShelfTransfer.openRestore();
    check((await LongboxDB.getAllComics()).length===2,'Failed restore published comics');
    const db=await openDB(),t=db.transaction('pages','readonly');
    check(await reqResult(t.objectStore('pages').count())===5,'Failed restore left staged pages');
    check(cache.size===2,'Failed restore left native source cache');ShelfTransfer.dismiss();
   }
   mode='normal';binary=true;await ShelfTransfer.openRestore();
   check(readBinaryCalls>0,'Binary restore path not exercised');
   let comics=await LongboxDB.getAllComics();check(comics.length===4,'Restore did not publish comics');
   const copy=comics.find(c=>c.title==='My comic'&&c.id!=='source');
   check(copy.lastPage===2&&copy.bookmarks[0]===1&&copy.collectionId!=='source-col','Metadata lost');
   for(let i=0;i<3;i++)check(await (await LongboxDB.getPage(copy.id,i)).text()===await blob.text(),'Page bytes changed');
   check(!!(await LongboxDB.getSource(copy.id))&&cache.has(copy.id),'Restored source not retained');ShelfTransfer.dismiss();
   // Old v2 full-library backups must still restore.
   const legacy={app:'nth-shelf',version:2,collections:[],comics:[{id:'old',title:'Legacy',pageCount:1,pages:[{path:'pages/0/1.png',type:'image/png',size:blob.size}]}]};
   saved=[{name:'pages/0/1.png',blob},{name:'nth-shelf-backup.json',blob:new Blob([JSON.stringify(legacy)])}];
   binary=false;await ShelfTransfer.openRestore();check(readTextCalls>0,'Base64 restore fallback missing');check((await LongboxDB.getAllComics()).length===5,'v2 restore failed');ShelfTransfer.dismiss();
   // Startup recovery removes incomplete pages and native sources together.
   await LongboxDB.putPage('orphan',0,blob);cache.set('orphan',blob);
   const db=await openDB(),t=db.transaction('meta','readwrite');t.objectStore('meta').put({key:ShelfStream.marker,ids:['orphan']});await txDone(t);
   await ShelfStream.recover();check(!await LongboxDB.getPage('orphan',0)&&!cache.has('orphan'),'Crash recovery left data');
   return {backup:'whole original CBZ + rebuilt CBZ',binary:'two bounded in-flight chunks, exact bytes',warm:'zero page/source bytes cross bridge',restore:'v3 and legacy v2, metadata + page byte parity',failure:'rollback',cancel:'rollback',interrupted:'startup cleanup'};
  });
  assert.deepEqual(errors,[]);console.log(JSON.stringify(result));
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
