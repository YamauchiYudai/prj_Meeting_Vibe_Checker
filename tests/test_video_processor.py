import queue
from unittest.mock import MagicMock

import numpy as np

from src.ui.video_processor import VideoProcessor


def test_video_processor_initialization():
    analyzer_mock = MagicMock()
    result_queue = queue.Queue()
    processor = VideoProcessor(analyzer_mock, result_queue)

    assert processor.analyzer == analyzer_mock
    assert processor.result_queue == result_queue


def test_video_processor_recv_calls_analyzer():
    # analyzer のモック作成
    analyzer_mock = MagicMock()
    analyzer_mock.analyze_frame.return_value = {"happy": 0.9, "neutral": 0.1}

    result_queue = queue.Queue()
    processor = VideoProcessor(analyzer_mock, result_queue)

    # 繝繝溘繝輔Ξ繝ｼ繝 (av.VideoFrame 繧堤黄蛟溘☆繧九◆繧√↓ NumPy 驟榊繧貞ｿｦ√→縺吶ｋ)
    # 螳滄囖縺ｮ recv 縺ｯ av.VideoFrame 繧貞女縺大叙繧九′縺薙％縺ｧ縺ｯ蜀驛ｨ繝ｭ繧ｸ繝け繧堤岼隕
    dummy_frame_data = np.zeros((100, 100, 3), dtype=np.uint8)

    # recv 縺ｮ蜀驛ｨ縺ｧ蜻ｼ縺ｰ繧後ｋ縺ｯ縺壹逕ｻ蜒丞逅繧ｷ繝溘Η繝ｬ繝ｼ繝
    # (蠖捺囖縺ｮ実装縺ｧ recv 繧定ｪｿ縺ｹ繧九◆繧√€√◎縺ｮ莉募錐繧堤岼隕)
    processor._process_frame(dummy_frame_data)

    # analyzer 縺悟大縺ｰ繧後◆縺九€√く繝･繝ｼ縺ｫ邨先棡縺悟縺｣縺溘°繧堤｢ｺ隱
    analyzer_mock.analyze_frame.assert_called_once()
    assert not result_queue.empty()
    result = result_queue.get()
    assert result["emotions"]["happy"] == 0.9
