import Phaser from 'phaser';
import { BUILDINGS, GAME_CONFIG, BuildingTypeConfig } from '../core/Constants';
import { GameState } from '../core/GameState';

export class BuildingObject extends Phaser.GameObjects.Container {
  public gridX: number;
  public gridY: number;
  public buildingKey: string;
  public config: BuildingTypeConfig;

  private sprite: Phaser.GameObjects.Sprite;
  private badgeText: Phaser.GameObjects.Text;
  private badgeBg: Phaser.GameObjects.Graphics;
  private smokeParticles?: Phaser.GameObjects.Particles.ParticleEmitter;

  constructor(scene: Phaser.Scene, gridX: number, gridY: number, buildingKey: string) {
    const px = gridX * GAME_CONFIG.TILE_SIZE + GAME_CONFIG.TILE_SIZE / 2;
    const py = gridY * GAME_CONFIG.TILE_SIZE + GAME_CONFIG.TILE_SIZE / 2;

    super(scene, px, py);

    this.gridX = gridX;
    this.gridY = gridY;
    this.buildingKey = buildingKey;
    this.config = BUILDINGS[buildingKey];

    // Building texture sprite
    this.sprite = scene.add.sprite(0, 0, this.config.textureKey);
    this.sprite.setDisplaySize(GAME_CONFIG.TILE_SIZE - 2, GAME_CONFIG.TILE_SIZE - 2);
    this.add(this.sprite);

    // Badge container for status alerts (e.g. unpowered / polluted)
    this.badgeBg = scene.add.graphics();
    this.add(this.badgeBg);

    this.badgeText = scene.add.text(0, -GAME_CONFIG.TILE_SIZE / 2 + 2, '', {
      fontSize: '10px',
      color: '#ffffff',
      fontStyle: 'bold',
      backgroundColor: '#cc0000',
      padding: { x: 3, y: 1 },
    });
    this.badgeText.setOrigin(0.5, 0);
    this.badgeText.setVisible(false);
    this.add(this.badgeText);

    scene.add.existing(this);
    this.setDepth(10 + gridY);

    // If factory or power plant, add ambient smoke effect using graphics texture
    if (this.config.pollution > 5) {
      this.createSmokeEffect(scene);
    }
  }

  private createSmokeEffect(scene: Phaser.Scene): void {
    if (!scene.textures.exists('particle_smoke')) {
      const g = scene.make.graphics({ x: 0, y: 0 }, false);
      g.fillStyle(0xcccccc, 0.6);
      g.fillCircle(4, 4, 4);
      g.generateTexture('particle_smoke', 8, 8);
      g.destroy();
    }

    const emitter = scene.add.particles(this.x, this.y - 15, 'particle_smoke', {
      speed: { min: 5, max: 15 },
      angle: { min: 250, max: 290 },
      scale: { start: 0.6, end: 1.5 },
      alpha: { start: 0.5, end: 0 },
      lifespan: 1200,
      frequency: 400,
    });
    emitter.setDepth(100);
  }

  public updateStatus(): void {
    const isUnpowered = GameState.utilitySupply < GameState.utilityDemand && this.config.utilityDemand > 0;
    const isPolluted = GameState.pollution > 40 && this.config.category === 'residential';

    if (isUnpowered) {
      this.badgeText.setText('⚡ NO PWR');
      this.badgeText.setStyle({ backgroundColor: '#d35400' });
      this.badgeText.setVisible(true);
    } else if (isPolluted) {
      this.badgeText.setText('☣ POLLUTED');
      this.badgeText.setStyle({ backgroundColor: '#7f8c8d' });
      this.badgeText.setVisible(true);
    } else {
      this.badgeText.setVisible(false);
    }
  }

  public destroy(fromScene?: boolean): void {
    if (this.smokeParticles) {
      this.smokeParticles.destroy();
    }
    super.destroy(fromScene);
  }
}
