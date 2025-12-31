$ErrorActionPreference = 'Stop'

# 1) Bootstrap
& "$PSScriptRoot\bootstrap.ps1"

# 2) Start Docker stack
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
  throw "Docker is not installed or not on PATH. Install Docker Desktop to run the full stack."
}

Write-Host "\n==> Starting FULL stack (docker compose)" -ForegroundColor Cyan
Push-Location "$PSScriptRoot\.."
# Use docker compose (v2)
docker compose up -d --build | Out-Host
Pop-Location

# 3) Start frontend
Write-Host "\n==> Starting frontend on 127.0.0.1:5173" -ForegroundColor Cyan
Push-Location "$PSScriptRoot\..\frontend"
Start-Process -FilePath ".\node_modules\.bin\vite.cmd" -ArgumentList "--host","127.0.0.1","--port","5173" -WorkingDirectory "$PWD" -WindowStyle Normal
Pop-Location

Write-Host "\nOpen: http://127.0.0.1:5173/" -ForegroundColor Green
Write-Host "API docs: http://127.0.0.1:8080/docs" -ForegroundColor Green
Write-Host "MinIO: http://127.0.0.1:9001" -ForegroundColor Green
