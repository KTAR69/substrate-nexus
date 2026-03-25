# PowerShell Script to Install Protoc (Windows)
$ErrorActionPreference = "Stop"

$protocVersion = "25.2"
$url = "https://github.com/protocolbuffers/protobuf/releases/download/v$protocVersion/protoc-$protocVersion-win64.zip"
$output = "$PSScriptRoot\protoc.zip"
$dest = "$env:USERPROFILE\.cargo\bin"

Write-Host "Downloading Protoc v$protocVersion..."
Invoke-WebRequest -Uri $url -OutFile $output

Write-Host "Extracting to $dest..."
Expand-Archive -Path $output -DestinationPath "$PSScriptRoot\protoc_temp" -Force

# Move binary
if (-not (Test-Path $dest)) { New-Item -ItemType Directory -Path $dest | Out-Null }
Move-Item -Path "$PSScriptRoot\protoc_temp\bin\protoc.exe" -Destination "$dest\protoc.exe" -Force

# Cleanup
Remove-Item $output -Force
Remove-Item "$PSScriptRoot\protoc_temp" -Recurse -Force

Write-Host "Protoc installed to: $dest\protoc.exe"
Write-Host "Verifying..."
& "$dest\protoc.exe" --version

Write-Host "Success! You can now run the build."
