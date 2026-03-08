import pytest

@pytest.mark.asyncio
async def test_create_session(client):
    response = await client.post("/api/sessions", json={"title": "Test Meeting"})
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Test Meeting"
    assert "id" in data
    assert data["status"] == "active"

@pytest.mark.asyncio
async def test_list_sessions(client):
    await client.post("/api/sessions", json={"title": "Meeting 1"})
    await client.post("/api/sessions", json={"title": "Meeting 2"})
    
    response = await client.get("/api/sessions")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 2
    assert "record_count" in data[0]

@pytest.mark.asyncio
async def test_get_session(client):
    create_resp = await client.post("/api/sessions", json={"title": "Get Me"})
    s_id = create_resp.json()["id"]
    
    response = await client.get(f"/api/sessions/{s_id}")
    assert response.status_code == 200
    assert response.json()["title"] == "Get Me"
    assert response.json()["status"] == "active"

@pytest.mark.asyncio
async def test_end_session(client):
    create_resp = await client.post("/api/sessions", json={"title": "End Me"})
    s_id = create_resp.json()["id"]
    
    response = await client.patch(f"/api/sessions/{s_id}/end")
    assert response.status_code == 200
    assert response.json()["status"] == "ended"
