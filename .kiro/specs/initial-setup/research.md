# Research & Design Decisions

## Summary
- **Feature**: initial-setup
- **Discovery Scope**: New Feature / MVP Foundation
- **Key Findings**:
  - **Py-Feat Real-time Performance**: Py-Feat models (especially SVM/HOG-PCA) can process single images in ~1.5-2s on CPU. To meet the < 2s latency goal for the entire loop, frame skipping and image resizing (e.g., 50% scale) are essential.
  - **Streamlit-WebRTC Integration**: `streamlit-webrtc` is the standard for low-latency video in Streamlit. The `video_frame_callback` runs in a separate thread, requiring thread-safe data structures (e.g., `queue.Queue` or `threading.Lock`) to communicate results to the main UI thread.
  - **Memory & Privacy**: OpenCV frames should be processed in-memory as NumPy arrays. `st.cache_resource` is used for model persistence to avoid initialization overhead on every rerun.

## Research Log

### Py-Feat Model Optimization (2024-2025 Context)
- **Context**: Ensuring the analysis engine meets the 2-second latency requirement (5.3).
- **Sources Consulted**: Py-Feat Documentation, ArXiv:2104.03464, GitHub Issues.
- **Findings**:
  - `Fdetector='hog-pca'` and `AUmodel='svm'` are the fastest configurations.
  - Processing full-resolution HD frames (1080p) is unnecessary for emotion detection and significantly increases latency.
  - **Implications**: The `SentimentAnalyzer` will resize incoming frames to a maximum width of 640px before processing.

### Real-time Video with Streamlit-WebRTC
- **Context**: Streamlit's native components are too slow for "streaming" feedback.
- **Sources Consulted**: `streamlit-webrtc` official documentation, Community examples.
- **Findings**:
  - `video_frame_callback` allows direct access to frames as they arrive.
  - It uses `av.VideoFrame` which can be easily converted to NumPy (`to_ndarray`).
  - **Implications**: We will use `streamlit-webrtc` as the primary interface for camera input.

### Thread Safety in Streamlit
- **Context**: Passing data from the background WebRTC thread to the main Streamlit thread.
- **Sources Consulted**: Streamlit Advanced Docs, `streamlit-webrtc` tutorials.
- **Findings**:
  - Direct calls to `st.write` or `st.metric` inside the callback will fail.
  - **Implications**: Results from `SentimentAnalyzer` will be stored in a thread-safe `queue.Queue` or a class with a `threading.Lock` protected attribute, which the main UI loop will poll.

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| Threaded Callback (Selected) | WebRTC callback + Main UI loop polling | Lowest latency for WebRTC | Complex thread safety | Best for real-time feedback |
| Async/Await | Python `asyncio` based processing | Modern syntax, non-blocking | Streamlit support for async is still maturing | May lead to unexpected state issues |

## Design Decisions

### Decision: Resize frames to 640px before analysis
- **Context**: 1080p/720p frames take too long to process on CPU.
- **Selected Approach**: Downsample frames using `cv2.resize`.
- **Rationale**: Balance between accuracy (landmark detection still works at 640px) and speed.
- **Trade-offs**: Minor loss in detail for distant faces.

### Decision: Use `st.cache_resource` for Py-Feat Detector
- **Context**: Py-Feat models take 5-10 seconds to load.
- **Selected Approach**: Wrap `Detector` initialization in a cached function.
- **Rationale**: Prevents app freezes during user interaction.

## Risks & Mitigations
- **CPU Overload** — Mitigation: Implement a "cooldown" or skip 2/3 frames if the processing queue grows.
- **Browser Compatibility** — Mitigation: `streamlit-webrtc` requires HTTPS (or localhost) for camera access; add a warning for non-secure contexts.
- **Memory Growth** — Mitigation: Ensure the results queue has a `maxsize=1` or `maxsize=10` to drop stale frames.

## References
- [Py-Feat Performance Notes](https://py-feat.org/pages/performance.html)
- [Streamlit-WebRTC Tutorial](https://github.com/whitphx/streamlit-webrtc#video-frame-callback)
- [Thread Safety in Streamlit](https://docs.streamlit.io/library/advanced-features/threading)
