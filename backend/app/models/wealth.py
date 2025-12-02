from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Date, Enum
from sqlalchemy.orm import relationship
from app.database import Base
import enum

class TransactionType(str, enum.Enum):
    INCOME = "income"
    EXPENSE = "expense"

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    date = Column(Date, nullable=False, index=True)
    amount = Column(Float, nullable=False)
    type = Column(String, nullable=False) # income or expense
    category = Column(String, nullable=False) # e.g., Food, Rent, Salary
    description = Column(String, nullable=True)
    
    user = relationship("User", backref="transactions")

class Budget(Base):
    __tablename__ = "budgets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    month = Column(String, nullable=False) # YYYY-MM
    category = Column(String, nullable=False)
    amount_limit = Column(Float, nullable=False)

    user = relationship("User", backref="budgets")
