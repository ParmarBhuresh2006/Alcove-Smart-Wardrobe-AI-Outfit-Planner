"""
preprocessing/dataset_inspector.py
Inspects a raw Kaggle fashion dataset and produces a DATASET_REPORT.md.

Supports:
  - Fashion MNIST style (CSV + image folder)
  - DeepFashion style (folder per class)
  - Generic folder-per-class layout

Usage:
    python preprocessing/dataset_inspector.py --dataset_dir datasets/raw --output_dir datasets
"""

import os
import sys
import json
import argparse
import hashlib
import collections
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor

from PIL import Image


SUPPORTED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}


def compute_hash(path: str) -> str:
    """MD5 hash of file contents for duplicate detection."""
    h = hashlib.md5()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            h.update(chunk)
    return h.hexdigest()


def process_single_image(args):
    img_path, class_name = args
    path_str = str(img_path)
    try:
        with Image.open(img_path) as img:
            w, h = img.size
            if w < 30 or h < 30:
                return ("too_small", path_str, None, class_name)
    except Exception:
        return ("corrupted", path_str, None, class_name)

    try:
        file_hash = compute_hash(path_str)
        return ("ok", path_str, file_hash, class_name)
    except Exception:
        return ("corrupted", path_str, None, class_name)


def inspect_dataset(dataset_dir: str):
    """
    Walk dataset_dir, detect structure, and collect stats.
    Returns a dict with all findings.
    """
    dataset_path = Path(dataset_dir)
    if not dataset_path.exists():
        print(f"ERROR: Dataset directory not found: {dataset_dir}", file=sys.stderr)
        sys.exit(1)

    print(f"Inspecting dataset at: {dataset_path.resolve()}")

    # ── Detect layout ─────────────────────────────────────────────────────────
    subdirs = [d for d in dataset_path.iterdir() if d.is_dir()]
    has_class_folders = any(
        any(f.suffix.lower() in SUPPORTED_EXTENSIONS for f in d.iterdir() if f.is_file())
        for d in subdirs
    ) if subdirs else False

    print(f"Layout detected: {'folder-per-class' if has_class_folders else 'flat'}")

    # ── Collect all images ────────────────────────────────────────────────────
    images_by_class = collections.defaultdict(list)
    total_images = 0
    corrupted = []
    too_small = []
    hashes = {}
    duplicates = []

    tasks = []
    if has_class_folders:
        for class_dir in sorted(dataset_path.iterdir()):
            if not class_dir.is_dir():
                continue
            class_name = class_dir.name
            for img_path in sorted(class_dir.rglob("*")):
                if img_path.suffix.lower() not in SUPPORTED_EXTENSIONS:
                    continue
                total_images += 1
                tasks.append((img_path, class_name))

        print(f"Processing {total_images} images in parallel...")
        with ThreadPoolExecutor(max_workers=32) as executor:
            results = executor.map(process_single_image, tasks)

        for status, path_str, file_hash, class_name in results:
            if status == "too_small":
                too_small.append(path_str)
            elif status == "corrupted":
                corrupted.append(path_str)
            elif status == "ok":
                if file_hash in hashes:
                    duplicates.append({"file": path_str, "duplicate_of": hashes[file_hash]})
                else:
                    hashes[file_hash] = path_str
                    images_by_class[class_name].append(path_str)

    else:
        # Flat layout — all images in root, try to find a labels file
        for img_path in sorted(dataset_path.rglob("*")):
            if img_path.suffix.lower() not in SUPPORTED_EXTENSIONS:
                continue
            total_images += 1
            images_by_class["unlabeled"].append(str(img_path))

    classes = dict(images_by_class)
    class_counts = {k: len(v) for k, v in classes.items()}
    num_classes = len(class_counts)

    # ── Stats ─────────────────────────────────────────────────────────────────
    valid_images = sum(class_counts.values())
    max_class = max(class_counts.values(), default=0)
    min_class = min(class_counts.values(), default=0)
    imbalance_ratio = round(max_class / max(min_class, 1), 2)

    # ── Mapping suggestions ───────────────────────────────────────────────────
    label_map = suggest_label_map(list(class_counts.keys()))

    return {
        "dataset_dir": str(dataset_path.resolve()),
        "total_images_found": total_images,
        "valid_images": valid_images,
        "num_classes": num_classes,
        "class_counts": class_counts,
        "corrupted": corrupted,
        "too_small": too_small,
        "duplicates": duplicates,
        "max_class_count": max_class,
        "min_class_count": min_class,
        "imbalance_ratio": imbalance_ratio,
        "label_map": label_map,
    }


