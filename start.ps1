# Run: powershell -ExecutionPolicy Bypass -File start.ps1
# Starts the development server. Open http://localhost:3000 in your browser.

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
  throw 'Install Node.js 22 or newer, then reopen PowerShell and try again.'
}

if (-not (Test-Path -LiteralPath 'node_modules')) {
  Write-Host "Installing dependencies (first run only)..." -ForegroundColor Cyan
  npm ci
  if ($LASTEXITCODE -ne 0) {
    throw 'Dependency installation failed. Fix the error above before starting the site.'
  }
}

Write-Host "`nStarting server at http://localhost:3000  (press Ctrl+C to stop)`n" -ForegroundColor Green
npm run dev
exit $LASTEXITCODE
