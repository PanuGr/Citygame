import { GameState } from '../core/GameState';
import { PolicySettings, EVENTS } from '../core/Constants';
import { EventBus } from '../core/EventBus';

export class PolicyManager {
  public static setTaxRate(rate: number): void {
    const clamped = Math.max(0, Math.min(25, rate));
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
    if (GameState.policies.greenEnergyMandate) cost += 50;
    if (GameState.policies.industrialSubsidies) cost += 60;
    if (GameState.policies.publicTransitFunding) cost += 40;
    return cost;
  }

  public static applyMonthlyPolicyEffects(): void {
    const p = GameState.policies;

    // Faction shifts per month based on policies
    // Tax impact: default 10%. Higher tax hurts residents & tycoons, lower tax helps them.
    const taxDiff = p.taxRate - 10;
    if (taxDiff > 0) {
      GameState.updateFaction('residents', -taxDiff * 0.5);
      GameState.updateFaction('tycoon', -taxDiff * 0.5);
    } else if (taxDiff < 0) {
      GameState.updateFaction('residents', -taxDiff * 0.4);
      GameState.updateFaction('tycoon', -taxDiff * 0.4);
    }

    if (p.greenEnergyMandate) {
      GameState.updateFaction('env', 2);
      GameState.updateFaction('tycoon', -1);
    }

    if (p.industrialSubsidies) {
      GameState.updateFaction('tycoon', 3);
      GameState.updateFaction('env', -2);
      GameState.updateFaction('labor', 1);
    }

    if (p.publicTransitFunding) {
      GameState.updateFaction('labor', 2);
      GameState.updateFaction('residents', 2);
      GameState.updateFaction('env', 1);
    }
  }

  public static recalculateFactionImpact(): void {
    // Helper method called when policies change
  }
}
