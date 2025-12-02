from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from datetime import date, timedelta

from app.database import get_db
from app.models.review import WeeklyReview
from app.schemas.review import WeeklyReviewCreate, WeeklyReviewOut
from app.services.ai_engine import AIEngine

router = APIRouter(
    prefix="/reviews",
    tags=["Weekly Reviews"],
)

@router.post("/generate", response_model=WeeklyReviewOut)
async def generate_weekly_review(db: AsyncSession = Depends(get_db)):
    user_id = 1
    today = date.today()
    week_start = today - timedelta(days=today.weekday())
    week_end = week_start + timedelta(days=6)

    # 1. Check if exists
    result = await db.execute(
        select(WeeklyReview).where(
            WeeklyReview.user_id == user_id, 
            WeeklyReview.week_start_date == week_start
        )
    )
    existing = result.scalars().first()
    if existing:
        return existing

    # 2. Calculate Scores (Mock logic for now)
    # In real app, query HealthLogs, Transactions, Tasks for the week
    health_score = 75.0 
    wealth_score = 80.0
    relationship_score = 60.0
    productivity_score = 90.0
    global_score = (health_score + wealth_score + relationship_score + productivity_score) / 4

    # 3. Get AI Insights
    engine = AIEngine(db, user_id)
    insights = await engine.generate_weekly_insights()
    ai_summary = " ".join(insights)

    new_review = WeeklyReview(
        user_id=user_id,
        week_start_date=week_start,
        week_end_date=week_end,
        health_score=health_score,
        wealth_score=wealth_score,
        relationship_score=relationship_score,
        productivity_score=productivity_score,
        global_score=global_score,
        ai_summary=ai_summary
    )
    
    db.add(new_review)
    await db.commit()
    await db.refresh(new_review)
    return new_review

@router.get("/", response_model=List[WeeklyReviewOut])
async def get_reviews(db: AsyncSession = Depends(get_db)):
    user_id = 1
    result = await db.execute(
        select(WeeklyReview).where(WeeklyReview.user_id == user_id).order_by(WeeklyReview.week_start_date.desc())
    )
    return result.scalars().all()
