#!/usr/bin/env python3
"""Read-only compatibility audit; never upgrades old receipts to qualification."""
import argparse
import json
from pathlib import Path
from collections import Counter
import regression_gate as gate

parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('inputs',type=Path)
args=parser.parse_args()
results=[]
for path in sorted(args.inputs.glob('expected-*.json'))+sorted(args.inputs.glob('frozen-*-receipts.json')):
    receipt=gate.read_json(path);missing=Counter();passed=0
    for row in receipt['rows']:
        try:
            gate.check_row(row,row,row['id']);passed+=1
        except gate.Invalid as exc:
            missing[str(exc).split(': ',1)[-1]]+=1
    results.append({'file':path.name,'rows':len(receipt['rows']),'row_contract_self_checks_passed':passed,
                    'failures':dict(missing),'has_runner_hash':'runnerSha256' in receipt,
                    'has_input_hash':'inputSha256' in receipt})
print(json.dumps({'scope':'Read-only row-schema compatibility only. No execution, artifact, source, or candidate qualification.',
                  'native_regression_qualified':False,'files':results},indent=2))
