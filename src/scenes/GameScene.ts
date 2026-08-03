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

    // Draw static grid grass background with slight isometric tilt feel via container/group
    for (let x = 0; x < GAME_CONFIG.GRID_WIDTH; x++) {
      for (let y = 0; y < GAME_CONFIG.GRID_HEIGHT; y++) {
        const px = x * GAME_CONFIG.TILE_SIZE + GAME_CONFIG.TILE_SIZE / 2;
        const py = y * GAME_CONFIG.TILE_SIZE + GAME_CONFIG.TILE_SIZE / 2;
        this.add.image(px, py, 'grass_tile');
      }
    }

    // City visual group
    this.cityGroup = this.add.group();

    // Pollution overlay rectangle
    this.pollutionOverlay = this.add.rectangle(
      (GAME_CONFIG.GRID_WIDTH * GAME_CONFIG.TILE_SIZE) / 2,
      (GAME_CONFIG.GRID_HEIGHT * GAME_CONFIG.TILE_SIZE) / 2,
      GAME_CONFIG.GRID_WIDTH * GAME_CONFIG.TILE_SIZE,
      GAME_CONFIG.GRID_HEIGHT * GAME_CONFIG.TILE_SIZE,
      0x574f7a,
      0
    );
    this.pollutionOverlay.setDepth(1000);

    // Instantiation of Managers
    this.eventManager = new EventManager();
    this.htmlUI = new HtmlUI(this.eventManager);

    // Trigger initial stats calculation to sync UI
    EconomyManager.recalculateStats();
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

    // Procedural scattering of buildings based on population & policies
    const pop = GameState.population;
    const buildingCount = Math.min(60, Math.max(5, Math.round(pop / 4)));

    // Deterministic random layout based on population step
    const textures = ['house1', 'factory', 'park', 'powerplant', 'tower'];

    for (let i = 0; i < buildingCount; i++) {
      // Pseudo-random coordinate across the 16x12 grid
      const gx = (i * 7) % GAME_CONFIG.GRID_WIDTH;
      const gy = (i * 13) % GAME_CONFIG.GRID_HEIGHT;

      const px = gx * GAME_CONFIG.TILE_SIZE + GAME_CONFIG.TILE_SIZE / 2 + ((i % 3) - 1) * 4;
      const py = gy * GAME_CONFIG.TILE_SIZE + GAME_CONFIG.TILE_SIZE / 2 + ((i % 2)) * 4;

      let tex = 'house1';
      if (i % 5 === 1) tex = 'factory';
      else if (i % 5 === 2) tex = 'park';
      else if (i % 5 === 3) tex = 'powerplant';
      else if (i % 5 === 4) tex = 'tower';

      const sprite = this.add.image(px, py, tex);
      // Fit sprite nicely into the TILE_SIZE block (50x50px) with slight padding
      const maxDim = Math.max(sprite.width, sprite.height);
      const scale = maxDim > 0 ? (GAME_CONFIG.TILE_SIZE * 0.9) / maxDim : 0.5;
      sprite.setScale(scale);
      this.cityGroup.add(sprite);
    }

    // Update pollution tint overlay opacity (0% to 50% max alpha)
    const pollutionAlpha = Math.min(0.5, (GameState.pollution / 100) * 0.5);
    this.pollutionOverlay.setAlpha(pollutionAlpha);
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
