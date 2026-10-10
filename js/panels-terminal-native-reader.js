/* Unaccepted sibling-preserving Reader revision; native geometry unchanged. */
/* Isolated Reader proposal. Uses accepted shared source and async owner scopes.
 * Visible native contours and hit ownership are the same privately issued data. */
const PanelTerminalNativeReader=(()=>{
'use strict';
function installReader(r){if(!r||r._terminalNativeReader)return;const G=PanelGradientInsetReader,{scopeGuard}=G,M=PanelOccludedTerminalCells,A=TerminalSourceAdmission,key='_terminalNativeAdmission',old={contours:r.panelContours,display:r.displayPanelContours,find:r.findPanelAt,zoom:r.zoomToPanel,polygon:r.panelPolygon};
 function state(reader){const pinned=scopeGuard.state(reader,key);if(pinned)return pinned;const s=A.state(reader);if(s)reader[key]=s;return s;}
 function retired(s,p){return s.verified&&A.isIssued(s)&&p?._structuralGridProof?.version===67&&p._structuralGridProof.mode==='empty-enclosure';}
 function retained(s){return s.previous.filter(p=>!retired(s,p));}
 function owner(p){return A.viewOwner(p)?.owner||p;}
 function native(reader,p){const s=state(reader),v=A.viewOwner(p),original=owner(p),k=s?.children.indexOf(original);if(v&&v.state!==s)return null;return s?.verified&&A.isIssued(s)&&k>=0?s.native.owners[k].contours:null;}
 r.panelContours=function(p){return M.claims(p)||A.viewOwner(p)?native(this,p):old.contours.call(this,p);};
 if(typeof old.polygon==='function')r.panelPolygon=function(p){return M.claims(p)||A.viewOwner(p)?null:old.polygon.call(this,p);};
 r.displayPanelContours=function(p,c){if(M.claims(p)||A.viewOwner(p)){scopeGuard.noteDisplay(this,key,owner(p));return native(this,p);}const s=state(this);if(s?.previous.includes(p)){if(s.blocked||retired(s,p))return null;return scopeGuard.under(this,retained(s),()=>old.display.call(this,p,c===undefined?old.contours.call(this,p):c));}return old.display.call(this,p,c===undefined?old.contours.call(this,p):c);};
 r.findPanelAt=function(x,y){const s=state(this);if(!s)return old.find.call(this,x,y);if(s.blocked||!this.panelZoomEnabled||!Number.isFinite(x)||!Number.isFinite(y)||x<0||y<0||x>=1||y>=1)return null;if(s.verified&&A.isIssued(s))for(let k=0;k<s.children.length;k++)if(this.pointInContours(s.native.owners[k].contours,x,y))return s.children[k];const prior=retained(s);if(!prior.length)return null;const hit=scopeGuard.under(this,prior,()=>old.find.call(this,x,y));return prior.includes(hit)?hit:null;};
 r.zoomToPanel=async function(p,...args){const s=state(this);if(M.claims(p)||A.viewOwner(p)){const v=A.viewOwner(p),original=owner(p),k=s?.children.indexOf(original);if(v&&v.state!==s)return;if(!s?.verified||!A.isIssued(s)||s.blocked||k<0||scopeGuard.active(this,key))return;return scopeGuard.run(this,key,s,original,()=>scopeGuard.under(this,[],()=>old.zoom.call(this,s.views[k],...args)));}if(s){const prior=retained(s);if(s.blocked||!prior.includes(p)||scopeGuard.active(this,key))return;return scopeGuard.run(this,key,s,p,()=>scopeGuard.under(this,prior,()=>old.zoom.call(this,p,...args)));}return old.zoom.call(this,p,...args);};
 r._terminalNativeReader=true;
}
function completeSourceContour(reader,p){const v=TerminalSourceAdmission.viewOwner(p);if(!v||!TerminalSourceAdmission.isIssued(v.state))return false;const s=PanelGradientInsetReader.scopeGuard.state(reader,'_terminalNativeAdmission');return s===v.state&&s.verified&&!s.blocked;}
return{installReader,completeSourceContour};})();
if(typeof module!=='undefined')module.exports=PanelTerminalNativeReader;
