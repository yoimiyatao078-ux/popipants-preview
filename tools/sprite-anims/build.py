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
PINK = (255, 246, 251, 255)
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
                if n >= 3:
                    pts.add((x, y))
    img = crop_pixels(scene, pts)
    return drop_loose_white(img)


def extract_malaz(scene):
    sp = scene.load()
    pts = {(x, y) for y in range(90, 111) for x in range(137, 157) if sp[x, y] in GIRL}
    return crop_pixels(scene, pts)


def drop_loose_white(img):
    """Scene clouds are white and only kiss the outline. Eyes sit inside the face."""
    px = img.load()
    w, h = img.size
    kill = []
    neigh = ((1, 0), (-1, 0), (0, 1), (0, -1), (1, 1), (-1, -1), (1, -1), (-1, 1))
    for y in range(h):
        for x in range(w):
            c = px[x, y]
            if c[3] == 0 or c[:3] != WHITE:
                continue
            n = 0
            for dx, dy in neigh:
                xx, yy = x + dx, y + dy
                if 0 <= xx < w and 0 <= yy < h and px[xx, yy][3] and px[xx, yy][:3] != WHITE:
                    n += 1
            # Cloud white only kisses the outline. A highlight inside the face
            # has no transparent neighbour.
            touches_clear = False
            for dx, dy in neigh[:4]:
                xx, yy = x + dx, y + dy
                if not (0 <= xx < w and 0 <= yy < h) or px[xx, yy][3] == 0:
                    touches_clear = True
            if touches_clear or n < 3:
                kill.append((x, y))
    for x, y in kill:
        px[x, y] = (0, 0, 0, 0)
    bbox = img.getbbox()
    return img.crop(bbox) if bbox else img


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


def shift_all(dx, dy):
    """Every part moves by the same amount, so nothing can split."""
    return {"head": (dx, dy), "body": (dx, dy), "tail": (dx, dy),
            "legL": (dx, dy), "legR": (dx, dy), "bow": (dx, dy), "arm": (dx, dy)}

# One-pixel bobs of the whole sprite. Blink frames are flagged, not redrawn.
KITTY_ACTIONS = {
    "idle": [shift_all(0, 0), shift_all(0, 0), shift_all(0, -1), shift_all(0, -1), shift_all(0, 0), shift_all(0, 1)],
    "walk": [shift_all(0, 0), shift_all(1, 0), shift_all(1, -1), shift_all(0, 0), shift_all(-1, 0), shift_all(0, 1)],
    "throw": [shift_all(0, 0), shift_all(0, 1), shift_all(-1, 0), shift_all(1, -1), shift_all(1, 0), shift_all(0, 0)],
    "hit": [shift_all(0, 0), shift_all(-1, 0), shift_all(-1, 1), shift_all(0, 1), shift_all(0, 0), shift_all(0, 0)],
}
MALAZ_ACTIONS = {
    "idle": [shift_all(0, 0), shift_all(0, 0), shift_all(0, -1), shift_all(0, 0), shift_all(0, 1), shift_all(0, 0)],
    "walk": [shift_all(0, 0), shift_all(1, 0), shift_all(1, -1), shift_all(0, 0), shift_all(-1, 0), shift_all(0, 1)],
    "throw": [shift_all(0, 0), shift_all(0, 1), shift_all(-1, 0), shift_all(1, -1), shift_all(0, 0), shift_all(0, 0)],
    "hit": [shift_all(0, 0), shift_all(-1, 0), shift_all(-1, 1), shift_all(0, 1), shift_all(0, 0), shift_all(0, 0)],
}
# Close the eight eye pixels on these frames. The rest of her stays identical.
MALAZ_BLINK = {"idle": {3}, "walk": {4}, "throw": set(), "hit": {2, 3}}
MALAZ_EYES = [(5, 9), (6, 9), (14, 9), (15, 9), (5, 10), (6, 10), (14, 10), (15, 10)]
MALAZ_SKIN = (255, 226, 207, 255)


def ellipse(cx, cy, rx, ry):
    pts = []
    for y in range(int(cy - ry) - 1, int(cy + ry) + 2):
        for x in range(int(cx - rx) - 1, int(cx + rx) + 2):
            if ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1:
                pts.append((x, y))
    return pts


