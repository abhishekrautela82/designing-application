# Frontend (Local Review UI)

This is a lightweight web UI to review the backend in action.

## Run
Prereqs:
- Node.js 20+

From `frontend/`:
- `npm install`
- `npm run dev`

Open:
- `http://localhost:5173`

## Backend
The dev server proxies API calls to `http://localhost:8080`.

To start the backend stack (recommended):
- `docker compose up -d --build`

If Docker isn’t installed yet, install Docker Desktop and re-run.

## Auth
- The backend issues an `x-dev-token` header for dev convenience.
- The UI stores it in localStorage and sends it as `Authorization: Bearer <token>`.
