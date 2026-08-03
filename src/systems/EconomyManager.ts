import { GameState } from '../core/GameState';
import { BUILDINGS, GAME_CONFIG } from '../core/Constants';
import { PolicyManager } from './PolicyManager';

export interface FinancialSummary {
  taxRevenue: number;
  buildingUpkeep: number;
  policyUpkeep: number;
  netIncome: number;
}

export class EconomyManager {
  public static recalculateStats(): FinancialSummary {
    let currentPop = 0;
    let currentJobs = 0;
    let currentUtilSupply = 0;
    let currentUtilDemand = 0;
    let currentPollution = 0;
    let rawTaxRevenue = 0;
    let totalBuildingUpkeep = 0;

    for (let x = 0; x < GAME_CONFIG.GRID_WIDTH; x++) {
      for (let y = 0; y < GAME_CONFIG.GRID_HEIGHT; y++) {
        const buildingKey = GameState.gridData[x][y];
        if (buildingKey && BUILDINGS[buildingKey]) {
          const config = BUILDINGS[buildingKey];

          currentPop += config.population;
          currentJobs += config.jobs;
          currentUtilSupply += config.utilitySupply;
          currentUtilDemand += config.utilityDemand;
          currentPollution += config.pollution;
          totalBuildingUpkeep += config.upkeep;

          // Base building tax revenue
          rawTaxRevenue += config.taxBonus;
        }
      }
    }

    // Policy multipliers
    let taxMultiplier = GameState.policies.taxRate / 10;
    if (GameState.policies.industrialSubsidies) {
      currentJobs = Math.round(currentJobs * 1.15);
      rawTaxRevenue += 50;
    }
    if (GameState.policies.greenEnergyMandate) {
      currentPollution = Math.max(0, currentPollution - 5);
    }
    if (GameState.policies.publicTransitFunding) {
      currentPollution = Math.max(0, currentPollution - 4);
    }

    const totalTaxIncome = Math.round(rawTaxRevenue * taxMultiplier);
    const policyUpkeep = PolicyManager.getMonthlyPolicyUpkeep();

    GameState.population = currentPop;
    GameState.jobs = currentJobs;
    GameState.utilitySupply = currentUtilSupply;
    GameState.utilityDemand = currentUtilDemand;
    GameState.pollution = Math.max(0, currentPollution);

    // Calculate Happiness
    let unemploymentRate = 0;
    if (currentPop > 0) {
      unemploymentRate = Math.max(0, (currentPop - currentJobs) / currentPop) * 100;
    }

    const utilityDeficit = Math.max(0, currentUtilDemand - currentUtilSupply);
    const pollutionPenalty = currentPollution * 1.2;
    const unemploymentPenalty = unemploymentRate * 0.4;
    const utilityPenalty = utilityDeficit * 2;

    let happinessBonus = 0;
    if (GameState.policies.publicTransitFunding) happinessBonus += 10;

    const calculatedHappiness = Math.max(
      0,
      Math.min(100, Math.round(100 - pollutionPenalty - unemploymentPenalty - utilityPenalty + happinessBonus))
    );

    GameState.happiness = calculatedHappiness;

    // Faction adjustments based on happiness & pollution
    if (currentPollution > 25) {
      GameState.updateFaction('env', -1);
    }
    if (unemploymentRate > 20) {
      GameState.updateFaction('labor', -1);
      GameState.updateFaction('residents', -1);
    }

    const summary: FinancialSummary = {
      taxRevenue: totalTaxIncome,
      buildingUpkeep: totalBuildingUpkeep,
      policyUpkeep,
      netIncome: totalTaxIncome - totalBuildingUpkeep - policyUpkeep,
    };

    return summary;
  }

  public static processMonthlyEconomy(): FinancialSummary {
    const summary = EconomyManager.recalculateStats();
    GameState.money += summary.netIncome;
    PolicyManager.applyMonthlyPolicyEffects();
    GameState.emitChange();
    return summary;
  }
}
