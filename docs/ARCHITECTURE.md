# Architecture (Android-first Hybrid 2D + 3D)

## High-level
- Android app performs capture, fast preview editing, and basic rendering.
- Backend stores media + project data and optionally performs heavy processing (segmentation refinement, multi-view reconstruction, high-quality render exports).

## Client components (Android)
- UI: Jetpack Compose
- Capture: CameraX
- Local compute:
  - TFLite for segmentation/depth estimation when feasible
  - GPU shaders for fast material projection and relighting
- 3D/AR:
  - ARCore for tracking + plane detection
  - Filament for PBR rendering in 3D mode
- Background: WorkManager
- Storage:
  - Encrypted local cache for captures and intermediate artifacts

## Backend components
- API service (REST/GraphQL; REST recommended initially)
- Auth (OIDC provider or Firebase/Auth0/Cognito)
- Storage: object store + CDN
- DB: Postgres
- Queue: jobs for processing and rendering

## Processing pipeline
- Ingest capture(s)
- Create Scene:
  - camera metadata normalization
  - segmentation masks
  - depth estimation
  - plane extraction (walls/floor/facade)
- Hybrid output:
  - 2D editor uses masks + depth to apply materials/objects
  - 3D mode uses planes/mesh + camera poses for viewpoint snippets
- Export:
  - on-device for standard
  - server for high-res photoreal

## Privacy + security
- Private projects by default
- Signed upload/download URLs
- Encryption at rest (storage + DB)
- Strict deletion semantics (delete project => purge media + derived artifacts)

## Performance notes
- Keep default 2D editor responsive on mid-tier devices
- Defer 3D scene building to background jobs with progress UI
- Use LOD (level-of-detail) for 3D assets
