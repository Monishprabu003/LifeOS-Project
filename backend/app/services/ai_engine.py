from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.health import DailyHealthLog
from app.models.wealth import Transaction
from app.models.tasks import Task
from datetime import date, timedelta
from typing import List, Dict

class AIEngine:
    def __init__(self, db: AsyncSession, user_id: int):
        self.db = db
        self.user_id = user_id

    async def analyze_sleep_mood_correlation(self) -> str:
        # Fetch last 30 days of health logs
        result = await self.db.execute(
            select(DailyHealthLog)
            .where(DailyHealthLog.user_id == self.user_id)
            .order_by(DailyHealthLog.date.desc())
            .limit(30)
        )
        logs = result.scalars().all()
        
        if len(logs) < 5:
            return "Not enough data to analyze sleep patterns yet."

        good_sleep_mood = []
        bad_sleep_mood = []

        for log in logs:
            if log.sleep_hours and log.mood_score:
                if log.sleep_hours >= 7:
                    good_sleep_mood.append(log.mood_score)
                else:
                    bad_sleep_mood.append(log.mood_score)
        
        if not good_sleep_mood or not bad_sleep_mood:
            return "Keep tracking sleep and mood to see patterns."

        avg_good = sum(good_sleep_mood) / len(good_sleep_mood)
        avg_bad = sum(bad_sleep_mood) / len(bad_sleep_mood)

        if avg_good > avg_bad + 1:
            return f"Your mood is significantly better ({avg_good:.1f}/10) when you sleep 7+ hours compared to less ({avg_bad:.1f}/10)."
        elif avg_good > avg_bad:
            return "You tend to be slightly happier when you get enough sleep."
        else:
            return "Your sleep duration doesn't seem to strongly affect your mood scores right now."

    async def generate_weekly_insights(self) -> List[str]:
        insights = []
        
        # 1. Sleep/Mood Correlation
        sleep_insight = await self.analyze_sleep_mood_correlation()
        insights.append(sleep_insight)

        # 2. Spending Check
        # (Simplified logic for demo)
        today = date.today()
        start_of_month = today.replace(day=1)
        tx_result = await self.db.execute(
            select(Transaction)
            .where(Transaction.user_id == self.user_id, Transaction.date >= start_of_month, Transaction.type == "expense")
        )
        expenses = tx_result.scalars().all()
        total_spent = sum(t.amount for t in expenses)
        
        if total_spent > 2000: # Arbitrary threshold for demo
            insights.append(f"You've spent ${total_spent:.0f} this month. Consider reviewing your budget.")

        # 3. Task Completion
        task_result = await self.db.execute(
            select(Task).where(Task.user_id == self.user_id, Task.is_completed == False)
        )
        pending_tasks = len(task_result.scalars().all())
        if pending_tasks > 5:
            insights.append(f"You have {pending_tasks} pending tasks. Try clearing the quick wins first.")

        return insights
