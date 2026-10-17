# Alcove — Smart Wardrobe & Outfit Planner
## Comprehensive Project Documentation & Technical Explanation Note

---

## 1. Executive Summary

**Alcove** (Smart Wardrobe) is a full-stack, 100% offline, privacy-first smart wardrobe management and outfit recommendation platform. It combines modern web technologies (React + Node.js/Express + MongoDB) with an on-device computer vision and deep learning engine (PyTorch + OpenCV + Flask) to digitize, organize, and intelligently optimize a user's clothing collection.

Unlike commercial apps that rely on expensive, privacy-invasive cloud vision APIs (e.g., Google Cloud Vision, OpenAI GPT-4 Vision), Alcove operates **completely locally**. Personal photos never leave the user's machine, eliminating API fees and privacy concerns while delivering real-time clothing recognition, outfit generation, wardrobe gap analysis, and trip packing recommendations.

---

## 2. What the Project Has (Features & Architecture)

### 2.1 Core Feature Modules

1. **User Authentication & Profiles**:
   - Secure JWT-based authentication (sign-up, login, token refresh).
   - Multi-wardrobe support (e.g., "Home", "Dorm", "Office") and user preference management.

2. **Smart Clothing Cataloging & Digital Wardrobe**:
   - Image upload with automatic drag-and-drop support.
   - Attribute tracking: Category, Sub-type, Primary & Secondary Colors, Pattern, Style, Season, Formality, Brand, Material, Status, Notes.
   - Status lifecycle tracking: `available`, `laundry`, `packed`, and `donated`.
   - Advanced search, filtering by category, style, color, status, and wardrobe space.

3. **AI Image Analysis Engine**:
   - **Multi-Head Deep Convolutional Neural Network (MobileNetV3-Large)** for simultaneous detection of Category, Pattern, Season, and Formality.
   - **Computer Vision Color Extraction**: Foreground segmentation (GrabCut) + K-Means clustering to identify dominant and accent colors.
   - **Rule-Based Style Inference Engine**: Categorizes items into styles (Casual, Formal, Business, Sporty, Streetwear, Minimal, Vintage, Party).
   - **Confidence Scoring & Human-in-the-Loop Review**: Flags low-confidence predictions (< 60%) for human confirmation.
   - **Continuous Learning Log**: Stores corrections (`ClothingCorrection`) to allow future model retraining.

4. **Multi-Factor Outfit Recommendation Engine**:
   - Wardrobe-aware generation combining tops, bottoms, outerwear, footwear, and accessories (or one-pieces/dresses).
   - **100-Point Scoring Algorithm**:
     - Weather / Temperature suitability (30 points)
     - Occasion appropriateness (25 points)
     - Color harmony matrix (20 points)
     - Style consistency (15 points)
     - Seasonal suitability (10 points)
   - Explainable AI: Provides explicit textual justification for why each outfit was selected.

5. **Wardrobe Analytics & Gap Analysis**:
   - Visual category coverage bars compared against curated wardrobe targets.
   - Missing category detection and coverage deficiency alerts.
   - Distribution charts for colors, styles, and seasons.
   - Occasion readiness indicators (e.g., Casual: 100%, Formal: 40%).
   - Actionable shopping recommendations to fill wardrobe gaps.

6. **Trip Packing Planner**:
   - Inputs: Destination, dates (duration), and planned occasions.
   - Algorithmic packing formula calculating required item quantities per category based on trip length.
   - Automatic selection preferring least-worn clothing for outfit freshness.
   - Interactive checklist with packed/unpacked toggles.

7. **Wear History Calendar & Item Utilization**:
   - Monthly calendar interface logging outfits worn on specific days.
   - Increments wear counts (`wornCount`) and tracks freshness (`lastWornText`).
   - Helps eliminate the 80/20 rule of fashion (wearing 20% of clothes 80% of the time).

8. **Lookbook & Social Outfit Sharing**:
   - Save favorite outfits to personal Lookbooks.
   - Public shareable links (unique UUID) accessible without logging in.
   - Community/peer feedback system (upvotes, downvotes, styling notes).

