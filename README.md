# Designing application

Starter repository.

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

## Getting started
- Add your app source under `src/`.
- Document how to run/build in this README.

## Repo conventions
- Default branch: `main`
- Keep secrets out of git (use `.env` locally; do not commit it)
