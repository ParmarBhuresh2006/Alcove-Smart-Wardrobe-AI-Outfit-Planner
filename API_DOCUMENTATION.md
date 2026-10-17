# API DOCUMENTATION

Base URL: `http://localhost:5000`

All protected routes require the header:
```
Authorization: Bearer <JWT_TOKEN>
```

---

## Authentication

### POST /api/auth/register
Create a new account.

**Body:**
```json
{
  "name": "Aria Blake",
  "email": "aria@alcove.app",
  "password": "mysecretpassword"
}
```

**Response 201:**
```json
{
  "token": "<JWT>",
  "user": { "id": "...", "name": "Aria Blake", "email": "..." }
}
```

---

### POST /api/auth/login
Login and receive JWT.

**Body:**
```json
{ "email": "aria@alcove.app", "password": "mysecretpassword" }
```

**Response 200:** Same as register.

---

### GET /api/auth/me
Get current user profile. **Protected.**

**Response 200:**
```json
{
  "id": "...",
  "name": "Aria Blake",
  "email": "aria@alcove.app",
  "preferences": { "darkMode": true, "notifications": true },
  "wardrobeSpaces": [{ "id": "home", "name": "Home", "isPrimary": true }],
  "plan": "free"
}
```

---

### PUT /api/auth/me
Update user profile. **Protected.**

**Body:** `{ "name": "...", "preferences": {...}, "wardrobeSpaces": [...] }`

---

## AI Analysis

### POST /api/ai/analyze
Upload a clothing image for AI analysis. **Protected.**

**Body:** `multipart/form-data` with field `image` (JPEG/PNG/WEBP, max 10MB)

**Response 200:**
```json
{
  "imagePath": "/absolute/path/to/saved/image.jpg",
  "imageUrl": "http://localhost:5000/uploads/...",
  "prediction": {
    "category":  { "value": "tops",  "confidence": 0.87 },
    "pattern":   { "value": "solid", "confidence": 0.91 },
    "season":    { "value": "all-year", "confidence": 0.75 },
    "formality": { "value": "casual",   "confidence": 0.82 },
    "primaryColor": { "value": "navy",  "confidence": 0.91 },
    "secondaryColors": ["white"],
    "style": { "value": "casual", "confidence": 0.82 },
    "mode": "trained",
    "needsReview": false
  },
  "needsReview": false
}
```

If AI engine is down:
```json
{ "error": "AI engine is unavailable.", "aiEngineDown": true }
```

---

### POST /api/ai/confirm
Confirm/correct AI predictions and save item to wardrobe. **Protected.**

**Body:**
```json
{
  "imagePath": "/path/from/analyze/response",
  "name": "Navy Linen Shirt",
  "category": "tops",
  "primaryColor": "navy",
  "pattern": "solid",
  "season": "summer",
  "formality": "casual",
  "aiConfidence": 0.87,
  "aiPrediction": { ... }
}
```

**Response 201:** Full `ClothingItem` object.

---

## Wardrobe

### GET /api/wardrobe
List wardrobe items. **Protected.**

**Query params:** `category`, `status`, `style`, `color`, `search`, `wardrobeSpaceId`

**Response 200:** `{ "items": [...], "total": N }`

---

### POST /api/wardrobe
Add item with image upload. **Protected.**

**Body:** `multipart/form-data` with `image` + optional fields: `name`, `category`, `primaryColor`, `pattern`, `season`, `formality`, `style`, `material`, `notes`, etc.

---

### GET /api/wardrobe/analysis
Full wardrobe analytics. **Protected.**

**Response 200:**
```json
{
  "totalItems": 15,
  "categories": {
    "tops": { "count": 5, "target": 12, "coverage": 42, "gap": true, "label": "Tops" },
    ...
  },
  "colors": { "navy": 3, "white": 2, ... },
  "styles": { "casual": 10, "formal": 2, ... },
  "occasionCoverage": { "casual": { "covered": 3, "required": 3, "percentage": 100 }, ... },
  "recommendations": [
    { "name": "White formal shirt", "reason": "Fills formal occasion gap", "priority": "High" }
  ],
  "gapSummary": "Your wardrobe is low on: Dresses (2/4), Shoes (1/5)..."
}
```

