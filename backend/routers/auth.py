from fastapi import APIRouter, Request, Depends
from backend.core.oauth import oauth
from backend.services import auth_service
from sqlalchemy.orm import Session
from backend.db.database import get_db
from backend.services.auth_dependency import get_current_user

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

@router.get("/google/login")
async def google_login(request: Request):
    return await auth_service.google_login(request)

@router.get('/google/callback')
async def google_callback(request: Request, db: Session = Depends(get_db)):
    return await auth_service.google_callback(request, db)

@router.get("/me")
def get_me(current_user = Depends(get_current_user)):
    return {
        "id": current_user.uid,
        "email": current_user.email,
        "name": current_user.name,
        "picture": current_user.picture,
    }

