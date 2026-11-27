from datetime import date

import pytest
from fastapi import HTTPException
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool

from backend.db.base import Base
from backend.models import playlist_songs, playlists, songs
import backend.models.users
from backend.schemas.playlist import (
    playlistStruct,
    playlistUpdateStruct,
    thumbnailSaveStruct,
)
from backend.schemas.song import addToPlaylistStruct
from backend.services import playlist_service


@pytest.fixture
def db(monkeypatch):
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    monkeypatch.setattr(playlist_service.cache_service, "get_cache", lambda key: None)
    monkeypatch.setattr(playlist_service.cache_service, "set_cache", lambda key, data: None)
    monkeypatch.setattr(playlist_service.cache_service, "delete_cache", lambda key: None)

    with Session(engine) as session:
        yield session

    engine.dispose()


def add_playlist(db, pid=1, user_id=7, name="Road Trip"):
    playlist = playlists(
        _pid=pid,
        user_id=user_id,
        name=name,
        img="cover.jpg",
        created_at=date(2025, 1, 2),
        genre="rock",
    )
    db.add(playlist)
    db.commit()
    return playlist


def test_get_home_feed_returns_cached_value_without_querying_db(monkeypatch):
    cached = [{"_pid": 4, "name": "Cached"}]
    monkeypatch.setattr(
        playlist_service.cache_service, "get_cache", lambda key: cached
    )

    assert playlist_service.get_home_feed(None, 7) is cached


def test_get_home_feed_builds_playlist_summary_and_song_count(db, monkeypatch):
    add_playlist(db)
    db.add_all(
        [
            songs(_sid=10, name="First"),
            songs(_sid=11, name="Second"),
        ]
    )
    db.add_all(
        [
            playlist_songs(_pid=1, _sid=10),
            playlist_songs(_pid=1, _sid=11),
        ]
    )
    db.commit()
    cached = {}
    monkeypatch.setattr(
        playlist_service.cache_service,
        "set_cache",
        lambda key, value: cached.update({key: value}),
    )

    result = playlist_service.get_home_feed(db, 7)

    assert result == [
        {
            "_pid": 1,
            "name": "Road Trip",
            "img": "cover.jpg",
            "created_at": "2025-01-02",
            "genre": "rock",
            "songsCount": 2,
        }
    ]
    assert cached["home_feed:7"] == result


def test_create_playlist_assigns_ids_and_invalidates_home_feed(db, monkeypatch):
    deleted = []
    monkeypatch.setattr(
        playlist_service.cache_service, "delete_cache", deleted.append
    )
    request = playlistStruct(
        name="New Mix",
        img="mix.jpg",
        created_at=date(2025, 2, 3),
        genre="pop",
    )

    first = playlist_service.create_playlist(request, db, 7)
    second = playlist_service.create_playlist(request, db, 7)

    assert first == {"detail": "playlist created", "_pid": 0}
    assert second == {"detail": "playlist created", "_pid": 1}
    assert deleted == ["home_feed:7", "home_feed:7"]
    assert db.query(playlists).count() == 2


def test_generate_thumbnail_upload_url_checks_owner_and_returns_url(db, monkeypatch):
    add_playlist(db)
    expected = {"upload_url": "https://example.test/upload", "object_key": "cover"}
    calls = []
    monkeypatch.setattr(
        playlist_service.storage_service,
        "generateUploadUrl",
        lambda pid, content_type: calls.append((pid, content_type)) or expected,
    )

    result = playlist_service.generate_thumbnail_upload_url(1, "image/png", db, 7)

    assert result == expected
    assert calls == [(1, "image/png")]


def test_save_playlist_thumbnail_updates_image_and_invalidates_cache(db, monkeypatch):
    playlist = add_playlist(db)
    deleted = []
    monkeypatch.setattr(
        playlist_service.cache_service, "delete_cache", deleted.append
    )

    result = playlist_service.save_playlist_thumbnail(
        1, thumbnailSaveStruct(img="new-cover.jpg"), db, 7
    )

    assert result == {"detail": "playlist thumbnail saved"}
    assert playlist.img == "new-cover.jpg"
    assert deleted == ["home_feed:7"]


def test_update_playlist_changes_only_supplied_fields(db, monkeypatch):
    playlist = add_playlist(db)
    deleted = []
    monkeypatch.setattr(
        playlist_service.cache_service, "delete_cache", deleted.append
    )

    result = playlist_service.update_playlist(
        1, playlistUpdateStruct(name="Quiet Drive"), db, 7
    )

    assert result == {"detail": "playlist updated"}
    assert playlist.name == "Quiet Drive"
    assert playlist.genre == "rock"
    assert deleted == ["home_feed:7"]


