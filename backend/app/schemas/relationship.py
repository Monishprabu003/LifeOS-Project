from pydantic import BaseModel
from typing import Optional, List
from datetime import date

class InteractionBase(BaseModel):
    date: date
    type: str
    notes: Optional[str] = None

class InteractionCreate(InteractionBase):
    contact_id: int

class InteractionOut(InteractionBase):
    id: int
    contact_id: int

    class Config:
        orm_mode = True

class ContactBase(BaseModel):
    name: str
    relationship_type: str
    contact_frequency_days: int

class ContactCreate(ContactBase):
    pass

class ContactOut(ContactBase):
    id: int
    user_id: int
    last_contact_date: Optional[date] = None
    interactions: List[InteractionOut] = []

    class Config:
        orm_mode = True
