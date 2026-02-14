import queue
import time

import numpy as np

from src.analysis.sentiment_analyzer import SentimentAnalyzer

try:
    from streamlit_webrtc import VideoProcessorBase
except ImportError:
    # 繝繧ｹ繝育腸蠅(WebRTC縺悟縺｣縺ｦ縺↑縺ｴ蜷)縺ｮ縺溘ａ縺ｮ繝輔か繝ｼ繝ｫ繝舌ャ繧
    class VideoProcessorBase:
        pass


class VideoProcessor(VideoProcessorBase):
    """
    streamlit-webrtc 縺ｮ縺溘ａ縺ｮ繝薙ョ繧ｪ繝励Ο繧ｻ繝繧ｵ縲
    WebRTC 繧ｹ繝医Μ繝ｼ繝縺九ｉ繝輔Ξ繝ｼ繝繧貞女縺大叙繧翫€∬｡ｨ諠隗｣譫舌ｒ螳溯｡後＠縺ｾ縺吶€
    """

    def __init__(self, analyzer: SentimentAnalyzer, result_queue: queue.Queue):
        self.analyzer = analyzer
        self.result_queue = result_queue

    def recv(self, frame):
        """
        WebRTC 繧ｹ繝医Μ繝ｼ繝縺九ｉ繝輔Ξ繝ｼ繝繧貞女縺大叙縺｣縺櫯囖縺ｫ蜻ｼ縺ｰ繧後ｋ縲
        """
        img = frame.to_ndarray(format="rgb24")

        self._process_frame(img)

        # 繧ｪ繝ｪ繧ｸ繝翫Ν縺ｮ繝輔Ξ繝ｼ繝繧偵◎縺ｮ縺ｾ縺ｾ霑斐☆ (UI荳翫〒縺ｮ繝悶Λ繧ｦ繧ｶ陦ｨ遉ｺ逕 )
        return frame

    def _process_frame(self, img: np.ndarray):
        """
        NumPy驟榊繧偵い繝翫Λ繧､繧ｶ繝ｼ縺ｫ貂｡縺励€∫ｵ先棡繧偵く繝･繝ｼ縺ｫ譬ｼ邏阪☆繧九€
        """
        start_time = time.time()

        # 表情解析の実行
        emotions = self.analyzer.analyze_frame(img)

        processing_time = time.time() - start_time

        # 解析結果の作成 (DTO)
        result = {
            "timestamp": time.time(),
            "emotions": emotions,
            "metadata": {"processing_time": processing_time},
        }

        # キューが一杯の場合は古いものを破棄して最新を入れる (Requirement 5.2)
        if self.result_queue.full():
            try:
                self.result_queue.get_nowait()
            except queue.Empty:
                pass

        self.result_queue.put(result)
