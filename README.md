# Music Stream

Music Stream is a full-stack music discovery and personal playlist app. Sign in
with Google to manage your playlists, search for tracks, and play them
through a responsive React interface.

## Features

- Google sign-in with verified-email checks and JSON Web Token (JWT) sessions
- Private, account-scoped playlists: create, edit, delete, and organize tracks
- Search songs through `yt-dlp` and stream selected tracks
- Responsive home, search, playlist, and now-playing screens
- Playback controls for play/pause, seeking, volume, shuffle, repeat, and queue
- Optional playlist cover uploads directly to Amazon S3 using presigned URLs
- MySQL persistence for users, playlists, songs, and playlist membership
- Synthetic audio fallback when a playable stream is unavailable

## Project layout

```text
music_stream/
├── backend/
│   ├── app/              # FastAPI application and middleware
│   ├── core/             # Environment settings and Google OAuth client
│   ├── db/               # SQLAlchemy engine and session
│   ├── models/           # User, playlist, and song tables
│   ├── routers/          # Authentication, playlist, and song endpoints
│   ├── schemas/          # Request models
│   └── services/         # Auth/JWT, playlist, song, and S3 logic
└── frontend/
    └── src/
        ├── components/   # Navigation, playback controls, and modals
        ├── context/      # Authentication state
        ├── screens/      # Login, home, search, playlist, and player views
        └── services/     # API calls and audio playback
```

## Technology

- **Backend:** Python, FastAPI, Uvicorn, SQLAlchemy, MySQL/PyMySQL
- **Authentication:** Google OpenID Connect via Authlib, Starlette sessions,
  PyJWT bearer tokens
- **Music:** `yt-dlp` search and stream URL resolution
- **Image storage:** Amazon S3 and Boto3 (optional)
- **Frontend:** React 18, Vite, Tailwind CSS, Lucide React, HTML5 Audio

## Prerequisites

- Python 3.10 or newer
- Node.js 18 or newer and npm
- A running MySQL server and a database for the app
- A Google OAuth 2.0 Web application client
- AWS credentials and an S3 bucket only if playlist cover uploads are needed

## Configure Google OAuth

In the Google Cloud Console, create an OAuth 2.0 client ID of type **Web
application**. For local development, add this authorized redirect URI:

```text
http://127.0.0.1:8000/auth/google/callback
```

The redirect URI must exactly match `GOOGLE_REDIRECT_URI` below. The frontend
uses `http://localhost:5173` by default; add it as an authorized JavaScript
origin if required by your OAuth client configuration.

## Backend setup

From the repository root, create a virtual environment and install the backend
dependencies:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
cd ..
```

Create `backend/.env` with the database and OAuth settings:

```dotenv
MYSQL_USER=your_mysql_user
MYSQL_PASSWORD=your_mysql_password
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_DB=your_database_name

GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
GOOGLE_REDIRECT_URI=http://127.0.0.1:8000/auth/google/callback

SESSION_SECRET_KEY=replace_with_a_long_random_secret
JWT_SECRET_KEY=replace_with_a_different_long_random_secret
```

Generate a secret in PowerShell with
`python -c "import secrets; print(secrets.token_urlsafe(32))"`; run it
separately for each secret. Keep this file and the OAuth client secret private.
The backend loads `backend/.env` automatically. `MYSQL_PORT` defaults to
`3306` if omitted.

Optional settings for playlist covers:

```dotenv
AWS_REGION=your_aws_region
AWS_BUCKET_NAME=your_s3_bucket_name
# Optional when AWS credentials are already available from the environment
# or an AWS credentials profile. If specifying either, specify both.
AWS_ACCESS_KEY=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
```

The S3 bucket must allow the browser's cross-origin `PUT` uploads from the
frontend origin. Configure bucket access appropriately for displaying saved
covers. Uploads support JPEG, PNG, and WEBP; the UI limits files to 10 MB.

Start the API from the repository root:

```powershell
uvicorn backend.app.main:app --reload
```

The API is available at `http://127.0.0.1:8000`. On startup, SQLAlchemy creates
tables that do not yet exist. It does **not** migrate existing tables: if you
are upgrading an older database, add the nullable `playlists.user_id` column
and its foreign key to `users.uid`, and decide how existing playlists should be
assigned to users. Otherwise, use a fresh database.

## Frontend setup

In another terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. The frontend defaults to the API at
`http://127.0.0.1:8000`. To use another API host, create `frontend/.env.local`:

```dotenv
VITE_API_BASE_URL=http://127.0.0.1:8000
```

For S3 cover display, the frontend can also be configured with:

```dotenv
VITE_AWS_BUCKET_NAME=your_s3_bucket_name
VITE_AWS_REGION=your_aws_region
```

The frontend defaults these to `your-music-app-assets` and `ap-southeast-2`.
These values are for constructing cover image URLs; AWS credentials belong
only on the backend or in an AWS credentials provider, never in the frontend.

## Authentication and data access

1. The frontend redirects the browser to `/auth/google/login`.
2. Google returns to `/auth/google/callback`; the backend verifies the Google
   profile, creates or updates the local user, and issues a JWT.
3. The backend returns the JWT to the frontend in the URL fragment. The
   frontend stores it in browser local storage and sends it as a bearer token.
4. Protected playlist requests are restricted to the signed-in user's
   playlists. Tokens expire after 60 minutes; signing out clears the local
   token.

`FRONTEND_URL` optionally sets the frontend URL used after OAuth; it defaults
to `http://localhost:5173`.

## API overview

Interactive documentation is available at `http://127.0.0.1:8000/docs` and
`http://127.0.0.1:8000/redoc` while the backend is running.

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/auth/google/login` | Public | Start Google sign-in |
| `GET` | `/auth/google/callback` | OAuth callback | Complete sign-in |
| `GET` | `/auth/me` | Bearer token | Get the current user |
| `GET` | `/` | Bearer token | List the current user's playlists |
| `POST` | `/playlists` | Bearer token | Create a playlist |
| `PATCH` | `/playlists/{pid}` | Bearer token | Update playlist details |
| `DELETE` | `/playlists/{pid}` | Bearer token | Delete a playlist |
| `GET` | `/playlists/{pid}` | Bearer token | List songs in a playlist |
| `POST` | `/playlists/{pid}` | Bearer token | Add a song to a playlist |
| `DELETE` | `/playlists/{pid}/songs/{sid}` | Bearer token | Remove a song |
| `PUT` | `/playlists/{pid}/thumbnail/upload-url` | Bearer token | Request a presigned S3 upload URL |
| `PUT` | `/playlists/{pid}/thumbnail` | Bearer token | Save a cover's S3 object key |
| `GET` | `/songs/search?q={query}` | Public | Search YouTube; without `q`, list catalog songs |
| `GET` | `/songs/stream/{youtube_id}` | Public | Resolve and redirect to an audio stream |

## Development and deployment notes

- The backend currently allows all CORS origins and configures session cookies
  for local HTTP development. Before deployment, restrict CORS to trusted
  frontend origins, use HTTPS, and configure secure session cookies.
- Use strong, distinct session and JWT secrets outside local development.
- Do not commit `.env` files or expose database, OAuth, or AWS credentials.
- Google OAuth must use a verified email address.
- The frontend requires authentication for the library; YouTube search and
  stream resolution are public endpoints.
- `npm run build` in `frontend/` creates the production frontend bundle.
- `backend/locustfile.py` is a basic load-test workload. It does not currently
  obtain a bearer token, so its home-feed and playlist-detail requests receive
  `401`; only its public catalog-search request works without additional auth
  setup.
