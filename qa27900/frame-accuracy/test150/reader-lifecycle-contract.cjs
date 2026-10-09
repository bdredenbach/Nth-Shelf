'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');let cv;try{cv=require('@napi-rs/canvas');}catch(_){cv=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/@napi-rs/canvas');}
const root=path.resolve(process.env.NTH_SHELF_SOURCE||path.join(__dirname,'../../..')),modulePath=process.env.NTH_INK_CORNER_MODULE||path.join(root,'js/panels-ink-corner-partition.js'),name='panels-ink-corner-partition.js',scripts=[...fs.readFileSync(root+'/index.html','utf8').matchAll(/src="(js\/panels[^\"]*\.js)"/g)].map(m=>m[1]);let indexed=false,draws=0;
const code=scripts.map(p=>{if(path.basename(p)===name){indexed=true;return fs.readFileSync(modulePath,'utf8');}return fs.readFileSync(path.join(root,p),'utf8');});if(!indexed)code.push(fs.readFileSync(modulePath,'utf8'));
const document={createElement(){const c=cv.createCanvas(1,1),get=c.getContext.bind(c);c.getContext=(...args)=>{const g=get(...args),draw=g.drawImage.bind(g);g.drawImage=(...args)=>{draws++;return draw(...args);};return g;};return c;}},ctx=vm.createContext({console,document,window:{},Image:cv.Image,setTimeout,clearTimeout});vm.runInContext(code.join('\n'),ctx);const M=vm.runInContext('PanelInkCornerPartition',ctx),A=vm.runInContext('PanelConnectedPairs',ctx),B=vm.runInContext('PanelPaperContinuationGroups',ctx),D=vm.runInContext('PanelWidePaperRows',ctx),C=vm.runInContext('PanelCropRepair',ctx),clone=x=>JSON.parse(JSON.stringify(x));

function fixture(cv,o={}){const c=cv.createCanvas(600,900),g=c.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,600,900);
 function path(points){g.beginPath();points.forEach(([x,y],k)=>k?g.lineTo(x,y):g.moveTo(x,y));g.closePath();}
 function art(points,kind=0){g.save();path(points);g.clip();for(let y=0;y<900;y+=7)for(let x=0;x<600;x+=9){const t=(x+17*y+kind*19)%157;g.fillStyle=`rgb(${65+t},${60+(t*3)%153},${70+(t*7)%147})`;g.fillRect(x,y,9,7);g.fillStyle='#202020';g.fillRect(x+(y%14?4:0),y,4,7);}if(kind===4){g.fillStyle='#ccb18e';g.fillRect(0,0,600,350);}g.restore();path(points);g.lineWidth=3;g.strokeStyle='#171717';g.stroke();}
 const rect=(x,y,X,Y)=>[[x,y],[X,y],[X,Y],[x,Y]];
 art(rect(132,38,576,181),1);art(rect(146,198,576,466),2);art(rect(22,487,247,875),3);art([[80,324],[148,307],[207,328],[218,365],[195,466],[150,510],[0,535],[0,365],[50,340]],4);
 art([[268,403],[294,416],[196,529],[157,530]],9);
 art(rect(264,488,360,875),5);art(rect(376,488,576,875),6);art(rect(345,650,390,715),7);
 art([[22,0],[132,0],[132,216],[125,222],[129,308],[125,323],[60,325],[17,331]],8);
 function balloon(x,y,rx,ry){g.beginPath();g.ellipse(x,y,rx,ry,0,0,2*Math.PI);g.fillStyle='#fff';g.fill();g.lineWidth=2;g.strokeStyle='#161616';g.stroke();g.fillStyle='#151515';for(let j=-ry*.4;j<ry*.5;j+=8)for(let i=-rx*.6;i<rx*.6;i+=8)g.fillRect(x+i,y+j,4,4);}
 balloon(508,87,37,23);balloon(458,229,58,26);balloon(117,510,69,21);balloon(309,521,25,17);balloon(453,522,48,24);
 g.fillStyle='#e4d577';g.strokeStyle='#fffbe0';g.lineWidth=2;g.fillRect(25,35,101,25);g.strokeRect(25,35,101,25);
 if(o.foreignBalloon)balloon(132,112,31,23);
 if(o.thirdScene){g.fillStyle='#fff';g.fillRect(16,690,236,16);g.strokeStyle='#171717';g.lineWidth=3;g.strokeRect(20,690,227,16);}
 if(o.missingSeam||o.missingCollar){const im=g.getImageData(0,0,600,900);for(let y=0;y<900;y++)for(let x=0;x<600;x++){const i=4*(y*600+x),inBand=o.missingSeam&&x>=111&&x<=149&&y>=3&&y<=180||o.missingCollar&&x>=10&&x<=143&&y>=306&&y<=334;if(inBand&&Math.max(im.data[i],im.data[i+1],im.data[i+2])<135){im.data[i]=204;im.data[i+1]=177;im.data[i+2]=142;}}g.putImageData(im,0,0);}
 if(o.blank){g.fillStyle='#fff';g.fillRect(0,0,600,900);}
 let out=c;if(o.inset){const d=cv.createCanvas(600,900),p=d.getContext('2d');p.fillStyle='#fff';p.fillRect(0,0,600,900);p.drawImage(out,9,0,582,900);out=d;}if(o.mirror){const input=out;out=cv.createCanvas(600,900);const d=out.getContext('2d');d.translate(600,0);d.scale(-1,1);d.drawImage(input,0,0);}if(o.shift){const d=cv.createCanvas(600,900),p=d.getContext('2d');p.fillStyle='#fff';p.fillRect(0,0,600,900);p.drawImage(out,10,0);out=d;}if(o.scale){const d=cv.createCanvas(Math.round(out.width*o.scale),Math.round(out.height*o.scale));d.getContext('2d').drawImage(out,0,0,d.width,d.height);out=d;}
 const im=out.getContext('2d').getImageData(0,0,out.width,out.height);if(o.palette){for(let i=0;i<im.data.length;i+=4){const [r,g,b]=[im.data[i],im.data[i+1],im.data[i+2]];im.data[i]=g;im.data[i+1]=b;im.data[i+2]=r;}out.getContext('2d').putImageData(im,0,0);}return{a:im.data,w:out.width,h:out.height,canvas:out};}


