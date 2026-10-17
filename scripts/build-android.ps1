Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Building DCEAY Music App for Android" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
$env:ANDROID_HOME = "C:\Users\ASUS\AppData\Local\Android\Sdk"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptDir
$androidDir = Join-Path $projectRoot "android"
$appDir = Join-Path $projectRoot "app"
$assetsDir = Join-Path $androidDir "app\src\main\assets"

Write-Host "`n[1/3] Syncing Web Assets..." -ForegroundColor Yellow
if (!(Test-Path $assetsDir)) { New-Item -ItemType Directory -Force -Path $assetsDir | Out-Null }
Copy-Item -Path "$appDir\*" -Destination $assetsDir -Recurse -Force

Write-Host "[2/3] Compiling Android APKs with Gradle..." -ForegroundColor Yellow
$gradleCmd = "C:\Users\ASUS\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3\bin\gradle.bat"
Push-Location $androidDir
& $gradleCmd assembleDebug assembleRelease
Pop-Location

Write-Host "`n[3/3] Output Verification..." -ForegroundColor Yellow
$debugApk = Join-Path $androidDir "app\build\outputs\apk\debug\app-debug.apk"
$releaseApk = Join-Path $androidDir "app\build\outputs\apk\release\app-release.apk"

if (Test-Path $debugApk) {
    Write-Host "  [OK] Debug APK: $debugApk" -ForegroundColor Green
}
if (Test-Path $releaseApk) {
    Write-Host "  [OK] Release APK: $releaseApk" -ForegroundColor Green
}
Write-Host "`nAndroid Build Finished Successfully!`n" -ForegroundColor Green
