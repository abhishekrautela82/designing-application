# Backend API (draft)

Base URL: `/api/v1`
Auth: Bearer JWT

## Core resources
- User
- Project
- Capture
- Scene (derived)
- DesignVersion
- Snippet
- ExportJob

## Endpoints (MVP)

### Auth
- `POST /auth/login`
- `POST /auth/verify`

### Projects
- `GET /projects`
- `POST /projects`
  - body: `{ name, type: "interior"|"exterior" }`
- `GET /projects/{projectId}`
- `DELETE /projects/{projectId}`

### Captures
- `POST /projects/{projectId}/captures:prepareUpload`
  - returns signed URL(s)
- `POST /projects/{projectId}/captures`
  - body: `{ files: [...], metadata: { device, intrinsics?, gps? } }`
- `GET /projects/{projectId}/captures`

### Scene build
- `POST /projects/{projectId}/scene:build`
  - starts processing job
- `GET /projects/{projectId}/scene`
  - returns scene status + artifacts pointers

### Versions
- `POST /projects/{projectId}/versions`
  - body: `{ baseVersionId?, operations: [...] }`
- `GET /projects/{projectId}/versions`
- `GET /projects/{projectId}/versions/{versionId}`

### Snippets
- `POST /projects/{projectId}/snippets`
  - body: `{ versionId, camera: { pose?, fov?, crop? }, lightingPresetId, label }`
- `GET /projects/{projectId}/snippets`

### Exports
- `POST /projects/{projectId}/exports`
  - body: `{ versionId, snippetIds?, type: "before_after"|"snippets", quality: "standard"|"high" }`
- `GET /projects/{projectId}/exports/{exportId}`

## Operation format (suggested)
Store edits as operations so they are replayable and versionable.
Examples:
- `apply_material` -> target surface mask + material params + scale/rotation
- `paint` -> color + target mask + blending params
- `place_object` -> assetId + transform + occlusion/shadow params
- `set_lighting` -> preset + intensity + temp

## Status model
All heavy tasks return:
- `status`: `queued|running|succeeded|failed`
- `progress`: 0..1
- `error`: optional
