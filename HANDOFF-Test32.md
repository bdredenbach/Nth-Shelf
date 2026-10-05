# Nth Shelf — Test32 recovery checkpoint

## What this ZIP contains

This is a full project snapshot based on GitHub Test_Branch commit
015bacff2d4c8d051c7232c3e6b180deedcc67f8, with the accepted Test32 APK's
64 web assets imported locally. All 40 JavaScript files are byte-identical to
the supplied APK. The only changed packaged web asset is the requested sw.js.
The repository's Android/native source, existing tests, and historical README
are retained. No new native APK was built.

## What is actually on GitHub

The README upgrade, safer service worker for the older repository runtime,
checkpoint records, and guarded one-time importer have been committed to
Test_Branch. The complete Test32 runtime has NOT yet been transferred there.
The README in this ZIP describes the imported LOCAL source, not proof that the
remote branch has completed its import.

To finish the remote import, open Test_Branch in GitHub, choose Add file > Upload
files, and upload the exact Nth-Shelf-Frame-Test32.apk to the repository root.
Keep that filename. The installed workflow checks the APK's SHA-256, refuses
conflicting/newer source, imports only web assets, tests the result and commits
without rewriting Git history. Do not upload Wolverine 1000.zip.

## Protected baseline and next version

Page41 is accepted. Preserve its five tall middle panels and earlier accepted
frames. Page42 remains the next target; pages43–44 follow. Version 2.79.33 is
reserved until page42 works and passes acceptance. This is NOT that release.

Historical Test32 results remain recorded separately: 162 targeted checks,
400 selected Page Deck checks, 296 prior descriptors, 301 total entries.
Their original raw reports were not supplied in this handoff. The fresh local
Chromium capture completed 74 images with 298 page-level entries; page41 has
nine, including the five new columns. The historical 301 total was not
reproduced. Do not treat this as full historical parity or a new phone test.

## Evidence included

qa27900/frame-accuracy/test32/fresh74-descriptors.json.gz is the complete fresh
capture, without comic image bytes. fresh74-hash-summary.json contains per-page
image/descriptor hashes. apk-assets.json records the original packaged assets.
The compact Git summary, cache tests and portable capture script are included.

No comic pages, comic archives, recordings, user library or signing keys are
included. Keep these QA records outside the Android web asset bundle.
