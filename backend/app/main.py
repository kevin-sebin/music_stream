from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.db.base import Base
from backend.db.database import engine
from backend.models import playlist_songs, playlists, songs, users
from backend.routers import playlist, song
from backend.routers import auth

from starlette.middleware.sessions import SessionMiddleware
from backend.core.config import SESSION_SECRET_KEY


app = FastAPI(title="music stream")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    SessionMiddleware,
    secret_key=SESSION_SECRET_KEY,
    same_site="lax",
    https_only=False
)

Base.metadata.create_all(bind=engine)

static_dir = Path(__file__).resolve().parents[1] / "static"
static_dir.mkdir(parents=True, exist_ok=True)
app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")

app.include_router(playlist.router)
app.include_router(song.router)
app.include_router(auth.router)