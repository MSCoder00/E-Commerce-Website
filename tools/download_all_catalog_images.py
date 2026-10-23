import os
import io
import re
import urllib.request
from PIL import Image

# Read products-data.js to get all products and images
with open("js/products-data.js", "r", encoding="utf-8") as f:
    content = f.read()

# Find each product block
# Extract id and images array
product_blocks = re.findall(r'\{\s*id:\s*"([^"]+)",[\s\S]*?images:\s*\[([\s\S]*?)\]', content)

print(f"Found {len(product_blocks)} product blocks in products-data.js")

for prod_id, images_str in product_blocks:
    urls = [u.strip(' "\'\r\n') for u in images_str.split(',') if u.strip(' "\'\r\n')]
    prod_dir = os.path.join("assets", "images", "products", prod_id)
    os.makedirs(prod_dir, exist_ok=True)
    
    file_names = ["main.jpg", "1.jpg", "2.jpg"]
    
    for idx in range(min(3, len(urls))):
        target_name = file_names[idx]
        target_path = os.path.join(prod_dir, target_name)
        
        # If already exists and valid size, skip
        if os.path.exists(target_path) and os.path.getsize(target_path) > 5000:
            continue
            
        url = urls[idx]
        if not url.startswith("http"):
            # Local source file
            src_path = url.lstrip("/")
            if os.path.exists(src_path):
                img = Image.open(src_path)
                if img.mode != 'RGB':
                    img = img.convert('RGB')
                img.thumbnail((800, 800), Image.Resampling.LANCZOS)
                img.save(target_path, "JPEG", quality=82, optimize=True)
                print(f"Copied & optimized local {src_path} -> {target_path}")
            continue

        try:
            print(f"Fetching {prod_id}/{target_name} from {url[:50]}...")
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=8) as resp:
                data = resp.read()
            img = Image.open(io.BytesIO(data))
            if img.mode != 'RGB':
                img = img.convert('RGB')
            img.thumbnail((800, 800), Image.Resampling.LANCZOS)
            img.save(target_path, "JPEG", quality=82, optimize=True)
            size_kb = os.path.getsize(target_path) / 1024
            print(f"Saved {target_path} ({size_kb:.1f} KB)")
        except Exception as e:
            print(f"Warning: could not fetch {url}: {e}")

print("Done verifying all product image directories!")
