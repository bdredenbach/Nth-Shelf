'use strict';
// Text-region proof tests. Comic artwork is optional/local and is never copied
// into the repository: --comic /path/to/extracted/comic.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
let canvases=[];
function canvas(){
  const c={width:0,height:0};
  c.getContext=()=>({drawImage(){},createImageData(w,h){return{data:new Uint8ClampedArray(w*h*4)};},putImageData(d){c.pixels=d.data;}});
  canvases.push(c);return c;
}
const context=vm.createContext({console,window:{},document:{createElement:canvas}});
vm.runInContext(fs.readFileSync(path.join(__dirname,'../js/bubbles.js'),'utf8'),context);
const detector=context.window.BubbleDetect;
const plain=r=>r?JSON.parse(JSON.stringify({x:r.x,y:r.y,w:r.w,h:r.h,threshold:r.threshold})):null;
function fixture(kind){
  const w=600,h=900,data=new Uint8ClampedArray(w*h*4);
  function pixel(x,y,v){const i=(y*w+x)*4;data[i]=data[i+1]=data[i+2]=v;data[i+3]=255;}
  for(let y=0;y<h;y++)for(let x=0;x<w;x++)pixel(x,y,55);
  for(let y=298;y<363;y++)for(let x=178;x<342;x++)pixel(x,y,15);
  for(let y=301;y<360;y++)for(let x=181;x<339;x++)pixel(x,y,250);
  if(kind==='ragged-art'||kind==='ragged-text'){
    // A wide light region with deep contour notches. Two isolated fence-like marks
    // are not a caption; a substantial row of lettering remains selectable.
    for(let y=301;y<360;y++)for(let x=181;x<339;x++)
      pixel(x,y,(y>=323&&y<345)||x<189||x>=331?250:180);
    const rows=['10001','10001','10101','10101','10101','10101','11111'];
    const count=kind==='ragged-art'?2:10;
    for(let n=0;n<count;n++)for(let y=0;y<7;y++)for(let x=0;x<5;x++)
      if(rows[y][x]==='1')pixel((count===2?240:190)+n*13+x,330+y,10);
  }else if(kind==='text'||kind==='thin'){
    const letters=['10001','10001','10101','10101','10101','10101','11111'];
    for(let row=0;row<2;row++)for(let char=0;char<10;char++){
      for(let y=0;y<7;y++)for(let x=0;x<5;x++)if(letters[y][x]==='1'){
        pixel(190+char*13+x,312+row*22+y,kind==='thin'?135:10);
      }
    }
  }else if(kind==='short'){
    const glyphs=[['10001','11001','11001','10101','10011','10011','10001'],['01110','10001','10001','10001','10001','10001','01110']];
    glyphs.forEach((rows,i)=>rows.forEach((row,y)=>[...row].forEach((v,x)=>{if(v==='1')for(let dy=0;dy<2;dy++)for(let dx=0;dx<2;dx++)pixel(240+i*14+x*2+dx,320+y*2+dy,10);}))); 
  }else if(kind==='speed-lines'){
    // Ink enters from the bounding contour. An aggregate ink ratio would
    // mistake it for letters, but no enclosed glyph/word groups exist.
    for(let n=0;n<10;n++)for(let t=0;t<35;t++){
      const y=302+n*5+t/3|0;if(y<359)pixel(181+t,y,20);
    }
  }else if(kind==='speckles'){
    // Several enclosed dark marks without one coherent line of lettering.
    for(const [x,y]of[[198,309],[244,333],[303,348]])
      for(let dy=0;dy<4;dy++)for(let dx=0;dx<4;dx++)pixel(x+dx,y+dy,20);
  }
  return{data,w,h,img:{width:w,height:h}};
}
async function check(f,tap,expected,label){
  detector._load=async()=>f;
  const detected=await detector.detect('fixture',...tap);
  assert.equal(!!detected,expected,`${label}: detection`);
  canvases=[];
  const extracted=await detector.extract('fixture',...tap);
  assert.equal(!!extracted,expected,`${label}: extraction`);
  assert.deepEqual(plain(extracted),plain(detected),`${label}: both public APIs select the same region`);
  if(expected){
    assert.ok(extracted.canvas.width>0&&extracted.canvas.height>0,`${label}: nonempty overlay`);
    assert.ok(canvases.some(c=>c.pixels?.some((v,i)=>i%4===3&&v===255)),`${label}: nonempty silhouette`);
  }else assert.equal(canvases.length,0,`${label}: rejected artwork creates no overlay`);
  return detected;
}
(async()=>{
  await check(fixture('text'),[.4,.34],true,'enclosed two-line lettering');
  await check(fixture('thin'),[.4,.34],true,'one-pixel low-contrast lettering');
  await check(fixture('short'),[.4,.34],true,'two-letter NO speech');
  await check(fixture('empty'),[.4,.34],false,'empty light patch');
  await check(fixture('speed-lines'),[.4,.34],false,'boundary-connected speed lines');
  await check(fixture('speckles'),[.4,.34],false,'unstructured enclosed art marks');
  await check(fixture('ragged-art'),[.4,.36],false,'sparse fence-like marks in ragged light artwork');
  await check(fixture('ragged-text'),[.4,.36],true,'substantial text row in a ragged balloon');
  console.log('Bubble proof: 8 independent synthetic cases passed through detect + extract.');
  const flag=process.argv.indexOf('--comic');
  if(flag<0)return;
  const root=process.argv[flag+1]||path.resolve(__dirname,'../../comic-wolverine-1000');
  const sharp=require('sharp');
  for(const page of [4,5]){
    const file=path.join(root,`Wolverine (2010-2012) 1000-${String(page-1).padStart(3,'0')}.jpg`);
    const meta=await sharp(file).metadata();
    const {data,info}=await sharp(file).resize({width:1100,height:1100,fit:'inside',withoutEnlargement:true}).ensureAlpha().raw().toBuffer({resolveWithObject:true});
    const f={data,w:info.width,h:info.height,img:{width:meta.width,height:meta.height}};
    if(page===4){
      const results=[];
      for(const tap of [[.10,.05],[.20,.06],[.27,.065]])results.push(await check(f,tap,true,'page4 upper caption'));
      results.slice(1).forEach(r=>assert.deepEqual(plain(r),plain(results[0]),'page4 moved taps keep the same caption'));
    }else{
      for(const tap of [[.5,.32],[.5,.35],[.58,.30]])await check(f,tap,false,'page5 propeller sky');
      const captions=[[.16,.06],[.16,.28],[.17,.62],[.62,.65],[.84,.87]];
      for(const tap of captions)await check(f,tap,true,'page5 printed caption');
      const a=await check(f,[.84,.87],true,'page5 bottom-right caption canonical');
      for(const tap of [[.83,.85],[.91,.88]])assert.deepEqual(plain(await check(f,tap,true,'page5 bottom-right caption moved')),plain(a));
    }
  }

  // Independently reviewed printed captions from the wider comic sweep. These
  // baseline selections must not be lost or resized merely because grayscale
  // anti-aliasing joins letters at the bright interior threshold.
  const regressions=[
    {"page":12,"tap":[0.1916083916083916,0.721565059144677],"expected":{"x":0.14106145251396648,"y":0.6954545454545454,"w":0.10195530726256984,"h":0.05272727272727273,"threshold":235}},
    {"page":25,"tap":[0.6531468531468532,0.2929936305732484],"expected":{"x":0.5810055865921788,"y":0.26545454545454544,"w":0.1270949720670391,"h":0.05545454545454546,"threshold":235}},
    {"page":27,"tap":[0.6139860139860139,0.3375796178343949],"expected":{"x":0.4930167597765363,"y":0.3209090909090909,"w":0.2430167597765363,"h":0.025454545454545455,"threshold":225}},
    {"page":28,"tap":[0.6293706293706294,0.6587807097361238],"expected":{"x":0.5837988826815642,"y":0.6418181818181818,"w":0.09217877094972067,"h":0.04090909090909091,"threshold":235}},
    {"page":30,"tap":[0.5496503496503496,0.6305732484076433],"expected":{"x":0.5125698324022346,"y":0.6063636363636363,"w":0.08100558659217877,"h":0.04181818181818182,"threshold":235}},
    {"page":32,"tap":[0.7356643356643356,0.056414922656960874],"expected":{"x":0.6759776536312849,"y":0.03363636363636364,"w":0.11731843575418995,"h":0.045454545454545456,"threshold":235}},
    {"page":32,"tap":[0.3412587412587413,0.8398544131028207],"expected":{"x":0.2807262569832402,"y":0.8,"w":0.11731843575418995,"h":0.07090909090909091,"threshold":235}},
    {"page":34,"tap":[0.8153846153846154,0.33121019108280253],"expected":{"x":0.7639664804469274,"y":0.3,"w":0.10195530726256984,"h":0.05545454545454546,"threshold":235}},
    {"page":34,"tap":[0.7776223776223776,0.8080072793448589],"expected":{"x":0.7318435754189944,"y":0.7772727272727272,"w":0.09078212290502793,"h":0.05454545454545454,"threshold":235}},
    {"page":36,"tap":[0.5314685314685315,0.6660600545950864],"expected":{"x":0.4790502793296089,"y":0.6445454545454545,"w":0.1005586592178771,"h":0.04363636363636364,"threshold":235}},
    {"page":56,"tap":[0.7748251748251749,0.5359417652411284],"expected":{"x":0.729050279329609,"y":0.5045454545454545,"w":0.09217877094972067,"h":0.053636363636363635,"threshold":235}},
    {"page":56,"tap":[0.5916083916083916,0.8908098271155596],"expected":{"x":0.520949720670391,"y":0.850909090909091,"w":0.164804469273743,"h":0.06363636363636363,"threshold":235}},
    {"page":59,"tap":[0.23356643356643356,0.7579617834394905],"expected":{"x":0.19553072625698323,"y":0.73,"w":0.0782122905027933,"h":0.046363636363636364,"threshold":235}},
    {"page":59,"tap":[0.427972027972028,0.9372156505914467],"expected":{"x":0.3743016759776536,"y":0.8972727272727272,"w":0.10614525139664804,"h":0.06727272727272728,"threshold":235}},
    {"page":61,"tap":[0.8895104895104895,0.3575978161965423],"expected":{"x":0.8184357541899442,"y":0.3209090909090909,"w":0.14106145251396648,"h":0.08272727272727273,"threshold":235}},
    {"page":64,"tap":[0.7944055944055944,0.5586897179253867],"expected":{"x":0.702513966480447,"y":0.5172727272727272,"w":0.17458100558659218,"h":0.09636363636363636,"threshold":235}},
    {"page":70,"tap":[0.6251748251748251,0.6979071883530482],"expected":{"x":0.5642458100558659,"y":0.6718181818181819,"w":0.11871508379888268,"h":0.06818181818181818,"threshold":235}}
  ];
  for(const {page,tap,expected}of regressions){
    const file=path.join(root,`Wolverine (2010-2012) 1000-${String(page-1).padStart(3,'0')}.jpg`);
    const meta=await sharp(file).metadata();
    const {data,info}=await sharp(file).resize({width:1100,height:1100,fit:'inside',withoutEnlargement:true}).ensureAlpha().raw().toBuffer({resolveWithObject:true});
    const f={data,w:info.width,h:info.height,img:{width:meta.width,height:meta.height}};
    assert.deepEqual(plain(await check(f,tap,true,`page${page} caption regression`)),expected,`page${page}: preserve the baseline caption selection`);
  }
  console.log(`${regressions.length} wider-corpus caption regressions preserved exactly, including short NO/HNH speech.`);

  // The reviewed changed crops are faces, clothing, teeth and open sky, not
  // speech. Keep the stronger proof from drifting back into those regions.
  const artNegatives=[
    // Broad plane artwork mixed with a sound effect is not an isolated caption.
    {page:12,tap:[.5160839160839161,.6596906278434941]},
    ...[[.7,.32],[.8,.32],[.7,.36],[.8,.36]].map(tap=>({page:11,tap})),
    {"page":12,"tap":[0.5174825174825175,0.7206551410373067]},
    {"page":12,"tap":[0.9482517482517483,0.924476797088262]},
    {"page":51,"tap":[0.2811188811188811,0.4212920837124659]},
    {"page":51,"tap":[0.8727272727272727,0.6005459508644222]},
    {"page":51,"tap":[0.8167832167832167,0.8544131028207461]},
    {"page":61,"tap":[0.3258741258741259,0.6251137397634213]},
    {"page":61,"tap":[0.6643356643356644,0.8980891719745223]},
    {"page":61,"tap":[0.6475524475524476,0.924476797088262]},
    {"page":64,"tap":[0.4251748251748252,0.17925386715195632]},
    {"page":64,"tap":[0.1916083916083916,0.7133757961783439]}
  ];
  for(const {page,tap}of artNegatives){
    const file=path.join(root,`Wolverine (2010-2012) 1000-${String(page-1).padStart(3,'0')}.jpg`);
    const {data,info}=await sharp(file).resize({width:1100,height:1100,fit:'inside',withoutEnlargement:true}).ensureAlpha().raw().toBuffer({resolveWithObject:true});
    await check({data,w:info.width,h:info.height,img:{width:info.width,height:info.height}},tap,false,`page${page} artwork is not speech`);
  }
  console.log(`${artNegatives.length} wider-corpus non-text artwork selections rejected.`);
  console.log('Artwork: page4 caption stable at 3 taps; all 5 page5 captions retained; bottom-right stable at 3 taps; propeller sky rejected at 3 taps.');
})().catch(error=>{console.error(error);process.exitCode=1;});
