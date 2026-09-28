# API Reference Documentation

Base URL: `http://localhost:8000/api`

---

## 1. System Health & Dashboard

### `GET /api/health`
Returns system status, subcomponent latency, and provider modes.

**Response:**
```json
{
  "status": "Healthy",
  "environment": "development",
  "timestamp": "2026-09-28T12:00:00Z",
  "backend": { "status": "Healthy", "latency_ms": 1.2 },
  "database": { "status": "Connected", "latency_ms": 0.8 },
  "hindsight": { "status": "Connected (Demo)", "details": "Hindsight Memory" },
  "llm": { "status": "Connected (Demo)", "details": "Deterministic SRE Agent" },
  "api": { "status": "Healthy" }
}
```

### `GET /api/dashboard/stats`
Returns aggregated metrics for total incidents, active counts, memory counts, and recent telemetry items.

---

## 2. Incidents API

### `POST /api/incidents`
Create a new active incident.

**Request Body:**
```json
{
  "service_id": "payment-api",
  "title": "Payment API database connection timeout",
  "error_message": "database connection timeout in pool",
  "description": "Checkout API throwing 504 timeouts.",
  "environment": "Production",
  "severity": "High",
  "deployment_version": "v2.1.0",
  "deployment_commit": "a4f89d1"
}
```

### `GET /api/incidents`
Query all incidents with optional filtering by `service_id`, `severity`, `status`, or keyword `search`.

### `GET /api/incidents/{id}`
Retrieve incident details, audit timeline events, latest investigation, and resolution data.

### `POST /api/incidents/{id}/investigate?use_memory=true`
Triggers AI incident investigation. Extracts telemetry evidence, queries Hindsight operational memory, evaluates multi-factor similarity, and generates actionable recommendations.

### `POST /api/incidents/{id}/resolve`
Resolves the incident, extracts operational knowledge, and persists the memory record into Hindsight.

**Request Body:**
```json
{
  "root_cause": "Connection pool idle timeout misconfigured in v2.1.0 release.",
  "fix_applied": "Reverted pool parameters to v1.8.2 stable values.",
  "result": "Successfully Resolved",
  "lessons_learned": "Verify configuration before pod restarts; saved 30 minutes.",
  "failed_attempts": "Pod restart alone without fixing config."
}
```

---

## 3. Operational Memory API

### `GET /api/memory/stats`
Returns total memories, incidents remembered, services count, and provider health.

### `GET /api/memory/search?q={query}&service_id={service_id}`
Performs multi-factor semantic search across historical memories with explicit retrieval explanations.

### `POST /api/memory/retain`
Stores custom incident knowledge directly into Hindsight long-term storage.

---

## 4. Postmortems & Demo

### `POST /api/postmortems`
Generates a blameless postmortem for a resolved incident.

### `GET /api/demo/before`
Simulates isolated investigation without operational memory.

### `GET /api/demo/after`
Simulates contextual investigation with Hindsight operational memory.

### `POST /api/demo/reset`
Resets the database and reseeds baseline demo records.