KAGGLE_LABEL_MAPPINGS = {
    # Fashion MNIST
    "T-shirt/top": "tops",
    "Trouser":     "bottoms",
    "Pullover":    "tops",
    "Dress":       "dresses",
    "Coat":        "outerwear",
    "Sandal":      "shoes",
    "Shirt":       "tops",
    "Sneaker":     "shoes",
    "Bag":         "accessories",
    "Ankle boot":  "shoes",
    # DeepFashion-like
    "dresses":     "dresses",
    "jeans":       "bottoms",
    "shorts":      "bottoms",
    "shirts":      "tops",
    "blouse":      "tops",
    "outerwear":   "outerwear",
    "shoes":       "shoes",
    "accessories": "accessories",
    "tops":        "tops",
    "bottoms":     "bottoms",
    # Common variations
    "jacket":      "outerwear",
    "coat":        "outerwear",
    "blazer":      "outerwear",
    "hoodie":      "tops",
    "sweatshirt":  "tops",
    "t-shirt":     "tops",
    "polo":        "tops",
    "skirt":       "bottoms",
    "pants":       "bottoms",
    "trousers":    "bottoms",
    "leggings":    "bottoms",
    "sneakers":    "shoes",
    "boots":       "shoes",
    "sandals":     "shoes",
    "hat":         "accessories",
    "bag":         "accessories",
    "scarf":       "accessories",
    "jumpsuit":    "one-piece",
    "romper":      "one-piece",
    # Kaggle Fashion Product Images
    "tshirts":        "tops",
    "kurtas":         "tops",
    "casual shoes":   "shoes",
    "sports shoes":   "shoes",
    "heels":          "shoes",
    "flip flops":     "shoes",
    "formal shoes":   "shoes",
    "flats":          "shoes",
    "handbags":       "accessories",
    "wallets":        "accessories",
    "backpacks":      "accessories",
    "watches":        "accessories",
    "sunglasses":     "accessories",
    "belts":          "accessories",
    "socks":          "accessories",
    "track pants":    "bottoms",
    "sweatshirts":    "tops",
    "sweaters":       "tops",
    "jackets":        "outerwear",
    "blazers":        "outerwear",
    "nightdress":     "dresses",
    "gown":           "dresses",
    "saree":          "dresses",
    "dupatta":        "tops",
    "clutches":       "accessories",
    "ties":           "accessories",
    "caps":           "accessories",
    "stoles":         "accessories",
    "mufflers":       "accessories",
    "capris":         "bottoms",
    "salwar":         "bottoms",
    "churidar":       "bottoms",
    "stockings":      "bottoms",
    "tracksuits":     "bottoms",
    "jeggings":       "bottoms",
    "shrug":          "tops",
    "tunics":         "tops",
    "sports sandals": "shoes",
    "duffel bag":     "accessories",
    "laptop bag":     "accessories",
    "messenger bag":  "accessories",
}


def suggest_label_map(raw_labels):
    """
    Suggest application label mapping for raw dataset labels.
    Unknown labels are flagged.
    """
    mapping = {}
    for label in raw_labels:
        normalized = label.strip().lower()
        app_label = None
        # Try exact match first
        for raw, mapped in KAGGLE_LABEL_MAPPINGS.items():
            if raw.lower() == normalized or raw.lower() in normalized:
                app_label = mapped
                break
        mapping[label] = app_label or "UNMAPPED"
    return mapping


