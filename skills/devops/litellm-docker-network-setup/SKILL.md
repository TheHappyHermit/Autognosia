---
name: litellm-docker-network-setup
description: Configure LiteLLM in Docker for network-wide access with API key management and model configuration
category: devops
---

# LiteLLM Docker Network Setup

## Purpose
Set up LiteLLM as a Docker container to serve as a centralized API proxy for multiple LLM providers, enabling network-wide access with explicit manual configuration of API keys and models.

## When to Use
- When you want to expose multiple LLM APIs through a single endpoint on your network
- When you need to manage API keys centrally for multiple LLM providers
- When you want other applications on your network to access LLMs through a common proxy
- When you want to configure specific rate limits, budgets, and model routing

## Important Security Notes
- This service exposes LLM APIs on your network (0.0.0.0 binding) - ensure your network is trusted
- API keys provide access to paid services - protect them accordingly and consider network segmentation
- Only proceed if you understand the security implications of exposing LLM APIs on your network
- For production use, consider adding authentication, rate limiting, and monitoring

## Prerequisites
- Docker installed and running (version 20.10+ recommended)
- API keys for desired LLM providers obtained from secure storage (password manager, etc.)
- Basic understanding of Docker, networking, and LiteLLM concepts
- Approximately 2-3GB of disk space for Docker images and potential database storage

## Setup Steps

### 1. Create Directory Structure
```bash
mkdir -p ${HOME}/litellm-proxy/{config,models,logs,data}
cd ${HOME}/litellm-proxy
```

### 2. Create Environment File (.env)
**Manually enter your API keys** - do not extract from other configurations automatically:

```bash
# === PRIMARY MODEL API KEYS ===
# Get these from your secure storage (password manager, etc.)
OPENAI_API_KEY=your_actual_openai_key_here
ANTHROPIC_API_KEY=your_actual_anthropic_key_here
GOOGLE_API_KEY=your_actual_google_key_here

# === ADDITIONAL PROVIDER KEYS (as needed) ===
# COHERE_API_KEY=...
# REPLICATE_API_KEY=...
# HUGGINGFACE_API_KEY=...

# === SERVICE CONFIGURATION ===
LITELLM_HOST=0.0.0.0
LITELLM_PORT=4000
LITELLM_MODEL_LIST=/app/config/model_list.yaml

# === DATABASE CONFIGURATION ===
# For development/testing with SQLite (has limitations with some features)
# Uncomment the line below to use SQLite
# DATABASE_URL=sqlite:///./data/litellm.db

# For production with PostgreSQL (recommended)
# You'll need to set up a separate PostgreSQL service
# DATABASE_URL=postgresql://litellm:password@postgres:5432/litellm

# Master key for LiteLLM proxy admin endpoints (must start with sk-)
MASTER_KEY=sk-your-master-key-here-change-this

# Optional: Redis for caching (improves performance)
# REDIS_HOST=redis
# REDIS_PORT=6379
# REDIS_PASSWORD=your-redis-password
```

