@echo off
cd /d "C:\Coding Projects\App Dev\Smart Nutri Scanner App\smartnutri"
start cmd /k "npx expo start --web"
timeout /t 5
start http://localhost:8081