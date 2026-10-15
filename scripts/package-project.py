"""Package the React source, its assets and the ready-to-host static build."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

root = Path(__file__).resolve().parents[1]
destination = root.parent / "jennifer-portfolio.zip"
directories = ["src", "public", "tests", "dist"]
files = ["index.html", "vite.config.js", "package.json", "package-lock.json",
         ".gitignore", "README.md", "image-prompts.md",
         "scripts/render-intro.py", "scripts/render-mobile-intro.py",
         "scripts/package-project.py", "scripts/optimize-photos.py"]

with ZipFile(destination, "w", ZIP_DEFLATED, compresslevel=6) as bundle:
    for directory in directories:
        for path in sorted((root / directory).rglob("*")):
            if path.is_file():
                bundle.write(path, root.name + "/" + path.relative_to(root).as_posix())
    for filename in files:
        bundle.write(root / filename, root.name + "/" + filename)

with ZipFile(destination) as bundle:
    if bundle.testzip() is not None:
        raise RuntimeError("Archive verification failed")
    print(f"{destination}: {len(bundle.namelist())} files, {destination.stat().st_size/1e6:.1f} MB")
