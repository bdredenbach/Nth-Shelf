# Test70 — first stable interrupted-white-gutter recovery

## Starting point

Repository: `bdredenbach/Nth-Shelf`, branch `Test_Branch`. The branch was read at `864df8e05266c6d03422d0480fbe65c10f638871` (finalized Test69 documentation). Runtime sources came from the supplied Test69 build archive, commit `424580427c94e50973bf99baf2b682d8b47e290a`. The user confirmed Test69 worked. No GitHub writes occurred during this iteration.

## Change

`js/panels-interrupted-gutters.js` is an optional late wrapper around PanelDetect.detect. It reconnects short aligned white corridor gaps only with exposed endpoint runs and measured artwork/exterior-paper support. Seed separation uses a new opt-in repair mask in PanelRaggedGutters; the default path remains unchanged. Two gap limits must return identical contours. Candidates already detected by the default pass, competing envelopes, or any old-owner raster overlap are withheld. Accepted panels append without replacing or reordering old descriptors.

The new evidence lives inside validated proof 19/20 as `interrupted`; it is not proof 27. The existing structural-grid router delegates through PanelRaggedGutters.validPanel. PanelEdgeSpill abstains specifically for a valid repaired contour to avoid adding unrelated margin art. Both direct RGBA and image edge-spill entry points are guarded. New module load order is after panels.js, before reader/geometry use. Service worker and map identities are advanced.

## Actual result

**Rise of Apocalypse #3 — image index 6 (`006.jpg`), reader 7/23.** The wide pointing-guard/fire scene below the upper-right scene now pops as one complete visible contour, with both speech balloons. Test69 had one owner on that page; Test70 has two. The old upper-right owner remains byte-for-byte identical in the serialized descriptor.

All 91 final native-browser page maps were compared: 90 exact matches, only the target changed, all 148 previous owners preserved, 149 total afterward. Actual Reader touchscreen and canvas checks passed 12 taps, 144 positive alpha samples, 108 exclusion samples, and 7,877 dense interior samples. The two resizes (0.67× / 1.5×) and horizontal mirror passed the same 12 positive and nine exclusion positions. Independent visual review of the final crop and reader overlay found the intended scene and balloons preserved.

All 61 local Node contract commands in the prepared CI gate passed, including the retained prior fixtures, plus JS syntax and service-worker checks. Native Java archive tests passed. Do not claim a fresh 312-page Wolverine/manga/Magneto artwork run: those original files are not in this runtime. Do not claim general branding/backup browser CI passed; only the actual targeted offline reader harness and native archive tests ran here.

## Build and publishing status

Version `2.79.70`, code `27998`; shell `nth-shelf-shell-2.79.70`, map `panel-map-exp-68`, proof identity `frame-proof-2.79.70`. Intended Gradle/CI package: `io.github.bdredenbach.nthshelf.frametest70`.

GitHub connection currently exposes reads but no create/update/ref tools. No repository push and no GitHub CI run were performed. Source and workflow changes are prepared for publication when write access is available. Do not mistake earlier conversation write-tool names for currently invokable tools.

A separate local APK was made from the supplied, verified Test69 native shell, with all 76 web assets matching the final tested files. Only fixed-length package/label/version/user-agent fields change in native data; DEX checksums were recomputed. Its separate package ID is `io.github.bdredenbach.nthshelf.frameloc070`, label `Nth Shelf Test70`. This avoids replacing Test69 or colliding with a future CI Test70 install.

It is locally signed with APK Signature Scheme v2, verified using an AOSP-format parser and cryptography. The same verifier independently accepts the known Test69 CI APK; a tampered new APK is rejected. ZIP CRCs, native manifest identity, DEX checksums, stored-entry alignment, and exact packaged web assets passed. There was no fresh native compilation, SDK apksigner invocation, emulator, or physical installation test. Phone installation and behavior acceptance remain pending. No private signing key is distributed.

See TEST70-VALIDATION.json for exact APK hash, byte count, test records, and limitations. The first prototype's unrelated-neighbor cases were rejected, not shipped. The user-facing next test is the new pointing-guard/fire frame on 7/23, plus the previous upper-right frame for comparison. Broader interrupted gutters and speed remain future work.
