# Backend API

## Dev prerequisites
- Node.js 20+
- Docker Desktop (for Postgres/MinIO)

## Start dependencies
From repo root:
- `docker compose up -d`

## Install + run
From `backend/`:
- `npm install`
- Copy `.env.example` to `.env` and adjust if needed
- `npm run prisma:generate`
- `npm run prisma:migrate`
- `npm run dev`

## Docs
- Swagger UI: `http://localhost:8080/docs`

## Dev auth
If you don’t send a Bearer token, the server issues an `x-dev-token` response header you can reuse.