def santa_frame(step, action):
    """First-version Santafoto, drawn as one figure every frame.

    Hat, beard, pink face, black belt, gold buckle and boots are the
    original blocks. The belly is that same red, round and shaded.
    Hop and jiggle move the whole figure, so the hat never leaves the head.
    """
    red = (226, 59, 74, 255)       # #E23B4A
    red_lt = (255, 120, 132, 255)
    red_dk = (160, 32, 48, 255)
    skin = (243, 199, 161, 255)    # #F3C7A1
    white = (255, 255, 255, 255)
    eye = (34, 34, 34, 255)        # #222
    gold = (255, 224, 138, 255)    # #FFE08A
    jiggle = [0, 1, 2, 1, 0, -1][step % 6]
    hop = 0
    squash = jiggle
    if action == "walk":
        hop = [0, -1, 0, 1, 0, -1][step % 6]
    elif action == "attack":
        hop = [0, -4, -7, -3, 2, 0][step % 6]
        squash = [0, -1, -2, 1, 3, 1][step % 6]
    elif action == "defeat":
        squash = [2, 4, 5, 4, 3, 2][step % 6]
        hop = [0, 1, 2, 2, 1, 1][step % 6]
    img = Image.new("RGBA", (84, 78), (0, 0, 0, 0))
    px = img.load()

    def dot(x, y, c):
        if 0 <= x < img.size[0] and 0 <= y < img.size[1]:
            px[x, y] = c

    def rect(x, y, w, h, c):
        for yy in range(h):
            for xx in range(w):
                dot(x + xx, y + yy, c)

    ox, oy = 18, 4 + hop
    # Round shaded belly first, so the beard and face sit on top of it.
    cx, cy = ox + 24, oy + 32
    rx = max(16, 22 + squash)
    ry = max(12, 18 - max(-2, squash // 2))
    for x, y in ellipse(cx, cy, rx, ry):
        dx, dy = (x - cx + 4), (y - cy + 4)
        dist = (dx * dx + dy * dy) ** 0.5
        dot(x, y, red_lt if dist < 6 else (red if dist < 14 else red_dk))
    for x, y in ellipse(cx, cy, rx + 1, ry + 1):
        if px[x, y][3] == 0:
            # Only the pixels that touch the belly, so the outline stays closed.
            if any(px[x + dx, y + dy][3] for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))
                   if 0 <= x + dx < img.size[0] and 0 <= y + dy < img.size[1]):
                dot(x, y, eye)
    # Original blocks, overlapping the belly so the neck never gaps.
    rect(ox + 14, oy, 24, 8, red)             # hat
    rect(ox + 34, oy + 1, 8, 6, white)        # pom
    rect(ox + 10, oy + 8, 30, 12, white)      # beard
    rect(ox + 16, oy + 10, 16, 8, skin)       # face
    rect(ox + 19, oy + 12, 3, 3, eye)
    rect(ox + 26, oy + 12, 3, 3, eye)
    # Belt and buckle across the belly.
    for x in range(cx - rx + 2, cx + rx - 1):
        dot(x, cy, eye)
        dot(x, cy + 1, eye)
    rect(cx - 6, cy - 3, 12, 8, gold)
    rect(ox + 16, oy + 28, 6, 6, white)       # buttons
    rect(ox + 26, oy + 34, 6, 6, white)
    # Boots touch the bottom of the belly.
    boot_y = cy + ry - 2
    rect(cx - 16, boot_y, 10, 6, eye)
    rect(cx + 6, boot_y, 10, 6, eye)
    return img


def unicorn_frame(step, action):
    """First-version unicorn: white blocks, pink horn, pink or cyan mane.

    The whole animal moves together. Legs only change length from the
    belly downward, so they stay attached. Rainbows are separate pixels.
    """
    pink = (255, 158, 199, 255)      # #FF9EC7
    horn_c = (255, 95, 162, 255)     # #FF5FA2
    cyan = (127, 214, 255, 255)      # #7FD6FF
    white = (255, 255, 255, 255)
    eye = (34, 34, 34, 255)
    blush = (255, 214, 232, 255)     # #FFD6E8
    mint = (184, 242, 200, 255)      # #B8F2C8
    happy = action == "happy"
    mane = cyan if happy else pink
    tail_c = mint if happy else blush
    bob = [0, 0, -1, -1, 0, 1][step % 6]
    hop, dx = 0, 0
    if action == "gallop":
        hop = [0, -2, -3, -1, 0, 1][step % 6]
        dx = [0, 1, 1, 0, -1, 0][step % 6]
    elif action == "hit":
        dx = [0, -1, -1, 0, 0, 0][step % 6]
        bob = [0, 1, 1, 0, 0, 0][step % 6]
    elif action == "happy":
        hop = [0, -2, -4, -3, -1, 0][step % 6]
    img = Image.new("RGBA", (96, 52), (0, 0, 0, 0))
    px = img.load()

    def dot(x, y, c):
        if 0 <= x < img.size[0] and 0 <= y < img.size[1]:
            px[x, y] = c

    def rect(x, y, w, h, c):
        for yy in range(h):
            for xx in range(w):
                dot(x + xx, y + yy, c)

    x, y = 36 + dx, 4 + bob + hop
    rect(x, y + 16, 28, 14, white)          # body
    rect(x + 20, y + 6, 12, 14, white)      # head, overlaps the body
    rect(x + 28, y, 3, 8, horn_c)
    rect(x + 30, y + 2, 3, 4, horn_c)
    wave = step % 2
    rect(x + 16, y + 8 + wave, 6, 12, mane)  # still overlaps the head
    rect(x + 12, y + 14, 5, 6, mane)
    rect(x + 26, y + 10, 2, 2, eye)
    # Legs start on the body's bottom row.
    if action == "gallop":
        left, right = (7, 4) if step % 2 == 0 else (4, 7)
    else:
        left = right = 6
    rect(x + 4, y + 29, 4, left, white)
    rect(x + 14, y + 29, 4, right, white)
    rect(x - 4, y + 16 + wave, 6, 3, tail_c)  # overlaps the body by 2px
    bands = [
        (255, 95, 162, 255), (255, 224, 138, 255), (127, 214, 255, 255),
        (184, 242, 200, 255), (255, 158, 199, 255),
    ]
    if action == "mouth":
        length = 6 + step * 3
        for i, col in enumerate(bands):
            rect(x + 32, y + 10 + i, length, 1, col)
    if action == "butt":
        length = 6 + step * 3
        for i, col in enumerate(bands):
            # Starts inside the rump so the streak reads as coming out of him.
            rect(x - length + 4, y + 18 + i, length, 1, col)
    return img


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


