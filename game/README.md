# The Fighting Lambs of Threadland 🧵

A mobile-first tower defense game featuring embroidered lambs defending their textile kingdom from unraveling threats.

## Overview

**The Fighting Lambs of Threadland** is a portrait-oriented (9:16) tower defense game built with a custom lightweight canvas engine. Players strategically place towers to defend against waves of enemies, utilizing combos for enhanced effectiveness.

## Game Features

- **5 Tower Types**: Pin Launcher, Button Mortar, Wool Cannon, Patch Totem, Spindle Ward
- **5 Enemy Types**: Wolves, Threadlings, Nightmoths, Tatterbeasts, Spindlers
- **3 Worlds**: Prairie Threads, Desert Wastes, Tangled Forest
- **10 Waves per World**: Progressive difficulty with unique enemy compositions
- **Combo System**: Adjacent towers (≤60px) trigger powerful synergy bonuses
- **Thread-Swipe Transitions**: Beautiful world-specific animations between waves
- **PWA Support**: Install for offline play on mobile and desktop

## Technical Specifications

- **Resolution**: 540×960 logical pixels (9:16 portrait)
- **Engine**: Custom Canvas 2D (no framework dependencies)
- **Target FPS**: 60
- **Grid**: 10×18 tiles @ 54px each
- **Max Limits**: 30 enemies, 15 towers, 60 projectiles
- **Storage**: IndexedDB for game progress, localStorage for settings

## Project Structure

```
game/
├── public/
│   ├── index.html              # Main entry point
│   ├── manifest.webmanifest    # PWA configuration
│   ├── sw.js                   # Service worker for offline play
│   └── assets/                 # All game assets
│       ├── sprites/
│       │   ├── towers/         # Tower sprites (64×64px)
│       │   ├── enemies/        # Enemy sprites (varied sizes)
│       │   ├── projectiles/    # Projectile sprites (16×16px)
│       │   └── ui/             # UI icons and elements
│       ├── maps/
│       │   ├── prairie/        # Prairie world tiles
│       │   ├── desert/         # Desert world tiles
│       │   └── forest/         # Forest world tiles
│       ├── interstitials/      # Wave transition images (540×960px)
│       ├── audio/
│       │   ├── music/          # Ambient music loops
│       │   └── sfx/            # Sound effects
│       ├── icons/              # PWA icons (various sizes)
│       └── screenshots/        # Store screenshots
└── src/
    ├── main.js                 # Game bootstrap
    ├── engine/                 # Custom game engine
    ├── scenes/                 # Game scenes
    ├── systems/                # Game systems
    ├── ui/                     # UI components
    └── data/                   # Game configuration (JSON)
```

## Adding Assets

### Tower Sprites

**Location**: `public/assets/sprites/towers/`

**Naming Convention**: `tower-{towerType}.png`

**Required Files**:
- `tower-pinLauncher.png`
- `tower-buttonMortar.png`
- `tower-woolCannon.png`
- `tower-patchTotem.png`
- `tower-spindleWard.png`

**Specifications**:
- Size: 64×64 pixels
- Format: PNG with transparency
- Style: Embroidered/textile aesthetic
- Details: Should be recognizable at small size

**Example**: Pin Launcher should show a decorative pin or needle with embroidered details.

### Enemy Sprites

**Location**: `public/assets/sprites/enemies/`

**Naming Convention**: `enemy-{enemyType}.png`

**Required Files**:
- `enemy-wolf.png` (24×24px)
- `enemy-threadling.png` (18×18px)
- `enemy-nightmoth.png` (22×22px)
- `enemy-tatterbeast.png` (32×32px)
- `enemy-spindler.png` (26×26px)

**Specifications**:
- Format: PNG with transparency
- Style: Thread/fabric creatures
- Ground units: Earth tones, textured
- Air units: Lighter, ethereal appearance

**Note**: Sizes vary by enemy type (see data/enemies.json for exact dimensions).

### Projectile Sprites

**Location**: `public/assets/sprites/projectiles/`

**Naming Convention**: `projectile-{type}.png`

**Required Files**:
- `projectile-pin.png` (16×16px)
- `projectile-button.png` (20×20px)
- `projectile-wool.png` (24×24px)
- `projectile-dart.png` (12×12px)

