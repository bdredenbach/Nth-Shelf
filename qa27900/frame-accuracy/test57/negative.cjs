// Private artwork stays local. Remove the exterior-paper network so an
// otherwise identical textured page must not retain the completed map.
const fs=require('fs'),assert=require('assert/strict');
global.PanelMatteCells=require('../../../js/panels-matte-cells.js');const D=require('../../../js/panels-pale-completion.js');
const results=[];for(let page=68;page<=73;page++){const source=fs.readFileSync('recovery-pages66-74/page'+page+'.rgba');assert(D.analyzeRGBA(source,585,900,[]).length);for(const kind of ['paper-removed','transparent']){const raw=new Uint8ClampedArray(source);for(let i=0;i<raw.length;i+=4){if(kind==='transparent')raw[i+3]=0;else if(.299*raw[i]+.587*raw[i+1]+.114*raw[i+2]>245)raw[i]=raw[i+1]=raw[i+2]=180;}const result=D.analyzeRGBA(raw,585,900,[]);assert.equal(result.length,0,page+' '+kind);results.push({page,kind,rejected:true});}}
fs.writeFileSync('recovery-pages66-74/negative.json',JSON.stringify(results,null,2));console.log('PASS twelve removed-paper/transparent negatives');