---

### 2.2 System Architecture Overview

Alcove uses a decoupled **3-tier microservice architecture**:

```
┌─────────────────────────────────────────────────────────────────┐
│                      Client / User Browser                      │
│                      http://localhost:3000                      │
└───────────────────────────────┬─────────────────────────────────┘
                                │ HTTP / REST (Vite Proxy / JSON)
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│             Frontend: React 18 + Tailwind CSS + Vite            │
│  - SPA Routing (React Router v6)                                │
│  - Glassmorphic UI Design System                                │
│  - Centralized API Client (src/lib/api.js)                      │
│  - Auth State Context (src/context/AuthContext.jsx)             │
└───────────────────────────────┬─────────────────────────────────┘
                                │ HTTP / REST (Port 5000)
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│              Backend: Node.js + Express REST API                │
│  - JWT Authentication & Multer File Upload Middleware           │
│  - Controllers: Auth, Wardrobe, AI Bridge, Outfits, Trips, Cal  │
│  - Business Services: Recommendation Engine, Gap Analysis, Trip │
└───────────────┬─────────────────────────────────┬───────────────┘
                │ Mongoose (Port 27017)           │ HTTP (Port 8000)
                ▼                                 ▼
┌───────────────────────────────┐ ┌───────────────────────────────┐
│       MongoDB Database        │ │    Python AI / ML Engine      │
│  Collections:                 │ │  - Flask REST API             │
│  - users                      │ │  - PyTorch (MobileNetV3-Large)│
│  - clothingitems              │ │  - OpenCV K-Means Color Model │
│  - outfits                    │ │  - Deterministic Style Engine │
│  - outfitlogs                 │ └───────────────────────────────┘
│  - clothingcorrections        │
│  - trips                      │
│  - feedbacks                  │
└───────────────────────────────┘
```

---

## 3. What is Used (Tech Stack & Tools)

| Component | Technology | Version | Purpose / Role |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | **React** | 18.2.0 | Reactive component-based user interface |
| **Frontend Tooling** | **Vite** | 5.1.4 | Lightning-fast development server & HMR build tool |
| **Styling** | **Tailwind CSS** | 3.4.1 | Utility-first styling with custom glassmorphism design tokens |
| **Icons** | **Lucide React** | 0.344.0 | Clean, lightweight UI icons |
| **Routing** | **React Router DOM**| 6.22.0| Client-side single page application routing |
| **Backend Runtime** | **Node.js** | 18+ | Non-blocking asynchronous JavaScript server environment |
| **Backend Framework** | **Express.js** | 4.18.2 | RESTful API server routing & middleware orchestration |
| **Database** | **MongoDB** | 6.0+ | Document-oriented NoSQL database for flexible clothing schemas |
| **ODM** | **Mongoose** | 8.2.0 | Schema validation, models, and MongoDB abstraction |
| **Authentication** | **JWT (`jsonwebtoken`)** | 9.0.2 | Stateless bearer token authentication |
| **Password Security** | **bcryptjs** | 2.4.3 | Salted one-way hashing for user passwords |
| **File Handling** | **Multer** | 1.4.5 | Multipart/form-data upload parsing and disk storage |
| **AI Runtime** | **Python** | 3.10+ | High-performance machine learning & computer vision runtime |
| **Deep Learning** | **PyTorch & Torchvision** | 2.2.0+ | Neural network modeling, tensor computation, CPU/GPU inference |
| **CNN Architecture** | **MobileNetV3-Large** | Pretrained | Backbone network with 4 custom linear classification heads |
| **Computer Vision** | **OpenCV (`cv2`)** | 4.9.0+ | Image processing, GrabCut background masking, K-Means clustering |
| **Image Processing** | **Pillow (PIL)** | 10.2.0+| Robust image decoding, format conversion, and normalization |
| **AI Web Server** | **Flask & Werkzeug** | 3.0.1+ | Lightweight microservice serving AI inference endpoints |

