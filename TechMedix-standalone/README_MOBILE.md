# TechMedix — Mobile and Smart Glasses Build Guide

This guide covers building and deploying TechMedix to mobile devices and smart glasses hardware using Capacitor.

## Supported Targets

| Platform | OS | Notes |
|---|---|---|
| iOS | iOS 16+ | iPhone, iPad |
| Android | Android 10+ | Phones, tablets |
| RealWear HMT-1 | Android 8.1 | Voice-first, hands-free |
| RealWear Navigator 500 | Android 11 | IP66, voice commands |
| Vuzix Blade 2 | Android 10 | 640x480 monocular display |
| Google Glass Enterprise Edition 2 | Android 8.1 | Lightweight, 820 mAh |

## Prerequisites

Install Capacitor dependencies:

```bash
npm install --save-dev @capacitor/cli @capacitor/core
npm install --save-dev @capacitor/ios @capacitor/android
npm install @capacitor/camera
```

Verify environment:
- Node 18+
- Xcode 15+ (iOS)
- Android Studio Hedgehog+ (Android)
- Java 17 (Android)

## Build Steps

### 1. Build Next.js static export

```bash
npm run build
```

The output goes to `out/` (set in `next.config.mjs` as `output: 'export'` for static builds only — do not enable this for the Vercel deployment; configure separately via a build script if needed).

### 2. Sync Capacitor

```bash
npx cap sync
```

This copies the `out/` web assets into the native iOS and Android projects and updates plugins.

### 3. Open native IDE

**iOS:**
```bash
npx cap open ios
```
Build and run from Xcode. Select a device or simulator.

**Android:**
```bash
npx cap open android
```
Build and run from Android Studio.

## Camera Permissions

### iOS

Add to `ios/App/App/Info.plist`:
```xml
<key>NSCameraUsageDescription</key>
<string>TechMedix AR Mode uses the camera to analyze robot components and provide diagnostic guidance.</string>
```

### Android

`AndroidManifest.xml` (added automatically by Capacitor Camera plugin):
```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-feature android:name="android.hardware.camera" android:required="false" />
```

## Smart Glasses — Platform Notes

### RealWear HMT-1 and Navigator 500

RealWear devices run Android and use voice commands for navigation. TechMedix maps to voice commands automatically via the web browser layer.

Key voice commands:
- `SELECT` — equivalent to tap
- `NAVIGATE BACK` — equivalent to back button
- `NAVIGATE HOME` — return to home screen
- `SHOW HELP` — display on-screen voice command list

Deployment method: sideload APK via ADB or use RealWear Foresight MDM.

```bash
adb install techmedix.apk
```

Display optimizations: the HMT-1 renders at 854x480. The TechMedix dashboard is responsive and will adapt. AR mode (`/ar-mode`) works best in landscape orientation.

### Vuzix Blade 2

Vuzix Blade 2 has a 640x480 monocular display. Use the following CSS media query hint for Vuzix-optimized layouts (already included in the Tailwind responsive config):

```css
@media (max-width: 640px) { /* compact layout */ }
```

The AR overlay canvas in `components/ar-overlay.tsx` scales to device pixel ratio automatically. On Vuzix, the overlay panel renders on the right side of the field of view.

Camera access uses `facingMode: 'environment'` which automatically routes to the Blade 2 forward-facing camera.

### Google Glass Enterprise Edition 2

Glass EE2 runs Android 8.1. It supports standard Android WebView. Deploy via Android APK:

```bash
npx cap build android
```

Voice input: use the on-screen keyboard or pair a Bluetooth keyboard for text entry. Glass EE2 does not have a built-in microphone suitable for SpeechRecognition API — test voice features before deployment.

Battery: 820 mAh. Keep AR capture sessions under 20 minutes to preserve battery life. The 2-second capture interval in `ar-overlay.tsx` is calibrated for this.

## AR Mode Notes

The AR capture pipeline (`components/ar-overlay.tsx`) uses:

```typescript
video: { facingMode: "environment" }
```

This automatically selects:
- Rear camera on phones
- Forward-facing camera on RealWear HMT-1
- Front camera on Vuzix Blade 2 (environment-facing in glasses context)
- Glass EE2 forward camera

No additional platform-specific configuration is needed for camera routing.

Frame capture: every 2000ms, a JPEG frame is captured at 0.7 quality and sent to `/api/ar-guidance` for claude-sonnet-4-6 vision analysis. Reduce the `CAPTURE_INTERVAL_MS` constant for faster feedback or increase it to conserve battery.

## Verify Capacitor Config

Current `capacitor.config.ts` settings:

| Key | Value |
|---|---|
| appId | com.blackcatrobotics.techmedix |
| appName | TechMedix |
| webDir | out |
| androidScheme | https |
| Camera plugin | configured |

The `webDir: 'out'` setting requires Next.js to be built with `output: 'export'`. For the Vercel deployment, this export mode is NOT enabled in `next.config.mjs` to preserve API routes. Use a separate build script for mobile:

```bash
# Mobile build script (do not use for Vercel)
NEXT_EXPORT=true next build && npx cap sync
```

Or configure a separate `next.config.mobile.mjs` and run:

```bash
next build --config next.config.mobile.mjs && npx cap sync
```

## Troubleshooting

**Camera permission denied on iOS:** Ensure `NSCameraUsageDescription` is in Info.plist and that the device has granted camera access under Settings > TechMedix.

**White screen on Android:** Run `npx cap sync` after every `npm run build`. Stale web assets cause blank screens.

**AR overlay not rendering:** The canvas must be the same dimensions as the video element. Check `video.videoWidth` and `video.videoHeight` are non-zero before drawing.

**API requests failing on device:** Ensure the device has network access to the Vercel deployment URL. For local dev, update `capacitor.config.ts` server.url to your local IP.

---

Built by BlackCat Robotics. TechMedix powers the field service layer for humanoid robot fleets.
