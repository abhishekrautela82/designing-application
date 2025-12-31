# Frontend (Local Review UI)

This is a lightweight web UI to review the backend in action.

## Run
Prereqs:
- Node.js 20+

From `frontend/`:
- `npm.cmd install`
- `npm.cmd run dev`

Open:
- `http://127.0.0.1:5173`

## Backend
The dev server proxies API calls to `http://localhost:8080`.

To start the backend stack (recommended):
- `docker compose up -d --build`

If Docker isn’t installed yet, install Docker Desktop and re-run.

## Auth
- The backend issues an `x-dev-token` header for dev convenience.
- The UI stores it in localStorage and sends it as `Authorization: Bearer <token>`.

## Troubleshooting
- If you see `'vite' is not recognized`:
	- Make sure you ran `npm.cmd install` first.
	- Or run Vite directly: `./node_modules/.bin/vite.cmd --host 127.0.0.1 --port 5173`
- If the page still can’t be reached:
	- Confirm the terminal shows `Local: http://127.0.0.1:5173/`
	- Try `http://127.0.0.1:5173/` instead of `localhost`
