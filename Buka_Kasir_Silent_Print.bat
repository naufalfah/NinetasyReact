@echo off
title Buka Kasir Ninetasy - Silent Printing Mode
echo ========================================================
echo   Membuka Ninetasy Kasir dengan Mode Silent Printing...
echo   (Setiap cetak struk akan langsung tercetak ke printer
echo    tanpa memunculkan jendela dialog print)
echo ========================================================

set TARGET_URL=http://localhost:5173/kasir

REM 1. Cek Google Chrome di Program Files
if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --kiosk-printing "%TARGET_URL%"
    exit
)

REM 2. Cek Google Chrome di Program Files (x86)
if exist "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --kiosk-printing "%TARGET_URL%"
    exit
)

REM 3. Cek Google Chrome di Local AppData
if exist "%LocalAppData%\Google\Chrome\Application\chrome.exe" (
    start "" "%LocalAppData%\Google\Chrome\Application\chrome.exe" --kiosk-printing "%TARGET_URL%"
    exit
)

REM 4. Fallback ke Microsoft Edge
if exist "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" (
    start "" "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --kiosk-printing "%TARGET_URL%"
    exit
)

echo Browser Chrome/Edge tidak ditemukan di folder standar.
echo Silakan buka Chrome dengan shortcut berflag --kiosk-printing.
pause
