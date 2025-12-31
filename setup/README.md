# Setup (local dev)

This repo has **two** ways to run locally:

## Option A — Fastest (no Docker): Demo backend + frontend
This is enough to review UI flow (Projects list/create) in a browser.

### Run
From repo root (PowerShell):
- `powershell -ExecutionPolicy Bypass -File .\setup\run-demo.ps1`

### URLs
- Frontend: `http://127.0.0.1:5173/`
- Demo backend health: `http://127.0.0.1:8080/health`

## Option B — Full stack (Docker): real uploads + exports
This runs Postgres + Redis + MinIO + API + worker and enables signed uploads + server-side PNG exports.

### Prereqs
- Docker Desktop installed and running

### Run
- `powershell -ExecutionPolicy Bypass -File .\setup\run-full.ps1`

### URLs
- Frontend: `http://127.0.0.1:5173/`
- API Swagger: `http://127.0.0.1:8080/docs`
- MinIO console: `http://127.0.0.1:9001` (user/pass `minioadmin`)

## Notes (Windows)
- If PowerShell blocks `npm`, use `npm.cmd`.
- If you get a blank page / refused connection, re-run the script; it prints what’s running.
