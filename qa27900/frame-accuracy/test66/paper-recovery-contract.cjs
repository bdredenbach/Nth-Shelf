'use strict';
const fs=require('fs'),path=require('path'),zlib=require('zlib'),assert=require('assert/strict');
const root=path.resolve(__dirname,'../../..');
global.PanelMatteCells=require(path.join(root,'js/panels-matte-cells.js'));
global.PanelRaggedGutters=require(path.join(root,'js/panels-ragged-gutters.js'));
const M=require(path.join(root,'js/panels-paper-recovery.js'));
const panels=JSON.parse(zlib.gunzipSync(Buffer.from(fs.readFileSync(path.join(__dirname,'paper-geometry.json.gz.b64'),'utf8').trim(),'base64')));
assert.equal(panels.length,2);assert(panels.every(M.validPanel));
const mutations=[p=>p._structuralGridProof.difference++,p=>p._structuralGridProof.fringe[0][1]+=20,p=>p._structuralGridProof.fringe[0][2]=120,p=>p._structuralGridProof.fringe[0][5]=40,p=>p._structuralGridProof.corridors[0].flanks.matched=0,p=>p._structuralGridProof.corridors[0].neighbor=p._structuralGridProof.second,p=>p._structuralGridProof.corridors[0].pixels++,p=>p._structuralGridProof.corridors[0].minColor[0]=220,p=>p._structuralGridProof.second._structuralGridProof.seedRadius=4,p=>p._structuralGridProof.first._structuralGridProof.seedRadius=6,p=>p._structuralGridProof.first._structuralGridProof.seed.splits.push({axis:0,pos:30,support:1,flank:1,score:1.1}),p=>p.x+=.001,p=>p._contours[0][0].x+=.001,p=>p._structuralGridProof.pixelContours[0][0][0]++,p=>p._quad=[]];
let rejected=0;for(const p of panels)for(const mutate of mutations){const q=JSON.parse(JSON.stringify(p));mutate(q);assert.equal(M.validPanel(q),false);rejected++;}
function synthetic(bridge=2){const w=600,h=900,rgba=Buffer.alloc(w*h*4,255);for(let y=40;y<860;y++)for(let x=40;x<560;x++){const i=(y*w+x)*4,ink=(Math.floor(x/21)+Math.floor(y/29))%2;rgba[i]=ink?35:180;rgba[i+1]=ink?70:105;rgba[i+2]=ink?130:55;}for(let y=40+bridge;y<860-bridge;y++)for(let x=296;x<304;x++){const i=(y*w+x)*4;rgba[i]=rgba[i+1]=rgba[i+2]=255;}return{rgba,w,h};}
const s=synthetic(),out=M.analyzeRGBA(s.rgba,s.w,s.h);assert.equal(out.length,2);assert(out.every(M.validPanel));
const broad=synthetic(140);assert.equal(M.analyzeRGBA(broad.rgba,broad.w,broad.h).length,0,'a broad artwork connection must not be cut into cells');
assert.deepEqual(M.completeImage({},[{}]),[],'established maps cannot be replaced');
console.log(JSON.stringify({paperOwners:panels.length,rejectedMutations:rejected,syntheticThinNeckOwners:out.length,broadArtworkNeckRejected:true}));
