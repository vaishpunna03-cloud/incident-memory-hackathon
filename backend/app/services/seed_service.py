from datetime import timedelta
from sqlalchemy.orm import Session
from app.models.service import Service
from app.models.incident import Incident, IncidentEvent, IncidentInvestigation, Resolution
from app.models.memory import MemoryRecord
from app.models.postmortem import Postmortem
from app.utils import now_utc

def seed_database(db: Session):
    # Check if already seeded
    if db.query(Service).count() > 0:
        return

    now = now_utc()

    # 1. Services
    services_data = [
        {
            "id": "payment-api",
            "name": "Payment Gateway API",
            "description": "Core payment processing, ledger transactions, checkout gateway integration",
            "tier": "Tier-1",
            "dependencies": ["database", "auth-service"],
            "status": "operational",
            "created_at": now - timedelta(days=90)
        },
        {
            "id": "auth-service",
            "name": "Authentication & Identity",
            "description": "OAuth2 / OIDC token issuance, role-based access control, session validation",
            "tier": "Tier-1",
            "dependencies": ["database"],
            "status": "operational",
            "created_at": now - timedelta(days=90)
        },
        {
            "id": "order-service",
            "name": "Order Management Service",
            "description": "Order placement, inventory reservation, cart orchestration",
            "tier": "Tier-1",
            "dependencies": ["payment-api", "auth-service", "database"],
            "status": "operational",
            "created_at": now - timedelta(days=90)
        },
        {
            "id": "notification-service",
            "name": "Notification Dispatcher",
            "description": "Transactional emails, SMS dispatch, Webhook notifications, Push events",
            "tier": "Tier-2",
            "dependencies": ["order-service", "auth-service"],
            "status": "operational",
            "created_at": now - timedelta(days=90)
        }
    ]

    for s in services_data:
        db.add(Service(**s))
    db.commit()

    # 2. Historical Incident 1: INC-071 (The Critical Demo Baseline)
    inc_071_created = now - timedelta(days=14)
    inc_071_resolved = now - timedelta(days=14, hours=-1, minutes=-25)

    inc_071 = Incident(
        id="INC-071",
        service_id="payment-api",
        title="Payment API database connection pool exhausted",
        error_message="database connection pool exhausted (max pool size reached: 20/20)",
        description="Checkout checkout attempts failing with 500 status codes. Database connections spiked immediately following deployment v1.8.2.",
        environment="Production",
        severity="Critical",
        status="resolved",
        deployment_version="v1.8.2",
        deployment_commit="89acb42",
        incident_timestamp=inc_071_created,
        created_at=inc_071_created,
        resolved_at=inc_071_resolved
    )
    db.add(inc_071)
    db.commit()

    res_071 = Resolution(
        id="RES-071",
        incident_id="INC-071",
        root_cause="Connection-pool configuration change reduced max_idle and pool size under peak load.",
        fix_applied="Reverted configuration parameters to baseline and deployed corrected settings.",
        result="Successfully Resolved",
        lessons_learned="Check configuration changes before increasing pool size. Restarting pods alone without fixing config causes immediate recurrence.",
        failed_attempts="Restarting the service alone only temporarily cleared active connections before re-exhausting within 3 minutes.",
        resolved_by="SRE On-Call Lead",
        created_at=inc_071_resolved
    )
    db.add(res_071)

    mem_071 = MemoryRecord(
        id="MEM-071",
        incident_id="INC-071",
        service_id="payment-api",
        title="Payment API DB Connection Exhaustion Post v1.8.2",
        original_error="database connection pool exhausted",
        root_cause="Connection-pool configuration change in release v1.8.2 misconfigured idle connection recycling.",
        successful_fix="Reverted configuration parameters and deployed corrected connection pool setting.",
        failed_attempt="Restarting the service alone without changing configuration.",
        deployment_context="v1.8.2 configuration change",
        lesson_learned="Check configuration changes before increasing pool size; naive restarts fail.",
        runbook_step="SELECT count(*), state FROM pg_stat_activity WHERE application_name='payment-api' GROUP BY state;",
        tags=["database", "pool", "timeout", "payment-api", "config"],
        source="retained",
        created_at=inc_071_resolved
    )
    db.add(mem_071)

    # 3. Seed additional 24 historical incidents and operational memories across all services
    historical_seed_data = [
        {
            "id": "INC-012",
            "service_id": "auth-service",
            "title": "JWT signing key rotation signature verification failure",
            "error": "crypto/rsa: verification error: invalid public key thumbprint",
            "desc": "Auth token validations failing across services following automated key rotation.",
            "version": "v1.4.0",
            "commit": "31fe82a",
            "days_ago": 60,
            "root_cause": "Public key cache TTL in auth-service was 24 hours while private key was rotated immediately.",
            "fix": "Flushed distributed Redis key cache and deployed hotfix with 5-minute cache grace period.",
            "failed_attempt": "Rolling back the auth-service container without purging Redis cache.",
            "lesson": "Always implement dual-key overlap windows during cryptographic rotation.",
            "runbook": "redis-cli -h auth-cache DEL 'jwks:active_keys'",
            "tags": ["auth", "jwt", "crypto", "cache"]
        },
        {
            "id": "INC-018",
            "service_id": "order-service",
            "title": "Order queue worker thread starvation under checkout spike",
            "error": "ThreadPoolExecutor exhausted: Active threads 128/128, rejected execution",
            "desc": "Orders stalled during promotional flash sale. Workers unable to enqueue new tasks.",
            "version": "v1.5.1",
            "commit": "c482091",
            "days_ago": 52,
            "root_cause": "Synchronous HTTP calls to payment-api blocked worker threads during slow queries.",
            "fix": "Configured circuit breaker and switched payment requests to asynchronous non-blocking futures with 2s timeout.",
            "failed_attempt": "Doubling thread pool size from 128 to 256 which caused node memory exhaustion.",
            "lesson": "Never make unbuffered synchronous network calls inside bounded worker pools.",
            "runbook": "Inspect thread dump via jstack or py-spy dump",
            "tags": ["threads", "queue", "timeout", "circuit-breaker"]
        },
        {
            "id": "INC-025",
            "service_id": "notification-service",
            "title": "SendGrid API rate limit exceeded during batch email dispatch",
            "error": "HTTP 429 Too Many Requests: Rate limit exceeded on /v3/mail/send",
            "desc": "Order confirmation emails queued up and delayed by over 45 minutes.",
            "version": "v1.1.0",
            "commit": "90ba41c",
            "days_ago": 45,
            "root_cause": "Batch email job dispatched 25,000 notifications concurrently without rate throttling.",
            "fix": "Introduced token bucket rate limiter capped at 600 requests/minute with exponential backoff.",
            "failed_attempt": "Retrying failed 429 requests immediately which worsened the rate limit penalty.",
            "lesson": "External provider webhooks and APIs must be guarded by token-bucket rate limits.",
            "runbook": "Check rate limiter gauge: notification_dispatcher_rate_current",
            "tags": ["rate-limit", "email", "http-429", "backoff"]
        },
        {
            "id": "INC-033",
            "service_id": "payment-api",
            "title": "Stripe webhook idempotency key collision",
            "error": "Database UniqueViolation on payment_events_idempotency_key_idx",
            "desc": "Duplicate payment webhooks caused intermittent transaction failures.",
            "version": "v1.6.4",
            "commit": "67da89f",
            "days_ago": 38,
            "root_cause": "Webhook retry handler did not catch database conflict errors gracefully.",
            "fix": "Updated idempotency handler to treat duplicate key as a 200 OK no-op response.",
            "failed_attempt": "Deleting the database unique constraint.",
            "lesson": "Idempotent endpoints must treat duplicate collisions as successful acknowledgments.",
            "runbook": "Inspect table idempotency_records where status = 'processing'",
            "tags": ["idempotency", "database", "stripe", "webhooks"]
        },
        {
            "id": "INC-042",
            "service_id": "auth-service",
            "title": "Redis session store replica read timeout",
            "error": "Redis::TimeoutError: Connection timed out to replica redis-ro-01.internal",
            "desc": "Login sessions timing out intermittently for 15% of inbound users.",
            "version": "v1.7.0",
            "commit": "88ef11c",
            "days_ago": 30,
            "root_cause": "Network partition between AWS us-east-1a and us-east-1b degraded Redis replica ping.",
            "fix": "Switched auth-service to primary Redis node and reduced socket timeout to 500ms.",
            "failed_attempt": "Restarting the auth-service pods repeatedly.",
            "lesson": "Session stores should failover automatically to primary on replica ping timeout.",
            "runbook": "redis-cli -h redis-cluster cluster info",
            "tags": ["redis", "session", "timeout", "replica"]
        },
        {
            "id": "INC-055",
            "service_id": "order-service",
            "title": "PostgreSQL deadlock during high-concurrency cart checkout",
            "error": "ERROR: deadlock detected - Process 23141 waits for ExclusiveLock on relation inventory_items",
            "desc": "Deadlock errors thrown during checkout of high-demand product drops.",
            "version": "v1.8.0",
            "commit": "d98213b",
            "days_ago": 22,
            "root_cause": "Inventory items were locked in arbitrary ordering across multiple concurrent checkout transactions.",
            "fix": "Enforced strictly deterministic sort order (by item_id ASC) before acquiring row locks.",
            "failed_attempt": "Increasing postgres deadlock_timeout setting.",
            "lesson": "Multi-resource locks must always be acquired in sorted deterministic order.",
            "runbook": "SELECT blocked_locks.pid AS blocked_pid, blocking_locks.pid AS blocking_pid FROM pg_catalog.pg_locks blocked_locks ...",
            "tags": ["deadlock", "postgres", "lock", "inventory"]
        },
        {
            "id": "INC-062",
            "service_id": "payment-api",
            "title": "TLS certificate expiry on internal mTLS payment proxy",
            "error": "SSL: CERTIFICATE_VERIFY_FAILED: certificate has expired",
            "desc": "Payment proxy rejected inter-service mTLS communication.",
            "version": "v1.8.1",
            "commit": "ab2144a",
            "days_ago": 18,
            "root_cause": "Cert-manager auto-renewal cron failed due to DNS challenge token expiration.",
            "fix": "Manually renewed TLS certificate bundle and rotated proxy secrets.",
            "failed_attempt": "Disabling TLS verification in application code in production.",
            "lesson": "Cert-manager must have automated Prometheus alerts at 30, 14, and 7 days prior to expiry.",
            "runbook": "kubectl get certificates -n ingress-tls",
            "tags": ["tls", "certificate", "ssl", "security"]
        },
        {
            "id": "INC-088",
            "service_id": "notification-service",
            "title": "Kafka consumer group rebalance storm",
            "error": "CommitFailedException: The commit failed since the group has already rebalanced",
            "desc": "Notification messages repeatedly reprocessed causing duplicate SMS dispatches.",
            "version": "v1.2.4",
            "commit": "334fca1",
            "days_ago": 9,
            "root_cause": "max.poll.interval.ms was exceeded due to slow third-party SMS provider latency.",
            "fix": "Increased max.poll.interval.ms to 300,000ms and decoupled SMS HTTP calls into background worker tasks.",
            "failed_attempt": "Increasing max.poll.records which exacerbated the timeout.",
            "lesson": "Kafka consumer polling loops must never block on external network I/O.",
            "runbook": "kafka-consumer-groups.sh --bootstrap-server kafka:9092 --describe --group notification-workers",
            "tags": ["kafka", "rebalance", "consumer", "sms"]
        },
        {
            "id": "INC-092",
            "service_id": "order-service",
            "title": "N+1 database query saturation on order listing API",
            "error": "Postgres connection pool queue depth exceeded: latency p99 > 8500ms",
            "desc": "Order history page timing out for corporate customers with > 500 orders.",
            "version": "v1.9.0",
            "commit": "90aa812",
            "days_ago": 6,
            "root_cause": "ORM lazy loading order items inside a loop without eager loading (joinedload).",
            "fix": "Added selectinload/joinedload on order items relationship and indexed customer_id.",
            "failed_attempt": "Adding server-side caching without fixing the underlying N+1 query.",
            "lesson": "Mandate ORM query linting in CI to detect un-eager loaded relationships.",
            "runbook": "EXPLAIN ANALYZE SELECT * FROM orders WHERE customer_id = $1",
            "tags": ["database", "n+1", "orm", "postgres", "latency"]
        },
        {
            "id": "INC-099",
            "service_id": "auth-service",
            "title": "Bcrypt hashing CPU saturation leading to health check failure",
            "error": "Kubernetes liveness probe failed: HTTP 503 response time > 5000ms",
            "desc": "Auth pods restarted in a crash loop under high traffic load.",
            "version": "v1.7.5",
            "commit": "119fbb2",
            "days_ago": 3,
            "root_cause": "Bcrypt work factor was increased from 10 to 14 in production without benchmarking CPU overhead.",
            "fix": "Reduced bcrypt cost factor to 11 and dedicated a separate CPU pool for hashing tasks.",
            "failed_attempt": "Increasing Kubernetes liveness probe timeout to 60 seconds.",
            "lesson": "Cryptographic cost factor adjustments require thorough load testing.",
            "runbook": "Review pod CPU throttle metrics in container_cpu_cfs_throttled_seconds_total",
            "tags": ["cpu", "bcrypt", "liveness", "k8s"]
        }
    ]

    for item in historical_seed_data:
        c_time = now - timedelta(days=item["days_ago"])
        r_time = c_time + timedelta(hours=1, minutes=15)
        
        inc = Incident(
            id=item["id"],
            service_id=item["service_id"],
            title=item["title"],
            error_message=item["error"],
            description=item["desc"],
            environment="Production",
            severity="High",
            status="resolved",
            deployment_version=item["version"],
            deployment_commit=item["commit"],
            incident_timestamp=c_time,
            created_at=c_time,
            resolved_at=r_time
        )
        db.add(inc)

        res = Resolution(
            id=f"RES-{item['id'].replace('INC-', '')}",
            incident_id=item["id"],
            root_cause=item["root_cause"],
            fix_applied=item["fix"],
            result="Successfully Resolved",
            lessons_learned=item["lesson"],
            failed_attempts=item["failed_attempt"],
            resolved_by="SRE Incident Team",
            created_at=r_time
        )
        db.add(res)

        mem = MemoryRecord(
            id=f"MEM-{item['id'].replace('INC-', '')}",
            incident_id=item["id"],
            service_id=item["service_id"],
            title=item["title"],
            original_error=item["error"],
            root_cause=item["root_cause"],
            successful_fix=item["fix"],
            failed_attempt=item["failed_attempt"],
            deployment_context=f"{item['version']} ({item['commit']})",
            lesson_learned=item["lesson"],
            runbook_step=item["runbook"],
            tags=item["tags"],
            source="retained",
            created_at=r_time
        )
        db.add(mem)

    db.commit()

    # Also generate a published postmortem for INC-071
    pm_071 = Postmortem(
        id="PM-INC-071",
        incident_id="INC-071",
        title="Postmortem: INC-071 - Payment API Database Connection Pool Exhaustion",
        summary="On 14 days ago, payment-api suffered database connection pool exhaustion following deployment v1.8.2. Long-term memory retained the configuration root cause and noted that restarting alone was ineffective.",
        impact="14.2% of payment transactions failed over a 45-minute window. Revenue impact mitigated by fast resolution.",
        timeline=[
            {"time": "T+00m", "event": "Deployment v1.8.2 rolled out to production"},
            {"time": "T+05m", "event": "Alert triggered: payment-api connection pool saturation at 100%"},
            {"time": "T+12m", "event": "On-call engineer restarted pods; failure recurred within 3 minutes"},
            {"time": "T+22m", "event": "Investigation traced pool exhaustion to configuration change in idle timeout"},
            {"time": "T+35m", "event": "Configuration reverted and redeployed"},
            {"time": "T+42m", "event": "Active connections stabilized at baseline (< 20%)"},
            {"time": "T+45m", "event": "Incident resolved and postmortem knowledge retained in Hindsight"}
        ],
        root_cause="Connection-pool configuration change in release v1.8.2 misconfigured idle connection recycling and pool bounds.",
        evidence=[
            "Error: database connection pool exhausted (max pool size reached: 20/20)",
            "Deployment v1.8.2 git commit 89acb42",
            "pg_stat_activity showing 20 connections in 'idle in transaction' state"
        ],
        what_worked=[
            "Reverting connection pool configuration parameters to known baseline",
            "Validating database pool parameters against PostgreSQL max_connections"
        ],
        what_failed=[
            "Restarting the service alone without changing configuration",
            "Attempting to scale pods before fixing pool config"
        ],
        resolution="Successfully reverted configuration parameters and deployed corrected settings.",
        lessons_learned=[
            "Check configuration changes before increasing pool size.",
            "Never rely on pod restarts alone for configuration-driven pool exhaustion.",
            "Retain operational memory to protect future engineers from repeating the pod restart mistake."
        ],
        prevention_recommendations=[
            "Add pre-flight configuration validation in CI/CD pipeline",
            "Establish alert rules for pool saturation at 75% threshold",
            "Document runbook steps in long-term memory for fast retrieval"
        ],
        author="SRE On-Call Lead",
        status="Published",
        created_at=inc_071_resolved
    )
    db.add(pm_071)
    db.commit()
