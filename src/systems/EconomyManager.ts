import { GameState } from '../core/GameState';
import { PolicyManager } from './PolicyManager';
import { POLICY_DATA } from '../core/policy';

export interface FinancialSummary {
  taxRevenue: number;
  buildingUpkeep: number;
  policyUpkeep: number;
  netIncome: number;
}

export class EconomyManager {
  public static recalculateStats(): FinancialSummary {
    const p = GameState.policies;

    // 1. Tax Revenue calculation
    const taxSteps = p.taxRate / (POLICY_DATA.TAX_RATE.step || 10);
    const baseTaxPerCapita = POLICY_DATA.TAX_RATE.effects.treasuryPerStep || 10;
    const rawTaxRevenue = Math.round(GameState.population * (taxSteps * (baseTaxPerCapita / 10)));

    // 2. Pollution calculation (policy strength = slider value / 100)
    let pollution = 20; // base ambient
    pollution *= (1 + (POLICY_DATA.GREEN_ENERGY_MANDATE.effects.pollutionPct || -0.30) * (p.greenEnergyMandate / 100));
    pollution *= (1 + (POLICY_DATA.INDUSTRIAL_SUBSIDIES.effects.pollutionPct || 0.25) * (p.industrialSubsidies / 100));
    pollution *= (1 + (POLICY_DATA.PUBLIC_TRANSIT_FUNDING.effects.pollutionPct || -0.15) * (p.publicTransitFunding / 100));
    GameState.pollution = Math.max(0, Math.min(100, Math.round(pollution)));

    // 3. Utilities — supply/demand is the display layer; the balance stat
    //    self-corrects toward 100 (full coverage) each turn instead of being
    //    held wherever the last policy left it. The supply/demand ratio only
    //    modulates how fast it recovers (shortage = slower, surplus = faster).
    const greenSupply = 1 + (POLICY_DATA.GREEN_ENERGY_MANDATE.effects.utilitiesOutputPct || 0.20) * (p.greenEnergyMandate / 100);
    GameState.utilitySupply = Math.round(50 * greenSupply);
    GameState.utilityDemand = Math.round(GameState.population * 0.5);

    const ratio = GameState.utilitySupply / Math.max(1, GameState.utilityDemand);
    const step = 0.1 * Math.max(0.4, Math.min(1.6, ratio));
    GameState.utilitiesBalance = GameState.utilitiesBalance + (100 - GameState.utilitiesBalance) * step;

    // 4. Asymmetric Utilities Effect & Pollution Penalty on Approval
    const distance = GameState.utilitiesBalance - 100;
    let approvalDelta = 0;

    // Pollution penalty on approval
    approvalDelta -= Math.round(GameState.pollution * 0.1);

    if (distance < 0) {
      // Shortage hurts approval (self-correcting, so the penalty fades over time)
      approvalDelta -= Math.round(Math.abs(distance) / 5);
    } else {
      // Oversupply helps approval only
      approvalDelta += Math.round(distance / 5);
    }

    GameState.updateFaction('residents', approvalDelta);

    // 5. Population growth tied to approval distance from 50
    const approval = GameState.overallApproval;
    const growthPct = approval - 50; // e.g. 55 -> +5%, 45 -> -5%
    const popChange = Math.round(GameState.population * (growthPct / 100));
    GameState.population = Math.max(0, GameState.population + popChange);

    // 6. Jobs calculation
    let jobsRate = 0.6;
    jobsRate += (POLICY_DATA.INDUSTRIAL_SUBSIDIES.effects.jobsGrowthPct || 0.15) * (p.industrialSubsidies / 100);
    GameState.jobs = Math.round(GameState.population * jobsRate);

    // 7. Financials
    const buildingUpkeep = Math.round(GameState.population * 0.2);
    const policyUpkeep = PolicyManager.getMonthlyPolicyUpkeep();
    const netIncome = rawTaxRevenue - buildingUpkeep - policyUpkeep;

    const summary: FinancialSummary = {
      taxRevenue: rawTaxRevenue,
      buildingUpkeep,
      policyUpkeep,
      netIncome,
    };

    return summary;
  }

  public static processMonthlyEconomy(): FinancialSummary {
    const summary = EconomyManager.recalculateStats();
    GameState.money += summary.netIncome;
    PolicyManager.applyMonthlyPolicyEffects();

    // Check population collapse game over
    if (GameState.population <= 10) {
      GameState.isGameOver = true;
    }

    GameState.emitChange();
    return summary;
  }
}
