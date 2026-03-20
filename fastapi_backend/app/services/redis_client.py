from redis.asyncio import Redis

from app.config import settings

_redis_client: Redis | None = None


async def get_redis() -> Redis:
    global _redis_client

    if _redis_client is None:
        _redis_client = Redis(
            host=settings.redis_host,
            port=settings.redis_port,
            password=settings.redis_password or None,
            decode_responses=True,
            socket_timeout=5,
            socket_connect_timeout=5,
            retry_on_timeout=True,
        )

    return _redis_client
