"""
Password Analyzer API (Flask)

This server does NOT receive, store or log passwords. The password rules are
checked in the browser. The API exists to show how a frontend talks to a backend
and how both get deployed.
"""
import os

from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)

# ---------------------------------------------------------------------------
# CORS: which websites are allowed to call this API from a browser.
# Set FRONTEND_ORIGIN to your live frontend address (no trailing slash).
# Several addresses can be separated by commas. Never use "*" in production,
# because that lets every website on the internet call your API.
# The default below only allows VS Code Live Server on your own computer.
# ---------------------------------------------------------------------------
DEFAULT_ORIGINS = "http://127.0.0.1:5500,http://localhost:5500"
allowed_origins = [
    origin.strip()
    for origin in os.environ.get("FRONTEND_ORIGIN", DEFAULT_ORIGINS).split(",")
    if origin.strip()
]
CORS(app, resources={r"/api/*": {"origins": allowed_origins}})


@app.get("/")
def home():
    # Friendly page so opening the bare backend URL doesn't show a 404
    return jsonify({"message": "Password Analyzer API. Try /api/health"})


@app.get("/api/health")
def health():
    """Used to check that the server is running (locally and after deployment)."""
    return jsonify({"status": "ok", "message": "Password Analyzer API is running"})


@app.get("/api/info")
def info():
    """A second tiny endpoint the frontend uses to show the API name and version."""
    return jsonify({"name": "Password Analyzer", "version": "1.0.0"})


if __name__ == "__main__":
    # Local development only. In production Render runs: gunicorn app:app
    app.run(host="127.0.0.1", port=int(os.environ.get("PORT", 5000)), debug=True)
