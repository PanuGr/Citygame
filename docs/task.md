# Task List — Adjudgment Review

## 1. Tilted/3D map feel
Currently flat top-down (`GameScene.ts` places `grass_tile` in plain grid, no
transform). Options:
- CSS/Phaser camera trick: skew container via `transform: rotateX(...)`
  wrapping the canvas — cheap, no new deps, matches plan.md's suggestion
  ("CSS transform on the canvas, or a Phaser camera angle — either is cheap").
- True isometric grid math (convert grid x/y to iso screen coords) — bigger
  lift, redoes `renderCityVisuals()` positioning, but reads as more "3D."
Recommend: CSS transform route first, matches plan.md intent, smallest diff.

## 2. No save button / autosave missing
Confirmed: `SaveManager.saveGame()` is dead code, never invoked. Fix:
- Call `SaveManager.saveGame()` at end of `EconomyManager.processMonthlyEconomy()`
  or in `EventManager.checkEndMonthProgress()`, so every turn persists.
- Decide if manual "Save" button still needed given autosave — probably not,
  drop the idea of adding one, just wire autosave in. Keep Reset as clear-save.

## 3. Utilities target 100%, self-correcting
Change model: utilities balance always drifts toward 100 each turn, not held
at whatever policy sets it to. Needs:
- New `utilityBalance` catch-up logic in `EconomyManager.recalculateStats()`:
  each turn, current value moves a fraction of the way toward 100 (decide
  step size, e.g. 20% of the gap per turn).
- Effects (treasury/approval penalty on shortage, approval bonus on oversupply)
  still apply based on distance from 100 instead of distance from 50.
- Update `policy.md` "Utilities Balance" section: replace all "50% neutral"
  language with "100% neutral, self-correcting."
- Green Energy Mandate's `utilitiesOutputPct` still nudges supply, but no
  longer needed to "hold" balance — it's an assist toward the auto-correct.

## 4. Building icons on population decrease
Confirmed working as-is: `renderCityVisuals()` clears and fully rebuilds
`cityGroup` every `STATE_CHANGED` event, recalculating `buildingCount` from
current `population` — so icons do shrink in count when population drops.
No bug here. Optional polish (not required): fade-out animation instead of
instant clear/rebuild, but not a functional issue.

## 5. All policies → sliders, 0–100%, %-based framing
Currently: Tax is a slider, other 3 are toggles (`policy.ts` `type: 'toggle'`).
Change to sliders for all 4, 0–100 step 10, default 0 except Tax (stays 10).
- `Constants.ts` `PolicySettings`: `greenEnergyMandate`, `industrialSubsidies`,
  `publicTransitFunding` change from `boolean` to `number` (0–100).
- `policy.ts`: set `type: 'slider'`, `step: 10` on all four; effects scale
  by slider position (like Tax's `taxSteps` pattern) instead of on/off.
- `PolicyManager`: replace `togglePolicy()` with a generic `setPolicyValue()`
  used by all 4 sliders.
- `EconomyManager.recalculateStats()`: replace `if (p.greenEnergyMandate)`
  boolean checks with `(p.greenEnergyMandate / 100) * effectPct` scaling.
- `HtmlUI.ts`: replace 3 checkbox `toggle-option` blocks with slider markup
  matching tax slider's HTML/JS pattern.
- Effect display under each policy: keep descriptive text (what it moves —
  "Pollution", "Utilities", "Jobs") but drop the fixed numbers like
  "-30% Pollution" since magnitude now depends on slider position. E.g.
  "Pollution ↓ · Utilities ↑" — direction only, no baked-in %.
- Update `policy.md` table effect column to reflect scaling formula, not
  fixed toggle magnitude.

## 6. Remove multi-faction language from events
`Constants.ts` `EVENT_DATABASE`: every `approvalChanges` object still has
`env`, `tycoon`, `labor` keys (residents-only model per plan.md/GameState.ts).
Fix:
- Strip `env`/`tycoon`/`labor` from all 6 events' `approvalChanges`, keep
  only `residents`.
- Update `description` strings that reference "+15 Tycoon approval" etc. —
  rewrite copy to residents-only framing.
- `ChoiceOption.approvalChanges` interface: drop `env?`, `tycoon?`, `labor?`,
  keep `residents?` only.
- Re-balance each option's `residents` delta since some events currently
  have 0 residents effect and rely entirely on the deleted faction fields
  (e.g. `tycoon_gala` has no residents change at all today — needs one).
