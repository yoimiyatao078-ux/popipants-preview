#!/usr/bin/env python3
"""Malaz trapped in the homepage pixel CD.

Her pixels are copied 1:1 from images/scenes/angel.png (a 5x
nearest-neighbour enlargement). Frames only slide that whole sprite
by one pixel, or close her eyes. Hearts, sparkles and the glass
glint are separate pixels in the CD palette. Nothing is redrawn.
"""
import json
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
ANGEL = ROOT / "images/scenes/angel.png"
CD_PATH = ROOT / "images/art/cd.png"
PREVIEW = ROOT / "images/sprites/previews"
SPRITE_JS = ROOT / "js/cd-trap-sprite.js"

GIRL = {
    (78, 46, 30), (46, 26, 16), (255, 226, 207),
    (255, 158, 199), (217, 68, 127), (239, 169, 203), (255, 255, 255),
}
OUTLINE = (46, 26, 16)
SKIN = (255, 226, 207)
PINK = (255, 95, 162)
PALE = (255, 214, 232)
WHITE = (255, 255, 255)
BLUSH = (239, 169, 203)

# Eyes in the cropped sprite. Everything else stays untouched.
EYES = [(5, 9), (6, 9), (14, 9), (15, 9), (5, 10), (6, 10), (14, 10), (15, 10)]

# Hole centre of images/art/cd.png is the image centre (about 52, 52).
ORIGIN = (42, 41)

# (x, y, colour). A 5x5 heart, highlight on the top-left bump.
HEART = [
    (1, 0, PINK), (3, 0, PINK),
    (0, 1, PINK), (1, 1, PALE), (2, 1, PINK), (3, 1, PINK), (4, 1, PINK),
    (0, 2, PINK), (1, 2, PINK), (2, 2, PINK), (3, 2, PINK), (4, 2, PINK),
    (1, 3, PINK), (2, 3, BLUSH), (3, 3, PINK),
    (2, 4, PINK),
]
SPARK = [
    (0, 1, WHITE),
    (1, 0, WHITE), (1, 1, PINK), (1, 2, WHITE),
    (2, 1, WHITE),
]


