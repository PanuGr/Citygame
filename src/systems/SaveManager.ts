import { GameState } from '../core/GameState';
import { GAME_CONFIG } from '../core/Constants';

export interface SavePayload {
  version: number;
  money: number;
  month: number;
  year: number;
  policies: typeof GameState.policies;
  factionApproval: typeof GameState.factionApproval;
  gridData: (string | null)[][];
}

export class SaveManager {
  private static readonly SAVE_KEY = 'cityBuilderSave';

  public static hasSave(): boolean {
    return localStorage.getItem(SaveManager.SAVE_KEY) !== null;
  }

  public static saveGame(): boolean {
    try {
      const payload: SavePayload = {
        version: 2,
        money: GameState.money,
        month: GameState.month,
        year: GameState.year,
        policies: { ...GameState.policies },
        factionApproval: { ...GameState.factionApproval },
        gridData: GameState.gridData.map(col => [...col]),
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

      // Backwards compatibility handling
      if (data.gridData) {
        GameState.money = typeof data.money === 'number' ? data.money : (data.playerMoney ?? 1000);
        GameState.month = data.month ?? 1;
        GameState.year = data.year ?? 1;

        if (data.policies) {
          GameState.policies = { ...GameState.policies, ...data.policies };
        }
        if (data.factionApproval) {
          GameState.factionApproval = { ...GameState.factionApproval, ...data.factionApproval };
        }

        // Restore grid safely matching current dimensions
        GameState.initGrid();
        const savedGrid = data.gridData;

        for (let x = 0; x < GAME_CONFIG.GRID_WIDTH; x++) {
          if (!savedGrid[x]) continue;
          for (let y = 0; y < GAME_CONFIG.GRID_HEIGHT; y++) {
            const cell = savedGrid[x][y];
            if (!cell) {
              GameState.gridData[x][y] = null;
            } else if (typeof cell === 'string') {
              GameState.gridData[x][y] = cell;
            } else if (cell && typeof cell === 'object' && cell.key) {
              // Legacy object format: { key: 'HOUSE' }
              GameState.gridData[x][y] = cell.key;
            }
          }
        }

        GameState.emitChange();
        return true;
      }
      return false;
    } catch (e) {
      console.error('Failed to load save data:', e);
      return false;
    }
  }

  public static clearSave(): void {
    localStorage.removeItem(SaveManager.SAVE_KEY);
  }
}
