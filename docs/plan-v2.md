# Plan v2: "Be the Mayor" — Policy Sim with Auto-Evolving City

Pivot from grid-placement city builder to Democracy-style policy management.
City map becomes a passive visual layer, not an interaction surface.

## Why the pivot

Tracking per-building stats/levels via manual grid placement turned out to
not be the fun part. The Democracy-style feedback loop (policy → stats →
consequence) is. Cutting manual placement removes the most expensive
subsystem (`GridManager`, placement UI, per-cell save/render data) rather
than adding one — and most of the Democracy-style engine already exists.

---

## Core Loop

- **Turn-based**, not real-time. 1 turn = 1 month. Player advances manually
  ("Next Month" button). No timer, no pause/speed controls needed.
- Each turn:
  1. Player may adjust policies (already in `PolicyManager`: tax rate,
     green energy mandate, industrial subsidies, public transit funding)
     before advancing.
  2. Turn resolves (`EventManager.advanceMonth()` → policy effects →
     economy recalculation → new state: approval, budget, pollution,
     population).
  3. City visual re-renders based on new state — more/bigger buildings as
     population grows, smog overlay as pollution rises.
- **Campaign length**: fixed 12 turns (1 year) — already modeled via
  `MONTH_NAMES` / month-year state — then `GameOver` summary screen.
- **No fail state in v1.** Sandbox/score-only. Fail state is a later
  feature, added only after policy/stat math is balanced through
  playtesting.

---

## What already fits, keep as-is

- `PolicyManager.ts` — `setTaxRate`, `togglePolicy`,
  `applyMonthlyPolicyEffects`, `recalculateFactionImpact`. This *is* the
  Democracy engine. No rewrite needed structurally, but faction math
  simplifies — see "Factions" below.
- `GameState.ts` — `overallApproval` getter, `PolicySettings` — right
  shape for this direction. `FactionApproval` interface shrinks to a
  single `residents` field (see below).
- `EventManager.ts` — `advanceMonth`, `selectMonthlyEvent`,
  `resolveEventChoice` — EU4-style event cards, keep whole.
- `EconomyManager.ts` — keep the file and its role (monthly financial
  resolution), but its internals need to change (see below).
- `SaveManager.ts` — keep, but drop `gridData` from `SavePayload`.
- `HtmlUI.ts` — keep HUD, policy modal, event modal, game-over modal. Drop
  the building-placement toolbar.
- `Constants.ts` — keep `PolicySettings`, `ChoiceOption`, `CityEvent`.
  `BuildingTypeConfig` shrinks (see below).

---

## What gets deleted

Grid/placement layer — the part being cut:

- [x] `src/systems/GridManager.ts` — placement/demolition logic, entire file
- [x] `src/objects/Building.ts` — per-tile sprite with status badges, entire file
- [x] `src/objects/Citizen.ts` — commuter sprites, entire file
- [x] In `GameScene.ts`: `handlePointerMove`, `handlePointerDown`,
  `reconstructCityFromState`, `spawnAmbientCommuter`,
  `updateBuildingStatuses`
- In `HtmlUI.ts`: building-select toolbar wiring inside `createToolbar`
- **Building buttons + Demolish button** (Residential House, Industrial
  Factory, Coal Power Plant, Green Energy Station, Public Park, Demolish)
  — buildings now spawn/despawn automatically based on city state, no
  manual placement or removal at all
- `gridData` field from `SaveManager`'s `SavePayload`

### Development threshold (new concept, needs defining)

Buildings appearing/disappearing automatically means each building type
needs a **threshold** — a population/pollution/approval condition that
decides when it spawns or despawns on the visual grid. E.g. (illustrative,
not final numbers):

- Residential House: appears once population crosses N per house-slot
- Industrial Factory: appears once `industrialSubsidies` has been on for
  some turns, or population supports it
- Coal Power Plant / Green Energy Station: appears based on which
  utility policy is active
- Public Park: appears once approval/happiness crosses a threshold

This threshold table lives alongside the visual-render step (see
"What gets rewritten" below) — it decides *what shows up*, separate from
`policy.ts` which decides *what the underlying stats are*.

---

## Factions — start with Residents only

Cut the 4-faction split (Environmentalists / Tycoons / Labor / Residents)
down to **one faction: Residents.** `overallApproval` becomes just
residents' approval directly — no averaging across factions needed.

- `GameState.ts`: `FactionApproval` interface shrinks to
  `{ residents: number }`. `updateFaction()` still works, just with one
  key.
