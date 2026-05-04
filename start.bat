@echo off
cd /d "C:\Coding Projects\App Dev\Smart Nutri Scanner App\smartnutri"
echo Installing dependencies...
npm install firebase
npm install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/native-stack
npx expo install react-native-screens react-native-safe-area-context
echo Starting Expo...
npx expo start
timeout /t 5
start http://localhost:8081