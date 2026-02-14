import os
import queue
import time

import cv2
import pandas as pd
import streamlit as st
from streamlit_webrtc import WebRtcMode, webrtc_streamer

from src.analysis.sentiment_analyzer import SentimentAnalyzer
from src.ui.video_processor import VideoProcessor

# ページ設定
st.set_page_config(page_title="Meeting Vibe Checker", layout="wide")

st.markdown(
    """
    <style>
    .stMetric {
        background-color: #ffffff;
        padding: 15px;
        border-radius: 10px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    </style>
    """,
    unsafe_allow_html=True,
)

st.title("🎥 Meeting Vibe Checker")


# 解析エンジンの初期化 (例外処理を追加)
@st.cache_resource
def get_analyzer():
    try:
        return SentimentAnalyzer()
    except Exception as e:
        st.error(
            f"解析エンジンの初期化に失敗しました。サーバー側のネットワークエラー(502)の可能性があります。ページをリロードして再試行してください。 エラー: {e}"
        )
        return None


analyzer = get_analyzer()


@st.cache_resource
def get_result_queue():
    return queue.Queue(maxsize=1)


result_queue = get_result_queue()

# セッション状態の初期化
if "emotion_history" not in st.session_state:
    st.session_state.emotion_history = []

with st.sidebar:
    st.header("Settings")
    source_type = st.radio("解析ソース:", ["Webカメラ", "動画ファイル"])
    if st.button("履歴をクリア"):
        st.session_state.emotion_history = []
        st.rerun()

# 解析エンジンが初期化できていない場合は警告のみ表示
if analyzer is None:
    st.warning(
        "解析エンジンが利用できません。ネットワーク接続を確認し、リロードしてください。"
    )
    st.stop()

col_video, col_stats = st.columns([3, 2])

with col_stats:
    st.subheader("Current Status")
    metric_container = st.empty()
    st.subheader("Emotion Trend")
    chart_container = st.empty()
    latency_container = st.empty()


def update_ui(emotions, proc_time):
    if emotions.get("no_face"):
        with metric_container.container():
            st.warning("⚠️ 顔が検出されていません。カメラの正面に移動してください。")
        return

    display_emotions = {k: v for k, v in emotions.items() if k != "no_face"}
    top_emotion = max(display_emotions, key=display_emotions.get)

    with metric_container.container():
        m1, m2 = st.columns(2)
        m1.metric("現在の雰囲気", top_emotion.capitalize())
        m2.metric("信頼度", f"{display_emotions[top_emotion]:.2f}")
        st.bar_chart(pd.Series(display_emotions))

    timestamp = time.strftime("%H:%M:%S")
    entry = {"timestamp": timestamp}
    entry.update(display_emotions)
    st.session_state.emotion_history.append(entry)
    if len(st.session_state.emotion_history) > 50:
        st.session_state.emotion_history.pop(0)

    with chart_container.container():
        df = pd.DataFrame(st.session_state.emotion_history).set_index("timestamp")
        st.line_chart(df)

    latency_container.caption(f"Latency: {proc_time:.3f}s")


if source_type == "Webカメラ":
    with col_video:
        ctx = webrtc_streamer(
            key="vibe-checker",
            mode=WebRtcMode.SENDRECV,
            video_processor_factory=lambda: VideoProcessor(analyzer, result_queue),
            media_stream_constraints={"video": True, "audio": False},
            async_processing=True,
        )

    if ctx.state.playing:
        while True:
            try:
                result = result_queue.get(timeout=0.1)
                update_ui(result["emotions"], result["metadata"]["processing_time"])
            except queue.Empty:
                if not ctx.state.playing:
                    break
                continue
            except Exception as e:
                st.error(f"UI Update Error: {e}")
                break
    else:
        st.info("Startボタンを押してください。")

else:
    with col_video:
        uploaded_file = st.file_uploader("動画アップロード:", type=["mp4", "mov"])

    if uploaded_file and st.button("動画を解析"):
        import tempfile

        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as tmp:
            tmp.write(uploaded_file.read())
            tmp_path = tmp.name
        cap = cv2.VideoCapture(tmp_path)
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            start = time.time()
            emotions = analyzer.analyze_frame(rgb)
            update_ui(emotions, time.time() - start)
            for _ in range(15):
                cap.grab()
        cap.release()
        os.unlink(tmp_path)
