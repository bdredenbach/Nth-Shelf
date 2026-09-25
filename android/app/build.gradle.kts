import org.gradle.api.file.DuplicatesStrategy
import org.gradle.api.tasks.Sync

plugins {
    id("com.android.application")
}

android {
    namespace = "io.github.bdredenbach.nthshelf"
    compileSdk = 35

    defaultConfig {
        applicationId = "io.github.bdredenbach.nthshelf"
        minSdk = 24
        targetSdk = 35
        versionCode = 27969
        versionName = "2.79.41"
        manifestPlaceholders["appLabel"] = "Nth Shelf"
    }

    buildTypes {
        // Isolated test install: leave stable Nth Shelf and Frame Test32/Test33/Test34 data alone.
        getByName("debug") {
            applicationIdSuffix = ".frametest41"
            manifestPlaceholders["appLabel"] = "Nth Shelf Test41"
        }
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    sourceSets.getByName("main").assets.srcDir(
        layout.buildDirectory.dir("generated/nthShelfAssets")
    )
    sourceSets.getByName("main").res.srcDir(
        layout.buildDirectory.dir("generated/nthShelfResources")
    )
}

val syncWebAssets by tasks.registering(Sync::class) {
    from(rootProject.projectDir.parentFile) {
        include(
            "index.html",
            "manifest.json",
            "manifest.webmanifest",
            "sw.js",
            "THIRD_PARTY_NOTICES.txt",
            "assets/**",
            "css/**",
            "icons/**",
            "js/**"
        )
        // Retire the old poster from the WebView bundle. The new shared hero
        // is packaged for both native launch and the empty-shelf composition.
        exclude("assets/nth-shelf-splash.webp")
    }
    into(layout.buildDirectory.dir("generated/nthShelfAssets/public"))
    duplicatesStrategy = DuplicatesStrategy.EXCLUDE
}

val syncAndroidArtwork by tasks.registering(Sync::class) {
    from(rootProject.projectDir.parentFile.resolve("icons/icon-maskable-1024.png")) {
        rename { "nth_shelf_launcher.png" }
    }
    from(rootProject.projectDir.parentFile.resolve("assets/nth-shelf-hero-hd.webp")) {
        rename { "nth_shelf_splash.webp" }
    }
    into(layout.buildDirectory.dir("generated/nthShelfResources/drawable-nodpi"))
}

tasks.named("preBuild").configure {
    dependsOn(syncWebAssets)
    dependsOn(syncAndroidArtwork)
}

dependencies {
    implementation("androidx.webkit:webkit:1.12.1")
}
