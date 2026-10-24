#!/usr/bin/env python3
"""Fail-closed, offline native regression receipt qualification. No cached decisions."""
import argparse
import hashlib
import json
from pathlib import Path
import sys
import struct
import math

VERSION = 'native-regression-gate-v1'
OPEN_FIELDS = ('rawCropSha256', 'cropSha256', 'canvas', 'selectedBox',
               'displayBox', 'overlayStyle', 'afterAnimationStyle',
               'identitySource', 'geometryOwner', 'selectedProofVersion')
COMMON_FIELDS = ('id', 'center', 'popped', 'error')

class Invalid(ValueError):
    pass

def require(condition, message):
    if not condition:
        raise Invalid(message)

def digest(data):
    return hashlib.sha256(data).hexdigest()

def finite_json(value):
    if isinstance(value, float):
        require(math.isfinite(value), 'Non-finite JSON number')
    elif isinstance(value, dict):
        for item in value.values():
            finite_json(item)
    elif isinstance(value, list):
        for item in value:
            finite_json(item)
    return value

def loads(data):
    def reject_constant(value):
        raise Invalid('Non-finite JSON constant: ' + value)
    return finite_json(json.loads(data, parse_constant=reject_constant))

def read_json(path):
    return loads(path.read_text())

def contained(root, name):
    require(isinstance(name, str) and name and not Path(name).is_absolute(), 'Path must be relative')
    path = (root / name).resolve()
    require(path.is_relative_to(root.resolve()), 'Path escapes evidence root: ' + name)
    return path

def sha_string(value):
    return isinstance(value, str) and len(value) == 64 and all(c in '0123456789abcdef' for c in value)

def checked(root, record, label):
    require(isinstance(record, dict) and set(record) == {'path', 'sha256'}, label + ': invalid file record')
    require(sha_string(record['sha256']), label + ': invalid hash')
    path = contained(root, record['path'])
    data = path.read_bytes()
    require(digest(data) == record['sha256'], label + ': file hash mismatch')
    return path, data

def indexed(receipt, label):
    require(receipt.get('complete') is True, label + ': incomplete receipt')
    rows = receipt.get('rows')
    require(isinstance(rows, list) and rows, label + ': no rows')
    result = {}
    for row in rows:
        require(isinstance(row, dict) and isinstance(row.get('id'), str), label + ': invalid row')
        require(row['id'] not in result, label + ': duplicate ID ' + row['id'])
        result[row['id']] = row
    return result

def check_row(actual, expected, label):
    finite_json(actual)
    finite_json(expected)
    for field in COMMON_FIELDS:
        require(field in actual and field in expected, label + ': missing ' + field)
        require(actual[field] == expected[field], label + ': changed ' + field)
    require(actual['error'] is None, label + ': Reader error')
    require(type(actual['popped']) is bool, label + ': popped must be Boolean')
    if actual['popped']:
        for field in OPEN_FIELDS:
            require(field in actual and field in expected, label + ': missing ' + field)
            require(actual[field] == expected[field], label + ': changed ' + field)
        for field in ('rawCropSha256', 'cropSha256'):
            require(sha_string(actual[field]), label + ': invalid ' + field)
        require(isinstance(actual['canvas'], list) and len(actual['canvas']) == 2 and
                all(type(v) is int and v > 0 for v in actual['canvas']), label + ': invalid canvas')
    else:
        require(not any(actual.get(k) is not None for k in ('cropSha256','rawCropSha256','canvas')), label + ': missing popup contains output')

