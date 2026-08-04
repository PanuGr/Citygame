# Task List — Adjudgment Review

## 1. Tilted/3D map feel
Currently flat top-down (`GameScene.ts` places `grass_tile` in plain grid, no
transform). Option:
- True isometric grid math (convert grid x/y to iso screen coords) — bigger
  lift, redoes `renderCityVisuals()` positioning, but reads as more "3D."
