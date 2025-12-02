from pydantic import BaseModel
from typing import Optional, List
from datetime import date

# --- Tasks ---
class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    priority: str = "P2"
    due_date: Optional[date] = None
    is_completed: bool = False

class TaskCreate(TaskBase):
    pass

class TaskOut(TaskBase):
    id: int
    user_id: int
    created_at: Optional[date] = None # Simplified for now

    class Config:
        orm_mode = True

# --- Habits ---
class HabitBase(BaseModel):
    title: str
    frequency: str = "daily"

class HabitCreate(HabitBase):
    pass

class HabitLogOut(BaseModel):
    id: int
    date: date
    completed: bool
    
    class Config:
        orm_mode = True

class HabitOut(HabitBase):
    id: int
    user_id: int
    current_streak: int
    # We might want to return recent logs to show completion status on UI
    
    class Config:
        orm_mode = True
