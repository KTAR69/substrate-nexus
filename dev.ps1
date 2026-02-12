$RootPath = $PSScriptRoot

# Auto-detect and add critical paths
$env:PATH += ";$env:USERPROFILE\.cargo\bin"
$env:PATH += ";C:\Program Files\nodejs"

Write-Host "🚀 Starting Substrate Consulting Nexus..." -ForegroundColor Cyan

# 1. Start Substrate Node (Backend)
# Uses cargo-watch to restart the node on file changes.
# Opens in a new window to keep backend logs separate from frontend.
Write-Host "   [Backend] Launching cargo watch..." -ForegroundColor Green
try {
    Start-Process -FilePath "cargo" -ArgumentList "watch -x 'run -- --dev --tmp --rpc-cors=all'" -WorkingDirectory $RootPath
} catch {
    Write-Warning "Failed to start cargo watch. Ensure it is installed: cargo install cargo-watch"
}

# 2. Start React App (Frontend)
# Opens in a new window so the main terminal remains usable.
Write-Host "   [Frontend] Launching Vite server..." -ForegroundColor Green
$FrontendPath = Join-Path $RootPath "frontend"
Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "Set-Location '$FrontendPath'; npm run dev -- --host 0.0.0.0"
