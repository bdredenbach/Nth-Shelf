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
version is `2.79.20-test1` (`27924`). This is a test debug package, not a Play Store signed
release.