- `PolicyManager.recalculateFactionImpact()`: same function, fewer
  branches — only applies the `residents` effect from each policy. Given
  the emergent-approval model (see Policy data section below), most of
  this function's job becomes: apply Tax Rate's direct approval hit, then
  let pollution/utilities changes (already applied by the other 3
  policies) flow into approval through the existing pollution/utilities
  → approval logic, rather than each policy carrying its own approval
  number.
- `policy.ts` / `policy.md`: every policy's `approval` effect becomes a
  single number (residents only), not a per-faction object. See updated
  shape below.
- **Env / Tycoon / Labor are deferred, not deleted from the plan** —
  same call as the original single-approval-number decision: add them
  back once Residents-only feedback loop feels good and more policies
  exist that would actually pull those groups in different directions.
  Right now with 4 policies and 1 faction there's nothing for extra
  factions to disagree about yet.

---

## What gets rewritten

**`GameScene.ts`** becomes thin: no pointer input, no per-tile
reconstruction. Just calls a new visual-render step each turn.

**New: city visual layer** (either a small `CityVisualManager.ts` in
`src/systems/`, or a method folded into `GameScene`) — takes
`population`, `pollution`, `approval` from `GameState` and scatters
house/factory/park sprites procedurally. No `GridManager` dependency, no
click-to-place, no per-cell state.

**`EconomyManager.ts` — the core data-model shift.** Right now population/
jobs/pollution are *derived from placed buildings* (`BuildingTypeConfig`
fields summed over the grid). In the Democracy direction they need to be
*derived from policy state directly*:

```ts
// EconomyManager, new shape (illustrative)
population += growthRate(approval, budget);           // per turn
pollution = basePollution
  + (industrialSubsidies ? INDUSTRIAL_POLLUTION : 0)
  - (greenEnergyMandate ? GREEN_ENERGY_REDUCTION : 0);
jobs = population * employmentRate(policySettings);
```

`BuildingTypeConfig` (in `Constants.ts`) loses `cost` / `population` /
`jobs` / `utilitySupply` / `utilityDemand` — those effects move onto
policy definitions instead. What's left of `BuildingTypeConfig` is purely
visual: `textureKey` and a population/pollution threshold that decides
when that building type starts appearing on the map.

---

## Starting values & core formulas

City starts at:

| Stat | Starting value |
|---|---|
| Treasury | $500 |
| Population | 100 |
| Mayor Approval | 50% |
| Pollution | 0% (range 0–100%) |
| Utilities Balance | 50% (range 0–100%+) |

**Happiness is removed** — redundant with Approval, same underlying
signal under two names.

### Pollution → approval
Penalty scales with the pollution % itself (0–100 = no penalty → max
penalty). Already covered by the emergent-approval model above.

### Utilities Balance → treasury & approval (asymmetric around 50%)
50% is neutral. Below and above 50% behave differently:

- **Shortage (< 50%)**: penalty scales with distance below 50. Reduces
  *both* treasury income and approval.
- **Oversupply (> 50%)**: bonus scales with distance above 50. Increases
  approval *only* — treasury is untouched by oversupply.

```
distance = utilitiesBalance - 50
if distance < 0:
  treasuryPenaltyPct = |distance| / 50   // scales toward max at 0%
  approvalPenaltyPct  = |distance| / 50
else:
  approvalBonusPct = distance / 50       // scales toward max at 100%+
```

### Population growth (tied to Approval, distance from 50)
Population change per turn is the *distance of approval from 50*,
expressed directly as a percentage — not a separately-tuned growth rate.

```
growthPct = (approval - 50)   // e.g. approval 55% -> +5%, 45% -> -5%
population += population * (growthPct / 100)
```

50% approval = flat population, no growth or decline. This is
self-correcting in practice: strong population growth strains utilities
and jobs, which pulls approval back toward 50, which slows growth again
— not a runaway exponential.

### Game over
No game-over condition exists yet elsewhere in the plan. Add one:
**population reaches 0 → game over.** This is the only fail state in v1;
everything else stays sandbox/score-only per the original decision.

---

## Layout shift

- **Grid**: shrinks, moves to center of the page, gets an isometric/tilted
  look (CSS transform on the canvas, or a Phaser camera angle — either is
  cheap, no new dependency). Purely visual, no interaction added.
- **Side panel** (new, persistent — not a modal): houses the 4 policy
  controls (tax rate slider + 3 toggles). Always visible, no open/close
  state to manage — simpler than the existing `createPolicyModal`.
