from pathlib import Path
p=Path('/mnt/data/v64work/js/reader.js')
s=p.read_text()
start=s.index(' getPanelImageContext() {')
end=s.index('\n\n // V57:', start)
new=r''' getPanelImageContext(screenX = null, screenY = null) {
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
 },'''
s=s[:start]+new+s[end:]
# replace only the start of handleSingleTap context lookup and zoom call
old='''   const stageRect = this.els.stage.getBoundingClientRect();\n   const ctx = this.getPanelImageContext();\n   const img = ctx?.img;\n   const imgRect = ctx?.rect || stageRect;'''
new2='''   const stageRect = this.els.stage.getBoundingClientRect();\n   const ctx = this.getPanelImageContext(pos.x, pos.y);\n   const img = ctx?.img;\n   const imgRect = ctx?.rect || stageRect;'''
if old not in s:
    raise SystemExit('handle context pattern not found')
s=s.replace(old,new2,1)
old2='''   const relYImg = clamp((pos.y - imgRect.top) / imgRect.height, 0, 1);\n\n   // V63: ignore the detected parent/child hierarchy for frame selection.'''
new3='''   const relYImg = clamp((pos.y - imgRect.top) / imgRect.height, 0, 1);\n\n   // V64: the image context above was resolved from the exact screen tap.\n   // Show a temporary marker and log the natural source pixel so this test\n   // can prove the coordinate mapping before we judge V63's boundary logic.\n   this.showV64TapMarker(pos, img, imgRect, relXImg, relYImg, ctx?.pageNumber || (this.index + 1));\n   if (this.debugMode) {\n     this.debugLog(\n       `[V64] VERIFIED CONTEXT page=${ctx?.pageNumber || (this.index + 1)} ` +\n       `img=${img.naturalWidth}x${img.naturalHeight}`\n     );\n   }\n\n   // V63: ignore the detected parent/child hierarchy for frame selection.'''
if old2 not in s:
    raise SystemExit('rel pattern not found')
s=s.replace(old2,new3,1)
old3='''     this.zoomToPanel(panel, stageRect, imgRect);'''
new4='''     this.zoomToPanel(panel, stageRect, imgRect, img);'''
# only first occurrence after handle; there may be one. Replace all? likely one
s=s.replace(old3,new4,1)
# Update zoom signature and use verified image if supplied
s=s.replace(''' async zoomToPanel(panel, stageRect, imgRect) {''',''' async zoomToPanel(panel, stageRect, imgRect, verifiedImg = null) {''',1)
s=s.replace('''   const ctx = this.getPanelImageContext();\n   const img = ctx?.img;\n   if (!img || !img.naturalWidth || !img.naturalHeight) return;''','''   const ctx = verifiedImg ? null : this.getPanelImageContext();\n   const img = verifiedImg || ctx?.img;\n   if (!img || !img.naturalWidth || !img.naturalHeight) return;''',1)
# header comment
s=s.replace('// V63 PERFORMANCE-SAFE GRADIENT LAB — progressive tap-centered frame-boundary experiment.', '// V64 COORDINATE TRUTH + V63 PERFORMANCE-SAFE GRADIENT LAB — tap-to-image verification before boundary analysis.',1)
p.write_text(s)

pp=Path('/mnt/data/v64work/js/panels.js')
ps=pp.read_text()
ps=ps.replace('// V63 PERFORMANCE-SAFE GRADIENT LAB: progressive tap-centered frame-boundary experiment.', '// V64 COORDINATE TRUTH COMPATIBLE + V63 PERFORMANCE-SAFE GRADIENT LAB: tap-centered boundary experiment.',1)
ps=ps.replace('  // V63 PERFORMANCE-SAFE GRADIENT LAB\n', '  // V64 uses this V63 boundary engine only after reader.js verifies the\n  // exact visible image and tap-to-source coordinate. Parent/child/grandchild\n  // panel selection remains intentionally excluded from the experiment.\n  // V63 PERFORMANCE-SAFE GRADIENT LAB\n',1)
pp.write_text(ps)
