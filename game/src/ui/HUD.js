/**
 * HUD.js - Heads-up display (top bar)
 * Shows: fleece (gold), lives, wave counter, speed toggle, pause
 * Based on PDF spec section 8
 */

import { IconButton } from './Button.js';

export default class HUD {
  constructor(width, height) {
    this.width = width;
    this.height = height;

    // HUD dimensions
    this.hudHeight = 60;
    this.padding = 10;

    // Game state (set by GameScene)
    this.fleece = 100;
    this.lives = 20;
    this.maxLives = 20;
    this.wave = 1;
    this.maxWaves = 10;
    this.speed = 1;
    this.paused = false;

    // Buttons
    this.speedButton = new IconButton(
      width - 110,
      10,
      40,
      '×1',
      () => this.toggleSpeed()
    );

    this.pauseButton = new IconButton(
      width - 60,
      10,
      40,
      '⏸',
      () => this.togglePause()
    );

    this.speedButton.backgroundColor = '#ff9800';
    this.pauseButton.backgroundColor = '#f44336';
  }

  /**
   * Update HUD state
   */
  update(gameState) {
    this.fleece = gameState.fleece || 0;
    this.lives = gameState.lives || 0;
    this.maxLives = gameState.maxLives || 20;
    this.wave = gameState.wave || 1;
    this.maxWaves = gameState.maxWaves || 10;
    this.speed = gameState.speed || 1;
    this.paused = gameState.paused || false;

    // Update button text
    this.speedButton.iconKey = `×${this.speed}`;
    this.pauseButton.iconKey = this.paused ? '▶' : '⏸';
  }

  /**
   * Toggle game speed
   */
  toggleSpeed() {
    if (this.onSpeedToggle) {
      this.onSpeedToggle();
    }
  }

  /**
   * Toggle pause
   */
  togglePause() {
    if (this.onPauseToggle) {
      this.onPauseToggle();
    }
  }

  /**
   * Handle input
   */
  handlePointerDown(x, y) {
    if (this.speedButton.handlePointerDown(x, y)) return true;
    if (this.pauseButton.handlePointerDown(x, y)) return true;
    return false;
  }

  handlePointerUp(x, y) {
    if (this.speedButton.handlePointerUp(x, y)) return true;
    if (this.pauseButton.handlePointerUp(x, y)) return true;
    return false;
  }

  handlePointerMove(x, y) {
    this.speedButton.handlePointerMove(x, y);
    this.pauseButton.handlePointerMove(x, y);
  }

  /**
   * Render HUD
   */
  render(canvas, assets) {
    // Background
    canvas.drawRect(0, 0, this.width, this.hudHeight, 'rgba(0, 0, 0, 0.7)', true);

    const y = 20;
    let x = this.padding;

    // Fleece (currency)
    canvas.drawText(`💰 ${this.fleece}`, x, y, {
      font: 'bold 20px Arial',
      color: '#ffd700',
      baseline: 'top'
    });

    x += 120;

    // Lives (hearts)
    const heartColor = this.lives > this.maxLives * 0.5 ? '#e91e63' : '#f44336';
    const livesText = `♥ ${this.lives}`;
    canvas.drawText(livesText, x, y, {
      font: 'bold 20px Arial',
      color: heartColor,
      baseline: 'top'
    });

    x += 80;

    // Wave counter
    canvas.drawText(`Wave ${this.wave}/${this.maxWaves}`, x, y, {
      font: 'bold 18px Arial',
      color: '#ffffff',
      baseline: 'top'
    });

    // Buttons (right side)
    this.speedButton.render(canvas, assets);
    this.pauseButton.render(canvas, assets);

    // Bottom border
    canvas.drawLine(0, this.hudHeight, this.width, this.hudHeight, '#333333', 2);
  }

  /**
   * Check if point is in HUD area
   */
  contains(x, y) {
    return y <= this.hudHeight;
  }

  /**
   * Set callbacks
   */
  setCallbacks(onSpeedToggle, onPauseToggle) {
    this.onSpeedToggle = onSpeedToggle;
    this.onPauseToggle = onPauseToggle;
  }
}