def qualify(manifest, root):
    finite_json(manifest)
    require(manifest.get('schema') == VERSION, 'Unsupported manifest schema')
    require(manifest.get('scope') == 'native-regression-only', 'Scope must explicitly exclude release acceptance')
    require(manifest.get('candidate'), 'Missing candidate asset manifest')
    fingerprints = {'gate': digest(Path(__file__).read_bytes()), 'manifest': digest(json.dumps(manifest, sort_keys=True).encode())}
    candidate = {}
    for name, record in manifest['candidate'].items():
        checked(root, record, 'candidate ' + name)
        candidate[name] = record['sha256']
    _, runner = checked(root, manifest['runner'], 'runner')
    runner_hash = digest(runner)
    for index, record in enumerate(manifest.get('support', [])):
        checked(root, record, 'support ' + str(index))
    pages = manifest.get('pages')
    require(isinstance(pages, list) and pages, 'Empty page manifest')
    require(len({p['key'] for p in pages}) == len(pages), 'Duplicate page key')
    all_ids = set(); results = []; changes_used = set()
    changes = manifest.get('intentional_changes', {})
    require(isinstance(changes, dict), 'Invalid intentional changes')
    for page in pages:
        key = page['key']
        _, source = checked(root, page['source'], key + ' source')
        _, input_bytes = checked(root, page['input'], key + ' input')
        spec = loads(input_bytes)
        require(not any(k in spec for k in ('grid', 'includeDetectorCenters')), key + ': generated targets unsupported')
        _, reference_bytes = checked(root, page['reference'], key + ' reference')
        reference = loads(reference_bytes)
        actual_path = contained(root, page['actual'])
        actual_bytes = actual_path.read_bytes(); actual = loads(actual_bytes)
        fingerprints[key] = digest(actual_bytes)
        old = indexed(reference, key + ' reference'); new = indexed(actual, key + ' actual')
        for label, receipt in [('actual', actual), ('reference', reference)]:
            dimensions = receipt.get('sourceDimensions')
            require(isinstance(dimensions, list) and len(dimensions) == 2 and
                    all(type(n) is int and n > 0 for n in dimensions), key + ': ' + label + ' invalid sourceDimensions')
        require(actual['sourceDimensions'] == reference['sourceDimensions'], key + ': sourceDimensions mismatch')
        reader_page = spec['page'].get('readerPage')
        require(type(reader_page) is int and reader_page > 0, key + ': invalid input readerPage')
        require(type(actual.get('readerPage')) is int and type(reference.get('readerPage')) is int and
                actual['readerPage'] == reference['readerPage'] == reader_page, key + ': readerPage mismatch')
        targets = spec.get('taps', [])
        ids = [t['id'] for t in targets]
        require(len(set(ids)) == len(ids) and ids, key + ': duplicate/empty input IDs')
        require(list(old) == ids and list(new) == ids, key + ': tap order/set mismatch')
        require(not all_ids.intersection(ids), key + ': duplicate suite tap ID'); all_ids.update(ids)
        require(spec['page']['sha256'] == digest(source), key + ': input/source mismatch')
        for label, receipt in [('actual', actual), ('reference', reference)]:
            require(receipt.get('sourceSha256') == digest(source), key + ': ' + label + ' source mismatch')
        require(actual.get('inputSha256') == digest(input_bytes), key + ': input fingerprint mismatch')
        require(actual.get('runnerSha256') == runner_hash, key + ': runner fingerprint mismatch')
        require(actual.get('codeHashes') == candidate, key + ': candidate fingerprint mismatch')
        for target in targets:
            ident = target['id']; expected = dict(old[ident]); row = new[ident]
            require(target['center'] == row.get('center'), ident + ': actual tap center differs from input')
            if ident in changes:
                change = changes[ident]
                require(isinstance(change.get('reason'), str) and change['reason'].strip(), ident + ': change needs reason')
                fields = change.get('fields')
                require(isinstance(fields, list) and fields and len(set(fields)) == len(fields), ident + ': invalid change fields')
                require(set(fields) <= set(OPEN_FIELDS) | {'popped'}, ident + ': forbidden change field')
                _, evidence = checked(root, change['reference'], ident + ' change reference')
                approved = loads(evidence)
                desired = indexed(approved, ident + ' change reference')[ident]
                require(approved.get('sourceSha256') == digest(source), ident + ': change source mismatch')
                require(type(approved.get('readerPage')) is int and approved['readerPage'] == reader_page,
                        ident + ': change readerPage mismatch')
                dimensions = approved.get('sourceDimensions')
                require(isinstance(dimensions, list) and len(dimensions) == 2 and
                        all(type(n) is int and n > 0 for n in dimensions) and
                        dimensions == actual['sourceDimensions'], ident + ': change sourceDimensions mismatch')
                require(desired.get('center') == target['center'], ident + ': change tap center mismatch')
                check_row(desired, desired, ident + ' change reference')
                for field in fields:
                    require(field in desired, ident + ': missing approved field ' + field)
                    expected[field] = desired[field]
                changes_used.add(ident)
            check_row(row, expected, ident)
            if row['popped']:
                for field, name in [('cropSha256', row.get('cropFile')), ('rawCropSha256', 'crops/' + ident + '-raw.png')]:
                    artifact = contained(actual_path.parent, name)
                    data = artifact.read_bytes()
                    require(digest(data) == row[field], ident + ': output artifact mismatch ' + field)
                    require(len(data) >= 24 and data[:8] == b'\x89PNG\r\n\x1a\n' and data[12:16] == b'IHDR', ident + ': invalid PNG header')
                    require(list(struct.unpack('>II', data[16:24])) == row['canvas'], ident + ': artifact dimensions differ from receipt')
            results.append({'id': ident, 'opened': row['popped'], 'intentional_change': ident in changes})
    require(changes_used == set(changes), 'Unused intentional-change entries')
    require(len(results) == manifest.get('expected_taps'), 'Suite tap total mismatch')
    fingerprint = digest(json.dumps(fingerprints, sort_keys=True).encode())
    return {'schema': VERSION, 'execution_complete': True, 'native_regression_qualified': True,
            'release_accepted': False, 'cache_reused': False, 'evidence_fingerprint': fingerprint,
            'taps': len(results), 'opened': sum(r['opened'] for r in results),
            'inherited_misses': sum(not r['opened'] for r in results), 'rows': results}

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('manifest', type=Path)
    parser.add_argument('--output', type=Path)
    args = parser.parse_args()
    try:
        result = qualify(read_json(args.manifest), args.manifest.resolve().parent)
        status = 0
    except (Invalid, OSError, ValueError, KeyError, TypeError) as error:
        result = {'schema': VERSION, 'execution_complete': False, 'native_regression_qualified': False,
                  'release_accepted': False, 'error': str(error)}
        status = 2
    text = json.dumps(result, indent=2) + '\n'
    if args.output:
        args.output.write_text(text)
    print(text, end='')
    return status

if __name__ == '__main__':
    sys.exit(main())
