# Hindsight Operational Memory Design

## 1. What Makes Hindsight Memory Unique for SRE?

Generic vector databases only match raw text strings. If an engineer searches for `"database timeout"`, a standard RAG system may pull irrelevant incidents from other services, obsolete database migrations, or unrelated client timeouts.

**Hindsight Operational Memory** treats operational incident knowledge as a structured semantic abstraction:
1. **Root Cause**: The underlying failure trigger (e.g. configuration parameter mismatch vs hardware failure).
2. **What Worked**: Targeted remediation steps validated by on-call engineers.
3. **What Failed**: Troubleshooting dead-ends and deceptive temporary fixes that wasted time.
4. **Deployment Context**: Version, commit, and environmental context.
5. **Operational Lesson**: High-level engineering takeaway to avoid recurrence.
6. **Runbook Step**: Deterministic query/command to verify status.

---

## 2. Multi-Factor Relevance Scoring (Section 12)

Instead of a single black-box score, Hindsight computes four distinct similarity factors:

$$\text{Relevance} = (0.35 \times S_{\text{service}}) + (0.35 \times S_{\text{error}}) + (0.15 \times S_{\text{deployment}}) + (0.15 \times S_{\text{pattern}})$$

- **Service Match ($S_{\text{service}}$)**: 100% for identical service; 65% for directly dependent upstream/downstream services; 30% otherwise.
- **Error Similarity ($S_{\text{error}}$)**: Jaccard keyword overlap combined with critical failure tokens (`pool`, `timeout`, `exhausted`, `deadlock`, `jwt`, `oom`).
- **Deployment Context ($S_{\text{deployment}}$)**: Evaluation of recent release bumps and configuration change flags.
- **Failure Pattern ($S_{\text{pattern}}$)**: Corroboration of resource saturation, rate limiting, or connection starvation.

### Safety Guarantee:
Scores are explicitly labeled **"Historical Relevance"**, **never** "AI Certainty". The agent is constitutionally restricted from claiming that historical memory proves current root cause.

---

## 3. The Retrieval Reason Feature

For every recalled memory, Hindsight outputs an auditable explanation:
```
"Why this memory was retrieved: Identical service 'payment-api'; shared keywords (pool, timeout, exhausted); 88.0% error signature alignment."
```
This enables human-in-the-loop SRE verification before applying any remediation.
