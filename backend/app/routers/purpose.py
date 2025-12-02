from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List

from app.database import get_db
from app.models.purpose import Goal, KeyResult
from app.schemas.purpose import GoalCreate, GoalOut, KeyResultCreate, KeyResultOut

router = APIRouter(
    prefix="/purpose",
    tags=["Purpose"],
    responses={404: {"description": "Not found"}},
)

# --- Goals ---

@router.post("/goals", response_model=GoalOut)
async def create_goal(goal: GoalCreate, db: AsyncSession = Depends(get_db)):
    user_id = 1
    new_goal = Goal(
        user_id=user_id,
        title=goal.title,
        description=goal.description,
        deadline=goal.deadline,
        status=goal.status
    )
    db.add(new_goal)
    await db.commit()
    await db.refresh(new_goal)
    return new_goal

@router.get("/goals", response_model=List[GoalOut])
async def get_goals(db: AsyncSession = Depends(get_db)):
    user_id = 1
    result = await db.execute(
        select(Goal)
        .where(Goal.user_id == user_id)
        .options(selectinload(Goal.key_results))
    )
    return result.scalars().all()

# --- Key Results ---

@router.post("/goals/{goal_id}/key-results", response_model=KeyResultOut)
async def create_key_result(goal_id: int, kr: KeyResultCreate, db: AsyncSession = Depends(get_db)):
    new_kr = KeyResult(
        goal_id=goal_id,
        title=kr.title,
        target_value=kr.target_value,
        current_value=kr.current_value,
        unit=kr.unit
    )
    db.add(new_kr)
    await db.commit()
    await db.refresh(new_kr)
    
    # Recalculate goal progress (simplified)
    # In a real app, this would be more complex
    
    return new_kr
