from sqlalchemy import Column, String, Text, DateTime, JSON
from app.database import Base
from app.utils import now_utc

class Service(Base):
    __tablename__ = "services"

    id = Column(String(64), primary_key=True, index=True) # e.g. "payment-api"
    name = Column(String(128), nullable=False)
    description = Column(Text, nullable=True)
    tier = Column(String(32), default="Tier-1")
    dependencies = Column(JSON, default=list) # e.g. ["database", "auth-service"]
    status = Column(String(32), default="operational") # operational, degraded, major_outage
    created_at = Column(DateTime(timezone=True), default=now_utc)
