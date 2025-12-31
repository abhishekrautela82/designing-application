# Key Decisions (to finalize before build)

1) Rendering target
- Preview: on-device (fast)
- High-res export: server-side render (photoreal)

2) Scene understanding strategy
- Phase 1: single-photo segmentation + optional depth estimation
- Phase 3: multi-photo guided capture to improve camera pose + geometry

3) 3D mode limitations (recommended)
- Limit camera movement to avoid artifacts; use suggested viewpoints.
- Use proxy geometry for occlusion/shadows.

4) Asset pipeline
- Use a small curated library for MVP.
- Expand via downloadable packs.

5) Privacy
- Default private
- Explicit opt-in if using images to improve models.
