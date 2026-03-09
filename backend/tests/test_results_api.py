import pytest
import base64
import numpy as np
import cv2


@pytest.mark.asyncio
async def test_analyze_and_get_results(client):
    # 1. Create session
    create_resp = await client.post("/api/sessions", json={"title": "Result Test"})
    s_id = create_resp.json()["id"]

    # 2. Analyze frame
    img = np.zeros((100, 100, 3), dtype=np.uint8)
    _, buffer = cv2.imencode(".jpg", img)
    b64_str = base64.b64encode(buffer).decode("utf-8")

    analyze_resp = await client.post(
        f"/api/sessions/{s_id}/analyze", json={"frame": b64_str}
    )
    assert analyze_resp.status_code == 200
    assert "scores" in analyze_resp.json()

    # 3. Get results
    results_resp = await client.get(f"/api/sessions/{s_id}/results")
    assert results_resp.status_code == 200
    data = results_resp.json()
    assert data["session_id"] == s_id
    assert len(data["records"]) == 1
    assert "dominant_emotion" in data["records"][0]

    # Formulate check that privacy constraint is maintained
    record = data["records"][0]
    assert "image" not in record
    assert "frame" not in record
    assert "photo" not in record
