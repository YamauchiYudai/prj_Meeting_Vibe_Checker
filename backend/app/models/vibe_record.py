import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Float, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base


class VibeRecord(Base):
    __tablename__ = "vibe_records"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(UUID(as_uuid=True), ForeignKey("sessions.id"), nullable=False)
    recorded_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    happy = Column(Float, nullable=False)
    sad = Column(Float, nullable=False)
    angry = Column(Float, nullable=False)
    surprised = Column(Float, nullable=False)
    fearful = Column(Float, nullable=False)
    disgusted = Column(Float, nullable=False)
    neutral = Column(Float, nullable=False)

    dominant_emotion = Column(String, nullable=False)
