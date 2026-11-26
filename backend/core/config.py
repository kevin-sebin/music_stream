from pathlib import Path
import os

from dotenv import load_dotenv
from sqlalchemy.engine import URL


load_dotenv(Path(__file__).resolve().parents[1] / ".env")


def _required_setting(name: str) -> str:
    value = os.getenv(name)
    if not value:
        raise RuntimeError(f"Missing required environment variable: {name}")
    return value


DB_URL = URL.create(
    drivername="mysql+pymysql",
    username=_required_setting("MYSQL_USER"),
    password=_required_setting("MYSQL_PASSWORD"),
    host=_required_setting("MYSQL_HOST"),
    port=int(os.getenv("MYSQL_PORT", "3306")),
    database=_required_setting("MYSQL_DB"),
)

AWS_REGION = os.getenv("AWS_REGION")
AWS_BUCKET_NAME = os.getenv("AWS_BUCKET_NAME")
AWS_ACCESS_KEY = os.getenv("AWS_ACCESS_KEY")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")

GOOGLE_CLIENT_ID = _required_setting("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = _required_setting("GOOGLE_CLIENT_SECRET")
GOOGLE_REDIRECT_URI = _required_setting("GOOGLE_REDIRECT_URI")

SESSION_SECRET_KEY = _required_setting('SESSION_SECRET_KEY')

JWT_SECRET_KEY = _required_setting("JWT_SECRET_KEY")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

REDIS_URL = _required_setting('REDIS_URL')