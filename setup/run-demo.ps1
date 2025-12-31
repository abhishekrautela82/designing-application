$ErrorActionPreference = 'Stop'

# 1) Bootstrap (installs deps if needed)
& "$PSScriptRoot\bootstrap.ps1" -SkipDocker

# 2) Start demo backend (no Docker)
Write-Host "\n==> Starting DEMO backend on 127.0.0.1:8080" -ForegroundColor Cyan
Push-Location "$PSScriptRoot\..\backend"
Start-Process -FilePath ".\node_modules\.bin\tsx.cmd" -ArgumentList "watch","src\demo.ts" -WorkingDirectory "$PWD" -WindowStyle Normal
Pop-Location

# 3) Start frontend
Write-Host "\n==> Starting frontend on 127.0.0.1:5173" -ForegroundColor Cyan
Push-Location "$PSScriptRoot\..\frontend"
Start-Process -FilePath ".\node_modules\.bin\vite.cmd" -ArgumentList "--host","127.0.0.1","--port","5173" -WorkingDirectory "$PWD" -WindowStyle Normal
Pop-Location

Write-Host "\nOpen: http://127.0.0.1:5173/" -ForegroundColor Green
Write-Host "Health: http://127.0.0.1:8080/health" -ForegroundColor Green
