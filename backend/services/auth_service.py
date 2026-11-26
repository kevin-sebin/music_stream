import os
from urllib.parse import quote, urlparse
from fastapi import HTTPException, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from backend.core.oauth import oauth
from backend.core.config import GOOGLE_REDIRECT_URI
from backend.models.users import users
from backend.services.jwt_service import create_access_token


DEFAULT_FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173").rstrip("/")


def _extract_safe_frontend_origin(candidate: str | None) -> str | None:
    if not candidate:
        return None
    parsed = urlparse(candidate)
    if parsed.scheme in ("http", "https") and parsed.hostname in ("localhost", "127.0.0.1"):
        if parsed.port != 8000:
            return f"{parsed.scheme}://{parsed.netloc}"
    return None


async def google_login(request: Request):
    frontend_origin = (
        _extract_safe_frontend_origin(request.query_params.get("next"))
        or _extract_safe_frontend_origin(request.headers.get("referer"))
    )
    if not frontend_origin and "text/html" in request.headers.get("accept", ""):
        frontend_origin = DEFAULT_FRONTEND_URL

    if frontend_origin:
        request.session["frontend_redirect"] = frontend_origin

    return await oauth.google.authorize_redirect(
        request,
        GOOGLE_REDIRECT_URI
    )


async def google_callback(request: Request, db: Session):
    frontend_redirect = request.session.pop("frontend_redirect", None)
    if not frontend_redirect and "text/html" in request.headers.get("accept", "") and request.query_params.get("format") != "json":
        frontend_redirect = DEFAULT_FRONTEND_URL

    oauth_error = request.query_params.get("error")
    if oauth_error:
        error_desc = request.query_params.get("error_description") or oauth_error
        if frontend_redirect:
            return RedirectResponse(
                url=f"{frontend_redirect}/#auth_error={quote(error_desc)}",
                status_code=302,
            )
        raise HTTPException(status_code=400, detail=error_desc)

    try:
        token = await oauth.google.authorize_access_token(request)
        user_info = token.get('userinfo')

        if not user_info or not user_info.get('email_verified'):
            raise ValueError('Google account email is not verified')
        google_id = user_info['sub']

        user = db.query(users).filter(users.google_id == google_id).first()
        if not user:
            user = users(
                google_id=google_id,
                email=user_info['email'],
                name=user_info['name'],
                picture=user_info.get('picture'),
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        else:
            updated = False
            if user_info.get('picture') and user.picture != user_info.get('picture'):
                user.picture = user_info.get('picture')
                updated = True
            if user_info.get('name') and user.name != user_info.get('name'):
                user.name = user_info.get('name')
                updated = True
            if updated:
                db.commit()
                db.refresh(user)

        access_token = create_access_token(user.uid)

        if frontend_redirect:
            return RedirectResponse(
                url=f"{frontend_redirect}/#access_token={quote(access_token, safe='')}",
                status_code=302,
            )

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user.uid,
                "email": user.email,
                "name": user.name,
                "picture": user.picture
            }
        }
    except Exception as exc:
        if frontend_redirect:
            return RedirectResponse(
                url=f"{frontend_redirect}/#auth_error={quote(str(exc) or 'Google authentication failed')}",
                status_code=302,
            )
        raise

    