"""
inference/style_engine.py
Rule-based style classification.
Uses detected clothing attributes to determine style without needing a separate ML model.

Rules are deterministic and explainable — appropriate for academic demonstration.
"""

# ── Style rules ───────────────────────────────────────────────────────────────
# Each rule: (conditions_dict, style_name, confidence)
# Conditions are checked in order; first match wins.

STYLE_RULES = [
    # Formal / business
    {
        "conditions": {"category_in": ["tops", "bottoms"], "subtype_in": ["blazer", "suit jacket", "dress shirt", "formal shirt", "formal trousers"], "formality_in": ["formal"]},
        "style": "formal",
        "confidence": 0.92,
    },
    {
        "conditions": {"subtype_in": ["blazer", "dress shirt", "formal shirt"]},
        "style": "formal",
        "confidence": 0.85,
    },
    {
        "conditions": {"subtype_in": ["suit jacket", "formal trousers", "dress pants"]},
        "style": "formal",
        "confidence": 0.88,
    },
    # Business casual
    {
        "conditions": {"subtype_in": ["chinos", "button-down", "polo", "smart shirt"], "formality_in": ["smart-casual"]},
        "style": "business",
        "confidence": 0.80,
    },
    # Party / evening
    {
        "conditions": {"category_in": ["dresses"], "subtype_in": ["cocktail dress", "evening dress", "party dress"]},
        "style": "party",
        "confidence": 0.88,
    },
    {
        "conditions": {"category_in": ["dresses"], "formality_in": ["formal"]},
        "style": "party",
        "confidence": 0.80,
    },
    # Sporty
    {
        "conditions": {"subtype_in": ["shorts", "leggings", "tracksuit", "joggers", "sweatpants", "sports bra", "athletic top"]},
        "style": "sporty",
        "confidence": 0.88,
    },
    {
        "conditions": {"category_in": ["shoes"], "subtype_in": ["sneakers", "running shoes", "trainers"]},
        "style": "sporty",
        "confidence": 0.75,
    },
    # Streetwear
    {
        "conditions": {"subtype_in": ["hoodie", "sweatshirt", "cargo pants", "bomber jacket", "cap"]},
        "style": "streetwear",
        "confidence": 0.82,
    },
    {
        "conditions": {"subtype_in": ["denim jacket", "oversized t-shirt", "beanie"]},
        "style": "streetwear",
        "confidence": 0.78,
    },
    # Vintage
    {
        "conditions": {"subtype_in": ["corduroy", "flannel", "vintage denim", "mom jeans", "vintage blazer"]},
        "style": "vintage",
        "confidence": 0.80,
    },
    # Casual (broad fallback for casual items)
    {
        "conditions": {"category_in": ["tops"], "subtype_in": ["t-shirt", "tank top", "crop top"]},
        "style": "casual",
        "confidence": 0.82,
    },
    {
        "conditions": {"category_in": ["bottoms"], "subtype_in": ["jeans", "shorts", "skirt"]},
        "style": "casual",
        "confidence": 0.78,
    },
    {
        "conditions": {"category_in": ["outerwear"], "subtype_in": ["cardigan", "knit sweater", "fleece"]},
        "style": "casual",
        "confidence": 0.80,
    },
    # Minimal
    {
        "conditions": {"pattern_in": ["solid"], "formality_in": ["casual", "smart-casual"]},
        "style": "minimal",
        "confidence": 0.65,
    },
]

# Formality fallback: if nothing matches, infer from formality field
FORMALITY_TO_STYLE = {
    "formal":       ("formal",  0.70),
    "smart-casual": ("business", 0.65),
    "casual":       ("casual",  0.65),
}

CATEGORY_FALLBACK = {
    "dresses":      ("casual",     0.60),
    "accessories":  ("minimal",    0.55),
    "shoes":        ("casual",     0.55),
    "one-piece":    ("casual",     0.60),
}


def classify_style(category: str, sub_type: str, pattern: str, formality: str) -> dict:
    """
    Classify the style of a clothing item based on its attributes.
    Returns: {"style": str, "confidence": float, "method": str}
    """
    cat  = (category or "unknown").lower().strip()
    sub  = (sub_type or "").lower().strip()
    pat  = (pattern  or "solid").lower().strip()
    form = (formality or "unknown").lower().strip()

    # ── Rule matching ────────────────────────────────────────────────────────
    for rule in STYLE_RULES:
        cond = rule["conditions"]
        match = True

        if "category_in" in cond and cat not in cond["category_in"]:
            match = False
        if "subtype_in" in cond:
            if not any(s in sub for s in cond["subtype_in"]):
                match = False
        if "formality_in" in cond and form not in cond["formality_in"]:
            match = False
        if "pattern_in" in cond and pat not in cond["pattern_in"]:
            match = False

        if match:
            return {
                "style":      rule["style"],
                "confidence": rule["confidence"],
                "method":     "rule",
            }

    # ── Formality fallback ────────────────────────────────────────────────────
    if form in FORMALITY_TO_STYLE:
        style, conf = FORMALITY_TO_STYLE[form]
        return {"style": style, "confidence": conf, "method": "formality_fallback"}

    # ── Category fallback ─────────────────────────────────────────────────────
    if cat in CATEGORY_FALLBACK:
        style, conf = CATEGORY_FALLBACK[cat]
        return {"style": style, "confidence": conf, "method": "category_fallback"}

    return {"style": "casual", "confidence": 0.50, "method": "default"}