def write_report(stats: dict, output_dir: str):
    """Write DATASET_REPORT.md and label_map.json to output_dir."""
    os.makedirs(output_dir, exist_ok=True)
    report_path = os.path.join(output_dir, "DATASET_REPORT.md")
    label_map_path = os.path.join(output_dir, "LABEL_MAPPING.md")
    json_path = os.path.join(output_dir, "label_map.json")

    # ── Save label map JSON (used by training pipeline) ────────────────────────
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(stats["label_map"], f, indent=2)
    print(f"Label map saved: {json_path}")

    # ── Write DATASET_REPORT.md ────────────────────────────────────────────────
    lines = [
        "# DATASET REPORT",
        "",
        f"Generated automatically by `preprocessing/dataset_inspector.py`",
        "",
        "## Summary",
        "",
        f"| Metric | Value |",
        f"|--------|-------|",
        f"| Dataset directory | `{stats['dataset_dir']}` |",
        f"| Total images found | {stats['total_images_found']} |",
        f"| Valid images | {stats['valid_images']} |",
        f"| Corrupted images | {len(stats['corrupted'])} |",
        f"| Too small (<30px) | {len(stats['too_small'])} |",
        f"| Duplicate images | {len(stats['duplicates'])} |",
        f"| Number of classes | {stats['num_classes']} |",
        f"| Largest class | {stats['max_class_count']} images |",
        f"| Smallest class | {stats['min_class_count']} images |",
        f"| Imbalance ratio | {stats['imbalance_ratio']}× |",
        "",
        "## Class Distribution",
        "",
        "| Class | Count |",
        "|-------|-------|",
    ]
    for cls, cnt in sorted(stats["class_counts"].items(), key=lambda x: -x[1]):
        lines.append(f"| {cls} | {cnt} |")

    lines += [
        "",
        "## Label Mapping (Dataset → Application)",
        "",
        "| Dataset Label | Application Category |",
        "|---------------|---------------------|",
    ]
    for raw, mapped in stats["label_map"].items():
        lines.append(f"| {raw} | {mapped} |")

    if stats["corrupted"]:
        lines += ["", "## Corrupted Images (first 20)", ""]
        for p in stats["corrupted"][:20]:
            lines.append(f"- `{p}`")

    if stats["duplicates"]:
        lines += ["", "## Duplicate Images (first 20)", ""]
        for d in stats["duplicates"][:20]:
            lines.append(f"- `{d['file']}` duplicates `{d['duplicate_of']}`")

    # Imbalance warning
    if stats["imbalance_ratio"] > 5:
        lines += [
            "",
            "## ⚠️ Imbalance Warning",
            "",
            f"The class imbalance ratio is {stats['imbalance_ratio']}×. "
            "Consider using weighted sampling or class-weighted loss during training.",
        ]

    lines += [
        "",
        "## Unmapped Labels",
        "",
        "The following dataset labels could not be automatically mapped to application categories.",
        "Manually update `label_map.json` to map them.",
        "",
    ]
    unmapped = [k for k, v in stats["label_map"].items() if v == "UNMAPPED"]
    if unmapped:
        for u in unmapped:
            lines.append(f"- `{u}`")
    else:
        lines.append("All labels were successfully mapped.")

    with open(report_path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    print(f"Dataset report saved: {report_path}")

    # ── Write LABEL_MAPPING.md ─────────────────────────────────────────────────
    lm_lines = [
        "# LABEL MAPPING",
        "",
        "Maps raw Kaggle dataset labels to Alcove application categories.",
        "",
        "Edit `label_map.json` (in the same directory) to customize the mapping.",
        "",
        "| Dataset Label | Application Category | Notes |",
        "|---------------|---------------------|-------|",
    ]
    for raw, mapped in stats["label_map"].items():
        note = "⚠️ UNMAPPED — please edit" if mapped == "UNMAPPED" else ""
        lm_lines.append(f"| {raw} | {mapped} | {note} |")

    with open(label_map_path, "w", encoding="utf-8") as f:
        f.write("\n".join(lm_lines))
    print(f"Label mapping saved: {label_map_path}")


def main():
    parser = argparse.ArgumentParser(description="Inspect a clothing dataset")
    parser.add_argument("--dataset_dir", default="datasets/raw", help="Path to raw dataset directory")
    parser.add_argument("--output_dir", default="datasets", help="Where to write reports")
    args = parser.parse_args()

    stats = inspect_dataset(args.dataset_dir)
    write_report(stats, args.output_dir)

    print("\n=== Dataset Inspection Complete ===")
    print(f"Total images : {stats['total_images_found']}")
    print(f"Valid images : {stats['valid_images']}")
    print(f"Corrupted    : {len(stats['corrupted'])}")
    print(f"Duplicates   : {len(stats['duplicates'])}")
    print(f"Classes      : {stats['num_classes']}")
    print(f"Imbalance    : {stats['imbalance_ratio']}×")


if __name__ == "__main__":
    main()
