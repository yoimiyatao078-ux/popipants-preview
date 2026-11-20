#!/usr/bin/env python3
"""Build character animation previews from the scene sprites.

Kitty and Malaz pixels are copied 1:1 from images/scenes/angel.png
(the picture is a 5x nearest-neighbour enlargement). Frames only
move those pixels. Unicorn and Santafoto are hand-placed pixels
using colours taken from the scene files.
"""
import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[2]
ANGEL = ROOT / "images/scenes/angel.png"
OUT = ROOT / "images/sprites"
PREVIEW = OUT / "previews"
PINK = (255, 214, 232, 255)
INK = (150, 40, 95, 255)
SCALE = 8
FONT_PATH = ROOT / "fonts/pixelify-sans.ttf"

TAN = {(107, 69, 18), (226, 188, 140), (201, 154, 98), (78, 46, 30), (46, 26, 16)}
TONGUE = (231, 128, 175)
BLUSH = (239, 169, 203)
WHITE = (255, 255, 255)
GIRL = {
    (78, 46, 30), (46, 26, 16), (255, 226, 207),
    (255, 158, 199), (217, 68, 127), BLUSH, WHITE,
}


def native_scene():
    src = Image.open(ANGEL).convert("RGB")
    w, h = src.size
    small = Image.new("RGB", (w // 5, h // 5))
    sp, dp = src.load(), small.load()
    for y in range(h // 5):
        for x in range(w // 5):
            dp[x, y] = sp[x * 5 + 2, y * 5 + 2]
    return small


def crop_pixels(scene, pts):
    xs = [p[0] for p in pts]
    ys = [p[1] for p in pts]
    a, b, c, d = min(xs), min(ys), max(xs), max(ys)
    img = Image.new("RGBA", (c - a + 1, d - b + 1), (0, 0, 0, 0))
    ip, sp = img.load(), scene.load()
    for x, y in pts:
        r, g, b2 = sp[x, y]
        ip[x - a, y - b] = (r, g, b2, 255)
    return img


def extract_kitty(scene):
    sp = scene.load()
    pts = {(x, y) for y in range(88, 113) for x in range(106, 134) if sp[x, y] in TAN}
    neigh = ((1, 0), (-1, 0), (0, 1), (0, -1), (1, 1), (-1, -1), (1, -1), (-1, 1))
    for y in range(86, 114):
        for x in range(100, 140):
            if (x, y) in pts:
                continue
            c = sp[x, y]
            if c == TONGUE and any((x + dx, y + dy) in pts for dx, dy in neigh[:4]):
                pts.add((x, y))
            elif c == BLUSH and any((x + dx, y + dy) in pts for dx, dy in neigh[:4]):
                pts.add((x, y))
            elif c == WHITE:
                n = sum((x + dx, y + dy) in pts for dx, dy in neigh)
                if n >= 2:
                    pts.add((x, y))
    return crop_pixels(scene, pts)


def extract_malaz(scene):
    sp = scene.load()
    pts = {(x, y) for y in range(90, 111) for x in range(137, 157) if sp[x, y] in GIRL}
    return crop_pixels(scene, pts)


def pixels_of(img):
    px = img.load()
    w, h = img.size
    return [(x, y, px[x, y]) for y in range(h) for x in range(w) if px[x, y][3]]


def kitty_part(x, y, _c):
    if y <= 10:
        return "head"
    if x >= 21 and y >= 13:
        return "tail"
    if y >= 17 and x < 11:
        return "legL"
    if y >= 17 and x < 20:
        return "legR"
    return "body"


def malaz_part(x, y, c):
    if c[:3] == BLUSH or (y <= 1 and x < 6):
        return "bow"
    if y <= 12:
        return "head"
    if x >= 13:
        return "arm"
    return "body"


def group(img, part_fn):
    parts = {}
    for x, y, c in pixels_of(img):
        parts.setdefault(part_fn(x, y, c), []).append((x, y, c))
    return parts


def blank(w, h):
    return Image.new("RGBA", (w, h), (0, 0, 0, 0))


def paint(parts, pose, w, h, margin=4):
    img = blank(w + margin * 2, h + margin * 2)
    px = img.load()
    for name, dots in parts.items():
        dx, dy = pose.get(name, (0, 0))
        for x, y, c in dots:
            xx, yy = x + dx + margin, y + dy + margin
            if 0 <= xx < img.size[0] and 0 <= yy < img.size[1]:
                px[xx, yy] = c
    return img


def cycle(seq):
    return [(dx, dy) for dx, dy in seq]


def kpose(head, body, tail, legs=(0, 0)):
    return {"head": head, "body": body, "tail": tail, "legL": legs, "legR": legs}

KITTY_ACTIONS = {
    "idle": [
        kpose((0, 0), (0, 0), (0, 0)),
        kpose((1, 0), (0, 0), (1, 0)),
        kpose((1, 0), (0, 1), (2, 0), (0, 1)),
        kpose((0, 0), (0, 1), (1, 1), (0, 1)),
        kpose((-1, 0), (0, 0), (-1, 0)),
        kpose((-1, 0), (0, 0), (-2, 0)),
    ],
    "walk": [
        kpose((0, 0), (0, 0), (-1, 0), (0, 0)),
        kpose((1, 0), (1, 0), (1, -1), (1, 0)),
        kpose((1, 0), (2, 1), (2, 0), (2, 1)),
        kpose((0, 0), (1, 0), (0, 1), (1, 0)),
        kpose((-1, 0), (0, 1), (-2, 0), (0, 1)),
        kpose((0, 0), (0, 0), (0, -1), (0, 0)),
    ],
    "throw": [
        kpose((0, 0), (0, 0), (0, 0)),
        kpose((-1, 0), (0, 1), (1, 0), (0, 1)),
        kpose((-2, 0), (-1, 0), (2, 0)),
        kpose((2, 0), (1, 0), (-1, -1)),
        kpose((2, 0), (1, 0), (-1, 0)),
        kpose((1, 0), (0, 0), (0, 0)),
    ],
    "hit": [
        kpose((0, 0), (0, 0), (0, 0)),
        kpose((-2, 0), (-2, 0), (-1, 0)),
        kpose((-3, 0), (-3, 1), (0, 1), (-3, 1)),
        kpose((-2, 0), (-2, 1), (0, 0), (-2, 1)),
        kpose((-1, 0), (-1, 0), (-1, 0)),
        kpose((0, 0), (0, 0), (0, 0)),
    ],
}

def mpose(head, body, arm, bow=None):
    return {"head": head, "bow": bow or head, "body": body, "arm": arm}

MALAZ_ACTIONS = {
    "idle": [
        mpose((0, 0), (0, 0), (0, 0)),
        mpose((0, 0), (0, 0), (0, 0)),
        mpose((1, 0), (0, 1), (0, 1)),
        mpose((0, 0), (0, 1), (0, 1)),
        mpose((-1, 0), (0, 0), (0, 0)),
        mpose((0, 0), (0, 0), (0, 0)),
    ],
    "walk": [
        mpose((0, 0), (0, 0), (0, 0)),
        mpose((1, 0), (1, 0), (0, 0)),
        mpose((1, 0), (2, 1), (2, 1)),
        mpose((0, 0), (1, 0), (1, 0)),
        mpose((-1, 0), (0, 1), (0, 1)),
        mpose((0, 0), (0, 0), (-1, 0)),
    ],
    "throw": [
        mpose((0, 0), (0, 0), (0, 0)),
        mpose((-1, 0), (0, 0), (-1, 0)),
        mpose((-1, 0), (0, 1), (-2, 1)),
        mpose((1, 0), (0, 0), (3, -2)),
        mpose((1, 0), (0, 0), (4, -1)),
        mpose((0, 0), (0, 0), (1, 0)),
    ],
    "hit": [
        mpose((0, 0), (0, 0), (0, 0)),
        mpose((-2, 0), (-2, 0), (-1, 0)),
        mpose((-3, 0), (-2, 1), (-2, 1)),
        mpose((-2, 0), (-1, 1), (-1, 0)),
        mpose((-1, 0), (-1, 0), (0, 0)),
        mpose((0, 0), (0, 0), (0, 0)),
    ],
}


def ellipse(cx, cy, rx, ry):
    pts = []
    for y in range(int(cy - ry) - 1, int(cy + ry) + 2):
        for x in range(int(cx - rx) - 1, int(cx + rx) + 2):
            if ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1:
                pts.append((x, y))
    return pts


def santa_frame(step, action):
    """Round beer belly. Colours are from the scene sprites and #FFD6E8."""
    dark = (46, 26, 16, 255)
    suit = (217, 68, 127, 255)
    mid = (255, 158, 199, 255)
    light = (255, 214, 232, 255)
    skin = (255, 226, 207, 255)
    buckle = (226, 188, 140, 255)
    white = (255, 255, 255, 255)
    jiggle = [0, 1, 2, 1, 0, -1][step % 6]
    hop = 0
    squash = 0
    hat = 0
    if action == "walk":
        hop = [0, -1, 0, 1, 0, -1][step % 6]
    elif action == "attack":
        hop = [0, -4, -7, -3, 2, 0][step % 6]
        squash = [0, -1, -2, 1, 3, 1][step % 6]
    elif action == "defeat":
        squash = [2, 4, 5, 4, 3, 2][step % 6]
        hat = [0, 2, 3, 3, 2, 1][step % 6]
        hop = [0, 1, 2, 2, 1, 1][step % 6]
    elif action == "idle":
        squash = jiggle
    rx = 11 + squash
    ry = 8 - squash // 2
    cx, cy = 18, 16 - hop
    img = Image.new("RGBA", (40, 36), (0, 0, 0, 0))
    px = img.load()

    def dot(x, y, c):
        if 0 <= x < 40 and 0 <= y < 36:
            px[x, y] = c

    for x, y in ellipse(cx, cy, rx, ry):
        dx, dy = x - (cx - 3), y - (cy - 4)
        dist = (dx * dx + dy * dy) ** 0.5
        if dist < 3:
            col = light
        elif dist < 6:
            col = mid
        else:
            col = suit
        dot(x, y, col)
    for x, y in ellipse(cx, cy, rx + 1, ry + 1):
        if px[x, y][3] == 0:
            dot(x, y, dark)
    # belt
    for x in range(cx - rx + 1, cx + rx):
        dot(x, cy + 1, dark)
        if abs(x - cx) <= 1:
            dot(x, cy, buckle)
            dot(x, cy + 1, buckle)
    # head
    hy = cy - ry - 4 + hat
    for x, y in ellipse(cx, hy, 4, 3):
        dot(x, y, skin)
    for x, y in ellipse(cx, hy - 2, 5, 2):
        dot(x, y, white)
    for x in range(cx - 3, cx + 4):
        dot(x, hy - 4, suit)
        dot(x, hy - 5, suit)
    dot(cx + 5, hy - 4, white)
    dot(cx - 1, hy, dark)
    dot(cx + 2, hy, dark)
    # boots, alternating on walk
    shift = [0, 1, 0, -1, 0, 1][step % 6] if action == "walk" else 0
    for bx in (cx - 6, cx + 3):
        extra = shift if bx < cx else -shift
        for x, y in ellipse(bx + extra, cy + ry + 2, 2, 1):
            dot(x, y, dark)
    return img


def unicorn_base(happy=False):
    mane = (143, 211, 214, 255) if happy else (255, 158, 199, 255)
    horn = (231, 128, 175, 255)
    white = (255, 255, 255, 255)
    dark = (46, 26, 16, 255)
    # groups of pixels in a rest pose, local coords
    parts = {k: [] for k in ("body", "head", "mane", "horn", "legL", "legR", "tail")}
    def add(name, x, y, c):
        parts[name].append((x, y, c))
    # body
    for y in range(10, 18):
        for x in range(4, 20):
            add("body", x, y, white)
    for x in range(4, 20):
        add("body", x, 10, dark)
        add("body", x, 17, dark)
    for y in range(10, 18):
        add("body", 4, y, dark)
        add("body", 19, y, dark)
    # head
    for y in range(4, 12):
        for x in range(16, 24):
            add("head", x, y, white)
    for x in range(16, 24):
        add("head", x, 4, dark)
        add("head", x, 11, dark)
    add("head", 20, 7, dark)
    add("head", 21, 7, dark)
    # mane
    for y, x0 in ((5, 14), (6, 13), (8, 13), (10, 14)):
        for x in range(x0, x0 + 3):
            add("mane", x, y, mane)
    # horn
    add("horn", 22, 1, horn)
    add("horn", 23, 2, horn)
    add("horn", 22, 2, horn)
    add("horn", 23, 3, horn)
    add("horn", 24, 3, white)
    # legs
    for x in (6, 8):
        for y in range(18, 23):
            add("legL", x, y, dark if y == 22 else white)
    for x in (14, 16):
        for y in range(18, 23):
            add("legR", x, y, dark if y == 22 else white)
    # tail
    for x, y in ((2, 11), (1, 12), (1, 13), (2, 14), (3, 13)):
        add("tail", x, y, mane)
    return parts


def paint_named(parts, pose, w, h, margin=4):
    img = blank(w + margin * 2, h + margin * 2)
    px = img.load()
    for name, dots in parts.items():
        dx, dy = pose.get(name, (0, 0))
        for x, y, c in dots:
            xx, yy = x + dx + margin, y + dy + margin
            if 0 <= xx < img.size[0] and 0 <= yy < img.size[1]:
                px[xx, yy] = c
    return img


UNI_POSES = {
    "idle": [
        {"body": (0, 0), "head": (0, 0), "mane": (0, 0), "horn": (0, 0), "legL": (0, 0), "legR": (0, 0), "tail": (0, 0)},
        {"body": (0, 0), "head": (0, -1), "mane": (1, -1), "horn": (0, -1), "legL": (0, 0), "legR": (0, 0), "tail": (0, 1)},
        {"body": (0, 1), "head": (0, 0), "mane": (0, 1), "horn": (0, 0), "legL": (0, 1), "legR": (0, 1), "tail": (-1, 0)},
        {"body": (0, 1), "head": (1, 0), "mane": (-1, 0), "horn": (1, 0), "legL": (0, 1), "legR": (0, 1), "tail": (0, -1)},
        {"body": (0, 0), "head": (0, -1), "mane": (0, -1), "horn": (0, -1), "legL": (0, 0), "legR": (0, 0), "tail": (1, 0)},
        {"body": (0, 0), "head": (0, 0), "mane": (1, 0), "horn": (0, 0), "legL": (0, 0), "legR": (0, 0), "tail": (0, 0)},
    ],
    "gallop": [
        {"body": (0, 0), "head": (1, -1), "mane": (0, -1), "horn": (1, -1), "legL": (1, 0), "legR": (-1, 1), "tail": (-1, 0)},
        {"body": (1, -1), "head": (2, -2), "mane": (1, -2), "horn": (2, -2), "legL": (0, 1), "legR": (1, 0), "tail": (-2, 1)},
        {"body": (2, 0), "head": (2, -1), "mane": (2, 0), "horn": (2, -1), "legL": (-1, 0), "legR": (1, 1), "tail": (0, 1)},
        {"body": (1, 1), "head": (1, 0), "mane": (1, 1), "horn": (1, 0), "legL": (1, 1), "legR": (0, 0), "tail": (1, 0)},
        {"body": (0, 0), "head": (0, -1), "mane": (-1, -1), "horn": (0, -1), "legL": (0, 0), "legR": (-1, 1), "tail": (-1, -1)},
        {"body": (0, 1), "head": (1, 0), "mane": (0, 0), "horn": (1, 0), "legL": (-1, 1), "legR": (1, 0), "tail": (0, 1)},
    ],
    "hit": [
        {"body": (0, 0), "head": (0, 0), "mane": (0, 0), "horn": (0, 0), "legL": (0, 0), "legR": (0, 0), "tail": (0, 0)},
        {"body": (-2, 0), "head": (-2, -1), "mane": (-1, -1), "horn": (-2, -2), "legL": (-1, 1), "legR": (-1, 0), "tail": (1, 1)},
        {"body": (-3, 1), "head": (-4, -1), "mane": (-2, 0), "horn": (-4, -1), "legL": (-2, 1), "legR": (-2, 1), "tail": (2, 0)},
        {"body": (-2, 1), "head": (-2, 0), "mane": (-1, 1), "horn": (-2, 0), "legL": (-1, 1), "legR": (-1, 1), "tail": (1, 0)},
        {"body": (-1, 0), "head": (-1, -1), "mane": (0, -1), "horn": (-1, -1), "legL": (0, 0), "legR": (0, 0), "tail": (0, 1)},
        {"body": (0, 0), "head": (0, 0), "mane": (0, 0), "horn": (0, 0), "legL": (0, 0), "legR": (0, 0), "tail": (0, 0)},
    ],
    "happy": [
        {"body": (0, -1), "head": (0, -2), "mane": (1, -2), "horn": (0, -2), "legL": (0, 0), "legR": (0, 0), "tail": (-1, -1)},
        {"body": (0, -3), "head": (0, -4), "mane": (0, -4), "horn": (0, -4), "legL": (0, -1), "legR": (0, -1), "tail": (1, -2)},
        {"body": (0, -4), "head": (1, -5), "mane": (-1, -5), "horn": (1, -5), "legL": (0, -1), "legR": (0, -1), "tail": (0, -3)},
        {"body": (0, -2), "head": (0, -3), "mane": (1, -3), "horn": (0, -3), "legL": (0, 0), "legR": (0, 0), "tail": (-1, -1)},
        {"body": (0, 0), "head": (0, -1), "mane": (0, -1), "horn": (0, -1), "legL": (0, 1), "legR": (0, 1), "tail": (1, 0)},
        {"body": (0, -1), "head": (0, -2), "mane": (-1, -2), "horn": (0, -2), "legL": (0, 0), "legR": (0, 0), "tail": (0, -1)},
    ],
}


def font(size):
    if FONT_PATH.exists():
        return ImageFont.truetype(str(FONT_PATH), size)
    return ImageFont.load_default()


def scale(img):
    return img.resize((img.size[0] * SCALE, img.size[1] * SCALE), Image.Resampling.NEAREST)


def sheet_and_gif(name, frames_by_action, labels):
    """Actions side by side. GIF loops the frames. PNG shows every frame."""
    actions = list(frames_by_action)
    frames_by_action = {k: [scale(im) for im in v] for k, v in frames_by_action.items()}
    cell_w = max(im.size[0] for frames in frames_by_action.values() for im in frames) + 16
    cell_h = max(im.size[1] for frames in frames_by_action.values() for im in frames) + 16
    n = max(len(v) for v in frames_by_action.values())
    label_h = 36
    # animated row
    gif_frames = []
    for i in range(n):
        canvas = Image.new("RGBA", (cell_w * len(actions), cell_h + label_h), PINK)
        draw = ImageDraw.Draw(canvas)
        fnt = font(22)
        for col, action in enumerate(actions):
            draw.text((col * cell_w + 8, 4), labels[action], fill=INK, font=fnt)
            frame = frames_by_action[action][i % len(frames_by_action[action])]
            ox = col * cell_w + (cell_w - frame.size[0]) // 2
            oy = label_h + (cell_h - frame.size[1]) // 2
            canvas.alpha_composite(frame, (ox, oy))
        gif_frames.append(canvas.convert("RGB"))
    gif_path = PREVIEW / f"{name}-anims.gif"
    gif_frames[0].save(gif_path, save_all=True, append_images=gif_frames[1:], duration=140, loop=0, disposal=2)
    # static columns of every frame
    sheet = Image.new("RGBA", (cell_w * len(actions), label_h + cell_h * n), PINK)
    draw = ImageDraw.Draw(sheet)
    fnt = font(22)
    for col, action in enumerate(actions):
        draw.text((col * cell_w + 8, 4), labels[action], fill=INK, font=fnt)
        for i, frame in enumerate(frames_by_action[action]):
            ox = col * cell_w + (cell_w - frame.size[0]) // 2
            oy = label_h + i * cell_h + (cell_h - frame.size[1]) // 2
            sheet.alpha_composite(frame, (ox, oy))
    sheet.convert("RGB").save(PREVIEW / f"{name}-sheet.png")
    print(name, gif_path.name, sheet.size)


def render_posed(parts, actions, w, h):
    out = {}
    for action, poses in actions.items():
        out[action] = [paint(parts, pose, w, h) for pose in poses]
    return out


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    PREVIEW.mkdir(parents=True, exist_ok=True)
    scene = native_scene()
    kitty = extract_kitty(scene)
    malaz = extract_malaz(scene)
    kitty.save(OUT / "kitty.png")
    malaz.save(OUT / "malaz.png")
    assert kitty.size[0] > 0 and malaz.size == (20, 21), malaz.size

    kparts = group(kitty, kitty_part)
    mparts = group(malaz, malaz_part)
    # idle frame 0 must be the untouched sprite
    posed = paint(kparts, KITTY_ACTIONS["idle"][0], kitty.size[0], kitty.size[1], margin=0)
    # compare cropped content
    if list(posed.getdata()) != list(kitty.getdata()):
        # margin 0 paint should match if every pixel is in a part
        diff = sum(a != b for a, b in zip(posed.getdata(), kitty.getdata()))
        raise SystemExit(f"kitty idle frame is not the source sprite ({diff} pixels)")

    kframes = render_posed(kparts, KITTY_ACTIONS, *kitty.size)
    mframes = render_posed(mparts, MALAZ_ACTIONS, *malaz.size)
    sheet_and_gif("kitty", kframes, {
        "idle": "idle / vibe", "walk": "walk / fly", "throw": "throw", "hit": "hit",
    })
    sheet_and_gif("malaz", mframes, {
        "idle": "idle", "walk": "walk", "throw": "throw clothes", "hit": "hit",
    })

    uni = unicorn_base(False)
    uni_happy = unicorn_base(True)
    uw, uh = 28, 26
    uframes = {
        "idle": [paint_named(uni, p, uw, uh) for p in UNI_POSES["idle"]],
        "gallop": [paint_named(uni, p, uw, uh) for p in UNI_POSES["gallop"]],
        "hit": [paint_named(uni, p, uw, uh) for p in UNI_POSES["hit"]],
        "happy": [paint_named(uni_happy, p, uw, uh) for p in UNI_POSES["happy"]],
    }
    sheet_and_gif("unicorn", uframes, {
        "idle": "idle", "gallop": "gallop", "hit": "hit", "happy": "joins, happy",
    })
    sframes = {
        "idle": [santa_frame(i, "idle") for i in range(6)],
        "walk": [santa_frame(i, "walk") for i in range(6)],
        "attack": [santa_frame(i, "attack") for i in range(6)],
        "defeat": [santa_frame(i, "defeat") for i in range(6)],
    }
    sheet_and_gif("santafoto", sframes, {
        "idle": "idle jiggle", "walk": "walk", "attack": "attack", "defeat": "defeat",
    })

    # side by side: rendered kitty vs the same pixels taken straight from the scene
    left = scale(kitty)
    right = scale(kitty)
    gap = 24
    label_h = 40
    board = Image.new("RGB", (left.size[0] + right.size[0] + gap * 3, left.size[1] + label_h + 16), PINK[:3])
    draw = ImageDraw.Draw(board)
    fnt = font(22)
    draw.text((12, 8), "game kitty", fill=INK[:3], font=fnt)
    draw.text((left.size[0] + gap * 2, 8), "website scene kitty", fill=INK[:3], font=fnt)
    board.paste(left, (gap, label_h), left)
    board.paste(right, (left.size[0] + gap * 2, label_h), right)
    board.save(PREVIEW / "kitty-vs-website.png")

    data = {
        "source": "images/scenes/angel.png native 5px grid",
        "kitty": {"file": "images/sprites/kitty.png", "size": list(kitty.size), "actions": KITTY_ACTIONS},
        "malaz": {"file": "images/sprites/malaz.png", "size": list(malaz.size), "actions": MALAZ_ACTIONS},
        "note": "Frames only move the extracted pixels. The game does not use this file yet.",
    }
    (OUT / "anims.json").write_text(json.dumps(data, indent=2))
    js = """/* Character animation poses. Not used by the game yet.
   Kitty and Malaz pixels are the files in images/sprites/, copied from
   images/scenes/angel.png. Poses only move those pixels. */
window.popiAnims = %s;
""" % json.dumps(data)
    (ROOT / "js/character-anims.js").write_text(js)
    print("malaz", malaz.size, "kitty", kitty.size)


if __name__ == "__main__":
    main()
