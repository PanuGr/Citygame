import { GameState } from '../core/GameState';
import { PolicySettings } from '../core/Constants';

export interface SavePayload {
  version: number;
  money: number;
  month: number;
  year: number;
  population: number;
  pollution: number;
  jobs: number;
  utilitySupply: number;
  utilityDemand: number;
  utilitiesBalance: number;
  policies: typeof GameState.policies;
  factionApproval: typeof GameState.factionApproval;
}

export class SaveManager {
  private static readonly SAVE_KEY = 'cityBuilderSave';

  public static hasSave(): boolean {
    return localStorage.getItem(SaveManager.SAVE_KEY) !== null;
  }

  public static saveGame(): boolean {
    try {
      const payload: SavePayload = {
        version: 4,
        money: GameState.money,
        month: GameState.month,
        year: GameState.year,
        population: GameState.population,
        pollution: GameState.pollution,
        jobs: GameState.jobs,
        utilitySupply: GameState.utilitySupply,
        utilityDemand: GameState.utilityDemand,
        utilitiesBalance: GameState.utilitiesBalance,
        policies: { ...GameState.policies },
        factionApproval: { ...GameState.factionApproval },
      };

      localStorage.setItem(SaveManager.SAVE_KEY, JSON.stringify(payload));
      return true;
    } catch (e) {
      console.error('Failed to save game state:', e);
      return false;
    }
  }

  public static loadGame(): boolean {
    try {
      const raw = localStorage.getItem(SaveManager.SAVE_KEY);
      if (!raw) return false;

      const data = JSON.parse(raw);

      GameState.money = typeof data.money === 'number' ? data.money : 500;
      GameState.month = data.month ?? 1;
      GameState.year = data.year ?? 1;
      GameState.population = typeof data.population === 'number' ? data.population : 100;
      GameState.pollution = typeof data.pollution === 'number' ? data.pollution : 0;
      GameState.jobs = typeof data.jobs === 'number' ? data.jobs : 50;
      GameState.utilitySupply = typeof data.utilitySupply === 'number' ? data.utilitySupply : 50;
      GameState.utilityDemand = typeof data.utilityDemand === 'number' ? data.utilityDemand : 50;
      GameState.utilitiesBalance = typeof data.utilitiesBalance === 'number' ? data.utilitiesBalance : 50;

      if (data.policies) {
        const merged = { ...GameState.policies, ...data.policies };
        // Migration: pre-v4 saves stored the 3 non-tax policies as booleans.
        (Object.keys(merged) as (keyof PolicySettings)[]).forEach((k) => {
          const v = merged[k];
          merged[k] = typeof v === 'boolean' ? (v ? 100 : 0) : Number(v) || 0;
        });
        GameState.policies = merged;
      }
      if (data.factionApproval) {
        GameState.factionApproval = { ...GameState.factionApproval, ...data.factionApproval };
      }

      GameState.emitChange();
      return true;
    } catch (e) {
      console.error('Failed to load save data:', e);
      return false;
    }
  }

  public static clearSave(): void {
    localStorage.removeItem(SaveManager.SAVE_KEY);
  }
}
