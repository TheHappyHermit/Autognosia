---
name: litellm-docker-proxy-setup-safe
description: Configure LiteLLM in Docker as a network-accessible LLM API proxy with manual API key configuration
category: devops
---

# LiteLLM Docker Proxy Setup (Safe Configuration)

## Purpose
Set up LiteLLM as a Docker container to serve as a centralized API proxy for multiple LLM providers, enabling network-wide access with explicit manual configuration.

## When to Use
- When you want to expose multiple LLM APIs through a single endpoint
- When you need to manage API keys centrally in a secure manner
- When you want other applications to access LLMs through a proxy
- When you want network-wide access to LLM services

## Important Security Notes
- This service exposes LLM APIs on your network - ensure your network is trusted
- API keys provide access to paid services - protect them accordingly
- Consider additional authentication if exposing beyond trusted networks
- Only proceed if you understand the security implications of 0.0.0.0 binding

## Prerequisites
- Docker installed and running
- API keys for desired LLM providers (manually copied from secure storage)
- Basic understanding of Docker and networking

## Setup Steps

### 1. Create Directory Structure
```bash
mkdir -p ~/litellm-proxy/{config,models,logs}
cd ~/litellm-proxy
```

### 2. Create Environment File (.env)
### 2. Create Environment File (.env)
```bash
# === PRIMARY MODEL API KEYS ===
# Get these from your secure storage (password manager, etc.)
XIAOMI_API_KEY=your_actual_xiaomi_key_here
OPENROUTER_API_KEY=your_actual_openrouter_key_here

# === ADDITIONAL PROVIDER KEYS (as needed) ===
GLM_API_KEY=your_actual_glm_key_here
# KIMI_API_KEY=...
# MINIMAX_API_KEY=...

# === SERVICE CONFIGURATION ===
LIGHTLLM_HOST=0.0.0.0
LIGHTLLM_PORT=8000
LIGHTLLM_MODEL_LIST=/app/config/model_list.json

# === DATABASE CONFIGURATION ===
# For SQLite (experimental, may have limitations)
# Uncomment the line below to use SQLite
# DATABASE_URL=sqlite:///./litellm.db

# Note: The LiteLLM image may expect PostgreSQL and show Prisma validation errors.
# The service may still start but some features (like storing models in the DB) may not work.
# For full functionality, consider using PostgreSQL with a separate database service.
```

### 3. Create Model Configuration (config/model_list.json)
```json
{
  "model_list": [
    {
      "model_name": "mimo-v2-omni",
      "litellm_params": {
        "model": "openai/mimo-v2-omni",
        "api_base": "https://api.xiaomimimo.com/v1",
        "api_key": "${XIAOMI_API_KEY}",
        "timeout": 60,
        "max_retries": 3
      },
      "model_info": {
        "id": "mimo-v2-omni",
        "owned_by": "xiaomi",
        "context_window": 32768,
        "max_input_tokens": 32768,
        "max_output_tokens": 8192
      }
    },
    {
      "model_name": "nvidia/nemotron-3-super-120b-a12b:free",
      "litellm_params": {
        "model": "openai/nvidia/nemotron-3-super-120b-a12b:free",
        "api_base": "https://openrouter.ai/api/v1",
        "api_key": "${OPENROUTER_API_KEY}",
        "timeout": 60,
        "max_retries": 3
      },
      "model_info": {
        "id": "nvidia/nemotron-3-super-120b-a12b:free",
        "owned_by": "nvidia",
        "context_window": 8192,
        "max_input_tokens": 8192,
        "max_output_tokens": 2048
      }
    }
    // Add additional models by following the same pattern
  ],
  "default_fallbacks": {
    "timeout": 120,
    "max_retries": 3
  },
  "routing_strategy": "simple-shuffle",
  "num_retries": 3,
  "timeout": 120
}
```

### 4. Create Docker Compose File (docker-compose.yml)
```yaml
version: '3.8'

services:
  litellm:
    image: python:3.11-slim
    container_name: litellm-proxy
    restart: unless-stopped
    ports:
      - "8000:8000"
    volumes:
      - ./config:/app/config
      - ./logs:/app/logs
      - ./.env:/app/.env
    working_dir: /app
    environment:
      - PYTHONUNBUFFERED=1
    command: >
      sh -c "
      pip install litellm==1.48.3 &&
      litellm --port 8000 --host 0.0.0.0 --model_list /app/config/model_list.json
      "
```

### 5. Create Startup Script (start.sh)
```bash
#!/bin/bash
# LightLLM startup script

echo "Starting LightLLM proxy service..."
echo "WARNING: Service will be accessible on 0.0.0.0:8000"
echo "Ensure your network is trusted and secured appropriately"

# Load environment variables
set -a
source /app/.env
set +a

# Install LiteLLM if not already installed
if ! python -c "import litellm" 2>/dev/null; then
    echo "Installing LiteLLM..."
    pip install litellm==1.48.3
fi

# Start LiteLLM server
echo "Starting LiteLLM on 0.0.0.0:8000"
exec litellm --port 8000 --host 0.0.0.0 --model_list /app/config/model_list.json
```

Make it executable:
```bash
chmod +x start.sh
```

### 6. Start the Service
```bash
docker-compose up -d
```

### 7. Verify Installation
```bash
docker-compose logs -f
```

## Usage Examples
Once running, access the service at `http://your-server-ip:8000`:

```bash
# Example curl request (replace with your actual server IP)
curl http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "mimo-v2-omni",
    "messages": [{"role": "user", "content": "Hello!"}],
    "max_tokens": 100
  }'
```

## Configuration Best Practices
- Store .env file securely - consider adding to .gitignore if using version control
- Rotate API keys periodically if you suspect exposure
- Monitor logs for unexpected access patterns
- Consider adding a reverse proxy with authentication for additional security
- Update model_list.json only when adding/removing providers

## Maintenance
- To update configuration: edit files, then run `docker-compose restart litellm-proxy`
- To view logs: `docker-compose logs litellm-proxy`
- To stop: `docker-compose down`
- To completely remove: `docker-compose down -v` (removes volumes)

## Troubleshooting
- Container won't start: Check `docker-compose logs litellm-proxy`
- Connection refused: Verify docker container is running and port 8000 is accessible
- Authentication errors: Double-check API keys in .env file
- Model not found: Verify model name in request matches exactly what's in model_list.json
- Rate limit errors: Check your API provider limits and adjust usage accordingly
- Database connection errors: If you see Prisma validation errors about the database URL needing to start with postgresql://, this indicates the LiteLLM image expects PostgreSQL. Options:
  1. Use a separate PostgreSQL service (recommended for full functionality)
  2. Try setting DATABASE_URL=sqlite:///./litellm.db (may work with some limitations)
  3. Consider using a different LiteLLM image version that has better SQLite support
  4. For basic proxy functionality without database features, the service may still start despite these warnings