@echo off
setlocal

cd /d "%~dp0"

echo Starting Yggdrasill local server...
echo URL: http://localhost:3000
echo.

npm start

echo.
echo Server stopped. Press any key to close this window.
pause >nul
