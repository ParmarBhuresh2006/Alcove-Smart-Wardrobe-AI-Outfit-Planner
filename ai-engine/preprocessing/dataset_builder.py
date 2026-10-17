"""
preprocessing/dataset_builder.py
Prepares the dataset for training:
  - Reads label_map.json
  - Copies/symlinks images to datasets/train, datasets/validation, datasets/test
  - Applies class balancing strategy
  - Optionally removes corrupted + duplicate images

Usage:
    python preprocessing/dataset_builder.py --dataset_dir datasets/raw --output_dir datasets
"""

import os
import sys
import json
import shutil
import random
import argparse
import collections
from pathlib import Path
from PIL import Image


from concurrent.futures import ThreadPoolExecutor

SUPPORTED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
SPLIT_RATIOS = (0.75, 0.15, 0.10)  # train / validation / test


def verify_image(args):
    img_path, app_label = args
    try:
        with Image.open(img_path) as im:
            w, h = im.size
            if w < 30 or h < 30:
                return (False, img_path, app_label)
        return (True, str(img_path), app_label)
    except Exception:
        return (False, img_path, app_label)


def copy_single_file(args):
    src, dest = args
    if not dest.exists():
        shutil.copy2(src, dest)


def build_dataset(dataset_dir: str, output_dir: str, label_map_path: str, min_samples: int = 50, seed: int = 42):
    random.seed(seed)
    dataset_path = Path(dataset_dir)
    output_path = Path(output_dir)
    label_map_file = Path(label_map_path)

    if not label_map_file.exists():
        print(f"ERROR: label_map.json not found at {label_map_path}")
        print("Run: python preprocessing/dataset_inspector.py first")
        sys.exit(1)

    with open(label_map_file, encoding="utf-8") as f:
        label_map = json.load(f)

    print(f"Label map loaded: {len(label_map)} entries")

    # ── Collect images grouped by application label ───────────────────────────
    by_label = collections.defaultdict(list)
    skipped_unmapped = 0
    skipped_corrupted = 0

    to_verify = []
    for class_dir in sorted(dataset_path.iterdir()):
        if not class_dir.is_dir():
            continue
        raw_label = class_dir.name
        app_label = label_map.get(raw_label, "UNMAPPED")
        if app_label == "UNMAPPED":
            print(f"  Skipping unmapped class: {raw_label}")
            skipped_unmapped += 1
            continue

        for img_path in sorted(class_dir.rglob("*")):
            if img_path.suffix.lower() in SUPPORTED_EXTENSIONS:
                to_verify.append((img_path, app_label))

    print(f"Verifying {len(to_verify)} images in parallel...")
    with ThreadPoolExecutor(max_workers=32) as executor:
        results = executor.map(verify_image, to_verify)

    for is_valid, path_str, app_label in results:
        if is_valid:
            by_label[app_label].append(path_str)
        else:
            skipped_corrupted += 1

    print(f"\nImages collected per application label:")
    for lbl, imgs in sorted(by_label.items()):
        flag = " [!] (below minimum)" if len(imgs) < min_samples else ""
        print(f"  {lbl:<20} {len(imgs):>6}{flag}")
    print(f"\nSkipped (unmapped): {skipped_unmapped} classes")
    print(f"Skipped (corrupted): {skipped_corrupted} images")

    # Filter out classes with too few samples
    usable = {lbl: imgs for lbl, imgs in by_label.items() if len(imgs) >= min_samples}
    if len(usable) == 0:
        print("ERROR: No classes have enough images. Lower --min_samples or add more data.")
        sys.exit(1)

    print(f"\nUsable classes: {list(usable.keys())}")

    # ── Class balancing: limit max samples per class ──────────────────────────
    max_samples = min(3000, max(len(v) for v in usable.values()))
    balanced = {}
    for lbl, imgs in usable.items():
        random.shuffle(imgs)
        balanced[lbl] = imgs[:max_samples]

    # ── Split into train / val / test ─────────────────────────────────────────
    splits = {"train": {}, "validation": {}, "test": {}}
    for lbl, imgs in balanced.items():
        n = len(imgs)
        n_train = int(n * SPLIT_RATIOS[0])
        n_val   = int(n * SPLIT_RATIOS[1])
        splits["train"][lbl]      = imgs[:n_train]
        splits["validation"][lbl] = imgs[n_train:n_train + n_val]
        splits["test"][lbl]       = imgs[n_train + n_val:]

    # ── Write split directories ────────────────────────────────────────────────
    copy_tasks = []
    total_written = 0
    for split_name, split_data in splits.items():
        for lbl, paths in split_data.items():
            dest_dir = output_path / split_name / lbl
            dest_dir.mkdir(parents=True, exist_ok=True)
            for src in paths:
                dest = dest_dir / Path(src).name
                copy_tasks.append((src, dest))
                total_written += 1

    print(f"Writing {len(copy_tasks)} split images in parallel...")
    with ThreadPoolExecutor(max_workers=32) as executor:
        list(executor.map(copy_single_file, copy_tasks))

    print(f"\n{'Split':<12} {'Label':<20} {'Count':>6}")
    print("-" * 42)
    for split_name, split_data in splits.items():
        for lbl, paths in sorted(split_data.items()):
            print(f"{split_name:<12} {lbl:<20} {len(paths):>6}")

    print(f"\nTotal images written: {total_written}")
    print(f"Output directory: {output_path.resolve()}")

    # ── Save class index ───────────────────────────────────────────────────────
    class_names = sorted(usable.keys())
    class_index = {name: idx for idx, name in enumerate(class_names)}
    idx_path = output_path / "class_index.json"
    with open(idx_path, "w", encoding="utf-8") as f:
        json.dump(class_index, f, indent=2)
    print(f"Class index saved: {idx_path}")

    return {
        "splits": {s: {lbl: len(p) for lbl, p in d.items()} for s, d in splits.items()},
        "class_index": class_index,
        "total_written": total_written,
    }


def main():
    parser = argparse.ArgumentParser(description="Build train/val/test splits from raw dataset")
    parser.add_argument("--dataset_dir",   default="datasets/raw",           help="Raw dataset directory")
    parser.add_argument("--output_dir",    default="datasets",                help="Output directory for splits")
    parser.add_argument("--label_map",     default="datasets/label_map.json", help="label_map.json from inspector")
    parser.add_argument("--min_samples",   type=int, default=50,              help="Minimum images per class")
    parser.add_argument("--seed",          type=int, default=42)
    args = parser.parse_args()

    build_dataset(
        dataset_dir=args.dataset_dir,
        output_dir=args.output_dir,
        label_map_path=args.label_map,
        min_samples=args.min_samples,
        seed=args.seed,
    )


if __name__ == "__main__":
    main()
