from datetime import datetime, timedelta, timezone
import jwt

from backend.core.config import (
    JWT_SECRET_KEY,
    JWT_ALGORITHM,
    ACCESS_TOKEN_EXPIRE_MINUTES
)

def create_access_token(user_id: int):
    expire = datetime.now(timezone.utc)+timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )
    payload = {
        'sub': str(user_id),
        'exp': expire
    }
    return jwt.encode(
        payload,
        JWT_SECRET_KEY,
        algorithm=JWT_ALGORITHM
    )

def verify_access_token(token: str):
    try:
        payload = jwt.decode(
            token,
            JWT_SECRET_KEY,
            algorithms=[JWT_ALGORITHM   ]
        )
        user_id = payload.get('sub')
        if user_id is None:
            return None
        return int(user_id)
    except jwt.InvalidTokenError:
        return None