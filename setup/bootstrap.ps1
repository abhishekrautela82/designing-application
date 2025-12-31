param(
    [switch]$SkipDocker,
    [switch]$SkipNpmInstall
)

$ErrorActionPreference = 'Stop'

function Write-Step($msg) { Write-Host "\n==> $msg" -ForegroundColor Cyan }
function Write-Warn($msg) { Write-Host "WARNING: $msg" -ForegroundColor Yellow }

function Require-Command($name, $hint) {
    if (-not (Get-Command $name -ErrorAction SilentlyContinue)) {
        throw "Missing required command '$name'. $hint"
    }
}

function Try-Command($name) {
    return [bool](Get-Command $name -ErrorAction SilentlyContinue)
}

Write-Step "Checking prerequisites"
Require-Command node "Install Node.js 20+ from https://nodejs.org"

# npm on some machines is blocked as a PowerShell script; prefer npm.cmd
if (-not (Try-Command npm.cmd)) {
    throw "Missing 'npm.cmd'. Your Node install may be broken. Reinstall Node.js."
}

$nodeVersion = (node -v)
$npmVersion = (npm.cmd -v)
Write-Host "Node: $nodeVersion"
Write-Host "npm : $npmVersion"

Write-Step "Installing JS dependencies (frontend + backend)"
if (-not $SkipNpmInstall) {
    Push-Location "$PSScriptRoot\..\frontend"
    npm.cmd install --ignore-scripts --no-audit --no-fund | Out-Host
    Pop-Location

    Push-Location "$PSScriptRoot\..\backend"
    npm.cmd install --ignore-scripts --no-audit --no-fund | Out-Host
    Pop-Location
}
else {
    Write-Warn "Skipping npm install (SkipNpmInstall=true)"
}

if (-not $SkipDocker) {
    Write-Step "Checking Docker (for full stack)"
    if (-not (Try-Command docker)) {
        Write-Warn "Docker not found. Full stack won't run. Use demo mode or install Docker Desktop."
    }
}

Write-Step "Bootstrap complete"
