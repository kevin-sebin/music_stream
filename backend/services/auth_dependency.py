from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from backend.db.database import get_db
from backend.models.users import users
from backend.services.jwt_service import verify_access_token


security = HTTPBearer()

def get_current_user(
        credentials: HTTPAuthorizationCredentials = Depends(security),
        db: Session = Depends(get_db)):
    token = credentials.credentials
    user_id = verify_access_token(token)

    if user_id is None:
        raise HTTPException(
            status_code = 401,
            detail = 'invalid or expired token'
        )
    user = db.query(users).filter(users.uid == user_id).first()
    if not user:
        raise HTTPException(
            status_code = 401,
            detail = 'user not found'
        )
    return user