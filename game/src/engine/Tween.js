/**
 * Tween.js - Simple animation system for smooth transitions
 * Supports linear, easeIn, easeOut, and easeInOut easing
 */

const EASING = {
  linear: t => t,
  easeIn: t => t * t,
  easeOut: t => t * (2 - t),
  easeInOut: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  easeInCubic: t => t * t * t,
  easeOutCubic: t => (--t) * t * t + 1,
  easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
};

export default class Tween {
  constructor(target, properties, duration, options = {}) {
    this.target = target;
    this.properties = properties;
    this.duration = duration;
    this.elapsed = 0;
    this.easing = EASING[options.easing || 'linear'];
    this.delay = options.delay || 0;
    this.delayElapsed = 0;
    this.onComplete = options.onComplete || null;
    this.onUpdate = options.onUpdate || null;
    this.yoyo = options.yoyo || false;
    this.repeat = options.repeat || 0;
    this.repeatCount = 0;
    this.isReversing = false;
    this.active = true;

    // Store initial values
    this.startValues = {};
    for (const key in properties) {
      this.startValues[key] = target[key];
    }
  }

  update(dt) {
    if (!this.active) return false;

    // Handle delay
    if (this.delayElapsed < this.delay) {
      this.delayElapsed += dt;
      return true;
    }

    this.elapsed += dt;
    const t = Math.min(this.elapsed / this.duration, 1);
    const easedT = this.easing(t);

    // Update properties
    for (const key in this.properties) {
      const start = this.isReversing ? this.properties[key] : this.startValues[key];
      const end = this.isReversing ? this.startValues[key] : this.properties[key];
      this.target[key] = start + (end - start) * easedT;
    }

    if (this.onUpdate) {
      this.onUpdate(this.target, easedT);
    }

    // Check if tween is complete
    if (t >= 1) {
      if (this.yoyo && !this.isReversing) {
        this.isReversing = true;
        this.elapsed = 0;
        return true;
      }

      if (this.repeat > 0 && this.repeatCount < this.repeat) {
        this.repeatCount++;
        this.elapsed = 0;
        this.isReversing = false;
        return true;
      }

      if (this.onComplete) {
        this.onComplete(this.target);
      }
      this.active = false;
      return false;
    }

    return true;
  }

  stop() {
    this.active = false;
  }
}

export class TweenManager {
  constructor() {
    this.tweens = [];
  }

  add(tween) {
    this.tweens.push(tween);
    return tween;
  }

  create(target, properties, duration, options = {}) {
    const tween = new Tween(target, properties, duration, options);
    this.tweens.push(tween);
    return tween;
  }

  update(dt) {
    this.tweens = this.tweens.filter(tween => tween.update(dt));
  }

  clear() {
    this.tweens = [];
  }

  stopAll() {
    this.tweens.forEach(tween => tween.stop());
    this.tweens = [];
  }

  remove(tween) {
    const index = this.tweens.indexOf(tween);
    if (index > -1) {
      this.tweens.splice(index, 1);
    }
  }
}
