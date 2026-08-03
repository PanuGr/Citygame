import { GameState } from '../core/GameState';
import { PolicySettings, EVENTS } from '../core/Constants';
import { POLICY_DATA } from '../core/policy';
import { EventBus } from '../core/EventBus';

export class PolicyManager {
  public static setTaxRate(rate: number): void {
    const clamped = Math.max(0, Math.min(100, rate));
    GameState.policies.taxRate = clamped;
    PolicyManager.recalculateFactionImpact();
    EventBus.emit(EVENTS.POLICY_CHANGED, GameState.policies);
    GameState.emitChange();
  }

  public static togglePolicy(policyKey: keyof Omit<PolicySettings, 'taxRate'>): void {
    GameState.policies[policyKey] = !GameState.policies[policyKey];
    PolicyManager.recalculateFactionImpact();
    EventBus.emit(EVENTS.POLICY_CHANGED, GameState.policies);
    GameState.emitChange();
  }

  public static getMonthlyPolicyUpkeep(): number {
    let cost = 0;
    const treasury = GameState.money;
    if (GameState.policies.greenEnergyMandate) {
      cost += Math.abs(POLICY_DATA.GREEN_ENERGY_MANDATE.effects.upkeepPctOfTreasury || 0.02) * 500;
    }
    if (GameState.policies.industrialSubsidies) {
      cost += 30;
    }
    if (GameState.policies.publicTransitFunding) {
      cost += Math.abs(POLICY_DATA.PUBLIC_TRANSIT_FUNDING.effects.upkeepPctOfTreasury || 0.015) * 500;
    }
    return Math.round(cost);
  }

  public static applyMonthlyPolicyEffects(): void {
    const p = GameState.policies;
    const taxEffects = POLICY_DATA.TAX_RATE.effects;

    // Tax rate direct impact on residents approval and treasury
    const taxSteps = p.taxRate / (POLICY_DATA.TAX_RATE.step || 10);
    const taxApprovalHit = taxSteps * (taxEffects.approvalPerStep || -2);
    GameState.updateFaction('residents', taxApprovalHit);

    // Other policies affect stats via EconomyManager, but we can nudge approval or apply indirect effects here if needed
  }

  public static recalculateFactionImpact(): void {
    // Helper method called when policies change
  }
}
