// db.js — IndexedDB persistence layer for Nth Shelf
// Stores: comics (metadata + progress), pages (blob per page, keyed by comicId+index),
// panels (bubble/panel detection cache), collections, and a tiny meta store used to
// harden persistence across app-shell updates.
//
// IMPORTANT: DB_NAME intentionally remains "longbox" for backwards compatibility.
// Renaming an IndexedDB database would make an existing library look brand new.

const DB_NAME = "longbox";
const DB_VERSION = 4;
const STORAGE_MARKER_KEY = "nth-shelf-library-marker-v1";
let dbPromise = null;

function openDB() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains("comics")) {
        db.createObjectStore("comics", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("pages")) {
        const store = db.createObjectStore("pages", { keyPath: "key" });
        store.createIndex("comicId", "comicId", { unique: false });
      }
      if (!db.objectStoreNames.contains("collections")) {
        db.createObjectStore("collections", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("panels")) {
        const store = db.createObjectStore("panels", { keyPath: "key" });
        store.createIndex("comicId", "comicId", { unique: false });
      }
      if (!db.objectStoreNames.contains("meta")) {
        db.createObjectStore("meta", { keyPath: "key" });
      }
    };
    req.onsuccess = () => {
      const db = req.result;
      // If another tab/PWA instance upgrades the database, close this connection
      // so the next operation can reopen it cleanly instead of failing against a
      // stale connection.
      db.onversionchange = () => {
        try { db.close(); } catch (e) {}
        dbPromise = null;
      };
      resolve(db);
    };
    req.onerror = () => {
      dbPromise = null;
      reject(req.error);
    };
    req.onblocked = () => {
      console.warn("Nth Shelf database upgrade is blocked by another open tab.");
    };
  });
  return dbPromise;
}

function tx(storeNames, mode) {
  return openDB().then((db) => db.transaction(storeNames, mode));
}

