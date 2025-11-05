/**
 * TowerPanel.js - Right side panel for selected tower
 * Shows stats, combo badges, upgrade/sell buttons
 * Based on PDF spec section 8
 */

import Button from './Button.js';

export default class TowerPanel {
  constructor(width, height) {
    this.width = width;
    this.height = height;

    // Panel dimensions
    this.panelWidth = 150;
    this.panelX = width - this.panelWidth;
    this.panelY = 70; // Below HUD
    this.panelHeight = height - this.panelY - 110; // Above tray

    this.selectedTower = null;
    this.visible = false;

    // Buttons
    this.upgradeButton = new Button(
      this.panelX + 10,
      this.panelY + this.panelHeight - 90,
      this.panelWidth - 20,
      40,
      'Upgrade',
      () => this.upgrade()
    );

    this.sellButton = new Button(
      this.panelX + 10,
      this.panelY + this.panelHeight - 40,
      this.panelWidth - 20,
      40,
      'Sell',
      () => this.sell()
    );

    this.upgradeButton.backgroundColor = '#4caf50';
    this.sellButton.backgroundColor = '#f44336';

    this.onUpgrade = null;
    this.onSell = null;
  }

  /**
   * Set selected tower
   */
  setTower(tower, towerData, comboSystem) {
    this.selectedTower = tower;
    this.towerData = towerData;
    this.comboSystem = comboSystem;
    this.visible = tower !== null;

    if (tower) {
      // Update button states
      const config = towerData[tower.type];
      const canUpgrade = config.upgrades && tower.level < config.upgrades.length + 1;

      this.upgradeButton.setEnabled(canUpgrade);

      if (canUpgrade) {
        const upgradeCost = config.upgrades[tower.level - 1].cost;
        this.upgradeButton.setText(`Upgrade ($${upgradeCost})`);
      } else {
        this.upgradeButton.setText('Max Level');
      }

      // Calculate sell value (70% of total cost)
      const sellValue = this.calculateSellValue(tower, config);
      this.sellButton.setText(`Sell ($${sellValue})`);
    }
  }

  /**
   * Calculate sell value
   */
  calculateSellValue(tower, config) {
    let totalCost = config.cost;

    if (config.upgrades) {
      for (let i = 0; i < tower.level - 1; i++) {
        totalCost += config.upgrades[i].cost;
      }
    }

    return Math.floor(totalCost * 0.7);
  }

  /**
   * Upgrade tower
   */
  upgrade() {
    if (this.onUpgrade && this.selectedTower) {
      this.onUpgrade(this.selectedTower);
    }
  }

  /**
   * Sell tower
   */
  sell() {
    if (this.onSell && this.selectedTower) {
      this.onSell(this.selectedTower);
    }
  }

  /**
   * Handle input
   */
  handlePointerDown(x, y) {
    if (!this.visible) return false;

    if (this.upgradeButton.handlePointerDown(x, y)) return true;
    if (this.sellButton.handlePointerDown(x, y)) return true;

    // Check if clicking in panel area
    return x >= this.panelX;
  }

  handlePointerUp(x, y) {
    if (!this.visible) return false;

    if (this.upgradeButton.handlePointerUp(x, y)) return true;
    if (this.sellButton.handlePointerUp(x, y)) return true;

    return false;
  }

  handlePointerMove(x, y) {
    if (!this.visible) return;

    this.upgradeButton.handlePointerMove(x, y);
    this.sellButton.handlePointerMove(x, y);
  }

  /**
   * Render panel
   */
  render(canvas, assets) {
    if (!this.visible || !this.selectedTower) return;

    // Background
    canvas.drawRect(
      this.panelX,
      this.panelY,
      this.panelWidth,
      this.panelHeight,
      'rgba(0, 0, 0, 0.8)',
      true
    );

    // Border
    canvas.drawLine(this.panelX, this.panelY, this.panelX, this.panelY + this.panelHeight, '#333333', 2);

    let y = this.panelY + 10;

    // Tower name
    const config = this.towerData[this.selectedTower.type];
    canvas.drawText(config.name, this.panelX + 10, y, {
      font: 'bold 14px Arial',
      color: '#ffffff',
      baseline: 'top'
    });

    y += 25;

    // Level
    canvas.drawText(`Level ${this.selectedTower.level}`, this.panelX + 10, y, {
      font: '12px Arial',
      color: '#aaaaaa',
      baseline: 'top'
    });

    y += 25;

    // Stats
    const stats = this.getEffectiveStats();

    canvas.drawText(`Damage: ${Math.round(stats.damage)}`, this.panelX + 10, y, {
      font: '11px Arial',
      color: '#ffffff',
      baseline: 'top'
    });
    y += 18;

    canvas.drawText(`Range: ${Math.round(stats.range)}`, this.panelX + 10, y, {
      font: '11px Arial',
      color: '#ffffff',
      baseline: 'top'
    });
    y += 18;

    const fireRate = stats.fireRate ? (1 / stats.fireRate).toFixed(1) : '0';
    canvas.drawText(`Fire Rate: ${fireRate}/s`, this.panelX + 10, y, {
      font: '11px Arial',
      color: '#ffffff',
      baseline: 'top'
    });
    y += 25;

    // Combo badges
    if (this.comboSystem) {
      const combos = this.comboSystem.getActiveCombos(this.selectedTower.id);

      if (combos.length > 0) {
        canvas.drawText('Combos:', this.panelX + 10, y, {
          font: 'bold 11px Arial',
          color: '#ffd700',
          baseline: 'top'
        });
        y += 18;

        for (const { combo } of combos) {
          // Draw combo badge
          canvas.drawRect(this.panelX + 10, y, this.panelWidth - 20, 20, '#4a90e2', true);
          canvas.drawText(combo.name, this.panelX + this.panelWidth / 2, y + 10, {
            font: '10px Arial',
            color: '#ffffff',
            align: 'center',
            baseline: 'middle'
          });
          y += 25;
        }
      }
    }

    // Stats
    y += 10;
    canvas.drawText(`Kills: ${this.selectedTower.killCount || 0}`, this.panelX + 10, y, {
      font: '10px Arial',
      color: '#aaaaaa',
      baseline: 'top'
    });

    // Buttons
    this.upgradeButton.render(canvas);
    this.sellButton.render(canvas);
  }

  /**
   * Get effective stats with combo bonuses
   */
  getEffectiveStats() {
    if (!this.comboSystem) {
      return this.selectedTower;
    }

    return this.comboSystem.applyBonuses(this.selectedTower, this.selectedTower);
  }

  /**
   * Set callbacks
   */
  setCallbacks(onUpgrade, onSell) {
    this.onUpgrade = onUpgrade;
    this.onSell = onSell;
  }

  /**
   * Hide panel
   */
  hide() {
    this.visible = false;
    this.selectedTower = null;
  }
}