**Specifications**:
- Format: PNG with transparency
- Style: Simple, clear shapes
- Bright colors for visibility
- Should read well at high speed

### World Transition Images

**Location**: `public/assets/interstitials/`

**Required Files**:
- `prairie.webp` - Green fields, wildflowers, woven grass patterns
- `desert.webp` - Sand dunes, warm colors, frayed fabric textures
- `forest.webp` - Deep greens, tree trunks as thread spools, tangled vines

**Specifications**:
- Size: 540×960 pixels (full screen portrait)
- Format: WebP (optimized for web, <200KB each)
- Style: High-quality embroidered/textile art
- Usage: Displayed during wave transitions and as desktop side panels

**Important**: These images are central to the game's visual identity. They should be stunning textile/embroidery art that represents each world.

### UI Icons

**Location**: `public/assets/sprites/ui/`

**Suggested Files**:
- `icon-fleece.png` - Currency icon (24×24px)
- `icon-heart.png` - Lives/health (24×24px)
- `icon-speed.png` - Speed toggle (24×24px)
- `icon-pause.png` - Pause button (24×24px)
- `icon-upgrade.png` - Upgrade button (32×32px)
- `icon-sell.png` - Sell button (32×32px)

**Specifications**:
- Format: PNG with transparency
- Style: Simple, iconic
- Clear contrast for readability

### Audio Files

**Music Location**: `public/assets/audio/music/`

**Suggested Files**:
- `prairie-ambient.mp3` - Gentle, pastoral loop
- `desert-ambient.mp3` - Sparse, warm, mystical
- `forest-ambient.mp3` - Dense, mysterious, organic

**Specifications**:
- Format: MP3 (for compatibility)
- Length: 2-3 minute loops
- Volume: Normalized, not too loud
- Style: Ambient, non-intrusive

**SFX Location**: `public/assets/audio/sfx/`

**Suggested Files**:
- `tower-place.mp3` - Tower placement sound
- `tower-fire-pin.mp3` - Pin launcher fire
- `tower-fire-button.mp3` - Button mortar fire
- `tower-fire-wool.mp3` - Wool cannon fire
- `enemy-hit.mp3` - Enemy takes damage
- `enemy-die.mp3` - Enemy death
- `wave-complete.mp3` - Wave completion
- `swipe-transition.mp3` - Fabric rustle for transitions
- `combo-activate.mp3` - Combo trigger sound
- `button-click.mp3` - UI button press

**Specifications**:
- Format: MP3
- Length: < 2 seconds for SFX
- Volume: Balanced, clear

### PWA Icons

**Location**: `public/assets/icons/`

**Required Sizes**:
- `icon-72.png` (72×72)
- `icon-96.png` (96×96)
- `icon-128.png` (128×128)
- `icon-144.png` (144×144)
- `icon-152.png` (152×152)
- `icon-192.png` (192×192)
- `icon-384.png` (384×384)
- `icon-512.png` (512×512)
- `icon-maskable-192.png` (192×192 with safe zone)
- `icon-maskable-512.png` (512×512 with safe zone)

**Specifications**:
- Format: PNG
- Content: Game logo or fighting lamb icon
- Maskable icons: Include 20% safe zone padding
- Background: Can be transparent or solid color

### Map Backgrounds

**Location**: `public/assets/maps/{world}/`

**Optional Files** (for enhanced visuals):
- `{world}-background.png` - Full background layer
- `{world}-path.png` - Path overlay texture
- `{world}-tile-*.png` - Individual tile variations

**Specifications**:
- Size: Match game resolution or tileable
- Format: PNG or WebP
- Style: Subtle, doesn't interfere with gameplay

## Asset Creation Tips

### General Guidelines

1. **Textile Aesthetic**: Everything should look embroidered, stitched, or woven
2. **Color Palette**: Rich, warm textile colors (avoid neon/digital colors)
3. **Texture**: Include fabric texture overlays where appropriate
4. **Contrast**: Ensure good visibility on various backgrounds
5. **Performance**: Optimize file sizes (WebP for large images, PNG for sprites)

### Embroidery Style Reference

- Use visible stitch patterns
- Show thread texture and dimensionality
- Include fabric grain/weave in backgrounds
- Consider cross-stitch, satin stitch, and chain stitch patterns
- Add subtle shadows to give depth

