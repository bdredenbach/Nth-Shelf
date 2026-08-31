// NTH SHELF V87 — V79 BASELINE / BOUNDARY-SET FALLBACK
// V73 is authoritative when it contains the tap. V87 boundary-set fallback runs only after a miss.
// V87 is based on the last known-good V79 baseline; only the fallback selection method is changed.

// reader.js — the reading experience: paging, zoom/pan, modes, themes

const PANEL_ZOOM_KEY = "longbox_panel_zoom_enabled";
const BUBBLE_ZOOM_KEY = "longbox_bubble_zoom_enabled";
const BUBBLE_ALT_ZOOM_KEY = "longbox_bubble_alt_zoom_enabled";
const HOLD_MS = 500; // long-press duration to trigger bubble zoom

const Reader = {
 comic: null,
 pageUrls: [],       // object URLs, lazily filled
 index: 0,
 mode: "single",      // single | two-page | scroll | manga | webcomic
 theme: "dark",        // dark | sepia | light
 scale: 1,
 tx: 0,
 ty: 0,
 chromeVisible: true,
 chromeTimer: null,
 _twoPageEnteredFullscreen: false,
 _autoScrollEnabled: false,
 _autoScrollAnimation: null,
 _autoScrollLastTime: 0,
 _autoScrollSpeed: 38,
 _autoScrollPaused: false,
  _autoScrollControlHideTimer: null,
  _autoScrollDrag: null,
 _twoPageOrientationLocked: false,
 _initialReaderGuideShown: false,

 currentPanels: [],       // detected panel rects for the visible page, fractional coords
 panelZoomEnabled: localStorage.getItem(PANEL_ZOOM_KEY) !== "0",
 bubbleZoomEnabled: localStorage.getItem(BUBBLE_ZOOM_KEY) !== "0",
 bubbleAltZoomEnabled: localStorage.getItem(BUBBLE_ALT_ZOOM_KEY) !== "0",
 bubbleOverlayActive: false,
 panelOverlayActive: false,
 panelOverlayToken: 0,
 focusMode: null,          // null | panel | bubble
 focusAnimationTimer: null,
 _panelLoadToken: 0,      // guards against a slow detection landing on the wrong page

 els: {},

 init() {
   this.els.view = document.getElementById("reader-view");
   this.els.stage = document.getElementById("reader-stage");
   this.els.viewport = document.getElementById("page-viewport");
   this.els.chrome = document.getElementById("reader-chrome");
   this.els.title = document.getElementById("reader-title");
   this.els.slider = document.getElementById("page-slider");
   this.els.sliderLabel = document.getElementById("page-slider-label");
   this.els.loading = document.getElementById("reader-loading");
   this.els.bookmarkFlag = document.getElementById("bookmark-flag");
   this.els.bubbleToggle = document.getElementById("bubble-zoom-toggle");
   this.els.debugPanel = document.getElementById("debug-panel");
   this.els.helpDrawer = document.getElementById("help-drawer");
   this.nativePageTurn = new LongboxNativePageTurn(this);

   // v59.23: real Turn.js takeover for Page mode.
   this.turnPageMode = new LongboxPageMode({
     getIssue: () => this.comic,
     getPageUrl: (i) => this.getPageUrl(i),
     getIndex: () => this.index,
     setIndex: (i) => {
       this.index = Math.max(0, Math.min(this.comic.pageCount - 1, i));
       this.updateSliderLabel();
       this.updateBookmarkFlag();
       this.saveProgress();
     },
     onPageChanged: (i) => {
       this.index = Math.max(0, Math.min(this.comic.pageCount - 1, i));
       this.updateSliderLabel();
       this.updateBookmarkFlag();
       this.saveProgress();
       this.loadPanelsForCurrentPage();
     },
     onState: (s) => this.debugLog(`Turn.js: ${s}`)
   });
   this.useTurnJSPageMode = true;

   document.getElementById("reader-back").addEventListener("click", () => this.close());
   document.getElementById("reader-bookmark").addEventListener("click", () => this.toggleBookmark());
   document.getElementById("reader-help").addEventListener("click", () => this.openHelpDrawer());

   this.els.readerPrev = document.getElementById("reader-prev");
   this.els.readerNext = document.getElementById("reader-next");
   this.els.readerPrev?.addEventListener("click", (event) => {
     event.stopPropagation();
     this.openAdjacentIssue(-1);
   });
   this.els.readerNext?.addEventListener("click", (event) => {
     event.stopPropagation();
     this.openAdjacentIssue(1);
   });
    this.els.autoScrollToggle = document.getElementById("auto-scroll-toggle");
    this.els.autoScrollToggle?.addEventListener("click", (event) => {
      event.stopPropagation();
      this.toggleAutoScroll();
    });
    this.els.autoScrollPanel = document.getElementById("auto-scroll-control-panel");
    this.els.autoScrollSpeed = document.getElementById("auto-scroll-speed");
    this.els.autoScrollPlay = document.getElementById("auto-scroll-play");

    const wakeAutoScrollControls = () => this.revealAutoScrollControls();
    const holdAutoScrollControls = () => this.keepAutoScrollControlsVisible();

    this.els.autoScrollPanel?.addEventListener("pointerdown", (event) => {
      const panel = this.els.autoScrollPanel;
      const rect = panel?.getBoundingClientRect();
      const inDragStrip = rect &&
        event.clientY >= rect.top - 10 &&
        event.clientY <= rect.top + 18;

      if (inDragStrip || !this._isAutoScrollInteractiveTarget(event.target)) {
        this.startAutoScrollPanelDrag(event);
      } else {
        holdAutoScrollControls();
      }
    });
    this.els.autoScrollPanel?.addEventListener("pointermove", (event) => {
      this.moveAutoScrollPanelDrag(event);
    });
    this.els.autoScrollPanel?.addEventListener("pointerup", (event) => {
      this.endAutoScrollPanelDrag(event);
      wakeAutoScrollControls();
    });
    this.els.autoScrollPanel?.addEventListener("pointercancel", (event) => {
      this.endAutoScrollPanelDrag(event);
      wakeAutoScrollControls();
    });
    this.els.autoScrollPanel?.addEventListener("focusin", holdAutoScrollControls);
    this.restoreAutoScrollPanelPosition();

    this.els.autoScrollSpeed?.addEventListener("input", (event) => {
      this.revealAutoScrollControls();
      this.setAutoScrollSpeed(event.target.value);
    });
    this.els.autoScrollSpeed?.addEventListener("change", wakeAutoScrollControls);

    this.els.autoScrollPlay?.addEventListener("click", (event) => {
      event.stopPropagation();
      this.keepAutoScrollControlsVisible();
      this.toggleAutoScrollPause();
    });

   this.els.twoPageExitFullscreen = document.getElementById("two-page-exit-fullscreen");
   this.els.twoPageExitFullscreen?.addEventListener("click", () => this.exitTwoPageFullscreen());
   document.addEventListener("fullscreenchange", () => this.handleTwoPageFullscreenChange());
   window.addEventListener("orientationchange", () => this.updateTwoPageFullscreenButton());
   window.addEventListener("resize", () => this.updateTwoPageFullscreenButton(), { passive: true });
   screen.orientation?.addEventListener?.("change", () => this.updateTwoPageFullscreenButton());
   document.getElementById("help-drawer-close").addEventListener("click", () => this.closeHelpDrawer());
   this.els.helpDrawer.addEventListener("click", (e) => {
     if (e.target === this.els.helpDrawer) this.closeHelpDrawer();
   });
   this.els.bubbleToggle.addEventListener("click", () => this.toggleBubbleAltZoom());
   this.updateBubbleToggleUI();
   this.bindDebugToggle();

   document.querySelectorAll(".reader-modes .mode-pill").forEach((btn) => {
     btn.addEventListener("click", () => this.setMode(btn.dataset.mode));
   });
   document.querySelectorAll(".theme-swatch").forEach((btn) => {
     btn.addEventListener("click", () => this.setTheme(btn.dataset.theme));
   });
   this.els.slider.addEventListener("input", (e) => {
     this.goTo(parseInt(e.target.value, 10), { fromSlider: true });
   });

   this.bindGestures();

   let continuousTimer = null;
   const settleContinuous = () => {
     if (!(this.mode === "scroll" || this.mode === "manga" || this.mode === "webcomic")) return;
     clearTimeout(continuousTimer);
     continuousTimer = setTimeout(async () => {
       await this.stabilizeContinuousLayout();
       if (this.mode === "scroll" || this.mode === "manga") {
         const h = this.els.stage.clientHeight;
         if (h > 0) {
           this.els.viewport.style.height = `${h}px`;
           this.els.stage.querySelectorAll(".scroll-page").forEach(wrap => {
             wrap.style.height = `${h}px`;
           });
         }
       }
     }, 100);
   };
   window.addEventListener("resize", settleContinuous, { passive: true });
   window.addEventListener("orientationchange", settleContinuous, { passive: true });
   if (window.visualViewport) {
     window.visualViewport.addEventListener("resize", settleContinuous, { passive: true });
   }
   screen.orientation?.addEventListener?.("change", settleContinuous);
 },

 async open(comicId, startPage = null) {
   this.comic = await LongboxDB.getComic(comicId);
   if (!this.comic) return;
   LongboxDB.updateComic(comicId, { lastOpenedAt: Date.now() });
   const requestedPage = Number.isInteger(startPage) ? startPage : (this.comic.lastPage || 0);
   this.index = Math.max(0, Math.min((this.comic.pageCount || 1) - 1, requestedPage));
   this.mode = this.comic.readMode || "single";
   this.theme = this.comic.theme || "dark";
   this.pageUrls = new Array(this.comic.pageCount).fill(null);
   this._pageDims = new Array(this.comic.pageCount).fill(null);
   this.scale = 1; this.tx = 0; this.ty = 0;

   this.els.title.textContent = this.comic.title;
   this.els.slider.max = this.comic.pageCount - 1;
   this.updateAdjacentIssueControls();
   this.applyTheme();
   this.applyModeClass();
   this.updateModePills();
   this.updateAutoScrollControl();
   this.updateThemeSwatches();
   this.showChrome(true);

   await this.render();
 if (!this._initialReaderGuideShown) {
    this._initialReaderGuideShown = true;
    requestAnimationFrame(() => this.openHelpDrawer());
  }
},

 async getAdjacentIssues() {
   if (!this.comic) return { previous: null, next: null };

   try {
     const comics = await LongboxDB.getAllComics();

     // Prefer explicit Detect Series metadata. Collection membership is the
     // fallback for libraries where series metadata has not been assigned.
     let siblings = [];
     if (this.comic.seriesKey) {
       siblings = comics.filter((comic) =>
         comic.id !== this.comic.id &&
         comic.seriesKey &&
         comic.seriesKey === this.comic.seriesKey
       );
     }

     if (siblings.length < 1 && this.comic.collectionId) {
       siblings = comics.filter((comic) =>
         comic.id !== this.comic.id &&
         comic.collectionId === this.comic.collectionId
       );
     }

     if (!siblings.length) return { previous: null, next: null };

     const issueNumber = (comic) => {
       const n = Number(comic.issueNumber);
       return Number.isFinite(n) ? n : null;
     };

     const currentNumber = issueNumber(this.comic);

     siblings.sort((a, b) => {
       const an = issueNumber(a), bn = issueNumber(b);
       if (an != null && bn != null && an !== bn) return an - bn;
       if (an != null && bn == null) return -1;
       if (an == null && bn != null) return 1;
       return String(a.title || "").localeCompare(
         String(b.title || ""), undefined, { numeric: true }
       );
     });

     if (currentNumber != null) {
       let previous = null;
       let next = null;

       for (const comic of siblings) {
         const n = issueNumber(comic);
         if (n == null) continue;
         if (n < currentNumber && (!previous || n > issueNumber(previous))) previous = comic;
         if (n > currentNumber && (!next || n < issueNumber(next))) next = comic;
       }
       return { previous, next };
     }

     const all = [this.comic, ...siblings].sort((a, b) =>
       String(a.title || "").localeCompare(
         String(b.title || ""), undefined, { numeric: true }
       )
     );
     const index = all.findIndex((comic) => comic.id === this.comic.id);
     return {
       previous: index > 0 ? all[index - 1] : null,
       next: index >= 0 && index < all.length - 1 ? all[index + 1] : null
     };
   } catch (err) {
     console.warn("Nth Shelf adjacent issue lookup failed:", err);
     return { previous: null, next: null };
   }
 },

 async updateAdjacentIssueControls() {
   if (!this.els.readerPrev || !this.els.readerNext) return;

   const { previous, next } = await this.getAdjacentIssues();
   this._adjacentIssues = { previous, next };

   this.els.readerPrev.disabled = !previous;
   this.els.readerNext.disabled = !next;

   this.els.readerPrev.title = previous
     ? `Previous issue: ${previous.title}`
     : "No previous issue";
   this.els.readerNext.title = next
     ? `Next issue: ${next.title}`
     : "No next issue";

   this.els.readerPrev.setAttribute(
     "aria-label",
     previous ? `Previous issue: ${previous.title}` : "No previous issue"
   );
   this.els.readerNext.setAttribute(
     "aria-label",
     next ? `Next issue: ${next.title}` : "No next issue"
   );
 },

 async openAdjacentIssue(direction) {
   const target = direction < 0
     ? this._adjacentIssues?.previous
     : this._adjacentIssues?.next;

   if (!target) return;

   this.saveProgress();
   await this.open(target.id);
 },

 close() {
   this.saveProgress();
   this.revokeAll();
   window.LongboxApp.closeReader();
 },

 revokeAll() {
   for (const url of this.pageUrls) {
     if (url) URL.revokeObjectURL(url);
   }
 },

 async getPageUrl(i) {
   if (i < 0 || i >= this.comic.pageCount) return null;
   if (this.pageUrls[i]) return this.pageUrls[i];
   const blob = await LongboxDB.getPage(this.comic.id, i);
   if (!blob) return null;
   const url = URL.createObjectURL(blob);
   this.pageUrls[i] = url;
   return url;
 },

 async render() {
   this.resetZoom({ animate: false });
   if (this.mode === "two-page") {
     await this.renderTwoPage();
   } else if (this.mode === "scroll" || this.mode === "manga" || this.mode === "webcomic") {
     await this.renderContinuous();
   } else {
     await this.renderPaged();
   }
   this.updateSliderLabel();
   this.updateBookmarkFlag();
   this.saveProgress();

   // Warm the rest of this issue in the background. Mode changes already
   // pass through render(), so every mode benefits without blocking display.
   this.precacheIssuePages();
 },

 async precacheIssuePages() {
   const comicId = this.comic?.id;
   const count = this.comic?.pageCount || 0;
   if (!comicId || !count) return;
   const token = `${comicId}:${this.comic.updatedAt || ""}`;
   if (this._precacheToken === token && this._precacheComplete) return;
   if (this._precachePromise && this._precacheToken === token) return;

   this._precacheToken = token;
   this._precacheComplete = false;
   this._precachePromise = (async () => {
     const batchSize = 4;
     for (let start = 0; start < count; start += batchSize) {
       if (this.comic?.id !== comicId) return;
       await Promise.all(
         Array.from(
           { length: Math.min(batchSize, count - start) },
           async (_, n) => {
             const i = start + n;
             try {
               const url = await this.getPageUrl(i);
               if (!url) return;

               const probe = new Image();
               probe.src = url;
               await new Promise(resolve => {
                 if (probe.complete && probe.naturalWidth) return resolve();
                 probe.onload = () => resolve();
                 probe.onerror = () => resolve();
               });

               if (probe.naturalWidth && probe.naturalHeight) {
                 this._pageDims[i] = {
                   width: probe.naturalWidth,
                   height: probe.naturalHeight
                 };
               }
             } catch (_) {}
           }
         )
       );
       if (this.debugMode) {
         this.debugLog(
           `issue pre-cache: ${Math.min(start + batchSize, count)}/${count} page URLs ready`
         );
       }
       await new Promise(resolve => setTimeout(resolve, 0));
     }
     if (this.comic?.id === comicId) {
       this._precacheComplete = true;
       if (this.debugMode) this.debugLog(`issue pre-cache complete: ${count}/${count}`);
     }
   })().finally(() => {
     if (this.comic?.id === comicId) this._precachePromise = null;
   });
   return this._precachePromise;
 },

 async preflightPageImage(i) {
   const url = await this.getPageUrl(i);
   if (!url) return null;

   // Decode off-DOM so the existing mode can remain visible while the next
   // mode prepares its first page. The browser cache makes the subsequent
   // on-DOM image assignment effectively immediate.
   try {
     const probe = new Image();
     probe.src = url;
     if (probe.decode) await probe.decode();
     if (probe.naturalWidth && probe.naturalHeight) {
       this._pageDims[i] = {
         width: probe.naturalWidth,
         height: probe.naturalHeight
       };
     }
   } catch (_) {
     // A failed decode should not block the reader; renderPaged/renderContinuous
     // will still attempt the normal image load.
   }
   return url;
 },

 async renderPaged() {
    if (this.mode === "single" && this.useTurnJSPageMode && this.turnPageMode) {
      const ok = await this.turnPageMode.render(this.els.viewport);
      if (ok) {
        this.prefetch();
        this.loadPanelsForCurrentPage();
        this.updateSliderLabel();
        this.updateBookmarkFlag();
        return;
      }
      this.debugLog("Turn.js Page Mode unavailable; using normal page renderer.");
    }

    this.els.viewport.style.display = "flex";
    this.els.viewport.style.width = "100%";
    this.els.viewport.style.height = "100%";
    this.els.viewport.style.transform = "none";
    this.els.viewport.style.overflow = "hidden";
    this.els.viewport.scrollLeft = 0;
    this.els.viewport.scrollTop = 0;
    this.els.stage.scrollLeft = 0;
    this.els.stage.scrollTop = 0;

    const url = await this.preflightPageImage(this.index);

    this.els.viewport.innerHTML = "";
    if (url) {
      const img = document.createElement("img");
      img.src = url;
      img.draggable = false;
      this.els.viewport.appendChild(img);
    }

    this.prefetch();
    this.loadPanelsForCurrentPage();
 },

 async renderTwoPage() {
   const pageCount = this.comic?.pageCount || 0;
   if (!pageCount) return;

   // The current page remains the current page. We only choose a pair for
   // display; entering Two Page never rewrites this.index.
   const pairStart = this.index % 2 === 0
     ? this.index
     : Math.max(0, this.index - 1);
   const pairIndices = [pairStart, pairStart + 1].filter(i => i < pageCount);

   const urls = await Promise.all(
     pairIndices.map(i => this.preflightPageImage(i))
   );

   // A completely new DOM tree, unrelated to continuous-mode .scroll-page
   // elements and unrelated to any continuous-mode DOM.
   this.els.stage.classList.remove("mode-scroll", "mode-manga", "mode-webcomic");
   this.els.stage.classList.add("mode-two-page");
   this.els.stage.style.overflow = "hidden";
   this.els.stage.scrollLeft = 0;
   this.els.stage.scrollTop = 0;

   this.els.viewport.innerHTML = "";
   this.els.viewport.className = "page-viewport two-page-viewport";
   this.els.viewport.style.display = "flex";
   this.els.viewport.style.width = "100%";
   this.els.viewport.style.height = "100%";
   this.els.viewport.style.transform = "none";
   this.els.viewport.style.overflow = "hidden";
   this.els.viewport.style.flexDirection = "row";
   this.els.viewport.style.alignItems = "center";
   this.els.viewport.style.justifyContent = "center";
   this.els.viewport.style.gap = "8px";

   for (let n = 0; n < pairIndices.length; n++) {
     const url = urls[n];
     if (!url) continue;

     const pageIndex = pairIndices[n];
     const page = document.createElement("div");
     page.className = "two-page-page";
     page.dataset.index = String(pageIndex);

     const img = document.createElement("img");
     img.src = url;
     img.draggable = false;
     img.dataset.src = "loaded";

     const dims = this._pageDims?.[pageIndex];
     if (dims?.width && dims?.height) {
       img.width = dims.width;
       img.height = dims.height;
     }

     page.appendChild(img);
     this.els.viewport.appendChild(page);
   }

   this.prefetch();
   this.loadPanelsForCurrentPage();
   this.updateSliderLabel();
   this.updateBookmarkFlag();
 },

 async stabilizeContinuousLayout() {
   if (!(this.mode === "scroll" || this.mode === "manga" || this.mode === "webcomic")) return;

   await new Promise(resolve => {
     let frames = 3;
     const tick = () => {
       if (--frames <= 0) resolve();
       else requestAnimationFrame(tick);
     };
     requestAnimationFrame(tick);
   });

   if (!(this.mode === "scroll" || this.mode === "manga" || this.mode === "webcomic")) return;

   const stage = this.els.stage;
   const viewport = this.els.viewport;
   const width = stage.clientWidth;
   const height = stage.clientHeight;

   if (width > 0 && height > 0) {
     viewport.style.height = `${height}px`;
     if (this.mode === "webcomic") {
       viewport.style.width = `${width}px`;
     }
   }

   this.debugLog(`continuous layout settled: ${this.mode} ${width}x${height}`);
 },

 async loadContinuousPage(i) {
   if (i < 0 || i >= this.comic.pageCount) return;
   const wrap = this.els.stage.querySelector(`.scroll-page[data-index="${i}"]`);
   if (!wrap) return;
   const img = wrap.querySelector("img");
   if (!img || img.dataset.src !== "pending") return;

   img.dataset.src = "loading";
   const url = await this.getPageUrl(i);
   if (!url) {
     img.dataset.src = "pending";
     return;
   }
   img.src = url;
   if (img.decode) await img.decode().catch(() => {});

   if (img.naturalWidth && img.naturalHeight) {
     this._pageDims[i] = {
       width: img.naturalWidth,
       height: img.naturalHeight
     };
     wrap.style.aspectRatio = `${img.naturalWidth} / ${img.naturalHeight}`;
   }
 },

 async renderContinuous() {
   await this.stabilizeContinuousLayout();
   const horizontal = this.mode === "scroll" || this.mode === "manga";
   const rtl = this.mode === "manga";

   // Prepare the page the user is currently on before destroying the old
   // mode's visible content. This removes the long black gap seen during
   // mode switches while leaving the existing look-ahead/back logic intact.
   const windowIndices = Array.from(
     { length: horizontal ? 7 : 3 },
     (_, n) => this.index + n - (horizontal ? 3 : 1)
   ).filter(i => i >= 0 && i < this.comic.pageCount);

   const windowUrls = await Promise.all(
     windowIndices.map(i => this.preflightPageImage(i))
   );
   const currentUrl = windowUrls[windowIndices.indexOf(this.index)] || null;

   this.els.stage.classList.toggle("mode-scroll", this.mode === "scroll");
   this.els.stage.classList.toggle("mode-manga", rtl);
   this.els.stage.classList.toggle("mode-webcomic", this.mode === "webcomic");
   this.els.viewport.innerHTML = "";
   this.els.viewport.style.transform = "";

   const frag = document.createDocumentFragment();
   if (this.comic.pageCount) {
     Array.from({ length: this.comic.pageCount }).forEach((_, i) => {
       const wrap = document.createElement("div");
       wrap.className = "scroll-page";
       wrap.dataset.index = i;
       const img = document.createElement("img");
       const dims = this._pageDims?.[i];
       if (dims?.width && dims?.height) {
         wrap.style.aspectRatio = `${dims.width} / ${dims.height}`;
         img.width = dims.width;
         img.height = dims.height;
       }

       if (i === this.index && currentUrl) {
         img.src = currentUrl;
         img.dataset.src = "loaded";
       } else {
         img.dataset.src = "pending";
       }
       wrap.appendChild(img);
       frag.appendChild(wrap);
     });
   }
   this.els.viewport.appendChild(frag);

   if (horizontal) {
     const pageHeight = this.els.stage.clientHeight;
     if (pageHeight > 0) {
       this.els.viewport.style.height = `${pageHeight}px`;
       this.els.stage.querySelectorAll(".scroll-page").forEach(wrap => {
         wrap.style.height = `${pageHeight}px`;
       });
     }
   }

   const currentWrap = this.els.stage.querySelector(
     `.scroll-page[data-index="${this.index}"]`
   );
   if (currentWrap) {
     await this.loadContinuousPage(this.index);

     // Keep a symmetric real-page window around the current page. Pending
     // wrappers have zero width; loading only forward makes a re-entered
     // Scroll/Manga reader unable to move backward because the pages behind
     // the current index contribute no scrollable geometry.
     const lookBehind = horizontal ? 3 : 1;
     const lookAhead = horizontal ? 3 : 1;
     for (let n = 1; n <= lookBehind; n++) {
       this.loadContinuousPage(this.index - n);
     }
     for (let n = 1; n <= lookAhead; n++) {
       this.loadContinuousPage(this.index + n);
     }
   }

   const io = new IntersectionObserver((entries) => {
     entries.forEach(async (entry) => {
       const wrap = entry.target;
       const i = parseInt(wrap.dataset.index, 10);
       if (entry.isIntersecting) {
         await this.loadContinuousPage(i);

         // Extend the real scrollable track in BOTH directions. This is
         // especially important after re-entering Scroll/Manga at a later
         // page, where the previous wrappers may still be zero-width.
         const lookBehind = horizontal ? 3 : 1;
         const lookAhead = horizontal ? 3 : 1;
         for (let n = 1; n <= lookBehind; n++) {
           this.loadContinuousPage(i - n);
         }
         for (let n = 1; n <= lookAhead; n++) {
           this.loadContinuousPage(i + n);
         }

         // During a Two Page -> continuous handoff, the preserved page is
         // authoritative until that exact page becomes visible. Intersection
         // Observer entries for neighboring pages must not steal the index
         // while the new layout is settling.
         if (this._continuousHandoffPending) {
           if (i === this._continuousHandoffIndex) {
             this.index = i;
             this.updateSliderLabel();
             this._continuousHandoffPending = false;
           }
         } else {
           this.index = i;
           this.updateSliderLabel();
         }
         this.updateBookmarkFlag();
         this.throttledSaveProgress();
       }
     });
   }, { root: this.els.stage, threshold: 0.5 });

   this.els.stage.querySelectorAll(".scroll-page").forEach((el) => io.observe(el));
   this._scrollObserver = io;

   if (horizontal) {
     const settledHeight = this.els.stage.clientHeight;
     if (settledHeight > 0) {
       this.els.viewport.style.height = `${settledHeight}px`;
       this.els.stage.querySelectorAll(".scroll-page").forEach(wrap => {
         wrap.style.height = `${settledHeight}px`;
       });
     }
   }

   requestAnimationFrame(() => {
     const targetIndex = this._continuousHandoffPending
       ? this._continuousHandoffIndex
       : this.index;
     const target = this.els.stage.querySelector(`.scroll-page[data-index="${targetIndex}"]`);
     if (target) {
       target.scrollIntoView({
         block: "start",
         inline: horizontal ? "nearest" : "nearest"
       });
     } else if (this._continuousHandoffPending) {
       // The target should exist, but don't leave stale handoff state behind
       // if a future renderer change prevents it from being created.
       this._continuousHandoffPending = false;
     }
   });
 },

 prefetch() {
   const step = this.mode === "two-page" ? 2 : 1;
   [this.index + step, this.index - 1].forEach((i) => this.getPageUrl(i));
 },

 async loadPanelsForCurrentPage() {
   // V73: deliberately bypass full-page detection when panel zoom is disabled
   const token = ++this._panelLoadToken;
   if (!this.panelZoomEnabled || !this.comic) {
     this.currentPanels = [];
     return;
   }
   const pageIndex = this.index;
   const url = await this.getPageUrl(pageIndex);
   if (token !== this._panelLoadToken || !url) return;

   try {
     const panels = await PanelDetect.detect(url, (msg) => this.debugLog(msg));
     if (token === this._panelLoadToken) {
       this.currentPanels = panels || [];
       if (this.debugLog) {
         this.debugLog(`Loaded ${this.currentPanels.length} panels for page ${pageIndex + 1}`);
       }
     }
   } catch (err) {
     console.warn("Panel detection failed for current page:", err);
     if (token === this._panelLoadToken) {
       this.currentPanels = [];
     }
   }
 }
};

window.Reader = Reader;
