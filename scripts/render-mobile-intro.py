"""Author a separate tall-screen film with safe, single-portrait compositions.

Run this file to rebuild just the phone film. The desktop renderer also calls it.
Typography, camera motion, masks and soundtrack are generated from source.
"""
from functools import lru_cache
import importlib.util
from pathlib import Path
import math
import subprocess
from PIL import Image, ImageDraw

spec = importlib.util.spec_from_file_location("desktop_film", Path(__file__).with_name("render-intro.py"))
film = importlib.util.module_from_spec(spec)
spec.loader.exec_module(film)
INK = (15, 23, 27)
PAPER = (238, 231, 219)


@lru_cache(maxsize=12)
def plate(name, cell, w, h):
    image = film.photo(name, cell)
    scale = max(w / image.width, h / image.height) * 1.065
    return image.resize((math.ceil(image.width * scale), math.ceil(image.height * scale)), Image.Resampling.LANCZOS)


def portrait(name, cell, w, h, progress, focal=(.5, .35)):
    image = plate(name, cell, w, h)
    # A restrained push-in preserves the face and shoulders on a narrow screen.
    zoom = 1 + .025 * film.ease(progress)
    cw, ch = w / zoom, h / zoom
    x, y = (image.width - cw) * focal[0], (image.height - ch) * focal[1]
    return image.resize((w, h), Image.Resampling.BICUBIC, box=(x, y, x + cw, y + ch))


@lru_cache(maxsize=12)
def shade(w, h, start, strength):
    layer = Image.new("RGBA", (w, h))
    pen = ImageDraw.Draw(layer)
    for y in range(h):
        alpha = round(255 * strength * film.clamp((y / h - start) / (1 - start)))
        pen.line([(0, y), (w, y)], fill=(*INK, alpha))
    return layer


def text(frame, value, y, size, progress=1, italic=False, center=False):
    """Every title is fitted to an 82% safe width, including animated glyphs."""
    w, h = frame.size
    scale = w / 720
    size *= scale
    face = film.font(size, italic)
    width = sum(face.getlength(c) for c in value) + 12
    if width > w * .82:
        size *= (w * .82 - 12) / width
    film.title(frame, value, w / 2 if center else w * .09, h * y,
               size, progress, italic=italic, center=center)


def photo_frame(name, cell, w, h, t, top=.11, height=.71, inset=0, focal=(.5, .35)):
    frame = Image.new("RGB", (w, h), INK)
    pw, ph = round(w * (1 - inset * 2)), round(h * height)
    image = portrait(name, cell, pw, ph, t, focal)
    frame.paste(image, (round(w * inset), round(h * top)))
    frame.paste(shade(w, h, .48, .95), (0, 0), shade(w, h, .48, .95))
    return frame


def scene(index, t, w, h):
    if index == 0:
        frame = photo_frame("cover", None, w, h, t, top=.12, height=.65, inset=.055, focal=(.58, .3))
        # A narrow moving matte opens the image immediately; the face stays central.
        reveal = film.ease(t / .34)
        if reveal < 1:
            ImageDraw.Draw(frame).rectangle((0, 0, round(w * (1 - reveal)), h), fill=INK)
        text(frame, "Jennifer", .675, 124, t / .48, italic=True)
        text(frame, "WILLIAMS", .775, 103, (t - .12) / .5)
    elif index == 1:
        frame = photo_frame("back-cover", None, w, h, t, top=.105, height=.715, focal=(.5, .22))
        text(frame, "Every", .645, 132, t / .45, italic=True)
        text(frame, "frame.", .745, 148, (t - .12) / .48)
    elif index == 2:
        frame = photo_frame("lifestyle", 0, w, h, t, top=.13, height=.63, inset=.055, focal=(.5, .26))
        text(frame, "Poise", .665, 146, t / .45, italic=True)
        text(frame, "in motion.", .775, 98, (t - .13) / .5)
    elif index == 3:
        frame = photo_frame("commercial", 1, w, h, t, top=.12, height=.68, focal=(.58, .1))
        text(frame, "Presence.", .675, 121, t / .46, italic=True)
        text(frame, "Expression.", .775, 98, (t - .12) / .5)
    else:
        frame = photo_frame("cover", None, w, h, t, top=.10, height=.74, focal=(.57, .3))
        frame = Image.blend(frame, Image.new("RGB", (w, h), INK), .42 + .18 * film.ease(t))
        text(frame, "PORT", .445, 188, t / .43, center=True)
        text(frame, "FOLIO", .565, 188, (t - .07) / .48, center=True)
        text(frame, "Jennifer Williams", .755, 56, (t - .22) / .5, italic=True, center=True)
        text(frame, "A collection of moments", .82, 31, (t - .3) / .52, italic=True, center=True)
    if index < 4:
        film.line(frame, [(round(w * .09), round(h * .885)), (round(w * .91), round(h * .885))], .3, max(1, round(w / 720)))
    return frame


