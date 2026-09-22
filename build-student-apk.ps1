# ==============================================================================
# GASC Idappadi — Smart Sports Management System
# Build Student Android APK (PowerShell Script)
# ==============================================================================

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "   GOVERNMENT ARTS AND SCIENCE COLLEGE, IDAPPADI" -ForegroundColor White
Write-Host "   SMART SPORTS MANAGEMENT SYSTEM — STUDENT ANDROID APK BUILDER" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan

# 1. Ensure output directory exists
$distDir = Join-Path $PSScriptRoot "dist\student-apk"
if (!(Test-Path $distDir)) {
    New-Item -ItemType Directory -Path $distDir -Force | Out-Null
}

# 2. Sync latest student assets
Write-Host "[1/3] Syncing latest Student Portal web assets..." -ForegroundColor Yellow
$assetsDir = Join-Path $PSScriptRoot "android-student-app\app\src\main\assets"
if (Test-Path $assetsDir) {
    Copy-Item -Path (Join-Path $PSScriptRoot "client\public\*") -Destination $assetsDir -Recurse -Force
    Remove-Item -Path (Join-Path $assetsDir "admin-*.html") -Force -ErrorAction SilentlyContinue
    Remove-Item -Path (Join-Path $assetsDir "js\admin.js") -Force -ErrorAction SilentlyContinue
}
Write-Host "[OK] Student Portal assets synced." -ForegroundColor Green

# 3. Check build environment
Write-Host "[2/3] Checking build environment..." -ForegroundColor Yellow
$javaCmd = Get-Command java -ErrorAction SilentlyContinue
if (!$javaCmd) {
    Write-Host "[ERROR] Java JDK is not detected in PATH." -ForegroundColor Red
    Write-Host "Please ensure Java 17+ or Android Studio is installed." -ForegroundColor Red
    return
}
Write-Host "[OK] Java environment detected: $($javaCmd.Source)" -ForegroundColor Green

# 4. Attempt Gradle Build
Write-Host "[3/3] Compiling Student Android APK..." -ForegroundColor Yellow
$androidAppDir = Join-Path $PSScriptRoot "android-student-app"
Push-Location $androidAppDir

$gradlewBat = Join-Path $androidAppDir "gradlew.bat"
if (Test-Path $gradlewBat) {
    cmd.exe /c "gradlew.bat assembleDebug"
    if ($LASTEXITCODE -eq 0) {
        Pop-Location
        $builtApk = Join-Path $androidAppDir "app\build\outputs\apk\debug\app-debug.apk"
        $finalApk = Join-Path $distDir "GASC_Sports_Student.apk"
        if (Test-Path $builtApk) {
            Copy-Item -Path $builtApk -Destination $finalApk -Force
            Write-Host "======================================================================" -ForegroundColor Green
            Write-Host "[SUCCESS] Student APK built successfully!" -ForegroundColor Green
            Write-Host "Location: $finalApk" -ForegroundColor White
            Write-Host "Students can install this APK directly on any Android device." -ForegroundColor Cyan
            Write-Host "======================================================================" -ForegroundColor Green
            return
        }
    }
}

Pop-Location
Write-Host ""
Write-Host "[INFO] The complete Android Studio project is ready in:" -ForegroundColor Cyan
Write-Host "Open the project in Android Studio to build the release APK." -ForegroundColor Yellow