---

## 4. How It is Used (Workflows & Execution Flow)

### 4.1 End-to-End User Journey

1. **Authentication**:
   - The user visits `http://localhost:3000`, registers an account, or logs in. A JWT token is stored in `localStorage`.
2. **Uploading an Item**:
   - The user navigates to `/add-item` and uploads a photo of a clothing piece.
   - The photo is transmitted to Express (`POST /api/ai/analyze`), stored locally, and forwarded to the Flask AI engine (`POST http://localhost:8000/predict`).
   - The AI identifies category, colors, pattern, formality, and style.
   - An editable tag form displays the detected properties with confidence scores.
   - The user verifies or tweaks any tags and clicks "Save to Wardrobe". Corrections are logged for active learning.
3. **Getting Outfit Recommendations**:
   - The user goes to `/generator` and selects the day's occasion (Casual, Work, Party, Date, Gym, etc.) and current weather (temperature, conditions).
   - The recommendation algorithm iterates through available wardrobe items, scores combinations using the 100-point algorithm, and returns the top 3 best-matching outfits with explanations.
   - Clicking "Wear Today" logs the outfit to the calendar and updates wear metrics.
4. **Checking Wardrobe Health (Gap Analysis)**:
   - On `/gap-analysis`, the user reviews category coverage percentages.
   - The system reveals underrepresented categories (e.g., "Only 1 pair of shoes; target is 5") and suggests specific missing items to buy.
5. **Planning a Trip**:
   - On `/trip`, the user specifies a destination, start/end dates, and planned activities.
   - The system automatically compiles a packing list, calculating the exact quantity of tops, bottoms, footwear, and outerwear needed, preferring lesser-worn clothes.
6. **Logging & Calendar**:
   - `/calendar` displays a history of what was worn every day, helping users rotate their wardrobe.
7. **Social Sharing**:
   - An outfit can be shared via a generated public link (`/share/:id`), allowing friends to vote and provide feedback.

---

### 4.2 Internal Algorithmic Flows

#### A. Clothing Classification & Color Detection Pipeline

```
Raw Image Uploaded
       │
       ├──► [OpenCV Pipeline]
       │       │
       │       ├─► GrabCut Foreground Masking (isolates clothing from background)
       │       ├─► Color space conversion (BGR ➔ LAB / RGB)
       │       ├─► K-Means Clustering (k=5 dominant color centroids)
       │       └─► Euclidean nearest-neighbor lookup in curated color dictionary
       │              └─► Returns: primaryColor, secondaryColors, colorConfidence
       │
       └──► [PyTorch Pipeline]
               │
               ├─► Image Preprocessing (Resize to 224x224, Normalize via ImageNet stats)
               ├─► MobileNetV3-Large Feature Extraction (1280-dim feature vector)
               ├─► Shared Fully Connected Layer (256 hidden units + Hardswish + Dropout)
               ├─► 4 Independent Multi-Task Classification Heads:
               │      ├─ Category Head   (Tops, Bottoms, Outerwear, Shoes, Dresses, Accessories)
               │      ├─ Pattern Head    (Solid, Striped, Printed, Knit, Checked, Floral, Geometric)
               │      ├─ Season Head     (Spring, Summer, Autumn, Winter, All-year)
               │      └─ Formality Head  (Casual, Smart-Casual, Formal)
               │
               └─► [Deterministic Rule-Based Style Engine]
                      └─► Synthesizes Category + SubType + Pattern + Formality
                             └─► Outputs: Style (Formal, Business, Streetwear, Minimal, etc.)
```

#### B. The 100-Point Outfit Scoring Formula

When building combinations ($Top + Bottom + Shoes$ or $OnePiece + Shoes$), each combination is evaluated against:

$$\text{Total Score} = S_{\text{weather}} + S_{\text{occasion}} + S_{\text{color}} + S_{\text{style}} + S_{\text{season}}$$

