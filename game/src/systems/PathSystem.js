/**
 * PathSystem.js - Waypoint-based movement system
 * Handles enemy path navigation using linear interpolation
 * Based on spec section 4A - no physics engine
 */

export default class PathSystem {
  constructor() {
    this.paths = new Map();
  }

  /**
   * Register a path with waypoints
   */
  registerPath(key, waypoints) {
    this.paths.set(key, waypoints);
  }

  /**
   * Get position along path using linear interpolation
   * From PDF spec section 4A
   * @param {Array} points - Array of waypoint {x, y} objects
   * @param {number} t - Progress along path (0 to 1)
   * @returns {Object} {x, y} position
   */
  lerpPath(points, t) {
    if (points.length === 0) return { x: 0, y: 0 };
    if (points.length === 1) return { ...points[0] };

    // Clamp t to valid range
    t = Math.max(0, Math.min(1, t));

    // Calculate which segment we're on
    const segmentCount = points.length - 1;
    const scaledT = t * segmentCount;
    const i = Math.min(segmentCount - 1, Math.floor(scaledT));

    // Get segment endpoints
    const a = points[i];
    const b = points[i + 1];

    // Calculate local t within this segment
    const localT = scaledT - i;

    // Linear interpolation
    return {
      x: a.x + (b.x - a.x) * localT,
      y: a.y + (b.y - a.y) * localT
    };
  }

  /**
   * Get position for enemy on path
   * Air units get a Y offset to appear higher
   */
  getPosition(pathKey, t, isAir = false) {
    const path = this.paths.get(pathKey);
    if (!path) {
      console.error(`Path "${pathKey}" not found`);
      return { x: 0, y: 0 };
    }

    const pos = this.lerpPath(path, t);

    // Apply air offset
    if (isAir) {
      pos.y -= 40; // Air units fly higher
    }

    return pos;
  }

  /**
   * Get path length (approximate distance)
   */
  getPathLength(pathKey) {
    const path = this.paths.get(pathKey);
    if (!path || path.length < 2) return 0;

    let length = 0;
    for (let i = 0; i < path.length - 1; i++) {
      const a = path[i];
      const b = path[i + 1];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      length += Math.sqrt(dx * dx + dy * dy);
    }

    return length;
  }

  /**
   * Get direction at point on path (for enemy rotation)
   */
  getDirection(pathKey, t) {
    const path = this.paths.get(pathKey);
    if (!path || path.length < 2) return 0;

    // Get two close points to calculate direction
    const delta = 0.01;
    const pos1 = this.lerpPath(path, Math.max(0, t - delta));
    const pos2 = this.lerpPath(path, Math.min(1, t + delta));

    return Math.atan2(pos2.y - pos1.y, pos2.x - pos1.x);
  }

  /**
   * Create a default path (straight line from bottom to top)
   */
  createDefaultPath(width, height) {
    const centerX = width / 2;
    return [
      { x: centerX, y: height + 50 },     // Start below screen
      { x: centerX, y: height * 0.75 },
      { x: centerX, y: height * 0.5 },
      { x: centerX, y: height * 0.25 },
      { x: centerX, y: -50 }              // End above screen
    ];
  }

  /**
   * Create an S-curve path
   */
  createSCurvePath(width, height) {
    const points = [];
    const steps = 10;

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const y = height + 50 - (height + 100) * t;

      // S-curve using sine wave
      const amplitude = width * 0.3;
      const frequency = 2;
      const x = width / 2 + Math.sin(t * Math.PI * frequency) * amplitude;

      points.push({ x, y });
    }

    return points;
  }

  /**
   * Create a zigzag path
   */
  createZigzagPath(width, height) {
    return [
      { x: width * 0.2, y: height + 50 },
      { x: width * 0.8, y: height * 0.8 },
      { x: width * 0.2, y: height * 0.6 },
      { x: width * 0.8, y: height * 0.4 },
      { x: width * 0.2, y: height * 0.2 },
      { x: width * 0.5, y: -50 }
    ];
  }

  /**
   * Clear all paths
   */
  clear() {
    this.paths.clear();
  }
}
