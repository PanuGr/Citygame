import Phaser from 'phaser';
import { GAME_CONFIG } from '../core/Constants';
import { GameState } from '../core/GameState';
import { GridManager } from '../systems/GridManager';

export class CitizenCommuter extends Phaser.GameObjects.Graphics {
  private startX: number;
  private startY: number;
  private targetX: number;
  private targetY: number;
  private progress: number = 0;
  private speed: number = 0.003;
  private isVehicle: boolean;

  constructor(
    scene: Phaser.Scene,
    fromGridX: number,
    fromGridY: number,
    toGridX: number,
    toGridY: number
  ) {
    super(scene);

    const startPx = GridManager.gridToPixel(fromGridX, fromGridY);
    const targetPx = GridManager.gridToPixel(toGridX, toGridY);

    this.startX = startPx.x;
    this.startY = startPx.y;
    this.targetX = targetPx.x;
    this.targetY = targetPx.y;

    this.isVehicle = Math.random() > 0.5;
    this.speed = 0.002 + Math.random() * 0.003;

    // Draw little sprite (car rectangle or walking dot)
    if (this.isVehicle) {
      this.fillStyle(0x3498db, 1);
      this.fillRect(-4, -2, 8, 4);
    } else {
      this.fillStyle(0xf1c40f, 1);
      this.fillCircle(0, 0, 2.5);
    }

    this.setPosition(this.startX, this.startY);
    this.setDepth(50);
    scene.add.existing(this);
  }

  public updateCommute(deltaMs: number): boolean {
    if (GameState.gameSpeed === 0) return false;

    this.progress += this.speed * (deltaMs / 16.6) * GameState.gameSpeed;

    if (this.progress >= 1) {
      this.destroy();
      return true; // Finished
    }

    const currentX = Phaser.Math.Linear(this.startX, this.targetX, this.progress);
    const currentY = Phaser.Math.Linear(this.startY, this.targetY, this.progress);

    this.setPosition(currentX, currentY);
    return false;
  }
}
