@echo off
title Security Analyzer - Quick Start

echo.
echo ===============================================
echo 🛡️  SECURITY ANALYZER QUICK START
echo ===============================================
echo.

echo 🔍 Step 1: Testing if n8n is running...
node test-n8n-direct.js

echo.
echo 🔍 Step 2: Checking if everything is working...
timeout /t 2 /nobreak >nul

echo.
echo 🚀 Step 3: Starting proxy server...
start "Security Analyzer Proxy" cmd /c "echo 📡 Proxy Server Starting... && npm run proxy"

echo ⏳ Waiting for proxy to start...
timeout /t 4 /nobreak >nul

echo.
echo 🌐 Step 4: Starting React development server...
start "Security Analyzer Frontend" cmd /c "echo 🌐 React App Starting... && npm start"

echo.
echo ===============================================
echo ✅ STARTUP COMPLETE!
echo ===============================================
echo.
echo 🌐 React App: http://localhost:3000
echo 📡 Proxy Server: http://localhost:3001  
echo 🔧 n8n UI: http://localhost:5678
echo.
echo 💡 IMPORTANT: Make sure to click "Execute workflow" 
echo    in your n8n UI to activate the webhook!
echo.
echo 🧪 To test the connection, run:
echo    node test-connection.js
echo.
pause
