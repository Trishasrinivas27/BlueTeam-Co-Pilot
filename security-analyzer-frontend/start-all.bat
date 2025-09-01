@echo off
echo 🚀 Starting Security Analyzer Frontend...
echo.

echo 📡 Step 1: Starting proxy server...
start "Proxy Server" cmd /k "npm run proxy"

echo ⏳ Waiting 3 seconds for proxy to start...
timeout /t 3 /nobreak >nul

echo 🌐 Step 2: Starting React development server...
start "React App" cmd /k "npm start"

echo.
echo ✅ Both servers should be starting now!
echo 📡 Proxy Server: http://localhost:3001
echo 🌐 React App: http://localhost:3000
echo.
echo 💡 If you see any errors, make sure n8n is running on localhost:5678
echo    and that your webhook is activated in n8n.
echo.
pause
