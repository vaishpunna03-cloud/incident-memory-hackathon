# Testing Strategy & Acceptance Verification

## Test Architecture

The test suite tests the critical operational memory lifecycle across both isolated unit tests and end-to-end integration tests:

1. **`test_health.py`**:
   - Validates root API metadata and `/api/health` status reporting for all subsystems (backend, db, hindsight, llm).
2. **`test_incidents.py`**:
   - Tests incident creation, status progression, listing, and filtering.
3. **`test_memory.py`**:
   - Tests memory statistics, multi-factor semantic search, relevance scoring breakdown, and memory retention.
4. **`test_demo_flow.py` (The Critical Integration Test)**:
   - Creates Second Incident (INC-104)
   - Triggers AI investigation with memory
   - Verifies INC-071 is recalled with >= 70% relevance
   - Verifies learned avoidance: *pod restarting avoided*
   - Resolves incident and validates knowledge retention into Hindsight
   - Generates automated postmortem
   - Tests `/api/demo/before` and `/api/demo/after` comparison endpoints

---

## Running Backend Tests

```bash
cd backend
python -m pytest -v
```

Expected output:
```
tests/test_demo_flow.py::test_full_incident_memory_demo_lifecycle PASSED
tests/test_demo_flow.py::test_demo_before_after_endpoints PASSED
tests/test_health.py::test_root_endpoint PASSED
tests/test_health.py::test_health_endpoint PASSED
tests/test_incidents.py::test_list_incidents PASSED
tests/test_incidents.py::test_create_and_get_incident PASSED
tests/test_memory.py::test_memory_stats PASSED
tests/test_memory.py::test_memory_search PASSED
tests/test_memory.py::test_memory_retention PASSED
======================= 9 passed in 0.65s =======================
```

---

## Running Frontend Build Validation

```bash
cd frontend
npm run build
```
Ensures all 11 routes compile without TypeScript or bundle errors.
