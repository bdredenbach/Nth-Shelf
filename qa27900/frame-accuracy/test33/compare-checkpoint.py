#!/usr/bin/env python3
"""Compare the preserved fresh Test32 capture with this page42-only candidate."""
import argparse,gzip,hashlib,json
from pathlib import Path
p=argparse.ArgumentParser(description=__doc__);here=Path(__file__).resolve().parent
p.add_argument('--old',type=Path,default=here.parent/'test32/fresh74-descriptors.json.gz');p.add_argument('--new',type=Path,default=here/'fresh74-descriptors.json.gz');p.add_argument('--out',type=Path,default=here/'comparison.json');a=p.parse_args()
def read(path):
 raw=path.read_bytes();return json.loads(gzip.decompress(raw) if path.suffix=='.gz' else raw)
old,new=read(a.old),read(a.new)
assert len(old['pages'])==len(new['pages'])==74
changes=[];preserved=0
for op,np in zip(old['pages'],new['pages']):
 assert op['readerPage']==np['readerPage'];assert op['imageSha256']==np['imageSha256']
 if op['entries']!=np['entries']:changes.append({'readerPage':np['readerPage'],'before':op['count'],'after':np['count']})
 else:preserved+=op['count'];assert op['descriptorSha256']==np['descriptorSha256']
assert changes==[{'readerPage':42,'before':0,'after':7}],changes
assert preserved==old['totalEntries']==298 and new['totalEntries']==305
assert new['pageErrors']==[]
root=here.parents[2]
assert all(hashlib.sha256((root/path).read_bytes()).hexdigest()==digest for path,digest in new['scripts'].items()),'Capture source hashes do not match current detector scripts'
r={'pages':74,'before':298,'after':305,'preservedDescriptorsExactAndOrdered':preserved,'changedPages':changes,'page41Unchanged':True,'pages43And44StillEmpty':all(new['pages'][i-1]['count']==0 for i in [43,44]),'pageErrors':new['pageErrors'],'currentDetectorScriptHashesMatch':True,'historical301CountReproduced':False}
a.out.write_text(json.dumps(r,indent=2)+'\n');print(json.dumps(r))
