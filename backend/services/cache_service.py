import json
import logging
import redis
from backend.core.redis import redis_client
from redis.exceptions import RedisError

logger = logging.getLogger(__name__)


def get_cache(key: str):
    try:
        cached_data = redis_client.get(key)
        if cached_data is None:
            return None
        return json.loads(cached_data)
    except (RedisError, json.JSONDecodeError) as exc:
        logger.warning("Cache read failed for %s: %s", key, exc)
        return None

def set_cache(key:str, data, ttl: int=300):
    try:
        redis_client.set(
            key,
            json.dumps(data),
            ex=ttl
        )
    except RedisError as exc:
        logger.warning("Cache write failed for %s: %s", key, exc)

def delete_cache(key: str):
    try:
        redis_client.delete(key)
    except RedisError as exc:
        logger.warning("Cache deletion failed for %s: %s", key, exc)