# Smart Nutri Scanner - Mobile Installation Guide

## Method 1: Expo Development Client (Recommended)

### Step 1: Install Expo Go
1. Open **Google Play Store** on your Android device
2. Search for **"Expo Go"**
3. Install the app

### Step 2: Scan QR Code
1. Open the Expo Go app
2. Allow camera permissions
3. Scan the QR code from your terminal:
   ```
   exp+smartnutri://expo-development-client/?url=http://192.168.1.101:8081
   ```

### Step 3: Launch App
- The app will automatically download and launch
- Grant all permissions when prompted

---

## Method 2: PWA Installation (Web App)

### Step 1: Open Browser
1. Open **Chrome** or **Safari** on your mobile device
2. Go to: `http://192.168.1.101:8081`

### Step 2: Install PWA
**Android (Chrome):**
1. Tap the **menu icon** (⋮) in Chrome
2. Select **"Add to Home screen"**
3. Tap **"Add"** to confirm

**iOS (Safari):**
1. Tap the **Share icon** (□↑)
2. Scroll down and tap **"Add to Home Screen"**
3. Tap **"Add"** to confirm

### Step 3: Launch from Home Screen
- The app icon will appear on your home screen
- Tap to launch like a native app

---

## Method 3: Development Build (Advanced)

### Step 1: Install EAS CLI
```bash
npm install -g eas-cli
```

### Step 2: Configure EAS
```bash
cd "c:\Coding Projects\App Dev\Smart Nutri Scanner App\smartnutri"
eas build:configure
```

### Step 3: Build APK
```bash
eas build -p android --profile preview
```

### Step 4: Install APK
1. Download the APK from the provided link
2. Enable **"Install from unknown sources"** in Android settings
3. Install the APK file

---

## Network Requirements

### Important Notes:
- **Same WiFi Network**: Your phone and computer must be on the same WiFi network
- **IP Address**: Use `192.168.1.101:8081` (or check your terminal for the correct IP)
- **Firewall**: Make sure port 8081 is not blocked

### Troubleshooting:
- **QR not working**: Check if you're on the same WiFi network
- **Blank screen**: Try refreshing the browser or clearing cache
- **Permissions**: Allow all requested permissions for full functionality

---

## Features Available

### ✅ Working Features:
- Camera scanning for food analysis
- Local meal tracking
- Nutrition calculations
- PWA offline support
- Filipino dish recognition

### 🔧 Setup Required:
- Add API keys to `.env` file for AI scanning:
  - `EXPO_PUBLIC_OPENAI_API_KEY` (from platform.openai.com)
  - `EXPO_PUBLIC_GOOGLE_VISION_API_KEY` (from console.cloud.google.com)

### 📱 Device Compatibility:
- **Android**: Version 6.0+ with Chrome
- **iOS**: Version 12.0+ with Safari
- **Best Experience**: Use Expo Development Client
