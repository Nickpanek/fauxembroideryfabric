/**
 * Assets.js - Asset loader with caching and progress tracking
 * Handles loading of images and audio files
 */

export default class Assets {
  constructor() {
    this.images = new Map();
    this.audio = new Map();
    this.loaded = 0;
    this.total = 0;
    this.onProgress = null;
    this.onComplete = null;
  }

  /**
   * Load a single image
   */
  loadImage(key, url) {
    return new Promise((resolve, reject) => {
      if (this.images.has(key)) {
        resolve(this.images.get(key));
        return;
      }

      const img = new Image();
      img.onload = () => {
        this.images.set(key, img);
        this.loaded++;
        if (this.onProgress) {
          this.onProgress(this.loaded, this.total);
        }
        resolve(img);
      };
      img.onerror = () => {
        console.error(`Failed to load image: ${url}`);
        reject(new Error(`Failed to load image: ${url}`));
      };
      img.src = url;
    });
  }

  /**
   * Load a single audio file
   */
  loadAudio(key, url) {
    return new Promise((resolve, reject) => {
      if (this.audio.has(key)) {
        resolve(this.audio.get(key));
        return;
      }

      const audio = new Audio();
      audio.oncanplaythrough = () => {
        this.audio.set(key, audio);
        this.loaded++;
        if (this.onProgress) {
          this.onProgress(this.loaded, this.total);
        }
        resolve(audio);
      };
      audio.onerror = () => {
        console.error(`Failed to load audio: ${url}`);
        // Don't reject on audio error, just log it
        this.loaded++;
        if (this.onProgress) {
          this.onProgress(this.loaded, this.total);
        }
        resolve(null);
      };
      audio.src = url;
    });
  }

  /**
   * Load multiple assets
   */
  async load(manifest) {
    const promises = [];
    this.loaded = 0;
    this.total = manifest.images.length + manifest.audio.length;

    // Load images
    for (const { key, url } of manifest.images) {
      promises.push(this.loadImage(key, url));
    }

    // Load audio
    for (const { key, url } of manifest.audio) {
      promises.push(this.loadAudio(key, url));
    }

    try {
      await Promise.all(promises);
      if (this.onComplete) {
        this.onComplete();
      }
    } catch (error) {
      console.error('Error loading assets:', error);
      throw error;
    }
  }

  /**
   * Get an image by key
   */
  getImage(key) {
    return this.images.get(key) || null;
  }

  /**
   * Get audio by key
   */
  getAudio(key) {
    return this.audio.get(key) || null;
  }

  /**
   * Check if image exists
   */
  hasImage(key) {
    return this.images.has(key);
  }

  /**
   * Check if audio exists
   */
  hasAudio(key) {
    return this.audio.has(key);
  }

  /**
   * Play audio with optional volume and loop
   */
  playAudio(key, volume = 1, loop = false) {
    const audio = this.audio.get(key);
    if (audio) {
      audio.volume = volume;
      audio.loop = loop;
      audio.currentTime = 0;
      audio.play().catch(err => console.warn('Audio play failed:', err));
      return audio;
    }
    return null;
  }

  /**
   * Stop audio
   */
  stopAudio(key) {
    const audio = this.audio.get(key);
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }

  /**
   * Stop all audio
   */
  stopAllAudio() {
    this.audio.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
  }

  /**
   * Set progress callback
   */
  setProgressCallback(callback) {
    this.onProgress = callback;
  }

  /**
   * Set complete callback
   */
  setCompleteCallback(callback) {
    this.onComplete = callback;
  }

  /**
   * Get loading progress (0 to 1)
   */
  getProgress() {
    return this.total > 0 ? this.loaded / this.total : 0;
  }

  /**
   * Clear all assets
   */
  clear() {
    this.images.clear();
    this.stopAllAudio();
    this.audio.clear();
    this.loaded = 0;
    this.total = 0;
  }

  /**
   * Create a placeholder image (for development)
   */
  createPlaceholder(key, width, height, color = '#808080') {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Draw background
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, width, height);

    // Draw border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, width - 2, height - 2);

    // Draw text
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(key, width / 2, height / 2);

    // Convert to image
    const img = new Image();
    img.src = canvas.toDataURL();
    this.images.set(key, img);
    return img;
  }
}
