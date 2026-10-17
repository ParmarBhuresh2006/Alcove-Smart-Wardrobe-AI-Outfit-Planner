# PROJECT ANALYSIS — Smart Wardrobe & Outfit Planner (Alcove)

## 1. Existing Frontend Architecture

### Framework & Tooling
- **Framework**: React 18 (JSX)
- **Build Tool**: Vite 5 with `@vitejs/plugin-react`
- **Styling**: Tailwind CSS 3 + custom CSS utilities (glass morphism design system)
- **Routing**: React Router DOM v6
- **Icons**: Lucide React
- **State Management**: Local React `useState` (no Redux/Context currently)
- **Path alias**: `@` → `./src`
- **Dev port**: 3000

### Data Layer (Current — Mock)
- All data is currently served from `src/lib/mockData.js`
- No API calls, no authentication, no persistence
- Data includes: WARDROBE_ITEMS, CATEGORIES, OCCASIONS, OUTFIT_SUGGESTION, CALENDAR_ENTRIES, GAP_SUMMARY, WARDROBES

---

## 2. Pages & Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | `Login.jsx` | Login / Signup form — currently navigates to `/dashboard` on submit without real auth |
| `/dashboard` | `Dashboard.jsx` | Main wardrobe overview with item grid, category filters, and stats |
| `/add-item` | `AddItem.jsx` | Upload clothing image + AI tag editing panel + save to wardrobe |
| `/generator` | `OutfitGenerator.jsx` | Outfit generator with weather card, occasion tabs, outfit display, stylist notes |
| `/calendar` | `CalendarPage.jsx` | Monthly wear-history calendar with day-detail panel |
| `/gap-analysis` | `GapAnalysis.jsx` | Category coverage bars + AI gap summary + top recommendations |
| `/profile` | `Profile.jsx` | User profile editor, wardrobe spaces, preferences, logout |
| `/trip` | `TripPacking.jsx` | Trip planner with destination/dates, AI packing list, checklist |
| `/share/:id` | `SharedOutfit.jsx` | Public outfit share page with feedback voting |

---

## 3. Component Inventory

| Component | File | Purpose |
|-----------|------|---------|
| `Layout` | `components/Layout.jsx` | Wraps every authenticated page with TopNav + LeftRail + BottomBar |
| `TopNav` | `components/TopNav.jsx` | Fixed floating nav pill with search, notifications, profile |
| `LeftRail` | `components/LeftRail.jsx` | Side navigation (desktop) / bottom navigation (mobile) |
| `BottomBar` | `components/BottomBar.jsx` | Today's outfit floating bar with like/shuffle/wear actions |
| `GlassCard` | `components/GlassCard.jsx` | Reusable glass-morphism card container |

---

## 4. Key Frontend Behaviours to Preserve

1. **AddItem upload flow**: currently simulates upload with `setUploaded(true)` on click; needs real file input + AI analysis + tag population
2. **OutfitGenerator**: occasion tabs filter suggestions; weather card is static; needs real wardrobe data + real recommendation
3. **Dashboard**: filters wardrobe grid by category; stats (Items/Outfits/This week) are hardcoded
4. **GapAnalysis**: category bars use `count/target`; gap summary text is static; recommendations are hardcoded
5. **Login**: form submits without validation; needs real auth with JWT
6. **Profile**: wardrobes list is local state; needs real user data

---

## 5. Required Backend Endpoints

### Authentication
```
POST   /api/auth/register     — create user account
POST   /api/auth/login        — login, returns JWT
GET    /api/auth/me           — get current user profile
PUT    /api/auth/me           — update user profile
POST   /api/auth/logout       — invalidate session
```

### Wardrobe
```
GET    /api/wardrobe          — list all user's clothing items
POST   /api/wardrobe          — add new clothing item (with image)
GET    /api/wardrobe/:id      — get single item
PUT    /api/wardrobe/:id      — update item attributes
DELETE /api/wardrobe/:id      — delete item
PUT    /api/wardrobe/:id/status — update status (available/laundry/packed)
GET    /api/wardrobe/analysis — full wardrobe analytics + gap analysis
```

### AI
```
POST   /api/ai/analyze        — analyze uploaded clothing image → returns predicted tags
POST   /api/ai/confirm        — confirm/correct AI prediction, save to DB
```

