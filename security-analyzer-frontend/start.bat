@echo off
echo 🚀 Starting Security Event Analyzer...
echo.
echo 📡 Starting CORS proxy server on port 3001...
start "CORS Proxy" cmd /k "cd /d %~dp0 && npm run proxy"

timeout /t 3 /nobreak > nul

echo 🌐 Starting React frontend on port 3000...
start "React Frontend" cmd /k "cd /d %~dp0 && npm start"

echo.
echo ✅ Both services starting...
echo 📱 Frontend: http://localhost:3000
echo 🔌 Proxy: http://localhost:3001
echo.
echo Press any key to exit this script (services will continue running)
pause > nul
