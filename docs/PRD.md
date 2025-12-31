# Product Requirements (Android-first, Hybrid 2D + 3D)

## Goal
Build a commercial-grade interior + exterior design mobile application for Android where users:
- Register/login
- Create projects (Interior/Exterior)
- Capture or upload photos of spaces
- Design the space professionally using (a) photo-real 2D editing and (b) a 3D/AR scene for viewpoint snippets
- Save versions and snippets, export/share results

## Target users
- Homeowners planning renovations
- Interior designers / contractors creating concepts
- Real-estate / staging users needing fast visual upgrades

## Core value proposition
- Fast, high-quality “photo edits” from a single image
- Optional 3D/AR workflow for better angles, measurement, and professional presentation
- Outputs: before/after, materials list, and export-ready visuals

## Non-goals (initial)
- Full CAD-level modeling
- Structural engineering validation
- Real-time multiplayer editing (later)

## Key principles
- Instant feedback first (on-device preview) + high-quality export (cloud render when needed)
- Privacy-first: user images are sensitive
- Versioned, reversible edits (professional workflow)

## MVP scope (Phase 1)
### Authentication
- Email + OTP or password login (social optional)
- User profile + preferences

### Projects
- Create Project: Interior / Exterior
- Add Capture(s): photo(s) from camera or gallery

### 2D Photo Editor (default)
- Auto surface detection
  - Interior: wall/floor/ceiling + window/door masks
  - Exterior: facade/roof/ground/sky/vegetation masks
- Material/paint replacement with edge-aware masks
- Basic object placement
  - Interior: furniture props
  - Exterior: planters, paving, lighting props
- Lighting presets (simple relight/color grade)
- Save Design Versions

### Snippets + Export
- Save Snippet = camera view + lighting preset + design version
- Export: before/after, selected snippets

## Pro features (Phase 2)
- Measurement & scale calibration (single known distance; ARCore depth if supported)
- Better lighting: time-of-day, intensity, temperature; shadow grounding
- Materials list + (optional) rough cost estimate
- Asset library: favorites, recents, style packs

## Best-in-class (Phase 3)
- Guided multi-photo capture for improved geometry/occlusion
- Hybrid 3D scene:
  - Reconstruct coarse room/exterior geometry + camera poses
  - Place objects in 3D and re-project to 2D for photo-real exports
- Cloud high-quality rendering pipeline
- AR preview mode (place designed elements in live camera)

## Success metrics
- Activation: % users who create a project within first session
- Time-to-first-result: minutes to first exported before/after
- Export conversion: exports per active user
- Paid conversion: upgrades for high-res export / pro features

## Risks
- Photorealism quality expectations
- Device performance variability
- Cost of cloud processing
- Privacy / trust concerns
