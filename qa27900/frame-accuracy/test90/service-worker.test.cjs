'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../../..'),sw=fs.readFileSync(path.join(root,'sw.js'),'utf8'),html=fs.readFileSync(path.join(root,'index.html'),'utf8'),map=fs.readFileSync(path.join(root,'js/panel-map-core.js'),'utf8'),gradle=fs.readFileSync(path.join(root,'android/app/build.gradle.kts'),'utf8');
assert(sw.includes('const CACHE_NAME = "nth-shelf-shell-2.79.90";'));
const block=sw.match(/const SHELL_FILES = \[([\s\S]*?)\];/);assert(block);const files=[...block[1].matchAll(/"([^"]+)"/g)].map(x=>x[1]);assert.equal(files.length,new Set(files).size);
for(const rel of ['./js/panels-lettering-cells.js','./js/panels-connected-pairs.js','./js/panels-neighbor-edge-cells.js','./js/panels-smooth-gutter-boundaries.js','./js/panels-interior-strokes.js','./js/panels-context-cells.js','./js/panels-local-boundary-consensus.js','./js/panels-horizontal-paper-strips.js','./js/panels-top-row-barrier.js','./js/panels-ragged-gutters.js','./js/panels-narrow-ink-frames.js']){assert(files.includes(rel));assert(fs.existsSync(path.join(root,rel)));}
assert(html.includes('<title>Nth Shelf 2.79.90 — Comic Reader</title>'));assert(html.includes('<meta name="application-version" content="2.79.90" />'));
assert(map.includes("MAP_VERSION: 'panel-map-exp-90'"));assert(map.includes("PROOF_VERSION: 'frame-proof-2.79.90'"));
assert(gradle.includes('versionCode = 28018'));assert(gradle.includes('versionName = "2.79.90"'));assert(gradle.includes('applicationIdSuffix = ".frametest90"'));assert(gradle.includes('"Nth Shelf Test90"'));
console.log(JSON.stringify({passed:true,cache:'nth-shelf-shell-2.79.90',shellFiles:files.length,horizontalPaperStrips:true,package:'frametest90'}));
