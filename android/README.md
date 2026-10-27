# Nth Shelf Android shell

This directory packages the checkout's web assets in an Android WebView shell. `Test_Branch` is the consolidated development source; the separate `Android` branch remains unchanged at its historical accepted Test88 checkpoint (`f55efa22e920f39839541ddf8d11e64910398255`). Test88 phone acceptance does not qualify later source.

## Build and qualification

The historical build toolchain uses Java 17, Gradle 8.9 and Android SDK 35, with minimum API 24. The module copies web assets during a build:

```sh
gradle --no-daemon -p android :app:assembleDebug
```

Output: `android/app/build/outputs/apk/debug/app-debug.apk`.

**Do not treat the existing manual workflow as a qualified build of the current source.** It is restricted to `Test_Branch` and retains Test168 identity and frozen asset checks. Newer Test179/candidate web files need a deliberately reconciled Android identity, web-asset manifest and full build validation before dispatch. The original Test179 APK was a Test178-shell repack, not a Gradle rebuild. No new APK was built during branch consolidation.

The workflow is manual-only; a push does not build or release an app. No signing keys or comic fixtures belong in Git. CI debug signing is not production signing.

## Historical Android acceptance

Test88 (`2.79.88`, code `28016`, package `io.github.bdredenbach.nthshelf.frametest88`) was confirmed working on phone on 5 October 2026. The narrow scope and original validation remain in [TEST88-VALIDATION.json](../TEST88-VALIDATION.json). It is not a new full-corpus success count.

See [current project status](../README.md), [canonical handoff](../HANDOFF.md), and [chronology](../RELEASE-HISTORY.md). The consolidated handoff retains the original Android documentation as explicitly historical text.