### Color Schemes by World

**Prairie Threads**:
- Greens: #7cb342, #558b2f
- Earth: #8d6e63, #6d4c41
- Accents: Wildflower colors (yellows, purples)

**Desert Wastes**:
- Warm: #ffa726, #ff6f00
- Sand: #d7ccc8, #bcaaa4
- Accents: Sunset reds and oranges

**Tangled Forest**:
- Deep Green: #388e3c, #1b5e20
- Bark: #5d4037, #3e2723
- Accents: Moss greens, mushroom browns

## Testing Your Assets

1. Place assets in correct folders
2. Use exact naming conventions (case-sensitive!)
3. Open `public/index.html` in a browser
4. Check console for any missing asset warnings
5. Verify assets display correctly in-game

**Quick Test Server**:
```bash
# Navigate to game directory
cd game/public

# Start a simple HTTP server (Python 3)
python3 -m http.server 8000

# Or use Node.js
npx serve

# Then open http://localhost:8000 in your browser
```

## Asset Checklist

Before deploying, ensure you have:

- [ ] All 5 tower sprites
- [ ] All 5 enemy sprites
- [ ] All 4 projectile sprites
- [ ] All 3 world interstitial images (CRITICAL!)
- [ ] PWA icons (at minimum 192×192 and 512×512)
- [ ] At least one ambient music track
- [ ] Basic SFX (tower fire, enemy hit, wave complete)
- [ ] UI icons (optional but recommended)

## Performance Optimization

### Images

- Use WebP for large images (interstitials, backgrounds)
- Use PNG for sprites (better for small images with transparency)
- Compress all images (use tools like TinyPNG, Squoosh)
- Keep interstitials under 200KB each
- Total asset size should be < 10MB for good load times

### Audio

- Use MP3 at 128kbps for music
- Use MP3 at 64kbps for short SFX
- Keep music loops under 1MB each
- Total audio should be < 5MB

## Running the Game

### Development

```bash
# From the game directory
cd game/public
python3 -m http.server 8000

# Open http://localhost:8000
```

### Production

Deploy the `public/` directory to any static hosting:
- GitHub Pages
- Netlify
- Vercel
- Cloudflare Pages
- Your own server

Ensure HTTPS is enabled for PWA functionality.

## Game Configuration

All game data is in JSON files under `src/data/`:

- `towers.json` - Tower stats, costs, upgrades
- `enemies.json` - Enemy HP, speed, rewards
- `waves.json` - Wave compositions per world
- `combos.json` - Combo definitions and bonuses

Feel free to edit these to balance gameplay!

## Tower Stats Reference

| Tower | Cost | Damage | Range | Fire Rate | Special |
|-------|------|--------|-------|-----------|---------|
| Pin Launcher | 100 | 10 | 150 | 0.5s | Fast shooter |
| Button Mortar | 150 | 15 | 140 | 1.2s | Splash (60px) |
| Wool Cannon | 200 | 40 | 180 | 2.0s | Heavy damage |
| Patch Totem | 180 | 0 | 120 | - | Support/buff |
| Spindle Ward | 120 | 12 | 160 | 0.6s | Anti-air |

## Enemy Stats Reference

| Enemy | HP | Speed | Type | Reward |
|-------|-----|-------|------|--------|
| Wolf | 30 | 80 | Ground | 10 |
| Threadling | 15 | 60 | Ground | 5 |
| Nightmoth | 25 | 70 | Air | 15 |
| Tatterbeast | 200 | 30 | Ground | 30 |
| Spindler | 40 | 50 | Air | 20 |

## Combos Reference

| Combo | Towers | Bonus |
|-------|--------|-------|
| Needleburst | Pin + Button | +30% fire rate, +5 damage |
| Sky Stitcher | Button + Spindle | +30 range, air targeting |
| Guardian Loom | Wool + Patch | +50% damage, +10 armor |

## Credits

**Game Design & Development**: Faux Embroidery Fabric
**Engine**: Custom Canvas 2D Engine (No Phaser)
**Assets**: To be created (see above)

## License

[Add your license here]

## Support

For questions or issues, please open an issue on GitHub or contact [your contact info].

---

**Ready to start creating assets? Follow the guides above and bring Threadland to life!** 🧵✨
