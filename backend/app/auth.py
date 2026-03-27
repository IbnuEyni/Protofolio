import os
import functools
from flask import request, jsonify

def require_auth(fn):
    @functools.wraps(fn)
    def wrapper(*args, **kwargs):
        token = request.headers.get("Authorization", "").removeprefix("Bearer ").strip()
        admin_token = os.getenv("ADMIN_TOKEN", "")
        if not admin_token or token != admin_token:
            return jsonify({"error": "Unauthorized"}), 401
        return fn(*args, **kwargs)
    return wrapper
