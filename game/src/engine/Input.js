/**
 * Input.js - Unified touch/mouse input handling with swipe detection
 * Handles both touch and mouse events for cross-platform support
 */

export default class Input {
  constructor(canvas, canvasHandler) {
    this.canvas = canvas;
    this.canvasHandler = canvasHandler;
    this.pointer = {
      x: 0,
      y: 0,
      isDown: false,
      justPressed: false,
      justReleased: false
    };

    this.swipe = {
      startX: 0,
      startY: 0,
      endX: 0,
      endY: 0,
      isSwipe: false,
      direction: null // 'left', 'right', 'up', 'down'
    };

    this.listeners = {
      pointerdown: [],
      pointerup: [],
      pointermove: [],
      swipe: []
    };

    this.minSwipeDistance = 50;
    this.maxSwipeTime = 500;
    this.swipeStartTime = 0;

    this.setupEventListeners();
  }

  setupEventListeners() {
    // Touch events
    this.canvas.addEventListener('touchstart', (e) => this.handleStart(e), { passive: false });
    this.canvas.addEventListener('touchmove', (e) => this.handleMove(e), { passive: false });
    this.canvas.addEventListener('touchend', (e) => this.handleEnd(e), { passive: false });
    this.canvas.addEventListener('touchcancel', (e) => this.handleEnd(e), { passive: false });

    // Mouse events
    this.canvas.addEventListener('mousedown', (e) => this.handleStart(e));
    this.canvas.addEventListener('mousemove', (e) => this.handleMove(e));
    this.canvas.addEventListener('mouseup', (e) => this.handleEnd(e));
    this.canvas.addEventListener('mouseleave', (e) => this.handleEnd(e));

    // Prevent context menu on long press
    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  handleStart(e) {
    e.preventDefault();
    const coords = this.getCoordinates(e);

    this.pointer.x = coords.x;
    this.pointer.y = coords.y;
    this.pointer.isDown = true;
    this.pointer.justPressed = true;

    this.swipe.startX = coords.x;
    this.swipe.startY = coords.y;
    this.swipeStartTime = Date.now();
    this.swipe.isSwipe = false;

    this.emit('pointerdown', this.pointer);
  }

  handleMove(e) {
    e.preventDefault();
    const coords = this.getCoordinates(e);

    this.pointer.x = coords.x;
    this.pointer.y = coords.y;

    this.emit('pointermove', this.pointer);
  }

  handleEnd(e) {
    e.preventDefault();
    const coords = this.getCoordinates(e);

    this.pointer.x = coords.x;
    this.pointer.y = coords.y;
    this.pointer.isDown = false;
    this.pointer.justReleased = true;

    // Check for swipe
    this.swipe.endX = coords.x;
    this.swipe.endY = coords.y;
    this.detectSwipe();

    this.emit('pointerup', this.pointer);
  }

  detectSwipe() {
    const dx = this.swipe.endX - this.swipe.startX;
    const dy = this.swipe.endY - this.swipe.startY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const elapsed = Date.now() - this.swipeStartTime;

    if (distance >= this.minSwipeDistance && elapsed <= this.maxSwipeTime) {
      this.swipe.isSwipe = true;

      // Determine direction
      if (Math.abs(dx) > Math.abs(dy)) {
        this.swipe.direction = dx > 0 ? 'right' : 'left';
      } else {
        this.swipe.direction = dy > 0 ? 'down' : 'up';
      }

      this.emit('swipe', {
        direction: this.swipe.direction,
        distance,
        dx,
        dy
      });
    }
  }

  getCoordinates(e) {
    let clientX, clientY;

    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if (e.changedTouches && e.changedTouches.length > 0) {
      clientX = e.changedTouches[0].clientX;
      clientY = e.changedTouches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return this.canvasHandler.screenToLogical(clientX, clientY);
  }

  /**
   * Add event listener
   */
  on(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event].push(callback);
    }
  }

  /**
   * Remove event listener
   */
  off(event, callback) {
    if (this.listeners[event]) {
      const index = this.listeners[event].indexOf(callback);
      if (index > -1) {
        this.listeners[event].splice(index, 1);
      }
    }
  }

  /**
   * Emit event to all listeners
   */
  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }

  /**
   * Update input state (call each frame)
   */
  update() {
    this.pointer.justPressed = false;
    this.pointer.justReleased = false;
    this.swipe.isSwipe = false;
  }

  /**
   * Check if pointer is over a rectangular area
   */
  isPointerOver(x, y, width, height) {
    return (
      this.pointer.x >= x &&
      this.pointer.x <= x + width &&
      this.pointer.y >= y &&
      this.pointer.y <= y + height
    );
  }

  /**
   * Check if pointer is over a circular area
   */
  isPointerOverCircle(x, y, radius) {
    const dx = this.pointer.x - x;
    const dy = this.pointer.y - y;
    return Math.sqrt(dx * dx + dy * dy) <= radius;
  }

  /**
   * Clean up event listeners
   */
  destroy() {
    this.listeners = {
      pointerdown: [],
      pointerup: [],
      pointermove: [],
      swipe: []
    };
  }
}
