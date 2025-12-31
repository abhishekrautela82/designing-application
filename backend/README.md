# Backend API

## Dev prerequisites
- Node.js 20+
- Docker Desktop (for Postgres/Redis/MinIO)

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

## Server-side exports
- Create an export job: `POST /api/v1/projects/{projectId}/exports`
- Poll status: `GET /api/v1/projects/{projectId}/exports/{exportId}`
- Get signed download URLs: `GET /api/v1/projects/{projectId}/exports/{exportId}?signed=1`

Current placeholder renderer output is a PNG uploaded to S3/MinIO.
