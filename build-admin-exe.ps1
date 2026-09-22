# ==============================================================================
# GASC Idappadi — Smart Sports Management System
# Build Admin Windows EXE (PowerShell Script)
# ==============================================================================

Write-Host "`n======================================================================" -ForegroundColor Yellow
Write-Host "   GOVERNMENT ARTS AND SCIENCE COLLEGE, IDAPPADI" -ForegroundColor White
Write-Host "   SMART SPORTS MANAGEMENT SYSTEM — ADMIN WINDOWS EXE BUILDER" -ForegroundColor Yellow
Write-Host "======================================================================`n" -ForegroundColor Yellow

# 1. Ensure dist output directory exists
$distDir = Join-Path $PSScriptRoot "dist\admin-exe"
if (!(Test-Path $distDir)) {
    New-Item -ItemType Directory -Path $distDir -Force | Out-Null
}

# 2. Check Electron dependencies
if (!(Test-Path (Join-Path $PSScriptRoot "node_modules\electron-packager"))) {
    Write-Host "Installing required desktop packaging tools..." -ForegroundColor Yellow
    npm install
}

# 3. Build Windows EXE
Write-Host "Packaging Windows desktop application for Sports Incharge Mam..." -ForegroundColor Cyan
node (Join-Path $PSScriptRoot "electron\pack.js")

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n======================================================================" -ForegroundColor Green
    Write-Host "[SUCCESS] Admin Windows Desktop application prepared!" -ForegroundColor Green
    Write-Host "Output Location: $distDir\GASC Sports Admin-win32-x64\" -ForegroundColor White
    Write-Host "Sports Incharge Mam can run the desktop application directly from:" -ForegroundColor Cyan
    Write-Host "  $distDir\GASC Sports Admin-win32-x64\GASC Sports Admin.exe" -ForegroundColor White
    Write-Host "======================================================================`n" -ForegroundColor Green
} else {
    Write-Host "`n[ERROR] Packaging failed with exit code $LASTEXITCODE" -ForegroundColor Red
}
