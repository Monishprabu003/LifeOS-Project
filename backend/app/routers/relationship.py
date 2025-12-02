from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List
from datetime import date

from app.database import get_db
from app.models.relationship import Contact, Interaction
from app.schemas.relationship import ContactCreate, ContactOut, InteractionCreate, InteractionOut

router = APIRouter(
    prefix="/relationships",
    tags=["Relationships"],
    responses={404: {"description": "Not found"}},
)

# --- Contacts ---

@router.post("/contacts", response_model=ContactOut)
async def create_contact(contact: ContactCreate, db: AsyncSession = Depends(get_db)):
    user_id = 1 # Mock user
    new_contact = Contact(
        user_id=user_id,
        name=contact.name,
        relationship_type=contact.relationship_type,
        contact_frequency_days=contact.contact_frequency_days
    )
    db.add(new_contact)
    await db.commit()
    await db.refresh(new_contact)
    return new_contact

@router.get("/contacts", response_model=List[ContactOut])
async def get_contacts(db: AsyncSession = Depends(get_db)):
    user_id = 1
    # Eager load interactions
    result = await db.execute(
        select(Contact)
        .where(Contact.user_id == user_id)
        .options(selectinload(Contact.interactions))
    )
    return result.scalars().all()

# --- Interactions ---

@router.post("/interactions", response_model=InteractionOut)
async def log_interaction(interaction: InteractionCreate, db: AsyncSession = Depends(get_db)):
    # Verify contact belongs to user (omitted for brevity in mock)
    new_interaction = Interaction(
        contact_id=interaction.contact_id,
        date=interaction.date,
        type=interaction.type,
        notes=interaction.notes
    )
    
    # Update last contact date
    contact_result = await db.execute(select(Contact).where(Contact.id == interaction.contact_id))
    contact = contact_result.scalars().first()
    if contact:
        if not contact.last_contact_date or interaction.date > contact.last_contact_date:
            contact.last_contact_date = interaction.date
            db.add(contact)

    db.add(new_interaction)
    await db.commit()
    await db.refresh(new_interaction)
    return new_interaction
