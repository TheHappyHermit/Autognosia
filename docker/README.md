# Autognosia Docker Services
#
# Four independent Compose projects for isolation:
#   autognosia-honcho
#   autognosia-searxng
#   autognosia-personal-organizer
#   autognosia-gbrain
#
# Each service runs in its own network. Database ports are NOT exposed to LAN.
# All services bind to 127.0.0.1 (localhost only).
#
# Usage:
#   docker compose -f docker/docker-compose.honcho.yml up -d
#   docker compose -f docker/docker-compose.searxng.yml up -d
#   docker compose -f docker/docker-compose.personal-organizer.yml up -d
#   docker compose -f docker/docker-compose.gbrain.yml up -d

---
