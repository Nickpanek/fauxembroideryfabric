/**
 * main.js - Game bootstrap and initialization
 * Entry point for The Fighting Lambs of Threadland
 */

import Game from './engine/Game.js';
import BootScene from './scenes/BootScene.js';
import MenuScene from './scenes/MenuScene.js';
import GameScene from './scenes/GameScene.js';
import TransitionScene from './scenes/TransitionScene.js';
import UIScene from './scenes/UIScene.js';

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
  initGame();
});

async function initGame() {
  console.log('🧵 Initializing The Fighting Lambs of Threadland...');

  // Get canvas element
  const canvas = document.getElementById('game-canvas');

  if (!canvas) {
    console.error('Canvas element not found!');
    return;
  }

  // Create game instance
  const game = new Game(canvas, {
    width: 540,
    height: 960,
    backgroundColor: '#1a1a2e',
    targetFPS: 60
  });

  // Register all scenes
  game.registerScene('boot', BootScene);
  game.registerScene('menu', MenuScene);
  game.registerScene('game', GameScene);
  game.registerScene('transition', TransitionScene);
  game.registerScene('ui', UIScene);

  console.log('✅ Scenes registered');

  // Start game with boot scene
  await game.start('boot');

  console.log('🎮 Game started!');

  // Dispatch game ready event
  window.dispatchEvent(new Event('gameReady'));

  // Expose game instance for debugging
  window.game = game;

  // Setup world art switcher for desktop
  setupWorldArtSwitcher(game);

  // Log performance info
  setInterval(() => {
    const fps = game.getFPS();
    if (fps < 50) {
      console.warn(`⚠️ Low FPS: ${fps}`);
    }
  }, 5000);
}

/**
 * Setup world art background switcher for desktop side panels
 */
function setupWorldArtSwitcher(game) {
  let currentWorld = 'prairie';

  setInterval(() => {
    const gameScene = game.getScene('game');
    if (gameScene && gameScene.world !== currentWorld) {
      currentWorld = gameScene.world;
      updateWorldArt(currentWorld);
    }
  }, 1000);
}

/**
 * Update world art backgrounds
 */
function updateWorldArt(world) {
  const worldArtElements = document.querySelectorAll('.world-art');
  worldArtElements.forEach(element => {
    element.style.backgroundImage = `url('assets/interstitials/${world}.webp')`;
  });
}

/**
 * Handle visibility change (pause game when tab is hidden)
 */
document.addEventListener('visibilitychange', () => {
  if (window.game) {
    if (document.hidden) {
      window.game.pauseGame();
      console.log('⏸️ Game paused (tab hidden)');
    } else {
      window.game.resumeGame();
      console.log('▶️ Game resumed (tab visible)');
    }
  }
});

/**
 * Handle errors
 */
window.addEventListener('error', (e) => {
  console.error('💥 Game error:', e.error);

  // Show error to user (optional)
  if (window.game) {
    // Could show error scene here
  }
});

/**
 * Handle unhandled promise rejections
 */
window.addEventListener('unhandledrejection', (e) => {
  console.error('💥 Unhandled promise rejection:', e.reason);
});

// Log game info
console.log(`
╔═══════════════════════════════════════════════════╗
║  🧵 The Fighting Lambs of Threadland             ║
║  A mobile-first tower defense game               ║
║  ------------------------------------------------- ║
║  Engine: Custom Canvas Engine                     ║
║  Resolution: 540×960 (9:16 portrait)              ║
║  Target FPS: 60                                   ║
║  ------------------------------------------------- ║
║  Controls:                                        ║
║    • Tap to place towers                          ║
║    • Tap tower to select                          ║
║    • Use bottom tray to select tower type         ║
║    • Use right panel to upgrade/sell              ║
║  ------------------------------------------------- ║
║  Made with ♥ for Faux Embroidery Fabric          ║
╚═══════════════════════════════════════════════════╝
`);
