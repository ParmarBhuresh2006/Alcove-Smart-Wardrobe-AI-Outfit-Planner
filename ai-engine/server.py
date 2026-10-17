"""
server.py — Alcove AI Engine (Flask)
Loads the trained clothing classifier once into memory, then serves prediction
requests from the Node.js backend.

Start with:
    python server.py
"""

import os
import sys
import logging

from flask import Flask, request, jsonify
from werkzeug.exceptions import BadRequest

# ── Logging ───────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)

# ── Add ai-engine root to path ────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BASE_DIR)

from inference.predictor import ClothingPredictor
from inference.color_detector import ColorDetector

app = Flask(__name__)

# ── Load models once at startup ───────────────────────────────────────────────
MODEL_PATH = os.path.join(BASE_DIR, "models", "clothing_classifier.pth")
LABEL_MAP_PATH = os.path.join(BASE_DIR, "models", "label_map.json")

predictor = None
color_detector = ColorDetector()

def load_predictor():
    global predictor
    if not os.path.exists(MODEL_PATH):
        logger.warning(
            f"Model file not found: {MODEL_PATH}\n"
            "Run: python training/train.py\n"
            "The AI engine will run in DEMO/FALLBACK mode until the model is trained."
        )
        predictor = None
    else:
        try:
            predictor = ClothingPredictor(model_path=MODEL_PATH, label_map_path=LABEL_MAP_PATH)
            logger.info(f"AI model loaded successfully from {MODEL_PATH}")
        except Exception as e:
            logger.error(f"Failed to load AI model: {e}")
            predictor = None

load_predictor()


# ── Routes ─────────────────────────────────────────────────────────────────────

@app.route("/health")
def health():
    return jsonify({
        "status": "ok",
        "model_loaded": predictor is not None,
        "mode": "trained" if predictor else "fallback",
    })


@app.route("/predict", methods=["POST"])
def predict():
    """
    Accepts a multipart/form-data POST with field 'image'.
    Returns JSON prediction.
    """
    if "image" not in request.files:
        return jsonify({"error": "No image file provided. Send a multipart form with field 'image'."}), 400

    file = request.files["image"]
    if file.filename == "":
        return jsonify({"error": "Empty filename."}), 400

    # Save to a temp path
    import tempfile
    suffix = os.path.splitext(file.filename)[1].lower() or ".jpg"
    allowed = {".jpg", ".jpeg", ".png", ".webp"}
    if suffix not in allowed:
        return jsonify({"error": f"Unsupported file type: {suffix}"}), 400

    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp_path = tmp.name
        file.save(tmp_path)

    try:
        logger.info(f"Received image for prediction: {file.filename} (saved to {tmp_path})")

        # ── Color detection (always runs, does not need trained model) ────────
        color_result = color_detector.detect(tmp_path)
        logger.info(f"Color detection: primary={color_result.get('primaryColor')}")

        # ── Category / style classification ───────────────────────────────────
        if predictor is not None:
            cls_result = predictor.predict(tmp_path)
            logger.info(f"ML prediction: category={cls_result.get('category',{}).get('value')}, "
                        f"confidence={cls_result.get('category',{}).get('confidence'):.2f}")
            mode = "trained"
        else:
            # DEMO / FALLBACK MODE — clearly labelled
            cls_result = _demo_prediction()
            logger.warning("DEMO/FALLBACK MODE: returning demo prediction (model not trained)")
            mode = "fallback"

        # ── Style classification (rule-based) ─────────────────────────────────
        from inference.style_engine import classify_style
        style = classify_style(
            category=cls_result.get("category", {}).get("value", "unknown"),
            sub_type=cls_result.get("subType", {}).get("value", ""),
            pattern=cls_result.get("pattern", {}).get("value", "solid"),
            formality=cls_result.get("formality", {}).get("value", "unknown"),
        )

        # ── Merge results ─────────────────────────────────────────────────────
        result = {
            **cls_result,
            "primaryColor":    {"value": color_result["primaryColor"],    "confidence": color_result["colorConfidence"]},
            "secondaryColors": color_result.get("secondaryColors", []),
            "style":           {"value": style["style"],                   "confidence": style["confidence"]},
            "mode":            mode,
        }

        return jsonify(result)

    except Exception as e:
        logger.error(f"Prediction error: {e}", exc_info=True)
        return jsonify({"error": f"Prediction failed: {str(e)}"}), 500
    finally:
        try:
            os.unlink(tmp_path)
        except Exception:
            pass


def _demo_prediction():
    """
    Returns a clearly labelled DEMO prediction.
    Used when the trained model is not available.
    Do NOT use in production — train the model first.
    """
    return {
        "category":   {"value": "tops",   "confidence": 0.0},
        "subType":    {"value": "t-shirt", "confidence": 0.0},
        "pattern":    {"value": "solid",   "confidence": 0.0},
        "formality":  {"value": "casual",  "confidence": 0.0},
        "season":     {"value": "all-year","confidence": 0.0},
        "material":   {"value": "unknown", "confidence": 0.0},
        "needsReview": True,
        "demoMode": True,
        "demoMessage": (
            "DEMO/FALLBACK MODE: AI model not trained yet. "
            "Run 'python training/train.py' to train the model, "
            "then restart the AI engine."
        ),
    }


if __name__ == "__main__":
    port = int(os.environ.get("AI_PORT", 8000))
    debug = os.environ.get("AI_DEBUG", "false").lower() == "true"
    logger.info(f"Starting Alcove AI Engine on port {port}")
    app.run(host="0.0.0.0", port=port, debug=debug)
