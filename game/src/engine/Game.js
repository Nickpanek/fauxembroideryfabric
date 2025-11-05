/**
 * Game.js - Core game loop and scene manager
 * Main engine class that handles game loop, scene switching, and subsystems
 */

import Canvas from './Canvas.js';
import Input from './Input.js';
import Assets from './Assets.js';
import { TweenManager } from './Tween.js';

export default class Game {
  constructor(canvasElement, config = {}) {
    this.config = {
      width: config.width || 540,
      height: config.height || 960,
      backgroundColor: config.backgroundColor || '#000000',
      targetFPS: config.targetFPS || 60,
      ...config
    };

    // Initialize subsystems
    this.canvas = new Canvas(canvasElement, this.config.width, this.config.height);
    this.input = new Input(canvasElement, this.canvas);
    this.assets = new Assets();
    this.tweens = new TweenManager();

    // Scene management
    this.scenes = new Map();
    this.activeScenes = [];
    this.pendingSceneOperations = [];

    // Game loop
    this.running = false;
    this.lastTime = 0;
    this.accumulator = 0;
    this.fixedTimeStep = 1000 / this.config.targetFPS;

    // Performance tracking
    this.fps = 0;
    this.frameCount = 0;
    this.fpsTime = 0;

    // Game state
    this.paused = false;
    this.timeScale = 1;
  }

  /**
   * Register a scene class
   */
  registerScene(key, SceneClass) {
    this.scenes.set(key, SceneClass);
  }

  /**
   * Create and initialize a scene
   */
  async createScene(key, data = {}) {
    const SceneClass = this.scenes.get(key);
    if (!SceneClass) {
      console.error(`Scene "${key}" not found`);
      return null;
    }

    const scene = new SceneClass(this);
    scene.key = key;
    scene.init(data);

    // Preload assets if needed
    if (scene.preload) {
      await scene.preload();
    }

    // Create scene
    scene.create();
    scene.active = true;

    return scene;
  }

  /**
   * Switch to a new scene (stops all current scenes)
   */
  async switchScene(key, data = {}) {
    this.pendingSceneOperations.push({
      type: 'switch',
      key,
      data
    });
  }

  /**
   * Launch a scene alongside existing scenes
   */
  async launchScene(key, data = {}) {
    this.pendingSceneOperations.push({
      type: 'launch',
      key,
      data
    });
  }

  /**
   * Stop a specific scene
   */
  stopScene(key) {
    this.pendingSceneOperations.push({
      type: 'stop',
      key
    });
  }

  /**
   * Pause a specific scene
   */
  pauseScene(key) {
    const scene = this.activeScenes.find(s => s.key === key);
    if (scene) {
      scene.active = false;
      if (scene.pause) scene.pause();
    }
  }

  /**
   * Resume a specific scene
   */
  resumeScene(key) {
    const scene = this.activeScenes.find(s => s.key === key);
    if (scene) {
      scene.active = true;
      if (scene.resume) scene.resume();
    }
  }

  /**
   * Process pending scene operations
   */
  async processPendingSceneOperations() {
    if (this.pendingSceneOperations.length === 0) return;

    const operations = [...this.pendingSceneOperations];
    this.pendingSceneOperations = [];

    for (const op of operations) {
      switch (op.type) {
        case 'switch':
          // Shutdown all active scenes
          for (const scene of this.activeScenes) {
            if (scene.shutdown) scene.shutdown();
          }
          this.activeScenes = [];

          // Create and start new scene
          const newScene = await this.createScene(op.key, op.data);
          if (newScene) {
            this.activeScenes.push(newScene);
          }
          break;

        case 'launch':
          // Create and add new scene
          const launchedScene = await this.createScene(op.key, op.data);
          if (launchedScene) {
            this.activeScenes.push(launchedScene);
          }
          break;

        case 'stop':
          // Find and stop scene
          const index = this.activeScenes.findIndex(s => s.key === op.key);
          if (index > -1) {
            const scene = this.activeScenes[index];
            if (scene.shutdown) scene.shutdown();
            this.activeScenes.splice(index, 1);
          }
          break;
      }
    }
  }

  /**
   * Start the game loop
   */
  async start(initialScene, data = {}) {
    if (this.running) return;

    this.running = true;

    // Start with initial scene
    const scene = await this.createScene(initialScene, data);
    if (scene) {
      this.activeScenes.push(scene);
    }

    this.lastTime = performance.now();
    requestAnimationFrame((time) => this.loop(time));
  }

  /**
   * Main game loop
   */
  async loop(currentTime) {
    if (!this.running) return;

    // Calculate delta time
    const dt = Math.min((currentTime - this.lastTime) / 1000, 0.1) * this.timeScale;
    this.lastTime = currentTime;

    // Update FPS counter
    this.frameCount++;
    this.fpsTime += dt;
    if (this.fpsTime >= 1) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.fpsTime = 0;
    }

    // Process pending scene operations
    await this.processPendingSceneOperations();

    if (!this.paused) {
      // Update input
      this.input.update();

      // Update tweens
      this.tweens.update(dt);

      // Update all active scenes
      for (const scene of this.activeScenes) {
        if (scene.active && scene.update) {
          scene.update(dt);
        }
      }
    }

    // Clear canvas
    this.canvas.clear();
    this.canvas.fillBackground(this.config.backgroundColor);

    // Render all visible scenes
    for (const scene of this.activeScenes) {
      if (scene.visible && scene.render) {
        scene.render();
      }
    }

    // Reset context
    this.canvas.resetContext();

    // Continue loop
    requestAnimationFrame((time) => this.loop(time));
  }

  /**
   * Pause the entire game
   */
  pauseGame() {
    this.paused = true;
  }

  /**
   * Resume the entire game
   */
  resumeGame() {
    this.paused = false;
  }

  /**
   * Set time scale (for slow motion/speed up)
   */
  setTimeScale(scale) {
    this.timeScale = Math.max(0, scale);
  }

  /**
   * Stop the game loop
   */
  stop() {
    this.running = false;

    // Shutdown all scenes
    for (const scene of this.activeScenes) {
      if (scene.shutdown) scene.shutdown();
    }

    this.activeScenes = [];
  }

  /**
   * Get current FPS
   */
  getFPS() {
    return this.fps;
  }

  /**
   * Get active scene by key
   */
  getScene(key) {
    return this.activeScenes.find(s => s.key === key);
  }
}
