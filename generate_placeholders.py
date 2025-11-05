#!/usr/bin/env python3
"""
Generate placeholder assets for Threadland game testing
"""

from PIL import Image, ImageDraw, ImageFont
import os

def create_sprite(name, size, color, label, output_path):
    """Create a simple sprite placeholder with a circle and label"""
    img = Image.new('RGBA', size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Draw colored circle
    padding = 4
    draw.ellipse([padding, padding, size[0]-padding, size[1]-padding], fill=color)

    # Add border
    draw.ellipse([padding, padding, size[0]-padding, size[1]-padding], outline='white', width=2)

    # Add label
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", size[0]//8)
    except:
        font = ImageFont.load_default()

    # Draw text with shadow for readability
    text_bbox = draw.textbbox((0, 0), label, font=font)
    text_width = text_bbox[2] - text_bbox[0]
    text_height = text_bbox[3] - text_bbox[1]
    text_x = (size[0] - text_width) // 2
    text_y = (size[1] - text_height) // 2

    # Shadow
    draw.text((text_x+1, text_y+1), label, fill='black', font=font)
    # Main text
    draw.text((text_x, text_y), label, fill='white', font=font)

    img.save(output_path)
    print(f"Created: {output_path}")

def create_interstitial(name, color_top, color_bottom, label, output_path):
    """Create an interstitial background image with gradient"""
    size = (540, 960)
    img = Image.new('RGB', size, color_top)
    draw = ImageDraw.Draw(img)

    # Create vertical gradient
    for y in range(size[1]):
        ratio = y / size[1]
        r = int(color_top[0] * (1 - ratio) + color_bottom[0] * ratio)
        g = int(color_top[1] * (1 - ratio) + color_bottom[1] * ratio)
        b = int(color_top[2] * (1 - ratio) + color_bottom[2] * ratio)
        draw.line([(0, y), (size[0], y)], fill=(r, g, b))

    # Add decorative pattern (simple diagonal lines)
    for i in range(0, size[0] + size[1], 60):
        draw.line([(i, 0), (0, i)], fill=(255, 255, 255, 30), width=2)
        draw.line([(size[0], i), (i, size[1])], fill=(255, 255, 255, 30), width=2)

    # Add label
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 60)
    except:
        font = ImageFont.load_default()

    text = f"{label}\nWorld"
    text_bbox = draw.textbbox((0, 0), text, font=font)
    text_width = text_bbox[2] - text_bbox[0]
    text_height = text_bbox[3] - text_bbox[1]
    text_x = (size[0] - text_width) // 2
    text_y = (size[1] - text_height) // 2

    # Shadow
    draw.text((text_x+3, text_y+3), text, fill='black', font=font, align='center')
    # Main text
    draw.text((text_x, text_y), text, fill='white', font=font, align='center')

    img.save(output_path, 'WEBP', quality=85)
    print(f"Created: {output_path}")

