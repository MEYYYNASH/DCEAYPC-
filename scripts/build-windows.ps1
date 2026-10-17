Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Building DCEAY Music App for Windows" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptDir
$windowsDir = Join-Path $projectRoot "windows"
$distDir = Join-Path $projectRoot "dist-windows"

Write-Host "`n[1/2] Compiling Windows Executable with .NET..." -ForegroundColor Yellow
Push-Location $windowsDir
dotnet publish -c Release -o $distDir
Pop-Location

Write-Host "[2/2] Creating Release Archive..." -ForegroundColor Yellow
$zipFile = Join-Path $distDir "DCEAY-Music-App-Windows-x64.zip"
if (Test-Path $zipFile) { Remove-Item -Force $zipFile }
Compress-Archive -Path "$distDir\*" -DestinationPath $zipFile -Force

$exePath = Join-Path $distDir "DCEAY Music App.exe"
if (Test-Path $exePath) {
    Write-Host "  [OK] Windows Executable: $exePath" -ForegroundColor Green
    Write-Host "  [OK] Portable Archive: $zipFile" -ForegroundColor Green
}
Write-Host "`nWindows Build Finished Successfully!`n" -ForegroundColor Green