### 3. Create Model Configuration (config/model_list.yaml)
```yaml
model_list:
  # === OpenAI Models ===
  - model_name: gpt-4o
    litellm_params:
      model: openai/gpt-4o
      api_key: ${OPENAI_API_KEY}
    model_info:
      access_groups: ["premium"]
    # Rate limits and budgets
    tpm: 40000      # tokens per minute
    rpm: 200        # requests per minute
    max_budget: 10.0 # $10 per day
    
  - model_name: gpt-4o-mini
    litellm_params:
      model: openai/gpt-4o-mini
      api_key: ${OPENAI_API_KEY}
    model_info:
      access_groups: ["basic", "premium"]
    tpm: 100000
    rpm: 500
    max_budget: 5.0

  # === Anthropic Models ===
  - model_name: claude-sonnet-4-20250514
    litellm_params:
      model: anthropic/claude-sonnet-4-20250514
      api_key: ${ANTHROPIC_API_KEY}
    model_info:
      access_groups: ["premium"]
    tpm: 30000
    rpm: 150
    max_budget: 10.0

  # === Google Models ===
  - model_name: gemini-2.0-flash
    litellm_params:
      model: gemini/gemini-2.0-flash
      api_key: ${GOOGLE_API_KEY}
    model_info:
      access_groups: ["basic", "premium"]
    tpm: 200000
    rpm: 1000
    max_budget: 5.0

  # === OpenRouter Models (if applicable) ===
  - model_name: nemotron-3-super
    litellm_params:
      model: openai/nvidia/nemotron-3-super-120b-a12b:free
      api_key: ${OPENROUTER_API_KEY}
      api_base: https://openrouter.ai/api/v1
    model_info:
      access_groups: ["community"]
    tpm: 20000
    rpm: 100
    max_budget: 0.0 # Free tier

# Router Settings
router_settings:
  routing_strategy: latency-based-routing
  allowed_fails: 3
  cooldown_time: 60
  num_retries: 3
  timeout: 120
  retry_after: 5

# LiteLLM Settings
litellm_settings:
  drop_params: true
  set_verbose: false
  num_retries: 3
  request_timeout: 120
  
  # Enable caching (requires Redis for production)
  # cache: true
  # cache_params:
  #   type: redis
  #   host: ${REDIS_HOST}
  #   port: ${REDIS_PORT}
  #   password: ${REDIS_PASSWORD}
  #   ttl: 3600

# Fallbacks
fallbacks:
  - model_name: gpt-4o
    fallback_models: ["gpt-4o-mini"]
  - model_name: gpt-4o-mini
    fallback_models: ["gpt-3.5-turbo"]

# Context window fallbacks
context_window_fallbacks:
  - model_name: gpt-4o-mini
    fallback_models: ["gpt-4o"]

# General Settings
general_settings:
  master_key: ${MASTER_KEY}
  database_url: ${DATABASE_URL:-sqlite:///./data/litellm.db}
  # Allow all access groups by default for open network use
  allowed_access_groups: ["basic", "premium", "community"]
  # Enable spending logs
  spend_logs: true
  # Enable verbose logging for debugging
  # set_verbose: true
```

### 4. Create Docker Compose File (docker-compose.yml)
```yaml
version: '3.8'

services:
  litellm:
    image: litellm/litellm:v1.50.0
    container_name: litellm-proxy
    restart: unless-stopped
    ports:
      - "4000:4000"
    volumes:
      - ./config:/app/config
      - ./data:/app/data
      - ./logs:/app/logs
      - ./.env:/app/.env
    environment:
      - PORT=4000
      - HOST=0.0.0.0
      - CONFIG=/app/config/model_list.yaml
      - MASTER_KEY=${MASTER_KEY}
      - DATABASE_URL=${DATABASE_URL}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - GOOGLE_API_KEY=${GOOGLE_API_KEY}
      # Add other API keys as needed
    # Uncomment the following lines if using PostgreSQL
    # depends_on:
    #   - postgres
    #
    # Uncomment the following lines if using Redis
    #   - redis
    
  # Uncomment to add PostgreSQL service (recommended for production)
  # postgres:
  #   image: postgres:15
  #   container_name: litellm-postgres
  #   restart: unless-stopped
  #   volumes:
  #     - postgres_data:/var/lib/postgresql/data
  #   environment:
  #     - POSTGRES_USER=litellm
  #     - POSTGRES_PASSWORD=password
  #     - POSTGRES_DB=litellm
  #   ports:
  #     - "5432:5432"
  
  # Uncomment to add Redis service (recommended for caching)
  # redis:
  #   image: redis:7-alpine
  #   container_name: litellm-redis
  #   restart: unless-stopped
  #   ports:
  #     - "6379:6379"

# volumes:
#   postgres_data:
```

