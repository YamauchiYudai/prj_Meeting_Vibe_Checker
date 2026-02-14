import logging
import time
from typing import Dict

import numpy as np
from feat import Detector

# ログ設定
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class SentimentAnalyzer:
    """
    表情解析エンジンクラス。
    """

    DEFAULT_EMOTIONS = {
        "happy": 0.0,
        "sad": 0.0,
        "angry": 0.0,
        "surprise": 0.0,
        "fear": 0.0,
        "disgust": 0.0,
        "neutral": 1.0,
    }

    def __init__(self, model_type: str = "svm"):
        self.model_type = model_type
        # 502エラー対策：リトライロジック
        max_retries = 3
        for attempt in range(max_retries):
            try:
                # 安定したモデル構成
                self.detector = Detector(
                    face_model="faceboxes",
                    landmark_model="mobilefacenet",
                    au_model="svm",
                    emotion_model="svm",
                )
                logger.info("Py-Feat Detector initialized.")
                break
            except Exception as e:
                if attempt < max_retries - 1:
                    logger.warning(
                        f"Initialization attempt {attempt + 1} failed. Retrying in 5s... Error: {e}"
                    )
                    time.sleep(5)
                else:
                    logger.error("Failed to load Py-Feat models.")
                    raise RuntimeError(f"Initialization failed: {e}")

    def analyze_frame(self, frame: np.ndarray) -> Dict[str, float]:
        if frame is None:
            return self.DEFAULT_EMOTIONS.copy()

        try:
            # AttributeError: 'numpy.ndarray' has no attribute 'read' 対策：
            # detect_image([frame]) のようにリストで渡すと、内部で ImageDataset が作成される際、
            # 要素が ndarray であることを検知して read() を呼ばずに処理されます。
            detections = self.detector.detect_image([frame])

            if detections is not None and not detections.empty:
                # 感情スコアが含まれるカラムを取得
                # モデルによって happiness または happy になるため動的に取得
                if hasattr(detections, "emotions") and not detections.emotions.empty:
                    emo_values = detections.emotions.iloc[0]

                    return {
                        "happy": float(
                            emo_values.get("happiness", emo_values.get("happy", 0.0))
                        ),
                        "sad": float(
                            emo_values.get("sadness", emo_values.get("sad", 0.0))
                        ),
                        "angry": float(
                            emo_values.get("anger", emo_values.get("angry", 0.0))
                        ),
                        "surprise": float(emo_values.get("surprise", 0.0)),
                        "fear": float(emo_values.get("fear", 0.0)),
                        "disgust": float(emo_values.get("disgust", 0.0)),
                        "neutral": float(emo_values.get("neutral", 0.0)),
                    }
            else:
                # 顔が検出されなかった場合
                return {
                    "no_face": 1.0,
                    "neutral": 0.0,
                    "happy": 0.0,
                    "sad": 0.0,
                    "angry": 0.0,
                    "surprise": 0.0,
                    "fear": 0.0,
                    "disgust": 0.0,
                }

        except Exception as e:
            # ログが多すぎると重くなるため、エラー時は1回だけ詳細を出力
            logger.debug(f"Analysis error: {e}")

        return self.DEFAULT_EMOTIONS.copy()
