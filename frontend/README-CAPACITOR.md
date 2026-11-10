# Emergent Studio — Capacitor Android App

This project converts the Next.js 14 web application into an installable native Android APK using **Capacitor 6** without writing any custom Kotlin or Java code.

## 📱 App Configuration
- **Application ID:** `com.paulichu.emergentstudio`
- **App Name:** `Emergent Studio`
- **Version:** `1.0.0` (versionCode: 1)
- **Production Web Server:** `https://frontend-84ui.vercel.app`
- **Fallback WebDir:** `out` (static export)

## 🚀 Build Instructions

### 1. Build Next.js Static Export
```bash
cd frontend
npm run build
```

### 2. Sync Web Assets with Android Project
```bash
npx cap sync android
```

### 3. Build Android APK via Android Studio
```bash
npx cap open android
```
Once Android Studio opens:
1. Wait for Gradle sync to finish.
2. Go to **Build** menu -> **Build Bundle(s) / APK(s)** -> **Build APK(s)**.
3. The generated `.apk` will be available in:
   `android/app/build/outputs/apk/debug/app-debug.apk`

### 4. Alternative: Run Directly on Device or Emulator via CLI
```bash
npx cap run android
```

## 🔔 Native Features
- **Status Bar:** Dark theme with `#0A0A0B` background.
- **Splash Screen:** Auto-managed with `#0A0A0B` background.
- **Push Notifications:** Native push registration via `@capacitor/push-notifications`.
- **Persistent Agent:** Detects native runtime and shows `NATIVE ANDROID - Push ON` badge.
