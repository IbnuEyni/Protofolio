import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

db = SQLAlchemy()


def create_app():
    app = Flask(__name__)
    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv(
        "DATABASE_URL", "postgresql://postgres:postgres@db:5432/portfolio"
    )
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    # The browser only reaches the API through the same-origin Next.js proxy,
    # so cross-origin access is off unless CORS_ORIGINS is set explicitly.
    origins = [o.strip() for o in os.getenv("CORS_ORIGINS", "").split(",") if o.strip()]
    if origins:
        CORS(app, origins=origins)
    db.init_app(app)

    from .routes import bp
    app.register_blueprint(bp)

    return app
