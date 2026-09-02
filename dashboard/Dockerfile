FROM python:3.11-slim

LABEL maintainer="TheHappyHermit"
LABEL description="Autognosia Command Deck — Executive Dashboard"

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
RUN pip install --no-cache-dir \
    fastapi \
    uvicorn[standard] \
    psutil \
    websockets \
    requests \
    pyyaml \
    pg8000

# Copy dashboard application
COPY dashboard/ /app/dashboard/
COPY scripts/ /app/scripts/
COPY config/ /app/config/

# Create data directories
RUN mkdir -p /data /config

EXPOSE 8088 8089

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD curl -f http://localhost:8088/api/health || exit 1

CMD ["python", "-m", "uvicorn", "dashboard.dashboard_server:app", "--host", "0.0.0.0", "--port", "8088"]