def native_scene():
    src = Image.open(ANGEL).convert("RGB")
    w, h = src.size
    small = Image.new("RGB", (w // 5, h // 5))
    sp, dp = src.load(), small.load()
    for y in range(h // 5):
        for x in range(w // 5):
            dp[x, y] = sp[x * 5 + 2, y * 5 + 2]
    return small


def extract_malaz(scene):
    sp = scene.load()
    pts = {(x, y) for y in range(90, 111) for x in range(137, 157) if sp[x, y] in GIRL}
    xs = [p[0] for p in pts]
    ys = [p[1] for p in pts]
    a, b, c, d = min(xs), min(ys), max(xs), max(ys)
    img = Image.new("RGBA", (c - a + 1, d - b + 1), (0, 0, 0, 0))
    ip = img.load()
    pixels = []
    for x, y in sorted(pts):
        r, g, b2 = sp[x, y]
        ip[x - a, y - b] = (r, g, b2, 255)
        pixels.append((x - a, y - b, r, g, b2))
    return img, pixels


def heart_spots(step):
    """Two hearts drift up inside the disc, off her body."""
    spots = []
    for i, (x, y) in enumerate(((22, 36), (74, 32))):
        t = (step + i * 4) % 8
        spots.append((x + (1 if (t + i) % 2 else 0), y - t))
    return spots


def spark_spots(step):
    ring = [(18, 50), (80, 46), (48, 20), (34, 74), (68, 76), (28, 28), (76, 64)]
    a = ring[step % len(ring)]
    b = ring[(step + 3) % len(ring)]
    return [a, b]


def glint_spot(step):
    """One shine walking the inner ring, clear of the 20x21 sprite."""
    ring = [(34, 32), (66, 32), (74, 48), (66, 66), (34, 66), (26, 48), (30, 36), (70, 58)]
    return ring[step % len(ring)]


def smudge_spots(dx, dy):
    """Pale glass marks just outside her hands. Not part of the sprite."""
    ox, oy = ORIGIN[0] + dx, ORIGIN[1] + dy
    return [
        (ox - 1, oy + 17, WHITE), (ox - 2, oy + 16, PALE),
        (ox + 20, oy + 17, WHITE), (ox + 21, oy + 16, PALE),
    ]


def cull(dots, pixels, dx, dy):
    """Effects stay off her sprite so a heart never covers her face."""
    body = {(x + ORIGIN[0] + dx, y + ORIGIN[1] + dy) for x, y, *_ in pixels}
    return [p for p in dots if (p[0], p[1]) not in body]


def build_frames(pixels):
    # Whole-sprite shifts only. blink closes the eight eye pixels.
    # The whole sprite moves together, so nothing splits. Two pixels is
    # enough to read as a knock against the inside of the disc.
    recipe = [
        {"dx": 0, "dy": 0, "blink": 0, "smudge": 0},
        {"dx": 0, "dy": 1, "blink": 0, "smudge": 1},   # lean on the glass
        {"dx": -3, "dy": 0, "blink": 0, "smudge": 1},  # knock left
        {"dx": -3, "dy": 0, "blink": 1, "smudge": 1},
        {"dx": 0, "dy": 0, "blink": 0, "smudge": 0},
        {"dx": 0, "dy": -2, "blink": 0, "smudge": 0},  # wave / hop
        {"dx": 3, "dy": 0, "blink": 0, "smudge": 1},   # knock right
        {"dx": 0, "dy": 1, "blink": 1, "smudge": 0},   # pout
    ]
    frames = []
    for i, rec in enumerate(recipe):
        back = []
        front = []
        if rec["smudge"]:
            back.extend(smudge_spots(rec["dx"], rec["dy"]))
        gx, gy = glint_spot(i)
        for dx, dy, col in SPARK:
            front.append((gx + dx, gy + dy, col))
        for hx, hy in heart_spots(i):
            for dx, dy, col in HEART:
                front.append((hx + dx, hy + dy, col))
        for sx, sy in spark_spots(i):
            for dx, dy, col in SPARK:
                front.append((sx + dx, sy + dy, col))
        back = cull(back, pixels, rec["dx"], rec["dy"])
        front = cull(front, pixels, rec["dx"], rec["dy"])
        frames.append({
            "dx": rec["dx"],
            "dy": rec["dy"],
            "blink": rec["blink"],
            "back": [[p[0], p[1], p[2][0], p[2][1], p[2][2]] for p in back],
            "front": [[p[0], p[1], p[2][0], p[2][1], p[2][2]] for p in front],
        })
    return frames


def paint(cd, pixels, frame):
    """RGBA overlay the size of the CD. Girl uses her real pixels only."""
    img = Image.new("RGBA", cd.size, (0, 0, 0, 0))
    px = img.load()
    w, h = cd.size
    eyes = set(map(tuple, EYES))

    def dot(x, y, col):
        if 0 <= x < w and 0 <= y < h:
            px[x, y] = (col[0], col[1], col[2], 255)

    for x, y, r, g, b in frame["back"]:
        dot(x, y, (r, g, b))
    ox, oy = ORIGIN[0] + frame["dx"], ORIGIN[1] + frame["dy"]
    for x, y, r, g, b in pixels:
        if frame["blink"] and (x, y) in eyes:
            dot(ox + x, oy + y, SKIN)
        else:
            dot(ox + x, oy + y, (r, g, b))
    for x, y, r, g, b in frame["front"]:
        # Keep her face clear: sparkles may sit near the ring, not on her.
        if px[x, y][3] and (x, y) not in {(p[0], p[1]) for p in frame["back"]}:
            # front pixels that landed on her get dropped
            sx, sy = x - ox, y - oy
            if any(sx == p[0] and sy == p[1] for p in pixels):
                continue
        dot(x, y, (r, g, b))
    return img


def on_white(cd, overlay):
    base = Image.new("RGBA", cd.size, (255, 255, 255, 255))
    base.alpha_composite(cd)
    base.alpha_composite(overlay)
    return base.convert("RGB")


def scale_nn(img, n):
    return img.resize((img.size[0] * n, img.size[1] * n), Image.NEAREST)


def save_gif(frames, path):
    """Exact colours, no dither. The CD palette is small enough to fit in a GIF."""
    found = []
    seen = set()
    for frame in frames:
        px = frame.load()
        w, h = frame.size
        for y in range(h):
            for x in range(w):
                c = px[x, y]
                if c not in seen:
                    seen.add(c)
                    found.append(c)
    if len(found) > 256:
        raise SystemExit("too many colours for a clean gif: %s" % len(found))
    pal = []
    for r, g, b in found:
        pal.extend((r, g, b))
    pal.extend([0] * (768 - len(pal)))
    index = {c: i for i, c in enumerate(found)}
    pics = []
    for frame in frames:
        img = Image.new("P", frame.size)
        img.putpalette(pal)
        src = frame.load()
        dst = img.load()
        w, h = frame.size
        for y in range(h):
            for x in range(w):
                dst[x, y] = index[src[x, y]]
        pics.append(img)
    pics[0].save(
        path,
        save_all=True,
        append_images=pics[1:],
        duration=180,
        loop=0,
        disposal=2,
        optimize=False,
    )


def write_js(pixels, frames):
    data = {
        "grid": [104, 105],
        "origin": list(ORIGIN),
        "skin": list(SKIN),
        "eyes": EYES,
        "pixels": pixels,
        "frames": frames,
        "ms": 180,
    }
    text = (
        "/* Generated by tools/cd-trap/build.py — Malaz pixels from images/scenes/angel.png. */\n"
        "window.POPI_CD_MALAZ = "
        + json.dumps(data, separators=(",", ":"))
        + ";\n"
    )
    SPRITE_JS.write_text(text)


def verify(img, pixels):
    official = Image.open(ROOT / "images/sprites/malaz.png").convert("RGBA")
    if official.size != img.size:
        raise SystemExit("official malaz size %s" % (official.size,))
    op, ip = official.load(), img.load()
    for y in range(img.size[1]):
        for x in range(img.size[0]):
            if op[x, y] != ip[x, y]:
                raise SystemExit("differs from images/sprites/malaz.png at %s,%s" % (x, y))
    for x, y in EYES:
        if ip[x, y][:3] != OUTLINE:
            raise SystemExit("eye pixel is not the outline colour")
    print("malaz", img.size, "opaque", len(pixels), "matches images/sprites/malaz.png")


def main():
    scene = native_scene()
    img, pixels = extract_malaz(scene)
    verify(img, pixels)
    frames = build_frames(pixels)
    cd = Image.open(CD_PATH).convert("RGBA")
    if cd.size != (104, 105):
        raise SystemExit("cd.png size changed: %s" % (cd.size,))

    PREVIEW.mkdir(parents=True, exist_ok=True)
    composed = []
    for frame in frames:
        overlay = paint(cd, pixels, frame)
        composed.append(on_white(cd, overlay))

    # Still is the press-against-glass frame (index 1), also used as the
    # reduced-motion pose is frame 0 — export both.
    scale_nn(composed[0], 4).save(PREVIEW / "malaz-trapped-cd-still.png")
    sheet = Image.new("RGB", (104 * 4 * 4, 105 * 2 * 4), (255, 214, 232))
    for i, frame in enumerate(composed):
        big = scale_nn(frame, 4)
        sheet.paste(big, ((i % 4) * 104 * 4, (i // 4) * 105 * 4))
    sheet.save(PREVIEW / "malaz-trapped-cd-sheet.png")
    save_gif([scale_nn(f, 4) for f in composed], PREVIEW / "malaz-trapped-cd.gif")
    # Tight crop of her, 8x, so a review can see the knock and the blink.
    zoom = Image.new("RGB", (40 * 8 * 8, 44 * 8), (255, 214, 232))
    for i, frame in enumerate(composed):
        crop = frame.crop((32, 28, 72, 72)).resize((40 * 8, 44 * 8), Image.NEAREST)
        zoom.paste(crop, (i * 40 * 8, 0))
    zoom.save("/tmp/cd-trap-zoom.png")
    write_js(pixels, frames)
    print("wrote", PREVIEW / "malaz-trapped-cd.gif")


if __name__ == "__main__":
    main()
