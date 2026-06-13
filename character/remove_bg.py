from pathlib import Path
from rembg import remove
from PIL import Image

input_dir = Path(".")
output_dir = Path("transparent")
output_dir.mkdir(exist_ok=True)

for i in range(16):
    name = f"character_{i:04d}.png"
    src = input_dir / name
    dst = output_dir / name

    if not src.exists():
        print(f"skip: {src}")
        continue

    print(f"processing: {src} -> {dst}")

    with Image.open(src) as img:
        img = img.convert("RGBA")
        result = remove(img)
        result.save(dst)

print("done")