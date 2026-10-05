'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../../..'),sw=fs.readFileSync(path.join(root,'sw.js'),'utf8'),html=fs.readFileSync(path.join(root,'index.html'),'utf8'),map=fs.readFileSync(path.join(root,'js/panel-map-core.js'),'utf8'),gradle=fs.readFileSync(path.join(root,'android/app/build.gradle.kts'),'utf8');
assert(sw.includes('const CACHE_NAME = "nth-shelf-shell-2.79.76";'));
const block=sw.match(/const SHELL_FILES = \[([\s\S]*?)\];/);assert(block);
const files=[...block[1].matchAll(/"([^"]+)"/g)].map(x=>x[1]);assert.equal(files.length,new Set(files).size);
for(const rel of ['./js/panels-edge-guided-paper.js','./js/panels-chromatic-shared-border.js']){assert(files.includes(rel));assert(fs.existsSync(path.join(root,rel)));}
assert(html.includes('<title>Nth Shelf 2.79.76 — Comic Reader</title>'));
assert(html.includes('<meta name="application-version" content="2.79.76" />'));
assert(html.includes('<script src="js/panels-chromatic-shared-border.js"></script>'));
assert(html.indexOf('js/panels-chromatic-shared-border.js')>html.indexOf('js/panels-edge-guided-paper.js'));
assert(html.indexOf('js/panels-chromatic-shared-border.js')<html.indexOf('js/panel-map-core.js'));
assert(map.includes("MAP_VERSION: 'panel-map-exp-74'"));
assert(map.includes("PROOF_VERSION: 'frame-proof-2.79.76'"));
assert(gradle.includes('versionCode = 28004'));assert(gradle.includes('versionName = "2.79.76"'));assert(gradle.includes('applicationIdSuffix = ".frametest76"'));assert(gradle.includes('"Nth Shelf Test76"'));
console.log(JSON.stringify({passed:true,cache:'nth-shelf-shell-2.79.76',shellFiles:files.length,detectorLoadOrder:true,mapVersion:'panel-map-exp-74',package:'frametest76'}));
