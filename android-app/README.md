# Smart Daily Hisab — Android Studio Project (Kotlin + Jetpack Compose + Room)

## Overview
**Smart Daily Hisab** is an offline-first, single-user personal daily income & expense manager built with Kotlin, Jetpack Compose, Material 3, Room Database, MVVM architecture, and Android Keystore security.

- **Min SDK**: Android 8.0 (API 26)
- **Target SDK**: Android 15 (API 35)
- **Languages**: Gujarati (default), Hindi, English
- **Privacy**: 100% offline local Room database (`smart_daily_hisab.db`); no `INTERNET` permission, no cloud sync.

## How to Build the Android APK in Android Studio

1. **Open Project**:
   - Launch **Android Studio Ladybug (2024.2)** or newer.
   - Choose **File → Open** and select the `android-app/` directory.
   - Wait for Gradle Sync to download dependencies (`libs.versions.toml`).

2. **Build Debug APK (for direct testing)**:
   ```bash
   cd android-app
   ./gradlew assembleDebug
   ```
   Output APK path:
   `android-app/app/build/outputs/apk/debug/app-debug.apk`

3. **Build Signed Release APK**:
   - In Android Studio: **Build → Generate Signed Bundle / APK → APK**.
   - Create or select your `.jks` keystore, choose `release` build variant, and click **Create**.
   - Or via CLI after configuring `signingConfigs`:
     ```bash
     ./gradlew assembleRelease
     ```

4. **Install on Android Device**:
   - Enable **USB Debugging** on your Android phone (Settings → Developer Options), or transfer `app-debug.apk` / `app-release.apk` to your phone and tap to install.
   - Via ADB:
     ```bash
     adb install -r app/build/outputs/apk/debug/app-debug.apk
     ```
