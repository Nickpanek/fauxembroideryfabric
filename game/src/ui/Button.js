/**
 * Button.js - Reusable button component
 * Touch-optimized with minimum 44×44px hit area
 */

export default class Button {
  constructor(x, y, width, height, text, onClick) {
    this.x = x;
    this.y = y;
    this.width = Math.max(width, 44); // Minimum touch target
    this.height = Math.max(height, 44);
    this.text = text;
    this.onClick = onClick;

    this.enabled = true;
    this.visible = true;
    this.pressed = false;
    this.hovered = false;

    // Style
    this.backgroundColor = '#4a90e2';
    this.textColor = '#ffffff';
    this.disabledColor = '#888888';
    this.hoverColor = '#357abd';
    this.pressedColor = '#2868a8';
    this.borderRadius = 4;
    this.fontSize = 16;
    this.fontFamily = 'Arial';
  }

  /**
   * Check if point is inside button
   */
  contains(x, y) {
    return (
      x >= this.x &&
      x <= this.x + this.width &&
      y >= this.y &&
      y <= this.y + this.height
    );
  }

  /**
   * Handle pointer down
   */
  handlePointerDown(x, y) {
    if (!this.enabled || !this.visible) return false;

    if (this.contains(x, y)) {
      this.pressed = true;
      return true;
    }

    return false;
  }

  /**
   * Handle pointer up
   */
  handlePointerUp(x, y) {
    if (!this.enabled || !this.visible) return false;

    const wasPressed = this.pressed;
    this.pressed = false;

    if (wasPressed && this.contains(x, y)) {
      if (this.onClick) {
        this.onClick();
      }
      return true;
    }

    return false;
  }

  /**
   * Handle pointer move
   */
  handlePointerMove(x, y) {
    if (!this.enabled || !this.visible) {
      this.hovered = false;
      return false;
    }

    this.hovered = this.contains(x, y);
    return this.hovered;
  }

  /**
   * Render button
   */
  render(canvas) {
    if (!this.visible) return;

    // Determine color
    let bgColor = this.backgroundColor;
    if (!this.enabled) {
      bgColor = this.disabledColor;
    } else if (this.pressed) {
      bgColor = this.pressedColor;
    } else if (this.hovered) {
      bgColor = this.hoverColor;
    }

    // Draw background
    canvas.drawRect(this.x, this.y, this.width, this.height, bgColor, true);

    // Draw border
    canvas.drawRect(this.x, this.y, this.width, this.height, '#000000', false);

    // Draw text
    canvas.drawText(this.text, this.x + this.width / 2, this.y + this.height / 2, {
      font: `${this.fontSize}px ${this.fontFamily}`,
      color: this.textColor,
      align: 'center',
      baseline: 'middle'
    });
  }

  /**
   * Set enabled state
   */
  setEnabled(enabled) {
    this.enabled = enabled;
    if (!enabled) {
      this.pressed = false;
      this.hovered = false;
    }
  }

  /**
   * Set visibility
   */
  setVisible(visible) {
    this.visible = visible;
    if (!visible) {
      this.pressed = false;
      this.hovered = false;
    }
  }

  /**
   * Set text
   */
  setText(text) {
    this.text = text;
  }

  /**
   * Set position
   */
  setPosition(x, y) {
    this.x = x;
    this.y = y;
  }

  /**
   * Set size
   */
  setSize(width, height) {
    this.width = Math.max(width, 44);
    this.height = Math.max(height, 44);
  }
}

/**
 * Icon button - button with icon instead of text
 */
export class IconButton extends Button {
  constructor(x, y, size, iconKey, onClick) {
    super(x, y, size, size, '', onClick);
    this.iconKey = iconKey;
    this.iconSize = size * 0.6;
  }

  render(canvas, assets) {
    if (!this.visible) return;

    // Determine color
    let bgColor = this.backgroundColor;
    if (!this.enabled) {
      bgColor = this.disabledColor;
    } else if (this.pressed) {
      bgColor = this.pressedColor;
    } else if (this.hovered) {
      bgColor = this.hoverColor;
    }

    // Draw background (circular)
    canvas.drawCircle(
      this.x + this.width / 2,
      this.y + this.height / 2,
      this.width / 2,
      bgColor,
      true
    );

    // Draw icon
    const icon = assets.getImage(this.iconKey);
    if (icon) {
      canvas.drawImageCentered(
        icon,
        this.x + this.width / 2,
        this.y + this.height / 2,
        this.iconSize,
        this.iconSize
      );
    } else {
      // Fallback: draw text
      canvas.drawText(this.iconKey, this.x + this.width / 2, this.y + this.height / 2, {
        font: '20px Arial',
        color: this.textColor,
        align: 'center',
        baseline: 'middle'
      });
    }
  }
}
