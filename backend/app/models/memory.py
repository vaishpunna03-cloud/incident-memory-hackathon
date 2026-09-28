from sqlalchemy import Column, String, Text, DateTime, JSON
from app.database import Base
from app.utils import now_utc

class MemoryRecord(Base):
    __tablename__ = "memory_records"

    id = Column(String(64), primary_key=True, index=True) # e.g. MEM-071
    incident_id = Column(String(64), nullable=False, index=True) # e.g. INC-071
    service_id = Column(String(64), nullable=False, index=True) # e.g. payment-api
    title = Column(String(255), nullable=False)
    original_error = Column(Text, nullable=False)
    root_cause = Column(Text, nullable=False)
    successful_fix = Column(Text, nullable=False)
    failed_attempt = Column(Text, nullable=True) # What failed
    deployment_context = Column(Text, nullable=True) # e.g. v1.8.2 config change
    lesson_learned = Column(Text, nullable=False)
    runbook_step = Column(Text, nullable=True)
    tags = Column(JSON, default=list) # e.g. ["database", "pool", "timeout"]
    source = Column(String(32), default="hindsight") # "hindsight" or "retained"
    created_at = Column(DateTime(timezone=True), default=now_utc)
