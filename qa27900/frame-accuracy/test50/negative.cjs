const fs=require('fs'),assert=require('assert/strict'),{chromium}=require('playwright');
const origin=process.env.QA_ORIGIN||'http://127.0.0.1:8765',root=process.env.QA_APP_PATH||'nth-shelf-current',comic=process.env.QA_COMIC_PATH||'comic-wolverine-1000',out=process.env.QA_OUTPUT||'/tmp/nth-shelf-test50';fs.mkdirSync(out,{recursive:true});
(async()=>{const b=await chromium.launch({executablePath:process.env.CHROME_BIN,headless:true,args:['--no-sandbox']});try{const p=await b.newPage();await p.goto(origin+'/'+root+'/');const result=await p.evaluate(async comic=>{
const img=new Image();img.src='/'+comic+'/'+encodeURIComponent('Wolverine (2010-2012) 1000-043.jpg');await img.decode();const original=PanelMatteCells.analyzeImage(img),tests=[];
for(const name of ['missing-red-profile-divider','transparent-image','flat-matte']){const c=document.createElement('canvas');c.width=585;c.height=900;const g=c.getContext('2d');g.drawImage(img,0,0,585,900);
if(name==='missing-red-profile-divider'){g.fillStyle='#643c14';g.beginPath();[[303,244],[338,252],[238,520],[198,540]].forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fill();}
if(name==='transparent-image')g.clearRect(0,0,1,1);if(name==='flat-matte'){g.fillStyle='#050608';g.fillRect(0,0,585,900);}
const ps=PanelMatteCells.completeRimNetworkImage(c,original);const native=PanelMatteCells.completeNativeRimNetworkImage(c,original);tests.push({name,count:ps.length,nativeCount:native.length});}
return{tests};},comic);assert(result.tests.every(t=>t.count===0&&t.nativeCount===0));fs.writeFileSync(out+'/negative-report.json',JSON.stringify(result,null,2));console.log(result);}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
