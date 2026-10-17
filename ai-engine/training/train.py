"""
training/train.py
Complete training pipeline for the Alcove clothing classifier.

Architecture: MobileNetV3-Large (pretrained on ImageNet) + custom multi-head classifier
Training: Transfer learning — only fine-tune the custom heads initially, then unfreeze backbone

Usage:
    python training/train.py
    python training/train.py --data_dir datasets --epochs 20 --batch_size 32
"""

import os
import sys
import json
import time
import argparse
import logging
from pathlib import Path

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, WeightedRandomSampler
import torchvision.datasets as datasets
import torchvision.models as models
import numpy as np

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

from preprocessing.image_processor import get_train_transform, get_val_transform
from inference.predictor import (
    MultiHeadClothingModel, build_model,
    PATTERN_CLASSES, SEASON_CLASSES, FORMALITY_CLASSES
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)


def make_weighted_sampler(dataset):
    """Create a sampler that balances class frequencies."""
    targets = [s[1] for s in dataset.samples]
    class_counts = np.bincount(targets)
    class_weights = 1.0 / np.maximum(class_counts, 1)
    sample_weights = [class_weights[t] for t in targets]
    return WeightedRandomSampler(sample_weights, len(sample_weights))


def train_one_epoch(model, loader, optimizer, category_criterion, aux_criterion, device):
    model.train()
    running_loss = 0.0
    correct = 0
    total = 0

    for batch_idx, (images, cat_labels) in enumerate(loader):
        images     = images.to(device)
        cat_labels = cat_labels.to(device)

        # For auxiliary heads we use a placeholder (all zeros) since Kaggle Fashion MNIST
        # only provides category labels. When your dataset has pattern/season/formality
        # labels, replace these with actual label tensors.
        batch_size = images.size(0)
        pat_labels  = torch.zeros(batch_size, dtype=torch.long).to(device)
        sea_labels  = torch.zeros(batch_size, dtype=torch.long).to(device)
        form_labels = torch.zeros(batch_size, dtype=torch.long).to(device)

        optimizer.zero_grad()

        cat_out, pat_out, sea_out, form_out = model(images)

        loss_cat  = category_criterion(cat_out,  cat_labels)
        loss_pat  = aux_criterion(pat_out,  pat_labels)
        loss_sea  = aux_criterion(sea_out,  sea_labels)
        loss_form = aux_criterion(form_out, form_labels)

        # Weight auxiliary losses lower since labels are placeholder
        loss = loss_cat + 0.1 * loss_pat + 0.1 * loss_sea + 0.1 * loss_form
        loss.backward()
        optimizer.step()

        running_loss += loss_cat.item()
        _, predicted = cat_out.max(1)
        correct += predicted.eq(cat_labels).sum().item()
        total += batch_size

        if (batch_idx + 1) % 50 == 0:
            logger.info(f"  Batch {batch_idx+1}/{len(loader)} — loss: {loss_cat.item():.4f}")

    avg_loss = running_loss / len(loader)
    accuracy = correct / total
    return avg_loss, accuracy


@torch.no_grad()
def evaluate(model, loader, criterion, device):
    model.eval()
    running_loss = 0.0
    correct = 0
    total = 0

    for images, labels in loader:
        images = images.to(device)
        labels = labels.to(device)
        cat_out, _, _, _ = model(images)
        loss = criterion(cat_out, labels)
        running_loss += loss.item()
        _, predicted = cat_out.max(1)
        correct += predicted.eq(labels).sum().item()
        total += labels.size(0)

    return running_loss / len(loader), correct / total


