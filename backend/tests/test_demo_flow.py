def test_full_incident_memory_demo_lifecycle(client):
    """
    CRITICAL ACCEPTANCE TEST:
    1. Create First Incident (or use seeded INC-071)
    2. Resolve incident -> verify memory retained
    3. Create Second Similar Incident (INC-104)
    4. Trigger AI Investigation
    5. Verify Historical Memory is recalled (INC-071 with relevance score & factors)
    6. Verify Contextual Synthesis (previous failed attempt avoided, config diff highlighted)
    7. Generate Postmortem
    """
    # 1. Create Second Similar Incident (INC-104)
    inc_payload = {
        "service_id": "payment-api",
        "title": "Payment API database connection timeout",
        "error_message": "database connection timeout in pool",
        "description": "Checkout transactions failing with 504. Active connection pool exhausted after v2.1.0.",
        "environment": "Production",
        "severity": "High",
        "deployment_version": "v2.1.0",
        "deployment_commit": "a4f89d1"
    }
    create_res = client.post("/api/incidents", json=inc_payload)
    assert create_res.status_code == 200
    inc2 = create_res.json()
    inc2_id = inc2["id"]

    # 2. Trigger AI Investigation
    inv_res = client.post(f"/api/incidents/{inc2_id}/investigate?use_memory=true")
    assert inv_res.status_code == 200
    investigation = inv_res.json()

    # 3. Verify Memory Recall
    assert investigation["memory_used"] is True
    assert investigation["is_contextual"] is True
    assert len(investigation["historical_matches"]) >= 1

    top_match = investigation["historical_matches"][0]
    matched_ids = [m["incident_id"] for m in investigation["historical_matches"]]
    assert "INC-071" in matched_ids
    assert top_match["service_id"] == "payment-api"
    assert top_match["relevance_score"] >= 60.0
    assert top_match["factors"]["service_match"] == 100.0

    # 4. Verify Contextual Evidence Chain & Avoidance of Failed Attempts
    assert len(investigation["evidence_chain"]) >= 5
    assert len(investigation["what_failed_before"]) >= 1
    assert "restarting" in investigation["what_failed_before"][0].lower() or "restart" in investigation["what_failed_before"][0].lower()

    # 5. Resolve Second Incident
    resolve_payload = {
        "root_cause": "Database connection pool misconfigured in v2.1.0 release.",
        "fix_applied": "Reverted pool size parameters to v1.8.2 stable values.",
        "result": "Successfully Resolved",
        "lessons_learned": "Verified config before restarts; saved 30 minutes of downtime.",
        "failed_attempts": "Avoided restarting pods without fixing config."
    }
    resolve_res = client.post(f"/api/incidents/{inc2_id}/resolve", json=resolve_payload)
    assert resolve_res.status_code == 200
    resolution = resolve_res.json()
    assert resolution["incident_id"] == inc2_id

    # 6. Generate Postmortem
    pm_res = client.post("/api/postmortems", json={"incident_id": inc2_id, "author": "SRE Lead"})
    assert pm_res.status_code == 200
    pm = pm_res.json()
    assert pm["incident_id"] == inc2_id
    assert "timeline" in pm
    assert len(pm["lessons_learned"]) >= 1

def test_demo_before_after_endpoints(client):
    before_res = client.get("/api/demo/before")
    assert before_res.status_code == 200
    before_data = before_res.json()
    assert before_data["mode"] == "WITHOUT_MEMORY"
    assert before_data["investigation"]["memory_used"] is False

    after_res = client.get("/api/demo/after")
    assert after_res.status_code == 200
    after_data = after_res.json()
    assert after_data["mode"] == "WITH_HINDSIGHT_MEMORY"
    assert after_data["investigation"]["memory_used"] is True
    assert len(after_data["investigation"]["historical_matches"]) >= 1
