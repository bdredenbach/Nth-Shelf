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
        versionCode = 27923
        versionName = "2.79.19-test1"
    }

    buildTypes {
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
        // The native launch artwork is copied into drawable-nodpi below; do
        // not also package its 1.6 MB PNG inside the WebView asset bundle.
        exclude("assets/nth-shelf-splash.webp")
    }
    into(layout.buildDirectory.dir("generated/nthShelfAssets/public"))
    duplicatesStrategy = DuplicatesStrategy.EXCLUDE
}

val syncAndroidArtwork by tasks.registering(Sync::class) {
    from(rootProject.projectDir.parentFile.resolve("icons/icon-maskable-512.png")) {
        rename { "nth_shelf_launcher.png" }
    }
    from(rootProject.projectDir.parentFile.resolve("assets/nth-shelf-splash.webp")) {
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
