# Plan v2: "Be the Mayor" — Policy Sim with Auto-Evolving City

Pivot from grid-placement city builder to Democracy-style policy management.
City map becomes a passive visual layer, not an interaction surface.

## Core Loop

- **Turn-based**, not real-time. 1 turn = 1 month. Player advances manually
  ("Next Month" button). Real-time tick interval is removed completely.
- Each turn:
  1. Player may adjust policies (already in `PolicyManager`: tax rate,
     green energy mandate, industrial subsidies, public transit funding)
     before advancing.
  2. Turn resolves (`EventManager.advanceMonth()` → policy effects →
     economy recalculation → new state: approval, budget, pollution,
     population).
  3. City visual re-renders based on new state — more/bigger buildings as
     population grows, procedural offset within grid cells, and a simple
     tint/overlay representing pollution levels.
- **Campaign length**: fixed 12 turns (1 year) — already modeled via
  `MONTH_NAMES` / month-year state — then `GameOver` summary screen.
- **Fail state**: population reaches 0 triggers game over. Sandbox/score-only otherwise.

---
## Factions — Residents only

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

---
## Starting values & core formulas

City starts at:

| Stat | Starting value |
|---|---|
| Treasury | $500 |
| Population | 100 |
| Mayor Approval | 50% |
| Pollution | 20% (range 0–100%) |
| Utilities Balance | 50% (range 0–100%) |

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