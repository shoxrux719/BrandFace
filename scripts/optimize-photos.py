"""Create web-ready versions without altering the original AI photographs."""
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1]
source = root / "public" / "assets" / "generated"
destination = root / "public" / "assets" / "photos"
destination.mkdir(parents=True, exist_ok=True)
before = after = 0
for path in sorted(source.glob("*.png")):
    image = Image.open(path)
    image.save(destination / (path.stem + ".webp"), "WEBP", quality=88, method=6)
    before += path.stat().st_size
    after += (destination / (path.stem + ".webp")).stat().st_size
    print(f"{path.stem}: {(destination / (path.stem + '.webp')).stat().st_size//1024} KB", flush=True)
print(f"Photos: {before/1e6:.1f} MB -> {after/1e6:.1f} MB ({100*(1-after/before):.0f}% smaller)")
