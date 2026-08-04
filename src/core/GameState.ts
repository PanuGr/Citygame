import { DEFAULT_POLICIES, PolicySettings, EVENTS } from './Constants';
import { EventBus } from './EventBus';

export interface FactionApproval {
  residents: number;// General Residents
}

export class GameStateStore {
  public money: number = 500;
  public population: number = 100;
  public jobs: number = 50;
  public utilitySupply: number = 50;
  public utilityDemand: number = 50;
  public utilitiesBalance: number = 100; // self-corrects toward 100 each turn
  public pollution: number = 0;
  public month: number = 1; // 1 to 12
  public year: number = 1;
  public isGameOver: boolean = false;
  public activeEventId: string | null = null;

  public factionApproval: FactionApproval = {
    residents: 50,
  };

  public policies: PolicySettings = { ...DEFAULT_POLICIES };

  public get overallApproval(): number {
    return Math.round(Math.max(0, Math.min(100, this.factionApproval.residents)));
  }

  public reset(): void {
    this.money = 500;
    this.population = 100;
    this.jobs = 50;
    this.utilitySupply = 50;
    this.utilityDemand = 50;
    this.utilitiesBalance = 100;
    this.pollution = 0;
    this.month = 1;
    this.year = 1;
    this.isGameOver = false;
    this.activeEventId = null;

    this.factionApproval = {
      residents: 50,
    };

    this.policies = { ...DEFAULT_POLICIES };
    this.emitChange();
  }

  public updateFaction(faction: keyof FactionApproval, delta: number): void {
    this.factionApproval[faction] = Math.max(0, Math.min(100, this.factionApproval[faction] + delta));
    // ponytail: no auto-emit here — the caller batches its mutations and emits
    // once (e.g. EconomyManager.processMonthlyEconomy, EventManager.checkEndMonthProgress).
    // Ceiling: if many mutators appear, swap to an explicit event queue.
  }

  public emitChange(): void {
    EventBus.emit(EVENTS.STATE_CHANGED, this);
  }
}

export const GameState = new GameStateStore();
