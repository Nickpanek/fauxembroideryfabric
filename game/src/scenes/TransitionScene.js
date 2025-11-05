/**
 * TransitionScene.js - Thread-swipe transition between waves
 * Slides world-specific image across screen
 * Based on PDF spec section 7
 */

import Scene from '../engine/Scene.js';

export default class TransitionScene extends Scene {
  init(data) {
    super.init(data);
    this.world = data.world || 'prairie';
    this.nextWave = data.nextWave || 1;
  }

  create() {
    // Image properties
    this.imageX = this.width; // Start off-screen right
    this.imageY = this.centerY;
    this.imageAlpha = 0;

    // Animation phases
    this.phase = 'fadeIn'; // fadeIn -> hold -> slideOut
    this.timer = 0;

    // Timing (from PDF spec)
    this.fadeInDuration = 0.3;
    this.holdDuration = 0.6;
    this.slideOutDuration = 0.6;

    // Create tween for slide in
    this.tweens.create(
      this,
      { imageX: this.centerX, imageAlpha: 1 },
      this.fadeInDuration * 1000,
      {
        easing: 'easeOut',
        onComplete: () => {
          this.phase = 'hold';
          this.timer = 0;
        }
      }
    );
  }

  update(dt) {
    if (this.phase === 'hold') {
      this.timer += dt;

      if (this.timer >= this.holdDuration) {
        // Start slide out
        this.phase = 'slideOut';
        this.timer = 0;

        this.tweens.create(
          this,
          { imageX: -this.centerX, imageAlpha: 0 },
          this.slideOutDuration * 1000,
          {
            easing: 'easeIn',
            onComplete: () => {
              // Complete transition
              this.complete();
            }
          }
        );
      }
    }
  }

  render() {
    // Background (slightly darkened game view)
    this.canvas.fillBackground('rgba(0, 0, 0, 0.5)');

    // Get world image
    const imageKey = `interstitial-${this.world}`;
    let image = this.assets.getImage(imageKey);

    if (!image) {
      // Create placeholder for world image
      image = this.assets.createPlaceholder(imageKey, 400, 600, this.getWorldColor());
    }

    // Draw transition image
    this.canvas.setAlpha(this.imageAlpha);
    this.canvas.drawImageCentered(image, this.imageX, this.imageY, 400, 600);
    this.canvas.setAlpha(1);

    // Wave text overlay
    if (this.phase === 'hold') {
      this.canvas.drawText(`Wave ${this.nextWave}`, this.centerX, this.centerY, {
        font: 'bold 48px Arial',
        color: '#ffffff',
        align: 'center',
        baseline: 'middle'
      });

      this.canvas.drawText('Get Ready!', this.centerX, this.centerY + 60, {
        font: '24px Arial',
        color: '#ffd700',
        align: 'center',
        baseline: 'middle'
      });
    }
  }

  /**
   * Get color theme for world (for placeholder)
   */
  getWorldColor() {
    const colors = {
      prairie: '#7cb342',
      desert: '#ffa726',
      forest: '#388e3c'
    };
    return colors[this.world] || '#4a90e2';
  }

  /**
   * Complete transition and resume game
   */
  complete() {
    this.stopScene('transition');

    // Resume game scene if it exists
    const gameScene = this.game.getScene('game');
    if (gameScene) {
      gameScene.onTransitionComplete();
    }
  }

  shutdown() {
    // Clean up tweens
    this.tweens.clear();
  }
}
