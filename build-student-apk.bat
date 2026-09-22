@echo off
title GASC Sports - Build Student Android APK
color 0B
cls

echo ======================================================================
echo    GOVERNMENT ARTS AND SCIENCE COLLEGE, IDAPPADI
echo    SMART SPORTS MANAGEMENT SYSTEM — STUDENT ANDROID APK BUILDER
echo ======================================================================
echo.

:: Ensure output directory exists
if not exist "dist\student-apk\" (
    mkdir "dist\student-apk\"
)

:: Sync latest student assets
echo [1/3] Syncing latest Student Portal web assets...
if exist "android-student-app\app\src\main\assets\" (
    xcopy /E /I /Y "client\public\*" "android-student-app\app\src\main\assets\" >nul
    del /Q "android-student-app\app\src\main\assets\admin-*.html" 2>nul
    del /Q "android-student-app\app\src\main\assets\js\admin.js" 2>nul
)
echo [OK] Student Portal assets synced.

:: Check for Android SDK / Java
echo.
echo [2/3] Checking build environment...
where java >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] Java JDK is not detected in PATH.
    echo Please ensure Java 17+ or Android Studio is installed.
    pause
    exit /b 1
)

:: Attempt Gradle Build
echo.
echo [3/3] Compiling Student Android APK...
cd android-student-app

if exist "gradlew.bat" (
    call gradlew.bat assembleDebug
    if %errorlevel% equ 0 (
        cd ..
        if exist "android-student-app\app\build\outputs\apk\debug\app-debug.apk" (
            copy /Y "android-student-app\app\build\outputs\apk\debug\app-debug.apk" "dist\student-apk\GASC_Sports_Student.apk" >nul
            color 0A
            echo.
            echo ======================================================================
            echo [SUCCESS] Student APK built successfully!
            echo Location: dist\student-apk\GASC_Sports_Student.apk
            echo.
            echo Students can install this APK directly on any Android device.
            echo ======================================================================
            pause
            exit /b 0
        )
    )
)

cd ..
echo.
echo ======================================================================
echo [INFO] You can build or install the Student APK using Android Studio:
echo 1. Open the 'android-student-app' folder in Android Studio.
echo 2. Click Build -> Build Bundle(s) / APK(s) -> Build APK(s).
echo Project Directory: %~dp0android-student-app
echo ======================================================================
echo.
pause
