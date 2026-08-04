# Policies

Human-editable reference for policy effects. Mirrors `src/core/policy.ts`
— when you change a number here, update `policy.ts` to match (and vice
versa). This file is for sketching/balancing by hand; `policy.ts` is what
the game actually reads.

**Faction note:** v1 has one faction, Residents.

**Approval model — all effects are % of current value, not flat.** Every
stat effect below scales with the city's current value (e.g. pollution
change is a % of current pollution, not a fixed number), so policies stay
meaningful as the city grows instead of becoming trivial or overwhelming.

**Approval is mostly emergent, not directly set by policy.** Only Tax
Rate touches approval directly (a tax hike is felt immediately, not via
some downstream stat). Every other policy affects approval *only* through
the two channels the game already tracks:
- **Pollution** — high pollution hurts approval
- **Utilities Balance** — a shortfall hurts approval

So a policy that cuts pollution or boosts utilities earns approval
indirectly, through those existing channels, rather than having its own
separate approval bonus. This avoids double-counting the same underlying
cause twice.

Values below are starting points, not tuned. Adjust freely.

---

## Tax Rate
**Type:** slider, 0–100%, moves in 10% steps

| Effect | Direction | Notes |
|---|---|---|
| Treasury income | + | scales with rate |
| Residents approval | − | flat penalty per 10% step, same size each step (not accelerating) |

The only policy with a *direct* approval effect — a tax hike is felt
immediately, not through pollution or utilities.

---

## Green Energy Mandate
**Type:** toggle

| Effect | Direction | Notes |
|---|---|---|
| Pollution | − % | reduces pollution by a % of its current value |
| Electricity output (Utilities Balance) | + % | adds clean supply, % boost |
| Upkeep cost | − (cost) | % of treasury per turn, ongoing program cost |

No direct approval line. Approval improves *only* as a side effect of
lower pollution and better utilities balance — both already feed approval
elsewhere in the sim.

---

## Industrial Subsidies
**Type:** toggle

| Effect | Direction | Notes |
|---|---|---|
| Jobs / population growth | + % | |
| Pollution | + % | increases pollution by a % of its current value — mirrors Green Energy's reduction, opposite direction |

No direct approval line. Approval drops *only* as a side effect of
rising pollution — same channel as Green Energy, opposite direction.

---

## Public Transit Funding
**Type:** toggle

| Effect | Direction | Notes |
|---|---|---|
| Pollution | − % | transit cuts emissions, same mechanism as Green Energy |
| Upkeep cost | − (cost) | % of treasury per turn, ongoing program cost |

No direct approval line. Approval improves only via the pollution
reduction — no separate utilities or happiness stat touched, since
transit doesn't obviously affect electricity or industrial output.

---

## Adding a new policy later

1. Add a row/section here first — name, type, effects, direction.
2. Decide: does it touch approval directly (like Tax Rate), or only
   indirectly through pollution/utilities (like the other three)? Prefer
   indirect unless there's a clear reason the effect should be felt
   immediately.
3. Add the matching entry to `POLICY_DATA` in `policy.ts`.
4. If it should count toward the development-threshold table (what makes
   buildings spawn/despawn), note that here too.
5. If/when more factions get added, decide per-faction reactions to the
   same pollution/utilities/approval channels — not before.