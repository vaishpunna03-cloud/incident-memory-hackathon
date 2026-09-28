from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.postmortem import PostmortemResponse, PostmortemGenerateRequest
from app.services.postmortem_service import postmortem_service

router = APIRouter(prefix="/postmortems", tags=["Postmortems"])

@router.post("", response_model=PostmortemResponse)
async def generate_postmortem(
    payload: PostmortemGenerateRequest,
    db: Session = Depends(get_db)
):
    try:
        pm = await postmortem_service.generate_postmortem(
            incident_id=payload.incident_id,
            author=payload.author or "SRE Lead Investigator",
            db=db
        )
        return pm
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("", response_model=List[PostmortemResponse])
def list_postmortems(db: Session = Depends(get_db)):
    return postmortem_service.list_postmortems(db)

@router.get("/{postmortem_id}", response_model=PostmortemResponse)
def get_postmortem(postmortem_id: str, db: Session = Depends(get_db)):
    pm = postmortem_service.get_postmortem(postmortem_id, db)
    if not pm:
        raise HTTPException(status_code=404, detail="Postmortem not found")
    return pm
