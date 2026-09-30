"""Generate logo + PWA icons from the source logo (full mark, padded, cream background)."""
import sys
from collections import deque
import numpy as np
from PIL import Image
SRC = sys.argv[1]
CREAM = (255, 249, 235)   # source image background
PAL = (251, 246, 234)     # site palette cream #FBF6EA
src = Image.open(SRC).convert("RGB")
x0, y0, x1, y1 = 398, 64, 976, 517          # full mark (circle, sign, bag, waves); excludes wordmark
c = np.array(src.crop((x0, y0, x1, y1))).astype(float)
bg = np.array(CREAM, float); d = np.abs(c - bg).sum(2); near = d < 45
H, W = near.shape; out = np.zeros_like(near); q = deque()
for y in range(H):
    for x in (0, W - 1):
        if near[y, x] and not out[y, x]: out[y, x] = 1; q.append((y, x))
for x in range(W):
    for y in (0, H - 1):
        if near[y, x] and not out[y, x]: out[y, x] = 1; q.append((y, x))
while q:
    y, x = q.popleft()
    for yy, xx in ((y+1, x), (y-1, x), (y, x+1), (y, x-1)):
        if 0 <= yy < H and 0 <= xx < W and near[yy, xx] and not out[yy, xx]: out[yy, xx] = 1; q.append((yy, xx))
ring = out.copy()
for _ in range(2): ring = ring | np.roll(ring, 1, 0) | np.roll(ring, -1, 0) | np.roll(ring, 1, 1) | np.roll(ring, -1, 1)
ring &= ~out
alpha = np.ones(d.shape); alpha[out] = 0; alpha[ring] = np.clip((d[ring] - 10) / 120, 0, 1)
a = alpha[..., None]
col = np.clip(np.where(a > .02, (c - bg * (1 - a)) / np.maximum(a, .02), c), 0, 255)
mark = Image.fromarray(np.dstack([col, alpha * 255]).astype(np.uint8), "RGBA")
w, h = mark.size

def square(size, frac, background):
    """mark scaled so its longest side = frac*size (or diagonal for maskable), centered."""
    s = frac * size / max(w, h)
    m = mark.resize((round(w * s), round(h * s)), Image.LANCZOS)
    canvas = Image.new("RGBA", (size, size), background)
    canvas.alpha_composite(m, ((size - m.width) // 2, (size - m.height) // 2))
    return canvas

# header logo (transparent, 6% padding)
pad = int(.06 * max(w, h)); hdr = Image.new("RGBA", (w + 2*pad, h + 2*pad), (0, 0, 0, 0)); hdr.alpha_composite(mark, (pad, pad))
hdr.save("assets/logo-icon.png", optimize=True)
# favicons (transparent)
square(256, .88, (0, 0, 0, 0)).save("assets/icon-256.png", optimize=True)
square(64, .9, (0, 0, 0, 0)).save("favicon.png", optimize=True)
square(256, .9, (0, 0, 0, 0)).save("favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])
# PWA / Apple icons on cream, ~12% padding each side
for size, name in [(192, "assets/icons/icon-192.png"), (512, "assets/icons/icon-512.png")]:
    square(size, .76, PAL + (255,)).convert("RGB").save(name, optimize=True)
square(180, .78, PAL + (255,)).convert("RGB").save("assets/apple-touch-icon.png", optimize=True)
# maskable: whole mark inside the 80% safe-zone circle -> diagonal <= 0.78*size
diag = (w*w + h*h) ** .5
frac = .9 * max(w, h) / diag
for size in (192, 512):
    square(size, frac, PAL + (255,)).convert("RGB").save(f"assets/icons/maskable-{size}.png", optimize=True)
print("done", w, h, round(frac, 3))
