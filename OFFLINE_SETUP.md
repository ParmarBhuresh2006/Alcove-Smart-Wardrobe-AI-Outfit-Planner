# OFFLINE SETUP GUIDE

Everything required to run the Alcove Smart Wardrobe system completely offline,
with zero internet connection after initial installation.

---

## What runs offline?

| Component | Offline? | Notes |
|-----------|----------|-------|
| Frontend | ✅ Yes | React app served locally |
| Backend | ✅ Yes | Node.js Express on localhost |
| Database | ✅ Yes | MongoDB running locally |
| AI Engine | ✅ Yes | Python Flask on localhost |
| Clothing classification | ✅ Yes | PyTorch MobileNetV3 runs on your CPU |
| Color detection | ✅ Yes | OpenCV — no model file needed |
| Style classification | ✅ Yes | Rule-based, no model needed |
| Outfit recommendation | ✅ Yes | Pure scoring algorithm |
| Wardrobe gap analysis | ✅ Yes | Pure analytics |
| Image upload | ✅ Yes | Stored in `backend/uploads/` |

**Internet is ONLY needed for:**
- `npm install` (one-time)
- `pip install -r requirements.txt` (one-time)
- Downloading the Kaggle dataset (one-time)
- (Optional) `torch` model download during first `python training/train.py` run — ImageNet pretrained weights are downloaded by torchvision automatically and cached locally

After installation and training, the system is fully offline.

---

## Required local files (after setup)

```
backend/
  uploads/               ← clothing images uploaded by user
  .env                   ← environment variables

ai-engine/
  models/
    clothing_classifier.pth    ← trained PyTorch model
    label_map.json             ← class index
  datasets/
    train/               ← prepared training images
    validation/          ← validation images
    test/                ← test images
```

---

## Step-by-step offline setup

### Step 1 — Install MongoDB

Download from: https://www.mongodb.com/try/download/community (one-time, offline after install)

```bash
# Windows — start MongoDB
mongod --dbpath C:\data\db

# Or install as Windows service (runs automatically)
```

### Step 2 — Install Python dependencies

```bash
cd ai-engine
python -m venv venv
venv\Scripts\activate         # Windows
pip install -r requirements.txt
```

**Important:** `torch` (PyTorch) will download ~500MB of binaries. This happens once.
After that, all inference runs locally.

### Step 3 — Install Node.js dependencies

```bash
# Root (frontend)
npm install

# Backend
cd backend
npm install
```

### Step 4 — Configure backend

```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/alcove
JWT_SECRET=your_very_long_random_secret_here_change_this
AI_ENGINE_URL=http://localhost:8000
CORS_ORIGIN=http://localhost:3000
```

### Step 5 — Prepare AI model

```bash
# Place Kaggle dataset in:
ai-engine/datasets/raw/

# Run inspection
cd ai-engine
python preprocessing/dataset_inspector.py --dataset_dir datasets/raw

# Build train/val/test splits
python preprocessing/dataset_builder.py --dataset_dir datasets/raw

# Train (this takes 20–60 minutes on CPU)
python training/train.py --epochs 20 --batch_size 32

# Check model was saved
ls models/
# Should show: clothing_classifier.pth  label_map.json
```

### Step 6 — Test offline operation

1. Disconnect from internet
2. Start MongoDB: `mongod`
3. Start AI engine: `cd ai-engine && python server.py`
4. Start backend: `cd backend && npm run dev`
5. Start frontend: `npm run dev`
6. Open `http://localhost:3000`
7. Register a new account → login
8. Upload a clothing photo → verify AI analysis runs
9. Save item → check it appears in wardrobe
10. Go to Outfit Generator → generate outfit → verify it uses your items
11. Check Gap Analysis → verify real data shows

All steps should work with no internet.

---

## Offline fallback behaviour

If the AI engine is not running when a user uploads an image:
- The backend returns `{ aiEngineDown: true }`
- The frontend shows a clear message: "AI Engine Unavailable"
- The user can still manually tag and save the item
- The recommendation engine and gap analysis continue to work without the AI engine

---

## Torchvision model cache

PyTorch downloads pretrained weights on first train run and caches them at:
```
Windows: C:\Users\<username>\.cache\torch\hub\checkpoints\
Linux:   ~/.cache/torch/hub/checkpoints/
```

After first training run, subsequent training runs are fully offline.