const LongboxDB = {
  // Run once at startup. Requesting persistent storage lets supporting browsers
  // keep the comic library from being evicted as ordinary site data. Browsers
  // may decline the request; the app still works normally in that case.
  async bootstrap() {
    const db = await openDB();
    let persisted = false;
    try {
      if (navigator.storage?.persist) {
        persisted = await navigator.storage.persist();
      }
    } catch (e) {
      console.warn("Nth Shelf persistent-storage request failed:", e);
    }

    try {
      const t = db.transaction(["meta"], "readwrite");
      t.objectStore("meta").put({
        key: "schema",
        dbName: DB_NAME,
        dbVersion: DB_VERSION,
        app: "nth-shelf",
        updatedAt: Date.now(),
      });
      t.objectStore("meta").put({
        key: "storage",
        persistentRequested: true,
        persistentGranted: persisted,
        updatedAt: Date.now(),
      });
      await txDone(t);
    } catch (e) {
      console.warn("Nth Shelf metadata write failed:", e);
    }

    return { persisted };
  },

  async getMeta(key) {
    const t = await tx(["meta"], "readonly");
    return reqResult(t.objectStore("meta").get(key));
  },

  async setMeta(key, value) {
    const t = await tx(["meta"], "readwrite");
    t.objectStore("meta").put({ key, ...value });
    return txDone(t);
  },

  async addComic(comic) {
    const t = await tx(["comics"], "readwrite");
    t.objectStore("comics").put(comic);
    const done = txDone(t);
    await done;
    try {
      localStorage.setItem(STORAGE_MARKER_KEY, JSON.stringify({ hasLibrary: true, updatedAt: Date.now() }));
    } catch (e) {}
    return done;
  },

  async getComic(id) {
    const t = await tx(["comics"], "readonly");
    const req = t.objectStore("comics").get(id);
    return reqResult(req);
  },

  async getAllComics() {
    const t = await tx(["comics"], "readonly");
    const req = t.objectStore("comics").getAll();
    const result = await reqResult(req);
    return (result || []).sort((a, b) => b.addedAt - a.addedAt);
  },

  async updateComic(id, patch) {
    const comic = await this.getComic(id);
    if (!comic) return;
    Object.assign(comic, patch);
    return this.addComic(comic);
  },

  async deleteComic(id) {
    const t = await tx(["comics", "pages", "panels"], "readwrite");
    t.objectStore("comics").delete(id);
    const pageStore = t.objectStore("pages");
    const pageIdx = pageStore.index("comicId");
    const pageCursorReq = pageIdx.openCursor(IDBKeyRange.only(id));
    pageCursorReq.onsuccess = (e) => {
      const cursor = e.target.result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      }
    };
    const panelStore = t.objectStore("panels");
    const panelIdx = panelStore.index("comicId");
    const panelCursorReq = panelIdx.openCursor(IDBKeyRange.only(id));
    panelCursorReq.onsuccess = (e) => {
      const cursor = e.target.result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      }
    };
    const done = txDone(t);
    await done;
    try {
      const remaining = await this.getAllComics();
      if (!remaining.length) localStorage.setItem(STORAGE_MARKER_KEY, JSON.stringify({ hasLibrary: false, updatedAt: Date.now() }));
    } catch (e) {}
    return done;
  },

  async putPage(comicId, index, blob) {
    const t = await tx(["pages"], "readwrite");
    t.objectStore("pages").put({ key: `${comicId}:${index}`, comicId, index, blob });
    return txDone(t);
  },

  async getPage(comicId, index) {
    const t = await tx(["pages"], "readonly");
    const req = t.objectStore("pages").get(`${comicId}:${index}`);
    const result = await reqResult(req);
    return result ? result.blob : null;
  },

  // ---------------- Panel-detection cache ----------------
  // `panels` is null/undefined = "not yet computed"; an array (possibly
  // empty) = "computed, here's what we found" — so we never redo the work.
  async getPanels(comicId, index) {
    const t = await tx(["panels"], "readonly");
    const req = t.objectStore("panels").get(`${comicId}:${index}`);
    const result = await reqResult(req);
    return result ? result.panels : undefined;
  },

  async putPanels(comicId, index, panels) {
    const t = await tx(["panels"], "readwrite");
    t.objectStore("panels").put({ key: `${comicId}:${index}`, comicId, index, panels });
    return txDone(t);
  },

  // ---------------- Collections ----------------
  async addCollection(collection) {
    const t = await tx(["collections"], "readwrite");
    t.objectStore("collections").put(collection);
    const done = txDone(t);
    await done;
    try {
      localStorage.setItem(STORAGE_MARKER_KEY, JSON.stringify({ hasLibrary: true, updatedAt: Date.now() }));
    } catch (e) {}
    return done;
  },

  async getCollection(id) {
    const t = await tx(["collections"], "readonly");
    const req = t.objectStore("collections").get(id);
    return reqResult(req);
  },

  async getAllCollections() {
    const t = await tx(["collections"], "readonly");
    const req = t.objectStore("collections").getAll();
    const result = await reqResult(req);
    return (result || []).sort((a, b) => b.createdAt - a.createdAt);
  },

  async updateCollection(id, patch) {
    const col = await this.getCollection(id);
    if (!col) return;
    Object.assign(col, patch);
    return this.addCollection(col);
  },

  // Removes the collection but keeps its comics (they become standalone again).
  async ungroupCollection(id) {
    const comics = await this.getAllComics();
    const t = await tx(["comics", "collections"], "readwrite");
    const comicStore = t.objectStore("comics");
    comics.filter((c) => c.collectionId === id).forEach((c) => {
      c.collectionId = null;
      comicStore.put(c);
    });
    t.objectStore("collections").delete(id);
    return txDone(t);
  },

  // Deletes the collection AND every comic (and its pages) inside it.
  async deleteCollectionAndComics(id) {
    const comics = await this.getAllComics();
    const targets = comics.filter((c) => c.collectionId === id);
    for (const c of targets) {
      await this.deleteComic(c.id);
    }
    const t = await tx(["collections"], "readwrite");
    t.objectStore("collections").delete(id);
    const done = txDone(t);
    await done;
    try {
      const [remainingComics, remainingCollections] = await Promise.all([this.getAllComics(), this.getAllCollections()]);
      if (!remainingComics.length && !remainingCollections.length) {
        localStorage.setItem(STORAGE_MARKER_KEY, JSON.stringify({ hasLibrary: false, updatedAt: Date.now() }));
      }
    } catch (e) {}
    return done;
  },
};

function reqResult(req) {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function txDone(t) {
  return new Promise((resolve, reject) => {
    t.oncomplete = () => resolve();
    t.onerror = () => reject(t.error);
    t.onabort = () => reject(t.error);
  });
}

window.LongboxDB = LongboxDB;
