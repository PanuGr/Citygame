import { GameState } from '../core/GameState';

export interface SavePayload {
  version: number;
  money: number;
  month: number;
  year: number;
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
        version: 3,
        money: GameState.money,
        month: GameState.month,
        year: GameState.year,
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

      if (data.policies) {
        GameState.policies = { ...GameState.policies, ...data.policies };
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