---

### PUT /api/wardrobe/:id
Update item attributes. **Protected.**

### DELETE /api/wardrobe/:id
Delete item (removes image file too). **Protected.**

### PUT /api/wardrobe/:id/status
Update item status. **Protected.**

**Body:** `{ "status": "available" | "laundry" | "packed" | "donated" }`

---

## Outfit Recommendations

### POST /api/outfits/recommend
Generate outfit recommendations from user's wardrobe. **Protected.**

**Body:**
```json
{
  "occasion": "casual",
  "weather": {
    "temperature": 22,
    "condition": "sunny",
    "humidity": 60,
    "rain": false
  },
  "location": "college",
  "count": 3
}
```

**Response 200:**
```json
{
  "outfits": [
    {
      "id": "outfit-1",
      "name": "The Campus Look",
      "items": [ { "_id": "...", "name": "Blue Shirt", "imageUrl": "...", ... } ],
      "score": 87,
      "scoreBreakdown": { "weather": 20, "occasion": 22, "color": 18, "style": 15, "season": 8 },
      "reasons": ["Suitable for mild weather", "Appropriate for College", "Colors complement each other"],
      "occasion": "college"
    }
  ]
}
```

---

### GET /api/outfits
List saved/lookbook outfits. **Protected.**

### POST /api/outfits
Save an outfit to lookbook. **Protected.**

### POST /api/outfits/:id/wear
Mark outfit as worn today — updates wornCount + logs to calendar. **Protected.**

### POST /api/outfits/:id/feedback
Submit like/dislike feedback. **Protected.**

**Body:** `{ "vote": "up" | "down", "reason": "..." }`

### POST /api/outfits/:id/share
Generate a public share link. **Protected.**

**Response:** `{ "shareId": "...", "shareUrl": "..." }`

### GET /api/outfits/share/:shareId
Get a publicly shared outfit. **No auth required.**

---

## Calendar

### GET /api/calendar?year=2026&month=2
Get wear-history calendar for a month. **Protected.**

**Response:**
```json
{
  "year": 2026,
  "month": 2,
  "daysInMonth": 28,
  "entries": {
    "14": {
      "logId": "...",
      "date": "2026-02-14T...",
      "occasion": "casual",
      "items": [...]
    }
  }
}
```

### POST /api/calendar
Log an outfit for a specific date. **Protected.**

**Body:** `{ "date": "2026-02-14", "clothingItemIds": [...], "occasion": "casual", "notes": "..." }`

---

## Trips

### POST /api/trips
Create a trip with AI-generated packing list. **Protected.**

**Body:**
```json
{
  "destination": "Lisbon, Portugal",
  "startDate": "2026-03-12",
  "endDate": "2026-03-18",
  "occasions": ["Casual", "Dinner", "Beach"]
}
```

**Response 201:** Trip object with `packingList` generated from your wardrobe.

### GET /api/trips
List all trips. **Protected.**

### GET /api/trips/:id
Get trip with packing list. **Protected.**

### PUT /api/trips/:id
Update trip or packing checklist. **Protected.**

### DELETE /api/trips/:id
Delete trip. **Protected.**

---

## Error Responses

All errors return:
```json
{ "error": "Human-readable error message" }
```

| Status | Meaning |
|--------|---------|
| 400 | Bad request (missing field, invalid value) |
| 401 | Authentication required or token expired |
| 403 | Forbidden (accessing another user's data) |
| 404 | Resource not found |
| 422 | Validation failed (with `fields` array) |
| 429 | Rate limit exceeded |
| 503 | AI engine unavailable |
| 500 | Internal server error |
