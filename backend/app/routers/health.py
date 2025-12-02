from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional
from datetime import date

from app.database import get_db
from app.models.health import DailyHealthLog
from app.models.user import User
from app.schemas.health import HealthLogCreate, HealthLogOut
from app.core.security import verify_password # Just importing to ensure auth dependency works later if needed
from app.routers.auth import create_access_token # Placeholder for actual user dependency

# TODO: Add get_current_user dependency
router = APIRouter(
    prefix="/health",
    tags=["Health"],
    responses={404: {"description": "Not found"}},
)

@router.post("/logs", response_model=HealthLogOut)
async def create_health_log(log: HealthLogCreate, db: AsyncSession = Depends(get_db)):
    # Mock user ID for now until we have get_current_user dependency fully wired up in a shared location
    # In a real app, we'd extract user from token
    user_id = 1 
    
    new_log = DailyHealthLog(
        user_id=user_id,
        date=log.date,
        sleep_hours=log.sleep_hours,
        mood_score=log.mood_score,
        stress_level=log.stress_level,
        water_intake_ml=log.water_intake_ml,
        notes=log.notes
    )
    db.add(new_log)
    await db.commit()
    await db.refresh(new_log)
    return new_log

@router.get("/logs", response_model=List[HealthLogOut])
async def get_health_logs(db: AsyncSession = Depends(get_db), skip: int = 0, limit: int = 100):
    # Mock user ID
    user_id = 1
    result = await db.execute(select(DailyHealthLog).where(DailyHealthLog.user_id == user_id).offset(skip).limit(limit))
    logs = result.scalars().all()
    return logs

@router.get("/logs/{date}", response_model=HealthLogOut)
async def get_health_log_by_date(date: date, db: AsyncSession = Depends(get_db)):
    user_id = 1
    result = await db.execute(select(DailyHealthLog).where(DailyHealthLog.user_id == user_id, DailyHealthLog.date == date))
    log = result.scalars().first()
    if not log:
        raise HTTPException(status_code=404, detail="Log not found")
    return log
