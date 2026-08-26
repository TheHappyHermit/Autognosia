---
name: setup-lightllm-docker
description: Set up LightLLM in Docker with API keys and network access for use as a unified LLM gateway.
category: devops
---

# Setup LightLLM in Docker with API Keys and Network Access

## Trigger Conditions
When you need to set up a LightLLM proxy server in Docker that:
- Is accessible on the network (0.0.0.0:4000)
- Has API keys configured for multiple providers (OpenAI, Anthropic, etc.)
- Can be used by tools like OpenCode as a unified LLM gateway
- Persists data across restarts
- Uses PostgreSQL for storage (SQLite not recommended due to Prisma compatibility issues)

## Prerequisites
- Docker and Docker Compose installed
- API keys for desired providers (OpenAI, Anthropic, etc.)
- Basic understanding of Docker environment variables

## Steps

### 1. Create Project Directory
```bash
mkdir -p ~/lightllm-proxy && cd ~/lightllm-proxy
```

### 2. Create docker-compose.yml
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    container_name: lightllm-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: litellm
      POSTGRES_PASSWORD: litellm_password
      POSTGRES_DB: litellm
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"  # Optional: expose for direct DB access

  litellm:
    image: litellm/litellm:main  # Use latest or specific version like v1.50.0
    container_name: lightllm-proxy
    restart: unless-stopped
    ports:
      - "4000:4000"  # Accessible on 0.0.0.0:4000
    environment:
      - DATABASE_URL=postgresql://litellm:litellm_password@postgres:5432/litellm
      - MASTER_KEY=${MASTER_KEY}  # Set a strong master key
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      # Add more provider API keys as needed:
      # - GOOGLE_API_KEY=${GOOGLE_API_KEY}
      # - COHERE_API_KEY=${COHERE_API_KEY}
      # - REPLICATE_API_KEY=${REPLICATE_API_KEY}
      # - HUGGINGFACE_API_KEY=${HUGGINGFACE_API_KEY}
    volumes:
      - ./litellm_data:/litellm  # For persisting LiteLLM-specific data
    depends_on:
      - postgres
    # Optional: command to override defaults
    # command: ["litellm", "--master_key", "sk-123...", "--port", "4000"]

volumes:
  postgres_data:
  litellm_data:
```

### 3. Create .env File
```bash
MASTER_KEY=sk-your-master-key-here  # Generate a strong key
OPENAI_API_KEY=sk-your-openai-key-here
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key-here
# Add other API keys as needed
```

### 4. Start the Stack
```bash
docker-compose up -d
```

### 5. Verify Installation
- Check logs: `docker-compose logs -f litellm`
- Verify it's running: `docker-compose ps`
- Test the endpoint: `curl -X POST http://localhost:4000/v1/chat/completions -H "Authorization: Bearer <REDACTED>" -H "Content-Type: application/json" -d '{"model": "gpt-3.5-turbo", "messages": [{"role": "user", "content": "Hello"}]}'`

### 6. Configure OpenCode to Use LightLLM
In OpenCode settings, set:
- API Base: `http://your-vm-ip:4000/v1`
- API Key: `sk-your-master-key-here` (the master key from .env)
- Model: Use any model identifier that LightLLM supports (e.g., `gpt-3.5-turbo`, `claude-3-opus-20240229`)

## Important Notes
1. **Security**: The master key protects the LightLLM proxy. Keep it secret.
2. **API Key Management**: LightLLM will route requests to the appropriate provider based on the model name in the request.
3. **Persistence**: Volumes ensure PostgreSQL data and LiteLLM configs persist across restarts.
4. **Network Access**: The `- "4000:4000"` port mapping makes the service available on all network interfaces (0.0.0.0).
5. **Version Compatibility**: If you encounter Prisma/SQLite errors, stick with PostgreSQL as shown. Newer LiteLLM versions may have better SQLite support, but this PostgreSQL setup is verified working.
6. **Rate Limits**: Configure provider-specific rate limits in the LightLLM config file if needed (advanced).

## Troubleshooting
- **"database is being accessed by other users"**: Ensure PostgreSQL container is healthy.
- **Connection refused**: Check if containers are running with `docker-compose ps`.
- **Authentication errors**: Verify MASTER_KEY matches in requests and environment.
- **Model not found**: Ensure you're using model identifiers that LightLLM maps to your providers.

## Verification Steps
1. `docker-compose logs litellm` shows "LiteLLM proxy running"
2. Health check: `curl http://localhost:4000/health` returns 200
3. Test completion with a known model
4. Check OpenCode can successfully make requests through the proxy