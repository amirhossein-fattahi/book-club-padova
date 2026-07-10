# Double-click or run:  powershell -ExecutionPolicy Bypass -File start.ps1
# Starts the Padua Book Club website locally on http://localhost:3000

Set-Location $PSScriptRoot

if (-not (Test-Path "node_modules")) {
  Write-Host "Installing dependencies (first run only)..." -ForegroundColor Cyan
  npm install
}

Write-Host "Building the site..." -ForegroundColor Cyan
npm run build

Write-Host "`nStarting server at http://localhost:3000  (press Ctrl+C to stop)`n" -ForegroundColor Green
Start-Process "http://localhost:3000"
npm run start
