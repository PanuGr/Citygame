import Phaser from 'phaser';
import { GAME_CONFIG } from '../core/Constants';

export class Preloader extends Phaser.Scene {
  constructor() {
    super('Preloader');
  }

  public preload(): void {
    const cx = this.scale.width / 2;
    const cy = this.scale.height / 2;

    // Beautiful glowing text progress indicator
    const loadingText = this.add.text(cx, cy - 30, 'LOADING METROPOLIS...', {
      fontSize: '24px',
      color: '#00a8ff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    const barBg = this.add.graphics();
    barBg.fillStyle(0x2f3640, 1);
    barBg.fillRoundedRect(cx - 150, cy + 10, 300, 16, 8);

    const barFill = this.add.graphics();

    this.load.on('progress', (val: number) => {
      barFill.clear();
      barFill.fillStyle(0x4cd137, 1);
      barFill.fillRoundedRect(cx - 150, cy + 10, 300 * val, 16, 8);
    });

    this.load.on('complete', () => {
      loadingText.destroy();
      barBg.destroy();
      barFill.destroy();
    });

    // Load static assets from our copied public directory
    this.load.image('menu_background', './assets/background.avif');
    this.load.image('house1', './assets/house1.avif');
    this.load.image('factory', './assets/factory.avif');
    this.load.image('powerplant', './assets/powerplant.avif');
    this.load.image('tower', './assets/tower.avif');
    this.load.image('park', './assets/park.avif');
  }

  public create(): void {
    // Generate the procedural isometric grass tile texture
    this.createProceduralTextures();

    // Move to MainMenu scene
    this.scene.start('MainMenu');
  }

  private createProceduralTextures(): void {
    // Isometric diamond grass tile (2:1 ratio to match ISO_HALF_W/H)
    const isoW = GAME_CONFIG.ISO_HALF_W * 2;
    const isoH = GAME_CONFIG.ISO_HALF_H * 2;
    const grass = this.make.graphics({ x: 0, y: 0 }, false);
    const diamond = [
      new Phaser.Math.Vector2(isoW / 2, 0),
      new Phaser.Math.Vector2(isoW, isoH / 2),
      new Phaser.Math.Vector2(isoW / 2, isoH),
      new Phaser.Math.Vector2(0, isoH / 2),
    ];
    // Soft meadow green fill with a subtle border
    grass.fillStyle(0x27ae60, 1);
    grass.fillPoints(diamond, true);
    grass.lineStyle(1, 0x2ecc71, 0.4);
    grass.strokePoints(diamond, true);
    grass.generateTexture('grass_tile', isoW, isoH);
    grass.destroy();
  }
}
