/**
 * TowerTray.js - Bottom tower selection tray
 * Shows tower icons with costs, greyed if can't afford
 * Based on PDF spec section 8
 */

export default class TowerTray {
  constructor(width, height, towerData) {
    this.width = width;
    this.height = height;
    this.towerData = towerData;

    // Tray dimensions
    this.trayHeight = 100;
    this.trayY = height - this.trayHeight;

    // Tower slots
    this.slots = [];
    this.selectedSlot = null;

    // Initialize tower slots (5 towers from spec)
    const towerTypes = ['pinLauncher', 'buttonMortar', 'woolCannon', 'patchTotem', 'spindleWard'];
    const slotSize = 70;
    const spacing = (width - slotSize * towerTypes.length) / (towerTypes.length + 1);

    let x = spacing;
    for (const type of towerTypes) {
      const tower = towerData[type];
      this.slots.push({
        type: type,
        name: tower.name,
        cost: tower.cost,
        x: x,
        y: this.trayY + 15,
        width: slotSize,
        height: slotSize,
        affordable: true,
        hovered: false
      });
      x += slotSize + spacing;
    }

    this.fleece = 100; // Current player fleece
  }

  /**
   * Update tray state
   */
  update(fleece) {
    this.fleece = fleece;

    // Update affordability
    for (const slot of this.slots) {
      slot.affordable = fleece >= slot.cost;
    }
  }

  /**
   * Handle pointer down
   */
  handlePointerDown(x, y) {
    if (y < this.trayY) return null;

    for (const slot of this.slots) {
      if (this.contains(slot, x, y)) {
        if (slot.affordable) {
          this.selectedSlot = slot;
          return slot.type;
        }
        return null;
      }
    }

    return null;
  }

  /**
   * Handle pointer up
   */
  handlePointerUp(x, y) {
    // Deselect if pointer is released
    if (this.selectedSlot) {
      this.selectedSlot = null;
      return true;
    }
    return false;
  }

  /**
   * Handle pointer move
   */
  handlePointerMove(x, y) {
    for (const slot of this.slots) {
      slot.hovered = this.contains(slot, x, y);
    }
  }

  /**
   * Check if point is inside slot
   */
  contains(slot, x, y) {
    return (
      x >= slot.x &&
      x <= slot.x + slot.width &&
      y >= slot.y &&
      y <= slot.y + slot.height
    );
  }

  /**
   * Deselect current tower
   */
  deselect() {
    this.selectedSlot = null;
  }

  /**
   * Render tray
   */
  render(canvas, assets) {
    // Background
    canvas.drawRect(0, this.trayY, this.width, this.trayHeight, 'rgba(0, 0, 0, 0.8)', true);

    // Top border
    canvas.drawLine(0, this.trayY, this.width, this.trayY, '#333333', 2);

    // Render slots
    for (const slot of this.slots) {
      this.renderSlot(canvas, assets, slot);
    }
  }

  /**
   * Render individual tower slot
   */
  renderSlot(canvas, assets, slot) {
    // Background
    const bgColor = slot === this.selectedSlot ? '#4a90e2' :
                    slot.hovered ? '#555555' :
                    '#333333';
    canvas.drawRect(slot.x, slot.y, slot.width, slot.height, bgColor, true);

    // Border
    const borderColor = slot.affordable ? '#ffffff' : '#666666';
    canvas.drawRect(slot.x, slot.y, slot.width, slot.height, borderColor, false);

    // Tower icon
    const imageKey = `tower-${slot.type}`;
    let image = assets.getImage(imageKey);

    if (!image) {
      image = assets.createPlaceholder(imageKey, 50, 50, '#4a90e2');
    }

    // Apply grey filter if not affordable
    if (!slot.affordable) {
      canvas.setAlpha(0.3);
    }

    canvas.drawImageCentered(
      image,
      slot.x + slot.width / 2,
      slot.y + slot.height / 2 - 10,
      50,
      50
    );

    canvas.setAlpha(1.0);

    // Cost
    const costColor = slot.affordable ? '#ffd700' : '#888888';
    canvas.drawText(`${slot.cost}`, slot.x + slot.width / 2, slot.y + slot.height - 8, {
      font: 'bold 14px Arial',
      color: costColor,
      align: 'center',
      baseline: 'bottom'
    });

    // Hotkey hint (optional)
    if (slot.hovered) {
      // Show tooltip with tower name
      const tooltipY = slot.y - 30;
      const tooltipWidth = 120;
      const tooltipX = slot.x + slot.width / 2 - tooltipWidth / 2;

      canvas.drawRect(tooltipX, tooltipY, tooltipWidth, 25, 'rgba(0, 0, 0, 0.9)', true);
      canvas.drawText(slot.name, tooltipX + tooltipWidth / 2, tooltipY + 12, {
        font: '12px Arial',
        color: '#ffffff',
        align: 'center',
        baseline: 'middle'
      });
    }
  }

  /**
   * Check if point is in tray area
   */
  containsPoint(x, y) {
    return y >= this.trayY;
  }
}
