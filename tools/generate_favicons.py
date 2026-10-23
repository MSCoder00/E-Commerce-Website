import math
from PIL import Image, ImageDraw, ImageFont

def render_logo(size):
    # Render at 4x supersampling for ultra crisp edges
    scale = 4
    canvas_size = size * scale
    img = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Rounded rectangle coordinates
    rx = int(16 * (canvas_size / 64))

    # Gradient from #4F46E5 (79, 70, 229) to #7C3AED (124, 58, 237)
    # Draw diagonal linear gradient mask
    mask = Image.new("L", (canvas_size, canvas_size), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.rounded_rectangle([0, 0, canvas_size - 1, canvas_size - 1], radius=rx, fill=255)

    grad = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    for y in range(canvas_size):
        for x in range(canvas_size):
            t = (x + y) / (canvas_size * 2)
            r = int(79 + (124 - 79) * t)
            g = int(70 + (58 - 70) * t)
            b = int(229 + (237 - 229) * t)
            grad.putpixel((x, y), (r, g, b, 255))

    img.paste(grad, (0, 0), mask)

    # Draw Text "MS"
    font_size = int(28 * (canvas_size / 64))
    font = None
    for font_name in ["arialbd.ttf", "arial.ttf", "segoeui.ttf", "calibri.ttf"]:
        try:
            font = ImageFont.truetype(font_name, font_size)
            break
        except Exception:
            continue
    if font is None:
        font = ImageFont.load_default()

    draw = ImageDraw.Draw(img)
    text = "MS"
    bbox = draw.textbbox((0, 0), text, font=font)
    text_w = bbox[2] - bbox[0]
    text_h = bbox[3] - bbox[1]
    
    # SVG y=43 corresponds to baseline, center text around center
    tx = (canvas_size - text_w) / 2 - bbox[0]
    ty = (canvas_size - text_h) / 2 - bbox[1] - int(canvas_size * 0.03)
    draw.text((tx, ty), text, fill=(255, 255, 255, 255), font=font)

    # Accent dot: circle cx=53, cy=53, r=5 in 64x64 grid
    cx = int(53 * (canvas_size / 64))
    cy = int(53 * (canvas_size / 64))
    r = int(5 * (canvas_size / 64))
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(255, 107, 107, 255))

    # Downsample with high-quality Lanczos filter
    final_img = img.resize((size, size), Image.Resampling.LANCZOS)
    return final_img

sizes = {
    "assets/favicon-32x32.png": 32,
    "assets/favicon-16x16.png": 16,
    "assets/apple-touch-icon.png": 180,
    "assets/icon-192.png": 192,
    "assets/icon-512.png": 512
}

for path, sz in sizes.items():
    icon = render_logo(sz)
    icon.save(path, "PNG")
    print(f"Generated {path} ({sz}x{sz})")

print("All favicons successfully generated!")
