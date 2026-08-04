# Task List — Adjudgment Review

## 1. Uniform effect formula — replaces #5 and #7 magic numbers
Single rule, no per-policy/per-event tuning needed:
 
**Policies (sliders, 0–100%):**
```
effectPct = (sliderValue / 100) * 50
```
Slider at 100% → stat moves 50%. Slider at 50% → stat moves 25%. Applies
uniformly to every effect a policy touches (Industrial Subsidies at 100%
→ pollution +50% AND its growth/money effect +50%, same formula both).
Replaces the fixed numbers currently in `policy.ts` (`pollutionPct: -0.30`
etc.) — those hardcoded values go away entirely, formula derives them from
slider position instead.
 
**Events (fixed tiers, not sliders):**
- Small/routine events: flat ±10% effect on whichever stat the option
  touches (treasury, pollution).
- Crisis-tier events (bigger stakes — e.g. Chemical Spill, Smog Alert):
  flat ±20%.
- Residents approval stays flat points either way (per #7 — approval is
  already 0–100 direct scale, doesn't need % framing).
- Need to tag each `CityEvent` in `EVENT_DATABASE` with a tier
  (`small` | `crisis`) so `EventManager`/`EconomyManager` knows which flat
  rate to apply — replaces the individual `moneyChange`/`pollutionChange`
  numbers per option.
Implementation notes:
- `policy.ts`: drop the `effects` magnitude fields, keep only which stats
  each policy targets (direction, not amount) — magnitude is now always
  computed by the formula above.
- `EconomyManager.recalculateStats()`: replace all `p.policyX ? ... : ...`
  boolean/fixed-number branches with the slider formula.
- `Constants.ts` `CityEvent`: add `tier: 'small' | 'crisis'` field; options
  keep only *which* stat + direction (+/-), not a magnitude — magnitude
  comes from tier.
- `city_stats.xlsx`: Policies tab "Effect Detail" column becomes formula
  description, not fixed %. Events tab gets a Tier column, Money/Pollution
  columns become fixed ±10%/±20% per tier instead of per-event values.
- This supersedes the fixed % values written into #5 and #7 above — those
  described the mechanism (percentage-based) but this task fixes the exact
  numbers.
## 2. Remove Jobs tracking entirely
`GameState.jobs` is computed every turn (`EconomyManager.jobsRate` logic)
but never read anywhere — not in HUD, not in game-over grade, not in any
other formula. Pure dead stat. Remove:
- `GameState.ts`: drop `jobs` field.
- `EconomyManager.recalculateStats()`: delete `jobsRate` block and
  `GameState.jobs = ...` line.
- `Constants.ts` `BuildingTypeConfig`/`BUILDINGS`: `jobs` field on each
  building becomes unused too — drop it (buildings are cosmetic only, per
  this conversation, so no other stat should read population/jobs from
  building data anyway).
- `policy.ts` / `PolicyManager`: Industrial Subsidies' `jobsGrowthPct`
  effect has nothing left to modify. Replace with a real effect (e.g. fold
  into pollution scaling harder, or give it a direct population-growth
  bonus) — needs a decision, can't just delete the policy's only upside.
- `city_stats.xlsx` Starting Stats tab: remove the `Jobs` row.
- `policy.md` / Google Sheet Policies tab: update Industrial Subsidies
  effect description once its replacement effect is decided.