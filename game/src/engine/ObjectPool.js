/**
 * ObjectPool.js - Reusable object pooling for performance
 * Reduces GC pressure by reusing objects instead of creating new ones
 */

export default class ObjectPool {
  constructor(factory, initialSize = 10, maxSize = 100) {
    this.factory = factory; // Function that creates new objects
    this.maxSize = maxSize;
    this.available = [];
    this.inUse = [];

    // Pre-populate pool
    for (let i = 0; i < initialSize; i++) {
      this.available.push(this.factory());
    }
  }

  /**
   * Get an object from the pool
   */
  acquire() {
    let obj;

    if (this.available.length > 0) {
      obj = this.available.pop();
    } else if (this.inUse.length < this.maxSize) {
      obj = this.factory();
    } else {
      // Pool is at max capacity, reuse oldest object
      console.warn('ObjectPool at max capacity, reusing oldest object');
      obj = this.inUse.shift();
      if (obj.reset) obj.reset();
    }

    this.inUse.push(obj);
    return obj;
  }

  /**
   * Return an object to the pool
   */
  release(obj) {
    const index = this.inUse.indexOf(obj);
    if (index > -1) {
      this.inUse.splice(index, 1);

      // Reset object if it has a reset method
      if (obj.reset) {
        obj.reset();
      }

      this.available.push(obj);
    }
  }

  /**
   * Release all in-use objects
   */
  releaseAll() {
    while (this.inUse.length > 0) {
      const obj = this.inUse.pop();
      if (obj.reset) obj.reset();
      this.available.push(obj);
    }
  }

  /**
   * Get number of objects in use
   */
  getInUseCount() {
    return this.inUse.length;
  }

  /**
   * Get number of available objects
   */
  getAvailableCount() {
    return this.available.length;
  }

  /**
   * Clear the entire pool
   */
  clear() {
    this.available = [];
    this.inUse = [];
  }
}

/**
 * Pool for enemies
 */
export class EnemyPool extends ObjectPool {
  constructor(factory) {
    super(factory, 10, 30); // Max 30 enemies as per spec
  }
}

/**
 * Pool for projectiles
 */
export class ProjectilePool extends ObjectPool {
  constructor(factory) {
    super(factory, 20, 60); // Max 60 projectiles as per spec
  }
}
