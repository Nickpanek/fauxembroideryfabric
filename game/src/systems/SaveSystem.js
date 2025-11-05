/**
 * SaveSystem.js - IndexedDB wrapper for game saves and progress
 * Stores run data, progress, and settings
 * Based on PDF spec section 2
 */

export default class SaveSystem {
  constructor(dbName = 'ThreadlandDB', version = 1) {
    this.dbName = dbName;
    this.version = version;
    this.db = null;
  }

  /**
   * Initialize IndexedDB
   */
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.error('IndexedDB error:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Create object stores
        if (!db.objectStoreNames.contains('runs')) {
          const runStore = db.createObjectStore('runs', { keyPath: 'id', autoIncrement: true });
          runStore.createIndex('timestamp', 'timestamp', { unique: false });
          runStore.createIndex('world', 'world', { unique: false });
        }

        if (!db.objectStoreNames.contains('progress')) {
          db.createObjectStore('progress', { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      };
    });
  }

  /**
   * Save a run/game session
   */
  async saveRun(runData) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['runs'], 'readwrite');
      const store = transaction.objectStore('runs');

      runData.timestamp = Date.now();

      const request = store.add(runData);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get all runs
   */
  async getRuns(limit = 10) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['runs'], 'readonly');
      const store = transaction.objectStore('runs');
      const index = store.index('timestamp');

      const request = index.openCursor(null, 'prev'); // Newest first
      const runs = [];

      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor && runs.length < limit) {
          runs.push(cursor.value);
          cursor.continue();
        } else {
          resolve(runs);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Save player progress
   */
  async saveProgress(progressData) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['progress'], 'readwrite');
      const store = transaction.objectStore('progress');

      progressData.id = 'current';
      progressData.timestamp = Date.now();

      const request = store.put(progressData);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Load player progress
   */
  async loadProgress() {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['progress'], 'readonly');
      const store = transaction.objectStore('progress');

      const request = store.get('current');

      request.onsuccess = () => resolve(request.result || this.getDefaultProgress());
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get default progress structure
   */
  getDefaultProgress() {
    return {
      id: 'current',
      worlds: {
        prairie: { unlocked: true, bestWave: 0 },
        desert: { unlocked: false, bestWave: 0 },
        forest: { unlocked: false, bestWave: 0 }
      },
      totalFleece: 0,
      totalKills: 0,
      gamesPlayed: 0
    };
  }

  /**
   * Save setting
   */
  async saveSetting(key, value) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['settings'], 'readwrite');
      const store = transaction.objectStore('settings');

      const request = store.put({ key, value });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Load setting
   */
  async loadSetting(key, defaultValue = null) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['settings'], 'readonly');
      const store = transaction.objectStore('settings');

      const request = store.get(key);

      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.value : defaultValue);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Load all settings
   */
  async loadAllSettings() {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['settings'], 'readonly');
      const store = transaction.objectStore('settings');

      const request = store.getAll();

      request.onsuccess = () => {
        const settings = {};
        for (const item of request.result) {
          settings[item.key] = item.value;
        }
        resolve(settings);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Clear all data (for debugging/testing)
   */
  async clearAll() {
    return Promise.all([
      this.clearStore('runs'),
      this.clearStore('progress'),
      this.clearStore('settings')
    ]);
  }

  /**
   * Clear a specific object store
   */
  async clearStore(storeName) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);

      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

/**
 * LocalStorage wrapper for simple settings
 * Fallback if IndexedDB is not available
 */
export class LocalSettings {
  static set(key, value) {
    try {
      localStorage.setItem(`threadland_${key}`, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error('LocalStorage error:', e);
      return false;
    }
  }

  static get(key, defaultValue = null) {
    try {
      const value = localStorage.getItem(`threadland_${key}`);
      return value ? JSON.parse(value) : defaultValue;
    } catch (e) {
      console.error('LocalStorage error:', e);
      return defaultValue;
    }
  }

  static remove(key) {
    try {
      localStorage.removeItem(`threadland_${key}`);
      return true;
    } catch (e) {
      console.error('LocalStorage error:', e);
      return false;
    }
  }

  static clear() {
    try {
      // Only clear threadland keys
      const keys = Object.keys(localStorage);
      for (const key of keys) {
        if (key.startsWith('threadland_')) {
          localStorage.removeItem(key);
        }
      }
      return true;
    } catch (e) {
      console.error('LocalStorage error:', e);
      return false;
    }
  }
}