- **Bottom toolbar**: building buttons and Demolish button removed
  entirely (see below). `Policies` button removed since the panel is now
  always on screen. `Save` / `Reset` remain.
- **Top HUD**: Treasury, Mayor Approval, Utilities Balance, Pollution,
  month/pause/speed stay. Happiness is removed (see Starting Values
  section) — drop it from the HUD display too.

---

## Policy data — `policy.ts` + `policy.md`

**`src/core/policy.ts`** — central data object, same flat-object pattern
already used for `BUILDING_DATA`/`POLICIES` in earlier iterations. One
file, one source of truth; `PolicyManager` reads effect values from here
instead of hardcoding them inline. This is the same pattern you already
chose for buildings — consistent, not a new idea.

```ts
// illustrative shape, not final numbers
// approval model: only TAX_RATE affects approval directly.
// GREEN_ENERGY / INDUSTRIAL_SUBSIDIES / PUBLIC_TRANSIT affect approval
// only indirectly, via pollution % and utilities % changes — approval
// already reacts to both of those elsewhere in the sim, so no separate
// approval field on those three (avoids double-counting the same cause).
export const POLICY_DATA = {
  TAX_RATE: {
    displayName: 'Tax Rate',
    type: 'slider',            // 0-100, steps of 10
    step: 10,
    effects: {
      treasuryPerStep: 10,     // income scales with rate
      approvalPerStep: -2      // flat penalty per 10% step, same each step
    }
  },
  GREEN_ENERGY_MANDATE: {
    displayName: 'Green Energy Mandate',
    type: 'toggle',
    effects: {
      pollutionPct: -0.30,     // -30% of current pollution
      utilitiesOutputPct: 0.20,// +20% electricity output
      upkeepPctOfTreasury: -0.02
    }
  },
  INDUSTRIAL_SUBSIDIES: {
    displayName: 'Industrial Subsidies',
    type: 'toggle',
    effects: {
      jobsGrowthPct: 0.15,
      pollutionPct: 0.25       // +25% of current pollution
    }
  },
  PUBLIC_TRANSIT_FUNDING: {
    displayName: 'Public Transit Funding',
    type: 'toggle',
    effects: {
      pollutionPct: -0.15,     // -15% of current pollution
      upkeepPctOfTreasury: -0.015
    }
  }
};
```

`PolicyManager.applyMonthlyPolicyEffects()` and
`recalculateFactionImpact()` read from `POLICY_DATA` instead of inline
numbers — logic stays where it is, only the numbers move out.
`applyMonthlyPolicyEffects()` applies percentage deltas against current
`pollutionLevel` / `utilitiesBalance` / `treasury`, not flat amounts —
same reasoning as the threshold table: stays meaningful as the city
scales instead of becoming trivial or overwhelming.

**`policy.md`** (new, project root or `src/core/`) — human-readable
mirror of `policy.ts`: policy name, type (toggle/slider), each effect and
its direction/magnitude, in a table. Purpose: a place to sketch/adjust
balancing by hand before touching code, and a running doc as more
policies get added later. Update both files together when a policy
changes — `policy.md` is documentation, `policy.ts` is the source of
truth the game actually reads.

---

## Order of work

1. Write `policy.md` first — sketch the 4 policies' effects in plain
   language/tables before touching any code. Cheap to change on paper.
2. Translate `policy.md` into `src/core/policy.ts`.
3. Strip `GameScene.ts` input handlers + grid reconstruction — confirm the
   game still boots with a static/empty map and existing HUD.
4. Rewrite `EconomyManager`'s growth formula to be policy-driven, reading
   from `policy.ts`, using the starting values and formulas above
   (population growth tied to approval distance from 50, asymmetric
   utilities effect, pollution-driven approval). This is the core "does
   it feel like Democracy" piece — do it first, iterate on numbers before
   anything else.
5. Add the population-0 game-over check.
6. Define the development-threshold table (what makes each building type
   spawn/despawn) and add the visual-render step. Cosmetic, done after
   the sim math feels right.
7. Delete `GridManager.ts`, `Building.ts`, `Citizen.ts`, building/Demolish
   buttons. Trim `SavePayload` and `HtmlUI` toolbar. Remove Happiness
   from state and HUD. Add the persistent policy side panel, apply the
   grid layout/tilt.
8. Re-run `npx tsc --noEmit` after each step to keep types consistent
   through the deletions.