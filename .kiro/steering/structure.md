# Project Structure

## Organization Philosophy

The project follows a **Feature-first** organization pattern, with a clear separation between UI logic and analysis logic.

## Directory Patterns

### Core Application
**Location**: `src/`  
**Purpose**: Main source code for the application.

### Analysis Logic
**Location**: `src/analysis/`  
**Purpose**: Py-Feat and OpenCV logic for facial expression analysis.

### UI Components
**Location**: `src/ui/`  
**Purpose**: Streamlit-based dashboard and UI elements.

## Naming Conventions

- **Files**: snake_case (e.g., `vibe_checker.py`)
- **Classes**: PascalCase (e.g., `SentimentAnalyzer`)
- **Functions/Variables**: snake_case (e.g., `calculate_sentiment()`)

## Code Organization Principles

- **Privacy First**: Frames are processed in memory and never persisted.
- **Decoupling**: The analysis engine should be independent of the Streamlit UI.

---
_Document patterns, not file trees. New files following patterns shouldn't require updates_
