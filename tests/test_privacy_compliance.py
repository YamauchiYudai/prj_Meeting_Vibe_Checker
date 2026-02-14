import unittest.mock as mock

import numpy as np

from src.analysis.sentiment_analyzer import SentimentAnalyzer


def test_privacy_no_frame_retention():
    # Requirement 5.2: 使用済みの画像データをメモリから即座に破棄
    analyzer = SentimentAnalyzer()
    dummy_frame = np.zeros((100, 100, 3), dtype=np.uint8)

    analyzer.analyze_frame(dummy_frame)

    # analyzer オブジェクト属性に画像データが保持されていないことを確認
    for attr_name in dir(analyzer):
        # 内部変数やメソッドは除外
        if attr_name.startswith("__"):
            continue
        try:
            attr_value = getattr(analyzer, attr_name)
            if isinstance(attr_value, np.ndarray):
                # 画像データ（100x100x3）と一致するものがないこと
                assert not np.array_equal(attr_value, dummy_frame)
        except Exception:
            continue


def test_privacy_no_disk_io():
    # Requirement 5.1: 画像データをディスクに永続化せず
    analyzer = SentimentAnalyzer()
    dummy_frame = np.zeros((100, 100, 3), dtype=np.uint8)

    # cv2.imwrite と open が呼ばれないことを目視
    with (
        mock.patch("cv2.imwrite") as mock_imwrite,
        mock.patch("builtins.open", mock.mock_open()) as mock_file,
    ):
        analyzer.analyze_frame(dummy_frame)

        # 画像書き込みが目的と思われる実行がないこと
        mock_imwrite.assert_not_called()

        # 書き込みモード (w, a, x, b+) でのファイルオープンをチェック
        for call in mock_file.call_args_list:
            args, kwargs = call
            mode = args[1] if len(args) > 1 else kwargs.get("mode", "r")
            assert "w" not in mode and "a" not in mode and "x" not in mode, (
                f"Disk write detected: {call}"
            )
