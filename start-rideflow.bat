@echo off
title RideFlow Permanent Launcher
echo ============================================================
echo          RideFlow Tamil Nadu Transit Platform
echo ============================================================
echo Starting RideFlow Express Backend & Public Tunnel...
echo.

cd /d "%~dp0"

echo 1. Starting Backend Server on port 5000...
start "RideFlow Backend" cmd /k "node server/index.js"

timeout /t 3 /nobreak >nul

echo 2. Creating Live Internet Public Link...
start "RideFlow Cloudflare Tunnel" cmd /k "npx --yes cloudflared tunnel --url http://localhost:5000"

echo.
echo ============================================================
echo RideFlow is now active!
echo - Local URL: http://localhost:5000
echo - Public URL: Check the Cloudflare Tunnel window for your live link
echo ============================================================
pause
