# UX / Screens (Hybrid workflow)

## Navigation model
- Bottom tabs:
  - Projects
  - Capture
  - Editor
  - Exports
  - Profile

## Screen list (MVP)

### 1) Auth
- Login (email/phone)
- Verify OTP / password
- Create account

### 2) Projects
- Project list (Interior / Exterior tags)
- Create project (type + name)
- Project detail:
  - Captures timeline
  - Versions list
  - Snippets gallery

### 3) Capture
- Choose: Camera / Upload
- Guided capture overlay:
  - keep level indicator
  - prompts: move left/right, step back
  - lighting warning (too dark/overexposed)
- Capture review:
  - select best frame
  - add notes (optional)

### 4) Editor (default = 2D Photo)
- Modes:
  - Surfaces (paint/material)
  - Objects (add/move/scale)
  - Lighting
  - Erase/Refine mask
- Version controls:
  - save version
  - duplicate version
  - revert
- Before/after toggle

### 5) 3D / AR Mode (Hybrid)
Triggered from Editor: “Create 3D Scene / Better Angles”.
- Scene build progress (background job)
- Once ready:
  - orbit camera (within safe limits)
  - snap camera to suggested viewpoints
  - place objects in 3D (snapping to detected planes)
  - lighting presets with more realism
- Save Snippet (camera pose + lighting + version)

### 6) Exports
- Export options:
  - Before/After
  - Selected snippets
  - All snippets
- Quality:
  - Standard
  - High-res (pro)

### 7) Profile
- Account
- Subscription
- Privacy / delete account

## Key UX details (quality bar)
- Mask refinement must be easy: brush + edge-aware “refine”
- Asset placement must snap and feel stable
- Version history must be visible and safe (undo confidence)
- Export should show ETA if server-side rendering is used
