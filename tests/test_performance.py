import queue
import time

import numpy as np

from src.analysis.sentiment_analyzer import SentimentAnalyzer
from src.ui.video_processor import VideoProcessor


def test_system_latency_requirement():
    # Requirement 5.3: 1ループの処理レイテンシを2秒以内に収める
    analyzer = SentimentAnalyzer()

    # ダミーフレーム (640x480 RGB)
    frame = np.random.randint(0, 255, (480, 640, 3), dtype=np.uint8)

    # ウォームアップ
    analyzer.analyze_frame(frame)

    # 5回実行して平均を計測 (CPU負荷を考慮して回数を調整)
    iterations = 5
    start_time = time.time()

    for _ in range(iterations):
        result = analyzer.analyze_frame(frame)
        assert isinstance(result, dict)

    total_time = time.time() - start_time
    avg_latency = total_time / iterations

    print(f"\nAverage Latency: {avg_latency:.3f}s")
    assert avg_latency < 2.0, f"Latency requirement failed: {avg_latency:.3f}s >= 2.0s"


def test_video_processor_integration():
    # コンポーネント間のデータ連携を確認
    analyzer = SentimentAnalyzer()
    result_queue = queue.Queue(maxsize=1)
    processor = VideoProcessor(analyzer, result_queue)

    class MockFrame:
        def __init__(self, data):
            self.data = data

        def to_ndarray(self, format=None):
            return self.data

    dummy_img = np.zeros((480, 640, 3), dtype=np.uint8)
    mock_frame = MockFrame(dummy_img)

    processor.recv(mock_frame)

    assert not result_queue.empty()
    result = result_queue.get()
    assert "emotions" in result
    assert "metadata" in result
    assert "processing_time" in result["metadata"]