// This fixture is independently generated from the portable proof93 contract.
// A private iteration cache can avoid rebuilding that same generated fixture.
const seedPath=process.env.NTH_INK_GENERATED_SEED;
const seed=seedPath?JSON.parse(fs.readFileSync(seedPath)):null;
const q=seed?null:fixture(cv),one=seed?.prior||A.analyzeRGBA(q.a,q.w,q.h,[]),two=seed?[]:B.analyzeRGBA(q.a,q.w,q.h,one),three=seed?[]:D.analyzeRGBA(q.a,q.w,q.h,one.concat(two)),prior=one.concat(two,three),out=seed?.out||M.analyzeRGBA(q.a,q.w,q.h,prior);
assert.equal(out.length,3,'independent generated family');
const keepAlive=setInterval(()=>{},1000);
const png=seedPath?fs.readFileSync(seedPath.replace(/\.json$/,'.png')):q.canvas.toBuffer('image/png');
const crypto=require('node:crypto'),hash=c=>crypto.createHash('sha256').update(c.toBuffer('image/png')).digest('hex');
function el(tag='div'){
 const e=tag==='canvas'?cv.createCanvas(1,1):{};
 Object.assign(e,{children:[],style:{setProperty(k,v){this[k]=v}},dataset:{},setAttribute(){},appendChild(c){this.children.push(c);c.parentNode=this},remove(){if(this.parentNode)this.parentNode.children=this.parentNode.children.filter(c=>c!==this);this.parentNode=null},animate(){const a={cancel(){this.oncancel?.()}};this.animation=a;return a}});
 const names=new Set();e.classList={add:n=>names.add(n),remove:n=>names.delete(n),toggle(n,on){if(on)names.add(n);else names.delete(n)},contains:n=>names.has(n)};return e;
}
function actualReader(){
 const raf=[];document.createElement=el;Object.assign(ctx,{ImageData:cv.ImageData,localStorage:{getItem:()=>null},requestAnimationFrame:fn=>raf.push(fn)});
 vm.runInContext(fs.readFileSync(root+'/js/reader.js','utf8'),ctx);const r=vm.runInContext('Reader',ctx);M.installReader(r);return{r,raf};
}
function imageDescriptor(img,name){for(let p=img;p;p=Object.getPrototypeOf(p)){const d=Object.getOwnPropertyDescriptor(p,name);if(d)return d;}}
(async()=>{
 const img=new cv.Image(),src=imageDescriptor(img,'src'),nw=imageDescriptor(img,'naturalWidth'),nh=imageDescriptor(img,'naturalHeight');src.set.call(img,png);await img.decode();
 const life={src:'generated://base',current:'generated://base',ready:true,width:600,height:900,nw:null,nh:null,throws:null},listeners={};
 const value=(name,v)=>{if(life.throws===name)throw Error('unavailable '+name);return v;};
 Object.defineProperties(img,{src:{get:()=>value('src',life.src)},currentSrc:{get:()=>value('currentSrc',life.current)},complete:{get:()=>value('complete',life.ready)},width:{get:()=>value('width',life.width)},height:{get:()=>value('height',life.height)},naturalWidth:{get:()=>value('naturalWidth',life.nw??nw.get.call(img))},naturalHeight:{get:()=>value('naturalHeight',life.nh??nh.get.call(img))}});
 img.addEventListener=(name,fn)=>(listeners[name]||=[]).push(fn);const emit=name=>{for(const fn of listeners[name]||[])fn();};
 const {r,raf}=actualReader(),owners=[clone(prior[0]),...clone(out)],rect={left:0,top:0,width:600,height:900,right:600,bottom:900};
 const reset=()=>{r.removePanelOverlay(false);r.setFocusDim(false,false);r.els.viewport.classList.remove('panel-focus-page-dimmed');};
 Object.assign(r,{currentPanels:owners,panelZoomEnabled:true,mode:'single',index:13,comic:{id:'generated'},els:{stage:el(),viewport:el()},getPanelImageContext:()=>({img,rect})});
 const checks=[],failures=[];
 async function check(name,fn){if(process.env.NTH_INK_LIFECYCLE_CASE&&!process.env.NTH_INK_LIFECYCLE_CASE.split('|').some(part=>name.includes(part)))return;try{await fn();checks.push(name);console.log('PASS',name);}catch(e){failures.push({name,error:e.message});console.error('FAIL',name,e.message);}finally{reset();r.currentPanels=owners;}}
 const warm=()=>{assert(r.displayPanelContours(owners[1]),'source-replayed family');};
 warm();const points=owners.slice(1).map(p=>{const rings=r.displayPanelContours(p);for(let y=1;y<900;y+=3)for(let x=1;x<600;x+=3)if(r.pointInContours(rings,x/600,y/900))return[x/600,y/900];throw Error('no child interior');});
 const baseline=[];if(!process.env.NTH_INK_LIFECYCLE_CASE||process.env.NTH_INK_LIFECYCLE_CASE.includes('warm cache'))for(const p of owners){reset();await r.zoomToPanel(p,rect,rect);assert(r.els.panelOverlay?.children[0]);baseline.push(hash(r.els.panelOverlay.children[0]));}reset();
 const rejected=async()=>{for(let k=1;k<owners.length;k++){assert.equal(r.displayPanelContours(owners[k]),null);assert.notEqual(r.findPanelAt(...points[k-1]),owners[k]);await r.zoomToPanel(owners[k],rect,rect);assert.equal(r.els.panelOverlay,null);}};
 for(const key of['src','currentSrc','naturalWidth','naturalHeight','width','height','complete'])await check('throwing '+key,async()=>{try{life.throws=key;await rejected();}finally{life.throws=null;}});
 await check('incomplete source retains decoded pixels',async()=>{try{life.ready=false;await rejected();}finally{life.ready=true;}});
 for(const key of['nw','nh'])await check('zero intrinsic '+key+' cannot use render dimensions',async()=>{try{life[key]=0;await rejected();}finally{life[key]=null;}});
 await check('error quarantines retained decoded pixels',async()=>{try{emit('error');await rejected();}finally{emit('load');}});
 for(const [key,value]of[['src','generated://other'],['current','generated://selected'],['width',601],['height',901]])await check('cache binds '+key,async()=>{warm();const s=r._inkCornerPartitionState;life[key]=value;warm();assert.notEqual(r._inkCornerPartitionState,s);});
 life.src='generated://base';life.current='generated://base';life.width=600;life.height=900;
 await check('same URL load invalidates decoded pixels',async()=>{const blank=cv.createCanvas(600,900);try{src.set.call(img,blank.toBuffer('image/png'));await img.decode();emit('load');await rejected();}finally{src.set.call(img,png);await img.decode();emit('load');}});
 const stale=()=>{assert.equal(r.els.panelOverlay,null);assert.equal(r.focusMode,null);assert.equal(r.panelOverlayActive,false);assert.equal(r.panelFocusMeta,null);assert.equal(r.els.viewport.classList.contains('panel-focus-page-dimmed'),false);assert.equal(r.els.focusDim?.classList.contains('active'),false);};
 for(const member of[0,1])for(const change of['source','currentSrc','ready','error','load','throw','intrinsic','index','comic','owners','same array replacement'])await check('async '+member+' '+change,async()=>{
  warm();reset();const pending=r.zoomToPanel(owners[member],rect,rect),overlay=r.els.panelOverlay;assert(overlay,'actual Reader overlay before settlement');const oldComic=r.comic,oldIndex=r.index,oldItem=owners[2],next=[];
  try{if(change==='source')life.src='generated://changed';if(change==='currentSrc')life.current='generated://changed';if(change==='ready')life.ready=false;if(change==='error')emit('error');if(change==='load')emit('load');if(change==='throw')life.throws='src';if(change==='intrinsic')life.nw=0;if(change==='index')r.index++;if(change==='comic')r.comic={id:'different'};if(change==='owners')r.currentPanels=next;if(change==='same array replacement')owners[2]=clone(out[1]);await pending;if(change==='owners')assert.equal(r.currentPanels,next);if(member===0&&change!=='owners')assert.notEqual(r.currentPanels,owners,'stale prior delegation cannot restore old family');stale();assert.equal(overlay.parentNode,null);
  }finally{life.src='generated://base';life.current='generated://base';life.ready=true;life.throws=null;life.nw=null;if(change==='error')emit('load');r.comic=oldComic;r.index=oldIndex;owners[2]=oldItem;}
 });
 await check('newer overlay survives older completion',async()=>{warm();reset();const pending=r.zoomToPanel(owners[1],rect,rect),old=r.els.panelOverlay;r.removePanelOverlay(false);r.setFocusDim(false,false);r.index++;await r.zoomToPanel(owners[2],rect,rect);const newer=r.els.panelOverlay;assert(newer&&newer!==old);await pending;assert.equal(r.els.panelOverlay,newer);assert(newer.parentNode);r.index--;});
 await check('accepted scope rejects a child during pending zoom',async()=>{warm();reset();const pending=r.zoomToPanel(owners[0],rect,rect),overlay=r.els.panelOverlay;assert(overlay);assert.notEqual(r.currentPanels,owners);assert.equal(r.displayPanelContours(owners[1]),null);assert.notEqual(r.findPanelAt(...points[0]),owners[1]);await r.zoomToPanel(owners[1],rect,rect);assert.equal(r.els.panelOverlay,overlay);await pending;assert.equal(r.currentPanels,owners);});
 await check('warm cache and exact restored generated canvases',async()=>{warm();const s=r._inkCornerPartitionState;for(let k=0;k<owners.length;k++){reset();await r.zoomToPanel(owners[k],rect,rect);assert.equal(hash(r.els.panelOverlay.children[0]),baseline[k]);assert.equal(r.currentPanels,owners);}assert.equal(r._inkCornerPartitionState,s);});
 await check('unrelated family skips source and nested proof reads',async()=>{let reads=0;const proof={version:12,method:'unrelated'};Object.defineProperty(proof,'observations',{get(){reads++;throw Error('unexpected proof read')}});const p={x:0,y:0,w:1,h:1,_structuralGridProof:proof},contours=[],base={currentPanels:[p],panelContours:()=>contours,getPanelImageContext(){reads++;throw Error('unexpected source read')},displayPanelContours:()=>contours,findPanelAt:()=>p,zoomToPanel:()=>p};M.installReader(base);assert.equal(base.displayPanelContours(p),contours);assert.equal(base.findPanelAt(.5,.5),p);assert.equal(base.zoomToPanel(p),p);assert.equal(reads,0);});
 assert.equal(listeners.load.length,1,'one load listener per image');assert.equal(listeners.error.length,1,'one error listener per image');
 const report={passed:!failures.length,checks,failures,generatedCanvasHashes:baseline,actualReader:true,olderReaderWrappers:true,peakRSSKiB:process.resourceUsage().maxRSS};console.log(JSON.stringify(report,null,2));if(process.env.NTH_INK_LIFECYCLE_REPORT)fs.writeFileSync(process.env.NTH_INK_LIFECYCLE_REPORT,JSON.stringify(report,null,2));assert.equal(failures.length,0,'focused lifecycle failures');
})().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>clearInterval(keepAlive));
