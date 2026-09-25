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


## Test37 identity

The current candidate is version **2.79.37** (`versionCode 27965`). Debug builds use `io.github.bdredenbach.nthshelf.frametest37` with label **Nth Shelf Test37**, so Test36 and earlier installs can remain side-by-side. Test37 adds the tap-independent structural-grid completion route used for Reader page23; Test36 edge-spill behavior remains packaged.


## Test38 identity

The current candidate is version **2.79.38** (`versionCode 27966`). Debug builds use `io.github.bdredenbach.nthshelf.frametest38` with label **Nth Shelf Test38**, so earlier frame-test installs can remain side-by-side. Test38 extends the structural-grid family with a bounded occluded-bottom-tier completion route for Reader page27.


## Test39 identity

The current candidate is version **2.79.39** (`versionCode 27967`). Debug builds use `io.github.bdredenbach.nthshelf.frametest39` with label **Nth Shelf Test39**. Test39 adds nested structural leaf completion for Reader page28 while retaining Test36–38 frame behavior.


## Test40 identity

The current candidate is version **2.79.40** (`versionCode 27968`). Debug builds use `io.github.bdredenbach.nthshelf.frametest40` with label **Nth Shelf Test40**. Test40 adds the framed-inset triplet completion used by Reader page32 while retaining Test36–39 behavior.


## Test41 identity

The current candidate is version **2.79.41** (`versionCode 27969`). Debug builds use `io.github.bdredenbach.nthshelf.frametest41` with label **Nth Shelf Test41**. Test41 adds the five-column-bank structural completion used by Reader page33 while retaining Test36–40 behavior.


## Test42 identity

The current candidate is version **2.79.42** (`versionCode 27970`). Debug builds use `io.github.bdredenbach.nthshelf.frametest42` with label **Nth Shelf Test42**. Test42 adds the branched-stack / curved-shared-seam completion used by Reader page35 while retaining Test36–41 behavior.


## Test43 identity

The current candidate is version **2.79.43** (`versionCode 27971`). Debug builds use `io.github.bdredenbach.nthshelf.frametest43` with label **Nth Shelf Test43**. Test43 keeps Test36–42 frame behavior and changes Page-mode forward corner geometry plus the matching tutorial cues.


## Test44 identity

The current candidate is version **2.79.44** (`versionCode 27972`). Debug builds use `io.github.bdredenbach.nthshelf.frametest44` with label **Nth Shelf Test44**. Test44 moves the forward top/bottom right-corner hot zones inward and makes the tutorial consume the same live-zone metrics.
