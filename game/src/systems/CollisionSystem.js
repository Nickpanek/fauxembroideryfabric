/**
 * CollisionSystem.js - Manual collision detection
 * Circle vs circle for projectiles and enemies
 * Range radius for towers
 * Based on PDF spec section 4B - no physics engine
 */

export default class CollisionSystem {
  /**
   * Check if two circles are colliding
   * Used for projectile vs enemy collision
   */
  static circleVsCircle(x1, y1, r1, x2, y2, r2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const distSquared = dx * dx + dy * dy;
    const radiiSum = r1 + r2;
    return distSquared <= radiiSum * radiiSum;
  }

  /**
   * Check if point is within circle
   * Used for tower range checks
   */
  static pointInCircle(px, py, cx, cy, radius) {
    const dx = px - cx;
    const dy = py - cy;
    return (dx * dx + dy * dy) <= radius * radius;
  }

  /**
   * Check if point is within rectangle
   * Used for UI click detection
   */
  static pointInRect(px, py, x, y, width, height) {
    return px >= x && px <= x + width && py >= y && py <= y + height;
  }

  /**
   * Get distance between two points
   */
  static distance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Get squared distance (faster when you don't need exact distance)
   */
  static distanceSquared(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return dx * dx + dy * dy;
  }

  /**
   * Find enemies within range of a tower
   * @param {Object} tower - Tower object with x, y, range
   * @param {Array} enemies - Array of enemy objects
   * @param {string} targetType - 'ground', 'air', or 'both'
   * @returns {Array} Enemies within range
   */
  static getEnemiesInRange(tower, enemies, targetType = 'both') {
    const inRange = [];

    for (const enemy of enemies) {
      if (!enemy.active || enemy.hp <= 0) continue;

      // Check target type compatibility
      if (targetType === 'ground' && enemy.type === 'air') continue;
      if (targetType === 'air' && enemy.type === 'ground') continue;

      // Check if in range
      if (this.pointInCircle(enemy.x, enemy.y, tower.x, tower.y, tower.range)) {
        inRange.push(enemy);
      }
    }

    return inRange;
  }

  /**
   * Find closest enemy to a tower
   * @param {Object} tower - Tower object with x, y, range
   * @param {Array} enemies - Array of enemy objects
   * @param {string} targetType - 'ground', 'air', or 'both'
   * @returns {Object|null} Closest enemy or null
   */
  static getClosestEnemy(tower, enemies, targetType = 'both') {
    let closest = null;
    let closestDist = Infinity;

    for (const enemy of enemies) {
      if (!enemy.active || enemy.hp <= 0) continue;

      // Check target type compatibility
      if (targetType === 'ground' && enemy.type === 'air') continue;
      if (targetType === 'air' && enemy.type === 'ground') continue;

      const dist = this.distance(tower.x, tower.y, enemy.x, enemy.y);

      if (dist <= tower.range && dist < closestDist) {
        closest = enemy;
        closestDist = dist;
      }
    }

    return closest;
  }

  /**
   * Find furthest enemy along path (most progress)
   * @param {Object} tower - Tower object with x, y, range
   * @param {Array} enemies - Array of enemy objects
   * @param {string} targetType - 'ground', 'air', or 'both'
   * @returns {Object|null} Furthest enemy or null
   */
  static getFurthestEnemy(tower, enemies, targetType = 'both') {
    let furthest = null;
    let furthestProgress = -1;

    for (const enemy of enemies) {
      if (!enemy.active || enemy.hp <= 0) continue;

      // Check target type compatibility
      if (targetType === 'ground' && enemy.type === 'air') continue;
      if (targetType === 'air' && enemy.type === 'ground') continue;

      // Check if in range
      if (!this.pointInCircle(enemy.x, enemy.y, tower.x, tower.y, tower.range)) {
        continue;
      }

      if (enemy.pathProgress > furthestProgress) {
        furthest = enemy;
        furthestProgress = enemy.pathProgress;
      }
    }

    return furthest;
  }

  /**
   * Check projectile collision with enemies
   * Returns first enemy hit, or null
   */
  static checkProjectileCollision(projectile, enemies) {
    const radius = projectile.radius || 8;

    for (const enemy of enemies) {
      if (!enemy.active || enemy.hp <= 0) continue;

      // Check target type compatibility
      if (projectile.targetType === 'ground' && enemy.type === 'air') continue;
      if (projectile.targetType === 'air' && enemy.type === 'ground') continue;

      const enemyRadius = enemy.size / 2;

      if (this.circleVsCircle(
        projectile.x, projectile.y, radius,
        enemy.x, enemy.y, enemyRadius
      )) {
        return enemy;
      }
    }

    return null;
  }

  /**
   * Get all enemies within splash radius
   * Used for AoE attacks like Button Mortar
   */
  static getEnemiesInSplash(x, y, radius, enemies, targetType = 'both') {
    const inSplash = [];

    for (const enemy of enemies) {
      if (!enemy.active || enemy.hp <= 0) continue;

      // Check target type compatibility
      if (targetType === 'ground' && enemy.type === 'air') continue;
      if (targetType === 'air' && enemy.type === 'ground') continue;

      if (this.pointInCircle(enemy.x, enemy.y, x, y, radius)) {
        inSplash.push(enemy);
      }
    }

    return inSplash;
  }

  /**
   * Check if grid position is valid for tower placement
   * Must be within bounds and not overlapping path or other towers
   */
  static isValidPlacement(gridX, gridY, gridWidth, gridHeight, towers, pathTiles = []) {
    // Check bounds
    if (gridX < 0 || gridX >= gridWidth || gridY < 0 || gridY >= gridHeight) {
      return false;
    }

    // Check if tile is on path
    for (const pathTile of pathTiles) {
      if (pathTile.x === gridX && pathTile.y === gridY) {
        return false;
      }
    }

    // Check if tower already exists at this position
    for (const tower of towers) {
      if (tower.gridX === gridX && tower.gridY === gridY) {
        return false;
      }
    }

    return true;
  }
}
