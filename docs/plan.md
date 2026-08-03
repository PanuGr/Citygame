# Refactor & Redesign "Be the Mayor" City Strategy Game

Transform the current static `game.js` script into a dynamic, engaging city strategy simulation combining mechanics inspired by **Cities Skylines**, **Europa Universalis IV (EU4)**, and **Democracy**, built on a modern **Phaser 3 + TypeScript + Vite** architecture.

---

## User Review Required

> [!IMPORTANT]
> **Architecture Migration to Vite + TypeScript**: We will move from the legacy single-file `game.js` setup to the standard Phaser 3 modular Vite + TypeScript architecture (`src/core/`, `src/scenes/`, `src/systems/`, `src/objects/`, `src/ui/`).
> This guarantees clean code separation, easy extensibility, smooth performance, and adherence to repository guidelines (`AGENTS.md`).

> [!TIP]
> **Key Gameplay Enhancements**:
> 1. **Cities Skylines Visual Dynamics**: Zoning, dynamic citizen/vehicle sprites moving across the city grid, visual building upgrade levels, smoke/sparkle particles, and hover grid feedback.
> 2. **EU4-Style Event System**: 12-month campaign clock with time controls (Pause / 1x / 2x speed), monthly event popups with strategic decision choices and active modifiers (e.g., Heatwaves, Tax Rallies, Tech Boom) instead of disruptive `alert()` dialogs.
> 3. **Democracy Policy & Faction Approval**: Interconnected policy sliders (Tax Rate, Green Regulations, Public Transit, Industrial Subsidies) influencing 4 key factions (Environmentalists, Business Tycoons, Workers, Residents) and overall Mayor Approval.

---

## Open Questions

1. **Save Data Migration**: Should we wipe legacy localStorage save files or include a soft fallback reset if old save schema is incompatible? *(Recommended: Soft fallback reset with notice)*.

---

## Proposed Strategy & Design Architecture

### 1. Cities Skylines Inspiration: Visual & Zoning Dynamics
- **Zoning & Placement**: Residential (Houses/Towers), Industrial (Factories), Green/Clean Utilities, Parks, Commercial/Service buildings.
- **Dynamic Growth & Levels**: Buildings auto-upgrade visually (Level 1 → Level 2 → Level 3) when city stats (happiness, utilities, low pollution) are favorable.
- **Ambient Life**: Micro citizen particles/sprites and vehicles commuting between Residential and Industrial/Park tiles, making the city feel alive.

### 2. EU4 Inspiration: Strategic Time Progression & Event Cards
- **12-Month Campaign Cycle**: Play through 1 in-game year (January to December). Top HUD shows current month and play/pause/speed controls.
- **Monthly Event Cards**: At the end of each month, draw an EU4-style event popup with multi-option choices (e.g., *Industrial Spill: [A] Fine Factory (+$500, +10 Env Approval, -10 Tycoon Approval), [B] Deregulate (+15 Tycoon Approval, +20 Pollution)*).
- **Persistent Modifiers**: Decisions grant multi-month modifiers (e.g., "+10% Tax Yield for 3 Months", "-5 Happiness for 2 Months").

### 3. Democracy Inspiration: Policy Matrix & Faction Approval
- **Policy Dashboard Modal**:
  - **Tax Rate**: Higher revenue vs lower Resident & Tycoon approval.
  - **Green Energy Mandate**: Lowers pollution, increases Environmentalist approval, costs upkeep.
  - **Industrial Subsidies**: Increases jobs & Tycoon approval, increases pollution.
  - **Public Transit Funding**: Increases Happiness & Worker approval, lowers traffic.
- **Faction Approval Ratings**: Environmentalists, Tycoons, Labor Union, Residents. Overall Mayor Approval rating determines win/lose at Year-End.

---

## Proposed Changes

### Configuration & Tooling
#### [NEW] [package.json](file:///c:/Users/ppana/Downloads/code/Citygame/package.json)
#### [NEW] [tsconfig.json](file:///c:/Users/ppana/Downloads/code/Citygame/tsconfig.json)
#### [NEW] [vite.config.ts](file:///c:/Users/ppana/Downloads/code/Citygame/vite.config.ts)

---

### Core Architecture (`src/core/`)
#### [NEW] [Constants.ts](file:///c:/Users/ppana/Downloads/code/Citygame/src/core/Constants.ts)
- Grid dimensions, tile sizes, building stats, level configs, policy definitions, event database, colors.
#### [NEW] [GameState.ts](file:///c:/Users/ppana/Downloads/code/Citygame/src/core/GameState.ts)
- Centralized state: Money, Population, Jobs, Utilities balance, Pollution, Happiness, Mayor Approval, Faction Ratings, Policy Settings, Current Month/Year, Speed, Active Modifiers, `reset()`.
#### [NEW] [EventBus.ts](file:///c:/Users/ppana/Downloads/code/Citygame/src/core/EventBus.ts)
- Decoupled Phaser EventEmitter singleton with typed event keys.

