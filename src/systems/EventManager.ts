import { GameState } from '../core/GameState';
import { EVENT_DATABASE, CityEvent, ChoiceOption, EVENTS } from '../core/Constants';
import { EventBus } from '../core/EventBus';
import { EconomyManager } from './EconomyManager';

export class EventManager {
  private timer: number = 0;
  private usedEventIds: Set<string> = new Set();

  public update(deltaMs: number): void {
    if (GameState.gameSpeed === 0 || GameState.isGameOver || GameState.activeEventId !== null) {
      return;
    }

    // Accumulate time based on speed multiplier
    const speedMultiplier = GameState.gameSpeed;
    this.timer += deltaMs * speedMultiplier;

    // Monthly tick interval (12000ms base = 12 seconds per month)
    const interval = 12000;
    if (this.timer >= interval) {
      this.timer -= interval;
      this.advanceMonth();
    }
  }

  public advanceMonth(): void {
    if (GameState.isGameOver) return;

    // Run economy tick
    EconomyManager.processMonthlyEconomy();

    // Trigger EU4 monthly event if available
    const event = this.selectMonthlyEvent();
    if (event) {
      GameState.activeEventId = event.id;
      EventBus.emit(EVENTS.TRIGGER_MONTHLY_EVENT, event);
    } else {
      this.checkEndMonthProgress();
    }
  }

  private selectMonthlyEvent(): CityEvent | null {
    const available = EVENT_DATABASE.filter(e => !this.usedEventIds.has(e.id));
    if (available.length === 0) {
      // Reset pool if all used
      this.usedEventIds.clear();
      return EVENT_DATABASE[Math.floor(Math.random() * EVENT_DATABASE.length)];
    }

    const selected = available[Math.floor(Math.random() * available.length)];
    this.usedEventIds.add(selected.id);
    return selected;
  }

  public resolveEventChoice(option: ChoiceOption): void {
    GameState.money += option.moneyChange;

    if (option.approvalChanges) {
      if (option.approvalChanges.env) GameState.updateFaction('env', option.approvalChanges.env);
      if (option.approvalChanges.tycoon) GameState.updateFaction('tycoon', option.approvalChanges.tycoon);
      if (option.approvalChanges.labor) GameState.updateFaction('labor', option.approvalChanges.labor);
      if (option.approvalChanges.residents) GameState.updateFaction('residents', option.approvalChanges.residents);
    }

    if (option.pollutionChange) {
      GameState.pollution = Math.max(0, GameState.pollution + option.pollutionChange);
    }

    if (option.happinessChange) {
      GameState.happiness = Math.max(0, Math.min(100, GameState.happiness + option.happinessChange));
    }

    GameState.activeEventId = null;
    EventBus.emit(EVENTS.EVENT_RESOLVED);

    this.checkEndMonthProgress();
  }

  private checkEndMonthProgress(): void {
    if (GameState.month >= 12) {
      // Month 12 completed! Campaign wrap-up
      GameState.isGameOver = true;
      GameState.gameSpeed = 0;
      EventBus.emit(EVENTS.GAME_OVER);
    } else {
      GameState.month += 1;
      EventBus.emit(EVENTS.MONTH_TICK, GameState.month);
    }
    GameState.emitChange();
  }

  public setSpeed(speed: number): void {
    GameState.gameSpeed = speed;
    GameState.emitChange();
  }
}
