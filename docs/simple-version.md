# Refactor & Redesign "Be the Mayor" City Strategy Game

Transform the current static `game.js` script into a dynamic, engaging city strategy simulation combining mechanics inspired by **Cities Skylines**, **Europa Universalis IV (EU4)**, and **Democracy**, built on a modern **Phaser 3 + TypeScript + Vite** architecture.

---

## User Review Feedback Incorporated

> [!NOTE]
> **User Adjustments Incorporated**:
> 1. **Save Persistence**: Keep save data in `localStorage` under `'cityBuilderSave'`, with safe backwards-compatible parsing / soft migration.
> 2. **Building Levels**: Keep buildings to 1 level for this prototype to maintain gameplay clarity and focus.
> 3. **Campaign Scope**: Clean 12-month campaign loop. Each month presents interactive event choices, concluding at Month 12 with a full Year-End Mayor Report Card & Score Summary screen.

---

## Core Strategy & Design Architecture

### 1. Cities Skylines Inspiration: Visual & Zoning Dynamics
- **Zoning & Placement**: Residential (House), Industrial (Factory), Utilities (Dirty Power Plant & Green Energy Station), Parks.
- **Visual Feedback & Ambient Life**: Micro citizen particles/sprites and vehicles commuting between Residential and Industrial/Park tiles, building status badges (unpowered, polluted), smoke & sparkle effects, hover grid indicator.

### 2. EU4 Inspiration: Strategic Time Progression & Monthly Events
- **12-Month Campaign Cycle**: Play through 1 in-game year (January to December). Top HUD shows current month, timeline progress, and play/pause/speed controls.
- **Monthly Event Cards**: At the end of each month, draw an EU4-style event popup with strategic decision choices (e.g., *Industrial Spill: [A] Fine Factory (+$500, +10 Env Approval, -10 Tycoon Approval), [B] Deregulate (+15 Tycoon Approval, +20 Pollution)*).
- **Campaign Wrap-up**: After Month 12, the game triggers a Game Over summary screen showing overall Mayor Approval, final stats, and campaign score.

### 3. Democracy Inspiration: Policy Matrix & Faction Approval
- **Policy Dashboard Modal**:
  - **Tax Rate**: Revenue vs Resident & Tycoon approval.
  - **Green Energy Mandate**: Lowers pollution, increases Environmentalist approval, costs upkeep.
  - **Industrial Subsidies**: Increases jobs & Tycoon approval, increases pollution.
  - **Public Transit Funding**: Increases Happiness & Worker approval, lowers traffic.
- **Faction Approval Ratings**: Environmentalists, Business Tycoons, Labor Union, Residents. Overall Mayor Approval rating calculated dynamically.

---

## Proposed Changes

### Configuration & Tooling
#### [NEW] [package.json](file:///c:/Users/ppana/Downloads/code/Citygame/package.json)
#### [NEW] [tsconfig.json](file:///c:/Users/ppana/Downloads/code/Citygame/tsconfig.json)
#### [NEW] [vite.config.ts](file:///c:/Users/ppana/Downloads/code/Citygame/vite.config.ts)

---

### Core Architecture (`src/core/`)
#### [NEW] [Constants.ts](file:///c:/Users/ppana/Downloads/code/Citygame/src/core/Constants.ts)
- Grid dimensions, tile sizes, building stats (single level), policy definitions, event database, colors.
#### [NEW] [GameState.ts](file:///c:/Users/ppana/Downloads/code/Citygame/src/core/GameState.ts)
- Centralized state: Money, Population, Jobs, Utilities balance, Pollution, Happiness, Mayor Approval, Faction Ratings, Policy Settings, Current Month/Year, Speed, Active Modifiers, `reset()`.
#### [NEW] [EventBus.ts](file:///c:/Users/ppana/Downloads/code/Citygame/src/core/EventBus.ts)
- Decoupled Phaser EventEmitter singleton with typed event keys.

---

