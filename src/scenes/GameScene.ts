import Phaser from 'phaser';
import { GameState } from '../core/GameState';
import { GAME_CONFIG, EVENTS } from '../core/Constants';
import { EventBus } from '../core/EventBus';
import { EventManager } from '../systems/EventManager';
import { EconomyManager } from '../systems/EconomyManager';
import { HtmlUI } from '../ui/HtmlUI';

export class GameScene extends Phaser.Scene {
  private eventManager!: EventManager;
  private htmlUI!: HtmlUI;
  private cityGroup!: Phaser.GameObjects.Group;
  private pollutionOverlay!: Phaser.GameObjects.Rectangle;

  constructor() {
    super('GameScene');
  }

  public create(): void {
    // Center game viewport background
    this.cameras.main.setBackgroundColor('#2c3e50');

    // Draw static isometric grass grid: each grid cell (x, y) projects to a
    // diamond via screenX = (x - y) * HALF_W, screenY = (x + y) * HALF_H.
    for (let x = 0; x < GAME_CONFIG.GRID_WIDTH; x++) {
      for (let y = 0; y < GAME_CONFIG.GRID_HEIGHT; y++) {
        this.add.image(this.isoX(x, y), this.isoY(x, y), 'grass_tile');
      }
    }

    // City visual group
    this.cityGroup = this.add.group();

    // Pollution overlay rectangle covering the isometric map's bounding box
    const mapW = (GAME_CONFIG.GRID_WIDTH + GAME_CONFIG.GRID_HEIGHT) * GAME_CONFIG.ISO_HALF_W;
    const mapH = (GAME_CONFIG.GRID_WIDTH + GAME_CONFIG.GRID_HEIGHT) * GAME_CONFIG.ISO_HALF_H;
    this.pollutionOverlay = this.add.rectangle(
      GAME_CONFIG.WIDTH / 2,
      GAME_CONFIG.HEIGHT / 2,
      mapW,
      mapH,
      0x574f7a,
      0
    );
    this.pollutionOverlay.setDepth(1000);

    // Instantiation of Managers
    this.eventManager = new EventManager();

    // Trigger initial stats calculation to sync UI (recalculateStats does not
    // emit STATE_CHANGED, so build the HUD after it to read the fresh state)
    EconomyManager.recalculateStats();
    this.htmlUI = new HtmlUI(this.eventManager);
    this.renderCityVisuals();

    // Wire up events
    EventBus.on(EVENTS.STATE_CHANGED, () => this.renderCityVisuals(), this);
    EventBus.on(EVENTS.GAME_OVER, this.handleGameOver, this);
    EventBus.on(EVENTS.SPECTACLE_ACTION, this.handleSpectacleAction, this);

    // Initial spectacle entrance
    EventBus.emit(EVENTS.SPECTACLE_ENTRANCE);

    // Scene shutdown hook for cleanup
    this.events.once('shutdown', this.cleanup, this);
  }

  public update(time: number, delta: number): void {
    // Turn-based policy sim
  }

  private renderCityVisuals(): void {
    if (!this.cityGroup) return;
    this.cityGroup.clear(true, true);

    // Procedural scattering of buildings based on population
    const pop = GameState.population;
    const buildingCount = Math.min(60, Math.max(5, Math.round(pop / 4)));

    const buildings: { gx: number; gy: number; i: number; tex: string }[] = [];

    for (let i = 0; i < buildingCount; i++) {
      // Deterministic layout across the grid
      const gx = (i * 7) % GAME_CONFIG.GRID_WIDTH;
      const gy = (i * 13) % GAME_CONFIG.GRID_HEIGHT;

      let tex = 'house1';
      if (i % 5 === 1) tex = 'factory';
      else if (i % 5 === 2) tex = 'park';
      else if (i % 5 === 3) tex = 'powerplant';
      else if (i % 5 === 4) tex = 'tower';

      buildings.push({ gx, gy, i, tex });
    }

    // Isometric depth sort: draw far tiles (smaller x+y) first so nearer
    // buildings overlap correctly.
    buildings.sort((a, b) => (a.gx + a.gy) - (b.gx + b.gy));

    for (const b of buildings) {
      const px = this.isoX(b.gx, b.gy) + ((b.i % 3) - 1) * 4;
      const py = this.isoY(b.gx, b.gy) - GAME_CONFIG.ISO_HALF_H * 0.6 + (b.i % 2) * 3;

      const sprite = this.add.image(px, py, b.tex);
      // Fit sprite to the tile footprint with a bit of overhang, like it stands on the diamond
      const maxDim = Math.max(sprite.width, sprite.height);
      const scale = maxDim > 0 ? (GAME_CONFIG.ISO_HALF_W * 1.5) / maxDim : 0.5;
      sprite.setScale(scale);
      this.cityGroup.add(sprite);
    }

    // Update pollution tint overlay opacity (0% to 50% max alpha)
    const pollutionAlpha = Math.min(0.5, (GameState.pollution / 100) * 0.5);
    this.pollutionOverlay.setAlpha(pollutionAlpha);
  }

  // Grid (x, y) -> screen center of the tile, centered on the canvas
  private isoX(x: number, y: number): number {
    const cx = GAME_CONFIG.WIDTH / 2;
    const ox = (GAME_CONFIG.GRID_WIDTH - GAME_CONFIG.GRID_HEIGHT) / 2;
    return cx + (x - y - ox) * GAME_CONFIG.ISO_HALF_W;
  }

  private isoY(x: number, y: number): number {
    const cy = GAME_CONFIG.HEIGHT / 2;
    const oy = (GAME_CONFIG.GRID_WIDTH + GAME_CONFIG.GRID_HEIGHT - 2) / 2;
    return cy + (x + y - oy) * GAME_CONFIG.ISO_HALF_H;
  }

  private handleGameOver(): void {
    // End screen triggers
  }

  private handleSpectacleAction(data: { action: string }): void {
    if (data.action === 'replay') {
      this.renderCityVisuals();
    }
  }

  private cleanup(): void {
    EventBus.off(EVENTS.STATE_CHANGED, this.renderCityVisuals, this);
    EventBus.off(EVENTS.GAME_OVER, this.handleGameOver, this);
    EventBus.off(EVENTS.SPECTACLE_ACTION, this.handleSpectacleAction, this);
    
    // Clean DOM overlay elements to avoid duplicated HUD on restart
    const gameHUDs = document.querySelectorAll('.game-hud, .policy-panel, .modal');
    gameHUDs.forEach(el => el.remove());
  }
}
