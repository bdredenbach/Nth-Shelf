/* First-use, contextual guides in the Nth Shelf palette. Never mutate comics. */
window.ShelfGuide = {
  key:"nth-shelf-guides-v1", active:null, seen:{},
  tours:{
    library:[["Welcome to Nth Shelf","Import your comic archives with + Import. Your pages stay on this device."],
      ["A little lift","Tap a cover once to lift it; tap it again to open. The three-dot menu contains comic or collection actions."],
      ["Keep a copy","Backup saves pages, collections, bookmarks and progress. Keep the resulting file somewhere safe."]],
    collection:[["Inside your collection","Tap an issue to lift it, then again to read. Collection options on the main shelf include Download collection, which creates a ZIP of CBZ issues."]],
    shelf:[["Your cinematic shelf","Swipe left or right to browse. Tap the center comic to read. Use × or Back to return to the library."]],
    search:[["Find your next read","Browse and search your shelf here. Close Search Mode to return to the comic grid."]],
    single:[["Read your way","Swipe or drag to turn a page with the Nth page fold. Pinch with two fingers to zoom; drag while zoomed to pan."],
      ["Look closer","Tap a panel to pop out the whole frame. Double-tap a focused frame to release it. Bubble Zoom can enlarge speech bubbles."],
      ["Controls are nearby","Swipe inward from the top or bottom to show navigation for five seconds. You can also tap the middle. Use the page slider, bookmark button, reading modes and ? guide."]],
    "two-page":[["A full spread","In Android, Two Page enters fullscreen landscape. Swipe to change pairs. Pinch to zoom and drag to pan; pinch inward to fit again."],
      ["Return to normal view","Use the fullscreen-exit button, switch mode, or return to your shelf to release fullscreen and orientation."]],
    scroll:[["Scroll through your comic","Swipe horizontally through pages. Tap to reveal navigation. Auto Scroll reveals its speed slider with those controls."]],
    manga:[["Manga reading","Browse horizontally right-to-left. Tap for navigation and Auto Scroll controls."]],
    webcomic:[["Vertical reading","Swipe up through the pages. Auto Scroll can move the comic for you; tap to reveal its speed control."]]
  },
  init() {
    try{this.seen=JSON.parse(localStorage.getItem(this.key)||"{}");}catch(_){}
    this.dialog=document.createElement("dialog");this.dialog.className="nth-dialog guide-dialog";
    this.dialog.setAttribute("aria-labelledby","nth-guide-title");
    this.dialog.innerHTML='<div class="nth-eyebrow">AN NTH EXPERIENCE · NTH SHELF</div><p class="guide-count"></p><h2 id="nth-guide-title"></h2><p class="guide-copy"></p><div class="nth-dialog-actions"><button class="modal-btn subtle guide-skip">Skip this guide</button><button class="modal-btn primary guide-next">Next →</button></div>';
    document.body.append(this.dialog);
    this.dialog.querySelector(".guide-next").onclick=()=>{if(++this.active.index>=this.tours[this.active.id].length)this.finish();else this.render();};
    this.dialog.querySelector(".guide-skip").onclick=()=>this.finish();
    this.dialog.addEventListener("cancel",e=>{e.preventDefault();this.finish();});
    const request=()=>this.schedule();
    new MutationObserver(request).observe(document.getElementById("reader-view"),{attributes:true,attributeFilter:["class"]});
    for(const method of ["showRoot","showCollection","toggleShelfMode","toggleSearchMode"])this.watch(Library,method);
    this.watch(Reader,"open");this.watch(Reader,"setMode");
    document.getElementById("replay-guide").onclick=()=>{Reader.closeHelpDrawer();this.request(this.context(),true);};
    document.getElementById("show-licenses").onclick=()=>this.licenses();
    this.schedule();
  },
  watch(object,key) {
    if(typeof object[key]!=="function")return;
    const original=object[key], guide=this;
    object[key]=function(...args){const result=original.apply(this,args);Promise.resolve(result).then(()=>guide.schedule(),()=>{});return result;};
  },
  context() {
    if(document.getElementById("reader-view").classList.contains("active"))return Reader.mode;
    if(Library.shelfMode)return "shelf";
    if(Library.searchMode)return "search";
    if(Library.activeCollectionId)return "collection";
    return "library";
  },
  schedule() {clearTimeout(this.timer);this.timer=setTimeout(()=>this.request(this.context()),1200);},
  request(id,replay=false) {
    if(!this.tours[id]||(!replay&&this.seen[id]))return;
    if(this.active||document.querySelector("dialog[open]")||Modal.el.style.display==="flex"){this.schedule();return;}
    this.previousFocus=document.activeElement;this.active={id,index:0};
    if(id in this.tours && document.getElementById("reader-view").classList.contains("active"))Reader.showChrome(true);
    (document.fullscreenElement||document.body).append(this.dialog);
    this.dialog.showModal();this.render();
  },
  render() {
    const {id,index}=this.active,steps=this.tours[id];
    this.dialog.querySelector(".guide-count").textContent=(index+1)+" / "+steps.length;
    this.dialog.querySelector("h2").textContent=steps[index][0];
    this.dialog.querySelector(".guide-copy").textContent=steps[index][1];
    this.dialog.querySelector(".guide-next").textContent=index===steps.length-1?"Start exploring":"Next →";
  },
  finish() {
    if(!this.active)return false;
    this.seen[this.active.id]=true;this.active=null;
    try{localStorage.setItem(this.key,JSON.stringify(this.seen));}catch(_){}
    this.dialog.close();this.previousFocus?.focus?.();
    if(document.getElementById("reader-view").classList.contains("active"))Reader.showChrome();
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
