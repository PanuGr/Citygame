import Phaser from 'phaser';
import { GameState } from '../core/GameState';
import { SaveManager } from '../systems/SaveManager';

export class MainMenu extends Phaser.Scene {
  constructor() {
    super('MainMenu');
  }

  public create(): void {
    const cx = this.scale.width / 2;
    const cy = this.scale.height / 2;

    // Background Image
    const bg = this.add.image(cx, cy, 'menu_background');
    bg.setDisplaySize(this.scale.width, this.scale.height);

    // Semi-transparent overlay to make text pop
    const overlay = this.add.graphics();
    overlay.fillStyle(0x1e272e, 0.75);
    overlay.fillRect(0, 0, this.scale.width, this.scale.height);

    // Title
    this.add.text(cx, cy - 140, 'BE THE MAYOR', {
      fontSize: '48px',
      color: '#00a8ff',
      fontStyle: 'bold',
      stroke: '#05c46b',
      strokeThickness: 2,
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(cx, cy - 80, 'A City Zoning & Policy Strategy Simulation', {
      fontSize: '16px',
      color: '#dcdde1',
      fontStyle: 'italic',
    }).setOrigin(0.5);

    // NEW GAME BUTTON
    const newGameBtn = this.add.text(cx, cy + 10, 'NEW CAMPAIGN', {
      fontSize: '22px',
      color: '#ffffff',
      backgroundColor: '#2f3640',
      padding: { x: 25, y: 12 },
    }).setOrigin(0.5).setInteractive();

    newGameBtn.on('pointerover', () => {
      newGameBtn.setColor('#f1c40f');
      newGameBtn.setBackgroundColor('#353b48');
    });

    newGameBtn.on('pointerout', () => {
      newGameBtn.setColor('#ffffff');
      newGameBtn.setBackgroundColor('#2f3640');
    });

    newGameBtn.on('pointerdown', () => {
      GameState.reset();
      SaveManager.clearSave(); // Fresh start
      this.scene.start('GameScene');
    });

    // CONTINUE BUTTON
    const hasSave = SaveManager.hasSave();
    const continueBtn = this.add.text(cx, cy + 85, 'CONTINUE CAMPAIGN', {
      fontSize: '22px',
      color: hasSave ? '#ffffff' : '#718093',
      backgroundColor: hasSave ? '#2f3640' : '#1e272e',
      padding: { x: 25, y: 12 },
    }).setOrigin(0.5);

    if (hasSave) {
      continueBtn.setInteractive();

      continueBtn.on('pointerover', () => {
        continueBtn.setColor('#f1c40f');
        continueBtn.setBackgroundColor('#353b48');
      });

      continueBtn.on('pointerout', () => {
        continueBtn.setColor('#ffffff');
        continueBtn.setBackgroundColor('#2f3640');
      });

      continueBtn.on('pointerdown', () => {
        const loaded = SaveManager.loadGame();
        if (loaded) {
          this.scene.start('GameScene');
        } else {
          alert('Failed to load save file. Starting new campaign.');
          GameState.reset();
          this.scene.start('GameScene');
        }
      });
    }

    // Credits / Instruction footer
    this.add.text(cx, cy + 180, 'Zoning • EU4-style Month Events • Policy Matrix Decisions', {
      fontSize: '12px',
      color: '#718093',
    }).setOrigin(0.5);
  }
}