def test_delete_playlist_removes_links_and_invalidates_cache(db, monkeypatch):
    add_playlist(db)
    db.add(songs(_sid=10, name="First"))
    db.add(playlist_songs(_pid=1, _sid=10))
    db.commit()
    deleted = []
    monkeypatch.setattr(
        playlist_service.cache_service, "delete_cache", deleted.append
    )

    result = playlist_service.delete_playlist(1, db, 7)

    assert result == {"detail": "playlist deleted"}
    assert db.query(playlists).count() == 0
    assert db.query(playlist_songs).count() == 0
    assert deleted == ["home_feed:7"]


def test_get_playlist_songs_returns_songs_in_id_order(db):
    add_playlist(db)
    db.add_all(
        [songs(_sid=12, name="Later"), songs(_sid=3, name="Earlier")]
    )
    db.add_all(
        [playlist_songs(_pid=1, _sid=12), playlist_songs(_pid=1, _sid=3)]
    )
    db.commit()

    result = playlist_service.get_playlist_songs(1, db, 7)

    assert [song._sid for song in result] == [3, 12]


def test_add_existing_song_does_not_duplicate_playlist_link(db, monkeypatch):
    add_playlist(db)
    existing_song = songs(_sid=9, name="Saved Song", url="youtube-9")
    db.add(existing_song)
    db.add(playlist_songs(_pid=1, _sid=9))
    db.commit()
    deleted = []
    monkeypatch.setattr(
        playlist_service.cache_service, "delete_cache", deleted.append
    )

    result = playlist_service.add_song_to_playlist(
        1,
        addToPlaylistStruct(name="Ignored Name", youtube_id="youtube-9"),
        db,
        7,
    )

    assert result == {
        "detail": "song added",
        "_sid": 9,
        "_pid": 1,
        "name": "Saved Song",
    }
    assert db.query(songs).count() == 1
    assert db.query(playlist_songs).count() == 1
    assert deleted == []


def test_add_new_song_applies_defaults_and_field_limits(db):
    add_playlist(db)
    long_name = "n" * 300

    result = playlist_service.add_song_to_playlist(
        1,
        addToPlaylistStruct(name=long_name),
        db,
        7,
    )

    saved_song = db.query(songs).one()
    assert result["name"] == long_name[:255]
    assert saved_song.name == long_name[:255]
    assert saved_song.url == ""
    assert saved_song.artist == ""
    assert db.query(playlist_songs).count() == 1


def test_remove_song_from_playlist_deletes_link(db, monkeypatch):
    add_playlist(db)
    db.add(songs(_sid=10, name="First"))
    db.add(playlist_songs(_pid=1, _sid=10))
    db.commit()
    deleted = []
    monkeypatch.setattr(
        playlist_service.cache_service, "delete_cache", deleted.append
    )

    result = playlist_service.remove_song_from_playlist(1, 10, db, 7)

    assert result == {"detail": "song removed from playlist"}
    assert db.query(playlist_songs).count() == 0
    assert deleted == ["home_feed:7"]


def test_playlist_operations_return_404_for_missing_or_unowned_playlist(db):
    add_playlist(db, user_id=8)

    with pytest.raises(HTTPException) as upload_error:
        playlist_service.generate_thumbnail_upload_url(1, "image/png", db, 7)
    with pytest.raises(HTTPException) as save_error:
        playlist_service.save_playlist_thumbnail(
            1, thumbnailSaveStruct(img="cover.jpg"), db, 7
        )
    with pytest.raises(HTTPException) as update_error:
        playlist_service.update_playlist(
            1, playlistUpdateStruct(name="Nope"), db, 7
        )
    with pytest.raises(HTTPException) as delete_error:
        playlist_service.delete_playlist(1, db, 7)
    with pytest.raises(HTTPException) as songs_error:
        playlist_service.get_playlist_songs(1, db, 7)
    with pytest.raises(HTTPException) as add_error:
        playlist_service.add_song_to_playlist(
            1, addToPlaylistStruct(name="Nope"), db, 7
        )
    with pytest.raises(HTTPException) as remove_error:
        playlist_service.remove_song_from_playlist(1, 10, db, 7)

    assert [error.value.status_code for error in (
        upload_error,
        save_error,
        update_error,
        delete_error,
        songs_error,
        add_error,
        remove_error,
    )] == [404] * 7


def test_remove_song_returns_404_when_song_is_not_linked(db):
    add_playlist(db)

    with pytest.raises(HTTPException) as error:
        playlist_service.remove_song_from_playlist(1, 10, db, 7)

    assert error.value.status_code == 404
    assert error.value.detail == "song does not exist in the playlist"


def test_add_song_to_playlist_uses_untitled_default(db):
    add_playlist(db)

    result = playlist_service.add_song_to_playlist(
        1, addToPlaylistStruct(), db, 7
    )

    assert result["name"] == "Untitled Track"
    assert db.query(songs).one().name == "Untitled Track"


def test_get_home_feed_returns_empty_list_when_user_has_no_playlists(db):
    assert playlist_service.get_home_feed(db, 7) == []
