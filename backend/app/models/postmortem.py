from sqlalchemy import Column, String, Text, DateTime, JSON, ForeignKey
from app.database import Base
from app.utils import now_utc

class Postmortem(Base):
    __tablename__ = "postmortems"

    id = Column(String(64), primary_key=True, index=True) # e.g. PM-INC-071
    incident_id = Column(String(64), ForeignKey("incidents.id"), nullable=False, unique=True, index=True)
    title = Column(String(255), nullable=False)
    summary = Column(Text, nullable=False)
    impact = Column(Text, nullable=False)
    timeline = Column(JSON, default=list)
    root_cause = Column(Text, nullable=False)
    evidence = Column(JSON, default=list)
    what_worked = Column(JSON, default=list)
    what_failed = Column(JSON, default=list)
    resolution = Column(Text, nullable=False)
    lessons_learned = Column(JSON, default=list)
    prevention_recommendations = Column(JSON, default=list)
    author = Column(String(128), default="SRE Lead Investigator")
    status = Column(String(32), default="Published") # Draft, In Review, Published
    created_at = Column(DateTime(timezone=True), default=now_utc)
