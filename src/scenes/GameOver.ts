import Phaser from 'phaser';

export class GameOver extends Phaser.Scene {
  constructor() {
    super('GameOver');
  }

  public create(): void {
    // The main game over report card is rendered cleanly via HTML UI overlay.
    // This Phaser scene serves as a clean dark visual backdrop behind the HTML panel.
    const cx = this.scale.width / 2;
    const cy = this.scale.height / 2;

    const bg = this.add.graphics();
    bg.fillStyle(0x11171a, 0.9);
    bg.fillRect(0, 0, this.scale.width, this.scale.height);

    this.add.text(cx, cy - 100, 'CAMPAIGN COMPLETED', {
      fontSize: '32px',
      color: '#4cd137',
      fontStyle: 'bold',
    }).setOrigin(0.5);
  }
}
