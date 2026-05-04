@echo off
cd /d "C:\Coding Projects\App Dev\Smart Nutri Scanner App\smartnutri"
npx expo start --clear
timeout /t 5
start http://localhost:8081