import os
import redis
from dotenv import load_dotenv

load_dotenv()

redis_conn = redis.Redis(
    host=os.getenv("REDIS_HOST", "localhost"),
    port=int(os.getenv("REDIS_PORT", 6379)),
    socket_keepalive=True,
    socket_connect_timeout=5,
    retry_on_timeout=True
)
