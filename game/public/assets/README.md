# Placeholder Assets for Threadland Game

This directory contains **temporary placeholder assets** for testing game functionality.

## What's Included

### Sprites
- **Towers** (5 files): Colored circles with text labels
  - Pin Launcher (green)
  - Button Mortar (blue)
  - Wool Cannon (orange)
  - Patch Totem (purple)
  - Spindle Ward (red)

- **Enemies** (5 files): Colored circles with letters
  - Wolf (red)
  - Threadling (light red)
  - Nightmoth (purple)
  - Tatterbeast (dark orange)
  - Spindler (orange)

- **Projectiles** (4 files): Small colored circles
  - Pin (gold)
  - Button (light blue)
  - Wool (light yellow)
  - Dart (purple)

### World Images
- **Interstitials** (3 files): Gradient backgrounds for each world
  - Prairie (green gradient)
  - Desert (orange gradient)
  - Forest (dark green gradient)

### PWA Assets
- **Icons**: 10 icon sizes with simple lamb shape
- **Screenshots**: 2 mock gameplay screenshots

## How to Replace

Simply replace any placeholder file with your own artwork:

1. **Keep the same filename** (e.g., `tower-pinLauncher.png`)
2. **Use the same dimensions** (see specifications below)
3. **Use PNG with transparency** for sprites
4. **Use WebP** for interstitial images (optional, PNG also works)

## Asset Specifications

### Tower Sprites
- Size: 64×64px
- Format: PNG with transparency
- Style: Should represent the tower type visually

### Enemy Sprites
- Sizes vary by enemy type (18-32px)
- Format: PNG with transparency
- Ground enemies: Use warm colors
- Flying enemies: Use cool colors

### Projectile Sprites
- Sizes: 12-24px (small, fast-moving)
- Format: PNG with transparency

### Interstitial Images
- Size: 540×960px (portrait, 9:16 aspect ratio)
- Format: WebP recommended (PNG also works)
- Should represent the world theme
- Target file size: <200KB each

## Regenerating Placeholders

If you need to regenerate all placeholder assets, run:

```bash
python3 generate_placeholders.py
```

This will overwrite all existing placeholder files.

## Notes

- The game will run perfectly fine with these placeholders
- You can replace assets one at a time - no need to do all at once
- Missing assets will be automatically replaced with code-generated placeholders
- For the best embroidered/textile aesthetic, use visible stitch patterns and fabric textures
