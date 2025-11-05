/**
 * UIScene.js - UI overlay scene
 * Runs parallel to GameScene, displays HUD and tower controls
 */

import Scene from '../engine/Scene.js';
import HUD from '../ui/HUD.js';
import TowerTray from '../ui/TowerTray.js';
import TowerPanel from '../ui/TowerPanel.js';

export default class UIScene extends Scene {
  async preload() {
    // Load tower data for UI
    const towersData = await fetch('data/towers.json').then(r => r.json());
    this.towersData = towersData;
  }

  create() {
    // Get reference to game scene
    this.gameScene = this.game.getScene('game');

    if (!this.gameScene) {
      console.error('UIScene requires GameScene to be active');
      return;
    }

    // Create UI components
    this.hud = new HUD(this.width, this.height);
    this.towerTray = new TowerTray(this.width, this.height, this.towersData);
    this.towerPanel = new TowerPanel(this.width, this.height);

    // Set callbacks
    this.hud.setCallbacks(
      () => this.gameScene.toggleSpeed(),
      () => this.gameScene.togglePause()
    );

    this.towerPanel.setCallbacks(
      (tower) => this.gameScene.upgradeTower(tower),
      (tower) => this.gameScene.sellTower(tower)
    );

    // Setup input
    this.setupInput();
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
    // Check HUD first
    if (this.hud.handlePointerDown(x, y)) {
      return;
    }

    // Check tower panel
    if (this.towerPanel.handlePointerDown(x, y)) {
      return;
    }

    // Check tower tray
    const selectedType = this.towerTray.handlePointerDown(x, y);
    if (selectedType) {
      this.gameScene.selectTowerType(selectedType);
      this.towerPanel.hide();
      return;
    }
  }

  handlePointerUp(x, y) {
    this.hud.handlePointerUp(x, y);
    this.towerPanel.handlePointerUp(x, y);

    const trayReleased = this.towerTray.handlePointerUp(x, y);
    if (trayReleased) {
      // Tower was released - could place it if over valid spot
      // (handled by GameScene)
    }
  }

  handlePointerMove(x, y) {
    this.hud.handlePointerMove(x, y);
    this.towerPanel.handlePointerMove(x, y);
    this.towerTray.handlePointerMove(x, y);
  }

  update(dt) {
    if (!this.gameScene) return;

    // Update UI components with game state
    const gameState = this.gameScene.getGameState();
    this.hud.update(gameState);
    this.towerTray.update(gameState.fleece);

    // Update tower panel if tower is selected
    if (this.gameScene.selectedTower) {
      this.towerPanel.setTower(
        this.gameScene.selectedTower,
        this.towersData,
        this.gameScene.comboSystem
      );
    } else {
      this.towerPanel.hide();
    }
  }

  render() {
    // Render UI components (on top of game)
    this.hud.render(this.canvas, this.assets);
    this.towerTray.render(this.canvas, this.assets);
    this.towerPanel.render(this.canvas, this.assets);

    // Debug info (optional)
    if (this.gameScene && false) {
      this.renderDebugInfo();
    }
  }

  renderDebugInfo() {
    const y = this.height - 120;
    const x = 10;

    this.canvas.drawText(`FPS: ${this.game.getFPS()}`, x, y, {
      font: '12px Arial',
      color: '#ffffff',
      baseline: 'top'
    });

    this.canvas.drawText(`Enemies: ${this.gameScene.enemySystem.getEnemyCount()}`, x, y + 15, {
      font: '12px Arial',
      color: '#ffffff',
      baseline: 'top'
    });

    this.canvas.drawText(`Projectiles: ${this.gameScene.projectileSystem.getProjectileCount()}`, x, y + 30, {
      font: '12px Arial',
      color: '#ffffff',
      baseline: 'top'
    });

    this.canvas.drawText(`Towers: ${this.gameScene.towerSystem.getTowerCount()}`, x, y + 45, {
      font: '12px Arial',
      color: '#ffffff',
      baseline: 'top'
    });
  }

  shutdown() {
    this.input.off('pointerdown');
    this.input.off('pointerup');
    this.input.off('pointermove');
  }
}
