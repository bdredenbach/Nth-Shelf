# Nth Shelf for Android

**Version 2.79.88 · Current approved panel upgrade**

The Android app includes the current reader with improved recovery of complete thin-bordered scenes against gradient gutters. The newly recovered tall scene on Rise of Apocalypse issue 2, reader page 17/23, includes its speech balloons and has been confirmed working by the user.

## Install the current build

Open the [Android build downloads](https://github.com/bdredenbach/Nth-Shelf/actions/workflows/android-apk.yml?query=branch%3AAndroid), select a successful run, and download its APK artifact.

The debug APK appears on your device as **Nth Shelf Test88** and installs separately from the stable Nth Shelf app. Import your own comic into that app to read and try its panel pop-outs.

| Build detail | Current value |
| --- | --- |
| Version | 2.79.88 |
| Android version code | 28016 |
| Debug app label | Nth Shelf Test88 |
| Debug application ID | `io.github.bdredenbach.nthshelf.frametest88` |
| Minimum Android version | Android 7.0 / API 24 |
| Build tools | Java 17, Gradle 8.9, Android SDK 35 |

## Build from source

The Android module copies the repository's current reader assets into its WebView shell on every build.

```bash
gradle --no-daemon -p android :app:assembleDebug
```

The APK is written to `android/app/build/outputs/apk/debug/app-debug.apk`.

GitHub Actions builds both the Android and test branches. It runs the retained frame checks, browser and backup checks, and native archive tests, then verifies the APK signature, identity and exact packaged reader files.

The downloadable APK uses a CI debug key. It is an installable test build; a store release needs production signing.

[Read about the current upgrade](../README.md)
