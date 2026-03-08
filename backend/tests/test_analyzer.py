import pytest
import base64
import numpy as np
import cv2
import gc
from app.services.analyzer import analyze_frame

def test_analyze_frame_success():
    img = np.zeros((100, 100, 3), dtype=np.uint8)
    _, buffer = cv2.imencode('.jpg', img)
    b64_str = base64.b64encode(buffer).decode('utf-8')
    
    result = analyze_frame(b64_str)
    
    assert "dominant_emotion" in result
    assert "scores" in result
    assert "happy" in result["scores"]

def test_analyze_frame_invalid_base64():
    result = analyze_frame("invalid_base64_string")
    assert result["dominant_emotion"] == "neutral"
    assert result["scores"]["neutral"] == 100.0

def test_memory_cleanup():
    gc.collect()
    start_objs = len(gc.get_objects())
    
    img = np.zeros((100, 100, 3), dtype=np.uint8)
    _, buffer = cv2.imencode('.jpg', img)
    b64_str = base64.b64encode(buffer).decode('utf-8')
    
    analyze_frame(b64_str)
    
    gc.collect()
    end_objs = len(gc.get_objects())
    assert abs(start_objs - end_objs) < 100
