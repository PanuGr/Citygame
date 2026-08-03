# AGENTS.md

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
