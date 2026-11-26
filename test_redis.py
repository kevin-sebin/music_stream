from backend.core.redis import redis_client

print("Redis keys:", redis_client.keys("*"))