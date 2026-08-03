import { DEFAULT_POLICIES, GAME_CONFIG, PolicySettings, EVENTS } from './Constants';
import { EventBus } from './EventBus';

export interface FactionApproval {
  env: number;      // Environmentalists
  tycoon: number;   // Business Tycoons
  labor: number;    // Labor Union
  residents: number;// General Residents
}

export class GameStateStore {
  public money: number = 1000;
  public population: number = 0;
  public jobs: number = 0;
  public utilitySupply: number = 0;
  public utilityDemand: number = 0;
  public pollution: number = 0;
  public happiness: number = 80;
  public month: number = 1; // 1 to 12
  public year: number = 1;
  public gameSpeed: number = 1; // 0: paused, 1: 1x, 2: 2x
  public isGameOver: boolean = false;
  public activeEventId: string | null = null;

  public factionApproval: FactionApproval = {
    env: 50,
    tycoon: 50,
    labor: 50,
    residents: 50,
  };

  public policies: PolicySettings = { ...DEFAULT_POLICIES };

  // Grid store: string key (e.g. 'HOUSE') or null
  public gridData: (string | null)[][] = [];

  constructor() {
    this.initGrid();
  }

  public initGrid() {
    this.gridData = [];
    for (let x = 0; x < GAME_CONFIG.GRID_WIDTH; x++) {
      this.gridData[x] = [];
      for (let y = 0; y < GAME_CONFIG.GRID_HEIGHT; y++) {
        this.gridData[x][y] = null;
      }
    }
  }

  public get overallApproval(): number {
    const { env, tycoon, labor, residents } = this.factionApproval;
    const avg = (env + tycoon + labor + residents) / 4;
    return Math.round(Math.max(0, Math.min(100, avg)));
  }

  public reset(): void {
    this.money = 1000;
    this.population = 0;
    this.jobs = 0;
    this.utilitySupply = 0;
    this.utilityDemand = 0;
    this.pollution = 0;
    this.happiness = 80;
    this.month = 1;
    this.year = 1;
    this.gameSpeed = 1;
    this.isGameOver = false;
    this.activeEventId = null;

    this.factionApproval = {
      env: 50,
      tycoon: 50,
      labor: 50,
      residents: 50,
    };

    this.policies = { ...DEFAULT_POLICIES };
    this.initGrid();
    this.emitChange();
  }

  public updateFaction(faction: keyof FactionApproval, delta: number): void {
    this.factionApproval[faction] = Math.max(0, Math.min(100, this.factionApproval[faction] + delta));
    this.emitChange();
  }

  public emitChange(): void {
    EventBus.emit(EVENTS.STATE_CHANGED, this);
  }
}

export const GameState = new GameStateStore();
