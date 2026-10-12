import os
import hmac
import functools
from flask import request, jsonify


def token_valid(token: str) -> bool:
    admin_token = os.getenv("ADMIN_TOKEN", "")
    # constant-time compare so response timing doesn't leak the token
    return bool(admin_token) and hmac.compare_digest(token.encode(), admin_token.encode())


def require_auth(fn):
    @functools.wraps(fn)
    def wrapper(*args, **kwargs):
        token = request.headers.get("Authorization", "").removeprefix("Bearer ").strip()
        if not token_valid(token):
            return jsonify({"error": "Unauthorized"}), 401
        return fn(*args, **kwargs)
    return wrapper
