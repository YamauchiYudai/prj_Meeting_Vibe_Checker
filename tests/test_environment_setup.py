import os
import sys


def test_python_version():
    # Requirement 1.1: Python 3.9+
    assert sys.version_info >= (3, 9)


def test_requirements_file_exists():
    # Requirement 1.2: requirements.txt shall exist
    assert os.path.exists("requirements.txt")


def test_required_packages_in_requirements():
    # Requirement 1.2: Check for Streamlit, Py-Feat, OpenCV, Pandas, NumPy, streamlit-webrtc
    required = {
        "streamlit",
        "py-feat",
        "opencv-python",
        "pandas",
        "numpy",
        "streamlit-webrtc",
    }
    with open("requirements.txt", "r") as f:
        content = f.read().lower()
        for pkg in required:
            assert pkg in content, f"{pkg} is missing from requirements.txt"
