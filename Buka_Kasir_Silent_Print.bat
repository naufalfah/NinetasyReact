@echo off
title Ninetasy POS - Mode Cetak Langsung (Silent Print)
echo ===================================================================
echo     Membuka Kasir Ninetasy dalam Mode Silent Printing...
echo ===================================================================
echo.
echo * Catatan: Jendela print TIDAK AKAN MUNCUL sama sekali.
echo   Setiap kali klik Cetak/Bayar, struk langsung tercetak ke printer!
echo.

set TARGET_URL=http://localhost:5173/kasir
set POS_DATA_DIR=%LOCALAPPDATA%\NinetasyChromePOS

REM 1. Cek Google Chrome di Program Files
if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --kiosk-printing --user-data-dir="%POS_DATA_DIR%" "%TARGET_URL%"
    exit
)

REM 2. Cek Google Chrome di Program Files (x86)
if exist "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --kiosk-printing --user-data-dir="%POS_DATA_DIR%" "%TARGET_URL%"
    exit
)

REM 3. Cek Google Chrome di Local AppData
if exist "%LocalAppData%\Google\Chrome\Application\chrome.exe" (
    start "" "%LocalAppData%\Google\Chrome\Application\chrome.exe" --kiosk-printing --user-data-dir="%POS_DATA_DIR%" "%TARGET_URL%"
    exit
)

REM 4. Fallback ke Microsoft Edge
if exist "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" (
    start "" "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --kiosk-printing --user-data-dir="%POS_DATA_DIR%" "%TARGET_URL%"
    exit
)

echo Browser Chrome tidak ditemukan di folder instalasi standar.
pause
