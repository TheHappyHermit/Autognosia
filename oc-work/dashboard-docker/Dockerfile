FROM python:3.11-slim

# Prevent Python from writing .pyc files and buffering stdout/stderr
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    AUTOGNOSIA_HOME=/data \
    CONFIG_PATH=/config/services.yaml \
    DASHBOARD_PORT=8088 \
    WS_PORT=8089

WORKDIR /app

# Install system deps (curl for healthcheck)
RUN apt-get update && apt-get install -y --no-install-recommends curl && \
    rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create non-root user (uid 1000) and data dirs
RUN useradd -m -u 1000 appuser && \
    mkdir -p /data /config && \
    chown -R 1000:1000 /app /data /config

USER 1000

# Healthcheck uses /api/health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:${DASHBOARD_PORT}/api/health || exit 1

EXPOSE 8088 8089

CMD ["python", "run_dashboard.py"]
