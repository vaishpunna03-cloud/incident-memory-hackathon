from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, JSON, Boolean, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base
from app.utils import now_utc

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(String(64), primary_key=True, index=True) # e.g. INC-071
    service_id = Column(String(64), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    error_message = Column(Text, nullable=False)
    description = Column(Text, nullable=True)
    environment = Column(String(64), default="Production")
    severity = Column(String(32), default="High") # Critical, High, Medium, Low
    status = Column(String(32), default="active") # active, investigating, resolved
    deployment_version = Column(String(64), nullable=True) # e.g. v2.1.0
    deployment_commit = Column(String(64), nullable=True) # e.g. a4f89d1
    incident_timestamp = Column(DateTime(timezone=True), default=now_utc)
    created_at = Column(DateTime(timezone=True), default=now_utc)
    resolved_at = Column(DateTime(timezone=True), nullable=True)

    events = relationship("IncidentEvent", back_populates="incident", cascade="all, delete-orphan", order_by="IncidentEvent.timestamp")
    investigations = relationship("IncidentInvestigation", back_populates="incident", cascade="all, delete-orphan", order_by="IncidentInvestigation.created_at.desc()")
    resolution = relationship("Resolution", back_populates="incident", uselist=False, cascade="all, delete-orphan")


class IncidentEvent(Base):
    __tablename__ = "incident_events"

    id = Column(String(64), primary_key=True, index=True)
    incident_id = Column(String(64), ForeignKey("incidents.id"), nullable=False, index=True)
    event_type = Column(String(64), nullable=False)
    description = Column(Text, nullable=False)
    timestamp = Column(DateTime(timezone=True), default=now_utc)
    metadata_json = Column(JSON, default=dict)

    incident = relationship("Incident", back_populates="events")


class IncidentInvestigation(Base):
    __tablename__ = "incident_investigations"

    id = Column(String(64), primary_key=True, index=True)
    incident_id = Column(String(64), ForeignKey("incidents.id"), nullable=False, index=True)
    summary = Column(Text, nullable=False)
    likely_root_cause = Column(Text, nullable=False)
    confidence = Column(String(32), default="High") # High, Medium, Low
    relevance_score = Column(Float, default=0.0) # 0-100%
    current_evidence = Column(JSON, default=list)
    historical_matches = Column(JSON, default=list)
    evidence_chain = Column(JSON, default=list)
    why_factors = Column(JSON, default=list)
    what_worked_before = Column(JSON, default=list)
    what_failed_before = Column(JSON, default=list)
    recommended_steps = Column(JSON, default=list)
    verification_steps = Column(JSON, default=list)
    risk_unknowns = Column(JSON, default=list)
    prevention_recommendations = Column(JSON, default=list)
    memory_used = Column(Boolean, default=False)
    is_contextual = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=now_utc)

    incident = relationship("Incident", back_populates="investigations")


class Resolution(Base):
    __tablename__ = "resolutions"

    id = Column(String(64), primary_key=True, index=True)
    incident_id = Column(String(64), ForeignKey("incidents.id"), nullable=False, unique=True, index=True)
    root_cause = Column(Text, nullable=False)
    fix_applied = Column(Text, nullable=False)
    result = Column(String(64), default="Successfully Resolved")
    lessons_learned = Column(Text, nullable=False)
    failed_attempts = Column(Text, nullable=True)
    resolved_by = Column(String(128), default="SRE On-Call Engineer")
    created_at = Column(DateTime(timezone=True), default=now_utc)

    incident = relationship("Incident", back_populates="resolution")
