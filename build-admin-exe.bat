@echo off
title GASC Sports - Build Sports Incharge Admin Windows EXE
color 0E
cls

echo ======================================================================
echo    GOVERNMENT ARTS AND SCIENCE COLLEGE, IDAPPADI
echo    SMART SPORTS MANAGEMENT SYSTEM — ADMIN WINDOWS EXE BUILDER
echo ======================================================================
echo.

:: Ensure Node.js is present
where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] Node.js is not found in PATH!
    pause
    exit /b 1
)

:: Ensure electron-packager is installed
if not exist "node_modules\electron-packager\" (
    echo [INFO] Installing required desktop packaging tools...
    call npm install
)

:: Ensure dist output folder exists
if not exist "dist\admin-exe\" (
    mkdir "dist\admin-exe\"
)

echo.
echo Packaging Windows desktop application for Sports Incharge Mam...
node electron/pack.js

if %errorlevel% equ 0 (
    color 0A
    echo.
    echo ======================================================================
    echo [SUCCESS] Admin Windows Desktop application prepared!
    echo Output Location: dist\admin-exe\GASC Sports Admin-win32-x64\
    echo.
    echo Sports Incharge Mam can run the desktop application directly:
    echo   dist\admin-exe\GASC Sports Admin-win32-x64\GASC Sports Admin.exe
    echo ======================================================================
) else (
    color 0C
    echo [ERROR] Packaging failed.
)

echo.
pause
