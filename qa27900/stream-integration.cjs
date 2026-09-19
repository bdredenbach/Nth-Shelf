const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN||undefined,args:['--no-sandbox']});
 try {
  const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8765');await page.waitForFunction(()=>window.ShelfTransfer?.dialog);
  const result=await page.evaluate(async()=>{
   await ShelfStream.ready;
   ShelfGuide.request=()=>{};ShelfGuide.finish();
   const canvas=document.createElement('canvas');canvas.width=20;canvas.height=30;canvas.getContext('2d').fillRect(0,0,20,30);
   const blob=await new Promise(r=>canvas.toBlob(r));
   await LongboxDB.addCollection({id:'source-col',title:'My Collection'});
   await LongboxDB.addComic({id:'source',title:'My comic',collectionId:'source-col',pageCount:3,lastPage:2,bookmarks:[1],readMode:'single'});
   for(let i=0;i<3;i++)await LongboxDB.putPage('source',i,blob);
   let saved=[],entry,parts,reading=[],offset=0,mode='normal',reads=0;
   // Only the transport is mocked; exercise the shipped backup/restore, dialogs and real IndexedDB.
   window.NthShelfNative={streaming:true,async request(action,v={}){
    if(action==='archiveCreate'){saved=[];return '';}
    if(action==='archiveEntry'){entry=v.name;parts=[];return '';}
    if(action==='archiveChunk'){parts.push(Uint8Array.from(atob(v.data),c=>c.charCodeAt(0)));return '';}
    if(action==='archiveEndEntry'){saved.push({name:entry,blob:new Blob(parts)});return '';}
    if(action==='archiveFinish')return 'Saved and verified';
    if(action==='archiveCancel'||action==='archiveClose')return '';
    if(action==='archiveOpen'){
     reading=saved.filter(e=>mode!=='missing'||e.name!=='pages/0/000003.png').slice();
     reads=0;
     return {manifest:await saved.find(e=>e.name==='nth-shelf-backup.json').blob.text()};
    }
    if(action==='archiveNext'){entry=reading.shift();offset=0;return entry?{name:entry.name}:null;}
    if(action==='archiveRead'){
     if(mode==='cancel'&&++reads===4){ShelfTransfer.cancelRequested=true;}
     if(offset>=entry.blob.size)return null;
     const b=new Uint8Array(await entry.blob.slice(offset,offset+196608).arrayBuffer());offset+=b.length;
     return btoa(String.fromCharCode(...b));
    }
    throw Error('Unexpected action '+action);
   }};
   await ShelfTransfer.backup();
   if(saved.length!==4||ShelfTransfer.dialog.querySelector('h2').textContent==='Transfer not completed')throw Error('Export failed');
   ShelfTransfer.dismiss();
   for(const bad of ['missing','cancel']) {
    mode=bad;await ShelfTransfer.openRestore();
    if((await LongboxDB.getAllComics()).length!==1)throw Error('Failed restore published comics');
    const db=await openDB(),t=db.transaction(['pages','meta'],'readonly');
    const count=await reqResult(t.objectStore('pages').count());
    if(count!==3)throw Error('Failed restore left staged pages');
    ShelfTransfer.dismiss();
   }
   mode='normal';await ShelfTransfer.openRestore();
   const comics=await LongboxDB.getAllComics();
   if(comics.length!==2)throw Error('Restore did not publish comic: '+ShelfTransfer.dialog.textContent);
   const copy=comics.find(c=>c.id!=='source');
   if(copy.lastPage!==2||copy.bookmarks[0]!==1||copy.collectionId==='source-col')throw Error('Metadata lost');
   for(let i=0;i<3;i++) {
    const restored=await LongboxDB.getPage(copy.id,i);
    if(!restored||restored.size!==blob.size||await restored.text()!==await blob.text())throw Error('Page data lost');
   }
   // Simulate interrupted restore, then startup recovery without touching published comics.
   await LongboxDB.putPage('orphan',0,blob);
   const db=await openDB(),t=db.transaction('meta','readwrite');
   t.objectStore('meta').put({key:ShelfStream.marker,ids:['orphan']});await txDone(t);
   await ShelfStream.recover();
   if(await LongboxDB.getPage('orphan',0))throw Error('Crash recovery left orphan pages');
   if((await LongboxDB.getAllComics()).length!==2)throw Error('Crash recovery removed books');
   return {backup:'full metadata and pages',restore:'byte parity',failure:'rollback',cancel:'rollback',interrupted:'startup cleanup'};
  });
  assert.deepEqual(errors,[]);console.log(JSON.stringify(result));
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
