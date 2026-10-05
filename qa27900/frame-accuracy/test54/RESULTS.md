# Test54 — pages50–53 exterior paper frames and insets

Baseline Test53 7b781bed7654d539d97fe929da67ba82a1906901. User confirmed page49 worked and requested this four-page batch. Private source indices49–52. No artwork is committed.

Expected selections, including one inset per page: page50=7; page51=6; page52=6; page53=4. The shared route starts with exterior-connected white paper components, proves all four dark rims around each main frame and measures the inset independently. It requires the inset parent to span the page width. This keeps narrow scene pictures outside this route. No page IDs, titles, hashes or stored QA coordinates drive runtime.

Page51's lower right border has a neighboring object touching it. An aligned upper rail plus independent borderless components prove the left scene with its complete dialogue. Page50's eye inset owns the crossing speech balloon, including its lettering and tail. Every inset is excluded from its surrounding scene's pixel mask. Six already-correct lower selections across pages50/52/53 remain byte-identical.

Validation:

- 23 selections x9 actual touchscreen dispatches x2 rendering setups =414 touch checks. Default and alternate high-quality scaling. Crop geometry remains identical across taps; all23 crops visually inspected. Inset exclusions and the page50 balloon attachment checked.
- 42,936 manually inset dense artwork samples per setup (85,872 total) remain opaque. Foreign inset samples are transparent in their surrounding crops. No page errors.
- Low/medium/high Skia and Sharp resized-canvas variants across all four pages (16 variants) give identical new canonical masks. A Sharp variant collapses page53's raw legacy map; native recovery runs after closed-frame discovery and preserves the matching bottom anchor. These are simulated scaling variations, not phone capture results.
- Full74-page comparison changes only50–53 from4/2/3/2 to7/6/6/4. Other70 descriptor arrays are exact, including phone-confirmed49. All six retained lower identities remain exact.
- 88 independently erased main/inset rims reject. Main-border erasure uses paper white to avoid falsely joining adjacent frames through a dark replacement strip. Transparent/flat/proved-owner negatives reject; four positive controls pass.
- 17 captured new proofs survive geometry routing;265 proof/geometry mutations reject. Complete syntax and retained regression gate passes.

Private QA scripts require the comic, CHROME_BIN and workspace HTTP server. reader.cjs takes QA_PAGE=50..53 and optionally QA_RASTER=high. build-rasters.cjs prepares sixteen private pixel variants. negative.cjs uses private canonical RGBA fixtures. Committed captured geometry and reports contain numbers only. paper-insets-contract.cjs and service-worker.test.cjs run without artwork in CI.

Identity2.79.54/code27982/io.github.bdredenbach.nthshelf.frametest54/Nth Shelf Test54. Phone acceptance remains pending. Check all23 selections, especially page50's crossing speech balloon and page51's full borderless dialogue.

Roadmap: finish remaining Wolverine pages first. After this batch is confirmed, continue at page54. Generalization across comics is the next task after that campaign.
