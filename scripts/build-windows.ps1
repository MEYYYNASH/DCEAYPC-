Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Building DCEAY Music App for Windows" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptDir
$windowsDir = Join-Path $projectRoot "windows"
$distDir = Join-Path $projectRoot "dist-windows"

Write-Host "`n[1/3] Compiling Windows Executable with .NET..." -ForegroundColor Yellow
Push-Location $windowsDir
dotnet publish -c Release -o $distDir
Pop-Location

Write-Host "[2/3] Creating Release Archive..." -ForegroundColor Yellow
$zipFile = Join-Path $distDir "DCEAY-Music-App-Windows-x64.zip"
if (Test-Path $zipFile) { Remove-Item -Force $zipFile }
Compress-Archive -Path "$distDir\*" -DestinationPath $zipFile -Force

Write-Host "[3/3] Compiling Inno Setup Installer..." -ForegroundColor Yellow
$isccPath = "C:\Users\ASUS\AppData\Local\Programs\Inno Setup 6\ISCC.exe"
$installerScript = Join-Path $windowsDir "installer.iss"
if (Test-Path $isccPath) {
    & $isccPath $installerScript
} else {
    Write-Host "  Note: ISCC.exe not found at standard path, skipping installer compilation." -ForegroundColor Gray
}

$exePath = Join-Path $distDir "DCEAY Music App.exe"
$setupPath = Join-Path $distDir "DCEAY-Music-App-Setup.exe"

if (Test-Path $exePath) {
    Write-Host "  [OK] Windows Executable: $exePath" -ForegroundColor Green
}
if (Test-Path $setupPath) {
    Write-Host "  [OK] Inno Setup Installer: $setupPath" -ForegroundColor Green
}
if (Test-Path $zipFile) {
    Write-Host "  [OK] Portable Archive: $zipFile" -ForegroundColor Green
}
Write-Host "`nWindows Build Finished Successfully!`n" -ForegroundColor Green
