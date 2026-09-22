# Nth Shelf Android test shell

This module packages the repository's current web assets into a small Android
WebView shell. The files are copied from the repository root during every build,
so the APK and PWA cannot silently drift apart.

The `Test_Branch` workflow builds an installable debug APK with Java 17 and
Gradle 8.9:

```bash
gradle -p android :app:assembleDebug
```

## Test34 identity

The current broad-spectrum frame candidate is version **2.79.34**
(`versionCode 27962`). Debug builds use the separate application ID
`io.github.bdredenbach.nthshelf.frametest34` and label **Nth Shelf Test34**.
That keeps the stable app, Frame Test32, and Test33 installed independently.

Test34 broadens the pale/irregular-rim evidence route that first proved page42.
It does not include comic pages or private signing material. The GitHub workflow
uses the standard debug signing key and verifies the APK package identity, version,
and exact packaged web files before publishing the artifact. Phone acceptance is
still a separate test step.
