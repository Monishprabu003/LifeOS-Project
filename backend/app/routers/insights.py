from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.database import get_db
from app.services.ai_engine import AIEngine

router = APIRouter(
    prefix="/insights",
    tags=["AI Insights"],
)

@router.get("/", response_model=List[str])
async def get_insights(db: AsyncSession = Depends(get_db)):
    user_id = 1 # Mock user
    engine = AIEngine(db, user_id)
    insights = await engine.generate_weekly_insights()
    return insights
