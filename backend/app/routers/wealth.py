from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from datetime import date

from app.database import get_db
from app.models.wealth import Transaction, Budget
from app.schemas.wealth import TransactionCreate, TransactionOut, BudgetCreate, BudgetOut

router = APIRouter(
    prefix="/wealth",
    tags=["Wealth"],
    responses={404: {"description": "Not found"}},
)

# --- Transactions ---

@router.post("/transactions", response_model=TransactionOut)
async def create_transaction(transaction: TransactionCreate, db: AsyncSession = Depends(get_db)):
    user_id = 1 # Mock user
    new_tx = Transaction(
        user_id=user_id,
        date=transaction.date,
        amount=transaction.amount,
        type=transaction.type,
        category=transaction.category,
        description=transaction.description
    )
    db.add(new_tx)
    await db.commit()
    await db.refresh(new_tx)
    return new_tx

@router.get("/transactions", response_model=List[TransactionOut])
async def get_transactions(db: AsyncSession = Depends(get_db), skip: int = 0, limit: int = 100):
    user_id = 1
    result = await db.execute(select(Transaction).where(Transaction.user_id == user_id).order_by(Transaction.date.desc()).offset(skip).limit(limit))
    return result.scalars().all()

# --- Budgets ---

@router.post("/budgets", response_model=BudgetOut)
async def create_budget(budget: BudgetCreate, db: AsyncSession = Depends(get_db)):
    user_id = 1
    new_budget = Budget(
        user_id=user_id,
        month=budget.month,
        category=budget.category,
        amount_limit=budget.amount_limit
    )
    db.add(new_budget)
    await db.commit()
    await db.refresh(new_budget)
    return new_budget

@router.get("/budgets", response_model=List[BudgetOut])
async def get_budgets(db: AsyncSession = Depends(get_db)):
    user_id = 1
    result = await db.execute(select(Budget).where(Budget.user_id == user_id))
    return result.scalars().all()
