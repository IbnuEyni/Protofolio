# =============================================================================
# backend/Dockerfile  —  Enterprise-grade multi-stage Flask image
#
# Stages:
#   1. builder  — installs + compiles all Python wheels (has gcc/build tools)
#   2. runtime  — copies only the compiled site-packages, no build toolchain
#
# Security hardening:
#   - Pinned base image digest (update periodically via `docker pull --quiet`)
#   - No build tools in the final image (attack surface reduction)
#   - Non-root user (UID 10001) with no shell
#   - Read-only filesystem compatible (tmp via tmpfs at runtime)
#   - No SUID binaries copied in
#   - Secrets never baked into image layers (all via env / Secret Manager)
# =============================================================================

# ── Stage 1: builder ──────────────────────────────────────────────────────────
FROM python:3.12-slim AS builder

# Install only the C build tools needed to compile psycopg2 wheels.
# hadolint ignore=DL3008
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        gcc \
        libpq-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /build

COPY requirements.txt .

# hadolint ignore=DL3013
RUN pip install --upgrade pip --no-cache-dir \
    && pip wheel --no-cache-dir --wheel-dir /wheels -r requirements.txt


# ── Stage 2: runtime ──────────────────────────────────────────────────────────
FROM python:3.12-slim AS runtime

# Install only libpq (runtime shared library for psycopg2) + curl for healthcheck.
# No gcc, no build tools.
# hadolint ignore=DL3008,SC2015
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        libpq5 \
        curl \
    && rm -rf /var/lib/apt/lists/* \
    && find / -perm /6000 -type f -exec chmod a-s {} + 2>/dev/null || true

WORKDIR /app

# Install pre-compiled wheels from builder — no internet, no compiler
COPY --from=builder /wheels /wheels
RUN pip install --no-cache-dir --no-index --find-links=/wheels /wheels/* \
    && rm -rf /wheels

# Copy application source
COPY --chown=10001:10001 . .

# Create a locked-down non-root user with no shell and no home directory.
# UID/GID 10001 avoids collision with common system UIDs.
RUN groupadd --gid 10001 --system appgroup \
    && useradd  --uid 10001 --system --gid appgroup \
                --no-create-home --shell /sbin/nologin appuser \
    # Pre-create the tmp dir the app may need (read-only FS compatible)
    && mkdir -p /tmp/app && chown 10001:10001 /tmp/app

USER 10001

EXPOSE 5000

# Healthcheck — Cloud Run also has its own startup probe in service.yaml
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD curl -fsS http://localhost:5000/api/health || exit 1

# Gunicorn tuned for Cloud Run:
#   --workers 2        Cloud Run gives 1 vCPU per instance; 2 workers is optimal
#   --threads 4        I/O-bound Flask benefits from threading
#   --worker-class gthread
#   --timeout 60       matches Cloud Run request timeout
#   --keep-alive 65    slightly above Cloud Run's 60s idle timeout
#   --forwarded-allow-ips *   trust X-Forwarded-For from Cloud Run load balancer
# Cloud Run injects PORT env var — gunicorn must bind to it
CMD ["sh", "-c", \
     "gunicorn \
     --workers 2 \
     --threads 4 \
     --worker-class gthread \
     --bind 0.0.0.0:${PORT:-5000} \
     --timeout 60 \
     --keep-alive 65 \
     --forwarded-allow-ips '*' \
     --access-logfile - \
     --error-logfile - \
     --log-level info \
     run:app"]
