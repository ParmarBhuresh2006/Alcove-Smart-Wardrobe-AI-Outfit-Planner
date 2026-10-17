"""
inference/color_detector.py
Computer vision color detection — no ML model required.

Pipeline:
  1. Load image
  2. Remove near-white/near-black background (simple masking)
  3. Convert to LAB color space
  4. K-means clustering to find dominant colors
  5. Map cluster centroids to color names

Returns:
  {
    "primaryColor": "navy",
    "secondaryColors": ["white"],
    "colorConfidence": 0.91,
    "colorPalette": [...]
  }
"""

import cv2
import numpy as np
from PIL import Image


# ── Color name database ───────────────────────────────────────────────────────
# Each entry: (name, BGR value for comparison)
COLOR_NAMES = [
    ("black",   (20,  20,  20)),
    ("white",   (240, 240, 240)),
    ("gray",    (128, 128, 128)),
    ("red",     (220, 30,  30)),
    ("blue",    (30,  80,  220)),
    ("navy",    (10,  20,  100)),
    ("green",   (40,  150, 40)),
    ("yellow",  (240, 220, 20)),
    ("orange",  (240, 130, 30)),
    ("purple",  (130, 30,  180)),
    ("pink",    (240, 130, 180)),
    ("brown",   (100, 60,  30)),
    ("beige",   (210, 190, 160)),
    ("cream",   (240, 230, 200)),
    ("ivory",   (245, 235, 210)),
    ("camel",   (195, 155, 100)),
    ("maroon",  (130, 20,  30)),
    ("teal",    (30,  150, 150)),
    ("indigo",  (50,  40,  140)),
    ("champagne",(220,195, 155)),
]


def _bgr_to_name(bgr):
    """Find the closest named color to a BGR value."""
    min_dist = float("inf")
    closest = "unknown"
    b, g, r = int(bgr[0]), int(bgr[1]), int(bgr[2])
    for name, (cb, cg, cr) in COLOR_NAMES:
        dist = ((b - cb)**2 + (g - cg)**2 + (r - cr)**2) ** 0.5
        if dist < min_dist:
            min_dist = dist
            closest = name
    return closest, min_dist


def _remove_background_simple(img_bgr):
    """
    Simple background removal: create a mask for the central clothing region.
    Works for images where clothing is centered on a plain background.
    Uses GrabCut with a centered rectangle as initialization.
    """
    h, w = img_bgr.shape[:2]
    # Define the foreground rectangle (90% of image, centered)
    margin_x = int(w * 0.05)
    margin_y = int(h * 0.05)
    rect = (margin_x, margin_y, w - 2 * margin_x, h - 2 * margin_y)

    mask = np.zeros((h, w), np.uint8)
    bgd_model = np.zeros((1, 65), np.float64)
    fgd_model = np.zeros((1, 65), np.float64)

    try:
        cv2.grabCut(img_bgr, mask, rect, bgd_model, fgd_model, 3, cv2.GC_INIT_WITH_RECT)
        fg_mask = np.where((mask == cv2.GC_FGD) | (mask == cv2.GC_PR_FGD), 255, 0).astype("uint8")
        # If grabcut fails (all background), fall back to full image
        if fg_mask.sum() < 100:
            fg_mask = np.ones((h, w), dtype=np.uint8) * 255
    except Exception:
        fg_mask = np.ones((h, w), dtype=np.uint8) * 255

    return fg_mask


def detect_colors_from_image(image_path: str, n_clusters: int = 5):
    """
    Main color detection function.
    Returns a dict with primaryColor, secondaryColors, colorConfidence, colorPalette.
    """
    # ── Load image ─────────────────────────────────────────────────────────────
    img = cv2.imread(image_path)
    if img is None:
        # Try via PIL (handles more formats)
        pil_img = Image.open(image_path).convert("RGB")
        img = cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)

    # Resize to manageable size for speed
    img = cv2.resize(img, (200, 200))

    # ── Foreground mask ────────────────────────────────────────────────────────
    fg_mask = _remove_background_simple(img)

    # ── Get foreground pixels ──────────────────────────────────────────────────
    fg_pixels = img[fg_mask > 0]
    if len(fg_pixels) < 50:
        # Fall back to all pixels
        fg_pixels = img.reshape(-1, 3)

    # ── K-means clustering ─────────────────────────────────────────────────────
    fg_float = np.float32(fg_pixels)
    k = min(n_clusters, len(fg_float))
    if k < 2:
        k = 1

    criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 20, 1.0)
    _, labels, centers = cv2.kmeans(fg_float, k, None, criteria, 5, cv2.KMEANS_PP_CENTERS)

    # Count pixels per cluster
    counts = np.bincount(labels.flatten())
    total_pixels = len(labels)

    # Sort clusters by pixel count (most dominant first)
    sorted_indices = np.argsort(-counts)
    sorted_centers = centers[sorted_indices].astype(int)
    sorted_counts = counts[sorted_indices]

    # ── Map to color names ─────────────────────────────────────────────────────
    named_colors = []
    for center, count in zip(sorted_centers, sorted_counts):
        name, dist = _bgr_to_name(center)
        pct = round(count / total_pixels, 3)
        named_colors.append({"color": name, "percentage": pct, "bgr": center.tolist()})

    # ── Primary color (most dominant) ─────────────────────────────────────────
    primary = named_colors[0] if named_colors else {"color": "unknown", "percentage": 0}

    # ── Secondary colors (>10% but not primary) ────────────────────────────────
    secondaries = [
        nc["color"]
        for nc in named_colors[1:]
        if nc["percentage"] >= 0.10 and nc["color"] != primary["color"]
    ]

    # ── Confidence (based on primary percentage) ───────────────────────────────
    confidence = min(1.0, round(primary["percentage"] * 1.5, 2))

    return {
        "primaryColor":    primary["color"],
        "secondaryColors": secondaries[:3],
        "colorConfidence": confidence,
        "colorPalette":    [nc["color"] for nc in named_colors[:k]],
    }


class ColorDetector:
    """Wrapper class for use in server.py"""
    def detect(self, image_path: str) -> dict:
        try:
            return detect_colors_from_image(image_path)
        except Exception as e:
            return {
                "primaryColor":    "unknown",
                "secondaryColors": [],
                "colorConfidence": 0.0,
                "colorPalette":    [],
                "error":           str(e),
            }
