/**
 * ProjectileSystem.js - Projectile/bullet movement and collision
 * Uses object pooling for performance (max 60 projectiles)
 * Based on PDF spec
 */

import { ProjectilePool } from '../engine/ObjectPool.js';
import CollisionSystem from './CollisionSystem.js';

export default class ProjectileSystem {
  constructor() {
    this.projectiles = [];

    // Object pool for projectiles
    this.pool = new ProjectilePool(() => this.createProjectileObject());
  }

  /**
   * Create a new projectile object (for pool)
   */
  createProjectileObject() {
    return {
      id: 0,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      damage: 0,
      speed: 0,
      type: '',
      targetType: 'ground',
      target: null,
      active: false,
      radius: 8,
      splashRadius: 0,
      lifetime: 5,

      reset() {
        this.active = false;
        this.target = null;
        this.lifetime = 5;
      }
    };
  }

  /**
   * Create a projectile from tower to target
   */
  createProjectile(tower, target, stats) {
    const projectile = this.pool.acquire();

    projectile.id = Date.now() + Math.random();
    projectile.x = tower.x;
    projectile.y = tower.y;
    projectile.damage = stats.damage;
    projectile.speed = stats.projectileSpeed || 300;
    projectile.type = stats.projectileType || 'default';
    projectile.targetType = tower.targetType;
    projectile.target = target;
    projectile.active = true;
    projectile.splashRadius = stats.splashRadius || 0;
    projectile.lifetime = 5;
    projectile.tower = tower;

    // Calculate initial velocity toward target
    const dx = target.x - tower.x;
    const dy = target.y - tower.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 0) {
      projectile.vx = (dx / dist) * projectile.speed;
      projectile.vy = (dy / dist) * projectile.speed;
    }

    this.projectiles.push(projectile);
    return projectile;
  }

  /**
   * Update all projectiles
   */
  update(dt, enemies) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const projectile = this.projectiles[i];

      if (!projectile.active) {
        this.projectiles.splice(i, 1);
        this.pool.release(projectile);
        continue;
      }

      // Decrease lifetime
      projectile.lifetime -= dt;
      if (projectile.lifetime <= 0) {
        projectile.active = false;
        continue;
      }

      // Homing behavior - recalculate velocity toward target
      if (projectile.target && projectile.target.active && projectile.target.hp > 0) {
        const dx = projectile.target.x - projectile.x;
        const dy = projectile.target.y - projectile.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 0) {
          projectile.vx = (dx / dist) * projectile.speed;
          projectile.vy = (dy / dist) * projectile.speed;
        }
      }

      // Move projectile
      projectile.x += projectile.vx * dt;
      projectile.y += projectile.vy * dt;

      // Check collision with enemies
      const hitEnemy = CollisionSystem.checkProjectileCollision(projectile, enemies);

      if (hitEnemy) {
        // Damage primary target
        const killed = this.damageEnemy(hitEnemy, projectile.damage);

        if (killed && projectile.tower) {
          projectile.tower.killCount++;
        }

        // Splash damage
        if (projectile.splashRadius > 0) {
          const splashEnemies = CollisionSystem.getEnemiesInSplash(
            projectile.x,
            projectile.y,
            projectile.splashRadius,
            enemies,
            projectile.targetType
          );

          for (const enemy of splashEnemies) {
            if (enemy !== hitEnemy) {
              // 50% damage to splash targets
              const splashKilled = this.damageEnemy(enemy, projectile.damage * 0.5);
              if (splashKilled && projectile.tower) {
                projectile.tower.killCount++;
              }
            }
          }
        }

        // Track damage for tower stats
        if (projectile.tower) {
          projectile.tower.totalDamage += projectile.damage;
        }

        projectile.active = false;
      }

      // Remove if off screen
      if (projectile.x < -100 || projectile.x > 640 ||
          projectile.y < -100 || projectile.y > 1060) {
        projectile.active = false;
      }
    }
  }

  /**
   * Damage an enemy (delegates to enemy system)
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
   * Render all projectiles
   */
  render(canvas, assets) {
    for (const projectile of this.projectiles) {
      if (!projectile.active) continue;

      // Get image (or placeholder)
      const imageKey = `projectile-${projectile.type}`;
      let image = assets.getImage(imageKey);

      if (!image) {
        const size = projectile.radius * 2;
        const color = projectile.type === 'dart' ? '#e3f2fd' : '#ffd700';
        image = assets.createPlaceholder(imageKey, size, size, color);
      }

      // Draw projectile
      const size = projectile.radius * 2;
      canvas.drawImageCentered(image, projectile.x, projectile.y, size, size);
    }
  }

  /**
   * Clear all projectiles
   */
  clear() {
    for (const projectile of this.projectiles) {
      this.pool.release(projectile);
    }
    this.projectiles = [];
  }

  /**
   * Get active projectile count
   */
  getProjectileCount() {
    return this.projectiles.length;
  }
}
