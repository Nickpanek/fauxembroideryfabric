/**
 * Canvas.js - Rendering utilities for custom canvas engine
 * Handles canvas setup, scaling, and common rendering operations
 */

export default class Canvas {
  constructor(canvasElement, width = 540, height = 960) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d');
    this.logicalWidth = width;
    this.logicalHeight = height;
    this.scale = 1;

    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  /**
   * Resize canvas to fit screen while maintaining aspect ratio
   */
  resize() {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const targetAspect = this.logicalWidth / this.logicalHeight;
    const windowAspect = windowWidth / windowHeight;

    let width, height;

    if (windowAspect > targetAspect) {
      // Window is wider than target - fit to height
      height = windowHeight;
      width = height * targetAspect;
    } else {
      // Window is taller than target - fit to width
      width = windowWidth;
      height = width / targetAspect;
    }

    this.canvas.width = this.logicalWidth;
    this.canvas.height = this.logicalHeight;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;

    this.scale = width / this.logicalWidth;
    this.canvasWidth = width;
    this.canvasHeight = height;
  }

  /**
   * Clear the entire canvas
   */
  clear() {
    this.ctx.clearRect(0, 0, this.logicalWidth, this.logicalHeight);
  }

  /**
   * Fill canvas with solid color
   */
  fillBackground(color) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, this.logicalWidth, this.logicalHeight);
  }

  /**
   * Draw an image
   */
  drawImage(image, x, y, width, height) {
    if (!image || !image.complete) return;
    this.ctx.drawImage(image, x, y, width, height);
  }

  /**
   * Draw an image centered
   */
  drawImageCentered(image, x, y, width, height) {
    if (!image || !image.complete) return;
    this.ctx.drawImage(image, x - width / 2, y - height / 2, width, height);
  }

  /**
   * Draw a circle
   */
  drawCircle(x, y, radius, color, fill = true) {
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx[fill ? 'fillStyle' : 'strokeStyle'] = color;
    if (fill) {
      this.ctx.fill();
    } else {
      this.ctx.stroke();
    }
  }

  /**
   * Draw a rectangle
   */
  drawRect(x, y, width, height, color, fill = true) {
    this.ctx[fill ? 'fillStyle' : 'strokeStyle'] = color;
    if (fill) {
      this.ctx.fillRect(x, y, width, height);
    } else {
      this.ctx.strokeRect(x, y, width, height);
    }
  }

  /**
   * Draw text
   */
  drawText(text, x, y, options = {}) {
    const {
      font = '16px Arial',
      color = '#ffffff',
      align = 'left',
      baseline = 'top'
    } = options;

    this.ctx.font = font;
    this.ctx.fillStyle = color;
    this.ctx.textAlign = align;
    this.ctx.textBaseline = baseline;
    this.ctx.fillText(text, x, y);
  }

  /**
   * Draw a line
   */
  drawLine(x1, y1, x2, y2, color, width = 1) {
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = width;
    this.ctx.stroke();
  }

  /**
   * Set global alpha
   */
  setAlpha(alpha) {
    this.ctx.globalAlpha = alpha;
  }

  /**
   * Reset context to defaults
   */
  resetContext() {
    this.ctx.globalAlpha = 1;
    this.ctx.lineWidth = 1;
  }

  /**
   * Convert screen coordinates to logical coordinates
   */
  screenToLogical(screenX, screenY) {
    const rect = this.canvas.getBoundingClientRect();
    const x = (screenX - rect.left) / this.scale;
    const y = (screenY - rect.top) / this.scale;
    return { x, y };
  }
}