1. **Weather Suitability ($S_{\text{weather}}$, Max 30 pts)**:
   - Evaluates ambient temperature against material thickness and category (e.g., sweaters penalized above 24°C, tank tops penalized below 15°C).
   - Evaluates rain resistance (heavy fabrics and white footwear penalized if raining).
2. **Occasion Match ($S_{\text{occasion}}$, Max 25 pts)**:
   - Compares the item's formality and style with an occasion profile mapping (e.g., Gym $\rightarrow$ Sporty; Office $\rightarrow$ Business/Formal).
3. **Color Compatibility ($S_{\text{color}}$, Max 20 pts)**:
   - Evaluates pairs of colors against a color compatibility matrix (contrast, complementary pairs, and neutral pairings like Navy + Beige, Black + White).
4. **Style Consistency ($S_{\text{style}}$, Max 15 pts)**:
   - Measures aesthetic cohesion across all pieces in the outfit (penalizes clashing styles like Formal blazer + Athletic track pants).
5. **Season Suitability ($S_{\text{season}}$, Max 10 pts)**:
   - Rewards items classified for the current calendar or simulated season.

---

### 4.3 How to Run the Entire Project

```bash
# 1. Start MongoDB Daemon
mongod

# 2. Terminal 1: AI Engine (Port 8000)
cd ai-engine
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate
python server.py

# 3. Terminal 2: Node.js Backend (Port 5000)
cd backend
npm run dev

# 4. Terminal 3: React Frontend (Port 3000)
# from project root:
npm run dev
```

---

## 5. Why It is Used (Project Motivation & Technical Rationale)

### 5.1 Real-World Problem Statement

1. **Wardrobe Paralysis & Decision Fatigue**: The average individual spends 15–20 minutes daily choosing clothes, often experiencing "closet full of clothes, but nothing to wear."
2. **Clothing Underutilization & Economic Waste**: Research indicates that people regularly wear only 20% of the clothing they own. The remaining 80% sits idle due to poor visibility.
3. **Overconsumption & Misguided Purchases**: Shoppers frequently purchase impulse items that duplicate existing clothes or cannot be integrated into versatile outfits.
4. **Packing Stress**: Travelers routinely overpack or forget essential combinations for specific trip events.

---

### 5.2 Why Specific Technologies Were Chosen

| Decision | Why This Choice Was Made Over Alternatives |
| :--- | :--- |
| **100% Offline / Local Edge AI** | **Privacy & Cost**: Users upload personal photos often taken in bedrooms or mirrors. Cloud AI incurs ongoing token costs ($0.01–$0.03 per image) and creates privacy liabilities. Local inference is free and completely private. |
| **MobileNetV3-Large** | **Efficiency on CPU**: ResNet-50 or ViT (Vision Transformer) requires heavy GPU compute. MobileNetV3-Large utilizes depthwise separable convolutions and squeeze-and-excitation blocks, achieving ~85-90% top-1 accuracy while running in **under 200ms on a standard laptop CPU**. |
| **Multi-Head Architecture** | **Single-Pass Inference**: Instead of running 4 separate models for Category, Pattern, Season, and Formality (4x compute), a single MobileNet backbone extracts shared features, and 4 lightweight linear heads predict all attributes simultaneously in one forward pass. |
| **OpenCV K-Means for Color** | **Determinism & Accuracy**: Deep learning models frequently struggle with color labeling due to lighting variations and dataset annotation bias. Unsupervised K-Means clustering mathematically groups actual pixel color frequencies in LAB color space, providing exact centroid values without needing labeled training data. |
| **Rule-Based Style & Recommendation Engine** | **Explainability**: Black-box neural recommender systems cannot easily explain *why* an outfit was chosen. Rule-based scoring with a color harmony matrix provides **100% explainable recommendations** with transparent score breakdowns. |
| **React 18 + Vite** | **Fast UX**: Modern component-based architecture with instantaneous Hot Module Replacement (HMR) and optimized production bundles. |
| **Node.js / Express** | **Fast I/O & Microservice Bridging**: Asynchronous, event-driven I/O makes Node ideal for handling multipart image streaming between the client and the Python AI microservice. |
| **MongoDB / Mongoose** | **Schema Flexibility**: Clothing items possess dynamic, polymorphic metadata (various colors, seasonal tags, wear histories, nested score objects) that are naturally modeled in JSON documents. |

