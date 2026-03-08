import base64
import gc
import logging
import numpy as np
import cv2
from deepface import DeepFace

logger = logging.getLogger(__name__)


def analyze_frame(frame_base64: str) -> dict:
    """
    Analyzes a base64 encoded image frame for emotions.
    Strictly follows privacy guidelines: no image data is stored on disk or leaked.
    Frames are processed solely in memory and immediately discarded.
    """
    img_array = None
    try:
        # 1. Base64 decode string, ignoring data URIs if present
        if frame_base64.startswith("data:image"):
            frame_base64 = frame_base64.split(",")[1]

        # Decode directly to NumPy array entirely in memory
        img_bytes = base64.b64decode(frame_base64)
        nparr = np.frombuffer(img_bytes, np.uint8)
        img_array = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img_array is None:
            raise ValueError("Failed to decode image")

        # 2. DeepFace analysis (emotions only)
        result = DeepFace.analyze(
            img_array, actions=["emotion"], enforce_detection=False
        )

        # 3. Extract scores and convert numpy floats to Python floats for JSON serialization
        emotions = {k: float(v) for k, v in result[0]["emotion"].items()}
        dominant = result[0]["dominant_emotion"]
        return {"dominant_emotion": dominant, "scores": emotions}

    except (KeyboardInterrupt, SystemExit):
        raise
    except Exception as e:
        # Return neutral on error (e.g., face not found or unparseable frame)
        logger.warning(f"Frame analysis failed: {type(e).__name__}: {e}")
        return {
            "dominant_emotion": "neutral",
            "scores": {
                "happy": 0.0,
                "sad": 0.0,
                "angry": 0.0,
                "surprised": 0.0,
                "fearful": 0.0,
                "disgusted": 0.0,
                "neutral": 100.0,
            },
        }
    finally:
        # 4. Mandatory memory cleanup to ensure frames never persist
        if img_array is not None:
            del img_array
        gc.collect()
