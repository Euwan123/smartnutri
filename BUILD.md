# Build APK/IPA for Smart Nutri Scanner

## Prerequisites

1. **Install EAS CLI**
```bash
npm install -g eas-cli
```

2. **Login to Expo**
```bash
eas login
```

## Build Options

### Option 1: Development Build (Fastest)
```bash
cd "c:\Coding Projects\App Dev\Smart Nutri Scanner App\smartnutri"
eas build -p android --profile development
```

### Option 2: Preview APK (Recommended)
```bash
cd "c:\Coding Projects\App Dev\Smart Nutri Scanner App\smartnutri"
eas build -p android --profile preview
```

### Option 3: Production Build
```bash
cd "c:\Coding Projects\App Dev\Smart Nutri Scanner App\smartnutri"
eas build -p android --profile production
```

### Option 4: iOS Build (Mac Required)
```bash
cd "c:\Coding Projects\App Dev\Smart Nutri Scanner App\smartnutri"
eas build -p ios --profile preview
```

## Installation

### Android APK Installation
1. **Download APK** from the link provided after build
2. **Enable Unknown Sources**:
   - Go to Settings > Security > Unknown sources
   - Toggle "Allow from this source"
3. **Install APK**:
   - Open the downloaded file
   - Follow installation prompts
4. **Grant Permissions**:
   - Camera, Storage, Network access

### iOS IPA Installation
1. **Requires Apple Developer Account** ($99/year)
2. **TestFlight** (Free option):
   - Upload to TestFlight for beta testing
3. **Enterprise Distribution** (Business accounts only)

## Build Profiles Explained

### Development
- **Fastest build time** (~2-3 minutes)
- **Development client** required
- **No app store submission**

### Preview
- **Optimized for testing** (~5-10 minutes)
- **APK for direct installation**
- **No app store required**

### Production
- **Store-ready build** (~15-20 minutes)
- **Google Play Store compatible**
- **App Store compatible**

## Troubleshooting

### Build Failures
```bash
# Clear cache
npx expo start --clear

# Reset EAS
eas build:clear
```

### Common Issues
- **Node version**: Use Node 18+
- **Expo account**: Required for builds
- **Network**: Stable internet required
- **Disk space**: At least 2GB free

## Build Output

After successful build, you'll get:
- **Download link** for APK/IPA
- **QR code** for easy mobile testing
- **Expo dashboard** link to track builds

## Fast Testing (No Build)

For quick testing without building:
1. Use **Expo Development Client** (see INSTALL.md)
2. Install as **PWA** from browser
3. Both methods work without compilation

## Notes

- **Firebase not required** - app uses local storage
- **API keys needed** for AI scanning features
- **PWA support** included for web install
- **Offline capable** with service worker
