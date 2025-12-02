from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Date, Text
from sqlalchemy.orm import relationship
from app.database import Base

class WeeklyReview(Base):
    __tablename__ = "weekly_reviews"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    week_start_date = Column(Date, nullable=False)
    week_end_date = Column(Date, nullable=False)
    
    # Aggregated Scores (0-100)
    health_score = Column(Float, default=0.0)
    wealth_score = Column(Float, default=0.0)
    relationship_score = Column(Float, default=0.0)
    productivity_score = Column(Float, default=0.0)
    global_score = Column(Float, default=0.0)
    
    # Qualitative
    wins = Column(Text, nullable=True)
    challenges = Column(Text, nullable=True)
    ai_summary = Column(Text, nullable=True)

    user = relationship("User", backref="weekly_reviews")
