/**
 * EnemySystem.js - Enemy spawning, movement, and management
 * Uses object pooling for performance (max 30 enemies)
 * Based on PDF spec section 6
 */

import { EnemyPool } from '../engine/ObjectPool.js';

export default class EnemySystem {
  constructor(enemyData, pathSystem) {
    this.enemyData = enemyData;
    this.pathSystem = pathSystem;
    this.enemies = [];
    this.nextId = 1;

    // Object pool for enemies
    this.pool = new EnemyPool(() => this.createEnemyObject());

    // Spawn queue
    this.spawnQueue = [];
    this.spawnTimer = 0;
  }

  /**
   * Create a new enemy object (for pool)
   */
  createEnemyObject() {
    return {
      id: 0,
      type: '',
      x: 0,
      y: 0,
      hp: 0,
      maxHp: 0,
      speed: 0,
      pathProgress: 0,
      active: false,
      size: 20,
      reward: 0,
      armor: 0,

      reset() {
        this.active = false;
        this.hp = 0;
        this.pathProgress = 0;
        this.target = null;
      }
    };
  }

  /**
   * Spawn an enemy
   */
  spawnEnemy(type, pathKey = 'default') {
    const enemyConfig = this.enemyData[type];
    if (!enemyConfig) {
      console.error(`Enemy type "${type}" not found`);
      return null;
    }

    const enemy = this.pool.acquire();
    enemy.id = this.nextId++;
    enemy.type = type;
    enemy.enemyType = enemyConfig.type; // 'ground' or 'air'
    enemy.hp = enemyConfig.hp;
    enemy.maxHp = enemyConfig.hp;
    enemy.speed = enemyConfig.speed;
    enemy.reward = enemyConfig.reward;
    enemy.armor = enemyConfig.armor || 0;
    enemy.size = enemyConfig.size || 20;
    enemy.flyHeight = enemyConfig.flyHeight || 0;
    enemy.pathKey = pathKey;
    enemy.pathProgress = 0;
    enemy.active = true;

    // Support enemies (like Spindler)
    enemy.buffRadius = enemyConfig.buffRadius || 0;
    enemy.buffType = enemyConfig.buffType || null;
    enemy.buffAmount = enemyConfig.buffAmount || 0;

    // Update position
    const pos = this.pathSystem.getPosition(pathKey, 0, enemy.enemyType === 'air');
    enemy.x = pos.x;
    enemy.y = pos.y;

    this.enemies.push(enemy);
    return enemy;
  }

  /**
   * Queue enemies to spawn from wave data
   */
  queueWaveSpawn(waveData, pathKey = 'default') {
    this.spawnQueue = [];

    for (const enemyGroup of waveData.enemies) {
      const count = enemyGroup.count;
      const interval = enemyGroup.interval;
      const type = enemyGroup.type;

      for (let i = 0; i < count; i++) {
        this.spawnQueue.push({
          type: type,
          pathKey: pathKey,
          delay: i * interval
        });
      }
    }

    // Sort by delay
    this.spawnQueue.sort((a, b) => a.delay - b.delay);
    this.spawnTimer = 0;
  }

  /**
   * Update spawn queue
   */
  updateSpawning(dt) {
    if (this.spawnQueue.length === 0) return;

    this.spawnTimer += dt;

    while (this.spawnQueue.length > 0 && this.spawnQueue[0].delay <= this.spawnTimer) {
      const spawn = this.spawnQueue.shift();
      this.spawnEnemy(spawn.type, spawn.pathKey);
    }
  }

  /**
   * Damage an enemy
   */
  damageEnemy(enemy, damage) {
    if (!enemy.active) return false;

    const actualDamage = Math.max(1, damage - enemy.armor);
    enemy.hp -= actualDamage;

    if (enemy.hp <= 0) {
      enemy.hp = 0;
      enemy.active = false;
      return true; // Enemy killed
    }

    return false; // Enemy damaged but alive
  }

  /**
   * Update all enemies
   */
  update(dt) {
    this.updateSpawning(dt);

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];

      if (!enemy.active) {
        // Remove and return to pool
        this.enemies.splice(i, 1);
        this.pool.release(enemy);
        continue;
      }

      // Get speed with buffs applied
      let speed = enemy.speed;

      // Apply buffs from nearby Spindlers
      if (enemy.type !== 'spindler') {
        for (const other of this.enemies) {
          if (other.type === 'spindler' && other.active && other.buffRadius > 0) {
            const dx = enemy.x - other.x;
            const dy = enemy.y - other.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist <= other.buffRadius) {
              if (other.buffType === 'speed') {
                speed *= (1 + other.buffAmount);
              }
            }
          }
        }
      }

      // Move along path
      const pathLength = this.pathSystem.getPathLength(enemy.pathKey);
      const progressDelta = (speed * dt) / pathLength;
      enemy.pathProgress += progressDelta;

      // Check if reached end
      if (enemy.pathProgress >= 1) {
        enemy.active = false;
        enemy.escaped = true; // Flag for damage to player
        continue;
      }

      // Update position
      const pos = this.pathSystem.getPosition(
        enemy.pathKey,
        enemy.pathProgress,
        enemy.enemyType === 'air'
      );
      enemy.x = pos.x;
      enemy.y = pos.y;
    }
  }

  /**
   * Render all enemies
   */
  render(canvas, assets) {
    for (const enemy of this.enemies) {
      if (!enemy.active) continue;

      // Get image (or placeholder)
      const imageKey = `enemy-${enemy.type}`;
      let image = assets.getImage(imageKey);

      if (!image) {
        const color = enemy.enemyType === 'air' ? '#ff6b6b' : '#c92a2a';
        image = assets.createPlaceholder(imageKey, enemy.size, enemy.size, color);
      }

      // Draw enemy
      canvas.drawImageCentered(image, enemy.x, enemy.y, enemy.size, enemy.size);

      // Draw HP bar
      this.drawHealthBar(canvas, enemy);

      // Draw buff indicator for Spindlers
      if (enemy.buffRadius > 0) {
        canvas.setAlpha(0.1);
        canvas.drawCircle(enemy.x, enemy.y, enemy.buffRadius, '#ffec99', true);
        canvas.setAlpha(1.0);
      }
    }
  }

  /**
   * Draw health bar above enemy
   */
  drawHealthBar(canvas, enemy) {
    const barWidth = enemy.size;
    const barHeight = 4;
    const x = enemy.x - barWidth / 2;
    const y = enemy.y - enemy.size / 2 - 8;

    // Background
    canvas.drawRect(x, y, barWidth, barHeight, '#000000');

    // Health
    const healthPercent = enemy.hp / enemy.maxHp;
    const color = healthPercent > 0.5 ? '#4caf50' : healthPercent > 0.25 ? '#ff9800' : '#f44336';
    canvas.drawRect(x, y, barWidth * healthPercent, barHeight, color);
  }

  /**
   * Check if wave is complete
   */
  isWaveComplete() {
    return this.spawnQueue.length === 0 && this.enemies.length === 0;
  }

  /**
   * Get count of enemies that escaped
   */
  getEscapedCount() {
    let count = 0;
    for (const enemy of this.enemies) {
      if (enemy.escaped) {
        count++;
        enemy.escaped = false; // Reset flag
      }
    }
    return count;
  }

  /**
   * Clear all enemies
   */
  clear() {
    for (const enemy of this.enemies) {
      this.pool.release(enemy);
    }
    this.enemies = [];
    this.spawnQueue = [];
    this.spawnTimer = 0;
  }

  /**
   * Get active enemy count
   */
  getEnemyCount() {
    return this.enemies.length;
  }
}
