from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Date, Text
from sqlalchemy.orm import relationship
from app.database import Base

class Contact(Base):
    __tablename__ = "contacts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    relationship_type = Column(String, nullable=True) # Family, Friend, Partner
    last_contact_date = Column(Date, nullable=True)
    contact_frequency_days = Column(Integer, default=14) # Reminder frequency
    
    user = relationship("User", backref="contacts")

class Interaction(Base):
    __tablename__ = "interactions"

    id = Column(Integer, primary_key=True, index=True)
    contact_id = Column(Integer, ForeignKey("contacts.id"), nullable=False)
    date = Column(Date, nullable=False)
    type = Column(String, nullable=True) # Call, Meetup, Text
    notes = Column(Text, nullable=True)

    contact = relationship("Contact", backref="interactions")
