# AGENTS.md

## Repository Overview
- **Type**: Browser-based 2D city builder game ("Be the Mayor").
<<<<<<< HEAD
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
=======
- **Stack**: Vanilla HTML5, JavaScript (ES6+), and [Phaser.js 3.87.0](https://rexrainbow.github.io/phaser3-rex-notes/) loaded via CDN.
- **Entrypoints**: 
  - `index.html`: Main HTML container with Phaser canvas mount point and UI controls.
  - `game.js`: Core game logic, containing Phaser scenes (`MainMenuScene`, `GameScene`), simulation loop, zoning, and building definitions.

## Development & Running
- **Running Locally**: Since there is no bundler or package manager (no `package.json`), run via any static file server (e.g., Python `http.server`, VS Code Live Server, or `npx serve`).
- **Testing / Linting**: There is no automated test suite, build step, linter, or typechecker configured in this repository. Verification is manual via browser inspection.

## Architecture Notes
- **Phaser 3 Scenes**: Handled entirely in `game.js` starting with `MainMenuScene` transitioning into `GameScene`.
- **Assets**: Stored in `assets/` using `.avif` format (e.g., `house1.avif`, `factory.avif`, `park.avif`, `powerplant.avif`, `tower.avif`, `background.avif`).
- **Persistence**: Game state utilizes browser `localStorage` under key `'cityBuilderSave'`.
- **UI Interaction**: DOM elements outside the canvas (e.g., `#ui-container`, `#building-select`, Save/Reset buttons) interact with the Phaser game loop.
>>>>>>> 8fba97b3ee5f5acbd1be3e6e908a139b08db85f8
