from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Date
from sqlalchemy.orm import relationship
from app.database import Base

class DailyHealthLog(Base):
    __tablename__ = "health_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    date = Column(Date, nullable=False, index=True)
    
    sleep_hours = Column(Float, nullable=True)
    mood_score = Column(Integer, nullable=True)  # 1-10
    stress_level = Column(Integer, nullable=True) # 1-10
    water_intake_ml = Column(Integer, nullable=True)
    notes = Column(String, nullable=True)

    user = relationship("User", backref="health_logs")
