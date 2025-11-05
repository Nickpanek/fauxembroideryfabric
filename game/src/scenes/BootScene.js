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
    // Define asset manifest with all game assets
    const manifest = {
      images: [
        // Tower sprites
        { key: 'tower-pinLauncher', url: 'assets/sprites/towers/tower-pinLauncher.png' },
        { key: 'tower-buttonMortar', url: 'assets/sprites/towers/tower-buttonMortar.png' },
        { key: 'tower-woolCannon', url: 'assets/sprites/towers/tower-woolCannon.png' },
        { key: 'tower-patchTotem', url: 'assets/sprites/towers/tower-patchTotem.png' },
        { key: 'tower-spindleWard', url: 'assets/sprites/towers/tower-spindleWard.png' },

        // Enemy sprites
        { key: 'enemy-wolf', url: 'assets/sprites/enemies/enemy-wolf.png' },
        { key: 'enemy-threadling', url: 'assets/sprites/enemies/enemy-threadling.png' },
        { key: 'enemy-nightmoth', url: 'assets/sprites/enemies/enemy-nightmoth.png' },
        { key: 'enemy-tatterbeast', url: 'assets/sprites/enemies/enemy-tatterbeast.png' },
        { key: 'enemy-spindler', url: 'assets/sprites/enemies/enemy-spindler.png' },

        // Projectile sprites
        { key: 'projectile-pin', url: 'assets/sprites/projectiles/projectile-pin.png' },
        { key: 'projectile-button', url: 'assets/sprites/projectiles/projectile-button.png' },
        { key: 'projectile-wool', url: 'assets/sprites/projectiles/projectile-wool.png' },
        { key: 'projectile-dart', url: 'assets/sprites/projectiles/projectile-dart.png' },

        // Interstitial images (for world transitions)
        { key: 'interstitial-prairie', url: 'assets/interstitials/prairie.webp' },
        { key: 'interstitial-desert', url: 'assets/interstitials/desert.webp' },
        { key: 'interstitial-forest', url: 'assets/interstitials/forest.webp' },
      ],
      audio: []
    };

    // Setup progress callback
    this.assets.setProgressCallback((loaded, total) => {
      this.loadProgress = loaded / total;
    });

    try {
      // Load all assets
      await this.assets.load(manifest);
      this.loadComplete = true;
    } catch (error) {
      console.error('Error loading assets:', error);
      // Continue anyway - game will use placeholders
      this.loadComplete = true;
    }
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
      this.canvas.drawText(`Loading${dots}`, this.centerX, this.centerY + 60, {
        font: '16px Arial',
        color: '#ffffff',
        align: 'center',
        baseline: 'middle'
      });

      // Progress bar
      const barWidth = 200;
      const barHeight = 20;
      const barX = this.centerX - barWidth / 2;
      const barY = this.centerY + 90;

      // Background
      this.canvas.drawRect(barX, barY, barWidth, barHeight, '#333333', true);
      // Progress
      this.canvas.drawRect(barX, barY, barWidth * this.loadProgress, barHeight, '#4a90e2', true);
      // Border
      this.canvas.drawRect(barX, barY, barWidth, barHeight, '#666666', false);

      // Percentage
      const percent = Math.floor(this.loadProgress * 100);
      this.canvas.drawText(`${percent}%`, this.centerX, this.centerY + 120, {
        font: '12px Arial',
        color: '#999999',
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
