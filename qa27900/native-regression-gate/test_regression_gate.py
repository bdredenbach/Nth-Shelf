import copy
import json
from pathlib import Path
import struct
import subprocess
import sys
import tempfile
import unittest
import zlib
import regression_gate as g


def png(w=2, h=3):
    def chunk(kind, data):
        return struct.pack('>I',len(data))+kind+data+struct.pack('>I',zlib.crc32(kind+data))
    return b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('>IIBBBBB',w,h,8,6,0,0,0))+chunk(b'IDAT',zlib.compress((b'\0'+bytes(w*4))*h))+chunk(b'IEND',b'')

class GateTests(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory();self.addCleanup(self.tmp.cleanup);self.root=Path(self.tmp.name)
        def file(name,data):
            path=self.root/name;path.parent.mkdir(parents=True,exist_ok=True)
            path.write_bytes(data);return {'path':name,'sha256':g.digest(data)}
        self.file=file
        source=file('source.bin',b'private-source'); runner=file('runner.cjs',b'qualified runner');candidate=file('candidate.js',b'new candidate not baseline')
        self.spec={'page':{'sha256':source['sha256'],'readerPage':1},'taps':[{'id':'probe','center':{'x':.5,'y':.5}}]}
        inp=file('input.json',json.dumps(self.spec).encode());img=png()
        file('run/crops/probe.png',img);file('run/crops/probe-raw.png',img)
        row={'id':'probe','center':{'x':.5,'y':.5},'popped':True,'error':None,
             'cropSha256':g.digest(img),'rawCropSha256':g.digest(img),'cropFile':'crops/probe.png',
             'canvas':[2,3],'selectedBox':[0,0,1,1],'displayBox':[0,0,1,1],
             'overlayStyle':{'opacity':'1'},'afterAnimationStyle':{'opacity':'1'},
             'identitySource':'test','geometryOwner':None,'selectedProofVersion':None}
        self.receipt={'complete':True,'sourceDimensions':[2,3],'readerPage':1,'sourceSha256':source['sha256'],'inputSha256':inp['sha256'],
             'runnerSha256':runner['sha256'],'codeHashes':{'js/candidate.js':candidate['sha256']},'rows':[row]}
        old=copy.deepcopy(self.receipt);old['codeHashes']={'js/candidate.js':'historical baseline differs'}
        ref=file('baseline.json',json.dumps(old).encode())
        self.manifest={'schema':g.VERSION,'scope':'native-regression-only','candidate':{'js/candidate.js':candidate},
             'runner':runner,'pages':[{'key':'page','source':source,'input':inp,'reference':ref,'actual':'run/receipts.json'}],
             'expected_taps':1,'intentional_changes':{}}
        self.write_receipt()
    def write_receipt(self): self.file('run/receipts.json',json.dumps(self.receipt).encode())
    def run_gate(self): return g.qualify(self.manifest,self.root)
    def reject(self):
        self.write_receipt()
        with self.assertRaises((g.Invalid,KeyError,FileNotFoundError)):self.run_gate()
    def test_clean_new_candidate_different_from_baseline(self):
        self.assertTrue(self.run_gate()['native_regression_qualified'])
        self.assertFalse(self.run_gate()['release_accepted'])
    def test_mutations(self):
        cases=[('complete',False),('codeHashes',{}),('runnerSha256','0'*64),('inputSha256','0'*64),('sourceSha256','0'*64)]
        original=copy.deepcopy(self.receipt)
        for field,value in cases:
            with self.subTest(field=field):
                self.receipt=copy.deepcopy(original);self.receipt[field]=value;self.reject()
    def test_row_mutations(self):
        original=copy.deepcopy(self.receipt)
        for field,value in [('rawCropSha256','0'*64),('cropSha256','0'*64),('selectedBox',[.1,0,1,1]),('displayBox',[0,.1,1,1]),('canvas',[3,3]),('afterAnimationStyle',{}),('overlayStyle',{}),('popped',False),('error','bad'),('center',{'x':0,'y':0}),('identitySource','wrong'),('geometryOwner','wrong'),('selectedProofVersion','wrong')]:
            with self.subTest(field=field):
                self.receipt=copy.deepcopy(original);self.receipt['rows'][0][field]=value;self.reject()
    def test_missing_required_fields(self):
        original=copy.deepcopy(self.receipt)
        for field in g.COMMON_FIELDS+g.OPEN_FIELDS:
            with self.subTest(field=field):
                self.receipt=copy.deepcopy(original);del self.receipt['rows'][0][field];self.reject()
    def test_no_cached_pass_reused(self):
        result=self.run_gate();self.file('run/comparison.json',json.dumps(result).encode())
        self.receipt['complete']=False;self.reject()
    def test_candidate_asset_modified(self): self.file('candidate.js',b'changed');self.reject()
    def test_runner_asset_modified(self): self.file('runner.cjs',b'changed');self.reject()
    def test_reference_modified(self): self.file('baseline.json',b'{}');self.reject()
    def test_source_modified(self): self.file('source.bin',b'changed');self.reject()
    def test_input_modified(self): self.file('input.json',b'{}');self.reject()
    def test_artifact_modified(self): self.file('run/crops/probe.png',png(3));self.reject()
    def test_raw_artifact_modified(self): self.file('run/crops/probe-raw.png',b'changed');self.reject()
    def test_png_dimensions_checked(self):
        data=png(4);self.file('run/crops/probe.png',data);self.receipt['rows'][0]['cropSha256']=g.digest(data)
        old=copy.deepcopy(self.receipt);self.manifest['pages'][0]['reference']=self.file('baseline.json',json.dumps(old).encode());self.reject()
    def test_duplicate_tap(self): self.receipt['rows']*=2;self.reject()
    def test_empty_rows(self): self.receipt['rows']=[];self.reject()
    def test_suite_total(self): self.manifest['expected_taps']=2;self.reject()
    def test_changed_field_allowed_explicitly_only(self):
        self.receipt['rows'][0]['selectedBox']=[.1,0,.9,1]
        record=self.file('approved.json',json.dumps(self.receipt).encode())
        self.manifest['intentional_changes']={'probe':{'reason':'Approved owner correction','fields':['selectedBox'],'reference':record}}
        self.write_receipt();self.assertTrue(self.run_gate()['native_regression_qualified'])
        self.receipt['rows'][0]['afterAnimationStyle']={};self.reject()
    def approved_change(self, mutate):
        self.receipt['rows'][0]['selectedBox']=[.1,0,.9,1]
        approved=copy.deepcopy(self.receipt);mutate(approved)
        record=self.file('approved.json',json.dumps(approved).encode())
        self.manifest['intentional_changes']={'probe':{'reason':'Approved owner correction','fields':['selectedBox'],'reference':record}}
        self.reject()
    def test_change_reference_wrong_click(self):
        self.approved_change(lambda d:d['rows'][0].update(center={'x':0,'y':0}))
    def test_change_reference_wrong_page(self):
        self.approved_change(lambda d:d.update(readerPage=99))
    def test_change_reference_boolean_page(self):
        self.approved_change(lambda d:d.update(readerPage=True))
    def test_change_reference_wrong_dimensions(self):
        self.approved_change(lambda d:d.update(sourceDimensions=[100,200]))
    def test_change_reference_boolean_dimensions(self):
        self.approved_change(lambda d:d.update(sourceDimensions=[True,3]))
    def test_change_reference_error(self):
        self.approved_change(lambda d:d['rows'][0].update(error='failed approved tap'))
    def test_change_reference_missing_required_field(self):
        self.approved_change(lambda d:d['rows'][0].pop('rawCropSha256'))
    def test_change_reference_missing_page(self):
        self.approved_change(lambda d:d.pop('readerPage'))
    def test_change_reference_missing_dimensions(self):
        self.approved_change(lambda d:d.pop('sourceDimensions'))
    def test_unused_change_fails(self):self.manifest['intentional_changes']={'absent':{}};self.reject()
    def test_unreasoned_change_fails(self):self.manifest['intentional_changes']={'probe':{'fields':['selectedBox']}};self.reject()
    def test_no_error_allowance(self):
        self.manifest['intentional_changes']={'probe':{'reason':'bad allowance','fields':['error']}};self.reject()
    def test_escape_rejected(self): self.manifest['pages'][0]['actual']='../escape';self.reject()
    def test_inherited_miss_is_not_successful_popup(self):
        row=self.receipt['rows'][0]
        for field in g.OPEN_FIELDS:row.pop(field)
        row['popped']=False
        self.manifest['pages'][0]['reference']=self.file('baseline.json',json.dumps(self.receipt).encode())
        self.write_receipt();result=self.run_gate();self.assertEqual(result['inherited_misses'],1);self.assertEqual(result['opened'],0)
    def test_nonfinite_json_rejected(self):
        for value in ['NaN','Infinity','-Infinity','1e999']:
            with self.subTest(value=value):
                with self.assertRaises(g.Invalid):g.loads('{"nested":[{"value":'+value+'}]}')
    def test_nonfinite_receipt_rejected(self):
        self.receipt['rows'][0]['selectedBox'][0]=float('inf');self.reject()
    def test_nonfinite_manifest_rejected(self):
        self.manifest['extra']=float('nan');self.reject()
    def test_source_dimensions_rejected(self):
        original=copy.deepcopy(self.receipt)
        for value in [None, [], [0,3], [True,3], [2.0,3], [2,-3], [4,3]]:
            with self.subTest(value=value):
                self.receipt=copy.deepcopy(original);self.receipt['sourceDimensions']=value;self.reject()
    def test_missing_reference_dimensions(self):
        reference=copy.deepcopy(self.receipt);del reference['sourceDimensions']
        self.manifest['pages'][0]['reference']=self.file('baseline.json',json.dumps(reference).encode());self.reject()
    def test_reader_page_rejected(self):
        for value in [None, True, 0, 2, 1.0]:
            with self.subTest(value=value):
                self.receipt['readerPage']=value;self.reject()
    def test_reference_reader_page_mismatch(self):
        reference=copy.deepcopy(self.receipt);reference['readerPage']=2
        self.manifest['pages'][0]['reference']=self.file('baseline.json',json.dumps(reference).encode());self.reject()
    def test_generated_targets_rejected(self):
        original=copy.deepcopy(self.spec)
        for key,value in [('grid',{}),('includeDetectorCenters',True),('includeDetectorCenters',False)]:
            with self.subTest(key=key,value=value):
                self.spec=copy.deepcopy(original);self.spec[key]=value
                record=self.file('input.json',json.dumps(self.spec).encode());self.manifest['pages'][0]['input']=record
                self.receipt['inputSha256']=record['sha256'];self.reject()
    def test_cli_failure_is_nonzero(self):
        self.receipt['complete']=False;self.write_receipt();self.file('manifest.json',json.dumps(self.manifest).encode())
        p=subprocess.run([sys.executable,str(Path(g.__file__)),str(self.root/'manifest.json')],capture_output=True,text=True)
        self.assertEqual(p.returncode,2);self.assertFalse(json.loads(p.stdout)['native_regression_qualified'])

if __name__=='__main__':unittest.main(verbosity=2)