### 5. Create Startup Verification Script (verify_setup.sh)
```bash
#!/bin/bash
# Script to verify LiteLLM setup

echo "Verifying LiteLLM Docker setup..."

# Check if docker-compose file exists
if [ ! -f "docker-compose.yml" ]; then
    echo "Error: docker-compose.yml not found"
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "Error: .env file not found"
    exit 1
fi

# Check if model_list.yaml exists
if [ ! -f "config/model_list.yaml" ]; then
    echo "Error: config/model_list.yaml not found"
    exit 1
fi

# Start the services
echo "Starting services..."
docker-compose up -d

# Wait for service to be ready
echo "Waiting for LiteLLM to be ready..."
sleep 10

# Check if container is running
if docker ps | grep -q litellm-proxy; then
    echo "✓ LiteLLM container is running"
else
    echo "✗ LiteLLM container failed to start"
    docker-compose logs litellm
    exit 1
fi

# Test the endpoint
echo "Testing LiteLLM endpoint..."
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:4000/health || echo "Connection failed")
if [ "$response" = "200" ]; then
    echo "✓ LiteLLM health endpoint is responding"
else
    echo "✗ LiteLLM health endpoint returned status: $response"
    echo "Checking logs..."
    docker-compose logs litellm
fi

echo "Setup verification complete!"
echo "LiteLLM proxy is available at: http://$(hostname -I | awk '{print $1}'):4000"
echo "Remember to update your .env file with actual API keys before first use."
```

Make it executable:
```bash
chmod +x verify_setup.sh
```

### 6. Start the Service
```bash
# Option 1: Quick start with verification
./verify_setup.sh

# Option 2: Manual start
docker-compose up -d

# Option 2: Start with logs visible
docker-compose up -d && docker-compose logs -f litellm
```

### 7. Verify Installation
```bash
# Check logs
docker-compose logs -f litellm

# Test with curl
curl -X POST http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [{"role": "user", "content": "Hello!"}],
    "max_tokens": 50
  }'

# Test model listing
curl http://localhost:4000/v1/models | jq .

# Check usage stats
curl http://localhost:4000/v1/model_usage
```

## Usage Examples
Once running, access the service at `http://your-server-ip:4000`:

```bash
# Example chat completion
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [{"role": "user", "content": "Explain quantum computing in simple terms"}],
    "temperature": 0.7,
    "max_tokens": 150
  }'

# Example with OpenRouter model
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "nemotron-3-super",
    "messages": [{"role": "user", "content": "What is the capital of France?"}],
    "max_tokens": 50
  }'

# Example embedding request
curl http://localhost:4000/v1/embeddings \
  -H "Content-Type: application/json" \
  -d '{
    "model": "text-embedding-3-small",
    "input": ["The quick brown fox jumps over the lazy dog"]
  }'
```

## Configuration Best Practices
- Store .env file securely - consider adding to .gitignore if using version control
- Rotate API keys periodically if you suspect exposure
- Monitor logs for unexpected access patterns
- Consider adding a reverse proxy with authentication for additional security
- Update model_list.yaml only when adding/removing providers or changing configurations
- Start with conservative rate limits and adjust based on actual usage
- Enable spending logs to track costs

## Maintenance
- To update configuration: edit files, then run `docker-compose restart litellm-proxy`
- To view logs: `docker-compose logs litellm-proxy`
- To stop: `docker-compose down`
- To completely remove: `docker-compose down -v` (removes volumes)
- To update LiteLLM version: change the image tag in docker-compose.yml and run `docker-compose pull && docker-compose up -d`

## Troubleshooting
- Container won't start: Check `docker-compose logs litellm-proxy`
- Connection refused: Verify docker container is running and port 4000 is accessible
- Authentication errors: Double-check API keys in .env file
- Model not found: Verify model name in request matches exactly what's in model_list.yaml
- Rate limit errors: Check your API provider limits and adjust usage accordingly
- Database connection errors: 
  * If using SQLite and seeing Prisma errors, this is expected - LiteLLM prefers PostgreSQL
  * For full functionality, consider setting up PostgreSQL service
  * Basic proxy functionality should still work with SQLite despite warnings
  * To use PostgreSQL: uncomment the postgres service in docker-compose.yml and set DATABASE_URL accordingly
- High memory usage: Consider adjusting num_workers or enabling model caching
- Slow first request: This is normal as models are loaded; subsequent requests should be faster

## Performance Optimization
- For high traffic: Increase num_workers via environment variable
- For better caching: Set up Redis and enable cache in model_list.yaml
- For model preloading: Consider using the `model_alias` feature to keep models warm
- For GPU acceleration: Use a different LiteLLM image variant if you have GPU hardware

## Version Notes
This skill was tested with LiteLLM v1.50.0. Newer versions may have different features or requirements.
Always check the [LiteLLM documentation](https://docs.litellm.ai) for version-specific information.