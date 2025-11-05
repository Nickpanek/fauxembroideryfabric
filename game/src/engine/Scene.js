/**
 * Scene.js - Base scene class with lifecycle methods
 * All game scenes inherit from this class
 */

export default class Scene {
  constructor(game) {
    this.game = game;
    this.canvas = game.canvas;
    this.input = game.input;
    this.assets = game.assets;
    this.tweens = game.tweens;
    this.active = false;
    this.visible = true;
  }

  /**
   * Initialize scene - called once when scene is created
   * Override in subclass
   */
  init(data = {}) {
    this.data = data;
  }

  /**
   * Preload assets - called after init, before create
   * Override in subclass to load scene-specific assets
   */
  async preload() {
    // Override in subclass
  }

  /**
   * Create scene objects - called after preload completes
   * Override in subclass
   */
  create() {
    // Override in subclass
  }

  /**
   * Update scene logic - called every frame
   * Override in subclass
   * @param {number} dt - Delta time in seconds
   */
  update(dt) {
    // Override in subclass
  }

  /**
   * Render scene - called every frame after update
   * Override in subclass
   */
  render() {
    // Override in subclass
  }

  /**
   * Shutdown scene - called when scene is stopped
   * Override in subclass to clean up
   */
  shutdown() {
    // Override in subclass
  }

  /**
   * Resume scene - called when scene is resumed from pause
   * Override in subclass if needed
   */
  resume() {
    // Override in subclass
  }

  /**
   * Pause scene - called when scene is paused
   * Override in subclass if needed
   */
  pause() {
    // Override in subclass
  }

  /**
   * Switch to another scene
   */
  switchToScene(sceneKey, data = {}) {
    this.game.switchScene(sceneKey, data);
  }

  /**
   * Launch a scene alongside this one
   */
  launchScene(sceneKey, data = {}) {
    this.game.launchScene(sceneKey, data);
  }

  /**
   * Stop a running scene
   */
  stopScene(sceneKey) {
    this.game.stopScene(sceneKey);
  }

  /**
   * Helper: Get canvas width
   */
  get width() {
    return this.canvas.logicalWidth;
  }

  /**
   * Helper: Get canvas height
   */
  get height() {
    return this.canvas.logicalHeight;
  }

  /**
   * Helper: Get center X
   */
  get centerX() {
    return this.canvas.logicalWidth / 2;
  }

  /**
   * Helper: Get center Y
   */
  get centerY() {
    return this.canvas.logicalHeight / 2;
  }
}
