# Technology Stack

## Architecture

- **Real-time Dashboard**: Streamlit-based web UI.
- **Analysis Pipeline**: OpenCV for frame capture and Py-Feat for facial expression analysis.

## Core Technologies

- **Language**: Python 3.9+
- **Framework**: Streamlit
- **AI/CV Library**: Py-Feat, OpenCV
- **Data Handling**: Pandas, NumPy

## Key Libraries

- **Py-Feat**: For facial expression analysis (FEX) and sentiment detection.
- **OpenCV**: For camera access and image pre-processing.

## Development Standards

### Performance
- Target latency: < 2 seconds per processing loop.
- Model selection: Prefer lightweight models (SVM/RF) to minimize CPU/RAM usage.

### Privacy First
- Local-only processing.
- No storage of raw images or frames. immediate memory release after analysis.

## Development Environment

### Required Tools
- Python 3.9+
- Pip / Venv

### Common Commands
```bash
# Dev: streamlit run src/app.py
# Test: pytest
```

## Key Technical Decisions

- **Initial Setup**: Using Kiro-style Spec Driven Development to guide implementation.

---
_Document standards and patterns, not every dependency_
