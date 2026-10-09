'use strict';
// Generated pixels only. Native source sampling must not inherit a renderer's
// destination-size filter choice; the oversized fallback remains bounded.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const cv=require('@napi-rs/canvas');
const root=process.env.NTH_SAMPLER_SOURCE||path.resolve(__dirname,'../../..');
const code=fs.readFileSync(path.join(root,'js/panels-matte-cells.js'),'utf8');
const plain=v=>JSON.parse(JSON.stringify(v)),sha=b=>crypto.createHash('sha256').update(b).digest('hex');
function generated(width,height,shift=0){
 const c=cv.createCanvas(width,height),g=c.getContext('2d');g.fillStyle='#fafafa';g.fillRect(0,0,width,height);
 const cells=[[.035,.035,.425,.40],[.535,.035,.425,.40],[.035,.515,.925,.45]];
 for(const [left,top,wide,tall] of cells){const x=left*width,y=top*height,w=wide*width,h=tall*height;g.fillStyle='#181818';g.fillRect(x,y,w,h);g.save();g.beginPath();g.rect(x+9,y+9,w-18,h-18);g.clip();g.fillStyle='#d89f62';g.fillRect(x,y,w,h);for(let i=-height;i<width+height;i+=29){g.fillStyle=(i/29+shift)%2?'#253450':'#eedba0';g.beginPath();g.moveTo(i,y);g.lineTo(i+15,y);g.lineTo(i+h*.48+15,y+h);g.lineTo(i+h*.48,y+h);g.fill();}g.restore();}
 return c;
}
function context(profile,{unreadable=false,missing=false,fake=false}={}){
 const counts={nativeDraws:0,scaledDraws:0,readbacks:0,created:[]};
 const document={createElement(){
  const c=fake?{width:1,height:1}:cv.createCanvas(1,1);counts.created.push(c);
  const get=fake?()=>({drawImage(){},getImageData:(x,y,w,h)=>({data:new Uint8ClampedArray(w*h*4)})}):c.getContext.bind(c);
  c.getContext=(...args)=>{if(missing)return null;const g=get(...args),draw=g.drawImage.bind(g),read=g.getImageData.bind(g);
   g.drawImage=(img,...a)=>{const W=img.naturalWidth||img.width,H=img.naturalHeight||img.height,scaled=a.length===4&&(a[2]!==W||a[3]!==H);if(scaled){counts.scaledDraws++;g.imageSmoothingQuality=profile;}else counts.nativeDraws++;return draw(img,...a);};
   g.getImageData=(...a)=>{counts.readbacks++;if(unreadable)throw Error('Unavailable source pixels');return read(...a);};return g;};return c;
 }};
 const box=vm.createContext({document,Uint8Array,Uint8ClampedArray,console});vm.runInContext(code,box);
 return {M:vm.runInContext('PanelMatteCells',box),counts};
}
let scenes=0;
for(const [W,H,shift] of [[1160,1800,0],[1261,1903,1],[1430,2180,2]]){
 const image=generated(W,H,shift),before=sha(image.toBuffer('image/png')),low=context('low'),high=context('high');
 const a=low.M.analyzeImage(image),b=high.M.analyzeImage(image);
 assert(a.length>=2,'Generated source must independently detect multiple complete cells');
 assert.deepEqual(plain(a),plain(b),'Renderer filter policy must not change source-derived evidence');
 for(const item of [low,high]){assert.equal(item.counts.scaledDraws,0,'Normal-size source must avoid implicit downsampling');assert.equal(item.counts.nativeDraws,1);assert.equal(item.counts.readbacks,1);assert(item.counts.created.every(c=>c.width===1&&c.height===1),'Native allocation must be released');assert(a.every(p=>item.M.validPanel(p)));}
 assert.equal(sha(image.toBuffer('image/png')),before,'Analysis must preserve source pixels');scenes++;
}
const empty=cv.createCanvas(1000,1600);empty.getContext('2d').fillStyle='#ffffff';empty.getContext('2d').fillRect(0,0,1000,1600);assert.equal(context('high').M.analyzeImage(empty).length,0);
for(const options of [{unreadable:true},{missing:true}]){const q=context('high',options);assert.equal(q.M.analyzeImage(generated(1000,1600)).length,0);assert(q.counts.created.every(c=>c.width===1&&c.height===1));}
const invalid=context('low');for(const img of [null,{width:0,height:500},{width:NaN,height:500},{width:123.5,height:900}])assert.equal(invalid.M.analyzeImage(img).length,0);assert.equal(invalid.counts.created.length,0);
const huge=context('low',{fake:true});assert.equal(huge.M.analyzeImage({width:24001,height:1000}).length,0);assert.equal(huge.counts.nativeDraws,0);assert.equal(huge.counts.scaledDraws,1);assert(huge.counts.created.every(c=>c.width===1&&c.height===1));
console.log(JSON.stringify({passed:true,independentGeneratedScenes:scenes,rendererFilterProfiles:2,sourcePixelsPreserved:true,unavailableSourcesFailClosed:2,invalidSourcesRejected:4,oversizedLegacyRouteBounded:true,originalComicPixelsEmbedded:false}));
