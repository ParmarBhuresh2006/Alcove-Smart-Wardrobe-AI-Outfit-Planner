"""
inference/predictor.py
Loads the trained clothing classifier and runs inference on new images.

Model: MobileNetV3-Large with custom classification head
       (trained via training/train.py)

Usage:
    from inference.predictor import ClothingPredictor
    predictor = ClothingPredictor("models/clothing_classifier.pth", "models/label_map.json")
    result = predictor.predict("path/to/image.jpg")
"""

import os
import json
import torch
import torch.nn as nn
import torchvision.models as models

import sys
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from preprocessing.image_processor import preprocess_for_inference

CONFIDENCE_THRESHOLD = 0.60

# ── Attribute vocabularies (for subtype, pattern, season heads) ────────────────
SUBTYPE_CLASSES = [
    "t-shirt", "shirt", "polo", "blouse", "tank top", "crop top",
    "sweater", "hoodie", "sweatshirt", "jacket", "coat", "blazer",
    "cardigan", "jeans", "trousers", "pants", "shorts", "skirt",
    "leggings", "joggers", "dress", "jumpsuit", "romper",
    "sneakers", "formal shoes", "boots", "sandals", "slippers",
    "cap", "hat", "belt", "bag", "scarf", "sunglasses", "watch",
    "unknown",
]

PATTERN_CLASSES = [
    "solid", "striped", "printed", "knit", "checked", "floral", "geometric", "other"
]

SEASON_CLASSES = ["spring", "summer", "autumn", "winter", "all-year"]

FORMALITY_CLASSES = ["casual", "smart-casual", "formal"]


def build_model(num_category_classes: int):
    """
    Build MobileNetV3-Large with 4 output heads:
      - category (main classification)
      - pattern
      - season
      - formality
    """
    backbone = models.mobilenet_v3_large(weights=None)

    # Get the feature size from the backbone's classifier
    # MobileNetV3-Large: last_channel = 1280
    feature_size = backbone.classifier[0].in_features

    # Remove original classifier
    backbone.classifier = nn.Identity()

    model = MultiHeadClothingModel(
        backbone=backbone,
        feature_size=feature_size,
        num_category=num_category_classes,
        num_pattern=len(PATTERN_CLASSES),
        num_season=len(SEASON_CLASSES),
        num_formality=len(FORMALITY_CLASSES),
    )
    return model


class MultiHeadClothingModel(nn.Module):
    """
    Shared MobileNetV3 backbone with separate classification heads.
    """
    def __init__(self, backbone, feature_size, num_category, num_pattern, num_season, num_formality):
        super().__init__()
        self.backbone = backbone

        hidden = 256
        self.shared_fc = nn.Sequential(
            nn.Linear(feature_size, hidden),
            nn.Hardswish(),
            nn.Dropout(0.2),
        )

        self.head_category  = nn.Linear(hidden, num_category)
        self.head_pattern   = nn.Linear(hidden, num_pattern)
        self.head_season    = nn.Linear(hidden, num_season)
        self.head_formality = nn.Linear(hidden, num_formality)

    def forward(self, x):
        features = self.backbone(x)
        features = features.view(features.size(0), -1)  # flatten
        shared = self.shared_fc(features)
        return (
            self.head_category(shared),
            self.head_pattern(shared),
            self.head_season(shared),
            self.head_formality(shared),
        )


class ClothingPredictor:
    """
    Loads a saved checkpoint and runs inference on single images.
    """
    def __init__(self, model_path: str, label_map_path: str):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

        # Load label map
        with open(label_map_path, encoding="utf-8") as f:
            raw_label_map = json.load(f)

        # Build category class list from label_map
        # label_map maps dataset_label → app_category
        unique_categories = sorted(set(v for v in raw_label_map.values() if v != "UNMAPPED"))
        self.category_classes = unique_categories
        self.num_categories = len(unique_categories)
        self.cat_idx_to_name = {i: name for i, name in enumerate(unique_categories)}

        # Load checkpoint
        checkpoint = torch.load(model_path, map_location=self.device)

        # Support checkpoints saved with or without class_names
        if "class_names" in checkpoint:
            self.category_classes = checkpoint["class_names"]
            self.num_categories = len(self.category_classes)
            self.cat_idx_to_name = {i: n for i, n in enumerate(self.category_classes)}

        self.model = build_model(self.num_categories)
        self.model.load_state_dict(checkpoint["model_state_dict"])
        self.model.to(self.device)
        self.model.eval()

        self.pattern_classes  = PATTERN_CLASSES
        self.season_classes   = SEASON_CLASSES
        self.formality_classes = FORMALITY_CLASSES

    def predict(self, image_path: str) -> dict:
        """Run inference on a single image. Returns structured prediction dict."""
        tensor = preprocess_for_inference(image_path).to(self.device)

        with torch.no_grad():
            cat_logits, pat_logits, sea_logits, form_logits = self.model(tensor)

        cat_probs  = torch.softmax(cat_logits,  dim=1)[0].cpu()
        pat_probs  = torch.softmax(pat_logits,  dim=1)[0].cpu()
        sea_probs  = torch.softmax(sea_logits,  dim=1)[0].cpu()
        form_probs = torch.softmax(form_logits, dim=1)[0].cpu()

        cat_conf,  cat_idx  = cat_probs.max(dim=0)
        pat_conf,  pat_idx  = pat_probs.max(dim=0)
        sea_conf,  sea_idx  = sea_probs.max(dim=0)
        form_conf, form_idx = form_probs.max(dim=0)

        cat_name  = self.cat_idx_to_name.get(cat_idx.item(), "unknown")
        pat_name  = self.pattern_classes[pat_idx.item()]  if pat_idx.item() < len(self.pattern_classes)  else "unknown"
        sea_name  = self.season_classes[sea_idx.item()]   if sea_idx.item() < len(self.season_classes)   else "unknown"
        form_name = self.formality_classes[form_idx.item()] if form_idx.item() < len(self.formality_classes) else "unknown"

        # Top-3 category predictions
        top3_vals, top3_idxs = cat_probs.topk(min(3, self.num_categories))
        top3 = [
            {"category": self.cat_idx_to_name.get(idx.item(), "unknown"), "confidence": round(v.item(), 3)}
            for v, idx in zip(top3_vals, top3_idxs)
        ]

        needs_review = cat_conf.item() < CONFIDENCE_THRESHOLD

        return {
            "category":  {"value": cat_name,  "confidence": round(cat_conf.item(), 3)},
            "subType":   {"value": "unknown",  "confidence": 0.0},  # needs dataset subtype labels
            "pattern":   {"value": pat_name,   "confidence": round(pat_conf.item(), 3)},
            "season":    {"value": sea_name,   "confidence": round(sea_conf.item(), 3)},
            "formality": {"value": form_name,  "confidence": round(form_conf.item(), 3)},
            "material":  {"value": "unknown",  "confidence": 0.0},  # requires material labels
            "top3Categories": top3,
            "needsReview": needs_review,
        }