---

### Scenes (`src/game/scenes/` / `src/scenes/`)
#### [NEW] [Boot.ts](file:///c:/Users/ppana/Downloads/code/Citygame/src/scenes/Boot.ts)
- Minimal setup, loads initial preloader assets.
#### [NEW] [Preloader.ts](file:///c:/Users/ppana/Downloads/code/Citygame/src/scenes/Preloader.ts)
- Loads `.avif` building textures, generates particle textures & UI elements.
#### [NEW] [MainMenu.ts](file:///c:/Users/ppana/Downloads/code/Citygame/src/scenes/MainMenu.ts)
- Clean, stylish main menu with New Game, Continue, and Policy overview.
#### [NEW] [GameScene.ts](file:///c:/Users/ppana/Downloads/code/Citygame/src/scenes/GameScene.ts)
- Main gameplay scene: Grid rendering, placement preview indicator, citizen/vehicle particle manager, level up animations, HUD overlays.
#### [NEW] [GameOver.ts](file:///c:/Users/ppana/Downloads/code/Citygame/src/scenes/GameOver.ts)
- Campaign end summary card (Year-End Mayor Rating report, score, achievements, play again).

---

### Systems (`src/systems/`)
#### [NEW] [GridManager.ts](file:///c:/Users/ppana/Downloads/code/Citygame/src/systems/GridManager.ts)
- Grid data structure, cell occupancy, tile coordinate conversion, building placement, level upgrades, demolition.
#### [NEW] [EconomyManager.ts](file:///c:/Users/ppana/Downloads/code/Citygame/src/systems/EconomyManager.ts)
- Monthly tax income calculation, upkeep costs, job balance, utility supply/demand calculation, happiness formulas.
#### [NEW] [PolicyManager.ts](file:///c:/Users/ppana/Downloads/code/Citygame/src/systems/PolicyManager.ts)
- Policy updates, faction score calculation, policy modifier math.
#### [NEW] [EventManager.ts](file:///c:/Users/ppana/Downloads/code/Citygame/src/systems/EventManager.ts)
- Time tick progression (pause/1x/2x), monthly trigger checks, EU4 event selector, option application, modifier duration decay.
#### [NEW] [SaveManager.ts](file:///c:/Users/ppana/Downloads/code/Citygame/src/systems/SaveManager.ts)
- Safe LocalStorage persistence with version validation.

---

### Entities & Objects (`src/objects/`)
#### [NEW] [Building.ts](file:///c:/Users/ppana/Downloads/code/Citygame/src/objects/Building.ts)
- Interactive building sprite with level badge, status indicators (unpowered, high pollution), floating income text.
#### [NEW] [Citizen.ts](file:///c:/Users/ppana/Downloads/code/Citygame/src/objects/Citizen.ts)
- Visual citizen/vehicle sprites commuting across grid roads/tiles.

---

### UI Components (`src/ui/`)
#### [NEW] [HtmlUI.ts](file:///c:/Users/ppana/Downloads/code/Citygame/src/ui/HtmlUI.ts)
- Modern bottom toolbar (Building selection cards, Demolish, Policy Button, Save/Reset).
- Policy Modal Dialog (Democracy sliders & faction approval charts).
- EU4 Event Modal Dialog (Event title, description, image, choice buttons with stat previews).
- Top Header HUD (Month counter, Speed controls, Money, Approval, Happiness, Utilities, Pollution).

---

### Clean Up Legacy Code
#### [DELETE] [game.js](file:///c:/Users/ppana/Downloads/code/Citygame/game.js)
#### [MODIFY] [index.html](file:///c:/Users/ppana/Downloads/code/Citygame/index.html)
#### [MODIFY] [style.css](file:///c:/Users/ppana/Downloads/code/Citygame/style.css)

---

## Verification Plan

### Automated Tests / Code Compilation
- Run `npx tsc --noEmit` to verify type safety across all systems and scenes.
- Run `npm run build` to verify Vite bundling compiles cleanly without warnings or errors.

### Manual Verification & Playtesting
- **Launch Game**: Run `npm start` to test in Vite dev server.
- **Cities Skylines Dynamics**: Place houses, factories, clean power plants, and parks. Verify buildings show placement feedback, display upgrade animations, and citizen/vehicle dots move visually between tiles.
- **EU4 Event System**: Fast-forward time (1x, 2x) through months. Verify event modals popup with option choices, modifier badges appear, and persistent effects apply correctly over time.
- **Democracy Policy Matrix**: Open Policy Modal, change Tax Rate and Green Energy sliders. Verify Faction approval ratings (Tycoons, Environmentalists, Workers, Residents) shift and affect overall Mayor Approval.
- **Campaign Loop**: Complete the 12-month campaign year, verify Mayor Report card screen opens with summary score and clean restart button.
