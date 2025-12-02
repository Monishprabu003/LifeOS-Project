from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import Dict, Any
from datetime import date

from app.database import get_db
from app.models.health import DailyHealthLog
from app.models.tasks import Task, Habit
from app.models.wealth import Transaction
from app.models.purpose import Goal

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
)

@router.get("/summary")
async def get_dashboard_summary(db: AsyncSession = Depends(get_db)):
    user_id = 1
    today = date.today()
    
    # 1. Health: Today's sleep & mood
    health_res = await db.execute(select(DailyHealthLog).where(DailyHealthLog.user_id == user_id, DailyHealthLog.date == today))
    health_log = health_res.scalars().first()
    
    # 2. Tasks: Pending count & Next P1 task
    tasks_res = await db.execute(select(Task).where(Task.user_id == user_id, Task.is_completed == False))
    tasks = tasks_res.scalars().all()
    pending_count = len(tasks)
    next_task = next((t for t in tasks if t.priority == "P1"), tasks[0] if tasks else None)
    
    # 3. Habits: Active streaks count
    habits_res = await db.execute(select(Habit).where(Habit.user_id == user_id))
    habits = habits_res.scalars().all()
    total_streak = sum(h.current_streak for h in habits)
    
    # 4. Wealth: Month's expenses
    start_of_month = today.replace(day=1)
    wealth_res = await db.execute(select(Transaction).where(Transaction.user_id == user_id, Transaction.date >= start_of_month, Transaction.type == "expense"))
    expenses = sum(t.amount for t in wealth_res.scalars().all())
    
    # 5. Purpose: Top Goal progress
    goals_res = await db.execute(select(Goal).where(Goal.user_id == user_id, Goal.status == "In Progress"))
    goals = goals_res.scalars().all()
    top_goal = goals[0] if goals else None

    return {
        "health": {
            "sleep": health_log.sleep_hours if health_log else 0,
            "mood": health_log.mood_score if health_log else 0,
        },
        "tasks": {
            "pending": pending_count,
            "next_task": next_task.title if next_task else "No pending tasks",
        },
        "habits": {
            "total_streak": total_streak,
            "active_count": len(habits)
        },
        "wealth": {
            "month_expenses": expenses
        },
        "purpose": {
            "top_goal": top_goal.title if top_goal else "Set a goal",
            "progress": top_goal.progress if top_goal else 0
        }
    }
