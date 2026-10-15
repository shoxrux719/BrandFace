"""Render the original portfolio title film, in landscape and portrait.

All animation, typography, compositing and sound are authored here. The AI
photographs remain separate project assets. Requires Pillow, NumPy and the
ffmpeg-static development dependency; no external footage or music is used.
"""
from pathlib import Path
from functools import lru_cache
import math
import subprocess
import wave
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageEnhance

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "public" / "assets"
OUTPUT = ASSETS / "intro"
WORK = ROOT / ".video-work"
FFMPEG = ROOT / "node_modules" / "ffmpeg-static" / "ffmpeg.exe"
FPS = 30
DURATION = 9.4
INK = (15, 23, 27)
PAPER = (238, 231, 219)


def clamp(x):
    return max(0., min(1., x))


def ease(x):
    x = clamp(x)
    return 1 - (1 - x) ** 3


@lru_cache(maxsize=128)
def font(size, italic=False):
    name = "CormorantGaramond-Italic.ttf" if italic else "CormorantGaramond.ttf"
    face = ImageFont.truetype(str(ASSETS / "fonts" / name), max(1, int(size)))
    try:
        face.set_variation_by_axes([300])
    except (OSError, AttributeError):
        pass
    return face


@lru_cache(maxsize=40)
def photo(name, cell=None):
    im = Image.open(ASSETS / "generated" / f"{name}.png").convert("RGB")
    if cell is not None:
        split = 679 if name == "classic" else 724
        left = 543 * (cell % 2)
        top = split + 1 if cell > 1 else 0
        bottom = 1448 if cell > 1 else split - 1
        im = im.crop((left, top, left + 543, bottom))
    return im


@lru_cache(maxsize=60)
def camera_plate(name, cell, width, height):
    im = photo(name, cell)
    scale = max(width / im.width, height / im.height) * 1.18
    return im.resize((math.ceil(im.width * scale), math.ceil(im.height * scale)), Image.Resampling.LANCZOS)


def camera(name, cell, width, height, progress, focal=(.5, .42)):
    plate = camera_plate(name, cell, width, height)
    zoom = 1.02 + .09 * ease(progress)
    crop_width, crop_height = width / zoom, height / zoom
    x = (plate.width - crop_width) * focal[0]
    y = (plate.height - crop_height) * focal[1]
    return plate.resize((width, height), Image.Resampling.BICUBIC,
                        box=(x, y, x + crop_width, y + crop_height))


@lru_cache(maxsize=180)
def text_plate(text, size, italic=False, tracking=0):
    face = font(size, italic)
    box = face.getbbox(text)
    width = int(sum(face.getlength(c) for c in text) + tracking * max(0, len(text)-1))
    tile = Image.new("RGBA", (max(1, width + 12), int(size * 1.5) + 12))
    pen = ImageDraw.Draw(tile)
    x = 6
    for letter in text:
        pen.text((x, 6 - box[1]), letter, font=face, fill=PAPER)
        x += face.getlength(letter) + tracking
    return tile


def title(frame, text, x, y, size, progress=1, italic=False, tracking=0, center=False):
    tile = text_plate(text, int(size), italic, int(tracking))
    p = ease(progress)
    # An animated typographic mask, rather than a dissolve on a screenshot.
    visible = int(tile.height * p)
    if visible < 1:
        return
    reveal = tile.crop((0, 0, tile.width, visible))
    if p < 1:
        reveal.putalpha(reveal.getchannel("A").point(lambda alpha: int(alpha * p)))
    if center:
        x -= tile.width / 2
    frame.paste(reveal, (int(x), int(y + (1 - p) * size * .3)), reveal)


def letter_title(frame, text, y, max_width, size, progress, center_x):
    face = font(size)
    advances = [face.getlength(c) for c in text]
    total = sum(advances)
    if total > max_width:
        size *= max_width / total
        face = font(size)
        advances = [face.getlength(c) for c in text]
    x = center_x - sum(advances) / 2
    for i, letter in enumerate(text):
        title(frame, letter, x, y, size, (progress - i * .035) / .5)
        x += advances[i]


def line(frame, points, opacity=.35, width=1):
    color = tuple(round(a * opacity + b * (1 - opacity)) for a, b in zip(PAPER, INK))
    ImageDraw.Draw(frame).line(points, fill=color, width=width)


