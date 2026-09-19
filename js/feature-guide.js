/* Contextual, highlighted tours. Presentation only: never import or alter a book. */
window.ShelfGuide = {
  key:'nth-shelf-guides-v2',active:null,seen:{},
  steps(id) {
    const step=(target,title,copy,tip)=>({target,title,copy,tip});
    const controls=[
      step('#page-slider','Jump to another page','Move this slider to choose a page without turning through every page in between. The number beside it shows your position.','Your reading position is saved as you read.'),
      step('#reader-bookmark','Mark a page to revisit','Tap this bookmark button to save the current page. Tap it again to remove the bookmark. Find bookmarked pages through Search Mode on your shelf.'),
      step('.reader-mode-row, [data-mode="single"]','Choose how you read','Page shows one page. Two Page shows a spread. Scroll moves horizontally, Manga reads right-to-left, and Webcomic stacks pages vertically.','Each mode has its own short introduction the first time you enter it.'),
      step('#reader-help','Bring this guide back','Tap ? to open the Reader Guide, then choose Replay this area’s tutorial. Licenses & Credits are available there too.','When reading, tap the middle for navigation. In Page mode, swipe inward from the top or bottom to show it for five seconds.'),
      step('#reader-back','Return to your shelf','Tap this arrow or use Android’s Back button to leave the reader. Your saved page will be ready when you open the comic again.')];
    switch(id) {
      case 'library':
        if(document.getElementById('library-view').classList.contains('empty-library'))return [
          step('#empty-import-hit','Start with your comics','Tap Import to choose comic archives from your device. You can select CBZ, ZIP, CBT, CB7, 7Z, CBR or RAR files. Their covers will appear on your shelf.','Choose the comic archive itself; you do not need to wrap a CBZ in another ZIP.'),
          step('#empty-restore','Already have a backup?','Tap Restore and choose your Nth Shelf full-library backup. It brings back your comics, collections, bookmarks and reading positions.','Keep Nth Shelf open while restoring. The progress window shows the comic and page being read.'),
          step('.empty-actions','Your library, your choice','Finish this guide, then choose Import for new comics or Restore for a saved library. Your library is stored on this device.','You can back up the whole library from the shelf after adding comics.')];
        return [
          step('#fab-import','Add more comics','Use + Import whenever you want to add comic archives. You can select several files in one visit to the picker.'),
          step('#comic-grid .comic-card','Preview, then open','Tap a cover once to lift it from the shelf. Tap that cover again to open the comic or collection.','A collection opens its issue list so you can choose which issue to read.'),
          step('#comic-grid .card-menu-btn','Options for this item','Tap the three dots on a cover for its actions. On a collection, Download collection exports its issues in a ZIP.','The menu label tells you whether you are acting on a comic or a collection.'),
          step('#sort-row','Find the order you want','Choose Recent, Title, Unread, In progress or Added to reorder your shelf. The Asc/Desc button underneath reverses that order.'),
          step('#search-mode-btn','Find a comic or a bookmark','Search Mode opens a cover browser with search and bookmarked-page views. Use Done to return to the grid.'),
          step('#new-collection-btn','Keep related issues together','Use + Collection to create a collection, or Detect Series to group matching issues. Open a collection’s cover to browse its comics.'),
          step('#shelf-mode-btn','Browse on the cinematic shelf','Shelf Mode shows covers in a swipeable display. Swipe to bring a comic to the center, then tap the center cover to read.'),
          step('#backup-btn','Protect your whole library','Backup opens the full-library backup and restore options. Save a backup somewhere you can find again.','A backup includes comics, collections, bookmarks and reading progress. Restore adds copies and keeps existing books.')];
      case 'collection':return [
        step('#collection-grid .comic-card','Choose an issue','Tap an issue cover once to lift it, then tap again to read. Your last reading position is remembered.'),
        step('#collection-sort-row','Put issues in order','Choose a sort option, then use Asc/Desc to reverse the list. This changes browsing order, not the comic pages.'),
        step('#collection-menu','Manage this collection','Use the three-dot menu for collection actions. On the main shelf, the collection cover’s menu also offers Download collection.'),
        step('#collection-back','Back to all your comics','Tap this arrow to return to the main shelf. The collection and your reading progress stay saved.')];
      case 'shelf':return [
        step('#shelf-mode-track','Browse your cinematic shelf','Swipe left or right to bring another comic into the center. The title and counter tell you which comic is selected.'),
        step('.shelf-mode-card.center','Open the center comic','Tap the center cover to read it. Side covers let you browse toward another comic.'),
        step('#shelf-mode-close','Return to the grid','Tap × or use Android’s Back button to return to your normal shelf.')];
      case 'search':return [
        step('#library-search','Search your shelf','Type part of a title to narrow the cover browser. Clear the search to see the available comics again.'),
        step('#search-bookmarks-btn','Return to a saved page','Use Bookmarks to browse bookmarked pages. Choose a saved page to resume reading there.'),
        step('#shelf-carousel','Browse the results','Swipe through covers or use the arrows to move through the results.'),
        step('#search-mode-close','Go back to the shelf','Use Done to close Search Mode and return to the comic grid.')];
      case 'single':return [
        {...step('#page-viewport','Turn from a page corner','Drag inward from the upper-right or lower-right corner of the comic to turn forward. Start on the comic itself and keep your finger down to control the fold.','A slow drag should reveal the fold as you move. Use the left edge to go back.'),zone:'corner'},
        step('#page-viewport','Look closer at a frame','Tap inside a panel to enlarge that whole frame. Double-tap the focused frame to return to the page.','You can also pinch with two fingers to zoom and drag while zoomed to pan.'),
        step('#bubble-zoom-toggle','Enlarge a speech bubble','Enable Bubble Zoom, then double-tap inside a speech bubble to enlarge its text.'),...controls];
      case 'two-page':return [
        step('#page-viewport','Read a full spread','Two Page shows two comic pages side by side. In the Android app it enters fullscreen landscape. Swipe to move to the next or previous pair.'),
        step('#page-viewport','Zoom into the spread','Spread two fingers to zoom in, then drag to pan. Pinch inward to fit the pages again.'),
        step('#two-page-exit-fullscreen','Leave fullscreen','Use this fullscreen-exit button to release fullscreen and orientation. You can also switch reading mode or return to the shelf.'),...controls];
      case 'scroll': case 'manga': case 'webcomic':return [
        step('#page-viewport',id==='manga'?'Read right to left':id==='webcomic'?'Read down the page':'Scroll through your comic',id==='manga'?'Swipe horizontally through the comic in right-to-left order.':id==='webcomic'?'Swipe upward to move down through the vertically stacked pages.':'Swipe horizontally to move through your comic pages.'),
        step('#auto-scroll-toggle','Let the pages move for you','Tap Auto Scroll to start automatic movement. Tap the page to reveal navigation and the speed control.','The slider runs evenly from 0× to 2×, with your exact speed shown above it. Tap − or + for 0.01× adjustments; use pause to stop or resume. The slider fades when navigation hides.'),...controls];
      default:return [];
    }
  },
  init() {
    try{this.seen=JSON.parse(localStorage.getItem(this.key)||'{}');}catch(_){}
    this.dialog=document.createElement('dialog');this.dialog.className='nth-dialog guide-dialog';
    this.dialog.setAttribute('aria-labelledby','nth-guide-title');this.dialog.setAttribute('aria-describedby','nth-guide-copy');
    this.dialog.innerHTML='<div class="guide-focus" aria-hidden="true" hidden></div><section class="guide-card"><div class="nth-eyebrow">AN NTH EXPERIENCE · NTH SHELF</div><p class="guide-count"></p><h2 id="nth-guide-title" tabindex="-1"></h2><p class="guide-copy" id="nth-guide-copy"></p><p class="guide-tip"></p><div class="nth-dialog-actions"><button class="modal-btn subtle guide-skip">Finish tutorial</button><button class="modal-btn neutral guide-back">← Back</button><button class="modal-btn primary guide-next">Next →</button></div></section>';
    document.body.append(this.dialog);this.card=this.dialog.querySelector('.guide-card');
    this.dialog.querySelector('.guide-next').onclick=()=>this.advance(1);
    this.dialog.querySelector('.guide-back').onclick=()=>this.advance(-1);
    this.dialog.querySelector('.guide-skip').onclick=()=>this.finish();
    this.dialog.addEventListener('cancel',e=>{e.preventDefault();this.finish();});
    this.dialog.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();e.stopPropagation();this.advance(e.key==='ArrowRight'?1:-1);}});
    window.addEventListener('resize',()=>this.position());window.visualViewport?.addEventListener('resize',()=>this.position());
    new MutationObserver(()=>this.schedule()).observe(document.getElementById('reader-view'),{attributes:true,attributeFilter:['class']});
    for(const method of ['showRoot','showCollection','toggleShelfMode','toggleSearchMode','refresh'])this.watch(Library,method);
    this.watch(Reader,'open');this.watch(Reader,'setMode');
    document.getElementById('replay-guide').onclick=()=>{Reader.closeHelpDrawer();this.request(this.context(),true);};
    document.getElementById('show-licenses').onclick=()=>this.licenses();this.schedule();
  },
  watch(object,key) {
    if(typeof object[key]!=='function')return;
    const original=object[key],guide=this;
    object[key]=function(...args){const result=original.apply(this,args);Promise.resolve(result).then(()=>guide.schedule(),()=>{});return result;};
  },
  context() {
    if(document.getElementById('reader-view').classList.contains('active'))return Reader.mode;
    if(Library.shelfMode)return 'shelf';if(Library.searchMode)return 'search';
    if(Library.activeCollectionId)return 'collection';return 'library';
  },
  schedule() {clearTimeout(this.timer);this.timer=setTimeout(()=>this.request(this.context()),1200);},
  request(id,replay=false) {
    const key=id==='library'?id+(document.getElementById('library-view').classList.contains('empty-library')?':empty':':books'):id;
    if((!replay&&this.seen[key])||!this.steps(id).length)return;
    if(this.active||document.querySelector('dialog[open]')||Modal.el.style.display==='flex'||ShelfTransfer.busy){this.schedule();return;}
    this.previousFocus=document.activeElement;this.active={id,key,index:0,steps:this.steps(id)};
    (document.fullscreenElement||document.body).append(this.dialog);this.dialog.showModal();this.render();
  },
  advance(delta) {
    if(!this.active)return;
    const next=this.active.index+delta;if(next<0)return;
    if(next>=this.active.steps.length){this.finish();return;}
    this.active.index=next;this.render();
  },
  target(step) {
    if(step.target==='#page-viewport'&&Reader.mode==='single') {
      const image=Reader.turnPageMode?.book?.pageNode()?.querySelector('img');
      if(image?.getBoundingClientRect().width)return image;
    }
    return [...document.querySelectorAll(step.target)].find(el=>{const r=el.getBoundingClientRect();return r.width&&r.height&&!el.closest('[hidden]');});
  },
  render() {
    if(!this.active)return;
    const {index,steps}=this.active,step=steps[index];
    this.dialog.querySelector('.guide-count').textContent='Step '+(index+1)+' of '+steps.length;
    this.dialog.querySelector('h2').textContent=step.title;
    this.dialog.querySelector('.guide-copy').textContent=step.copy;
    const tip=this.dialog.querySelector('.guide-tip');tip.textContent=step.tip||'';tip.hidden=!step.tip;
    this.dialog.querySelector('.guide-back').hidden=index===0;
    this.dialog.querySelector('.guide-next').textContent=index===steps.length-1?'Done ✓':'Next →';
    if(document.getElementById('reader-view').classList.contains('active'))Reader.showChrome(true);
    const target=this.target(step);if(target&&target.getBoundingClientRect().height<innerHeight/2)target.scrollIntoView({block:'nearest',behavior:'instant'});
    this.position();requestAnimationFrame(()=>this.position());clearTimeout(this.positionTimer);this.positionTimer=setTimeout(()=>this.position(),250);
    this.dialog.querySelector('h2').focus({preventScroll:true});
  },
  position() {
    if(!this.active)return;
    const step=this.active.steps[this.active.index],target=this.target(step),focus=this.dialog.querySelector('.guide-focus');
    const h=window.visualViewport?.height||innerHeight,w=window.visualViewport?.width||innerWidth;
    let box=target?.getBoundingClientRect();
    if(box&&step.zone==='corner'){const side=Math.min(88,box.width/3,box.height/3);box={left:box.right-side,right:box.right,top:box.bottom-side,bottom:box.bottom,width:side,height:side};}
    focus.hidden=!box||box.bottom<0||box.top>h;
    if(!focus.hidden){const left=Math.max(6,box.left-5),top=Math.max(6,box.top-5),right=Math.min(w-6,box.right+5),bottom=Math.min(h-6,box.bottom+5);Object.assign(focus.style,{left:left+'px',top:top+'px',width:Math.max(0,right-left)+'px',height:Math.max(0,bottom-top)+'px'});}
    this.dialog.classList.toggle('guide-no-target',focus.hidden);
    this.card.style.top=box&&box.top>h/2?'max(16px, env(safe-area-inset-top))':'auto';
    this.card.style.bottom=box&&box.top>h/2?'auto':'max(16px, env(safe-area-inset-bottom))';
  },
  finish() {
    if(!this.active)return false;
    this.seen[this.active.key]=true;this.active=null;clearTimeout(this.positionTimer);
    try{localStorage.setItem(this.key,JSON.stringify(this.seen));}catch(_){}
    this.dialog.close();this.previousFocus?.focus?.({preventScroll:true});
    if(document.getElementById('reader-view').classList.contains('active'))Reader.showChrome();
    this.schedule();return true;
  },
  async licenses() {
    const dialog=document.createElement("dialog");dialog.className="nth-dialog license-dialog";
    dialog.innerHTML='<div class="nth-eyebrow">AN NTH EXPERIENCE</div><h2>Licenses & Credits</h2><p>Nth Shelf · Created by Brad Redenbach</p><pre>Loading notices…</pre><button class="modal-btn primary">Close</button>';
    (document.fullscreenElement||document.body).append(dialog);
    dialog.querySelector("button").onclick=()=>dialog.close();
    dialog.onclose=()=>dialog.remove();dialog.showModal();
    try {const r=await fetch("THIRD_PARTY_NOTICES.txt");if(!r.ok)throw Error();dialog.querySelector("pre").textContent=await r.text();}
    catch(_){dialog.querySelector("pre").textContent="Notices could not be loaded. Please reopen the app.";}
  }
};
