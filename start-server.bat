@echo off
echo.
echo ========================================
echo   Drop Development Server
echo ========================================
echo.
echo Starting server on port 8080...
echo.

REM Get local IP address
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address" ^| findstr 192.168') do (
    set IP=%%a
)

REM Trim leading space
set IP=%IP: =%

echo Local:   http://localhost:8080
echo Mobile:  http://%IP%:8080
echo.
echo Open the Mobile URL on your Pixel 8
echo (Make sure both devices are on same WiFi)
echo.
echo Press Ctrl+C to stop
echo ========================================
echo.

cd docs
call npx http-server -p 8080 -c-1
