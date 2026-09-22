# Nth Shelf Android test shell

This module packages the repository's current web assets into a small Android
WebView shell. The files are copied from the repository root during every
build, so the APK and PWA cannot silently drift apart.

The `Test_Branch` workflow builds an installable debug APK with Java 17 and
Gradle 8.9:

```bash
gradle -p android :app:assembleDebug
```

The application ID is `io.github.bdredenbach.nthshelf` and the current Android
version is `2.79.33` (`27961`). This is a test debug package, not a Play Store signed
release.

## Current candidate status

Native metadata and the build workflow are synchronized, but this handoff did not
execute Gradle, sign an APK, or test a phone. The supplied Frame Test32 APK was a
separate package, `io.github.bdredenbach.nthshelf.frametest32`, versionCode 27960.
The repository retains its existing application ID; it will not automatically
inherit the separate Test32 app’s library. Keep that app and its data intact.
VersionCode 27961 is above the supplied Test32 code; do not substitute 27933.
