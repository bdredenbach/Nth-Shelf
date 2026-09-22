#!/usr/bin/env python3
"""Import the supplied, exact Page42 source ZIP; preserve prior QA and newer work."""
import hashlib
import json
import pathlib
import stat
import subprocess
import zipfile

ROOT = pathlib.Path.cwd()
ARCHIVE = ROOT / 'Nth-Shelf-2.79.33-Page42-Project.zip'
EXPECTED = '559de863c2c50c95ab34aeca17936faf490caf1409b35bdbbd08c8f65a9613e7'
ANCHOR = 'a38c7b1b611a0312b3ae0ae24f1899cff7d003f9'
MARKER = ROOT / 'qa27900/frame-accuracy/test33/zip-delivery/IMPORT.json'


def fail(message):
    raise SystemExit(message)


def digest(data):
    return hashlib.sha256(data).hexdigest()


if not ARCHIVE.is_file():
    fail('Upload Nth-Shelf-2.79.33-Page42-Project.zip to the root of Test_Branch first.')
if digest(ARCHIVE.read_bytes()) != EXPECTED:
    fail('Wrong ZIP checksum; no source files were changed.')
if MARKER.exists():
    if json.loads(MARKER.read_text()).get('archiveSha256') != EXPECTED:
        fail('A different source import already exists; refusing to overwrite it.')
    print('Source already imported; preserving it and building the current checkout.')
    raise SystemExit(0)

incoming = {}
with zipfile.ZipFile(ARCHIVE) as z:
    if z.testzip() is not None:
        fail('Corrupt ZIP.')
    for member in z.infolist():
        p = pathlib.PurePosixPath(member.filename)
        if p.is_absolute() or '..' in p.parts or not p.parts or p.parts[0] != 'Nth-Shelf-2.79.33':
            fail('Unsafe or unexpected ZIP path: ' + member.filename)
        if stat.S_ISLNK(member.external_attr >> 16):
            fail('Symlink in source ZIP.')
        if member.is_dir():
            continue
        relative = pathlib.PurePosixPath(*p.parts[1:])
        if not relative.parts or relative.parts[0] == '.git':
            fail('Unexpected source member.')
        if relative.parts[0] == '.github':
            continue  # Keep the live workflows; never restore obsolete upload routes.
        name = str(relative)
        if name in incoming:
            fail('Duplicate source path: ' + name)
        incoming[name] = z.read(member)

required = ['README.md', 'sw.js', 'js/reader.js', 'js/panels-curved-rims.js',
            'android/app/build.gradle.kts', 'qa27900/frame-accuracy/test33/curved-rim-contract.cjs']
if any(p not in incoming for p in required):
    fail('Required source is missing.')
subprocess.run(['git', 'merge-base', '--is-ancestor', ANCHOR, 'HEAD'], check=True)
changed = subprocess.check_output(['git', 'diff', '--name-only', ANCHOR, 'HEAD', '--', *incoming], text=True).splitlines()
if changed:
    fail('Newer source changes need review before import: ' + ', '.join(changed))
prior_qa = {str(p.relative_to(ROOT)): digest(p.read_bytes()) for p in (ROOT / 'qa27900').rglob('*') if p.is_file()}
for name, data in incoming.items():
    target = ROOT / name
    if name in prior_qa and digest(data) != prior_qa[name]:
        fail('Existing QA record differs; preserving it and refusing import: ' + name)
    if target.is_symlink() or any(p.is_symlink() for p in target.parents if p != ROOT):
        fail('Symlink destination: ' + name)

# This candidate is a separate installation, not an update of the user's library.
gradle_name = 'android/app/build.gradle.kts'
s = incoming[gradle_name].decode()
old = 'applicationId = "io.github.bdredenbach.nthshelf"'
if s.count(old) != 1 or 'versionCode = 27961' not in s or 'versionName = "2.79.33"' not in s:
    fail('Unexpected Android metadata.')
incoming[gradle_name] = s.replace(old, 'applicationId = "io.github.bdredenbach.nthshelf.frametest33"').encode()
manifest_name = 'android/app/src/main/AndroidManifest.xml'
s = incoming[manifest_name].decode()
if s.count('android:label="Nth Shelf"') != 1:
    fail('Unexpected Android application label.')
incoming[manifest_name] = s.replace('android:label="Nth Shelf"', 'android:label="Nth Shelf Test33"').encode()
readme = incoming['README.md'].decode()
a = readme.index('## Repository and source status')
b = readme.index('## Reader and library', a)
status = ('## Repository and source status\n\n'
          'The complete Page42 project ZIP was imported by the checksum-gated\n'
          '`Page42 ZIP to Test APK` workflow. The import record lists the archive\n'
          'checksum and exact file hashes. All pre-existing QA records are protected.\n'
          'The accompanying workflow commits this source and then builds the APK;\n'
          'a completed source import is not, by itself, a successful APK build.\n'
          'Consult the workflow result and BUILD.json for build completion.\n'
          'Phone acceptance remains pending. Do not rerun the obsolete partial-chunk\n'
          'or Test32 import over this source. main and android are not updated.\n\n')
readme = readme[:a] + status + readme[b:]
a = readme.index('Gradle and the existing Android workflow')
b = readme.index('## Run the local checks', a)
readme = readme[:a] + ('The dedicated ZIP delivery workflow builds versionName **2.79.33**,\n'
    'versionCode **27961**, as **Nth Shelf Test33**, application ID\n'
    '`io.github.bdredenbach.nthshelf.frametest33`. It is a separate debug\n'
    'installation with a separate library; keep Test32 and its data intact.\n'
    'Native Java and detector source are unchanged by the importer. The older\n'
    'general Android workflow is historical; use the ZIP delivery workflow for\n'
    'this candidate. An APK is available only after build and signature checks pass.\n\n') + readme[b:]
incoming['docs/README-page42-before-zip-delivery.md'] = incoming['README.md']
incoming['README.md'] = readme.encode()
if (ROOT / 'README.md').is_file():
    incoming['docs/README-before-page42-zip-import.md'] = (ROOT / 'README.md').read_bytes()
for name, data in incoming.items():
    destination = ROOT / name
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_bytes(data)
for name, expected in prior_qa.items():
    if digest((ROOT / name).read_bytes()) != expected:
        fail('QA preservation check failed: ' + name)
MARKER.parent.mkdir(parents=True, exist_ok=True)
MARKER.write_text(json.dumps({
    'archiveSha256': EXPECTED, 'version': '2.79.33', 'versionCode': 27961,
    'applicationId': 'io.github.bdredenbach.nthshelf.frametest33',
    'priorQaPreserved': len(prior_qa), 'phoneAcceptance': 'pending',
    'importedFiles': {name: digest(data) for name, data in incoming.items()}
}, indent=2) + '\n')
subprocess.run(['git', 'add', '--', *incoming, str(MARKER.relative_to(ROOT))], check=True)
print(json.dumps({'importedFiles': len(incoming), 'priorQaPreserved': len(prior_qa)}))
