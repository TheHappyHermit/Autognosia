# Autognosia

Autognosia is a multi-agent AI infrastructure system built on Hermes Agent. It features a three-tier memory architecture (Hot/Cold/Oracle) with autonomous research lanes, semantic search, and a self-monitoring dashboard.

## Architecture

### Three-Tier Memory

```
┌─────────────────────────────────────────────┐
│  HOT MEMORY (working memory)                │
│  ~/.autognosia/active-wiki/                 │
│  Current projects, active work, deep context│
├─────────────────────────────────────────────┤
│  COLD MEMORY (curated knowledge)            │
│  ~/.autognosia/oracle/brain/                │
│  Synthesized reference, specialized content │
├─────────────────────────────────────────────┤
│  AUTOBIOGRAPHICAL MEMORY                    │
│  Honcho (hybrid mode)                       │
│  User profile, preferences, peer context    │
└─────────────────────────────────────────────┘
```

**Cascade flow:** Hot → Cold (via weekly Memory Consolidation Full Cascade job)
**Default research target:** Active Wiki (all research, deep research, A/B lanes)

### Research Routing

| Type | Target | Description |
|------|--------|-------------|
| General research | Active Wiki | Default for all research |
| Deep research | Active Wiki | Multi-query, comprehensive |
| Knowledge base topics | Active Wiki | A/B lane projects |
| Frontier research lanes | Active Wiki | Background research cron jobs |
| "Research for Oracle" | Oracle Wiki | Explicit requests only |
| Specialist domain content | Oracle Wiki | Technical/specialized reference |

This ensures the agent becomes deeply familiar with what you're actively working on.

### Semantic Search

- **Backend:** Postgres + pgvector + Ollama embeddings
- **Sync:** `brain_sync.py` every 60 min (incremental, hash-based)
- **Search:** Hybrid BM25 + Cosine similarity with Reciprocal Rank Fusion
- **Embedding model:** Ollama auto-detect (capped at 2000 dims)

### Cron Jobs (Research)

| Job | Schedule | Target | Description |
|-----|----------|--------|-------------|
| Frontier Research Lane A | Every 2h (:00) | Active Wiki | Ontology, knowledge systems |
| Frontier Research Lane B | Every 2h (:30) | Active Wiki | KG construction, semantics |
| Brain-Sync Postgres | Every 60 min | Both | Sync wiki to vector DB |
| Memory Consolidation Daily | Daily 4 AM | Both | Hot memory to warm |
| Memory Consolidation Full Cascade | Weekly Sun 4 AM | Hot→Cold | Active Wiki → Oracle Wiki |

### Skills

#### Cortex (Core Reasoning)
- `first-principles` — DARE framework + Socratic questioning, inversion, pre-mortem
- `structured-thinking` — MECE, issue trees, decision matrix, ACH, Pyramid Principle
- `epistemic-protocol` — Evidence vs belief, provenance tracking
- `cortex-verification` — Deterministic first, auditor last
- `personal-cognitive-router` — Metacognitive mode selection
- `prospective-memory` — IF-THEN intentions, trigger tracking

#### DevOps
- `camofox` — Anti-detection browser automation (Docker)
- `firecrawl` — Web scraping + search (Docker)

#### Research
- `research-request` — Delegates to Researcher profile, default target Active Wiki
- `oracle-wiki-research-pipeline` — Oracle Wiki population (explicit use only)
- `oracle-entity-creation` — Create entity pages from research

## Setup

### Prerequisites
- Hermes Agent installed
- Docker + Docker Compose (for CamoFox/Firecrawl)
- Postgres with pgvector extension
- Ollama running with embedding model

### Installation

```bash
# Clone repository
git clone https://github.com/TheHappyHermit/Autognosia.git
cd Autognosia

# Set up Python environment
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your API keys

# Start services
docker-compose up -d  # CamoFox + Firecrawl
./scripts/start_brain_postgres.sh

# Initialize database
./scripts/init_brain_schema.py

# Start gateway
hermes gateway run
```

### Configuration

Key paths:
- `~/.hermes/config.yaml` — Main Hermes config
- `~/.hermes/SOUL.md` — Agent persona (includes research routing rules)
- `~/.hermes/skills/` — Installed skills
- `~/.autognosia/active-wiki/` — Active Wiki (working memory)
- `~/.autognosia/oracle/brain/` — Oracle Wiki (reference library)

## Usage

### Research

```bash
# Research goes to Active Wiki by default
hermes chat -q "Research ontology engineering for AI systems"

# Explicit Oracle research
hermes chat -q "Research this for Oracle: formal concept analysis"
```

### Dashboard

The Command Deck dashboard runs at `http://127.0.0.1:8088` with views for:
- Dashboard (overview)
- Bots (agent management)
- Calendar (scheduling)
- Tasks (organizer)
- Services (monitoring)
- Home Lab (infrastructure)

### Multi-Agent Workflow

- **Main Hermes** (Nous) — Orchestration, taste arbiter
- **Coder** (Local Qwen) — Workflow management, planning
- **OpenCode** (RTX 3090) — Implementation
- **Researcher** (Local Qwen) — Web research, writes to Active Wiki
- **Oracle** (Local Qwen) — Specialist domain analysis

## License

MIT
