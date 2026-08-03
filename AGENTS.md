# AGENTS.md

## Repository Overview
- **Type**: Browser-based 2D city builder game ("Be the Mayor").
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
