// app.js — bootstrap, routing between library and reader

const LongboxApp = {
  deferredInstallPrompt: null,

  isAndroidApp() {
    return document.documentElement.classList.contains("android-app") ||
      /NthShelfAndroid\//i.test(navigator.userAgent || "");
  },

  init() {
    Library.init();
    Reader.init();
    ShelfTransfer.init();
    ShelfGuide.init();
    this.updateInstallButton();

    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("./sw.js").catch((err) => {
          console.warn("Service worker registration failed:", err);
        });
      });
    }
  },

  updateInstallButton() {
    const btn = document.getElementById("install-app-btn");
    if (!btn) return;
    const standalone = this.isAndroidApp() ||
      window.matchMedia?.("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;
    btn.style.display = standalone ? "none" : "";
    btn.textContent = this.deferredInstallPrompt ? "Install" : "Install";
    btn.title = this.deferredInstallPrompt
      ? "Install Nth Shelf on this device"
      : "Install Nth Shelf from your browser menu";
  },

  async installPWA() {
    const standalone = this.isAndroidApp() ||
      window.matchMedia?.("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;
    if (standalone) return;

    if (!this.deferredInstallPrompt) {
      Modal.actions(
        "Install Nth Shelf",
        "If your browser does not show the install prompt automatically, open the browser menu and choose “Install app” or “Add to Home screen.”",
        [{ label: "Close", cls: "subtle" }]
      );
      return;
    }

    const promptEvent = this.deferredInstallPrompt;
    this.deferredInstallPrompt = null;

    try {
      const result = await promptEvent.prompt();
      console.info("Nth Shelf install prompt:", result?.outcome || "shown");
      await promptEvent.userChoice.catch(() => null);
    } catch (err) {
      console.warn("Nth Shelf install prompt failed:", err);
    }

    this.updateInstallButton();
  },

  async openReader(comicId, startPage = null) {
    document.getElementById("library-view").classList.remove("active");
    document.getElementById("reader-view").classList.add("active");
    await Reader.open(comicId, startPage);
  },

  closeReader() {
    document.getElementById("reader-view").classList.remove("active");
    document.getElementById("library-view").classList.add("active");
    Library.refresh();
  },

  // Called by Android before it falls back to WebView history or exits.
  // Return true whenever the current app layer consumed the Back action.
  handleBack() {
    if (ShelfGuide.active) return ShelfGuide.finish();
    if (ShelfTransfer.dialog?.open) { ShelfTransfer.dismiss(); return true; }
    const dialog=document.querySelector("dialog[open]");
    if(dialog) {dialog.close();return true;}
    if (Modal?.el?.style.display && Modal.el.style.display !== "none") {
      Modal.close();
      return true;
    }

    const readerView = document.getElementById("reader-view");
    if (readerView?.classList.contains("active")) {
      if (Reader.els.helpDrawer?.classList.contains("open")) {
        Reader.closeHelpDrawer();
      } else if (Reader.focusMode || Reader.panelOverlayActive || Reader.bubbleOverlayActive) {
        Reader.resetZoom({ animate: true });
      } else {
        Reader.close();
      }
      return true;
    }

    if (Library.shelfMode) {
      Library.closeShelfMode();
      return true;
    }
    if (Library.searchMode) {
      Library.closeSearchMode();
      return true;
    }
    if (Library.activeCollectionId) {
      Library.showRoot();
      return true;
    }
    return false;
  },
};

// Register install lifecycle listeners immediately so a fast page load
// cannot fire before DOMContentLoaded calls LongboxApp.init().
window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  LongboxApp.deferredInstallPrompt = event;
  LongboxApp.updateInstallButton();
});

window.addEventListener("appinstalled", () => {
  LongboxApp.deferredInstallPrompt = null;
  LongboxApp.updateInstallButton();
});

window.LongboxApp = LongboxApp;
document.addEventListener("DOMContentLoaded", () => LongboxApp.init());
