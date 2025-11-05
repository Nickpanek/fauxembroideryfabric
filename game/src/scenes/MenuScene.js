/**
 * MenuScene.js - Main menu with world selection
 * Continue/New game options
 */

import Scene from '../engine/Scene.js';
import Button from '../ui/Button.js';

export default class MenuScene extends Scene {
  create() {
    console.log('MenuScene: create() called');
    this.title = 'The Fighting Lambs of Threadland';

    // World buttons
    const buttonWidth = 200;
    const buttonHeight = 60;
    const spacing = 20;
    const startY = this.centerY - 50;

    this.worlds = [
      { id: 'prairie', name: 'Prairie Threads', unlocked: true },
      { id: 'desert', name: 'Desert Wastes', unlocked: true }, // Unlocked for testing
      { id: 'forest', name: 'Tangled Forest', unlocked: true } // Unlocked for testing
    ];

    this.buttons = [];

    for (let i = 0; i < this.worlds.length; i++) {
      const world = this.worlds[i];
      const y = startY + i * (buttonHeight + spacing);

      const button = new Button(
        this.centerX - buttonWidth / 2,
        y,
        buttonWidth,
        buttonHeight,
        world.name,
        () => this.startGame(world.id)
      );

      button.setEnabled(world.unlocked);
      this.buttons.push(button);
      console.log(`MenuScene: Created button "${world.name}" at (${button.x}, ${button.y}) size ${button.width}x${button.height}`);
    }

    // Setup input handlers
    this.input.on('pointerdown', (pointer) => {
      console.log(`MenuScene: pointerdown at (${pointer.x}, ${pointer.y})`);
      for (const button of this.buttons) {
        button.handlePointerDown(pointer.x, pointer.y);
      }
    });

    this.input.on('pointerup', (pointer) => {
      console.log(`MenuScene: pointerup at (${pointer.x}, ${pointer.y})`);
      for (const button of this.buttons) {
        const result = button.handlePointerUp(pointer.x, pointer.y);
        if (result) {
          console.log(`MenuScene: Button "${button.text}" clicked!`);
        }
      }
    });

    this.input.on('pointermove', (pointer) => {
      for (const button of this.buttons) {
        button.handlePointerMove(pointer.x, pointer.y);
      }
    });

    console.log(`MenuScene: Setup complete, ${this.buttons.length} buttons created`);
  }

  startGame(worldId) {
    console.log(`MenuScene: startGame() called with world: ${worldId}`);
    this.switchToScene('game', { world: worldId });
  }

  update(dt) {
    // Animation or idle effects could go here
  }

  render() {
    // Background
    this.canvas.fillBackground('#1a1a2e');

    // Title
    this.canvas.drawText('The Fighting Lambs', this.centerX, 100, {
      font: 'bold 36px Arial',
      color: '#ffffff',
      align: 'center',
      baseline: 'middle'
    });

    this.canvas.drawText('of Threadland', this.centerX, 140, {
      font: 'bold 24px Arial',
      color: '#4a90e2',
      align: 'center',
      baseline: 'middle'
    });

    // Subtitle
    this.canvas.drawText('Select Your World', this.centerX, 220, {
      font: '18px Arial',
      color: '#aaaaaa',
      align: 'center',
      baseline: 'middle'
    });

    // World buttons
    for (const button of this.buttons) {
      button.render(this.canvas);
    }

    // Instructions
    this.canvas.drawText('Tap a world to begin your defense!', this.centerX, this.height - 60, {
      font: '14px Arial',
      color: '#666666',
      align: 'center',
      baseline: 'middle'
    });

    // Credits
    this.canvas.drawText('A Faux Embroidery Fabric Production', this.centerX, this.height - 20, {
      font: '12px Arial',
      color: '#444444',
      align: 'center',
      baseline: 'middle'
    });
  }

  shutdown() {
    // Clean up input listeners
    this.input.off('pointerdown');
    this.input.off('pointerup');
    this.input.off('pointermove');
  }
}
