import time
import threading
import functools
from collections import defaultdict, deque
from flask import request, jsonify

# In-memory sliding-window limiter. State is per process, so on Cloud Run each
# instance enforces its own budget — enough to cap abuse without adding Redis.
_lock = threading.Lock()
_hits: dict[str, deque] = defaultdict(deque)
_MAX_KEYS = 10_000


def client_ip() -> str:
    # Requests arrive via the Next.js proxy / Cloud Run front end, so the
    # original client is the left-most X-Forwarded-For entry.
    forwarded = request.headers.get("X-Forwarded-For", "")
    return forwarded.split(",")[0].strip() or request.remote_addr or "unknown"


def _allow(key: str, limit: int, window: float) -> bool:
    now = time.monotonic()
    with _lock:
        if len(_hits) > _MAX_KEYS:
            for k in [k for k, q in _hits.items() if not q or now - q[-1] > window]:
                del _hits[k]
        q = _hits[key]
        while q and now - q[0] > window:
            q.popleft()
        if len(q) >= limit:
            return False
        q.append(now)
        return True


def rate_limit(name: str, limit: int, window: float, per_ip: bool = True):
    """Reject with 429 once `limit` calls happen within `window` seconds.
    per_ip=False applies one shared budget to all callers (a cost ceiling)."""
    def decorator(fn):
        @functools.wraps(fn)
        def wrapper(*args, **kwargs):
            key = f"{name}:{client_ip()}" if per_ip else f"{name}:*"
            if not _allow(key, limit, window):
                return jsonify({"error": "Too many requests. Please try again later."}), 429
            return fn(*args, **kwargs)
        return wrapper
    return decorator
