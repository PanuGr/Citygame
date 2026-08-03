import Phaser from 'phaser';
import { GameState } from '../core/GameState';
import { GAME_CONFIG, BUILDINGS, EVENTS } from '../core/Constants';
import { EventBus } from '../core/EventBus';
import { GridManager } from '../systems/GridManager';
import { EventManager } from '../systems/EventManager';
import { EconomyManager } from '../systems/EconomyManager';
import { HtmlUI } from '../ui/HtmlUI';
import { BuildingObject } from '../objects/Building';
import { CitizenCommuter } from '../objects/Citizen';

export class GameScene extends Phaser.Scene {
  private eventManager!: EventManager;
  private htmlUI!: HtmlUI;

  // Grid visual elements representation
  private buildingsMap: Map<string, BuildingObject> = new Map();
  private commuters: Set<CitizenCommuter> = new Set();
  private hoverIndicator!: Phaser.GameObjects.Sprite;

  private commuterSpawnTimer: number = 0;

  constructor() {
    super('GameScene');
  }

  public create(): void {
    const width = GAME_CONFIG.GRID_WIDTH * GAME_CONFIG.TILE_SIZE;
    const height = GAME_CONFIG.GRID_HEIGHT * GAME_CONFIG.TILE_SIZE;

    // Center game viewport background
    this.cameras.main.setBackgroundColor('#2c3e50');

    // Draw static grid grass background
    for (let x = 0; x < GAME_CONFIG.GRID_WIDTH; x++) {
      for (let y = 0; y < GAME_CONFIG.GRID_HEIGHT; y++) {
        const px = x * GAME_CONFIG.TILE_SIZE + GAME_CONFIG.TILE_SIZE / 2;
        const py = y * GAME_CONFIG.TILE_SIZE + GAME_CONFIG.TILE_SIZE / 2;
        this.add.image(px, py, 'grass_tile');
      }
    }

    // Instantiation of Managers
    this.eventManager = new EventManager();
    this.htmlUI = new HtmlUI(this.eventManager);

    // Grid placement hover preview
    this.hoverIndicator = this.add.sprite(-100, -100, 'hover_tile');
    this.hoverIndicator.setDepth(200);
    this.hoverIndicator.setVisible(false);

    // Reconstruct city if loaded from save
    this.reconstructCityFromState();

    // Trigger initial stats calculation to sync UI
    EconomyManager.recalculateStats();

    // Wire up events
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => this.handlePointerMove(pointer));
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => this.handlePointerDown(pointer));

    // Handle game-over state transition
    EventBus.on(EVENTS.GAME_OVER, this.handleGameOver, this);
    EventBus.on(EVENTS.SPECTACLE_ACTION, this.handleSpectacleAction, this);

    // Initial spectacle entrance
    EventBus.emit(EVENTS.SPECTACLE_ENTRANCE);

    // Scene shutdown hook for cleanup
    this.events.once('shutdown', this.cleanup, this);
  }

  public update(time: number, delta: number): void {
    // 1. Advance the Month Timer in EventManager
    this.eventManager.update(delta);

    // 2. Update commuter entities movement
    for (const commuter of this.commuters) {
      const finished = commuter.updateCommute(delta);
      if (finished) {
        this.commuters.delete(commuter);
      }
    }

    // 3. Spawning citizens/vehicles commuting randomly
    this.commuterSpawnTimer += delta * GameState.gameSpeed;
    if (this.commuterSpawnTimer >= 1500) {
      this.commuterSpawnTimer = 0;
      this.spawnAmbientCommuter();
    }
  }

  private reconstructCityFromState(): void {
    for (let x = 0; x < GAME_CONFIG.GRID_WIDTH; x++) {
      for (let y = 0; y < GAME_CONFIG.GRID_HEIGHT; y++) {
        const key = GameState.gridData[x][y];
        if (key) {
          const bObj = new BuildingObject(this, x, y, key);
          this.buildingsMap.set(`${x},${y}`, bObj);
        }
      }
    }
  }

  private handlePointerMove(pointer: Phaser.Input.Pointer): void {
    const gridPos = GridManager.pixelToGrid(pointer.x, pointer.y);

    if (GridManager.isValidCell(gridPos.x, gridPos.y) && this.htmlUI.selectedAction !== null) {
      const px = gridPos.x * GAME_CONFIG.TILE_SIZE + GAME_CONFIG.TILE_SIZE / 2;
      const py = gridPos.y * GAME_CONFIG.TILE_SIZE + GAME_CONFIG.TILE_SIZE / 2;
      this.hoverIndicator.setPosition(px, py);
      this.hoverIndicator.setVisible(true);
    } else {
      this.hoverIndicator.setVisible(false);
    }
  }

  private handlePointerDown(pointer: Phaser.Input.Pointer): void {
    const gridPos = GridManager.pixelToGrid(pointer.x, pointer.y);
    if (!GridManager.isValidCell(gridPos.x, gridPos.y)) return;

    const action = this.htmlUI.selectedAction;
    if (!action) return;

    const key = `${gridPos.x},${gridPos.y}`;

    if (action === 'demolish') {
      const demolished = GridManager.demolishBuilding(gridPos.x, gridPos.y);
      if (demolished) {
        const bObj = this.buildingsMap.get(key);
        if (bObj) {
          bObj.destroy();
          this.buildingsMap.delete(key);
        }
        this.updateBuildingStatuses();
      }
    } else if (BUILDINGS[action]) {
      const placed = GridManager.placeBuilding(gridPos.x, gridPos.y, action);
      if (placed) {
        const bObj = new BuildingObject(this, gridPos.x, gridPos.y, action);
        this.buildingsMap.set(key, bObj);
        this.updateBuildingStatuses();
      }
    }
  }

  private updateBuildingStatuses(): void {
    for (const bObj of this.buildingsMap.values()) {
      bObj.updateStatus();
    }
  }

  private spawnAmbientCommuter(): void {
    if (GameState.gameSpeed === 0) return;

    // Spawns commute: choose a residential home and match with an industrial/civic building
    const residents: {x: number, y: number}[] = [];
    const jobs: {x: number, y: number}[] = [];

    for (let x = 0; x < GAME_CONFIG.GRID_WIDTH; x++) {
      for (let y = 0; y < GAME_CONFIG.GRID_HEIGHT; y++) {
        const bKey = GameState.gridData[x][y];
        if (bKey) {
          const cfg = BUILDINGS[bKey];
          if (cfg.category === 'residential') {
            residents.push({ x, y });
          } else if (cfg.category === 'industrial' || cfg.category === 'civic') {
            jobs.push({ x, y });
          }
        }
      }
    }

    if (residents.length > 0 && jobs.length > 0) {
      const from = residents[Math.floor(Math.random() * residents.length)];
      const to = jobs[Math.floor(Math.random() * jobs.length)];

      const commuter = new CitizenCommuter(this, from.x, from.y, to.x, to.y);
      this.commuters.add(commuter);
    }
  }

  private handleGameOver(): void {
    // End screen triggers, clear local pointer actions
    this.htmlUI.selectedAction = null;
    this.hoverIndicator.setVisible(false);
  }

  private handleSpectacleAction(data: { action: string }): void {
    if (data.action === 'replay') {
      // Re-initialize scene for clean replay
      this.buildingsMap.forEach(b => b.destroy());
      this.buildingsMap.clear();
      this.commuters.forEach(c => c.destroy());
      this.commuters.clear();
      this.updateBuildingStatuses();
    }
  }

  private cleanup(): void {
    // Fully clean up EventBus and listeners to prevent memory leaks / double bindings
    EventBus.off(EVENTS.GAME_OVER, this.handleGameOver, this);
    EventBus.off(EVENTS.SPECTACLE_ACTION, this.handleSpectacleAction, this);
    
    // Clean DOM overlay elements to avoid duplicated HUD on restart
    const gameHUDs = document.querySelectorAll('.game-hud, .game-toolbar, .modal');
    gameHUDs.forEach(el => el.remove());
  }
}
