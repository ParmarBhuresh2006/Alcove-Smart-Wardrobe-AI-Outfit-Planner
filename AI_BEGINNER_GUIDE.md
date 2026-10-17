# AI BEGINNER GUIDE
## Understanding the Alcove Clothing AI — Step by Step

This guide explains every part of the AI/ML system in plain language.

---

## What is Transfer Learning?

Training an AI from scratch requires millions of images and weeks of GPU time.
Transfer learning lets you start with a model that already understands images,
then teach it your specific task.

Think of it this way:
```
ImageNet model
(knows: shapes, textures, edges, colours, objects)
              ↓
Remove last layer (was: "dog/cat/car/...")
              ↓
Add YOUR layer (is: "tops/bottoms/shoes/...")
              ↓
Train only the new layer first
              ↓
Fine-tune the whole thing
              ↓
Done! Uses 1/100th the data needed from scratch
```

---

## The Model Architecture

We use **MobileNetV3-Large** — a lightweight CNN optimised for CPU inference.

```
Input image (224×224 pixels)
         ↓
MobileNetV3 backbone
(pretrained on ImageNet — 1.3M parameters shared)
         ↓
Shared fully-connected layer (256 neurons)
         ↓
┌────────────────────┐
│   Four output heads │
├────────────────────┤
│ Category head      │ → tops / bottoms / outerwear / shoes / dresses / ...
│ Pattern head       │ → solid / striped / printed / knit / ...
│ Season head        │ → spring / summer / autumn / winter / all-year
│ Formality head     │ → casual / smart-casual / formal
└────────────────────┘
```

This is called **multi-task learning** — one backbone, multiple predictions.

---

## File-by-file Walkthrough

### `preprocessing/image_processor.py`
- Loads images as PIL RGB
- Resizes to 224×224
- Applies normalization (ImageNet mean/std)
- For training: adds augmentation (flips, rotation, brightness)

### `preprocessing/dataset_inspector.py`
- Walks your Kaggle dataset folder
- Counts images per class
- Detects corrupted and duplicate images
- Maps raw labels to application categories
- Generates `DATASET_REPORT.md`

### `preprocessing/dataset_builder.py`
- Reads `label_map.json`
- Copies images into `datasets/train/`, `datasets/validation/`, `datasets/test/`
- Applies 75% / 15% / 10% split
- Balances classes by capping the maximum samples per class

### `training/train.py`
- Phase 1 (epochs 1-10): Freeze the MobileNetV3 backbone, only train the heads
- Phase 2 (epochs 11-20): Unfreeze everything and fine-tune with a lower learning rate
- Saves the best checkpoint (by validation accuracy) to `models/clothing_classifier.pth`
- Uses **weighted loss** to handle class imbalance

### `training/evaluate.py`
- Loads the best checkpoint
- Runs inference on the test set
- Reports Accuracy, Precision, Recall, F1 per class
- Shows which classes work well and which need more data
- Generates `MODEL_EVALUATION.md`

### `inference/predictor.py`
- Loads checkpoint once at server startup
- Preprocesses a single image for inference
- Runs forward pass through the model (CPU)
- Returns top predictions with confidence scores

### `inference/color_detector.py`
- Uses OpenCV (no ML model needed)
- Masks the background using GrabCut
- K-means clusters foreground pixels into 5 color groups
- Maps each cluster centre to the closest named colour (black, navy, blue, red, ...)
- Returns primary colour + secondary colours

### `inference/style_engine.py`
- Deterministic rule engine — no model needed
- Uses category + subtype + pattern + formality to assign a style label
- e.g. "blazer" → formal, "hoodie" → streetwear, "solid" + "casual" → minimal
- Every rule is documented and editable

### `server.py`
- Flask HTTP server on port 8000
- Loads models once at startup
- `/health` — check if model is loaded
- `/predict` — receive image, run all detectors, return JSON

---

## Training Walkthrough

```
Step 1: Dataset inspection
  python preprocessing/dataset_inspector.py --dataset_dir datasets/raw

  → Generates: DATASET_REPORT.md, label_map.json

Step 2: Review label_map.json
  Open datasets/label_map.json
  Check that your dataset labels are mapped to correct app categories
  Fix any "UNMAPPED" entries

Step 3: Build dataset
  python preprocessing/dataset_builder.py --dataset_dir datasets/raw

  → Creates: datasets/train/, datasets/validation/, datasets/test/

Step 4: Train
  python training/train.py --epochs 20 --batch_size 32

  → Saves: models/clothing_classifier.pth
  → Saves: models/label_map.json

Step 5: Evaluate
  python training/evaluate.py

  → Generates: MODEL_EVALUATION.md

Step 6: Start inference server
  python server.py

Step 7: Test
  Open browser → http://localhost:3000
  Add a clothing item → watch the AI predict its tags
```

---

## Understanding Confidence

Every AI prediction includes a confidence score:
```json
{
  "category": { "value": "tops", "confidence": 0.87 }
}
```

- `0.90+` → Very confident — AI is probably correct
- `0.70–0.90` → Confident — likely correct, worth reviewing
- `0.60–0.70` → Uncertain — please check manually
- `< 0.60` → Low confidence — manual correction recommended (needsReview = true)

When `needsReview = true`, the UI prompts the user to review and correct the prediction.
All corrections are saved in the database (`ClothingCorrection` collection) for potential future retraining.

---

## Color Detection (No ML Required)

Color detection uses pure computer vision (OpenCV), not a neural network.

```
1. Load image
2. Resize to 200×200 (fast processing)
3. GrabCut algorithm → separate clothing from background
4. Get foreground pixels
5. K-means clustering → find 5 dominant color clusters
6. Map each cluster centre to the closest named color
   (using Euclidean distance in BGR space)
7. Sort by pixel count → primary = most dominant
8. Return: { primaryColor, secondaryColors, colorConfidence }
```

Named colors in the database: black, white, gray, red, blue, navy, green,
yellow, orange, purple, pink, brown, beige, cream, ivory, camel, maroon, teal, indigo, champagne

---

## Common Issues

### "AI model not found"
```
Solution: Train the model first:
  cd ai-engine
  python training/train.py
```

### "Not enough images to train"
```
Solution: 
  - Use a larger dataset (minimum ~50 images per class)
  - Lower --min_samples: python dataset_builder.py --min_samples 20
  - Check label_map.json for UNMAPPED labels
```

### "Training is very slow"
```
Solution:
  - Reduce batch size: python train.py --batch_size 16
  - Reduce image size (edit preprocessing/image_processor.py: INPUT_SIZE = 128)
  - GPU will be used automatically if CUDA is available (PyTorch detects it)
  - CPU training ~20-60 min for 20 epochs depending on dataset size
```

### "Low accuracy (<50%)"
```
Check:
  - Does the dataset have enough images per class? (Run dataset_inspector.py)
  - Are label_map.json mappings correct?
  - Try more epochs: python train.py --epochs 30
  - Try with balance: python train.py --balance
```
