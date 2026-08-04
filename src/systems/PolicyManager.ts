import { GameState } from '../core/GameState';
import { PolicySettings, EVENTS } from '../core/Constants';
import { POLICY_DATA } from '../core/policy';
import { EventBus } from '../core/EventBus';

export class PolicyManager {
  public static setPolicyValue(policyKey: keyof PolicySettings, value: number): void {
    const clamped = Math.max(0, Math.min(100, value));
    GameState.policies[policyKey] = clamped;
    EventBus.emit(EVENTS.POLICY_CHANGED, GameState.policies);
    GameState.emitChange();
  }

  public static getMonthlyPolicyUpkeep(): number {
    const p = GameState.policies;
    const upkeep =
      (POLICY_DATA.GREEN_ENERGY_MANDATE.effects.upkeepPctOfTreasury || 0) * 500 * (p.greenEnergyMandate / 100) +
      (POLICY_DATA.INDUSTRIAL_SUBSIDIES.effects.upkeepPctOfTreasury || 0) * 500 * (p.industrialSubsidies / 100) +
      (POLICY_DATA.PUBLIC_TRANSIT_FUNDING.effects.upkeepPctOfTreasury || 0) * 500 * (p.publicTransitFunding / 100);
    return Math.round(upkeep);
  }

  public static applyMonthlyPolicyEffects(): void {
    const p = GameState.policies;
    const taxEffects = POLICY_DATA.TAX_RATE.effects;

    // Tax rate direct impact on residents approval and treasury
    const taxSteps = p.taxRate / (POLICY_DATA.TAX_RATE.step || 10);
    const taxApprovalHit = taxSteps * (taxEffects.approvalPerStep || -2);
    GameState.updateFaction('residents', taxApprovalHit);
  }
}
