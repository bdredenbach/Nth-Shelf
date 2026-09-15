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
        versionCode = 27905
        versionName = "2.79.05"
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
}

val syncWebAssets by tasks.registering(Sync::class) {
    from(rootProject.projectDir.parentFile) {
        include(
            "index.html",
            "manifest.json",
            "manifest.webmanifest",
            "sw.js",
            "assets/**",
            "css/**",
            "icons/**",
            "js/**"
        )
    }
    into(layout.buildDirectory.dir("generated/nthShelfAssets/public"))
    duplicatesStrategy = DuplicatesStrategy.EXCLUDE
}

tasks.named("preBuild").configure {
    dependsOn(syncWebAssets)
}

dependencies {
    implementation("androidx.webkit:webkit:1.12.1")
}
