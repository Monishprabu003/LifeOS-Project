from pydantic import BaseModel
from typing import Optional
from datetime import date

class HealthLogBase(BaseModel):
    date: date
    sleep_hours: Optional[float] = None
    mood_score: Optional[int] = None
    stress_level: Optional[int] = None
    water_intake_ml: Optional[int] = None
    notes: Optional[str] = None

class HealthLogCreate(HealthLogBase):
    pass

class HealthLogOut(HealthLogBase):
    id: int
    user_id: int

    class Config:
        orm_mode = True
