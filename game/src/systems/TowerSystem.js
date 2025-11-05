/**
 * TowerSystem.js - Tower placement, firing logic, and upgrades
 * Grid-based placement: 10×18 tiles @ 54px each
 * Based on PDF spec sections 3 and 5
 */

import CollisionSystem from './CollisionSystem.js';

export default class TowerSystem {
  constructor(towerData, comboSystem) {
    this.towerData = towerData;
    this.comboSystem = comboSystem;
    this.towers = [];
    this.nextId = 1;

    // Grid configuration (from spec: 10×18 tiles @ 54px)
    this.gridWidth = 10;
    this.gridHeight = 18;
    this.tileSize = 54;
  }

  /**
   * Place a tower on the grid
   */
  placeTower(type, gridX, gridY) {
    const towerConfig = this.towerData[type];
    if (!towerConfig) {
      console.error(`Tower type "${type}" not found`);
      return null;
    }

    // Convert grid to world position (center of tile)
    const x = gridX * this.tileSize + this.tileSize / 2;
    const y = gridY * this.tileSize + this.tileSize / 2;

    const tower = {
      id: this.nextId++,
      type: type,
      gridX: gridX,
      gridY: gridY,
      x: x,
      y: y,
      level: 1,

      // Base stats from config
      ...towerConfig,

      // Runtime state
      target: null,
      fireTimer: 0,
      active: true,
      totalDamage: 0,
      killCount: 0
    };

    // Remove upgrades from tower object (keep in config only)
    delete tower.upgrades;

    this.towers.push(tower);
    return tower;
  }

  /**
   * Upgrade a tower to next level
   */
  upgradeTower(tower) {
    const towerConfig = this.towerData[tower.type];
    if (!towerConfig.upgrades || tower.level >= towerConfig.upgrades.length + 1) {
      return false; // Max level or no upgrades available
    }

    const upgradeConfig = towerConfig.upgrades[tower.level - 1];

    // Apply upgrade stats
    for (const key in upgradeConfig) {
      if (key !== 'level' && key !== 'cost') {
        tower[key] = upgradeConfig[key];
      }
    }

    tower.level = upgradeConfig.level;
    return true;
  }

  /**
   * Remove/sell a tower
   */
  removeTower(tower) {
    const index = this.towers.indexOf(tower);
    if (index > -1) {
      this.towers.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Get tower at grid position
   */
  getTowerAt(gridX, gridY) {
    return this.towers.find(t => t.gridX === gridX && t.gridY === gridY);
  }

  /**
   * Get tower at world position
   */
  getTowerAtPosition(x, y) {
    const gridX = Math.floor(x / this.tileSize);
    const gridY = Math.floor(y / this.tileSize);
    return this.getTowerAt(gridX, gridY);
  }

  /**
   * Update all towers
   */
  update(dt, enemies, projectileSystem) {
    // Update combos
    if (this.comboSystem) {
      this.comboSystem.detectCombos(this.towers);
    }

    // Update each tower
    for (const tower of this.towers) {
      if (!tower.active) continue;

      // Get stats with combo bonuses applied
      const stats = this.comboSystem
        ? this.comboSystem.applyBonuses(tower, tower)
        : tower;

      // Support towers don't fire projectiles
      if (tower.targetType === 'support') {
        continue;
      }

      // Update fire timer
      tower.fireTimer -= dt;

      // Find target if we don't have one or current target is dead
      if (!tower.target || !tower.target.active || tower.target.hp <= 0) {
        tower.target = this.findTarget(tower, enemies, stats);
      }

      // Check if target is still in range
      if (tower.target) {
        const inRange = CollisionSystem.pointInCircle(
          tower.target.x, tower.target.y,
          tower.x, tower.y,
          stats.range
        );

        if (!inRange) {
          tower.target = null;
        }
      }

      // Fire at target
      if (tower.target && tower.fireTimer <= 0) {
        projectileSystem.createProjectile(tower, tower.target, stats);
        tower.fireTimer = stats.fireRate;
      }
    }
  }

  /**
   * Find best target for a tower
   * Strategy: Target furthest enemy along path (most progress)
   */
  findTarget(tower, enemies, stats) {
    const targetType = stats.canTargetAir ? 'both' : tower.targetType;
    return CollisionSystem.getFurthestEnemy(tower, enemies, targetType);
  }

  /**
   * Render all towers
   */
  render(canvas, assets) {
    for (const tower of this.towers) {
      // Get image (or placeholder)
      const imageKey = `tower-${tower.type}`;
      let image = assets.getImage(imageKey);

      if (!image) {
        // Create placeholder if image doesn't exist
        image = assets.createPlaceholder(imageKey, this.tileSize - 4, this.tileSize - 4, '#4a90e2');
      }

      // Draw tower
      canvas.drawImageCentered(image, tower.x, tower.y, this.tileSize - 8, this.tileSize - 8);

      // Draw range circle when selected
      if (tower.selected) {
        canvas.setAlpha(0.2);
        canvas.drawCircle(tower.x, tower.y, tower.range, '#4a90e2', true);
        canvas.setAlpha(1.0);
        canvas.drawCircle(tower.x, tower.y, tower.range, '#4a90e2', false);
      }

      // Draw level indicator
      if (tower.level > 1) {
        canvas.drawText(`L${tower.level}`, tower.x - this.tileSize / 2 + 4, tower.y - this.tileSize / 2 + 2, {
          font: 'bold 10px Arial',
          color: '#ffffff'
        });
      }
    }
  }

  /**
   * Render tower range preview
   */
  renderRangePreview(canvas, towerType, gridX, gridY) {
    const towerConfig = this.towerData[towerType];
    if (!towerConfig) return;

    const x = gridX * this.tileSize + this.tileSize / 2;
    const y = gridY * this.tileSize + this.tileSize / 2;

    canvas.setAlpha(0.3);
    canvas.drawCircle(x, y, towerConfig.range, '#00ff00', true);
    canvas.setAlpha(1.0);
  }

  /**
   * Get sell value for tower
   */
  getSellValue(tower) {
    const towerConfig = this.towerData[tower.type];
    let totalCost = towerConfig.cost;

    // Add upgrade costs
    if (towerConfig.upgrades) {
      for (let i = 0; i < tower.level - 1; i++) {
        totalCost += towerConfig.upgrades[i].cost;
      }
    }

    // Return 70% of total cost
    return Math.floor(totalCost * 0.7);
  }

  /**
   * Get upgrade cost for tower
   */
  getUpgradeCost(tower) {
    const towerConfig = this.towerData[tower.type];
    if (!towerConfig.upgrades || tower.level >= towerConfig.upgrades.length + 1) {
      return null;
    }

    return towerConfig.upgrades[tower.level - 1].cost;
  }

  /**
   * Clear all towers
   */
  clear() {
    this.towers = [];
    this.nextId = 1;
  }

  /**
   * Get total tower count
   */
  getTowerCount() {
    return this.towers.length;
  }
}
