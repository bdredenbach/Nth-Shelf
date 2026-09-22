# Nth Shelf Android test shell

This module packages the repository's current web assets into a small Android
WebView shell. The files are copied from the repository root during every build,
so the APK and PWA cannot silently drift apart.

The `Test_Branch` workflow builds an installable debug APK with Java 17 and
Gradle 8.9:

```bash
gradle -p android :app:assembleDebug
```

## Test35 identity

The current broad-spectrum frame candidate is version **2.79.35**
(`versionCode 27963`). Debug builds use the separate application ID
`io.github.bdredenbach.nthshelf.frametest35` and label **Nth Shelf Test35**.
That keeps the stable app and earlier frame-test APKs installed independently.

Test35 adds the reusable edge-connected matte/paper cell family used by page44
and the remaining-empty-page sweep. It does not include comic artwork or private
signing material. GitHub Actions verifies package identity, version, signature
and exact packaged web files before publishing the debug artifact.