def frame_scene(scene, t, w, h):
    portrait = h > w
    s = w / 1920 if not portrait else w / 1080
    f = Image.new("RGB", (w, h), INK)
    if scene == 0:
        # A sliver opens into a portrait while the monogram resolves.
        pw = int(w * (.46 if not portrait else .84))
        ph = int(h * .82)
        im = camera("cover", None, pw, ph, t, (.62, .33))
        reveal = int(pw * ease(t / .92))
        if reveal:
            f.paste(im.crop((pw - reveal, 0, pw, ph)), (w - reveal - int(w * .06), int(h * .09)))
        center_x = w * (.28 if not portrait else .48)
        title(f, "JW", center_x, h * .29, 250 * s, t / .7, center=True)
        title(f, "A study in expression", center_x, h * .57, 37 * s, (t - .2) / .8, italic=True, center=True)
        line(f, [(int(w * .08), int(h * .75)), (int(w * .44), int(h * .75))], .32)
    elif scene == 1:
        f = camera("editorial", None, w, h, t, (.46, .47))
        # A dark photographic wash keeps the delicate type readable.
        f = ImageEnhance.Brightness(f).enhance(.68)
        x = w * (.08 if not portrait else .07)
        title(f, "Every", x, h * .20, (190 if not portrait else 150) * s, t / .65, italic=True)
        title(f, "FRAME", x, h * .43, (230 if not portrait else 176) * s, (t - .18) / .65)
        title(f, "tells a story.", x, h * .70, 55 * s, (t - .38) / .75, italic=True)
    elif scene == 2:
        panels = [("commercial", 0), ("lifestyle", 0), ("concept", 0)]
        if portrait:
            panels = panels[:2]
        n = len(panels)
        gap = int(w * .009)
        pw = (w - gap * (n + 1)) // n
        ph = int(h * (.78 if not portrait else .70))
        for i, (name, cell) in enumerate(panels):
            entry = ease((t - i * .09) / .48)
            x, y = gap + i * (pw + gap), int(h * .09 + (1-entry) * h * .75)
            f.paste(camera(name, cell, pw, ph, t, (.5, .33)), (x, y))
        letter_title(f, "EXPRESSION", h * .70, w * .94, (190 if not portrait else 120) * s, t - .3, w / 2)
    elif scene == 3:
        if portrait:
            f = camera("cover", None, w, h, t, (.63, .37))
            f = ImageEnhance.Brightness(f).enhance(.85)
            title(f, "Jennifer", w * .09, h * .69, 165 * s, t / .7, italic=True)
            title(f, "WILLIAMS", w * .09, h * .80, 122 * s, (t - .2) / .8)
        else:
            pw = int(w * .60)
            im = camera("cover", None, pw, h, t, (.58, .3))
            f.paste(im, (w - pw, 0))
            title(f, "Presence.", w * .06, h * .23, 126 * s, t / .65, italic=True)
            title(f, "Poise.", w * .06, h * .40, 126 * s, (t - .15) / .65, italic=True)
            letter_title(f, "JENNIFER", h * .67, w * .92, 230 * s, t - .12, w / 2)
        line(f, [(int(w * .07), int(h * .94)), (int(w * .93), int(h * .94))], .3)
    elif scene == 4:
        gap = max(2, int(w * .006))
        pw = (w - gap) // 2
        left = camera("cover", None, pw, h, t, (.6, .35))
        right = camera("back-cover", None, w-pw-gap, h, t, (.55, .3))
        f.paste(left, (0, 0))
        f.paste(right, (pw+gap, 0))
        dark = Image.new("RGB", (w, h), INK)
        f = Image.blend(f, dark, .45 + .25 * ease(t))
        size = (245 if not portrait else 134) * s
        letter_title(f, "PORTFOLIO", h * .39, w * .90, size, t + .1, w / 2)
        title(f, "Jennifer Williams", w / 2, h * .61, 58 * s, (t - .22) / .6, italic=True, center=True)
        title(f, "A collection of moments", w / 2, h * .76, 28 * s, (t - .4) / .65, italic=True, center=True)
    return f


SCENES = [(0, 1.65), (1.65, 3.4), (3.4, 5.05), (5.05, 7.15), (7.15, DURATION)]


