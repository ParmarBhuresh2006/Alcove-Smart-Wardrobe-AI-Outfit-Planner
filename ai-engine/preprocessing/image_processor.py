"""
preprocessing/image_processor.py
Image preprocessing pipeline for the Alcove clothing classifier.
Handles resizing, normalization, and augmentation.
"""

import os
import cv2
import numpy as np
from PIL import Image
import torchvision.transforms as T


# ── Standard ImageNet normalization (used by all pretrained torchvision models) ──
IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD  = [0.229, 0.224, 0.225]
INPUT_SIZE = 224  # standard input size for MobileNetV3 / EfficientNet-B0


def get_train_transform():
    """
    Augmentation pipeline for training.
    Only safe augmentations that preserve clothing identity.
    """
    return T.Compose([
        T.Resize((256, 256)),
        T.RandomCrop(INPUT_SIZE),
        T.RandomHorizontalFlip(p=0.5),
        T.RandomRotation(degrees=10),
        T.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.1, hue=0.05),
        T.ToTensor(),
        T.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD),
    ])


def get_val_transform():
    """
    Deterministic preprocessing for validation, test, and inference.
    """
    return T.Compose([
        T.Resize((INPUT_SIZE, INPUT_SIZE)),
        T.ToTensor(),
        T.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD),
    ])


def load_image_pil(path: str) -> Image.Image:
    """Load an image as a PIL RGB image. Raises ValueError for corrupted files."""
    try:
        img = Image.open(path).convert("RGB")
        img.verify()  # check for corruption
    except Exception:
        pass  # verify() closes the file; re-open
    try:
        img = Image.open(path).convert("RGB")
        return img
    except Exception as e:
        raise ValueError(f"Cannot load image at {path}: {e}")


def preprocess_for_inference(image_path: str):
    """
    Load and preprocess a single image for inference.
    Returns a (1, 3, 224, 224) torch.Tensor.
    """
    import torch
    img = load_image_pil(image_path)
    transform = get_val_transform()
    tensor = transform(img).unsqueeze(0)  # add batch dimension
    return tensor


def is_corrupted(path: str) -> bool:
    """Return True if the image cannot be opened."""
    try:
        img = Image.open(path)
        img.verify()
        return False
    except Exception:
        return True


def check_image_size(path: str, min_px: int = 50) -> bool:
    """Return True if image meets minimum pixel dimensions."""
    try:
        img = Image.open(path)
        w, h = img.size
        return w >= min_px and h >= min_px
    except Exception:
        return False
