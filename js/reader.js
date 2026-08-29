// ================================================================
// NTH SHELF — V68
// EXPERIMENT: GUTTER BOUNDARY
// BUILD: V68 — gutter-boundary radial contour
// ================================================================
// V68 GUTTER BOUNDARY + V64 COORDINATE TRUTH — radial contour around the exact tap.
// V60 TAP-OWNS-SELECTION — retained for comparison only.
// V57 DOMINANT-OUTER-CANDIDATE TAP SELECTION EXPERIMENT — retained as fallback.
// V48 PANEL SELECTION MAP TEST — retained for comparison.
// V47 PANEL GEOMETRY VISUALIZATION TEST — retained for comparison.
// V46 PANEL SELECTION TEST — retained for comparison.
// V45 PANEL HANDOFF TEST — retained for comparison.
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
 androidPageTopReserve: 48,
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
		this.applyAndroidPageViewportReserve();
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
	this.applyAndroidPageViewportReserve();
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
   this.removePanelDiagnosticOverlay();
   this.currentPanels = [];
   if (this.mode !== "single") return;

   const comicId = this.comic.id;
   const pageIndex = this.index;
   const token = ++this._panelLoadToken;
   const logger = this.debugMode ? (msg) => this.debugLog(`[panels p${pageIndex}] ${msg}`) : null;

   let panels = this.debugMode ? undefined : await LongboxDB.getPanels(comicId, pageIndex);
   if (panels === undefined) {
     if (logger) logger("running detection" + (this.debugMode ? " (debug mode bypasses cache)" : " (not cached yet)"));
     const url = await this.getPageUrl(pageIndex);
     panels = url ? await PanelDetect.detect(url, logger) : [];
     LongboxDB.putPanels(comicId, pageIndex, panels);
   } else if (logger) {
     logger(`cache hit: ${panels.length} panel(s)`);
   }

   if (token !== this._panelLoadToken || this.comic.id !== comicId || this.index !== pageIndex) return;
   this.currentPanels = panels;
   if (logger) logger(`currentPanels set: ${panels.length}`);
   if (this.debugMode) this.renderPanelDiagnosticOverlay();
 },

 removePanelDiagnosticOverlay() {
   const existing = this.els.panelDiagnosticOverlay;
   if (existing && existing.parentNode) existing.remove();
   this.els.panelDiagnosticOverlay = null;
 },

 renderPanelDiagnosticOverlay() {
   this.removePanelDiagnosticOverlay();
   if (!this.debugMode || this.mode !== "single" || !this.currentPanels.length) return;

   const ctx = this.getPanelImageContext();
   const imgRect = ctx?.rect;
   const stage = this.els.stage;
   if (!stage || !imgRect || imgRect.width <= 1 || imgRect.height <= 1) return;

   const stageRect = stage.getBoundingClientRect();
   const overlay = document.createElement("div");
   overlay.className = "v47-panel-diagnostic-overlay";
   overlay.setAttribute("aria-hidden", "true");
   Object.assign(overlay.style, {
     position: "absolute",
     left: `${imgRect.left - stageRect.left}px`,
     top: `${imgRect.top - stageRect.top}px`,
     width: `${imgRect.width}px`,
     height: `${imgRect.height}px`,
     pointerEvents: "none",
     zIndex: "20",
     overflow: "visible",
     boxSizing: "border-box"
   });

   this.currentPanels.forEach((panel, index) => {
     const box = document.createElement("div");
     box.dataset.panelIndex = String(index);
     Object.assign(box.style, {
       position: "absolute",
       left: `${panel.x * 100}%`,
       top: `${panel.y * 100}%`,
       width: `${panel.w * 100}%`,
       height: `${panel.h * 100}%`,
       boxSizing: "border-box",
       border: "2px solid rgba(255, 230, 0, 0.95)",
       background: "rgba(255, 230, 0, 0.035)",
       pointerEvents: "none"
     });

     const label = document.createElement("div");
     label.textContent = `#${index}`;
     Object.assign(label.style, {
       position: "absolute",
       left: "2px",
       top: "2px",
       minWidth: "22px",
       padding: "2px 5px",
       borderRadius: "3px",
       background: "rgba(0,0,0,0.82)",
       color: "#fff",
       border: "1px solid rgba(255,230,0,0.95)",
       font: "bold 13px/1.1 sans-serif",
       textAlign: "center",
       boxSizing: "border-box"
     });

     box.appendChild(label);
     overlay.appendChild(box);
   });

   stage.appendChild(overlay);
   this.els.panelDiagnosticOverlay = overlay;

   this.debugLog(`[V47] PANEL OVERLAY rendered ${this.currentPanels.length} panel(s)`);
 },

 // V48: visually and diagnostically map the panel selected by the tap.
 // Keep V47's complete candidate overlay intact, then mark the exact winner
 // and report which detected panels contain or are contained by it.
 renderPanelSelectionDiagnostic(winnerIndex, hits) {
   if (!this.debugMode || this.mode !== "single") return;

   const overlay = this.els.panelDiagnosticOverlay;
   if (!overlay) return;

   overlay.querySelectorAll('[data-v48-selection="winner"], [data-v48-selection="candidate"], [data-v48-selection="parent"]').forEach(el => {
     el.remove();
   });

   overlay.querySelectorAll('[data-v48-panel-role="winner"]').forEach(el => {
     el.style.border = "2px solid rgba(255, 230, 0, 0.95)";
     el.style.background = "rgba(255, 230, 0, 0.035)";
     el.style.zIndex = "1";
   });

   if (winnerIndex == null || winnerIndex < 0 || !this.currentPanels[winnerIndex]) return;

   const winner = this.currentPanels[winnerIndex];
   const intersectionArea = (a, b) => {
     const left = Math.max(a.x, b.x);
     const top = Math.max(a.y, b.y);
     const right = Math.min(a.x + a.w, b.x + b.w);
     const bottom = Math.min(a.y + a.h, b.y + b.h);
     return Math.max(0, right - left) * Math.max(0, bottom - top);
   };
   const contains = (outer, inner, tolerance = 0.003) =>
     outer.x <= inner.x + tolerance &&
     outer.y <= inner.y + tolerance &&
     outer.x + outer.w >= inner.x + inner.w - tolerance &&
     outer.y + outer.h >= inner.y + inner.h - tolerance;

   const parents = [];
   const children = [];
   this.currentPanels.forEach((candidate, index) => {
     if (index === winnerIndex) return;
     if (contains(candidate, winner)) parents.push(index);
     if (contains(winner, candidate)) children.push(index);
   });

   // Mark the original candidate box.
   const winnerBox = overlay.querySelector(`[data-panel-index="${winnerIndex}"]`);
   if (winnerBox) {
     winnerBox.dataset.v48PanelRole = "winner";
     winnerBox.style.border = "4px solid rgba(255, 255, 255, 0.98)";
     winnerBox.style.background = "rgba(255, 255, 255, 0.08)";
     winnerBox.style.zIndex = "50";

     const badge = document.createElement("div");
     badge.dataset.v48Selection = "winner";
     badge.textContent = `SELECTED #${winnerIndex}`;
     Object.assign(badge.style, {
       position: "absolute",
       left: "0",
       top: "0",
       transform: "translateY(-100%)",
       padding: "4px 7px",
       borderRadius: "4px 4px 0 0",
       background: "rgba(255,255,255,0.96)",
       color: "#000",
       font: "bold 14px/1.1 sans-serif",
       whiteSpace: "nowrap",
       boxSizing: "border-box",
       pointerEvents: "none",
       zIndex: "60"
     });
     winnerBox.appendChild(badge);
   }

   // Highlight other candidates that participated in the tap.
   for (const entry of (hits || [])) {
     if (entry.index === winnerIndex) continue;
     const box = overlay.querySelector(`[data-panel-index="${entry.index}"]`);
     if (!box) continue;
     box.dataset.v48PanelRole = "candidate";
     box.style.border = "3px dashed rgba(255,255,255,0.82)";
     box.style.background = "rgba(255,255,255,0.025)";
     box.style.zIndex = "40";
   }

   // Highlight containing/contained rectangles so the hierarchy is obvious.
   for (const index of parents) {
     const box = overlay.querySelector(`[data-panel-index="${index}"]`);
     if (!box) continue;
     box.dataset.v48PanelRole = "parent";
     box.style.border = "3px dashed rgba(255,120,0,0.95)";
     box.style.background = "rgba(255,120,0,0.025)";
     box.style.zIndex = "30";
   }

   const fmt = (p) =>
     `x=${Number(p.x.toFixed(4))} y=${Number(p.y.toFixed(4))} ` +
     `w=${Number(p.w.toFixed(4))} h=${Number(p.h.toFixed(4))} ` +
     `area=${Number((p.w * p.h).toFixed(5))}`;

   this.debugLog(`[V48] TAP WINNER #${winnerIndex} ${fmt(winner)}`);
   this.debugLog(`[V48] TAP HITS ${hits?.map?.(h => `#${h.index}`).join(",") || "none"}`);
   this.debugLog(`[V48] PARENTS of #${winnerIndex}: ${parents.length ? parents.map(i => `#${i}`).join(",") : "none"}`);
   this.debugLog(`[V48] CHILDREN of #${winnerIndex}: ${children.length ? children.map(i => `#${i}`).join(",") : "none"}`);

   const parentDetails = parents.map(i => `#${i}(${fmt(this.currentPanels[i])})`).join(" | ");
   const childDetails = children.map(i => `#${i}(${fmt(this.currentPanels[i])})`).join(" | ");
   if (parentDetails) this.debugLog(`[V48] PARENT DETAILS ${parentDetails}`);
   if (childDetails) this.debugLog(`[V48] CHILD DETAILS ${childDetails}`);
 },

 getPanelImageContext(screenX = null, screenY = null) {
   // V64 COORDINATE TRUTH:
   // When a tap position is supplied, resolve the ACTUAL visible image under
   // that screen point instead of assuming Turn.js view()[0] is the image
   // the user touched. This is intentionally a DOM/image-location experiment;
   // it does not use currentPanels, parents, children, or grandchildren.
   const hasPoint = Number.isFinite(Number(screenX)) && Number.isFinite(Number(screenY));
   const sx = Number(screenX);
   const sy = Number(screenY);

   const isVisibleImage = (img) => {
     if (!img || !img.naturalWidth || !img.naturalHeight) return false;
     const rect = img.getBoundingClientRect();
     if (rect.width <= 1 || rect.height <= 1) return false;
     const cs = getComputedStyle(img);
     if (cs.display === "none" || cs.visibility === "hidden" || Number(cs.opacity) <= 0) return false;
     let el = img.parentElement;
     for (let i = 0; i < 6 && el; i++, el = el.parentElement) {
       const ecs = getComputedStyle(el);
       if (ecs.display === "none" || ecs.visibility === "hidden" || Number(ecs.opacity) <= 0) return false;
     }
     return true;
   };

   const containsPoint = (rect, x, y, pad = 1) =>
     x >= rect.left - pad && x <= rect.right + pad &&
     y >= rect.top - pad && y <= rect.bottom + pad;

   if (hasPoint) {
     const images = Array.from(this.els.viewport?.querySelectorAll?.("img") || [])
       .filter(isVisibleImage);

     const containing = images.filter(img => containsPoint(img.getBoundingClientRect(), sx, sy, 2));

     // First prefer the image Turn.js exposes at the exact screen point.
     // pointer-events:none on comic images means elementsFromPoint often
     // returns the Turn.js page wrapper instead, so walk upward and then
     // inspect its descendant image.
     let hitFromPoint = null;
     try {
       const stack = document.elementsFromPoint?.(sx, sy) || [];
       for (const el of stack) {
         if (el?.tagName === "IMG" && images.includes(el)) {
           hitFromPoint = el;
           break;
         }
         const candidate = el?.closest?.(".turn-page, .turn-page-wrapper, .longbox-turn-page");
         const childImg = candidate?.querySelector?.("img");
         if (childImg && images.includes(childImg) && containsPoint(childImg.getBoundingClientRect(), sx, sy, 2)) {
           hitFromPoint = childImg;
           break;
         }
       }
     } catch (_) {}

     let chosen = hitFromPoint;
     if (!chosen && containing.length === 1) chosen = containing[0];

     // If multiple visible images overlap, use the page wrapper's stacking
     // order where possible, then prefer the image with the smallest rendered
     // area. This is NOT panel hierarchy: it only chooses which DOM page image
     // is physically under the finger.
     if (!chosen && containing.length > 1) {
       const scored = containing.map((img, index) => {
         const rect = img.getBoundingClientRect();
         let score = 0;
         const page = img.closest?.(".turn-page, .turn-page-wrapper, .longbox-turn-page");
         if (page) {
           const pcs = getComputedStyle(page);
           if (pcs.display !== "none" && pcs.visibility !== "hidden") score += 100;
           const z = Number.parseInt(pcs.zIndex, 10);
           if (Number.isFinite(z)) score += Math.max(-20, Math.min(20, z));
           if (page.classList.contains("turn-page")) score += 5;
         }
         score -= (rect.width * rect.height) / 1000000;
         return { img, rect, score, index };
       }).sort((a, b) => b.score - a.score);
       chosen = scored[0]?.img || null;
     }

     if (chosen) {
       const rect = chosen.getBoundingClientRect();
       const page = chosen.closest?.(".turn-page, .turn-page-wrapper, .longbox-turn-page");
       let pageNumber = this.index + 1;
       const pAttr = page?.getAttribute?.("page");
       if (pAttr != null && Number.isFinite(Number(pAttr))) pageNumber = Number(pAttr);
       const normalizedX = clamp((sx - rect.left) / rect.width, 0, 1);
       const normalizedY = clamp((sy - rect.top) / rect.height, 0, 1);

       if (this.debugMode) {
         this.debugLog(
           `[V64] COORDINATE TRUTH candidates=${images.length} containing=${containing.length} ` +
           `hitFromPoint=${hitFromPoint ? "yes" : "no"}`
         );
         this.debugLog(
           `[V64] SELECTED IMG page=${pageNumber} ` +
           `rect=(${Number(rect.left.toFixed(1))},${Number(rect.top.toFixed(1))},` +
           `${Number(rect.width.toFixed(1))},${Number(rect.height.toFixed(1))}) ` +
           `natural=${chosen.naturalWidth}x${chosen.naturalHeight}`
         );
         this.debugLog(
           `[V64] SCREEN TAP=(${Number(sx.toFixed(1))},${Number(sy.toFixed(1))}) ` +
           `IMAGE TAP=(${Number(normalizedX.toFixed(5))},${Number(normalizedY.toFixed(5))}) ` +
           `PIXEL=(${Math.round(normalizedX * (chosen.naturalWidth - 1))},` +
           `${Math.round(normalizedY * (chosen.naturalHeight - 1))})`
         );
         for (const img of containing.slice(0, 6)) {
           const r = img.getBoundingClientRect();
           const pn = img.closest?.(".turn-page, .turn-page-wrapper")?.getAttribute?.("page") || "?";
           this.debugLog(
             `[V64] CANDIDATE page=${pn} rect=(${Number(r.left.toFixed(1))},${Number(r.top.toFixed(1))},` +
             `${Number(r.width.toFixed(1))},${Number(r.height.toFixed(1))})`
           );
         }
       }

       return { img: chosen, rect, pageNumber };
     }
   }

   // Preserve the existing non-tap behavior for diagnostics, rendering, and
   // other reader paths. V64 only changes how a tap resolves its image.
   if (this.mode === "single" &&
       this.useTurnJSPageMode &&
       this.turnPageMode?.book) {
     try {
       const book = this.turnPageMode.book;
       const view = book.turn("view");
       const pageNumber = Array.isArray(view) ? Number(view[0]) : Number(view);
       const data = book.data();
       const pageObj = data?.pageObjs?.[pageNumber];
       const img = pageObj?.find?.("img")?.get?.(0);
       if (img) {
         const rect = img.getBoundingClientRect();
         if (rect.width > 1 && rect.height > 1) {
           return { img, rect, pageNumber };
         }
       }
     } catch (_) {}
   }
   const img = this.els.viewport.querySelector("img");
   const rect = img?.getBoundingClientRect();
   if (img && rect && rect.width > 1 && rect.height > 1) {
     return { img, rect, pageNumber: this.index + 1 };
   }
   return null;
 },

 showV64TapMarker(pos, img, imgRect, relX, relY, pageNumber) {
   if (!this.els.stage || !img || !imgRect) return;
   const stageRect = this.els.stage.getBoundingClientRect();
   const old = this.els.v64TapMarker;
   if (old?.parentNode) old.remove();

   const marker = document.createElement("div");
   marker.setAttribute("aria-hidden", "true");
   Object.assign(marker.style, {
     position: "absolute",
     left: `${pos.x - stageRect.left}px`,
     top: `${pos.y - stageRect.top}px`,
     width: "22px",
     height: "22px",
     marginLeft: "-11px",
     marginTop: "-11px",
     border: "3px solid red",
     borderRadius: "50%",
     boxSizing: "border-box",
     pointerEvents: "none",
     zIndex: "9999",
     background: "rgba(255,0,0,0.08)",
     boxShadow: "0 0 0 2px rgba(255,255,255,0.85)"
   });

   const label = document.createElement("div");
   label.textContent = `V64 page ${pageNumber}  ${Math.round(relX * (img.naturalWidth - 1))},${Math.round(relY * (img.naturalHeight - 1))}`;
   Object.assign(label.style, {
     position: "absolute",
     left: "18px",
     top: "-8px",
     padding: "3px 5px",
     borderRadius: "4px",
     background: "rgba(0,0,0,0.82)",
     color: "white",
     font: "11px/1.2 monospace",
     whiteSpace: "nowrap",
     pointerEvents: "none"
   });
   marker.appendChild(label);
   this.els.stage.appendChild(marker);
   this.els.v64TapMarker = marker;
   clearTimeout(this._v64MarkerTimer);
   this._v64MarkerTimer = setTimeout(() => {
     if (this.els.v64TapMarker === marker) {
       marker.remove();
       this.els.v64TapMarker = null;
     }
   }, 3500);
 },

 // V57: DOMINANT-OUTER-CANDIDATE TAP SELECTION EXPERIMENT.
 //
 // V56 showed that strict parent/child containment is not reliable enough:
 // some detector rectangles overlap or differ by a few pixels, even when the
 // visually useful target is the larger outer region. For this experiment we
 // therefore leave detection completely unchanged and rank ONLY the candidates
 // that actually contain the tap.
 //
 // When two or more candidates contain the tap, the largest-area candidate
 // wins. This deliberately favors the dominant outer region over small child
 // detections. Children are NOT removed from currentPanels and can still be
 // inspected by later experiments.

 // V59 RETAINED FOR FUTURE REVISIT:
 // Tap-centered boundary reconstruction remains available here, but V60
 // deliberately does not call it. If V60 cannot select the correct panel
 // from existing candidates, we will return to the boundary experiment.
 async reconstructPanelAtTap(relX, relY, img, log) {
   if (!img || !img.naturalWidth || !img.naturalHeight) return null;
   try {
     return await PanelDetect.reconstructAt(
       img,
       relX,
       relY,
       log,
       this.currentPanels
     );
   } catch (err) {
     if (typeof log === "function") {
       log(`[V59] reconstruction ERROR ${err?.message || err}`);
     }
     return null;
   }
 },

 findPanelAt(relX, relY) {
   if (!this.panelZoomEnabled) return null;

   const panels = Array.isArray(this.currentPanels) ? this.currentPanels : [];

   // V60 RULE: the exact tap owns the selection.
   // Find every detector rectangle containing the tap, then choose the
   // smallest containing candidate. This is deliberately the opposite of
   // V57's dominant-outer rule: a parent may contain children, but a tap
   // inside a child should select that child rather than its parent.
   const hits = panels
     .map((candidate, index) => ({ candidate, index }))
     .filter(({ candidate }) =>
       Number.isFinite(candidate?.x) &&
       Number.isFinite(candidate?.y) &&
       Number.isFinite(candidate?.w) &&
       Number.isFinite(candidate?.h) &&
       candidate.w > 0 &&
       candidate.h > 0 &&
       relX >= candidate.x &&
       relX <= candidate.x + candidate.w &&
       relY >= candidate.y &&
       relY <= candidate.y + candidate.h
     );

   if (!hits.length) {
     if (typeof this.debugLog === "function") {
       this.debugLog(
         `[V60] PANEL SELECT tap=` +
         `${Number(relX.toFixed(4))},${Number(relY.toFixed(4))} ` +
         `total=${panels.length} hits=0 winner=-1`
       );
     }
     return null;
   }

   const areaOf = (p) =>
     Math.max(0.00000001, Number(p.w) * Number(p.h));

   const ranking = hits.slice().sort((a, b) => {
     const areaDiff = areaOf(a.candidate) - areaOf(b.candidate);
     if (Math.abs(areaDiff) > 0.00000001) return areaDiff;

     const aCX = a.candidate.x + a.candidate.w / 2;
     const aCY = a.candidate.y + a.candidate.h / 2;
     const bCX = b.candidate.x + b.candidate.w / 2;
     const bCY = b.candidate.y + b.candidate.h / 2;
     return Math.hypot(relX - aCX, relY - aCY) -
       Math.hypot(relX - bCX, relY - bCY);
   });

   const winner = ranking[0];

   if (typeof this.debugLog === "function") {
     try {
       const hitText = ranking.map(entry => {
         const p = entry.candidate;
         return `#${entry.index}` +
           `(${Number(p.x.toFixed(4))},${Number(p.y.toFixed(4))},` +
           `${Number(p.w.toFixed(4))},${Number(p.h.toFixed(4))})` +
           ` area=${Number(areaOf(p).toFixed(5))}`;
       }).join(" | ");

       const smallestArea = areaOf(winner.candidate);
       const largestArea = areaOf(ranking[ranking.length - 1].candidate);
       const ratio = smallestArea > 0 ? largestArea / smallestArea : 0;

       this.debugLog(
         `[V60] PANEL SELECT tap=` +
         `${Number(relX.toFixed(4))},${Number(relY.toFixed(4))} ` +
         `total=${panels.length} hits=${hits.length} winner=#${winner.index}`
       );
       this.debugLog(`[V60] CONTAINING CANDIDATES ${hitText}`);
       this.debugLog(
         `[V60] SMALLEST WINNER #${winner.index} ` +
         `area=${Number(smallestArea.toFixed(5))} ` +
         `largestToSmallest=${Number(ratio.toFixed(3))}`
       );
     } catch (_) {}
   }

   if (typeof this.renderPanelSelectionDiagnostic === "function") {
     this.renderPanelSelectionDiagnostic(winner.index, hits);
   }

   return winner.candidate;
 },

 togglePanelZoom() {
   this.panelZoomEnabled = !this.panelZoomEnabled;
   localStorage.setItem(PANEL_ZOOM_KEY, this.panelZoomEnabled ? "1" : "0");
 },
 updatePanelToggleUI() {
   if (this.els.panelToggle) {
     this.els.panelToggle.classList.toggle("active", this.panelZoomEnabled);
   }
 },

 toggleBubbleZoom() {
   this.bubbleZoomEnabled = !this.bubbleZoomEnabled;
   localStorage.setItem(BUBBLE_ZOOM_KEY, this.bubbleZoomEnabled ? "1" : "0");
   this.updateBubbleToggleUI();
 },
 updateBubbleToggleUI() {
   if (this.els.bubbleToggle) {
     this.els.bubbleToggle.classList.toggle("active", this.bubbleAltZoomEnabled);
   }
 },

 toggleBubbleAltZoom() {
   this.bubbleAltZoomEnabled = !this.bubbleAltZoomEnabled;
   localStorage.setItem(BUBBLE_ALT_ZOOM_KEY, this.bubbleAltZoomEnabled ? "1" : "0");
   this.updateBubbleToggleUI();
 },

 removePanelOverlay(animate = false) {
   this.panelOverlayToken++;
   const overlay = this.els.panelOverlay;
   if (!overlay) {
     this.panelFocusMeta = null;
     this.panelOverlayActive = false;
     if (this.focusMode === "panel") this.focusMode = null;
     return;
   }
   if (animate) {
     if (overlay._panelZoomOutAnimation) {
       try { overlay._panelZoomOutAnimation.cancel(); } catch (_) {}
       overlay._panelZoomOutAnimation = null;
     }

     if (overlay._panelZoomInAnimation) {
       try { overlay._panelZoomInAnimation.cancel(); } catch (_) {}
       overlay._panelZoomInAnimation = null;
     }

     const reverseDuration = 680;
     const focusedTransform = overlay.style.transform ||
       `translate3d(var(--panel-dx), var(--panel-dy), 0) scale(var(--panel-scale))`;

     this.debugLog(`panel-focus: zoom-out START duration=${reverseDuration}ms`);

     const reverse = overlay.animate(
       [
         {
           transform: focusedTransform,
           opacity: 1,
           boxShadow: "0 18px 44px rgba(0,0,0,.58)"
         },
         {
           transform: "translate3d(0,0,0) scale(1)",
           opacity: 1,
           boxShadow: "0 5px 16px rgba(0,0,0,.22)"
         }
       ],
       {
         duration: reverseDuration,
         easing: "cubic-bezier(0.22,0.78,0.24,1)",
         fill: "forwards"
       }
     );

     overlay._panelZoomOutAnimation = reverse;

     reverse.onfinish = () => {
       if (!overlay.parentNode) return;
       overlay.style.transform = "translate3d(0,0,0) scale(1)";
       overlay.style.opacity = "1";
       overlay.style.boxShadow = "0 5px 16px rgba(0,0,0,.22)";
       overlay._panelZoomOutAnimation = null;
       overlay.remove();
       this.debugLog("panel-focus: zoom-out COMPLETE");
       this.debugLog("panel-focus: overlay REMOVED");
     };

     reverse.oncancel = () => {
       if (overlay._panelZoomOutAnimation === reverse) {
         overlay._panelZoomOutAnimation = null;
       }
       this.debugLog("panel-focus: zoom-out CANCELLED");
     };
   } else if (overlay.parentNode) {
     overlay.remove();
   }
   this.els.panelOverlay = null;
   this.panelOverlayActive = false;
   if (this.focusMode === "panel") this.focusMode = null;
 },

 removeBubbleOverlay(animate = false) {
   const overlay = this.els.bubbleOverlay;
   if (overlay && animate) {
     overlay.classList.remove("active");
     overlay.classList.add("closing");
     setTimeout(() => {
       if (overlay.parentNode) overlay.remove();
     }, 260);
     this.els.bubbleOverlay = null;
     this.bubbleOverlayActive = false;
     this.focusMode = null;
     this.setFocusDim(false, true);
     return;
   }
   if (overlay) overlay.remove();
   this.els.bubbleOverlay = null;
   this.bubbleOverlayActive = false;
   if (this.focusMode === "bubble") this.focusMode = null;
 },

 openHelpDrawer() {
   this.els.helpDrawer.classList.add("open");
   this.showChrome(true);
 },
 closeHelpDrawer() {
   this.els.helpDrawer.classList.remove("open");
 },

 debugMode: false,
 debugLines: [],
 bindDebugToggle() {
   let taps = 0;
   let resetTimer = null;
   this.els.title.addEventListener("click", () => {
     taps++;
     clearTimeout(resetTimer);
     resetTimer = setTimeout(() => { taps = 0; }, 1500);
     if (taps >= 5) {
       taps = 0;
       this.debugMode = !this.debugMode;
       this.els.debugPanel.style.display = this.debugMode ? "block" : "none";
       this.debugLines = [];
       if (!this.debugMode) this.removePanelDiagnosticOverlay();
       this.debugLog(this.debugMode ? "— debug on —" : "— debug off —");
       if (this.debugMode) {
         this.debugLog(`panelZoomEnabled=${this.panelZoomEnabled} bubbleZoomEnabled=${this.bubbleZoomEnabled} bubbleAltZoomEnabled=${this.bubbleAltZoomEnabled}`);
         if (this.comic) this.loadPanelsForCurrentPage();
       }
     }
   });
 },
 debugLog(msg) {
   if (!this.debugMode) return;
   const t = new Date().toISOString().slice(11, 23);
   this.debugLines.push(`${t} ${msg}`);
   if (this.debugLines.length > 40) this.debugLines.shift();
   this.els.debugPanel.textContent = this.debugLines.join("\n");
   this.els.debugPanel.scrollTop = this.els.debugPanel.scrollHeight;
 },

 applyModeClass() {
   this.els.viewport.className = "page-viewport";
   this.els.stage.classList.toggle("mode-two-page", this.mode === "two-page");
   this.els.stage.classList.toggle("mode-scroll", this.mode === "scroll" || this.mode === "webcomic");
   this.els.stage.classList.toggle("mode-manga", this.mode === "manga");
 },

 updateModePills() {
   document.querySelectorAll(".reader-modes .mode-pill").forEach((btn) => {
     btn.classList.toggle("active", btn.dataset.mode === this.mode);
   });
 },

 updateThemeSwatches() {
   document.querySelectorAll(".theme-swatch").forEach((btn) => {
     btn.classList.toggle("active", btn.dataset.theme === this.theme);
   });
 },
 syncIndexFromVisiblePage() {
   if (!(this.mode === "scroll" || this.mode === "manga" || this.mode === "webcomic")) {
     return this.index;
   }

   const stage = this.els.stage;
   if (!stage) return this.index;

   const stageRect = stage.getBoundingClientRect();
   const horizontal = this.mode === "scroll" || this.mode === "manga";
   const pages = Array.from(stage.querySelectorAll(".scroll-page"));
   if (!pages.length) return this.index;

   const start = horizontal ? stageRect.left : stageRect.top;
   const end = horizontal ? stageRect.right : stageRect.bottom;
   const viewportSpan = Math.max(1, end - start);

   let bestIndex = this.index;
   let bestScore = -1;

   for (const page of pages) {
     const i = Number(page.dataset.index);
     if (!Number.isInteger(i)) continue;

     const rect = page.getBoundingClientRect();
     const pageStart = horizontal ? rect.left : rect.top;
     const pageEnd = horizontal ? rect.right : rect.bottom;
     const visible = Math.max(
       0,
       Math.min(end, pageEnd) - Math.max(start, pageStart)
     );
     if (visible <= 0) continue;

     // Prefer the page occupying the greatest share of the viewport. A small
     // tie-break toward the viewport center prevents a barely-visible page at
     // an edge from stealing the current index.
     const pageSpan = Math.max(1, pageEnd - pageStart);
     const visibleRatio = Math.min(1, visible / pageSpan);
     const pageCenter = (pageStart + pageEnd) / 2;
     const viewportCenter = (start + end) / 2;
     const centerDistance = Math.abs(pageCenter - viewportCenter) / viewportSpan;
     const score = visibleRatio * 100 - centerDistance;

     if (score > bestScore) {
       bestScore = score;
       bestIndex = i;
     }
   }

   if (bestIndex !== this.index) {
     this.debugLog(`visible-page sync: ${this.index + 1} -> ${bestIndex + 1}`);
     this.index = bestIndex;
     this.updateSliderLabel();
     this.updateBookmarkFlag();
   }

   return this.index;
 },

 async waitForViewportRecovery(previousWidth = 0, previousHeight = 0) {
   const stage = this.els.stage;
   const viewport = window.visualViewport;

   const initialWidth = stage?.clientWidth || 0;
   const initialHeight = stage?.clientHeight || 0;
   const changed = (w, h) =>
     (w > 0 && h > 0) &&
     (Math.abs(w - previousWidth) > 1 || Math.abs(h - previousHeight) > 1 ||
      Math.abs(w - initialWidth) > 1 || Math.abs(h - initialHeight) > 1);

   await new Promise(resolve => {
     let settledFrames = 0;
     let lastW = stage?.clientWidth || 0;
     let lastH = stage?.clientHeight || 0;
     let finished = false;

     const finish = () => {
       if (finished) return;
       finished = true;
       window.removeEventListener("resize", onResize);
       viewport?.removeEventListener("resize", onResize);
       resolve();
     };

     const onResize = () => {
       settledFrames = 0;
     };

     window.addEventListener("resize", onResize, { passive: true });
     viewport?.addEventListener("resize", onResize, { passive: true });

     const tick = () => {
       const w = stage?.clientWidth || 0;
       const h = stage?.clientHeight || 0;
       const stable = w === lastW && h === lastH && w > 0 && h > 0;
       if (stable) settledFrames++;
       else settledFrames = 0;
       lastW = w;
       lastH = h;

       // Two stable frames is enough once the browser has reported a valid
       // non-zero viewport. Hard timeout prevents a device/browser quirk
       // from blocking mode changes indefinitely.
       if (settledFrames >= 2 && changed(w, h)) return finish();
       requestAnimationFrame(tick);
     };

     requestAnimationFrame(tick);
     setTimeout(finish, 900);
   });

   // One final frame lets layout/style recalculation catch up after the
   // resize/orientation event before the new mode measures the stage.
   await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
 },


 isLandscapeViewport() {
   return window.matchMedia?.("(orientation: landscape)")?.matches ??
     (window.innerWidth > window.innerHeight);
 },

 updateTwoPageFullscreenButton() {
   const btn = this.els.twoPageExitFullscreen;
   if (!btn) return;
   const visible = this.mode === "two-page" &&
     !!document.fullscreenElement &&
     this.isLandscapeViewport();
   btn.hidden = !visible;
   btn.classList.toggle("is-visible", visible);
 },

 handleTwoPageFullscreenChange() {
   // If the browser/system exits fullscreen while Two Page remains active,
   // release our orientation lock too and simply continue in Two Page portrait.
   if (this.mode === "two-page" && !document.fullscreenElement &&
       this._twoPageEnteredFullscreen) {
     if (this._twoPageOrientationLocked && screen.orientation?.unlock) {
       try { screen.orientation.unlock(); } catch (_) {}
     }
     this._twoPageOrientationLocked = false;
     this._twoPageEnteredFullscreen = false;
   }
   this.updateTwoPageFullscreenButton();
 },

 async enterTwoPageFullscreenLandscape() {
   // Request fullscreen immediately from the mode-button gesture. This is
   // more reliable on mobile browsers than waiting for orientation locking.
   if (!document.fullscreenElement && this.els.view?.requestFullscreen) {
     try {
       await this.els.view.requestFullscreen({ navigationUI: "hide" });
       this._twoPageEnteredFullscreen = true;
       this.debugLog("two-page: entered fullscreen");
     } catch (err) {
       this.debugLog(`two-page: fullscreen unavailable: ${err?.message || err}`);
     }
   }

   let locked = false;
   if (screen.orientation?.lock) {
     try {
       await screen.orientation.lock("landscape-primary");
       locked = true;
       this.debugLog("two-page: landscape-primary orientation locked");
     } catch (err) {
       try {
         await screen.orientation.lock("landscape");
         locked = true;
         this.debugLog("two-page: landscape orientation locked");
       } catch (err2) {
         this.debugLog("two-page: orientation lock unavailable");
       }
     }
   }
   this._twoPageOrientationLocked = locked;

   if (locked || document.fullscreenElement) {
     await new Promise(resolve => requestAnimationFrame(() =>
       requestAnimationFrame(resolve)));
   }
   this.updateTwoPageFullscreenButton();
 },

 async exitTwoPageFullscreen() {
   if (this._twoPageOrientationLocked && screen.orientation?.unlock) {
     try { screen.orientation.unlock(); } catch (_) {}
   }
   this._twoPageOrientationLocked = false;

   if (document.fullscreenElement && document.exitFullscreen) {
     try { await document.exitFullscreen(); } catch (_) {}
   }
   this._twoPageEnteredFullscreen = false;
   this.updateTwoPageFullscreenButton();

   // Re-measure the existing Two Page layout after the viewport returns.
   await new Promise(resolve => requestAnimationFrame(() =>
     requestAnimationFrame(resolve)));
   if (this.mode === "two-page") {
     await this.renderTwoPage();
     this.updateSliderLabel();
   }
 },

  _isAutoScrollInteractiveTarget(target) {
    if (!target) return false;
    return !!target.closest("input, button, select, option, a, label");
  },

  startAutoScrollPanelDrag(event) {
    const panel = this.els.autoScrollPanel;
    if (!panel || event.pointerType === "mouse" && event.button !== 0) return;
    if (this._isAutoScrollInteractiveTarget(event.target)) return;

    const rect = panel.getBoundingClientRect();
    this._autoScrollDrag = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startLeft: rect.left,
      startTop: rect.top,
      moved: false
    };

    panel.setPointerCapture?.(event.pointerId);
    panel.style.transform = "none";
    panel.classList.add("is-dragging");
    this.keepAutoScrollControlsVisible();
    event.preventDefault();
  },

  moveAutoScrollPanelDrag(event) {
    const drag = this._autoScrollDrag;
    const panel = this.els.autoScrollPanel;
    if (!drag || !panel || event.pointerId !== drag.pointerId) return;

    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    if (Math.hypot(dx, dy) > 3) drag.moved = true;

    const vw = document.documentElement.clientWidth;
    const vh = document.documentElement.clientHeight;
    const rect = panel.getBoundingClientRect();

    const maxLeft = Math.max(0, vw - rect.width);
    const maxTop = Math.max(0, vh - rect.height);

    const left = Math.max(0, Math.min(maxLeft, drag.startLeft + dx));
    const top = Math.max(0, Math.min(maxTop, drag.startTop + dy));

    panel.style.left = `${left}px`;
    panel.style.right = "auto";
    panel.style.top = `${top}px`;
    panel.style.transform = "none";
    panel.style.bottom = "auto";
    event.preventDefault();
  },

  endAutoScrollPanelDrag(event) {
    const drag = this._autoScrollDrag;
    const panel = this.els.autoScrollPanel;
    if (!drag || !panel || event.pointerId !== drag.pointerId) return;

    panel.releasePointerCapture?.(event.pointerId);
    panel.classList.remove("is-dragging");

    const wasMoved = drag.moved;
    this._autoScrollDrag = null;

    if (wasMoved) {
      const rect = panel.getBoundingClientRect();
      try {
        localStorage.setItem("nthShelfAutoScrollPanelPosition",
          JSON.stringify({ left: rect.left, top: rect.top }));
      } catch (_) {}
    }

    this.revealAutoScrollControls();
  },

  restoreAutoScrollPanelPosition() {
    const panel = this.els.autoScrollPanel;
    if (!panel) return;

    try {
      const raw = localStorage.getItem("nthShelfAutoScrollPanelPosition");
      if (!raw) return;
      const pos = JSON.parse(raw);
      if (!Number.isFinite(pos.left) || !Number.isFinite(pos.top)) return;

      const rect = panel.getBoundingClientRect();
      const vw = document.documentElement.clientWidth;
      const vh = document.documentElement.clientHeight;
      const left = Math.max(0, Math.min(Math.max(0, vw - rect.width), pos.left));
      const top = Math.max(0, Math.min(Math.max(0, vh - rect.height), pos.top));

      panel.style.left = `${left}px`;
      panel.style.right = "auto";
      panel.style.top = `${top}px`;
      panel.style.bottom = "auto";
      panel.style.transform = "none";
    } catch (_) {}
  },

  revealAutoScrollControls() {
    const panel = this.els.autoScrollPanel;
    if (!panel) return;

    panel.classList.add("is-visible");

    if (this._autoScrollControlHideTimer) {
      clearTimeout(this._autoScrollControlHideTimer);
    }

    if (this._autoScrollEnabled && !this._autoScrollPaused) {
      this._autoScrollControlHideTimer = setTimeout(() => {
        panel.classList.remove("is-visible");
        this._autoScrollControlHideTimer = null;
      }, 900);
    }
  },

  keepAutoScrollControlsVisible() {
    const panel = this.els.autoScrollPanel;
    if (!panel) return;

    if (this._autoScrollControlHideTimer) {
      clearTimeout(this._autoScrollControlHideTimer);
      this._autoScrollControlHideTimer = null;
    }
    panel.classList.add("is-visible");
  },

  updateAutoScrollControl() {
    const btn = this.els.autoScrollToggle;
    const panel = this.els.autoScrollPanel;
    const play = this.els.autoScrollPlay;
    if (!btn) return;

    const allowed =
      this.mode === "scroll" ||
      this.mode === "manga" ||
      this.mode === "webcomic";

    const active = allowed && this._autoScrollEnabled;

    btn.hidden = !allowed;
    btn.classList.toggle("active", active);
    btn.classList.toggle("is-active", active);
    btn.setAttribute("aria-pressed", String(active));

    if (panel) {
      panel.hidden = !active;
      if (!active) {
        panel.classList.remove("is-visible");
        if (this._autoScrollControlHideTimer) {
          clearTimeout(this._autoScrollControlHideTimer);
          this._autoScrollControlHideTimer = null;
        }
      } else {
        this.revealAutoScrollControls();
      }
    }

    if (play) {
      const paused = active && this._autoScrollPaused;
      play.classList.toggle("is-paused", paused);
      play.setAttribute("aria-pressed", String(paused));
      play.setAttribute("aria-label", paused ? "Play Auto Scroll" : "Pause Auto Scroll");
      play.title = paused ? "Play Auto Scroll" : "Pause Auto Scroll";
      play.innerHTML = `<span aria-hidden="true">${paused ? "▶" : "Ⅱ"}</span>`;
    }
  },

  stopAutoScroll() {
    if (this._autoScrollAnimation) {
      cancelAnimationFrame(this._autoScrollAnimation);
    }
    this._autoScrollAnimation = null;
    this._autoScrollLastTime = 0;
    this._autoScrollEnabled = false;
    this._autoScrollPaused = false;
    this.updateAutoScrollControl();
  },

  startAutoScroll() {
    const allowed =
      this.mode === "scroll" ||
      this.mode === "manga" ||
      this.mode === "webcomic";

    const stage = this.els.stage;
    if (!allowed || !stage || this._autoScrollAnimation) return;

    this._autoScrollEnabled = true;
    this._autoScrollPaused = false;
    this._autoScrollLastTime = 0;
    this.updateAutoScrollControl();

    const tick = (now) => {
      if (!this._autoScrollEnabled || this._autoScrollPaused) {
        this._autoScrollAnimation = null;
        this._autoScrollLastTime = 0;
        this.updateAutoScrollControl();
        return;
      }

      const mode = this.mode;
      if (mode !== "scroll" && mode !== "manga" && mode !== "webcomic") {
        this.stopAutoScroll();
        return;
      }

      if (!this._autoScrollLastTime) this._autoScrollLastTime = now;
      const dt = Math.min(now - this._autoScrollLastTime, 50);
      this._autoScrollLastTime = now;

      const speed = Number(this._autoScrollSpeed || 0);
      const distance = speed * dt / 1000;

      if (mode === "webcomic") {
        const maxY = Math.max(0, stage.scrollHeight - stage.clientHeight);
        const nextY = Math.max(0, Math.min(maxY, stage.scrollTop + distance));
        stage.scrollTop = nextY;

        if ((speed > 0 && nextY >= maxY - 1) || (speed < 0 && nextY <= 1)) {
          this.stopAutoScroll();
          return;
        }
      } else if (mode === "manga") {
        const maxX = Math.max(0, stage.scrollWidth - stage.clientWidth);
        const minX = -maxX;
        const nextX = Math.max(minX, Math.min(0, stage.scrollLeft - distance));
        stage.scrollLeft = nextX;

        if ((speed > 0 && nextX <= minX + 1) || (speed < 0 && nextX >= -1)) {
          this.stopAutoScroll();
          return;
        }
      } else {
        const maxX = Math.max(0, stage.scrollWidth - stage.clientWidth);
        const nextX = Math.max(0, Math.min(maxX, stage.scrollLeft + distance));
        stage.scrollLeft = nextX;

        if ((speed > 0 && nextX >= maxX - 1) || (speed < 0 && nextX <= 1)) {
          this.stopAutoScroll();
          return;
        }
      }

      this._autoScrollAnimation = requestAnimationFrame(tick);
    };

    this._autoScrollAnimation = requestAnimationFrame(tick);
  },

  pauseAutoScroll() {
    if (!this._autoScrollEnabled || this._autoScrollPaused) return;
    if (this._autoScrollAnimation) cancelAnimationFrame(this._autoScrollAnimation);
    this._autoScrollAnimation = null;
    this._autoScrollLastTime = 0;
    this._autoScrollPaused = true;
    this.revealAutoScrollControls();
    this.updateAutoScrollControl();
  },

  resumeAutoScroll() {
    if (!this._autoScrollEnabled || !this._autoScrollPaused) return;
    this._autoScrollPaused = false;
    this._autoScrollLastTime = 0;
    this.updateAutoScrollControl();
    this.startAutoScroll();
  },

  toggleAutoScrollPause() {
    if (!this._autoScrollEnabled) return;
    if (this._autoScrollPaused) this.resumeAutoScroll();
    else this.pauseAutoScroll();
  },

  setAutoScrollSpeed(value) {
    const speed = Number(value);
    if (!Number.isFinite(speed)) return;
    this._autoScrollSpeed = Math.max(0, Math.min(2, speed)) * 38;
  },

  toggleAutoScroll() {
    if (this._autoScrollEnabled) this.stopAutoScroll();
    else this.startAutoScroll();
  },

  applyAndroidPageViewportReserve() {
    if (!this.els.viewport) return;

    // Only Page mode gets the reserved top area. Other modes retain their
    // existing geometry.
    const isPageMode = this.mode === "single";
    if (!isPageMode) {
      this.els.viewport.style.marginTop = "";
      this.els.viewport.style.height = "";
      this.els.viewport.style.boxSizing = "";
      return;
    }

    const reserve = this.androidPageTopReserve || 48;
    const stageHeight = this.els.stage?.clientHeight || 0;

    if (stageHeight > reserve) {
      this.els.viewport.style.height = `${stageHeight - reserve}px`;
      this.els.viewport.style.marginTop = `${reserve}px`;
      this.els.viewport.style.boxSizing = "border-box";
    }
  },

async setMode(mode) {

  this.stopAutoScroll();
   if (mode === this.mode) return;
   this.debugLog(`setMode: ${this.mode} -> ${mode}`);

   const wasContinuous = this.mode === "scroll" || this.mode === "manga" || this.mode === "webcomic";
   const enteringTwoPage = mode === "two-page" && this.mode !== "two-page";
   const leavingTwoPage = this.mode === "two-page" && mode !== "two-page";

   // Two Page owns the shared viewport with inline layout styles. Clear those
   // styles before a continuous mode gets a chance to measure/rebuild it.
   // The mode-specific CSS will then provide the correct display/size/overflow.
   if (leavingTwoPage) {
     if (this._twoPageOrientationLocked && screen.orientation?.unlock) {
       try { screen.orientation.unlock(); } catch (_) {}
     }
     this._twoPageOrientationLocked = false;
     if (this._twoPageEnteredFullscreen && document.fullscreenElement && document.exitFullscreen) {
       try { await document.exitFullscreen(); } catch (_) {}
     }
     this._twoPageEnteredFullscreen = false;
     this.updateTwoPageFullscreenButton();

     this._continuousHandoffIndex = this.index;
     this._continuousHandoffPending = true;

     this.els.stage.style.overflow = "";
     this.els.viewport.style.display = "";
     this.els.viewport.style.width = "";
     this.els.viewport.style.height = "";
     this.els.viewport.style.transform = "";
     this.els.viewport.style.overflow = "";
     this.els.viewport.style.flexDirection = "";
     this.els.viewport.style.alignItems = "";
     this.els.viewport.style.justifyContent = "";
     this.els.viewport.style.gap = "";
   }

   // The IntersectionObserver is intentionally only a convenience for keeping
   // the slider current. The actual page visible at the instant of a mode
   // switch is the authoritative source of truth.
   if (wasContinuous) {
     this.syncIndexFromVisiblePage();
   }

   if (this._scrollObserver) { this._scrollObserver.disconnect(); this._scrollObserver = null; }

   if (this.mode === "single" && mode !== "single" && this.turnPageMode) {
     await this.turnPageMode.destroy();
     // Turn.js hides its shared host on destroy; other modes need it visible.
     this.els.viewport.style.display = "";
   }

   this.mode = mode;
   this.comic.readMode = mode;
   LongboxDB.updateComic(this.comic.id, { readMode: mode });
   this.applyModeClass();
   this.updateModePills();
   this.updateAutoScrollControl();

   if (enteringTwoPage) {
     await this.enterTwoPageFullscreenLandscape();
   }

   await this.render();
   this.applyAndroidPageViewportReserve();
   this.showChrome();
 },

 setTheme(theme) {
   this.theme = theme;
   this.comic.theme = theme;
   LongboxDB.updateComic(this.comic.id, { theme });
   this.applyTheme();
   this.updateThemeSwatches();
 },

 applyTheme() {
   this.els.view.classList.remove("theme-sepia", "theme-light");
   if (this.theme === "sepia") this.els.view.classList.add("theme-sepia");
   if (this.theme === "light") this.els.view.classList.add("theme-light");
 },

 updateSliderLabel() {
   this.els.slider.value = this.index;
   this.els.sliderLabel.textContent = `${this.index + 1} / ${this.comic.pageCount}`;
 },

 updateBookmarkFlag() {
   const marked = (this.comic.bookmarks || []).includes(this.index);
   this.els.bookmarkFlag.style.display = marked ? "block" : "none";
 },

 toggleBookmark() {
   const bookmarks = this.comic.bookmarks || (this.comic.bookmarks = []);
   const pos = bookmarks.indexOf(this.index);
   if (pos >= 0) bookmarks.splice(pos, 1);
   else bookmarks.push(this.index);
   LongboxDB.updateComic(this.comic.id, { bookmarks });
   this.updateBookmarkFlag();
 },

 goTo(i, opts = {}) {
   i = Math.max(0, Math.min(this.comic.pageCount - 1, i));
   if (this.mode === "single" && this.useTurnJSPageMode && this.turnPageMode?.book) {
     if (i === this.index && !opts.fromSlider) return;
     this.turnPageMode.goTo(i);
     return;
   }

   if (i === this.index && !opts.fromSlider) return;
   this.index = i;
   if (this.mode === "scroll" || this.mode === "webcomic" || this.mode === "manga") {
     const target = this.els.stage.querySelector(`.scroll-page[data-index="${i}"]`);
     if (target) target.scrollIntoView({ block: "start", behavior: opts.fromSlider ? "auto" : "smooth" });
     this.updateSliderLabel();
     this.updateBookmarkFlag();
     this.saveProgress();
   } else if (this.mode === "two-page") {
     this.render();
   } else {
     this.render();
   }
 },
  clearPanelFocusForNavigation() {
    if (this.focusMode === "panel" || this.panelOverlayActive) {
      this.resetZoom({ animate: false });
    }
  },


 next() {


   this._deferredPanelTap = null;


   this.clearPanelFocusForNavigation();
   this.showChrome();
   if (this.mode === "single" && this.useTurnJSPageMode && this.turnPageMode?.book && this.scale <= 1.02) {
     this.turnPageMode.next();
     return;
   }

   if (this.mode === "single" && this.scale <= 1.02 && this.nativePageTurn) {
     this.nativePageTurn.turn("next").then(handled => {
       if (!handled && !this.nativePageTurn.running) this.goTo(this.index + 1);
     });
     return;
   }
   const step = this.mode === "two-page" ? 2 : 1;
   this.goTo(this.index + step);
 },

 prev() {

   this._deferredPanelTap = null;

   this.clearPanelFocusForNavigation();
   this.showChrome();
   if (this.mode === "single" && this.useTurnJSPageMode && this.turnPageMode?.book && this.scale <= 1.02) {
     this.turnPageMode.prev();
     return;
   }

   if (this.mode === "single" && this.scale <= 1.02 && this.nativePageTurn) {
     this.nativePageTurn.turn("prev").then(handled => {
       if (!handled && !this.nativePageTurn.running) this.goTo(this.index - 1);
     });
     return;
   }
   const step = this.mode === "two-page" ? 2 : 1;
   this.goTo(this.index - step);
 },

 saveProgress() {
   if (!this.comic) return;
   LongboxDB.updateComic(this.comic.id, { lastPage: this.index });
 },

 throttledSaveProgress() {
   clearTimeout(this._saveTimer);
   this._saveTimer = setTimeout(() => this.saveProgress(), 400);
 },

 showChrome(persist) {
   this.debugLog(`showChrome(persist=${!!persist})`);
   this.chromeVisible = true;
   this.els.chrome.classList.add("visible");
   clearTimeout(this.chromeTimer);
   if (!persist) {
     this.chromeTimer = setTimeout(() => { this.debugLog("auto-hideChrome (1.0s timer)"); this.hideChrome(); }, 1000);
   }
 },

 hideChrome() {
   this.debugLog("hideChrome()");
   this.chromeVisible = false;
   this.els.chrome.classList.remove("visible");
 },

 toggleChrome() {
   if (this.chromeVisible) this.hideChrome();
   else this.showChrome();
 },

 resetZoom(opts = {}) {
   const animate = opts.animate !== false;
   this.panelFocusMeta = null;
   this.removePanelOverlay(animate);
   this.removeBubbleOverlay();
   this.focusMode = null;
   if (this.focusAnimationTimer) clearTimeout(this.focusAnimationTimer);
   this.focusAnimationTimer = null;
   this.setFocusDim(false, animate);
   if (animate) this.els.viewport.classList.add("reader-focus-transition");
   this.scale = 1; this.tx = 0; this.ty = 0;
   this.applyTransform();
   if (animate) {
     this.focusAnimationTimer = setTimeout(() => {
       this.els.viewport.classList.remove("reader-focus-transition");
       this.focusAnimationTimer = null;
     }, 360);
   } else {
     this.els.viewport.classList.remove("reader-focus-transition");
   }
 },

 setFocusDim(active, animate = true) {
   if (!this.els.stage) return;
   let dim = this.els.focusDim;
   if (!dim) {
     dim = document.createElement("div");
     dim.className = "reader-focus-dim";
     dim.setAttribute("aria-hidden", "true");
     this.els.stage.appendChild(dim);
     this.els.focusDim = dim;
   }

   // Continuous readers scroll the .reader-stage itself. An absolute dim
   // would stay at scrollTop 0 and disappear when the reader is down the
   // issue. Keep the dim fixed to the visible reader-stage rectangle in
   // Scroll/Manga/Webcomic. Page/Two Page retain their proven behavior.
   const continuous =
     this.mode === "scroll" ||
     this.mode === "manga" ||
     this.mode === "webcomic";

   if (active && continuous) {
     const rect = this.els.stage.getBoundingClientRect();
     dim.style.position = "fixed";
     dim.style.left = `${rect.left}px`;
     dim.style.top = `${rect.top}px`;
     dim.style.width = `${rect.width}px`;
     dim.style.height = `${rect.height}px`;
     // Reader chrome lives above the stage at z-index 5. The bubble uses
     // z-index 120, so the dim sits between content and chrome.
     dim.style.zIndex = "4";
   } else {
     dim.style.position = "";
     dim.style.left = "";
     dim.style.top = "";
     dim.style.width = "";
     dim.style.height = "";
     dim.style.zIndex = "";
   }

   if (!animate) dim.classList.add("no-transition");
   else dim.classList.remove("no-transition");
   dim.classList.toggle("active", active);
 },

 applyTransform() {
   this.els.viewport.style.transform = `translate(${this.tx}px, ${this.ty}px) scale(${this.scale})`;
 },

 constrainPan() {
   // Utility bounds computation for scale translations
   if (this.scale <= 1) {
     this.tx = 0;
     this.ty = 0;
     return;
   }
   const stageRect = this.els.stage.getBoundingClientRect();
   const maxTx = (stageRect.width * (this.scale - 1)) / 2;
   const maxTy = (stageRect.height * (this.scale - 1)) / 2;
   this.tx = clamp(this.tx, -maxTx, maxTx);
   this.ty = clamp(this.ty, -maxTy, maxTy);
 },

 bindGestures() {
   const stage = this.els.stage;
   let touches = [];
   let pinchStartDist = 0;
   let pinchStartScale = 1;
   let pinchStartMid = null;
   let pinchStartTx = 0;
   let pinchStartTy = 0;
   let wasPinching = false;
   let panStart = null;
   let continuousTapStart = null;
   let continuousHoldTimer = null;
   let continuousHoldFired = false;
   let dragMoved = false;
   let lastTapTime = 0;
   let lastTapPos = null;
   let pendingTapTimer = null;
   let holdTimer = null;
   let holdFired = false;
   let twoPageGestureStart = null;
   let twoPageGestureMoved = false;

   const dist = (a, b) => Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
   const mid = (a, b) => ({ x: (a.clientX + b.clientX) / 2, y: (a.clientY + b.clientY) / 2 });

   const getContinuousTargetAtPoint = (screenX, screenY) => {
     if (!(this.mode === "scroll" || this.mode === "webcomic" || this.mode === "manga" || this.mode === "two-page")) return null;
     const pages = Array.from(this.els.stage.querySelectorAll(".scroll-page, .two-page-page"));
     for (const page of pages) {
       const img = page.querySelector("img");
       if (!img) continue;
       const rect = img.getBoundingClientRect();
       if (rect.width < 2 || rect.height < 2) continue;
       if (screenX >= rect.left && screenX <= rect.right &&
           screenY >= rect.top && screenY <= rect.bottom) {
         const pageIndex = Number(page.dataset.index);
         if (!Number.isInteger(pageIndex)) continue;
         return { page, img, imgRect: rect, pageIndex };
       }
     }
     return null;
   };

   const triggerContinuousHold = async (screenX, screenY) => {
     continuousHoldFired = true;
     continuousTapStart = null;

     if (!this.bubbleZoomEnabled) return;
     if (this.bubbleOverlayActive) {
       this.removeBubbleOverlay(true);
       return;
     }

     const target = getContinuousTargetAtPoint(screenX, screenY);
     if (!target) return;

     const stageRect = this.els.stage.getBoundingClientRect();
     const relXImg = clamp((screenX - target.imgRect.left) / target.imgRect.width, 0, 1);
     const relYImg = clamp((screenY - target.imgRect.top) / target.imgRect.height, 0, 1);
     const comicId = this.comic?.id;
     const pageIndex = target.pageIndex;

     const url = await this.getPageUrl(pageIndex);
     if (!url) return;

     const logger = this.debugMode
       ? (msg) => this.debugLog(`[bubble-continuous] ${msg}`)
       : null;
     const bubble = await BubbleDetect.detect(url, relXImg, relYImg, logger);

     if (!this.comic || this.comic.id !== comicId) return;

     const fresh = getContinuousTargetAtPoint(screenX, screenY);
     const displayTarget = fresh && fresh.pageIndex === pageIndex ? fresh : target;

     if (bubble) {
       this.showBubbleOverlay(bubble, stageRect, displayTarget.imgRect, displayTarget.page);
     }
   };

   const handleContinuousDoubleTap = async (screenX, screenY) => {
     if (!this.bubbleAltZoomEnabled) return;
     if (this.bubbleOverlayActive) {
       this.removeBubbleOverlay(true);
       return;
     }

     const target = getContinuousTargetAtPoint(screenX, screenY);
     if (!target) return;

     const stageRect = this.els.stage.getBoundingClientRect();
     const relXImg = clamp((screenX - target.imgRect.left) / target.imgRect.width, 0, 1);
     const relYImg = clamp((screenY - target.imgRect.top) / target.imgRect.height, 0, 1);
     const comicId = this.comic?.id;
     const pageIndex = target.pageIndex;

     const url = await this.getPageUrl(pageIndex);
     if (!url) return;

     const logger = this.debugMode
       ? (msg) => this.debugLog(`[bubble-alt-continuous] ${msg}`)
       : null;
     const bubble = await BubbleDetect.extract(url, relXImg, relYImg, logger);

     if (!this.comic || this.comic.id !== comicId) return;

     const fresh = getContinuousTargetAtPoint(screenX, screenY);
     const displayTarget = fresh && fresh.pageIndex === pageIndex ? fresh : target;

     if (bubble) {
       this.showBubbleOverlay(bubble, stageRect, displayTarget.imgRect, displayTarget.page);
     }
   };

   const triggerHold = async (screenX, screenY) => {
     holdFired = true;
     dragMoved = true;
     panStart = null;

     if (!this.bubbleZoomEnabled || this.mode !== "single") return;

     if (this.scale > 1.02) {
       this.resetZoom();
       return;
     }
     if (!this.comic) return;

     const stageRect = this.els.stage.getBoundingClientRect();
     const img = this.els.viewport.querySelector("img");
     const imgRect = img ? img.getBoundingClientRect() : stageRect;
     const relXImg = clamp((screenX - imgRect.left) / imgRect.width, 0, 1);
     const relYImg = clamp((screenY - imgRect.top) / imgRect.height, 0, 1);

     const comicId = this.comic.id;
     const pageIndex = this.index;
     const url = await this.getPageUrl(pageIndex);
     if (!url) return;
     const logger = this.debugMode ? (msg) => this.debugLog(`[bubble] ${msg}`) : null;
     const bubble = await BubbleDetect.detect(url, relXImg, relYImg, logger);

     if (!this.comic || this.comic.id !== comicId || this.index !== pageIndex) return;

     if (bubble) {
       this.zoomToBubble(bubble, stageRect, imgRect);
     } else {
       this.zoomAtPoint(screenX, screenY, 2.4, stageRect);
     }
   };

   stage.addEventListener("touchstart", (e) => {
     if (this.mode === "two-page") {
       if (e.touches.length === 1) {
         const t = e.touches[0];
         twoPageGestureStart = { x: t.clientX, y: t.clientY };
         twoPageGestureMoved = false;
         continuousHoldFired = false;
         clearTimeout(continuousHoldTimer);
         continuousHoldTimer = setTimeout(
           () => triggerContinuousHold(t.clientX, t.clientY),
           HOLD_MS
         );
       } else {
         twoPageGestureStart = null;
         twoPageGestureMoved = true;
         continuousHoldFired = false;
         clearTimeout(continuousHoldTimer);
         continuousHoldTimer = null;
       }
       return;
     }

     if (this.mode === "scroll" || this.mode === "webcomic" || this.mode === "manga") {
       if (e.touches.length === 1) {
         const t = e.touches[0];
         continuousTapStart = { x: t.clientX, y: t.clientY };
         continuousHoldFired = false;
         clearTimeout(continuousHoldTimer);
         continuousHoldTimer = setTimeout(
           () => triggerContinuousHold(t.clientX, t.clientY),
           HOLD_MS
         );
       } else {
         continuousTapStart = null;
         continuousHoldFired = false;
         clearTimeout(continuousHoldTimer);
         continuousHoldTimer = null;
       }
       return;
     }
     e.preventDefault();
     touches = Array.from(e.touches);
     dragMoved = false;
     if (touches.length === 2) {
       if (this.focusMode) {
         dragMoved = true;
         clearTimeout(holdTimer); holdTimer = null;
         return;
       }
       pinchStartDist = Math.max(1, dist(touches[0], touches[1]));
       pinchStartScale = this.scale;
       pinchStartMid = mid(touches[0], touches[1]);
       pinchStartTx = this.tx;
       pinchStartTy = this.ty;
       wasPinching = true;
       panStart = null;
       clearTimeout(holdTimer);
       holdTimer = null;
     } else if (touches.length === 1) {
       panStart = { x: touches[0].clientX, y: touches[0].clientY, tx: this.tx, ty: this.ty };
       holdFired = false;
       clearTimeout(holdTimer);
       const hx = touches[0].clientX, hy = touches[0].clientY;
       holdTimer = setTimeout(() => triggerHold(hx, hy), HOLD_MS);
     }
   }, { passive: false });

   stage.addEventListener("touchmove", (e) => {
     if (this.mode === "two-page") {
       if (twoPageGestureStart && e.touches.length === 1) {
         const dx = e.touches[0].clientX - twoPageGestureStart.x;
         const dy = e.touches[0].clientY - twoPageGestureStart.y;
         if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
           twoPageGestureMoved = true;
           clearTimeout(continuousHoldTimer);
           continuousHoldTimer = null;
         }
         if (Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy) * 1.15) {
           e.preventDefault();
         }
       }
       return;
     }

     if (this.mode === "scroll" || this.mode === "webcomic" || this.mode === "manga") {
       if (continuousTapStart && e.touches.length === 1) {
         const dx = e.touches[0].clientX - continuousTapStart.x;
         const dy = e.touches[0].clientY - continuousTapStart.y;
         if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
           continuousTapStart = null;
           clearTimeout(continuousHoldTimer);
           continuousHoldTimer = null;
         }
       } else if (e.touches.length !== 1) {
         continuousTapStart = null;
         clearTimeout(continuousHoldTimer);
         continuousHoldTimer = null;
       }
       return;
     }
     touches = Array.from(e.touches);
     if (touches.length === 2) {
       if (this.focusMode) { e.preventDefault(); dragMoved = true; return; }
       e.preventDefault();
       const d = Math.max(1, dist(touches[0], touches[1]));
       const currentMid = mid(touches[0], touches[1]);
       const newScale = clamp(pinchStartScale * (d / pinchStartDist), 1, 5);

       const stageRect = stage.getBoundingClientRect();
       const centerX = stageRect.left + stageRect.width / 2;
       const centerY = stageRect.top + stageRect.height / 2;
       const startContentX = (pinchStartMid.x - centerX - pinchStartTx) / pinchStartScale;
       const startContentY = (pinchStartMid.y - centerY - pinchStartTy) / pinchStartScale;

       this.scale = newScale;
       this.tx = currentMid.x - centerX - startContentX * newScale;
       this.ty = currentMid.y - centerY - startContentY * newScale;
       this.constrainPan();
       dragMoved = true;
       clearTimeout(holdTimer);
       holdTimer = null;
     } else if (touches.length === 1 && panStart) {
       const dx = touches[0].clientX - panStart.x;
       const dy = touches[0].clientY - panStart.y;
       if (this.scale > 1.02) {
         e.preventDefault();
         this.tx = panStart.tx + dx;
         this.ty = panStart.ty + dy;
         this.applyTransform();
         if (Math.abs(dx) > 6 || Math.abs(dy) > 6) {
           dragMoved = true;
           clearTimeout(holdTimer);
           holdTimer = null;
         }
       } else if (Math.abs(dx) > 10) {
         dragMoved = true;
         clearTimeout(holdTimer);
         holdTimer = null;
       }
     }
   }, { passive: false });

   stage.addEventListener("touchend", (e) => {
     if (this.mode === "two-page") {
       clearTimeout(continuousHoldTimer);
       continuousHoldTimer = null;
       const endTouch = e.changedTouches[0];
       const start = twoPageGestureStart;
       twoPageGestureStart = null;

       if (!endTouch || !start) {
         continuousHoldFired = false;
         return;
       }

       const dx = endTouch.clientX - start.x;
       const dy = endTouch.clientY - start.y;
       const horizontalSwipe =
         Math.abs(dx) > 60 &&
         Math.abs(dx) > Math.abs(dy) * 1.15;

       if (horizontalSwipe && !continuousHoldFired) {
         e.preventDefault();
         if (dx < 0) this.next();
         else this.prev();
         twoPageGestureMoved = false;
         continuousHoldFired = false;
         return;
       }

       const isStationary =
         Math.abs(dx) <= 10 &&
         Math.abs(dy) <= 10 &&
         !twoPageGestureMoved;

       if (isStationary && !continuousHoldFired) {
         const now = Date.now();
         const pos = { x: endTouch.clientX, y: endTouch.clientY };
         const isDouble = lastTapPos &&
           (now - lastTapTime) < 280 &&
           Math.hypot(pos.x - lastTapPos.x, pos.y - lastTapPos.y) < 70;

         if (isDouble) {
           clearTimeout(pendingTapTimer);
           pendingTapTimer = null;
           lastTapTime = 0;
           lastTapPos = null;
           handleContinuousDoubleTap(pos.x, pos.y);
         } else {
           clearTimeout(pendingTapTimer);
           lastTapTime = now;
           lastTapPos = pos;
           pendingTapTimer = setTimeout(() => {
             pendingTapTimer = null;
             lastTapTime = 0;
             lastTapPos = null;
             this.showChrome();
           }, 280);
         }
       }

       twoPageGestureMoved = false;
       continuousHoldFired = false;
       return;
     }

     if (this.mode === "scroll" || this.mode === "webcomic" || this.mode === "manga") {
       clearTimeout(continuousHoldTimer);
       continuousHoldTimer = null;
       const t = e.changedTouches[0];
       const isStationary = !!(t && continuousTapStart &&
         Math.abs(t.clientX - continuousTapStart.x) <= 10 &&
         Math.abs(t.clientY - continuousTapStart.y) <= 10);

       if (isStationary && !continuousHoldFired) {
         const now = Date.now();
         const pos = { x: t.clientX, y: t.clientY };
         const isDouble = lastTapPos &&
           (now - lastTapTime) < 280 &&
           Math.hypot(pos.x - lastTapPos.x, pos.y - lastTapPos.y) < 70;

         if (isDouble) {
           clearTimeout(pendingTapTimer);
           pendingTapTimer = null;
           lastTapTime = 0;
           lastTapPos = null;
           handleContinuousDoubleTap(pos.x, pos.y);
         } else {
           clearTimeout(pendingTapTimer);
           lastTapTime = now;
           lastTapPos = pos;
           pendingTapTimer = setTimeout(() => {
             pendingTapTimer = null;
             lastTapTime = 0;
             lastTapPos = null;
             this.showChrome();
           }, 280);
         }
       }

       continuousTapStart = null;
       continuousHoldFired = false;
       return;
     }
     e.preventDefault();
     clearTimeout(holdTimer);
     holdTimer = null;
     const remaining = e.touches.length;
     const endTouch = e.changedTouches[0];

     if (remaining === 0 && holdFired) {
       holdFired = false;
       wasPinching = false;
       panStart = null;
       return;
     }

     if (remaining === 1 && wasPinching) {
       const t = e.touches[0];
       panStart = { x: t.clientX, y: t.clientY, tx: this.tx, ty: this.ty };
       wasPinching = false;
       dragMoved = true;
       return;
     }

     if (remaining === 0) {
       if (this.scale <= 1.02) {
         this.scale = 1;
         this.constrainPan();
         if (panStart) {
           const dx = endTouch.clientX - panStart.x;
           const dy = endTouch.clientY - panStart.y;
           if (!this.focusMode && Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.15) {
             if (this.focusMode === "panel") this.clearPanelFocusForNavigation();
             if (dx < 0) this.next(); else this.prev();
             panStart = null;
             wasPinching = false;
             return;
           }
         }
       } else {
         this.constrainPan();
       }

       if (!dragMoved) {
         const now = Date.now();
         const pos = { x: endTouch.clientX, y: endTouch.clientY };
         const isDouble = lastTapPos &&
           (now - lastTapTime) < 280 &&
           Math.hypot(pos.x - lastTapPos.x, pos.y - lastTapPos.y) < 70;

         if (isDouble) {
           clearTimeout(pendingTapTimer);
           pendingTapTimer = null;
           lastTapTime = 0;
           lastTapPos = null;
           this.handleDoubleTap(pos);
         } else {
           let panelHit = false;
           let tappedPanel = null;
           if (this.mode === "single" && this.panelZoomEnabled) {
             const ctx = this.getPanelImageContext();
             if (ctx && ctx.rect.width > 1 && ctx.rect.height > 1) {
               // V63: every tap in the displayed page is eligible for the
               // gradient laboratory. Do NOT call findPanelAt() here: that
               // would reintroduce child/grandchild candidates before the
               // gradient experiment even gets a chance to run.
               panelHit = true;
               tappedPanel = null;
             }
           }

           if (panelHit) {
             clearTimeout(pendingTapTimer);
             pendingTapTimer = null;
             lastTapTime = now;
             lastTapPos = pos;

             // Once a frame is already focused, do NOT create another

             // V43: diagnostics only. Existing hit-test code is unchanged.
             try {
               if (typeof this.debugLog === "function") {
                 this.debugLog("V43 TAP SELECTION DIAGNOSTICS");
                 this.debugLog("V43 HIT-TEST PATH REACHED");
                 // V44: deeper diagnostics only; no selection/control-flow changes.
                 try {
                   const p = tappedPanel;
                   const px = p && Number.isFinite(Number(p.x)) ? Number(p.x) : (p && Number.isFinite(Number(p.left)) ? Number(p.left) : "?");
                   const py = p && Number.isFinite(Number(p.y)) ? Number(p.y) : (p && Number.isFinite(Number(p.top)) ? Number(p.top) : "?");
                   const pw = p && Number.isFinite(Number(p.w)) ? Number(p.w) : (p && Number.isFinite(Number(p.width)) ? Number(p.width) : "?");
                   const ph = p && Number.isFinite(Number(p.h)) ? Number(p.h) : (p && Number.isFinite(Number(p.height)) ? Number(p.height) : "?");
                   const tapX = pos && Number.isFinite(Number(pos.x)) ? Number(pos.x) : "?";
                   const tapY = pos && Number.isFinite(Number(pos.y)) ? Number(pos.y) : "?";
                   this.debugLog(`V44 PRE-HITTEST SNAPSHOT tap=(${tapX},${tapY}) panelHit=${!!p} panelBounds=(${px},${py},${pw},${ph})`);
                 } catch (_) {}

               }
             } catch (_) {}
             // deferred panel candidate. The next tap belongs to the
             // focused-frame interaction: bubble detection gets a chance,
             // and if no bubble is found the frame is dismissed.
             if (this.focusMode === "panel") {
               this._deferredPanelTap = null;
               return;
             }

             // Unfocused panel: defer commitment so a direct bubble
             // double-tap can win before the frame opens.
             const panelCtx = this.getPanelImageContext();
             const panelImgRect = panelCtx?.rect;
             const comicId = this.comic?.id;
             const pageIndex = this.index;

             if (this.bubbleAltZoomEnabled && panelCtx && panelImgRect) {
               const relX = clamp(
                 (pos.x - panelImgRect.left) / panelImgRect.width, 0, 1
               );
               const relY = clamp(
                 (pos.y - panelImgRect.top) / panelImgRect.height, 0, 1
               );

               this._deferredPanelTap = {
                 pos,
                 comicId,
                 pageIndex,
                 panel: tappedPanel,
                 promise: (async () => {
                   try {
                     const url = await this.getPageUrl(pageIndex);
                     if (!url) return { bubble: null };

                     const logger = this.debugMode
                       ? (msg) => this.debugLog(`[bubble-deferred] ${msg}`)
                       : null;

                     const bubble = await BubbleDetect.extract(
                       url, relX, relY, logger
                     );

                     return {
                       bubble,
                       imgRect: panelImgRect
                     };
                   } catch (_) {
                     return { bubble: null };
                   }
                 })()
               };
             } else {
               this._deferredPanelTap = null;
             }

             pendingTapTimer = setTimeout(() => {
               pendingTapTimer = null;
               lastTapTime = 0;
               lastTapPos = null;

               const pendingPanel = this._deferredPanelTap?.panel || null;
               this._deferredPanelTap = null;

               if (typeof this.debugLog === "function") {
                 try {
                   this.debugLog(
                     pendingPanel
                       ? `[V45] COMMIT stored panel`
                       : `[V45] COMMIT no stored panel`
                   );
                 } catch (_) {}
               }

               this.handleSingleTap(pos, pendingPanel);
             }, 450);
           } else {
             clearTimeout(pendingTapTimer);
             lastTapTime = now;
             lastTapPos = pos;
             pendingTapTimer = setTimeout(() => {
               pendingTapTimer = null;
               lastTapTime = 0;
               lastTapPos = null;
               this.handleSingleTap(pos);
             }, 280);
           }
         }
       }
       panStart = null;
       wasPinching = false;
       pinchStartMid = null;
     }
   });

   stage.addEventListener("wheel", (e) => {
     if (this.mode === "scroll" || this.mode === "webcomic" || this.mode === "manga") return;
     e.preventDefault();
     const delta = -e.deltaY * 0.0018;
     this.scale = clamp(this.scale + delta, 1, 5);
     if (this.scale <= 1.02) { this.scale = 1; this.tx = 0; this.ty = 0; }
     this.applyTransform();
   }, { passive: false });

   let mouseDown = false, mouseMoved = false, mStart = null;
   stage.addEventListener("mousedown", (e) => {
     if (this.mode === "scroll") return;
     mouseDown = true; mouseMoved = false;
     mStart = { x: e.clientX, y: e.clientY, tx: this.tx, ty: this.ty };
   });
   stage.addEventListener("mousemove", (e) => {
     if (!mouseDown || this.mode === "scroll" || this.mode === "webcomic" || this.mode === "manga") return;
     const dx = e.clientX - mStart.x, dy = e.clientY - mStart.y;
     if (Math.abs(dx) > 4 || Math.abs(dy) > 4) mouseMoved = true;
     if (this.scale > 1.02) {
       this.tx = mStart.tx + dx;
       this.ty = mStart.ty + dy;
       this.applyTransform();
     }
   });
   stage.addEventListener("mouseup", (e) => {
     if (this.mode === "scroll") return;
     if (mouseDown && !mouseMoved) {
       this.handleSingleTap({ x: e.clientX, y: e.clientY });
     } else if (mouseDown && mouseMoved && this.scale <= 1.02) {
       const dx = e.clientX - mStart.x, dy = e.clientY - mStart.y;
       if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.15) {
         if (dx < 0) this.next(); else this.prev();
       }
     }
     mouseDown = false;
   });
   stage.addEventListener("dblclick", (e) => {
     if (this.mode !== "single") return;
     if (this.focusMode === "panel") {
       e.preventDefault();
       this.resetZoom({ animate: true });
     }
   });
 },

 async handleSingleTap(pos, forcedPanel = null) {
   if (this.mode !== "single" || this.scale > 1.02) return;

   const stageRect = this.els.stage.getBoundingClientRect();
   const ctx = this.getPanelImageContext(pos.x, pos.y);
   const img = ctx?.img;
   const imgRect = ctx?.rect || stageRect;
   if (!img || !imgRect.width || !imgRect.height) {
     this.toggleChrome();
     return;
   }

   const relXImg = clamp((pos.x - imgRect.left) / imgRect.width, 0, 1);
   const relYImg = clamp((pos.y - imgRect.top) / imgRect.height, 0, 1);

   // V64: the image context above was resolved from the exact screen tap.
   // Show a temporary marker and log the natural source pixel so this test
   // can prove the coordinate mapping before we judge V63's boundary logic.
   this.showV64TapMarker(pos, img, imgRect, relXImg, relYImg, ctx?.pageNumber || (this.index + 1));
   if (this.debugMode) {
     this.debugLog(
       `[V64] VERIFIED CONTEXT page=${ctx?.pageNumber || (this.index + 1)} ` +
       `img=${img.naturalWidth}x${img.naturalHeight}`
     );
   }

   // V63: ignore the detected parent/child hierarchy for frame selection.
   // The exact displayed image and exact tap are the only inputs to the
   // gradient laboratory. Existing currentPanels are deliberately NOT passed
   // as seeds because child/grandchild rectangles must not influence this
   // experiment.
   const logger = typeof this.debugLog === "function"
     ? (msg) => this.debugLog(msg)
     : null;

   if (logger) {
     logger(
       `[V68] TAP x=${Number(relXImg.toFixed(4))} ` +
       `y=${Number(relYImg.toFixed(4))} ` +
       `forced=${forcedPanel ? "yes" : "no"}`
     );
     logger(`[V68] CHILD/PARENT/GRANDCHILD DETECTION DISABLED FOR THIS EXPERIMENT`);
   }

   let panel = null;
   try {
     panel = await PanelDetect.exhaustiveTapGradient(
       img,
       relXImg,
       relYImg,
       logger
     );
   } catch (err) {
     if (logger) logger(`[V68] LAB ERROR ${err?.message || err}`);
   }

   if (panel) {
     if (logger) {
       logger(
         `[V68] FINAL TAP-CONTAINING PANEL ` +
         `x=${Number(Number(panel.x).toFixed(4))} ` +
         `y=${Number(Number(panel.y).toFixed(4))} ` +
         `w=${Number(Number(panel.w).toFixed(4))} ` +
         `h=${Number(Number(panel.h).toFixed(4))} ` +
         `method=${panel.__v68Method || "unknown"}`
       );
     }
     this.zoomToPanel(panel, stageRect, imgRect, img);
     return;
   }

   if (logger) logger(`[V68] NO TAP-CONTAINING PANEL FOUND -> no frame opened`);
   this.toggleChrome();
 },

 async handleDeferredPanelDoubleTap(pos) {
   const pending = this._deferredPanelTap;
   if (!pending) return false;

   this._deferredPanelTap = null;

   try {
     const result = await pending.promise;
     if (!result || !result.bubble) {
       // No bubble: because this was a genuine double tap on an already
       // focused frame, dismiss the frame instead of sending the tap back
       // through handleSingleTap() (which would hit the same focused panel).
       if (this.focusMode === "panel") {
         this.resetZoom({ animate: true });
       } else {
         this.handleSingleTap(pending.pos);
       }
       return true;
     }

     if (this.comic?.id !== pending.comicId ||
         this.index !== pending.pageIndex) return true;

     const stageRect = this.els.stage.getBoundingClientRect();
     this.showBubbleOverlay(
       result.bubble,
       stageRect,
       result.imgRect
     );
     return true;
   } catch (_) {
     // If detection fails, preserve the normal frame interaction.
     this.handleSingleTap(pending.pos);
     return true;
   }
 },

 async handleDoubleTap(pos) {
   if (this.mode !== "single") return;

   // An active bubble owns the next double-tap. Do this BEFORE checking any
   // deferred panel tap, otherwise the bubble can become impossible to close.
   if (this.bubbleOverlayActive) {
     this._deferredPanelTap = null;
     this.removeBubbleOverlay(true);
     return;
   }

   if (this._deferredPanelTap) {
     const handled = await this.handleDeferredPanelDoubleTap(pos);
     if (handled) return;
   }

   const stageRect = this.els.stage.getBoundingClientRect();

   if (!this.bubbleAltZoomEnabled) {
     if (this.focusMode === "panel") this.resetZoom({ animate: true });
     return;
   }

   if (this.bubbleOverlayActive) {
     this.removeBubbleOverlay(true);
     return;
   }

   const comicId = this.comic?.id;
   const pageIndex = this.index;
   const url = await this.getPageUrl(pageIndex);
   if (!url) return;

   const logger = this.debugMode
     ? (msg) => this.debugLog(`[bubble-alt] ${msg}`)
     : null;

   // IMPORTANT: when a panel is already popped out, the tap is landing on
   // the enlarged panel overlay. Map that screen coordinate back through the
   // panel crop to the original comic page before running BubbleDetect.
   if (this.focusMode === "panel" &&
       this.panelOverlayActive &&
       this.panelFocusMeta &&
       this.els.panelOverlay) {
     const overlayRect = this.els.panelOverlay.getBoundingClientRect();
     if (overlayRect.width > 1 && overlayRect.height > 1) {
       const localX = clamp((pos.x - overlayRect.left) / overlayRect.width, 0, 1);
       const localY = clamp((pos.y - overlayRect.top) / overlayRect.height, 0, 1);
       const panel = this.panelFocusMeta.panel;
       const pageRelX = clamp(panel.x + localX * panel.w, 0, 1);
       const pageRelY = clamp(panel.y + localY * panel.h, 0, 1);

       const bubble = await BubbleDetect.extract(
         url, pageRelX, pageRelY, logger
       );

       if (!this.comic || this.comic.id !== comicId || this.index !== pageIndex) return;

       if (bubble) {
         // Return to the real page geometry for the bubble overlay, then put
         // the detected bubble on top as the new focus owner.
         const ctx = this.getPanelImageContext();
         const imgRect = ctx?.rect || stageRect;
         this.removePanelOverlay(false);
         this.focusMode = null;
         this.setFocusDim(false, false);
         this.showBubbleOverlay(bubble, stageRect, imgRect);
       } else {
         // No bubble at the double-tapped location: the focused frame owns
         // this interaction, so close it.
         this._deferredPanelTap = null;
         this.resetZoom({ animate: true });
       }
       return;
     }

     this.resetZoom({ animate: true });
     return;
   }

   // Normal page (no panel focus): use the actual Turn.js-visible image.
   const ctx = this.getPanelImageContext();
   const imgRect = ctx?.rect || stageRect;
   if (!imgRect.width || !imgRect.height) return;

   const relXImg = clamp((pos.x - imgRect.left) / imgRect.width, 0, 1);
   const relYImg = clamp((pos.y - imgRect.top) / imgRect.height, 0, 1);

   const bubble = await BubbleDetect.extract(url, relXImg, relYImg, logger);
   if (!this.comic || this.comic.id !== comicId || this.index !== pageIndex) return;

   if (bubble) {
     this.showBubbleOverlay(bubble, stageRect, imgRect);
   }
 },

 showBubbleOverlay(bubble, stageRect, imgRect, anchorPage = null) {
   this.removeBubbleOverlay();
   const canvas = bubble.canvas;
   if (!canvas) return;

   const bubbleW = bubble.w * imgRect.width;
   const bubbleH = bubble.h * imgRect.height;
   if (bubbleW < 8 || bubbleH < 8) return;

   const pagePadding = Math.max(8, Math.min(18, Math.round(Math.min(imgRect.width, imgRect.height) * 0.018)));
   const availableW = Math.max(1, imgRect.width - pagePadding * 2);
   const availableH = Math.max(1, imgRect.height - pagePadding * 2);

   const smallestDimension = Math.min(bubble.w, bubble.h);
   const sizeBoost =
     smallestDimension < 0.045 ? 1.28 :
     smallestDimension < 0.075 ? 1.16 :
     smallestDimension < 0.12 ? 1.08 : 1.0;

   const preferredScale = Math.min(
     stageRect.width / (bubbleW * 1.04),
     stageRect.height / (bubbleH * 1.04)
   ) * sizeBoost;
   const fitScale = Math.min(availableW / bubbleW, availableH / bubbleH);
   const targetScale = clamp(Math.min(preferredScale, fitScale), 1.35, 7);

   const displayW = bubbleW * targetScale;
   const displayH = bubbleH * targetScale;
   const naturalCenterX = imgRect.left + (bubble.x + bubble.w / 2) * imgRect.width;
   const naturalCenterY = imgRect.top + (bubble.y + bubble.h / 2) * imgRect.height;

   const minLeft = imgRect.left + pagePadding;
   const maxLeft = imgRect.right - pagePadding - displayW;
   const minTop = imgRect.top + pagePadding;
   const maxTop = imgRect.bottom - pagePadding - displayH;
   const left = clamp(naturalCenterX - displayW / 2, minLeft, Math.max(minLeft, maxLeft));
   const top = clamp(naturalCenterY - displayH / 2, minTop, Math.max(minTop, maxTop));

   const overlay = document.createElement("canvas");
   overlay.className = "bubble-zoom-alt-overlay";
   overlay.width = canvas.width;
   overlay.height = canvas.height;
   overlay.style.width = `${displayW}px`;
   overlay.style.height = `${displayH}px`;
   overlay.style.transformOrigin = "center center";
   overlay.style.willChange = "transform, opacity, filter";

   // Two Page needs the bubble overlay in the reader's top-level coordinate
   // space. The page viewport has its own stacking/transform context, and the
   // stage can change geometry when the device rotates. A fixed overlay using
   // client coordinates stays above the dim layer and remains correctly
   // positioned through portrait/landscape transitions. Continuous readers
   // keep their existing page-anchored behavior.
   const twoPageFixedOverlay = this.mode === "two-page";
   const continuousFixedOverlay =
     this.mode === "scroll" ||
     this.mode === "manga" ||
     this.mode === "webcomic";
   const topLevelFixedOverlay = twoPageFixedOverlay || continuousFixedOverlay;

   if (topLevelFixedOverlay) {
     overlay.style.position = "fixed";
     overlay.style.left = `${left}px`;
     overlay.style.top = `${top}px`;
     overlay.style.zIndex = "120";
     overlay.dataset.anchorPage = anchorPage?.dataset?.index ?? "";
   } else if (anchorPage) {
     const pageRect = anchorPage.getBoundingClientRect();
     overlay.style.left = `${left - pageRect.left}px`;
     overlay.style.top = `${top - pageRect.top}px`;
     overlay.dataset.anchorPage = anchorPage.dataset.index ?? "";
   } else {
     overlay.style.left = `${left - stageRect.left}px`;
     overlay.style.top = `${top - stageRect.top}px`;
   }

   overlay.setAttribute("aria-hidden", "true");
   const ctx = overlay.getContext("2d");
   ctx.imageSmoothingEnabled = true;
   ctx.imageSmoothingQuality = "high";
   ctx.drawImage(canvas, 0, 0);

   this.setFocusDim(true, true);
   // In Two Page the bubble uses fixed reader/screen coordinates. It must be
   // a direct child of the stage so it shares the same stacking context as
   // the focus dim. Appending it to a .two-page-page would trap the overlay
   // inside the page/viewport stacking context, allowing the dim layer to
   // cover it even with a higher z-index.
   if (topLevelFixedOverlay) {
     this.els.stage.appendChild(overlay);
   } else if (anchorPage) {
     anchorPage.appendChild(overlay);
   } else {
     this.els.stage.appendChild(overlay);
   }

   this.els.bubbleOverlay = overlay;
   this.bubbleOverlayActive = true;
   this.focusMode = "bubble";
   overlay.classList.add("active");

   const zoomInDuration = 560;
   const animation = overlay.animate(
     [
       { transform: "scale(.82)", opacity: 0, filter: "brightness(.92)" },
       { transform: "scale(1.035)", opacity: 1, filter: "brightness(1.02)", offset: .72 },
       { transform: "scale(1)", opacity: 1, filter: "brightness(1)" }
     ],
     { duration: zoomInDuration, easing: "cubic-bezier(.16,1,.3,1)", fill: "forwards" }
   );
   overlay._bubbleZoomInAnimation = animation;

   animation.onfinish = () => {
     if (!overlay.parentNode) return;
     overlay.style.transform = "scale(1)";
     overlay.style.opacity = "1";
     overlay.style.filter = "brightness(1)";
     animation.cancel();
     overlay._bubbleZoomInAnimation = null;
   };
   animation.oncancel = () => { overlay._bubbleZoomInAnimation = null; };
 },

 zoomAtPoint(screenX, screenY, targetScale, stageRect = this.els.stage.getBoundingClientRect()) {
   const centerX = stageRect.left + stageRect.width / 2;
   const centerY = stageRect.top + stageRect.height / 2;
   const contentX = (screenX - centerX - this.tx) / this.scale;
   const contentY = (screenY - centerY - this.ty) / this.scale;

   this.scale = clamp(targetScale, 1, 5);
   this.tx = screenX - centerX - contentX * this.scale;
   this.ty = screenY - centerY - contentY * this.scale;
   this.constrainPan();
   this.applyTransform();
 },

 zoomToRect(rect, stageRect, imgRect, opts = {}) {
   const fillRatio = opts.fillRatio ?? 0.96;
   const maxScale = opts.maxScale ?? 5;
   const focusKind = opts.focusKind ?? "rect";

   const rectPxW = Math.max(1, rect.w * imgRect.width);
   const rectPxH = Math.max(1, rect.h * imgRect.height);
   const widthRatio = rect.w;
   const heightRatio = rect.h;
   const areaRatio = rect.w * rect.h;

   const sx = stageRect.width / rectPxW;
   const sy = stageRect.height / rectPxH;
   let targetScale = Math.min(sx, sy) * fillRatio;

   if (focusKind === "panel") {
     const pageSpanning = widthRatio >= 0.86 || heightRatio >= 0.86 || areaRatio >= 0.68;
     if (pageSpanning) {
       const coverage = Math.max(widthRatio, heightRatio);
       const focusScale = 1.14 - (coverage - 0.68) * 0.24;
       targetScale = clamp(focusScale, 1.035, 1.14);
     } else {
       targetScale *= 0.90;
       targetScale = clamp(targetScale, 1.08, maxScale);
     }
   } else {
     targetScale = clamp(targetScale, 1, maxScale);
   }

   const stageCenterX = stageRect.left + stageRect.width / 2;
   const stageCenterY = stageRect.top + stageRect.height / 2;
   const rectCenterX = imgRect.left + (rect.x + rect.w / 2) * imgRect.width;
   const rectCenterY = imgRect.top + (rect.y + rect.h / 2) * imgRect.height;
   const dx = rectCenterX - stageCenterX;
   const dy = rectCenterY - stageCenterY;

   this.scale = targetScale;
   this.tx = -dx * targetScale;
   this.ty = -dy * targetScale;
   this.constrainPan();
   this.applyTransform();
 },

 async zoomToPanel(panel, stageRect, imgRect, verifiedImg = null) {
   if (this.focusMode) return;

   if (typeof this.debugLog === "function") {
     try {
       this.debugLog(
         `[V45] zoomToPanel ENTER ` +
         `panel=${JSON.stringify({
           x: Number(Number(panel?.x).toFixed(4)),
           y: Number(Number(panel?.y).toFixed(4)),
           w: Number(Number(panel?.w).toFixed(4)),
           h: Number(Number(panel?.h).toFixed(4))
         })} ` +
         `imgRect=${JSON.stringify({
           left: Number(Number(imgRect?.left).toFixed(1)),
           top: Number(Number(imgRect?.top).toFixed(1)),
           width: Number(Number(imgRect?.width).toFixed(1)),
           height: Number(Number(imgRect?.height).toFixed(1))
         })}`
       );
     } catch (_) {}
   }

   const token = ++this.panelOverlayToken;
   const ctx = verifiedImg ? null : this.getPanelImageContext();
   const img = verifiedImg || ctx?.img;
   if (!img || !img.naturalWidth || !img.naturalHeight) return;

   this.focusMode = "panel";
   this.panelOverlayActive = false;
   this.setFocusDim(true, true);

   const sourceLeft = imgRect.left + panel.x * imgRect.width;
   const sourceTop = imgRect.top + panel.y * imgRect.height;
   const sourceW = Math.max(8, panel.w * imgRect.width);
   const sourceH = Math.max(8, panel.h * imgRect.height);

   const naturalW = Math.max(1, Math.round(panel.w * img.naturalWidth));
   const naturalH = Math.max(1, Math.round(panel.h * img.naturalHeight));
   const renderScale = Math.min(1, 3000 / Math.max(naturalW, naturalH));
   const canvasW = Math.max(1, Math.round(naturalW * renderScale));
   const canvasH = Math.max(1, Math.round(naturalH * renderScale));
   const sx = panel.x * img.naturalWidth;
   const sy = panel.y * img.naturalHeight;
   const sw = panel.w * img.naturalWidth;
   const sh = panel.h * img.naturalHeight;

   if (typeof this.debugLog === "function") {
     try {
       this.debugLog(
         `[V45] CROP PIXELS ` +
         `sx=${Math.round(sx)} sy=${Math.round(sy)} ` +
         `sw=${Math.round(sw)} sh=${Math.round(sh)} ` +
         `natural=${img.naturalWidth}x${img.naturalHeight}`
       );
     } catch (_) {}
   }

   this.panelFocusMeta = {
     panel: { x: panel.x, y: panel.y, w: panel.w, h: panel.h },
     pageIndex: this.index
   };

   const overlay = document.createElement("div");
   overlay.className = "panel-focus-overlay";
   overlay.setAttribute("aria-hidden", "true");
   overlay.style.left = `${sourceLeft - stageRect.left}px`;
   overlay.style.top = `${sourceTop - stageRect.top}px`;
   overlay.style.width = `${sourceW}px`;
   overlay.style.height = `${sourceH}px`;

   const canvas = document.createElement("canvas");
   canvas.width = canvasW;
   canvas.height = canvasH;
   canvas.style.width = "100%";
   canvas.style.height = "100%";
   canvas.getContext("2d").imageSmoothingEnabled = true;
   canvas.getContext("2d").imageSmoothingQuality = "high";
   canvas.getContext("2d").drawImage(img, sx, sy, sw, sh, 0, 0, canvasW, canvasH);
   overlay.appendChild(canvas);

   const pagePad = Math.max(8, Math.min(18, Math.round(Math.min(imgRect.width, imgRect.height) * 0.018)));
   const availableW = Math.max(1, imgRect.width - pagePad * 2);
   const availableH = Math.max(1, imgRect.height - pagePad * 2);
   const fitScale = Math.min(availableW / sourceW, availableH / sourceH);
   const areaRatio = panel.w * panel.h;
   const pageSpanning = panel.w >= 0.86 || panel.h >= 0.86 || areaRatio >= 0.68;

   let targetScale;
   if (pageSpanning) {
     targetScale = clamp(Math.min(1.08, fitScale), 1, 1.08);
   } else {
     targetScale = clamp(Math.min(fitScale * 0.94, 4.5), 1.08, 4.5);
   }

   const targetW = sourceW * targetScale;
   const targetH = sourceH * targetScale;
   const pageLeft = imgRect.left + pagePad;
   const pageTop = imgRect.top + pagePad;
   const pageRight = imgRect.right - pagePad;
   const pageBottom = imgRect.bottom - pagePad;
   const targetCenterX = imgRect.left + imgRect.width / 2;
   const targetCenterY = imgRect.top + imgRect.height / 2;
   const targetLeft = clamp(targetCenterX - targetW / 2, pageLeft, Math.max(pageLeft, pageRight - targetW));
   const targetTop = clamp(targetCenterY - targetH / 2, pageTop, Math.max(pageTop, pageBottom - targetH));
   const dx = targetLeft - sourceLeft;
   const dy = targetTop - sourceTop;

   this.els.stage.appendChild(overlay);
   this.els.panelOverlay = overlay;
   this.panelOverlayActive = true;
   this.els.viewport.classList.add("panel-focus-page-dimmed");

   const startTransform = "translate3d(0,0,0) scale(1)";
   const endTransform = `translate3d(${dx}px, ${dy}px, 0) scale(${targetScale})`;
   const zoomInDuration = 680;

   overlay.style.transition = "none";
   overlay.style.transform = startTransform;
   overlay.style.opacity = "1";
   overlay.style.boxShadow = "0 5px 16px rgba(0,0,0,.22)";
   overlay.style.setProperty("--panel-dx", `${dx}px`);
   overlay.style.setProperty("--panel-dy", `${dy}px`);
   overlay.style.setProperty("--panel-scale", `${targetScale}`);

   requestAnimationFrame(() => {
     if (token !== this.panelOverlayToken || !overlay.parentNode) return;

     const animation = overlay.animate(
       [
         {
           transform: startTransform,
           opacity: 1,
           boxShadow: "0 5px 16px rgba(0,0,0,.22)"
         },
         {
           transform: endTransform,
           opacity: 1,
           boxShadow: "0 18px 44px rgba(0,0,0,.58)"
         }
       ],
       {
         duration: zoomInDuration,
         easing: "cubic-bezier(0.12,1.24,0.24,1)",
         fill: "forwards"
       }
     );

     overlay._panelZoomInAnimation = animation;

     animation.onfinish = () => {
       if (!overlay.parentNode) return;
       overlay.style.transform = endTransform;
       overlay.style.opacity = "1";
       overlay.style.boxShadow = "0 18px 44px rgba(0,0,0,.58)";
       animation.cancel();
       overlay._panelZoomInAnimation = null;
     };

     animation.oncancel = () => {
       overlay._panelZoomInAnimation = null;
     };
   });
 }
};

// Global clamp helper check
function clamp(val, min, max) {
 return Math.min(Math.max(val, min), max);
}