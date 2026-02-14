import numpy as np
import pytest

from src.analysis.sentiment_analyzer import SentimentAnalyzer


def test_analyzer_initialization():
    # Requirement 3.1: 軽量モデルでの初期化
    analyzer = SentimentAnalyzer(model_type="svm")
    assert analyzer is not None
    assert analyzer.model_type == "svm"


def test_analyze_frame_returns_correct_format():
    # Requirement 3.3: 解析インターフェースの提供
    analyzer = SentimentAnalyzer(model_type="svm")

    # ダミー画像 (RGB, 100x100)
    dummy_frame = np.zeros((100, 100, 3), dtype=np.uint8)

    result = analyzer.analyze_frame(dummy_frame)

    # 期待される感情キーが含まれているか
    expected_emotions = {
        "happy",
        "sad",
        "angry",
        "surprise",
        "fear",
        "disgust",
        "neutral",
    }
    assert isinstance(result, dict)
    assert expected_emotions.issubset(result.keys())

    # 各スコアが 0.0 - 1.0 の範囲内か
    for emotion in expected_emotions:
        assert 0.0 <= result[emotion] <= 1.0


def test_analyzer_handles_empty_frame():
    analyzer = SentimentAnalyzer()
    with pytest.raises(ValueError):
        analyzer.analyze_frame(None)