def film_frame(time, w, h):
    index = next((i for i, (_, end) in enumerate(SCENES) if time < end), 4)
    start, end = SCENES[index]
    frame = frame_scene(index, (time-start)/(end-start), w, h)
    # Camera-match dissolves and a travelling vertical matte transition.
    transition = .30
    if index > 0 and time < start + transition:
        previous_start, previous_end = SCENES[index-1]
        prior = frame_scene(index-1, 1, w, h)
        q = ease((time-start)/transition)
        boundary = round(w * q)
        prior.paste(frame.crop((0, 0, boundary, h)), (0, 0))
        frame = prior
        line(frame, [(boundary, 0), (boundary, h)], .45, max(1, w//960))
    if time < .35:
        frame = Image.blend(Image.new("RGB", (w, h), INK), frame, ease(time/.35))
    # A fine, still texture resembles film stock without flashing grain.
    if time > DURATION - .5:
        frame = Image.blend(frame, Image.new("RGB", (w, h), INK), .2 * ease((time-DURATION+.5)/.5))
    return frame


def soundtrack(path):
    rate = 48000
    t = np.arange(round(rate * DURATION), dtype=np.float64) / rate
    envelope = np.minimum(t/1.5, 1) * np.minimum((DURATION-t)/1.8, 1)
    envelope = np.clip(envelope, 0, 1)
    pad = (.035*np.sin(2*np.pi*110*t) + .022*np.sin(2*np.pi*164.81*t)
           + .016*np.sin(2*np.pi*220.2*t)) * envelope
    rng = np.random.default_rng(12)
    noise = rng.normal(0, 1, len(t))
    noise = np.convolve(noise, np.ones(36)/36, mode="same")
    air = np.zeros_like(t)
    for start, _ in SCENES[1:]:
        air += np.exp(-((t-start)/.18)**2) * noise * .05
    left = pad + air
    right = pad * .97 + np.roll(air, 280)
    pcm = (np.clip(np.column_stack([left, right]), -1, 1) * 32767).astype("<i2")
    with wave.open(str(path), "wb") as out:
        out.setnchannels(2)
        out.setsampwidth(2)
        out.setframerate(rate)
        out.writeframes(pcm.tobytes())


def render(w, h, filename):
    audio = WORK / "original-soundtrack.wav"
    destination = OUTPUT / filename
    log_path = WORK / f"{filename}.log"
    command = [str(FFMPEG), "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{w}x{h}",
               "-r", str(FPS), "-i", "pipe:0", "-i", str(audio), "-c:v", "libx264", "-preset", "fast",
               "-crf", "20", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "128k",
               "-movflags", "+faststart", "-shortest", str(destination)]
    with log_path.open("w", encoding="utf-8") as log:
        process = subprocess.Popen(command, stdin=subprocess.PIPE, stderr=log, stdout=subprocess.DEVNULL)
        try:
            for i in range(round(DURATION * FPS)):
                frame = film_frame(i/FPS, w, h)
                if i in [36, 76, 127, 181, 248] and w > h:
                    frame.save(WORK / f"scene-{i}.jpg", quality=90)
                if i == 36:
                    frame.save(OUTPUT / ("poster-portrait.jpg" if h > w else "poster.jpg"), quality=90)
                process.stdin.write(frame.tobytes())
                if i % 60 == 0:
                    print(f"{filename}: {i}/{round(DURATION*FPS)} frames", flush=True)
        finally:
            process.stdin.close()
        code = process.wait()
    if code:
        raise RuntimeError(log_path.read_text(encoding="utf-8", errors="replace"))
    print(f"Saved {destination} ({destination.stat().st_size / 1e6:.2f} MB)", flush=True)
    camera_plate.cache_clear()


if __name__ == "__main__":
    OUTPUT.mkdir(parents=True, exist_ok=True)
    WORK.mkdir(parents=True, exist_ok=True)
    if not FFMPEG.exists():
        raise SystemExit("Run npm install first to install ffmpeg-static.")
    soundtrack(WORK / "original-soundtrack.wav")
    render(1920, 1080, "portfolio-intro.mp4")
    import runpy
    runpy.run_path(str(ROOT / "scripts" / "render-mobile-intro.py"), run_name="__main__")
