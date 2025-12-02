from pydantic import BaseModel
from typing import Optional, List
from datetime import date

class KeyResultBase(BaseModel):
    title: str
    target_value: float
    current_value: float = 0.0
    unit: str = "units"

class KeyResultCreate(KeyResultBase):
    pass

class KeyResultOut(KeyResultBase):
    id: int
    goal_id: int

    class Config:
        orm_mode = True

class GoalBase(BaseModel):
    title: str
    description: Optional[str] = None
    deadline: Optional[date] = None
    status: str = "In Progress"

class GoalCreate(GoalBase):
    pass

class GoalOut(GoalBase):
    id: int
    user_id: int
    progress: float
    key_results: List[KeyResultOut] = []

    class Config:
        orm_mode = True
