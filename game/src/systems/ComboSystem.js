/**
 * ComboSystem.js - Tower combo/synergy detection
 * Detects adjacent towers (≤60px) and applies bonuses
 * Based on PDF spec section 4C
 */

export default class ComboSystem {
  constructor(combosData) {
    this.combos = combosData;
    this.activeCombos = new Map(); // Map of tower -> active combos
  }

  /**
   * Detect all active combos for a list of towers
   * Returns map of tower ID -> array of active combo bonuses
   */
  detectCombos(towers) {
    this.activeCombos.clear();

    // Check each tower against every other tower
    for (let i = 0; i < towers.length; i++) {
      const tower1 = towers[i];
      const towerCombos = [];

      for (let j = 0; j < towers.length; j++) {
        if (i === j) continue;

        const tower2 = towers[j];

        // Check distance (≤60px as per spec)
        const dx = tower2.x - tower1.x;
        const dy = tower2.y - tower1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= 60) {
          // Check if these towers form a combo
          const combo = this.findCombo(tower1.type, tower2.type);
          if (combo) {
            towerCombos.push({
              combo: combo,
              partner: tower2,
              distance: distance
            });
          }
        }
      }

      if (towerCombos.length > 0) {
        this.activeCombos.set(tower1.id, towerCombos);
      }
    }

    return this.activeCombos;
  }

  /**
   * Find combo definition for two tower types
   */
  findCombo(type1, type2) {
    for (const comboKey in this.combos) {
      const combo = this.combos[comboKey];
      const towers = combo.towers;

      // Check if both tower types are in this combo
      if (
        (towers.includes(type1) && towers.includes(type2)) &&
        type1 !== type2
      ) {
        return combo;
      }
    }

    return null;
  }

  /**
   * Get active combos for a specific tower
   */
  getActiveCombos(towerId) {
    return this.activeCombos.get(towerId) || [];
  }

  /**
   * Apply combo bonuses to a tower's stats
   * Returns modified stats object
   */
  applyBonuses(tower, baseStats) {
    const combos = this.getActiveCombos(tower.id);
    if (combos.length === 0) return { ...baseStats };

    const stats = { ...baseStats };

    // Apply each combo's bonuses
    for (const { combo } of combos) {
      const bonus = combo.bonus;

      // Multiplicative bonuses
      if (bonus.fireRateMultiplier) {
        stats.fireRate = (stats.fireRate || baseStats.fireRate) * bonus.fireRateMultiplier;
      }
      if (bonus.damageMultiplier) {
        stats.damage = (stats.damage || baseStats.damage) * bonus.damageMultiplier;
      }

      // Additive bonuses
      if (bonus.damageBonus) {
        stats.damage = (stats.damage || baseStats.damage) + bonus.damageBonus;
      }
      if (bonus.rangeBonus) {
        stats.range = (stats.range || baseStats.range) + bonus.rangeBonus;
      }
      if (bonus.splashRadiusBonus) {
        stats.splashRadius = (stats.splashRadius || baseStats.splashRadius || 0) + bonus.splashRadiusBonus;
      }
      if (bonus.armorBonus) {
        stats.armor = (stats.armor || 0) + bonus.armorBonus;
      }

      // Special bonuses
      if (bonus.canTargetAir) {
        stats.canTargetAir = true;
      }
    }

    return stats;
  }

  /**
   * Get all unique combos active on the field
   * Returns array of combo names
   */
  getUniqueActiveCombos() {
    const uniqueCombos = new Set();

    for (const combos of this.activeCombos.values()) {
      for (const { combo } of combos) {
        uniqueCombos.add(combo.name);
      }
    }

    return Array.from(uniqueCombos);
  }

  /**
   * Check if a specific combo is active
   */
  isComboActive(comboId) {
    for (const combos of this.activeCombos.values()) {
      for (const { combo } of combos) {
        if (combo.id === comboId) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Get combo bonus description for display
   */
  getComboDescription(comboId) {
    const combo = this.combos[comboId];
    if (!combo) return '';

    const parts = [];
    const bonus = combo.bonus;

    if (bonus.fireRateMultiplier) {
      const percent = Math.round((bonus.fireRateMultiplier - 1) * 100);
      parts.push(`+${percent}% Fire Rate`);
    }
    if (bonus.damageMultiplier) {
      const percent = Math.round((bonus.damageMultiplier - 1) * 100);
      parts.push(`+${percent}% Damage`);
    }
    if (bonus.damageBonus) {
      parts.push(`+${bonus.damageBonus} Damage`);
    }
    if (bonus.rangeBonus) {
      parts.push(`+${bonus.rangeBonus} Range`);
    }
    if (bonus.splashRadiusBonus) {
      parts.push(`+${bonus.splashRadiusBonus} Splash`);
    }
    if (bonus.canTargetAir) {
      parts.push('Can Target Air');
    }

    return parts.join(', ');
  }

  /**
   * Clear all combo data
   */
  clear() {
    this.activeCombos.clear();
  }
}
