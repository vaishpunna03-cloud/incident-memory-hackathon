def test_list_incidents(client):
    res = client.get("/api/incidents")
    assert res.status_code == 200
    incidents = res.json()
    assert isinstance(incidents, list)
    assert len(incidents) >= 1
    inc_ids = [i["id"] for i in incidents]
    assert "INC-071" in inc_ids

def test_create_and_get_incident(client):
    payload = {
        "service_id": "payment-api",
        "title": "Test Payment Gateway Degradation",
        "error_message": "Redis connection pool timeout on checkout",
        "description": "Integration test incident description",
        "environment": "Staging",
        "severity": "Medium",
        "deployment_version": "v2.0.1",
        "deployment_commit": "e81aa12"
    }
    res = client.post("/api/incidents", json=payload)
    assert res.status_code == 200
    created = res.json()
    assert created["id"].startswith("INC-")
    assert created["service_id"] == "payment-api"
    assert created["status"] == "active"

    # Fetch it
    get_res = client.get(f"/api/incidents/{created['id']}")
    assert get_res.status_code == 200
    assert get_res.json()["id"] == created["id"]
