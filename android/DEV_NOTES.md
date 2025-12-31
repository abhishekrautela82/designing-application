# Android Dev Notes

## Hybrid workflow
- Default editing: 2D photo editor (fast)
- Advanced: request scene build from backend, then enable 3D/AR snippets

## Upload flow (recommended)
1) Call `POST /api/v1/projects/{projectId}/captures:prepareUpload` with `{count, contentType}`
2) Upload binary to the returned signed URL(s)
3) Call `POST /api/v1/projects/{projectId}/captures` with the object keys

## Export flow (server-side)
1) Call `POST /api/v1/projects/{projectId}/exports`
2) Poll `GET /api/v1/projects/{projectId}/exports/{exportId}` until `status=succeeded`
