// app.js — bootstrap, routing between library and reader

const LongboxApp = {
  deferredInstallPrompt: null,

  init() {
    Library.init();
    Reader.init();
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
    const standalone = window.matchMedia?.("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;
    btn.style.display = standalone ? "none" : "";
    btn.textContent = this.deferredInstallPrompt ? "Install" : "Install";
    btn.title = this.deferredInstallPrompt
      ? "Install Nth Shelf on this device"
      : "Install Nth Shelf from your browser menu";
  },

  async installPWA() {
    const standalone = window.matchMedia?.("(display-mode: standalone)").matches ||
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

  handleAndroidBack() {
    const readerView = document.getElementById("reader-view");
    const collectionView = document.getElementById("collection-view");

    // 1. Reader is the deepest NthShelf level.
    if (readerView?.classList.contains("active")) {
      this.closeReader();
      return true;
    }

    // Search and Shelf Mode are library overlays, not separate Android
    // screens. Close them before considering Android Back an app exit.
    if (window.Library?.searchMode) {
      if (typeof window.Library.closeSearchMode === "function") {
        window.Library.closeSearchMode();
        return true;
      }
    }

    if (window.Library?.shelfMode) {
      if (typeof window.Library.closeShelfMode === "function") {
        window.Library.closeShelfMode();
        return true;
      }
    }

    // Collection view uses display:block/none rather than the "active"
    // class used by the top-level views.
    if (collectionView && collectionView.style.display !== "none") {
      if (typeof window.Library?.showRoot === "function") {
        window.Library.showRoot();
        return true;
      }
    }

    // At the Main Lobby there is no deeper NthShelf view to navigate back to.
    return false;
  },

  closeReader() {
    document.getElementById("reader-view").classList.remove("active");
    document.getElementById("library-view").classList.add("active");
    Library.refresh();
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
document.addEventListener("DOMContentLoaded", () => {
  LongboxApp.init();

  // Android Back is routed through NthShelf's existing view hierarchy.
  const capacitorApp = window.Capacitor?.Plugins?.App;
  if (capacitorApp?.addListener) {
    capacitorApp.addListener("backButton", () => {
      const handled = LongboxApp.handleAndroidBack();

      // Only the Main Lobby reaches this point. Let Android exit normally.
      if (!handled && capacitorApp.exitApp) {
        capacitorApp.exitApp();
      }
    });
  }
});
