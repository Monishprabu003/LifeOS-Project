from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from datetime import date

from app.database import get_db
from app.models.tasks import Task, Habit, HabitLog
from app.schemas.tasks import TaskCreate, TaskOut, HabitCreate, HabitOut, HabitLogOut

router = APIRouter(
    prefix="/tasks",
    tags=["Tasks & Habits"],
    responses={404: {"description": "Not found"}},
)

# --- Tasks ---

@router.post("/", response_model=TaskOut)
async def create_task(task: TaskCreate, db: AsyncSession = Depends(get_db)):
    user_id = 1
    new_task = Task(
        user_id=user_id,
        title=task.title,
        description=task.description,
        priority=task.priority,
        due_date=task.due_date,
        is_completed=task.is_completed
    )
    db.add(new_task)
    await db.commit()
    await db.refresh(new_task)
    return new_task

@router.get("/", response_model=List[TaskOut])
async def get_tasks(db: AsyncSession = Depends(get_db)):
    user_id = 1
    result = await db.execute(select(Task).where(Task.user_id == user_id).order_by(Task.is_completed, Task.due_date))
    return result.scalars().all()

@router.put("/{task_id}", response_model=TaskOut)
async def update_task(task_id: int, task_update: TaskCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Task).where(Task.id == task_id))
    task = result.scalars().first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    task.title = task_update.title
    task.description = task_update.description
    task.priority = task_update.priority
    task.due_date = task_update.due_date
    task.is_completed = task_update.is_completed
    
    db.add(task)
    await db.commit()
    await db.refresh(task)
    return task

@router.delete("/{task_id}")
async def delete_task(task_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Task).where(Task.id == task_id))
    task = result.scalars().first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    await db.delete(task)
    await db.commit()
    return {"ok": True}

# --- Habits ---

@router.post("/habits", response_model=HabitOut)
async def create_habit(habit: HabitCreate, db: AsyncSession = Depends(get_db)):
    user_id = 1
    new_habit = Habit(
        user_id=user_id,
        title=habit.title,
        frequency=habit.frequency
    )
    db.add(new_habit)
    await db.commit()
    await db.refresh(new_habit)
    return new_habit

@router.get("/habits", response_model=List[HabitOut])
async def get_habits(db: AsyncSession = Depends(get_db)):
    user_id = 1
    result = await db.execute(select(Habit).where(Habit.user_id == user_id))
    return result.scalars().all()

@router.post("/habits/{habit_id}/check", response_model=HabitLogOut)
async def check_habit(habit_id: int, date_str: date, db: AsyncSession = Depends(get_db)):
    # Check if already logged for this date
    result = await db.execute(select(HabitLog).where(HabitLog.habit_id == habit_id, HabitLog.date == date_str))
    existing_log = result.scalars().first()
    
    if existing_log:
        # Toggle off if needed, or just return existing
        return existing_log

    new_log = HabitLog(habit_id=habit_id, date=date_str, completed=True)
    db.add(new_log)
    
    # Update streak (simplified logic)
    habit_res = await db.execute(select(Habit).where(Habit.id == habit_id))
    habit = habit_res.scalars().first()
    if habit:
        habit.current_streak += 1
        db.add(habit)

    await db.commit()
    await db.refresh(new_log)
    return new_log
