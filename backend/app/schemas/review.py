from pydantic import BaseModel
from typing import Optional
from datetime import date

class WeeklyReviewBase(BaseModel):
    week_start_date: date
    week_end_date: date
    wins: Optional[str] = None
    challenges: Optional[str] = None

class WeeklyReviewCreate(WeeklyReviewBase):
    pass

class WeeklyReviewOut(WeeklyReviewBase):
    id: int
    user_id: int
    health_score: float
    wealth_score: float
    relationship_score: float
    productivity_score: float
    global_score: float
    ai_summary: Optional[str] = None

    class Config:
        orm_mode = True