def frame_at(time, w, h):
    index = next((i for i, (_, end) in enumerate(film.SCENES) if time < end), 4)
    start, end = film.SCENES[index]
    frame = scene(index, (time - start) / (end - start), w, h)
    if index and time < start + .27:
        previous = scene(index - 1, 1, w, h)
        q = film.ease((time - start) / .27)
        boundary = round(w * (1 - q))
        previous.paste(frame.crop((boundary, 0, w, h)), (boundary, 0))
        frame = previous
        film.line(frame, [(boundary, 0), (boundary, h)], .5, max(1, w // 720))
    if time < .16:
        frame = Image.blend(Image.new("RGB", (w, h), INK), frame, film.ease(time / .16))
    return frame


def main():
    film.OUTPUT.mkdir(parents=True, exist_ok=True)
    film.WORK.mkdir(parents=True, exist_ok=True)
    film.soundtrack(film.WORK / "original-soundtrack.wav")
    # Keep a high-quality portrait master, then create a smaller phone download.
    w, h = 1080, 2340
    destination = film.OUTPUT / "portfolio-intro-portrait.mp4"
    log_path = film.WORK / "mobile-render.log"
    command = [str(film.FFMPEG), "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{w}x{h}",
               "-r", str(film.FPS), "-i", "pipe:0", "-i", str(film.WORK / "original-soundtrack.wav"),
               "-c:v", "libx264", "-preset", "fast", "-crf", "20", "-pix_fmt", "yuv420p",
               "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart", "-shortest", str(destination)]
    with log_path.open("w", encoding="utf-8") as log:
        process = subprocess.Popen(command, stdin=subprocess.PIPE, stderr=log, stdout=subprocess.DEVNULL)
        try:
            for i in range(round(film.DURATION * film.FPS)):
                frame = frame_at(i / film.FPS, w, h)
                if i in [36, 85, 135, 191, 261]:
                    review = frame.resize((360, 780), Image.Resampling.LANCZOS)
                    review.save(film.WORK / f"phone-scene-{i}.jpg", quality=92)
                if i == 36:
                    frame.resize((720, 1560), Image.Resampling.LANCZOS).save(film.OUTPUT / "poster-portrait.jpg", quality=90)
                process.stdin.write(frame.tobytes())
                if i % 60 == 0:
                    print(f"Phone film: {i}/{round(film.DURATION * film.FPS)} frames", flush=True)
        finally:
            process.stdin.close()
        if process.wait():
            raise RuntimeError(log_path.read_text(encoding="utf-8", errors="replace"))
    subprocess.run([str(film.FFMPEG), "-hide_banner", "-loglevel", "error", "-y", "-i", str(destination),
                    "-vf", "scale=720:1560", "-c:v", "libx264", "-preset", "medium", "-crf", "23",
                    "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "96k", "-movflags", "+faststart",
                    str(film.OUTPUT / "portfolio-intro-mobile.mp4")], check=True)
    for filename in ["portfolio-intro-portrait.mp4", "portfolio-intro-mobile.mp4"]:
        print(f"Saved {filename}: {(film.OUTPUT / filename).stat().st_size / 1e6:.2f} MB", flush=True)


if __name__ == "__main__":
    main()
