# Desktop Development UI

This is the **desktop web application** for developing and testing the Interior & Exterior Design Studio.

## Features

- **Projects**: Create and manage interior/exterior design projects
- **Captures**: Upload photos of spaces
- **Editor**: Apply materials, place objects, adjust lighting (surfaces/objects/lighting/refine modes)
- **Versions**: Save and compare design iterations
- **Snippets**: Save viewpoint snapshots with lighting presets
- **Exports**: Server-side high-quality rendering with signed download URLs

## Architecture

- **`api-client.ts`**: Type-safe API client for all backend endpoints
- **`DesignApp.tsx`**: Main app with navigation
- **`screens/`**: ProjectsScreen, ProjectDetailScreen, EditorScreen
- **`design-app.css`**: Professional styling

## Run

From repo root:
```powershell
powershell -ExecutionPolicy Bypass -File .\setup\run-demo.ps1
```

Opens:
- Frontend: http://127.0.0.1:5173/
- Backend: http://127.0.0.1:8080/health

The demo backend provides in-memory storage and simulated endpoints (no Docker required).

For full features (real uploads/exports), run:
```powershell
powershell -ExecutionPolicy Bypass -File .\setup\run-full.ps1
```

(Requires Docker Desktop)

If Docker isn’t installed yet, install Docker Desktop and re-run.

### No-Docker demo backend
If you only want to review the UI flow (projects list/create) without Docker:
- `cd backend`
- `npm.cmd install --ignore-scripts`
- `npm.cmd run dev:demo`

Then run the frontend as normal and click "Connect + Load Projects".

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
