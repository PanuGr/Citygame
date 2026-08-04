import { GameState } from '../core/GameState';
import { EVENT_DATABASE, CityEvent, ChoiceOption, EVENTS } from '../core/Constants';
import { EventBus } from '../core/EventBus';
import { EconomyManager } from './EconomyManager';
import { SaveManager } from './SaveManager';

export class EventManager {
  private usedEventIds: Set<string> = new Set();

  public advanceMonth(): void {
    if (GameState.isGameOver || GameState.activeEventId !== null) return;

    // Run economy tick
    EconomyManager.processMonthlyEconomy();

    if (GameState.isGameOver) {
      EventBus.emit(EVENTS.GAME_OVER);
      return;
    }

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
      this.usedEventIds.clear();
      return EVENT_DATABASE[Math.floor(Math.random() * EVENT_DATABASE.length)];
    }

    const selected = available[Math.floor(Math.random() * available.length)];
    this.usedEventIds.add(selected.id);
    return selected;
  }

  public resolveEventChoice(option: ChoiceOption): void {
    // moneyChangePct / pollutionChangePct are % of current values, applied at
    // resolution time so events scale with the city instead of going stale.
    GameState.money += Math.round(GameState.money * option.moneyChangePct);

    if (option.approvalChanges && option.approvalChanges.residents) {
      GameState.updateFaction('residents', option.approvalChanges.residents);
    }

    if (option.pollutionChangePct) {
      const delta = Math.round(GameState.pollution * option.pollutionChangePct);
      GameState.pollution = Math.max(0, Math.min(100, GameState.pollution + delta));
    }

    GameState.activeEventId = null;
    EventBus.emit(EVENTS.EVENT_RESOLVED);

    this.checkEndMonthProgress();
  }

  private checkEndMonthProgress(): void {
    if (GameState.month >= 12) {
      GameState.isGameOver = true;
      EventBus.emit(EVENTS.GAME_OVER);
    } else {
      GameState.month += 1;
      EventBus.emit(EVENTS.MONTH_TICK, GameState.month);
    }
    GameState.emitChange();
    SaveManager.saveGame();
  }

  public setSpeed(speed: number): void {
    // Kept for interface compatibility
    GameState.emitChange();
  }
}
