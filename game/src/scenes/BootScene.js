/**
 * BootScene.js - Initial boot scene
 * Loads core assets and shows loading screen
 */

import Scene from '../engine/Scene.js';

export default class BootScene extends Scene {
  create() {
    this.loadProgress = 0;
    this.loadComplete = false;
    this.fadeTimer = 0;
    this.fadeDuration = 1.0;

    // Start loading assets
    this.loadAssets();
  }

  async loadAssets() {
    // For now, just create placeholders
    // Real assets will be added later by the user

    // Create placeholder assets
    this.assets.createPlaceholder('logo', 200, 100, '#4a90e2');

    // Simulate loading time
    await new Promise(resolve => setTimeout(resolve, 500));

    this.loadComplete = true;
  }

  update(dt) {
    if (this.loadComplete) {
      this.fadeTimer += dt;

      if (this.fadeTimer >= this.fadeDuration) {
        // Switch to menu scene
        this.switchToScene('menu');
      }
    }
  }

  render() {
    // Background
    this.canvas.fillBackground('#1a1a2e');

    // Title
    this.canvas.drawText('The Fighting Lambs', this.centerX, this.centerY - 100, {
      font: 'bold 32px Arial',
      color: '#ffffff',
      align: 'center',
      baseline: 'middle'
    });

    this.canvas.drawText('of Threadland', this.centerX, this.centerY - 60, {
      font: 'bold 24px Arial',
      color: '#4a90e2',
      align: 'center',
      baseline: 'middle'
    });

    if (this.loadComplete) {
      // Fade out effect
      const alpha = this.fadeTimer / this.fadeDuration;
      this.canvas.setAlpha(Math.max(0, 1 - alpha));

      this.canvas.drawText('Loading Complete', this.centerX, this.centerY + 100, {
        font: '16px Arial',
        color: '#4caf50',
        align: 'center',
        baseline: 'middle'
      });

      this.canvas.setAlpha(1);
    } else {
      // Loading animation
      const dots = '.'.repeat(Math.floor((Date.now() / 500) % 4));
      this.canvas.drawText(`Loading${dots}`, this.centerX, this.centerY + 100, {
        font: '16px Arial',
        color: '#ffffff',
        align: 'center',
        baseline: 'middle'
      });
    }

    // Version
    this.canvas.drawText('v1.0.0', this.centerX, this.height - 20, {
      font: '12px Arial',
      color: '#666666',
      align: 'center',
      baseline: 'middle'
    });
  }
}
