# Interior & Exterior Design Studio

Professional interior and exterior design application with photo-editing, 3D scene building, and server-side export capabilities.

## Quick start (Windows)

### Demo mode (no Docker) - Recommended for development
```powershell
powershell -ExecutionPolicy Bypass -File .\setup\run-demo.ps1
```

Then open **http://127.0.0.1:5173/** in your browser.

The desktop UI provides:
- **Projects**: Create and manage interior/exterior design projects
- **Captures**: Upload photos of spaces
- **Editor**: Apply materials, place objects, adjust lighting
- **Versions**: Save and compare design iterations
- **Snippets**: Save viewpoint snapshots with lighting presets
- **Exports**: Server-side high-quality rendering (PNG exports with signed download URLs)

### Full stack (Docker) - For complete features
```powershell
powershell -ExecutionPolicy Bypass -File .\setup\run-full.ps1
```

Requires Docker Desktop. Runs Postgres + Redis + MinIO + API + worker for real uploads and processing.

See [setup/README.md](setup/README.md) for details.

## Product design docs
- [docs/PRD.md](docs/PRD.md)
- [docs/UX.md](docs/UX.md)
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- [docs/API.md](docs/API.md)
- [docs/ROADMAP.md](docs/ROADMAP.md)
- [docs/DECISIONS.md](docs/DECISIONS.md)

## Development (backend)
- Start dependencies + API:
	- `docker compose up -d --build`
- API docs (Swagger UI): `http://localhost:8080/docs`
- MinIO console: `http://localhost:9001` (user/pass: `minioadmin`)

Notes:
- The backend uses server-side export jobs from day 1. The `worker` service processes queued `Scene` and `ExportJob` rows.

## Development (frontend review UI)
- Install deps:
	- `cd frontend`
	- `npm install`
- Run:
	- `npm run dev`
- Open: `http://localhost:5173`

If PowerShell blocks `npm` scripts on your machine, use `npm.cmd` instead.

## Getting started
- Add your app source under `src/`.
- Document how to run/build in this README.

## Repo conventions
- Default branch: `main`
- Keep secrets out of git (use `.env` locally; do not commit it)
