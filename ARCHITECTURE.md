# ARCHITECTURE

```
┌──────────────────────────────────────────────────────────────┐
│                          USER                                 │
│                   http://localhost:3000                       │
└──────────────────────────┬───────────────────────────────────┘
                           │ HTTPS/REST
                           ▼
┌──────────────────────────────────────────────────────────────┐
│              REACT FRONTEND (Vite + Tailwind)                 │
│                                                              │
│  Login ─── Dashboard ─── AddItem ─── OutfitGenerator        │
│  CalendarPage ─── GapAnalysis ─── TripPacking ─── Profile   │
│                                                              │
│  src/lib/api.js ────────────── centralized HTTP client       │
│  src/context/AuthContext.jsx ── JWT auth state               │
└──────────────────────────┬───────────────────────────────────┘
                           │ HTTP/REST (port 5000)
                           ▼
┌──────────────────────────────────────────────────────────────┐
│            NODE.JS + EXPRESS BACKEND (port 5000)             │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Middleware: JWT auth · multer upload · rate limiting  │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  /api/auth     ─── authController.js                        │
│  /api/wardrobe ─── wardrobeController.js                    │
│  /api/ai       ─── aiController.js                          │
│  /api/outfits  ─── outfitController.js                      │
│  /api/calendar ─── calendarController.js                    │
│  /api/trips    ─── tripController.js                        │
│                                                              │
│  Services:                                                   │
│  ├─ aiService.js          → HTTP bridge to Python AI engine  │
│  ├─ recommendationEngine.js → offline outfit scoring        │
│  ├─ wardrobeAnalysis.js   → gap analysis + recommendations  │
│  └─ packingService.js     → smart trip packing list         │
└──────────┬────────────────────────┬─────────────────────────┘
           │ mongoose               │ HTTP (port 8000)
           ▼                        ▼
┌──────────────────┐   ┌─────────────────────────────────────┐
│    MONGODB       │   │   PYTHON AI ENGINE (Flask, port 8000)│
│                  │   │                                     │
│  Collections:    │   │  /health → model status             │
│  users           │   │  /predict → full analysis           │
│  clothingitems   │   │                                     │
│  outfits         │   │  ┌─────────────────────────────┐   │
│  outfitlogs      │   │  │ inference/predictor.py      │   │
│  feedbacks       │   │  │ MobileNetV3 multi-head CNN  │   │
│  clothingcor-    │   │  │ (clothing_classifier.pth)   │   │
│  rections        │   │  └─────────────────────────────┘   │
│  trips           │   │                                     │
│                  │   │  ┌─────────────────────────────┐   │
└──────────────────┘   │  │ inference/color_detector.py │   │
                       │  │ OpenCV K-means color detect  │   │
                       │  └─────────────────────────────┘   │
                       │                                     │
                       │  ┌─────────────────────────────┐   │
                       │  │ inference/style_engine.py   │   │
                       │  │ Rule-based style classifier │   │
                       │  └─────────────────────────────┘   │
                       └─────────────────────────────────────┘
```

## Data Flow — Image Upload & Analysis

```
User selects image file
       ↓
Frontend: POST /api/ai/analyze (multipart)
       ↓
Backend: validate file type/size (multer)
       ↓
Backend: save file to backend/uploads/<userId>/<uuid>.jpg
       ↓
Backend: POST http://localhost:8000/predict (forward image)
       ↓
AI Engine: load image → preprocessing (resize/normalize)
       ↓
AI Engine: ─────────────────────────────────────────
           │ MobileNetV3 backbone → feature vector  │
           │    ↓              ↓          ↓         │
           │ category    pattern/season/formality    │
           ─────────────────────────────────────────
       ↓
AI Engine: OpenCV color detection (parallel)
       ↓
AI Engine: rule-based style classification
       ↓
AI Engine: merge → JSON response
       ↓
Backend: return prediction + imageUrl to frontend
       ↓
Frontend: populate tag panel (editable)
       ↓
User reviews + edits tags → clicks "Save"
       ↓
Frontend: POST /api/ai/confirm (with confirmed tags)
       ↓
Backend: create ClothingItem in MongoDB
       ↓
Backend: record any corrections (ClothingCorrection)
       ↓
Item visible in wardrobe
```

## Data Flow — Outfit Recommendation

```
User selects occasion + weather → clicks "Generate"
       ↓
Frontend: POST /api/outfits/recommend
       ↓
Backend: load user's available wardrobe from MongoDB
       ↓
Backend: recommendationEngine.generateOutfitRecommendations(...)
         ↓
         Filter by weather/season suitability
         ↓
         Try top + bottom + shoes combinations
         Try one-piece + shoes combinations
         ↓
         Score each combination:
           weatherScore   (30 pts) — temp/season match
           occasionScore  (25 pts) — style fits occasion
           colorScore     (20 pts) — color compatibility matrix
           styleScore     (15 pts) — consistent style
           seasonScore    (10 pts) — season appropriate
         ↓
         Sort by total score
         Deduplicate outfits
         Return top 3
       ↓
Backend: return array of scored outfit objects
       ↓
Frontend: display outfit items + score + reasons
```

## Technology Choices

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | React + Vite + Tailwind | Existing project |
| Backend | Node.js + Express | Fast HTTP API, easy to connect to frontend |
| Database | MongoDB + Mongoose | Flexible schema for clothing attributes |
| AI framework | Python + PyTorch | Industry standard, free, CPU-capable |
| Backbone | MobileNetV3-Large | Lightweight, fast on CPU, good accuracy |
| Color detection | OpenCV | No model needed, reliable, explainable |
| Style detection | Rule engine | Explainable, debuggable, no training data needed |
| Recommendation | Scoring algorithm | Fast, explainable, no data needed |
| Auth | JWT (jsonwebtoken) | Stateless, simple |
| File upload | multer | Handles multipart, file type validation |
