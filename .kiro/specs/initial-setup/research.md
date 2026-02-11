# Research & Design Decisions

## Summary
- **Feature**: initial-setup
- **Discovery Scope**: New Feature / MVP Foundation
- **Key Findings**:
  - **Py-Feat Models**: SVM and Random Forest (RF) are the recommended lightweight "shallow learning" models. While less accurate than deep learning models in "in-the-wild" scenarios, they are significantly more performant and suitable for real-time applications with low latency requirements.
  - **Real-time Streamlit**: `streamlit-webrtc` is the industry standard for real-time webcam processing in Streamlit. It uses WebRTC for low-latency client-server communication and operates in a separate thread from the main Streamlit UI thread.
  - **Privacy & Memory**: Memory accumulation in Streamlit can be managed using `st.cache_data` with a short `ttl` (Time-To-Live) and ensuring no frames are persisted to disk. `opencv-python-headless` is preferred for server environments.

## Research Log

### Py-Feat Model Selection
- **Context**: Need for lightweight facial expression analysis to meet the < 2s latency goal.
- **Sources Consulted**: Py-Feat documentation, academic benchmarks (DISFA+ dataset).
- **Findings**: SVM models within Py-Feat perform well for Action Unit (AU) detection and are robust against head pose variations. RF is also a viable statistical learning option.
- **Implications**: We will implement the `Fdetector='hog-pca'`, `AUmodel='svm'`, and `Emotionmodel='svm'` configurations in Py-Feat as the default baseline.

### Streamlit Real-time Video
- **Context**: Streamlit's native `st.camera_input` is for static photos, not streams.
- **Sources Consulted**: Streamlit community forums, `streamlit-webrtc` documentation.
- **Findings**: `streamlit-webrtc`'s `video_frame_callback` is the most efficient way to process frames. It allows NumPy conversion for OpenCV/Py-Feat processing.
- **Implications**: The architecture will rely on `streamlit-webrtc`. A dedicated `VideoProcessor` class will handle the Py-Feat inference loop.

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| Threaded Callback (Selected) | `streamlit-webrtc` callback for processing, main thread for dashboard | Low latency, decoupled UI | Thread safety requires careful state management | Aligns with performance & structure guidelines |
| Producer-Consumer (Queue) | Main thread captures, background worker processes via queue | Clearer separation of concerns | Increased latency due to queue overhead | Potentially overkill for MVP |

## Design Decisions

### Decision: Use `streamlit-webrtc` for Frame Capture
- **Context**: Real-time processing requires a continuous stream, which standard Streamlit doesn't provide natively.
- **Selected Approach**: Use `streamlit-webrtc` with a `video_frame_callback`.
- **Rationale**: Best-in-class performance and supports deployment (client-side camera access).
- **Trade-offs**: Adds a complex external dependency and requires handling multi-threading.

### Decision: Py-Feat SVM/HOG Configuration
- **Context**: Performance requirement (6.1).
- **Selected Approach**: Initialize Py-Feat with HOG-based SVM models.
- **Rationale**: Minimal CPU usage compared to deep learning models like ResNet.
- **Trade-offs**: Slightly lower accuracy for complex facial expressions.

## Risks & Mitigations
- **Memory Leaks** — Use `st.cache_resource` for Py-Feat model loading and avoid storing large arrays in `st.session_state`.
- **Latency Spikes** — Implement frame skipping or downsampling (resize) if Py-Feat processing exceeds the budget.
- **Thread Safety** — Use a thread-safe queue or shared object (with Locks if needed) to pass analysis results from the callback thread to the UI thread.

## References
- [Py-Feat Official Docs](https://py-feat.org/) — Feature extraction and model details.
- [streamlit-webrtc GitHub](https://github.com/whitphx/streamlit-webrtc) — Real-time component reference.
- [Streamlit Performance Guide](https://docs.streamlit.io/library/advanced-features/caching) — Caching and memory management.
