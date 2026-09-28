def test_root_endpoint(client):
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["product"] == "Incident Memory"
    assert "status" in data

def test_health_endpoint(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ["Healthy", "Degraded"]
    assert "backend" in data
    assert "database" in data
    assert "hindsight" in data
    assert "llm" in data
