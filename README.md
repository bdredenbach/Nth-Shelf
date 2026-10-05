<p align="center">
  <img src="icons/icon-maskable-1024.png" alt="Nth Shelf app icon" width="120">
</p>

<h1 align="center">Nth Shelf</h1>
<p align="center"><strong>Your comics. Your library. One frame at a time.</strong></p>
<p align="center">Android · Version 2.79.88 · Latest approved upgrade</p>

---

## Bring the whole scene into focus

Nth Shelf is a local-first comic reader and personal comic library for Android and the web. Its panel pop-outs bring individual scenes closer while keeping the artwork and dialogue together.

The current upgrade improves recognition of thin-bordered panels surrounded by softly changing background colors. A gutter can fade from one shade to another, and the reader can still follow the frame around the complete scene.

## What’s new in 2.79.88

- **Complete scenes:** recover enclosed panels that were previously missed against gradient gutters.
- **Dialogue stays with the artwork:** the newly recovered tall scene includes all its speech balloons.
- **Earlier selections stay intact:** established frame boundaries and ownership remain unchanged in the verified comparison.
- **The same contour throughout:** the reader uses the validated outline when displaying the panel pop-out.

## A frame we can now read

In **Rise of Apocalypse, issue 2, reader page 17/23**, the complete upper-left tall scene now pops out with its speech balloons included. This upgrade has been confirmed working by the user on Android.

## Checked across the collection

| Check | Result |
| --- | --- |
| Full 91-page Apocalypse comparison | 181 → 182 detected frames; every earlier frame descriptor preserved |
| Retained and new regression suites | All 78 passed |
| New scene after mirroring, resizing and JPEG recompression | Recovered |
| Android build, signature and package checks | Passed |
| Packaged reader files | All 88 matched the verified source |

Panel coverage continues to grow. This upgrade adds a confirmed complete scene; detection across every layout remains a work in progress.

## Try the current Android build

Import your own comic and open it in the reader, then use a panel pop-out to bring a detected scene into focus.

The current installable debug build is **Nth Shelf Test88**, version **2.79.88**. It installs separately from the stable Nth Shelf app.

[Android build and installation details](android/README.md) · [Build downloads](https://github.com/bdredenbach/Nth-Shelf/actions/workflows/android-apk.yml?query=branch%3AAndroid)
