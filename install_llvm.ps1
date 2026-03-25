# PowerShell Script to Install LLVM (Windows) for Bindgen
$ErrorActionPreference = "Stop"

$llvmVersion = "17.0.6"
$url = "https://github.com/llvm/llvm-project/releases/download/llvmorg-$llvmVersion/LLVM-$llvmVersion-win64.exe"
$installer = "$PSScriptRoot\llvm-installer.exe"
$installDir = "C:\LLVM" # Using a simple path to avoid space issues in bindgen

Write-Host "Downloading LLVM v$llvmVersion..."
Invoke-WebRequest -Uri $url -OutFile $installer

Write-Host "Installing to $installDir (Silent Mode)..."
# /S = Silent, /D = Install Directory
Start-Process -FilePath $installer -ArgumentList "/S", "/D=$installDir" -Wait -NoNewWindow

# Verify installation
if (Test-Path "$installDir\bin\libclang.dll") {
    Write-Host "LLVM installed successfully."
    
    # Set Environment Variable for the current session
    $env:LIBCLANG_PATH = "$installDir\bin"
    
    # Persist Environment Variable for future sessions
    [System.Environment]::SetEnvironmentVariable("LIBCLANG_PATH", "$installDir\bin", [System.EnvironmentVariableTarget]::User)
    
    Write-Host "LIBCLANG_PATH set to: $installDir\bin"
} else {
    Write-Error "Installation failed. libclang.dll not found."
}

# Cleanup
Remove-Item $installer -Force

Write-Host "Success! You can now run the build."