def blink_malaz(frames):
    for action, idxs in MALAZ_BLINK.items():
        for i in idxs:
            px = frames[action][i].load()
            for x, y in MALAZ_EYES:
                px[x + 4, y + 4] = MALAZ_SKIN
    return frames


def paste(dst, src, xy):
    dst.alpha_composite(src, xy)


def outfit_overlay(base, kind, step):
    """Extra pixels around the real sprite. The sprite itself is not redrawn."""
    pad = 8
    img = Image.new("RGBA", (base.size[0] + 4, base.size[1] + pad), (0, 0, 0, 0))
    img.paste(base, (2, pad))
    px = img.load()
    w, h = img.size

    def dot(x, y, c):
        if 0 <= x < w and 0 <= y < h:
            px[x, y] = c

    stripes = [(255, 95, 162, 255), (255, 224, 138, 255), (127, 214, 255, 255), (184, 242, 200, 255)]
    if kind == "malaz":
        for i in range(8):
            dot(4 + i, pad - 2 - (i % 3), stripes[i % 4])
            dot(4 + i, pad - 1, stripes[(i + 1) % 4])
        for x in range(2, 20):
            dot(x, pad + 15, (255, 122, 207, 255))
            dot(x, pad + 16, (255, 214, 232, 255))
        dot(4, pad + 19, (127, 214, 255, 255))
        dot(5, pad + 19, (127, 214, 255, 255))
        dot(14, pad + 19, (255, 224, 138, 255))
        dot(15, pad + 19, (255, 224, 138, 255))
        # puffy sleeves beside the dress, not instead of it
        for y in range(pad + 12, pad + 17):
            dot(0, y, (255, 255, 255, 255))
            dot(1, y, (255, 182, 217, 255))
            dot(w - 2, y, (255, 255, 255, 255))
            dot(w - 1, y, (255, 182, 217, 255))
    else:
        for x in range(6, 22):
            dot(x, pad - 2, (255, 95, 162, 255))
            dot(x, pad - 1, (255, 224, 138, 255))
        dot(8, pad - 4, (255, 95, 162, 255))
        dot(14, pad - 4, (127, 214, 255, 255))
        for x in range(4, base.size[0]):
            dot(x, pad + 15, (255, 255, 255, 255))
            dot(x, pad + 16, (255, 214, 232, 255))
    return img