def create_icon(size, output_path):
    """Create a PWA icon"""
    img = Image.new('RGBA', (size, size), (74, 144, 226))
    draw = ImageDraw.Draw(img)

    # Draw a simple lamb/sheep shape
    # Body (ellipse)
    draw.ellipse([size//4, size//3, size*3//4, size*2//3], fill='white')

    # Head (circle)
    head_size = size // 4
    draw.ellipse([size//2-head_size//2, size//4, size//2+head_size//2, size//2], fill='white')

    # Legs (rectangles)
    leg_width = size // 12
    leg_height = size // 6
    draw.rectangle([size//3, size*2//3, size//3+leg_width, size*2//3+leg_height], fill='white')
    draw.rectangle([size*2//3-leg_width, size*2//3, size*2//3, size*2//3+leg_height], fill='white')

    img.save(output_path)
    print(f"Created: {output_path}")

def create_screenshot(output_path):
    """Create a mock screenshot"""
    size = (540, 960)
    img = Image.new('RGB', size, (50, 50, 70))
    draw = ImageDraw.Draw(img)

    # Draw game grid
    grid_color = (70, 70, 90)
    for x in range(0, size[0], 54):
        draw.line([(x, 0), (x, size[1])], fill=grid_color)
    for y in range(0, size[1], 54):
        draw.line([(0, y), (size[0], y)], fill=grid_color)

    # Draw some tower placeholders
    towers = [
        ((108, 216), (74, 144, 226)),  # Blue
        ((216, 324), (201, 42, 42)),   # Red
        ((324, 432), (124, 179, 66)),  # Green
    ]
    for (x, y), color in towers:
        draw.ellipse([x, y, x+48, y+48], fill=color)

    # Draw some enemy placeholders
    enemies = [
        ((270, 108), (255, 107, 107)),  # Light red
        ((162, 216), (255, 107, 107)),
        ((378, 324), (255, 107, 107)),
    ]
    for (x, y), color in enemies:
        draw.ellipse([x, y, x+24, y+24], fill=color)

    # Title
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 40)
    except:
        font = ImageFont.load_default()

    draw.text((20, 20), "Threadland", fill='white', font=font)
    draw.text((20, 70), "Tower Defense", fill=(200, 200, 200), font=font)

    img.save(output_path)
    print(f"Created: {output_path}")

# Generate tower sprites
print("\n=== Generating Tower Sprites ===")
towers = [
    ('pinLauncher', (64, 64), (124, 179, 66), 'PIN'),
    ('buttonMortar', (64, 64), (74, 144, 226), 'BTN'),
    ('woolCannon', (64, 64), (255, 167, 38), 'WOOL'),
    ('patchTotem', (64, 64), (156, 39, 176), 'PTCH'),
    ('spindleWard', (64, 64), (244, 67, 54), 'SPND'),
]

for tower_id, size, color, label in towers:
    create_sprite(
        f'tower-{tower_id}',
        size,
        color,
        label,
        f'game/public/assets/sprites/towers/tower-{tower_id}.png'
    )

# Generate enemy sprites
print("\n=== Generating Enemy Sprites ===")
enemies = [
    ('wolf', (24, 24), (201, 42, 42), 'W'),
    ('threadling', (18, 18), (255, 107, 107), 'T'),
    ('nightmoth', (22, 22), (106, 27, 154), 'M'),
    ('tatterbeast', (32, 32), (191, 54, 12), 'TB'),
    ('spindler', (26, 26), (255, 152, 0), 'S'),
]

for enemy_id, size, color, label in enemies:
    create_sprite(
        f'enemy-{enemy_id}',
        size,
        color,
        label,
        f'game/public/assets/sprites/enemies/enemy-{enemy_id}.png'
    )

# Generate projectile sprites
print("\n=== Generating Projectile Sprites ===")
projectiles = [
    ('pin', (16, 16), (255, 215, 0), 'P'),
    ('button', (20, 20), (100, 181, 246), 'B'),
    ('wool', (24, 24), (255, 245, 157), 'W'),
    ('dart', (12, 12), (186, 104, 200), 'D'),
]

for proj_id, size, color, label in projectiles:
    create_sprite(
        f'projectile-{proj_id}',
        size,
        color,
        label,
        f'game/public/assets/sprites/projectiles/projectile-{proj_id}.png'
    )

# Generate interstitial images
print("\n=== Generating Interstitial Images ===")
interstitials = [
    ('prairie', (124, 179, 66), (88, 139, 47), 'Prairie'),
    ('desert', (255, 167, 38), (255, 111, 0), 'Desert'),
    ('forest', (56, 142, 60), (27, 94, 32), 'Forest'),
]

for world_id, color_top, color_bottom, label in interstitials:
    create_interstitial(
        world_id,
        color_top,
        color_bottom,
        label,
        f'game/public/assets/interstitials/{world_id}.webp'
    )

# Generate PWA icons
print("\n=== Generating PWA Icons ===")
icon_sizes = [72, 96, 128, 144, 152, 192, 384, 512]
for size in icon_sizes:
    create_icon(size, f'game/public/assets/icons/icon-{size}.png')

# Generate maskable icons
print("\n=== Generating Maskable Icons ===")
for size in [192, 512]:
    create_icon(size, f'game/public/assets/icons/icon-maskable-{size}.png')

# Generate screenshots
print("\n=== Generating Screenshots ===")
create_screenshot('game/public/assets/screenshots/gameplay-1.png')
create_screenshot('game/public/assets/screenshots/gameplay-2.png')

print("\n✅ All placeholder assets generated successfully!")
print("Assets location: game/public/assets/")
