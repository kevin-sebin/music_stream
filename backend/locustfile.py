"""Locust workload for the Music Stream API.

Run from the repository root with:
    python -m locust -f backend/locustfile.py

Set LOCUST_PLAYLIST_ID to include playlist detail requests. Search requests omit
the query so they measure the database-backed catalog path, not YouTube search.
"""

import os

from locust import HttpUser, between, task


_playlist_id = os.getenv("LOCUST_PLAYLIST_ID")
PLAYLIST_ID = int(_playlist_id) if _playlist_id else None
if PLAYLIST_ID is not None and PLAYLIST_ID <= 0:
    raise ValueError("LOCUST_PLAYLIST_ID must be a positive integer")


class MusicStreamUser(HttpUser):
    host = os.getenv("LOCUST_HOST", "http://127.0.0.1:8000")
    wait_time = between(1, 3)

    @task(5)
    def home_feed(self):
        self.client.get("/", name="GET /")

    @task(3)
    def search_catalog(self):
        self.client.get(
            "/songs/search",
            params={"limit": 10},
            name="GET /songs/search (catalog)",
        )

    @task(2)
    def playlist_details(self):
        if PLAYLIST_ID is not None:
            self.client.get(
                f"/playlists/{PLAYLIST_ID}",
                name="GET /playlists/[pid]",
            )
