/* Optional private detection handoff plus caller-preserving geometry and sibling routing. */
if(typeof PanelDetect!=='undefined')TerminalSourceAdmission.installDetector(PanelDetect);
TerminalSourceAdmission.installGeometry();
if(typeof Reader!=='undefined')PanelTerminalNativeReader.installReader(Reader);
