/**
 * sw.js - Service Worker for offline play
 * Caches game assets for PWA functionality
 */

const CACHE_NAME = 'threadland-v1.0.2-debug';
const RUNTIME_CACHE = 'threadland-runtime-v1.0.2-debug';

// Files to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/src/main.js',

  // Engine
  '/src/engine/Game.js',
  '/src/engine/Scene.js',
  '/src/engine/Canvas.js',
  '/src/engine/Input.js',
  '/src/engine/Tween.js',
  '/src/engine/Assets.js',
  '/src/engine/ObjectPool.js',

  // Scenes
  '/src/scenes/BootScene.js',
  '/src/scenes/MenuScene.js',
  '/src/scenes/GameScene.js',
  '/src/scenes/TransitionScene.js',
  '/src/scenes/UIScene.js',

  // Systems
  '/src/systems/PathSystem.js',
  '/src/systems/TowerSystem.js',
  '/src/systems/EnemySystem.js',
  '/src/systems/ProjectileSystem.js',
  '/src/systems/ComboSystem.js',
  '/src/systems/CollisionSystem.js',
  '/src/systems/SaveSystem.js',

  // UI
  '/src/ui/Button.js',
  '/src/ui/HUD.js',
  '/src/ui/TowerTray.js',
  '/src/ui/TowerPanel.js',

  // Data
  '/data/towers.json',
  '/data/enemies.json',
  '/data/waves.json',
  '/data/combos.json'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Installation complete');
        return self.skipWaiting();
      })
      .catch(err => {
        console.error('[SW] Installation failed:', err);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');

  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(name => name !== CACHE_NAME && name !== RUNTIME_CACHE)
            .map(name => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log('[SW] Activation complete');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other protocols
  if (!url.protocol.startsWith('http')) {
    return;
  }

  event.respondWith(
    caches.match(request)
      .then(cachedResponse => {
        if (cachedResponse) {
          // Return cached version
          return cachedResponse;
        }

        // Not in cache, fetch from network
        return fetch(request)
          .then(response => {
            // Don't cache if not a success response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            // Cache runtime assets (images, audio, etc.)
            if (shouldCacheRuntime(url)) {
              caches.open(RUNTIME_CACHE)
                .then(cache => {
                  cache.put(request, responseToCache);
                });
            }

            return response;
          })
          .catch(err => {
            console.error('[SW] Fetch failed:', err);

            // Return offline fallback if available
            if (request.destination === 'document') {
              return caches.match('/index.html');
            }

            return new Response('Offline', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
      })
  );
});

/**
 * Determine if a URL should be cached at runtime
 */
function shouldCacheRuntime(url) {
  // Cache images
  if (url.pathname.match(/\.(png|jpg|jpeg|gif|webp|svg)$/)) {
    return true;
  }

  // Cache audio
  if (url.pathname.match(/\.(mp3|wav|ogg|m4a)$/)) {
    return true;
  }

  // Cache fonts
  if (url.pathname.match(/\.(woff|woff2|ttf|eot)$/)) {
    return true;
  }

  return false;
}

// Message event - handle commands from main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CACHE_URLS') {
    const urls = event.data.urls;
    caches.open(RUNTIME_CACHE)
      .then(cache => cache.addAll(urls))
      .then(() => {
        console.log('[SW] Cached additional assets:', urls.length);
      });
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(name => caches.delete(name))
        );
      })
      .then(() => {
        console.log('[SW] All caches cleared');
      });
  }
});

// Background sync (if supported)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-game-data') {
    event.waitUntil(syncGameData());
  }
});

/**
 * Sync game data when back online
 */
async function syncGameData() {
  try {
    // Sync any pending game data
    console.log('[SW] Syncing game data...');
    // Implementation depends on backend
  } catch (err) {
    console.error('[SW] Sync failed:', err);
  }
}

console.log('[SW] Service worker loaded');
