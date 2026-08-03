import { GAME_CONFIG, BUILDINGS, BuildingTypeConfig, EVENTS } from '../core/Constants';
import { GameState } from '../core/GameState';
import { EconomyManager } from './EconomyManager';
import { EventBus } from '../core/EventBus';

export interface GridPosition {
  x: number;
  y: number;
}

export class GridManager {
  public static gridToPixel(gridX: number, gridY: number): { x: number; y: number } {
    return {
      x: gridX * GAME_CONFIG.TILE_SIZE + GAME_CONFIG.TILE_SIZE / 2,
      y: gridY * GAME_CONFIG.TILE_SIZE + GAME_CONFIG.TILE_SIZE / 2,
    };
  }

  public static pixelToGrid(pixelX: number, pixelY: number): GridPosition {
    return {
      x: Math.floor(pixelX / GAME_CONFIG.TILE_SIZE),
      y: Math.floor(pixelY / GAME_CONFIG.TILE_SIZE),
    };
  }

  public static isValidCell(gridX: number, gridY: number): boolean {
    return (
      gridX >= 0 &&
      gridX < GAME_CONFIG.GRID_WIDTH &&
      gridY >= 0 &&
      gridY < GAME_CONFIG.GRID_HEIGHT
    );
  }

  public static isCellEmpty(gridX: number, gridY: number): boolean {
    if (!GridManager.isValidCell(gridX, gridY)) return false;
    return GameState.gridData[gridX][gridY] === null;
  }

  public static placeBuilding(gridX: number, gridY: number, buildingKey: string): boolean {
    if (!GridManager.isValidCell(gridX, gridY)) return false;
    if (!GridManager.isCellEmpty(gridX, gridY)) return false;

    const buildingConfig = BUILDINGS[buildingKey];
    if (!buildingConfig) return false;

    if (GameState.money < buildingConfig.cost) {
      console.warn('Insufficient funds for building placement');
      return false;
    }

    // Deduct cost and place
    GameState.money -= buildingConfig.cost;
    GameState.gridData[gridX][gridY] = buildingKey;

    // Recalculate economy
    EconomyManager.recalculateStats();
    GameState.emitChange();

    EventBus.emit(EVENTS.SPECTACLE_ACTION, { action: 'place_building', buildingKey, gridX, gridY });
    return true;
  }

  public static demolishBuilding(gridX: number, gridY: number): boolean {
    if (!GridManager.isValidCell(gridX, gridY)) return false;
    if (GameState.gridData[gridX][gridY] === null) return false;

    GameState.gridData[gridX][gridY] = null;
    EconomyManager.recalculateStats();
    GameState.emitChange();

    EventBus.emit(EVENTS.SPECTACLE_ACTION, { action: 'demolish', gridX, gridY });
    return true;
  }
}