### Scenes (`src/scenes/`)
#### [NEW] [Boot.ts](file:///c:/Users/ppana/Downloads/code/Citygame/src/scenes/Boot.ts)
- Minimal setup, loads preloader.
#### [NEW] [Preloader.ts](file:///c:/Users/ppana/Downloads/code/Citygame/src/scenes/Preloader.ts)
- Loads `.avif` building textures, generates textures & UI assets.
#### [NEW] [MainMenu.ts](file:///c:/Users/ppana/Downloads/code/Citygame/src/scenes/MainMenu.ts)
- Main menu with New Game and Continue (from LocalStorage).
#### [NEW] [GameScene.ts](file:///c:/Users/ppana/Downloads/code/Citygame/src/scenes/GameScene.ts)
- Main gameplay scene: Grid rendering, placement preview, ambient citizen/vehicle commuting, smoke/sparkle particles, HUD overlays.
#### [NEW] [GameOver.ts](file:///c:/Users/ppana/Downloads/code/Citygame/src/scenes/GameOver.ts)
- 12-Month campaign end summary screen (Mayor Approval grade, city stats breakdown, final score, play again button).

---

### Subsystems (`src/systems/`)
#### [NEW] [GridManager.ts](file:///c:/Users/ppana/Downloads/code/Citygame/src/systems/GridManager.ts)
- Grid data structure, cell occupancy, tile coordinate conversion, building placement, demolition.
#### [NEW] [EconomyManager.ts](file:///c:/Users/ppana/Downloads/code/Citygame/src/systems/EconomyManager.ts)
- Monthly tax income calculation, upkeep costs, job balance, utility supply/demand, happiness formula.
#### [NEW] [PolicyManager.ts](file:///c:/Users/ppana/Downloads/code/Citygame/src/systems/PolicyManager.ts)
- Policy updates, faction score calculation, policy modifier math.
#### [NEW] [EventManager.ts](file:///c:/Users/ppana/Downloads/code/Citygame/src/systems/EventManager.ts)
- Time tick progression (pause/1x/2x speed), monthly trigger checks, EU4 event selector, option application.
#### [NEW] [SaveManager.ts](file:///c:/Users/ppana/Downloads/code/Citygame/src/systems/SaveManager.ts)
- Persistence in `localStorage` under key `'cityBuilderSave'`.

---

### Entities & Objects (`src/objects/`)
#### [NEW] [Building.ts](file:///c:/Users/ppana/Downloads/code/Citygame/src/objects/Building.ts)
- Interactive building sprite with status badges (unpowered, polluted) and floating particle effects.
#### [NEW] [Citizen.ts](file:///c:/Users/ppana/Downloads/code/Citygame/src/objects/Citizen.ts)
- Visual citizen/vehicle sprites commuting across grid tiles.

---

### UI Components (`src/ui/`)
#### [NEW] [HtmlUI.ts](file:///c:/Users/ppana/Downloads/code/Citygame/src/ui/HtmlUI.ts)
- Bottom toolbar (Building cards, Demolish, Policy Button, Save/Reset).
- Policy Modal Dialog (Democracy sliders & faction approval charts).
- EU4 Event Modal Dialog (Event card popup with choice options and stat previews).
- Top Header HUD (Month/Year timeline, Speed controls, Money, Approval, Happiness, Utilities, Pollution).

---

### Clean Up Legacy Code
#### [DELETE] [game.js](file:///c:/Users/ppana/Downloads/code/Citygame/game.js)
#### [MODIFY] [index.html](file:///c:/Users/ppana/Downloads/code/Citygame/index.html)
#### [MODIFY] [style.css](file:///c:/Users/ppana/Downloads/code/Citygame/style.css)

---

## Verification Plan

### Automated Tests & Compilation
- Run `npx tsc --noEmit` to verify type safety across all files.
- Run `npm run build` to verify Vite compilation.

### Manual Verification
- **Vite Dev Server**: Run `npm start` or `npm run dev-nolog`.
- **City Visuals**: Place buildings, verify citizen/vehicle commuters move dynamically across tiles, and particles work.
- **Time & Monthly Events**: Fast-forward time, test EU4 event cards at month ends, verify choices modify stats.
- **Democracy Policies**: Open policy panel, adjust sliders, verify faction approvals shift dynamically.
- **Save & Load**: Verify game saves to and loads from `localStorage` (`'cityBuilderSave'`).
- **12-Month Campaign Finish**: Complete Month 12 and verify the Game Over / Year-End Summary screen displays final Mayor rating.