def train(args):
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    logger.info(f"Training device: {device}")

    data_dir = Path(args.data_dir)
    train_dir = data_dir / "train"
    val_dir   = data_dir / "validation"
    models_dir = BASE_DIR / "models"
    models_dir.mkdir(exist_ok=True)

    if not train_dir.exists():
        logger.error(f"Train directory not found: {train_dir}")
        logger.error("Run: python preprocessing/dataset_inspector.py")
        logger.error("Then: python preprocessing/dataset_builder.py")
        sys.exit(1)

    # ── Datasets ──────────────────────────────────────────────────────────────
    train_dataset = datasets.ImageFolder(str(train_dir), transform=get_train_transform())
    val_dataset   = datasets.ImageFolder(str(val_dir),   transform=get_val_transform())

    class_names = train_dataset.classes
    num_classes = len(class_names)
    logger.info(f"Classes ({num_classes}): {class_names}")

    if num_classes < 2:
        logger.error("At least 2 classes required for training.")
        sys.exit(1)

    # ── DataLoaders ───────────────────────────────────────────────────────────
    sampler = make_weighted_sampler(train_dataset) if args.balance else None
    train_loader = DataLoader(
        train_dataset,
        batch_size=args.batch_size,
        sampler=sampler,
        shuffle=(sampler is None),
        num_workers=args.num_workers,
        pin_memory=(device.type == "cuda"),
    )
    val_loader = DataLoader(
        val_dataset,
        batch_size=args.batch_size,
        shuffle=False,
        num_workers=args.num_workers,
        pin_memory=(device.type == "cuda"),
    )

    logger.info(f"Train: {len(train_dataset)} images, Val: {len(val_dataset)} images")

    # ── Model ─────────────────────────────────────────────────────────────────
    logger.info("Loading pretrained MobileNetV3-Large backbone (ImageNet weights)...")
    backbone = models.mobilenet_v3_large(weights=models.MobileNet_V3_Large_Weights.IMAGENET1K_V2)
    feature_size = backbone.classifier[0].in_features
    backbone.classifier = nn.Identity()

    model = MultiHeadClothingModel(
        backbone=backbone,
        feature_size=feature_size,
        num_category=num_classes,
        num_pattern=len(PATTERN_CLASSES),
        num_season=len(SEASON_CLASSES),
        num_formality=len(FORMALITY_CLASSES),
    )
    model.to(device)

    # ── Phase 1: Freeze backbone, train heads only ────────────────────────────
    logger.info("Phase 1: Training classification heads (backbone frozen)...")
    for param in model.backbone.parameters():
        param.requires_grad = False

    # Class weights for imbalanced datasets
    class_counts = np.array([sum(1 for _, l in train_dataset.samples if l == i) for i in range(num_classes)])
    class_weights = torch.FloatTensor(1.0 / np.maximum(class_counts, 1)).to(device)
    category_criterion = nn.CrossEntropyLoss(weight=class_weights)
    aux_criterion = nn.CrossEntropyLoss()

    optimizer = optim.AdamW([
        {"params": model.shared_fc.parameters(),    "lr": 1e-3},
        {"params": model.head_category.parameters(), "lr": 1e-3},
        {"params": model.head_pattern.parameters(),  "lr": 1e-3},
        {"params": model.head_season.parameters(),   "lr": 1e-3},
        {"params": model.head_formality.parameters(), "lr": 1e-3},
    ], weight_decay=1e-4)

    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=args.phase1_epochs)

    best_val_acc = 0.0
    best_ckpt_path = str(models_dir / "clothing_classifier.pth")

    for epoch in range(1, args.phase1_epochs + 1):
        t0 = time.time()
        train_loss, train_acc = train_one_epoch(model, train_loader, optimizer, category_criterion, aux_criterion, device)
        val_loss,   val_acc   = evaluate(model, val_loader, category_criterion, device)
        scheduler.step()
        elapsed = time.time() - t0

        logger.info(
            f"Epoch {epoch}/{args.phase1_epochs} — "
            f"train_loss: {train_loss:.4f}, train_acc: {train_acc:.4f}, "
            f"val_loss: {val_loss:.4f}, val_acc: {val_acc:.4f} ({elapsed:.1f}s)"
        )

        if val_acc > best_val_acc:
            best_val_acc = val_acc
            torch.save({
                "epoch": epoch,
                "model_state_dict": model.state_dict(),
                "optimizer_state_dict": optimizer.state_dict(),
                "val_acc": val_acc,
                "class_names": class_names,
                "num_classes": num_classes,
            }, best_ckpt_path)
            logger.info(f"  ✓ New best model saved (val_acc={val_acc:.4f})")

    # ── Phase 2: Unfreeze backbone, fine-tune everything ──────────────────────
    if args.epochs > args.phase1_epochs:
        logger.info("Phase 2: Fine-tuning entire model (backbone unfrozen)...")
        for param in model.backbone.parameters():
            param.requires_grad = True

        optimizer2 = optim.AdamW(model.parameters(), lr=1e-4, weight_decay=1e-4)
        scheduler2 = optim.lr_scheduler.CosineAnnealingLR(optimizer2, T_max=(args.epochs - args.phase1_epochs))

        for epoch in range(args.phase1_epochs + 1, args.epochs + 1):
            t0 = time.time()
            train_loss, train_acc = train_one_epoch(model, train_loader, optimizer2, category_criterion, aux_criterion, device)
            val_loss,   val_acc   = evaluate(model, val_loader, category_criterion, device)
            scheduler2.step()
            elapsed = time.time() - t0

            logger.info(
                f"Epoch {epoch}/{args.epochs} (fine-tune) — "
                f"train_loss: {train_loss:.4f}, train_acc: {train_acc:.4f}, "
                f"val_loss: {val_loss:.4f}, val_acc: {val_acc:.4f} ({elapsed:.1f}s)"
            )

            if val_acc > best_val_acc:
                best_val_acc = val_acc
                torch.save({
                    "epoch": epoch,
                    "model_state_dict": model.state_dict(),
                    "optimizer_state_dict": optimizer2.state_dict(),
                    "val_acc": val_acc,
                    "class_names": class_names,
                    "num_classes": num_classes,
                }, best_ckpt_path)
                logger.info(f"  ✓ New best model saved (val_acc={val_acc:.4f})")

    # ── Save label map alongside model ────────────────────────────────────────
    label_map_path = str(models_dir / "label_map.json")
    with open(label_map_path, "w", encoding="utf-8") as f:
        json.dump({name: idx for idx, name in enumerate(class_names)}, f, indent=2)
    logger.info(f"Label map saved: {label_map_path}")

    logger.info(f"\n{'='*50}")
    logger.info(f"Training complete!")
    logger.info(f"Best validation accuracy: {best_val_acc:.4f}")
    logger.info(f"Model saved: {best_ckpt_path}")
    logger.info(f"{'='*50}")


def main():
    parser = argparse.ArgumentParser(description="Train Alcove clothing classifier")
    parser.add_argument("--data_dir",      default="datasets",   help="Directory with train/validation/test splits")
    parser.add_argument("--epochs",        type=int, default=20, help="Total training epochs")
    parser.add_argument("--phase1_epochs", type=int, default=10, help="Epochs with frozen backbone")
    parser.add_argument("--batch_size",    type=int, default=32, help="Batch size")
    parser.add_argument("--num_workers",   type=int, default=2,  help="DataLoader workers")
    parser.add_argument("--balance",       action="store_true",  help="Use weighted sampling to balance classes")
    args = parser.parse_args()

    logger.info(f"Starting training: epochs={args.epochs}, batch_size={args.batch_size}")
    train(args)


if __name__ == "__main__":
    main()
