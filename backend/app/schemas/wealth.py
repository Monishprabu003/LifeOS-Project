from pydantic import BaseModel
from typing import Optional
from datetime import date

class TransactionBase(BaseModel):
    date: date
    amount: float
    type: str # income, expense
    category: str
    description: Optional[str] = None

class TransactionCreate(TransactionBase):
    pass

class TransactionOut(TransactionBase):
    id: int
    user_id: int

    class Config:
        orm_mode = True

class BudgetBase(BaseModel):
    month: str # YYYY-MM
    category: str
    amount_limit: float

class BudgetCreate(BudgetBase):
    pass

class BudgetOut(BudgetBase):
    id: int
    user_id: int

    class Config:
        orm_mode = True