### Outfits
```
POST   /api/outfits/recommend — generate outfit recommendations given weather+occasion
GET    /api/outfits           — list saved outfits
POST   /api/outfits           — save outfit to lookbook
GET    /api/outfits/:id       — get single outfit
DELETE /api/outfits/:id       — delete saved outfit
POST   /api/outfits/:id/wear  — mark outfit as worn today
POST   /api/outfits/:id/feedback — submit feedback (like/dislike)
```

### Calendar
```
GET    /api/calendar          — get wear-history calendar entries (by month/year)
POST   /api/calendar          — log an outfit for a specific date
```

### Trip / Packing
```
POST   /api/trips             — create trip with destination, dates, occasions
GET    /api/trips             — list trips
GET    /api/trips/:id         — get trip packing list
PUT    /api/trips/:id         — update trip / packing checklist
DELETE /api/trips/:id         — delete trip
```

---

## 6. Required Database Entities

| Entity | Description |
|--------|-------------|
| `User` | Account info, preferences, wardrobe spaces |
| `ClothingItem` | One clothing item with AI-detected + user-confirmed attributes |
| `Outfit` | A combination of ClothingItems for a specific occasion/event |
| `OutfitLog` | Record of wearing an outfit on a specific date (calendar) |
| `Trip` | Trip destination/dates with packing list derived from wardrobe |
| `Feedback` | User like/dislike vote on outfit (for shared outfit page too) |
| `ClothingCorrection` | AI prediction vs user correction — future training data |

---

## 7. Required AI Functionality

| Function | Method | Description |
|----------|--------|-------------|
| Clothing classifier | CNN (MobileNetV3 transfer learning) | Predicts category (top/bottom/dress/shoes/accessories) and sub-type |
| Color detector | Computer vision (HSV clustering, OpenCV) | Dominant + secondary colors |
| Style classifier | Rule-based (attribute lookup table) | Maps category+pattern+formality to style label |
| Outfit recommendation | Rule-based scoring engine | Weather + occasion + color compatibility + wardrobe availability |
| Gap analysis | Analytics rules | Finds under-represented categories / colors / occasions |
| Must-have recommendations | Gap analysis rules | Suggests item types to fill wardrobe gaps |

---

## 8. Integration Plan

### Step 1 — Frontend API Layer
Create `src/lib/api.js` — centralized Axios/fetch wrapper with JWT auth headers.

### Step 2 — Auth Context
Create `src/context/AuthContext.jsx` — wraps app with auth state, auto-attaches JWT.

### Step 3 — Replace Mock Data
- Replace `mockData.js` imports with real API calls in each page
- Pages keep their existing JSX/styling — only data source changes

### Step 4 — AddItem Real Upload
- Replace `setUploaded(true)` with `<input type="file">` handler
- Call `POST /api/ai/analyze` after upload
- Populate AI tag panel from response
- Call `POST /api/wardrobe` on confirm

### Step 5 — OutfitGenerator Real Recommendation
- Add weather inputs (temperature, condition, humidity)
- Call `POST /api/outfits/recommend` with occasion + weather
- Render returned outfit items + rationale

### Step 6 — Dashboard Live Data
- Call `GET /api/wardrobe` for item grid
- Call `GET /api/wardrobe/analysis` for stats + category counts

### Step 7 — GapAnalysis Live Data
- Call `GET /api/wardrobe/analysis` for coverage bars, gap summary, recommendations

### Step 8 — Profile Real Data
- Call `GET /api/auth/me` for user info
- Call `PUT /api/auth/me` to save changes

---

## 9. Project Directory Structure (Target)

```
Smart Waredrob/           ← workspace root (existing frontend lives here)
│
├── src/                  ← existing React frontend (DO NOT BREAK)
├── index.html
├── package.json
├── vite.config.js
│
├── backend/              ← NEW: Node.js + Express API server
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── services/
│   │   ├── config/
│   │   └── app.js
│   ├── uploads/
│   ├── .env.example
│   └── package.json
│
├── ai-engine/            ← NEW: Python AI engine
│   ├── models/           ← trained model files (.pth, .onnx)
│   ├── datasets/
│   │   ├── raw/          ← place Kaggle dataset here
│   │   ├── processed/
│   │   ├── train/
│   │   ├── validation/
│   │   └── test/
│   ├── preprocessing/
│   ├── training/
│   ├── inference/
│   ├── recommendation/
│   ├── scripts/
│   ├── server.py         ← Flask inference server
│   └── requirements.txt
│
└── docs/                 ← all .md documentation
```
