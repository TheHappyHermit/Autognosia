-- ============================================================================
-- decisions table for the Autognosia brain DB (brain-postgres)
--
-- Adds structured decision tracking to the existing brain DB without
-- changing any existing tables.  Append-only in practice: decisions are
-- never UPDATEd — a new decision supersedes the old via supersedes_id.
--
-- Run:  docker exec autognosia-honcho-database-1 psql -U honcho -d brain \
--          -f /path/to/001_create_decisions.sql
--   or:  psql -h localhost -p 5433 -U brain -d brain -f 001_create_decisions.sql
-- ============================================================================

CREATE TABLE IF NOT EXISTS decisions (
    id              BIGSERIAL PRIMARY KEY,
    slug            TEXT NOT NULL,                 -- machine-friendly: "gpu-split", "research-lanes"
    topic           TEXT NOT NULL,                 -- grouping key: "gpu-allocation", "research-lanes"
    title           TEXT NOT NULL,
    decision_text   TEXT NOT NULL,                 -- what was decided
    rationale       TEXT,                          -- why / context
    status          TEXT NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active', 'superseded', 'archived')),
    supersedes_id   BIGINT REFERENCES decisions(id)
                    ON DELETE SET NULL,
    superseded_by   BIGINT REFERENCES decisions(id)
                    ON DELETE SET NULL,
    created_by      TEXT,                          -- agent profile name, "user", etc.
    source_session  TEXT,                          -- session ID or identifier where decision was made
    metadata        JSONB NOT NULL DEFAULT '{}'    -- tags, refs, rejected[], etc.
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
);

-- Indexes

CREATE INDEX idx_decisions_topic      ON decisions (topic);
CREATE INDEX idx_decisions_status     ON decisions (status);
CREATE INDEX idx_decisions_slug       ON decisions (slug);
CREATE INDEX idx_decisions_created_at ON decisions (created_at DESC);
CREATE INDEX idx_decisions_supersedes ON decisions (supersedes_id);
CREATE INDEX idx_decisions_metadata   ON decisions USING GIN (metadata);

-- Convenience: current binding decision per topic
CREATE VIEW decision_current AS
SELECT DISTINCT ON (topic)
    id, slug, topic, title, decision_text, rationale,
    status, supersedes_id, superseded_by,
    created_by, source_session, metadata,
    created_at
FROM decisions
WHERE status = 'active'
ORDER BY topic, created_at DESC;

-- Comment for future migrations
COMMENT ON TABLE decisions IS
'Append-only decision ledger.  New row supersedes old via supersedes_id.
 The "current" binding decision for a topic is the active row with the
 latest created_at — see view decision_current.';
