# Tasks: Grid-Builder → Policy Sim Pivot

Actionable checklist derived from `plan-v2.md`. Grouped by phase, and
within each phase by action type (DELETE / KEEP / MODIFY / NEW). Work
phases in order — each one should leave the game in a working, bootable
state before moving to the next.

---

## Phase 0 — Design docs (no code)

- [x] **NEW** `policy.md` — already done, lives in `docs/policy.md`
- [x] **NEW** `plan-v2.md` — already done, lives in `docs/plan-v2.md`

---

## Phase 1 — Policy data

- [x] **NEW** `src/core/policy.ts` — central `POLICY_DATA` object
      (tax rate, green energy mandate, industrial subsidies, public
      transit funding), translated from `policy.md`

---

## Phase 2 — Strip grid interaction (confirm game still boots)

- [x] **MODIFY** `src/scenes/GameScene.ts` — remove:
  - `handlePointerMove`
  - `handlePointerDown`
  - `reconstructCityFromState`
  - `spawnAmbientCommuter`
  - `updateBuildingStatuses`
- [x] Checkpoint: game boots, empty/static map, HUD still renders

---

## Phase 3 — Core sim math (the "does it feel like Democracy" phase)

- [x] **MODIFY** `src/systems/EconomyManager.ts`:
  - Replace grid-sum-derived population/jobs/pollution with
    policy-driven formulas reading from `policy.ts`
  - Starting values: Treasury $500, Population 100, Approval 50%,
    Pollution 0%, Utilities Balance 50%
  - Pollution → approval penalty (scales with pollution %)
  - Utilities Balance → treasury & approval, asymmetric around 50%
    (shortage hurts both; oversupply helps approval only)
  - Population growth = `(approval - 50)` as a direct %, applied each turn
  - Population reaches 0 → trigger game over
- [x] **MODIFY** `src/core/GameState.ts`:
  - `FactionApproval` interface shrinks to `{ residents: number }`
  - Remove `happiness` field
- [x] **MODIFY** `src/systems/PolicyManager.ts`:
  - `recalculateFactionImpact()` — fewer branches, single `residents`
    faction; only Tax Rate applies approval directly, other 3 policies
    flow through pollution/utilities → approval
  - Read effect values from `POLICY_DATA` (`policy.ts`) instead of
    inline numbers
- [x] **NEW** population-0 game-over check (wherever turn resolution
      lives — likely `EventManager.advanceMonth()` or `EconomyManager`)

---

## Phase 4 — Visual layer (cosmetic, do after sim math feels right)

- [x] **NEW** development-threshold table — defines what population/
      pollution/approval values make each building type spawn/despawn
      (Residential House, Industrial Factory, Coal Power Plant, Green
      Energy Station, Public Park)
- [x] **NEW** visual-render step — either `src/systems/CityVisualManager.ts`
      or a method folded into `GameScene.ts`; takes population/pollution/
      approval from `GameState`, scatters building sprites procedurally with
      randomized cell offsets, and applies a simple pollution tint/overlay.
- [x] **MODIFY** `src/core/Constants.ts` — `BuildingTypeConfig` shrinks to
      `textureKey` + threshold value; drop `cost` / `population` / `jobs`
      / `utilitySupply` / `utilityDemand`

---

## Phase 5 — Delete grid/placement layer

- [x] **DELETE** `src/systems/GridManager.ts` — entire file
- [x] **DELETE** `src/objects/Building.ts` — entire file
- [x] **DELETE** `src/objects/Citizen.ts` — entire file
- [x] **MODIFY** `src/systems/SaveManager.ts` — drop `gridData` field
      from `SavePayload`

---

## Phase 6 — UI cleanup

- [x] **MODIFY** `src/ui/HtmlUI.ts`:
  - Remove building-select toolbar wiring in `createToolbar`
  - Remove building buttons (Residential House, Industrial Factory,
    Coal Power Plant, Green Energy Station, Public Park) and Demolish
    button
  - Remove `Policies` button (panel is now always visible, not a modal)
  - Keep: HUD, event modal, game-over modal, Save/Reset
  - Remove Happiness from HUD display
- [x] **NEW** persistent policy side panel (replaces `createPolicyModal`
      as an always-visible panel) — tax rate slider + 3 toggles
- [x] **NEW** grid layout/tilt — shrink grid, center it, isometric/tilted
      look via CSS transform or Phaser camera angle

---

## Phase 7 — Verify

- [x] Run `npx tsc --noEmit` — repeat after each phase above, not just
      at the end, to catch type errors from deletions early
- [x] Manual check: policies adjustable in side panel → turn advances →
      stats update → visual re-renders → 12-turn campaign ends →
      game-over screen shows (either from population 0 or month 12)

---

## Not in this pass (explicitly deferred, see `plan-v2.md`)

- Environmentalist / Tycoon / Labor factions
- Fail states beyond population reaching 0
- New policies beyond the existing 4
