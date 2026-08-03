import Phaser from 'phaser';

export class Boot extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  public preload(): void {
    // We can load minimal boot assets here if needed (like progress bar background)
  }

  public create(): void {
    this.scene.start('Preloader');
  }
}