def mars_frame(step):
    """Hand-placed Mars ground. Hills, stars and dust scroll at different speeds."""
    w, h = 160, 96
    sky = (255, 214, 232)
    blush = (255, 182, 217)
    hill = (255, 158, 199)
    dust = (227, 122, 74)
    soil = (196, 90, 50)
    dark = (150, 40, 95)
    cream = (255, 224, 138)
    white = (255, 255, 255)
    img = Image.new("RGB", (w, h), sky)
    px = img.load()
    for y in range(38, 52):
        for x in range(w):
            px[x, y] = blush
    for i, (sx, sy) in enumerate(((6, 8), (24, 14), (48, 6), (70, 18), (96, 10), (120, 16), (142, 7), (154, 20))):
        x = (sx + step // 2) % w
        if (step + i) % 3:
            px[x, sy] = white
            if x + 1 < w:
                px[x + 1, sy] = cream
    # distant pink hills
    for x in range(w):
        peak = 46 + ((x + step) // 8 % 3) - ((x + step) // 14 % 2)
        for y in range(peak, 58):
            px[x % w, y] = hill
    # near orange hills
    for x in range(w):
        peak = 58 + ((x + step * 2) // 6 % 4)
        for y in range(peak, 70):
            px[x, y] = dust if (x + y + step) % 5 else soil
    for y in range(70, h):
        for x in range(w):
            px[x, y] = soil if (x + y) % 2 == 0 else dust
    # craters and rocks, stuck to the ground scroll
    def crater(cx, cy, r):
        for y in range(cy - r, cy + r + 1):
            for x in range(cx - r, cx + r + 1):
                if (x - cx) ** 2 + (y - cy) ** 2 <= r * r:
                    xx = (x + step * 3) % w
                    if 70 <= y < h:
                        px[xx, y] = dark if (x - cx) ** 2 + (y - cy) ** 2 > (r - 1) ** 2 else (255, 182, 193)
    crater(20, 80, 5)
    crater(78, 86, 4)
    crater(130, 78, 6)
    for rx, ry in ((40, 74), (100, 82), (150, 88)):
        xx = (rx + step * 3) % w
        for dy in range(3):
            for dx in range(4):
                if 0 <= xx + dx < w and 0 <= ry + dy < h:
                    px[xx + dx, ry + dy] = dark if dy == 0 or dx == 0 else soil
    return img


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
    mframes = blink_malaz(render_posed(mparts, MALAZ_ACTIONS, *malaz.size))
    # Rest pose is the untouched sprite, including every Malaz pixel.
    rest = paint(mparts, MALAZ_ACTIONS["idle"][0], malaz.size[0], malaz.size[1], margin=0)
    if list(rest.getdata()) != list(malaz.getdata()):
        diff = sum(a != b for a, b in zip(rest.getdata(), malaz.getdata()))
        raise SystemExit("malaz rest frame is not the scene sprite (%s pixels)" % diff)
    sheet_and_gif("kitty", kframes, {
        "idle": "idle / vibe", "walk": "walk / fly", "throw": "throw", "hit": "hit",
    })
    sheet_and_gif("malaz", mframes, {
        "idle": "idle", "walk": "walk", "throw": "throw clothes", "hit": "hit",
    })

    uframes = {
        action: [unicorn_frame(i, action) for i in range(6)]
        for action in ("idle", "gallop", "hit", "happy", "mouth", "butt")
    }
    sheet_and_gif("unicorn", uframes, {
        "idle": "idle", "gallop": "gallop", "hit": "hit", "happy": "joins",
        "mouth": "mouth beam", "butt": "butt beam",
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

    # Malaz rest pose next to the same pixels cropped from the scene.
    ml, mr = scale(malaz), scale(malaz)
    mboard = Image.new("RGB", (ml.size[0] + mr.size[0] + gap * 3, ml.size[1] + label_h + 16), PINK[:3])
    md = ImageDraw.Draw(mboard)
    md.text((12, 8), "game malaz", fill=INK[:3], font=fnt)
    md.text((ml.size[0] + gap * 2, 8), "scene malaz", fill=INK[:3], font=fnt)
    mboard.paste(ml, (gap, label_h), ml)
    mboard.paste(mr, (ml.size[0] + gap * 2, label_h), mr)
    mboard.save(PREVIEW / "malaz-vs-website.png")

    # Silly-outfit cutscene. The base pixels stay; hair and clothes are added on top.
    cut = []
    for i in range(6):
        canvas = Image.new("RGBA", (150, 60), (0, 0, 0, 0))
        uni = unicorn_frame(i, "mouth" if i < 3 else "butt")
        girl = outfit_overlay(malaz, "malaz", i) if 2 <= i <= 4 else malaz
        cat = outfit_overlay(kitty, "kitty", i) if 2 <= i <= 4 else kitty
        canvas.alpha_composite(uni, (0, 4))
        canvas.alpha_composite(girl, (100, 10))
        canvas.alpha_composite(cat, (124, 16))
        cut.append(canvas)
    sheet_and_gif("cutscene", {"hit": cut[:3], "outfits": cut[2:5], "reset": [cut[5], cut[5], cut[5]]}, {
        "hit": "love beam", "outfits": "silly outfits", "reset": "reset",
    })
    mframes_gif = {
        "scroll": [mars_frame(i) for i in range(8)],
    }
    # mars_frame is RGB; sheet_and_gif expects RGBA-able images via scale()
    sheet_and_gif("mars", {k: [im.convert("RGBA") for im in v] for k, v in mframes_gif.items()}, {"scroll": "mars ground"})

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