---

## 6. Project Directory Map

```
Smart Waredrob/
├── src/                          # React Frontend Application
│   ├── pages/                    # 9 Primary Views:
│   │   ├── Login.jsx             # Auth portal (Sign up / Sign in)
│   │   ├── Dashboard.jsx         # Wardrobe gallery, filters, category counts
│   │   ├── AddItem.jsx           # Drag-drop upload + AI tag verification
│   │   ├── OutfitGenerator.jsx   # Weather + Occasion outfit generator
│   │   ├── GapAnalysis.jsx       # Category targets, coverage bars, recommendations
│   │   ├── CalendarPage.jsx      # Wear-history calendar view
│   │   ├── TripPacking.jsx       # Trip planner and automated packing checklist
│   │   ├── Profile.jsx           # User settings, wardrobe spaces, logout
│   │   └── SharedOutfit.jsx      # Public outfit view with social feedback
│   ├── components/               # Layout, TopNav, LeftRail, GlassCard, BottomBar
│   ├── context/                  # AuthContext.jsx (JWT state management)
│   └── lib/                      # api.js (centralized HTTP client with error handling)
│
├── backend/                      # Node.js + Express Server (Port 5000)
│   ├── src/
│   │   ├── controllers/          # Business logic handlers (auth, wardrobe, AI, outfits, trips)
│   │   ├── middleware/           # auth.js (JWT), upload.js (Multer), errorHandler.js
│   │   ├── models/               # Mongoose Schemas (User, ClothingItem, Outfit, Trip, Feedback)
│   │   ├── services/
│   │   │   ├── aiService.js           # HTTP bridge to Python AI engine
│   │   │   ├── recommendationEngine.js# 100-pt outfit scoring & combinations
│   │   │   ├── wardrobeAnalysis.js    # Gap detection & shopping targets
│   │   │   └── packingService.js      # Duration/occasion-based packing algorithms
│   │   └── app.js                # Server entry point
│   ├── uploads/                  # Local isolated storage for user clothing photos
│   └── .env                      # Database URI, JWT secret, ports
│
├── ai-engine/                    # Python AI/ML Microservice (Port 8000)
│   ├── server.py                 # Flask server (/health, /predict)
│   ├── inference/
│   │   ├── predictor.py          # PyTorch MultiHead MobileNetV3 inference
│   │   ├── color_detector.py     # OpenCV GrabCut + K-Means color detection
│   │   └── style_engine.py       # Deterministic rule-based style classifier
│   ├── preprocessing/            # Image resizing, normalization, dataset builders
│   ├── training/                 # train.py (PyTorch training loop), evaluate.py
│   ├── models/                   # Saved .pth weights & label_map.json
│   └── requirements.txt          # PyTorch, Torchvision, OpenCV, Flask, Pillow
│
├── Document/                     # Academic Mini-Project Reports, Lab Manual, Presentation PPT
└── README.md                     # Quickstart documentation
```

---

## 7. Key Takeaways for Presentations & Reviews

- **Problem Addressed**: Solves wardrobe paralysis, reduces fashion waste, and automates outfit styling.
- **Novelty**: 100% offline edge AI with privacy preservation — zero cloud API dependency.
- **Hybrid AI Architecture**: Combines **Deep Learning** (MobileNetV3 for categories/attributes), **Computer Vision** (OpenCV K-means for colors), and **Explainable Expert Systems** (Color matrix & rule scoring for outfits).
- **Production-Ready Engineering**: Full CRUD capabilities, token security, continuous feedback logging, error resilience (graceful fallback if AI is offline), and responsive glassmorphism UI.
