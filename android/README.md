# Android app (scaffold plan)

This repo is Android-first. The Android project should be created via Android Studio to ensure Gradle wrapper files are generated correctly.

## Create the project
- Android Studio → New Project → Empty Activity (Jetpack Compose)
- Name: `DesigningApplication`
- Package: `com.designing.application`
- Minimum SDK: 26 (Android 8) recommended for modern camera/ML paths

## Required libraries (recommended)
- UI: Jetpack Compose + Navigation
- Networking: Retrofit + OkHttp
- JSON: Kotlinx Serialization or Moshi
- DI (optional for MVP): Hilt
- Camera: CameraX
- AR: ARCore
- 3D rendering: Filament

## Backend integration
- Base URL (dev): `http://10.0.2.2:8080` (Android Emulator → localhost)
- Health: `/health`
- Swagger: `http://10.0.2.2:8080/docs`

## MVP screens
- Auth (dev can be tokenless; server returns `x-dev-token`)
- Projects list + create project
- Capture (CameraX) + upload flow (signed URL)
- Editor placeholder (2D first)
- 3D/AR placeholder (ARCore session check)

## Next step
Once you confirm the app name/package, I can generate the full Android Studio-ready project structure in-repo (requires Android Studio or Gradle on the machine running the scaffolding).
