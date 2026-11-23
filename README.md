# Music Stream

Music Stream is a full-stack music browsing and playlist application. It combines a FastAPI/MySQL backend with a React/Vite interface for searching YouTube music, building playlists, streaming tracks, and managing playlist thumbnails.


## Features

- Search for music through YouTube
- Stream selected tracks through the backend
- Create, rename, update, and delete playlists
- Add and remove songs from playlists
- Prevent duplicate songs within the same playlist
- Upload playlist thumbnails directly to Amazon S3 using presigned URLs
- Browse playlist feeds and song lists
- Responsive React interface with desktop and mobile playback layouts
- Shuffle, repeat, seek, volume, previous, and next controls
- Local mock-data fallbacks when the backend is unavailable

## Architecture

```text
music_stream/
├── backend/
│   ├── app/             # FastAPI application setup
│   ├── core/            # Environment and application configuration
│   ├── db/              # SQLAlchemy engine and database session
│   ├── models/          # MySQL data models
│   ├── routers/         # HTTP route definitions
│   ├── schemas/         # Pydantic request and response models
│   ├── services/        # Playlist, song, and S3 business logic
│   └── static/          # Locally served static assets
└── frontend/
    └── src/
        ├── components/  # Reusable player and navigation components
        ├── screens/     # Home, search, playlist, and player views
        ├── services/    # API and audio integration
        └── data/        # Local fallback/demo data
```

## Technology Stack

### Backend

- Python
- FastAPI
- Uvicorn
- SQLAlchemy
- PyMySQL
- Pydantic
- `python-dotenv`
- `yt-dlp`
- Boto3
- Amazon S3
- MySQL

### Frontend

- React
- Vite
- Tailwind CSS
- Lucide React
- HTML5 Audio

## API Overview

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/` | Return the playlist home feed |
| `POST` | `/playlists` | Create a playlist |
| `PATCH` | `/playlists/{pid}` | Update playlist details |
| `DELETE` | `/playlists/{pid}` | Delete a playlist |
| `GET` | `/playlists/{pid}` | Get songs in a playlist |
| `POST` | `/playlists/{pid}` | Add a song to a playlist |
| `DELETE` | `/playlists/{pid}/songs/{sid}` | Remove a song from a playlist |
| `PUT` | `/playlists/{pid}/thumbnail/upload-url` | Generate an S3 presigned upload URL |
| `PUT` | `/playlists/{pid}/thumbnail` | Save a thumbnail object key |
| `GET` | `/songs/search?q={query}` | Search for songs |
| `GET` | `/songs/stream/{youtube_id}` | Resolve and redirect to a stream URL |

Interactive API documentation is available when the backend is running:

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Prerequisites

- Python 3.10 or newer
- Node.js 18 or newer
- npm
- A running MySQL server
- An AWS account and S3 bucket, if thumbnail uploads will be used
- `ffmpeg` may be needed by parts of the audio toolchain depending on the local environment

## Backend Setup

Create a virtual environment and install dependencies:

```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Create `backend/.env`:

```dotenv
MYSQL_USER=your_mysql_user
MYSQL_PASSWORD=your_mysql_password
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DB=your_database_name

AWS_REGION=your_aws_region
AWS_BUCKET_NAME=your_s3_bucket_name
AWS_ACCESS_KEY=your_optional_aws_access_key
AWS_SECRET_ACCESS_KEY=your_optional_aws_secret_key
```

AWS credentials can be omitted if credentials are already supplied by the host environment or an AWS credentials profile. When credentials are provided, both `AWS_ACCESS_KEY` and `AWS_SECRET_ACCESS_KEY` must be set.

Start the API from the project root:

```powershell
uvicorn backend.app.main:app --reload
```

The backend runs on `http://localhost:8000` by default.

SQLAlchemy creates the configured MySQL tables automatically from the application models during startup.

## Frontend Setup

Install dependencies and start the Vite development server:

```powershell
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` by default.

To use a frontend-hosted AWS configuration for thumbnail URL resolution, optionally create `frontend/.env.local`:

```dotenv
VITE_AWS_BUCKET_NAME=your_s3_bucket_name
VITE_AWS_REGION=your_aws_region
```

The frontend currently uses `http://localhost:8000` as its API base URL. Update `API_BASE_URL` in `frontend/src/services/api.js` when deploying or changing the backend host.

## S3 Thumbnail Flow

1. The frontend requests a presigned upload URL from FastAPI.
2. FastAPI validates the image type and creates a temporary S3 PUT URL.
3. The browser uploads the image directly to S3.
4. The frontend sends the resulting S3 object key back to FastAPI.
5. FastAPI persists the object key in MySQL.

The S3 bucket should use an appropriate bucket policy or CORS configuration for browser uploads and public thumbnail reads.

## Backend Security Notes

- The real `.env` file is ignored and must never be committed.
- AWS secrets should be stored in environment variables or managed credentials.
- Database credentials should not be hardcoded into source files.
- Configure restrictive CORS origins before deploying to production.
- Replace wildcard CORS settings for any public deployment.
- Presigned URLs expire after five minutes.
- `generateUploadUrl` only accepts JPEG, PNG, and WEBP images.

## Development Notes

- The backend is the source of truth for playlists and songs.
- The frontend includes fallback mock data for offline or partially unavailable backend use.
- The frontend normalizes backend and YouTube response fields into a consistent song shape.
- Duplicate songs are checked before creating a new song record.
- Generated files, dependencies, environment variables, caches, logs, databases, and uploaded thumbnails are excluded through the root `.gitignore`.

## Running the Project

Start MySQL and these two processes in separate terminals:

```powershell
# Terminal 1
uvicorn backend.app.main:app --reload
```

```powershell
# Terminal 2
cd frontend
npm run dev
```

Open `http://localhost:5173`.
