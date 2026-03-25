# PowerShell Script to Install LLVM Locally (No Admin Needed)
$ErrorActionPreference = "Stop"

$installer = "$PSScriptRoot\llvm-installer.exe"
$localInstallDir = "$env:USERPROFILE\LLVM"

Write-Host "Attempting Local Install to: $localInstallDir"

if (-not (Test-Path $installer)) {
    Write-Error "Installer not found at $installer. Please check previous steps."
}

# /S = Silent
# /D = Install Directory (Must be the last argument and contain no quotes if it has spaces, but we use a safe path)
# We accept that /D must be passed carefully.
$args = "/S", "/D=$localInstallDir"

Write-Host "Running Installer Silently..."
$process = Start-Process -FilePath $installer -ArgumentList $args -Wait -PassThru -NoNewWindow

if ($process.ExitCode -eq 0) {
    if (Test-Path "$localInstallDir\bin\libclang.dll") {
        Write-Host "SUCCESS: LLVM installed locally!"
    }
    else {
        Write-Error "Installation finished but 'bin\libclang.dll' is missing."
    }
}
else {
    Write-Error "Installer failed with exit code: $($process.ExitCode)"
}
