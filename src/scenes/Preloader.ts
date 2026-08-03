import Phaser from 'phaser';

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
    // Generate simple particle texture and grass grid texture
    this.createProceduralTextures();

    // Move to MainMenu scene
    this.scene.start('MainMenu');
  }

  private createProceduralTextures(): void {
    // 1. Procedural grass tile for our grid cell
    const grass = this.make.graphics({ x: 0, y: 0 }, false);
    // Soft meadow green color
    grass.fillStyle(0x27ae60, 1);
    grass.fillRect(0, 0, 50, 50);
    // Subtle border
    grass.lineStyle(1, 0x2ecc71, 0.4);
    grass.strokeRect(0, 0, 50, 50);
    grass.generateTexture('grass_tile', 50, 50);
    grass.destroy();

    // 2. Hover indicator
    const hover = this.make.graphics({ x: 0, y: 0 }, false);
    hover.lineStyle(3, 0xf1c40f, 0.8);
    hover.strokeRect(0, 0, 50, 50);
    hover.generateTexture('hover_tile', 50, 50);
    hover.destroy();
  }
}
