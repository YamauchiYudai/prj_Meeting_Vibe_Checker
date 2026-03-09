from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from uuid import UUID
from datetime import datetime, timezone

from app.core.database import get_db
from app.models.session import Session
from app.models.vibe_record import VibeRecord
from app.services.analyzer import analyze_frame
from pydantic import BaseModel

router = APIRouter(prefix="/sessions", tags=["sessions"])


class SessionCreate(BaseModel):
    title: str


class AnalyzeRequest(BaseModel):
    frame: str


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_session(request: SessionCreate, db: AsyncSession = Depends(get_db)):
    db_session = Session(title=request.title)
    db.add(db_session)
    await db.commit()
    await db.refresh(db_session)
    return {
        "id": db_session.id,
        "title": db_session.title,
        "started_at": db_session.started_at,
        "status": db_session.status,
    }


@router.patch("/{session_id}/end")
async def end_session(session_id: UUID, db: AsyncSession = Depends(get_db)):
    stmt = select(Session).where(Session.id == session_id)
    result = await db.execute(stmt)
    db_session = result.scalars().first()
    if not db_session:
        raise HTTPException(status_code=404, detail="Session not found")

    if db_session.status != "ended":
        db_session.status = "ended"  # type: ignore[assignment]
        db_session.ended_at = datetime.now(timezone.utc)  # type: ignore[assignment]
        db.add(db_session)
        await db.commit()
        await db.refresh(db_session)

    return {
        "id": db_session.id,
        "status": db_session.status,
        "ended_at": db_session.ended_at,
    }


@router.get("")
async def list_sessions(db: AsyncSession = Depends(get_db)):
    stmt = (
        select(Session, func.count(VibeRecord.id))
        .outerjoin(VibeRecord, Session.id == VibeRecord.session_id)
        .group_by(Session.id)
        .order_by(Session.started_at.desc())
    )
    result = await db.execute(stmt)
    rows = result.all()

    return [
        {
            "id": s.id,
            "title": s.title,
            "started_at": s.started_at,
            "status": s.status,
            "record_count": count,
        }
        for s, count in rows
    ]


@router.get("/{session_id}")
async def get_session(session_id: UUID, db: AsyncSession = Depends(get_db)):
    stmt = select(Session).where(Session.id == session_id)
    result = await db.execute(stmt)
    db_session = result.scalars().first()
    if not db_session:
        raise HTTPException(status_code=404, detail="Session not found")
    return {
        "id": db_session.id,
        "title": db_session.title,
        "started_at": db_session.started_at,
        "ended_at": db_session.ended_at,
        "status": db_session.status,
    }


@router.post("/{session_id}/analyze")
async def analyze_session_frame(
    session_id: UUID, request: AnalyzeRequest, db: AsyncSession = Depends(get_db)
):
    stmt = select(Session).where(Session.id == session_id)
    result = await db.execute(stmt)
    db_session = result.scalars().first()
    if not db_session:
        raise HTTPException(status_code=404, detail="Session not found")
    if db_session.status != "active":
        raise HTTPException(
            status_code=400, detail="Cannot analyze frames for ended session"
        )

    # Analyze memory-bound image without persisting
    analysis = analyze_frame(request.frame)
    dominant_emotion = analysis["dominant_emotion"]
    scores = analysis["scores"]

    # Store specifically ONLY result scores, never tracking frames
    record = VibeRecord(
        session_id=session_id,
        happy=scores.get("happy", 0.0),
        sad=scores.get("sad", 0.0),
        angry=scores.get("angry", 0.0),
        surprised=scores.get("surprised", 0.0),
        fearful=scores.get("fearful", 0.0),
        disgusted=scores.get("disgusted", 0.0),
        neutral=scores.get("neutral", 0.0),
        dominant_emotion=dominant_emotion,
    )
    db.add(record)
    await db.commit()

    return {"dominant_emotion": dominant_emotion, "scores": scores}


@router.get("/{session_id}/results")
async def get_session_results(session_id: UUID, db: AsyncSession = Depends(get_db)):
    stmt = (
        select(VibeRecord)
        .where(VibeRecord.session_id == session_id)
        .order_by(VibeRecord.recorded_at.asc())
    )
    result = await db.execute(stmt)
    records = result.scalars().all()

    return {
        "session_id": session_id,
        "records": [
            {
                "recorded_at": r.recorded_at,
                "dominant_emotion": r.dominant_emotion,
                "scores": {
                    "happy": r.happy,
                    "sad": r.sad,
                    "angry": r.angry,
                    "surprised": r.surprised,
                    "fearful": r.fearful,
                    "disgusted": r.disgusted,
                    "neutral": r.neutral,
                },
            }
            for r in records
        ],
    }
