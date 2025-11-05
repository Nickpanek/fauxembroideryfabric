/**
 * GameScene.js - Main gameplay scene
 * Handles towers, enemies, waves, and core game loop
 */

import Scene from '../engine/Scene.js';
import PathSystem from '../systems/PathSystem.js';
import TowerSystem from '../systems/TowerSystem.js';
import EnemySystem from '../systems/EnemySystem.js';
import ProjectileSystem from '../systems/ProjectileSystem.js';
import ComboSystem from '../systems/ComboSystem.js';
import CollisionSystem from '../systems/CollisionSystem.js';
import Button from '../ui/Button.js';

export default class GameScene extends Scene {
  async init(data) {
    super.init(data);
    this.world = data.world || 'prairie';
  }

  async preload() {
    // Load game data
    const [towersData, enemiesData, wavesData, combosData] = await Promise.all([
      fetch('src/data/towers.json').then(r => r.json()),
      fetch('src/data/enemies.json').then(r => r.json()),
      fetch('src/data/waves.json').then(r => r.json()),
      fetch('src/data/combos.json').then(r => r.json())
    ]);

    this.towersData = towersData;
    this.enemiesData = enemiesData;
    this.wavesData = wavesData[this.world];
    this.combosData = combosData;
  }

  create() {
    // Initialize systems
    this.pathSystem = new PathSystem();
    this.comboSystem = new ComboSystem(this.combosData);
    this.towerSystem = new TowerSystem(this.towersData, this.comboSystem);
    this.enemySystem = new EnemySystem(this.enemiesData, this.pathSystem);
    this.projectileSystem = new ProjectileSystem();

    // Create default path
    const path = this.pathSystem.createDefaultPath(this.width, this.height);
    this.pathSystem.registerPath('default', path);

    // Game state
    this.fleece = 200; // Starting currency
    this.lives = 20;
    this.currentWave = 0;
    this.maxWaves = this.wavesData.waves.length;
    this.waveInProgress = false;
    this.gameSpeed = 1;
    this.paused = false;
    this.gameOver = false;

    // Tower placement
    this.selectedTowerType = null;
    this.placementMode = false;
    this.hoverGridX = -1;
    this.hoverGridY = -1;

    // Selected tower for panel
    this.selectedTower = null;

    // Ready button (shown between waves)
    this.readyButton = new Button(
      this.centerX - 75,
      this.centerY + 100,
      150,
      50,
      'Ready!',
      () => this.startNextWave()
    );
    this.readyButton.setVisible(!this.waveInProgress);

    // Setup input
    this.setupInput();

    // Start first wave after delay
    setTimeout(() => this.startNextWave(), 1000);
  }

  setupInput() {
    this.input.on('pointerdown', (pointer) => {
      this.handlePointerDown(pointer.x, pointer.y);
    });

    this.input.on('pointerup', (pointer) => {
      this.handlePointerUp(pointer.x, pointer.y);
    });

    this.input.on('pointermove', (pointer) => {
      this.handlePointerMove(pointer.x, pointer.y);
    });
  }

  handlePointerDown(x, y) {
    // Check ready button
    if (this.readyButton.visible && this.readyButton.handlePointerDown(x, y)) {
      return;
    }

    // Check if clicking on tower
    const tower = this.towerSystem.getTowerAtPosition(x, y);
    if (tower) {
      this.selectTower(tower);
      return;
    }

    // Tower placement
    if (this.selectedTowerType) {
      this.placeTower(x, y);
      return;
    }

    // Deselect
    this.selectedTower = null;
  }

  handlePointerUp(x, y) {
    if (this.readyButton.visible) {
      this.readyButton.handlePointerUp(x, y);
    }
  }

  handlePointerMove(x, y) {
    if (this.readyButton.visible) {
      this.readyButton.handlePointerMove(x, y);
    }

    // Update hover position for placement
    if (this.selectedTowerType) {
      const gridX = Math.floor(x / this.towerSystem.tileSize);
      const gridY = Math.floor(y / this.towerSystem.tileSize);
      this.hoverGridX = gridX;
      this.hoverGridY = gridY;
    }
  }

  startNextWave() {
    if (this.waveInProgress || this.gameOver) return;

    this.currentWave++;

    if (this.currentWave > this.maxWaves) {
      this.winGame();
      return;
    }

    // Show transition
    this.launchScene('transition', {
      world: this.world,
      nextWave: this.currentWave
    });
  }

  onTransitionComplete() {
    // Start wave
    const waveData = this.wavesData.waves[this.currentWave - 1];
    this.enemySystem.queueWaveSpawn(waveData, 'default');
    this.waveInProgress = true;
    this.readyButton.setVisible(false);
  }

  selectTowerType(type) {
    this.selectedTowerType = type;
    this.selectedTower = null;
  }

  deselectTowerType() {
    this.selectedTowerType = null;
    this.hoverGridX = -1;
    this.hoverGridY = -1;
  }

