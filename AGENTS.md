# AGENTS.md
## Before writing any code
Stop at the first rung that holds:
1. Does this need to be built at all? (YAGNI)
2. Does the Phaser library already do this? Use it.
3. Does a native platform feature cover it? Use it.
4. Does an already-installed dependency solve it? Use it.
5. Can this be one line? Make it one line.
6. Only then: write the minimum code that works.

## Rules:
- Semantic HTML5 always
- No class constructors in JavaScript — clean, named functions only
- TypeScript only where necessary; keep it minimal
- Centralize design tokens as CSS variables, not inline styles
- No abstractions that weren't explicitly requested.
- No new dependency if it can be avoided.
- No boilerplate nobody asked for.
- Deletion over addition. Boring over clever. Fewest files possible.
- Question complex requests: "Do you actually need X, or does Y cover it?"
- Pick the edge-case-correct option when two stdlib approaches are the same size, lazy means less code, not the flimsier algorithm.
- Mark intentional simplifications with a `ponytail:` comment. If the shortcut has a known ceiling (global lock, O(n²) scan, naive heuristic), the comment names the ceiling and the upgrade path.

**Not lazy about**: input validation at trust boundaries, error handling that prevents data loss, security, accessibility, the calibration real hardware needs (the platform is never the spec ideal, a clock drifts, a sensor reads off), anything explicitly requested. Lazy code without its check is unfinished: non-trivial logic leaves ONE runnable check behind, the smallest thing that fails if the logic breaks (an assert-based demo/self-check or one small test file; no frameworks, no fixtures). Trivial one-liners need no test.

## Repository Overview
- **Type**: Browser-based 2D city builder game ("Be the Mayor").
- **Stack**: HTML5, TypeScript, Vite, and Phaser 3.87+ (template-vite-ts).
- **Entrypoints**: 
  - `index.html`: Main HTML container with `#phaser-game` canvas mount point and UI controls.
  - `src/main.ts`: Application bootstrap connecting HTML UI and Phaser game engine.
  - `src/game/main.ts`: Game configuration and scene registry.

## Development & Running
- **Running Locally**: `npm start` or `npm run dev-nolog` (runs Vite dev server).
- **Building**: `npm run build` or `npm run build-nolog`.

## Architecture Notes
- **Phaser 3 Scenes**: Modular architecture under `src/game/scenes/` (`Boot.ts` -> `Preloader.ts` -> `MainMenu.ts` -> `GameScene.ts`).
- **Core State & Config**: Centralized singleton in `GameState.ts` and configuration constants in `Constants.ts`.
- **Subsystems**:
  - `src/game/systems/GridManager.ts`: Grid positioning and coordinate logic.
  - `src/game/systems/EconomyManager.ts`: Stats calculation, unemployment, and happiness recalculation.
  - `src/game/systems/EventManager.ts`: City events and building abandonment/destruction logic.
  - `src/game/systems/SaveManager.ts`: LocalStorage persistence (`'cityBuilderSave'`).
  - `src/game/ui/HtmlUI.ts`: HTML DOM interaction (dropdown population, save/reset buttons).
- **Assets**: Stored in `public/assets/` using `.avif` format (`house1.avif`, `factory.avif`, `park.avif`, `powerplant.avif`, `tower.avif`, `background.avif`).
