# DCEAY Music App — Premium Cross-Platform Music Player

[![Build & Release](https://github.com/DCEAY/DCEAY-Music-App/actions/workflows/build.yml/badge.svg)](https://github.com/DCEAY/DCEAY-Music-App/actions/workflows/build.yml)
[![Version](https://img.shields.io/badge/version-1.0.0-00f0ff.svg)](https://github.com/DCEAY/DCEAY-Music-App/releases)
[![Platform](https://img.shields.io/badge/platform-Android%20%7C%20Windows-ff007f.svg)](https://github.com/DCEAY/DCEAY-Music-App)

**DCEAY Music App** is a production-quality music application inspired by the **Dotify** desktop music player. Designed with a shared cross-platform architecture, it delivers smooth 60–144 FPS animations, glassmorphism and cyberpunk visual styling, real music playback, synchronized LRC lyrics, a 5-band Web Audio DSP equalizer, dynamic album-art background transitions, and an integrated GitHub Releases online update center.

---

## 🌟 Key Features

### 1. Visual Design & Themes
- **Themes**:
  - **Obsidian Dark (Default)**: Deep charcoal and obsidian surfaces with subtle borders and cyan/pink accents.
  - **Cyberpunk Neon**: High-contrast neon pink (`#ff00ff`) and cyan (`#00ffff`) with glowing borders.
  - **Glassmorphism**: Translucent frosted panels (`#14141e99`) with backdrop blur and soft white typography.
  - **OLED Black**: Pure `#000000` dark mode optimized for OLED screens and battery conservation.
- **Dynamic Album Artwork Ambient Backgrounds**: Asynchronously samples dominant and vibrant colors from currently playing album covers using HTML5 Canvas pixel analysis, continuously generating smooth complementary background gradients.
- **Micro-Animations & Accessibility**:
  - Spinning vinyl / breathing artwork animation during playback.
  - Shared expansion transition from persistent mini-player into the full-screen player.
  - Active lyric line scale and glow transitions with smooth auto-scroll.
  - **Reduced Motion** option for accessibility and performance.

### 2. Audio Engine & DSP Equalizer
- **Real Audio Playback**: Supports local MP3, FLAC, WAV, AAC, M4A, and OGG formats with interactive scrubbing and precise seeking.
- **Hardware-Accelerated 5-Band Equalizer**: Web Audio API `BiquadFilterNode` parametric filters:
  - 60 Hz (Bass Low-Shelf)
  - 230 Hz (Low-Mid Peaking)
  - 910 Hz (Mid Peaking)
  - 3.6 kHz (High-Mid Peaking)
  - 14 kHz (Treble High-Shelf)
  - Presets: *Flat*, *Bass Boost*, *Vocal Boost*, *Rock*, *Electronic*, and *Classical*.
- **Transport Controls**: Shuffle (Fisher-Yates queue randomization), Repeat modes (*Off*, *Repeat All*, *Repeat One*), Volume slider, and Playback Speed selector (*0.5x*, *0.75x*, *1.0x*, *1.25x*, *1.5x*, *2.0x*).
- **Sleep Timer**: Built-in 15m, 30m, 45m, and 60m timers.
- **System MediaSession Integration**: Full integration with Windows hardware media keys, lock screen audio controls, and Android notification media actions.

### 3. Synchronized Lyrics Engine
- **LRC Parser**: High-precision timestamp parser supporting `[mm:ss.xx]` and `[mm:ss.xxx]` timestamps.
- **Real-Time Auto-Scroll**: Binary-search active line tracker that highlights the current line and smoothly centers it in view.
- **Interactive Lyric Seeking**: Tap any line in the lyrics modal to jump playback directly to that timestamp.
- **Manual Synchronization Offset**: On-the-fly +/- 100ms and +/- 500ms sync adjustments.
- **Customization**: In-app font size controls (`A-` / `A+`) and external `.lrc` file importer with local database caching.

### 4. Library & Playlist Management
- **Local Media Scanning & Import**: Import individual audio files or entire folders with automatic metadata reading.
- **Local Persistence (IndexedDB & LocalStorage)**: Tracks, playlists, playback queue, favorites, listening history, and playback resume state survive application restarts.
- **Playlist Features**: Create, rename, delete, add/remove songs, and export/import playlists via JSON.
- **Multi-Select Actions**: Batch queueing, batch playlist addition, and removal.
- **Instant Search**: Real-time filtering across Song Titles, Artists, Albums, and Genres with search history chips.

### 5. In-App GitHub Releases Online Update Center
- **Direct GitHub Releases API Integration**: Queries `https://api.github.com/repos/{owner}/{repo}/releases/latest`.
- **Configurable Repository**: Easily change repository owner and name in Settings.
- **SemVer Version Comparison**: Compares installed version (e.g. `1.0.0`) against remote release tags (e.g. `v1.1.0`).
- **Release Notes & Asset Downloads**: View release changelog, download Android APK or Windows EXE, and verify integrity via SHA-256 checksums.

---

## 📂 Project Architecture

```
dceay_music_app/
├── app/                              # Core Cross-Platform Web Application
│   ├── index.html                    # Main HTML shell (desktop sidebar + mobile bottom nav)
│   ├── css/
│   │   ├── theme.css                 # Obsidian, Cyberpunk, Glassmorphism, OLED styles
│   │   └── app.css                   # Responsive layout, player components, animations
│   ├── js/
│   │   ├── app.js                    # Main orchestrator, router, keyboard shortcuts
│   │   ├── audio-engine.js           # HTML5 Audio + Web Audio API 5-Band Equalizer
│   │   ├── lyrics-engine.js          # Synchronized LRC parser & active line tracker
│   │   ├── palette-extractor.js      # Canvas-based vibrant color extractor
│   │   ├── storage-manager.js        # IndexedDB & LocalStorage persistence
│   │   ├── update-service.js         # GitHub Releases API checker & SHA-256 verifier
│   │   └── components/               # Modular UI screens and dialogs
│   │       ├── home-screen.js
│   │       ├── search-screen.js
│   │       ├── library-screen.js
│   │       ├── playlists-screen.js
│   │       ├── settings-screen.js
│   │       ├── mini-player.js
│   │       ├── full-player.js
│   │       ├── lyrics-view.js
│   │       ├── equalizer-dialog.js
│   │       └── queue-drawer.js
│   └── assets/sample/                # Default branding & cover artwork
├── android/                          # Native Android Application (Gradle 8.14.3 + Java 21)
│   ├── build.gradle                  # Root build configuration
│   ├── settings.gradle
│   ├── gradle.properties             # Offline build optimizations
│   └── app/
│       ├── build.gradle              # Android app config (compileSdk 36, minSdk 24)
│       └── src/main/
│           ├── AndroidManifest.xml   # Audio permissions & full-screen theme
│           ├── java/com/dceay/musicapp/MainActivity.java
│           └── assets/               # Synced web assets
├── windows/                          # Native Windows Desktop Application (.NET 10)
│   ├── windows.csproj                # WinExe project configuration
│   └── Program.cs                    # High-performance native desktop host
├── dist-windows/                     # Built Windows Distribution
│   ├── DCEAY Music App.exe           # Native Windows Executable
│   └── DCEAY-Music-App-Windows-x64.zip
├── scripts/                          # Automated Build Scripts
│   ├── build-android.ps1             # One-click Android APK build
│   └── build-windows.ps1             # One-click Windows EXE publish
├── tests/                            # Automated Unit Tests
│   ├── app.test.js                   # Master test suite
│   ├── lyrics.test.js                # LRC parsing & offset tests
│   └── update.test.js                # SemVer & updater tests
├── .github/workflows/
│   └── build.yml                     # GitHub Actions CI/CD release pipeline
├── checksums.txt                     # SHA-256 release checksums
└── package.json
```

---

## 🚀 Building & Packaging

### Prerequisites
- **Node.js** (v18+)
- **.NET SDK** (v8.0+ or v10.0+) for Windows EXE
- **Android SDK** (API 24–36) and **Java 17/21** for Android APK

---

### 1. Run Automated Tests
```powershell
node tests/app.test.js
```

---

### 2. Build Android APKs (Debug & Signed Release)
Run the automated build script:
```powershell
.\scripts\build-android.ps1
```
Or with Gradle directly:
```powershell
cd android
.\gradlew.bat assembleDebug assembleRelease
```
**Outputs:**
- Debug APK: `android/app/build/outputs/apk/debug/app-debug.apk`
- Release APK: `android/app/build/outputs/apk/release/app-release.apk`

---

### 3. Build Windows Executable
Run the automated build script:
```powershell
.\scripts\build-windows.ps1
```
Or with .NET directly:
```powershell
cd windows
dotnet publish -c Release -o ../dist-windows
```
**Outputs:**
- Native Executable: `dist-windows/DCEAY Music App.exe`
- Portable Release Archive: `dist-windows/DCEAY-Music-App-Windows-x64.zip`

---

## 🔒 Verification & Checksums

All build artifacts can be verified using standard SHA-256:

```
13ed73cc71326df054fad4bd13b53a0465e2892b3ab83f37c435cf735fe05fb8  app-debug.apk
919d16d720c800c9ca36e6c9843479b4aadd2438c4730bd1b593b1658b33e405  app-release.apk
99b02ea8e9afea3d6e468c15e92e9c4635a442f385b94d78b61fb3918d271256  DCEAY Music App.exe
3943962bca63aaae3ba404d9b75d581fbe10f0651937eb46e63357afb00ed718  DCEAY-Music-App-Windows-x64.zip
```

Verify locally using PowerShell:
```powershell
Get-FileHash -Algorithm SHA256 "dist-windows\DCEAY Music App.exe"
Get-FileHash -Algorithm SHA256 "android\app\build\outputs\apk\release\app-release.apk"
```

---

## ⌨️ Desktop Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Space` | Play / Pause |
| `Arrow Right` | Seek Forward 5 Seconds |
| `Arrow Left` | Seek Backward 5 Seconds |
| `Arrow Up` | Volume Up (+5%) |
| `Arrow Down` | Volume Down (-5%) |
| `N` | Next Track |
| `P` | Previous Track |
| `L` | Toggle Synchronized Lyrics Modal |
| `F` | Toggle Full-Screen Now Playing Player |

---

## 📄 License & Credits
- **Original Implementation**: Developed for **DCEAY Music App** with original branding, icons, and codebase inspired by Dotify.
- **Open Source**: MIT License.
