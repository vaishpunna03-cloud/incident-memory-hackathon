def test_memory_stats(client):
    res = client.get("/api/memory/stats")
    assert res.status_code == 200
    stats = res.json()
    assert stats["total_memories"] >= 1
    assert stats["incidents_remembered"] >= 1
    assert "provider_name" in stats

def test_memory_search(client):
    res = client.get("/api/memory/search?q=connection pool exhausted&service_id=payment-api")
    assert res.status_code == 200
    matches = res.json()
    assert isinstance(matches, list)
    assert len(matches) >= 1
    top = matches[0]
    assert "INC-071" in top["incident_id"] or top["service_id"] == "payment-api"
    assert top["relevance_score"] > 40.0
    assert "retrieval_reason" in top
    assert top["factors"]["service_match"] == 100.0

def test_memory_retention(client):
    payload = {
        "incident_id": "INC-TEST-999",
        "service_id": "auth-service",
        "title": "OAuth Token Expiration Bug",
        "original_error": "Token expired prematurely due to clock skew",
        "root_cause": "NTP synchronization failure across worker nodes",
        "successful_fix": "Resynced chrony NTP daemon and added 30s leeway",
        "failed_attempt": "Regenerating client secrets",
        "deployment_context": "v1.2.0",
        "lesson_learned": "Always configure JWT verification clock skew tolerance",
        "runbook_step": "systemctl restart chronyd",
        "tags": ["auth", "ntp", "clock-skew"]
    }
    res = client.post("/api/memory/retain", json=payload)
    assert res.status_code == 200
    ret = res.json()
    assert ret["id"] == "MEM-TEST-999"
    assert ret["service_id"] == "auth-service"