  placeTower(x, y) {
    if (!this.selectedTowerType) return;

    const gridX = Math.floor(x / this.towerSystem.tileSize);
    const gridY = Math.floor(y / this.towerSystem.tileSize);

    // Check if valid placement
    if (!CollisionSystem.isValidPlacement(
      gridX, gridY,
      this.towerSystem.gridWidth,
      this.towerSystem.gridHeight,
      this.towerSystem.towers
    )) {
      return;
    }

    // Check if can afford
    const towerConfig = this.towersData[this.selectedTowerType];
    if (this.fleece < towerConfig.cost) {
      return;
    }

    // Place tower
    const tower = this.towerSystem.placeTower(this.selectedTowerType, gridX, gridY);
    if (tower) {
      this.fleece -= towerConfig.cost;
      this.deselectTowerType();
    }
  }

  selectTower(tower) {
    // Clear all selections
    for (const t of this.towerSystem.towers) {
      t.selected = false;
    }

    tower.selected = true;
    this.selectedTower = tower;
  }

  upgradeTower(tower) {
    const cost = this.towerSystem.getUpgradeCost(tower);
    if (!cost || this.fleece < cost) return;

    if (this.towerSystem.upgradeTower(tower)) {
      this.fleece -= cost;
    }
  }

  sellTower(tower) {
    const value = this.towerSystem.getSellValue(tower);
    this.fleece += value;
    this.towerSystem.removeTower(tower);
    this.selectedTower = null;
  }

  toggleSpeed() {
    this.gameSpeed = this.gameSpeed === 1 ? 2 : 1;
    this.game.setTimeScale(this.gameSpeed);
  }

  togglePause() {
    this.paused = !this.paused;
    if (this.paused) {
      this.game.pauseGame();
    } else {
      this.game.resumeGame();
    }
  }

  update(dt) {
    if (this.paused || this.gameOver) return;

    // Update systems
    this.enemySystem.update(dt);
    this.towerSystem.update(dt, this.enemySystem.enemies, this.projectileSystem);
    this.projectileSystem.update(dt, this.enemySystem.enemies);

    // Check for escaped enemies
    const escaped = this.enemySystem.getEscapedCount();
    if (escaped > 0) {
      this.lives -= escaped;
      if (this.lives <= 0) {
        this.loseGame();
      }
    }

    // Check if wave is complete
    if (this.waveInProgress && this.enemySystem.isWaveComplete()) {
      this.completeWave();
    }
  }

  completeWave() {
    this.waveInProgress = false;

    // Award wave completion bonus
    const waveData = this.wavesData.waves[this.currentWave - 1];
    this.fleece += waveData.reward;

    // Show ready button
    this.readyButton.setVisible(true);
  }

  winGame() {
    this.gameOver = true;
    console.log('Victory! You defended Threadland!');
    // TODO: Show victory screen
  }

  loseGame() {
    this.gameOver = true;
    this.lives = 0;
    console.log('Defeat! Threadland has fallen...');
    // TODO: Show game over screen
  }

  render() {
    // Background
    this.canvas.fillBackground('#2d5016');

    // Draw grid (optional debug)
    if (false) {
      this.renderGrid();
    }

    // Draw path (visual guide)
    this.renderPath();

    // Render game objects
    this.towerSystem.render(this.canvas, this.assets);
    this.enemySystem.render(this.canvas, this.assets);
    this.projectileSystem.render(this.canvas, this.assets);

    // Tower placement preview
    if (this.selectedTowerType && this.hoverGridX >= 0 && this.hoverGridY >= 0) {
      this.towerSystem.renderRangePreview(
        this.canvas,
        this.selectedTowerType,
        this.hoverGridX,
        this.hoverGridY
      );
    }

    // Ready button
    if (this.readyButton.visible) {
      this.readyButton.render(this.canvas);
    }

    // Game over overlay
    if (this.gameOver) {
      this.canvas.setAlpha(0.7);
      this.canvas.drawRect(0, 0, this.width, this.height, '#000000', true);
      this.canvas.setAlpha(1);

      const message = this.lives <= 0 ? 'DEFEAT' : 'VICTORY!';
      const color = this.lives <= 0 ? '#f44336' : '#4caf50';

      this.canvas.drawText(message, this.centerX, this.centerY, {
        font: 'bold 64px Arial',
        color: color,
        align: 'center',
        baseline: 'middle'
      });
    }
  }

  renderGrid() {
    const tileSize = this.towerSystem.tileSize;
    this.canvas.setAlpha(0.2);

    for (let x = 0; x < this.towerSystem.gridWidth; x++) {
      for (let y = 0; y < this.towerSystem.gridHeight; y++) {
        this.canvas.drawRect(
          x * tileSize,
          y * tileSize,
          tileSize,
          tileSize,
          '#ffffff',
          false
        );
      }
    }

    this.canvas.setAlpha(1);
  }

  renderPath() {
    const path = this.pathSystem.paths.get('default');
    if (!path) return;

    this.canvas.setAlpha(0.3);

    // Draw path line
    for (let i = 0; i < path.length - 1; i++) {
      this.canvas.drawLine(
        path[i].x,
        path[i].y,
        path[i + 1].x,
        path[i + 1].y,
        '#8b4513',
        30
      );
    }

    this.canvas.setAlpha(1);
  }

  /**
   * Get game state for UI
   */
  getGameState() {
    return {
      fleece: this.fleece,
      lives: this.lives,
      maxLives: 20,
      wave: this.currentWave,
      maxWaves: this.maxWaves,
      speed: this.gameSpeed,
      paused: this.paused
    };
  }

  shutdown() {
    this.input.off('pointerdown');
    this.input.off('pointerup');
    this.input.off('pointermove');
  }
}
