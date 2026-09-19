const { chromium } = require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES ? process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES + '/playwright' : 'playwright');
const assert = require('node:assert/strict');
(async () => {
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN||undefined,args:['--no-sandbox']});
 try {
  const context=await browser.newContext({viewport:{width:412,height:915},hasTouch:true,isMobile:true,acceptDownloads:true});
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8765');
  await page.waitForFunction(()=>window.ShelfTransfer?.dialog && window.ShelfGuide?.dialog);
  await page.waitForTimeout(1500);
  assert.equal(await page.evaluate(()=>ShelfGuide.active?.id),'library');
  assert.equal(await page.locator('.guide-focus').isVisible(),true);
  assert.match(await page.locator('.guide-copy').innerText(),/CBZ/);
  await page.screenshot({path:'/tmp/nth-shelf-guide-import.png'});
  await page.locator('.guide-next').click();
  assert.match(await page.locator('.guide-copy').innerText(),/Restore/);
  const spotlight=await page.locator('.guide-focus').boundingBox(),restoreButton=await page.locator('#empty-restore').boundingBox();
  assert.ok(spotlight.x<=restoreButton.x && spotlight.y<=restoreButton.y && spotlight.y+spotlight.height>=restoreButton.y+restoreButton.height,'Restore spotlight does not match control');
  await page.screenshot({path:'/tmp/nth-shelf-guide-restore.png'});
  await page.locator('.guide-back').click();
  assert.equal(await page.evaluate(()=>ShelfGuide.active.index),0);
  await page.evaluate(()=>ShelfGuide.finish());
  await page.evaluate(()=>{window.pendingTransfer=ShelfTransfer.run('Transfer check',()=>new Promise(r=>window.finishTransfer=r));});
  await page.waitForFunction(()=>typeof window.finishTransfer==='function');
  assert.equal(await page.locator('.transfer-dialog .primary').isVisible(),false);
  await page.evaluate(async()=>{window.finishTransfer('Finished');await window.pendingTransfer;});
  assert.equal(await page.locator('.transfer-dialog .primary').isVisible(),true);
  await page.evaluate(()=>ShelfTransfer.dismiss());
  await page.evaluate(()=>ShelfTransfer.run('Failure check',async()=>{throw Error('Expected test failure');}));
  assert.equal(await page.locator('.transfer-dialog .primary').isVisible(),true);
  await page.evaluate(()=>ShelfTransfer.dismiss());
  // Welcome actions stay visible and open the established file pickers.
  for(const viewport of [{width:412,height:915},{width:360,height:640},{width:915,height:412}]) {
   await page.setViewportSize(viewport);
   const buttons=await page.locator('.empty-actions').boundingBox();
   assert.ok(buttons && buttons.y>=0 && buttons.y+buttons.height<=viewport.height-8,'Welcome actions clipped');
   const art=await page.locator('.empty-artwork').boundingBox();
   assert.ok(art.y+art.height<=buttons.y,'Welcome art overlaps actions');
   assert.ok(await page.locator('.empty-artwork img').evaluate(img=>img.complete&&img.naturalWidth>0),'Welcome image missing');
   await page.screenshot({path:'/tmp/nth-shelf-welcome-'+viewport.width+'.png'});
  }
  await page.setViewportSize({width:412,height:915});
  for(const [selector,inputId] of [['#empty-import-hit','import-input'],['#empty-restore','restore-input']]) {
   const chooser=page.waitForEvent('filechooser');await page.locator(selector).click();
   assert.equal(await (await chooser).element().getAttribute('id'),inputId);
  }
  await page.screenshot({path:'/tmp/nth-shelf-empty-blend.png'});
  await page.evaluate(async()=>{
   // UI/transfer fixture, not a frame-detection benchmark.
   Reader.loadPanelsForCurrentPage=async()=>{};Reader.preparePanelMaps=()=>{};
   const canvas=document.createElement('canvas');canvas.width=600;canvas.height=900;
   const ctx=canvas.getContext('2d');
   await LongboxDB.addCollection({id:'fixture-col',title:'Test Collection',createdAt:Date.now()});
   for(let j=0;j<2;j++){
    let cover;
    for(let i=0;i<4;i++){
     ctx.fillStyle=['#c72c36','#206788','#4a8845','#e0a340'][i];ctx.fillRect(0,0,600,900);
     ctx.fillStyle='white';ctx.font='60px sans-serif';ctx.fillText('Issue '+j+' Page '+i,35,100);
     const blob=await new Promise(r=>canvas.toBlob(r,'image/png'));cover=canvas.toDataURL();
     await LongboxDB.putPage('fixture-'+j,i,blob);
    }
    await LongboxDB.addComic({id:'fixture-'+j,title:'Issue '+j,pageCount:4,lastPage:0,bookmarks:[1],coverUrl:cover,
      collectionId:'fixture-col',issueNumber:j,addedAt:Date.now(),readMode:'single',theme:'dark'});
   }
   await Library.refresh();
  });
  const sort=await page.locator('#sort-direction-btn').boundingBox(),recent=await page.locator('#sort-row [data-sort="recent"]').boundingBox();
  assert.ok(Math.abs(sort.x-recent.x)<2 && sort.y>recent.y+recent.height,'Direction belongs beneath Recent');
  await page.screenshot({path:'/tmp/nth-shelf-sort.png'});
  await page.evaluate(async()=>{
   await LongboxApp.openReader('fixture-0');
  });
  await page.waitForTimeout(1400);
  assert.equal(await page.evaluate(()=>ShelfGuide.active?.id),'single');
  const pageFocus=await page.locator('.guide-focus').boundingBox();
  const comicBox=await page.evaluate(()=>{const r=Reader.turnPageMode.book.pageNode().querySelector('img').getBoundingClientRect();return {right:r.right,bottom:r.bottom};});
  assert.ok(Math.abs(pageFocus.y+pageFocus.height-comicBox.bottom)<=6,'Corner tutorial must highlight the comic, not navigation');
  await page.screenshot({path:'/tmp/nth-shelf-guide-page-turn.png'});
  await page.locator('.guide-next').click();
  assert.match(await page.locator('.guide-copy').innerText(),/frame/);
  await page.evaluate(()=>ShelfGuide.finish());
  assert.equal(await page.evaluate(()=>Reader.turnPageMode.book instanceof NthPageDeck),true);
  await page.evaluate(()=>Reader.next());
  await page.waitForFunction(()=>Reader.index===1 && !Reader.turnPageMode.book.motion);
  await page.evaluate(()=>Reader.prev());
  await page.waitForFunction(()=>Reader.index===0 && !Reader.turnPageMode.book.motion);
  assert.equal(await page.evaluate(()=>Reader.getPanelImageContext()?.pageNumber),1);
  const cdp=await context.newCDPSession(page);
  // The controls expire after five seconds, including after a first-use guide.
  assert.equal(await page.evaluate(()=>Reader.chromeVisible),true);
  await page.waitForTimeout(4200);
  assert.equal(await page.evaluate(()=>Reader.chromeVisible),true);
  await page.waitForTimeout(1000);
  assert.equal(await page.evaluate(()=>Reader.chromeVisible),false);
  const navSwipe=async(side)=>{
   const r=await page.locator('#reader-stage').boundingBox();
   const x=r.x+r.width/2,y=side==='top'?r.y+35:r.y+r.height-35,sign=side==='top'?1:-1;
   await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y,id:1}]});
   for(const d of [12,30,60])await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:y+sign*d,id:1}]});
   await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
   assert.equal(await page.evaluate(()=>Reader.chromeVisible),true);
   assert.equal(await page.evaluate(()=>Reader.index),0);
   assert.equal(await page.evaluate(()=>Reader.focusMode),null);
  };
  await navSwipe('bottom');
  await page.waitForTimeout(4200);
  assert.equal(await page.evaluate(()=>Reader.chromeVisible),true);
  await navSwipe('top'); // Refresh the existing timer, rather than toggling off.
  await page.waitForTimeout(4200);
  assert.equal(await page.evaluate(()=>Reader.chromeVisible),true);
  await page.waitForTimeout(1000);
  assert.equal(await page.evaluate(()=>Reader.chromeVisible),false);
  const slowDrag=async(corner,commit)=>{
   const b=await page.evaluate(()=>{
    const r=Reader.turnPageMode.book.root.getBoundingClientRect(),p=Reader.turnPageMode.book.pageBounds();
    return {x:r.x,y:r.y,width:r.width,p};
   });
   const bottom=corner === "bottom";
   const x=b.x+b.p.x+b.p.width-18,y=b.y+b.p.y+(bottom?b.p.height-18:corner?18:b.p.height/2);
   await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y,id:1}]});
   for(const d of [4,8,12,18]){
    await page.waitForTimeout(140);
    await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x-d,y:bottom?y-d*1.8:y,id:1}]});
   }
   await page.waitForFunction(()=>Reader.turnPageMode.book.motion?.interactive && Reader.turnPageMode.book.motion?.curl.ready);
   const before=await page.evaluate(()=>Reader.turnPageMode.book.motion.progress);
   await page.waitForTimeout(600); // The fold must remain attached during a slow hold.
   const distance=commit?b.width*.45:60;
   await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x-distance,y:bottom?y-distance*1.2:y,id:1}]});
   assert.ok(await page.evaluate(()=>Reader.turnPageMode.book.motion.progress)>before);
   assert.equal(await page.evaluate(()=>Reader.focusMode),null);
   const index=await page.evaluate(()=>Reader.index);
   await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
   await page.waitForFunction(()=>!Reader.turnPageMode.book.motion);
   assert.equal(await page.evaluate(()=>Reader.index),index+(commit?1:0));
  };
  await slowDrag(true,false);
  await slowDrag(false,false);
  await page.evaluate(()=>{Reader.turnPageMode.book.root.style.width='300px';Reader.turnPageMode.book.size(300,Reader.turnPageMode.book.root.clientHeight);});
  await slowDrag('bottom',false);
  await slowDrag('bottom',true);
  await page.evaluate(()=>Reader.prev());
  await page.waitForFunction(()=>Reader.index===0&&!Reader.turnPageMode.book.motion);
  await page.evaluate(()=>Reader.turnPageMode.resize());
  const pinch=async()=>{
   const b=await page.locator('#reader-stage').boundingBox(),x=b.x+b.width/2,y=b.y+b.height/2;
   const points=d=>[{x:x-d,y,id:1},{x:x+d,y,id:2}];
   await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:x-40,y,id:1}]});
   await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:points(40)});
   for(const d of [50,65,80])await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:points(d)});
   await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
   assert.ok(await page.evaluate(()=>Reader.scale)>1.8,'pinch should zoom');
   assert.equal(await page.evaluate(()=>Reader.index),0,'pinch must not turn a page');
  };
  await pinch();
  await page.evaluate(()=>Reader.resetZoom({animate:false}));
  await page.evaluate(async()=>{
   window.immersiveCalls=[];
   window.NthShelfNative={setImmersive:async value=>immersiveCalls.push(value)};
   await Reader.setMode('two-page');
  });
  await page.waitForTimeout(1500);
  await page.evaluate(()=>ShelfGuide.finish());
  assert.deepEqual(await page.evaluate(()=>immersiveCalls),[true]);
  await pinch();
  await page.evaluate(async()=>{Reader.resetZoom({animate:false});await Reader.setMode('single');Reader.close();delete window.NthShelfNative;});
  assert.equal(await page.evaluate(()=>immersiveCalls.at(-1)),false);
  await page.evaluate(()=>Library.toggleShelfMode());
  await page.waitForTimeout(1400);
  assert.equal(await page.evaluate(()=>ShelfGuide.active?.id),'shelf');
  await page.evaluate(()=>ShelfGuide.finish());
  await page.screenshot({path:'/tmp/nth-shelf-raised.png'});
  await page.evaluate(()=>Library.closeShelfMode());
  const results=await page.evaluate(async()=>{
   clearTimeout(ShelfGuide.timer);
   window.saved=[];
   ShelfTransfer.save=async(blob,name)=>{saved.push({blob,name});return 'Captured for round-trip test';};
   await ShelfTransfer.backup();
   if(saved.length!==1)throw Error(ShelfTransfer.dialog.textContent);
   ShelfTransfer.dismiss();
   const backup=saved[0],before=await LongboxDB.getAllComics();
   await ShelfTransfer.restore(new File([backup.blob],backup.name),()=>{throw Error('Unexpected legacy route');});
   const after=await LongboxDB.getAllComics();
   if(after.length!==4)throw Error(ShelfTransfer.dialog.textContent);
   for(const old of before){
    const restored=after.find(c=>c.title===old.title&&c.id!==old.id);
    if(!restored||restored.bookmarks[0]!==1)throw Error('Metadata mismatch');
    for(let i=0;i<old.pageCount;i++){
     const a=new Uint8Array(await (await LongboxDB.getPage(old.id,i)).arrayBuffer());
     const b=new Uint8Array(await (await LongboxDB.getPage(restored.id,i)).arrayBuffer());
     if(a.length!==b.length||!a.every((v,k)=>v===b[k]))throw Error('Page bytes changed');
    }
   }
   ShelfTransfer.dismiss();
   await ShelfTransfer.downloadCollection('fixture-col');
   if(saved.length!==2)throw Error(ShelfTransfer.dialog.textContent);
   const collection=await JSZip.loadAsync(saved[1].blob);
   const files=Object.keys(collection.files).filter(f=>!collection.files[f].dir);
   if(files.length!==2||!files.every(f=>f.endsWith('.cbz')))throw Error('Bad collection download');
   for(const name of files) {
    const issue=await JSZip.loadAsync(await collection.file(name).async('blob'));
    if(Object.keys(issue.files).length!==4)throw Error('Missing CBZ pages');
   }
   ShelfTransfer.dismiss();
   const broken=await JSZip.loadAsync(backup.blob);broken.remove('pages/0/000002.png');
   const invalid=await broken.generateAsync({type:'blob'});
   await ShelfTransfer.restore(new File([invalid],'broken.nthshelf'),()=>{});
   if((await LongboxDB.getAllComics()).length!==4)throw Error('Invalid restore changed library');
   if(!ShelfTransfer.dialog.textContent.includes('Transfer not completed'))throw Error('Corruption not reported');
   ShelfTransfer.dismiss();
   return {restoredComics:after.length-before.length,verifiedPages:8,collectionFiles:files,invalidRestore:'rejected before commit'};
  });
  await page.evaluate(()=>ShelfGuide.licenses());
  await page.waitForFunction(()=>document.querySelector('.license-dialog pre')?.textContent.includes('JSZip'));
  assert.deepEqual(errors,[]);
  console.log(JSON.stringify({pageDeck:'next/previous passed',pinch:'single and two-page passed',nativeFullscreen:'entry and exit requested',guides:'first use and shelf passed',...results,errors},null,2));
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
